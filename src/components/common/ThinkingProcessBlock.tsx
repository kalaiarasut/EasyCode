"use client";

import React, { useState } from "react";
import { Brain, ChevronRight } from "lucide-react";

interface ThinkingProcessBlockProps {
  thinkingContent: string;
  isStreaming?: boolean;
  defaultExpanded?: boolean;
}

export default function ThinkingProcessBlock({
  thinkingContent,
  isStreaming = false,
  defaultExpanded = false,
}: ThinkingProcessBlockProps) {
  const [isOpen, setIsOpen] = useState<boolean>(defaultExpanded);

  if (!thinkingContent && !isStreaming) return null;

  return (
    <div className="my-2.5 not-prose">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/[0.03] dark:bg-white/[0.05] border border-black/[0.08] dark:border-white/[0.08] text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:bg-black/[0.06] dark:hover:bg-white/[0.08] hover:text-neutral-950 dark:hover:text-white transition-all cursor-pointer select-none group shadow-2xs"
        title={isOpen ? "Click to collapse thoughts" : "Click to view thought process"}
      >
        <Brain className={`w-3.5 h-3.5 ${isStreaming ? "text-amber-500 animate-pulse" : "text-neutral-500 dark:text-neutral-400 group-hover:text-amber-500"} transition-colors`} />
        
        {isStreaming ? (
          <span className="shimmer font-semibold text-neutral-800 dark:text-neutral-200">Thinking...</span>
        ) : (
          <span className="text-neutral-700 dark:text-neutral-300 font-medium">Thought process</span>
        )}

        <ChevronRight
          className={`w-3.5 h-3.5 text-neutral-400 transition-transform duration-200 ${
            isOpen ? "rotate-90" : ""
          }`}
        />
      </button>

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
