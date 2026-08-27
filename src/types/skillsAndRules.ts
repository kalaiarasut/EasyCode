export interface AiSkill {
  id: string;
  name: string;
  mentionKey: string; // e.g. "@slides", "@pdf-report"
  category: "Presentation" | "Document" | "Engineering" | "Design" | "Analysis" | "Testing";
  description: string;
  badge: string;
  iconName: string;
  enabled: boolean;
  systemPromptModifier: string;
  outputFormat: "slides" | "pdf" | "docx" | "svg" | "code" | "csv" | "markdown";
  examplePrompt: string;
}

export interface AiRule {
  id: string;
  title: string;
  description: string;
  category: "Coding" | "Complexity" | "Documentation" | "Design";
  ruleText: string;
  enabled: boolean;
  isBuiltIn?: boolean;
}

export const BUILT_IN_SKILLS: AiSkill[] = [
  {
    id: "slides-generator",
    name: "Presentation Deck Architect",
    mentionKey: "@slides",
    category: "Presentation",
    description: "Generate stunning, slide-by-slide presentation decks (PPT / HTML) with rich visuals, headers, and code.",
    badge: "PPT / HTML",
    iconName: "Presentation",
    enabled: true,
    systemPromptModifier: "Format your entire output as an executive presentation slide deck with sequential slides separated by '---' and slide titles using '# Slide Title'. Include bullet points, code cards, and key takeaway badges.",
    outputFormat: "slides",
    examplePrompt: "Build a 5-slide technical presentation on Graph Shortest Path algorithms with Dijkstra and A*",
  },
  {
    id: "pdf-report-generator",
    name: "Executive PDF & Whitepaper",
    mentionKey: "@pdf-report",
    category: "Document",
    description: "Produce structured, publication-ready technical whitepapers, algorithm specs, and printable PDF cheat-sheets.",
    badge: "PDF Spec",
    iconName: "FileText",
    enabled: true,
    systemPromptModifier: "Format the output as a formal technical whitepaper specification with Executive Summary, Mathematical Invariants, Step-by-Step Proof, and Complexity Bounds.",
    outputFormat: "pdf",
    examplePrompt: "Create an executive technical specification whitepaper on Dynamic Programming state compression",
  },
  {
    id: "docx-doc-generator",
    name: "Microsoft Word Tech Spec",
    mentionKey: "@docx",
    category: "Document",
    description: "Generate structured Microsoft Word .docx technical documents with headings, tables, and code snippets.",
    badge: "DOCX",
    iconName: "BookOpen",
    enabled: true,
    systemPromptModifier: "Structure your response as an enterprise Microsoft Word design document with clear section headings, input/output tables, implementation notes, and edge cases.",
    outputFormat: "docx",
    examplePrompt: "Generate a formal Microsoft Word technical design spec for a Distributed Rate Limiter",
  },
  {
    id: "flowchart-diagram-architect",
    name: "Interactive Flowchart Architect",
    mentionKey: "@flowchart",
    category: "Design",
    description: "Generate interactive Mermaid flowcharts, decision trees, sequence diagrams, and architecture state machines.",
    badge: "Flowchart / Mermaid",
    iconName: "Network",
    enabled: true,
    systemPromptModifier: "When asked for flowcharts, diagrams, or visual logic flows, generate clean, valid Mermaid syntax wrapped in ```mermaid ... ``` code blocks. Use modern directional flowcharts (`graph TD` or `flowchart LR`), sequence diagrams, or state diagrams with clear node labels, conditions, and color-coded pathways.",
    outputFormat: "markdown",
    examplePrompt: "Create an interactive flowchart diagram explaining the Binary Search algorithm decision loop",
  },
  {
    id: "canvas-flowchart-design",
    name: "Enterprise SVG Vector Designer",
    mentionKey: "@svg",
    category: "Design",
    description: "Architect high-craft, publication-grade SVG vector diagrams (memory layouts, pointer traces, data structure trees, system architecture) built strictly in the EasyCode Obsidian/Cream design system.",
    badge: "Enterprise SVG",
    iconName: "Layers",
    enabled: true,
    systemPromptModifier: `You are an Enterprise SVG Vector Design Architect. When generating an SVG vector diagram or when @svg is requested:
1. DESIGN SYSTEM & PALETTE (Strictly match EasyCode Obsidian / Cream theme):
   - Background Canvas: Dark mode #1C1B19 (Obsidian Charcoal) with rx="16", or Light mode #FBF9F4 (Warm Cream) with rx="16".
   - Cards / Memory Slots / Nodes: #242321 (dark) or #FFFFFF (light), stroke="#383532" (dark) or #DFDAD0" (light), stroke-width="1.2", rx="8".
   - Primary Text & Values: #EDEDEB (crisp white) in dark mode, #1C1B19 in light mode.
   - Indices & Secondary Labels: #8C877D / #A8A49D (slate neutral).
   - Accents & Highlights: Warm Amber (#F59E0B / #D97706) for active elements, mid pointers, or targets; Emerald (#10B981) for match found / success; Indigo (#6366F1) for boundary markers.
   - Strictly avoid mismatched generic navy/blue backgrounds (e.g. no #0f172a).
2. RESPONSIVE CONTAINER & SIZING:
   - Always specify viewBox="0 0 960 H" where H is calculated dynamically (e.g. 520, 600) based on content.
   - Set width="100%" height="auto" preserveAspectRatio="xMidYMid meet" on root <svg>.
   - Take the entire horizontal space: Array cells and elements should be balanced and fill the container width.
3. SPACING & STRICT VERTICAL TIERS (Strictly prevent overlapping text):
   - For Step-by-Step execution traces (e.g. Binary Search, Two Pointers, Array Traces):
     Every step MUST occupy a 210px vertical band (baseY = 90 + stepIndex * 210):
     * Step Container Card: <rect x="30" y="\${baseY}" width="900" height="190" rx="12" ... />
     * y = baseY + 28: Step Header text ("Step 1: low = 0, high = 9 | mid = 4 (Value = 16)")
     * y = baseY + 54: Explanation / condition subtitle ("Condition: 16 < 23 -> Narrow search to right half")
     * y = baseY + 86: Array index labels "[0]", "[1]", "[2]" ... (font-size="11", fill="#8C877D")
     * y = baseY + 98: Array cell boxes (<rect y="..." height="40" ...>)
     * y = baseY + 124: Array numbers inside boxes (font-size="14", text-anchor="middle")
     * y = baseY + 154: Pointer badges LOW, MID, HIGH (pill rects at y="..." height="22" rx="4", text at y="...")
   - CRITICAL PROHIBITION: NEVER place condition subtitles, index labels [0], and pointer badges at the same Y coordinate! Every tier MUST have distinct vertical separation.
   - Pointer badges (Low, Mid, High) MUST be rendered as rounded pills (rx="4") with sufficient padding so text never collides or overlaps with numbers or lines.
4. VECTOR CRAFT:
   - Typography: font-family="system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif" for headers & labels; font-family="ui-monospace, SFMono-Regular, Menlo, monospace" for array elements, values, and indices.
   - Include <defs> with subtle shadows (<filter id="card-shadow">) and clean arrowheads (<marker id="arrow">).
5. CODE WRAPPING:
   - ALWAYS output the complete standalone SVG wrapped inside a single \`\`\`xml ... \`\`\` code fence.`,
    outputFormat: "svg",
    examplePrompt: "Draw an enterprise SVG diagram showing the step-by-step visual execution trace of Binary Search on [2, 5, 8, 12, 16, 23, 38, 56, 72, 91] searching for target 23",
  },
  {
    id: "testcase-fuzzer",
    name: "Adversarial Test Fuzzer",
    mentionKey: "@testcase-generator",
    category: "Testing",
    description: "Generate comprehensive edge case matrices, integer overflow bounds, empty roots, and stress benchmarks.",
    badge: "Fuzzing",
    iconName: "TestTube2",
    enabled: true,
    systemPromptModifier: "Synthesize an exhaustive adversarial test suite: include empty cases, single elements, negative values, duplicates, max constraints, and cycle loops.",
    outputFormat: "code",
    examplePrompt: "Generate 15 adversarial edge cases for an in-place array rotation algorithm",
  },
  {
    id: "complexity-analyzer",
    name: "Big-O & Formal Proofs",
    mentionKey: "@complexity-analyzer",
    category: "Analysis",
    description: "Derive formal recurrence relations, Master Theorem proofs, and amortized time/space complexity bounds.",
    badge: "Formal Proof",
    iconName: "Rocket",
    enabled: true,
    systemPromptModifier: "Provide formal mathematical asymptotic analysis with recurrence relations, Master Theorem step-by-step breakdown, and tight Big-O / Omega / Theta bounds.",
    outputFormat: "markdown",
    examplePrompt: "Derive the formal mathematical proof and Big-O recurrence for Fast Fourier Transform multiplication",
  },
  {
    id: "system-designer",
    name: "Distributed System Architect",
    mentionKey: "@system-design",
    category: "Engineering",
    description: "Design high-scale distributed systems, LRU caching tiers, microservices, and database partitioning.",
    badge: "Architecture",
    iconName: "Server",
    enabled: true,
    systemPromptModifier: "Provide complete system design architecture: Functional/Non-functional requirements, API schemas, High-level diagram, Data models, Bottleneck mitigations, and Scalability calculations.",
    outputFormat: "markdown",
    examplePrompt: "Design an in-memory distributed cache with O(1) reads, TTL eviction, and thread-safe lock striping",
  },
  {
    id: "spreadsheet-matrix",
    name: "CSV & Test Matrix Generator",
    mentionKey: "@spreadsheet",
    category: "Document",
    description: "Generate CSV spreadsheets, benchmark comparison tables, and dataset fixtures for coding challenges.",
    badge: "CSV / Excel",
    iconName: "FileSpreadsheet",
    enabled: true,
    systemPromptModifier: "Format output as structured CSV data tables and markdown comparison matrices with columns for TestCaseID, Input, ExpectedOutput, TimeTaken, MemoryAllocated, Category.",
    outputFormat: "csv",
    examplePrompt: "Generate a CSV benchmark table comparing Bubble Sort, Quick Sort, and Merge Sort on 10 test sizes",
  },
  {
    id: "create-skill-builder",
    name: "AI Skill Creator & Architect",
    mentionKey: "@create-skill",
    category: "Engineering",
    description: "Architect and generate full configuration for new AI Skills with custom prompt modifiers and output schemas.",
    badge: "Meta Skill",
    iconName: "Wand2",
    enabled: true,
    systemPromptModifier: "Act as an AI Meta-Architect. Help the user construct a new AI Skill specification: Name, @mention shortcut, Target category, Detailed System Prompt Modifier, Output formatting constraints, and Sample Test Prompts.",
    outputFormat: "markdown",
    examplePrompt: "@create-skill for generating SQL indexing and schema migration strategies",
  },
  {
    id: "search-skills-catalog",
    name: "Skills Explorer & Recommendation",
    mentionKey: "@search-skills",
    category: "Analysis",
    description: "Search, discover, and recommend the best skills and prompt modifiers for any algorithm or engineering challenge.",
    badge: "Discovery",
    iconName: "Search",
    enabled: true,
    systemPromptModifier: "Analyze the user's coding problem or requirement and recommend the most effective AI skills, flags, and system modifiers to solve it with maximum quality.",
    outputFormat: "markdown",
    examplePrompt: "@search-skills for building high-concurrency websocket backends",
  },
  {
    id: "code-review-audit",
    name: "Security & Code Quality Audit",
    mentionKey: "@code-review-audit",
    category: "Engineering",
    description: "Scan code for off-by-one errors, memory leaks, concurrency races, security holes, and anti-patterns.",
    badge: "Audit & Security",
    iconName: "ShieldCheck",
    enabled: true,
    systemPromptModifier: "Perform an exhaustive static code audit: identify race conditions, off-by-one bounds, memory leaks, unhandled exceptions, and time complexity traps.",
    outputFormat: "markdown",
    examplePrompt: "@code-review-audit on the provided binary search and two-pointer implementation",
  },
  {
    id: "refactor-clean",
    name: "Clean Code & SOLID Refactor",
    mentionKey: "@refactor-clean",
    category: "Engineering",
    description: "Refactor code into production-grade, modular, idiomatic patterns with clean separation of concerns.",
    badge: "Refactoring",
    iconName: "Code2",
    enabled: true,
    systemPromptModifier: "Refactor the provided code according to clean code principles: eliminate duplicate logic, improve variable naming, extract reusable helpers, and enforce modular typing.",
    outputFormat: "code",
    examplePrompt: "@refactor-clean this Monotonic Stack implementation into modular Python 3 classes",
  },
  {
    id: "git-commit-pr",
    name: "Git Commit & PR Generator",
    mentionKey: "@git-commit-pr",
    category: "Document",
    description: "Generate Conventional Commits, PR descriptions with test plans, and release notes.",
    badge: "Git & PR",
    iconName: "Terminal",
    enabled: true,
    systemPromptModifier: "Generate Conventional Commits format (feat/fix/refactor/perf) with atomic breakdown, detailed Pull Request description, Summary of Changes, and Test Verification Matrix.",
    outputFormat: "markdown",
    examplePrompt: "@git-commit-pr for the LRU Cache implementation with O(1) eviction",
  },
  {
    id: "interactive-quiz",
    name: "Algorithm Quiz & Interview Drill",
    mentionKey: "@interactive-quiz",
    category: "Testing",
    description: "Create interactive multiple-choice questions, edge-case drills, and mock technical interview questions.",
    badge: "Interview Drill",
    iconName: "Sparkles",
    enabled: true,
    systemPromptModifier: "Construct 4 interactive interview quiz questions: Multiple Choice Question with subtle traps, Detailed Explanations for correct/incorrect answers, and invariant tests.",
    outputFormat: "markdown",
    examplePrompt: "@interactive-quiz on Dijkstra vs Bellman-Ford algorithm trade-offs",
  },
  {
    id: "formal-math-latex",
    name: "KaTeX Math Proof & Invariants",
    mentionKey: "@math-latex",
    category: "Analysis",
    description: "Derive rigorous mathematical proofs, loop invariants, and asymptotic recurrences formatted with KaTeX LaTeX.",
    badge: "LaTeX Math",
    iconName: "Rocket",
    enabled: true,
    systemPromptModifier: "Format all mathematical formulas using KaTeX LaTeX ($...$ inline and $$...$$ display). Derive formal inductive steps, loop invariants, and Master Theorem cases.",
    outputFormat: "markdown",
    examplePrompt: "@math-latex prove the optimality of Huffman coding and derive recurrence equations",
  },
];

export const DEFAULT_AI_RULES: AiRule[] = [
  {
    id: "strict-typing",
    title: "Enforce Strict Typing & Annotations",
    description: "Always include explicit type hints for parameters and return types across Python, TypeScript, and Java.",
    category: "Coding",
    ruleText: "All generated code must contain strict type annotations (e.g. Python type hints `def solve(nums: List[int]) -> int:`, TypeScript strict interfaces).",
    enabled: true,
    isBuiltIn: true,
  },
  {
    id: "optimal-space",
    title: "Prioritize In-Place & O(1) Space",
    description: "Target minimal auxiliary memory allocations and prioritize in-place pointer manipulation where feasible.",
    category: "Complexity",
    ruleText: "Whenever possible, prefer in-place state manipulation or rolling variables to minimize auxiliary memory to O(1).",
    enabled: true,
    isBuiltIn: true,
  },
  {
    id: "docstrings-and-invariants",
    title: "Explain Algorithmic Invariants in Docstrings",
    description: "Include a concise 2-3 line docstring at the top of functions stating the mathematical invariant.",
    category: "Documentation",
    ruleText: "Include a clean docstring for every solution stating: Core Intuition, Mathematical Invariant, Time Complexity, and Space Complexity.",
    enabled: true,
    isBuiltIn: true,
  },
  {
    id: "clean-identifiers",
    title: "Descriptive & Production Variable Names",
    description: "Avoid cryptic single-letter variables except for standard loop indices `i, j, k`.",
    category: "Coding",
    ruleText: "Use descriptive variable names (e.g. `left_pointer`, `prefix_sum`, `visited_nodes`) instead of ambiguous abbreviations.",
    enabled: true,
    isBuiltIn: true,
  },
  {
    id: "enterprise-svg-rule",
    title: "Enterprise SVG Vector Diagrams (Theme & Strict Tiers)",
    description: "When asked for a visual trace, memory layout, array state, pointer diagram, or visual representation, generate a standalone SVG in the EasyCode Obsidian/Cream theme. If not asked for visual diagrams, do not generate SVG.",
    category: "Design",
    ruleText: "VISUAL SVG RULE: When the user asks for a visual trace, memory layout, array state, pointer diagram, or visual representation (with or without @svg), construct an Enterprise SVG in the EasyCode Obsidian/Cream theme (#1C1B19, #242321, #383532, #F59E0B) with strict 190px vertical tiers and zero overlapping text. If not asked for visual representation, do NOT output SVG code.",
    enabled: true,
    isBuiltIn: true,
  },
  {
    id: "interactive-flowchart-rule",
    title: "Interactive Mermaid Flowcharts (Decision Trees)",
    description: "When asked for a flowchart, decision tree, branching logic, or architecture overview, generate a valid Mermaid diagram with quoted labels. If not asked, do not generate flowcharts.",
    category: "Design",
    ruleText: "FLOWCHART RULE: When the user asks for a flowchart, decision tree, branching logic, state machine, or system architecture (with or without @flowchart), construct a valid Mermaid diagram (flowchart TD/LR) with every label enclosed in double quotes. If not asked, do NOT output Mermaid code.",
    enabled: true,
    isBuiltIn: true,
  },
];
