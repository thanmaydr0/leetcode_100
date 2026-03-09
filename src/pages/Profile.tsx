import React, { useEffect, useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import { problems, categories } from '../data/problems';
import { Download, User, Activity, Clock, CheckCircle2, Flame, Hash } from 'lucide-react';

interface ProgressRow {
    problem_id: number;
    status: string;
    solved_at: string | null;
    language: string;
    notes: string;
}

export default function Profile() {
    const { user } = useAuth();
    const [progress, setProgress] = useState<ProgressRow[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchProgress() {
            if (!isSupabaseConfigured() || !user) {
                setLoading(false);
                return;
            }
            const { data, error } = await supabase!
                .from('user_progress')
                .select('*')
                .eq('user_id', user.id);

            if (!error && data) {
                setProgress(data);
            }
            setLoading(false);
        }
        fetchProgress();
    }, [user]);

    // Derived Data
    const solvedProgress = useMemo(() => progress.filter(p => p.status === 'solved'), [progress]);

    // 1. Join Date
    const joinDate = user?.created_at ? new Date(user.created_at) : new Date();
    const daysSinceJoin = Math.max(1, Math.floor((new Date().getTime() - joinDate.getTime()) / (1000 * 60 * 60 * 24)));

    // 2. Heatmap Data (last 6 months = 180 days)
    const heatmapWeeks = useMemo(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const startDate = new Date(today);
        startDate.setDate(today.getDate() - 179); // 180 days total

        // Normalize to start on a Sunday for standard GitHub-style alignment
        const startDay = startDate.getDay();
        startDate.setDate(startDate.getDate() - startDay);

        const dayCounts = new Map<string, number>();
        solvedProgress.forEach(p => {
            if (p.solved_at) {
                const d = new Date(p.solved_at);
                d.setHours(0, 0, 0, 0);
                const iso = d.toISOString().split('T')[0];
                dayCounts.set(iso, (dayCounts.get(iso) || 0) + 1);
            }
        });

        const weeks: { date: string, count: number }[][] = [];
        let curDate = new Date(startDate);

        while (curDate <= today) {
            const week: { date: string, count: number }[] = [];
            for (let i = 0; i < 7; i++) {
                const iso = curDate.toISOString().split('T')[0];
                if (curDate > today) {
                    week.push({ date: iso, count: -1 }); // Future placeholder
                } else {
                    week.push({ date: iso, count: dayCounts.get(iso) || 0 });
                }
                curDate.setDate(curDate.getDate() + 1);
            }
            weeks.push(week);
        }
        return weeks;
    }, [solvedProgress]);

    // 3. Category Breakdown
    const categoryStats = useMemo(() => {
        return categories.map(cat => {
            const catProbs = problems.filter(p => p.category === cat);
            const solved = catProbs.filter(p => solvedProgress.some(sp => sp.problem_id === p.id)).length;
            return { category: cat, solved, total: catProbs.length };
        }).sort((a, b) => b.solved - a.solved); // Sort by highest solved
    }, [solvedProgress]);

    // 4. Pattern Cloud
    const patternStats = useMemo(() => {
        const counts = new Map<string, number>();
        solvedProgress.forEach(sp => {
            const prob = problems.find(p => p.id === sp.problem_id);
            if (prob && prob.pattern) {
                counts.set(prob.pattern, (counts.get(prob.pattern) || 0) + 1);
            }
        });
        return Array.from(counts.entries())
            .map(([pattern, count]) => ({ pattern, count }))
            .sort((a, b) => b.count - a.count);
    }, [solvedProgress]);

    // 5. Recent Activity
    const recentActivity = useMemo(() => {
        return [...solvedProgress]
            .filter(p => p.solved_at)
            .sort((a, b) => new Date(b.solved_at!).getTime() - new Date(a.solved_at!).getTime())
            .slice(0, 10)
            .map(sp => {
                const prob = problems.find(p => p.id === sp.problem_id);
                return { ...sp, problem: prob };
            })
            .filter(sp => sp.problem); // Safety check
    }, [solvedProgress]);

    // Export JSON
    const handleExport = () => {
        const dataStr = JSON.stringify({ user: user?.email, progress }, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `algoforge_export_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const getUserInitials = () => {
        if (!user?.email) return 'AG';
        return user.email.substring(0, 2).toUpperCase();
    };

    if (loading) {
        return (
            <div className="p-6 h-full flex flex-col gap-6 animate-fadeIn max-w-6xl mx-auto">
                <div className="h-32 bg-forge-dark rounded-sm animate-pulse border border-forge-border/50"></div>
                <div className="h-64 bg-forge-dark rounded-sm animate-pulse border border-forge-border/50"></div>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto h-full overflow-y-auto animate-fadeIn custom-scrollbar">

            {/* 1. Header */}
            <div className="terminal-card bg-gradient-to-r from-forge-dark to-forge-black mb-6 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-forge-green/5 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2 group-hover:bg-forge-green/10 transition-colors" />

                <div className="flex items-center gap-6 relative z-10 w-full md:w-auto">
                    <div className="w-20 h-20 rounded-full bg-forge-black border-2 border-forge-green flex items-center justify-center shadow-[0_0_15px_rgba(0,255,65,0.2)]">
                        <span className="text-2xl font-bold text-forge-green tracking-widest">{getUserInitials()}</span>
                    </div>
                    <div>
                        <h1 className="text-xl md:text-2xl font-bold text-forge-light mb-1">{user?.email || 'Demo User'}</h1>
                        <div className="flex items-center gap-4 text-xs font-mono text-forge-text">
                            <span className="flex items-center gap-1"><User className="w-3 h-3" /> UID: {user?.id?.substring(0, 8) || '0000'}</span>
                            <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> Joined {daysSinceJoin} days ago</span>
                        </div>
                    </div>
                </div>

                <button
                    onClick={handleExport}
                    className="relative z-10 shrink-0 flex items-center gap-2 px-4 py-2 border border-forge-border bg-forge-black text-xs font-mono uppercase tracking-widest text-forge-light hover:text-forge-green hover:border-forge-green transition-all shadow-md group/btn"
                >
                    <Download className="w-4 h-4 group-hover/btn:-translate-y-0.5 transition-transform" /> Export Data
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">

                {/* 2. Heatmap */}
                <div className="lg:col-span-2 terminal-card flex flex-col">
                    <div className="flex items-center gap-2 mb-4 border-b border-forge-border/50 pb-2">
                        <Activity className="w-4 h-4 text-forge-green" />
                        <h2 className="text-xs uppercase tracking-widest text-forge-text font-mono">Contribution Heatmap (6 Months)</h2>
                    </div>

                    <div className="flex-1 overflow-x-auto custom-scrollbar pb-2">
                        <div className="flex gap-1 min-w-max">
                            {heatmapWeeks.map((week, i) => (
                                <div key={i} className="flex flex-col gap-1">
                                    {week.map((day, j) => {
                                        if (day.count === -1) return <div key={j} className="w-3 h-3 bg-transparent" />; // Future

                                        // Opacity calc (0: black, 1-2: dark green, 3-4: mid green, 5+: bright green)
                                        let bgClass = "bg-forge-black border border-forge-border/30"; // 0
                                        if (day.count > 0 && day.count <= 2) bgClass = "bg-forge-green/30 border border-forge-green/20";
                                        else if (day.count > 2 && day.count <= 4) bgClass = "bg-forge-green/60 border border-forge-green/40";
                                        else if (day.count > 4) bgClass = "bg-forge-green border border-forge-green shadow-[0_0_5px_rgba(0,255,65,0.4)]";

                                        return (
                                            <div
                                                key={j}
                                                title={`${day.date}: ${day.count} solves`}
                                                className={`w-3 h-3 rounded-[1px] ${bgClass} transition-colors hover:ring-1 hover:ring-forge-light cursor-crosshair`}
                                            />
                                        );
                                    })}
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="flex items-center justify-end gap-2 mt-2 text-[10px] font-mono text-forge-text">
                        <span>Less</span>
                        <div className="flex gap-1">
                            <div className="w-2.5 h-2.5 bg-forge-black border border-forge-border/30 rounded-[1px]"></div>
                            <div className="w-2.5 h-2.5 bg-forge-green/30 border border-forge-green/20 rounded-[1px]"></div>
                            <div className="w-2.5 h-2.5 bg-forge-green/60 border border-forge-green/40 rounded-[1px]"></div>
                            <div className="w-2.5 h-2.5 bg-forge-green border border-forge-green rounded-[1px]"></div>
                        </div>
                        <span>More</span>
                    </div>
                </div>

                {/* 4. Pattern Mastery */}
                <div className="terminal-card flex flex-col">
                    <div className="flex items-center gap-2 mb-4 border-b border-forge-border/50 pb-2">
                        <Hash className="w-4 h-4 text-forge-amber" />
                        <h2 className="text-xs uppercase tracking-widest text-forge-text font-mono">Pattern Mastery</h2>
                    </div>
                    <div className="flex-1 flex flex-wrap content-start gap-2">
                        {patternStats.length === 0 ? (
                            <p className="text-xs text-forge-text/50 font-mono w-full text-center mt-4">No patterns mastered yet.</p>
                        ) : (
                            patternStats.map(stat => {
                                // Calculate size based on count relative to max
                                const maxCount = patternStats[0].count;
                                const ratio = stat.count / maxCount;
                                const scale = 0.8 + (ratio * 0.5); // Range 0.8x to 1.3x
                                const opacity = 0.5 + (ratio * 0.5); // Range 0.5 to 1.0

                                return (
                                    <span
                                        key={stat.pattern}
                                        title={`${stat.count} solved`}
                                        className="inline-block border border-forge-amber/30 bg-forge-amber/5 text-forge-amber px-2 py-1 rounded-sm font-mono whitespace-nowrap transition-all hover:border-forge-amber"
                                        style={{
                                            transform: `scale(${scale})`,
                                            opacity: opacity,
                                            fontSize: '11px',
                                            margin: `${scale * 2}px`
                                        }}
                                    >
                                        {stat.pattern} ({stat.count})
                                    </span>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* 3. Category Breakdown */}
                <div className="terminal-card flex flex-col">
                    <div className="flex items-center gap-2 mb-4 border-b border-forge-border/50 pb-2">
                        <CheckCircle2 className="w-4 h-4 text-forge-green" />
                        <h2 className="text-xs uppercase tracking-widest text-forge-text font-mono">Category Breakdown</h2>
                    </div>
                    <div className="flex-1 flex flex-col gap-3 custom-scrollbar overflow-y-auto max-h-[350px] pr-2">
                        {categoryStats.map(cat => {
                            const perc = cat.total === 0 ? 0 : Math.round((cat.solved / cat.total) * 100);
                            return (
                                <div key={cat.category} className="group">
                                    <div className="flex justify-between text-[10px] font-mono mb-1">
                                        <span className="text-forge-light group-hover:text-forge-green transition-colors">{cat.category}</span>
                                        <span className="text-forge-text">{cat.solved} / {cat.total} ({perc}%)</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-forge-black border border-forge-border/40 rounded-sm overflow-hidden flex">
                                        <div
                                            className={`h-full transition-all duration-1000 ease-out ${perc === 100 ? 'bg-forge-green shadow-[0_0_5px_rgba(0,255,65,0.5)]' : 'bg-forge-green/70'}`}
                                            style={{ width: `${perc}%` }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* 5. Recent Activity */}
                <div className="terminal-card flex flex-col">
                    <div className="flex items-center gap-2 mb-4 border-b border-forge-border/50 pb-2">
                        <Flame className="w-4 h-4 text-forge-red" />
                        <h2 className="text-xs uppercase tracking-widest text-forge-text font-mono">Recent Activity</h2>
                    </div>
                    <div className="flex-1 flex flex-col gap-3 overflow-y-auto custom-scrollbar max-h-[350px] pr-2">
                        {recentActivity.length === 0 ? (
                            <div className="text-center text-xs text-forge-text/50 font-mono mt-8">No recent solves detected.</div>
                        ) : (
                            recentActivity.map((act, i) => (
                                <div key={i} className="flex items-start gap-4 p-3 bg-forge-black/40 border border-forge-border/50 rounded-sm hover:border-forge-border transition-colors animate-slideUp" style={{ animationDelay: `${i * 50}ms` }}>
                                    <div className="mt-0.5 text-forge-green shrink-0">
                                        <CheckCircle2 className="w-4 h-4" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between gap-2 mb-1">
                                            <h3 className="text-sm font-bold text-forge-light truncate">{act.problem?.title}</h3>
                                            <span className="text-[9px] text-forge-text font-mono whitespace-nowrap shrink-0">
                                                {new Date(act.solved_at!).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className={`text-[8px] uppercase font-mono px-1.5 py-0.5 border rounded-sm tracking-widest
                        ${act.problem?.difficulty === 'Easy' ? 'text-forge-green border-forge-green/30 bg-forge-green/5' :
                                                    act.problem?.difficulty === 'Medium' ? 'text-forge-amber border-forge-amber/30 bg-forge-amber/5' :
                                                        'text-forge-red border-forge-red/30 bg-forge-red/5'}`}>
                                                {act.problem?.difficulty}
                                            </span>
                                            <span className="text-[10px] text-forge-text font-mono truncate">{act.problem?.category}</span>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
}
