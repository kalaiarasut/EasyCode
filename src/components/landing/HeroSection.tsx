"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence, useInView } from "framer-motion";
import {
  Brain,
  ChevronRight,
  ChevronDown,
  Sparkles,
  Plus,
  Network,
  Copy,
  Check,
  FileCode,
  ArrowUp,
  Mic,
  RotateCcw,
  Share2,
  Search,
  FolderKanban,
  Settings,
  BookOpen,
  Zap,
  TestTube2,
  Globe,
  X,
  ImageIcon,
  Paperclip,
  Code2,
  Activity,
  Film,
  Video,
  Layers,
  Wand2,
  CheckCircle2,
  Volume2,
  Cpu
} from "lucide-react";

/* ─── Rich Session Catalog Matching EasyCode High-Craft Theme ─── */

interface SessionData {
  id: string;
  sidebarTitle: string;
  sidebarTime: string;
  prompt: string;
  model: string;
  mediaEngine: string;
  thinkingTrace: string;
  step1: { title: string; text: string; mathTag?: string };
  step2: { title: string; text: string; mathTag?: string };
  mermaidGraph?: {
    title: string;
    type: "lis" | "graph";
  };
  svgData?: {
    title: string;
    input: string;
    items: Array<{ label: string; value: string; isHighlighted?: boolean }>;
    summary: string;
  };
  codeSnippet?: {
    lang: string;
    title: string;
    code: string;
  };
}

const SESSIONS: SessionData[] = [
  {
    id: "session-lis",
    sidebarTitle: "explain LIS patience sort with SVG",
    sidebarTime: "12m ago",
    prompt:
      "Explain Problem #300: Longest Increasing Subsequence with step-by-step intuition, an interactive Mermaid flowchart of the binary search patience sorting logic, and an animated vector SVG diagram of the state array transitions.",
    model: "Claude 3.7 Sonnet",
    mediaEngine: "Vector SVG Studio",
    thinkingTrace: `1. Analyzing Problem #300: Longest Increasing Subsequence (LIS).
2. Standard DP: dp[i] = max(dp[j] + 1) for j < i -> Time Complexity O(n²), Space O(n).
3. Optimizing via Patience Sorting + Binary Search (std::lower_bound):
   - Maintain auxiliary array 'tails' where tails[i] stores the smallest tail of all increasing subsequences of length i+1.
   - For each num: binary search in 'tails'. If num > all elements, append; else replace first element >= num.
   - Time Complexity: O(n log n), Space Complexity: O(n).
4. Generating interactive Mermaid flowchart & vector SVG state transition array.`,
    step1: {
      title: "Step 1 (The Optimal Subsequence Invariant)",
      text: "Standard dynamic programming stores the LIS ending at each index with quadratic complexity. By observing that smaller tails allow easier extension, we maintain only the minimal tail for each subsequence length.",
      mathTag: "O(n²)"
    },
    step2: {
      title: "Step 2 (Patience Sorting & Binary Search)",
      text: "For each incoming number, we binary search in tails array. Because tails is strictly increasing, binary search takes O(log n) time per element, achieving optimal total runtime.",
      mathTag: "O(n log n)"
    },
    mermaidGraph: {
      title: "Mermaid Flowchart: Binary Search Patience Sort Routing",
      type: "lis"
    },
    svgData: {
      title: "Vector SVG Visualizer: State Array Progression",
      input: "Input: nums = [10, 9, 2, 5, 3, 7, 101, 18]",
      items: [
        { label: "idx 0", value: "2" },
        { label: "idx 1", value: "3" },
        { label: "idx 2", value: "7" },
        { label: "idx 3", value: "18", isHighlighted: true }
      ],
      summary: "✓ LIS Length = 4 (O(n log n))"
    }
  },
  {
    id: "session-graph",
    sidebarTitle: "explain Graph Shortest Path with Portals",
    sidebarTime: "Yesterday",
    prompt:
      "Explain Dijkstra's Algorithm with Teleportation Portals & Priority Queue state transitions with an interactive Mermaid state diagram and augmented graph intuition.",
    model: "DeepSeek R1",
    mediaEngine: "Kling 1.5 Video AI",
    thinkingTrace: `1. Formulating Multi-Layer Shortest Path with K Teleportation Portals.
2. State Space: (u, k) where u is vertex and k is remaining teleportation budget.
3. State Transitions:
   - Standard Edge: (u, k) -> (v, k) with weight w(u, v).
   - Teleport Edge: (u, k) -> (v, k - 1) with weight 0 (when k > 0).
4. Running Dijkstra on 2D state graph: O((V * K + E * K) log(V * K)).`,
    step1: {
      title: "Step 1 (Augmented Multi-Layer State Graph)",
      text: "We replicate the graph into K + 1 layers. Standard edges connect vertices within the same layer, while teleportation directed edges transition down from layer k to layer k - 1 at zero weight cost.",
      mathTag: "G' = (V × [0..K], E')"
    },
    step2: {
      title: "Step 2 (Priority Queue State Relaxation)",
      text: "A min-heap tracks distance tuples (dist, u, k). When popping the minimum distance, we relax both standard neighbor edges and all available zero-cost teleport jumps.",
      mathTag: "O((V·K + E·K) log(V·K))"
    },
    mermaidGraph: {
      title: "Mermaid State Machine: 2-Layer Dijkstra & Zero-Cost Teleport",
      type: "graph"
    },
    codeSnippet: {
      lang: "python",
      title: "Augmented State Dijkstra Implementation",
      code: `import heapq

def shortestPathWithPortals(n, edges, portals, start, target, K):
    adj = {i: [] for i in range(n)}
    for u, v, w in edges:
        adj[u].append((v, w))
    
    # dist[u][k] = shortest distance to u with k teleports remaining
    dist = [[float('inf')] * (K + 1) for _ in range(n)]
    dist[start][K] = 0
    pq = [(0, start, K)] # (cost, node, teleports_left)
    
    while pq:
        d, u, k = heapq.heappop(pq)
        if d > dist[u][k]:
            continue
        if u == target:
            return d
            
        # 1. Standard edge transitions (within same layer k)
        for v, w in adj[u]:
            if d + w < dist[v][k]:
                dist[v][k] = d + w
                heapq.heappush(pq, (d + w, v, k))
                
        # 2. Teleport portal transitions (down to layer k - 1, cost 0)
        if k > 0:
            for v in portals.get(u, []):
                if d < dist[v][k - 1]:
                    dist[v][k - 1] = d
                    heapq.heappush(pq, (d, v, k - 1))
                    
    return -1`
    }
  },
  {
    id: "session-dp-grid",
    sidebarTitle: "generate a new problem on DP Grid",
    sidebarTime: "Yesterday",
    prompt:
      "Generate a Hard Dynamic Programming challenge on grid path optimization with obstacle costs, diagonal leaps, and sandboxed test cases.",
    model: "Gemini 3.6 Flash",
    mediaEngine: "FLUX.1 Schnell",
    thinkingTrace: `1. Problem Synthesis: "Quantum Grid Path Optimization"
2. Grid Dimensions: M x N with obstacles having positive decay penalties.
3. Movement rules: Down (1, 0), Right (0, 1), Diagonal Jump (2, 2) costing jumpCost.
4. Dynamic Programming Recurrence:
   dp[i][j] = min(dp[i-1][j], dp[i][j-1], dp[i-2][j-2] + jumpCost) + grid[i][j]
5. Generating sample test cases, constraints, and sandboxed Python solver.`,
    step1: {
      title: "Problem #3482: Quantum Grid Path Optimization",
      text: "You are given an m x n integer matrix grid and an integer jumpCost. Return the minimum cost to travel from (0, 0) to (m - 1, n - 1) allowing single orthogonal steps or 2x2 diagonal quantum leaps.",
      mathTag: "dp[i][j] = min(dp[i-1][j], dp[i][j-1], dp[i-2][j-2] + jumpCost) + grid[i][j]"
    },
    step2: {
      title: "Constraints & Multi-Language Verification",
      text: "Constraints: 2 <= m, n <= 500, -100 <= grid[i][j] <= 100. Time limit 1.0s, memory limit 256MB. Sandboxed multi-language test suite verified across 60 edge cases.",
      mathTag: "O(m × n) Time, O(n) Space"
    },
    svgData: {
      title: "Matrix Path Transition & Diagonal Leap Progression",
      input: "Input: grid = [[1,3,1],[1,5,1],[4,2,1]], jumpCost = 2",
      items: [
        { label: "(0,0) Start", value: "1" },
        { label: "(1,0) Step", value: "2" },
        { label: "(1,1) Step", value: "7" },
        { label: "(2,2) Min Target", value: "7", isHighlighted: true }
      ],
      summary: "✓ Optimal Path: (0,0) -> (1,0) -> (1,1) -> (2,2) = 7"
    }
  },
  {
    id: "session-bsearch",
    sidebarTitle: "explain binary search with precision",
    sidebarTime: "Yesterday",
    prompt:
      "Explain Binary Search on continuous floating point intervals with epsilon precision termination, monotonic function inversion, and edge cases.",
    model: "Claude 3.7 Sonnet",
    mediaEngine: "Runway Gen-3 Video",
    thinkingTrace: `1. Binary Search over Real Numbers (Float Interval [L, R]).
2. Loop Termination Conditions:
   - Condition A: high - low > eps (e.g. eps = 1e-9).
   - Condition B: Fixed iteration count (e.g. 100 iterations provides 2^-100 ≈ 7.8e-31 precision).
3. Analyzing IEEE 754 precision loss and subnormal float edge cases.`,
    step1: {
      title: "Step 1 (Real-Domain Monotonic Inversion)",
      text: "When solving f(x) = C for continuous monotonic f, we do not check mid == target due to floating point rounding. Instead, we halve the interval until the interval width is strictly below tolerance epsilon.",
      mathTag: "|high - low| < 10⁻⁹"
    },
    step2: {
      title: "Step 2 (The 100-Iteration Fixed Loop Pattern)",
      text: "Running exactly 100 iterations avoids precision pitfalls with subnormal floats while reducing interval width by 2¹⁰⁰ ≈ 1.26 × 10³⁰, guaranteeing machine-level precision across all platforms.",
      mathTag: "Iterations = 100 ⟹ Error ≤ (R - L) / 2¹⁰⁰"
    },
    svgData: {
      title: "Floating-Point Interval Convergence Vector Visualizer",
      input: "Input: f(x) = x³ + 2x - 5 = 0 on search range [1.0, 2.0]",
      items: [
        { label: "Iter 0", value: "[1.0, 2.0]" },
        { label: "Iter 10", value: "±10⁻³" },
        { label: "Iter 30", value: "±10⁻⁹" },
        { label: "Iter 100", value: "1.328268", isHighlighted: true }
      ],
      summary: "✓ Root Found: x ≈ 1.3282688556950003 (Error < 1e-15)"
    }
  }
];

const SKILL_CHIPS = [
  { label: "@slides", sub: "PPT / HTML" },
  { label: "@pdf-report", sub: "PDF Spec" },
  { label: "@docx", sub: "DOCX" },
  { label: "@flowchart", sub: "Flowchart / Mermaid" },
  { label: "@svg-vector", sub: "SVG Generator" },
];

const QUICK_ACTIONS = [
  { label: "Generate Problem", icon: Sparkles, prompt: "Generate a Hard Dynamic Programming problem with matrix obstacles and edge test cases" },
  { label: "Explain Algorithm", icon: BookOpen, prompt: "Explain Dijkstra algorithm with priority queue relaxation and step-by-step diagrams" },
  { label: "Test Cases & Edge Cases", icon: TestTube2, prompt: "Construct comprehensive adversarial test cases for sliding window maximum" },
  { label: "Optimize Time & Space", icon: Zap, prompt: "Optimize 2-Sum problem from quadratic O(N^2) to single pass linear O(N) hash map" },
  { label: "System Design", icon: Settings, prompt: "Design a distributed real-time code execution sandbox like Judge0 with Redis queuing" },
];

const CATEGORY_PROMPTS: Record<string, string[]> = {
  "Generate Problem": [
    "Create a Hard Dynamic Programming challenge on grid path optimization with obstacle costs",
    "Generate a Graph Shortest Path problem with dynamic obstacle weights and teleportation portals",
    "Design a custom Trie-based autocomplete problem with real-time prefix frequency ranking",
    "Construct an Interactive Binary Search problem with real-world floating point precision edge cases",
  ],
  "Explain Algorithm": [
    "Explain Dijkstra's algorithm with priority queue relaxation and step-by-step visual diagrams",
    "Deep-dive into Monotonic Stack mechanics with Next Greater Element visual state traces",
    "Explain Red-Black Tree balancing rules with left/right color rotation step walkthroughs",
    "Break down A* pathfinding heuristic calculations compared to standard Breadth-First Search",
  ],
  "Test Cases & Edge Cases": [
    "Generate adversarial stress-test cases for sliding window maximum with large duplicates",
    "Construct edge cases for Graph Cycle Detection including self-loops and disconnected components",
    "Build comprehensive boundary test suites for 64-bit integer overflow and empty arrays",
    "Create fuzzing test inputs for Interval Merging with nested and zero-length ranges",
  ],
  "Optimize Time & Space": [
    "Optimize 2-Sum problem from quadratic O(N²) brute force to single-pass linear O(N) hash map",
    "Refactor Recursive Fibonacci with memoization and O(1) space matrix exponentiation",
    "Reduce Space Complexity of Longest Common Subsequence from 2D O(M×N) to 1D O(min(M,N))",
    "Optimize Prime Factorization from trial division O(√N) to Sieve of Eratosthenes O(N log log N)",
  ],
  "System Design": [
    "Design a distributed real-time code execution sandbox like Judge0 with Redis job queuing",
    "Architect an ultra low-latency Global Leaderboard system using Redis Sorted Sets and Sharding",
    "Design a scalable URL Shortener with 100K QPS, write-ahead logging, and distributed caching",
    "Architect a real-time collaborative code editor with Operational Transformation (OT) / CRDTs",
  ],
};

const AVAILABLE_MODELS = [
  { name: "Claude Opus 5", provider: "Anthropic", desc: "Top-Tier Agentic Reasoning & Code", badge: "Reasoning", icon: Sparkles },
  { name: "GPT-5.6 Sol", provider: "OpenAI", desc: "Flagship Maximum Reasoning", badge: "Flagship", icon: Cpu },
  { name: "GPT-5.6 Terra", provider: "OpenAI", desc: "Balanced Everyday Intelligence", badge: "Balanced", icon: Brain },
  { name: "GPT-5.6 Luna", provider: "OpenAI", desc: "High-Speed Cost-Effective", badge: "Fast", icon: Zap },
  { name: "Gemini 3.7 Flash", provider: "Google", desc: "Ultra Fast 1M Context Workhorse", badge: "Speed", icon: Zap },
  { name: "DeepSeek R2", provider: "DeepSeek", desc: "800B MoE Open Reasoning Chain", badge: "Thinking", icon: Brain },
  { name: "Claude Sonnet 5", provider: "Anthropic", desc: "Fast Hybrid Coding & Analysis", badge: "Code", icon: Code2 },
  { name: "o3-pro", provider: "OpenAI", desc: "Extended Math & Code Reasoning", badge: "Math/Code", icon: Code2 },
];

const AVAILABLE_MEDIA_MODELS = [
  { name: "ChatGPT Images 2.0", type: "Image", provider: "OpenAI", desc: "Photorealistic Compositional Imagery", icon: ImageIcon },
  { name: "Midjourney v7", type: "Image", provider: "Midjourney", desc: "Editorial & Artistic Quality", icon: Wand2 },
  { name: "Claude Design", type: "Image", provider: "Anthropic", desc: "Brand-Consistent Generative Design", icon: Layers },
  { name: "Google Veo 3.1", type: "Video", provider: "Google", desc: "Photorealistic Video Generation", icon: Film },
  { name: "Seedance 2.0", type: "Video", provider: "ByteDance", desc: "Cinematic Multi-Shot Narrative", icon: Video },
  { name: "FLUX.1 Schnell", type: "Image", provider: "Black Forest Labs", desc: "Ultra-Fast Image Synthesis", icon: ImageIcon },
  { name: "Runway Gen-3 Alpha", type: "Video", provider: "Runway", desc: "Cinematic Motion Control", icon: Film },
];

export default function HeroSection({ onOpenDemo }: { onOpenDemo?: () => void }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const feedRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, amount: 0.2 });

  // Navigation & Session state
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [searchFilter, setSearchFilter] = useState("");

  // Generation & simulation state
  const [phase, setPhase] = useState<
    "workspace" | "typing" | "thinking" | "explanation" | "flowchart" | "svg" | "completed"
  >("workspace");

  const [typedPrompt, setTypedPrompt] = useState("");
  const [isPromptDone, setIsPromptDone] = useState(false);
  const [isThinkingOpen, setIsThinkingOpen] = useState(true);
  const [isCopied, setIsCopied] = useState(false);
  const [shareToast, setShareToast] = useState(false);

  // Interactive Prompt Box State
  const [customInput, setCustomInput] = useState("");
  const [selectedModel, setSelectedModel] = useState("Claude Opus 5");
  const [selectedMediaEngine, setSelectedMediaEngine] = useState("ChatGPT Images 2.0");
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [activeCategory, setActiveCategory] = useState("Generate Problem");

  // Dropdown open states — header vs toolbar isolated
  const [isHeaderModelOpen, setIsHeaderModelOpen] = useState(false);
  const [isToolbarModelOpen, setIsToolbarModelOpen] = useState(false);
  const [isToolbarMediaOpen, setIsToolbarMediaOpen] = useState(false);
  const [isPlusMenuOpen, setIsPlusMenuOpen] = useState(false);
  const [modelSearch, setModelSearch] = useState("");
  const [mediaSearch, setMediaSearch] = useState("");
  // Generated chat session model states
  const [genChatModelOpen, setGenChatModelOpen] = useState(false);
  const [genChatMediaOpen, setGenChatMediaOpen] = useState(false);
  const [genChatModelSearch, setGenChatModelSearch] = useState("");

  const closeAllDropdowns = () => {
    setIsHeaderModelOpen(false);
    setIsToolbarModelOpen(false);
    setIsToolbarMediaOpen(false);
    setIsPlusMenuOpen(false);
    setGenChatModelOpen(false);
    setGenChatMediaOpen(false);
  };

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && !target.closest("[data-dropdown-container]")) {
        closeAllDropdowns();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const activeSession = SESSIONS.find((s) => s.id === activeSessionId) || SESSIONS[0];

  // 1. Viewport Trigger: Start typing ONLY when scrolled into view
  useEffect(() => {
    if (!isInView) return;
    if (activeSessionId !== null) return;

    const startTimer = setTimeout(() => {
      setPhase("typing");
    }, 1800);

    return () => clearTimeout(startTimer);
  }, [isInView, activeSessionId]);

  // 2. Typewriter Effect when phase === "typing"
  useEffect(() => {
    if (phase !== "typing") return;

    let charIdx = 0;
    setTypedPrompt("");
    setIsPromptDone(false);

    const promptToType = activeSession.prompt;

    const timer = setInterval(() => {
      if (charIdx < promptToType.length) {
        setTypedPrompt(promptToType.slice(0, charIdx + 1));
        charIdx++;
      } else {
        clearInterval(timer);
        setIsPromptDone(true);
        setTimeout(() => {
          setPhase("thinking");
          setIsThinkingOpen(true);
        }, 500);
      }
    }, 16);

    return () => clearInterval(timer);
  }, [phase, activeSession.prompt]);

  // 3. Stage Progression (Auto closes thinking block when done)
  useEffect(() => {
    if (phase === "thinking") {
      const t = setTimeout(() => {
        setIsThinkingOpen(false);
        setPhase("explanation");
      }, 1500);
      return () => clearTimeout(t);
    }
    if (phase === "explanation") {
      const t = setTimeout(() => {
        setPhase("flowchart");
      }, 1200);
      return () => clearTimeout(t);
    }
    if (phase === "flowchart") {
      const t = setTimeout(() => {
        setPhase("svg");
      }, 1200);
      return () => clearTimeout(t);
    }
    if (phase === "svg") {
      const t = setTimeout(() => {
        setPhase("completed");
      }, 800);
      return () => clearTimeout(t);
    }
  }, [phase]);

  // 4. Auto-scrolling as new content streams in
  useEffect(() => {
    if (feedRef.current) {
      feedRef.current.scrollTo({
        top: feedRef.current.scrollHeight,
        behavior: "smooth"
      });
    }
  }, [phase, activeSessionId, isThinkingOpen]);

  const handleCopy = () => {
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleShare = () => {
    setShareToast(true);
    setTimeout(() => setShareToast(false), 2500);
  };

  const handleSelectSession = (sessionId: string) => {
    setActiveSessionId(sessionId);
    setPhase("completed");
    setIsThinkingOpen(false);
  };

  const handleNewChallenge = () => {
    setActiveSessionId(null);
    setPhase("workspace");
    setTypedPrompt("");
    setIsPromptDone(false);
    setIsThinkingOpen(false);
    setCustomInput("");
  };

  const handleCustomSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!customInput.trim()) return;

    setTypedPrompt(customInput);
    setIsPromptDone(true);
    setPhase("thinking");
    setIsThinkingOpen(true);
    setCustomInput("");
  };

  const filteredHistory = SESSIONS.filter((s) =>
    s.sidebarTitle.toLowerCase().includes(searchFilter.toLowerCase())
  );

  const isGenerating = phase !== "workspace" && phase !== "typing";

  return (
    <section
      ref={containerRef}
      className="relative min-h-[92vh] pt-24 pb-16 overflow-hidden flex flex-col justify-between font-sans"
    >
      {/* ATMOSPHERIC BACKGROUND VISTA */}
      <div className="absolute inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#F9F7F1] via-[#F4EFE6] to-[#EAE3D2] dark:from-[#171614] dark:via-[#1A1917] dark:to-[#121110] transition-colors duration-500" />

        <div className="absolute bottom-0 left-0 right-0 w-full h-[450px] opacity-70 dark:opacity-40">
          <svg
            className="w-full h-full object-cover object-bottom"
            viewBox="0 0 1440 450"
            fill="none"
            preserveAspectRatio="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M0 240L140 180L320 270L540 150L760 250L980 140L1180 230L1340 170L1440 220V450H0V240Z"
              fill="url(#distantPeaks)"
              opacity="0.5"
            />
            <path
              d="M0 310L190 230L380 320L620 210L860 300L1080 190L1290 280L1440 240V450H0V310Z"
              fill="url(#midPeaks)"
              opacity="0.75"
            />
            <path
              d="M0 380L120 320L280 390L480 310L680 380L920 290L1140 370L1320 320L1440 360V450H0V380Z"
              fill="url(#foregroundRock)"
            />
            <defs>
              <linearGradient id="distantPeaks" x1="720" y1="140" x2="720" y2="450" gradientUnits="userSpaceOnUse">
                <stop stopColor="#CFC6B4" stopOpacity="0.4" />
                <stop offset="1" stopColor="#EAE3D2" stopOpacity="0.9" />
              </linearGradient>
              <linearGradient id="midPeaks" x1="720" y1="190" x2="720" y2="450" gradientUnits="userSpaceOnUse">
                <stop stopColor="#B3A894" stopOpacity="0.6" />
                <stop offset="1" stopColor="#D9D0BE" stopOpacity="0.95" />
              </linearGradient>
              <linearGradient id="foregroundRock" x1="720" y1="290" x2="720" y2="450" gradientUnits="userSpaceOnUse">
                <stop stopColor="#8A7E6B" stopOpacity="0.7" />
                <stop offset="1" stopColor="#C4BAA7" stopOpacity="1" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        <div className="absolute bottom-0 inset-x-0 h-32 bg-gradient-to-t from-[#FBF9F4] dark:from-[#1C1B19] to-transparent" />
      </div>

      {/* HERO HEADLINE & COPY */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center space-y-6 pt-6">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-black/[0.03] dark:bg-white/[0.05] border border-black/[0.08] dark:border-white/[0.08] text-xs text-neutral-700 dark:text-neutral-300 font-mono shadow-2xs backdrop-blur-xs"
        >
          <span className="text-neutral-400 dark:text-neutral-500">—</span>
          <span className="font-sans font-medium text-neutral-800 dark:text-neutral-200">
            Now in public beta
          </span>
          <span className="text-neutral-400 dark:text-neutral-500">•</span>
          <span className="text-neutral-600 dark:text-neutral-400">
            3,500+ LeetCode problems & 20+ frontier AI models
          </span>
          <span className="text-neutral-400 dark:text-neutral-500">—</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-4xl sm:text-6xl md:text-7xl font-sans font-bold tracking-tight text-[#1C1B19] dark:text-[#F3F2F0] leading-[1.08] max-w-4xl mx-auto"
        >
          Master algorithms & code{" "}
          <br className="hidden sm:inline" />
          <span className="font-serif italic font-normal text-[#38332B] dark:text-[#E8E4DB]">
            with AI that thinks with you.
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-sm sm:text-base md:text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto leading-relaxed font-normal"
        >
          EasyCode unites 3,500+ LeetCode challenges, Monaco-powered multi-language execution in C, C++, Java, Python, and JS via JudgeAPI, and 20+ frontier AI reasoning models to accelerate your technical interview prep.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-wrap items-center justify-center gap-4 pt-2"
        >
          <Link
            href="/problems"
            className="group px-5 py-2.5 rounded-xl bg-[#1C1B19] text-white dark:bg-white dark:text-[#1C1B19] font-medium text-xs sm:text-sm hover:opacity-90 transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <span>Start practicing now</span>
            <span className="transition-transform group-hover:translate-x-0.5">›</span>
          </Link>

          <Link
            href="/workspace"
            className="group px-3 py-2 text-neutral-800 dark:text-neutral-200 underline underline-offset-4 decoration-neutral-400 dark:decoration-neutral-500 hover:text-neutral-950 dark:hover:text-white font-medium text-xs sm:text-sm transition-colors flex items-center gap-1 cursor-pointer"
          >
            <span>Launch AI Workspace</span>
            <span className="transition-transform group-hover:translate-x-0.5">›</span>
          </Link>
        </motion.div>
      </div>

      {/* ════════════════════════════════════════════════════════════════════════
          SHOWCASE: EXACT 100% REPLICA OF AiWorkspace.tsx
          ════════════════════════════════════════════════════════════════════════ */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 w-full pt-10 relative">
        {/* Share Toast */}
        <AnimatePresence>
          {shareToast && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-12 right-12 z-50 px-4 py-2 rounded-xl bg-neutral-900 text-white text-xs font-medium shadow-2xl flex items-center gap-2 border border-neutral-700"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Workspace session link copied to clipboard!</span>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="rounded-2xl bg-[#FBF9F4] dark:bg-[#1C1B19] border border-[#DFDAD0] dark:border-[#383532] shadow-2xl overflow-hidden text-[#1C1B19] dark:text-[#EDEDEB] transition-colors duration-300"
        >
          {/* ─── TOP HEADER BAR ─── */}
          <div className="h-13 px-4 sm:px-6 border-b border-[#DFDAD0] dark:border-[#2D2A26] bg-[#FBF9F4] dark:bg-[#1C1B19] flex items-center justify-between select-none">
            {/* Left: Brand Logo + Model Breadcrumb Dropdown */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleNewChallenge}
                className="flex items-center gap-2 font-bold text-sm tracking-tight text-[#1A1918] dark:text-[#F3F2F0] cursor-pointer"
              >
                <div className="w-7 h-7 rounded-lg bg-[#1C1B19] dark:bg-white flex items-center justify-center text-white dark:text-[#1C1B19] shadow-xs font-mono font-bold text-xs">
                  E
                </div>
                <span className="hidden sm:inline">EasyCode</span>
              </button>

              <span className="text-[#C5C2BA] dark:text-[#524E48] mx-1">/</span>

              {/* Model breadcrumb pill */}
              <div className="relative" data-dropdown-container="true">
                <button
                  type="button"
                  onClick={() => {
                    const next = !isHeaderModelOpen;
                    closeAllDropdowns();
                    setIsHeaderModelOpen(next);
                    setModelSearch("");
                  }}
                  className="flex items-center gap-1.5 text-xs font-medium text-[#7A756C] dark:text-[#A8A49D] hover:text-black dark:hover:text-white transition-colors cursor-pointer px-2 py-1 rounded-md hover:bg-black/[0.03] dark:hover:bg-white/[0.04]"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                  <span>{selectedModel}</span>
                  <ChevronDown className="w-3 h-3 opacity-60" />
                </button>

                {/* Model Dropdown Menu - Exact ProblemPageAiTab Replica */}
                {isHeaderModelOpen && (
                  <div className="absolute left-0 top-full mt-1.5 w-72 rounded-xl bg-white dark:bg-[#222222] border border-neutral-200 dark:border-neutral-800 shadow-2xl z-[9999] overflow-hidden">
                    <div className="p-2 border-b border-black/[0.06] dark:border-white/[0.06]">
                      <div className="relative">
                        <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-neutral-400" />
                        <input
                          type="text"
                          value={modelSearch}
                          onChange={(e) => setModelSearch(e.target.value)}
                          placeholder="Search available models..."
                          className="w-full pl-8 pr-2.5 py-1.5 text-xs rounded-lg bg-black/[0.03] dark:bg-white/[0.04] border border-black/[0.05] dark:border-white/[0.06] outline-hidden text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400"
                          autoFocus
                        />
                      </div>
                    </div>

                    <div className="max-h-60 overflow-y-auto p-1.5 space-y-0.5">
                      {AVAILABLE_MODELS.filter((m) => {
                        if (!modelSearch.trim()) return true;
                        const q = modelSearch.toLowerCase();
                        return m.name.toLowerCase().includes(q) || m.provider.toLowerCase().includes(q) || m.desc.toLowerCase().includes(q);
                      }).map((m) => {
                        const isSelected = selectedModel === m.name;
                        return (
                          <button
                            key={m.name}
                            onClick={() => {
                              setSelectedModel(m.name);
                              setIsHeaderModelOpen(false);
                            }}
                            className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                              isSelected
                                ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 font-medium"
                                : "hover:bg-black/[0.04] dark:hover:bg-white/[0.06] text-neutral-700 dark:text-neutral-300"
                            }`}
                          >
                            <div className="flex items-center gap-2 truncate">
                              <m.icon className="w-3.5 h-3.5 shrink-0 text-current" />
                              <div className="flex flex-col text-left truncate">
                                <span className="truncate">{m.name}</span>
                                <span className={`text-[10px] truncate ${isSelected ? "opacity-75" : "text-neutral-400"}`}>
                                  {m.provider} • {m.desc}
                                </span>
                              </div>
                            </div>
                            {isSelected && <Check className="w-3.5 h-3.5 shrink-0 text-current ml-1" />}
                          </button>
                        );
                      })}
                    </div>

                    <div className="p-1.5 border-t border-black/[0.06] dark:border-white/[0.06] bg-black/[0.02] dark:bg-white/[0.02]">
                      <div className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium text-neutral-500 dark:text-neutral-400">
                        <div className="flex items-center gap-1.5">
                          <Settings className="w-3.5 h-3.5 text-neutral-400" />
                          <span>Configure API Keys in Settings</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleNewChallenge}
                className="p-1.5 rounded-lg border border-[#DCD7CC] dark:border-[#3A3733] bg-white/60 dark:bg-white/[0.03] text-[#4A4640] dark:text-[#C5C2BA] hover:text-black dark:hover:text-white transition-colors cursor-pointer shadow-2xs"
                title="Restart & Return to Home"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={handleShare}
                className="text-xs font-medium px-3 py-1.5 rounded-lg border border-[#DCD7CC] dark:border-[#3A3733] bg-white/60 dark:bg-white/[0.03] text-[#4A4640] dark:text-[#C5C2BA] shadow-2xs flex items-center gap-1.5 cursor-pointer hover:text-black dark:hover:text-white"
              >
                <Share2 className="w-3.5 h-3.5 opacity-70" />
                <span className="hidden sm:inline">Share</span>
              </button>

              <div className="w-7 h-7 rounded-lg bg-[#3A3733] text-white dark:bg-white dark:text-[#1C1B19] flex items-center justify-center text-xs font-semibold shadow-xs">
                K
              </div>
            </div>
          </div>

          {/* ─── MAIN BODY: SIDEBAR + CONTENT ─── */}
          <div className="flex min-h-[520px]">
            {/* ─── LEFT SIDEBAR ─── */}
            <div className="hidden lg:flex flex-col w-[200px] shrink-0 border-r border-[#DFDAD0] dark:border-[#2D2A26] bg-[#FBF9F4] dark:bg-[#1C1B19] p-3 text-xs select-none">
              {/* New Challenge Button */}
              <button
                onClick={handleNewChallenge}
                className="w-full mb-3 px-3 py-2 rounded-lg bg-white dark:bg-white/[0.04] border border-[#DFDAD0] dark:border-[#383532] text-[#1C1B19] dark:text-[#EDEDEB] font-medium text-xs flex items-center justify-between hover:bg-neutral-50 dark:hover:bg-white/[0.06] transition-colors shadow-2xs cursor-pointer"
              >
                <span>New Challenge</span>
                <Plus className="w-3.5 h-3.5 opacity-60" />
              </button>

              {/* Search History Input */}
              <div className="mb-3 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white dark:bg-white/[0.03] border border-[#DFDAD0] dark:border-[#383532] text-[#8C877D] dark:text-[#736F68]">
                <Search className="w-3 h-3 opacity-60 shrink-0" />
                <input
                  type="text"
                  placeholder="Search history..."
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  className="bg-transparent border-none outline-hidden text-[11px] w-full text-neutral-800 dark:text-neutral-200 placeholder:text-neutral-400"
                />
              </div>

              {/* Nav Links */}
              <div className="space-y-0.5 mb-4">
                <Link
                  href="/problems"
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded-md text-[#524E48] dark:text-[#A8A49D] hover:bg-black/[0.03] dark:hover:bg-white/[0.04] transition-colors"
                >
                  <FolderKanban className="w-3.5 h-3.5 opacity-70" />
                  <span>All Problems</span>
                </Link>
                <div
                  onClick={() => setCustomInput("Open workspace general settings and Judge0 execution environment preferences")}
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded-md text-[#524E48] dark:text-[#A8A49D] hover:bg-black/[0.03] dark:hover:bg-white/[0.04] transition-colors cursor-pointer"
                >
                  <Settings className="w-3.5 h-3.5 opacity-70" />
                  <span>Settings</span>
                </div>
                <div
                  onClick={() => setCustomInput("List my recent JudgeAPI submissions and benchmark metrics")}
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded-md text-[#524E48] dark:text-[#A8A49D] hover:bg-black/[0.03] dark:hover:bg-white/[0.04] transition-colors cursor-pointer"
                >
                  <BookOpen className="w-3.5 h-3.5 opacity-70" />
                  <span>My Submissions</span>
                </div>
              </div>

              {/* Recent History List */}
              <div className="flex items-center justify-between mb-2 text-[10px] uppercase tracking-wider font-semibold text-[#8C877D] dark:text-[#736F68]">
                <span>Recent History</span>
                <button
                  onClick={() => setSearchFilter("")}
                  className="text-[#B5B0A7] dark:text-[#524E48] cursor-pointer hover:text-[#1C1B19] dark:hover:text-white"
                >
                  clear
                </button>
              </div>

              <div className="space-y-1 flex-1 overflow-y-auto max-h-[300px]">
                {filteredHistory.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleSelectSession(item.id)}
                    className={`px-2.5 py-2 rounded-lg transition-colors cursor-pointer border ${
                      activeSessionId === item.id && isGenerating
                        ? "bg-white dark:bg-white/[0.08] border-[#DFDAD0] dark:border-[#383532] shadow-2xs"
                        : "border-transparent hover:bg-black/[0.03] dark:hover:bg-white/[0.04]"
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px] text-[#B5B0A7] dark:text-[#524E48] mb-0.5">
                      <span className="font-medium text-amber-600 dark:text-amber-400">Chat</span>
                      <span>{item.sidebarTime}</span>
                    </div>
                    <div className="text-[11px] text-[#524E48] dark:text-[#A8A49D] font-medium truncate leading-tight">
                      {item.sidebarTitle}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ─── RIGHT MAIN CONTENT AREA ─── */}
            <div className="flex-1 flex flex-col justify-between">
              <AnimatePresence mode="wait">
                {/* ════════ PHASE 1: WORKSPACE HOME ════════ */}
                {(phase === "workspace" || phase === "typing") && activeSessionId === null ? (
                  <motion.div
                    key="workspace-home"
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className="flex-1 flex flex-col items-center justify-center px-6 py-8 sm:px-10 space-y-6"
                  >
                    {/* Greeting */}
                    <div className="text-center space-y-1">
                      <h2 className="text-2xl sm:text-3xl font-bold text-[#1C1B19] dark:text-white tracking-tight">
                        Hey <span className="font-serif italic text-[#38332B] dark:text-[#E8E4DB]">Kalaiyarasu T</span>
                      </h2>
                      <p className="text-base sm:text-lg font-medium text-[#524E48] dark:text-[#A8A49D]">
                        What can I help you code today?
                      </p>
                    </div>

                    {/* Skills Chips Row */}
                    <div className="flex items-center gap-2 flex-wrap justify-center text-[10px]">
                      <span className="text-amber-600 dark:text-amber-400 font-mono font-bold flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        SKILLS:
                      </span>
                      {SKILL_CHIPS.map((chip) => (
                        <button
                          key={chip.label}
                          onClick={() => setCustomInput(`Help me write a full specification with ${chip.label} visual output`)}
                          className="px-2 py-0.5 rounded bg-black/[0.04] dark:bg-white/[0.06] border border-black/[0.06] dark:border-white/[0.06] text-[#524E48] dark:text-[#A8A49D] font-mono hover:bg-amber-500/10 hover:text-amber-600 transition-colors cursor-pointer"
                        >
                          <strong>{chip.label}</strong> <span className="opacity-70">{chip.sub}</span>
                        </button>
                      ))}
                    </div>

                    {/* ─── REAL USER-TYPEABLE PROMPT INPUT BOX ─── */}
                    <div className="w-full max-w-[620px] relative z-20">
                      <form onSubmit={handleCustomSubmit} className="rounded-2xl border border-[#DFDAD0] dark:border-[#383532] bg-white dark:bg-[#282624] shadow-lg relative">
                        {/* Web Search Active Pill */}
                        <div className="px-4 pt-3 pb-1 flex items-center justify-between">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/[0.04] dark:bg-white/[0.06] border border-black/[0.06] dark:border-white/[0.06] text-[11px] text-[#524E48] dark:text-[#A8A49D]">
                            <Globe className="w-3 h-3 opacity-70" />
                            <span className="font-medium">Web Search Active</span>
                            <X className="w-3 h-3 opacity-50 cursor-pointer hover:opacity-100" />
                          </span>

                          {isVoiceActive && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 text-xs animate-pulse font-mono font-medium">
                              <Volume2 className="w-3.5 h-3.5 animate-bounce" />
                              <span>Listening...</span>
                            </span>
                          )}
                        </div>

                        {/* Prompt Text Area / Typewriter Display */}
                        <div className="px-4 py-2">
                          {phase === "typing" ? (
                            <div className="min-h-[50px] text-sm text-[#1C1B19] dark:text-[#EDEDEB] leading-relaxed font-sans">
                              {typedPrompt}
                              {!isPromptDone && (
                                <span className="inline-block w-1.5 h-4 bg-amber-600 dark:bg-amber-400 ml-1 animate-pulse align-middle" />
                              )}
                            </div>
                          ) : (
                            <textarea
                              rows={2}
                              value={customInput}
                              onChange={(e) => setCustomInput(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter" && !e.shiftKey) {
                                  e.preventDefault();
                                  handleCustomSubmit();
                                }
                              }}
                              placeholder="e.g. Generate a Hard DP problem on grid path optimization with obstacle costs..."
                              className="w-full bg-transparent border-none outline-hidden text-sm text-[#1C1B19] dark:text-[#EDEDEB] placeholder:text-[#8C877D] dark:placeholder:text-[#736F68] resize-none leading-relaxed"
                            />
                          )}
                        </div>

                        {/* Bottom Toolbar: [+] [Model UI Selector] [Image/Video UI Selector] [Mic] [Send] */}
                        <div className="px-3 pb-3 pt-1 flex items-center justify-between gap-2 border-t border-black/[0.04] dark:border-white/[0.04] select-none">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {/* + Attachment Menu */}
                            <div className="relative" data-dropdown-container="true">
                              <button
                                type="button"
                                onClick={() => {
                                  const next = !isPlusMenuOpen;
                                  closeAllDropdowns();
                                  setIsPlusMenuOpen(next);
                                }}
                                className="w-8 h-8 rounded-xl border border-black/[0.08] dark:border-white/[0.1] bg-white/70 dark:bg-white/[0.04] text-[#1C1B19] dark:text-neutral-300 flex items-center justify-center cursor-pointer shadow-2xs hover:bg-neutral-100 dark:hover:bg-neutral-800"
                              >
                                <Plus className="w-4 h-4" />
                              </button>

                              {isPlusMenuOpen && (
                                <div className="absolute left-0 bottom-full mb-2 w-52 rounded-xl bg-white dark:bg-[#282624] border border-[#DFDAD0] dark:border-[#383532] shadow-xl p-1.5 z-[9999] text-xs">
                                  <button
                                    type="button"
                                    onClick={() => setIsPlusMenuOpen(false)}
                                    className="w-full text-left px-2.5 py-1.5 rounded-lg flex items-center gap-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 cursor-pointer"
                                  >
                                    <Paperclip className="w-3.5 h-3.5" />
                                    <span>Upload Code / File</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setIsPlusMenuOpen(false)}
                                    className="w-full text-left px-2.5 py-1.5 rounded-lg flex items-center gap-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 cursor-pointer"
                                  >
                                    <ImageIcon className="w-3.5 h-3.5" />
                                    <span>Image Reference</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setIsPlusMenuOpen(false)}
                                    className="w-full text-left px-2.5 py-1.5 rounded-lg flex items-center gap-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 cursor-pointer"
                                  >
                                    <Code2 className="w-3.5 h-3.5" />
                                    <span>System Instructions</span>
                                  </button>
                                </div>
                              )}
                            </div>

                            {/* Reasoning Model Selection UI */}
                            <div className="relative" data-dropdown-container="true">
                              <button
                                type="button"
                                onClick={() => {
                                  const next = !isToolbarModelOpen;
                                  closeAllDropdowns();
                                  setIsToolbarModelOpen(next);
                                  setModelSearch("");
                                }}
                                className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-xl border border-black/[0.08] dark:border-white/[0.1] bg-white/70 dark:bg-white/[0.04] text-[#1C1B19] dark:text-[#EDEDEB] shadow-2xs font-medium cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-800"
                              >
                                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                                <span>{selectedModel}</span>
                                <ChevronDown className="w-3 h-3 opacity-60 ml-0.5" />
                              </button>

                              {isToolbarModelOpen && (
                                <div className="absolute left-0 bottom-full mb-2 w-72 rounded-xl bg-white dark:bg-[#222222] border border-neutral-200 dark:border-neutral-800 shadow-2xl z-[9999] overflow-hidden text-xs">
                                  <div className="p-2 border-b border-black/[0.06] dark:border-white/[0.06]">
                                    <div className="relative">
                                      <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-neutral-400" />
                                      <input
                                        type="text"
                                        value={modelSearch}
                                        onChange={(e) => setModelSearch(e.target.value)}
                                        placeholder="Search available models..."
                                        className="w-full pl-8 pr-2.5 py-1.5 text-xs rounded-lg bg-black/[0.03] dark:bg-white/[0.04] border border-black/[0.05] dark:border-white/[0.06] outline-hidden text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400"
                                        autoFocus
                                      />
                                    </div>
                                  </div>

                                  <div className="max-h-56 overflow-y-auto p-1.5 space-y-0.5">
                                    {AVAILABLE_MODELS.filter((m) => {
                                      if (!modelSearch.trim()) return true;
                                      const q = modelSearch.toLowerCase();
                                      return m.name.toLowerCase().includes(q) || m.provider.toLowerCase().includes(q) || m.desc.toLowerCase().includes(q);
                                    }).map((m) => {
                                      const isSelected = selectedModel === m.name;
                                      return (
                                        <button
                                          key={m.name}
                                          type="button"
                                          onClick={() => {
                                            setSelectedModel(m.name);
                                            closeAllDropdowns();
                                          }}
                                          className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                                            isSelected
                                              ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 font-medium"
                                              : "hover:bg-black/[0.04] dark:hover:bg-white/[0.06] text-neutral-700 dark:text-neutral-300"
                                          }`}
                                        >
                                          <div className="flex items-center gap-2 truncate">
                                            <m.icon className="w-3.5 h-3.5 shrink-0 text-current" />
                                            <div className="flex flex-col text-left truncate">
                                              <span className="truncate">{m.name}</span>
                                              <span className={`text-[10px] truncate ${isSelected ? "opacity-75" : "text-neutral-400"}`}>
                                                {m.provider} • {m.desc}
                                              </span>
                                            </div>
                                          </div>
                                          {isSelected && <Check className="w-3.5 h-3.5 shrink-0 text-current ml-1" />}
                                        </button>
                                      );
                                    })}
                                  </div>

                                  <div className="p-1.5 border-t border-black/[0.06] dark:border-white/[0.06] bg-black/[0.02] dark:bg-white/[0.02]">
                                    <div className="w-full flex items-center px-2.5 py-1.5 rounded-lg text-xs font-medium text-neutral-500 dark:text-neutral-400 gap-1.5">
                                      <Settings className="w-3.5 h-3.5 text-neutral-400" />
                                      <span>Configure API Keys in Settings</span>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* Image & Video Selection UI Model */}
                            <div className="relative hidden sm:block" data-dropdown-container="true">
                              <button
                                type="button"
                                onClick={() => {
                                  const next = !isToolbarMediaOpen;
                                  closeAllDropdowns();
                                  setIsToolbarMediaOpen(next);
                                  setMediaSearch("");
                                }}
                                className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-xl border border-black/[0.08] dark:border-white/[0.1] bg-white/70 dark:bg-white/[0.04] text-[#1C1B19] dark:text-[#EDEDEB] shadow-2xs font-medium cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-800"
                              >
                                <Film className="w-3.5 h-3.5 text-purple-500" />
                                <span>{selectedMediaEngine}</span>
                                <ChevronDown className="w-3 h-3 opacity-60 ml-0.5" />
                              </button>

                              {isToolbarMediaOpen && (
                                <div className="absolute left-0 bottom-full mb-2 w-76 rounded-xl bg-white dark:bg-[#222222] border border-neutral-200 dark:border-neutral-800 shadow-2xl z-[9999] overflow-hidden text-xs">
                                  <div className="p-2 border-b border-black/[0.06] dark:border-white/[0.06]">
                                    <div className="relative">
                                      <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-neutral-400" />
                                      <input
                                        type="text"
                                        value={mediaSearch}
                                        onChange={(e) => setMediaSearch(e.target.value)}
                                        placeholder="Search media engines..."
                                        className="w-full pl-8 pr-2.5 py-1.5 text-xs rounded-lg bg-black/[0.03] dark:bg-white/[0.04] border border-black/[0.05] dark:border-white/[0.06] outline-hidden text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400"
                                        autoFocus
                                      />
                                    </div>
                                  </div>

                                  <div className="max-h-56 overflow-y-auto p-1.5 space-y-0.5">
                                    {AVAILABLE_MEDIA_MODELS.filter((eng) => {
                                      if (!mediaSearch.trim()) return true;
                                      const q = mediaSearch.toLowerCase();
                                      return eng.name.toLowerCase().includes(q) || eng.provider.toLowerCase().includes(q) || eng.desc.toLowerCase().includes(q) || eng.type.toLowerCase().includes(q);
                                    }).map((eng) => {
                                      const isSelected = selectedMediaEngine === eng.name;
                                      return (
                                        <button
                                          key={eng.name}
                                          type="button"
                                          onClick={() => {
                                            setSelectedMediaEngine(eng.name);
                                            closeAllDropdowns();
                                          }}
                                          className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                                            isSelected
                                              ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 font-medium"
                                              : "hover:bg-black/[0.04] dark:hover:bg-white/[0.06] text-neutral-700 dark:text-neutral-300"
                                          }`}
                                        >
                                          <div className="flex items-center gap-2 truncate">
                                            <eng.icon className="w-3.5 h-3.5 shrink-0 text-current" />
                                            <div className="flex flex-col text-left truncate">
                                              <span className="truncate">{eng.name}</span>
                                              <span className={`text-[10px] truncate ${isSelected ? "opacity-75" : "text-neutral-400"}`}>
                                                {eng.provider} • {eng.desc}
                                              </span>
                                            </div>
                                          </div>
                                          {isSelected && <Check className="w-3.5 h-3.5 shrink-0 text-current ml-1" />}
                                        </button>
                                      );
                                    })}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Right: Mic & Send Button */}
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => setIsVoiceActive(!isVoiceActive)}
                              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                                isVoiceActive
                                  ? "bg-rose-500/20 text-rose-600"
                                  : "text-[#7A756C] dark:text-[#8C8880] hover:text-black dark:hover:text-white"
                              }`}
                              title="Voice Mode"
                            >
                              <Mic className="w-4 h-4" />
                            </button>

                            <button
                              type="submit"
                              className="w-8 h-8 rounded-xl bg-[#1C1B19] dark:bg-white text-white dark:text-[#1C1B19] flex items-center justify-center shadow-xs hover:opacity-90 transition-opacity cursor-pointer"
                              title="Send Prompt"
                            >
                              <ArrowUp className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </form>
                    </div>

                    {/* Quick Action Pills (Category Tabs) */}
                    <div className="flex items-center gap-2 flex-wrap justify-center select-none">
                      {QUICK_ACTIONS.map((qa) => {
                        const isSelected = activeCategory === qa.label;
                        return (
                          <button
                            key={qa.label}
                            type="button"
                            onClick={() => {
                              setActiveCategory(qa.label);
                            }}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border cursor-pointer transition-all ${
                              isSelected
                                ? "bg-amber-500/15 border-amber-500/40 text-amber-800 dark:text-amber-300 font-semibold shadow-2xs"
                                : "bg-white/60 dark:bg-white/[0.04] text-[#524E48] dark:text-[#A8A49D] border-[#DFDAD0] dark:border-[#383532] hover:bg-black/[0.03] dark:hover:bg-white/[0.06]"
                            }`}
                          >
                            <qa.icon className={`w-3 h-3 ${isSelected ? "text-amber-600 dark:text-amber-400" : "text-amber-500"}`} />
                            <span>{qa.label}</span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Trending Prompts (2 Rows x 2 Columns = 4 Prompts) */}
                    <div className="w-full max-w-[620px] space-y-3 pt-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-[#524E48] dark:text-[#A8A49D]">Trending {activeCategory} Prompts</span>
                        <span className="text-[#B5B0A7] dark:text-[#524E48] text-[10px]">Click to add to prompt</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {(CATEGORY_PROMPTS[activeCategory] || CATEGORY_PROMPTS["Generate Problem"]).map((prompt, idx) => (
                          <div
                            key={idx}
                            onClick={() => {
                              setCustomInput(prompt);
                            }}
                            className="px-3 py-2.5 rounded-xl border border-[#DFDAD0] dark:border-[#383532] bg-white/50 dark:bg-white/[0.02] text-[11px] text-[#524E48] dark:text-[#A8A49D] leading-snug hover:bg-white dark:hover:bg-white/[0.06] hover:border-amber-500/40 transition-all cursor-pointer shadow-2xs"
                          >
                            {prompt}
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  /* ════════ PHASE 2+: GENERATION STREAM ════════ */
                  <motion.div
                    key="generation-stream"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="flex-1 flex flex-col justify-between"
                  >
                    {/* Chat Feed Area with Auto-Scroll */}
                    <div
                      ref={feedRef}
                      className="p-5 sm:p-7 space-y-5 max-h-[440px] overflow-y-auto bg-[#FBF9F4] dark:bg-[#1C1B19] text-xs sm:text-sm leading-relaxed transition-colors duration-300 flex-1"
                    >
                      {/* User Prompt Bubble */}
                      <div className="flex justify-end">
                        <div className="max-w-[85%] px-4 py-3 rounded-2xl bg-[#ECE8DF] dark:bg-[#282624] text-sm text-[#1C1B19] dark:text-[#EDEDEB] leading-relaxed shadow-2xs">
                          {typedPrompt || activeSession.prompt}
                        </div>
                      </div>

                      {/* AI Agent Response Stream */}
                      <div className="space-y-4">
                        {/* 1. Exact ThinkingProcessBlock (Auto-closes when done) */}
                        <div className="not-prose">
                          <button
                            type="button"
                            onClick={() => setIsThinkingOpen(!isThinkingOpen)}
                            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/[0.03] dark:bg-white/[0.05] border border-black/[0.08] dark:border-white/[0.08] text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:bg-black/[0.06] dark:hover:bg-white/[0.08] hover:text-neutral-950 dark:hover:text-white transition-all cursor-pointer select-none shadow-2xs"
                          >
                            <Brain
                              className={`w-3.5 h-3.5 ${
                                phase === "thinking"
                                  ? "text-amber-500 animate-pulse"
                                  : "text-neutral-500 dark:text-neutral-400"
                              }`}
                            />
                            {phase === "thinking" ? (
                              <span className="font-semibold text-neutral-800 dark:text-neutral-200">Thinking...</span>
                            ) : (
                              <span className="text-neutral-700 dark:text-neutral-300 font-medium">Thought process (1.2s)</span>
                            )}
                            <ChevronRight
                              className={`w-3.5 h-3.5 text-neutral-400 transition-transform duration-200 ${
                                isThinkingOpen ? "rotate-90" : ""
                              }`}
                            />
                          </button>

                          {/* Expanded Thought Drawer */}
                          {isThinkingOpen && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              className="mt-2.5 p-3.5 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.08] dark:border-white/[0.08] font-mono text-[11px] leading-relaxed text-neutral-600 dark:text-neutral-400 whitespace-pre-wrap shadow-inner"
                            >
                              {activeSession.thinkingTrace}
                            </motion.div>
                          )}
                        </div>

                        {/* 2. Step 1 Narrative Explanation */}
                        {(phase === "explanation" ||
                          phase === "flowchart" ||
                          phase === "svg" ||
                          phase === "completed") && (
                          <motion.div
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-3 text-neutral-800 dark:text-neutral-200"
                          >
                            <p>
                              <strong className="text-neutral-900 dark:text-white">{activeSession.step1.title}:</strong>{" "}
                              {activeSession.step1.text}{" "}
                              {activeSession.step1.mathTag && (
                                <code className="px-1.5 py-0.5 rounded bg-black/[0.05] dark:bg-white/[0.08] font-mono text-xs text-neutral-900 dark:text-neutral-100 border border-black/[0.04] dark:border-white/[0.06]">
                                  {activeSession.step1.mathTag}
                                </code>
                              )}
                            </p>
                            <p>
                              <strong className="text-neutral-900 dark:text-white">{activeSession.step2.title}:</strong>{" "}
                              {activeSession.step2.text}{" "}
                              {activeSession.step2.mathTag && (
                                <code className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-mono text-xs font-bold border border-emerald-500/20">
                                  {activeSession.step2.mathTag}
                                </code>
                              )}
                            </p>
                          </motion.div>
                        )}

                        {/* 3. Code Snippet Block */}
                        {activeSession.codeSnippet &&
                          (phase === "flowchart" || phase === "svg" || phase === "completed") && (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.98 }}
                              animate={{ opacity: 1, scale: 1 }}
                              className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#1a1a1a] overflow-hidden shadow-xs"
                            >
                              <div className="px-3.5 py-2 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50 flex items-center justify-between text-xs font-medium text-neutral-800 dark:text-neutral-200">
                                <div className="flex items-center gap-2">
                                  <Code2 className="w-3.5 h-3.5 text-neutral-500" />
                                  <span>{activeSession.codeSnippet.title} ({activeSession.codeSnippet.lang})</span>
                                </div>
                                <button onClick={handleCopy} className="p-1 hover:text-black dark:hover:text-white cursor-pointer">
                                  {isCopied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                                </button>
                              </div>
                              <pre className="p-3.5 font-mono text-xs overflow-x-auto text-neutral-900 dark:text-neutral-100 leading-relaxed">
                                {activeSession.codeSnippet.code}
                              </pre>
                            </motion.div>
                          )}

                        {/* 4. Mermaid Flowchart Visualizer */}
                        {activeSession.mermaidGraph &&
                          (phase === "flowchart" || phase === "svg" || phase === "completed") && (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.98 }}
                              animate={{ opacity: 1, scale: 1 }}
                              className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#1a1a1a] overflow-hidden shadow-xs"
                            >
                              <div className="px-3.5 py-2 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50 flex items-center justify-between">
                                <div className="flex items-center gap-2 text-xs font-medium text-neutral-800 dark:text-neutral-200">
                                  <Network className="w-3.5 h-3.5 text-neutral-500" />
                                  <span>{activeSession.mermaidGraph.title}</span>
                                </div>
                                <button onClick={handleCopy} className="p-1 hover:text-black dark:hover:text-white cursor-pointer">
                                  {isCopied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                                </button>
                              </div>

                              <div className="p-4 overflow-x-auto bg-white dark:bg-[#1a1a1a]">
                                {activeSession.mermaidGraph.type === "lis" ? (
                                  <svg className="w-full h-28" viewBox="0 0 760 110" fill="none">
                                    <rect x="10" y="35" width="130" height="40" rx="8" className="fill-neutral-100 dark:fill-neutral-800 stroke-neutral-300 dark:stroke-neutral-700" strokeWidth="1.5" />
                                    <text x="75" y="60" className="fill-neutral-900 dark:fill-neutral-100" fontSize="11" fontFamily="sans-serif" textAnchor="middle" fontWeight="600">For num in nums</text>

                                    <path d="M140 55 H190" className="stroke-neutral-400 dark:stroke-neutral-600" strokeWidth="1.5" markerEnd="url(#arrowH2)" />

                                    <rect x="190" y="35" width="170" height="40" rx="8" className="fill-neutral-100 dark:fill-neutral-800 stroke-neutral-300 dark:stroke-neutral-700" strokeWidth="1.5" />
                                    <text x="275" y="60" className="fill-neutral-900 dark:fill-neutral-100" fontSize="11" fontFamily="sans-serif" textAnchor="middle" fontWeight="600">Binary Search in tails</text>

                                    <path d="M360 55 H410" className="stroke-neutral-400 dark:stroke-neutral-600" strokeWidth="1.5" />

                                    <polygon points="450,30 490,55 450,80 410,55" className="fill-amber-50 dark:fill-amber-950/40 stroke-amber-500" strokeWidth="1.5" />
                                    <text x="450" y="58" className="fill-amber-700 dark:fill-amber-300" fontSize="10" fontFamily="sans-serif" textAnchor="middle" fontWeight="bold">Found?</text>

                                    <path d="M450 30 V15 H540 V35" className="stroke-neutral-400 dark:stroke-neutral-600" strokeWidth="1.5" />
                                    <text x="495" y="24" className="fill-neutral-500" fontSize="9" textAnchor="middle">Yes</text>
                                    <rect x="520" y="35" width="110" height="35" rx="6" className="fill-emerald-50 dark:fill-emerald-950/30 stroke-emerald-500" strokeWidth="1.2" />
                                    <text x="575" y="57" className="fill-emerald-700 dark:fill-emerald-400" fontSize="10" fontFamily="sans-serif" textAnchor="middle">tails[idx] = num</text>

                                    <path d="M450 80 V95 H540 V75" className="stroke-neutral-400 dark:stroke-neutral-600" strokeWidth="1.5" />
                                    <text x="495" y="93" className="fill-neutral-500" fontSize="9" textAnchor="middle">No</text>
                                    <rect x="520" y="70" width="110" height="35" rx="6" className="fill-emerald-50 dark:fill-emerald-950/30 stroke-emerald-500" strokeWidth="1.2" />
                                    <text x="575" y="92" className="fill-emerald-700 dark:fill-emerald-400" fontSize="10" fontFamily="sans-serif" textAnchor="middle">tails.push(num)</text>

                                    <path d="M630 55 H670" className="stroke-neutral-400 dark:stroke-neutral-600" strokeWidth="1.5" />
                                    <rect x="670" y="35" width="80" height="40" rx="8" className="fill-neutral-900 dark:fill-white stroke-neutral-900 dark:stroke-white" strokeWidth="1.5" />
                                    <text x="710" y="60" className="fill-white dark:fill-neutral-900" fontSize="11" fontFamily="sans-serif" textAnchor="middle" fontWeight="bold">len(tails)</text>

                                    <defs>
                                      <marker id="arrowH2" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                                        <path d="M 0 0 L 10 5 L 0 10 z" className="fill-neutral-400 dark:fill-neutral-600" />
                                      </marker>
                                    </defs>
                                  </svg>
                                ) : (
                                  <svg className="w-full h-28" viewBox="0 0 760 110" fill="none">
                                    <rect x="20" y="15" width="140" height="35" rx="6" className="fill-blue-50 dark:fill-blue-950/30 stroke-blue-500" strokeWidth="1.2" />
                                    <text x="90" y="37" className="fill-blue-700 dark:fill-blue-300" fontSize="11" fontFamily="sans-serif" textAnchor="middle" fontWeight="bold">Layer K: Node U (dist=0)</text>

                                    <path d="M160 32 H290" className="stroke-neutral-400 dark:stroke-neutral-600" strokeWidth="1.5" markerEnd="url(#arrowH2)" />
                                    <text x="225" y="24" className="fill-neutral-500" fontSize="9" textAnchor="middle">w(U, V) = 5</text>

                                    <rect x="290" y="15" width="140" height="35" rx="6" className="fill-blue-50 dark:fill-blue-950/30 stroke-blue-500" strokeWidth="1.2" />
                                    <text x="360" y="37" className="fill-blue-700 dark:fill-blue-300" fontSize="11" fontFamily="sans-serif" textAnchor="middle" fontWeight="bold">Layer K: Node V (dist=5)</text>

                                    <path d="M90 50 V75 H460 V55" className="stroke-purple-500" strokeWidth="1.5" strokeDasharray="4 2" markerEnd="url(#arrowPurple)" />
                                    <text x="275" y="88" className="fill-purple-600 dark:fill-purple-400" fontSize="10" fontFamily="sans-serif" textAnchor="middle" fontWeight="bold">
                                      ⚡ Teleport Portal Jump (Layer K ➔ Layer K-1, Cost = 0)
                                    </text>

                                    <rect x="460" y="15" width="160" height="35" rx="6" className="fill-emerald-50 dark:fill-emerald-950/30 stroke-emerald-500" strokeWidth="1.2" />
                                    <text x="540" y="37" className="fill-emerald-700 dark:fill-emerald-300" fontSize="11" fontFamily="sans-serif" textAnchor="middle" fontWeight="bold">Layer K-1: Target (dist=0)</text>

                                    <defs>
                                      <marker id="arrowPurple" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                                        <path d="M 0 0 L 10 5 L 0 10 z" className="fill-purple-500" />
                                      </marker>
                                    </defs>
                                  </svg>
                                )}
                              </div>
                            </motion.div>
                          )}

                        {/* 5. Vector SVG Diagram Visualizer */}
                        {activeSession.svgData &&
                          (phase === "svg" || phase === "completed") && (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.98 }}
                              animate={{ opacity: 1, scale: 1 }}
                              className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#1a1a1a] overflow-hidden shadow-xs"
                            >
                              <div className="px-3.5 py-2 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50 flex items-center justify-between">
                                <div className="flex items-center gap-2 text-xs font-medium text-neutral-800 dark:text-neutral-200">
                                  <FileCode className="w-3.5 h-3.5 text-neutral-500" />
                                  <span>{activeSession.svgData.title}</span>
                                </div>
                                <button
                                  onClick={handleCopy}
                                  className="px-2 py-0.5 rounded-md border border-neutral-200 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 flex items-center gap-1 text-[10px] font-mono cursor-pointer"
                                >
                                  {isCopied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                                  <span>{isCopied ? "Copied" : "Copy SVG"}</span>
                                </button>
                              </div>

                              <div className="p-4 overflow-x-auto bg-white dark:bg-[#1a1a1a]">
                                <svg className="w-full h-24" viewBox="0 0 740 90" fill="none">
                                  <text x="10" y="22" className="fill-neutral-500 dark:fill-neutral-400" fontSize="10" fontFamily="monospace">
                                    {activeSession.svgData.input}
                                  </text>
                                  <text x="10" y="58" className="fill-neutral-800 dark:fill-neutral-200" fontSize="11" fontFamily="monospace" fontWeight="bold">
                                    Transitions:
                                  </text>

                                  <g transform="translate(105, 38)">
                                    {activeSession.svgData.items.map((item, idx) => (
                                      <g key={idx} transform={`translate(${idx * 70}, 0)`}>
                                        <rect
                                          x="0"
                                          y="0"
                                          width="58"
                                          height="32"
                                          rx="6"
                                          className={
                                            item.isHighlighted
                                              ? "fill-emerald-50 dark:fill-emerald-950/40 stroke-emerald-500"
                                              : "fill-blue-50 dark:fill-blue-950/40 stroke-blue-500"
                                          }
                                          strokeWidth="1.5"
                                        />
                                        <text
                                          x="29"
                                          y="20"
                                          className={
                                            item.isHighlighted
                                              ? "fill-emerald-700 dark:fill-emerald-400"
                                              : "fill-blue-700 dark:fill-blue-300"
                                          }
                                          fontSize="11"
                                          fontFamily="monospace"
                                          textAnchor="middle"
                                          fontWeight="bold"
                                        >
                                          {item.value}
                                        </text>
                                        <text x="29" y="-6" className="fill-neutral-400 text-[9px]" fontSize="9" fontFamily="monospace" textAnchor="middle">
                                          {item.label}
                                        </text>
                                      </g>
                                    ))}

                                    <g transform={`translate(${activeSession.svgData.items.length * 70 + 20}, 3)`}>
                                      <rect x="0" y="0" width="240" height="26" rx="13" className="fill-emerald-500/10 stroke-emerald-500/30" strokeWidth="1" />
                                      <text x="120" y="17" className="fill-emerald-700 dark:fill-emerald-300" fontSize="10" fontFamily="sans-serif" textAnchor="middle" fontWeight="bold">
                                        {activeSession.svgData.summary}
                                      </text>
                                    </g>
                                  </g>
                                </svg>
                              </div>
                            </motion.div>
                          )}
                      </div>
                    </div>

                    {/* ─── FLOATING PROMPT BOX AT BOTTOM ─── */}
                    <div className="p-3 sm:p-4 bg-[#FBF9F4] dark:bg-[#1C1B19] border-t border-[#DFDAD0] dark:border-[#2D2A26] relative z-20">
                      <form onSubmit={handleCustomSubmit} className="rounded-2xl border border-[#DFDAD0] dark:border-[#383532] bg-[#ECE8DF] dark:bg-[#282624] p-3 shadow-xs relative">
                        <input
                          type="text"
                          value={customInput}
                          onChange={(e) => setCustomInput(e.target.value)}
                          placeholder="Ask a follow-up algorithm question or request test case traces..."
                          className="w-full bg-transparent border-none outline-hidden text-xs text-[#1C1B19] dark:text-[#EDEDEB] placeholder:text-[#8C877D] dark:placeholder:text-[#736F68] px-1 pb-2"
                        />

                        <div className="pt-2 border-t border-black/[0.04] dark:border-white/[0.04] flex items-center justify-between gap-2 select-none">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {/* + Attachment Menu */}
                            <div className="relative" data-dropdown-container="true">
                              <button
                                type="button"
                                onClick={() => {
                                  const next = !isPlusMenuOpen;
                                  closeAllDropdowns();
                                  setIsPlusMenuOpen(next);
                                }}
                                className="w-8 h-8 rounded-xl border border-black/[0.08] dark:border-white/[0.1] bg-white/70 dark:bg-white/[0.04] text-[#1C1B19] dark:text-neutral-300 flex items-center justify-center cursor-pointer shadow-2xs hover:bg-neutral-100 dark:hover:bg-neutral-800"
                              >
                                <Plus className="w-4 h-4" />
                              </button>

                              {isPlusMenuOpen && (
                                <div className="absolute left-0 bottom-full mb-2 w-52 rounded-xl bg-white dark:bg-[#282624] border border-[#DFDAD0] dark:border-[#383532] shadow-xl p-1.5 z-[9999] text-xs">
                                  <button
                                    type="button"
                                    onClick={() => setIsPlusMenuOpen(false)}
                                    className="w-full text-left px-2.5 py-1.5 rounded-lg flex items-center gap-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 cursor-pointer"
                                  >
                                    <Paperclip className="w-3.5 h-3.5" />
                                    <span>Upload Code / File</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setIsPlusMenuOpen(false)}
                                    className="w-full text-left px-2.5 py-1.5 rounded-lg flex items-center gap-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 cursor-pointer"
                                  >
                                    <ImageIcon className="w-3.5 h-3.5" />
                                    <span>Image Reference</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setIsPlusMenuOpen(false)}
                                    className="w-full text-left px-2.5 py-1.5 rounded-lg flex items-center gap-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 cursor-pointer"
                                  >
                                    <Code2 className="w-3.5 h-3.5" />
                                    <span>System Instructions</span>
                                  </button>
                                </div>
                              )}
                            </div>

                            {/* Reasoning Model Selection UI */}
                            <div className="relative" data-dropdown-container="true">
                              <button
                                type="button"
                                onClick={() => {
                                  const next = !genChatModelOpen;
                                  closeAllDropdowns();
                                  setGenChatModelOpen(next);
                                  setGenChatModelSearch("");
                                }}
                                className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-xl border border-black/[0.08] dark:border-white/[0.1] bg-white/70 dark:bg-white/[0.04] text-[#1C1B19] dark:text-[#EDEDEB] shadow-2xs font-medium cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-800"
                              >
                                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                                <span>{selectedModel}</span>
                                <ChevronDown className="w-3 h-3 opacity-60 ml-0.5" />
                              </button>

                              {genChatModelOpen && (
                                <div className="absolute left-0 bottom-full mb-2 w-72 rounded-xl bg-white dark:bg-[#222222] border border-neutral-200 dark:border-neutral-800 shadow-2xl z-[9999] overflow-hidden text-xs">
                                  <div className="p-2 border-b border-black/[0.06] dark:border-white/[0.06]">
                                    <div className="relative">
                                      <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-neutral-400" />
                                      <input
                                        type="text"
                                        value={genChatModelSearch}
                                        onChange={(e) => setGenChatModelSearch(e.target.value)}
                                        placeholder="Search available models..."
                                        className="w-full pl-8 pr-2.5 py-1.5 text-xs rounded-lg bg-black/[0.03] dark:bg-white/[0.04] border border-black/[0.05] dark:border-white/[0.06] outline-hidden text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400"
                                        autoFocus
                                      />
                                    </div>
                                  </div>

                                  <div className="max-h-56 overflow-y-auto p-1.5 space-y-0.5">
                                    {AVAILABLE_MODELS.filter((m) => {
                                      if (!genChatModelSearch.trim()) return true;
                                      const q = genChatModelSearch.toLowerCase();
                                      return m.name.toLowerCase().includes(q) || m.provider.toLowerCase().includes(q) || m.desc.toLowerCase().includes(q);
                                    }).map((m) => {
                                      const isSelected = selectedModel === m.name;
                                      return (
                                        <button
                                          key={m.name}
                                          type="button"
                                          onClick={() => {
                                            setSelectedModel(m.name);
                                            closeAllDropdowns();
                                          }}
                                          className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                                            isSelected
                                              ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 font-medium"
                                              : "hover:bg-black/[0.04] dark:hover:bg-white/[0.06] text-neutral-700 dark:text-neutral-300"
                                          }`}
                                        >
                                          <div className="flex items-center gap-2 truncate">
                                            <m.icon className="w-3.5 h-3.5 shrink-0 text-current" />
                                            <div className="flex flex-col text-left truncate">
                                              <span className="truncate">{m.name}</span>
                                              <span className={`text-[10px] truncate ${isSelected ? "opacity-75" : "text-neutral-400"}`}>
                                                {m.provider} • {m.desc}
                                              </span>
                                            </div>
                                          </div>
                                          {isSelected && <Check className="w-3.5 h-3.5 shrink-0 text-current ml-1" />}
                                        </button>
                                      );
                                    })}
                                  </div>

                                  <div className="p-1.5 border-t border-black/[0.06] dark:border-white/[0.06] bg-black/[0.02] dark:bg-white/[0.02]">
                                    <div className="w-full flex items-center px-2.5 py-1.5 rounded-lg text-xs font-medium text-neutral-500 dark:text-neutral-400 gap-1.5">
                                      <Settings className="w-3.5 h-3.5 text-neutral-400" />
                                      <span>Configure API Keys in Settings</span>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* Image & Video Engine pill */}
                            <div className="relative hidden sm:block" data-dropdown-container="true">
                              <button
                                type="button"
                                onClick={() => {
                                  const next = !genChatMediaOpen;
                                  closeAllDropdowns();
                                  setGenChatMediaOpen(next);
                                  setMediaSearch("");
                                }}
                                className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-xl border border-black/[0.08] dark:border-white/[0.1] bg-white/70 dark:bg-white/[0.04] text-[#1C1B19] dark:text-[#EDEDEB] shadow-2xs font-medium cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-800"
                              >
                                <Film className="w-3.5 h-3.5 text-purple-500" />
                                <span>{selectedMediaEngine}</span>
                                <ChevronDown className="w-3 h-3 opacity-60 ml-0.5" />
                              </button>

                              {genChatMediaOpen && (
                                <div className="absolute left-0 bottom-full mb-2 w-76 rounded-xl bg-white dark:bg-[#222222] border border-neutral-200 dark:border-neutral-800 shadow-2xl z-[9999] overflow-hidden text-xs">
                                  <div className="p-2 border-b border-black/[0.06] dark:border-white/[0.06]">
                                    <div className="relative">
                                      <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-neutral-400" />
                                      <input
                                        type="text"
                                        value={mediaSearch}
                                        onChange={(e) => setMediaSearch(e.target.value)}
                                        placeholder="Search media engines..."
                                        className="w-full pl-8 pr-2.5 py-1.5 text-xs rounded-lg bg-black/[0.03] dark:bg-white/[0.04] border border-black/[0.05] dark:border-white/[0.06] outline-hidden text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400"
                                        autoFocus
                                      />
                                    </div>
                                  </div>

                                  <div className="max-h-56 overflow-y-auto p-1.5 space-y-0.5">
                                    {AVAILABLE_MEDIA_MODELS.filter((eng) => {
                                      if (!mediaSearch.trim()) return true;
                                      const q = mediaSearch.toLowerCase();
                                      return eng.name.toLowerCase().includes(q) || eng.provider.toLowerCase().includes(q) || eng.desc.toLowerCase().includes(q) || eng.type.toLowerCase().includes(q);
                                    }).map((eng) => {
                                      const isSelected = selectedMediaEngine === eng.name;
                                      return (
                                        <button
                                          key={eng.name}
                                          type="button"
                                          onClick={() => {
                                            setSelectedMediaEngine(eng.name);
                                            closeAllDropdowns();
                                          }}
                                          className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                                            isSelected
                                              ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 font-medium"
                                              : "hover:bg-black/[0.04] dark:hover:bg-white/[0.06] text-neutral-700 dark:text-neutral-300"
                                          }`}
                                        >
                                          <div className="flex items-center gap-2 truncate">
                                            <eng.icon className="w-3.5 h-3.5 shrink-0 text-current" />
                                            <div className="flex flex-col text-left truncate">
                                              <span className="truncate">{eng.name}</span>
                                              <span className={`text-[10px] truncate ${isSelected ? "opacity-75" : "text-neutral-400"}`}>
                                                {eng.provider} • {eng.desc}
                                              </span>
                                            </div>
                                          </div>
                                          {isSelected && <Check className="w-3.5 h-3.5 shrink-0 text-current ml-1" />}
                                        </button>
                                      );
                                    })}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => setIsVoiceActive(!isVoiceActive)}
                              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                                isVoiceActive ? "bg-rose-500/20 text-rose-600" : "text-[#7A756C] dark:text-[#8C8880]"
                              }`}
                            >
                              <Mic className="w-4 h-4" />
                            </button>

                            <button
                              type="submit"
                              className="w-8 h-8 rounded-xl bg-[#1C1B19] dark:bg-white text-white dark:text-[#1C1B19] flex items-center justify-center shadow-xs hover:opacity-90 transition-opacity cursor-pointer"
                              title="Send"
                            >
                              <ArrowUp className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </form>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
