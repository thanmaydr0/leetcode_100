import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import { problems, categories } from '../data/problems';
import { Terminal, Flame, Play, Hash, CheckCircle2 } from 'lucide-react';

interface UserProgressRow {
    problem_id: number;
    status: 'unsolved' | 'attempted' | 'solved';
    solved_at: string | null;
}

export default function Dashboard() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [progresses, setProgresses] = useState<Record<number, UserProgressRow>>({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            // If no user or demo mode, act as if 0 solves
            if (!isSupabaseConfigured() || !user) {
                setLoading(false);
                return;
            }

            const { data, error } = await supabase!
                .from('user_progress')
                .select('problem_id, status, solved_at')
                .eq('user_id', user.id);

            if (!error && data) {
                const map: Record<number, UserProgressRow> = {};
                data.forEach((row) => {
                    map[row.problem_id] = row as UserProgressRow;
                });
                setProgresses(map);
            }
            setLoading(false);
        }

        fetchData();
    }, [user]);

    // Derived stats
    const totalSolved = problems.filter(p => progresses[p.id]?.status === 'solved').length;

    const diffSolved = {
        Easy: problems.filter(p => p.difficulty === 'Easy' && progresses[p.id]?.status === 'solved').length,
        Medium: problems.filter(p => p.difficulty === 'Medium' && progresses[p.id]?.status === 'solved').length,
        Hard: problems.filter(p => p.difficulty === 'Hard' && progresses[p.id]?.status === 'solved').length,
    };

    const diffTotal = {
        Easy: problems.filter(p => p.difficulty === 'Easy').length,
        Medium: problems.filter(p => p.difficulty === 'Medium').length,
        Hard: problems.filter(p => p.difficulty === 'Hard').length,
    };

    // Streak logic based on solved_at
    const calculateStreak = () => {
        const solvedDates = Object.values(progresses)
            .filter(p => p.status === 'solved' && p.solved_at)
            .map(p => new Date(p.solved_at!).toDateString()) // Normalize to calendar dates
            .filter((v, i, a) => a.indexOf(v) === i) // Unique dates
            .sort((a, b) => new Date(b).getTime() - new Date(a).getTime()); // Descending

        let streak = 0;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        let currentDate = today;

        if (solvedDates.length > 0) {
            const latest = new Date(solvedDates[0]);
            latest.setHours(0, 0, 0, 0);
            const diffDays = Math.floor((today.getTime() - latest.getTime()) / (1000 * 60 * 60 * 24));

            // If latest solve was today or yesterday
            if (diffDays <= 1) {
                currentDate = latest;
                for (const dateStr of solvedDates) {
                    const d = new Date(dateStr);
                    d.setHours(0, 0, 0, 0);
                    if (currentDate.getTime() === d.getTime()) {
                        streak++;
                        currentDate.setDate(currentDate.getDate() - 1);
                    } else {
                        break;
                    }
                }
            }
        }
        return streak;
    };

    const streak = calculateStreak();

    // Category stats
    const categoryStats = categories.map(cat => {
        const catProblems = problems.filter(p => p.category === cat);
        const solved = catProblems.filter(p => progresses[p.id]?.status === 'solved').length;
        const total = catProblems.length;
        return { category: cat, solved, total, completion: total > 0 ? solved / total : 0 };
    });

    // Recommended Next: Sort categories by lowest completion, get first unsolved problem
    const lowestCategories = [...categoryStats]
        .filter(c => c.completion < 1)
        .sort((a, b) => a.completion - b.completion);

    const recommendedNext = [];
    for (const cat of lowestCategories) {
        if (recommendedNext.length >= 3) break;
        const unsolvedInCat = problems.find(p => p.category === cat.category && progresses[p.id]?.status !== 'solved');
        if (unsolvedInCat) recommendedNext.push(unsolvedInCat);
    }

    // Skeleton Loader State
    if (loading) {
        return (
            <div className="p-6 h-full w-full max-w-7xl mx-auto grid grid-cols-1 xl:grid-cols-3 gap-6 animate-fadeIn">
                <div className="xl:col-span-2 space-y-8">
                    <div className="flex items-center justify-between border-b border-forge-border pb-4">
                        <div className="h-4 w-48 bg-forge-gray animate-pulse rounded-sm"></div>
                        <div className="h-4 w-24 bg-forge-gray animate-pulse rounded-sm"></div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[...Array(4)].map((_, i) => <div key={i} className="h-24 bg-forge-dark shadow-inner animate-pulse rounded-sm border border-forge-border/30"></div>)}
                    </div>
                    <div>
                        <div className="h-4 w-32 bg-forge-gray animate-pulse rounded-sm mb-4"></div>
                        <div className="space-y-4">
                            {[...Array(14)].map((_, i) => <div key={i} className="h-4 bg-forge-gray/50 animate-pulse rounded-sm w-full"></div>)}
                        </div>
                    </div>
                </div>
                <div className="xl:col-span-1 border border-forge-border/40 bg-forge-dark/50 rounded-sm p-4 animate-pulse"></div>
            </div>
        );
    }

    const currentDateStr = new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

    return (
        <div className="p-6 h-full overflow-y-auto animate-fadeIn">
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 max-w-7xl mx-auto">

                {/* Main Content (Left Col) */}
                <div className="xl:col-span-2 space-y-8">

                    {/* Top Bar */}
                    <div className="flex items-center justify-between border-b border-forge-border pb-4">
                        <div className="flex items-center gap-2 text-forge-green text-sm font-mono tracking-wide">
                            <span>root@algoforge:~$</span>
                            <span className="animate-blink w-2 h-4 bg-forge-green block"></span>
                        </div>
                        <div className="text-xs text-forge-text font-mono">
                            [{currentDateStr}]
                        </div>
                    </div>

                    {/* Stats Row */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="bg-forge-dark border border-forge-border/50 p-4 rounded-sm relative overflow-hidden group hover:border-forge-green/30 transition-colors">
                            <p className="text-[10px] text-forge-text uppercase tracking-wider mb-2">Total Solved</p>
                            <div className="flex items-baseline gap-1">
                                <span className="text-3xl font-bold text-forge-green group-hover:glow-text-green transition-all">{totalSolved}</span>
                                <span className="text-xs text-forge-text font-mono">/ 100</span>
                            </div>
                        </div>

                        <div className="bg-forge-dark border border-forge-border/50 p-4 rounded-sm relative overflow-hidden group hover:border-forge-amber/30 transition-colors">
                            <p className="text-[10px] text-forge-text uppercase tracking-wider mb-2">Difficulty Breakdown</p>
                            <div className="flex flex-col gap-1 mt-1 text-[10px] font-mono">
                                <div className="flex justify-between items-center"><span className="text-forge-green">Easy</span> <span className="text-forge-light">{diffSolved.Easy}/{diffTotal.Easy}</span></div>
                                <div className="flex justify-between items-center"><span className="text-forge-amber">Med</span> <span className="text-forge-light">{diffSolved.Medium}/{diffTotal.Medium}</span></div>
                                <div className="flex justify-between items-center"><span className="text-forge-red">Hard</span> <span className="text-forge-light">{diffSolved.Hard}/{diffTotal.Hard}</span></div>
                            </div>
                        </div>

                        <div className="bg-forge-dark border border-forge-border/50 p-4 rounded-sm relative overflow-hidden group hover:border-forge-blue/30 transition-colors">
                            <p className="text-[10px] text-forge-text uppercase tracking-wider mb-2">Completion</p>
                            <div className="flex items-baseline gap-1">
                                <span className="text-3xl font-bold text-forge-blue glow-text-blue">{Math.round((totalSolved / 100) * 100)}%</span>
                            </div>
                        </div>

                        <div className="bg-forge-dark border border-forge-border/50 p-4 rounded-sm relative overflow-hidden group hover:border-forge-amber/50 transition-colors">
                            <p className="text-[10px] text-forge-text uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                <Flame className="w-3 h-3 text-forge-amber animate-pulse" /> Current Streak
                            </p>
                            <div className="flex items-baseline gap-1">
                                <span className="text-3xl font-bold text-forge-amber">{streak}</span>
                                <span className="text-xs text-forge-text font-mono">days</span>
                            </div>
                        </div>
                    </div>

                    {/* Category Progress (14 rows) */}
                    <div>
                        <h2 className="text-xs uppercase tracking-widest text-forge-text mb-4 border-b border-forge-border/50 pb-2">
                            Category Segmentation Status
                        </h2>
                        <div className="space-y-4 font-mono">
                            {categoryStats.map((cat) => {
                                const totalSegments = 10;
                                // Calculate how many segments to fill completely based on completion ratio
                                const filledRatio = cat.solved / cat.total;
                                const filledSegmentsCount = Math.floor(filledRatio * totalSegments);
                                // We'll use a fractional fill for the partially complete segment if needed, 
                                // but standard discrete terminal blocks look better:
                                const discreteSegments = Math.round(filledRatio * totalSegments);

                                return (
                                    <div key={cat.category} className="flex flex-col sm:flex-row sm:items-center gap-3 text-xs group">
                                        <div className="w-48 truncate text-forge-light group-hover:text-forge-green transition-colors">
                                            {cat.category}
                                        </div>
                                        <div className="flex-1 flex gap-[2px]">
                                            {[...Array(totalSegments)].map((_, i) => (
                                                <div
                                                    key={i}
                                                    className={`h-2 flex-1 rounded-sm transition-all duration-700 
                            ${i < discreteSegments
                                                            ? 'bg-forge-green shadow-[0_0_5px_rgba(0,255,65,0.3)]'
                                                            : 'bg-forge-black border border-forge-border/30'}`}
                                                />
                                            ))}
                                        </div>
                                        <div className="w-16 text-right text-forge-text">
                                            {cat.solved}/{cat.total}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Right Column (Recommended Next) */}
                <div className="xl:col-span-1">
                    <div className="bg-forge-dark/30 border border-forge-border/40 p-5 rounded-sm h-full flex flex-col">
                        <div className="flex items-center gap-2 mb-6 border-b border-forge-border/50 pb-3">
                            <Terminal className="w-4 h-4 text-forge-green" />
                            <h2 className="text-xs uppercase tracking-widest text-forge-text">
                                Recommended Next
                            </h2>
                        </div>

                        <div className="flex flex-col gap-4 flex-1">
                            {recommendedNext.length > 0 ? recommendedNext.map((p, i) => (
                                <div
                                    key={p.id}
                                    className="bg-[#0f0f0f] border border-forge-border/50 p-4 rounded-sm group hover:border-forge-green/40 transition-all duration-300 animate-slideUp"
                                    style={{ animationDelay: `${i * 100}ms` }}
                                >
                                    <div className="flex justify-between items-start mb-3">
                                        <span className="text-[10px] text-forge-text font-mono">#{p.number}</span>
                                        <span className={`text-[9px] uppercase tracking-widest px-1.5 py-0.5 border rounded-sm font-mono
                      ${p.difficulty === 'Easy' ? 'text-forge-green border-forge-green/30 bg-forge-green/5' :
                                                p.difficulty === 'Medium' ? 'text-forge-amber border-forge-amber/30 bg-forge-amber/5' :
                                                    'text-forge-red border-forge-red/30 bg-forge-red/5'}`}>
                                            {p.difficulty}
                                        </span>
                                    </div>
                                    <h3 className="text-sm text-forge-light font-bold mb-3 line-clamp-2 leading-relaxed">
                                        {p.title}
                                    </h3>
                                    <div className="flex items-center gap-1.5 mb-5 bg-forge-black/50 p-1.5 rounded-sm border border-forge-border/30">
                                        <Hash className="w-3 h-3 text-forge-amber flex-shrink-0" />
                                        <span className="text-[10px] text-forge-text truncate">{p.pattern}</span>
                                    </div>
                                    <button
                                        onClick={() => navigate(`/problems/${p.id}`)}
                                        className="w-full flex items-center justify-center gap-2 py-2 border border-forge-border bg-forge-black text-xs text-forge-light uppercase tracking-wider hover:text-forge-green hover:border-forge-green transition-all group-hover:bg-forge-green/5"
                                    >
                                        Start Problem <Play className="w-3 h-3 translate-y-[0.5px]" />
                                    </button>
                                </div>
                            )) : (
                                <div className="flex-1 flex flex-col items-center justify-center text-forge-text opacity-50 px-4 text-center">
                                    <CheckCircle2 className="w-10 h-10 mb-3 text-forge-green" />
                                    <p className="text-xs font-bold text-forge-light mb-1">Archive Complete</p>
                                    <p className="text-[10px] font-mono">All 100 problems have been successfully solved. Awaiting new deployments.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
