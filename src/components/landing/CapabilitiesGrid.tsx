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
    icon: "5+",
    iconComponent: Zap,
    title: "5 Languages (C, C++, Java, Py, JS)",
    description: "Compile and execute code across 5 core languages (C, C++, Java, Python 3, JavaScript) in real time with automated test case validation, execution time (ms), and memory profiling.",
    learnMoreText: "Learn more",
    learnMoreHref: "/problems",
  },
  {
    id: "ai-models",
    icon: "20+",
    iconComponent: Cpu,
    title: "20+ Frontier AI Models & BYOK",
    description: "Connect your own API keys for Claude Opus 5, GPT-5.6 Sol, Gemini 3.7 Flash, and DeepSeek R2 to brainstorm intuition, explain Big-O complexity, and generate custom challenges.",
    learnMoreText: "Learn more",
    learnMoreHref: "/workspace",
  },
  {
    id: "monaco-editor",
    icon: ">_",
    iconComponent: Terminal,
    title: "Monaco Editor (VS Code Engine)",
    description: "Industry-standard code editor with full syntax highlighting, bracket pairing, auto-indentation, and multi-language starter stubs for seamless problem solving.",
    learnMoreText: "Learn more",
    learnMoreHref: "/problems",
  },
  {
    id: "solutions-hub",
    icon: "O(N)",
    iconComponent: BookOpen,
    title: "Community Solutions & Markdown Hub",
    description: "Write and share formatted solution posts with rich markdown, LaTeX math formulas (O(N)), and discuss optimal time/space complexity approaches.",
    learnMoreText: "Learn more",
    learnMoreHref: "/solution",
  }
];

export default function CapabilitiesGrid() {
  const [activeCard, setActiveCard] = useState<string | null>(null);

  return (
    <section
      id="capabilities"
      className="w-full bg-[#F3F0E8] dark:bg-[#171614] py-20 sm:py-28 scroll-mt-20 transition-colors duration-300"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 font-sans">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
          <div className="space-y-3">
            <div className="text-xs sm:text-[13px] font-sans font-semibold text-neutral-950 dark:text-white tracking-wide">
              Capabilities
            </div>

            <h2 className="text-3xl sm:text-4xl md:text-5xl font-sans font-bold tracking-tight text-neutral-950 dark:text-white leading-[1.12]">
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

        {/* 2x2 Feature Cards Grid (Exact Style from Reference Image) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {CAPABILITIES.map((cap) => {
            return (
              <div
                key={cap.id}
                onMouseEnter={() => setActiveCard(cap.id)}
                onMouseLeave={() => setActiveCard(null)}
                className="p-8 sm:p-10 rounded-3xl bg-white dark:bg-[#1E1C1A] border border-black/[0.04] dark:border-white/[0.06] shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between group relative overflow-hidden"
              >
                <div>
                  {/* Top Bar: Clean Box Icon on Left + 'Learn more >' Pill on Right */}
                  <div className="flex items-center justify-between">
                    <div className="w-11 h-11 rounded-xl bg-[#F0EEEA] dark:bg-white/[0.08] flex items-center justify-center text-neutral-800 dark:text-neutral-200 font-mono text-sm font-semibold group-hover:scale-105 transition-transform">
                      {cap.icon}
                    </div>

                    <Link
                      href={cap.learnMoreHref}
                      className="px-3.5 py-1.5 rounded-xl bg-[#F0EEEA] dark:bg-white/[0.08] hover:bg-[#E6E3DC] dark:hover:bg-white/[0.12] text-xs font-semibold text-neutral-800 dark:text-neutral-200 inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <span>{cap.learnMoreText}</span>
                      <span className="text-neutral-400 dark:text-neutral-500 font-normal">›</span>
                    </Link>
                  </div>

                  {/* Title & Description */}
                  <div className="mt-8 space-y-2">
                    <h3 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-white">
                      {cap.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed font-normal">
                      {cap.description}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
