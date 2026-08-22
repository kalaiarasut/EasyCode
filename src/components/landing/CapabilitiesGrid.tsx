"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Code2,
  GitBranch,
  Terminal,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  Cpu,
  Layers,
  CheckCircle2,
  Lock,
  BookOpen,
  Zap
} from "lucide-react";

const CAPABILITIES = [
  {
    id: "judge-api",
    icon: Zap,
    title: "Multi-Language JudgeAPI Sandbox",
    description: "Compile and execute code across C, C++, Java, Python 3, and JavaScript in real time with automated test case validation, execution time (ms), and memory profiling.",
    learnMoreText: "Solve in Sandbox",
    learnMoreHref: "/problems",
    previewCode: `// JudgeAPI Remote Compilation Output:
Status: Accepted ✓
Runtime: 14 ms (faster than 97.4% of C++ submissions)
Memory Usage: 14.8 MB (less than 92.1% of submissions)
Test Cases: 48/48 Passed`
  },
  {
    id: "ai-models",
    icon: Cpu,
    title: "20+ Frontier AI Models & BYOK",
    description: "Connect your own API keys for Claude 3.7 Sonnet, DeepSeek R1, Gemini 2.5 Pro, and Groq LPUs to brainstorm intuition, explain Big-O complexity, and generate custom challenges.",
    learnMoreText: "Explore Models",
    learnMoreHref: "/workspace",
    previewCode: `// Multi-Provider Routing:
Active Model: deepseek-r1 (Reasoning SOTA)
Context Window: 64k tokens
Prompt: "Explain state transition for 0/1 Knapsack with 1D array"
Output: dp[w] = max(dp[w], val[i] + dp[w - wt[i]])`
  },
  {
    id: "monaco-editor",
    icon: Terminal,
    title: "Monaco Editor (VS Code Engine)",
    description: "Industry-standard code editor with full syntax highlighting, bracket pairing, auto-indentation, and multi-language starter stubs for seamless problem solving.",
    learnMoreText: "Open Monaco",
    learnMoreHref: "/problems",
    previewCode: `class Solution {
public:
    vector<vector<int>> levelOrder(TreeNode* root) {
        // VS Code Intellisense & Syntax Highlighting
        vector<vector<int>> ans;
        if (!root) return ans;
        ...
    }
};`
  },
  {
    id: "solutions-hub",
    icon: BookOpen,
    title: "Community Solutions & Markdown Hub",
    description: "Write and share formatted solution posts with `@uiw/react-md-editor`, LaTeX math formulas ($$O(N)$$), and discuss optimal time/space complexity approaches.",
    learnMoreText: "Browse Solutions",
    learnMoreHref: "/solution",
    previewCode: `### Approach: Two Pointers with Sliding Window
- **Time Complexity:** $$O(N)$$ — each character is visited at most twice.
- **Space Complexity:** $$O(\\min(N, M))$$ — hash map for character frequencies.
- **Key Invariant:** \`right - left + 1\` represents valid window size.`
  }
];

export default function CapabilitiesGrid() {
  const [activeCard, setActiveCard] = useState<string | null>(null);

  return (
    <section id="capabilities" className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto font-sans scroll-mt-20">
      
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16 pb-6 border-b border-[#E8E4DB] dark:border-[#2D2B28]">
        <div className="space-y-3 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/[0.04] dark:bg-white/[0.06] border border-black/[0.06] dark:border-white/[0.06] text-xs font-mono text-neutral-600 dark:text-neutral-300">
            <span>Core Capabilities</span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-sans font-bold tracking-tight text-neutral-900 dark:text-white">
            Built for developers who{" "}
            <br className="hidden sm:inline" />
            <span className="font-serif italic font-normal text-neutral-700 dark:text-neutral-300">
              master the craft of code.
            </span>
          </h2>
        </div>

        <div className="max-w-md text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed font-normal">
          Every feature in EasyCode is built to remove friction from competitive programming, algorithm brainstorming, and interview preparation.
        </div>
      </div>

      {/* 2x2 Feature Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {CAPABILITIES.map((cap) => {
          const IconComponent = cap.icon;

          return (
            <div
              key={cap.id}
              onMouseEnter={() => setActiveCard(cap.id)}
              onMouseLeave={() => setActiveCard(null)}
              className="p-7 sm:p-8 rounded-2xl bg-white dark:bg-[#201E1C] border border-[#E8E4DB] dark:border-[#383531] shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group relative overflow-hidden"
            >
              {/* Subtle top warm highlight glow on hover */}
              <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-amber-500/0 via-amber-500/40 to-amber-500/0 opacity-0 group-hover:opacity-100 transition-opacity" />

              <div className="space-y-4">
                {/* Header: Icon + Learn More Link */}
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-black/[0.04] dark:bg-white/[0.06] border border-black/[0.04] dark:border-white/[0.06] flex items-center justify-center text-neutral-800 dark:text-neutral-200 group-hover:scale-105 transition-transform">
                    <IconComponent className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                  </div>

                  <Link
                    href={cap.learnMoreHref}
                    className="inline-flex items-center gap-1 text-xs font-mono font-medium text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors"
                  >
                    <span>{cap.learnMoreText}</span>
                    <span className="transition-transform group-hover:translate-x-0.5">›</span>
                  </Link>
                </div>

                {/* Title & Description */}
                <div>
                  <h3 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-white mb-2">
                    {cap.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed font-normal">
                    {cap.description}
                  </p>
                </div>
              </div>

              {/* Code / Snippet Box inside Card */}
              <div className="mt-6 p-3.5 rounded-xl bg-[#171614] border border-white/[0.06] text-neutral-300 font-mono text-[11px]">
                <pre className="overflow-x-auto leading-relaxed">
                  <code>{cap.previewCode}</code>
                </pre>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
