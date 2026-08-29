"use client";

import React from "react";
import {
  Play,
  Pause,
  RotateCcw,
  FastForward,
  Sparkles,
  Check,
  Copy,
  Download,
  Code2,
  FileText,
  Layers,
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { GeneratedProblem, GenerationSectionMeta } from "@/types/generatedProblem";

interface GammaProblemHUDProps {
  isGenerating: boolean;
  isCompleted: boolean;
  progressPercent: number;
  activeStageMeta: GenerationSectionMeta;
  speed: number;
  isPaused: boolean;
  currentViewMode: "visual" | "json" | "markdown";
  problem: GeneratedProblem | null;
  onSetSpeed: (speed: number) => void;
  onTogglePause: () => void;
  onReplay: () => void;
  onSkipToEnd: () => void;
  onChangeViewMode: (mode: "visual" | "json" | "markdown") => void;
  onSolveInEditor?: () => void;
}

export default function GammaProblemHUD({
  isGenerating,
  isCompleted,
  progressPercent,
  activeStageMeta,
  speed,
  isPaused,
  currentViewMode,
  problem,
  onSetSpeed,
  onTogglePause,
  onReplay,
  onSkipToEnd,
  onChangeViewMode,
  onSolveInEditor,
}: GammaProblemHUDProps) {
  const [copiedType, setCopiedType] = React.useState<string | null>(null);

  const copyMarkdown = () => {
    if (!problem) return;
    const md = `# ${problem.title} (${problem.level})

## Description
${problem.description}

## Constraints
${problem.constraints.map((c) => `- \`${c}\``).join("\n")}

## Examples
${problem.examples
  .map(
    (ex, i) => `### Example ${i + 1}
**Input:** \`${ex.input}\`
**Output:** \`${ex.output}\`
${ex.explanation ? `**Explanation:** ${ex.explanation}` : ""}`
  )
  .join("\n\n")}

## Hints
${problem.hints.map((h, i) => `${i + 1}. ${h}`).join("\n")}

## Expected Complexity
- **Time:** \`${problem.expectedComplexity?.time || "O(N)"}\`
- **Space:** \`${problem.expectedComplexity?.space || "O(1)"}\`
`;
    navigator.clipboard.writeText(md);
    setCopiedType("markdown");
    toast.success("Problem markdown copied to clipboard!");
    setTimeout(() => setCopiedType(null), 2000);
  };

  const exportJson = () => {
    if (!problem) return;
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(problem, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `${problem.title.toLowerCase().replace(/\s+/g, "_")}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    toast.success("Problem JSON exported successfully!");
  };

  return (
    <div className="w-full bg-white/95 dark:bg-[#1C1B19]/95 backdrop-blur-md border-b border-[#E8E4DB] dark:border-[#2D2B28] px-3.5 py-2.5 flex flex-col gap-2 sticky top-0 z-30 transition-all">
      {/* Top row: Status label + Speed controls + Action tools */}
      <div className="flex items-center justify-between gap-2 flex-wrap text-xs">
        
        {/* Left: Live Stage Status */}
        <div className="flex items-center gap-2 min-w-0">
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-medium">
            <Sparkles className={`w-3.5 h-3.5 ${!isCompleted ? "animate-spin text-emerald-500" : ""}`} />
            <span className="font-mono text-[11px]">
              {isCompleted ? "Problem Built" : `Live Building (${progressPercent}%)`}
            </span>
          </div>

          <span className="text-neutral-400 hidden sm:inline">•</span>

          <span className="text-neutral-600 dark:text-neutral-300 font-medium truncate hidden sm:inline">
            {isCompleted ? problem?.title || "Completed" : activeStageMeta.description}
          </span>
        </div>

        {/* Right: Controls (Speed, View Switcher, Play/Pause, Solve) */}
        <div className="flex items-center gap-1.5 shrink-0">
          
          {/* Speed Pills */}
          {!isCompleted && (
            <div className="flex items-center bg-black/[0.04] dark:bg-white/[0.04] rounded-lg p-0.5 border border-black/[0.04] dark:border-white/[0.06]">
              {[0.5, 1, 2].map((s) => (
                <button
                  key={s}
                  onClick={() => onSetSpeed(s)}
                  className={`px-1.5 py-0.5 rounded text-[10px] font-mono transition-all ${
                    speed === s
                      ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 font-bold shadow-2xs"
                      : "text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
                  }`}
                  title={`Set generation speed to ${s}x`}
                >
                  {s}x
                </button>
              ))}

              <button
                onClick={onSkipToEnd}
                className="px-1.5 py-0.5 rounded text-[10px] font-mono text-amber-600 dark:text-amber-400 hover:bg-amber-500/10 transition-colors flex items-center gap-0.5"
                title="Instant finish"
              >
                <FastForward className="w-2.5 h-2.5" />
                <span>Skip</span>
              </button>
            </div>
          )}

          {/* Pause / Resume / Replay */}
          {!isCompleted ? (
            <button
              onClick={onTogglePause}
              className="p-1 rounded-md text-neutral-500 hover:text-neutral-900 dark:hover:text-white hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition-colors"
              title={isPaused ? "Resume build" : "Pause build"}
            >
              {isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
            </button>
          ) : (
            <button
              onClick={onReplay}
              className="p-1 rounded-md text-neutral-500 hover:text-neutral-900 dark:hover:text-white hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition-colors"
              title="Replay animated build"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}

          {/* View Mode Toggle */}
          <div className="flex items-center bg-black/[0.04] dark:bg-white/[0.04] rounded-lg p-0.5 border border-black/[0.04] dark:border-white/[0.06]">
            <button
              onClick={() => onChangeViewMode("visual")}
              className={`px-2 py-0.5 rounded text-[11px] font-medium transition-all ${
                currentViewMode === "visual"
                  ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-2xs font-semibold"
                  : "text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
              }`}
              title="Visual LeetCode UI View"
            >
              <Layers className="w-3 h-3 inline mr-1 opacity-70" />
              Visual
            </button>

            <button
              onClick={() => onChangeViewMode("markdown")}
              className={`px-2 py-0.5 rounded text-[11px] font-medium transition-all ${
                currentViewMode === "markdown"
                  ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-2xs font-semibold"
                  : "text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
              }`}
              title="Markdown View"
            >
              <FileText className="w-3 h-3 inline mr-1 opacity-70" />
              MD
            </button>

            <button
              onClick={() => onChangeViewMode("json")}
              className={`px-2 py-0.5 rounded text-[11px] font-medium transition-all ${
                currentViewMode === "json"
                  ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-2xs font-semibold"
                  : "text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
              }`}
              title="Raw JSON Schema"
            >
              <Code2 className="w-3 h-3 inline mr-1 opacity-70" />
              JSON
            </button>
          </div>

          {/* Action Buttons */}
          <button
            onClick={copyMarkdown}
            className="p-1 rounded-md text-neutral-500 hover:text-neutral-900 dark:hover:text-white hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition-colors"
            title="Copy formatted Markdown"
          >
            {copiedType === "markdown" ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={exportJson}
            className="p-1 rounded-md text-neutral-500 hover:text-neutral-900 dark:hover:text-white hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition-colors"
            title="Download JSON schema"
          >
            <Download className="w-3.5 h-3.5" />
          </button>

          {/* Solve in Editor Action Button */}
          {onSolveInEditor && (
            <button
              onClick={onSolveInEditor}
              className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white dark:bg-emerald-500 dark:hover:bg-emerald-400 dark:text-neutral-950 shadow-xs transition-all shrink-0 cursor-pointer"
            >
              <Play className="w-3 h-3 fill-current" />
              <span>Solve in Editor</span>
            </button>
          )}
        </div>
      </div>

      {/* Bottom row: Animated Progress Bar (only visible during generation) */}
      {!isCompleted && progressPercent < 100 && (
        <div className="w-full bg-black/[0.05] dark:bg-white/[0.08] h-1.5 rounded-full overflow-hidden relative">
          <motion.div
            className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-amber-500 rounded-full"
            initial={{ width: "0%" }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          />
        </div>
      )}
    </div>
  );
}
