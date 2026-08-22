"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Terminal,
  Play,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Code,
  Cpu,
  Layers,
  FileCode,
  Shield,
  Zap,
  CornerDownLeft,
  RotateCcw,
  BookOpen
} from "lucide-react";

interface HeroSectionProps {
  onOpenDemo?: () => void;
}

const REASONING_PRESETS = [
  {
    id: "two-sum-opt",
    title: "JUDGEAPI: TWO_SUM.PY",
    status: "Accepted ✓",
    file: "two_sum.py",
    language: "Python 3",
    prompt: "Optimize Two Sum from O(n²) brute force to O(n) one-pass hash map with 100% test coverage",
    logLines: [
      "Connecting to JudgeAPI Sandbox & Claude 3.7 Sonnet Reasoning Engine...",
      "Algorithmic Analysis & Intuition:",
      "→ Identified O(n²) nested loop in initial submission",
      "→ Synthesizing one-pass Hash Map: complement = target - nums[i]",
      "→ Compiling in remote sandboxed runtime (Python 3.11)...",
      "→ Evaluating JudgeAPI test suite: 58/58 test cases passed",
      "✓ Accepted: Runtime 18ms (beats 96.4%), Memory 15.2MB (O(n) space)."
    ],
    codeSnippet: `class Solution:
    def twoSum(self, nums: list[int], target: int) -> list[int]:
        seen = {}
        for i, num in enumerate(nums):
            complement = target - num
            if complement in seen:
                return [seen[complement], i]
            seen[num] = i
        return []`
  },
  {
    id: "lru-cache-cpp",
    title: "JUDGEAPI: LRU_CACHE.CPP",
    status: "Accepted ✓",
    file: "lru_cache.cpp",
    language: "C++20",
    prompt: "Design an LRU Cache with O(1) time complexity for get and put operations using list & map",
    logLines: [
      "Connecting to DeepSeek R1 Algorithmic Proof Pipeline...",
      "Algorithmic Analysis & Intuition:",
      "→ Combining std::list<std::pair<int, int>> for eviction order",
      "→ Linking std::unordered_map for O(1) key-to-node iterator lookup",
      "→ Compiling via GCC 13 with -O3 optimization...",
      "→ Stress testing: 100,000 get/put calls executed in 22ms",
      "✓ Accepted: Runtime 42ms (beats 98.2%), Memory 28.4MB (O(capacity) space)."
    ],
    codeSnippet: `class LRUCache {
    int cap;
    list<pair<int, int>> lru;
    unordered_map<int, list<pair<int, int>>::iterator> mp;
public:
    LRUCache(int capacity) : cap(capacity) {}
    int get(int key) {
        if (!mp.count(key)) return -1;
        lru.splice(lru.begin(), lru, mp[key]);
        return mp[key]->second;
    }
};`
  },
  {
    id: "dp-grid-java",
    title: "JUDGEAPI: UNIQUE_PATHS_II.JAVA",
    status: "Accepted ✓",
    file: "UniquePathsWithObstacles.java",
    language: "Java 17",
    prompt: "Solve Dynamic Programming grid paths with obstacles using space-optimized 1D state array",
    logLines: [
      "Connecting to Gemini 2.5 Pro Competitive Problem Setter...",
      "Algorithmic Analysis & Intuition:",
      "→ Formulating state transition: dp[j] = dp[j] + dp[j-1]",
      "→ Handling obstacle collision: if grid[i][j] == 1 set dp[j] = 0",
      "→ Compiling in OpenJDK 17 sandbox...",
      "→ Validating 42 edge cases including 1x1 obstacle grids...",
      "✓ Accepted: Runtime 0ms (beats 100%), Memory 40.1MB (O(n) auxiliary space)."
    ],
    codeSnippet: `class Solution {
    public int uniquePathsWithObstacles(int[][] obstacleGrid) {
        int m = obstacleGrid.length, n = obstacleGrid[0].length;
        int[] dp = new int[n];
        dp[0] = (obstacleGrid[0][0] == 0) ? 1 : 0;
        for (int[] row : obstacleGrid) {
            for (int j = 0; j < n; j++) {
                if (row[j] == 1) dp[j] = 0;
                else if (j > 0) dp[j] += dp[j - 1];
            }
        }
        return dp[n - 1];
    }
}`
  }
];

export default function HeroSection({ onOpenDemo }: HeroSectionProps) {
  const [activePresetIndex, setActivePresetIndex] = useState(0);
  const [visibleLinesCount, setVisibleLinesCount] = useState(0);
  const [typedPrompt, setTypedPrompt] = useState("");

  const activePreset = REASONING_PRESETS[activePresetIndex];

  // Typing effect for the prompt input bar
  useEffect(() => {
    setTypedPrompt("");
    setVisibleLinesCount(0);

    let charIndex = 0;
    const targetText = activePreset.prompt;

    const typeInterval = setInterval(() => {
      if (charIndex < targetText.length) {
        setTypedPrompt(targetText.slice(0, charIndex + 1));
        charIndex++;
      } else {
        clearInterval(typeInterval);
      }
    }, 22);

    return () => clearInterval(typeInterval);
  }, [activePresetIndex]);

  // Line-by-line stream animation for reasoning path
  useEffect(() => {
    const streamInterval = setInterval(() => {
      setVisibleLinesCount((prev) => {
        if (prev < activePreset.logLines.length) {
          return prev + 1;
        }
        return prev;
      });
    }, 450);

    return () => clearInterval(streamInterval);
  }, [activePresetIndex, activePreset.logLines.length]);

  return (
    <section className="relative min-h-[92vh] pt-24 pb-16 overflow-hidden flex flex-col justify-between">
      
      {/* ATMOSPHERIC BACKGROUND VISTA: Warm Sand, Ivory Mist, & Layered Desert Mountain Silhouettes */}
      <div className="absolute inset-0 pointer-events-none -z-10 overflow-hidden">
        
        {/* Warm ambient background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#F9F7F1] via-[#F4EFE6] to-[#EAE3D2] dark:from-[#171614] dark:via-[#1A1917] dark:to-[#121110] transition-colors duration-500" />
        
        {/* Top subtle golden morning glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[60rem] h-[28rem] bg-gradient-to-b from-amber-200/20 via-orange-100/10 to-transparent dark:from-amber-500/10 dark:via-orange-500/5 dark:to-transparent rounded-full blur-3xl opacity-80" />

        {/* Mountain Landscape Vector Artwork / Terrain Backdrop */}
        <div className="absolute bottom-0 left-0 right-0 w-full h-[450px] opacity-70 dark:opacity-40">
          <svg
            className="w-full h-full object-cover object-bottom"
            viewBox="0 0 1440 450"
            fill="none"
            preserveAspectRatio="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Distant peaks with misty haze */}
            <path
              d="M0 240L140 180L320 270L540 150L760 250L980 140L1180 230L1340 170L1440 220V450H0V240Z"
              fill="url(#distantPeaks)"
              opacity="0.5"
            />
            {/* Midground rocky ridge */}
            <path
              d="M0 310L190 230L380 320L620 210L860 300L1080 190L1290 280L1440 240V450H0V310Z"
              fill="url(#midPeaks)"
              opacity="0.75"
            />
            {/* Foreground canyon stone silhouettes */}
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

        {/* Misty bottom gradient blend */}
        <div className="absolute bottom-0 inset-x-0 h-32 bg-gradient-to-t from-[#FBF9F4] dark:from-[#1C1B19] to-transparent" />
      </div>

      {/* HERO COPY CONTAINER */}
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

        {/* Cinematic Headline mixing Sans and Italic Serif */}
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

        {/* Dual CTA Buttons - Styled matching reference img 2 */}
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

      {/* FLOATING DARK AGENT CONSOLE UI PANEL */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 w-full pt-10">
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="rounded-2xl bg-[#1D1B18]/95 dark:bg-[#141312]/95 border border-[#3A3630]/80 dark:border-[#2D2A26] shadow-2xl overflow-hidden backdrop-blur-2xl text-neutral-200 font-sans"
        >
          
          {/* Top Panel Bar */}
          <div className="px-4 py-3 border-b border-white/[0.08] flex flex-wrap items-center justify-between gap-3 bg-black/30">
            
            {/* Traffic Light Dots + Title */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#E55B5B]/80 inline-block" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#E5B55B]/80 inline-block" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#5BE57D]/80 inline-block" />
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-xs text-white">EasyCode Intelligence</span>
                <span className="text-[11px] text-neutral-400 hidden sm:inline">
                  JudgeAPI Multi-Language Sandbox & 20+ Frontier AI Models
                </span>
              </div>
            </div>

            {/* Live Interactive Status Badges / Preset Selector - Styled matching img 2 */}
            <div className="flex items-center gap-2">
              {REASONING_PRESETS.map((preset, idx) => (
                <button
                  key={preset.id}
                  onClick={() => setActivePresetIndex(idx)}
                  className={`px-3 py-1.5 rounded-lg text-[11px] font-mono transition-all flex items-center gap-2 border cursor-pointer ${
                    activePresetIndex === idx
                      ? "bg-white/[0.14] border-white/25 text-white font-semibold shadow-xs"
                      : "bg-white/[0.04] border-white/[0.07] text-neutral-300 hover:text-white hover:bg-white/[0.08]"
                  }`}
                >
                  <span>{preset.title}</span>
                  <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 font-sans font-medium text-[10px]">
                    {preset.status}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Action Tools Filter Bar */}
          <div className="px-4 py-2 border-b border-white/[0.05] flex items-center justify-between text-[11px] font-mono text-neutral-400 bg-black/10">
            <div className="flex items-center gap-3">
              <span className="px-2 py-0.5 rounded bg-white/[0.08] text-neutral-200 flex items-center gap-1">
                <Code className="w-3 h-3 text-amber-400" />
                <span>Monaco Code Editor</span>
              </span>
              <span className="hidden sm:inline-flex items-center gap-1 hover:text-neutral-200 transition-colors cursor-pointer">
                <span>JudgeAPI Test Cases</span>
              </span>
              <span className="hidden sm:inline-flex items-center gap-1 hover:text-neutral-200 transition-colors cursor-pointer">
                <span>AI Leet Bot Hints</span>
              </span>
              <span className="hidden md:inline-flex items-center gap-1 hover:text-neutral-200 transition-colors cursor-pointer">
                <span>Big-O Complexity</span>
              </span>
              <span className="hidden md:inline-flex items-center gap-1 hover:text-neutral-200 transition-colors cursor-pointer">
                <span>Markdown Editorial</span>
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-[10px] text-neutral-500">
              <Cpu className="w-3 h-3 text-emerald-400" />
              <span>Language: {activePreset.language}</span>
            </div>
          </div>

          {/* Prompt Simulation Bar */}
          <div className="p-4 bg-black/20 border-b border-white/[0.05]">
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.06] text-xs font-mono text-neutral-200">
              <span className="text-neutral-500 select-none">|</span>
              <span className="text-neutral-300 truncate">
                {typedPrompt}
                <span className="inline-block w-1.5 h-3.5 bg-amber-400 ml-0.5 animate-pulse align-middle" />
              </span>
            </div>
          </div>

          {/* Dual-Pane Code & Reasoning Area */}
          <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-white/[0.08] min-h-[220px]">
            
            {/* Left: Streaming Monospace Reasoning Log */}
            <div className="lg:col-span-7 p-4 sm:p-5 font-mono text-xs space-y-2 bg-[#171614]/60">
              <div className="flex items-center justify-between text-[11px] text-neutral-400 pb-1 border-b border-white/[0.04]">
                <span className="text-amber-300/90 flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3" />
                  <span>AI Algorithmic Breakdown</span>
                </span>
                <span className="text-[10px] text-neutral-500">
                  Target: <strong className="text-neutral-300">{activePreset.file}</strong>
                </span>
              </div>

              <div className="space-y-1.5 pt-1 text-[11px] leading-relaxed">
                {activePreset.logLines.slice(0, visibleLinesCount).map((line, lIdx) => (
                  <motion.div
                    key={lIdx}
                    initial={{ opacity: 0, x: -5 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2 }}
                    className={
                      line.startsWith("✓")
                        ? "text-emerald-400 font-semibold"
                        : line.startsWith("→")
                        ? "text-neutral-300 pl-2"
                        : "text-neutral-400"
                    }
                  >
                    {line}
                  </motion.div>
                ))}

                {visibleLinesCount < activePreset.logLines.length && (
                  <div className="flex items-center gap-2 text-neutral-500 text-[10px] pt-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                    <span>Analyzing Big-O complexity & memory footprint...</span>
                  </div>
                )}
              </div>
            </div>

            {/* Right: Generated Refactor Diff Preview */}
            <div className="lg:col-span-5 p-4 sm:p-5 font-mono text-[11px] bg-black/40 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-[10px] text-neutral-400 pb-2 border-b border-white/[0.04] mb-2">
                  <span className="text-neutral-300 font-semibold">Solution Code (Monaco Editor)</span>
                  <span className="px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    Compiled ({activePreset.language})
                  </span>
                </div>

                <pre className="text-neutral-300 overflow-x-auto leading-tight font-mono text-[11px] py-1">
                  <code>{activePreset.codeSnippet}</code>
                </pre>
              </div>

              <div className="pt-3 mt-2 border-t border-white/[0.04] flex items-center justify-between text-[10px] text-neutral-400">
                <span>All 58 test assertions verified</span>
                <Link
                  href="/problems"
                  className="text-amber-300 hover:text-amber-200 flex items-center gap-1 font-sans font-medium"
                >
                  <span>Solve in Monaco</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
