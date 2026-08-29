"use client";
import React, { useEffect, useState } from 'react';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";

import ProblemHeader from '@/components/ProblemHeader';
import ProblemPageNavigation from '@/components/ProblemPageNavigation';
import ProblemSideFooter from '@/components/ProblemPageSideFooter';
import { useParams, useSearchParams } from 'next/navigation';

import { mongodbObjectId } from '@/schemas/similarQuestionSchema';
import { toast } from 'sonner';
import axios from 'axios';
import { ApiResponse, codeSubmissionResultType, Judge0SubmissionResult } from '@/types/ApiResponse';
import { IProblem } from '@/models/Problem';
import { Skeleton } from "@/components/ui/skeleton";
import ProblemPageDescription from '@/components/ProblemPageDescription';
import ProblemPageCodeEditor, { codingLanguages } from '@/components/ProblemPageCodeEditor';
import { useTheme } from 'next-themes';
import { useSession } from 'next-auth/react';
import { codeRunValidation } from '@/schemas/codeRunSchema';
import { codeSubmissionValidation } from '@/schemas/codeSubmissionSchema';
import ProblemPageSoluction from '@/components/ProblemPageSoluction';
import ProblemPageSubmission from '@/components/ProblemPageSubmission';
import ProblemPageTestResult from '@/components/ProblemPageTestResult';
import ProblemPageAiTab from '@/components/ProblemPageAiTab';
import ProblemPageRightPanel from '@/components/ProblemPageRightPanel';
import { WorkspaceLayoutType } from '@/components/ProblemPageLayoutsModal';
import confetti from "canvas-confetti";
import { GeneratedProblem } from '@/types/generatedProblem';
import GammaProblemCanvas from '@/components/problem-builder/GammaProblemCanvas';

export default function ProblemPage() {
  const [mounted, setMounted] = useState<boolean>(false);
  const pathname = useParams();
  const searchParams = useSearchParams();
  const problemId = pathname?.problemId as string;
  const { theme } = useTheme();
  const { data: session } = useSession();

  const fallbackProblem: any = {
    _id: "c0000000-0000-0000-0000-000000000001",
    title: "Two Sum",
    level: "Easy",
    description: "You are given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
    examples: [
      { input: "nums = [2,7,11,15], target = 9", output: "[0,1]", explanation: "Because nums[0] + nums[1] == 9, we return [0, 1]." },
      { input: "nums = [3,2,4], target = 6", output: "[1,2]" },
      { input: "nums = [3,3], target = 6", output: "[0,1]" }
    ],
    constraints: [
      "2 <= nums.length <= 10^4",
      "-10^9 <= nums[i] <= 10^9",
      "-10^9 <= target <= 10^9",
      "Only one valid answer exists."
    ],
    testCases: [
      { input: "nums = [2,7,11,15], target = 9", output: "[0,1]" },
      { input: "nums = [3,2,4], target = 6", output: "[1,2]" },
      { input: "nums = [3,3], target = 6", output: "[0,1]" }
    ],
    topics: ["Array", "Hash Table"],
    companies: ["Google", "Amazon", "Meta"],
    hints: [
      "A really brute force way would be to search for all possible pairs of numbers but that would be too slow. Can you think of an optimization using extra memory or a hash map?",
      "So, if we check each element in one pass, can we look up its complement in O(1) time?",
      "Store elements you've seen so far in a hash table with their index for quick lookup!"
    ]
  };

  const [problemInfo, setProblemInfo] = useState<any>(null);
  const [allProblemIds, setAllProblemIds] = useState<string[]>([]);
  const [sourceCode, setSourceCode] = useState<string>("");
  const [selectedLanguage, setSelectedLanguage] = useState<string>("Python");
  const [selectedLanguageCode, setSelectedLanguageCode] = useState<number>(71);
  const [isCodeRunning, setIsCodeRunning] = useState<boolean>(false);
  const [isSubmitLoading, setIsSubmitLoading] = useState<boolean>(false);
  const [currentTab, setCurrentTab] = useState<string>("description");
  const [consoleTab, setConsoleTab] = useState<'testcase' | 'testresult'>('testcase');
  const [codeOutput, setCodeOutput] = useState<Judge0SubmissionResult[] | null>(null);
  const [submissionOutput, setSubmissionOutput] = useState<codeSubmissionResultType | null>(null);

  // Ask AI Dynamic Tab State
  const [isAskAiOpen, setIsAskAiOpen] = useState<boolean>(false);

  // Note Tab & Layout State
  const [isNoteOpen, setIsNoteOpen] = useState<boolean>(false);
  const [activeEditorTab, setActiveEditorTab] = useState<'code' | 'note'>('code');
  const [currentLayout, setCurrentLayout] = useState<WorkspaceLayoutType>('default');
  const [layoutKey, setLayoutKey] = useState<number>(0);
  const [panelSizes, setPanelSizes] = useState<{ left: number; right: number }>({ left: 50, right: 50 });

  const handleSelectLayout = (layout: WorkspaceLayoutType) => {
    setCurrentLayout(layout);
    // Prevent duplication: in 3-column layouts or focus mode, tabs belong in the right column
    if (layout === 'leet' || layout === 'note-taking' || layout === 'debug') {
      setIsNoteOpen(false);
      setActiveEditorTab('code');
      setIsAskAiOpen(false);
      if (currentTab === 'askAi') {
        setCurrentTab('description');
      }
    } else if (layout === 'focus') {
      setIsNoteOpen(false);
      setActiveEditorTab('code');
      setIsAskAiOpen(false);
      setPanelSizes({ left: 15, right: 85 });
    } else {
      // Default 2-column layout
      setPanelSizes({ left: 50, right: 50 });
    }
    setLayoutKey((prev) => prev + 1);
  };

  // Live Problem Generator State (triggered from Dashboard Chat)
  const [isLiveGenerating, setIsLiveGenerating] = useState<boolean>(false);
  const [liveGeneratedProblem, setLiveGeneratedProblem] = useState<GeneratedProblem | null>(null);

  useEffect(() => {
    setMounted(true);
    // Read preferred language from settings (defaults to Python)
    try {
      const savedLang = localStorage.getItem("easycode_pref_lang");
      if (savedLang) {
        setSelectedLanguage(savedLang);
        const langConfig = (codingLanguages as any)[savedLang];
        if (langConfig?.apiId) {
          setSelectedLanguageCode(langConfig.apiId);
        }
      }
    } catch (e) {}
  }, []);

  // Fetch all problem IDs for next/prev/random navigation
  useEffect(() => {
    const fetchAllProblems = async () => {
      try {
        const res = await axios.get<ApiResponse>('/api/problem/all-problems');
        if (res.data.allProblems) {
          const ids = res.data.allProblems.map((p: any) => (p._id || p.id).toString());
          setAllProblemIds(ids);
        }
      } catch (err) {
        console.error("Error fetching all problem IDs:", err);
      }
    };
    fetchAllProblems();
  }, []);

  // Check for Live Problem Generation request from Dashboard Chat
  useEffect(() => {
    if (!mounted) return;

    const isGenerateParam = searchParams?.get("generate") === "true";
    const paramPrompt = searchParams?.get("prompt");
    const paramDiff = (searchParams?.get("difficulty") || "Medium") as "Easy" | "Medium" | "Hard";
    const paramTopic = searchParams?.get("topic") || "Algorithms";
    const paramModel = searchParams?.get("model");

    let storedPrompt = "";
    let storedModel = "gemini-3.6-flash";
    try {
      storedPrompt = sessionStorage.getItem("easycode_live_generate_prompt") || "";
      storedModel = sessionStorage.getItem("easycode_live_generate_model") || localStorage.getItem("easycode_last_active_model") || "gemini-3.6-flash";
    } catch (e) {}

    const activePrompt = paramPrompt || storedPrompt;
    const activeModel = paramModel || storedModel || "gemini-3.6-flash";

    if (isGenerateParam && activePrompt) {
      // Clear stored prompt so it doesn't trigger repeatedly on reload
      try {
        sessionStorage.removeItem("easycode_live_generate_prompt");
      } catch (e) {}

      const triggerGeneration = async () => {
        setIsLiveGenerating(true);
        setCurrentTab("description");

        try {
          let apiKeys: Record<string, string> = {};
          try {
            const saved = localStorage.getItem("easycode_custom_keys");
            if (saved) apiKeys = JSON.parse(saved);
          } catch (e) {}

          const res = await fetch("/api/ai/generate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              prompt: activePrompt,
              difficulty: paramDiff,
              topic: paramTopic,
              focus: "Generate Problem",
              model: activeModel,
              customKeys: apiKeys,
            }),
          });

          const data = await res.json();
          if (data.success && data.problem) {
            const adapted: any = {
              _id: "gen-" + Date.now(),
              title: data.problem.title,
              level: data.problem.level || data.problem.difficulty || "Medium",
              description: data.problem.description,
              examples: data.problem.examples,
              constraints: data.problem.constraints,
              testCases: data.problem.testCases?.visible || data.problem.testCases || data.problem.examples || [],
              topics: data.problem.topics,
              companies: data.problem.companies || ["Google", "Meta", "Amazon"],
              hints: data.problem.hints,
              followUp: data.problem.followUp,
              expectedComplexity: data.problem.expectedComplexity,
              edgeCases: data.problem.edgeCases,
              starterCode: data.problem.starterCode,
              code_templates: data.problem.starterCode || {},
            };

            setLiveGeneratedProblem(data.problem);
            setProblemInfo(adapted);

            // Persist generated problem to storage so it survives hard refresh
            try {
              localStorage.setItem("easycode_last_generated_problem", JSON.stringify(data.problem));
            } catch (e) {}

            // Clean the URL query parameters so hard refresh (F5) preserves the problem without re-triggering generation
            if (typeof window !== "undefined") {
              window.history.replaceState(null, "", window.location.pathname);
            }

            // Synchronize starter code stub to editor automatically for the preferred language
            if (data.problem.starterCode) {
              const currentLang = localStorage.getItem("easycode_pref_lang") || selectedLanguage || "Python";
              const lowerLang = currentLang.toLowerCase();
              const codeKey = lowerLang.includes("python")
                ? "python"
                : lowerLang.includes("c++") || lowerLang.includes("cpp")
                ? "cpp"
                : lowerLang.includes("java") && !lowerLang.includes("script")
                ? "java"
                : lowerLang.includes("type")
                ? "typescript"
                : "javascript";

              const matchedCode =
                (data.problem.starterCode as any)[codeKey] ||
                data.problem.starterCode.python ||
                data.problem.starterCode.cpp ||
                "";
              if (matchedCode) {
                setSourceCode(matchedCode);
              }
            }
          } else {
            toast.error(data.message || "Failed to generate problem specification");
          }
        } catch (error) {
          console.error("Live generation error:", error);
          toast.error("Error connecting to AI generation service");
        } finally {
          setIsLiveGenerating(false);
        }
      };

      triggerGeneration();
    }
  }, [mounted, searchParams]);

  // Restore cached generated problem on refresh if on /problem/new without active generate parameter
  useEffect(() => {
    if (!mounted) return;
    if (problemId === "new" && searchParams?.get("generate") !== "true") {
      try {
        const cachedStr = localStorage.getItem("easycode_last_generated_problem");
        if (cachedStr) {
          const cached = JSON.parse(cachedStr);
          if (cached?.title && !problemInfo && !liveGeneratedProblem) {
            const adapted: any = {
              _id: "gen-" + (cached._id || Date.now()),
              title: cached.title,
              level: cached.level || cached.difficulty || "Medium",
              description: cached.description,
              examples: cached.examples,
              constraints: cached.constraints,
              testCases: cached.testCases?.visible || cached.testCases || cached.examples || [],
              topics: cached.topics,
              companies: cached.companies || ["Google", "Meta", "Amazon"],
              hints: cached.hints,
              followUp: cached.followUp,
              expectedComplexity: cached.expectedComplexity,
              edgeCases: cached.edgeCases,
              starterCode: cached.starterCode,
              code_templates: cached.starterCode || {},
            };

            setLiveGeneratedProblem(cached);
            setProblemInfo(adapted);

            if (cached.starterCode) {
              const currentLang = localStorage.getItem("easycode_pref_lang") || selectedLanguage || "Python";
              const lowerLang = currentLang.toLowerCase();
              const codeKey = lowerLang.includes("python")
                ? "python"
                : lowerLang.includes("c++") || lowerLang.includes("cpp")
                ? "cpp"
                : lowerLang.includes("java") && !lowerLang.includes("script")
                ? "java"
                : lowerLang.includes("type")
                ? "typescript"
                : "javascript";

              const matchedCode =
                (cached.starterCode as any)[codeKey] ||
                cached.starterCode.python ||
                cached.starterCode.cpp ||
                "";
              if (matchedCode) {
                setSourceCode(matchedCode);
              }
            }
          }
        }
      } catch (e) {}
    }
  }, [mounted, problemId, searchParams]);

  // Fetch problem details for static problems
  useEffect(() => {
    const fetchProblemDetails = async () => {
      if (
        !mounted ||
        !problemId ||
        problemId === "new" ||
        problemId === "generate" ||
        problemId === "c0000000-0000-0000-0000-000000000001" ||
        searchParams?.get("generate") === "true"
      )
        return;

      try {
        const parsedData = mongodbObjectId.safeParse(problemId);
        if (!parsedData.success) {
          setProblemInfo(fallbackProblem);
          return;
        }

        const res = await axios.get<ApiResponse>(`/api/problem/get-problem?problemId=${problemId}`);
        setProblemInfo(res.data.problem || fallbackProblem);
      } catch (error) {
        setProblemInfo(fallbackProblem);
      }
    };

    fetchProblemDetails();
  }, [problemId, mounted, searchParams]);

  // Confetti effect for successful submission
  const showConfetti = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
    });
  };

  // Run Code against Judge0
  const handleCodeRun = async () => {
    if (!sourceCode.trim()) {
      toast.error("Please write some code first!");
      return;
    }

    const testcases = problemInfo?.testCases || fallbackProblem.testCases;

    const data = {
      source_code: sourceCode,
      language_id: selectedLanguageCode,
      testCases: testcases,
    };

    const parsedData = codeRunValidation.safeParse(data);
    if (!parsedData.success) {
      toast.error(parsedData.error.issues[0].message);
      return;
    }

    setIsCodeRunning(true);
    setConsoleTab('testresult');
    try {
      const res = await axios.post<ApiResponse>("/api/code/run-code", data);
      setCodeOutput(res.data.results ?? null);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        toast.error(error.response.data.message || "Execution failed");
      } else {
        toast.error("Error while running code");
      }
    } finally {
      setIsCodeRunning(false);
    }
  };

  // Submit Code
  const handleCodeSubmission = async () => {
    if (!sourceCode.trim()) {
      toast.error("Please write some code before submitting!");
      return;
    }

    const data = {
      source_code: sourceCode,
      language_id: selectedLanguageCode,
      problemId: problemInfo?._id || problemId,
    };

    const parsedData = codeSubmissionValidation.safeParse(data);
    if (!parsedData.success) {
      toast.error(parsedData.error.issues[0].message);
      return;
    }

    setIsSubmitLoading(true);
    setConsoleTab('testresult');
    try {
      const res = await axios.post<ApiResponse>("/api/code/submit-code", data);
      if (res.data.submissionOutput?.status === "Accepted") {
        showConfetti();
      }
      setSubmissionOutput(res.data.submissionOutput ?? null);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        toast.error(error.response.data.message || "Submission failed");
      } else {
        toast.error("Error while submitting code");
      }
    } finally {
      setIsSubmitLoading(false);
    }
  };

  // Apply Generated Problem from Gamma Builder into the active Problem Page
  const handleApplyGeneratedProblem = (generated: GeneratedProblem) => {
    const adaptedProblem: any = {
      _id: "gen-" + Date.now(),
      title: generated.title,
      level: generated.level || generated.difficulty || "Medium",
      description: generated.description,
      examples: generated.examples,
      constraints: generated.constraints,
      testCases: generated.testCases?.visible || generated.testCases || [],
      topics: generated.topics,
      companies: generated.companies || ["Google", "Meta", "Amazon"],
      hints: generated.hints,
      followUp: generated.followUp,
      expectedComplexity: generated.expectedComplexity,
      edgeCases: generated.edgeCases,
    };

    setProblemInfo(adaptedProblem);

    // Synchronize starter code stub to editor
    if (generated.starterCode) {
      const lowerLang = selectedLanguage.toLowerCase();
      const codeKey = lowerLang.includes("python")
        ? "python"
        : lowerLang.includes("c++") || lowerLang.includes("cpp")
        ? "cpp"
        : lowerLang.includes("java") && !lowerLang.includes("script")
        ? "java"
        : lowerLang.includes("type")
        ? "typescript"
        : "javascript";

      const matchedCode = (generated.starterCode as any)[codeKey] || generated.starterCode.python || generated.starterCode.cpp || "";
      if (matchedCode) {
        setSourceCode(matchedCode);
      }
    }

    setLiveGeneratedProblem(null);
    setCurrentTab("description");
    toast.success(`"${generated.title}" loaded into editor!`);
  };

  // Navbar "Ask AI" button handler: opens the dynamic Ask AI tab next to Solutions
  const handleOpenAskAi = () => {
    setIsAskAiOpen(true);
    setCurrentTab("askAi");
  };

  const handleCloseAskAi = () => {
    setIsAskAiOpen(false);
    if (currentTab === "askAi") {
      setCurrentTab("description");
    }
  };

  if (!mounted) {
    return null;
  }

  return (
    <div className="w-full h-screen flex flex-col bg-[#f0f0f0] dark:bg-[#1a1a1a] overflow-hidden">
      {/* Top Navbar */}
      <ProblemHeader
        problemId={problemId}
        allProblemIds={allProblemIds}
        isCodeRunning={isCodeRunning}
        isSubmitLoading={isSubmitLoading}
        onRunCode={handleCodeRun}
        onSubmitCode={handleCodeSubmission}
        onOpenAi={() => {
          if (currentLayout === 'default') {
            handleOpenAskAi();
          } else {
            handleSelectLayout('leet');
          }
        }}
        onOpenNote={() => {
          if (currentLayout === 'default') {
            setIsNoteOpen((prev) => !prev);
            setActiveEditorTab((prev) => (prev === 'note' ? 'code' : 'note'));
          } else {
            handleSelectLayout('note-taking');
          }
        }}
        onOpenDebugger={() => handleSelectLayout('debug')}
        currentLayout={currentLayout}
        onSelectLayout={handleSelectLayout}
      />

      {/* Main Workspace with Horizontal & Vertical Resizable Panels */}
      <div className="flex-1 w-full px-2.5 pb-2.5 pt-0 overflow-hidden">
        {currentLayout === 'leet' || currentLayout === 'note-taking' || currentLayout === 'debug' ? (
          /* 3-Column Layout (Matching Leet, Note-taking, and Debug reference modes) */
          <ResizablePanelGroup key={layoutKey} direction="horizontal" className="w-full h-full">
            {/* Column 1: Left Panel (Description & Community Tabs) */}
            <ResizablePanel
              defaultSize={28}
              minSize={18}
              className="rounded-lg overflow-hidden border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#1a1a1a] flex flex-col shadow-sm"
            >
              <ProblemPageNavigation
                currentTab={currentTab}
                setCurrentTab={setCurrentTab}
                isAskAiOpen={isAskAiOpen}
                onCloseAskAi={handleCloseAskAi}
              />
              <div className="flex-1 overflow-y-auto min-h-0 bg-white dark:bg-[#1a1a1a]">
                {(liveGeneratedProblem || isLiveGenerating) && currentTab === "description" ? (
                  <GammaProblemCanvas
                    problem={liveGeneratedProblem}
                    isGenerating={isLiveGenerating}
                    onSolveInEditor={handleApplyGeneratedProblem}
                  />
                ) : !problemInfo && !liveGeneratedProblem ? (
                  <div className="p-6 space-y-4">
                    <Skeleton className="h-7 w-48 rounded-md" />
                    <div className="flex gap-2">
                      <Skeleton className="h-6 w-16 rounded-full" />
                      <Skeleton className="h-6 w-20 rounded-full" />
                      <Skeleton className="h-6 w-24 rounded-full" />
                    </div>
                    <Skeleton className="h-32 w-full rounded-md mt-6" />
                    <Skeleton className="h-28 w-full rounded-md mt-4" />
                  </div>
                ) : null}
                {!liveGeneratedProblem && problemInfo && currentTab === "description" && (
                  <ProblemPageDescription problemInfo={problemInfo} session={session} />
                )}
                {problemInfo && currentTab === "editorial" && (
                  <div className="p-6 text-xs text-neutral-700 dark:text-neutral-300 space-y-4">
                    <h2 className="text-base font-bold text-neutral-900 dark:text-white">Editorial Approach</h2>
                    <p className="leading-relaxed">
                      To solve this problem with optimal time and space complexity, consider a two-pointer or hash-map lookup approach to reduce search time from \(O(N^2)\) to \(O(N)\).
                    </p>
                  </div>
                )}
                {problemInfo && currentTab === "solutions" && (
                  <ProblemPageSoluction problemId={problemId} />
                )}
                {problemInfo && currentTab === "submissions" && (
                  <ProblemPageSubmission
                    theme={theme}
                    problemInfo={problemInfo}
                    setCurrentTab={setCurrentTab}
                    setSubmissionOutput={setSubmissionOutput}
                  />
                )}
              </div>
              <ProblemSideFooter />
            </ResizablePanel>

            <ResizableHandle />

            {/* Column 2: Middle Panel (Code Editor + Testcase/Test Result Console) */}
            <ResizablePanel defaultSize={42} minSize={25} className="overflow-hidden">
              <ResizablePanelGroup direction="vertical" className="w-full h-full">
                {/* Top: Code Editor */}
                <ResizablePanel
                  defaultSize={60}
                  minSize={25}
                  className="rounded-lg overflow-hidden border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#1a1a1a] shadow-sm"
                >
                  <ProblemPageCodeEditor
                    theme={theme}
                    selectedLanguage={selectedLanguage}
                    setSelectedLanguage={setSelectedLanguage}
                    setSelectedLanguageCode={setSelectedLanguageCode}
                    sourceCode={sourceCode}
                    setSourceCode={setSourceCode}
                    problemId={problemId}
                    problemInfo={problemInfo}
                    isNoteOpen={isNoteOpen}
                    activeEditorTab={activeEditorTab}
                    setActiveEditorTab={setActiveEditorTab}
                    onCloseNote={() => {
                      setIsNoteOpen(false);
                      setActiveEditorTab('code');
                    }}
                  />
                </ResizablePanel>

                <ResizableHandle />

                {/* Bottom: Testcase & Test Result Console */}
                <ResizablePanel
                  defaultSize={40}
                  minSize={20}
                  className="rounded-lg overflow-hidden border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#1a1a1a] shadow-sm"
                >
                  <ProblemPageTestResult
                    codeOutput={codeOutput}
                    isCodeRunning={isCodeRunning}
                    theme={theme}
                    problemInfo={problemInfo || (liveGeneratedProblem ? {
                      ...liveGeneratedProblem,
                      testCases: liveGeneratedProblem.testCases?.visible || liveGeneratedProblem.testCases || [],
                    } as any : null)}
                    session={session}
                    submissionOutput={submissionOutput}
                    setSubmissionOutput={setSubmissionOutput}
                    activeConsoleTab={consoleTab}
                    setActiveConsoleTab={setConsoleTab}
                  />
                </ResizablePanel>
              </ResizablePanelGroup>
            </ResizablePanel>

            <ResizableHandle />

            {/* Column 3: Right Panel (✨ Leet AI Chat / 📄 Notes / 🪲 Debugger) */}
            <ResizablePanel defaultSize={30} minSize={20} className="overflow-hidden">
              <ProblemPageRightPanel
                layout={currentLayout}
                problemId={problemId}
                problemInfo={problemInfo}
                sourceCode={sourceCode}
                setSourceCode={setSourceCode}
                theme={theme}
                onClose={() => handleSelectLayout('default')}
              />
            </ResizablePanel>
          </ResizablePanelGroup>
        ) : (
          /* 2-Column Layout (Default & Focus Modes) */
          <ResizablePanelGroup key={layoutKey} direction="horizontal" className="w-full h-full">
            {/* Left Panel: Description & Community Tabs */}
            <ResizablePanel
              defaultSize={panelSizes.left}
              minSize={15}
              className="rounded-lg overflow-hidden border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#1a1a1a] flex flex-col shadow-sm"
            >
              <ProblemPageNavigation
                currentTab={currentTab}
                setCurrentTab={setCurrentTab}
                isAskAiOpen={isAskAiOpen}
                onCloseAskAi={handleCloseAskAi}
              />
              <div className="flex-1 overflow-y-auto min-h-0 bg-white dark:bg-[#1a1a1a]">
                {(liveGeneratedProblem || isLiveGenerating) && currentTab === "description" ? (
                  <GammaProblemCanvas
                    problem={liveGeneratedProblem}
                    isGenerating={isLiveGenerating}
                    onSolveInEditor={handleApplyGeneratedProblem}
                  />
                ) : !problemInfo && !liveGeneratedProblem ? (
                  <div className="p-6 space-y-4">
                    <Skeleton className="h-7 w-48 rounded-md" />
                    <div className="flex gap-2">
                      <Skeleton className="h-6 w-16 rounded-full" />
                      <Skeleton className="h-6 w-20 rounded-full" />
                      <Skeleton className="h-6 w-24 rounded-full" />
                    </div>
                    <Skeleton className="h-32 w-full rounded-md mt-6" />
                    <Skeleton className="h-28 w-full rounded-md mt-4" />
                  </div>
                ) : null}
                {!liveGeneratedProblem && problemInfo && currentTab === "description" && (
                  <ProblemPageDescription problemInfo={problemInfo} session={session} />
                )}
                {problemInfo && currentTab === "editorial" && (
                  <div className="p-6 text-xs text-neutral-700 dark:text-neutral-300 space-y-4">
                    <h2 className="text-base font-bold text-neutral-900 dark:text-white">Editorial Approach</h2>
                    <p className="leading-relaxed">
                      To solve this problem with optimal time and space complexity, consider a two-pointer or hash-map lookup approach to reduce search time from \(O(N^2)\) to \(O(N)\).
                    </p>
                  </div>
                )}
                {problemInfo && currentTab === "solutions" && (
                  <ProblemPageSoluction problemId={problemId} />
                )}
                {(isAskAiOpen || currentTab === "askAi") && currentTab === "askAi" && (
                  <ProblemPageAiTab
                    sourceCode={sourceCode}
                    theme={theme}
                    problemInfo={problemInfo}
                    onSwitchTab={setCurrentTab}
                    onApplyCode={(code) => {
                      setSourceCode(code);
                      toast.success("Applied code to Monaco Editor!");
                    }}
                  />
                )}
                {problemInfo && currentTab === "submissions" && (
                  <ProblemPageSubmission
                    theme={theme}
                    problemInfo={problemInfo}
                    setCurrentTab={setCurrentTab}
                    setSubmissionOutput={setSubmissionOutput}
                  />
                )}
              </div>
              <ProblemSideFooter />
            </ResizablePanel>

            <ResizableHandle />

            {/* Right Panel: Split Vertically (Top: Editor, Bottom: Testcase/Test Result Console) */}
            <ResizablePanel defaultSize={panelSizes.right} minSize={25} className="overflow-hidden">
              <ResizablePanelGroup direction="vertical" className="w-full h-full">
                {/* Top: Code Editor */}
                <ResizablePanel
                  defaultSize={60}
                  minSize={25}
                  className="rounded-lg overflow-hidden border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#1a1a1a] shadow-sm"
                >
                  <ProblemPageCodeEditor
                    theme={theme}
                    selectedLanguage={selectedLanguage}
                    setSelectedLanguage={setSelectedLanguage}
                    setSelectedLanguageCode={setSelectedLanguageCode}
                    sourceCode={sourceCode}
                    setSourceCode={setSourceCode}
                    problemId={problemId}
                    problemInfo={problemInfo}
                    isNoteOpen={isNoteOpen}
                    activeEditorTab={activeEditorTab}
                    setActiveEditorTab={setActiveEditorTab}
                    onCloseNote={() => {
                      setIsNoteOpen(false);
                      setActiveEditorTab('code');
                    }}
                  />
                </ResizablePanel>

                <ResizableHandle />

                {/* Bottom: Testcase & Test Result Console */}
                <ResizablePanel
                  defaultSize={40}
                  minSize={20}
                  className="rounded-lg overflow-hidden border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#1a1a1a] shadow-sm"
                >
                  <ProblemPageTestResult
                    codeOutput={codeOutput}
                    isCodeRunning={isCodeRunning}
                    theme={theme}
                    problemInfo={problemInfo}
                    session={session}
                    submissionOutput={submissionOutput}
                    setSubmissionOutput={setSubmissionOutput}
                    activeConsoleTab={consoleTab}
                    setActiveConsoleTab={setConsoleTab}
                  />
                </ResizablePanel>
              </ResizablePanelGroup>
            </ResizablePanel>
          </ResizablePanelGroup>
        )}
      </div>
    </div>
  );
}
