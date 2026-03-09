// ============================================
// AlgoForge Type Definitions
// ============================================

export type Difficulty = 'Easy' | 'Medium' | 'Hard';

export type Category =
    | 'Arrays'
    | 'Two Pointers'
    | 'Sliding Window'
    | 'Binary Search'
    | 'Hashing'
    | 'Sorting'
    | 'Stack'
    | 'Queue'
    | 'Dynamic Programming'
    | 'Greedy'
    | 'Linked List'
    | 'Trees'
    | 'Graphs'
    | 'Heap'
    | 'Math'
    | 'Bit Manipulation'
    | 'String';

export type ProblemStatus = 'unsolved' | 'attempted' | 'solved';

export interface Example {
    input: string;
    output: string;
    explanation?: string;
}

export interface Problem {
    id: number;
    leetcodeNumber: number;
    title: string;
    difficulty: Difficulty;
    category: Category;
    description: string;
    examples: Example[];
    constraints: string[];
    tags: string[];
    hints: string[];
    link: string;
}

export interface UserProgress {
    id?: string;
    userId: string;
    problemId: number;
    status: ProblemStatus;
    attempts: number;
    notes: string;
    lastAttempted: string;
    createdAt?: string;
}

export interface ChatMessage {
    id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: string;
}

export interface User {
    id: string;
    email: string;
    createdAt: string;
}

export interface ProblemFilters {
    difficulty: Difficulty | 'All';
    category: Category | 'All';
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
