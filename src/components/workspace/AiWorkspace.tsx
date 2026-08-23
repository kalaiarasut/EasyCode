"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { useTheme } from "next-themes";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
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
  User,
  LogOut,
  Brain,
  Key,
  ShieldCheck,
  Cpu,
  Lock,
  ExternalLink,
  Code2,
  AlertCircle
} from "lucide-react";
import { toast } from "sonner";
import SettingsView from "./SettingsView";
import GammaProblemCanvas from "../problem-builder/GammaProblemCanvas";
import { GeneratedProblem } from "@/types/generatedProblem";

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
    examples: any;
    constraints: any;
    testCases?: Array<{ input: string; output: string }>;
    hints?: string[];
  };
  generatedProblem?: GeneratedProblem;
}

interface ModelDefinition {
  id: string;
  name: string;
  provider: string;
  category: "Frontier" | "Reasoning" | "Coding" | "Speed" | "Open Source" | "Search" | "Local";
  badge: string;
  contextWindow: string;
  requiredKey: string;
}

const ALL_MODELS: ModelDefinition[] = [
  // 1. Moonshot AI (Kimi)
  { id: "kimi-latest", name: "Kimi Latest", provider: "Moonshot AI", category: "Reasoning", badge: "Long Context", contextWindow: "128k tokens", requiredKey: "kimi" },
  { id: "moonshot-v1-32k", name: "Moonshot v1 32k", provider: "Moonshot AI", category: "Reasoning", badge: "Fast", contextWindow: "32k tokens", requiredKey: "kimi" },
  { id: "moonshot-v1-128k", name: "Moonshot v1 128k", provider: "Moonshot AI", category: "Reasoning", badge: "128k Context", contextWindow: "128k tokens", requiredKey: "kimi" },
  { id: "moonshot-v1-8k", name: "Moonshot v1 8k", provider: "Moonshot AI", category: "Speed", badge: "Fast", contextWindow: "8k tokens", requiredKey: "kimi" },

  // 2. Google DeepMind
  { id: "gemini-2.5-flash", name: "Gemini 2.5 Flash", provider: "Google", category: "Frontier", badge: "Fast", contextWindow: "1M tokens", requiredKey: "gemini" },
  { id: "gemini-2.5-pro", name: "Gemini 2.5 Pro", provider: "Google", category: "Frontier", badge: "Advanced", contextWindow: "2M tokens", requiredKey: "gemini" },
  { id: "gemini-2.0-flash-thinking", name: "Gemini 2.0 Flash Thinking", provider: "Google", category: "Reasoning", badge: "Reasoning", contextWindow: "1M tokens", requiredKey: "gemini" },
  { id: "gemini-2.0-flash", name: "Gemini 2.0 Flash", provider: "Google", category: "Speed", badge: "Speed", contextWindow: "1M tokens", requiredKey: "gemini" },
  { id: "gemini-1.5-pro", name: "Gemini 1.5 Pro", provider: "Google", category: "Frontier", badge: "2M Context", contextWindow: "2M tokens", requiredKey: "gemini" },

  // 3. OpenAI
  { id: "o3-mini", name: "o3-mini", provider: "OpenAI", category: "Reasoning", badge: "STEM SOTA", contextWindow: "128k tokens", requiredKey: "openai" },
  { id: "o1", name: "o1", provider: "OpenAI", category: "Reasoning", badge: "Reasoning", contextWindow: "200k tokens", requiredKey: "openai" },
  { id: "o1-mini", name: "o1-mini", provider: "OpenAI", category: "Reasoning", badge: "Fast Math", contextWindow: "128k tokens", requiredKey: "openai" },
  { id: "gpt-4o", name: "GPT-4o", provider: "OpenAI", category: "Frontier", badge: "Flagship", contextWindow: "128k tokens", requiredKey: "openai" },
  { id: "gpt-4o-mini", name: "GPT-4o mini", provider: "OpenAI", category: "Speed", badge: "Fast", contextWindow: "128k tokens", requiredKey: "openai" },

  // 4. Anthropic
  { id: "claude-3.7-sonnet", name: "Claude 3.7 Sonnet", provider: "Anthropic", category: "Coding", badge: "Hybrid SOTA", contextWindow: "200k tokens", requiredKey: "anthropic" },
  { id: "claude-3.5-sonnet", name: "Claude 3.5 Sonnet", provider: "Anthropic", category: "Coding", badge: "Top Coder", contextWindow: "200k tokens", requiredKey: "anthropic" },
  { id: "claude-3.5-haiku", name: "Claude 3.5 Haiku", provider: "Anthropic", category: "Speed", badge: "Fast", contextWindow: "200k tokens", requiredKey: "anthropic" },
  { id: "claude-3-opus", name: "Claude 3 Opus", provider: "Anthropic", category: "Frontier", badge: "Deep", contextWindow: "200k tokens", requiredKey: "anthropic" },

  // 5. DeepSeek
  { id: "deepseek-r1", name: "DeepSeek R1", provider: "DeepSeek", category: "Reasoning", badge: "Reasoning SOTA", contextWindow: "64k tokens", requiredKey: "deepseek" },
  { id: "deepseek-v3", name: "DeepSeek V3", provider: "DeepSeek", category: "Coding", badge: "671B MoE", contextWindow: "64k tokens", requiredKey: "deepseek" },
  { id: "deepseek-coder-v2", name: "DeepSeek Coder V2", provider: "DeepSeek", category: "Coding", badge: "338+ Langs", contextWindow: "128k tokens", requiredKey: "deepseek" },

  // 6. Groq LPUs
  { id: "groq-llama-3.3-70b", name: "Llama 3.3 70B (Groq)", provider: "Groq", category: "Speed", badge: "Fast", contextWindow: "128k tokens", requiredKey: "groq" },
  { id: "groq-deepseek-r1-llama-70b", name: "DeepSeek R1 70B (Groq)", provider: "Groq", category: "Reasoning", badge: "Instant CoT", contextWindow: "128k tokens", requiredKey: "groq" },
  { id: "groq-qwen-2.5-coder-32b", name: "Qwen 2.5 Coder (Groq)", provider: "Groq", category: "Speed", badge: "Fast Coder", contextWindow: "32k tokens", requiredKey: "groq" },

  // 7. Alibaba Cloud (Qwen)
  { id: "qwen-2.5-coder-32b", name: "Qwen 2.5 Coder 32B", provider: "Alibaba Cloud", category: "Coding", badge: "Open Champion", contextWindow: "128k tokens", requiredKey: "qwen" },
  { id: "qwq-32b-preview", name: "QwQ 32B Preview", provider: "Alibaba Cloud", category: "Reasoning", badge: "Math & CoT", contextWindow: "32k tokens", requiredKey: "qwen" },
  { id: "qwen-2.5-72b-instruct", name: "Qwen 2.5 72B Instruct", provider: "Alibaba Cloud", category: "Frontier", badge: "72B Flagship", contextWindow: "128k tokens", requiredKey: "qwen" },

  // 8. Cerebras Systems
  { id: "cerebras-llama-3.3-70b", name: "Llama 3.3 70B (Cerebras)", provider: "Cerebras", category: "Speed", badge: "Fast", contextWindow: "128k tokens", requiredKey: "cerebras" },
  { id: "cerebras-deepseek-r1-distill-70b", name: "DeepSeek R1 70B (Cerebras)", provider: "Cerebras", category: "Reasoning", badge: "Instant CoT", contextWindow: "128k tokens", requiredKey: "cerebras" },

  // 9. SambaNova Systems
  { id: "sambanova-deepseek-r1", name: "DeepSeek R1 (SambaNova)", provider: "SambaNova", category: "Speed", badge: "Fast", contextWindow: "64k tokens", requiredKey: "sambanova" },
  { id: "sambanova-llama-3.3-70b", name: "Llama 3.3 70B (SambaNova)", provider: "SambaNova", category: "Speed", badge: "Fast", contextWindow: "128k tokens", requiredKey: "sambanova" },

  // 10. Zhipu AI (GLM)
  { id: "glm-4-plus", name: "GLM-4 Plus", provider: "Zhipu AI", category: "Reasoning", badge: "Flagship", contextWindow: "128k tokens", requiredKey: "zhipu" },
  { id: "codegeex-4", name: "CodeGeeX-4", provider: "Zhipu AI", category: "Coding", badge: "Code SOTA", contextWindow: "128k tokens", requiredKey: "zhipu" },

  // 11. 01.AI (Yi)
  { id: "yi-lightning", name: "Yi Lightning", provider: "01.AI", category: "Frontier", badge: "Top Ranked", contextWindow: "128k tokens", requiredKey: "yi" },
  { id: "yi-large", name: "Yi Large", provider: "01.AI", category: "Frontier", badge: "Large", contextWindow: "128k tokens", requiredKey: "yi" },

  // 12. SiliconFlow
  { id: "siliconflow-deepseek-r1", name: "DeepSeek R1 (SiliconFlow)", provider: "SiliconFlow", category: "Speed", badge: "Full 671B", contextWindow: "64k tokens", requiredKey: "siliconflow" },
  { id: "siliconflow-qwen-2.5-coder-32b", name: "Qwen 2.5 Coder (SiliconFlow)", provider: "SiliconFlow", category: "Speed", badge: "Fast", contextWindow: "32k tokens", requiredKey: "siliconflow" },

  // 13. Mistral AI
  { id: "codestral-latest", name: "Codestral 22B", provider: "Mistral AI", category: "Coding", badge: "Code Specialist", contextWindow: "32k tokens", requiredKey: "mistral" },
  { id: "mistral-large", name: "Mistral Large 2411", provider: "Mistral AI", category: "Frontier", badge: "123B Flagship", contextWindow: "128k tokens", requiredKey: "mistral" },

  // 14. xAI (Grok)
  { id: "grok-2", name: "Grok 2", provider: "xAI", category: "Frontier", badge: "Flagship", contextWindow: "128k tokens", requiredKey: "grok" },
  { id: "grok-2-mini", name: "Grok 2 mini", provider: "xAI", category: "Speed", badge: "Fast", contextWindow: "128k tokens", requiredKey: "grok" },

  // 15. Together AI & Fireworks
  { id: "together-llama-3.3-70b", name: "Llama 3.3 70B (Together)", provider: "Together AI", category: "Open Source", badge: "Together Cloud", contextWindow: "128k tokens", requiredKey: "together" },
  { id: "together-deepseek-r1", name: "DeepSeek R1 (Together)", provider: "Together AI", category: "Reasoning", badge: "Deep CoT", contextWindow: "64k tokens", requiredKey: "together" },
  { id: "fireworks-deepseek-r1", name: "DeepSeek R1 (Fireworks)", provider: "Fireworks AI", category: "Speed", badge: "Fast CoT", contextWindow: "128k tokens", requiredKey: "fireworks" },

  // 16. Research & Gateways
  { id: "sonar-reasoning-pro", name: "Sonar Reasoning Pro", provider: "Perplexity", category: "Search", badge: "Live Search", contextWindow: "128k tokens", requiredKey: "perplexity" },
  { id: "command-r-plus", name: "Command R+", provider: "Cohere", category: "Frontier", badge: "Enterprise", contextWindow: "128k tokens", requiredKey: "cohere" },
  { id: "openrouter-auto", name: "OpenRouter Auto", provider: "OpenRouter", category: "Frontier", badge: "300+ Routing", contextWindow: "Dynamic", requiredKey: "openrouter" },
  { id: "ollama-local", name: "Local Ollama Host", provider: "Local", category: "Local", badge: "100% Private", contextWindow: "Configurable", requiredKey: "ollamaUrl" }
];

export default function AiWorkspace() {
  const { theme, setTheme } = useTheme();
  const { data: session } = useSession();
  const [mounted, setMounted] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [activeView, setActiveView] = useState<"chat" | "settings">("chat");
  const [activeModel, setActiveModel] = useState("");
  
  // Dropdown States
  const [showModelDropdown, setShowModelDropdown] = useState(false);
  const [showChatModelDropdown, setShowChatModelDropdown] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showTopicDropdown, setShowTopicDropdown] = useState(false);

  // Model Search
  const [modelDropdownSearch, setModelDropdownSearch] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams?.get("view") === "settings") {
      setActiveView("settings");
    }
  }, [searchParams]);

  const [activeMode, setActiveMode] = useState<string>("Generate Problem");
  const [difficulty, setDifficulty] = useState<"Easy" | "Medium" | "Hard">("Medium");
  const [selectedTopic, setSelectedTopic] = useState("");
  const [isOnlineEnabled, setIsOnlineEnabled] = useState(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [searchFilter, setSearchFilter] = useState("");
  const [userHistory, setUserHistory] = useState<HistoryItem[]>([]);

  // Stored API Keys state
  const [apiKeys, setApiKeys] = useState<Record<string, string>>({});

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const chatModelDropdownRef = useRef<HTMLDivElement>(null);
  const topicDropdownRef = useRef<HTMLDivElement>(null);

  // Helper: Is a model available based strictly on whether user configured its key?
  const isModelAvailable = (model: ModelDefinition): boolean => {
    if (!model || !model.requiredKey) return false;
    const keyVal = apiKeys[model.requiredKey];
    return Boolean(keyVal && typeof keyVal === "string" && keyVal.trim().length > 5);
  };

  // List of ONLY available models (configured with keys)
  const availableModelsList = useMemo(() => {
    return ALL_MODELS.filter((m) => isModelAvailable(m));
  }, [apiKeys]);

  // Set active model to first available model if current one is not available
  useEffect(() => {
    if (availableModelsList.length > 0) {
      if (!activeModel || !availableModelsList.some((m) => m.id === activeModel)) {
        setActiveModel(availableModelsList[0].id);
      }
    } else {
      setActiveModel("");
    }
  }, [availableModelsList, activeModel]);

  useEffect(() => {
    setMounted(true);
    try {
      const saved = localStorage.getItem("easycode_chat_history");
      if (saved) {
        setUserHistory(JSON.parse(saved));
      }
      const savedKeys = localStorage.getItem("easycode_custom_keys");
      if (savedKeys) {
        setApiKeys(JSON.parse(savedKeys));
      }

      // Fetch from Supabase cloud table if authenticated
      if (session?.user) {
        fetch("/api/user/keys")
          .then((res) => res.json())
          .then((data) => {
            if (data.success && data.keys && Object.keys(data.keys).length > 0) {
              setApiKeys((prev) => ({ ...prev, ...data.keys }));
              localStorage.setItem("easycode_custom_keys", JSON.stringify(data.keys));
            }
          })
          .catch(() => {});
      }
    } catch (e) {
      console.warn("Could not load local settings", e);
    }
  }, [session]);

  // Click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
      if (chatModelDropdownRef.current && !chatModelDropdownRef.current.contains(event.target as Node)) {
        setShowChatModelDropdown(false);
      }
      if (topicDropdownRef.current && !topicDropdownRef.current.contains(event.target as Node)) {
        setShowTopicDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const saveHistoryItem = (title: string, level?: string, topic?: string) => {
    const newItem: HistoryItem = {
      id: Date.now().toString(),
      title: title.length > 50 ? title.substring(0, 48) + "..." : title,
      time: "Just now",
      topic: topic || selectedTopic,
      level: level || difficulty,
    };
    const updated = [newItem, ...userHistory.slice(0, 19)];
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

  const handleSelectModel = (model: ModelDefinition) => {
    setActiveModel(model.id);
    setShowModelDropdown(false);
    setShowChatModelDropdown(false);
    toast.success(`Active model set to ${model.name}`);
  };

  const filteredHistory = userHistory.filter((item) =>
    item.title.toLowerCase().includes(searchFilter.toLowerCase())
  );

  const topicsList = [
    "Dynamic Programming",
    "Graphs & BFS/DFS",
    "Trees & Binary Search Trees",
    "Arrays & Hashing",
    "Two Pointers & Sliding Window",
    "Backtracking",
    "Trie & Autocomplete",
    "Greedy Algorithms",
    "Heap / Priority Queue",
    "Bit Manipulation",
  ];

  const platformModes = [
    { label: "Generate Problem", icon: Zap },
    { label: "Explain Algorithm", icon: BookOpen },
    { label: "Test Cases & Edge Cases", icon: TestTube2 },
    { label: "Optimize Time & Space", icon: Rocket },
    { label: "System Design", icon: Layers },
  ];

  const promptSuggestions = [
    "Create a Hard Dynamic Programming challenge on grid path optimization with obstacle costs",
    "Generate a Graph Shortest Path problem with dynamic obstacle weights and teleportation portals",
    "Design a custom Trie-based autocomplete problem with real-time prefix frequency ranking",
    "Construct an interactive Binary Search problem with real-world floating point precision edge cases",
    "Build a Monotonic Stack problem for stock price span and next greater temperature analysis",
    "Generate a Two-Pointer challenge for trapping rainwater variations with variable container widths",
  ];

  const handleSend = async (customPromptText?: string) => {
    const textToSend = customPromptText || prompt;
    if (!textToSend.trim() || isLoading) return;

    if (availableModelsList.length === 0 || !activeModel) {
      toast.error("No API key configured. Please add an API key in Settings & API Keys first.", {
        action: {
          label: "Open Settings",
          onClick: () => setActiveView("settings"),
        },
      });
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: textToSend,
    };

    setMessages((prev) => [...prev, userMessage]);
    setPrompt("");

    saveHistoryItem(textToSend, difficulty, selectedTopic);

    // Save prompt & generation params for Problem Page live generation
    try {
      sessionStorage.setItem("easycode_live_generate_prompt", textToSend);
      sessionStorage.setItem("easycode_live_generate_diff", difficulty);
      sessionStorage.setItem("easycode_live_generate_topic", selectedTopic || "Algorithms");
      sessionStorage.setItem("easycode_live_generate_model", activeModel || "gemini-2.5-flash");
    } catch (e) {}

    toast.info("Starting live problem builder on Problem Page...");
    router.push(`/problem/c0000000-0000-0000-0000-000000000001?generate=true&prompt=${encodeURIComponent(textToSend)}&difficulty=${encodeURIComponent(difficulty)}&topic=${encodeURIComponent(selectedTopic || "Algorithms")}`);
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

  const filteredDropdownModels = useMemo(() => {
    if (!modelDropdownSearch.trim()) return availableModelsList;
    return availableModelsList.filter(
      (m) =>
        m.name.toLowerCase().includes(modelDropdownSearch.toLowerCase()) ||
        m.id.toLowerCase().includes(modelDropdownSearch.toLowerCase()) ||
        m.provider.toLowerCase().includes(modelDropdownSearch.toLowerCase())
    );
  }, [availableModelsList, modelDropdownSearch]);

  const activeModelObj = useMemo(() => {
    return ALL_MODELS.find((m) => m.id === activeModel);
  }, [activeModel]);

  const currentUserId = (session?.user as any)?._id || (session?.user as any)?.id || "";
  const username = session?.user?.name || (session?.user as any)?.username || "Developer";
  const userEmail = session?.user?.email || "";

  if (!mounted) return null;

  return (
    <div className="min-h-screen w-full bg-[#FBF9F4] dark:bg-[#1C1B19] text-[#1C1B19] dark:text-[#E8E6E3] flex flex-col transition-colors duration-300 font-sans selection:bg-neutral-500/20">
      
      {/* Hidden dummy inputs to absorb aggressive browser autofill */}
      <input type="text" style={{ display: 'none' }} tabIndex={-1} aria-hidden="true" autoComplete="off" />
      <input type="password" style={{ display: 'none' }} tabIndex={-1} aria-hidden="true" autoComplete="off" />

      {/* Subtle vertical neutral grid texture */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] bg-[linear-gradient(to_right,#000_1px,transparent_1px),linear-gradient(to_bottom,#000_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#fff_1px,transparent_1px),linear-gradient(to_bottom,#fff_1px,transparent_1px)] bg-[size:5rem_5rem]" />
      </div>

      {/* TOP HEADER */}
      <header className="h-14 border-b border-[#E8E4DB] dark:border-[#2D2B28] px-4 flex items-center justify-between relative z-40 bg-[#FBF9F4]/80 dark:bg-[#1C1B19]/80 backdrop-blur-md">
        
        {/* Left: Branding + Global Model Pill */}
        <div className="flex items-center gap-3">
          <Link
            href="/"
            onClick={() => setActiveView("chat")}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <div className="w-5 h-5 rounded-md bg-[#1C1B19] dark:bg-[#EDEDEB] flex items-center justify-center text-[11px] font-mono font-bold text-white dark:text-[#1C1B19]">
              E
            </div>
            <span className="font-serif text-lg tracking-tight font-medium text-[#1A1918] dark:text-[#F3F2F0]">
              EasyCode
            </span>
          </Link>

          <span className="text-[#C8C4BC] dark:text-[#4A4742] text-sm font-light">/</span>

          {/* Top Model Switcher Pill */}
          <div className="relative">
            <button
              onClick={() => setShowModelDropdown(!showModelDropdown)}
              className={`flex items-center gap-1.5 text-xs py-1 px-2.5 rounded-md transition-colors border ${
                availableModelsList.length > 0
                  ? "text-[#524E48] dark:text-[#A8A49D] hover:text-[#1A1918] dark:hover:text-white hover:bg-black/[0.04] dark:hover:bg-white/[0.04] border-black/[0.04] dark:border-white/[0.04]"
                  : "text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/20 font-medium"
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${availableModelsList.length > 0 ? "bg-emerald-500" : "bg-amber-500"}`} />
              <span className="font-mono">{activeModel || "No API Key Added"}</span>
              <span className="text-[10px] opacity-60">⬍</span>
            </button>

            {showModelDropdown && (
              <div className="absolute top-full left-0 mt-1.5 w-72 max-h-96 overflow-y-auto bg-white dark:bg-[#252321] border border-[#E8E4DB] dark:border-[#383531] rounded-xl shadow-2xl py-1 z-50 text-xs font-mono">
                
                {availableModelsList.length === 0 ? (
                  <div className="p-4 text-center space-y-2.5 font-sans">
                    <AlertCircle className="w-5 h-5 mx-auto text-amber-500 opacity-80" />
                    <div className="space-y-1">
                      <p className="font-semibold text-neutral-900 dark:text-white text-xs">
                        No Available Models
                      </p>
                      <p className="text-[11px] text-neutral-500 leading-relaxed">
                        Add an API key in Settings to unlock your models.
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setShowModelDropdown(false);
                        setActiveView("settings");
                      }}
                      className="w-full py-1.5 px-3 rounded-lg bg-[#3A3733] text-white dark:bg-white dark:text-[#1C1B19] text-xs font-semibold hover:opacity-90 transition-opacity"
                    >
                      Add API Key in Settings →
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="p-2 border-b border-black/[0.04] dark:border-white/[0.04]">
                      <input
                        type="search"
                        name="top-header-model-search-filter"
                        autoComplete="off"
                        autoCorrect="off"
                        autoCapitalize="off"
                        spellCheck={false}
                        data-form-type="other"
                        data-1p-ignore="true"
                        data-lpignore="true"
                        data-bwignore="true"
                        value={modelDropdownSearch}
                        onChange={(e) => setModelDropdownSearch(e.target.value)}
                        placeholder="Filter available models..."
                        className="w-full px-2.5 py-1 text-xs rounded-md bg-black/[0.03] dark:bg-white/[0.04] border border-neutral-200 dark:border-neutral-700 outline-hidden font-sans"
                        autoFocus
                      />
                    </div>

                    <div className="py-1">
                      {filteredDropdownModels.map((m) => (
                        <button
                          key={m.id}
                          onClick={() => handleSelectModel(m)}
                          className={`w-full text-left px-3 py-2 transition-colors flex items-center justify-between ${
                            activeModel === m.id
                              ? "bg-black/[0.05] dark:bg-white/[0.08] text-neutral-950 dark:text-white font-semibold"
                              : "text-[#524E48] dark:text-[#A8A49D] hover:bg-black/[0.04] dark:hover:bg-white/[0.06]"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                            <div className="flex flex-col">
                              <span className="truncate">{m.name}</span>
                              <span className="text-[10px] font-sans opacity-60">{m.provider} • {m.badge}</span>
                            </div>
                          </div>
                          {activeModel === m.id && <Check className="w-3.5 h-3.5" />}
                        </button>
                      ))}
                    </div>

                    <div className="pt-1 mt-1 border-t border-black/[0.04] dark:border-white/[0.04] px-2 pb-1">
                      <button
                        onClick={() => {
                          setShowModelDropdown(false);
                          setActiveView("settings");
                        }}
                        className="w-full text-center py-1.5 text-[11px] font-sans font-medium text-neutral-600 dark:text-neutral-300 hover:bg-black/[0.04] dark:hover:bg-white/[0.04] rounded-lg transition-colors"
                      >
                        Manage API Keys in Settings →
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right: Share + Theme + Interactive Profile Avatar */}
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

          {/* Interactive Profile Avatar Button & Menu */}
          {session?.user ? (
            <div className="relative" ref={profileMenuRef}>
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="w-8 h-8 rounded-lg bg-[#3A3733] text-white dark:bg-white dark:text-[#1C1B19] flex items-center justify-center text-xs font-semibold shadow-xs hover:opacity-90 transition-all border border-black/10 dark:border-white/20"
                title="Account Menu"
              >
                {username.charAt(0).toUpperCase()}
              </button>

              {/* Profile Dropdown Modal */}
              {showProfileMenu && (
                <div className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-[#252321] border border-[#E8E4DB] dark:border-[#383531] rounded-2xl shadow-2xl p-2 z-50 text-xs">
                  
                  {/* User Card */}
                  <div className="p-3 rounded-xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.04] dark:border-white/[0.04] mb-2 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-neutral-900 dark:text-white truncate">
                        {username}
                      </span>
                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold">
                        Verified
                      </span>
                    </div>
                    <p className="text-[11px] text-neutral-500 truncate">{userEmail}</p>
                  </div>

                  {/* Menu Links */}
                  <div className="space-y-0.5">
                    <Link
                      href={currentUserId ? `/dashboard/${currentUserId}` : "/problems"}
                      onClick={() => setShowProfileMenu(false)}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-neutral-700 dark:text-neutral-200 hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition-colors"
                    >
                      <User className="w-3.5 h-3.5 text-neutral-400" />
                      <span>My Profile & Submissions</span>
                    </Link>

                    <button
                      onClick={() => {
                        setShowProfileMenu(false);
                        setActiveView("settings");
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-neutral-700 dark:text-neutral-200 hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition-colors"
                    >
                      <Key className="w-3.5 h-3.5 text-neutral-400" />
                      <span>Settings & API Keys</span>
                    </button>

                    <button
                      onClick={() => {
                        setShowProfileMenu(false);
                        setActiveView("settings");
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-neutral-700 dark:text-neutral-200 hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition-colors"
                    >
                      <Brain className="w-3.5 h-3.5 text-neutral-400" />
                      <span>AI Memory Bank</span>
                    </button>
                  </div>

                  {/* Sign Out Button */}
                  <div className="pt-2 mt-2 border-t border-black/[0.04] dark:border-white/[0.04]">
                    <button
                      onClick={() => {
                        setShowProfileMenu(false);
                        signOut({ callbackUrl: "/" });
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-red-600 dark:text-red-400 hover:bg-red-500/10 transition-colors"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/sign-in"
              className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-[#1C1B19] text-white dark:bg-white dark:text-[#1C1B19] hover:opacity-90 transition-opacity"
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
          
          <div className="space-y-4">
            
            {/* New Challenge Button */}
            <button
              onClick={startNewChat}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-[#ECE8DF]/80 dark:bg-[#282624]/80 border border-[#DFDAD0] dark:border-[#383532] text-xs font-medium text-[#1C1B19] dark:text-[#EDEDEB] hover:bg-white dark:hover:bg-[#33302C] transition-all shadow-2xs group cursor-pointer"
            >
              <span className="font-medium">New Challenge</span>
              <Plus className="w-3.5 h-3.5 text-neutral-400 group-hover:text-neutral-800 dark:group-hover:text-neutral-200 transition-colors" />
            </button>

            {/* Search History Filter */}
            <div className="relative w-full">
              <Search className="w-3 h-3 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type="search"
                name="sidebar-history-search-no-autofill"
                id="sidebar-history-search-input"
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck={false}
                data-form-type="other"
                data-1p-ignore="true"
                data-lpignore="true"
                data-bwignore="true"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder="Search history..."
                className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-[#ECE8DF]/40 dark:bg-[#242321]/40 border border-[#DFDAD0] dark:border-[#383532] text-xs text-[#1C1B19] dark:text-[#EDEDEB] placeholder-[#8C877D] dark:placeholder-[#6E6A63] outline-hidden"
              />
            </div>

            {/* Quick Links */}
            <div className="space-y-0.5 pt-1">
              <Link
                href="/problems"
                className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs text-[#524E48] dark:text-[#A8A49D] hover:text-[#1C1B19] dark:hover:text-white hover:bg-black/[0.03] dark:hover:bg-white/[0.04] transition-colors"
              >
                <FolderKanban className="w-3.5 h-3.5 opacity-70" />
                <span>All Problems</span>
              </Link>

              <button
                onClick={() => setActiveView(activeView === "settings" ? "chat" : "settings")}
                className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs transition-colors ${
                  activeView === "settings"
                    ? "bg-[#3A3733] text-white dark:bg-white dark:text-[#1C1B19] font-medium"
                    : "text-[#524E48] dark:text-[#A8A49D] hover:text-[#1C1B19] dark:hover:text-white hover:bg-black/[0.03] dark:hover:bg-white/[0.04]"
                }`}
              >
                <SettingsIcon className="w-3.5 h-3.5 opacity-70" />
                <span>Settings</span>
              </button>

              {session?.user && (
                <Link
                  href={currentUserId ? `/dashboard/${currentUserId}` : "/problems"}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs text-[#524E48] dark:text-[#A8A49D] hover:text-[#1C1B19] dark:hover:text-white hover:bg-black/[0.03] dark:hover:bg-white/[0.04] transition-colors"
                >
                  <BarChart3 className="w-3.5 h-3.5 opacity-70" />
                  <span>My Submissions</span>
                </Link>
              )}
            </div>

            {/* History Section */}
            <div className="space-y-2 pt-2 border-t border-[#E8E4DB] dark:border-[#2D2B28]">
              <div className="flex items-center justify-between text-[11px] text-[#8C877D] dark:text-[#6E6A63] font-semibold tracking-wider uppercase px-1">
                <span>Recent History</span>
                {userHistory.length > 0 && (
                  <button
                    onClick={clearHistory}
                    className="hover:text-neutral-900 dark:hover:text-white lowercase text-[10px] opacity-70"
                    title="Clear history"
                  >
                    clear
                  </button>
                )}
              </div>

              {filteredHistory.length === 0 ? (
                <div className="p-3 text-center text-xs text-[#8C877D] dark:text-[#6E6A63] space-y-1">
                  <p>No recent challenges</p>
                  <p className="text-[10px] opacity-70">Type below to generate your first problem.</p>
                </div>
              ) : (
                <div className="space-y-1 max-h-56 overflow-y-auto pr-1">
                  {filteredHistory.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => handleSend(item.title)}
                      className="w-full text-left p-2 rounded-lg hover:bg-black/[0.04] dark:hover:bg-white/[0.04] text-xs transition-colors group flex flex-col gap-0.5"
                    >
                      <div className="flex items-center justify-between text-[10px] text-neutral-400">
                        <span>{item.level || "Challenge"}</span>
                        <span>{item.time}</span>
                      </div>
                      <span className="text-[#3A3733] dark:text-[#C5C2BA] truncate font-medium group-hover:text-black dark:group-hover:text-white">
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
                        {msg.generatedProblem ? (
                          <div className="w-full">
                            <GammaProblemCanvas
                              problem={msg.generatedProblem}
                              onSolveInEditor={() => {
                                window.location.href = "/problem/c0000000-0000-0000-0000-000000000001";
                              }}
                            />
                          </div>
                        ) : msg.problemDetails ? (
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
                                href="/problem/c0000000-0000-0000-0000-000000000001"
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
                                  {typeof msg.problemDetails.examples === 'string' ? msg.problemDetails.examples : JSON.stringify(msg.problemDetails.examples, null, 2)}
                                </pre>
                              </div>
                            )}

                            {msg.problemDetails.constraints && (
                              <div className="mt-2 p-3 rounded-xl bg-black/[0.03] dark:bg-white/[0.03] text-xs font-mono space-y-1">
                                <div className="font-semibold text-neutral-800 dark:text-neutral-200">Constraints:</div>
                                <pre className="whitespace-pre-wrap text-neutral-600 dark:text-neutral-400">
                                  {Array.isArray(msg.problemDetails.constraints) ? msg.problemDetails.constraints.join('\n') : msg.problemDetails.constraints}
                                </pre>
                              </div>
                            )}
                          </div>
                        ) : (
                          <p className="whitespace-pre-line">{msg.content}</p>
                        )}

                        {!msg.generatedProblem && msg.codeSnippet && (
                          <div className="mt-4 rounded-xl bg-[#181716] p-3.5 border border-white/[0.08] text-xs font-mono text-neutral-200">
                            <div className="flex items-center justify-between pb-2 border-b border-white/[0.06] text-[11px] text-neutral-400 uppercase font-semibold">
                              <span>Starter Solution ({msg.codeSnippet.language})</span>
                              <button
                                onClick={() => copyText(msg.codeSnippet?.code || "", msg.id)}
                                className="flex items-center gap-1 hover:text-white transition-colors"
                              >
                                {copiedId === msg.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                                <span>{copiedId === msg.id ? "Copied" : "Copy"}</span>
                              </button>
                            </div>
                            <pre className="mt-2 overflow-x-auto p-1 leading-relaxed text-neutral-300">
                              {msg.codeSnippet.code}
                            </pre>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}

                  {isLoading && (
                    <div className="flex items-center gap-2 text-xs text-[#8C877D] dark:text-[#7A766F] p-3">
                      <Sparkles className="w-4 h-4 animate-spin text-neutral-400" />
                      <span>AI Problem Setter is generating your challenge using {activeModel}...</span>
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
                    
                    {/* IN-CHAT MODEL SELECTOR (Shows ONLY Available Models) */}
                    <div className="relative" ref={chatModelDropdownRef}>
                      <button
                        onClick={() => setShowChatModelDropdown(!showChatModelDropdown)}
                        className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-md border transition-colors ${
                          availableModelsList.length > 0
                            ? "border-black/[0.06] dark:border-white/[0.06] bg-black/[0.02] dark:bg-white/[0.03] hover:bg-black/[0.06] dark:hover:bg-white/[0.08] text-[#4A4640] dark:text-[#C5C2BA]"
                            : "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300 font-medium"
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${availableModelsList.length > 0 ? "bg-emerald-500" : "bg-amber-500"}`} />
                        <span className="font-mono text-[11px]">
                          {activeModel || "No API Key Added"}
                        </span>
                        <ChevronDown className="w-2.5 h-2.5 opacity-60" />
                      </button>

                      {showChatModelDropdown && (
                        <div className={`absolute ${messages.length === 0 ? "top-full mt-2" : "bottom-full mb-2"} left-0 w-72 max-h-60 overflow-y-auto bg-white dark:bg-[#252321] border border-[#E8E4DB] dark:border-[#383531] rounded-xl shadow-2xl py-1 z-50 text-xs font-mono`}>
                          
                          {availableModelsList.length === 0 ? (
                            <div className="p-4 text-center space-y-2.5 font-sans">
                              <AlertCircle className="w-5 h-5 mx-auto text-amber-500 opacity-80" />
                              <div className="space-y-1">
                                <p className="font-semibold text-neutral-900 dark:text-white text-xs">
                                  No Active Models
                                </p>
                                <p className="text-[11px] text-neutral-500 leading-relaxed">
                                  Add an API key in Settings to activate your models.
                                </p>
                              </div>
                              <button
                                onClick={() => {
                                  setShowChatModelDropdown(false);
                                  setActiveView("settings");
                                }}
                                className="w-full py-1.5 px-3 rounded-lg bg-[#3A3733] text-white dark:bg-white dark:text-[#1C1B19] text-xs font-semibold hover:opacity-90 transition-opacity"
                              >
                                Configure API Keys in Settings →
                              </button>
                            </div>
                          ) : (
                            <>
                              <div className="p-2 border-b border-black/[0.04] dark:border-white/[0.04]">
                                <input
                                  type="search"
                                  name="in-chat-model-search-filter"
                                  autoComplete="off"
                                  autoCorrect="off"
                                  autoCapitalize="off"
                                  spellCheck={false}
                                  data-form-type="other"
                                  data-1p-ignore="true"
                                  data-lpignore="true"
                                  data-bwignore="true"
                                  value={modelDropdownSearch}
                                  onChange={(e) => setModelDropdownSearch(e.target.value)}
                                  placeholder="Search available models..."
                                  className="w-full px-2.5 py-1 text-xs rounded-md bg-black/[0.03] dark:bg-white/[0.04] border border-neutral-200 dark:border-neutral-700 outline-hidden font-sans"
                                  autoFocus
                                />
                              </div>

                              <div className="py-1">
                                {filteredDropdownModels.map((m) => (
                                  <button
                                    key={m.id}
                                    onClick={() => handleSelectModel(m)}
                                    className={`w-full text-left px-3 py-2 transition-colors flex items-center justify-between ${
                                      activeModel === m.id
                                        ? "bg-black/[0.05] dark:bg-white/[0.08] text-neutral-950 dark:text-white font-semibold"
                                        : "text-[#524E48] dark:text-[#A8A49D] hover:bg-black/[0.04] dark:hover:bg-white/[0.06]"
                                    }`}
                                  >
                                    <div className="flex items-center gap-2">
                                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                                      <div className="flex flex-col">
                                        <span className="truncate">{m.name}</span>
                                        <span className="text-[10px] font-sans opacity-60">{m.provider} • {m.badge}</span>
                                      </div>
                                    </div>
                                    {activeModel === m.id && <Check className="w-3.5 h-3.5" />}
                                  </button>
                                ))}
                              </div>

                              <div className="pt-1 mt-1 border-t border-black/[0.04] dark:border-white/[0.04] px-2 pb-1">
                                <button
                                  onClick={() => {
                                    setShowChatModelDropdown(false);
                                    setActiveView("settings");
                                  }}
                                  className="w-full text-center py-1.5 text-[11px] font-sans font-medium text-neutral-600 dark:text-neutral-300 hover:bg-black/[0.04] dark:hover:bg-white/[0.04] rounded-lg transition-colors"
                                >
                                  Add More Keys in Settings →
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Topic Selector (Optional) */}
                    <div className="relative" ref={topicDropdownRef}>
                      <button
                        onClick={() => setShowTopicDropdown(!showTopicDropdown)}
                        className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-md border transition-colors ${
                          selectedTopic
                            ? "border-neutral-700 dark:border-neutral-300 bg-neutral-900/10 dark:bg-white/10 text-neutral-900 dark:text-white font-medium"
                            : "border-black/[0.06] dark:border-white/[0.06] bg-black/[0.02] dark:bg-white/[0.03] hover:bg-black/[0.06] dark:hover:bg-white/[0.08] text-[#4A4640] dark:text-[#C5C2BA]"
                        }`}
                      >
                        <Layers className="w-3 h-3 opacity-60" />
                        <span>{selectedTopic || "Topic (Optional)"}</span>
                        {selectedTopic && (
                          <span
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedTopic("");
                            }}
                            className="ml-0.5 hover:text-red-500 transition-colors p-0.5 text-[10px]"
                            title="Clear topic filter"
                          >
                            ✕
                          </span>
                        )}
                        <ChevronDown className="w-2.5 h-2.5 opacity-60" />
                      </button>

                      {showTopicDropdown && (
                        <div className={`absolute ${messages.length === 0 ? "top-full mt-2" : "bottom-full mb-2"} left-0 w-52 max-h-56 overflow-y-auto bg-white dark:bg-[#252321] border border-[#E8E4DB] dark:border-[#383531] rounded-xl shadow-xl py-1 z-50 text-xs`}>
                          <button
                            onClick={() => {
                              setSelectedTopic("");
                              setShowTopicDropdown(false);
                            }}
                            className={`w-full text-left px-3 py-1.5 hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition-colors flex items-center justify-between ${
                              !selectedTopic ? "text-neutral-950 dark:text-white font-semibold bg-black/[0.03] dark:bg-white/[0.05]" : "text-[#524E48] dark:text-[#A8A49D]"
                            }`}
                          >
                            <span>Any / None (Default)</span>
                            {!selectedTopic && <Check className="w-3 h-3" />}
                          </button>
                          <div className="my-1 border-t border-black/[0.04] dark:border-white/[0.04]" />
                          {topicsList.map((t) => (
                            <button
                              key={t}
                              onClick={() => {
                                setSelectedTopic(t);
                                setShowTopicDropdown(false);
                              }}
                              className={`w-full text-left px-3 py-1.5 hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition-colors flex items-center justify-between ${
                                selectedTopic === t ? "text-neutral-950 dark:text-white font-semibold bg-black/[0.03] dark:bg-white/[0.05]" : "text-[#524E48] dark:text-[#A8A49D]"
                              }`}
                            >
                              <span>{t}</span>
                              {selectedTopic === t && <Check className="w-3 h-3" />}
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

                    {/* Online Toggle (Monochromatic Design) */}
                    <button
                      onClick={() => setIsOnlineEnabled(!isOnlineEnabled)}
                      className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-md border transition-all ${
                        isOnlineEnabled
                          ? "bg-[#3A3733] text-white dark:bg-white dark:text-[#1C1B19] border-transparent font-medium shadow-2xs"
                          : "border-black/[0.06] dark:border-white/[0.06] bg-black/[0.02] dark:bg-white/[0.03] text-[#7A756C] dark:text-[#8C8880] hover:text-[#1C1B19] dark:hover:text-white"
                      }`}
                      title={isOnlineEnabled ? "Web search enabled" : "Web search disabled"}
                    >
                      <Globe className="w-3.5 h-3.5 opacity-80" />
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
                      className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all flex items-center gap-1.5 ${
                        activeMode === label
                          ? "bg-[#3A3733] text-white dark:bg-white dark:text-[#1C1B19] border-transparent font-semibold shadow-2xs"
                          : "border-[#DFDAD0] dark:border-[#383532] bg-white/40 dark:bg-[#242321]/40 text-[#524E48] dark:text-[#A8A49D] hover:bg-white dark:hover:bg-[#2B2927]"
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{label}</span>
                    </button>
                  ))}
                </div>
              )}

              {/* COMMONLY SEARCHED & RELEVANT PROMPTS */}
              {messages.length === 0 && (
                <div className="w-full pt-4 border-t border-[#E8E4DB] dark:border-[#2D2B28] space-y-3">
                  <div className="flex items-center justify-between text-xs text-[#8C877D] dark:text-[#6E6A63] font-medium">
                    <span>Trending {activeMode} Prompts</span>
                    <span className="text-[11px] opacity-70">Click to run</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {promptSuggestions.map((suggestion) => (
                      <button
                        key={suggestion}
                        onClick={() => handleSend(suggestion)}
                        className="text-left p-3 rounded-xl border border-[#DFDAD0] dark:border-[#383532] bg-white/40 dark:bg-[#242321]/40 hover:bg-white/80 dark:hover:bg-[#282624] text-xs text-[#4A4640] dark:text-[#C5C2BA] hover:text-black dark:hover:text-white transition-all shadow-2xs leading-relaxed"
                      >
                        {suggestion}
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
