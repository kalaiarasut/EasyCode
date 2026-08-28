"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
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
  ArrowRight,
  Paperclip,
  Mic,
  ArrowUp,
  RotateCcw,
  Globe,
  Share2,
  Moon,
  Sun,
  Key,
  FolderOpen,
  ZoomIn,
  ZoomOut,
  Maximize2
} from "lucide-react";

const EXPLANATION_PROMPT =
  "Explain Problem #300: Longest Increasing Subsequence with step-by-step intuition, an interactive Mermaid flowchart of the binary search patience sorting logic, and an animated vector SVG diagram of the state array transitions.";

const THINKING_TRACE = `1. Analyzing Problem #300: Longest Increasing Subsequence (LIS).
2. Given integer array nums = [10, 9, 2, 5, 3, 7, 101, 18].
3. Evaluating standard DP: dp[i] = max(dp[j] + 1) for j < i and nums[j] < nums[i] -> Time Complexity O(n²), Space Complexity O(n).
4. Optimizing via Patience Sorting + Binary Search (std::lower_bound):
   - Maintain auxiliary array 'tails' where tails[i] stores smallest tail of all increasing subsequences of length i+1.
   - For each num: binary search in 'tails'. If num > all elements, append. Else, replace first element >= num.
   - Time Complexity: O(n log n), Space Complexity: O(n).
5. Synthesizing visual assets:
   - Constructing Mermaid decision hierarchy for binary search routing.
   - Rendering clean vector SVG showing tails array progression from [10] -> [9] -> [2] -> [2,5] -> [2,3] -> [2,3,7] -> [2,3,7,101] -> [2,3,7,18].`;

export default function HeroSection({ onOpenDemo }: { onOpenDemo?: () => void }) {
  // Typing simulation state
  const [typedPrompt, setTypedPrompt] = useState("");
  const [isPromptDone, setIsPromptDone] = useState(false);
  const [generationStage, setGenerationStage] = useState<
    "typing" | "thinking" | "explanation" | "flowchart" | "svg" | "completed"
  >("typing");

  const [isThinkingOpen, setIsThinkingOpen] = useState(true);
  const [isCopied, setIsCopied] = useState(false);

  // 1. Slow Typing of the explanation prompt
  useEffect(() => {
    let charIdx = 0;
    setTypedPrompt("");
    setIsPromptDone(false);
    setGenerationStage("typing");

    const timer = setInterval(() => {
      if (charIdx < EXPLANATION_PROMPT.length) {
        setTypedPrompt(EXPLANATION_PROMPT.slice(0, charIdx + 1));
        charIdx++;
      } else {
        clearInterval(timer);
        setIsPromptDone(true);
        setTimeout(() => {
          setGenerationStage("thinking");
          setIsThinkingOpen(true);
        }, 400);
      }
    }, 20);

    return () => clearInterval(timer);
  }, []);

  // 2. Stage Progression for live token generation
  useEffect(() => {
    if (generationStage === "thinking") {
      const thinkingTimer = setTimeout(() => {
        setGenerationStage("explanation");
      }, 1400);
      return () => clearTimeout(thinkingTimer);
    }

    if (generationStage === "explanation") {
      const explTimer = setTimeout(() => {
        setGenerationStage("flowchart");
      }, 1200);
      return () => clearTimeout(explTimer);
    }

    if (generationStage === "flowchart") {
      const fcTimer = setTimeout(() => {
        setGenerationStage("svg");
      }, 1200);
      return () => clearTimeout(fcTimer);
    }

    if (generationStage === "svg") {
      const doneTimer = setTimeout(() => {
        setGenerationStage("completed");
      }, 800);
      return () => clearTimeout(doneTimer);
    }
  }, [generationStage]);

  const handleCopy = () => {
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleRestart = () => {
    setTypedPrompt("");
    setIsPromptDone(false);
    setGenerationStage("typing");
    setIsThinkingOpen(false);
    let charIdx = 0;
    const timer = setInterval(() => {
      if (charIdx < EXPLANATION_PROMPT.length) {
        setTypedPrompt(EXPLANATION_PROMPT.slice(0, charIdx + 1));
        charIdx++;
      } else {
        clearInterval(timer);
        setIsPromptDone(true);
        setTimeout(() => {
          setGenerationStage("thinking");
          setIsThinkingOpen(true);
        }, 400);
      }
    }, 20);
  };

  return (
    <section className="relative min-h-[92vh] pt-24 pb-16 overflow-hidden flex flex-col justify-between font-sans">
      
      {/* ATMOSPHERIC BACKGROUND VISTA */}
      <div className="absolute inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#F9F7F1] via-[#F4EFE6] to-[#EAE3D2] dark:from-[#171614] dark:via-[#1A1917] dark:to-[#121110] transition-colors duration-500" />
        
        {/* Mountain Landscape Vector Artwork */}
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
        
        {/* Eyebrow Badge */}
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

        {/* Cinematic Headline */}
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

        {/* Subcopy */}
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-sm sm:text-base md:text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto leading-relaxed font-normal"
        >
          EasyCode unites 3,500+ LeetCode challenges, Monaco-powered multi-language execution in C, C++, Java, Python, and JS via JudgeAPI, and 20+ frontier AI reasoning models to accelerate your technical interview prep.
        </motion.p>

        {/* Dual CTA Buttons */}
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

      {/* SHOWCASE 1: EXACT 100% REPLICA OF AiWorkspace.tsx */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 w-full pt-10">
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="rounded-2xl bg-[#FBF9F4] dark:bg-[#1C1B19] border border-[#DFDAD0] dark:border-[#383532] shadow-2xl overflow-hidden text-[#1C1B19] dark:text-[#EDEDEB] transition-colors duration-300"
        >
          
          {/* Top Header Bar (Exact match to AiWorkspace.tsx line 2650-2790) */}
          <div className="h-13 px-4 sm:px-6 border-b border-[#DFDAD0] dark:border-[#2D2A26] bg-[#FBF9F4] dark:bg-[#1C1B19] flex items-center justify-between">
            
            {/* Left: Brand Logo + Separator + Mode Pill + Model Dropdown */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 font-bold text-sm tracking-tight text-[#1A1918] dark:text-[#F3F2F0]">
                <div className="w-7 h-7 rounded-lg bg-[#1C1B19] dark:bg-white flex items-center justify-center text-white dark:text-[#1C1B19] shadow-xs font-mono font-bold text-xs">
                  E
                </div>
                <span className="hidden sm:inline">EasyCode</span>
              </div>

              <div className="h-4 w-px bg-[#DFDAD0] dark:bg-[#383532] mx-0.5 hidden sm:block" />

              {/* Mode Dropdown Selector from AiWorkspace.tsx */}
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#DCD7CC] dark:border-[#3A3733] bg-white/60 dark:bg-white/[0.03] text-xs font-medium text-[#1C1B19] dark:text-neutral-200 shadow-2xs">
                <span>Algorithm Optimizer</span>
                <ChevronDown className="w-3 h-3 text-neutral-400" />
              </div>

              {/* Model Dropdown Selector from AiWorkspace.tsx */}
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[#DCD7CC] dark:border-[#3A3733] bg-white/60 dark:bg-white/[0.03] text-xs font-medium text-[#1C1B19] dark:text-neutral-200 shadow-2xs">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                <span className="font-semibold truncate max-w-[120px]">Claude 3.7 Sonnet</span>
                <span className="text-[10px] text-neutral-400 hidden md:inline">Anthropic • Hybrid SOTA</span>
                <ChevronDown className="w-3 h-3 text-neutral-400" />
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleRestart}
                className="p-1.5 rounded-lg border border-[#DCD7CC] dark:border-[#3A3733] bg-white/60 dark:bg-white/[0.03] text-[#4A4640] dark:text-[#C5C2BA] hover:text-black dark:hover:text-white transition-colors cursor-pointer shadow-2xs"
                title="Restart simulation"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>

              <button className="text-xs font-medium px-3 py-1.5 rounded-lg border border-[#DCD7CC] dark:border-[#3A3733] bg-white/60 dark:bg-white/[0.03] text-[#4A4640] dark:text-[#C5C2BA] shadow-2xs flex items-center gap-1.5">
                <Share2 className="w-3.5 h-3.5 opacity-70" />
                <span className="hidden sm:inline">Share</span>
              </button>

              <div className="w-7 h-7 rounded-lg bg-[#3A3733] text-white dark:bg-white dark:text-[#1C1B19] flex items-center justify-center text-xs font-semibold shadow-xs">
                U
              </div>
            </div>
          </div>

          {/* Main Workspace Feed Area */}
          <div className="p-5 sm:p-7 space-y-5 max-h-[540px] overflow-y-auto bg-[#FBF9F4] dark:bg-[#1C1B19] text-xs sm:text-sm leading-relaxed transition-colors duration-300">
            
            {/* Prompt Session Header */}
            <div className="space-y-1 pb-3 border-b border-[#DFDAD0]/60 dark:border-[#2D2A26]">
              <div className="text-[11px] font-mono uppercase tracking-wider text-[#7A756C] dark:text-[#8C8880]">
                Workspace Session • Algorithm Deep Dive
              </div>
              <h3 className="text-base sm:text-lg font-bold text-[#1C1B19] dark:text-white leading-snug">
                {typedPrompt}
                {!isPromptDone && (
                  <span className="inline-block w-1.5 h-4 bg-amber-600 dark:bg-amber-400 ml-1 animate-pulse align-middle" />
                )}
              </h3>
            </div>

            {/* AI Agent Response Stream */}
            {generationStage !== "typing" && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                {/* 1. Exact ThinkingProcessBlock.tsx component replica */}
                <div className="not-prose">
                  <button
                    type="button"
                    onClick={() => setIsThinkingOpen(!isThinkingOpen)}
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/[0.03] dark:bg-white/[0.05] border border-black/[0.08] dark:border-white/[0.08] text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:bg-black/[0.06] dark:hover:bg-white/[0.08] hover:text-neutral-950 dark:hover:text-white transition-all cursor-pointer select-none shadow-2xs"
                  >
                    <Brain
                      className={`w-3.5 h-3.5 ${
                        generationStage === "thinking"
                          ? "text-amber-500 animate-pulse"
                          : "text-neutral-500 dark:text-neutral-400"
                      }`}
                    />
                    {generationStage === "thinking" ? (
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
                      {THINKING_TRACE}
                    </motion.div>
                  )}
                </div>

                {/* 2. Step-by-Step Narrative Explanation with Math Tokens */}
                {(generationStage === "explanation" ||
                  generationStage === "flowchart" ||
                  generationStage === "svg" ||
                  generationStage === "completed") && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-3 text-neutral-800 dark:text-neutral-200"
                  >
                    <p>
                      <strong className="text-neutral-900 dark:text-white">Step 1 (The Optimal Subsequence Invariant):</strong> Standard dynamic programming stores the LIS ending at each index with quadratic <code className="px-1.5 py-0.5 rounded bg-black/[0.05] dark:bg-white/[0.08] font-mono text-xs text-neutral-900 dark:text-neutral-100 border border-black/[0.04] dark:border-white/[0.06]">O(n²)</code> complexity.
                    </p>
                    <p>
                      <strong className="text-neutral-900 dark:text-white">Step 2 (Patience Sorting & Binary Search):</strong> By maintaining an auxiliary array <code className="px-1.5 py-0.5 rounded bg-black/[0.05] dark:bg-white/[0.08] font-mono text-xs text-neutral-900 dark:text-neutral-100 border border-black/[0.04] dark:border-white/[0.06]">tails</code> where <code className="px-1.5 py-0.5 rounded bg-black/[0.05] dark:bg-white/[0.08] font-mono text-xs">tails[i]</code> stores the smallest tail of all valid increasing subsequences of length <code className="px-1.5 py-0.5 rounded bg-black/[0.05] dark:bg-white/[0.08] font-mono text-xs">i + 1</code>, each number can be routed using binary search in <code className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-mono text-xs font-bold border border-emerald-500/20">O(n log n)</code> time.
                    </p>
                  </motion.div>
                )}

                {/* 3. Exact MermaidFlowchartViewer.tsx component replica */}
                {(generationStage === "flowchart" ||
                  generationStage === "svg" ||
                  generationStage === "completed") && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#1a1a1a] overflow-hidden shadow-xs"
                  >
                    {/* Header */}
                    <div className="px-3.5 py-2 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50 flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs font-medium text-neutral-800 dark:text-neutral-200">
                        <Network className="w-3.5 h-3.5 text-neutral-500" />
                        <span>Mermaid Flowchart: Binary Search Patience Sort</span>
                      </div>
                      <div className="flex items-center gap-1 text-neutral-500">
                        <button onClick={handleCopy} className="p-1 hover:text-black dark:hover:text-white">
                          {isCopied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                        </button>
                      </div>
                    </div>

                    {/* Flowchart Diagram Visual */}
                    <div className="p-4 overflow-x-auto bg-white dark:bg-[#1a1a1a]">
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
                    </div>
                  </motion.div>
                )}

                {/* 4. Exact SvgDiagramViewer.tsx component replica */}
                {(generationStage === "svg" || generationStage === "completed") && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#1a1a1a] overflow-hidden shadow-xs"
                  >
                    {/* Header */}
                    <div className="px-3.5 py-2 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50 flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs font-medium text-neutral-800 dark:text-neutral-200">
                        <FileCode className="w-3.5 h-3.5 text-neutral-500" />
                        <span>Vector SVG Visualizer: State Array Progression</span>
                      </div>
                      <button
                        onClick={handleCopy}
                        className="px-2 py-0.5 rounded-md border border-neutral-200 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 flex items-center gap-1 text-[10px] font-mono"
                      >
                        {isCopied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                        <span>{isCopied ? "Copied" : "Copy SVG"}</span>
                      </button>
                    </div>

                    {/* SVG Diagram Canvas */}
                    <div className="p-4 overflow-x-auto bg-white dark:bg-[#1a1a1a]">
                      <svg className="w-full h-24" viewBox="0 0 680 90" fill="none">
                        <text x="10" y="24" className="fill-neutral-500 dark:fill-neutral-400" fontSize="10" fontFamily="monospace">Input: nums = [10, 9, 2, 5, 3, 7, 101, 18]</text>
                        
                        <text x="10" y="58" className="fill-neutral-800 dark:fill-neutral-200" fontSize="11" fontFamily="monospace" fontWeight="bold">tails array:</text>
                        
                        <g transform="translate(100, 40)">
                          <rect x="0" y="0" width="45" height="32" rx="6" className="fill-blue-50 dark:fill-blue-950/40 stroke-blue-500" strokeWidth="1.5" />
                          <text x="22" y="21" className="fill-blue-700 dark:fill-blue-300" fontSize="13" fontFamily="monospace" textAnchor="middle" fontWeight="bold">2</text>
                          <text x="22" y="-5" className="fill-neutral-400" fontSize="9" fontFamily="monospace" textAnchor="middle">idx 0</text>

                          <rect x="55" y="0" width="45" height="32" rx="6" className="fill-blue-50 dark:fill-blue-950/40 stroke-blue-500" strokeWidth="1.5" />
                          <text x="77" y="21" className="fill-blue-700 dark:fill-blue-300" fontSize="13" fontFamily="monospace" textAnchor="middle" fontWeight="bold">3</text>
                          <text x="77" y="-5" className="fill-neutral-400" fontSize="9" fontFamily="monospace" textAnchor="middle">idx 1</text>

                          <rect x="110" y="0" width="45" height="32" rx="6" className="fill-blue-50 dark:fill-blue-950/40 stroke-blue-500" strokeWidth="1.5" />
                          <text x="132" y="21" className="fill-blue-700 dark:fill-blue-300" fontSize="13" fontFamily="monospace" textAnchor="middle" fontWeight="bold">7</text>
                          <text x="132" y="-5" className="fill-neutral-400" fontSize="9" fontFamily="monospace" textAnchor="middle">idx 2</text>

                          <rect x="165" y="0" width="45" height="32" rx="6" className="fill-emerald-50 dark:fill-emerald-950/40 stroke-emerald-500" strokeWidth="1.5" />
                          <text x="187" y="21" className="fill-emerald-700 dark:fill-emerald-400" fontSize="13" fontFamily="monospace" textAnchor="middle" fontWeight="bold">18</text>
                          <text x="187" y="-5" className="fill-neutral-400" fontSize="9" fontFamily="monospace" textAnchor="middle">idx 3</text>

                          {/* Result Callout */}
                          <g transform="translate(230, 4)">
                            <rect x="0" y="0" width="190" height="26" rx="13" className="fill-emerald-500/10 stroke-emerald-500/30" strokeWidth="1" />
                            <text x="95" y="17" className="fill-emerald-700 dark:fill-emerald-300" fontSize="11" fontFamily="sans-serif" textAnchor="middle" fontWeight="bold">
                              ✓ LIS Length = 4 (O(n log n))
                            </text>
                          </g>
                        </g>
                      </svg>
                    </div>
                  </motion.div>
                )}

              </motion.div>
            )}

          </div>

          {/* EXACT FLOATING PROMPT BOX REPLICA FROM AiWorkspace.tsx (line 2100-2450) */}
          <div className="p-3 sm:p-4 bg-[#FBF9F4] dark:bg-[#1C1B19] border-t border-[#DFDAD0] dark:border-[#2D2A26]">
            <div className="rounded-2xl border border-[#DFDAD0] dark:border-[#383532] bg-[#ECE8DF] dark:bg-[#282624] p-3 shadow-xs">
              
              <div className="text-xs text-[#8C877D] dark:text-[#736F68] px-1 pb-2">
                Ask a follow-up algorithm question or request test case traces...
              </div>

              {/* Toolbar in single row matching AiWorkspace.tsx */}
              <div className="pt-2 border-t border-black/[0.04] dark:border-white/[0.04] flex items-center justify-between gap-2">
                
                <div className="flex items-center gap-1.5 flex-wrap">
                  {/* Plus button */}
                  <button className="w-8 h-8 rounded-xl border border-black/[0.08] dark:border-white/[0.1] bg-white/70 dark:bg-white/[0.04] text-[#1C1B19] dark:text-neutral-300 flex items-center justify-center cursor-pointer shadow-2xs">
                    <Plus className="w-4 h-4" />
                  </button>

                  {/* Model Pill Button from AiWorkspace */}
                  <div className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-xl border border-black/[0.08] dark:border-white/[0.1] bg-white/70 dark:bg-white/[0.04] text-[#1C1B19] dark:text-[#EDEDEB] shadow-2xs font-medium cursor-pointer">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                    <span>Claude 3.7 Sonnet</span>
                    <ChevronDown className="w-3 h-3 opacity-60 ml-0.5" />
                  </div>

                  {/* Visual Engine Pill */}
                  <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border border-black/[0.08] dark:border-white/[0.1] bg-white/70 dark:bg-white/[0.04] text-[#1C1B19] dark:text-[#EDEDEB] shadow-2xs">
                    <FileCode className="w-3.5 h-3.5 opacity-60" />
                    <span>Vector SVG Engine</span>
                  </span>
                </div>

                {/* Right: Mic & Submit button */}
                <div className="flex items-center gap-1.5">
                  <button className="p-1.5 rounded-lg text-[#7A756C] dark:text-[#8C8880] hover:text-black dark:hover:text-white transition-colors cursor-pointer">
                    <Mic className="w-4 h-4" />
                  </button>

                  <Link
                    href="/workspace"
                    className="w-8 h-8 rounded-xl bg-[#1C1B19] dark:bg-white text-white dark:text-[#1C1B19] flex items-center justify-center shadow-xs hover:opacity-90 transition-opacity cursor-pointer"
                    title="Launch Workspace"
                  >
                    <ArrowUp className="w-4 h-4" />
                  </Link>
                </div>

              </div>

            </div>
          </div>

        </motion.div>
      </div>
    </section>
  );
}
