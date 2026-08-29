"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import {
  BookText,
  BookOpen,
  FlaskConical,
  History,
  Sparkles,
  CheckCircle2,
  Code2,
  Terminal,
  RotateCcw,
  Copy,
  Check,
  ChevronDown,
  Zap,
  Maximize2,
  Bookmark,
  Braces,
  Tag,
  Building2,
  CheckSquare,
  Plus,
  Loader2,
  Play,
  X,
  FileText,
  Clock,
  Settings as SettingsIcon,
  Sliders,
  Send,
  HelpCircle,
  ThumbsUp,
  MessageSquare,
  CheckCheck,
  Pause,
  Eye,
  Edit3,
  Trash2,
  Lightbulb,
  Bug,
  Info,
  Paperclip,
  ImageIcon,
  Mic,
  Brain,
  Layers,
  Film,
  Network,
  ArrowRight,
  ArrowDown,
  ArrowUp,
  Variable,
  CircleDot,
  List,
  ListOrdered,
  Quote,
  Code
} from "lucide-react";
import { toast } from "sonner";

export type WorkspaceLayoutType = 'default' | 'leet' | 'note-taking' | 'debug' | 'focus';

interface LanguageCodeTemplates {
  starter: string[];
  solution: string[];
}

const TEMPLATES: Record<"python" | "cpp" | "java", LanguageCodeTemplates> = {
  python: {
    starter: [
      "class Solution(object):",
      "    def twoSum(self, nums, target):",
      "        \"\"\"",
      "        :type nums: List[int]",
      "        :type target: int",
      "        :rtype: List[int]",
      "        \"\"\"",
      "        "
    ],
    solution: [
      "class Solution(object):",
      "    def twoSum(self, nums, target):",
      "        \"\"\"",
      "        :type nums: List[int]",
      "        :type target: int",
      "        :rtype: List[int]",
      "        \"\"\"",
      "        seen = {}",
      "        for i, num in enumerate(nums):",
      "            diff = target - num",
      "            if diff in seen:",
      "                return [seen[diff], i]",
      "            seen[num] = i",
      "        return []"
    ]
  },
  cpp: {
    starter: [
      "class Solution {",
      "public:",
      "    vector<int> twoSum(vector<int>& nums, int target) {",
      "        ",
      "    }",
      "};"
    ],
    solution: [
      "class Solution {",
      "public:",
      "    vector<int> twoSum(vector<int>& nums, int target) {",
      "        unordered_map<int, int> seen;",
      "        for (int i = 0; i < nums.size(); ++i) {",
      "            int diff = target - nums[i];",
      "            if (seen.count(diff)) {",
      "                return {seen[diff], i};",
      "            }",
      "            seen[nums[i]] = i;",
      "        }",
      "        return {};",
      "    }",
      "};"
    ]
  },
  java: {
    starter: [
      "class Solution {",
      "    public int[] twoSum(int[] nums, int target) {",
      "        ",
      "    }",
      "}"
    ],
    solution: [
      "class Solution {",
      "    public int[] twoSum(int[] nums, int target) {",
      "        Map<Integer, Integer> seen = new HashMap<>();",
      "        for (int i = 0; i < nums.length; i++) {",
      "            int diff = target - nums[i];",
      "            if (seen.containsKey(diff)) {",
      "                return new int[] { seen.get(diff), i };",
      "            }",
      "            seen.put(nums[i], i);",
      "        }",
      "        return new int[0];",
      "    }",
      "}"
    ]
  }
};

const TWO_SUM_DATA = {
  title: "Two Sum",
  level: "Easy",
  topics: ["Array", "Hash Table"],
  description:
    "You are given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
  examples: [
    {
      id: 1,
      input: "nums = [2,7,11,15], target = 9",
      output: "[0,1]",
      explanation: "Because nums[0] + nums[1] == 9, we return [0, 1]."
    },
    {
      id: 2,
      input: "nums = [3,2,4], target = 6",
      output: "[1,2]",
      explanation: null
    },
    {
      id: 3,
      input: "nums = [3,3], target = 6",
      output: "[0,1]",
      explanation: null
    }
  ],
  constraints: [
    "2 <= nums.length <= 10⁴",
    "-10⁹ <= nums[i] <= 10⁹",
    "-10⁹ <= target <= 10⁹",
    "Only one valid answer exists."
  ]
};

const FEATURE_CARDS = [
  {
    title: "Explain Intuition",
    description: "Understand the core pattern, mathematical invariant, and state logic.",
    icon: Lightbulb,
    prompt: "Explain the optimal algorithmic approach and intuition for Two Sum without giving the full code."
  },
  {
    title: "Debug Editor Code",
    description: "Inspect active Monaco code for syntax, bounds, and off-by-one bugs.",
    icon: Bug,
    prompt: "Review my current code in the editor. Are there any syntax errors, off-by-one mistakes, or edge cases it fails?"
  },
  {
    title: "Progressive Hint",
    description: "Get surgical guidance to solve the challenge without spoilers.",
    icon: HelpCircle,
    prompt: "Give me a progressive hint to guide my solution step-by-step."
  },
  {
    title: "Big-O & Limits",
    description: "Analyze time and space complexity against strict constraints.",
    icon: Clock,
    prompt: "Analyze the time and space complexity of my approach versus the optimal solution."
  }
];

export default function AgenticSolutionsPanel() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const leftPanelRef = useRef<HTMLDivElement>(null);
  const runBtnRef = useRef<HTMLButtonElement>(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.25 });

  // Stream state for description elements
  const [typedDesc, setTypedDesc] = useState<string>("");
  const [visibleExamplesCount, setVisibleExamplesCount] = useState<number>(0);
  const [visibleConstraintsCount, setVisibleConstraintsCount] = useState<number>(0);

  // Stream state for editor & testcase (slower, incremental)
  const [starterLinesCount, setStarterLinesCount] = useState<number>(1);
  const [solutionLinesCount, setSolutionLinesCount] = useState<number>(0);
  const [isTestcaseStreaming, setIsTestcaseStreaming] = useState<boolean>(false);
  const [typedNumsParam, setTypedNumsParam] = useState<string>("");
  const [typedTargetParam, setTypedTargetParam] = useState<string>("");

  // Mac Mouse Cursor state: "hidden" | "moving" | "clicking" | "done"
  const [cursorState, setCursorState] = useState<"hidden" | "moving" | "clicking" | "done">("hidden");
  const [isButtonClickedEffect, setIsButtonClickedEffect] = useState<boolean>(false);

  // Testcase data
  const [testCases, setTestCases] = useState([
    { id: 1, nums: "[2,7,11,15]", target: "9", expected: "[0,1]" },
    { id: 2, nums: "[3,2,4]", target: "6", expected: "[1,2]" },
    { id: 3, nums: "[3,3]", target: "6", expected: "[0,1]" }
  ]);

  // Execution & UI state
  const [isSolving, setIsSolving] = useState<boolean>(false);
  const [isSolved, setIsSolved] = useState<boolean>(false);
  const [selectedLanguage, setSelectedLanguage] = useState<"python" | "cpp" | "java">("python");
  
  // Left Navigation Tab state (Description | Editorial | Solutions | Submissions | Ask AI)
  const [currentTab, setCurrentTab] = useState<"description" | "editorial" | "solutions" | "submissions" | "askAi">("description");
  const [isAskAiOpen, setIsAskAiOpen] = useState<boolean>(false);

  // Editor Tab state: Code vs Note (Matching ProblemPageCodeEditor.tsx)
  const [isNoteOpen, setIsNoteOpen] = useState<boolean>(false);
  const [activeEditorTab, setActiveEditorTab] = useState<"code" | "note">("code");
  const [notepadContent, setNotepadContent] = useState<string>(
    "### Approach:\n- Use a Hash Map to store seen elements.\n\n### Complexity:\n- Time: O(N)\n- Space: O(N)\n\n### Key Takeaways:\n- Complements check avoids quadratic nested loops."
  );
  const [isNotePreview, setIsNotePreview] = useState<boolean>(false);
  const [isNotepadSaved, setIsNotepadSaved] = useState<boolean>(true);

  // Console Tabs (☑ Testcase | >_ Test Result)
  const [activeConsoleTab, setActiveConsoleTab] = useState<"testcase" | "testresult">("testcase");
  const [activeCaseIdx, setActiveCaseIdx] = useState(0);
  const [isCopied, setIsCopied] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);

  // Workspace Layouts State matching ProblemPageLayoutsModal.tsx
  const [currentLayout, setCurrentLayout] = useState<WorkspaceLayoutType>('default');

  // Ask AI State matching ProblemPageAiTab.tsx
  const [aiSelectedModel, setAiSelectedModel] = useState("Claude 3.7 Sonnet");
  const [aiModelDropdownOpen, setAiModelDropdownOpen] = useState(false);
  const [aiInput, setAiInput] = useState("");
  const [aiThinkingVerb, setAiThinkingVerb] = useState("Synthesizing");
  const [aiIsGenerating, setAiIsGenerating] = useState(false);
  const [aiChats, setAiChats] = useState<Array<{ id: string; user: string; assistant: string; isStreaming?: boolean }>>([
    {
      id: "init-1",
      user: "Explain the optimal hash map intuition for Two Sum.",
      assistant: "The optimal strategy uses a **single-pass hash map**. As we iterate through each number `x` at index `i`, we calculate its required complement `diff = target - x`. If `diff` is already in our map, we return `[map[diff], i]` immediately. This yields **O(N) Time** and **O(N) Space**."
    }
  ]);

  // Debugger Step Sequence matching ProblemPageDebugger.tsx
  const [debugStepIdx, setDebugStepIdx] = useState<number>(0);
  const debugSteps = [
    { line: 4, i: 0, num: 2, diff: 7, seen: "{}", log: "Step 0: Checking num = 2. diff = 9 - 2 = 7. Not found in seen. Insert seen[2] = 0." },
    { line: 5, i: 1, num: 7, diff: 2, seen: "{ 2: 0 }", log: "Step 1: Checking num = 7. diff = 9 - 7 = 2. Found 2 in seen at index 0! Return [0, 1]." }
  ];

  // Layouts Modal State
  const [isLayoutsModalOpen, setIsLayoutsModalOpen] = useState(false);

  // Settings & Stopwatch Timer State
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isTimerOpen, setIsTimerOpen] = useState(false);
  const [isTimerRunning, setIsTimerRunning] = useState(true);
  const [timerSeconds, setTimerSeconds] = useState(252); // 04:12

  const starterLines = TEMPLATES[selectedLanguage].starter;
  const fullSolutionLines = TEMPLATES[selectedLanguage].solution;

  // Stopwatch Timer Interval
  useEffect(() => {
    if (!isTimerRunning) return;
    const interval = setInterval(() => {
      setTimerSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  // Master Simultaneous Live Generation Timeline
  useEffect(() => {
    if (!isInView) return;

    let isMounted = true;

    const runGenerationTimeline = async () => {
      // Stream Starter Template in Editor
      let starterIdx = 1;
      const starterPromise = new Promise<void>((resolve) => {
        const starterInterval = setInterval(() => {
          if (!isMounted) {
            clearInterval(starterInterval);
            return;
          }
          if (starterIdx < starterLines.length) {
            starterIdx++;
            setStarterLinesCount(starterIdx);
          } else {
            clearInterval(starterInterval);
            resolve();
          }
        }, 110);
      });

      // Stream Description on Left (Sentence 1 -> Example 1 -> Example 2 -> Example 3 -> Constraints)
      const descriptionPromise = (async () => {
        let charIdx = 0;
        const descText = TWO_SUM_DATA.description;

        await new Promise<void>((resolve) => {
          const descInterval = setInterval(() => {
            if (!isMounted) {
              clearInterval(descInterval);
              return;
            }
            if (charIdx < descText.length) {
              setTypedDesc(descText.slice(0, charIdx + 1));
              charIdx++;
            } else {
              clearInterval(descInterval);
              resolve();
            }
          }, 16);
        });

        if (!isMounted) return;

        // Stream Examples incrementally
        await new Promise((r) => setTimeout(r, 200));
        setVisibleExamplesCount(1);
        await new Promise((r) => setTimeout(r, 500));
        if (!isMounted) return;

        setVisibleExamplesCount(2);
        await new Promise((r) => setTimeout(r, 450));
        if (!isMounted) return;

        setVisibleExamplesCount(3);
        await new Promise((r) => setTimeout(r, 450));
        if (!isMounted) return;

        // Stream Constraints
        for (let c = 1; c <= 4; c++) {
          await new Promise((r) => setTimeout(r, 240));
          if (!isMounted) return;
          setVisibleConstraintsCount(c);
        }
      })();

      // Testcase Parameter Streaming
      const testcasePromise = (async () => {
        await starterPromise;
        if (!isMounted) return;

        setIsTestcaseStreaming(true);
        const fullNums = "[2,7,11,15]";
        const fullTarget = "9";
        let nIdx = 0;

        await new Promise<void>((resolve) => {
          const numsInterval = setInterval(() => {
            if (!isMounted) {
              clearInterval(numsInterval);
              return;
            }
            if (nIdx < fullNums.length) {
              setTypedNumsParam(fullNums.slice(0, nIdx + 1));
              nIdx++;
            } else {
              clearInterval(numsInterval);
              let tIdx = 0;
              const targetInterval = setInterval(() => {
                if (!isMounted) {
                  clearInterval(targetInterval);
                  return;
                }
                if (tIdx < fullTarget.length) {
                  setTypedTargetParam(fullTarget.slice(0, tIdx + 1));
                  tIdx++;
                } else {
                  clearInterval(targetInterval);
                  resolve();
                }
              }, 90);
            }
          }, 75);
        });
      })();

      // Wait for both Description stream and Testcase stream to be complete
      await Promise.all([descriptionPromise, testcasePromise]);
      if (!isMounted) return;

      // Stream Solution Code into Editor
      await new Promise((r) => setTimeout(r, 500));
      if (!isMounted) return;

      let solIdx = starterLines.length;
      await new Promise<void>((resolve) => {
        const solutionInterval = setInterval(() => {
          if (!isMounted) {
            clearInterval(solutionInterval);
            return;
          }
          if (solIdx < fullSolutionLines.length) {
            solIdx++;
            setSolutionLinesCount(solIdx);
          } else {
            clearInterval(solutionInterval);
            resolve();
          }
        }, 95);
      });

      if (!isMounted) return;

      // Mac Mouse Cursor Animation to Click Run Button
      await new Promise((r) => setTimeout(r, 400));
      if (!isMounted) return;

      setCursorState("moving");
      await new Promise((r) => setTimeout(r, 1100));
      if (!isMounted) return;

      setCursorState("clicking");
      setIsButtonClickedEffect(true);

      await new Promise((r) => setTimeout(r, 220));
      if (!isMounted) return;

      setIsButtonClickedEffect(false);
      setIsSolving(true);
      setActiveConsoleTab("testresult");
      setCursorState("done");

      await new Promise((r) => setTimeout(r, 850));
      if (!isMounted) return;

      setIsSolving(false);
      setIsSolved(true);
    };

    runGenerationTimeline();

    return () => {
      isMounted = false;
    };
  }, [isInView, starterLines.length, fullSolutionLines.length]);

  // Smooth auto-scroll left description panel
  useEffect(() => {
    if (leftPanelRef.current) {
      leftPanelRef.current.scrollTo({
        top: leftPanelRef.current.scrollHeight,
        behavior: "smooth"
      });
    }
  }, [typedDesc, visibleExamplesCount, visibleConstraintsCount]);

  const handleCopyCode = () => {
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleRunCode = () => {
    setIsSolving(true);
    setActiveConsoleTab("testresult");
    setTimeout(() => {
      setIsSolving(false);
      setIsSolved(true);
    }, 700);
  };

  const handleRestartSim = () => {
    setTypedDesc(TWO_SUM_DATA.description);
    setVisibleExamplesCount(3);
    setVisibleConstraintsCount(4);
    setStarterLinesCount(starterLines.length);
    setSolutionLinesCount(fullSolutionLines.length);
    setIsTestcaseStreaming(true);
    setTypedNumsParam("[2,7,11,15]");
    setTypedTargetParam("9");
    setIsSolved(true);
    setIsSolving(false);
    setCursorState("hidden");
    setActiveConsoleTab("testcase");
  };

  const handleAddTestCase = () => {
    const newId = testCases.length + 1;
    const newCase = { id: newId, nums: "[5,1,8,4]", target: "9", expected: "[0,3]" };
    setTestCases([...testCases, newCase]);
    setActiveCaseIdx(testCases.length);
  };

  // Note Handlers matching ProblemPageCodeEditor.tsx
  const handleNoteChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNotepadContent(e.target.value);
    setIsNotepadSaved(false);
    setTimeout(() => setIsNotepadSaved(true), 400);
  };

  const insertNoteFormat = (prefix: string, suffix: string = "") => {
    const next = notepadContent ? `${notepadContent}\n${prefix}${suffix}` : `${prefix}${suffix}`;
    setNotepadContent(next);
    setIsNotepadSaved(true);
  };

  const insertNotepadTemplate = (snippet: string) => {
    const next = notepadContent ? `${notepadContent}\n\n${snippet}` : snippet;
    setNotepadContent(next);
    setIsNotepadSaved(true);
  };

  const handleClearNotepad = () => {
    setNotepadContent("");
    setIsNotepadSaved(true);
  };

  // Ask AI Send handler
  const handleAiSend = (promptText?: string) => {
    const text = promptText || aiInput;
    if (!text.trim() || aiIsGenerating) return;

    const newId = `msg-${Date.now()}`;
    setAiChats((prev) => [
      ...prev,
      { id: newId, user: text, assistant: "", isStreaming: true }
    ]);
    setAiInput("");
    setAiIsGenerating(true);
    setAiThinkingVerb("Analyzing");

    setTimeout(() => {
      setAiThinkingVerb("Synthesizing");
    }, 600);

    setTimeout(() => {
      setAiChats((prev) =>
        prev.map((c) =>
          c.id === newId
            ? {
                ...c,
                assistant:
                  "For Two Sum, checking `diff in seen` runs in **O(1) average lookup time**. With an optimal single-pass Hash Map, you achieve **O(N) Total Time** and **O(N) Space Complexity**.",
                isStreaming: false
              }
            : c
        )
      );
      setAiIsGenerating(false);
    }, 1200);
  };

  // 1. EXACT NAVBAR ASK AI HANDLER (ProblemPageNavigation.tsx & page.tsx)
  // In default layout, opens the "Ask AI" tab right after "Submissions" in the left panel
  const handleNavbarAskAi = () => {
    if (currentLayout === 'default') {
      setIsAskAiOpen(true);
      setCurrentTab("askAi");
    } else {
      setCurrentLayout('leet');
    }
  };

  // 2. EXACT NAVBAR NOTE HANDLER (ProblemPageCodeEditor.tsx & page.tsx)
  // In default layout, opens the "Note" tab right next to "Code" in the editor section
  const handleNavbarNote = () => {
    if (currentLayout === 'default') {
      setIsNoteOpen(true);
      setActiveEditorTab((prev) => (prev === 'note' ? 'code' : 'note'));
    } else {
      setCurrentLayout('note-taking');
    }
  };

  // 3. EXACT NAVBAR DEBUGGER HANDLER (ProblemPageDebugger.tsx & page.tsx)
  // Toggles the 3-column Sandbox Debugger layout
  const handleNavbarDebugger = () => {
    if (currentLayout === 'debug') {
      setCurrentLayout('default');
    } else {
      setCurrentLayout('debug');
    }
  };

  const handleLayoutSelect = (layout: WorkspaceLayoutType) => {
    setCurrentLayout(layout);
    setIsLayoutsModalOpen(false);
    toast.success(`Layout changed to ${layout.charAt(0).toUpperCase() + layout.slice(1)}`);
  };

  const displayedCodeLines =
    solutionLinesCount > 0
      ? fullSolutionLines.slice(0, solutionLinesCount)
      : starterLines.slice(0, starterLinesCount);

  return (
    <section
      ref={sectionRef}
      id="problem-canvas"
      className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto font-sans scroll-mt-20 relative"
    >
      {/* Section Header */}
      <div className="text-center space-y-3 mb-12">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/[0.04] dark:bg-white/[0.06] border border-black/[0.06] dark:border-white/[0.06] text-xs font-mono text-neutral-700 dark:text-neutral-300">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>Interactive Problem Workspace</span>
        </div>

        <h2 className="text-3xl sm:text-4xl md:text-5xl font-sans font-bold tracking-tight text-[#1C1B19] dark:text-[#F3F2F0]">
          Algorithmic mastery{" "}
          <br className="hidden sm:inline" />
          <span className="font-serif italic font-normal text-neutral-700 dark:text-neutral-300">
            inside our exact Problem Canvas.
          </span>
        </h2>

        <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 max-w-xl mx-auto leading-relaxed">
          The exact interface used by thousands of engineers for LeetCode practice and technical interview prep.
        </p>
      </div>

      {/* SHOWCASE: 100% EXACT REPLICA OF THE REAL PROBLEM PAGE */}
      <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-[#FAFAFA] dark:bg-[#121110] shadow-2xl overflow-hidden text-neutral-900 dark:text-neutral-100 transition-colors duration-300 relative">
        
        {/* MAC OS MOUSE CURSOR POINTER ANIMATION */}
        <AnimatePresence>
          {cursorState !== "hidden" && cursorState !== "done" && (
            <motion.div
              initial={{ opacity: 0, left: "70%", top: "60%" }}
              animate={
                cursorState === "moving"
                  ? { opacity: 1, left: "47.5%", top: "18px", transition: { duration: 1.0, ease: [0.25, 0.1, 0.25, 1.0] } }
                  : cursorState === "clicking"
                  ? { opacity: 1, left: "47.5%", top: "18px", scale: 0.85, transition: { duration: 0.1 } }
                  : { opacity: 0, transition: { duration: 0.3 } }
              }
              exit={{ opacity: 0, scale: 0.8 }}
              className="absolute z-50 pointer-events-none drop-shadow-2xl select-none"
              style={{ transformOrigin: "top left" }}
            >
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M1 1L8.5 20.5L12 13L19.5 9.5L1 1Z"
                  fill="#000000"
                  stroke="#FFFFFF"
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                />
              </svg>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 1. REAL GLOBAL PROBLEM PAGE HEADER (Exact ProblemHeader.tsx) */}
        <div
          className="relative flex h-[48px] w-full shrink-0 items-center justify-between gap-2 px-2.5 select-none border-b border-neutral-200 dark:border-neutral-800 bg-[#f0f0f0] dark:bg-[#1a1a1a]"
          style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif', fontSize: '14px' }}
        >
          {/* Left: Logo + Problem List + Prev/Next/Shuffle */}
          <div className="flex min-w-[180px] flex-1 items-center overflow-hidden">
            <div className="mr-2 self-center pl-1">
              <div className="hidden h-5 dark:flex">
                <img src="/navLogo dark.png" className="h-full" alt="Logo" />
              </div>
              <div className="flex h-5 dark:hidden">
                <img src="/navLogo light.png" className="h-full" alt="Logo" />
              </div>
            </div>

            <button
              onClick={handleRestartSim}
              className="flex items-center justify-center p-1 rounded bg-neutral-300/70 dark:bg-neutral-700/70 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-300 dark:hover:bg-neutral-600 hover:text-neutral-900 dark:hover:text-white transition-colors cursor-pointer"
              title="Problem List"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" width="1em" height="1em" fill="currentColor" className="h-[1em] w-[0.875em]">
                <path d="M0 64C0 77.3 10.7 88 24 88H424c13.3 0 24-10.7 24-24s-10.7-24-24-24H24C10.7 40 0 50.7 0 64zM192 192c0 13.3 10.7 24 24 24H424c13.3 0 24-10.7 24-24s-10.7-24-24-24H216c-13.3 0-24 10.7-24 24zm24 104c-13.3 0-24 10.7-24 24s10.7 24 24 24H424c13.3 0 24-10.7 24-24s-10.7-24-24-24H216zM0 448c0 13.3 10.7 24 24 24H424c13.3 0 24-10.7 24-24s-10.7-24-24-24H24c-13.3 0-24 10.7-24 24zM121 268.4c7.8-6.4 7.8-18.3 0-24.7L26.2 165.6C15.7 157 0 164.4 0 177.9V334.1c0 13.5 15.7 20.9 26.2 12.4L121 268.4z" />
              </svg>
            </button>

            <div className="flex items-center ml-2 text-neutral-600 dark:text-neutral-300">
              <button
                onClick={() => setActiveCaseIdx(0)}
                className="relative flex items-center justify-center p-[9px] h-8 text-[rgb(119,119,119)] dark:text-[rgb(153,153,153)] hover:text-[rgb(26,26,26)] dark:hover:text-white transition-colors opacity-40 cursor-pointer"
                title="Previous Problem"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512" width="0.625em" height="1em" fill="currentColor">
                  <path d="M15 239c-9.4 9.4-9.4 24.6 0 33.9L207 465c9.4 9.4 24.6 9.4 33.9 0s9.4-24.6 0-33.9L65.9 256 241 81c9.4-9.4 9.4-24.6 0-33.9s-24.6-9.4-33.9 0L15 239z" />
                </svg>
              </button>
              <button
                onClick={() => setActiveCaseIdx(1)}
                className="relative flex items-center justify-center p-[9px] h-8 text-[rgb(119,119,119)] dark:text-[rgb(153,153,153)] hover:text-[rgb(26,26,26)] dark:hover:text-white transition-colors cursor-pointer"
                title="Next Problem"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512" width="0.625em" height="1em" fill="currentColor">
                  <path d="M305 239c9.4 9.4 9.4 24.6 0 33.9L113 465c-9.4 9.4-24.6 9.4-33.9 0s-9.4-24.6 0-33.9l175-175L79 81c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0L305 239z" />
                </svg>
              </button>
              <button
                onClick={handleRestartSim}
                className="relative flex items-center justify-center p-[9px] h-8 text-[rgb(119,119,119)] dark:text-[rgb(153,153,153)] hover:text-[rgb(26,26,26)] dark:hover:text-white transition-colors cursor-pointer"
                title="Shuffle Random Problem"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="1em" height="1em" fill="currentColor">
                  <path d="M425 31l80 80c9.4 9.4 9.4 24.6 0 33.9l-80 80c-9.4 9.4-24.6 9.4-33.9 0s-9.4-24.6 0-33.9l39-39H352c-12.6 0-24.4 5.9-32 16l-46 61.3-30-40 37.6-50.1C298.2 117 324.3 104 352 104h78.1L391 65c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0zM204 322.7l-37.6 50.1C149.8 395 123.7 408 96 408H24c-13.3 0-24-10.7-24-24s10.7-24 24-24H96c12.6 0 24.4-5.9 32-16l46-61.3 30 40zM391 287c9.4-9.4 24.6-9.4 33.9 0l80 80c9.4 9.4 9.4 24.6 0 33.9l-80 80c-9.4 9.4-24.6 9.4-33.9 0s-9.4-24.6 0-33.9l39-39H352c-27.7 0-53.8-13-70.4-35.2L128 168c-7.6-10.1-19.4-16-32-16H24c-13.3 0-24-10.7-24-24s10.7-24 24-24H96c27.7 0 53.8 13 70.4 35.2L320 344c7.6 10.1 19.4 16 32 16h78.1l-39-39c-9.4-9.4-9.4-24.6 0-33.9z" />
                </svg>
              </button>
            </div>
          </div>

          {/* Center: Action Cluster with 🪲 Debugger + Play + Submit + Note + AI */}
          <div className="flex items-center gap-1.5 h-full py-2 select-none">
            {/* 1. 🪲 Debugger Square */}
            <div className={`flex h-8 w-8 items-center justify-center rounded-md transition-colors overflow-hidden ${
              currentLayout === 'debug'
                ? "bg-amber-500/20 text-amber-600 dark:text-amber-400"
                : "bg-black/[0.04] dark:bg-white/[0.06]"
            }`}>
              <button
                onClick={handleNavbarDebugger}
                className="w-full h-full flex items-center justify-center hover:text-neutral-900 dark:hover:text-white transition-colors cursor-pointer"
                title="Toggle Sandbox Debugger (GDB)"
              >
                <Bug className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* 2. Play / Run Button */}
            <div className={`flex h-8 w-8 items-center justify-center rounded-md transition-all ${
              isButtonClickedEffect
                ? "bg-emerald-500/30 ring-2 ring-emerald-500 scale-90"
                : "bg-black/[0.04] dark:bg-white/[0.06]"
            } overflow-hidden`}>
              <button
                ref={runBtnRef}
                onClick={handleRunCode}
                className="w-full h-full flex items-center justify-center text-neutral-800 dark:text-neutral-200 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
                title="Run Code"
              >
                {isSolving ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-500" />
                ) : (
                  <Play className="w-3 h-3 fill-current" />
                )}
              </button>
            </div>

            {/* 3. Submit Button */}
            <div className="flex h-8 items-center justify-center rounded-md bg-black/[0.04] dark:bg-white/[0.06] overflow-hidden">
              <button
                onClick={handleRunCode}
                className="flex items-center gap-1.5 px-3 h-full font-medium text-[rgb(1,179,40)] dark:text-[rgb(43,212,82)] hover:bg-black/[0.04] dark:hover:bg-white/[0.04] transition-colors cursor-pointer whitespace-nowrap text-sm"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Submit</span>
              </button>
            </div>

            {/* 4. Note Sticky Square (Toggles Note Tab in Editor Section) */}
            <div className={`flex h-8 w-8 items-center justify-center rounded-md transition-colors overflow-hidden ${
              (isNoteOpen && activeEditorTab === 'note') || currentLayout === 'note-taking'
                ? "bg-amber-500/20 text-amber-600 dark:text-amber-400"
                : "bg-black/[0.04] dark:bg-white/[0.06]"
            }`}>
              <button
                onClick={handleNavbarNote}
                className="w-full h-full flex items-center justify-center hover:text-neutral-900 dark:hover:text-white transition-colors cursor-pointer"
                title="Notes / Scratchpad"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" width="0.875em" height="1em" fill="currentColor">
                  <path d="M64 80c-8.8 0-16 7.2-16 16V416c0 8.8 7.2 16 16 16H288V352c0-17.7 14.3-32 32-32h80V96c0-8.8-7.2-16-16-16H64zM288 480H64c-35.3 0-64-28.7-64-64V96C0 60.7 28.7 32 64 32H384c35.3 0 64 28.7 64 64V320v5.5c0 17-6.7 33.3-18.7 45.3l-90.5 90.5c-12 12-28.3 18.7-45.3 18.7H288z" />
                </svg>
              </button>
            </div>

            {/* 5. AI Sparkle Gradient Square (Opens Ask AI Tab after Submissions in Left Panel) */}
            <div className={`flex h-8 w-8 items-center justify-center rounded-md transition-colors overflow-hidden ${
              currentTab === 'askAi' || currentLayout === 'leet'
                ? "bg-purple-500/20 text-purple-600"
                : "bg-black/[0.04] dark:bg-white/[0.06]"
            }`}>
              <button
                onClick={handleNavbarAskAi}
                className="w-full h-full flex items-center justify-center hover:bg-black/[0.04] dark:hover:bg-white/[0.04] transition-colors cursor-pointer"
                title="Ask EasyCode AI Copilot"
              >
                <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              </button>
            </div>
          </div>

          {/* Right: Layouts + Settings + Stopwatch + User Avatar */}
          <div className="relative flex flex-1 items-center justify-end">
            <button
              onClick={() => setIsLayoutsModalOpen(!isLayoutsModalOpen)}
              className={`relative flex items-center justify-center p-[9px] h-8 transition-colors cursor-pointer ${
                isLayoutsModalOpen ? "text-amber-500" : "text-[rgb(119,119,119)] dark:text-[rgb(153,153,153)] hover:text-[rgb(26,26,26)] dark:hover:text-white"
              }`}
              title="Workspace Layouts"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" width="0.875em" height="1em" fill="currentColor">
                <path d="M48 80V240h96V80H48zM0 80C0 53.5 21.5 32 48 32h96c26.5 0 48 21.5 48 48V240c0 26.5-21.5 48-48 48H48c-26.5 0-48-21.5-48-48V80zM304 272V432h96V272H304zm-48 0c0-26.5 21.5-48 48-48h96c26.5 0 48 21.5 48 48V432c0 26.5-21.5 48-48 48H304c-26.5 0-48-21.5-48-48V272zM144 368H48v64h96V368zM48 320h96c26.5 0 48 21.5 48 48v64c0 26.5-21.5 48-48 48H48c-26.5 0-48-21.5-48-48V368c0-26.5 21.5-48 48-48zM304 80v64h96V80H304zm-48 0c0-26.5 21.5-48 48-48h96c26.5 0 48 21.5 48 48v64c0 26.5-21.5 48-48 48H304c-26.5 0-48-21.5-48-48V80z" />
              </svg>
            </button>

            <button
              onClick={() => setIsSettingsOpen(!isSettingsOpen)}
              className="relative flex items-center justify-center p-[9px] h-8 text-[rgb(119,119,119)] dark:text-[rgb(153,153,153)] hover:text-[rgb(26,26,26)] dark:hover:text-white transition-colors cursor-pointer"
              title="Editor & Environment Settings"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="1em" height="1em" fill="currentColor">
                <path d="M256 0c17 0 33.6 1.7 49.8 4.8c7.9 1.5 21.8 6.1 29.4 20.1c2 3.7 3.6 7.6 4.6 11.8l9.3 38.5C350.5 81 360.3 86.7 366 85l38-11.2c4-1.2 8.1-1.8 12.2-1.9c16.1-.5 27 9.4 32.3 15.4c22.1 25.1 39.1 54.6 49.9 86.3c2.6 7.6 5.6 21.8-2.7 35.4c-2.2 3.6-4.9 7-8 10L459 246.3c-4.2 4-4.2 15.5 0 19.5l28.7 27.3c3.1 3 5.8 6.4 8 10c8.2 13.6 5.2 27.8 2.7 35.4c-10.8 31.7-27.8 61.1-49.9 86.3c-5.3 6-16.3 15.9-32.3 15.4c-4.1-.1-8.2-.8-12.2-1.9L366 427c-5.7-1.7-15.5 4-16.9 9.8l-9.3 38.5c-1 4.2-2.6 8.2-4.6 11.8c-7.7 14-21.6 18.5-29.4 20.1C289.6 510.3 273 512 256 512s-33.6-1.7-49.8-4.8c-7.9-1.5-21.8-6.1-29.4-20.1c-2-3.7-3.6-7.6-4.6-11.8l-9.3-38.5c-1.4-5.8-11.2-11.5-16.9-9.8l-38 11.2c-4 1.2-8.1 1.8-12.2 1.9c-16.1 .5-27-9.4-32.3-15.4c-22-25.1-39.1-54.6-49.9-86.3c-2.6-7.6-5.6-21.8 2.7-35.4c2.2-3.6 4.9-7 8-10L53 265.7c4.2-4 4.2-15.5 0-19.5L24.2 218.9c-3.1-3-5.8-6.4-8-10C8 195.3 11 181.1 13.6 173.6c10.8-31.7 27.8-61.1 49.9-86.3c5.3-6 16.3-15.9 32.3-15.4c4.1 .1 8.2 .8 12.2 1.9L146 85c5.7 1.7 15.5-4 16.9-9.8l9.3-38.5c1-4.2 2.6-8.2 4.6-11.8c7.7-14 21.6-18.5 29.4-20.1C222.4 1.7 239 0 256 0zM218.1 51.4l-8.5 35.1c-7.8 32.3-45.3 53.9-77.2 44.6L97.9 120.9c-16.5 19.3-29.5 41.7-38 65.7l26.2 24.9c24 22.8 24 66.2 0 89L59.9 325.4c8.5 24 21.5 46.4 38 65.7l34.6-10.2c31.8-9.4 69.4 12.3 77.2-44.6l8.5 35.1c24.6 4.5 51.3 4.5 75.9 0l8.5-35.1c7.8-32.3 45.3-53.9 77.2-44.6l34.6 10.2c16.5-19.3 29.5-41.7 38-65.7l-26.2-24.9c-24-22.8-24-66.2 0-89l26.2-24.9c-8.5-24-21.5-46.4-38-65.7l-34.6 10.2c-31.8 9.4-69.4-12.3-77.2-44.6l-8.5-35.1c-24.6-4.5-51.3-4.5-75.9 0zM208 256a48 48 0 1 0 96 0 48 48 0 1 0 -96 0zm48 96a96 96 0 1 1 0-192 96 96 0 1 1 0 192z" />
              </svg>
            </button>

            <button
              onClick={() => setIsTimerOpen(!isTimerOpen)}
              className="relative flex items-center justify-center p-[9px] h-8 text-[rgb(119,119,119)] dark:text-[rgb(153,153,153)] hover:text-[rgb(26,26,26)] dark:hover:text-white transition-colors cursor-pointer"
              title="Stopwatch Timer"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" width="0.875em" height="1em" fill="currentColor">
                <path d="M144 24c0-13.3 10.7-24 24-24H280c13.3 0 24 10.7 24 24s-10.7 24-24 24H248V97.4c43.4 5 82.8 23.3 113.8 50.9L391 119c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9l-31 31c24 33.9 38.1 75.3 38.1 120c0 114.9-93.1 208-208 208S16 418.9 16 304C16 197.2 96.4 109.3 200 97.4V48H168c-13.3 0-24-10.7-24-24zm80 440a160 160 0 1 0 0-320 160 160 0 1 0 0 320zm24-248V320c0 13.3-10.7 24-24 24s-24-10.7-24-24V216c0-13.3 10.7-24 24-24s24 10.7 24 24z" />
              </svg>
            </button>

            <div className="w-6 h-6 rounded-full overflow-hidden bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-200 flex items-center justify-center border border-neutral-300 dark:border-neutral-600 ml-1">
              <span className="font-bold text-xs">U</span>
            </div>
          </div>
        </div>

        {/* 2. EXACT LAYOUTS MODAL (ProblemPageLayoutsModal.tsx) */}
        <AnimatePresence>
          {isLayoutsModalOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              className="absolute top-14 right-14 z-50 w-[330px] p-4 rounded-2xl shadow-2xl bg-white dark:bg-[#1e1e1e] border border-neutral-200 dark:border-neutral-800 text-neutral-800 dark:text-neutral-200 select-none"
              style={{
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif',
              }}
            >
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
                <div
                  onClick={() => handleLayoutSelect('default')}
                  className={`group flex flex-col p-2.5 rounded-xl border transition-all cursor-pointer ${
                    currentLayout === 'default'
                      ? 'border-neutral-900 dark:border-white bg-neutral-50 dark:bg-neutral-800/50'
                      : 'border-neutral-200 dark:border-neutral-800 hover:border-neutral-400 dark:hover:border-neutral-600 bg-neutral-50/50 dark:bg-neutral-900/40'
                  }`}
                >
                  <div className="w-full h-16 rounded-lg bg-neutral-100 dark:bg-neutral-800/60 p-1.5 flex gap-1.5 mb-2">
                    <div className="flex-1 h-full rounded bg-neutral-200 dark:bg-neutral-700" />
                    <div className="flex-1 h-full flex flex-col gap-1">
                      <div className="flex-1 rounded bg-neutral-200 dark:bg-neutral-700" />
                      <div className="h-1 rounded bg-neutral-300 dark:bg-neutral-600" />
                    </div>
                  </div>
                  <span className="text-xs font-medium text-neutral-800 dark:text-neutral-200">
                    Default
                  </span>
                </div>

                <div
                  onClick={() => handleLayoutSelect('leet')}
                  className={`group flex flex-col p-2.5 rounded-xl border transition-all cursor-pointer ${
                    currentLayout === 'leet'
                      ? 'border-neutral-900 dark:border-white bg-neutral-50 dark:bg-neutral-800/50'
                      : 'border-neutral-200 dark:border-neutral-800 hover:border-neutral-400 dark:hover:border-neutral-600 bg-neutral-50/50 dark:bg-neutral-900/40'
                  }`}
                >
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

                <div
                  onClick={() => handleLayoutSelect('note-taking')}
                  className={`group flex flex-col p-2.5 rounded-xl border transition-all cursor-pointer ${
                    currentLayout === 'note-taking'
                      ? 'border-neutral-900 dark:border-white bg-neutral-50 dark:bg-neutral-800/50'
                      : 'border-neutral-200 dark:border-neutral-800 hover:border-neutral-400 dark:hover:border-neutral-600 bg-neutral-50/50 dark:bg-neutral-900/40'
                  }`}
                >
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

                <div
                  onClick={() => handleLayoutSelect('debug')}
                  className={`group flex flex-col p-2.5 rounded-xl border transition-all cursor-pointer ${
                    currentLayout === 'debug'
                      ? 'border-neutral-900 dark:border-white bg-neutral-50 dark:bg-neutral-800/50'
                      : 'border-neutral-200 dark:border-neutral-800 hover:border-neutral-400 dark:hover:border-neutral-600 bg-neutral-50/50 dark:bg-neutral-900/40'
                  }`}
                >
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

              {/* Custom Layouts Box */}
              <div className="mb-4 p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-900/40 flex flex-col items-center justify-center text-center">
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-2">
                  Custom Workspace Layouts
                </p>
                <button
                  onClick={() => handleLayoutSelect('default')}
                  className="px-5 py-1.5 rounded-lg text-xs font-semibold text-white bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 shadow-sm transition-all cursor-pointer"
                >
                  Reset Default
                </button>
              </div>

              <div className="w-full h-[1px] bg-neutral-200 dark:border-neutral-800 mb-3" />

              <button
                onClick={() => handleLayoutSelect('focus')}
                className={`w-full py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 text-xs font-semibold transition-all cursor-pointer ${
                  currentLayout === 'focus'
                    ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900'
                    : 'bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200'
                }`}
              >
                <span className="text-sm">🧘</span>
                <span>Focus Mode</span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 3. SETTINGS MODAL */}
        <AnimatePresence>
          {isSettingsOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="absolute top-14 right-10 z-50 w-72 rounded-xl bg-white dark:bg-[#1E1C1A] border border-neutral-200 dark:border-neutral-700 shadow-2xl p-4 text-xs font-sans space-y-3"
            >
              <div className="flex items-center justify-between pb-2 border-b border-neutral-200 dark:border-neutral-800">
                <div className="font-bold flex items-center gap-1.5 text-neutral-900 dark:text-white">
                  <SettingsIcon className="w-4 h-4 text-neutral-500" />
                  <span>Editor Settings</span>
                </div>
                <button onClick={() => setIsSettingsOpen(false)} className="p-1 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded cursor-pointer">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="space-y-2 text-neutral-700 dark:text-neutral-300">
                <div className="flex items-center justify-between">
                  <span>Theme:</span>
                  <span className="px-2 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 font-mono">VS Code Dark</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Keybinding:</span>
                  <span className="px-2 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 font-mono">Standard</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Tab Spacing:</span>
                  <span className="px-2 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 font-mono">4 Spaces</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 4. STOPWATCH TIMER MODAL */}
        <AnimatePresence>
          {isTimerOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="absolute top-14 right-2 z-50 w-52 rounded-xl bg-white dark:bg-[#1E1C1A] border border-neutral-200 dark:border-neutral-700 shadow-2xl p-3 text-xs font-sans space-y-2.5 text-center"
            >
              <div className="flex items-center justify-between pb-1 border-b border-neutral-100 dark:border-neutral-800">
                <span className="text-[10px] uppercase font-bold text-neutral-400">Interview Stopwatch</span>
                <button onClick={() => setIsTimerOpen(false)} className="p-0.5 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded cursor-pointer">
                  <X className="w-3 h-3" />
                </button>
              </div>
              <div className="font-mono text-2xl font-bold text-neutral-900 dark:text-white tracking-widest">
                {formatTimer(timerSeconds)}
              </div>
              <div className="flex items-center justify-center gap-2">
                <button
                  onClick={() => setIsTimerRunning(!isTimerRunning)}
                  className="px-2.5 py-1 rounded-md bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 font-medium text-[11px] cursor-pointer"
                >
                  {isTimerRunning ? "Pause" : "Resume"}
                </button>
                <button
                  onClick={() => { setTimerSeconds(0); setIsTimerRunning(false); }}
                  className="px-2.5 py-1 rounded-md bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 text-[11px] cursor-pointer"
                >
                  Reset
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 5. REAL WORKSPACE: EXACT REPLICA OF THE REAL PROBLEM PAGE */}
        <div className={`p-2.5 grid gap-2.5 min-h-[540px] ${
          currentLayout === 'focus'
            ? 'grid-cols-1'
            : currentLayout === 'leet' || currentLayout === 'note-taking' || currentLayout === 'debug'
            ? 'grid-cols-1 lg:grid-cols-12'
            : 'grid-cols-1 lg:grid-cols-12'
        }`}>
          
          {/* COLUMN 1 (LEFT PANEL): DESCRIPTION | EDITORIAL | SOLUTIONS | SUBMISSIONS | ASK AI */}
          {currentLayout !== 'focus' && (
            <div className={`${
              currentLayout === 'leet' || currentLayout === 'note-taking' || currentLayout === 'debug'
                ? 'lg:col-span-4'
                : 'lg:col-span-6'
            } rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#1a1a1a] flex flex-col shadow-xs overflow-hidden`}>
              
              {/* Tab Navigation (Matching ProblemPageNavigation.tsx exactly) */}
              <div
                className="h-9 px-1.5 bg-[rgba(0,0,0,0.02)] dark:bg-[rgba(255,255,255,0.02)] border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between select-none overflow-x-auto"
                style={{ fontSize: '14px' }}
              >
                <div className="flex items-center">
                  {/* 1. Description */}
                  <button
                    onClick={() => setCurrentTab("description")}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md cursor-pointer transition-colors whitespace-nowrap ${
                      currentTab === "description"
                        ? "text-neutral-900 dark:text-white font-medium"
                        : "text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
                    }`}
                  >
                    <BookText className="w-3.5 h-3.5 opacity-70" />
                    <span>Description</span>
                  </button>

                  <span className="text-neutral-300 dark:text-neutral-700 mx-0.5">|</span>

                  {/* 2. Editorial */}
                  <button
                    onClick={() => setCurrentTab("editorial")}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md cursor-pointer transition-colors whitespace-nowrap ${
                      currentTab === "editorial"
                        ? "text-neutral-900 dark:text-white font-medium"
                        : "text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
                    }`}
                  >
                    <BookOpen className="w-3.5 h-3.5 opacity-70" />
                    <span>Editorial</span>
                  </button>

                  <span className="text-neutral-300 dark:text-neutral-700 mx-0.5">|</span>

                  {/* 3. Solutions */}
                  <button
                    onClick={() => setCurrentTab("solutions")}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md cursor-pointer transition-colors whitespace-nowrap ${
                      currentTab === "solutions"
                        ? "text-neutral-900 dark:text-white font-medium"
                        : "text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
                    }`}
                  >
                    <FlaskConical className="w-3.5 h-3.5 opacity-70" />
                    <span>Solutions</span>
                  </button>

                  <span className="text-neutral-300 dark:text-neutral-700 mx-0.5">|</span>

                  {/* 4. Submissions */}
                  <button
                    onClick={() => setCurrentTab("submissions")}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md cursor-pointer transition-colors whitespace-nowrap ${
                      currentTab === "submissions"
                        ? "text-neutral-900 dark:text-white font-medium"
                        : "text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
                    }`}
                  >
                    <History className="w-3.5 h-3.5 opacity-70" />
                    <span>Submissions</span>
                  </button>

                  {/* 5. ✨ ASK AI TAB (EXACTLY AFTER SUBMISSIONS) */}
                  {(isAskAiOpen || currentTab === "askAi") && (
                    <>
                      <span className="text-neutral-300 dark:text-neutral-700 mx-0.5">|</span>
                      <div className="relative flex items-center">
                        <button
                          onClick={() => setCurrentTab("askAi")}
                          className={`flex items-center gap-1.5 px-2 py-1 rounded-md cursor-pointer transition-colors whitespace-nowrap ${
                            currentTab === "askAi"
                              ? "text-purple-600 dark:text-purple-400 font-medium bg-purple-500/10"
                              : "text-neutral-500 hover:text-purple-600 dark:hover:text-purple-400"
                          }`}
                        >
                          <Sparkles className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                          <span>Ask AI</span>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setIsAskAiOpen(false);
                            if (currentTab === "askAi") setCurrentTab("description");
                          }}
                          className="p-1 text-neutral-400 hover:text-rose-500 transition-colors cursor-pointer"
                          title="Close Ask AI tab"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Panel Body depending on Active Tab */}
              {currentTab === "description" && (
                <div
                  ref={leftPanelRef}
                  className="p-5 sm:p-6 flex-1 overflow-y-auto space-y-4 text-sm leading-[22px] text-neutral-800 dark:text-neutral-200"
                >
                  <h1 className="text-2xl font-semibold text-neutral-900 dark:text-white tracking-tight">
                    {TWO_SUM_DATA.title}
                  </h1>

                  <div className="flex items-center flex-wrap gap-2 pt-0.5 pb-2">
                    <span className="text-xs text-[#00B8A3] bg-emerald-500/10 dark:bg-emerald-500/20 rounded-full px-2.5 py-0.5 font-normal h-6 flex items-center">
                      {TWO_SUM_DATA.level}
                    </span>

                    {TWO_SUM_DATA.topics.map((t) => (
                      <span
                        key={t}
                        className="text-xs text-neutral-600 dark:text-neutral-400 bg-black/[0.06] dark:bg-white/[0.08] rounded-full px-2.5 py-0.5 h-6 flex items-center gap-1"
                      >
                        <Tag className="w-3 h-3 opacity-60" />
                        <span>{t}</span>
                      </span>
                    ))}

                    <span className="text-xs text-neutral-600 dark:text-neutral-400 bg-black/[0.06] dark:bg-white/[0.08] rounded-full px-2.5 py-0.5 h-6 flex items-center gap-1">
                      <Building2 className="w-3 h-3 opacity-60" />
                      <span>Companies</span>
                    </span>
                  </div>

                  <div className="text-neutral-700 dark:text-neutral-300 min-h-[44px]">
                    {typedDesc ? (
                      <>
                        {typedDesc}
                        {typedDesc.length < TWO_SUM_DATA.description.length && (
                          <span className="inline-block w-1.5 h-3.5 bg-amber-500 ml-0.5 animate-pulse align-middle" />
                        )}
                      </>
                    ) : (
                      <span className="text-neutral-400 animate-pulse">Generating algorithmic specification...</span>
                    )}
                  </div>

                  {visibleExamplesCount > 0 && (
                    <div className="space-y-4 pt-1">
                      {TWO_SUM_DATA.examples.slice(0, visibleExamplesCount).map((ex) => (
                        <motion.div
                          key={ex.id}
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3 }}
                          className="space-y-1.5"
                        >
                          <div className="font-semibold text-neutral-900 dark:text-white text-sm">
                            Example {ex.id}:
                          </div>
                          <div className="pl-3.5 border-l-2 border-neutral-200 dark:border-neutral-700 font-mono text-xs text-neutral-800 dark:text-neutral-300 space-y-1">
                            <div><strong>Input: </strong>{ex.input}</div>
                            <div><strong>Output: </strong>{ex.output}</div>
                            {ex.explanation && (
                              <div className="font-sans text-neutral-600 dark:text-neutral-400 text-xs pt-0.5">
                                <strong>Explanation: </strong>{ex.explanation}
                              </div>
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}

                  {visibleConstraintsCount > 0 && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="space-y-1.5 pt-2"
                    >
                      <div className="font-semibold text-neutral-900 dark:text-white text-sm">
                        Constraints:
                      </div>
                      <ul className="list-disc list-inside space-y-1 text-xs font-mono text-neutral-700 dark:text-neutral-300 pl-1">
                        {TWO_SUM_DATA.constraints.slice(0, visibleConstraintsCount).map((c, idx) => (
                          <motion.li
                            key={idx}
                            initial={{ opacity: 0, x: -4 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            <code>{c}</code>
                          </motion.li>
                        ))}
                      </ul>
                    </motion.div>
                  )}
                </div>
              )}

              {/* EDITORIAL TAB */}
              {currentTab === "editorial" && (
                <div className="p-5 sm:p-6 flex-1 overflow-y-auto space-y-5 text-sm text-neutral-800 dark:text-neutral-200">
                  <div className="space-y-1 pb-2 border-b border-neutral-200 dark:border-neutral-800">
                    <div className="text-xs font-mono text-amber-600 dark:text-amber-400 font-bold uppercase">Official Solution</div>
                    <h2 className="text-xl font-bold text-neutral-900 dark:text-white">Two Sum • Comprehensive Editorial</h2>
                  </div>

                  <div className="space-y-3">
                    <div className="font-semibold text-neutral-900 dark:text-white text-base">Approach 1: Brute Force</div>
                    <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                      Loop through each element <code className="px-1 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 font-mono">x</code> and find if there is another value that equals to <code className="px-1 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 font-mono">target - x</code>.
                    </p>
                    <div className="flex gap-2">
                      <span className="px-2 py-0.5 rounded bg-rose-500/10 text-rose-600 font-mono text-xs">Time: O(N²)</span>
                      <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-600 font-mono text-xs">Space: O(1)</span>
                    </div>
                  </div>

                  <div className="space-y-3 pt-3 border-t border-neutral-100 dark:border-neutral-800">
                    <div className="font-semibold text-neutral-900 dark:text-white text-base">Approach 2: One-Pass Hash Table (Optimal)</div>
                    <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                      While we iterate and insert elements into the hash table, we look back to check if the current element's complement already exists in the table. If it exists, we return its indices immediately.
                    </p>
                    <div className="flex gap-2">
                      <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 font-mono text-xs font-bold">Time: O(N)</span>
                      <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 font-mono text-xs font-bold">Space: O(N)</span>
                    </div>
                  </div>
                </div>
              )}

              {/* SOLUTIONS TAB */}
              {currentTab === "solutions" && (
                <div className="p-4 sm:p-5 flex-1 overflow-y-auto space-y-3 text-xs">
                  <div className="flex items-center gap-1.5 pb-2 border-b border-neutral-200 dark:border-neutral-800">
                    <span className="font-bold text-neutral-900 dark:text-white">Community Solutions</span>
                    <span className="text-neutral-400">· 1,482 total</span>
                  </div>

                  <div className="space-y-2">
                    <div className="p-3 rounded-lg border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors cursor-pointer space-y-1.5">
                      <div className="flex items-center justify-between font-semibold text-neutral-900 dark:text-white">
                        <span>Python3 One-Pass Hash Map with 99.8% Speed</span>
                        <span className="text-emerald-600 font-mono">5.2K ⭐</span>
                      </div>
                      <p className="text-[11px] text-neutral-500 line-clamp-2">
                        Single dictionary lookup strategy with detailed intuition, edge cases, and visual diagrams.
                      </p>
                    </div>

                    <div className="p-3 rounded-lg border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors cursor-pointer space-y-1.5">
                      <div className="flex items-center justify-between font-semibold text-neutral-900 dark:text-white">
                        <span>C++ Clean unordered_map Single Loop</span>
                        <span className="text-emerald-600 font-mono">3.8K ⭐</span>
                      </div>
                      <p className="text-[11px] text-neutral-500 line-clamp-2">
                        Zero unnecessary memory overhead using std::unordered_map with pre-reserved buckets.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* SUBMISSIONS TAB */}
              {currentTab === "submissions" && (
                <div className="p-4 sm:p-5 flex-1 overflow-y-auto space-y-3 text-xs">
                  <div className="flex items-center justify-between pb-2 border-b border-neutral-200 dark:border-neutral-800">
                    <span className="font-bold text-neutral-900 dark:text-white">Recent Submissions</span>
                    <span className="text-emerald-600 font-mono">All Passed (48/48)</span>
                  </div>

                  <div className="space-y-2 font-mono">
                    <div className="p-3 rounded-lg bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700/60 flex items-center justify-between text-xs">
                      <div className="space-y-0.5">
                        <div className="font-bold text-emerald-600 flex items-center gap-1.5 font-sans">
                          <CheckCheck className="w-4 h-4" />
                          <span>Accepted</span>
                        </div>
                        <div className="text-[11px] text-neutral-500">Python3 · Just now</div>
                      </div>
                      <div className="text-right space-y-0.5">
                        <div className="font-bold text-neutral-900 dark:text-white">12 ms (beats 98.4%)</div>
                        <div className="text-[11px] text-neutral-500">17.4 MB (beats 89.1%)</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 5. ASK AI VIEW (100% REPLICA OF ProblemPageAiTab.tsx) */}
              {currentTab === "askAi" && (
                <div className="p-4 flex-1 flex flex-col justify-between overflow-y-auto text-xs space-y-3 bg-[#fcfcfc] dark:bg-[#181818]">
                  {/* Model Bar */}
                  <div className="flex items-center justify-between pb-2 border-b border-neutral-200 dark:border-neutral-800">
                    <div className="relative">
                      <button
                        onClick={() => setAiModelDropdownOpen(!aiModelDropdownOpen)}
                        className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs font-semibold text-neutral-800 dark:text-neutral-200 cursor-pointer"
                      >
                        <Brain className="w-3.5 h-3.5 text-amber-500" />
                        <span>{aiSelectedModel}</span>
                        <ChevronDown className="w-3 h-3 opacity-60" />
                      </button>

                      {aiModelDropdownOpen && (
                        <div className="absolute left-0 top-full mt-1 w-52 rounded-xl bg-white dark:bg-[#252525] border border-neutral-200 dark:border-neutral-700 shadow-2xl p-1.5 z-50 text-xs">
                          {["Claude 3.7 Sonnet", "Gemini 3.6 Flash", "DeepSeek R1", "GPT-4.5", "o3-mini"].map((m) => (
                            <button
                              key={m}
                              onClick={() => {
                                setAiSelectedModel(m);
                                setAiModelDropdownOpen(false);
                              }}
                              className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center justify-between cursor-pointer ${
                                aiSelectedModel === m
                                  ? "bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white font-semibold"
                                  : "text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800/60"
                              }`}
                            >
                              <span>{m}</span>
                              {aiSelectedModel === m && <Check className="w-3.5 h-3.5 text-emerald-500" />}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    <span className="text-[10px] text-emerald-500 font-mono flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Ready
                    </span>
                  </div>

                  {/* Chat feed */}
                  <div className="space-y-3 flex-1 overflow-y-auto">
                    {aiChats.map((chat) => (
                      <div key={chat.id} className="space-y-2">
                        <div className="flex justify-end">
                          <div className="max-w-[85%] px-3.5 py-2.5 rounded-2xl bg-neutral-200/80 dark:bg-[#2c2c2c] text-neutral-900 dark:text-white leading-relaxed">
                            {chat.user}
                          </div>
                        </div>
                        <div className="flex justify-start">
                          <div className="max-w-[95%] p-3.5 rounded-2xl bg-white dark:bg-[#222] border border-neutral-200 dark:border-neutral-800 text-neutral-800 dark:text-neutral-200 leading-relaxed shadow-2xs">
                            {chat.isStreaming ? (
                              <div className="flex items-center gap-2 text-neutral-500 font-mono py-1">
                                <Loader2 className="w-3.5 h-3.5 animate-spin text-purple-500" />
                                <span>{aiThinkingVerb}...</span>
                              </div>
                            ) : (
                              chat.assistant
                            )}
                          </div>
                        </div>
                      </div>
                    ))}

                    {/* Quick suggestion feature cards */}
                    {aiChats.length <= 1 && (
                      <div className="pt-2 space-y-2 select-none">
                        <div className="text-[10px] uppercase font-bold text-neutral-400">Quick Assistance Prompts</div>
                        <div className="grid grid-cols-2 gap-2">
                          {FEATURE_CARDS.map((card) => (
                            <div
                              key={card.title}
                              onClick={() => handleAiSend(card.prompt)}
                              className="p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#202020] hover:border-purple-500/40 transition-colors cursor-pointer space-y-1 shadow-2xs"
                            >
                              <div className="flex items-center gap-1.5 font-semibold text-neutral-900 dark:text-white text-[11px]">
                                <card.icon className="w-3.5 h-3.5 text-purple-500" />
                                <span>{card.title}</span>
                              </div>
                              <p className="text-[10px] text-neutral-500 dark:text-neutral-400 leading-tight">
                                {card.description}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Ask AI Bottom Input Toolbar */}
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleAiSend();
                    }}
                    className="rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-[#282828] p-2.5 flex flex-col gap-2"
                  >
                    <textarea
                      rows={2}
                      value={aiInput}
                      onChange={(e) => setAiInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleAiSend();
                        }
                      }}
                      placeholder="Ask AI pair programmer about intuition, bugs, or complexity..."
                      className="w-full bg-transparent border-none outline-none resize-none text-xs text-neutral-900 dark:text-white placeholder:text-neutral-400"
                    />

                    <div className="flex items-center justify-between pt-1 border-t border-neutral-200/50 dark:border-neutral-700/50">
                      <div className="flex items-center gap-1.5 text-neutral-400">
                        <button type="button" className="p-1 hover:text-black dark:hover:text-white cursor-pointer" title="Attach file">
                          <Paperclip className="w-3.5 h-3.5" />
                        </button>
                        <button type="button" className="p-1 hover:text-black dark:hover:text-white cursor-pointer" title="Voice mode">
                          <Mic className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <button
                        type="submit"
                        disabled={!aiInput.trim() || aiIsGenerating}
                        className="px-3 py-1 rounded-lg bg-purple-600 text-white font-medium text-xs flex items-center gap-1 hover:bg-purple-700 disabled:opacity-40 transition-colors cursor-pointer"
                      >
                        <span>Send</span>
                        <Send className="w-3 h-3" />
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          )}

          {/* COLUMN 2 (RIGHT PANEL): CODE & NOTE TABS (ProblemPageCodeEditor.tsx) + CONSOLE */}
          <div className={`${
            currentLayout === 'focus'
              ? 'col-span-1'
              : currentLayout === 'leet' || currentLayout === 'note-taking' || currentLayout === 'debug'
              ? 'lg:col-span-5'
              : 'lg:col-span-6'
          } flex flex-col gap-2.5`}>
            
            {/* CODE / NOTE EDITOR PANEL */}
            <div className="flex-1 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#1a1a1a] shadow-xs overflow-hidden flex flex-col justify-between">
              
              {/* Tab Bar - Exact LeetCode style: </> Code + Optional Note tab right next to it */}
              <div
                className="w-full flex items-center justify-between px-1.5 shrink-0 border-b border-black/[0.04] dark:border-white/[0.04]"
                style={{
                  height: '36px',
                  backgroundColor: 'rgba(0,0,0,0.02)',
                  fontSize: '14px',
                }}
              >
                <div className="flex items-center gap-1">
                  {/* 1. Code Tab */}
                  <button
                    onClick={() => setActiveEditorTab('code')}
                    className={`relative flex items-center gap-1.5 px-2.5 py-1 rounded cursor-pointer transition-colors ${
                      activeEditorTab === 'code'
                        ? 'text-neutral-900 dark:text-white font-medium'
                        : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200'
                    }`}
                  >
                    <Code2 className="w-3.5 h-3.5" style={{ opacity: activeEditorTab === 'code' ? 0.9 : 0.6 }} />
                    <span>Code</span>
                  </button>

                  {/* 2. Note Tab (EXACTLY NEXT TO CODE SECTION) */}
                  {isNoteOpen && (
                    <div
                      onClick={() => setActiveEditorTab('note')}
                      className={`relative flex items-center gap-1.5 cursor-pointer rounded px-2.5 py-1 transition-colors ${
                        activeEditorTab === 'note'
                          ? 'bg-neutral-200/70 dark:bg-neutral-800 text-neutral-900 dark:text-white font-medium'
                          : 'text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800/60'
                      }`}
                    >
                      <FileText className="w-3.5 h-3.5 text-amber-500" />
                      <span>Note</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsNoteOpen(false);
                          setActiveEditorTab('code');
                        }}
                        className="ml-1 p-0.5 rounded-full hover:bg-black/10 dark:hover:bg-white/10 text-neutral-400 hover:text-rose-500 transition-colors cursor-pointer"
                        title="Close note"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>

                {currentLayout === 'focus' && (
                  <button
                    onClick={() => handleLayoutSelect('default')}
                    className="px-2.5 py-0.5 rounded-full bg-neutral-200 dark:bg-neutral-700 text-neutral-800 dark:text-white text-[10px] font-medium cursor-pointer"
                  >
                    Exit Focus Mode
                  </button>
                )}
              </div>

              {/* EDITOR VIEW: CODE VS NOTE */}
              {activeEditorTab === 'code' ? (
                /* CODE MODE */
                <div className="flex-1 flex flex-col justify-between overflow-hidden">
                  {/* Language Selector + Tools Row */}
                  <div className="h-8 px-3 border-b border-neutral-200 dark:border-neutral-800 bg-[rgba(0,0,0,0.01)] dark:bg-[rgba(255,255,255,0.01)] flex items-center justify-between text-xs select-none">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <button
                          onClick={() => setIsLangDropdownOpen(!isLangDropdownOpen)}
                          className="flex items-center gap-1 font-medium text-neutral-800 dark:text-neutral-200 cursor-pointer hover:text-black dark:hover:text-white"
                        >
                          <span>{selectedLanguage === "python" ? "Python" : selectedLanguage === "cpp" ? "C++" : "Java"}</span>
                          <ChevronDown className="w-3.5 h-3.5 opacity-60" />
                        </button>

                        {isLangDropdownOpen && (
                          <div className="absolute left-0 top-full mt-1 w-28 rounded-lg bg-white dark:bg-[#282624] border border-neutral-200 dark:border-neutral-700 shadow-xl p-1 z-50 text-xs">
                            <button
                              onClick={() => { setSelectedLanguage("python"); setIsLangDropdownOpen(false); }}
                              className="w-full text-left px-2 py-1 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer"
                            >
                              Python
                            </button>
                            <button
                              onClick={() => { setSelectedLanguage("cpp"); setIsLangDropdownOpen(false); }}
                              className="w-full text-left px-2 py-1 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer"
                            >
                              C++
                            </button>
                            <button
                              onClick={() => { setSelectedLanguage("java"); setIsLangDropdownOpen(false); }}
                              className="w-full text-left px-2 py-1 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer"
                            >
                              Java
                            </button>
                          </div>
                        )}
                      </div>

                      <div className="text-[11px] text-neutral-400 flex items-center gap-1">
                        <Zap className="w-3 h-3 text-amber-500" />
                        <span>Auto</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-neutral-400">
                      <button onClick={handleCopyCode} className="hover:text-black dark:hover:text-white cursor-pointer" title="Format code">
                        <Braces className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setIsBookmarked(!isBookmarked)}
                        className={`cursor-pointer transition-colors ${isBookmarked ? "text-amber-500" : "hover:text-black dark:hover:text-white"}`}
                        title="Bookmark Code"
                      >
                        <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? "fill-current" : ""}`} />
                      </button>
                      <button onClick={handleCopyCode} className="hover:text-black dark:hover:text-white cursor-pointer" title="Copy code">
                        {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                      <button onClick={handleRestartSim} className="hover:text-black dark:hover:text-white cursor-pointer" title="Reset code">
                        <RotateCcw className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleLayoutSelect(currentLayout === 'focus' ? 'default' : 'focus')}
                        className="hover:text-black dark:hover:text-white cursor-pointer"
                        title="Toggle Fullscreen Focus"
                      >
                        <Maximize2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Monaco Code Syntax Area */}
                  <div className="p-3 bg-white dark:bg-[#1a1a1a] font-mono text-xs overflow-x-auto flex-1">
                    <div className="flex leading-[21px]">
                      <div className="select-none text-[#237893] dark:text-[#569cd6] pr-4 text-right opacity-70">
                        {displayedCodeLines.map((_, i) => (
                          <div key={i}>{i + 1}</div>
                        ))}
                      </div>

                      <div className="text-neutral-900 dark:text-neutral-100 flex-1 whitespace-pre">
                        {displayedCodeLines.join("\n")}
                        {solutionLinesCount > 0 && solutionLinesCount < fullSolutionLines.length && (
                          <span className="inline-block w-1.5 h-3.5 bg-blue-500 ml-0.5 animate-pulse align-middle" />
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="h-6 px-3 border-t border-neutral-100 dark:border-neutral-800/80 flex items-center justify-between text-[11px] text-neutral-400 bg-white dark:bg-[#1a1a1a]">
                    <span>{isSolved ? "Saved" : solutionLinesCount > 0 ? "Writing solution..." : "Generating template..."}</span>
                    <span>Ln {displayedCodeLines.length}, Col 1</span>
                  </div>
                </div>
              ) : (
                /* NOTE MODE (100% REPLICA OF ProblemPageCodeEditor.tsx NOTE VIEW) */
                <div className="flex-1 w-full flex flex-col bg-white dark:bg-[#1a1a1a] overflow-hidden select-none">
                  {/* Note Formatting Toolbar */}
                  <div
                    className="w-full flex items-center gap-1.5 px-3 py-1 border-b border-black/[0.06] dark:border-white/[0.06] bg-transparent text-neutral-600 dark:text-neutral-400 text-xs shrink-0"
                    style={{ height: '36px' }}
                  >
                    <button
                      onClick={() => insertNoteFormat("### ")}
                      className="px-2 py-1 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 font-bold cursor-pointer text-xs"
                      title="Heading"
                    >
                      H
                    </button>
                    <button
                      onClick={() => insertNoteFormat("**", "**")}
                      className="px-2 py-1 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 font-bold cursor-pointer text-xs"
                      title="Bold"
                    >
                      B
                    </button>
                    <button
                      onClick={() => insertNoteFormat("*", "*")}
                      className="px-2 py-1 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 italic cursor-pointer text-xs"
                      title="Italic"
                    >
                      I
                    </button>
                    <button
                      onClick={() => insertNoteFormat("~~", "~~")}
                      className="px-2 py-1 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 line-through cursor-pointer text-xs"
                      title="Strikethrough"
                    >
                      S
                    </button>

                    <div className="w-[1px] h-3.5 bg-neutral-200 dark:bg-neutral-700 mx-1" />

                    <button
                      onClick={() => insertNoteFormat("- ")}
                      className="p-1 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer"
                      title="Bullet List"
                    >
                      <List className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => insertNoteFormat("1. ")}
                      className="p-1 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer"
                      title="Numbered List"
                    >
                      <ListOrdered className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => insertNoteFormat("> ")}
                      className="p-1 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer"
                      title="Quote"
                    >
                      <Quote className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => insertNoteFormat("```\n", "\n```")}
                      className="p-1 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer"
                      title="Code Block"
                    >
                      <Code className="w-3.5 h-3.5" />
                    </button>

                    <div className="w-[1px] h-3.5 bg-neutral-200 dark:bg-neutral-700 mx-1" />

                    <button
                      onClick={() => setIsNotePreview(!isNotePreview)}
                      className="p-1 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer text-neutral-600 dark:text-neutral-400"
                      title={isNotePreview ? "Edit Mode" : "Preview Mode"}
                    >
                      {isNotePreview ? <Edit3 className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>

                    <button
                      onClick={handleClearNotepad}
                      className="p-1 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer text-neutral-400 hover:text-rose-500"
                      title="Clear Notes"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Quick Tags Toolbar */}
                  <div className="flex items-center gap-1.5 px-3 py-1 bg-neutral-50/70 dark:bg-[#1a1a1a] border-b border-neutral-100 dark:border-neutral-800 text-[11px] overflow-x-auto">
                    <span className="text-neutral-400 text-[10px] font-medium">Quick add:</span>
                    <button
                      onClick={() => insertNotepadTemplate("### Approach:\n- ")}
                      className="px-2 py-0.5 rounded bg-neutral-200/60 dark:bg-neutral-800 hover:bg-neutral-300 dark:hover:bg-neutral-700 transition-colors cursor-pointer text-neutral-700 dark:text-neutral-300"
                    >
                      + Approach
                    </button>
                    <button
                      onClick={() => insertNotepadTemplate("### Complexity:\n- Time: O(N)\n- Space: O(1)")}
                      className="px-2 py-0.5 rounded bg-neutral-200/60 dark:bg-neutral-800 hover:bg-neutral-300 dark:hover:bg-neutral-700 transition-colors cursor-pointer text-neutral-700 dark:text-neutral-300"
                    >
                      + Complexity
                    </button>
                    <button
                      onClick={() => insertNotepadTemplate("### Key Takeaways:\n- ")}
                      className="px-2 py-0.5 rounded bg-neutral-200/60 dark:bg-neutral-800 hover:bg-neutral-300 dark:hover:bg-neutral-700 transition-colors cursor-pointer text-neutral-700 dark:text-neutral-300"
                    >
                      + Key Takeaways
                    </button>
                  </div>

                  {/* Note Body */}
                  <div className="flex-1 p-3 select-text overflow-y-auto">
                    {!isNotePreview ? (
                      <textarea
                        value={notepadContent}
                        onChange={handleNoteChange}
                        placeholder="Type your notes, ideas, edge cases, and algorithm thoughts here (supports markdown)..."
                        className="w-full h-full resize-none bg-transparent outline-none font-mono text-xs leading-relaxed text-neutral-800 dark:text-neutral-200 placeholder:text-neutral-400 dark:placeholder:text-neutral-600"
                      />
                    ) : (
                      <div className="text-xs leading-relaxed space-y-2 whitespace-pre-wrap font-sans text-neutral-700 dark:text-neutral-300">
                        {notepadContent || <span className="text-neutral-400 italic">No notes written yet.</span>}
                      </div>
                    )}
                  </div>

                  {/* Note Footer */}
                  <div className="flex items-center justify-between px-3 py-1.5 text-[10px] text-neutral-400 bg-neutral-50 dark:bg-[#1a1a1a] border-t border-neutral-100 dark:border-neutral-800">
                    <span>{notepadContent.length} characters</span>
                    <span className="flex items-center gap-1">
                      <Check className="w-3 h-3 text-emerald-500" />
                      Auto-saved to local browser
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* TESTCASE / TEST RESULT CONSOLE */}
            <div className="rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#1a1a1a] shadow-xs overflow-hidden flex flex-col justify-between">
              
              <div className="h-9 px-3 border-b border-neutral-200 dark:border-neutral-800 flex items-center gap-4 text-xs select-none">
                <button
                  onClick={() => setActiveConsoleTab("testcase")}
                  className={`flex items-center gap-1.5 font-medium transition-colors cursor-pointer ${
                    activeConsoleTab === "testcase"
                      ? "text-neutral-900 dark:text-white"
                      : "text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200"
                  }`}
                >
                  <CheckSquare className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Testcase</span>
                </button>

                <button
                  onClick={() => setActiveConsoleTab("testresult")}
                  className={`flex items-center gap-1.5 font-medium transition-colors cursor-pointer ${
                    activeConsoleTab === "testresult"
                      ? "text-neutral-900 dark:text-white"
                      : "text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200"
                  }`}
                >
                  <Terminal className="w-3.5 h-3.5" />
                  <span>Test Result</span>
                </button>
              </div>

              <div className="p-4 space-y-3 font-mono text-xs">
                {activeConsoleTab === "testcase" ? (
                  <>
                    <div className="flex items-center gap-2">
                      {testCases.map((tc, idx) => (
                        <button
                          key={tc.id}
                          onClick={() => setActiveCaseIdx(idx)}
                          className={`px-3 py-1 rounded-md text-xs font-medium cursor-pointer transition-colors ${
                            activeCaseIdx === idx
                              ? "bg-neutral-200 dark:bg-neutral-700 text-neutral-900 dark:text-white"
                              : "text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                          }`}
                        >
                          Case {tc.id}
                        </button>
                      ))}
                      <button
                        onClick={handleAddTestCase}
                        className="p-1 text-neutral-400 hover:text-black dark:hover:text-white cursor-pointer"
                        title="Add Custom Testcase"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="space-y-2.5 pt-1">
                      <div className="space-y-1">
                        <div className="text-[11px] font-sans text-neutral-500">nums =</div>
                        <input
                          type="text"
                          value={
                            activeCaseIdx === 0 && !isSolved && typedNumsParam.length < 11
                              ? typedNumsParam
                              : testCases[activeCaseIdx].nums
                          }
                          onChange={(e) => {
                            const updated = [...testCases];
                            updated[activeCaseIdx].nums = e.target.value;
                            setTestCases(updated);
                          }}
                          placeholder={isTestcaseStreaming ? "generating..." : ""}
                          className="w-full p-2.5 rounded-lg bg-neutral-100 dark:bg-neutral-800/80 text-neutral-900 dark:text-neutral-100 font-mono text-xs border-none outline-hidden placeholder:text-neutral-400"
                        />
                      </div>

                      <div className="space-y-1">
                        <div className="text-[11px] font-sans text-neutral-500">target =</div>
                        <input
                          type="text"
                          value={
                            activeCaseIdx === 0 && !isSolved && typedTargetParam.length < 1
                              ? typedTargetParam
                              : testCases[activeCaseIdx].target
                          }
                          onChange={(e) => {
                            const updated = [...testCases];
                            updated[activeCaseIdx].target = e.target.value;
                            setTestCases(updated);
                          }}
                          placeholder={isTestcaseStreaming ? "generating..." : ""}
                          className="w-full p-2.5 rounded-lg bg-neutral-100 dark:bg-neutral-800/80 text-neutral-900 dark:text-neutral-100 font-mono text-xs border-none outline-hidden placeholder:text-neutral-400"
                        />
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="space-y-3">
                    {isSolving ? (
                      <div className="flex items-center gap-2 text-neutral-500 py-3">
                        <Loader2 className="w-4 h-4 animate-spin text-emerald-500" />
                        <span className="font-sans text-xs">Executing multi-language sandboxed test suite...</span>
                      </div>
                    ) : isSolved ? (
                      <>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold text-sm font-sans">
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Accepted (48/48 Passed)</span>
                          </div>
                          <span className="text-[11px] text-neutral-500 font-sans">Runtime: 12ms (beats 98.4%)</span>
                        </div>

                        <div className="p-2.5 rounded-lg bg-neutral-100 dark:bg-neutral-800/80 space-y-1">
                          <div className="text-neutral-500 text-[11px] font-sans">Your Output:</div>
                          <div className="text-emerald-600 dark:text-emerald-400 font-bold font-mono">
                            {testCases[activeCaseIdx]?.expected || "[0,1]"}
                          </div>
                          <div className="text-neutral-500 text-[11px] pt-1 font-sans">Expected Output:</div>
                          <div className="text-neutral-800 dark:text-neutral-200 font-mono">
                            {testCases[activeCaseIdx]?.expected || "[0,1]"}
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="text-xs text-neutral-400 py-3 font-sans">
                        Click "Run" or "Submit" to execute code against JudgeAPI test runner.
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* COLUMN 3: 3RD COLUMN FOR LEET / NOTE-TAKING / DEBUG LAYOUTS */}
          {(currentLayout === 'leet' || currentLayout === 'note-taking' || currentLayout === 'debug') && (
            <div className="lg:col-span-3 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#1a1a1a] shadow-xs flex flex-col justify-between text-xs overflow-hidden">
              
              <div className="h-9 px-3 border-b border-neutral-200 dark:border-neutral-800 bg-[rgba(0,0,0,0.02)] dark:bg-[rgba(255,255,255,0.02)] flex items-center justify-between select-none">
                <div className="flex items-center gap-1.5 font-medium text-neutral-900 dark:text-white">
                  {currentLayout === 'leet' && (
                    <>
                      <Sparkles className="w-3.5 h-3.5 text-purple-500" />
                      <span>Leet AI</span>
                    </>
                  )}
                  {currentLayout === 'note-taking' && (
                    <>
                      <FileText className="w-3.5 h-3.5 text-amber-500" />
                      <span>Notes</span>
                    </>
                  )}
                  {currentLayout === 'debug' && (
                    <>
                      <Bug className="w-3.5 h-3.5 text-amber-500" />
                      <span>GDB Debugger</span>
                    </>
                  )}
                  <button
                    onClick={() => handleLayoutSelect('default')}
                    className="p-0.5 rounded hover:bg-black/10 dark:hover:bg-white/10 text-neutral-400 hover:text-rose-500 transition-colors cursor-pointer ml-1"
                    title="Close 3rd Column"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>

                <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400">● Live</span>
              </div>

              <div className="p-3 flex-1 overflow-y-auto space-y-3">
                {currentLayout === 'leet' && (
                  <div className="space-y-3">
                    <div className="p-2.5 rounded-lg bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700 text-[11px] leading-relaxed">
                      <strong className="text-neutral-900 dark:text-white">AI Copilot Analysis:</strong>
                      <p className="text-neutral-600 dark:text-neutral-300 mt-1">
                        Checking <code className="px-1 py-0.5 rounded bg-neutral-200 dark:bg-neutral-700">target - num</code> against dictionary gives linear time <strong>O(N)</strong> with zero array sorting overhead.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <div className="text-[10px] uppercase font-bold text-neutral-400">Model Stats</div>
                      <div className="p-2 rounded bg-neutral-100 dark:bg-neutral-800 flex items-center justify-between text-[11px]">
                        <span>Reasoning Model:</span>
                        <span className="font-mono font-bold text-purple-600 dark:text-purple-400">Claude 3.7</span>
                      </div>
                      <div className="p-2 rounded bg-neutral-100 dark:bg-neutral-800 flex items-center justify-between text-[11px]">
                        <span>Context Tokens:</span>
                        <span className="font-mono">1.2K / 200K</span>
                      </div>
                    </div>
                  </div>
                )}

                {currentLayout === 'note-taking' && (
                  <div className="h-full flex flex-col justify-between space-y-2">
                    <textarea
                      rows={12}
                      value={notepadContent}
                      onChange={handleNoteChange}
                      placeholder="Type your notes here..."
                      className="w-full h-full p-2.5 rounded-lg bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700 outline-none font-mono text-xs text-neutral-900 dark:text-neutral-100 resize-none"
                    />
                    <div className="flex items-center justify-between text-[10px] text-neutral-400">
                      <span>{notepadContent.length} chars</span>
                      <span>● Auto-saved</span>
                    </div>
                  </div>
                )}

                {currentLayout === 'debug' && (
                  <div className="space-y-3 font-mono text-xs">
                    <div className="flex items-center justify-between p-2 rounded-lg bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => setDebugStepIdx((prev) => (prev + 1) % debugSteps.length)}
                          className="p-1 rounded bg-amber-500 text-white hover:bg-amber-600 cursor-pointer"
                          title="Step Over (Next Step)"
                        >
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDebugStepIdx(0)}
                          className="p-1 rounded hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-600 dark:text-neutral-300 cursor-pointer"
                          title="Reset Debugger"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold">
                        Line {debugSteps[debugStepIdx].line} (Step {debugStepIdx + 1}/2)
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      <div className="text-[10px] uppercase font-bold text-neutral-400 font-sans">Variable State</div>
                      <div className="p-2 rounded bg-neutral-50 dark:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-700 space-y-1 text-[11px]">
                        <div className="flex justify-between">
                          <span className="text-neutral-500">i:</span>
                          <span className="text-emerald-600 font-bold">{debugSteps[debugStepIdx].i}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-neutral-500">num:</span>
                          <span className="text-blue-600 font-bold">{debugSteps[debugStepIdx].num}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-neutral-500">diff:</span>
                          <span className="text-purple-600 font-bold">{debugSteps[debugStepIdx].diff}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-neutral-500">seen:</span>
                          <span className="text-amber-600 font-bold">{debugSteps[debugStepIdx].seen}</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-2 rounded bg-black/[0.03] dark:bg-white/[0.04] text-[10px] text-neutral-600 dark:text-neutral-300 font-sans leading-tight">
                      {debugSteps[debugStepIdx].log}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

      </div>
    </section>
  );
}
