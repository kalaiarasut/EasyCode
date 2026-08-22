"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Sparkles,
  GitBranch,
  Terminal,
  CheckCircle2,
  GitMerge,
  ArrowRight,
  Shield,
  Layers,
  FolderGit2,
  Code2,
  Zap,
  Play
} from "lucide-react";
import Link from "next/link";

const PROCESS_STEPS = [
  {
    number: "01",
    title: "Pick a Challenge",
    description: "Browse 3,500+ curated problems filtered by topic (DP, Graphs, Trees), difficulty (Easy/Medium/Hard), or target company.",
    header: "3,500+ Problem Catalog",
    content: (
      <div className="space-y-2 font-mono text-[11px] text-neutral-300">
        <div className="flex items-center justify-between text-neutral-400 pb-1 border-b border-white/[0.06]">
          <span>Company Tag: Google / Amazon</span>
          <span className="text-amber-400">Medium Difficulty</span>
        </div>
        <p className="text-white font-semibold">Problem #42: Trapping Rain Water</p>
        <p className="text-neutral-400">Topics: Two Pointers, Dynamic Programming, Monotonic Stack</p>
        <p className="text-neutral-300">Constraints: 1 &lt;= n &lt;= 2 * 10^4, 0 &lt;= height[i] &lt;= 10^5</p>
        <p className="text-emerald-400">✓ Loaded starter code templates across C++, Java, Python, and JS</p>
      </div>
    )
  },
  {
    number: "02",
    title: "Code with AI Guidance",
    description: "Write solutions in Monaco Editor with syntax highlighting while the AI Leet Bot provides progressive hints and time complexity breakdowns.",
    header: "Monaco Editor & AI Leet Bot",
    content: (
      <div className="space-y-2 font-sans text-xs">
        <div className="p-2.5 rounded-lg bg-white/[0.04] border border-white/[0.06] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] flex items-center justify-center font-bold">✓</span>
            <span className="font-medium text-white">Intuition: Two Pointer Invariant</span>
          </div>
          <span className="text-[10px] font-mono text-neutral-400">O(1) space</span>
        </div>

        <div className="p-2.5 rounded-lg bg-white/[0.04] border border-white/[0.06] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] flex items-center justify-center font-bold">✓</span>
            <span className="font-medium text-white">Edge Case: Empty or Monotonic Arrays</span>
          </div>
          <span className="text-[10px] font-mono text-neutral-400">Handled</span>
        </div>

        <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 rounded-full bg-amber-500/20 text-amber-300 text-[10px] flex items-center justify-center font-bold">⟳</span>
            <span className="font-medium text-amber-200">AI Complexity Verification</span>
          </div>
          <span className="text-[10px] font-mono text-amber-300/80">O(N) Time Verified</span>
        </div>
      </div>
    )
  },
  {
    number: "03",
    title: "Run, Verify & Share",
    description: "Compile against JudgeAPI test cases, submit to permanently track your progress, and publish markdown solution posts to the community.",
    header: "JudgeAPI Remote Runner",
    content: (
      <div className="space-y-3 font-mono text-xs">
        <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-emerald-500 text-white font-bold text-[11px] flex items-center justify-center">
              ✓
            </div>
            <span className="font-bold text-white">Status: Accepted (14ms, 15.1MB)</span>
          </div>
          <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px]">
            Passed 320/320
          </span>
        </div>

        <p className="text-[11px] text-neutral-400 font-sans">
          All test cases passed. User radial profile chart updated (+1 Hard Problem Solved).
        </p>

        <div className="pt-2 flex items-center justify-between font-sans">
          <span className="text-[10px] text-neutral-500 font-mono">language: C++20</span>
          <Link
            href="/solution"
            className="px-4 py-1.5 rounded-full bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <span>Share Solution</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    )
  }
];

export default function ProcessTimelineSection() {
  return (
    <section id="process" className="py-24 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto font-sans scroll-mt-20">
      
      {/* Section Header */}
      <div className="text-center space-y-3 mb-16">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/[0.04] dark:bg-white/[0.06] border border-black/[0.06] dark:border-white/[0.06] text-xs font-mono text-neutral-600 dark:text-neutral-300">
          <span>How It Works</span>
        </div>

        <h2 className="text-3xl sm:text-4xl md:text-5xl font-sans font-bold tracking-tight text-neutral-900 dark:text-white">
          From problem to accepted{" "}
          <br className="hidden sm:inline" />
          <span className="font-serif italic font-normal text-neutral-700 dark:text-neutral-300">
            in 3 simple steps.
          </span>
        </h2>
      </div>

      {/* Vertical Timeline & Stacked Cards */}
      <div className="relative">
        
        {/* Continuous Connecting Timeline Line on Desktop */}
        <div className="hidden md:block absolute left-8 top-12 bottom-12 w-0.5 bg-gradient-to-b from-amber-500/40 via-neutral-300 dark:via-neutral-700 to-emerald-500/40" />

        <div className="space-y-12">
          {PROCESS_STEPS.map((step) => (
            <div
              key={step.number}
              className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center"
            >
              {/* Timeline Indicator + Step Info */}
              <div className="md:col-span-5 flex items-start gap-5">
                {/* Number Badge with ambient glow */}
                <div className="w-16 h-16 rounded-2xl bg-[#1C1B19] text-white dark:bg-white dark:text-[#1C1B19] flex items-center justify-center font-mono font-bold text-xl shrink-0 shadow-lg border border-black/10 dark:border-white/20 relative z-10">
                  {step.number}
                </div>

                <div className="space-y-2 pt-1">
                  <h3 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
                    {step.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed font-normal">
                    {step.description}
                  </p>
                </div>
              </div>

              {/* Step UI Mockup Card */}
              <div className="md:col-span-7">
                <div className="p-5 sm:p-6 rounded-2xl bg-[#1C1B19] text-white border border-white/[0.08] shadow-xl relative overflow-hidden group">
                  {/* Top Bar with traffic dots */}
                  <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/[0.08]">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-red-400 inline-block" />
                      <span className="w-2 h-2 rounded-full bg-yellow-400 inline-block" />
                      <span className="w-2 h-2 rounded-full bg-green-400 inline-block" />
                      <span className="text-[11px] font-mono text-neutral-400 ml-2">
                        {step.header}
                      </span>
                    </div>
                  </div>

                  {step.content}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
