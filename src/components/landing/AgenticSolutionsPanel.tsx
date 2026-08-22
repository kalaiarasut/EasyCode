"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Sparkles,
  CheckCircle2,
  GitBranch,
  Terminal,
  Layers,
  ArrowRight,
  ShieldCheck,
  Zap,
  Play,
  FileCode2,
  Check,
  Clock,
  BookOpen,
  Code2
} from "lucide-react";
import Link from "next/link";

const WORKFLOW_STAGES = [
  {
    id: "blueprint",
    step: "01",
    name: "Problem Blueprint",
    task: "Dynamic Programming & Trees",
    badge: "Formulated",
    tools: [
      { name: "3,500+ LeetCode Catalog", status: "Loaded 'Longest Increasing Subsequence'", icon: Layers, done: true },
      { name: "Constraint & Complexity Limits", status: "1 <= n <= 2500, Limit: O(n log n)", icon: ShieldCheck, done: true },
      { name: "AI Leet Bot Progressive Hints", status: "Generated Binary Search patience sorting hint", icon: Sparkles, done: true },
    ],
    reasoningLogs: [
      "→ Formulating optimal approach for Longest Increasing Subsequence...",
      "→ Standard DP array yields O(n²) time complexity with O(n) space.",
      "→ Optimized Patience Sorting with Binary Search (std::lower_bound) achieves O(n log n).",
      "✓ Generated starter templates in C++, Python 3, Java, and JavaScript."
    ],
    diff: `// Complexity Blueprint:
// Time Complexity: O(n log n) via Binary Search
// Space Complexity: O(n) for tails array
// Constraints: nums.length <= 2500`
  },
  {
    id: "monaco",
    step: "02",
    name: "Monaco Execution",
    task: "JudgeAPI Sandboxed Compiler",
    badge: "Running",
    tools: [
      { name: "Monaco-React Code Editor", status: "VS Code keybindings & syntax engine", icon: Code2, done: true },
      { name: "JudgeAPI Remote Runner", status: "Executing test cases in isolated sandbox...", icon: Zap, done: true },
      { name: "Multi-Language Stubs", status: "C, C++, Java, Python, and JS ready", icon: FileCode2, done: true },
    ],
    reasoningLogs: [
      "→ Compiling solution across JudgeAPI sandbox container...",
      "→ Test Case 1: nums = [10,9,2,5,3,7,101,18] -> Output: 4 (Expected: 4) [PASSED]",
      "→ Test Case 2: nums = [0,1,0,3,2,3] -> Output: 4 (Expected: 4) [PASSED]",
      "→ Test Case 3: nums = [7,7,7,7,7,7,7] -> Output: 1 (Expected: 1) [PASSED]",
      "✓ All sample test cases passed in 12ms."
    ],
    diff: `class Solution {
public:
    int lengthOfLIS(vector<int>& nums) {
        vector<int> tails;
        for (int x : nums) {
            auto it = lower_bound(tails.begin(), tails.end(), x);
            if (it == tails.end()) tails.push_back(x);
            else *it = x;
        }
        return tails.size();
    }
};`
  },
  {
    id: "editorial",
    step: "03",
    name: "Editorial & Community",
    task: "Markdown Solutions & Stats",
    badge: "Accepted",
    tools: [
      { name: "React-MD Markdown Post", status: "Formatted LaTeX math $$O(n \\log n)$$", icon: BookOpen, done: true },
      { name: "Radial Progress Tracker", status: "Updated Medium solved count: +1", icon: CheckCircle2, done: true },
      { name: "Submission History Log", status: "Recorded runtime (12ms) & memory (14.2MB)", icon: Terminal, done: true },
    ],
    reasoningLogs: [
      "→ Solution verified and submitted to MongoDB persistence.",
      "→ User profile radial progress chart updated (+1 Medium problem).",
      "→ Shared editorial posted to Community Solutions Hub with KaTeX explanation.",
      "✓ Submission status: Accepted. Ranked in top 96.8% of global solutions."
    ],
    diff: `### Approach 2: Binary Search (Patience Sorting)
- **Time Complexity:** $$O(n \\log n)$$ — binary search for each of the $n$ elements.
- **Space Complexity:** $$O(n)$$ — array to store smallest tail of all increasing subsequences.`
  }
];

export default function AgenticSolutionsPanel() {
  const [activeStageId, setActiveStageId] = useState("monaco");

  const currentStage = WORKFLOW_STAGES.find((s) => s.id === activeStageId) || WORKFLOW_STAGES[0];

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto font-sans">
      
      {/* Section Header */}
      <div className="text-center space-y-3 mb-12">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/[0.04] dark:bg-white/[0.06] border border-black/[0.06] dark:border-white/[0.06] text-xs font-mono text-neutral-600 dark:text-neutral-300">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>Interactive DSA Workflow</span>
        </div>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-sans font-bold tracking-tight text-neutral-900 dark:text-white">
          A workspace where developers{" "}
          <br className="hidden sm:inline" />
          <span className="font-serif italic font-normal text-neutral-700 dark:text-neutral-300">
            and AI think together.
          </span>
        </h2>
        <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 max-w-xl mx-auto leading-relaxed">
          From problem formulation and hints to in-browser Monaco editing, remote JudgeAPI compilation, and mathematical Markdown editorials.
        </p>
      </div>

      {/* Main Dual-Pane Dark UI Mockup Container */}
      <div className="rounded-2xl bg-[#1A1917] dark:bg-[#121110] border border-[#383531] shadow-2xl overflow-hidden text-neutral-200">
        
        {/* Top Interactive Stage Selector Pills */}
        <div className="p-3 sm:p-4 border-b border-white/[0.08] bg-black/40 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-400/80 inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-400/80 inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-green-400/80 inline-block" />
            <span className="font-mono text-xs text-neutral-400 ml-2">problem/ 300-longest-increasing-subsequence</span>
          </div>

          <div className="flex items-center gap-2">
            {WORKFLOW_STAGES.map((stage) => (
              <button
                key={stage.id}
                onClick={() => setActiveStageId(stage.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-all flex items-center gap-2 border cursor-pointer ${
                  activeStageId === stage.id
                    ? "bg-white/15 border-white/30 text-white font-semibold shadow-xs"
                    : "bg-white/[0.03] border-white/[0.06] text-neutral-400 hover:text-neutral-200"
                }`}
              >
                <span className="text-[10px] opacity-60">{stage.step}</span>
                <span>{stage.name}</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-400/10 text-amber-300 font-sans">
                  {stage.task}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Dual-Pane Body */}
        <div className="grid grid-cols-1 md:grid-cols-12 divide-y md:divide-y-0 md:divide-x divide-white/[0.08]">
          
          {/* Left Column: Tool & Task Execution Pipeline */}
          <div className="md:col-span-5 p-5 sm:p-6 space-y-4 bg-[#161513]">
            <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
              <span className="text-xs font-mono uppercase tracking-wider text-neutral-400 font-semibold">
                Platform Pipeline
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                {currentStage.badge}
              </span>
            </div>

            <div className="space-y-2.5">
              {currentStage.tools.map((tool, idx) => {
                const IconComponent = tool.icon;
                return (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.05] flex items-center justify-between gap-3 hover:bg-white/[0.06] transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-white/[0.05] text-amber-300">
                        <IconComponent className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-medium text-white">{tool.name}</p>
                        <p className="text-[11px] text-neutral-400 font-mono">{tool.status}</p>
                      </div>
                    </div>

                    <div>
                      {tool.done ? (
                        <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs">
                          ✓
                        </div>
                      ) : (
                        <div className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-300 flex items-center justify-center text-xs animate-spin">
                          ⟳
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-2 text-[11px] text-neutral-500 font-mono">
              ⚡ Multi-language compiler: C, C++, Java, Python, JavaScript
            </div>
          </div>

          {/* Right Column: Reasoning Log & Diff Preview */}
          <div className="md:col-span-7 p-5 sm:p-6 bg-black/40 space-y-4 font-mono text-xs flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
                <span className="text-amber-300/90 flex items-center gap-1.5 font-semibold">
                  <Terminal className="w-3.5 h-3.5" />
                  <span>Execution & Intelligence Feed</span>
                </span>
                <span className="text-[10px] text-neutral-400">JudgeAPI: Online</span>
              </div>

              <div className="space-y-2 text-[11px] leading-relaxed text-neutral-300">
                {currentStage.reasoningLogs.map((log, lIdx) => (
                  <p
                    key={lIdx}
                    className={
                      log.startsWith("✓")
                        ? "text-emerald-400 font-semibold"
                        : log.startsWith("→")
                        ? "text-neutral-300"
                        : "text-neutral-400"
                    }
                  >
                    {log}
                  </p>
                ))}
              </div>

              {/* Code Box */}
              <div className="mt-4 p-3 rounded-xl bg-black/60 border border-white/[0.08]">
                <div className="text-[10px] text-neutral-500 pb-1 mb-1 border-b border-white/[0.04] flex items-center justify-between">
                  <span>Monaco Code View & Editorial</span>
                  <span className="text-emerald-400">Verified Solution</span>
                </div>
                <pre className="text-emerald-300/90 text-[11px] font-mono overflow-x-auto leading-relaxed">
                  <code>{currentStage.diff}</code>
                </pre>
              </div>
            </div>

            {/* Bottom Call to Action */}
            <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between font-sans">
              <span className="text-[11px] text-neutral-400">
                Ready to solve 3,500+ algorithmic challenges?
              </span>
              <Link
                href="/problems"
                className="px-4 py-1.5 rounded-full bg-white text-[#1C1B19] text-xs font-semibold hover:opacity-90 transition-opacity flex items-center gap-1.5 cursor-pointer"
              >
                <span>Open Problem Library</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
