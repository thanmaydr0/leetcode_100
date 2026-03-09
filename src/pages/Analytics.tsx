import React from 'react';
import { useStore } from '../store';
import { BarChart3, PieChart, TrendingUp, Award } from 'lucide-react';

export default function Analytics() {
    const stats = useStore((s) => s.getStats());
    const completionPct = stats.totalProblems > 0 ? Math.round((stats.totalSolved / stats.totalProblems) * 100) : 0;

    const diffData = [
        { label: 'Easy', solved: stats.easySolved, total: stats.easyTotal, color: '#00ff41', bg: 'bg-forge-green' },
        { label: 'Medium', solved: stats.mediumSolved, total: stats.mediumTotal, color: '#ffb000', bg: 'bg-forge-amber' },
        { label: 'Hard', solved: stats.hardSolved, total: stats.hardTotal, color: '#ff3333', bg: 'bg-forge-red' },
    ];

    const categorySorted = Object.entries(stats.categoryBreakdown)
        .sort(([, a], [, b]) => b.total - a.total);

    return (
        <div className="p-6 animate-fadeIn">
            <div className="flex items-center gap-2 text-forge-green mb-1">
                <span className="text-forge-text">$</span>
                <span className="glow-text-green">algoforge</span>
                <span className="text-forge-text">--analytics</span>
            </div>
            <h1 className="text-2xl font-bold text-forge-light mt-2 mb-8">Performance Analytics</h1>

            {/* Overview Bar */}
            <div className="terminal-card mb-6">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-forge-green" />
                        <h2 className="text-sm font-bold uppercase tracking-wider">Overall Progress</h2>
                    </div>
                    <span className="text-2xl font-bold text-forge-green">{completionPct}%</span>
                </div>
                <div className="h-4 bg-forge-muted rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-forge-green to-forge-cyan rounded-full transition-all duration-1000"
                        style={{ width: `${completionPct}%` }} />
                </div>
                <div className="flex justify-between mt-2 text-xs text-forge-text">
                    <span>{stats.totalSolved} solved</span>
                    <span>{stats.totalProblems - stats.totalSolved} remaining</span>
                </div>
            </div>

            {/* Difficulty Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {diffData.map(({ label, solved, total, color, bg }) => {
                    const pct = total > 0 ? Math.round((solved / total) * 100) : 0;
                    return (
                        <div key={label} className="terminal-card">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-sm font-bold" style={{ color }}>{label}</h3>
                                <span className="text-xs text-forge-text">{solved}/{total}</span>
                            </div>
                            <div className="h-2 bg-forge-muted rounded-full overflow-hidden mb-2">
                                <div className={`h-full ${bg} rounded-full transition-all duration-700`} style={{ width: `${pct}%` }} />
                            </div>
                            <div className="text-right text-xs text-forge-text">{pct}%</div>
                            {/* Visual bar chart */}
                            <div className="mt-4 flex gap-1 items-end h-16">
                                {Array.from({ length: total }, (_, i) => (
                                    <div key={i}
                                        className={`flex-1 rounded-sm transition-all duration-300 ${i < solved ? bg : 'bg-forge-muted'}`}
                                        style={{ height: `${i < solved ? 100 : 20}%`, opacity: i < solved ? 1 : 0.3 }} />
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Category Heatmap */}
            <div className="terminal-card mb-6">
                <div className="flex items-center gap-2 mb-4">
                    <PieChart className="w-4 h-4 text-forge-amber" />
                    <h2 className="text-sm font-bold uppercase tracking-wider">Category Heatmap</h2>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                    {categorySorted.map(([cat, { solved, total }]) => {
                        const pct = total > 0 ? solved / total : 0;
                        const intensity = Math.round(pct * 255);
                        return (
                            <div key={cat} className="border border-forge-border rounded-sm p-3 transition-all hover:border-forge-green/30"
                                style={{ backgroundColor: `rgba(0, 255, 65, ${pct * 0.15})` }}>
                                <p className="text-xs font-bold text-forge-light truncate">{cat}</p>
                                <p className="text-lg font-bold mt-1" style={{ color: `rgb(${255 - intensity}, ${intensity}, ${Math.round(intensity * 0.3)})` }}>
                                    {solved}/{total}
                                </p>
                                <p className="text-[10px] text-forge-text">{Math.round(pct * 100)}% complete</p>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Readiness Score */}
            <div className="terminal-card">
                <div className="flex items-center gap-2 mb-4">
                    <Award className="w-4 h-4 text-forge-cyan" />
                    <h2 className="text-sm font-bold uppercase tracking-wider">Competition Readiness</h2>
                </div>
                <div className="flex items-center gap-6">
                    <div className="text-5xl font-bold text-forge-green glow-text-green">
                        {Math.min(Math.round((stats.totalSolved / stats.totalProblems) * 10), 10)}/10
                    </div>
                    <div className="text-xs text-forge-text space-y-1">
                        <p>{stats.totalSolved >= 80 ? '🏆 Competition ready!' : stats.totalSolved >= 50 ? '🔥 Getting strong!' : stats.totalSolved >= 20 ? '📈 Building momentum...' : '🚀 Just getting started!'}</p>
                        <p>Solve more problems across all categories to improve your readiness score.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
