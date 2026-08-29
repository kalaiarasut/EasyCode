"use client";

import React, { useRef, useState, useEffect } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import {
  Sparkles,
  ArrowRight,
  Check,
  CheckCircle2,
  Terminal,
  Cpu,
  Layers,
  Code2
} from "lucide-react";
import Link from "next/link";

const PROCESS_STEPS = [
  {
    number: "01",
    title: "Pick a Challenge",
    description: "Browse 3,500+ curated problems filtered by topic (DP, Graphs, Trees), difficulty (Easy/Medium/Hard), or target company.",
    header: "3,500+ Problem Catalog",
    tag: "Catalog Filter",
    content: (
      <div className="space-y-2.5 font-mono text-[11px] text-neutral-300">
        <div className="flex items-center justify-between text-neutral-400 pb-1.5 border-b border-white/[0.08]">
          <span>Company Tag: Google / Amazon</span>
          <span className="text-amber-400 font-medium">Medium Difficulty</span>
        </div>
        <p className="text-white font-semibold text-xs font-sans">Problem #42: Trapping Rain Water</p>
        <p className="text-neutral-400 font-sans text-[11px]">Topics: Two Pointers, Dynamic Programming, Monotonic Stack</p>
        <p className="text-neutral-400">Constraints: 1 &lt;= n &lt;= 2 * 10^4, 0 &lt;= height[i] &lt;= 10^5</p>
        <div className="p-2 rounded-lg bg-white/[0.04] border border-white/[0.06] flex items-center gap-2 text-neutral-300">
          <span className="text-amber-400">✓</span>
          <span>Loaded starter code in C++, Java, Python 3 & TypeScript</span>
        </div>
      </div>
    )
  },
  {
    number: "02",
    title: "Code with AI Guidance",
    description: "Write solutions in Monaco Editor with syntax highlighting while the AI Leet Bot provides progressive hints and time complexity breakdowns.",
    header: "Monaco Editor & AI Leet Bot",
    tag: "Real-time Hints",
    content: (
      <div className="space-y-2 font-sans text-xs">
        <div className="p-2.5 rounded-lg bg-white/[0.04] border border-white/[0.06] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 rounded bg-white/[0.08] text-neutral-200 text-[10px] flex items-center justify-center font-bold">✓</span>
            <span className="font-medium text-white">Intuition: Two Pointer Invariant</span>
          </div>
          <span className="text-[10px] font-mono text-neutral-400">O(1) space</span>
        </div>

        <div className="p-2.5 rounded-lg bg-white/[0.04] border border-white/[0.06] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 rounded bg-white/[0.08] text-neutral-200 text-[10px] flex items-center justify-center font-bold">✓</span>
            <span className="font-medium text-white">Edge Case: Monotonic Arrays</span>
          </div>
          <span className="text-[10px] font-mono text-neutral-400">Handled</span>
        </div>

        <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/25 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 rounded bg-amber-500/20 text-amber-300 text-[10px] flex items-center justify-center font-bold">⟳</span>
            <span className="font-medium text-amber-200">AI Complexity Verification</span>
          </div>
          <span className="text-[10px] font-mono text-amber-300/90 font-medium">O(N) Time Verified</span>
        </div>
      </div>
    )
  },
  {
    number: "03",
    title: "Run, Verify & Share",
    description: "Compile against JudgeAPI test cases, submit to permanently track your progress, and publish markdown solution posts to the community.",
    header: "JudgeAPI Remote Runner",
    tag: "Automated Judge",
    content: (
      <div className="space-y-3 font-mono text-xs">
        <div className="flex items-center justify-between pb-2 border-b border-white/[0.08]">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-emerald-500/20 text-emerald-400 font-bold text-[10px] flex items-center justify-center">
              ✓
            </div>
            <span className="font-bold text-white font-sans text-xs">Status: Accepted (14ms, 15.1MB)</span>
          </div>
          <span className="px-2 py-0.5 rounded bg-white/[0.06] text-neutral-300 text-[10px]">
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
            className="px-4 py-1.5 rounded-full bg-white text-neutral-950 text-xs font-semibold hover:bg-neutral-200 transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
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
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeStep, setActiveStep] = useState(0);

  // Track scroll through the timeline section
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 65%", "end 60%"],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 25,
    restDelta: 0.001
  });

  // Calculate moving venom mark position on the line (travels 0% -> 100%)
  const venomTop = useTransform(smoothProgress, [0, 1], ["0%", "100%"]);

  // Calculate active step dynamically based on scroll progress (ONLY the current step is active)
  useEffect(() => {
    return scrollYProgress.on("change", (latest) => {
      if (latest < 0.35) {
        setActiveStep(0);
      } else if (latest < 0.70) {
        setActiveStep(1);
      } else {
        setActiveStep(2);
      }
    });
  }, [scrollYProgress]);

  return (
    <section id="process" className="w-full relative overflow-hidden pt-12 sm:pt-16 pb-0 sm:pb-2 scroll-mt-20">
      
      {/* ════════════════════════════════════════════════════════════════════════
          FULL-BLEED EDITORIAL TORN PAPER HEADER (HIGH-CONTRAST IN DARK & LIGHT)
          ════════════════════════════════════════════════════════════════════════ */}
      <div className="w-full absolute top-0 inset-x-0 pointer-events-none -z-10 overflow-hidden">
        {/* Full-width Radial Parchment Ambient Wash */}
        <div className="w-full h-96 opacity-80 dark:opacity-35 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#DDD5C5] via-[#E8E2D5]/50 to-transparent dark:from-[#3E3832] dark:via-[#262320]/50 dark:to-transparent blur-2xl" />
        
        {/* Full-bleed Multi-layer Deckle Torn Paper SVG */}
        <svg
          className="absolute top-0 w-full h-28 sm:h-36 md:h-40 block text-[#DDD5C5] dark:text-[#38332E] preserve-3d"
          viewBox="0 0 1920 180"
          preserveAspectRatio="none"
          fill="currentColor"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Layer 1: Underneath fiber shadow */}
          <path
            opacity="0.45"
            className="text-[#C8BEAB] dark:text-[#2B2723]"
            d="M0,0 L1920,0 L1920,95 C1860,118 1800,82 1740,112 C1680,132 1620,88 1560,115 C1500,135 1440,92 1380,108 C1320,128 1260,85 1200,110 C1140,132 1080,88 1020,115 C960,138 900,92 840,118 C780,135 720,85 660,105 C600,128 540,82 480,110 C420,130 360,85 300,105 C240,125 180,82 120,108 C60,128 0,90 0,105 Z"
          />
          {/* Layer 2: Main torn deckle edge paper */}
          <path
            opacity="0.95"
            d="M0,0 L1920,0 L1920,70 C1860,92 1800,58 1740,84 C1680,105 1620,65 1560,88 C1500,108 1440,70 1380,85 C1320,105 1260,68 1200,90 C1140,110 1080,72 1020,94 C960,115 900,75 840,98 C780,115 720,68 660,88 C600,108 540,65 480,85 C420,105 360,65 300,88 C240,110 180,68 120,90 C60,110 0,72 0,82 Z"
          />
        </svg>
      </div>

      {/* ════════════════════════════════════════════════════════════════════════
          CENTERED SECTION CONTENT (MAX-W-6XL)
          ════════════════════════════════════════════════════════════════════════ */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header with exact 34 unit spacing below top paper border */}
        <div className="text-center space-y-3 pt-[136px] sm:pt-[136px] md:pt-[136px] mb-14 sm:mb-16 relative z-10">
          <div className="text-xs sm:text-[13px] font-sans font-semibold text-neutral-950 dark:text-white tracking-wide">
            Process
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-sans font-bold tracking-tight text-neutral-950 dark:text-white leading-[1.15]">
            From chaos to clarity{" "}
            <br className="hidden sm:inline" />
            <span className="font-serif italic font-normal text-[#38332B] dark:text-[#E8E4DB]">
              in 3 simple steps.
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 font-normal max-w-md mx-auto">
            Experience a disciplined, friction-free loop engineered for technical mastery.
          </p>
        </div>

        {/* ════════════════════════════════════════════════════════════════════════
            VERTICAL TIMELINE RAIL: 1 ----- 2 ----- 3 FLOW (IMAGE 1 REPLICA)
            ════════════════════════════════════════════════════════════════════════ */}
        <div ref={containerRef} className="relative">
          
          {/* Continuous Flow Line Track (Desktop & Tablet) */}
          <div className="hidden md:block absolute left-[21px] sm:left-[23px] top-6 bottom-6 w-[2px] bg-[#E5E2DC] dark:bg-[#33312E] z-0 overflow-hidden">
            {/* Animated Venom Traveling Line Mark (Moves along the wire like venom) */}
            <motion.div
              style={{ top: venomTop }}
              className="absolute left-0 w-full h-36 sm:h-44 -translate-y-1/2 bg-gradient-to-b from-transparent via-neutral-950 via-50% to-transparent dark:via-white shadow-[0_0_8px_rgba(0,0,0,0.4)] dark:shadow-[0_0_12px_rgba(255,255,255,0.7)]"
            />
          </div>

          <div className="space-y-10 sm:space-y-12 relative z-10">
            {PROCESS_STEPS.map((step, idx) => {
              const isStepActive = activeStep === idx;

              return (
                <div
                  key={step.number}
                  className="flex flex-col md:flex-row items-start gap-5 sm:gap-8 group"
                >
                  {/* ─────────────────────────────────────────────────────────────
                      1-2-3 NUMBER BADGE NODE (IMAGE 1 REPLICA: ONLY ACTIVE STEP IS DARK)
                      ───────────────────────────────────────────────────────────── */}
                  <div className="flex items-center gap-4 md:block shrink-0">
                    <div className="relative">
                      <motion.div
                        animate={{
                          backgroundColor: isStepActive ? "#111111" : "#F7F5F0",
                          color: isStepActive ? "#FFFFFF" : "#9E998F",
                          scale: isStepActive ? 1.08 : 1,
                        }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className={`w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center font-mono font-bold text-sm sm:text-base border ring-4 ring-[#FBF9F4] dark:ring-[#1C1B19] ${
                          isStepActive
                            ? "border-transparent dark:!bg-white dark:!text-[#111111] shadow-lg"
                            : "border-neutral-300/80 dark:!bg-[#201E1C] dark:!text-neutral-500 dark:border-neutral-700/60"
                        }`}
                      >
                        {step.number}
                      </motion.div>
                    </div>

                    {/* Mobile-only Step Title Strip */}
                    <div className="md:hidden">
                      <span className="text-xs font-mono font-semibold uppercase text-amber-600 dark:text-amber-400">
                        Step {step.number}
                      </span>
                      <h3 className="text-lg font-bold text-neutral-900 dark:text-white">
                        {step.title}
                      </h3>
                    </div>
                  </div>

                  {/* ─────────────────────────────────────────────────────────────
                      MAIN STEP CARD CONTAINER (IMAGE 1 REPLICA)
                      ───────────────────────────────────────────────────────────── */}
                  <div
                    className={`flex-1 w-full rounded-2xl sm:rounded-3xl p-5 sm:p-7 bg-white dark:bg-[#201E1C] border transition-all duration-300 shadow-xs hover:shadow-xl ${
                      isStepActive
                        ? "border-neutral-400/80 dark:border-neutral-600 shadow-md ring-1 ring-black/[0.04] dark:ring-white/[0.06]"
                        : "border-[#E8E4DB] dark:border-[#33302C]"
                    }`}
                  >
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                      
                      {/* Left Column: UI Mockup Preview Container */}
                      <div className="lg:col-span-7">
                        <div className="p-4 sm:p-5 rounded-2xl bg-[#141312] text-white border border-white/[0.08] shadow-inner relative overflow-hidden group/box">
                          {/* Mockup Header with Classic Mac Window Dots */}
                          <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/[0.08]">
                            <div className="flex items-center gap-1.5">
                              <span className="w-2.5 h-2.5 rounded-full bg-[#FF5F56] inline-block" />
                              <span className="w-2.5 h-2.5 rounded-full bg-[#FFBD2E] inline-block" />
                              <span className="w-2.5 h-2.5 rounded-full bg-[#27C93F] inline-block" />
                              <span className="text-[11px] font-mono text-neutral-400 ml-2">
                                {step.header}
                              </span>
                            </div>

                            <span className="px-2 py-0.5 rounded bg-white/[0.06] text-[10px] font-mono text-neutral-300">
                              {step.tag}
                            </span>
                          </div>

                          {step.content}
                        </div>
                      </div>

                      {/* Right Column: Step Explanations & Narrative */}
                      <div className="lg:col-span-5 space-y-3">
                        <div className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-black/[0.03] dark:bg-white/[0.05] border border-black/[0.04] dark:border-white/[0.06] text-[11px] font-mono text-neutral-600 dark:text-neutral-400">
                          <span>Phase {step.number}</span>
                        </div>

                        <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
                          {step.title}
                        </h3>

                        <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed font-normal">
                          {step.description}
                        </p>
                      </div>

                    </div>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════════════════
          FULL-BLEED FLIPPED UPSIDE-DOWN TORN PAPER FOOTER (SNUG TO STEP 03)
          ════════════════════════════════════════════════════════════════════════ */}
      <div className="w-full relative pointer-events-none overflow-hidden -mt-10 sm:-mt-14 -mb-6 sm:-mb-8">
        {/* Soft bottom parchment glow */}
        <div className="w-full h-24 sm:h-32 opacity-80 dark:opacity-35 bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-[#DDD5C5] via-[#E8E2D5]/50 to-transparent dark:from-[#3E3832] dark:via-[#262320]/50 dark:to-transparent blur-2xl" />

        {/* Flipped (Upside Down 180°) Deckle Paper Edge — Exactly matching Top SVG */}
        <div className="w-full rotate-180">
          <svg
            className="w-full h-28 sm:h-36 md:h-40 block text-[#DDD5C5] dark:text-[#38332E] preserve-3d"
            viewBox="0 0 1920 180"
            preserveAspectRatio="none"
            fill="currentColor"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Layer 1: Underneath fiber shadow */}
            <path
              opacity="0.45"
              className="text-[#C8BEAB] dark:text-[#2B2723]"
              d="M0,0 L1920,0 L1920,95 C1860,118 1800,82 1740,112 C1680,132 1620,88 1560,115 C1500,135 1440,92 1380,108 C1320,128 1260,85 1200,110 C1140,132 1080,88 1020,115 C960,138 900,92 840,118 C780,135 720,85 660,105 C600,128 540,82 480,110 C420,130 360,85 300,105 C240,125 180,82 120,108 C60,128 0,90 0,105 Z"
            />
            {/* Layer 2: Main torn deckle edge paper */}
            <path
              opacity="0.95"
              d="M0,0 L1920,0 L1920,70 C1860,92 1800,58 1740,84 C1680,105 1620,65 1560,88 C1500,108 1440,70 1380,85 C1320,105 1260,68 1200,90 C1140,110 1080,72 1020,94 C960,115 900,75 840,98 C780,115 720,68 660,88 C600,108 540,65 480,85 C420,105 360,65 300,88 C240,110 180,68 120,90 C60,110 0,72 0,82 Z"
            />
          </svg>
        </div>
      </div>

    </section>
  );
}
