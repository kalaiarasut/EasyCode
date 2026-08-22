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
import { useParams } from 'next/navigation';

import { mongodbObjectId } from '@/schemas/similarQuestionSchema';
import { toast } from 'sonner';
import axios from 'axios';
import { ApiResponse, codeSubmissionResultType, Judge0SubmissionResult } from '@/types/ApiResponse';
import { IProblem } from '@/models/Problem';
import { Skeleton } from "@/components/ui/skeleton";
import ProblemPageDescription from '@/components/ProblemPageDescription';
import ProblemPageCodeEditor from '@/components/ProblemPageCodeEditor';
import { useTheme } from 'next-themes';
import { useSession } from 'next-auth/react';
import { codeRunValidation } from '@/schemas/codeRunSchema';
import ProblemPageSoluction from '@/components/ProblemPageSoluction';
import ProblemPageSubmission from '@/components/ProblemPageSubmission';
import ProblemPageTestResult from '@/components/ProblemPageTestResult';
import { codeSubmissionValidation } from '@/schemas/codeSubmissionSchema';
import ProblemPageAiTab from '@/components/ProblemPageAiTab';
import confetti from "canvas-confetti";

export default function ProblemPage() {
  const [mounted, setMounted] = useState<boolean>(false);
  const pathname = useParams();
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

  const [problemInfo, setProblemInfo] = useState<any>(fallbackProblem);
  const [allProblemIds, setAllProblemIds] = useState<string[]>([]);
  const [sourceCode, setSourceCode] = useState<string>("");
  const [selectedLanguage, setSelectedLanguage] = useState<string>("C++");
  const [selectedLanguageCode, setSelectedLanguageCode] = useState<number>(54);
  const [isCodeRunning, setIsCodeRunning] = useState<boolean>(false);
  const [isSubmitLoading, setIsSubmitLoading] = useState<boolean>(false);
  const [currentTab, setCurrentTab] = useState<string>("description");
  const [consoleTab, setConsoleTab] = useState<'testcase' | 'testresult'>('testresult');
  const [codeOutput, setCodeOutput] = useState<Judge0SubmissionResult[] | null>(null);
  const [submissionOutput, setSubmissionOutput] = useState<codeSubmissionResultType | null>(null);

  useEffect(() => {
    setMounted(true);
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

  // Fetch problem details
  useEffect(() => {
    const fetchProblemDetails = async () => {
      if (!mounted || !problemId) return;

      try {
        const parsedData = mongodbObjectId.safeParse(problemId);
        if (!parsedData.success) {
          console.error("Invalid Problem Id: ", problemId);
          toast.error("Invalid Problem Id");
          return;
        }

        const res = await axios.get<ApiResponse>(`/api/problem/get-problem?problemId=${problemId}`);
        setProblemInfo(res.data.problem || null);
      } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
          toast.error(error.response.data.message || "Failed to load problem");
        } else {
          toast.error("Error while fetching problem");
        }
      }
    };

    fetchProblemDetails();
  }, [mounted, problemId]);

  const handleCodeRun = async () => {
    if (!problemInfo || !session) {
      if (!session) toast.error("Please sign in to run code");
      return;
    }

    setIsCodeRunning(true);
    setConsoleTab("testresult");
    setCodeOutput(null);
    setSubmissionOutput(null);

    try {
      const data = {
        sourceCode: sourceCode,
        languageId: selectedLanguageCode,
        testCases: problemInfo.testCases,
      };

      const parsedData = codeRunValidation.safeParse(data);
      if (!parsedData.success) {
        toast.error(parsedData.error.issues[0].message);
        return;
      }

      const res = await axios.post<ApiResponse>("/api/code/run-code", data);
      toast.success("Code executed successfully");
      setCodeOutput(res.data.results ?? null);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        toast.error(error.response.data.message || "Please check your code and try again.");
      } else {
        toast.error("Error while running code");
      }
    } finally {
      setIsCodeRunning(false);
    }
  };

  const showConfetti = () => {
    confetti({
      particleCount: 150,
      spread: 80,
      origin: { y: 0.6 },
    });
  };

  const handleCodeSubmission = async () => {
    if (!problemInfo || !session) {
      if (!session) toast.error("Please sign in to submit code");
      return;
    }

    setIsSubmitLoading(true);
    setConsoleTab("testresult");
    try {
      const data = {
        userId: session?.user._id,
        language: selectedLanguage,
        problemId: problemInfo._id,
        sourceCode,
        languageId: selectedLanguageCode,
        testCases: problemInfo.testCases,
      };

      const parsedData = codeSubmissionValidation.safeParse(data);
      if (!parsedData.success) {
        toast.error(parsedData.error.issues[0].message);
        return;
      }

      const res = await axios.post<ApiResponse>("/api/code/submit-code", data);
      toast.success("Code submitted successfully");
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

  if (!mounted) {
    return null;
  }

  return (
    <div className="w-full h-screen flex flex-col bg-neutral-100 dark:bg-[#121212] overflow-hidden">
      {/* Top Navbar */}
      <ProblemHeader
        problemId={problemId}
        allProblemIds={allProblemIds}
        isCodeRunning={isCodeRunning}
        isSubmitLoading={isSubmitLoading}
        onRunCode={handleCodeRun}
        onSubmitCode={handleCodeSubmission}
        onOpenAi={() => setCurrentTab("chatBot")}
      />

      {/* Main Workspace with Horizontal & Vertical Resizable Panels */}
      <div className="flex-1 w-full p-2 overflow-hidden">
        <ResizablePanelGroup direction="horizontal" className="w-full h-full">
          {/* Left Panel: Description & Community Tabs */}
          <ResizablePanel
            defaultSize={50}
            minSize={30}
            className="rounded-lg overflow-hidden border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#1a1a1a] flex flex-col shadow-sm"
          >
            {/* Left Top Tabs */}
            <ProblemPageNavigation currentTab={currentTab} setCurrentTab={setCurrentTab} />

            {/* Left Scrollable Content Body */}
            <div className="flex-1 overflow-y-auto min-h-0 bg-white dark:bg-[#1a1a1a]">
              {!problemInfo && (
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
              )}

              {problemInfo && currentTab === "description" && (
                <ProblemPageDescription problemInfo={problemInfo} session={session} />
              )}

              {problemInfo && currentTab === "editorial" && (
                <div className="p-6 text-xs text-neutral-700 dark:text-neutral-300 space-y-4">
                  <h2 className="text-base font-bold text-neutral-900 dark:text-white">Editorial Approach</h2>
                  <p className="leading-relaxed">
                    To solve this problem with optimal time and space complexity, consider a two-pointer or hash-map lookup approach to reduce the search time from \(O(N^2)\) to \(O(N)\).
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

              {problemInfo && currentTab === "chatBot" && (
                <ProblemPageAiTab sourceCode={sourceCode} theme={theme} />
              )}
            </div>

            {/* Bottom Docked Action Footer */}
            <ProblemSideFooter />
          </ResizablePanel>

          <ResizableHandle />

          {/* Right Panel: Split Vertically (Top: Editor, Bottom: Testcase/Test Result Console) */}
          <ResizablePanel defaultSize={50} minSize={30} className="overflow-hidden">
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
      </div>
    </div>
  );
}
