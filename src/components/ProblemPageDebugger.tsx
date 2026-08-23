"use client";
import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Square,
  ArrowRight,
  ArrowDown,
  ArrowUp,
  Bug,
  Plus,
  Trash2,
  CheckCircle2,
  ChevronRight,
  ChevronDown,
  Terminal,
  Layers,
  Variable,
  CircleDot,
  Radio,
  Eye,
  Sliders,
  Sparkles,
  FastForward,
  Database,
} from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { toast } from 'sonner';

interface ProblemPageDebuggerProps {
  sourceCode: string;
  problemInfo?: any;
  theme?: string;
  onHighlightLine?: (line: number | null) => void;
}

export default function ProblemPageDebugger({
  sourceCode,
  problemInfo,
  theme,
  onHighlightLine,
}: ProblemPageDebuggerProps) {
  const [activeTab, setActiveTab] = useState<'variables' | 'visualizer' | 'callstack' | 'breakpoints' | 'console'>('variables');
  const [debugState, setDebugState] = useState<'idle' | 'running' | 'paused'>('paused');
  const [stepIndex, setStepIndex] = useState<number>(0);
  const [autoStepSpeed, setAutoStepSpeed] = useState<number>(1000);
  const [isAutoPlaying, setIsAutoPlaying] = useState<boolean>(false);
  const autoPlayTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Watch expressions
  const [watchExpressions, setWatchExpressions] = useState<string[]>(["target - nums[i]", "map.size()"]);
  const [newWatchInput, setNewWatchInput] = useState<string>("");
  const [isAddingWatch, setIsAddingWatch] = useState<boolean>(false);

  // Breakpoints
  const [breakpoints, setBreakpoints] = useState<Array<{ line: number; enabled: boolean; condition?: string }>>([
    { line: 4, enabled: true },
    { line: 7, enabled: true },
  ]);

  // Console log outputs
  const [consoleLogs, setConsoleLogs] = useState<Array<{ type: 'info' | 'output' | 'error'; text: string; time: string }>>([
    { type: 'info', text: 'Debugger engine initialized (GDB C++20 Sandbox)', time: '00:01' },
    { type: 'info', text: 'Breakpoint hit at Solution::twoSum (line 4)', time: '00:01' },
  ]);
  const [consoleInput, setConsoleInput] = useState<string>("");

  // Detailed step sequence with visualizer data
  const debugSteps = [
    {
      line: 4,
      variables: [
        { name: "nums", type: "vector<int>&", value: "[2, 7, 11, 15]", changed: false },
        { name: "target", type: "int", value: "9", changed: false },
        { name: "map", type: "unordered_map<int, int>", value: "{}", changed: false },
        { name: "i", type: "int", value: "0", changed: true },
      ],
      pointerIndex: 0,
      mapState: [],
      stack: ["Solution::twoSum(nums=[2,7,11,15], target=9) : line 4", "main() : line 22"],
      log: "Loop step 0: nums[0] = 2. Looking for complement (9 - 2 = 7)",
    },
    {
      line: 5,
      variables: [
        { name: "nums", type: "vector<int>&", value: "[2, 7, 11, 15]", changed: false },
        { name: "target", type: "int", value: "9", changed: false },
        { name: "complement", type: "int", value: "7", changed: true },
        { name: "map", type: "unordered_map<int, int>", value: "{}", changed: false },
        { name: "i", type: "int", value: "0", changed: false },
      ],
      pointerIndex: 0,
      mapState: [],
      stack: ["Solution::twoSum(nums=[2,7,11,15], target=9) : line 5", "main() : line 22"],
      log: "map.find(7) not found in hash map",
    },
    {
      line: 8,
      variables: [
        { name: "nums", type: "vector<int>&", value: "[2, 7, 11, 15]", changed: false },
        { name: "target", type: "int", value: "9", changed: false },
        { name: "map", type: "unordered_map<int, int>", value: "{ 2: 0 }", changed: true },
        { name: "i", type: "int", value: "1", changed: true },
      ],
      pointerIndex: 1,
      mapState: [{ key: 2, val: 0 }],
      stack: ["Solution::twoSum(nums=[2,7,11,15], target=9) : line 8", "main() : line 22"],
      log: "Inserted key=2, index=0 into hash map. i advanced to 1",
    },
    {
      line: 4,
      variables: [
        { name: "nums", type: "vector<int>&", value: "[2, 7, 11, 15]", changed: false },
        { name: "target", type: "int", value: "9", changed: false },
        { name: "map", type: "unordered_map<int, int>", value: "{ 2: 0 }", changed: false },
        { name: "i", type: "int", value: "1", changed: false },
      ],
      pointerIndex: 1,
      mapState: [{ key: 2, val: 0 }],
      stack: ["Solution::twoSum(nums=[2,7,11,15], target=9) : line 4", "main() : line 22"],
      log: "Loop step 1: nums[1] = 7. Looking for complement (9 - 7 = 2)",
    },
    {
      line: 6,
      variables: [
        { name: "nums", type: "vector<int>&", value: "[2, 7, 11, 15]", changed: false },
        { name: "target", type: "int", value: "9", changed: false },
        { name: "complement", type: "int", value: "2", changed: true },
        { name: "map", type: "unordered_map<int, int>", value: "{ 2: 0 }", changed: false },
        { name: "return", type: "vector<int>", value: "[0, 1]", changed: true },
      ],
      pointerIndex: 1,
      mapState: [{ key: 2, val: 0 }],
      stack: ["Solution::twoSum(nums=[2,7,11,15], target=9) : line 6", "main() : line 22"],
      log: "Complement 2 found in map at index 0! Return indices: [0, 1]",
    },
  ];

  const currentStep = debugSteps[stepIndex] || debugSteps[0];

  useEffect(() => {
    onHighlightLine?.(currentStep.line);
  }, [stepIndex, currentStep.line]);

  // Auto-play stepping effect
  useEffect(() => {
    if (isAutoPlaying) {
      autoPlayTimerRef.current = setInterval(() => {
        setStepIndex((prev) => {
          if (prev < debugSteps.length - 1) {
            const next = prev + 1;
            setConsoleLogs((logs) => [
              ...logs,
              { type: 'output', text: debugSteps[next].log, time: new Date().toLocaleTimeString().slice(3, 8) },
            ]);
            return next;
          } else {
            setIsAutoPlaying(false);
            setDebugState('idle');
            toast.success("Debug execution completed. Output: [0, 1]");
            return prev;
          }
        });
      }, autoStepSpeed);
    } else {
      if (autoPlayTimerRef.current) clearInterval(autoPlayTimerRef.current);
    }
    return () => {
      if (autoPlayTimerRef.current) clearInterval(autoPlayTimerRef.current);
    };
  }, [isAutoPlaying, autoStepSpeed]);

  const handleStepOver = () => {
    if (stepIndex < debugSteps.length - 1) {
      const nextIdx = stepIndex + 1;
      setStepIndex(nextIdx);
      setConsoleLogs((prev) => [
        ...prev,
        { type: 'output', text: debugSteps[nextIdx].log, time: new Date().toLocaleTimeString().slice(3, 8) },
      ]);
      setDebugState('paused');
    } else {
      setDebugState('idle');
      toast.success("Execution completed. Return value: [0, 1]");
    }
  };

  const handleStepBack = () => {
    if (stepIndex > 0) {
      setStepIndex((prev) => prev - 1);
      setDebugState('paused');
    }
  };

  const handleRestart = () => {
    setIsAutoPlaying(false);
    setStepIndex(0);
    setDebugState('paused');
    setConsoleLogs([
      { type: 'info', text: 'Restarted debug session.', time: new Date().toLocaleTimeString().slice(3, 8) },
    ]);
    toast.info("Debugger restarted");
  };

  const handleStop = () => {
    setIsAutoPlaying(false);
    setDebugState('idle');
    onHighlightLine?.(null);
    toast.info("Debug session stopped");
  };

  const handleAddWatch = () => {
    if (newWatchInput.trim()) {
      setWatchExpressions((prev) => [...prev, newWatchInput.trim()]);
      setNewWatchInput("");
      setIsAddingWatch(false);
    }
  };

  const handleToggleBreakpoint = (line: number) => {
    setBreakpoints((prev) =>
      prev.map((bp) => (bp.line === line ? { ...bp, enabled: !bp.enabled } : bp))
    );
  };

  const handleDeleteBreakpoint = (line: number) => {
    setBreakpoints((prev) => prev.filter((bp) => bp.line !== line));
  };

  const handleConsoleEval = (e: React.FormEvent) => {
    e.preventDefault();
    if (!consoleInput.trim()) return;
    setConsoleLogs((prev) => [
      ...prev,
      { type: 'info', text: `> ${consoleInput}`, time: new Date().toLocaleTimeString().slice(3, 8) },
      { type: 'output', text: `= ${evalMockExpression(consoleInput)}`, time: new Date().toLocaleTimeString().slice(3, 8) },
    ]);
    setConsoleInput("");
  };

  const evalMockExpression = (expr: string) => {
    if (expr.includes("target")) return "9";
    if (expr.includes("nums")) return "[2, 7, 11, 15]";
    if (expr.includes("i")) return `${currentStep.pointerIndex}`;
    return "true";
  };

  return (
    <div
      className="w-full h-full flex flex-col bg-white dark:bg-[#1a1a1a] text-neutral-800 dark:text-neutral-200 overflow-hidden select-none"
      style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif' }}
    >
      {/* 1. Debugger Control Toolbar */}
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-black/[0.08] dark:border-white/[0.08] bg-neutral-50/80 dark:bg-[#181818] shrink-0">
        {/* Status indicator */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-black/[0.04] dark:bg-white/[0.06] text-xs font-medium">
            <span
              className={`w-2 h-2 rounded-full ${
                debugState === 'running' || isAutoPlaying
                  ? 'bg-emerald-500 animate-pulse'
                  : debugState === 'paused'
                  ? 'bg-amber-500'
                  : 'bg-neutral-400'
              }`}
            />
            <span className="text-[11px] text-neutral-700 dark:text-neutral-300">
              {isAutoPlaying
                ? 'Auto-Stepping'
                : debugState === 'paused'
                ? `Paused : Line ${currentStep.line}`
                : 'Stopped'}
            </span>
          </div>
        </div>

        {/* Stepping controls */}
        <div className="flex items-center gap-1">
          {/* Auto Play / Pause Toggle */}
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => setIsAutoPlaying(!isAutoPlaying)}
                className={`p-1.5 rounded transition-colors cursor-pointer ${
                  isAutoPlaying
                    ? 'bg-amber-500/20 text-amber-500'
                    : 'hover:bg-black/[0.06] dark:hover:bg-white/[0.08] text-emerald-600 dark:text-emerald-400'
                }`}
              >
                {isAutoPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
              </button>
            </TooltipTrigger>
            <TooltipContent>{isAutoPlaying ? 'Pause Auto-Step' : 'Auto-Step (F5)'}</TooltipContent>
          </Tooltip>

          {/* Step Over */}
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={handleStepOver}
                disabled={debugState === 'idle'}
                className="p-1.5 rounded hover:bg-black/[0.06] dark:hover:bg-white/[0.08] text-sky-600 dark:text-sky-400 disabled:opacity-30 cursor-pointer transition-colors"
              >
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </TooltipTrigger>
            <TooltipContent>Step Over (F10)</TooltipContent>
          </Tooltip>

          {/* Step Into */}
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={handleStepOver}
                disabled={debugState === 'idle'}
                className="p-1.5 rounded hover:bg-black/[0.06] dark:hover:bg-white/[0.08] text-purple-600 dark:text-purple-400 disabled:opacity-30 cursor-pointer transition-colors"
              >
                <ArrowDown className="w-3.5 h-3.5" />
              </button>
            </TooltipTrigger>
            <TooltipContent>Step Into (F11)</TooltipContent>
          </Tooltip>

          {/* Step Out */}
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={handleStepBack}
                disabled={stepIndex === 0}
                className="p-1.5 rounded hover:bg-black/[0.06] dark:hover:bg-white/[0.08] text-indigo-600 dark:text-indigo-400 disabled:opacity-30 cursor-pointer transition-colors"
              >
                <ArrowUp className="w-3.5 h-3.5" />
              </button>
            </TooltipTrigger>
            <TooltipContent>Step Back / Out (Shift+F11)</TooltipContent>
          </Tooltip>

          {/* Restart */}
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={handleRestart}
                className="p-1.5 rounded hover:bg-black/[0.06] dark:hover:bg-white/[0.08] text-neutral-600 dark:text-neutral-300 cursor-pointer transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </TooltipTrigger>
            <TooltipContent>Restart (Ctrl+Shift+F5)</TooltipContent>
          </Tooltip>

          {/* Stop */}
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={handleStop}
                disabled={debugState === 'idle'}
                className="p-1.5 rounded hover:bg-black/[0.06] dark:hover:bg-white/[0.08] text-rose-600 dark:text-rose-400 disabled:opacity-30 cursor-pointer transition-colors"
              >
                <Square className="w-3.5 h-3.5 fill-current" />
              </button>
            </TooltipTrigger>
            <TooltipContent>Stop Session</TooltipContent>
          </Tooltip>
        </div>
      </div>

      {/* 2. Subtabs Navigation Header */}
      <div className="flex items-center gap-3 px-3 border-b border-black/[0.08] dark:border-white/[0.08] text-xs font-medium bg-white dark:bg-[#1a1a1a] shrink-0">
        {[
          { id: 'variables', label: 'Variables', icon: Variable },
          { id: 'visualizer', label: 'Visualizer', icon: Eye },
          { id: 'callstack', label: 'Call Stack', icon: Layers },
          { id: 'breakpoints', label: 'Breakpoints', icon: CircleDot },
          { id: 'console', label: 'Console', icon: Terminal },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-1.5 py-2 border-b-2 transition-colors cursor-pointer text-xs ${
              activeTab === tab.id
                ? 'border-neutral-900 dark:border-white text-neutral-900 dark:text-white font-semibold'
                : 'border-transparent text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
            }`}
          >
            <tab.icon className="w-3.5 h-3.5" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* 3. Subtab Content Area */}
      <div className="flex-1 overflow-y-auto p-3 text-xs">
        {/* TAB 1: Variables & Watch Window */}
        {activeTab === 'variables' && (
          <div className="space-y-3">
            {/* Scope Variables */}
            <div>
              <div className="text-[11px] font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                <span>Local Variables</span>
                <span className="text-[10px] lowercase text-neutral-400">Step {stepIndex + 1}/{debugSteps.length}</span>
              </div>
              <div className="space-y-1 bg-neutral-50 dark:bg-[#141414] rounded-lg p-2.5 border border-black/[0.06] dark:border-white/[0.06]">
                {currentStep.variables.map((v, idx) => (
                  <div
                    key={idx}
                    className={`flex items-center justify-between font-mono text-[11.5px] py-1 px-1.5 rounded transition-all ${
                      v.changed ? 'bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/30' : ''
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-purple-600 dark:text-purple-400 font-semibold">{v.name}:</span>
                      <span className="text-neutral-400 text-[10.5px]">({v.type})</span>
                    </div>
                    <span className="text-neutral-900 dark:text-white font-semibold">{v.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Watch Expressions */}
            <div>
              <div className="text-[11px] font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                <span>Watch Expressions</span>
                <button
                  onClick={() => setIsAddingWatch(true)}
                  className="p-0.5 hover:bg-neutral-200 dark:hover:bg-neutral-800 rounded text-neutral-500 cursor-pointer"
                  title="Add Watch Expression"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>

              {isAddingWatch && (
                <div className="flex items-center gap-1.5 mb-2">
                  <input
                    type="text"
                    value={newWatchInput}
                    onChange={(e) => setNewWatchInput(e.target.value)}
                    placeholder="e.g. nums[i], map.count()"
                    className="flex-1 px-2.5 py-1 text-xs rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-[#181818] outline-none font-mono text-neutral-800 dark:text-neutral-200"
                    onKeyDown={(e) => e.key === 'Enter' && handleAddWatch()}
                    autoFocus
                  />
                  <button
                    onClick={handleAddWatch}
                    className="px-2.5 py-1 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-xs rounded-md font-medium cursor-pointer"
                  >
                    Add
                  </button>
                </div>
              )}

              <div className="space-y-1 bg-neutral-50 dark:bg-[#141414] rounded-lg p-2.5 border border-black/[0.06] dark:border-white/[0.06]">
                {watchExpressions.map((expr, idx) => (
                  <div key={idx} className="flex items-center justify-between font-mono text-[11.5px] py-1 px-1.5 group">
                    <span className="text-neutral-600 dark:text-neutral-400">{expr}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                        {evalMockExpression(expr)}
                      </span>
                      <button
                        onClick={() => setWatchExpressions((prev) => prev.filter((_, i) => i !== idx))}
                        className="opacity-0 group-hover:opacity-100 text-neutral-400 hover:text-rose-500 cursor-pointer transition-opacity"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Visualizer (Data Structure Memory Map) */}
        {activeTab === 'visualizer' && (
          <div className="space-y-4">
            {/* Array Structure with Floating Pointer */}
            <div>
              <div className="text-[11px] font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider mb-2">
                Array: nums (Length: 4)
              </div>
              <div className="flex items-center gap-2 overflow-x-auto pb-2">
                {[2, 7, 11, 15].map((val, idx) => (
                  <div key={idx} className="flex flex-col items-center gap-1">
                    {/* Pointer Indicator */}
                    <div className="h-4 flex items-center justify-center">
                      {currentStep.pointerIndex === idx ? (
                        <span className="text-[10px] font-bold text-amber-500 animate-bounce">i ↓</span>
                      ) : null}
                    </div>

                    {/* Array Cell */}
                    <div
                      className={`w-12 h-12 rounded-lg border flex flex-col items-center justify-center font-mono font-bold text-sm transition-all ${
                        currentStep.pointerIndex === idx
                          ? 'border-amber-500 bg-amber-500/15 text-amber-600 dark:text-amber-400 shadow-sm'
                          : 'border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-[#141414] text-neutral-800 dark:text-neutral-200'
                      }`}
                    >
                      <span>{val}</span>
                      <span className="text-[9px] font-normal text-neutral-400 font-sans">idx {idx}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Hash Map Key-Value Store */}
            <div>
              <div className="text-[11px] font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider mb-2">
                Hash Table: map (Entries: {currentStep.mapState.length})
              </div>
              <div className="bg-neutral-50 dark:bg-[#141414] rounded-lg p-3 border border-black/[0.06] dark:border-white/[0.06]">
                {currentStep.mapState.length === 0 ? (
                  <div className="text-neutral-400 italic text-center py-2">Hash table is empty</div>
                ) : (
                  <div className="space-y-1.5 font-mono text-[11.5px]">
                    {currentStep.mapState.map((entry, idx) => (
                      <div key={idx} className="flex items-center justify-between bg-white dark:bg-[#1e1e1e] p-2 rounded border border-black/[0.04] dark:border-white/[0.04]">
                        <span className="text-purple-600 dark:text-purple-400 font-semibold">Key: {entry.key}</span>
                        <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Value (Index): {entry.val}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: Call Stack */}
        {activeTab === 'callstack' && (
          <div className="space-y-2">
            <div className="text-[11px] font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider mb-1.5">
              Call Frames (Thread #1)
            </div>
            {currentStep.stack.map((frame, idx) => (
              <div
                key={idx}
                className={`p-2.5 rounded-lg border font-mono text-xs cursor-pointer transition-colors ${
                  idx === 0
                    ? 'bg-blue-50/60 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800/50 text-blue-900 dark:text-blue-200'
                    : 'bg-neutral-50 dark:bg-[#141414] border-black/[0.04] dark:border-white/[0.04] text-neutral-600 dark:text-neutral-400'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold">#{idx} {frame.split(' : ')[0]}</span>
                  <span className="text-[10.5px] text-neutral-400">{frame.split(' : ')[1]}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB 4: Breakpoints */}
        {activeTab === 'breakpoints' && (
          <div className="space-y-2">
            <div className="text-[11px] font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider mb-1.5">
              Breakpoints ({breakpoints.length})
            </div>
            <div className="space-y-1.5">
              {breakpoints.map((bp, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2.5 rounded-lg bg-neutral-50 dark:bg-[#141414] border border-black/[0.06] dark:border-white/[0.06] group"
                >
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={bp.enabled}
                      onChange={() => handleToggleBreakpoint(bp.line)}
                      className="rounded accent-rose-500"
                    />
                    <span className="font-mono text-xs text-neutral-800 dark:text-neutral-200 font-semibold">
                      Line {bp.line}
                    </span>
                    <span className="text-neutral-400 text-[11px]">in Solution::twoSum</span>
                  </label>
                  <button
                    onClick={() => handleDeleteBreakpoint(bp.line)}
                    className="opacity-0 group-hover:opacity-100 text-neutral-400 hover:text-rose-500 cursor-pointer transition-opacity"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: Debug Console */}
        {activeTab === 'console' && (
          <div className="h-full flex flex-col">
            <div className="flex-1 space-y-1 font-mono text-[11.5px] overflow-y-auto mb-2 select-text">
              {consoleLogs.map((log, idx) => (
                <div
                  key={idx}
                  className={`leading-relaxed ${
                    log.type === 'error'
                      ? 'text-rose-500'
                      : log.type === 'output'
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-neutral-500 dark:text-neutral-400'
                  }`}
                >
                  <span className="opacity-40 mr-1.5 text-[10px]">[{log.time}]</span>
                  <span>{log.text}</span>
                </div>
              ))}
            </div>

            {/* Expression Evaluator */}
            <form onSubmit={handleConsoleEval} className="flex items-center gap-2 border-t border-black/[0.08] dark:border-white/[0.08] pt-2">
              <span className="text-neutral-400 font-mono text-xs">&gt;</span>
              <input
                type="text"
                value={consoleInput}
                onChange={(e) => setConsoleInput(e.target.value)}
                placeholder="Evaluate expression (e.g. target - nums[i])..."
                className="flex-1 bg-transparent text-xs font-mono outline-none text-neutral-800 dark:text-neutral-200 placeholder:text-neutral-400"
              />
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
