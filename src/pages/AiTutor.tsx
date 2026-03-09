import React, { useState, useRef, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useStore } from '../store';
import { problems } from '../data/problems';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import { Send, Bot, User, Trash2 } from 'lucide-react';

export default function AiTutor() {
    const [searchParams] = useSearchParams();
    const chatMessages = useStore(state => state.chatMessages);
    const addChatMessage = useStore(state => state.addChatMessage);
    const updateChatMessage = useStore(state => state.updateChatMessage);
    const clearChat = useStore(state => state.clearChat);
    const chatProblemId = useStore(state => state.chatProblemId);
    const setChatProblemId = useStore(state => state.setChatProblemId);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const pid = searchParams.get('problem');
        if (pid) setChatProblemId(parseInt(pid));
    }, [searchParams, setChatProblemId]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatMessages]);

    const selectedProblem = chatProblemId ? problems.find(p => p.id === chatProblemId) : null;

    const handleSend = async () => {
        if (!input.trim() || loading) return;
        const userMsg = { id: Date.now().toString(), role: 'user' as const, content: input, timestamp: new Date().toISOString() };
        const newHistory = [...chatMessages, userMsg];
        addChatMessage(userMsg);
        setInput('');
        setLoading(true);

        try {
            if (!isSupabaseConfigured()) {
                // Simulate AI response (replace with Supabase Edge Function call)
                setTimeout(() => {
                    const context = selectedProblem ? `[Problem: ${selectedProblem.title}] ` : '';
                    const responses = [
                        `Great question! ${context}Let me break this down step by step.\n\nFirst, consider the time complexity requirements. For competitive programming, we typically need O(n log n) or better.\n\nHere's a key insight: think about what data structure would allow you to look up values efficiently while maintaining order.`,
                        `${context}This is a classic pattern! Here's how I'd approach it:\n\n**Python approach:**\n\`\`\`python\ndef solve(nums):\n    # Think about using a hash map\n    seen = {}\n    for i, num in enumerate(nums):\n        complement = target - num\n        if complement in seen:\n            return [seen[complement], i]\n        seen[num] = i\n\`\`\`\n\nThe key insight is trading space for time.`,
                        `${context}Let's think about this algorithmically:\n\n1. **Brute force**: O(n²) — check all pairs\n2. **Optimized**: Can we do better? Yes!\n3. **Two pointers/Hash map**: O(n) time, O(n) space\n\nIn C++:\n\`\`\`cpp\nvector<int> solve(vector<int>& nums, int target) {\n    unordered_map<int, int> mp;\n    for (int i = 0; i < nums.size(); i++) {\n        if (mp.count(target - nums[i]))\n            return {mp[target - nums[i]], i};\n        mp[nums[i]] = i;\n    }\n    return {};\n}\n\`\`\``,
                    ];
                    const aiMsg = { id: (Date.now() + 1).toString(), role: 'assistant' as const, content: responses[Math.floor(Math.random() * responses.length)], timestamp: new Date().toISOString() };
                    addChatMessage(aiMsg);
                    setLoading(false);
                }, 1200);
                return;
            }

            const { data: sessionData } = await supabase!.auth.getSession();
            const token = sessionData?.session?.access_token;

            if (!token) {
                const errorMsg = { id: (Date.now() + 1).toString(), role: 'assistant' as const, content: `*[Authentication Required]* Please sign in to use the live AI Tutor feature. Currently running in demo-only mode without an active session.`, timestamp: new Date().toISOString() };
                addChatMessage(errorMsg);
                setLoading(false);
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
                    messages: newHistory.map(m => ({ role: m.role, content: m.content })),
                    problemContext: selectedProblem ? `Problem ${selectedProblem.number}: ${selectedProblem.title}. Category: ${selectedProblem.category}. Pattern: ${selectedProblem.pattern}. Importance: ${selectedProblem.importanceNote}` : 'General competitive programming topics.'
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
            const msgId = (Date.now() + 1).toString();

            addChatMessage({ id: msgId, role: 'assistant', content: '', timestamp: new Date().toISOString() });
            setLoading(false);

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
                                updateChatMessage(msgId, streamedMsg);
                            }
                        } catch (e) {
                            // ignore partial JSON parse errors
                        }
                    }
                }
            }
        } catch (err: any) {
            console.error(err);
            const errorMsg = { id: (Date.now() + 1).toString(), role: 'assistant' as const, content: `*[System Error]* Failed to get AI response: \`${err.message}\``, timestamp: new Date().toISOString() };
            addChatMessage(errorMsg);
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-full animate-fadeIn">
            {/* Header */}
            <div className="p-4 border-b border-forge-border flex items-center justify-between flex-shrink-0">
                <div>
                    <div className="flex items-center gap-2 text-forge-green mb-1">
                        <Bot className="w-4 h-4" />
                        <span className="text-sm font-bold glow-text-green">AI Tutor</span>
                        <span className="text-[10px] text-forge-text px-1.5 py-0.5 border border-forge-border rounded-sm">OpenAI 4o</span>
                    </div>
                    {selectedProblem && (
                        <p className="text-xs text-forge-text">Context: #{selectedProblem.number} — {selectedProblem.title}</p>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    <select value={chatProblemId || ''} onChange={(e) => setChatProblemId(e.target.value ? parseInt(e.target.value) : null)}
                        className="terminal-input text-xs">
                        <option value="">No problem context</option>
                        {problems.map(p => <option key={p.id} value={p.id}>#{p.number} {p.title}</option>)}
                    </select>
                    <button onClick={clearChat} className="p-1.5 border border-forge-border rounded-sm text-forge-text hover:text-forge-red hover:border-forge-red transition-colors">
                        <Trash2 className="w-3 h-3" />
                    </button>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {chatMessages.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full text-forge-text">
                        <Bot className="w-12 h-12 mb-4 opacity-30" />
                        <p className="text-sm">Ask me about algorithms, data structures, or specific problems.</p>
                        <p className="text-xs mt-1">I'll give hints and guide your thinking — not just answers.</p>
                    </div>
                )}
                {chatMessages.map((msg) => (
                    <div key={msg.id} className={`flex gap-3 animate-slideUp ${msg.role === 'user' ? 'justify-end' : ''}`}>
                        {msg.role === 'assistant' && (
                            <div className="w-7 h-7 rounded-sm bg-forge-green/10 border border-forge-green/30 flex items-center justify-center flex-shrink-0">
                                <Bot className="w-4 h-4 text-forge-green" />
                            </div>
                        )}
                        <div className={`max-w-[70%] rounded-sm p-3 text-sm ${msg.role === 'user'
                            ? 'bg-forge-blue/10 border border-forge-blue/30 text-forge-light'
                            : 'bg-forge-dark border border-forge-border text-forge-light'
                            }`}>
                            <pre className="whitespace-pre-wrap font-mono text-xs leading-relaxed">{msg.content}</pre>
                        </div>
                        {msg.role === 'user' && (
                            <div className="w-7 h-7 rounded-sm bg-forge-blue/10 border border-forge-blue/30 flex items-center justify-center flex-shrink-0">
                                <User className="w-4 h-4 text-forge-blue" />
                            </div>
                        )}
                    </div>
                ))}
                {loading && (
                    <div className="flex gap-3">
                        <div className="w-7 h-7 rounded-sm bg-forge-green/10 border border-forge-green/30 flex items-center justify-center flex-shrink-0">
                            <Bot className="w-4 h-4 text-forge-green animate-pulse-glow" />
                        </div>
                        <div className="bg-forge-dark border border-forge-border rounded-sm p-3">
                            <div className="flex gap-1">
                                <span className="w-1.5 h-1.5 bg-forge-green rounded-full animate-pulse" style={{ animationDelay: '0ms' }} />
                                <span className="w-1.5 h-1.5 bg-forge-green rounded-full animate-pulse" style={{ animationDelay: '150ms' }} />
                                <span className="w-1.5 h-1.5 bg-forge-green rounded-full animate-pulse" style={{ animationDelay: '300ms' }} />
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-forge-border flex-shrink-0">
                <div className="flex gap-2">
                    <input type="text" value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                        placeholder="Ask about algorithms, approaches, time complexity..."
                        className="terminal-input flex-1"
                    />
                    <button onClick={handleSend} disabled={!input.trim() || loading}
                        className="px-4 py-2 bg-forge-green/10 border border-forge-green/50 text-forge-green rounded-sm hover:bg-forge-green/20 hover:shadow-glow-green transition-all disabled:opacity-30 disabled:cursor-not-allowed">
                        <Send className="w-4 h-4" />
                    </button>
                </div>
                <p className="text-[10px] text-forge-text mt-2">
                    💡 Configure Supabase Edge Function + OpenAI API key for live AI responses. Currently using demo responses.
                </p>
            </div>
        </div>
    );
}
