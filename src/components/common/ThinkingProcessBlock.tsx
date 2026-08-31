"use client";

import React, { useState } from "react";
import { Brain, ChevronRight } from "lucide-react";
import TerminalFace from "@/components/common/TerminalFace";

interface ThinkingProcessBlockProps {
  thinkingContent: string;
  isStreaming?: boolean;
  defaultExpanded?: boolean;
  verb?: string;
}

export default function ThinkingProcessBlock({
  thinkingContent,
  isStreaming = false,
  defaultExpanded = false,
  verb = "Thinking",
}: ThinkingProcessBlockProps) {
  const [isOpen, setIsOpen] = useState<boolean>(defaultExpanded);

  if (!thinkingContent && !isStreaming) return null;

  return (
    <div className="my-2 not-prose">
      {isStreaming ? (
        <div className="inline-flex items-center gap-1.5 text-xs select-none py-0.5">
          <TerminalFace verb={verb} />
          <span className="shimmer font-semibold text-neutral-800 dark:text-neutral-200">
            {verb}...
          </span>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className="inline-flex items-center gap-1.5 text-xs text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200 transition-colors cursor-pointer select-none group py-0.5"
          title={isOpen ? "Click to collapse thoughts" : "Click to view thought process"}
        >
          <Brain className="w-3.5 h-3.5 text-neutral-400 dark:text-neutral-500 group-hover:text-amber-500 transition-colors" />
          <span className="font-medium">Thought process</span>
          <ChevronRight
            className={`w-3.5 h-3.5 text-neutral-400 transition-transform duration-200 ${
              isOpen ? "rotate-90" : ""
            }`}
          />
        </button>
      )}

      {/* Expanded Thought Drawer */}
      {isOpen && (
        <div className="mt-2.5 p-3.5 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.08] dark:border-white/[0.08] font-mono text-[11px] leading-relaxed text-neutral-600 dark:text-neutral-400 whitespace-pre-wrap max-h-64 overflow-y-auto animate-in fade-in zoom-in-98 duration-150 shadow-inner select-text">
          {thinkingContent || "Synthesizing algorithmic constraints and planning execution strategy..."}
          {isStreaming && (
            <span className="inline-block w-1.5 h-3.5 ml-1 rounded-xs bg-amber-500 animate-pulse align-middle" />
          )}
        </div>
      )}
    </div>
  );
}
