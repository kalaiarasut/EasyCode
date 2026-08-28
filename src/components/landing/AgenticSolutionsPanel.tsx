"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookText,
  BookOpen,
  FlaskConical,
  History,
  Sparkles,
  Play,
  CheckCircle2,
  Code2,
  Terminal,
  RotateCcw,
  Copy,
  Check,
  ChevronDown,
  ArrowRight,
  Zap,
  Maximize2
} from "lucide-react";
import Link from "next/link";

const ACTIVE_PROBLEM = {
  number: 64,
  title: "Minimum Path Sum in Grid",
  difficulty: "Medium",
  acceptance: "74.8%",
  companies: ["Google", "Meta", "Amazon"],
  topics: ["Dynamic Programming", "Array", "Matrix"],
  description:
    "Given a m x n grid filled with non-negative numbers, find a path from top left to bottom right, which minimizes the sum of all numbers along its path. You can only move either down or right at any point in time.",
  formula: "dp[i][j] = min(dp[i-1][j], dp[i][j-1]) + grid[i][j]",
  example1: {
    input: "grid = [[1,3,1],[1,5,1],[4,2,1]]",
    output: "7",
    explanation: "Because the path 1 → 3 → 1 → 1 → 1 minimizes the sum (1 + 3 + 1 + 1 + 1 = 7)."
  },
  constraints: [
    "m == grid.length",
    "n == grid[i].length",
    "1 <= m, n <= 200",
    "0 <= grid[i][j] <= 200"
  ],
  codeLines: {
    python: [
      "class Solution:",
      "    def minPathSum(self, grid: list[list[int]]) -> int:",
      "        m, n = len(grid), len(grid[0])",
      "        dp = [0] * n",
      "        dp[0] = grid[0][0]",
      "        ",
      "        for j in range(1, n):",
      "            dp[j] = dp[j-1] + grid[0][j]",
      "            ",
      "        for i in range(1, m):",
      "            dp[0] += grid[i][0]",
      "            for j in range(1, n):",
      "                dp[j] = min(dp[j], dp[j-1]) + grid[i][j]",
      "                ",
      "        return dp[-1]"
    ],
    cpp: [
      "class Solution {",
      "public:",
      "    int minPathSum(vector<vector<int>>& grid) {",
      "        int m = grid.size(), n = grid[0].size();",
      "        vector<int> dp(n, 0);",
      "        dp[0] = grid[0][0];",
      "        ",
      "        for (int j = 1; j < n; ++j)",
      "            dp[j] = dp[j-1] + grid[0][j];",
      "            ",
      "        for (int i = 1; i < m; ++i) {",
      "            dp[0] += grid[i][0];",
      "            for (int j = 1; j < n; ++j) {",
      "                dp[j] = min(dp[j], dp[j-1]) + grid[i][j];",
      "            }",
      "        }",
      "        return dp[n-1];",
      "    }",
      "};"
    ],
    java: [
      "class Solution {",
      "    public int minPathSum(int[][] grid) {",
      "        int m = grid.length, n = grid[0].length;",
      "        int[] dp = new int[n];",
      "        dp[0] = grid[0][0];",
      "        ",
      "        for (int j = 1; j < n; j++)",
      "            dp[j] = dp[j-1] + grid[0][j];",
      "            ",
      "        for (int i = 1; i < m; i++) {",
      "            dp[0] += grid[i][0];",
      "            for (int j = 1; j < n; j++) {",
      "                dp[j] = Math.min(dp[j], dp[j-1]) + grid[i][j];",
      "            }",
      "        }",
      "        return dp[n-1];",
      "    }",
      "}"
    ]
  },
  testCases: [
    { id: 1, input: "grid = [[1,3,1],[1,5,1],[4,2,1]]", expected: "7", output: "7", runtime: "12ms", memory: "15.4MB" },
    { id: 2, input: "grid = [[1,2,3],[4,5,6]]", expected: "12", output: "12", runtime: "14ms", memory: "15.1MB" }
  ]
};

export default function AgenticSolutionsPanel() {
  const [selectedLanguage, setSelectedLanguage] = useState<"python" | "cpp" | "java">("python");
  const [activeTab, setActiveTab] = useState<"description" | "editorial" | "solutions" | "submissions">("description");
  const [activeTestCaseIdx, setActiveTestCaseIdx] = useState(0);

  // Live Gamma generation stages
  const [liveStage, setLiveStage] = useState<"topic" | "description" | "editor" | "testcases">("topic");
  const [isCopied, setIsCopied] = useState(false);

  // Auto-progress through live Gamma generation stages
  useEffect(() => {
    const t1 = setTimeout(() => setLiveStage("description"), 500);
    const t2 = setTimeout(() => setLiveStage("editor"), 1200);
    const t3 = setTimeout(() => setLiveStage("testcases"), 1900);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, []);

  const handleRestart = () => {
    setLiveStage("topic");
    setTimeout(() => setLiveStage("description"), 500);
    setTimeout(() => setLiveStage("editor"), 1200);
    setTimeout(() => setLiveStage("testcases"), 1900);
  };

  const handleCopyCode = () => {
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <section id="problem-canvas" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto font-sans scroll-mt-20">
      
      {/* Section Header */}
      <div className="text-center space-y-3 mb-12">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/[0.04] dark:bg-white/[0.06] border border-black/[0.06] dark:border-white/[0.06] text-xs font-mono text-neutral-700 dark:text-neutral-300">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>Live Problem Generation</span>
        </div>

        <h2 className="text-3xl sm:text-4xl md:text-5xl font-sans font-bold tracking-tight text-[#1C1B19] dark:text-[#F3F2F0]">
          Real-time algorithmic creation{" "}
          <br className="hidden sm:inline" />
          <span className="font-serif italic font-normal text-neutral-700 dark:text-neutral-300">
            inside the Problem Canvas.
          </span>
        </h2>

        <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 max-w-xl mx-auto leading-relaxed">
          From topic constraints and mathematical descriptions to Monaco code editor and JudgeAPI sandboxed test cases.
        </p>
      </div>

      {/* SHOWCASE 2: EXACT 100% REPLICA OF problem/[problemId]/page.tsx */}
      <div className="rounded-xl bg-[#FBF9F4] dark:bg-[#141312] border border-neutral-200 dark:border-neutral-800 shadow-2xl overflow-hidden text-[#1C1B19] dark:text-[#EDEDEB] transition-colors duration-300">
        
        {/* Global Problem Page Header (Matching Header.tsx line 48-60) */}
        <div className="h-12 border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#1a1a1a] px-4 sm:px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 font-bold text-sm tracking-tight text-[#1A1918] dark:text-[#F3F2F0]">
              <div className="w-6 h-6 rounded-md bg-[#1C1B19] dark:bg-white flex items-center justify-center text-white dark:text-[#1C1B19] font-mono font-bold text-xs">
                E
              </div>
              <span className="font-sans font-semibold">EasyCode</span>
            </div>

            <div className="h-4 w-px bg-neutral-200 dark:bg-neutral-800 mx-1 hidden sm:block" />

            <span className="text-xs text-neutral-500 font-mono hidden sm:inline">
              Problem #{ACTIVE_PROBLEM.number}
            </span>
          </div>

          {/* Center Run & Submit Buttons from Problem Page */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleRestart}
              className="p-1 rounded-md text-neutral-500 hover:text-black dark:hover:text-white transition-colors cursor-pointer mr-1"
              title="Restart simulation"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            <button className="px-3 py-1 rounded-md bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-xs font-medium text-neutral-800 dark:text-neutral-200 transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs">
              <Play className="w-3 h-3 text-neutral-600 dark:text-neutral-400 fill-current" />
              <span>Run</span>
            </button>

            <button className="px-3.5 py-1 rounded-md bg-emerald-600 hover:bg-emerald-500 text-xs text-white font-semibold transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer">
              <Zap className="w-3 h-3" />
              <span>Submit</span>
            </button>
          </div>

          {/* Right Auth / Profile */}
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-[#3A3733] text-white dark:bg-white dark:text-[#1C1B19] flex items-center justify-center text-xs font-semibold shadow-xs">
              U
            </div>
          </div>
        </div>

        {/* Problem Page Body: 2-Column Grid Layout (Matching problem/[problemId]/page.tsx line 450-580) */}
        <div className="p-2.5 grid grid-cols-1 lg:grid-cols-12 gap-2.5 min-h-[480px]">
          
          {/* LEFT COLUMN: PROBLEM DESCRIPTION & GAMMA HUD (Matching ProblemPageNavigation + GammaProblemCanvas) */}
          <div className="lg:col-span-5 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#1a1a1a] flex flex-col shadow-xs overflow-hidden">
            
            {/* ProblemPageNavigation Tabs (36px height) */}
            <div className="h-9 px-2 bg-black/[0.02] dark:bg-white/[0.02] border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between select-none">
              <div className="flex items-center gap-1 text-xs">
                <button
                  onClick={() => setActiveTab("description")}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                    activeTab === "description"
                      ? "bg-black/[0.04] dark:bg-white/[0.08] text-neutral-950 dark:text-white font-semibold"
                      : "text-neutral-500 dark:text-neutral-400 hover:text-black dark:hover:text-white"
                  }`}
                >
                  <BookText className="w-3.5 h-3.5 text-amber-500" />
                  <span>Description</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse ml-0.5" />
                </button>

                <button
                  onClick={() => setActiveTab("editorial")}
                  className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium text-neutral-500 dark:text-neutral-400 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Editorial</span>
                </button>

                <button
                  onClick={() => setActiveTab("solutions")}
                  className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium text-neutral-500 dark:text-neutral-400 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
                >
                  <FlaskConical className="w-3.5 h-3.5" />
                  <span>Solutions</span>
                </button>

                <button
                  onClick={() => setActiveTab("submissions")}
                  className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium text-neutral-500 dark:text-neutral-400 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
                >
                  <History className="w-3.5 h-3.5" />
                  <span>Submissions</span>
                </button>
              </div>
            </div>

            {/* Gamma Problem Canvas Body */}
            <div className="p-4 sm:p-5 flex-1 overflow-y-auto space-y-4 text-xs sm:text-sm leading-relaxed">
              
              {/* Gamma HUD Header (Matching GammaProblemHUD.tsx) */}
              <div className="p-2 rounded-lg bg-black/[0.02] dark:bg-white/[0.03] border border-neutral-200 dark:border-neutral-800 flex items-center justify-between text-[11px] font-mono">
                <div className="flex items-center gap-1.5 text-neutral-700 dark:text-neutral-300">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span className="font-semibold">Gamma Generator</span>
                  <span className="text-neutral-400">• Step 1 of 4</span>
                </div>
                <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold text-[10px]">
                  Streaming 1x
                </span>
              </div>

              {/* Problem Title & Meta Header */}
              <div className="space-y-2 pb-3 border-b border-neutral-200 dark:border-neutral-800">
                <h3 className="text-base font-bold text-neutral-900 dark:text-white tracking-tight">
                  {ACTIVE_PROBLEM.number}. {ACTIVE_PROBLEM.title}
                </h3>

                <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-mono">
                  <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-400 font-sans font-medium">
                    {ACTIVE_PROBLEM.difficulty}
                  </span>
                  <span className="text-neutral-500">
                    Acceptance: <strong className="text-neutral-800 dark:text-neutral-200">{ACTIVE_PROBLEM.acceptance}</strong>
                  </span>
                  {ACTIVE_PROBLEM.topics.map((t, idx) => (
                    <span key={idx} className="px-2 py-0.5 rounded-md bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300">
                      {t}
                    </span>
                  ))}
                  {ACTIVE_PROBLEM.companies.map((c, idx) => (
                    <span key={idx} className="px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300">
                      {c}
                    </span>
                  ))}
                </div>
              </div>

              {/* Narrative Statement */}
              {(liveStage === "description" || liveStage === "editor" || liveStage === "testcases") && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-3 text-neutral-800 dark:text-neutral-300"
                >
                  <p>{ACTIVE_PROBLEM.description}</p>

                  {/* Math Equation Box */}
                  <div className="p-3 rounded-lg bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 font-mono text-xs text-neutral-900 dark:text-neutral-100 flex items-center justify-between">
                    <span><code>{ACTIVE_PROBLEM.formula}</code></span>
                    <span className="text-[10px] text-neutral-500 font-sans">O(m × n)</span>
                  </div>

                  {/* Example 1 Card */}
                  <div className="p-3 rounded-lg bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-1 font-mono text-xs">
                    <div className="font-semibold text-neutral-900 dark:text-white font-sans text-[11px]">Example 1:</div>
                    <div><strong className="text-neutral-500">Input: </strong><span>{ACTIVE_PROBLEM.example1.input}</span></div>
                    <div><strong className="text-neutral-500">Output: </strong><span className="text-emerald-600 dark:text-emerald-400 font-bold">{ACTIVE_PROBLEM.example1.output}</span></div>
                    <div className="text-neutral-500 font-sans text-[11px]"><strong>Explanation: </strong>{ACTIVE_PROBLEM.example1.explanation}</div>
                  </div>

                  {/* Constraints Box */}
                  <div className="space-y-1 font-mono text-[11px] text-neutral-500">
                    <div className="font-semibold text-neutral-900 dark:text-white font-sans text-xs mb-0.5">Constraints:</div>
                    <ul className="list-disc list-inside space-y-0.5">
                      {ACTIVE_PROBLEM.constraints.map((c, idx) => (
                        <li key={idx}><code>{c}</code></li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              )}

            </div>
          </div>

          {/* RIGHT COLUMN: SPLIT INTO MONACO CODE EDITOR & TEST RESULT CONSOLE */}
          <div className="lg:col-span-7 flex flex-col gap-2.5">
            
            {/* TOP RIGHT: MONACO CODE EDITOR (Matching ProblemPageCodeEditor.tsx) */}
            <div className="flex-1 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#1a1a1a] shadow-xs overflow-hidden flex flex-col justify-between">
              
              {/* Monaco Header */}
              <div className="h-9 px-3 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 font-mono text-neutral-800 dark:text-neutral-200">
                    <Code2 className="w-3.5 h-3.5 text-neutral-500" />
                    <span>{selectedLanguage === "python" ? "Python 3" : selectedLanguage === "cpp" ? "C++20" : "Java 17"}</span>
                    <ChevronDown className="w-3 h-3 text-neutral-400 ml-1" />
                  </div>

                  <div className="flex items-center gap-1 text-[11px] font-mono">
                    {(["python", "cpp", "java"] as const).map((lang) => (
                      <button
                        key={lang}
                        onClick={() => setSelectedLanguage(lang)}
                        className={`px-2 py-0.5 rounded cursor-pointer transition-colors ${
                          selectedLanguage === lang
                            ? "bg-neutral-200 dark:bg-neutral-700 text-neutral-950 dark:text-white font-semibold"
                            : "text-neutral-500 hover:text-black dark:hover:text-white"
                        }`}
                      >
                        {lang.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleCopyCode}
                  className="p-1 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500 hover:text-black dark:hover:text-white transition-colors"
                  title="Copy Code"
                >
                  {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>

              {/* Monaco Code with Line Numbers */}
              <div className="p-3 bg-white dark:bg-[#1a1a1a] font-mono text-xs overflow-x-auto flex-1">
                <div className="flex">
                  {/* Line Numbers Gutter */}
                  <div className="select-none text-neutral-300 dark:text-neutral-600 pr-4 text-right">
                    {ACTIVE_PROBLEM.codeLines[selectedLanguage].map((_, i) => (
                      <div key={i}>{i + 1}</div>
                    ))}
                  </div>

                  {/* Code Text */}
                  <div className="text-neutral-900 dark:text-neutral-100 flex-1 leading-normal">
                    {ACTIVE_PROBLEM.codeLines[selectedLanguage].map((line, i) => (
                      <div key={i} className="whitespace-pre">{line}</div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* BOTTOM RIGHT: TEST RESULTS CONSOLE (Matching ProblemPageTestResult.tsx) */}
            <div className="rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#1a1a1a] shadow-xs overflow-hidden p-3.5 font-mono text-xs space-y-2.5">
              
              {/* Header */}
              <div className="flex items-center justify-between pb-2 border-b border-neutral-200 dark:border-neutral-800">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-semibold text-neutral-900 dark:text-white flex items-center gap-1.5">
                    <Terminal className="w-3.5 h-3.5 text-emerald-500" />
                    <span>JudgeAPI Test Results</span>
                  </span>
                  <div className="flex items-center gap-1 text-[11px]">
                    {ACTIVE_PROBLEM.testCases.map((tc, idx) => (
                      <button
                        key={tc.id}
                        onClick={() => setActiveTestCaseIdx(idx)}
                        className={`px-2 py-0.5 rounded transition-colors cursor-pointer ${
                          activeTestCaseIdx === idx
                            ? "bg-neutral-200 dark:bg-neutral-700 text-neutral-950 dark:text-white font-bold"
                            : "text-neutral-500 hover:text-black dark:hover:text-white"
                        }`}
                      >
                        Case {tc.id}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 text-xs font-bold font-sans">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Accepted (48/48 Passed)</span>
                </div>
              </div>

              {/* Case Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                <div className="p-2 rounded bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-0.5">
                  <div className="text-neutral-400 font-sans">Input:</div>
                  <div className="text-neutral-800 dark:text-neutral-200 truncate">{ACTIVE_PROBLEM.testCases[activeTestCaseIdx].input}</div>
                </div>

                <div className="p-2 rounded bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-0.5">
                  <div className="text-neutral-400 font-sans">Output vs Expected:</div>
                  <div className="text-emerald-600 dark:text-emerald-400 font-bold">
                    Output: {ACTIVE_PROBLEM.testCases[activeTestCaseIdx].output} (Expected: {ACTIVE_PROBLEM.testCases[activeTestCaseIdx].expected})
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="pt-1.5 flex items-center justify-between text-[10px] text-neutral-500 border-t border-neutral-100 dark:border-neutral-800/80">
                <span>Runtime: <strong className="text-neutral-900 dark:text-white">{ACTIVE_PROBLEM.testCases[activeTestCaseIdx].runtime}</strong></span>
                <span>Memory: <strong className="text-neutral-900 dark:text-white">{ACTIVE_PROBLEM.testCases[activeTestCaseIdx].memory}</strong></span>
                <Link
                  href="/problems"
                  className="text-neutral-900 dark:text-white hover:underline flex items-center gap-1 font-sans font-medium text-xs"
                >
                  <span>Solve in Full Problem Editor</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}
