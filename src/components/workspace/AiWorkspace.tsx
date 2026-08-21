"use client";

import React, { useState, useEffect, useRef } from "react";
import { useTheme } from "next-themes";
import { useSession } from "next-auth/react";
import Link from "next/link";
import {
  Search,
  FolderKanban,
  Settings as SettingsIcon,
  Plus,
  ArrowUp,
  Mic,
  Globe,
  Zap,
  BookOpen,
  TestTube2,
  Rocket,
  Layers,
  Sparkles,
  Share2,
  ChevronDown,
  Moon,
  Sun,
  Copy,
  Check,
  Play,
  Lightbulb,
  BarChart3,
  MessageSquarePlus,
} from "lucide-react";
import { toast } from "sonner";
import SettingsView from "./SettingsView";

interface HistoryItem {
  id: string;
  title: string;
  time: string;
  topic?: string;
  level?: string;
}

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  codeSnippet?: { language: string; code: string };
  problemDetails?: {
    title: string;
    level: string;
    examples: string;
    constraints: string;
    testCases?: Array<{ input: string; output: string }>;
    hints?: string[];
  };
}

export default function AiWorkspace() {
  const { theme, setTheme } = useTheme();
  const { data: session } = useSession();
  const [mounted, setMounted] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [activeView, setActiveView] = useState<"chat" | "settings">("chat");
  const [activeModel, setActiveModel] = useState("gemini-2.5-flash");
  const [showModelDropdown, setShowModelDropdown] = useState(false);
  const [activeMode, setActiveMode] = useState<string>("Generate Problem");
  const [difficulty, setDifficulty] = useState<"Easy" | "Medium" | "Hard">("Medium");
  const [selectedTopic, setSelectedTopic] = useState("Dynamic Programming");
  const [showTopicDropdown, setShowTopicDropdown] = useState(false);
  const [isOnlineEnabled, setIsOnlineEnabled] = useState(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [searchFilter, setSearchFilter] = useState("");
  const [userHistory, setUserHistory] = useState<HistoryItem[]>([]);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    try {
      const saved = localStorage.getItem("easycode_chat_history");
      if (saved) {
        setUserHistory(JSON.parse(saved));
      }
    } catch (e) {
      console.warn("Could not load local history", e);
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const saveHistoryItem = (title: string, level?: string, topic?: string) => {
    const newItem: HistoryItem = {
      id: Date.now().toString(),
      title: title.length > 50 ? title.substring(0, 48) + "..." : title,
      time: "Just now",
      level: level || difficulty,
      topic: topic || selectedTopic,
    };
    const updated = [newItem, ...userHistory.filter((h) => h.title !== newItem.title)].slice(0, 30);
    setUserHistory(updated);
    try {
      localStorage.setItem("easycode_chat_history", JSON.stringify(updated));
    } catch (e) {}
  };

  const clearHistory = () => {
    setUserHistory([]);
    try {
      localStorage.removeItem("easycode_chat_history");
    } catch (e) {}
    toast.success("History cleared");
  };

  const filteredHistory = searchFilter
    ? userHistory.filter(
        (p) =>
          p.title.toLowerCase().includes(searchFilter.toLowerCase()) ||
          (p.topic && p.topic.toLowerCase().includes(searchFilter.toLowerCase()))
      )
    : userHistory;

  const platformModes = [
    { label: "Generate Problem", icon: Zap },
    { label: "Explain Algorithm", icon: BookOpen },
    { label: "Test Cases & Edge Cases", icon: TestTube2 },
    { label: "Optimize Time & Space", icon: Rocket },
    { label: "System Design", icon: Layers },
  ];

  const modeSuggestions: Record<string, string[]> = {
    "Generate Problem": [
      "Create a Hard Dynamic Programming challenge on grid path optimization with obstacle costs",
      "Generate a Graph Shortest Path problem with dynamic obstacle weights and teleportation portals",
      "Design a custom Trie-based autocomplete problem with real-time prefix frequency ranking",
      "Construct an interactive Binary Search problem with real-world floating point precision edge cases",
      "Build a Monotonic Stack problem for stock price span and next greater temperature analysis",
      "Generate a Two-Pointer challenge for trapping rainwater variations with variable container widths"
    ],
    "Explain Algorithm": [
      "Explain how Kadane's Algorithm works for Maximum Subarray Sum with O(1) space",
      "Deep dive into Union-Find (Disjoint Set Union) with Path Compression and Union by Rank",
      "How does Dijkstra's Algorithm differ from A* search and Bellman-Ford in shortest path graphs?",
      "Explain Dynamic Programming memoization vs tabulation with cache locality and recursion trade-offs",
      "How to implement Segment Trees with Lazy Propagation for range update queries"
    ],
    "Test Cases & Edge Cases": [
      "Generate boundary & stress test cases for Longest Palindromic Substring",
      "Craft comprehensive edge cases for Merge K Sorted Linked Lists (empty lists, duplicates, negative numbers)",
      "Create adversarial test inputs for Integer to Roman and Roman to Integer conversion algorithms",
      "Generate extreme scale test cases for checking graph bipartiteness with disconnected components"
    ],
    "Optimize Time & Space": [
      "How to optimize an O(N^2) nested loop search into O(N log N) using Sorting & Two Pointers",
      "Reduce auxiliary space from O(N) to O(1) in Fibonacci & Grid Walking Dynamic Programming",
      "Techniques to eliminate recursive call stack overflow in deep binary tree traversals",
      "Optimize string concatenation from O(N^2) to O(N) using mutable buffers / StringBuilder"
    ],
    "System Design": [
      "Design a Distributed Rate Limiter supporting 100,000 requests/sec with Sliding Window Counter",
      "Design an In-Memory Key-Value Cache with TTL expiration and concurrent LRU eviction policy",
      "Architect a Real-Time Code Execution Judge System with Docker sandbox isolation and queue workers",
      "Design a Global Leaderboard system for competitive coding contests with instant score updates"
    ]
  };

  const currentSuggestions = modeSuggestions[activeMode] || modeSuggestions["Generate Problem"];
  const topicsList = ["Dynamic Programming", "Graph Theory", "Binary Search", "Trees & BST", "Trie", "Greedy", "Hash Table", "Two Pointers", "Sliding Window", "Heap / Priority Queue", "Stack & Queue", "Bit Manipulation"];

  const handleSend = async (customPrompt?: string) => {
    const text = customPrompt || prompt;
    if (!text.trim() || isLoading) return;

    setActiveView("chat");

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: text.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setPrompt("");
    setIsLoading(true);

    saveHistoryItem(text.trim());

    try {
      let customKeys = {};
      let customInstructions = "";
      let memories = [];
      try {
        const savedKeys = localStorage.getItem("easycode_custom_keys");
        if (savedKeys) customKeys = JSON.parse(savedKeys);
        const savedInst = localStorage.getItem("easycode_custom_instructions");
        if (savedInst) customInstructions = savedInst;
        const savedMems = localStorage.getItem("easycode_user_memories");
        if (savedMems) memories = JSON.parse(savedMems);
      } catch (e) {}

      const res = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: text,
          difficulty,
          topic: selectedTopic,
          focus: activeMode,
          model: activeModel,
          customInstructions,
          customKeys,
          memories,
        }),
      });

      const data = await res.json();

      if (data.success && data.problem) {
        const prob = data.problem;
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: prob.description || "Here is the generated problem specification and reference solution.",
          problemDetails: {
            title: prob.title,
            level: prob.level,
            examples: prob.examples,
            constraints: prob.constraints,
            testCases: prob.testCases,
            hints: prob.hints,
          },
          codeSnippet: prob.starterCode?.python
            ? { language: "python", code: prob.starterCode.python }
            : undefined,
        };
        setMessages((prev) => [...prev, assistantMessage]);
      } else {
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: data.message || "I've processed your algorithmic request and prepared the structured challenge.",
        };
        setMessages((prev) => [...prev, assistantMessage]);
      }
    } catch (error) {
      toast.error("Failed to generate response, please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const copyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const startNewChat = () => {
    setActiveView("chat");
    setMessages([]);
    setPrompt("");
    textareaRef.current?.focus();
  };

  if (!mounted) return null;

  const username = session?.user?.name || (session?.user as any)?.username || "Developer";

  return (
    <div className="min-h-screen w-full bg-[#FBF9F4] dark:bg-[#1C1B19] text-[#1C1B19] dark:text-[#E8E6E3] flex flex-col transition-colors duration-300 font-sans selection:bg-neutral-500/20">
      
      {/* Subtle vertical neutral grid texture */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] bg-[linear-gradient(to_right,#000_1px,transparent_1px),linear-gradient(to_bottom,#000_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#fff_1px,transparent_1px),linear-gradient(to_bottom,#fff_1px,transparent_1px)] bg-[size:5rem_5rem]" />
      </div>

      {/* TOP HEADER */}
      <header className="relative z-20 w-full h-14 border-b border-[#E8E4DB] dark:border-[#2D2B28] bg-[#FBF9F4]/90 dark:bg-[#1C1B19]/90 backdrop-blur-md px-5 flex items-center justify-between">
        
        {/* Left: Brand + Model Selector */}
        <div className="flex items-center gap-3">
          <Link href="/" onClick={() => setActiveView("chat")} className="flex items-center gap-2.5 group">
            <div className="w-5 h-5 rounded-full bg-neutral-900/10 dark:bg-white/10 flex items-center justify-center">
              <div className="w-2.5 h-2.5 rounded-full bg-neutral-800 dark:bg-neutral-200 shadow-xs" />
            </div>
            <span className="font-serif text-lg tracking-tight font-medium text-[#1A1918] dark:text-[#F3F2F0]">
              EasyCode
            </span>
          </Link>

          <span className="text-[#C8C4BC] dark:text-[#4A4742] text-sm font-light">/</span>

          {/* Model Switcher Pill */}
          <div className="relative">
            <button
              onClick={() => setShowModelDropdown(!showModelDropdown)}
              className="flex items-center gap-1.5 text-xs text-[#524E48] dark:text-[#A8A49D] hover:text-[#1A1918] dark:hover:text-white py-1 px-2 rounded-md hover:bg-black/[0.04] dark:hover:bg-white/[0.04] transition-colors"
            >
              <span className="font-mono">{activeModel}</span>
              <span className="text-[10px] opacity-60">⬍</span>
            </button>

            {showModelDropdown && (
              <div className="absolute top-full left-0 mt-1.5 w-56 bg-white dark:bg-[#252321] border border-[#E8E4DB] dark:border-[#383531] rounded-xl shadow-xl py-1 z-50 text-xs font-mono">
                {["gemini-2.5-flash", "gemini-2.5-pro", "gemini-2.0-flash-thinking", "claude-3.5-sonnet", "claude-3.5-haiku", "gpt-4o", "o1", "deepseek-r1", "qwen-2.5-coder"].map((m) => (
                  <button
                    key={m}
                    onClick={() => {
                      setActiveModel(m);
                      setShowModelDropdown(false);
                    }}
                    className={`w-full text-left px-3 py-2 hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition-colors flex items-center justify-between ${
                      activeModel === m ? "text-neutral-950 dark:text-white font-semibold" : "text-[#524E48] dark:text-[#A8A49D]"
                    }`}
                  >
                    <span>{m}</span>
                    {activeModel === m && <Check className="w-3 h-3" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: Share + Theme + Avatar Badge */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              navigator.clipboard.writeText(window.location.href);
              toast.success("Workspace link copied to clipboard!");
            }}
            className="text-xs font-medium px-3 py-1.5 rounded-lg border border-[#DCD7CC] dark:border-[#3A3733] bg-white/60 dark:bg-white/[0.03] hover:bg-white dark:hover:bg-white/[0.06] text-[#4A4640] dark:text-[#C5C2BA] shadow-2xs transition-all flex items-center gap-1.5"
          >
            <Share2 className="w-3.5 h-3.5 opacity-70" />
            <span>Share</span>
          </button>

          {/* Theme Toggle */}
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="w-8 h-8 rounded-lg flex items-center justify-center border border-[#DCD7CC] dark:border-[#3A3733] bg-white/60 dark:bg-white/[0.03] hover:bg-white dark:hover:bg-white/[0.06] text-[#4A4640] dark:text-[#C5C2BA] transition-colors"
            title="Toggle theme"
          >
            {theme === "dark" ? <Sun className="w-4 h-4 text-neutral-300" /> : <Moon className="w-4 h-4 text-[#5A5650]" />}
          </button>

          {/* Profile Avatar Badge */}
          {session?.user ? (
            <Link
              href={`/dashboard/${(session.user as any)._id || ""}`}
              className="w-7 h-7 rounded-lg bg-neutral-800 text-white dark:bg-neutral-200 dark:text-neutral-900 flex items-center justify-center text-xs font-semibold shadow-xs hover:opacity-90"
            >
              {username.charAt(0).toUpperCase()}
            </Link>
          ) : (
            <Link
              href="/sign-in"
              className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-[#1C1B19] text-white dark:bg-white dark:text-[#1C1B19] hover:opacity-90"
            >
              Sign In
            </Link>
          )}
        </div>
      </header>

      {/* BODY LAYOUT */}
      <div className="relative z-10 flex-1 flex overflow-hidden">
        
        {/* LEFT SIDEBAR */}
        <aside className="w-64 border-r border-[#E8E4DB] dark:border-[#2D2B28] bg-[#FBF9F4]/40 dark:bg-[#1C1B19]/40 backdrop-blur-xs flex flex-col justify-between p-3.5 shrink-0 hidden md:flex">
          <div className="flex flex-col gap-4 overflow-hidden">
            
            {/* New Chat Button */}
            <button
              onClick={startNewChat}
              className={`flex items-center justify-between px-3 py-2 rounded-lg transition-colors w-full font-medium mb-0.5 border ${
                activeView === "chat" && messages.length === 0
                  ? "bg-neutral-900/10 dark:bg-white/10 text-neutral-900 dark:text-white border-neutral-300 dark:border-neutral-700"
                  : "bg-neutral-900/5 dark:bg-white/5 text-neutral-800 dark:text-neutral-200 hover:bg-neutral-900/10 dark:hover:bg-white/10 border-neutral-300/40 dark:border-neutral-700/40"
              }`}
            >
              <div className="flex items-center gap-2">
                <MessageSquarePlus className="w-4 h-4 opacity-70" />
                <span className="text-xs">New Challenge</span>
              </div>
              <Plus className="w-3.5 h-3.5 opacity-60" />
            </button>

            {/* Navigation Links under New Challenge */}
            <div className="flex flex-col gap-0.5 text-xs font-medium text-[#4A4640] dark:text-[#B5B2AA]">
              
              {/* Search */}
              <button
                onClick={() => {
                  setActiveView("chat");
                  textareaRef.current?.focus();
                }}
                className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg hover:bg-black/[0.04] dark:hover:bg-white/[0.04] transition-colors w-full text-left"
              >
                <Search className="w-3.5 h-3.5 opacity-70" />
                <span>Search</span>
              </button>

              {/* Projects / Problem Set */}
              <Link
                href="/problems"
                className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg hover:bg-black/[0.04] dark:hover:bg-white/[0.04] transition-colors w-full"
              >
                <FolderKanban className="w-3.5 h-3.5 opacity-70" />
                <span>Projects</span>
              </Link>

              {/* Settings Button (Active highlight container matching screenshot) */}
              <button
                onClick={() => setActiveView("settings")}
                className={`flex items-center gap-2.5 px-2.5 py-2 rounded-lg transition-colors w-full text-left ${
                  activeView === "settings"
                    ? "bg-[#ECE8DF] dark:bg-[#282624] text-[#1C1B19] dark:text-white font-semibold shadow-2xs"
                    : "hover:bg-black/[0.04] dark:hover:bg-white/[0.04]"
                }`}
              >
                <SettingsIcon className="w-3.5 h-3.5 opacity-70" />
                <span>Settings</span>
              </button>

              {session?.user && (
                <Link
                  href={`/dashboard/${(session.user as any)._id || ""}`}
                  className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg hover:bg-black/[0.04] dark:hover:bg-white/[0.04] transition-colors w-full"
                >
                  <BarChart3 className="w-3.5 h-3.5 opacity-70" />
                  <span>My Submissions</span>
                </Link>
              )}
            </div>

            {/* Generated Problem History Section */}
            <div className="flex flex-col gap-1.5 flex-1 overflow-hidden">
              <div className="px-2.5 text-[11px] font-semibold text-[#8C877D] dark:text-[#6E6A63] flex items-center justify-between">
                <span>Recent History</span>
                {userHistory.length > 0 && (
                  <button
                    onClick={clearHistory}
                    className="text-[10px] text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors"
                    title="Clear history"
                  >
                    Clear
                  </button>
                )}
              </div>

              {filteredHistory.length === 0 ? (
                <div className="py-8 px-3 text-center text-xs text-[#8C877D] dark:text-[#6E6A63] space-y-1.5">
                  <Sparkles className="w-4 h-4 mx-auto opacity-30 text-neutral-500" />
                  <p className="font-medium text-[#4A4640] dark:text-[#A09D96]">No history yet</p>
                  <p className="text-[11px] opacity-70 leading-relaxed">
                    Prompts & generated problems will appear here as you create them.
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-1 overflow-y-auto pr-1 text-xs text-[#524E48] dark:text-[#A09D96]">
                  {filteredHistory.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => handleSend(item.title)}
                      className="text-left px-2.5 py-2 rounded-lg hover:text-[#1A1918] dark:hover:text-[#F3F2F0] hover:bg-black/[0.03] dark:hover:bg-white/[0.03] transition-all group"
                    >
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        {item.level && (
                          <span className="text-[10px] font-medium px-1.5 py-0.2 rounded border border-neutral-300 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 bg-neutral-100/50 dark:bg-neutral-800/50">
                            {item.level}
                          </span>
                        )}
                        <span className="text-[10px] text-neutral-400 opacity-60 ml-auto">{item.time}</span>
                      </div>
                      <span className="truncate block font-medium text-xs text-[#33312E] dark:text-[#D5D2CA]">
                        {item.title}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Bottom Engine Indicator */}
          <div className="pt-2.5 border-t border-[#E8E4DB] dark:border-[#2D2B28] flex items-center justify-between text-xs text-neutral-500">
            <span className="flex items-center gap-1.5 text-[11px]">
              <Sparkles className="w-3.5 h-3.5 text-neutral-400" />
              <span>AI Problem Setter</span>
            </span>
            <span className="text-[10px] font-mono opacity-60">v2.0</span>
          </div>
        </aside>

        {/* MAIN CANVAS */}
        <main className="flex-1 overflow-y-auto flex flex-col items-center px-4 py-8 md:py-12">
          
          {/* RENDER SETTINGS VIEW WHEN ACTIVE */}
          {activeView === "settings" ? (
            <SettingsView currentModel={activeModel} onModelSelect={setActiveModel} />
          ) : (
            /* RENDER CHAT / PROBLEM GENERATOR CANVAS */
            <div className="w-full max-w-2xl flex flex-col items-center gap-7">
              
              {/* HERO GREETING */}
              {messages.length === 0 && (
                <div className="text-center space-y-0.5 mb-2">
                  <h1 className="text-3xl md:text-4xl font-serif text-[#1C1B19] dark:text-[#EDEDEB] tracking-tight">
                    Hey <span className="italic font-normal">{username}</span>
                  </h1>
                  <p className="text-3xl md:text-4xl font-serif text-[#1C1B19] dark:text-[#EDEDEB] tracking-tight">
                    What can I help you code today?
                  </p>
                </div>
              )}

              {/* CONVERSATION STREAM */}
              {messages.length > 0 && (
                <div className="w-full space-y-5 mb-4">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}
                    >
                      <div
                        className={`max-w-[95%] rounded-2xl p-5 text-sm leading-relaxed ${
                          msg.role === "user"
                            ? "bg-neutral-900 text-white dark:bg-[#33312E] dark:text-neutral-100 rounded-tr-xs"
                            : "bg-white dark:bg-[#242321] border border-[#E8E4DB] dark:border-[#33302C] text-[#242220] dark:text-[#E2DFD8] shadow-sm rounded-tl-xs"
                        }`}
                      >
                        {msg.problemDetails && (
                          <div className="mb-4 pb-4 border-b border-black/[0.08] dark:border-white/[0.08]">
                            <div className="flex items-center justify-between gap-2 mb-2">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-semibold px-2 py-0.5 rounded-full border border-neutral-300 dark:border-neutral-700 bg-neutral-100/60 dark:bg-neutral-800/60 text-neutral-800 dark:text-neutral-200">
                                  {msg.problemDetails.level}
                                </span>
                                <h3 className="font-semibold text-lg text-neutral-900 dark:text-neutral-100">
                                  {msg.problemDetails.title}
                                </h3>
                              </div>

                              <Link
                                href="/problems"
                                className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-neutral-900 text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100 shadow-xs transition-colors shrink-0"
                              >
                                <Play className="w-3.5 h-3.5 fill-current" />
                                <span>Solve in Editor</span>
                              </Link>
                            </div>

                            {msg.problemDetails.examples && (
                              <div className="mt-3 p-3 rounded-xl bg-black/[0.03] dark:bg-white/[0.03] text-xs font-mono space-y-1">
                                <div className="font-semibold text-neutral-800 dark:text-neutral-200">Examples:</div>
                                <pre className="whitespace-pre-wrap text-neutral-600 dark:text-neutral-400">
                                  {msg.problemDetails.examples}
                                </pre>
                              </div>
                            )}

                            {msg.problemDetails.constraints && (
                              <div className="mt-2 p-3 rounded-xl bg-black/[0.03] dark:bg-white/[0.03] text-xs font-mono space-y-1">
                                <div className="font-semibold text-neutral-800 dark:text-neutral-200">Constraints:</div>
                                <pre className="whitespace-pre-wrap text-neutral-600 dark:text-neutral-400">
                                  {msg.problemDetails.constraints}
                                </pre>
                              </div>
                            )}
                          </div>
                        )}

                        <p className="whitespace-pre-line">{msg.content}</p>

                        {msg.codeSnippet && (
                          <div className="mt-4 rounded-xl bg-[#181716] p-3.5 border border-white/[0.08] text-xs font-mono text-neutral-200">
                            <div className="flex items-center justify-between pb-2 border-b border-white/[0.06] text-[11px] text-neutral-400 uppercase font-semibold">
                              <span>Starter Solution ({msg.codeSnippet.language})</span>
                              <button
                                onClick={() => copyText(msg.codeSnippet!.code, msg.id)}
                                className="flex items-center gap-1 hover:text-white transition-colors"
                              >
                                {copiedId === msg.id ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                                <span>{copiedId === msg.id ? "Copied" : "Copy Code"}</span>
                              </button>
                            </div>
                            <pre className="mt-2 overflow-x-auto whitespace-pre text-neutral-300">{msg.codeSnippet.code}</pre>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}

                  {isLoading && (
                    <div className="flex items-center gap-2 text-xs text-[#8C877D] dark:text-[#7A766F] p-3">
                      <Sparkles className="w-4 h-4 animate-spin text-neutral-400" />
                      <span>AI Problem Setter is generating your coding challenge...</span>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              )}

              {/* MAIN INPUT PROMPT BOX */}
              <div className="w-full bg-[#ECE8DF]/70 dark:bg-[#282624]/70 backdrop-blur-xl border border-[#DFDAD0] dark:border-[#383532] rounded-2xl shadow-lg shadow-black/[0.02] dark:shadow-black/20 p-3.5 transition-all focus-within:border-black/20 dark:focus-within:border-white/20">
                
                {/* Text Input */}
                <textarea
                  ref={textareaRef}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  placeholder="Describe a coding problem, algorithmic concept, or LeetCode challenge to generate..."
                  className="w-full bg-transparent resize-none outline-hidden text-[#1C1B19] dark:text-[#EDEDEB] placeholder-[#8C877D] dark:placeholder-[#736F68] text-sm md:text-base min-h-[64px] leading-relaxed"
                  rows={2}
                />

                {/* Bottom Toolbar */}
                <div className="pt-2.5 border-t border-black/[0.04] dark:border-white/[0.04] flex items-center justify-between gap-2 flex-wrap">
                  
                  {/* Left Action Buttons */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    
                    {/* Topic Selector */}
                    <div className="relative">
                      <button
                        onClick={() => setShowTopicDropdown(!showTopicDropdown)}
                        className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-md border border-black/[0.06] dark:border-white/[0.06] bg-black/[0.02] dark:bg-white/[0.03] hover:bg-black/[0.06] dark:hover:bg-white/[0.08] text-[#4A4640] dark:text-[#C5C2BA] transition-colors"
                      >
                        <Layers className="w-3 h-3 opacity-60" />
                        <span>{selectedTopic}</span>
                        <ChevronDown className="w-2.5 h-2.5 opacity-60" />
                      </button>

                      {showTopicDropdown && (
                        <div className="absolute bottom-full left-0 mb-1.5 w-48 max-h-48 overflow-y-auto bg-white dark:bg-[#252321] border border-[#E8E4DB] dark:border-[#383531] rounded-xl shadow-xl py-1 z-50 text-xs">
                          {topicsList.map((t) => (
                            <button
                              key={t}
                              onClick={() => {
                                setSelectedTopic(t);
                                setShowTopicDropdown(false);
                              }}
                              className={`w-full text-left px-3 py-1.5 hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition-colors ${
                                selectedTopic === t ? "text-neutral-950 dark:text-white font-semibold" : "text-[#524E48] dark:text-[#A8A49D]"
                              }`}
                            >
                              {t}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Difficulty Selector */}
                    <div className="flex items-center bg-black/[0.04] dark:bg-white/[0.04] rounded-md p-0.5 text-[11px] font-medium border border-black/[0.04] dark:border-white/[0.04]">
                      {(["Easy", "Medium", "Hard"] as const).map((lvl) => (
                        <button
                          key={lvl}
                          onClick={() => setDifficulty(lvl)}
                          className={`px-2 py-0.5 rounded transition-all ${
                            difficulty === lvl
                              ? "bg-[#3A3733] text-white dark:bg-white dark:text-[#1C1B19] font-semibold shadow-2xs"
                              : "text-[#7A756C] dark:text-[#8C8880] hover:text-[#1C1B19] dark:hover:text-white"
                          }`}
                        >
                          {lvl}
                        </button>
                      ))}
                    </div>

                    {/* Online Toggle */}
                    <button
                      onClick={() => setIsOnlineEnabled(!isOnlineEnabled)}
                      className={`flex items-center gap-1 text-xs px-2 py-1 rounded-md transition-colors ${
                        isOnlineEnabled
                          ? "text-[#1C1B19] dark:text-white font-medium"
                          : "text-[#7A756C] dark:text-[#8C8880] hover:bg-black/[0.03] dark:hover:bg-white/[0.04]"
                      }`}
                    >
                      <Globe className="w-3 h-3" />
                      <span>Online</span>
                    </button>
                  </div>

                  {/* Right Action Icons (Mic & Up Arrow Send) */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toast.info("Voice input ready")}
                      className="p-1 rounded-md text-[#7A756C] dark:text-[#8C8880] hover:text-[#1C1B19] dark:hover:text-white transition-colors"
                      title="Voice input"
                    >
                      <Mic className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleSend()}
                      disabled={!prompt.trim() || isLoading}
                      className={`w-7 h-7 rounded-md flex items-center justify-center transition-all ${
                        prompt.trim()
                          ? "bg-[#3A3733] text-white dark:bg-white dark:text-[#1E1D1B] hover:opacity-90 shadow-xs"
                          : "bg-black/[0.06] dark:bg-white/[0.06] text-[#9E9A91] dark:text-[#615E57] cursor-not-allowed"
                      }`}
                    >
                      <ArrowUp className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* QUICK MODE SELECTION PILLS */}
              {messages.length === 0 && (
                <div className="flex items-center justify-center gap-2 flex-wrap w-full">
                  {platformModes.map(({ label, icon: Icon }) => (
                    <button
                      key={label}
                      onClick={() => setActiveMode(label)}
                      className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border transition-all ${
                        activeMode === label
                          ? "border-[#C8C3B8] dark:border-[#4D4943] bg-white dark:bg-[#2B2927] text-[#1C1B19] dark:text-white shadow-2xs font-semibold"
                          : "border-[#E5E0D4] dark:border-[#33302C] bg-[#F2EFE8]/70 dark:bg-[#242220]/70 text-[#6B665E] dark:text-[#9E9B93] hover:bg-white dark:hover:bg-[#2B2927]"
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5 opacity-80" />
                      <span>{label}</span>
                    </button>
                  ))}
                </div>
              )}

              {/* PROMPT SUGGESTIONS CARD */}
              {messages.length === 0 && (
                <div className="w-full bg-[#ECE8DF]/60 dark:bg-[#262422]/60 backdrop-blur-md border border-[#DFDAD0] dark:border-[#35322E] rounded-2xl p-4 shadow-2xs space-y-2.5">
                  
                  {/* Header */}
                  <div className="flex items-center justify-between text-xs font-medium text-[#4A4640] dark:text-[#C5C2BA]">
                    <div className="flex items-center gap-2">
                      <Lightbulb className="w-3.5 h-3.5 opacity-70" />
                      <span>Trending {activeMode} Prompts</span>
                    </div>
                    <span className="text-[10px] text-neutral-400">Click to run</span>
                  </div>

                  {/* Prompts list */}
                  <div className="flex flex-col divide-y divide-black/[0.04] dark:divide-white/[0.04]">
                    {currentSuggestions.map((item, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSend(item)}
                        className="text-left py-2.5 px-1.5 text-xs md:text-sm text-[#524E48] dark:text-[#A8A49D] hover:text-[#1A1918] dark:hover:text-[#F3F2F0] hover:bg-black/[0.02] dark:hover:bg-white/[0.03] rounded-md transition-colors leading-relaxed"
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </div>
              )}

            </div>
          )}
        </main>
      </div>

    </div>
  );
}
