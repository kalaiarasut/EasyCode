"use client";
import React from 'react';
import { Sparkles, X, Plus, History } from 'lucide-react';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import ProblemPageAiTab from './ProblemPageAiTab';
import ProblemPageNotesPanel from './ProblemPageNotesPanel';
import ProblemPageDebugger from './ProblemPageDebugger';
import { WorkspaceLayoutType } from './ProblemPageLayoutsModal';
import { toast } from 'sonner';

interface ProblemPageRightPanelProps {
  layout: WorkspaceLayoutType;
  problemId: string;
  problemInfo?: any;
  sourceCode: string;
  setSourceCode: React.Dispatch<React.SetStateAction<string>>;
  theme: string | undefined;
  onClose: () => void;
}

export default function ProblemPageRightPanel({
  layout,
  problemId,
  problemInfo,
  sourceCode,
  setSourceCode,
  theme,
  onClose,
}: ProblemPageRightPanelProps) {
  return (
    <div className="w-full h-full flex flex-col rounded-lg overflow-hidden border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#1a1a1a] shadow-sm select-none">
      {/* 3rd Column Top Bar: ✨ Leet ✕ | + 🕒 */}
      <div
        className="w-full flex items-center justify-between px-3 shrink-0 border-b border-black/[0.06] dark:border-white/[0.06]"
        style={{
          height: '36px',
          backgroundColor: 'rgba(0,0,0,0.02)',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif',
        }}
      >
        {/* Left: ✨ Leet ✕ tab */}
        <div className="flex items-center gap-1.5 font-medium text-xs text-neutral-900 dark:text-white">
          <Sparkles className="w-3.5 h-3.5 text-purple-500" />
          <span>Leet</span>
          <button
            onClick={onClose}
            className="p-0.5 rounded hover:bg-black/10 dark:hover:bg-white/10 text-neutral-400 hover:text-rose-500 transition-colors cursor-pointer ml-0.5"
            title="Close column (Reset to default layout)"
          >
            <X className="w-3 h-3" />
          </button>
        </div>

        {/* Right: + New Chat & History */}
        <div className="flex items-center gap-1 text-neutral-500">
          <button
            onClick={() => toast.info("Started new AI conversation session")}
            className="p-1 rounded hover:bg-black/5 dark:hover:bg-white/5 hover:text-neutral-900 dark:hover:text-white transition-colors cursor-pointer"
            title="New Chat"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => toast.info("Loaded recent chat sessions")}
            className="p-1 rounded hover:bg-black/5 dark:hover:bg-white/5 hover:text-neutral-900 dark:hover:text-white transition-colors cursor-pointer"
            title="Chat History"
          >
            <History className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Body Layout based on selected mode */}
      <div className="flex-1 w-full overflow-hidden">
        {layout === 'leet' && (
          /* Leet Mode: Full Height AI Chat */
          <div className="w-full h-full overflow-hidden">
            <ProblemPageAiTab
              sourceCode={sourceCode}
              theme={theme}
              problemInfo={problemInfo}
              onApplyCode={(code) => {
                setSourceCode(code);
                toast.success("Code applied to editor!");
              }}
            />
          </div>
        )}

        {layout === 'note-taking' && (
          /* Note-taking Mode: Top AI Chat + Bottom Notes Panel */
          <ResizablePanelGroup direction="vertical" className="w-full h-full">
            {/* Top: AI Chat */}
            <ResizablePanel defaultSize={50} minSize={30} className="overflow-hidden">
              <ProblemPageAiTab
                sourceCode={sourceCode}
                theme={theme}
                problemInfo={problemInfo}
                onApplyCode={(code) => {
                  setSourceCode(code);
                  toast.success("Code applied to editor!");
                }}
              />
            </ResizablePanel>

            <ResizableHandle />

            {/* Bottom: Notes Panel */}
            <ResizablePanel defaultSize={50} minSize={25} className="overflow-hidden">
              <ProblemPageNotesPanel
                problemId={problemId}
                problemTitle={problemInfo?.title || "Problem"}
              />
            </ResizablePanel>
          </ResizablePanelGroup>
        )}

        {layout === 'debug' && (
          /* Debug Mode: Top AI Chat + Bottom Advanced Debugger */
          <ResizablePanelGroup direction="vertical" className="w-full h-full">
            {/* Top: AI Chat */}
            <ResizablePanel defaultSize={45} minSize={25} className="overflow-hidden">
              <ProblemPageAiTab
                sourceCode={sourceCode}
                theme={theme}
                problemInfo={problemInfo}
                onApplyCode={(code) => {
                  setSourceCode(code);
                  toast.success("Code applied to editor!");
                }}
              />
            </ResizablePanel>

            <ResizableHandle />

            {/* Bottom: Advanced Debugger */}
            <ResizablePanel defaultSize={55} minSize={30} className="overflow-hidden">
              <ProblemPageDebugger
                sourceCode={sourceCode}
                problemInfo={problemInfo}
                theme={theme}
              />
            </ResizablePanel>
          </ResizablePanelGroup>
        )}
      </div>
    </div>
  );
}
