"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence, type Transition } from "framer-motion";
import {
  Sparkles,
  Tag,
  Lightbulb,
  Lock,
  ChevronRight,
  Copy,
  Check,
  Code2,
  Zap,
  AlertTriangle,
  TestTube,
  Layers,
  ArrowRight,
  ShieldAlert,
  Info,
} from "lucide-react";
import { toast } from "sonner";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { GeneratedProblem, GenerationSectionKey } from "@/types/generatedProblem";
import { useGammaOrchestrator } from "./useGammaOrchestrator";
import GammaProblemHUD from "./GammaProblemHUD";

interface GammaProblemCanvasProps {
  problem: GeneratedProblem | null;
  isGenerating?: boolean;
  onSolveInEditor?: (problem: GeneratedProblem) => void;
  onComplete?: (problem: GeneratedProblem) => void;
  className?: string;
}

export default function GammaProblemCanvas({
  problem,
  isGenerating = false,
  onSolveInEditor,
  onComplete,
  className = "",
}: GammaProblemCanvasProps) {
  const [currentViewMode, setCurrentViewMode] = useState<"visual" | "json" | "markdown">("visual");
  const [selectedLanguage, setSelectedLanguage] = useState<string>("python");
  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const [openHintIndex, setOpenHintIndex] = useState<number | null>(null);
  const [activeTestCaseTab, setActiveTestCaseTab] = useState<"visible" | "hidden">("visible");

  const {
    isCompleted,
    progressPercent,
    activeStageMeta,
    speed,
    isPaused,
    typewriterTitle,
    setSpeed,
    skipToEnd,
    replay,
    togglePause,
    isSectionVisible,
  } = useGammaOrchestrator({
    problem,
    isGenerating,
    onComplete,
  });

  // LeetCode exact difficulty colors
  const levelColorMap: Record<string, string> = {
    Easy: "rgb(28, 184, 184)",
    Medium: "rgb(255, 176, 24)",
    Hard: "rgb(255, 55, 95)",
  };

  const levelColor = problem?.level ? levelColorMap[problem.level] || levelColorMap["Medium"] : levelColorMap["Medium"];

  // Exact LeetCode typography & CSS styles matching ProblemPageDescription.tsx
  const codeStyle: React.CSSProperties = {
    fontFamily: "Menlo, Menlo-fallback, sans-serif",
    fontSize: "12px",
    lineHeight: "16px",
    borderRadius: "5px",
    padding: "2px 5px",
    display: "inline",
  };

  const preStyle: React.CSSProperties = {
    fontFamily: "Menlo, Menlo-fallback, sans-serif",
    fontSize: "13px",
    lineHeight: "22px",
    borderRadius: "8px",
  };

  const pStyle: React.CSSProperties = {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif',
    fontSize: "14px",
    lineHeight: "22px",
  };

  const labelStyle: React.CSSProperties = {
    fontWeight: 700,
    marginRight: "6px",
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    toast.success("Starter code copied to clipboard!");
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const starterCodeEntries = useMemo(() => {
    if (!problem?.starterCode) return [];
    return Object.entries(problem.starterCode).filter(([_, code]) => Boolean(code));
  }, [problem]);

  const activeStarterCode = useMemo(() => {
    if (!problem?.starterCode) return "";
    return (
      (problem.starterCode as any)[selectedLanguage] ||
      problem.starterCode.python ||
      problem.starterCode.cpp ||
      problem.starterCode.javascript ||
      ""
    );
  }, [problem, selectedLanguage]);

  // Spring animation transition configurations
  const sectionSpring: Transition = {
    type: "spring",
    stiffness: 260,
    damping: 24,
  };

  if (!problem) {
    return (
      <div className="w-full min-h-[400px] flex flex-col items-center justify-center p-8 text-center space-y-3">
        <Sparkles className="w-8 h-8 animate-spin text-emerald-500 opacity-80" />
        <div className="space-y-1">
          <p className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">
            Synthesizing Algorithmic Specification...
          </p>
          <p className="text-xs text-neutral-500 font-mono">
            Structuring test cases, mathematical invariants & constraints
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full flex flex-col bg-white dark:bg-[#1a1a1a] text-neutral-900 dark:text-neutral-100 ${className}`}>
      {/* HUD Bar */}
      <GammaProblemHUD
        isGenerating={isGenerating}
        isCompleted={isCompleted}
        progressPercent={progressPercent}
        activeStageMeta={activeStageMeta}
        speed={speed}
        isPaused={isPaused}
        currentViewMode={currentViewMode}
        problem={problem}
        onSetSpeed={setSpeed}
        onTogglePause={togglePause}
        onReplay={replay}
        onSkipToEnd={skipToEnd}
        onChangeViewMode={setCurrentViewMode}
        onSolveInEditor={onSolveInEditor ? () => onSolveInEditor(problem) : undefined}
      />

      {/* VIEW 1: RAW JSON SCHEMA */}
      {currentViewMode === "json" && (
        <div className="p-4">
          <div className="rounded-xl bg-[#141414] p-4 border border-neutral-800 text-xs font-mono text-emerald-400 overflow-x-auto">
            <pre className="whitespace-pre-wrap leading-relaxed">{JSON.stringify(problem, null, 2)}</pre>
          </div>
        </div>
      )}

      {/* VIEW 2: MARKDOWN VIEW */}
      {currentViewMode === "markdown" && (
        <div className="p-4">
          <div className="rounded-xl bg-[#141414] p-4 border border-neutral-800 text-xs font-mono text-neutral-300 overflow-x-auto whitespace-pre-wrap leading-relaxed">
            {`# ${problem.title} (${problem.level})

## Problem Statement
${problem.description}

## Constraints
${problem.constraints.map((c) => `- \`${c}\``).join("\n")}

## Walkthrough Examples
${problem.examples.map((ex, i) => `### Example ${i + 1}\n**Input:** \`${ex.input}\`\n**Output:** \`${ex.output}\`\n${ex.explanation ? `**Explanation:** ${ex.explanation}` : ""}`).join("\n\n")}

## Expected Complexity
- **Time:** \`${problem.expectedComplexity?.time || "O(N)"}\`
- **Space:** \`${problem.expectedComplexity?.space || "O(1)"}\`
`}
          </div>
        </div>
      )}

      {/* VIEW 3: LIVE ANIMATED VISUAL CANVAS */}
      {currentViewMode === "visual" && (
        <div className="w-full flex flex-col p-4 md:p-6 select-text space-y-6">
          
          {/* 1. TITLE & METADATA SECTION */}
          {isSectionVisible("title") ? (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={sectionSpring}
              className="space-y-3"
            >
              {/* Title with Typewriter effect */}
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <h1 className="text-2xl md:text-[26px] font-semibold text-neutral-950 dark:text-white tracking-tight flex items-center">
                  <span>{typewriterTitle}</span>
                  {!isCompleted && (
                    <motion.span
                      animate={{ opacity: [1, 0, 1] }}
                      transition={{ duration: 0.8, repeat: Infinity }}
                      className="inline-block w-2 h-6 bg-emerald-500 ml-1 rounded-xs"
                    />
                  )}
                </h1>

                {/* Status Indicator */}
                <div className="flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                  <span>Draft Spec</span>
                  <Check className="w-3.5 h-3.5" />
                </div>
              </div>

              {/* Badges Row (Difficulty + Topics + Hints + Complexity) */}
              {isSectionVisible("difficulty") && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.92 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={sectionSpring}
                  className="flex items-center flex-wrap gap-2 pt-1"
                >
                  {/* Difficulty Badge */}
                  <span
                    style={{ color: levelColor }}
                    className="text-xs font-semibold px-2.5 py-1 rounded-full bg-black/[0.04] dark:bg-white/[0.06] border border-black/[0.05] dark:border-white/[0.08] shadow-2xs"
                  >
                    {problem.level}
                  </span>

                  {/* Topics Pills */}
                  {problem.topics.map((t, idx) => (
                    <motion.span
                      key={t}
                      initial={{ opacity: 0, x: -4 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05, ...sectionSpring }}
                      className="text-xs font-medium px-2.5 py-1 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 flex items-center gap-1"
                    >
                      <Tag className="w-3 h-3 opacity-60" />
                      <span>{t}</span>
                    </motion.span>
                  ))}

                  {/* Expected Complexity Chip */}
                  {problem.expectedComplexity && (
                    <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 flex items-center gap-1">
                      <Zap className="w-3 h-3" />
                      <span>{problem.expectedComplexity.time}</span>
                    </span>
                  )}
                </motion.div>
              )}
            </motion.div>
          ) : (
            /* Morphing Title Skeleton */
            <div className="space-y-2.5 animate-pulse">
              <div className="h-7 w-3/4 bg-neutral-200 dark:bg-neutral-800 rounded-md" />
              <div className="flex gap-2">
                <div className="h-6 w-16 bg-neutral-200 dark:bg-neutral-800 rounded-full" />
                <div className="h-6 w-24 bg-neutral-200 dark:bg-neutral-800 rounded-full" />
                <div className="h-6 w-20 bg-neutral-200 dark:bg-neutral-800 rounded-full" />
              </div>
            </div>
          )}

          {/* 2. PROBLEM STATEMENT / DESCRIPTION */}
          {isSectionVisible("description") ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={sectionSpring}
              className="space-y-3 pt-1"
            >
              <div
                style={pStyle}
                className="text-neutral-800 dark:text-neutral-200 leading-relaxed whitespace-pre-line text-sm md:text-[15px]"
              >
                {problem.description}
              </div>
            </motion.div>
          ) : (
            /* Morphing Description Skeleton */
            <div className="space-y-2 animate-pulse pt-2">
              <div className="h-4 w-full bg-neutral-200 dark:bg-neutral-800 rounded" />
              <div className="h-4 w-5/6 bg-neutral-200 dark:bg-neutral-800 rounded" />
              <div className="h-4 w-4/6 bg-neutral-200 dark:bg-neutral-800 rounded" />
            </div>
          )}

          {/* 3. CONSTRAINTS SECTION */}
          {isSectionVisible("constraints") ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={sectionSpring}
              className="space-y-2.5 pt-2"
            >
              <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-neutral-500" />
                <span>Constraints:</span>
              </h3>
              <ul className="space-y-1.5 pl-4 list-disc text-xs text-neutral-700 dark:text-neutral-300">
                {problem.constraints.map((constraint, idx) => (
                  <motion.li
                    key={idx}
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05, ...sectionSpring }}
                    className="leading-relaxed"
                  >
                    <code
                      style={codeStyle}
                      className="bg-black/[0.04] dark:bg-white/[0.06] text-neutral-900 dark:text-neutral-200 border border-black/[0.04] dark:border-white/[0.06]"
                    >
                      {constraint}
                    </code>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          ) : (
            /* Morphing Constraints Skeleton */
            <div className="space-y-2 animate-pulse pt-2">
              <div className="h-4 w-28 bg-neutral-200 dark:bg-neutral-800 rounded" />
              <div className="h-3 w-1/2 bg-neutral-200 dark:bg-neutral-800 rounded" />
              <div className="h-3 w-2/5 bg-neutral-200 dark:bg-neutral-800 rounded" />
            </div>
          )}

          {/* 4. WALKTHROUGH EXAMPLES (ONE BY ONE DECK ANIMATION) */}
          {isSectionVisible("examples") ? (
            <div className="space-y-4 pt-2">
              <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-neutral-500" />
                <span>Walkthrough Examples:</span>
              </h3>

              <div className="space-y-3.5">
                {problem.examples.map((example, idx) => (
                  <motion.div
                    key={example.id || idx}
                    initial={{ opacity: 0, y: 14, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ delay: idx * 0.12, ...sectionSpring }}
                    style={preStyle}
                    className="p-3.5 bg-black/[0.02] dark:bg-white/[0.02] border-l-4 border-neutral-300 dark:border-neutral-700 border-y border-r border-black/[0.04] dark:border-white/[0.04] text-xs space-y-1.5 font-mono shadow-2xs"
                  >
                    <div className="font-semibold text-neutral-900 dark:text-neutral-100 pb-1 font-sans text-xs flex items-center justify-between">
                      <span>Example {idx + 1}:</span>
                      <span className="text-[10px] text-neutral-400 font-mono">Sample {idx + 1}</span>
                    </div>

                    <div>
                      <strong style={labelStyle} className="text-neutral-800 dark:text-neutral-200">
                        Input:
                      </strong>
                      <span className="text-neutral-700 dark:text-neutral-300">{example.input}</span>
                    </div>

                    <div>
                      <strong style={labelStyle} className="text-neutral-800 dark:text-neutral-200">
                        Output:
                      </strong>
                      <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{example.output}</span>
                    </div>

                    {example.explanation && (
                      <div className="pt-1 text-neutral-600 dark:text-neutral-400 leading-relaxed font-sans text-xs">
                        <strong style={labelStyle} className="text-neutral-800 dark:text-neutral-200">
                          Explanation:
                        </strong>
                        <span>{example.explanation}</span>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>
          ) : (
            /* Morphing Examples Skeleton */
            <div className="space-y-3 animate-pulse pt-2">
              <div className="h-4 w-36 bg-neutral-200 dark:bg-neutral-800 rounded" />
              <div className="h-24 w-full bg-neutral-200 dark:bg-neutral-800 rounded-lg" />
              <div className="h-24 w-full bg-neutral-200 dark:bg-neutral-800 rounded-lg" />
            </div>
          )}

          {/* 5. TEST CASES MATRIX (VISIBLE VS HIDDEN) */}
          {isSectionVisible("testCases") && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={sectionSpring}
              className="space-y-3 pt-2"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-1.5">
                  <TestTube className="w-4 h-4 text-neutral-500" />
                  <span>Test Cases Matrix:</span>
                </h3>

                {/* Tabs for Visible vs Hidden */}
                <div className="flex items-center bg-black/[0.04] dark:bg-white/[0.04] rounded-lg p-0.5 text-xs">
                  <button
                    onClick={() => setActiveTestCaseTab("visible")}
                    className={`px-2 py-0.5 rounded text-[11px] font-medium transition-all ${
                      activeTestCaseTab === "visible"
                        ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-2xs font-semibold"
                        : "text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
                    }`}
                  >
                    Sample ({problem.testCases?.visible?.length || 0})
                  </button>
                  <button
                    onClick={() => setActiveTestCaseTab("hidden")}
                    className={`px-2 py-0.5 rounded text-[11px] font-medium transition-all ${
                      activeTestCaseTab === "hidden"
                        ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-2xs font-semibold"
                        : "text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
                    }`}
                  >
                    Hidden ({problem.testCases?.hidden?.length || 0})
                  </button>
                </div>
              </div>

              {/* Test Cases Table */}
              <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 overflow-hidden bg-black/[0.01] dark:bg-white/[0.01]">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-black/[0.03] dark:bg-white/[0.03] border-b border-neutral-200 dark:border-neutral-800 font-sans text-neutral-600 dark:text-neutral-400">
                    <tr>
                      <th className="p-2.5">#</th>
                      <th className="p-2.5">Input</th>
                      <th className="p-2.5">Expected Output</th>
                      <th className="p-2.5 text-right">Validation</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                    {(activeTestCaseTab === "visible"
                      ? problem.testCases?.visible || []
                      : problem.testCases?.hidden || []
                    ).map((tc, idx) => (
                      <motion.tr
                        key={idx}
                        initial={{ opacity: 0, x: -6 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05, ...sectionSpring }}
                        className="hover:bg-black/[0.02] dark:hover:bg-white/[0.02]"
                      >
                        <td className="p-2.5 text-neutral-400">{idx + 1}</td>
                        <td className="p-2.5 text-neutral-800 dark:text-neutral-200 truncate max-w-[200px]">
                          {tc.input}
                        </td>
                        <td className="p-2.5 text-emerald-600 dark:text-emerald-400 font-semibold">{tc.output}</td>
                        <td className="p-2.5 text-right">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-sans ${
                              activeTestCaseTab === "visible"
                                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                : "bg-neutral-500/10 text-neutral-500"
                            }`}
                          >
                            {activeTestCaseTab === "visible" ? "Public" : "Stress / Edge"}
                          </span>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {/* 6. EDGE CASES CALLOUT */}
          {isSectionVisible("edgeCases") && problem.edgeCases && problem.edgeCases.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={sectionSpring}
              className="space-y-3 pt-2"
            >
              <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <span>Critical Edge Cases & Invariants:</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                {problem.edgeCases.map((ec, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.08, ...sectionSpring }}
                    className="p-3 rounded-xl bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/20 space-y-1 text-xs"
                  >
                    <div className="font-semibold text-amber-700 dark:text-amber-400 flex items-center justify-between">
                      <span>{ec.category}</span>
                      <span className="text-[10px] font-mono text-amber-600/70">Edge #{idx + 1}</span>
                    </div>
                    <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed font-mono text-[11px]">
                      Scenario: {ec.scenario}
                    </p>
                    <p className="text-neutral-600 dark:text-neutral-400 text-[11px] leading-relaxed">
                      Expected: {ec.expectedBehavior}
                    </p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* 7. STARTER CODE PREVIEW */}
          {isSectionVisible("starterCode") && activeStarterCode && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={sectionSpring}
              className="space-y-2.5 pt-2"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-1.5">
                  <Code2 className="w-4 h-4 text-neutral-500" />
                  <span>Starter Code Template:</span>
                </h3>

                {/* Language Switcher Tabs */}
                {starterCodeEntries.length > 1 && (
                  <div className="flex items-center bg-black/[0.04] dark:bg-white/[0.04] rounded-lg p-0.5 text-xs">
                    {starterCodeEntries.map(([lang]) => (
                      <button
                        key={lang}
                        onClick={() => setSelectedLanguage(lang)}
                        className={`px-2 py-0.5 rounded text-[11px] font-mono capitalize transition-all ${
                          selectedLanguage === lang
                            ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-2xs font-semibold"
                            : "text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
                        }`}
                      >
                        {lang}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Code Box */}
              <div className="rounded-xl bg-[#121212] border border-neutral-800 p-3.5 text-xs font-mono text-neutral-200 relative group overflow-hidden">
                <div className="flex items-center justify-between pb-2 border-b border-neutral-800 text-[11px] text-neutral-400 uppercase">
                  <span>{selectedLanguage} boilerplate</span>
                  <button
                    onClick={() => handleCopyCode(activeStarterCode)}
                    className="flex items-center gap-1 text-neutral-400 hover:text-white transition-colors cursor-pointer"
                  >
                    {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedCode ? "Copied" : "Copy"}</span>
                  </button>
                </div>
                <pre className="mt-2 overflow-x-auto p-1 leading-relaxed text-emerald-400/90 whitespace-pre-wrap">
                  {activeStarterCode}
                </pre>
              </div>
            </motion.div>
          )}

          {/* 8. PROGRESSIVE HINTS & ACCORDIONS */}
          {isSectionVisible("hints") && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={sectionSpring}
              className="w-full pt-4 border-t border-neutral-200 dark:border-neutral-800 divide-y divide-neutral-200 dark:divide-neutral-800 text-xs"
            >
              {problem.hints.map((hint, idx) => (
                <Collapsible
                  key={idx}
                  open={openHintIndex === idx}
                  onOpenChange={(isOpen) => setOpenHintIndex(isOpen ? idx : null)}
                  className="w-full py-3"
                >
                  <CollapsibleTrigger className="flex items-center justify-between w-full text-left group hover:text-neutral-900 dark:hover:text-white transition-colors cursor-pointer">
                    <div className="flex items-center gap-2.5 font-medium text-neutral-700 dark:text-neutral-300">
                      <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                      <span>Hint {idx + 1}</span>
                    </div>
                    <ChevronRight
                      className={`w-3.5 h-3.5 text-neutral-400 transition-transform duration-200 ${
                        openHintIndex === idx ? "rotate-90" : ""
                      }`}
                    />
                  </CollapsibleTrigger>
                  <CollapsibleContent className="pt-2.5 text-neutral-600 dark:text-neutral-400 leading-relaxed font-sans text-xs">
                    {hint}
                  </CollapsibleContent>
                </Collapsible>
              ))}

              {/* Follow-Up Variant */}
              {isSectionVisible("followUp") && problem.followUp?.prompt && (
                <div className="py-3.5 space-y-1">
                  <div className="flex items-center gap-2 font-semibold text-neutral-900 dark:text-neutral-100">
                    <Sparkles className="w-3.5 h-3.5 text-blue-500" />
                    <span>Follow-up Challenge:</span>
                  </div>
                  <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed text-xs pl-5">
                    {problem.followUp.prompt}
                  </p>
                  {problem.followUp.hintOrDirection && (
                    <p className="text-neutral-500 text-[11px] pl-5 italic">
                      Direction: {problem.followUp.hintOrDirection}
                    </p>
                  )}
                </div>
              )}
            </motion.div>
          )}

          {/* 9. BOTTOM ACTION CARD: READY TO SOLVE */}
          {isCompleted && onSolveInEditor && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, ...sectionSpring }}
              className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-blue-500/10 border border-emerald-500/20 flex items-center justify-between gap-4 flex-wrap"
            >
              <div className="space-y-0.5">
                <h4 className="text-sm font-bold text-neutral-900 dark:text-white flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-emerald-500" />
                  <span>Problem Generation Complete</span>
                </h4>
                <p className="text-xs text-neutral-600 dark:text-neutral-300">
                  Ready to code your solution against these test cases?
                </p>
              </div>

              <button
                onClick={() => onSolveInEditor(problem)}
                className="flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white dark:bg-emerald-500 dark:hover:bg-emerald-400 dark:text-neutral-950 shadow-md hover:shadow-lg transition-all cursor-pointer"
              >
                <Code2 className="w-4 h-4" />
                <span>Open in Monaco Editor</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          )}

        </div>
      )}
    </div>
  );
}
