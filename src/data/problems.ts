// ============================================
// AlgoForge — 100 Curated LeetCode Problems
// Slightly elevated difficulty, array-heavy
// Target languages: Python & C++
// ============================================

export interface Problem {
    id: number;
    number: number;
    title: string;
    url: string;
    difficulty: 'Easy' | 'Medium' | 'Hard';
    category: string;
    pattern: string;
    importanceNote: string;
}

export const problems: Problem[] = [
    // ─────────────────────────────────────────────
    // 1. Arrays & Hashing (15)
    // ─────────────────────────────────────────────
    { id: 1, number: 1, title: 'Two Sum', url: 'https://leetcode.com/problems/two-sum/', difficulty: 'Easy', category: 'Arrays & Hashing', pattern: 'Hash Map Lookup', importanceNote: 'Classic complement-in-map pattern; O(n) single pass. Foundation for all hash-based pair problems.' },
    { id: 2, number: 217, title: 'Contains Duplicate', url: 'https://leetcode.com/problems/contains-duplicate/', difficulty: 'Easy', category: 'Arrays & Hashing', pattern: 'Set Membership', importanceNote: 'Simplest set usage — insert and check. Teaches set vs sorting trade-off.' },
    { id: 3, number: 242, title: 'Valid Anagram', url: 'https://leetcode.com/problems/valid-anagram/', difficulty: 'Easy', category: 'Arrays & Hashing', pattern: 'Frequency Count', importanceNote: 'Character frequency array or Counter/map. Extends to group anagrams.' },
    { id: 4, number: 49, title: 'Group Anagrams', url: 'https://leetcode.com/problems/group-anagrams/', difficulty: 'Medium', category: 'Arrays & Hashing', pattern: 'Hash Map Grouping', importanceNote: 'Sorted-string or frequency-tuple as key. Core grouping-by-signature technique.' },
    { id: 5, number: 347, title: 'Top K Frequent Elements', url: 'https://leetcode.com/problems/top-k-frequent-elements/', difficulty: 'Medium', category: 'Arrays & Hashing', pattern: 'Bucket Sort / Heap', importanceNote: 'Frequency map → bucket sort gives O(n). Alternative: min-heap of size k.' },
    { id: 6, number: 238, title: 'Product of Array Except Self', url: 'https://leetcode.com/problems/product-of-array-except-self/', difficulty: 'Medium', category: 'Arrays & Hashing', pattern: 'Prefix/Suffix Product', importanceNote: 'No division allowed — prefix and suffix passes. Constant space variant is a common follow-up.' },
    { id: 7, number: 271, title: 'Encode and Decode Strings', url: 'https://leetcode.com/problems/encode-and-decode-strings/', difficulty: 'Medium', category: 'Arrays & Hashing', pattern: 'Length-Prefix Encoding', importanceNote: 'Design a serialisation format. "len#str" pattern avoids delimiter collisions.' },
    { id: 8, number: 128, title: 'Longest Consecutive Sequence', url: 'https://leetcode.com/problems/longest-consecutive-sequence/', difficulty: 'Medium', category: 'Arrays & Hashing', pattern: 'Set + Sequence Start', importanceNote: 'HashSet O(n) — only start counting when num-1 not in set. Critical for O(n) constraint problems.' },
    { id: 9, number: 15, title: '3Sum', url: 'https://leetcode.com/problems/3sum/', difficulty: 'Medium', category: 'Arrays & Hashing', pattern: 'Sort + Two Pointers', importanceNote: 'Sort, fix one, two-pointer rest. Duplicate skipping is the tricky part. Very high competition frequency.' },
    { id: 10, number: 75, title: 'Sort Colors', url: 'https://leetcode.com/problems/sort-colors/', difficulty: 'Medium', category: 'Arrays & Hashing', pattern: 'Dutch National Flag', importanceNote: 'Three-pointer partition in single pass. Extends to k-way partitioning.' },
    { id: 11, number: 442, title: 'Find All Duplicates in an Array', url: 'https://leetcode.com/problems/find-all-duplicates-in-an-array/', difficulty: 'Medium', category: 'Arrays & Hashing', pattern: 'Index-as-Hash / Negation', importanceNote: 'O(1) space by negating value at index. Key trick for 1..n constrained arrays.' },
    { id: 12, number: 152, title: 'Maximum Product Subarray', url: 'https://leetcode.com/problems/maximum-product-subarray/', difficulty: 'Medium', category: 'Arrays & Hashing', pattern: 'Track Min & Max', importanceNote: 'Negative × negative can become max. Track both running min and max product.' },
    { id: 13, number: 54, title: 'Spiral Matrix', url: 'https://leetcode.com/problems/spiral-matrix/', difficulty: 'Medium', category: 'Arrays & Hashing', pattern: 'Boundary Simulation', importanceNote: 'Four-boundary shrinking approach. Tests careful indexing and edge-case handling.' },
    { id: 14, number: 48, title: 'Rotate Image', url: 'https://leetcode.com/problems/rotate-image/', difficulty: 'Medium', category: 'Arrays & Hashing', pattern: 'Transpose + Reverse', importanceNote: 'In-place 90° rotation: transpose then reverse each row. Classic matrix manipulation.' },
    { id: 15, number: 73, title: 'Set Matrix Zeroes', url: 'https://leetcode.com/problems/set-matrix-zeroes/', difficulty: 'Medium', category: 'Arrays & Hashing', pattern: 'In-Place Marking', importanceNote: 'Use first row/col as markers for O(1) space. Teaches in-place state encoding.' },

    // ─────────────────────────────────────────────
    // 2. Prefix Sum (6)
    // ─────────────────────────────────────────────
    { id: 16, number: 724, title: 'Find Pivot Index', url: 'https://leetcode.com/problems/find-pivot-index/', difficulty: 'Easy', category: 'Prefix Sum', pattern: 'Left Sum vs Right Sum', importanceNote: 'Total minus left sum minus current = right sum. Foundation of prefix sum thinking.' },
    { id: 17, number: 1480, title: 'Running Sum of 1d Array', url: 'https://leetcode.com/problems/running-sum-of-1d-array/', difficulty: 'Easy', category: 'Prefix Sum', pattern: 'Cumulative Sum', importanceNote: 'Simplest prefix sum — in-place accumulation. Building block for range queries.' },
    { id: 18, number: 560, title: 'Subarray Sum Equals K', url: 'https://leetcode.com/problems/subarray-sum-equals-k/', difficulty: 'Medium', category: 'Prefix Sum', pattern: 'Prefix Sum + Hash Map', importanceNote: 'Count prefix[j]-prefix[i]=k using a frequency map. Very high competition frequency.' },
    { id: 19, number: 303, title: 'Range Sum Query - Immutable', url: 'https://leetcode.com/problems/range-sum-query-immutable/', difficulty: 'Easy', category: 'Prefix Sum', pattern: 'Precomputed Prefix Array', importanceNote: 'Build prefix array once, answer range queries in O(1). Core technique for range problems.' },
    { id: 20, number: 1248, title: 'Count Number of Nice Subarrays', url: 'https://leetcode.com/problems/count-number-of-nice-subarrays/', difficulty: 'Medium', category: 'Prefix Sum', pattern: 'Prefix Count + Hash Map', importanceNote: 'Transform to prefix-count-of-odds, then apply subarray-sum-equals-k pattern.' },
    { id: 21, number: 523, title: 'Continuous Subarray Sum', url: 'https://leetcode.com/problems/continuous-subarray-sum/', difficulty: 'Medium', category: 'Prefix Sum', pattern: 'Prefix Sum Mod K', importanceNote: 'Store prefix_sum % k; if same remainder seen with gap ≥ 2, answer is true. Modular arithmetic trick.' },

    // ─────────────────────────────────────────────
    // 3. Two Pointers (6)
    // ─────────────────────────────────────────────
    { id: 22, number: 125, title: 'Valid Palindrome', url: 'https://leetcode.com/problems/valid-palindrome/', difficulty: 'Easy', category: 'Two Pointers', pattern: 'Converging Pointers', importanceNote: 'Two pointers from ends, skip non-alphanumeric. Foundation of two-pointer technique.' },
    { id: 23, number: 15, title: '3Sum', url: 'https://leetcode.com/problems/3sum/', difficulty: 'Medium', category: 'Two Pointers', pattern: 'Fix One + Two Pointers', importanceNote: 'Sort array, fix element, two-pointer for remaining pair. Duplicate handling is key.' },
    { id: 24, number: 11, title: 'Container With Most Water', url: 'https://leetcode.com/problems/container-with-most-water/', difficulty: 'Medium', category: 'Two Pointers', pattern: 'Greedy Shrink', importanceNote: 'Move the shorter pointer inward — shorter side limits area. Proof by contradiction.' },
    { id: 25, number: 42, title: 'Trapping Rain Water', url: 'https://leetcode.com/problems/trapping-rain-water/', difficulty: 'Hard', category: 'Two Pointers', pattern: 'Left/Right Max Tracking', importanceNote: 'Two pointers track left_max and right_max; water at each position = min(maxes) - height. Top interview problem.' },
    { id: 26, number: 80, title: 'Remove Duplicates from Sorted Array II', url: 'https://leetcode.com/problems/remove-duplicates-from-sorted-array-ii/', difficulty: 'Medium', category: 'Two Pointers', pattern: 'Read/Write Pointers', importanceNote: 'Write pointer + compare with element 2 positions back. Generalises to "allow at most k".' },
    { id: 27, number: 283, title: 'Move Zeroes', url: 'https://leetcode.com/problems/move-zeroes/', difficulty: 'Easy', category: 'Two Pointers', pattern: 'Snowball / Write Pointer', importanceNote: 'Write pointer for non-zeros, fill rest with 0. Simple but teaches in-place rearrangement.' },

    // ─────────────────────────────────────────────
    // 4. Sliding Window (6)
    // ─────────────────────────────────────────────
    { id: 28, number: 121, title: 'Best Time to Buy and Sell Stock', url: 'https://leetcode.com/problems/best-time-to-buy-and-sell-stock/', difficulty: 'Easy', category: 'Sliding Window', pattern: 'Track Min + Max Profit', importanceNote: 'Track minimum price so far, compute max profit. Simplest sliding window / one-pass problem.' },
    { id: 29, number: 3, title: 'Longest Substring Without Repeating Characters', url: 'https://leetcode.com/problems/longest-substring-without-repeating-characters/', difficulty: 'Medium', category: 'Sliding Window', pattern: 'Expand/Shrink Window + Set', importanceNote: 'Expand right, shrink left when duplicate found. Classic variable-size window.' },
    { id: 30, number: 76, title: 'Minimum Window Substring', url: 'https://leetcode.com/problems/minimum-window-substring/', difficulty: 'Hard', category: 'Sliding Window', pattern: 'Char Count + Valid Window', importanceNote: 'Frequency map for target, expand until valid, shrink to minimise. Hardest standard window problem.' },
    { id: 31, number: 239, title: 'Sliding Window Maximum', url: 'https://leetcode.com/problems/sliding-window-maximum/', difficulty: 'Hard', category: 'Sliding Window', pattern: 'Monotonic Deque', importanceNote: 'Monotonic decreasing deque maintains window max in O(n). Key advanced technique.' },
    { id: 32, number: 567, title: 'Permutation in String', url: 'https://leetcode.com/problems/permutation-in-string/', difficulty: 'Medium', category: 'Sliding Window', pattern: 'Fixed Window + Char Count', importanceNote: 'Fixed-size window with frequency matching. Stepping stone to minimum window substring.' },
    { id: 33, number: 904, title: 'Fruit Into Baskets', url: 'https://leetcode.com/problems/fruit-into-baskets/', difficulty: 'Medium', category: 'Sliding Window', pattern: 'At Most K Distinct', importanceNote: 'Longest subarray with at most 2 distinct values. Generalises to k distinct elements.' },

    // ─────────────────────────────────────────────
    // 5. Binary Search (6)
    // ─────────────────────────────────────────────
    { id: 34, number: 704, title: 'Binary Search', url: 'https://leetcode.com/problems/binary-search/', difficulty: 'Easy', category: 'Binary Search', pattern: 'Classic Binary Search', importanceNote: 'Exact template: lo, hi, mid. Master boundary conditions (lo <= hi vs lo < hi).' },
    { id: 35, number: 33, title: 'Search in Rotated Sorted Array', url: 'https://leetcode.com/problems/search-in-rotated-sorted-array/', difficulty: 'Medium', category: 'Binary Search', pattern: 'Determine Sorted Half', importanceNote: 'Identify which half is sorted, decide which half to search. Very common competition problem.' },
    { id: 36, number: 153, title: 'Find Minimum in Rotated Sorted Array', url: 'https://leetcode.com/problems/find-minimum-in-rotated-sorted-array/', difficulty: 'Medium', category: 'Binary Search', pattern: 'Binary Search on Rotation', importanceNote: 'Compare mid with right to decide direction. Teaches modified binary search reasoning.' },
    { id: 37, number: 981, title: 'Time Based Key-Value Store', url: 'https://leetcode.com/problems/time-based-key-value-store/', difficulty: 'Medium', category: 'Binary Search', pattern: 'Binary Search on Timestamps', importanceNote: 'Design + binary search on sorted timestamp list. Tests practical binary search application.' },
    { id: 38, number: 875, title: 'Koko Eating Bananas', url: 'https://leetcode.com/problems/koko-eating-bananas/', difficulty: 'Medium', category: 'Binary Search', pattern: 'Binary Search on Answer', importanceNote: 'Search the answer space [1, max(piles)]. Paradigm: binary search on monotonic feasibility function.' },
    { id: 39, number: 4, title: 'Median of Two Sorted Arrays', url: 'https://leetcode.com/problems/median-of-two-sorted-arrays/', difficulty: 'Hard', category: 'Binary Search', pattern: 'Binary Search on Partition', importanceNote: 'Binary search on smaller array partition. One of the hardest binary search problems — O(log(min(m,n))).' },

    // ─────────────────────────────────────────────
    // 6. Stack (6)
    // ─────────────────────────────────────────────
    { id: 40, number: 20, title: 'Valid Parentheses', url: 'https://leetcode.com/problems/valid-parentheses/', difficulty: 'Easy', category: 'Stack', pattern: 'Matching Pairs', importanceNote: 'Push opening, pop and match closing. Foundation of all stack-based parsing.' },
    { id: 41, number: 155, title: 'Min Stack', url: 'https://leetcode.com/problems/min-stack/', difficulty: 'Medium', category: 'Stack', pattern: 'Auxiliary Min Tracking', importanceNote: 'Stack of (value, current_min) pairs. Teaches O(1) auxiliary state on stack.' },
    { id: 42, number: 150, title: 'Evaluate Reverse Polish Notation', url: 'https://leetcode.com/problems/evaluate-reverse-polish-notation/', difficulty: 'Medium', category: 'Stack', pattern: 'Operand Stack', importanceNote: 'Push numbers, pop two on operator. Classic stack evaluation — watch integer division in Python vs C++.' },
    { id: 43, number: 22, title: 'Generate Parentheses', url: 'https://leetcode.com/problems/generate-parentheses/', difficulty: 'Medium', category: 'Stack', pattern: 'Backtracking + Stack Invariant', importanceNote: 'Backtrack with open/close counts. Stack invariant: open ≥ close at all times.' },
    { id: 44, number: 84, title: 'Largest Rectangle in Histogram', url: 'https://leetcode.com/problems/largest-rectangle-in-histogram/', difficulty: 'Hard', category: 'Stack', pattern: 'Monotonic Stack', importanceNote: 'Monotonic increasing stack to find left/right boundaries. Building block for maximal rectangle.' },
    { id: 45, number: 739, title: 'Daily Temperatures', url: 'https://leetcode.com/problems/daily-temperatures/', difficulty: 'Medium', category: 'Stack', pattern: 'Monotonic Decreasing Stack', importanceNote: 'Stack of indices; pop when current > stack top. Classic next-greater-element pattern.' },

    // ─────────────────────────────────────────────
    // 7. Queue (4)
    // ─────────────────────────────────────────────
    { id: 46, number: 225, title: 'Implement Stack Using Queues', url: 'https://leetcode.com/problems/implement-stack-using-queues/', difficulty: 'Easy', category: 'Queue', pattern: 'Queue Rotation', importanceNote: 'Push n-1 elements to back after enqueue. Teaches queue FIFO vs stack LIFO conversion.' },
    { id: 47, number: 1700, title: 'Number of Students Unable to Eat Lunch', url: 'https://leetcode.com/problems/number-of-students-unable-to-eat-lunch/', difficulty: 'Easy', category: 'Queue', pattern: 'Queue Simulation', importanceNote: 'Simulate or count preferences. Simple queue simulation problem.' },
    { id: 48, number: 622, title: 'Design Circular Queue', url: 'https://leetcode.com/problems/design-circular-queue/', difficulty: 'Medium', category: 'Queue', pattern: 'Circular Buffer', importanceNote: 'Head/tail pointers with modulo wraparound. Core data structure design.' },
    { id: 49, number: 621, title: 'Task Scheduler', url: 'https://leetcode.com/problems/task-scheduler/', difficulty: 'Medium', category: 'Queue', pattern: 'Greedy + Cooldown Slots', importanceNote: '(maxFreq - 1) * (n + 1) + countOfMax. Greedy scheduling with idle slots.' },

    // ─────────────────────────────────────────────
    // 8. Linked List (7)
    // ─────────────────────────────────────────────
    { id: 50, number: 206, title: 'Reverse Linked List', url: 'https://leetcode.com/problems/reverse-linked-list/', difficulty: 'Easy', category: 'Linked List', pattern: 'Iterative Pointer Swap', importanceNote: 'prev/curr/next pointer reversal. Must-know — appears as subroutine in many list problems.' },
    { id: 51, number: 21, title: 'Merge Two Sorted Lists', url: 'https://leetcode.com/problems/merge-two-sorted-lists/', difficulty: 'Easy', category: 'Linked List', pattern: 'Dummy Head Merge', importanceNote: 'Dummy node + compare-and-advance. Building block for merge k sorted lists.' },
    { id: 52, number: 141, title: 'Linked List Cycle', url: 'https://leetcode.com/problems/linked-list-cycle/', difficulty: 'Easy', category: 'Linked List', pattern: 'Floyd Slow/Fast', importanceNote: 'Tortoise and hare — if they meet, cycle exists. Foundation for cycle detection.' },
    { id: 53, number: 19, title: 'Remove Nth Node From End of List', url: 'https://leetcode.com/problems/remove-nth-node-from-end-of-list/', difficulty: 'Medium', category: 'Linked List', pattern: 'Two Pointers with Gap', importanceNote: 'Advance fast by n, then move both. Single-pass with dummy head.' },
    { id: 54, number: 143, title: 'Reorder List', url: 'https://leetcode.com/problems/reorder-list/', difficulty: 'Medium', category: 'Linked List', pattern: 'Split + Reverse + Merge', importanceNote: 'Find mid, reverse second half, interleave. Combines three fundamental list operations.' },
    { id: 55, number: 146, title: 'LRU Cache', url: 'https://leetcode.com/problems/lru-cache/', difficulty: 'Medium', category: 'Linked List', pattern: 'HashMap + Doubly Linked List', importanceNote: 'O(1) get/put with DLL for order + map for lookup. Top design problem at every level.' },
    { id: 56, number: 23, title: 'Merge K Sorted Lists', url: 'https://leetcode.com/problems/merge-k-sorted-lists/', difficulty: 'Hard', category: 'Linked List', pattern: 'Min-Heap / Divide & Conquer', importanceNote: 'Heap of k list heads, or pairwise merge. O(N log k). Scales merge-two-lists.' },

    // ─────────────────────────────────────────────
    // 9. Trees DFS/BFS (10)
    // ─────────────────────────────────────────────
    { id: 57, number: 104, title: 'Maximum Depth of Binary Tree', url: 'https://leetcode.com/problems/maximum-depth-of-binary-tree/', difficulty: 'Easy', category: 'Trees DFS/BFS', pattern: 'Recursive DFS', importanceNote: 'Base case: null→0, return 1+max(left,right). Simplest tree recursion.' },
    { id: 58, number: 100, title: 'Same Tree', url: 'https://leetcode.com/problems/same-tree/', difficulty: 'Easy', category: 'Trees DFS/BFS', pattern: 'Parallel DFS', importanceNote: 'Simultaneously recurse both trees comparing values. Foundation for tree comparison.' },
    { id: 59, number: 226, title: 'Invert Binary Tree', url: 'https://leetcode.com/problems/invert-binary-tree/', difficulty: 'Easy', category: 'Trees DFS/BFS', pattern: 'Recursive Swap', importanceNote: 'Swap left and right children recursively. Simple but commonly asked.' },
    { id: 60, number: 102, title: 'Binary Tree Level Order Traversal', url: 'https://leetcode.com/problems/binary-tree-level-order-traversal/', difficulty: 'Medium', category: 'Trees DFS/BFS', pattern: 'BFS with Level Grouping', importanceNote: 'Queue-based BFS, process level-by-level. Template for all level-order variants.' },
    { id: 61, number: 98, title: 'Validate Binary Search Tree', url: 'https://leetcode.com/problems/validate-binary-search-tree/', difficulty: 'Medium', category: 'Trees DFS/BFS', pattern: 'In-Order / Range Validation', importanceNote: 'Pass (min, max) range down recursion. Common pitfall: using parent value instead of range.' },
    { id: 62, number: 236, title: 'Lowest Common Ancestor of a Binary Tree', url: 'https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-tree/', difficulty: 'Medium', category: 'Trees DFS/BFS', pattern: 'Post-Order Search', importanceNote: 'Return node if found, bubble up from left/right. If both sides return non-null, current is LCA.' },
    { id: 63, number: 199, title: 'Binary Tree Right Side View', url: 'https://leetcode.com/problems/binary-tree-right-side-view/', difficulty: 'Medium', category: 'Trees DFS/BFS', pattern: 'BFS Last-in-Level', importanceNote: 'BFS taking last node per level, or DFS right-first with depth tracking.' },
    { id: 64, number: 1448, title: 'Count Good Nodes in Binary Tree', url: 'https://leetcode.com/problems/count-good-nodes-in-binary-tree/', difficulty: 'Medium', category: 'Trees DFS/BFS', pattern: 'DFS with Running Max', importanceNote: 'Pass max-so-far along path. Good node if val ≥ path max.' },
    { id: 65, number: 230, title: 'Kth Smallest Element in a BST', url: 'https://leetcode.com/problems/kth-smallest-element-in-a-bst/', difficulty: 'Medium', category: 'Trees DFS/BFS', pattern: 'In-Order Traversal Counter', importanceNote: 'In-order gives sorted sequence; count to k. Iterative stack version is follow-up.' },
    { id: 66, number: 297, title: 'Serialize and Deserialize Binary Tree', url: 'https://leetcode.com/problems/serialize-and-deserialize-binary-tree/', difficulty: 'Hard', category: 'Trees DFS/BFS', pattern: 'Preorder + Null Markers', importanceNote: 'Preorder with "null" markers for missing children. Queue-based deserialisation.' },

    // ─────────────────────────────────────────────
    // 10. Graphs (8)
    // ─────────────────────────────────────────────
    { id: 67, number: 200, title: 'Number of Islands', url: 'https://leetcode.com/problems/number-of-islands/', difficulty: 'Medium', category: 'Graphs', pattern: 'DFS/BFS Flood Fill', importanceNote: 'Iterate grid, DFS/BFS from each unvisited "1". Foundation of all grid graph problems.' },
    { id: 68, number: 133, title: 'Clone Graph', url: 'https://leetcode.com/problems/clone-graph/', difficulty: 'Medium', category: 'Graphs', pattern: 'DFS/BFS + HashMap Clone', importanceNote: 'Map original→clone, DFS/BFS to build. Teaches deep copy of graph structures.' },
    { id: 69, number: 695, title: 'Max Area of Island', url: 'https://leetcode.com/problems/max-area-of-island/', difficulty: 'Medium', category: 'Graphs', pattern: 'DFS with Area Counter', importanceNote: 'DFS returning area count. Variant of number-of-islands with max tracking.' },
    { id: 70, number: 417, title: 'Pacific Atlantic Water Flow', url: 'https://leetcode.com/problems/pacific-atlantic-water-flow/', difficulty: 'Medium', category: 'Graphs', pattern: 'Reverse BFS from Edges', importanceNote: 'BFS/DFS from ocean borders inward. Intersection of two reachable sets.' },
    { id: 71, number: 130, title: 'Surrounded Regions', url: 'https://leetcode.com/problems/surrounded-regions/', difficulty: 'Medium', category: 'Graphs', pattern: 'Border DFS + Flip', importanceNote: 'DFS from border Os (safe), flip remaining Os to X. Reverse thinking pattern.' },
    { id: 72, number: 994, title: 'Rotting Oranges', url: 'https://leetcode.com/problems/rotting-oranges/', difficulty: 'Medium', category: 'Graphs', pattern: 'Multi-Source BFS', importanceNote: 'Enqueue all rotten initially, BFS level = minute. Classic multi-source shortest path.' },
    { id: 73, number: 207, title: 'Course Schedule', url: 'https://leetcode.com/problems/course-schedule/', difficulty: 'Medium', category: 'Graphs', pattern: 'Topological Sort / Cycle Detection', importanceNote: 'Kahn\'s BFS or DFS with coloring. Detects cycle in directed graph. High competition frequency.' },
    { id: 74, number: 323, title: 'Number of Connected Components in an Undirected Graph', url: 'https://leetcode.com/problems/number-of-connected-components-in-an-undirected-graph/', difficulty: 'Medium', category: 'Graphs', pattern: 'Union-Find / DFS', importanceNote: 'Union-Find with rank+path compression or simple DFS. Foundation for connectivity problems.' },

    // ─────────────────────────────────────────────
    // 11. Greedy (6)
    // ─────────────────────────────────────────────
    { id: 75, number: 55, title: 'Jump Game', url: 'https://leetcode.com/problems/jump-game/', difficulty: 'Medium', category: 'Greedy', pattern: 'Farthest Reach', importanceNote: 'Track farthest reachable index. If current > farthest, return false.' },
    { id: 76, number: 45, title: 'Jump Game II', url: 'https://leetcode.com/problems/jump-game-ii/', difficulty: 'Medium', category: 'Greedy', pattern: 'BFS-like Greedy Layers', importanceNote: 'Track current end and farthest per "layer". Each layer = one jump. O(n).' },
    { id: 77, number: 134, title: 'Gas Station', url: 'https://leetcode.com/problems/gas-station/', difficulty: 'Medium', category: 'Greedy', pattern: 'Running Surplus Reset', importanceNote: 'If total gas ≥ total cost, solution exists. Reset start when surplus goes negative.' },
    { id: 78, number: 846, title: 'Hand of Straights', url: 'https://leetcode.com/problems/hand-of-straights/', difficulty: 'Medium', category: 'Greedy', pattern: 'Sorted Grouping', importanceNote: 'Sort, greedily form groups from smallest. Use frequency map to decrement.' },
    { id: 79, number: 56, title: 'Merge Intervals', url: 'https://leetcode.com/problems/merge-intervals/', difficulty: 'Medium', category: 'Greedy', pattern: 'Sort + Merge Overlapping', importanceNote: 'Sort by start, merge when overlap. Extremely common in competitions and interviews.' },
    { id: 80, number: 435, title: 'Non-overlapping Intervals', url: 'https://leetcode.com/problems/non-overlapping-intervals/', difficulty: 'Medium', category: 'Greedy', pattern: 'Interval Scheduling', importanceNote: 'Sort by end time, greedily keep non-overlapping. Classic activity selection.' },

    // ─────────────────────────────────────────────
    // 12. Dynamic Programming (10)
    // ─────────────────────────────────────────────
    { id: 81, number: 70, title: 'Climbing Stairs', url: 'https://leetcode.com/problems/climbing-stairs/', difficulty: 'Easy', category: 'Dynamic Programming', pattern: 'Fibonacci DP', importanceNote: 'dp[i] = dp[i-1] + dp[i-2]. Simplest 1D DP — introduces memoisation vs tabulation.' },
    { id: 82, number: 746, title: 'Min Cost Climbing Stairs', url: 'https://leetcode.com/problems/min-cost-climbing-stairs/', difficulty: 'Easy', category: 'Dynamic Programming', pattern: 'Min-Cost Path', importanceNote: 'dp[i] = cost[i] + min(dp[i-1], dp[i-2]). Natural extension of climbing stairs.' },
    { id: 83, number: 198, title: 'House Robber', url: 'https://leetcode.com/problems/house-robber/', difficulty: 'Medium', category: 'Dynamic Programming', pattern: 'Include/Exclude DP', importanceNote: 'dp[i] = max(dp[i-1], dp[i-2] + nums[i]). Classic "take or skip" pattern.' },
    { id: 84, number: 213, title: 'House Robber II', url: 'https://leetcode.com/problems/house-robber-ii/', difficulty: 'Medium', category: 'Dynamic Programming', pattern: 'Circular Array DP', importanceNote: 'Run House Robber twice: [0..n-2] and [1..n-1], take max. Circular → two linear subproblems.' },
    { id: 85, number: 5, title: 'Longest Palindromic Substring', url: 'https://leetcode.com/problems/longest-palindromic-substring/', difficulty: 'Medium', category: 'Dynamic Programming', pattern: 'Expand Around Center', importanceNote: 'Expand from each center (odd+even). O(n²) but simple. Manacher\'s for O(n) follow-up.' },
    { id: 86, number: 647, title: 'Palindromic Substrings', url: 'https://leetcode.com/problems/palindromic-substrings/', difficulty: 'Medium', category: 'Dynamic Programming', pattern: 'Count via Expansion', importanceNote: 'Same expand-around-center, but count instead of track longest. Good companion to #5.' },
    { id: 87, number: 91, title: 'Decode Ways', url: 'https://leetcode.com/problems/decode-ways/', difficulty: 'Medium', category: 'Dynamic Programming', pattern: '1D DP with Conditions', importanceNote: 'dp[i] depends on 1-digit and 2-digit validity. Tricky edge cases with "0".' },
    { id: 88, number: 322, title: 'Coin Change', url: 'https://leetcode.com/problems/coin-change/', difficulty: 'Medium', category: 'Dynamic Programming', pattern: 'Unbounded Knapsack', importanceNote: 'dp[amount] = min coins. Classic unbounded knapsack. BFS alternative for shortest path view.' },
    { id: 89, number: 300, title: 'Longest Increasing Subsequence', url: 'https://leetcode.com/problems/longest-increasing-subsequence/', difficulty: 'Medium', category: 'Dynamic Programming', pattern: 'Patience Sorting / DP + Binary Search', importanceNote: 'O(n²) DP or O(n log n) with patience sorting (tails array + bisect). Very high frequency.' },
    { id: 90, number: 416, title: 'Partition Equal Subset Sum', url: 'https://leetcode.com/problems/partition-equal-subset-sum/', difficulty: 'Medium', category: 'Dynamic Programming', pattern: '0/1 Knapsack', importanceNote: 'Target = sum/2, 0/1 knapsack with boolean dp. Space-optimised to 1D array.' },

    // ─────────────────────────────────────────────
    // 13. Heap / Priority Queue (5)
    // ─────────────────────────────────────────────
    { id: 91, number: 215, title: 'Kth Largest Element in an Array', url: 'https://leetcode.com/problems/kth-largest-element-in-an-array/', difficulty: 'Medium', category: 'Heap / Priority Queue', pattern: 'Min-Heap of Size K / Quickselect', importanceNote: 'Min-heap of k elements: O(n log k). Quickselect for O(n) average. Both worth knowing.' },
    { id: 92, number: 1046, title: 'Last Stone Weight', url: 'https://leetcode.com/problems/last-stone-weight/', difficulty: 'Easy', category: 'Heap / Priority Queue', pattern: 'Max-Heap Simulation', importanceNote: 'Pop two largest, push difference. In Python, negate values for max-heap with heapq.' },
    { id: 93, number: 973, title: 'K Closest Points to Origin', url: 'https://leetcode.com/problems/k-closest-points-to-origin/', difficulty: 'Medium', category: 'Heap / Priority Queue', pattern: 'Max-Heap of K / Quickselect', importanceNote: 'Max-heap of size k by distance. Or quickselect. Don\'t sqrt — compare squared distances.' },
    { id: 94, number: 621, title: 'Task Scheduler', url: 'https://leetcode.com/problems/task-scheduler/', difficulty: 'Medium', category: 'Heap / Priority Queue', pattern: 'Max-Heap + Cooldown Queue', importanceNote: 'Greedy: schedule most frequent first. Heap for next task + queue for cooldown tracking.' },
    { id: 95, number: 295, title: 'Find Median from Data Stream', url: 'https://leetcode.com/problems/find-median-from-data-stream/', difficulty: 'Hard', category: 'Heap / Priority Queue', pattern: 'Two Heaps (Max + Min)', importanceNote: 'Max-heap for lower half, min-heap for upper half. Balance sizes. O(log n) insert, O(1) median.' },

    // ─────────────────────────────────────────────
    // 14. Backtracking (5)
    // ─────────────────────────────────────────────
    { id: 96, number: 78, title: 'Subsets', url: 'https://leetcode.com/problems/subsets/', difficulty: 'Medium', category: 'Backtracking', pattern: 'Include/Exclude Recursion', importanceNote: 'At each index, include or exclude. 2^n subsets. Template for all subset generation.' },
    { id: 97, number: 39, title: 'Combination Sum', url: 'https://leetcode.com/problems/combination-sum/', difficulty: 'Medium', category: 'Backtracking', pattern: 'Unbounded Choice Backtracking', importanceNote: 'Same element reusable — don\'t increment index on include. Prune when sum exceeds target.' },
    { id: 98, number: 46, title: 'Permutations', url: 'https://leetcode.com/problems/permutations/', difficulty: 'Medium', category: 'Backtracking', pattern: 'Swap-based / Used-array', importanceNote: 'Swap current with each remaining, recurse. Or use visited boolean array. n! results.' },
    { id: 99, number: 79, title: 'Word Search', url: 'https://leetcode.com/problems/word-search/', difficulty: 'Medium', category: 'Backtracking', pattern: 'Grid DFS Backtracking', importanceNote: 'DFS from each cell, mark visited, backtrack. Prune early on mismatch.' },
    { id: 100, number: 51, title: 'N-Queens', url: 'https://leetcode.com/problems/n-queens/', difficulty: 'Hard', category: 'Backtracking', pattern: 'Constraint Backtracking', importanceNote: 'Place queens row by row, check column + diagonal constraints with sets. Classic constraint satisfaction.' },
];

// Derived helpers
export const categories: string[] = [...new Set(problems.map(p => p.category))];
export const difficultyCounts = problems.reduce((acc, p) => {
    acc[p.difficulty] = (acc[p.difficulty] || 0) + 1;
    return acc;
}, {} as Record<string, number>);
export const categoryCounts = problems.reduce((acc, p) => {
    acc[p.category] = (acc[p.category] || 0) + 1;
    return acc;
}, {} as Record<string, number>);
