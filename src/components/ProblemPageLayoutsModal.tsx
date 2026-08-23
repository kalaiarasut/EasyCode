"use client";
import React from 'react';
import { Info, Lightbulb } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { toast } from 'sonner';

export type WorkspaceLayoutType = 'default' | 'leet' | 'note-taking' | 'debug' | 'focus';

interface ProblemPageLayoutsModalProps {
  currentLayout: WorkspaceLayoutType;
  onSelectLayout: (layout: WorkspaceLayoutType) => void;
  children: React.ReactNode;
}

export default function ProblemPageLayoutsModal({
  currentLayout,
  onSelectLayout,
  children,
}: ProblemPageLayoutsModalProps) {
  const [isOpen, setIsOpen] = React.useState<boolean>(false);

  const handleLayoutClick = (layout: WorkspaceLayoutType) => {
    onSelectLayout(layout);
    setIsOpen(false);
    toast.success(`Layout changed to ${layout.charAt(0).toUpperCase() + layout.slice(1)}`);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        {children}
      </PopoverTrigger>
      <PopoverContent
        align="end"
        sideOffset={8}
        className="w-[330px] p-4 rounded-2xl shadow-2xl bg-white dark:bg-[#1e1e1e] border border-neutral-200 dark:border-neutral-800 text-neutral-800 dark:text-neutral-200 select-none z-50"
        style={{
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-[15px] text-neutral-900 dark:text-white">Layouts</span>
            <Info className="w-3.5 h-3.5 text-neutral-400 cursor-pointer" />
          </div>
          <button
            onClick={() => toast.info("Customize your workspace layouts according to your coding workflow.")}
            className="flex items-center gap-1 text-xs text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors cursor-pointer"
          >
            <Lightbulb className="w-3.5 h-3.5" />
            <span>Hints</span>
          </button>
        </div>

        {/* 2x2 Grid of Layouts */}
        <div className="grid grid-cols-2 gap-3.5 mb-4">
          {/* 1. Default Layout */}
          <div
            onClick={() => handleLayoutClick('default')}
            className={`group flex flex-col p-2.5 rounded-xl border transition-all cursor-pointer ${
              currentLayout === 'default'
                ? 'border-neutral-900 dark:border-white bg-neutral-50 dark:bg-neutral-800/50'
                : 'border-neutral-200 dark:border-neutral-800 hover:border-neutral-400 dark:hover:border-neutral-600 bg-neutral-50/50 dark:bg-neutral-900/40'
            }`}
          >
            {/* Wireframe Preview Graphic */}
            <div className="w-full h-16 rounded-lg bg-neutral-100 dark:bg-neutral-800/60 p-1.5 flex gap-1.5 mb-2">
              {/* Left Column (Tall) */}
              <div className="flex-1 h-full rounded bg-neutral-200 dark:bg-neutral-700" />
              {/* Right Column (Split: top box + thin bottom bar) */}
              <div className="flex-1 h-full flex flex-col gap-1">
                <div className="flex-1 rounded bg-neutral-200 dark:bg-neutral-700" />
                <div className="h-1 rounded bg-neutral-300 dark:bg-neutral-600" />
              </div>
            </div>
            <span className="text-xs font-medium text-neutral-800 dark:text-neutral-200">
              Default
            </span>
          </div>

          {/* 2. Leet Layout (3 Columns) */}
          <div
            onClick={() => handleLayoutClick('leet')}
            className={`group flex flex-col p-2.5 rounded-xl border transition-all cursor-pointer ${
              currentLayout === 'leet'
                ? 'border-neutral-900 dark:border-white bg-neutral-50 dark:bg-neutral-800/50'
                : 'border-neutral-200 dark:border-neutral-800 hover:border-neutral-400 dark:hover:border-neutral-600 bg-neutral-50/50 dark:bg-neutral-900/40'
            }`}
          >
            {/* Wireframe Preview Graphic (3 Columns) */}
            <div className="w-full h-16 rounded-lg bg-neutral-100 dark:bg-neutral-800/60 p-1.5 flex gap-1 mb-2">
              <div className="flex-1 h-full rounded bg-neutral-200 dark:bg-neutral-700" />
              <div className="flex-1 h-full flex flex-col gap-1">
                <div className="flex-1 rounded bg-neutral-200 dark:bg-neutral-700" />
                <div className="h-1 rounded bg-neutral-300 dark:bg-neutral-600" />
              </div>
              <div className="flex-1 h-full rounded bg-neutral-200 dark:bg-neutral-700" />
            </div>
            <span className="text-xs font-medium text-neutral-800 dark:text-neutral-200">
              Leet
            </span>
          </div>

          {/* 3. Note-taking Layout (Unlocked, No locks!) */}
          <div
            onClick={() => handleLayoutClick('note-taking')}
            className={`group flex flex-col p-2.5 rounded-xl border transition-all cursor-pointer ${
              currentLayout === 'note-taking'
                ? 'border-neutral-900 dark:border-white bg-neutral-50 dark:bg-neutral-800/50'
                : 'border-neutral-200 dark:border-neutral-800 hover:border-neutral-400 dark:hover:border-neutral-600 bg-neutral-50/50 dark:bg-neutral-900/40'
            }`}
          >
            {/* Wireframe Preview Graphic */}
            <div className="w-full h-16 rounded-lg bg-neutral-100 dark:bg-neutral-800/60 p-1.5 flex gap-1 mb-2">
              <div className="flex-1 h-full rounded bg-neutral-200 dark:bg-neutral-700" />
              <div className="flex-1 h-full rounded bg-neutral-200 dark:bg-neutral-700" />
              <div className="flex-1 h-full flex flex-col gap-1">
                <div className="flex-1 rounded bg-neutral-200 dark:bg-neutral-700" />
                <div className="h-4 rounded bg-neutral-300 dark:bg-neutral-600" />
              </div>
            </div>
            <span className="text-xs font-medium text-neutral-800 dark:text-neutral-200">
              Note-taking
            </span>
          </div>

          {/* 4. Debug Layout (Unlocked, No locks!) */}
          <div
            onClick={() => handleLayoutClick('debug')}
            className={`group flex flex-col p-2.5 rounded-xl border transition-all cursor-pointer ${
              currentLayout === 'debug'
                ? 'border-neutral-900 dark:border-white bg-neutral-50 dark:bg-neutral-800/50'
                : 'border-neutral-200 dark:border-neutral-800 hover:border-neutral-400 dark:hover:border-neutral-600 bg-neutral-50/50 dark:bg-neutral-900/40'
            }`}
          >
            {/* Wireframe Preview Graphic */}
            <div className="w-full h-16 rounded-lg bg-neutral-100 dark:bg-neutral-800/60 p-1.5 flex gap-1 mb-2">
              <div className="flex-1 h-full rounded bg-neutral-200 dark:bg-neutral-700" />
              <div className="flex-1 h-full rounded bg-neutral-200 dark:bg-neutral-700" />
              <div className="flex-1 h-full flex flex-col gap-1">
                <div className="flex-1 rounded bg-neutral-200 dark:bg-neutral-700" />
                <div className="h-4 rounded bg-neutral-300 dark:bg-neutral-600" />
              </div>
            </div>
            <span className="text-xs font-medium text-neutral-800 dark:text-neutral-200">
              Debug
            </span>
          </div>
        </div>

        {/* Custom Layouts Box (Fully Unlocked & Free) */}
        <div className="mb-4 p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-900/40 flex flex-col items-center justify-center text-center">
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-2">
            Custom Workspace Layouts
          </p>
          <button
            onClick={() => handleLayoutClick('default')}
            className="px-5 py-1.5 rounded-lg text-xs font-semibold text-white bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 shadow-sm transition-all cursor-pointer"
          >
            Reset Default
          </button>
        </div>

        {/* Divider */}
        <div className="w-full h-[1px] bg-neutral-200 dark:bg-neutral-800 mb-3" />

        {/* Focus Mode Button */}
        <button
          onClick={() => handleLayoutClick('focus')}
          className={`w-full py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 text-xs font-semibold transition-all cursor-pointer ${
            currentLayout === 'focus'
              ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900'
              : 'bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200'
          }`}
        >
          <span className="text-sm">🧘</span>
          <span>Focus Mode</span>
        </button>
      </PopoverContent>
    </Popover>
  );
}
