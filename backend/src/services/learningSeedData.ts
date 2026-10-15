export interface LearningDocumentMetadata {
  id: string;
  topic: string;
  subtopic?: string;
  category: 'DSA' | 'JAVA' | 'SPRING_BOOT' | 'DATABASE' | 'SYSTEM_DESIGN' | 'JAVASCRIPT' | 'REACT' | 'OTHER';
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  contentType: 'CONCEPT' | 'EXPLANATION' | 'EXAMPLE' | 'QUESTION' | 'SOLUTION' | 'INTERVIEW_GUIDE';
  title: string;
  summary: string;
  content: string;
  sourceUrl?: string;
  verified: boolean;
}

export const learningSeedDocs: Array<{ text: string; metadata: LearningDocumentMetadata }> = [
  {
    text: 'Graph Algorithms BFS vs DFS graph representations visited array time complexity queue stack O(V+E) traversal',
    metadata: {
      id: 'DOC_GRAPH_001',
      topic: 'Graph Algorithms',
      subtopic: 'Breadth-First Search vs Depth-First Search',
      category: 'DSA',
      difficulty: 'INTERMEDIATE',
      contentType: 'CONCEPT',
      title: 'Mastering BFS vs DFS Graph Traversals',
      summary: 'Comprehensive guide on graph representations (Adjacency List vs Matrix), Visited node sets, and selecting BFS for shortest paths vs DFS for pathfinding/cycle detection.',
      content: `### Core Concept: Graph Representation & Traversal
Graphs consist of Vertices (V) and Edges (E). The most memory-efficient representation for sparse graphs is an **Adjacency List** using HashMaps or Array lists ($O(V+E)$ space).

#### 1. Breadth-First Search (BFS)
- **Data Structure**: Queue (FIFO).
- **Primary Use Case**: Finding the **shortest path** in unweighted graphs or level-order exploration.
- **Time Complexity**: $O(V + E)$ where every vertex is enqueued once and every edge is traversed once.
- **Key Requirement**: Always track visited nodes in a HashSet or Boolean array to avoid infinite loops in cyclic graphs.

#### 2. Depth-First Search (DFS)
- **Data Structure**: Call Stack (Recursion) or explicit Stack (LIFO).
- **Primary Use Case**: Topological sorting, connected components, cycle detection, and maze solving.
- **Time Complexity**: $O(V + E)$.

#### Common Candidate Mistake in Interviews
Candidates often forget to mark nodes as visited *immediately upon pushing to the queue* in BFS, resulting in duplicate node processing and TLE (Time Limit Exceeded) errors.`,
      sourceUrl: 'https://en.wikipedia.org/wiki/Graph_traversal',
      verified: true,
    },
  },
  {
    text: 'Spring Boot Dependency Injection Inversion of Control IoC container Autowired Component Bean Constructor Injection Singleton Scope',
    metadata: {
      id: 'DOC_SPRING_001',
      topic: 'Spring Dependency Injection',
      subtopic: 'Inversion of Control & Beans',
      category: 'SPRING_BOOT',
      difficulty: 'INTERMEDIATE',
      contentType: 'CONCEPT',
      title: 'Spring Framework Dependency Injection (DI) & IoC Container',
      summary: 'Detailed overview of Inversion of Control (IoC), Spring bean lifecycles, and why Constructor Injection is preferred over Field Injection.',
      content: `### Core Concept: Dependency Injection in Spring
Dependency Injection (DI) is a design pattern implementing **Inversion of Control (IoC)**, where the Spring ApplicationContext manages object creation, configuration, and lifecycle.

#### Injection Types
1. **Constructor Injection (Recommended)**: Dependencies are declared as final. Facilitates immutability, easier unit testing with Mockito, and prevents NullPointerExceptions at runtime.
2. **Field Injection (\`@Autowired\` on private fields)**: Discouraged in modern Spring development because it obscures dependencies, impedes unit testing without reflection, and allows circular dependency issues.

#### Bean Scopes
- **Singleton (Default)**: Single bean instance shared per ApplicationContext container.
- **Prototype**: A new bean instance is created every time it is requested.`,
      sourceUrl: 'https://docs.spring.io/spring-framework/reference/core/beans.html',
      verified: true,
    },
  },
  {
    text: 'Database Indexing B-Tree Hash Index Composite Index Write Overhead Query Execution Plan Sequential Scan Covering Index',
    metadata: {
      id: 'DOC_DB_001',
      topic: 'Database Indexing',
      subtopic: 'B-Trees & Index Design',
      category: 'DATABASE',
      difficulty: 'INTERMEDIATE',
      contentType: 'CONCEPT',
      title: 'Database Indexing Mechanics & B-Tree Optimization',
      summary: 'Explains how B-Tree indexes speed up SELECT lookups from O(N) to O(log N), the trade-off of write overhead on INSERT/UPDATE, and Composite Index column ordering.',
      content: `### Core Concept: Database B-Tree Indexing
An index is a data structure (typically a self-balancing B-Tree or B+Tree) that maintains sorted keys referencing table row locations on disk.

#### Performance Trade-offs
- **Reads**: Reduces search complexity from full table scan ($O(N)$) to B-Tree height lookup ($O(\\log N)$).
- **Writes**: Every INSERT, UPDATE, or DELETE on an indexed table requires updating the corresponding B-Tree nodes, causing write latency overhead.

#### Composite Index Rule (Leftmost Prefix Rule)
A composite index on \`(last_name, first_name, age)\` can serve queries filtering by:
- \`last_name\`
- \`last_name\` AND \`first_name\`
- \`last_name\` AND \`first_name\` AND \`age\`

It **CANNOT** be used efficiently for queries filtering only by \`first_name\` or \`age\`.`,
      sourceUrl: 'https://use-the-index-luke.com/',
      verified: true,
    },
  },
  {
    text: 'Time Complexity Analysis Big O notation amortized complexity space complexity Master Theorem asymptotic bounds',
    metadata: {
      id: 'DOC_COMPLEXITY_001',
      topic: 'Time Complexity Analysis',
      subtopic: 'Big-O & Algorithmic Efficiency',
      category: 'DSA',
      difficulty: 'BEGINNER',
      contentType: 'CONCEPT',
      title: 'Asymptotic Analysis & Time/Space Complexity Guarantees',
      summary: 'Practical guide to analyzing loop bounds, recursive call trees, memory allocation, and communicating Big-O bounds effectively in technical interviews.',
      content: `### Core Concept: Big-O Notation in Technical Interviews
Big-O describes the upper bound of algorithm runtime or memory growth as input size $N$ approaches infinity.

#### Standard Complexity Hierarchy
1. $O(1)$ — Constant time (e.g., HashMap lookup).
2. $O(\\log N)$ — Logarithmic time (e.g., Binary Search).
3. $O(N)$ — Linear time (e.g., Array iteration).
4. $O(N \\log N)$ — Linearithmic time (e.g., MergeSort, QuickSort average case).
5. $O(N^2)$ — Quadratic time (e.g., Nested loops, BubbleSort).

#### Candidate Complexity Anti-Patterns
Stating $O(N)$ for sorting an array or asserting $O(1)$ space for algorithms that instantiate $O(N)$ recursion call stacks will instantly flag a critical technical error in interview evaluations.`,
      sourceUrl: 'https://www.geeksforgeeks.org/analysis-of-algorithms-set-1-asymptotic-analysis/',
      verified: true,
    },
  },
  {
    text: 'React Fiber Architecture Virtual DOM Reconciliation useMemo useCallback Referential Equality Component Re-renders',
    metadata: {
      id: 'DOC_REACT_001',
      topic: 'React Fiber & Reconciliation',
      subtopic: 'Virtual DOM & Optimization',
      category: 'REACT',
      difficulty: 'INTERMEDIATE',
      contentType: 'CONCEPT',
      title: 'React Fiber Architecture & Re-render Prevention',
      summary: 'Deep dive into React 16+ Fiber reconciliation tree, incremental rendering, key props in lists, and referential equality optimization hooks.',
      content: `### Core Concept: React Fiber Architecture
React Fiber is a rewrite of the core reconciliation algorithm. It breaks rendering work into incremental units (fibers) that can be paused, prioritized, and resumed without blocking the main browser UI thread.

#### Reconciliation Rules
- **Virtual DOM Diffing**: React compares tree nodes using heuristics ($O(N)$ heuristic instead of $O(N^3)$ general tree diffing).
- **Key Prop Requirement**: Keys provide persistent identity across re-renders for list items, preventing unnecessary DOM element teardown.

#### Performance Hooks
- **\`useMemo\`**: Caches expensive computation results until specified dependencies change.
- **\`useCallback\`**: Caches function references across renders to preserve referential equality when passing callbacks to memoized child components (\`React.memo\`).`,
      sourceUrl: 'https://react.dev/learn/reconciler',
      verified: true,
    },
  },
];
