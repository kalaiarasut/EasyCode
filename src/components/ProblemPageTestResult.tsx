"use client";
import React, { useEffect, useState } from 'react';
import { codeSubmissionResultType, Judge0SubmissionResult } from '@/types/ApiResponse';
import {
  CheckCircle2,
  XCircle,
  Clock,
  Cpu,
  SquarePen,
  X,
  CheckSquare,
  Terminal,
  Loader2,
  Plus,
  Code,
  CircleHelp,
  Maximize2,
  Minimize2,
  ChevronLeft,
} from 'lucide-react';
import { Button } from './ui/button';
import { IProblem } from '@/models/Problem';
import { Skeleton } from './ui/skeleton';
import { Session } from 'next-auth';
import { formatDate } from '@/helpers/formatDate';
import MDEditor from '@uiw/react-md-editor';
import Link from 'next/link';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';

interface ProblemPageTestResultProps {
  codeOutput: Judge0SubmissionResult[] | null;
  isCodeRunning: boolean;
  theme: string | undefined;
  problemInfo?: IProblem | null;
  session: Session | null;
  submissionOutput: codeSubmissionResultType | null;
  setSubmissionOutput: React.Dispatch<React.SetStateAction<codeSubmissionResultType | null>>;
  activeConsoleTab?: 'testcase' | 'testresult';
  setActiveConsoleTab?: (tab: 'testcase' | 'testresult') => void;
}

interface ParsedParam {
  name: string;
  value: string;
}

const DEFAULT_TEST_CASES = [
  { input: "nums = [2,7,11,15], target = 9", output: "[0,1]" },
  { input: "nums = [3,2,4], target = 6", output: "[1,2]" },
  { input: "nums = [3,3], target = 6", output: "[0,1]" },
];

export default function ProblemPageTestResult({
  codeOutput,
  isCodeRunning,
  theme,
  problemInfo,
  session,
  submissionOutput,
  setSubmissionOutput,
  activeConsoleTab: externalTab,
  setActiveConsoleTab: setExternalTab,
}: ProblemPageTestResultProps) {
  const [internalTab, setInternalTab] = useState<'testcase' | 'testresult'>('testcase');
  const activeTab = externalTab || internalTab;
  const setActiveTab = setExternalTab || setInternalTab;

  const [selectedCaseIdx, setSelectedCaseIdx] = useState<number>(0);
  const extractTestCases = (info: any): Array<{ input: string; output: string }> => {
    if (!info) return [];
    if (Array.isArray(info.testCases) && info.testCases.length > 0) return info.testCases;
    if (Array.isArray(info.testCases?.visible) && info.testCases.visible.length > 0) return info.testCases.visible;
    if (Array.isArray(info.examples) && info.examples.length > 0) {
      return info.examples.map((ex: any) => ({
        input: ex.input || "",
        output: ex.output || "",
      }));
    }
    return [];
  };

  const [editableTestCases, setEditableTestCases] = useState<Array<{ input: string; output: string }>>(() =>
    extractTestCases(problemInfo)
  );
  const [isModified, setIsModified] = useState<boolean>(false);
  const [isConsoleExpanded, setIsConsoleExpanded] = useState<boolean>(false);

  useEffect(() => {
    const cases = extractTestCases(problemInfo);
    if (cases.length > 0) {
      setEditableTestCases(cases);
    } else if (!problemInfo) {
      setEditableTestCases([]);
    }
  }, [problemInfo]);

  // When codeOutput arrives, switch to testresult tab automatically
  useEffect(() => {
    if (codeOutput && codeOutput.length > 0) {
      setActiveTab('testresult');
    }
  }, [codeOutput]);

  const isAllAccepted =
    codeOutput && codeOutput.length > 0
      ? codeOutput.every((res) => res.status.description === "Accepted")
      : false;

  const currentCase = editableTestCases[selectedCaseIdx] || editableTestCases[0] || { input: "", output: "" };

  // Parse input string into individual parameter key-value pairs
  const parseParams = (inputStr: string): ParsedParam[] => {
    if (!inputStr) return [{ name: "nums", value: "[2,7,11,15]" }, { name: "target", value: "9" }];
    const parts = inputStr.split(/,\s*(?=[a-zA-Z_][a-zA-Z0-9_]*\s*=)/);
    const result: ParsedParam[] = [];
    
    parts.forEach((part) => {
      const match = part.match(/^([a-zA-Z_][a-zA-Z0-9_]*)\s*=\s*(.*)$/);
      if (match) {
        result.push({ name: match[1], value: match[2] });
      } else {
        result.push({ name: "param", value: part });
      }
    });

    return result.length > 0 ? result : [{ name: "input", value: inputStr }];
  };

  const parsedParams = parseParams(currentCase.input);

  // Handle editing a specific parameter's value
  const handleParamChange = (paramIndex: number, newValue: string) => {
    const updatedParams = [...parsedParams];
    updatedParams[paramIndex].value = newValue;
    const reconstructedInput = updatedParams.map(p => `${p.name} = ${p.value}`).join(", ");
    
    const updatedCases = [...editableTestCases];
    updatedCases[selectedCaseIdx] = {
      ...updatedCases[selectedCaseIdx],
      input: reconstructedInput,
    };

    setEditableTestCases(updatedCases);
    setIsModified(true);
  };

  // Add a new testcase (Plus button)
  const handleAddCase = () => {
    const newCase = {
      input: currentCase.input || "nums = [2,7,11,15], target = 9",
      output: currentCase.output || "[0,1]",
    };
    const updated = [...editableTestCases, newCase];
    setEditableTestCases(updated);
    setSelectedCaseIdx(updated.length - 1);
    setIsModified(true);
  };

  // Delete a testcase (x button on top right of case tab)
  const handleDeleteCase = (idxToDelete: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (editableTestCases.length <= 1) return;
    const updated = editableTestCases.filter((_, idx) => idx !== idxToDelete);
    setEditableTestCases(updated);
    setSelectedCaseIdx(Math.max(0, Math.min(selectedCaseIdx, updated.length - 1)));
    setIsModified(true);
  };

  // Reset testcases to problem default
  const handleResetTestcases = () => {
    if (problemInfo?.testCases && problemInfo.testCases.length > 0) {
      setEditableTestCases(problemInfo.testCases);
    } else {
      setEditableTestCases(DEFAULT_TEST_CASES);
    }
    setSelectedCaseIdx(0);
    setIsModified(false);
  };

  return (
    <div className="w-full h-full flex flex-col bg-white dark:bg-[#1a1a1a] overflow-hidden select-none" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif', fontSize: '14px', color: 'rgb(38, 38, 38)' }}>
      {/* Console Header Tabs - Exact LeetCode flexlayout tab bar: 36px, rgba(0,0,0,0.02) bg, 8px top radius */}
      <div
        className="w-full flex items-center justify-between px-1.5 shrink-0 group"
        style={{
          height: '36px',
          backgroundColor: 'rgba(0,0,0,0.02)',
          borderRadius: '8px 8px 0 0',
        }}
      >
        <div className="flex items-center">
          <button
            onClick={() => setActiveTab('testcase')}
            className="relative flex items-center gap-1.5 cursor-pointer transition-colors"
            style={{
              padding: '4px 8px',
              borderRadius: '5px',
              height: '28px',
              fontWeight: activeTab === 'testcase' ? 500 : 400,
              color: activeTab === 'testcase' ? 'rgb(26, 26, 26)' : 'rgba(0, 0, 0, 0.55)',
              fontSize: '14px',
              lineHeight: '21px',
              backgroundColor: 'transparent',
              border: 'none',
            }}
          >
            <CheckSquare style={{ width: '14px', height: '14px', color: 'rgb(46, 164, 79)' }} />
            <span>Testcase</span>
          </button>

          <button
            onClick={() => setActiveTab('testresult')}
            className="relative flex items-center gap-1.5 cursor-pointer transition-colors"
            style={{
              padding: '4px 8px',
              borderRadius: '5px',
              height: '28px',
              fontWeight: activeTab === 'testresult' ? 500 : 400,
              color: activeTab === 'testresult' ? 'rgb(26, 26, 26)' : 'rgba(0, 0, 0, 0.55)',
              fontSize: '14px',
              lineHeight: '21px',
              backgroundColor: 'transparent',
              border: 'none',
            }}
          >
            <Terminal style={{ width: '14px', height: '14px', opacity: 0.5 }} />
            <span>Test Result</span>
          </button>
        </div>

        {/* Right: Maximize & Fold/Collapse Options on Hover */}
        <div className="flex items-center gap-1 text-neutral-400 opacity-0 group-hover:opacity-100 transition-opacity pr-1">
          <button
            onClick={() => setIsConsoleExpanded(!isConsoleExpanded)}
            className="p-1 rounded hover:bg-neutral-200/60 dark:hover:bg-neutral-800 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors cursor-pointer"
            title="Maximize tabset"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setIsConsoleExpanded(!isConsoleExpanded)}
            className="p-1 rounded hover:bg-neutral-200/60 dark:hover:bg-neutral-800 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors cursor-pointer"
            title="Collapse tabset"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Console Scrollable Body */}
      <div className="flex-1 w-full p-4 overflow-y-auto relative text-xs select-text flex flex-col justify-between">
        {/* SUBMISSION OVERLAY */}
        {submissionOutput && (
          <div className="absolute inset-0 bg-white dark:bg-[#1a1a1a] p-5 z-20 overflow-y-auto">
            <div className="flex items-start justify-between pb-4 border-b border-neutral-200 dark:border-neutral-800">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  {submissionOutput.status === "Accepted" ? (
                    <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400">Accepted</span>
                  ) : (
                    <span className="text-xl font-bold text-rose-600 dark:text-rose-400">{submissionOutput.status}</span>
                  )}
                  <span className="text-xs text-neutral-500">
                    {submissionOutput.status === "Accepted" ? "All testcases passed" : "Some testcases failed"}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-neutral-400">
                  <span>Submitted at {formatDate(submissionOutput.createdAt as Date)}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {submissionOutput.status === "Accepted" && (
                  <Link href={`/add-solution?id=${submissionOutput._id}`}>
                    <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs">
                      <SquarePen className="w-3.5 h-3.5 mr-1.5" /> Share Solution
                    </Button>
                  </Link>
                )}
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setSubmissionOutput(null)}
                  className="h-8 w-8 p-0 text-neutral-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Metrics cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-4">
              <div className="p-3.5 rounded-lg bg-neutral-50 dark:bg-[#222222] border border-neutral-200 dark:border-neutral-800">
                <div className="flex items-center justify-between text-neutral-400 mb-1">
                  <span className="flex items-center gap-1.5 font-medium">
                    <Clock className="w-3.5 h-3.5 text-blue-500" /> Runtime
                  </span>
                  <span className="text-[11px] text-emerald-500 font-semibold">Beats 100%</span>
                </div>
                <div className="text-lg font-bold text-neutral-900 dark:text-white">
                  {(submissionOutput.time * 1000).toFixed(0)} ms
                </div>
              </div>

              <div className="p-3.5 rounded-lg bg-neutral-50 dark:bg-[#222222] border border-neutral-200 dark:border-neutral-800">
                <div className="flex items-center justify-between text-neutral-400 mb-1">
                  <span className="flex items-center gap-1.5 font-medium">
                    <Cpu className="w-3.5 h-3.5 text-purple-500" /> Memory
                  </span>
                  <span className="text-[11px] text-emerald-500 font-semibold">Beats 98.4%</span>
                </div>
                <div className="text-lg font-bold text-neutral-900 dark:text-white">
                  {submissionOutput.memory.toFixed(1)} MB
                </div>
              </div>
            </div>

            {/* Code review */}
            <div className="mt-4">
              <div className="text-xs font-semibold text-neutral-400 mb-2">Submitted Code ({submissionOutput.language})</div>
              <div className="rounded-lg overflow-hidden border border-neutral-200 dark:border-neutral-800">
                <MDEditor.Markdown
                  source={`\`\`\`${submissionOutput.language.toLowerCase()}\n${submissionOutput.sourceCode}\n\`\`\``}
                  className="markdown-body customTextWhite !bg-[#1e1e1e]"
                  style={{ background: "#1e1e1e" }}
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 1: TESTCASE (With Top-Right x badge on case tab & parameter inputs) */}
        {activeTab === 'testcase' && (
          <div className="space-y-4">
            {editableTestCases.length === 0 ? (
              <div className="py-8 text-center text-xs text-neutral-400 font-mono">
                {problemInfo ? "No test cases configured." : "Test cases will appear here once problem generation completes."}
              </div>
            ) : (
              <>
                {/* Case 1, Case 2, Case 3 Selectors + Add Button */}
                <div className="flex items-center flex-wrap gap-2.5 pt-1">
                  {editableTestCases.map((_, idx) => {
                    const isSelected = selectedCaseIdx === idx;
                    return (
                      <div key={idx} className="relative inline-block group">
                        <button
                          onClick={() => setSelectedCaseIdx(idx)}
                          className={`px-4 py-1.5 rounded-lg font-medium text-xs transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-neutral-200/90 dark:bg-neutral-700 text-neutral-900 dark:text-white font-semibold'
                              : 'bg-neutral-100 dark:bg-neutral-800/60 text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
                          }`}
                        >
                          Case {idx + 1}
                        </button>

                        {/* Delete x button anchored at top-right corner, ONLY appearing on hover (User Request) */}
                        {editableTestCases.length > 1 && (
                          <button
                            onClick={(e) => handleDeleteCase(idx, e)}
                            className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-neutral-400 hover:bg-neutral-600 dark:bg-neutral-500 dark:hover:bg-neutral-400 text-white flex items-center justify-center text-[9px] cursor-pointer shadow-sm transition-opacity opacity-0 group-hover:opacity-100"
                            title="Delete case"
                          >
                            <X className="w-2.5 h-2.5" />
                          </button>
                        )}
                      </div>
                    );
                  })}

                  {/* Plus button to add testcase */}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={handleAddCase}
                        className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>Add Testcase</TooltipContent>
                  </Tooltip>
                </div>

                {/* Editable Parameter Inputs */}
                <div className="space-y-3.5 pt-1">
                  {parsedParams.map((param, pIdx) => (
                    <div key={pIdx}>
                      <label className="text-[11.5px] font-medium text-neutral-500 dark:text-neutral-400 mb-1.5 block font-mono">
                        {param.name} =
                      </label>
                      <input
                        type="text"
                        value={param.value}
                        onChange={(e) => handleParamChange(pIdx, e.target.value)}
                        className="w-full rounded-lg bg-neutral-100/70 dark:bg-[#242424] border border-transparent focus:border-blue-500 dark:focus:border-blue-500 focus:bg-white dark:focus:bg-[#1a1a1a] focus:ring-1 focus:ring-blue-500 p-2.5 font-mono text-[13px] text-neutral-800 dark:text-neutral-200 outline-none transition-all"
                      />
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* TAB 2: TEST RESULT */}
        {activeTab === 'testresult' && (
          <div className="h-full flex flex-col justify-center">
            {/* 1. Empty State ("You must run your code first") */}
            {!codeOutput && !isCodeRunning && (
              <div className="w-full h-44 flex flex-col items-center justify-center text-neutral-400 dark:text-neutral-500">
                <p className="text-[13px]">You must run your code first</p>
              </div>
            )}

            {/* 2. Running State */}
            {isCodeRunning && (
              <div className="space-y-3 p-2">
                <div className="flex items-center gap-2 text-neutral-600 dark:text-neutral-400 text-xs">
                  <Loader2 className="w-4 h-4 animate-spin text-emerald-500" />
                  <span>Running testcases...</span>
                </div>
                <Skeleton className="w-48 h-8 rounded-md" />
                <Skeleton className="w-full h-20 rounded-md" />
              </div>
            )}

            {/* 3. Output Available */}
            {codeOutput && !isCodeRunning && (
              <div className="space-y-4">
                {/* Result header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {isAllAccepted ? (
                      <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                        <CheckCircle2 className="w-5 h-5 text-emerald-500" /> Accepted
                      </span>
                    ) : (
                      <span className="text-lg font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                        <XCircle className="w-5 h-5 text-rose-500" /> Wrong Answer
                      </span>
                    )}
                    <span className="text-xs text-neutral-500">Runtime: 0 ms</span>
                  </div>
                </div>

                {/* Case 1, Case 2 tabs */}
                <div className="flex items-center gap-2">
                  {codeOutput.map((out, idx) => {
                    const isCasePass = out.status.description === "Accepted";
                    return (
                      <button
                        key={idx}
                        onClick={() => setSelectedCaseIdx(idx)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium text-xs transition-colors cursor-pointer ${
                          selectedCaseIdx === idx
                            ? 'bg-neutral-200 dark:bg-neutral-700 text-neutral-900 dark:text-white font-semibold'
                            : 'bg-neutral-100 dark:bg-neutral-800/60 text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            isCasePass ? 'bg-emerald-500' : 'bg-rose-500'
                          }`}
                        />
                        <span>Case {idx + 1}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Case Input, Output, and Expected details */}
                {codeOutput[selectedCaseIdx] && (
                  <div className="space-y-3 pt-1">
                    <div>
                      <label className="text-[11px] font-semibold text-neutral-400 dark:text-neutral-500 mb-1 block">
                        Input
                      </label>
                      <div className="w-full rounded-md bg-neutral-50 dark:bg-[#222222] border border-neutral-200 dark:border-neutral-800 p-2.5 font-mono text-xs text-neutral-800 dark:text-neutral-200">
                        {editableTestCases[selectedCaseIdx]?.input || "N/A"}
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-neutral-400 dark:text-neutral-500 mb-1 block">
                        Output
                      </label>
                      <div className="w-full rounded-md bg-neutral-50 dark:bg-[#222222] border border-neutral-200 dark:border-neutral-800 p-2.5 font-mono text-xs text-neutral-800 dark:text-neutral-200">
                        {codeOutput[selectedCaseIdx].stdout?.trim() || codeOutput[selectedCaseIdx].compile_output || "null"}
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-neutral-400 dark:text-neutral-500 mb-1 block">
                        Expected
                      </label>
                      <div className="w-full rounded-md bg-neutral-50 dark:bg-[#222222] border border-neutral-200 dark:border-neutral-800 p-2.5 font-mono text-xs text-neutral-800 dark:text-neutral-200">
                        {editableTestCases[selectedCaseIdx]?.output || "N/A"}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* BOTTOM UTILITY BAR (Image 4: </> Source, Reset Testcases, Help) */}
        {activeTab === 'testcase' && (
          <div className="w-full pt-3 mt-2 flex items-center justify-between text-neutral-500 dark:text-neutral-400 text-xs border-t border-neutral-100 dark:border-neutral-800/60">
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-1 hover:text-neutral-800 dark:hover:text-neutral-200 transition-colors cursor-pointer">
                <Code className="w-3.5 h-3.5" />
                <span>Source</span>
              </button>

              {/* Reset Testcases Button (Appears when modified, matching Image 4) */}
              {isModified && (
                <button
                  onClick={handleResetTestcases}
                  className="text-neutral-500 hover:text-blue-500 dark:hover:text-blue-400 transition-colors cursor-pointer font-medium"
                >
                  Reset Testcases
                </button>
              )}

              <Tooltip>
                <TooltipTrigger asChild>
                  <button className="hover:text-neutral-800 dark:hover:text-neutral-200 transition-colors cursor-pointer">
                    <CircleHelp className="w-3.5 h-3.5" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>Testcase format info</TooltipContent>
              </Tooltip>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
