import { create } from 'zustand';
import { Problem, problems as allProblems } from '../data/problems';

export type ProblemStatus = 'unsolved' | 'attempted' | 'solved';

export interface UserProgress {
    problemId: number;
    status: ProblemStatus;
    language: 'python' | 'cpp';
    notes: string;
    solvedAt: string | null;
    updatedAt: string;
}

export interface ChatMessage {
    id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: string;
}

export interface ProblemFilters {
    difficulty: 'Easy' | 'Medium' | 'Hard' | 'All';
    category: string;
    status: ProblemStatus | 'All';
    search: string;
}

export interface AppStats {
    totalSolved: number;
    totalAttempted: number;
    totalProblems: number;
    easySolved: number;
    easyTotal: number;
    mediumSolved: number;
    mediumTotal: number;
    hardSolved: number;
    hardTotal: number;
    categoryBreakdown: Record<string, { solved: number; total: number }>;
}

interface AppState {
    problems: Problem[];
    userProgress: Record<number, UserProgress>;
    filters: ProblemFilters;
    chatMessages: ChatMessage[];
    chatProblemId: number | null;

    setFilter: (filters: Partial<ProblemFilters>) => void;
    resetFilters: () => void;
    getFilteredProblems: () => Problem[];
    updateProgress: (problemId: number, update: Partial<UserProgress>) => void;
    getProgressForProblem: (problemId: number) => UserProgress | undefined;
    getStats: () => AppStats;
    addChatMessage: (msg: ChatMessage) => void;
    updateChatMessage: (id: string, content: string) => void;
    clearChat: () => void;
    setChatProblemId: (id: number | null) => void;
}

const defaultFilters: ProblemFilters = {
    difficulty: 'All',
    category: 'All',
    status: 'All',
    search: '',
};

export const useStore = create<AppState>((set, get) => ({
    problems: allProblems,
    userProgress: {},
    filters: defaultFilters,
    chatMessages: [],
    chatProblemId: null,

    setFilter: (newFilters) =>
        set((state) => ({ filters: { ...state.filters, ...newFilters } })),

    resetFilters: () => set({ filters: defaultFilters }),

    getFilteredProblems: () => {
        const { problems, filters, userProgress } = get();
        return problems.filter((p) => {
            if (filters.difficulty !== 'All' && p.difficulty !== filters.difficulty) return false;
            if (filters.category !== 'All' && p.category !== filters.category) return false;
            if (filters.search && !p.title.toLowerCase().includes(filters.search.toLowerCase()) && !p.number.toString().includes(filters.search)) return false;
            if (filters.status !== 'All') {
                const progress = userProgress[p.id];
                const status: ProblemStatus = progress?.status || 'unsolved';
                if (status !== filters.status) return false;
            }
            return true;
        });
    },

    updateProgress: (problemId, update) =>
        set((state) => ({
            userProgress: {
                ...state.userProgress,
                [problemId]: {
                    ...(state.userProgress[problemId] || {
                        problemId,
                        status: 'unsolved' as ProblemStatus,
                        language: 'python' as const,
                        notes: '',
                        solvedAt: null,
                        updatedAt: new Date().toISOString(),
                    }),
                    ...update,
                    updatedAt: new Date().toISOString(),
                },
            },
        })),

    getProgressForProblem: (problemId) => get().userProgress[problemId],

    getStats: () => {
        const { problems, userProgress } = get();
        const stats: AppStats = {
            totalSolved: 0, totalAttempted: 0, totalProblems: problems.length,
            easySolved: 0, easyTotal: 0, mediumSolved: 0, mediumTotal: 0,
            hardSolved: 0, hardTotal: 0, categoryBreakdown: {},
        };
        problems.forEach((p) => {
            const progress = userProgress[p.id];
            const isSolved = progress?.status === 'solved';
            const isAttempted = progress?.status === 'attempted';
            if (isSolved) stats.totalSolved++;
            if (isAttempted || isSolved) stats.totalAttempted++;
            if (p.difficulty === 'Easy') { stats.easyTotal++; if (isSolved) stats.easySolved++; }
            if (p.difficulty === 'Medium') { stats.mediumTotal++; if (isSolved) stats.mediumSolved++; }
            if (p.difficulty === 'Hard') { stats.hardTotal++; if (isSolved) stats.hardSolved++; }
            if (!stats.categoryBreakdown[p.category]) stats.categoryBreakdown[p.category] = { solved: 0, total: 0 };
            stats.categoryBreakdown[p.category].total++;
            if (isSolved) stats.categoryBreakdown[p.category].solved++;
        });
        return stats;
    },

    addChatMessage: (msg) => set((state) => ({ chatMessages: [...state.chatMessages, msg] })),
    updateChatMessage: (id, content) => set((state) => ({ chatMessages: state.chatMessages.map(m => m.id === id ? { ...m, content } : m) })),
    clearChat: () => set({ chatMessages: [] }),
    setChatProblemId: (id) => set({ chatProblemId: id }),
}));
