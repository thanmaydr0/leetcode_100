import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import { Search, LayoutGrid, List, CheckCircle2, Circle, Check, ChevronUp, ChevronDown, ExternalLink } from 'lucide-react';
import { categories } from '../data/problems';
import type { Difficulty, ProblemStatus } from '../types';

interface JoinedProblem {
    id: number;
    number: number;
    title: string;
    url: string;
    difficulty: Difficulty;
    category: string;
    pattern: string;
    status: ProblemStatus;
}

const diffColor: Record<string, string> = {
    Easy: 'text-forge-green bg-forge-green/10 border-forge-green/30',
    Medium: 'text-forge-amber bg-forge-amber/10 border-forge-amber/30',
    Hard: 'text-forge-red bg-forge-red/10 border-forge-red/30',
};

const diffValue: Record<string, number> = { Easy: 1, Medium: 2, Hard: 3 };

const statusValue: Record<string, number> = { solved: 3, attempted: 2, unsolved: 1 };

export default function Problems() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [searchParams, setSearchParams] = useSearchParams();

    const [problems, setProblems] = useState<JoinedProblem[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
    const [markingBulk, setMarkingBulk] = useState(false);

    // Read URL params
    const q = searchParams.get('q') || '';
    const catParam = searchParams.get('cat') || 'All';
    const diffParam = searchParams.get('diff') || 'All';
    const statParam = searchParams.get('stat') || 'All';
    const patParam = searchParams.get('pat') || 'All';
    const view = searchParams.get('view') === 'grid' ? 'grid' : 'table';
    const sort = searchParams.get('sort') || 'number';
    const desc = searchParams.get('desc') === 'true';

    const updateParams = (updates: Record<string, string | null>) => {
        const newParams = new URLSearchParams(searchParams);
        Object.entries(updates).forEach(([k, v]) => {
            if (v === null || v === 'All' || v === '') newParams.delete(k);
            else newParams.set(k, v);
        });
        setSearchParams(newParams);
    };

    const fetchProblems = async () => {
        setLoading(true);
        if (!isSupabaseConfigured()) {
            // Demo mode fallback logic if needed
            setLoading(false);
            return;
        }

        // Join query
        const { data, error } = await supabase!
            .from('problems')
            .select(`
        id, number, title, url, difficulty, category, pattern,
        user_progress(status)
      `)
            .order('number');

        if (!error && data) {
            const formatted: JoinedProblem[] = data.map((row: any) => ({
                id: row.id,
                number: row.number,
                title: row.title,
                url: row.url,
                difficulty: row.difficulty,
                category: row.category,
                pattern: row.pattern,
                status: (row.user_progress && row.user_progress.length > 0)
                    ? row.user_progress[0].status
                    : 'unsolved'
            }));
            setProblems(formatted);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchProblems();
    }, [user]);

    // Extract unique patterns dynamically
    const patterns = useMemo(() => {
        const p = new Set<string>();
        problems.forEach(x => { if (x.pattern) p.add(x.pattern); });
        return Array.from(p).sort();
    }, [problems]);

    // Filtering & Sorting
    const filtered = useMemo(() => {
        let res = [...problems];

        if (q) {
            const lowerQ = q.toLowerCase();
            res = res.filter(p => p.title.toLowerCase().includes(lowerQ) || p.number.toString().includes(lowerQ));
        }
        if (catParam !== 'All') res = res.filter(p => p.category === catParam);
        if (diffParam !== 'All') res = res.filter(p => p.difficulty === diffParam);
        if (statParam !== 'All') res = res.filter(p => p.status === statParam);
        if (patParam !== 'All') res = res.filter(p => p.pattern === patParam);

        res.sort((a, b) => {
            let cmp = 0;
            if (sort === 'number') cmp = a.number - b.number;
            else if (sort === 'difficulty') cmp = diffValue[a.difficulty] - diffValue[b.difficulty];
            else if (sort === 'category') cmp = a.category.localeCompare(b.category);
            else if (sort === 'status') cmp = statusValue[a.status] - statusValue[b.status];
            return desc ? -cmp : cmp;
        });

        return res;
    }, [problems, q, catParam, diffParam, statParam, patParam, sort, desc]);

    const toggleSort = (field: string) => {
        if (sort === field) {
            updateParams({ desc: desc ? null : 'true' });
        } else {
            updateParams({ sort: field, desc: null });
        }
    };

    const handleBulkSolve = async () => {
        if (selectedIds.size === 0 || !user || !isSupabaseConfigured()) return;
        setMarkingBulk(true);

        const upserts = Array.from(selectedIds).map(pid => ({
            user_id: user.id,
            problem_id: pid,
            status: 'solved',
            updated_at: new Date().toISOString()
        }));

        const { error } = await supabase!.from('user_progress').upsert(upserts, { onConflict: 'user_id,problem_id' });
        if (!error) {
            setSelectedIds(new Set());
            await fetchProblems();
        }
        setMarkingBulk(false);
    };

    const toggleSelection = (id: number) => {
        const next = new Set(selectedIds);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        setSelectedIds(next);
    };

    const toggleAll = () => {
        if (selectedIds.size === filtered.length) setSelectedIds(new Set());
        else setSelectedIds(new Set(filtered.map(p => p.id)));
    };

    const getSortIcon = (field: string) => {
        if (sort !== field) return null;
        return desc ? <ChevronDown className="w-3 h-3 inline ml-1" /> : <ChevronUp className="w-3 h-3 inline ml-1" />;
    };

    return (
        <div className="p-6 max-w-[1600px] mx-auto animate-fadeIn h-full flex flex-col">
            {/* Header & Bulk Actions */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
                <div>
                    <div className="flex items-center gap-2 text-forge-green mb-1 text-sm font-mono tracking-wide">
                        <span>root@algoforge:~/problems</span>
                        <span className="animate-blink w-2 h-4 bg-forge-green block"></span>
                    </div>
                    <h1 className="text-2xl font-bold text-forge-light mt-2">Problem Archive</h1>
                    <p className="text-xs text-forge-text mt-1 font-mono">Showing {filtered.length}/{problems.length} problems</p>
                </div>

                <div className="flex items-center gap-3">
                    {selectedIds.size > 0 && (
                        <button
                            onClick={handleBulkSolve}
                            disabled={markingBulk}
                            className="flex items-center gap-2 px-3 py-1.5 bg-forge-green/10 text-forge-green border border-forge-green hover:bg-forge-green hover:text-forge-black transition-all text-xs uppercase tracking-widest font-bold whitespace-nowrap"
                        >
                            <CheckCircle2 className="w-4 h-4" />
                            {markingBulk ? 'Marking...' : `Mark ${selectedIds.size} as Solved`}
                        </button>
                    )}

                    <div className="flex bg-forge-dark border border-forge-border rounded-sm">
                        <button onClick={() => updateParams({ view: 'table' })} className={`p-1.5 transition-colors ${view === 'table' ? 'bg-forge-green/20 text-forge-green' : 'text-forge-text hover:text-forge-light'}`}>
                            <List className="w-4 h-4" />
                        </button>
                        <button onClick={() => updateParams({ view: 'grid' })} className={`p-1.5 transition-colors ${view === 'grid' ? 'bg-forge-green/20 text-forge-green' : 'text-forge-text hover:text-forge-light'}`}>
                            <LayoutGrid className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="terminal-card mb-4 shrink-0 flex flex-col lg:flex-row gap-4 items-start lg:items-center p-4">
                <div className="relative flex-1 w-full lg:min-w-[200px] lg:max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-forge-text" />
                    <input
                        type="text"
                        placeholder="Search by title or #..."
                        value={q}
                        onChange={(e) => updateParams({ q: e.target.value })}
                        className="w-full bg-forge-black border border-forge-border text-forge-light text-sm pl-10 pr-3 py-2 rounded-sm focus:border-forge-green focus:outline-none transition-colors font-mono"
                    />
                </div>

                <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                    {/* Difficulty Chips */}
                    <div className="flex bg-forge-black border border-forge-border rounded-sm overflow-hidden text-xs">
                        {['All', 'Easy', 'Medium', 'Hard'].map((d) => (
                            <button
                                key={d}
                                onClick={() => updateParams({ diff: d })}
                                className={`px-3 py-1.5 uppercase font-mono tracking-widest transition-colors border-r border-forge-border/50 last:border-0
                  ${diffParam === d ? (d === 'Easy' ? 'bg-forge-green/20 text-forge-green' : d === 'Medium' ? 'bg-forge-amber/20 text-forge-amber' : d === 'Hard' ? 'bg-forge-red/20 text-forge-red' : 'bg-forge-border text-forge-light') : 'text-forge-text hover:bg-forge-dark'}`}
                            >
                                {d}
                            </button>
                        ))}
                    </div>

                    <select value={catParam} onChange={(e) => updateParams({ cat: e.target.value })} className="terminal-input text-xs cursor-pointer py-1.5 h-auto font-mono">
                        <option value="All">All Categories</option>
                        {categories.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>

                    <select value={patParam} onChange={(e) => updateParams({ pat: e.target.value })} className="terminal-input text-xs cursor-pointer py-1.5 h-auto font-mono">
                        <option value="All">All Patterns</option>
                        {patterns.map((p) => <option key={p} value={p}>{p}</option>)}
                    </select>

                    <select value={statParam} onChange={(e) => updateParams({ stat: e.target.value })} className="terminal-input text-xs cursor-pointer py-1.5 h-auto font-mono">
                        <option value="All">All Status</option>
                        <option value="solved">● Solved</option>
                        <option value="attempted">◑ Attempted</option>
                        <option value="unsolved">○ Unsolved</option>
                    </select>

                    <button onClick={() => updateParams({ q: null, cat: null, diff: null, pat: null, stat: null })} className="text-[10px] text-forge-text hover:text-forge-green transition-colors uppercase ml-auto lg:ml-0 font-mono">
                        Reset
                    </button>
                </div>
            </div>

            {/* Content Area */}
            {loading ? (
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-forge-green font-mono animate-pulse flex items-center gap-2">
                        <span className="w-4 h-4 border-2 border-forge-green border-t-transparent rounded-full animate-spin"></span>
                        Loading Problems...
                    </div>
                </div>
            ) : filtered.length === 0 ? (
                <div className="flex-1 terminal-card flex flex-col items-center justify-center text-forge-text">
                    <p className="font-mono mb-2">No problems match your filters.</p>
                    <button onClick={() => updateParams({ q: null, cat: null, diff: null, pat: null, stat: null })} className="text-forge-green text-xs hover:underline uppercase tracking-widest">Clear Filters</button>
                </div>
            ) : (
                <div className={`flex-1 overflow-y-auto ${view === 'grid' ? '' : 'terminal-card p-0 overflow-hidden flex flex-col'}`}>

                    {view === 'table' ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left whitespace-nowrap">
                                <thead className="bg-forge-dark sticky top-0 z-10">
                                    <tr className="border-b border-forge-border text-[10px] text-forge-text uppercase tracking-widest font-mono">
                                        <th className="p-3 w-10 text-center">
                                            <button onClick={toggleAll} className="hover:text-forge-light transition-colors">
                                                {selectedIds.size === filtered.length && filtered.length > 0 ? <CheckCircle2 className="w-4 h-4 text-forge-green" /> : <Circle className="w-4 h-4" />}
                                            </button>
                                        </th>
                                        <th className="p-3 w-12 text-center cursor-pointer hover:text-forge-light group" onClick={() => toggleSort('status')}>
                                            St {getSortIcon('status')}
                                        </th>
                                        <th className="p-3 w-16 cursor-pointer hover:text-forge-light group" onClick={() => toggleSort('number')}>
                                            # {getSortIcon('number')}
                                        </th>
                                        <th className="p-3 cursor-pointer hover:text-forge-light group">
                                            Title
                                        </th>
                                        <th className="p-3 w-28 cursor-pointer hover:text-forge-light group" onClick={() => toggleSort('difficulty')}>
                                            Difficulty {getSortIcon('difficulty')}
                                        </th>
                                        <th className="p-3 w-40 cursor-pointer hover:text-forge-light group" onClick={() => toggleSort('category')}>
                                            Category {getSortIcon('category')}
                                        </th>
                                        <th className="p-3 w-40">
                                            Pattern
                                        </th>
                                        <th className="p-3 w-10 text-center">↗</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-forge-border/50">
                                    {filtered.map((p, i) => (
                                        <tr key={p.id}
                                            className={`group cursor-pointer transition-colors hover:bg-forge-gray/50 ${selectedIds.has(p.id) ? 'bg-forge-green/5' : ''} animate-slideUp`}
                                            style={{ animationDelay: `${Math.min(i * 10, 300)}ms` }}>

                                            <td className="p-3 text-center" onClick={(e) => { e.stopPropagation(); toggleSelection(p.id); }}>
                                                <div className="flex items-center justify-center">
                                                    {selectedIds.has(p.id) ? <CheckCircle2 className="w-4 h-4 text-forge-green" /> : <Circle className="w-4 h-4 text-forge-border group-hover:text-forge-text transition-colors" />}
                                                </div>
                                            </td>

                                            <td className="p-3 text-center text-lg" onClick={() => navigate(`/problems/${p.id}`)}>
                                                {p.status === 'solved' ? <span className="text-forge-green">●</span> : p.status === 'attempted' ? <span className="text-forge-amber">◑</span> : <span className="text-forge-border">○</span>}
                                            </td>

                                            <td className="p-3 text-forge-text font-mono text-xs" onClick={() => navigate(`/problems/${p.id}`)}>
                                                {p.number.toString().padStart(3, '0')}
                                            </td>

                                            <td className="p-3 font-bold text-forge-light group-hover:text-forge-green transition-colors" onClick={() => navigate(`/problems/${p.id}`)}>
                                                {p.title}
                                            </td>

                                            <td className="p-3" onClick={() => navigate(`/problems/${p.id}`)}>
                                                <span className={`text-[9px] px-2 py-0.5 border rounded-sm font-mono uppercase tracking-widest ${diffColor[p.difficulty]}`}>
                                                    {p.difficulty}
                                                </span>
                                            </td>

                                            <td className="p-3 text-xs text-forge-text font-mono truncate max-w-[160px]" onClick={() => navigate(`/problems/${p.id}`)}>
                                                {p.category}
                                            </td>

                                            <td className="p-3" onClick={() => navigate(`/problems/${p.id}`)}>
                                                <div className="flex items-center gap-1.5 bg-forge-black/50 px-2 py-1 rounded-sm border border-forge-border/30 w-fit">
                                                    <span className="text-[10px] text-forge-text font-mono truncate max-w-[150px]">{p.pattern}</span>
                                                </div>
                                            </td>

                                            <td className="p-3 text-center">
                                                <a href={p.url} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="text-forge-text hover:text-forge-blue transition-colors flex justify-center">
                                                    <ExternalLink className="w-3.5 h-3.5" />
                                                </a>
                                            </td>

                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                            {filtered.map((p, i) => (
                                <div key={p.id}
                                    onClick={() => navigate(`/problems/${p.id}`)}
                                    className={`terminal-card flex flex-col cursor-pointer transition-all hover:-translate-y-1 hover:border-forge-green/50 hover:shadow-[0_4px_20px_rgba(0,255,65,0.05)]
                    ${selectedIds.has(p.id) ? 'border-forge-green/80 bg-forge-green/5' : ''} animate-slideUp`}
                                    style={{ animationDelay: `${Math.min(i * 20, 400)}ms` }}
                                >
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex items-center gap-2">
                                            <button onClick={(e) => { e.stopPropagation(); toggleSelection(p.id); }} className="hover:scale-110 transition-transform">
                                                {selectedIds.has(p.id) ? <CheckCircle2 className="w-4 h-4 text-forge-green" /> : <Circle className="w-4 h-4 text-forge-border" />}
                                            </button>
                                            <span className="text-xs font-mono text-forge-text">#{p.number}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {p.status === 'solved' ? <span className="text-forge-green text-lg leading-none">●</span> : p.status === 'attempted' ? <span className="text-forge-amber text-lg leading-none">◑</span> : <span className="text-forge-border text-lg leading-none">○</span>}
                                        </div>
                                    </div>

                                    <h3 className="text-lg font-bold text-forge-light mb-2 line-clamp-2">{p.title}</h3>

                                    <div className="mt-auto pt-4 flex flex-wrap gap-2 items-center">
                                        <span className={`text-[9px] px-2 py-0.5 border rounded-sm font-mono uppercase tracking-widest ${diffColor[p.difficulty]}`}>
                                            {p.difficulty}
                                        </span>
                                        <span className="text-[10px] text-forge-text border border-forge-border/50 px-2 py-0.5 rounded-sm bg-forge-dark/50">{p.category}</span>
                                        <span className="text-[10px] text-forge-amber border border-forge-amber/20 px-2 py-0.5 rounded-sm bg-forge-amber/5 truncate max-w-[120px]">{p.pattern}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
