import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import { problems } from '../data/problems';
import { Terminal, Lightbulb, Play, BookOpen, Clock, AlertTriangle, ExternalLink, Code2, Send, ChevronDown, ChevronUp, Maximize2, Minimize2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useToast } from '../context/ToastContext';

type Status = 'unsolved' | 'attempted' | 'solved';
type Language = 'python' | 'cpp';

interface ChatMessage {
    role: 'user' | 'assistant' | 'system';
    content: string;
}

const patternCheatsheets: Record<string, { desc: string; python: string; cpp: string }> = {
    'Two Pointers': {
        desc: 'Use two pointers to iterate over a data structure, usually from opposite ends or at different speeds.',
        python: 'left, right = 0, len(arr) - 1\nwhile left < right:\n    if condition:\n        left += 1\n    else:\n        right -= 1',
        cpp: 'int left = 0, right = arr.size() - 1;\nwhile (left < right) {\n    if (condition) left++;\n    else right--;\n}'
    },
    'Sliding Window': {
        desc: 'Maintain a window that satisfies a condition, expanding and shrinking it as you iterate.',
        python: 'left = 0\nfor right in range(len(arr)):\n    # add arr[right] to window\n    while invalid:\n        # remove arr[left] from window\n        left += 1\n    # update max_len or related logic',
        cpp: 'int left = 0;\nfor (int right = 0; right < arr.size(); right++) {\n    // add arr[right] to window\n    while (invalid) {\n        // remove arr[left]\n        left++;\n    }\n    // update answer\n}'
    },
    'Binary Search': {
        desc: 'Efficiently search a sorted array by repeatedly dividing the search interval in half.',
        python: 'left, right = 0, len(arr) - 1\nwhile left <= right:\n    mid = (left + right) // 2\n    if arr[mid] == target:\n        return mid\n    elif arr[mid] < target:\n        left = mid + 1\n    else:\n        right = mid - 1',
        cpp: 'int left = 0, right = arr.size() - 1;\nwhile (left <= right) {\n    int mid = left + (right - left) / 2;\n    if (arr[mid] == target) return mid;\n    if (arr[mid] < target) left = mid + 1;\n    else right = mid - 1;\n}'
    }
};

const getCheatsheet = (pattern: string) => patternCheatsheets[pattern] || {
    desc: `General pattern template for ${pattern}.`,
    python: '# Implement your logic here\npass',
    cpp: '// Implement your logic here\nreturn 0;'
};

export default function ProblemDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { addToast } = useToast();
    const [focusMode, setFocusMode] = useState(false);

    const problemId = parseInt(id || '1');
    const problem = problems.find((p) => p.id === problemId);

    // User Progress State
    const [status, setStatus] = useState<Status>('unsolved');
    const [language, setLanguage] = useState<Language>('python');
    const [notes, setNotes] = useState('');
    const [notesSaving, setNotesSaving] = useState(false);
    const saveTimeout = useRef<NodeJS.Timeout | null>(null);

    // Chat State
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const chatEndRef = useRef<HTMLDivElement>(null);

    // Accordion State
    const [cheatsheetOpen, setCheatsheetOpen] = useState(false);

    // Fetch initial data
    useEffect(() => {
        async function loadData() {
            if (!isSupabaseConfigured() || !user || !problem) return;

            // Progress
            const { data: progData } = await supabase!
                .from('user_progress')
                .select('*')
                .eq('user_id', user.id)
                .eq('problem_id', problem.id)
                .maybeSingle();

            if (progData) {
                setStatus(progData.status || 'unsolved');
                setLanguage(progData.language || 'python');
                setNotes(progData.notes || '');
            }

            // Chat Session
            const { data: chatData } = await supabase!
                .from('ai_sessions')
                .select('*')
                .eq('user_id', user.id)
                .eq('problem_id', problem.id)
                .maybeSingle();

            if (chatData && chatData.messages) {
                setMessages(chatData.messages as ChatMessage[]);
                addToast('Session loaded', 'success');
            }
        }
        loadData();
    }, [user, problem]);

    // Scroll chat to bottom
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isTyping]);

    if (!problem) return <div className="p-6 text-forge-red">Problem not found.</div>;

    // --- Handlers ---
    const handleUpdateProgress = async (updates: Partial<{ status: Status, language: Language, notes: string }>, showToast = true) => {
        if (!user || !isSupabaseConfigured()) return;

        // Optimistic UI
        if (updates.status) setStatus(updates.status);
        if (updates.language) setLanguage(updates.language);

        const payload = {
            user_id: user.id,
            problem_id: problem.id,
            ...updates,
            updated_at: new Date().toISOString()
        };

        // Auto-set solved_at if newly solved
        if (updates.status === 'solved' && status !== 'solved') {
            (payload as any).solved_at = new Date().toISOString();
        }

        const { error } = await supabase!.from('user_progress').upsert(payload, { onConflict: 'user_id,problem_id' });
        if (!error && showToast) {
            addToast('Progress saved', 'success');
        }
    };

    const handleNotesChange = (val: string) => {
        setNotes(val);
        setNotesSaving(true);

        if (saveTimeout.current) clearTimeout(saveTimeout.current);
        saveTimeout.current = setTimeout(async () => {
            await handleUpdateProgress({ notes: val }, false);
            setNotesSaving(false);
            addToast('Note saved', 'success');
        }, 1000); // 1s debounce
    };

    const saveChatHistory = async (newMessages: ChatMessage[]) => {
        if (!user || !isSupabaseConfigured()) return;
        await supabase!.from('ai_sessions').upsert({
            user_id: user.id,
            problem_id: problem.id,
            messages: newMessages
        }, { onConflict: 'user_id,problem_id' });
    };

    const handleSendPrompt = async (promptText: string = input) => {
        if (!promptText.trim() || isTyping) return;

        const userMsg: ChatMessage = { role: 'user', content: promptText };
        const newHistory = [...messages, userMsg];
        setMessages(newHistory);
        setInput('');
        setIsTyping(true);
        await saveChatHistory(newHistory);

        try {
            if (!isSupabaseConfigured()) {
                // Fallback demo response
                setTimeout(() => {
                    const m: ChatMessage[] = [...newHistory, { role: 'assistant', content: "Demo response: Ensure your Supabase Edge Function is deployed." }];
                    setMessages(m);
                    setIsTyping(false);
                    saveChatHistory(m);
                }, 1000);
                return;
            }

            const { data: sessionData } = await supabase!.auth.getSession();
            const token = sessionData?.session?.access_token;

            if (!token) {
                const m: ChatMessage[] = [...newHistory, { role: 'assistant', content: "*[Authentication Required]* Please sign in to use the live AI Tutor feature. Currently running in demo-only mode without an active session." }];
                setMessages(m);
                setIsTyping(false);
                saveChatHistory(m);
                return;
            }

            const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;

            const response = await fetch(`${supabaseUrl}/functions/v1/ai-tutor`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    messages: newHistory,
                    problemContext: `Problem ${problem.number}: ${problem.title}. Category: ${problem.category}. Pattern: ${problem.pattern}. My Language Setup: ${language}. Importance: ${problem.importanceNote}`
                })
            });

            if (!response.ok) {
                const errText = await response.text();
                throw new Error(`AI Tutor Error: ${response.statusText} - ${errText}`);
            }

            if (!response.body) throw new Error("No streaming response body found.");

            const reader = response.body.getReader();
            const decoder = new TextDecoder();

            let streamedMsg = "";
            setMessages([...newHistory, { role: 'assistant', content: streamedMsg }]);
            setIsTyping(false); // Hide the loading pulse, start showing the streamed text

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value, { stream: true });
                const lines = chunk.split('\n');

                for (const line of lines) {
                    if (line.startsWith('data: ') && line.trim() !== 'data: [DONE]') {
                        try {
                            const data = JSON.parse(line.slice(6));
                            const contentStr = data.choices[0]?.delta?.content;
                            if (contentStr) {
                                streamedMsg += contentStr;
                                setMessages([...newHistory, { role: 'assistant', content: streamedMsg }]);
                            }
                        } catch (e) {
                            // ignore partial JSON parse errors from broken chunks
                        }
                    }
                }
            }

            // Save full history after streaming completes
            await saveChatHistory([...newHistory, { role: 'assistant', content: streamedMsg }]);
        } catch (err: any) {
            console.error(err);
            setMessages([...newHistory, { role: 'assistant', content: `*[System Error]* Failed to get AI response: \`${err.message}\`` }]);
            setIsTyping(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendPrompt();
        }
    };

    const diffColors: Record<string, string> = {
        Easy: 'text-forge-green border-forge-green bg-forge-green/10',
        Medium: 'text-forge-amber border-forge-amber bg-forge-amber/10',
        Hard: 'text-forge-red border-forge-red bg-forge-red/10'
    };

    const cheatsheet = getCheatsheet(problem.pattern);

    return (
        <div className={focusMode
            ? "fixed inset-0 z-50 bg-forge-black p-4 flex flex-col md:flex-row gap-4 animate-fadeIn focus-transition"
            : "p-4 md:p-6 animate-fadeIn h-full max-w-[1800px] mx-auto overflow-y-auto focus-transition"}>

            {/* Back Button (Hidden in Focus Mode) */}
            {!focusMode && (
                <button onClick={() => navigate('/problems')} className="flex items-center gap-1 text-xs text-forge-text hover:text-forge-green mb-4 transition-colors font-mono uppercase tracking-widest">
                    &larr; Return to Archive
                </button>
            )}

            {/* Split Layout */}
            <div className={`grid grid-cols-1 ${focusMode ? 'md:grid-cols-6 h-full w-full gap-4' : 'lg:grid-cols-5 gap-6 h-auto min-h-[calc(100vh-140px)]'}`}>

                {/* ================= LEFT COLUMN ================= */}
                <div className={`${focusMode ? 'md:col-span-1 flex flex-col gap-4' : 'lg:col-span-3 flex flex-col gap-6'}`}>

                    {/* Header Card / Focus Mode Minimal Card */}
                    {focusMode ? (
                        <div className="terminal-card bg-forge-dark flex flex-col items-center justify-center p-4 gap-4 text-center h-full">
                            <h2 className="text-xl font-bold text-forge-light font-mono truncate w-full" title={problem.title}>{problem.title}</h2>
                            <div className={`px-2 py-1 border rounded-sm font-mono text-xs uppercase tracking-widest ${diffColors[problem.difficulty]}`}>
                                {problem.difficulty}
                            </div>
                            <a href={problem.url} target="_blank" rel="noopener noreferrer" className="mt-4 flex flex-col items-center justify-center w-full py-3 bg-forge-black border border-forge-border hover:border-forge-blue hover:text-forge-blue text-forge-light transition-all rounded-sm font-mono text-xs uppercase tracking-widest group shadow-[0_4px_10px_rgba(0,0,0,0.5)]">
                                <Terminal className="w-5 h-5 mb-1 group-hover:-translate-y-1 transition-transform" />
                                <span>External LC</span>
                            </a>
                            <div className="mt-4 w-full text-left space-y-2">
                                <label className="text-xs font-mono text-forge-text uppercase tracking-widest pl-1">Status</label>
                                <div className="flex flex-col gap-2">
                                    {(['unsolved', 'attempted', 'solved'] as Status[]).map((s) => (
                                        <button
                                            key={s}
                                            onClick={() => { setStatus(s); handleUpdateProgress({ status: s }); }}
                                            className={`flex items-center gap-2 px-3 py-2 text-xs font-mono rounded-sm border transition-all ${status === s
                                                ? (s === 'solved' ? 'bg-forge-green/10 border-forge-green text-forge-green shadow-glow-green' : 'bg-forge-amber/10 border-forge-amber text-forge-amber glow-text-amber')
                                                : 'bg-forge-black border-forge-border text-forge-text hover:border-forge-light/30'
                                                }`}
                                        >
                                            {s === 'solved' ? '●' : s === 'attempted' ? '◑' : '○'} {s}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="terminal-card bg-gradient-to-br from-forge-dark to-forge-black relative">
                            <div className="absolute top-0 left-0 w-full h-1 bg-forge-border/50" />

                            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                                <div>
                                    <p className="font-mono text-sm text-forge-text tracking-widest mb-2">PROBLEM_{problem.number.toString().padStart(3, '0')}</p>
                                    <h1 className="text-2xl md:text-3xl font-bold text-forge-light font-mono mb-4">{problem.title}</h1>

                                    <div className="flex flex-wrap gap-2 items-center">
                                        <span className={`px-2 py-1 border rounded-sm font-mono text-xs uppercase tracking-widest ${diffColors[problem.difficulty]}`}>
                                            {problem.difficulty}
                                        </span>
                                        <span className="px-2 py-1 bg-forge-gray/50 border border-forge-border rounded-sm text-xs font-mono text-forge-text">
                                            {problem.category}
                                        </span>
                                        <span className="px-2 py-1 bg-forge-amber/10 border border-forge-amber/30 text-forge-amber rounded-sm text-xs font-mono">
                                            {problem.pattern}
                                        </span>
                                    </div>
                                </div>

                                <a
                                    href={problem.url} target="_blank" rel="noopener noreferrer"
                                    className="shrink-0 flex items-center gap-2 px-4 py-2 bg-forge-dark border border-forge-border hover:border-forge-blue hover:text-forge-blue text-forge-light transition-all rounded-sm font-mono text-xs uppercase tracking-widest group shadow-[0_4px_10px_rgba(0,0,0,0.5)]"
                                >
                                    <span>Execute on LC</span>
                                    <Terminal className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </a>
                            </div>

                            <div className="mt-5 pt-4 border-t border-forge-border/40">
                                <p className="text-sm text-forge-light/80 leading-relaxed max-w-3xl">
                                    <strong className="text-forge-amber font-mono text-xs uppercase block mb-1">Why this matters:</strong>
                                    {problem.importanceNote}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Controls Bar: Status & Language */}
                    <div className="flex flex-wrap items-center gap-4 bg-forge-dark border border-forge-border p-3 rounded-sm shadow-md">
                        <div className="flex bg-forge-black rounded-sm border border-forge-border/50 p-1 flex-1 min-w-[300px]">
                            {(['unsolved', 'attempted', 'solved'] as Status[]).map(s => (
                                <button
                                    key={s}
                                    onClick={() => handleUpdateProgress({ status: s })}
                                    className={`flex-1 py-1.5 text-xs uppercase tracking-widest font-mono transition-colors rounded-[2px]
                    ${status === s
                                            ? (s === 'solved' ? 'bg-forge-green/20 text-forge-green' : s === 'attempted' ? 'bg-forge-amber/20 text-forge-amber' : 'bg-forge-gray text-forge-light')
                                            : 'text-forge-text hover:text-forge-light hover:bg-forge-gray/30'}`}
                                >
                                    {s === 'solved' ? '● Solved' : s === 'attempted' ? '◑ Attempted' : '○ Unsolved'}
                                </button>
                            ))}
                        </div>

                        <div className="flex bg-forge-black rounded-sm border border-forge-border/50 p-1 w-[160px] shrink-0">
                            {(['python', 'cpp'] as const).map(l => (
                                <button
                                    key={l}
                                    onClick={() => handleUpdateProgress({ language: l })}
                                    className={`flex-1 py-1.5 text-xs uppercase tracking-widest font-mono transition-colors rounded-[2px]
                      ${language === l ? 'bg-forge-blue/20 text-forge-blue' : 'text-forge-text hover:text-forge-light hover:bg-forge-gray/30'}`}
                                >
                                    {l === 'python' ? 'Py' : 'C++'}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* My Notes Area */}
                    <div className="terminal-card flex flex-col flex-1 shadow-md">
                        <div className="flex justify-between items-center mb-3">
                            <h2 className="text-xs font-mono uppercase tracking-widest text-forge-text flex items-center gap-2">
                                <BookOpen className="w-4 h-4 text-forge-green" /> My Engineering Notes
                            </h2>
                            {notesSaving ? (
                                <span className="text-[10px] text-forge-amber font-mono animate-pulse">Saving...</span>
                            ) : (
                                <span className="text-[10px] text-forge-text/50 font-mono">Synced</span>
                            )}
                        </div>

                        <textarea
                            value={notes}
                            onChange={(e) => handleNotesChange(e.target.value)}
                            placeholder="Jot down time complexity, space complexity, edge cases, or your core approach..."
                            className="w-full h-48 lg:h-full bg-[#0a0a0a] border border-forge-border/50 rounded-sm p-4 text-sm text-forge-light font-mono focus:border-forge-green focus:outline-none transition-colors resize-y custom-scrollbar"
                        />
                    </div>

                    {/* Pattern Cheatsheet Accordion */}
                    <div className="terminal-card overflow-hidden shadow-md">
                        <button
                            onClick={() => setCheatsheetOpen(!cheatsheetOpen)}
                            className="w-full flex items-center justify-between text-left group"
                        >
                            <h2 className="text-xs font-mono uppercase tracking-widest text-forge-amber flex items-center gap-2 group-hover:text-forge-light transition-colors">
                                <Code2 className="w-4 h-4" /> View Pattern Notes: {problem.pattern}
                            </h2>
                            {cheatsheetOpen ? <ChevronUp className="w-4 h-4 text-forge-text" /> : <ChevronDown className="w-4 h-4 text-forge-text" />}
                        </button>

                        {cheatsheetOpen && (
                            <div className="mt-4 pt-4 border-t border-forge-border/50 animate-fadeIn">
                                <p className="text-sm text-forge-light mb-4 leading-relaxed">{cheatsheet.desc}</p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="bg-[#0f0f0f] border border-forge-border/40 rounded-sm overflow-hidden">
                                        <div className="bg-forge-black border-b border-forge-border/40 px-3 py-1.5 text-[10px] font-mono text-forge-blue uppercase">Python Snippet</div>
                                        <SyntaxHighlighter language="python" style={vscDarkPlus} customStyle={{ margin: 0, padding: '1rem', background: 'transparent', fontSize: '13px' }}>
                                            {cheatsheet.python}
                                        </SyntaxHighlighter>
                                    </div>
                                    <div className="bg-[#0f0f0f] border border-forge-border/40 rounded-sm overflow-hidden">
                                        <div className="bg-forge-black border-b border-forge-border/40 px-3 py-1.5 text-[10px] font-mono text-forge-blue uppercase">C++ Snippet</div>
                                        <SyntaxHighlighter language="cpp" style={vscDarkPlus} customStyle={{ margin: 0, padding: '1rem', background: 'transparent', fontSize: '13px' }}>
                                            {cheatsheet.cpp}
                                        </SyntaxHighlighter>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* ================= RIGHT COLUMN (AI TUTOR) ================= */}
                <div className={`${focusMode ? 'md:col-span-5 h-full' : 'lg:col-span-2 flex flex-col h-[600px] lg:h-full'} terminal-card p-0 overflow-hidden shadow-lg border-forge-green/20 relative group transition-all`}>

                    {/* AI Header */}
                    <div className="bg-forge-dark/80 backdrop-blur-sm border-b border-forge-border/50 px-4 py-3 flex items-center justify-between z-10 sticky top-0">
                        <div className="flex items-center gap-2">
                            <Terminal className="w-4 h-4 text-forge-green" />
                            <h2 className="text-xs font-mono uppercase tracking-widest text-forge-green whitespace-nowrap overflow-hidden text-ellipsis">AlgoForge AI Tutor</h2>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-mono text-forge-text hidden sm:inline-block">Status: Active</span>
                            <div className="w-2 h-2 rounded-full bg-forge-green shadow-[0_0_8px_#00ff41] animate-pulse" />
                            <div className="w-px h-4 bg-forge-border mx-1"></div>
                            <button
                                onClick={() => setFocusMode(!focusMode)}
                                className="text-forge-text hover:text-forge-light transition-colors p-1 rounded-sm hover:bg-forge-border"
                                title={focusMode ? "Exit Focus Mode" : "Enter Focus Mode"}
                            >
                                {focusMode ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                            </button>
                        </div>
                    </div>

                    {/* Chat History */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar bg-forge-black/80">
                        {messages.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-center px-6 text-forge-text opacity-70">
                                <Lightbulb className="w-8 h-8 text-forge-green mb-3 opacity-50" />
                                <p className="text-sm font-mono mb-2 text-forge-light">Tutor Initialization Sequence Complete.</p>
                                <p className="text-xs leading-relaxed max-w-sm">I'm loaded with the context for <strong className="text-forge-green">#{problem.number} {problem.title}</strong>. Ask for hints, pattern explanations, or code reviews.</p>
                            </div>
                        ) : (
                            messages.map((m, i) => (
                                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-slideUp`}>
                                    <div className={`max-w-[85%] rounded-sm p-4 ${m.role === 'user'
                                        ? 'bg-forge-dark border border-forge-border text-forge-light'
                                        : 'bg-[#151515] border border-forge-green/20 text-forge-light shadow-[inset_0_0_20px_rgba(0,255,65,0.02)]'
                                        }`}>
                                        {m.role === 'assistant' ? (
                                            <div className="prose prose-invert prose-sm max-w-none prose-pre:bg-forge-black prose-pre:border prose-pre:border-forge-border">
                                                <ReactMarkdown
                                                    components={{
                                                        code({ node, inline, className, children, ...props }: any) {
                                                            const match = /language-(\w+)/.exec(className || '');
                                                            return !inline && match ? (
                                                                <SyntaxHighlighter style={vscDarkPlus as any} language={match[1]} PreTag="div" {...props}>
                                                                    {String(children).replace(/\n$/, '')}
                                                                </SyntaxHighlighter>
                                                            ) : (
                                                                <code className="bg-forge-black px-1.5 py-0.5 rounded text-forge-blue font-mono" {...props}>{children}</code>
                                                            )
                                                        }
                                                    }}
                                                >
                                                    {m.content}
                                                </ReactMarkdown>
                                            </div>
                                        ) : (
                                            <p className="text-sm font-mono whitespace-pre-wrap">{m.content}</p>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}

                        {isTyping && (
                            <div className="flex justify-start animate-slideUp">
                                <div className="max-w-[85%] rounded-sm p-4 bg-[#151515] border border-forge-green/20 shadow-[inset_0_0_20px_rgba(0,255,65,0.02)]">
                                    <span className="text-forge-green font-mono text-sm inline-flex items-center gap-2">
                                        <span className="animate-blink block w-2 h-4 bg-forge-green"></span>
                                        Thinking...
                                    </span>
                                </div>
                            </div>
                        )}
                        <div ref={chatEndRef} />
                    </div>

                    {/* Quick Prompts */}
                    <div className="px-4 py-2 border-t border-forge-border/40 bg-forge-dark overflow-x-auto no-scrollbar flex gap-2">
                        {[
                            "Explain the pattern",
                            "Give me a hint",
                            "Show Python structure",
                            "Show C++ structure",
                            "Time complexity?",
                            "Common mistakes?"
                        ].map(pmt => (
                            <button
                                key={pmt}
                                onClick={() => handleSendPrompt(pmt)}
                                className="shrink-0 text-[10px] font-mono uppercase tracking-wider text-forge-text bg-forge-black border border-forge-border hover:border-forge-green/50 hover:text-forge-green px-3 py-1.5 rounded-[2px] transition-colors"
                            >
                                {pmt}
                            </button>
                        ))}
                    </div>

                    {/* Chat Input */}
                    <div className="p-4 bg-forge-dark relative">
                        <textarea
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Ask the AI Tutor... (Shift+Enter for newline)"
                            className="w-full bg-[#0a0a0a] border border-forge-border text-sm text-forge-light font-mono p-3 pr-12 rounded-sm focus:border-forge-green focus:outline-none resize-none custom-scrollbar"
                            rows={2}
                        />
                        <button
                            onClick={() => handleSendPrompt()}
                            disabled={!input.trim() || isTyping}
                            className="absolute right-6 bottom-6 p-2 bg-forge-green/10 text-forge-green hover:bg-forge-green hover:text-forge-black rounded-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Send className="w-4 h-4" />
                        </button>
                    </div>

                </div>

            </div>
        </div>
    );
}
