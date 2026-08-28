"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, Transition } from "framer-motion";
import {
  Sparkles,
  Check,
  Tag,
  Zap,
} from "lucide-react";
import { GeneratedProblem, GenerationSectionKey } from "@/types/generatedProblem";
import { useGammaOrchestrator } from "./useGammaOrchestrator";
import GammaProblemHUD from "./GammaProblemHUD";
import ProblemPageCollapseButton from "../ProblemPageCollapseButton";

interface GammaProblemCanvasProps {
  problem: GeneratedProblem | null;
  isGenerating?: boolean;
  onSolveInEditor?: (problem: GeneratedProblem) => void;
  onComplete?: (problem: GeneratedProblem) => void;
  className?: string;
}

// Clean LaTeX and mathematical markup into clean LeetCode styled plain text
function cleanLatexMath(raw: string): string {
  if (!raw) return "";
  let cleaned = raw
    .replace(/\\mathcal\{O\}\(([^)]+)\)/g, "O($1)")
    .replace(/\\mathcal\{O\}/g, "O")
    .replace(/\$\$([\s\S]*?)\$\$/g, (_, math) => cleanMathFormula(math))
    .replace(/\$([^$\n]+)\$/g, (_, math) => cleanMathFormula(math))
    .replace(/\\text\{([^}]+)\}/g, "$1")
    .replace(/\\mathrm\{([^}]+)\}/g, "$1")
    .replace(/\\mathbf\{([^}]+)\}/g, "$1")
    .replace(/\\max/g, "max")
    .replace(/\\min/g, "min")
    .replace(/\\times/g, " * ")
    .replace(/\\cdot/g, " * ")
    .replace(/\\le/g, "<=")
    .replace(/\\ge/g, ">=")
    .replace(/\\ne/g, "!=")
    .replace(/\\in/g, " in ")
    .replace(/\\alpha/g, "alpha")
    .replace(/\\beta/g, "beta")
    .replace(/\\gamma/g, "gamma")
    .replace(/\\epsilon/g, "epsilon")
    .replace(/\\Delta/g, "delta")
    .replace(/\\approx/g, "≈")
    .replace(/\\quad/g, " ")
    .replace(/\\qquad/g, "  ")
    .replace(/\\_/g, "_");

  // Auto-wrap bare Big-O complexity (e.g. O(1), O(N), O(log N)) in backticks
  cleaned = cleaned.replace(/(?<![`\w])(O\([a-zA-Z0-9_+\-*\/^ ]+\))(?![`\w])/g, "`$1`");
  return cleaned;
}

function cleanMathFormula(math: string): string {
  let cleaned = math
    .replace(/\\text\{([^}]+)\}/g, "$1")
    .replace(/\\mathrm\{([^}]+)\}/g, "$1")
    .replace(/\\mathbf\{([^}]+)\}/g, "$1")
    .replace(/\\max/g, "max")
    .replace(/\\min/g, "min")
    .replace(/\\times/g, " * ")
    .replace(/\\cdot/g, " * ")
    .replace(/\\le/g, "<=")
    .replace(/\\ge/g, ">=")
    .replace(/\\ne/g, "!=")
    .replace(/\\in/g, " in ")
    .replace(/\\alpha/g, "alpha")
    .replace(/\\beta/g, "beta")
    .replace(/\\gamma/g, "gamma")
    .replace(/\\epsilon/g, "epsilon")
    .replace(/\\Delta/g, "delta")
    .replace(/\\approx/g, "≈")
    .replace(/\\quad/g, " ")
    .replace(/\\qquad/g, "  ")
    .replace(/\\_/g, "_")
    .replace(/_\{([^}]+)\}/g, "[$1]")
    .replace(/_([a-zA-Z0-9])/g, "[$1]")
    .replace(/\^\{([^}]+)\}/g, "^$1")
    .trim();
  return `\`${cleaned}\``;
}

// Active Section Wrapper with Oceanic Wave Shimmer & Smooth Auto-Scrolling
function OceanicActiveSection({
  isActive,
  stageLabel,
  children,
  className = "",
}: {
  isActive: boolean;
  stageLabel?: string;
  children: React.ReactNode;
  className?: string;
}) {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isActive && sectionRef.current) {
      sectionRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [isActive]);

  return (
    <div
      ref={sectionRef}
      className={`relative transition-all duration-500 ${
        isActive
          ? "rounded-r-lg pl-3 -ml-3 border-l-[2.5px] border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.12)] bg-emerald-500/[0.02] dark:bg-emerald-500/[0.04]"
          : "border-l-[2.5px] border-transparent"
      } ${className}`}
    >
      {/* Oceanic Wave Shimmer (Bottom-Left to Top-Right motion with undulating wave opacity) */}
      {isActive && (
        <motion.div
          animate={{
            backgroundPosition: ["0% 100%", "100% 0%"],
            opacity: [0.35, 0.75, 0.45, 0.85, 0.35],
          }}
          transition={{
            duration: 3.2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute inset-0 pointer-events-none rounded-r-lg bg-[linear-gradient(135deg,transparent_0%,rgba(16,185,129,0.06)_25%,rgba(6,182,212,0.12)_50%,rgba(16,185,129,0.06)_75%,transparent_100%)] bg-[length:240%_240%]"
        />
      )}

      {/* Floating Active Stage Badge */}
      {isActive && stageLabel && (
        <motion.div
          initial={{ opacity: 0, scale: 0.85, y: -4 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="absolute -top-3 right-0 z-10 flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 dark:bg-emerald-500/20 border border-emerald-500/30 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 backdrop-blur-md shadow-xs pointer-events-none"
        >
          <motion.span
            animate={{ scale: [1, 1.3, 1], opacity: [0.8, 1, 0.8] }}
            transition={{ duration: 1.4, repeat: Infinity }}
            className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500"
          />
          <Sparkles className="w-3 h-3 text-emerald-500" />
          <span>Agent Synthesizing: {stageLabel}</span>
        </motion.div>
      )}

      {children}
    </div>
  );
}

export default function GammaProblemCanvas({
  problem,
  isGenerating = false,
  onSolveInEditor,
  onComplete,
  className = "",
}: GammaProblemCanvasProps) {
  const [currentViewMode, setCurrentViewMode] = useState<"visual" | "json" | "markdown">("visual");

  const {
    isCompleted,
    progressPercent,
    activeStageMeta,
    activeStageKey,
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

  // LeetCode exact colors for difficulty matching ProblemPageDescription.tsx
  const levelColorMap: Record<string, string> = {
    Easy: "rgb(0, 184, 163)",     // Teal #00b8a3
    Medium: "rgb(255, 184, 0)",   // Amber #ffb800
    Hard: "rgb(255, 45, 85)",     // Red #ff2d55
  };

  const levelColor = problem?.level ? levelColorMap[problem.level] || levelColorMap["Medium"] : levelColorMap["Medium"];

  // Exact LeetCode CSS styles matching ProblemPageDescription.tsx
  const codeStyle: React.CSSProperties = {
    fontFamily: 'Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
    fontSize: '12.5px',
    lineHeight: '16px',
    letterSpacing: '0.025em',
    color: 'rgba(38, 38, 38, 0.75)',
    backgroundColor: 'rgba(0, 10, 32, 0.03)',
    borderRadius: '5px',
    padding: '2px 4px',
    border: '0.8px solid rgba(0, 0, 0, 0.05)',
    display: 'inline',
    fontFeatureSettings: '"tnum"',
  };

  const preStyle: React.CSSProperties = {
    fontFamily: 'Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
    fontSize: '14px',
    lineHeight: '22px',
    letterSpacing: '0.015em',
    color: 'rgb(38, 38, 38)',
    backgroundColor: 'transparent',
    borderLeft: '1.6px solid rgba(0, 0, 0, 0.08)',
    padding: '0 0 0 16px',
    margin: '4px 0 20px 0',
    borderRadius: '0',
    whiteSpace: 'pre-wrap',
    fontFeatureSettings: '"tnum"',
  };

  const pStyle: React.CSSProperties = {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif',
    fontSize: '14px',
    fontWeight: 400,
    lineHeight: '21px',
    color: 'rgb(38, 38, 38)',
    margin: '0 0 16px 0',
    padding: 0,
  };

  const strongInPreStyle: React.CSSProperties = {
    fontFamily: 'Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
    fontWeight: 700,
    color: 'rgb(38, 38, 38)',
    letterSpacing: '0.015em',
  };

  const sectionSpring: Transition = {
    type: "spring",
    stiffness: 260,
    damping: 24,
  };

  // Render paragraphs with inline code tags, bold, italic, and clean typography
  const renderFormattedParagraph = (rawParagraph: string, pIdx: number) => {
    const cleaned = cleanLatexMath(rawParagraph);
    const segments = cleaned.split(/(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*)/g);

    return (
      <p key={pIdx} style={pStyle} className="dark:text-[#d1d1d1]">
        {segments.map((seg, sIdx) => {
          if (seg.startsWith("`") && seg.endsWith("`")) {
            const innerCode = seg.slice(1, -1);
            return (
              <code key={sIdx} style={codeStyle} className="dark:bg-white/[0.08] dark:text-[#e0e0e0] dark:border-white/[0.08]">
                {innerCode}
              </code>
            );
          }
          if (seg.startsWith("**") && seg.endsWith("**")) {
            return <strong key={sIdx} className="font-bold text-neutral-900 dark:text-neutral-100">{seg.slice(2, -2)}</strong>;
          }
          if (seg.startsWith("*") && seg.endsWith("*")) {
            return <em key={sIdx}>{seg.slice(1, -1)}</em>;
          }
          return <span key={sIdx}>{seg}</span>;
        })}
      </p>
    );
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

  // Adapted object for ProblemPageCollapseButton
  const adaptedProblemForCollapse: any = {
    _id: "gen-active",
    title: problem.title,
    level: problem.level,
    description: problem.description,
    topics: problem.topics || ["Algorithms"],
    companies: problem.companies || ["Google", "Meta", "Amazon"],
    hints: problem.hints || [],
  };

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

      {/* VIEW 2: RAW MARKDOWN VIEW */}
      {currentViewMode === "markdown" && (
        <div className="p-4">
          <div className="rounded-xl bg-[#141414] p-4 border border-neutral-800 text-xs font-mono text-neutral-300 overflow-x-auto whitespace-pre-wrap leading-relaxed">
            {`# ${problem.title} (${problem.level})

## Problem Statement
${cleanLatexMath(problem.description)}

## Constraints
${problem.constraints.map((c) => `- \`${cleanLatexMath(c)}\``).join("\n")}

## Walkthrough Examples
${problem.examples.map((ex, i) => `### Example ${i + 1}\n**Input:** \`${ex.input}\`\n**Output:** \`${ex.output}\`\n${ex.explanation ? `**Explanation:** ${cleanLatexMath(ex.explanation)}` : ""}`).join("\n\n")}

## Expected Complexity
- **Time:** \`${problem.expectedComplexity?.time || "O(N)"}\`
- **Space:** \`${problem.expectedComplexity?.space || "O(1)"}\`
`}
          </div>
        </div>
      )}

      {/* VIEW 3: LIVE THEME-MATCHED VISUAL CANVAS (WITH OCEANIC SHIMMER & ACCENTS) */}
      {currentViewMode === "visual" && (
        <div
          className="w-full flex flex-col select-text"
          style={{
            padding: '16px 20px',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif',
            fontSize: '14px',
            lineHeight: '21px',
          }}
        >
          {/* 1. TITLE & METADATA SECTION */}
          {isSectionVisible("title") ? (
            <OceanicActiveSection
              isActive={activeStageKey === "title" && !isCompleted}
              stageLabel="Title & Topics"
              className="mb-4"
            >
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={sectionSpring}
              >
                {/* Title row */}
                <div className="w-full flex items-center justify-between gap-4 mb-2.5">
                  <h1
                    style={{
                      fontSize: '24px',
                      fontWeight: 600,
                      lineHeight: '32px',
                      margin: 0,
                      padding: 0,
                      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif',
                    }}
                    className="text-[#1a1a1a] dark:text-[#f0f0f0] flex items-center"
                  >
                    <span>{typewriterTitle || problem.title}</span>
                    {!isCompleted && activeStageKey === "title" && (
                      <motion.span
                        animate={{ opacity: [1, 0, 1] }}
                        transition={{ duration: 0.8, repeat: Infinity }}
                        className="inline-block w-2 h-6 bg-emerald-500 ml-1 rounded-xs"
                      />
                    )}
                  </h1>

                  <div className="flex items-center gap-1 shrink-0 text-xs font-semibold text-emerald-600 dark:text-emerald-400 select-none">
                    <span>Draft Spec</span>
                    <Check style={{ width: '15px', height: '15px' }} />
                  </div>
                </div>

                {/* Badges row matching ProblemPageDescription.tsx */}
                {isSectionVisible("difficulty") && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={sectionSpring}
                    className="flex items-center flex-wrap gap-2 mb-2"
                  >
                    {/* Difficulty badge */}
                    <span
                      style={{
                        fontSize: '12px',
                        fontWeight: 400,
                        lineHeight: '16px',
                        color: levelColor,
                        backgroundColor: 'rgba(0, 0, 0, 0.06)',
                        borderRadius: '9999px',
                        padding: '4px 8px',
                        height: '24px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                      className="dark:bg-white/[0.08]"
                    >
                      {problem.level || "Medium"}
                    </span>

                    {/* Topics Pills */}
                    {(Array.isArray(problem.topics)
                      ? problem.topics.flatMap((t: string) => (typeof t === "string" ? t.split(",") : [t])).map((s: string) => s.trim()).filter(Boolean)
                      : []
                    ).map((t: string, idx: number) => (
                      <motion.span
                        key={t}
                        initial={{ opacity: 0, x: -3 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.04, ...sectionSpring }}
                        style={{
                          fontSize: '12px',
                          color: 'rgba(0, 0, 0, 0.55)',
                          backgroundColor: 'rgba(0, 0, 0, 0.06)',
                          borderRadius: '9999px',
                          padding: '4px 8px',
                          height: '24px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                        className="dark:bg-white/[0.08] dark:text-[#a0a0a0]"
                      >
                        <Tag style={{ width: '12px', height: '12px' }} />
                        <span>{t}</span>
                      </motion.span>
                    ))}

                    {/* Expected Complexity Badge */}
                    {problem.expectedComplexity && (
                      <span
                        style={{
                          fontSize: '12px',
                          color: 'rgb(28, 184, 184)',
                          backgroundColor: 'rgba(28, 184, 184, 0.08)',
                          borderRadius: '9999px',
                          padding: '4px 8px',
                          height: '24px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontFamily: 'Menlo, monospace',
                        }}
                      >
                        <Zap style={{ width: '12px', height: '12px' }} />
                        <span>{problem.expectedComplexity.time}</span>
                      </span>
                    )}
                  </motion.div>
                )}
              </motion.div>
            </OceanicActiveSection>
          ) : (
            <div className="space-y-2.5 animate-pulse mb-4">
              <div className="h-7 w-3/4 bg-neutral-200 dark:bg-neutral-800 rounded-md" />
              <div className="flex gap-2">
                <div className="h-6 w-16 bg-neutral-200 dark:bg-neutral-800 rounded-full" />
                <div className="h-6 w-24 bg-neutral-200 dark:bg-neutral-800 rounded-full" />
              </div>
            </div>
          )}

          {/* 2. DESCRIPTION PARAGRAPHS */}
          {isSectionVisible("description") ? (
            <OceanicActiveSection
              isActive={activeStageKey === "description" && !isCompleted}
              stageLabel="Description"
              className="mb-4"
            >
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={sectionSpring}
                className="space-y-3"
              >
                {problem.description.split(/\n+/).filter(Boolean).map((para, pIdx) => (
                  renderFormattedParagraph(para, pIdx)
                ))}
              </motion.div>
            </OceanicActiveSection>
          ) : (
            <div className="space-y-2 animate-pulse mb-6">
              <div className="h-4 w-full bg-neutral-200 dark:bg-neutral-800 rounded" />
              <div className="h-4 w-5/6 bg-neutral-200 dark:bg-neutral-800 rounded" />
            </div>
          )}

          <p style={{ margin: '8px 0' }}>&nbsp;</p>

          {/* 3. WALKTHROUGH EXAMPLES */}
          {isSectionVisible("examples") ? (
            <OceanicActiveSection
              isActive={activeStageKey === "examples" && !isCompleted}
              stageLabel="Examples"
              className="mb-4"
            >
              <div className="space-y-1">
                {problem.examples.map((example, idx) => (
                  <motion.div
                    key={example.id || idx}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.08, ...sectionSpring }}
                  >
                    <p style={{ ...pStyle, margin: '0 0 2px 0' }} className="dark:text-[#d1d1d1]">
                      <strong style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif', fontWeight: 700, fontSize: '14px' }} className="text-[#262626] dark:text-[#f0f0f0]">
                        Example {idx + 1}:
                      </strong>
                    </p>
                    <pre
                      style={{ ...preStyle, margin: idx === problem.examples.length - 1 ? '4px 0 28px 0' : '4px 0 20px 0' }}
                      className="dark:text-[#dcdcdc] dark:border-white/[0.12]"
                    >
                      <strong style={strongInPreStyle} className="dark:text-[#f0f0f0]">Input:</strong> {cleanLatexMath(example.input)}{'\n'}
                      <strong style={strongInPreStyle} className="dark:text-[#f0f0f0]">Output:</strong> {cleanLatexMath(example.output)}
                      {example.explanation && (
                        <>
                          {'\n'}<strong style={strongInPreStyle} className="dark:text-[#f0f0f0]">Explanation:</strong> {cleanLatexMath(example.explanation)}
                        </>
                      )}
                    </pre>
                  </motion.div>
                ))}
              </div>
            </OceanicActiveSection>
          ) : (
            <div className="space-y-3 animate-pulse mb-6">
              <div className="h-4 w-28 bg-neutral-200 dark:bg-neutral-800 rounded" />
              <div className="h-20 w-full bg-neutral-100 dark:bg-neutral-800/60 rounded-md" />
            </div>
          )}

          {/* 4. CONSTRAINTS SECTION */}
          {isSectionVisible("constraints") ? (
            <OceanicActiveSection
              isActive={activeStageKey === "constraints" && !isCompleted}
              stageLabel="Constraints"
              className="mb-4"
            >
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={sectionSpring}
              >
                <p style={{ ...pStyle, margin: '0 0 12px 0' }}>
                  <strong style={{ fontWeight: 700 }} className="text-[#262626] dark:text-[#f0f0f0]">
                    Constraints:
                  </strong>
                </p>
                <ul style={{ margin: '0 0 32px 0', padding: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {problem.constraints.map((constraint, idx) => (
                    <li key={idx} style={{ ...pStyle, listStyle: 'disc', marginLeft: '18px', margin: '0' }} className="dark:text-[#d1d1d1]">
                      <code style={codeStyle} className="dark:bg-white/[0.08] dark:text-[#e0e0e0] dark:border-white/[0.08]">
                        {cleanLatexMath(constraint).replace(/`/g, "")}
                      </code>
                    </li>
                  ))}
                </ul>
              </motion.div>
            </OceanicActiveSection>
          ) : (
            <div className="space-y-2 animate-pulse mb-6">
              <div className="h-4 w-24 bg-neutral-200 dark:bg-neutral-800 rounded" />
              <div className="h-3 w-1/2 bg-neutral-200 dark:bg-neutral-800 rounded" />
            </div>
          )}

          {/* 5. FOLLOW-UP */}
          {problem.followUp && (
            <OceanicActiveSection
              isActive={activeStageKey === "followUp" && !isCompleted}
              stageLabel="Follow-up"
              className="mb-4"
            >
              <div className="mb-8">
                <p style={{ ...pStyle, margin: '0 0 4px 0' }} className="dark:text-[#d1d1d1]">
                  <strong style={{ fontWeight: 700 }} className="text-[#262626] dark:text-[#f0f0f0]">Follow-up:&nbsp;</strong>
                </p>
                {renderFormattedParagraph(problem.followUp.prompt, 0)}
              </div>
            </OceanicActiveSection>
          )}

          {/* 6. EXPANDABLE ACCORDIONS FOR HINTS, TOPICS, COMPANIES */}
          <div className="mt-2 pt-2 border-t border-black/[0.06] dark:border-white/[0.06]">
            <ProblemPageCollapseButton problemInfo={adaptedProblemForCollapse} />
          </div>
        </div>
      )}
    </div>
  );
}
