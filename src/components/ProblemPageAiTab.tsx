"use client";

import React, { useEffect, useRef, useState, useMemo } from "react";
import {
  Loader2,
  SendHorizontal,
  Sparkles,
  Zap,
  Code2,
  Lightbulb,
  Bug,
  HelpCircle,
  Clock,
  RotateCcw,
  Check,
  Copy,
  ChevronDown,
  Search,
  Bot,
  Settings,
  ExternalLink,
  Square,
  ArrowUpRight,
  Terminal,
} from "lucide-react";
import { toast } from "sonner";
import axios from "axios";
import { ApiResponse } from "@/types/ApiResponse";
import Link from "next/link";

interface ProblemPageAiTabProps {
  sourceCode: string;
  theme: string | undefined;
  problemInfo?: any;
  onSwitchTab?: (tab: string) => void;
}

interface ModelItem {
  id: string;
  name: string;
  provider: string;
  badge?: string;
  requiredKey: string;
  category?: string;
}

interface ChatMessage {
  id: string;
  input: string;
  output: string;
  modelUsed?: string;
}

const ALL_POSSIBLE_MODELS: ModelItem[] = [
  // 1. Google DeepMind
  { id: "gemini-2.5-flash", name: "Gemini 2.5 Flash", provider: "Google", badge: "Fast", requiredKey: "gemini", category: "Frontier" },
  { id: "gemini-2.5-pro", name: "Gemini 2.5 Pro", provider: "Google", badge: "Advanced", requiredKey: "gemini", category: "Frontier" },
  { id: "gemini-2.0-flash-thinking", name: "Gemini 2.0 Flash Thinking", provider: "Google", badge: "Reasoning", requiredKey: "gemini", category: "Reasoning" },
  { id: "gemini-2.0-flash", name: "Gemini 2.0 Flash", provider: "Google", badge: "Speed", requiredKey: "gemini", category: "Speed" },
  { id: "gemini-1.5-pro", name: "Gemini 1.5 Pro", provider: "Google", badge: "2M Context", requiredKey: "gemini", category: "Frontier" },

  // 2. Anthropic
  { id: "claude-3.7-sonnet", name: "Claude 3.7 Sonnet", provider: "Anthropic", badge: "Coding SOTA", requiredKey: "anthropic", category: "Coding" },
  { id: "claude-3.5-sonnet", name: "Claude 3.5 Sonnet", provider: "Anthropic", badge: "Top Coder", requiredKey: "anthropic", category: "Coding" },
  { id: "claude-3.5-haiku", name: "Claude 3.5 Haiku", provider: "Anthropic", badge: "Fast", requiredKey: "anthropic", category: "Speed" },
  { id: "claude-3-opus", name: "Claude 3 Opus", provider: "Anthropic", badge: "Deep", requiredKey: "anthropic", category: "Frontier" },

  // 3. OpenAI
  { id: "o3-mini", name: "o3-mini", provider: "OpenAI", badge: "STEM SOTA", requiredKey: "openai", category: "Reasoning" },
  { id: "o1", name: "o1", provider: "OpenAI", badge: "Reasoning", requiredKey: "openai", category: "Reasoning" },
  { id: "o1-mini", name: "o1-mini", provider: "OpenAI", badge: "Math", requiredKey: "openai", category: "Reasoning" },
  { id: "gpt-4o", name: "GPT-4o", provider: "OpenAI", badge: "Flagship", requiredKey: "openai", category: "Frontier" },
  { id: "gpt-4o-mini", name: "GPT-4o mini", provider: "OpenAI", badge: "Fast", requiredKey: "openai", category: "Speed" },

  // 4. DeepSeek
  { id: "deepseek-r1", name: "DeepSeek R1", provider: "DeepSeek", badge: "Reasoning SOTA", requiredKey: "deepseek", category: "Reasoning" },
  { id: "deepseek-v3", name: "DeepSeek V3", provider: "DeepSeek", badge: "671B MoE", requiredKey: "deepseek", category: "Coding" },
  { id: "deepseek-coder-v2", name: "DeepSeek Coder V2", provider: "DeepSeek", badge: "Code", requiredKey: "deepseek", category: "Coding" },

  // 5. Groq
  { id: "groq-llama-3.3-70b", name: "Llama 3.3 70B (Groq)", provider: "Groq", badge: "Ultra Fast", requiredKey: "groq", category: "Speed" },
  { id: "groq-deepseek-r1-llama-70b", name: "DeepSeek R1 70B (Groq)", provider: "Groq", badge: "Instant CoT", requiredKey: "groq", category: "Reasoning" },
  { id: "groq-qwen-2.5-coder-32b", name: "Qwen 2.5 Coder (Groq)", provider: "Groq", badge: "Fast Coder", requiredKey: "groq", category: "Speed" },

  // 6. Moonshot AI (Kimi)
  { id: "kimi-latest", name: "Kimi Latest", provider: "Moonshot AI", badge: "128k Context", requiredKey: "kimi", category: "Reasoning" },
  { id: "moonshot-v1-32k", name: "Moonshot v1 32k", provider: "Moonshot AI", badge: "Fast", requiredKey: "kimi", category: "Reasoning" },

  // 7. Alibaba Cloud (Qwen)
  { id: "qwen-2.5-coder-32b", name: "Qwen 2.5 Coder 32B", provider: "Alibaba Cloud", badge: "Open Champion", requiredKey: "qwen", category: "Coding" },
  { id: "qwq-32b-preview", name: "QwQ 32B Preview", provider: "Alibaba Cloud", badge: "Math & CoT", requiredKey: "qwen", category: "Reasoning" },

  // 8. Mistral AI
  { id: "codestral-latest", name: "Codestral 22B", provider: "Mistral AI", badge: "Code Specialist", requiredKey: "mistral", category: "Coding" },
  { id: "mistral-large", name: "Mistral Large", provider: "Mistral AI", badge: "123B Flagship", requiredKey: "mistral", category: "Frontier" },

  // 9. xAI (Grok)
  { id: "grok-2", name: "Grok 2", provider: "xAI", badge: "Flagship", requiredKey: "grok", category: "Frontier" },
  { id: "grok-2-mini", name: "Grok 2 mini", provider: "xAI", badge: "Fast", requiredKey: "grok", category: "Speed" },

  // 10. Cerebras & SambaNova
  { id: "cerebras-llama-3.3-70b", name: "Llama 3.3 70B (Cerebras)", provider: "Cerebras", badge: "Fast", requiredKey: "cerebras", category: "Speed" },
  { id: "sambanova-deepseek-r1", name: "DeepSeek R1 (SambaNova)", provider: "SambaNova", badge: "Fast CoT", requiredKey: "sambanova", category: "Speed" },

  // 11. Perplexity & Cohere
  { id: "sonar-reasoning-pro", name: "Sonar Reasoning Pro", provider: "Perplexity", badge: "Live Search", requiredKey: "perplexity", category: "Search" },
  { id: "command-r-plus", name: "Command R+", provider: "Cohere", badge: "Enterprise", requiredKey: "cohere", category: "Frontier" },

  // 12. Local Ollama
  { id: "ollama-local", name: "Local Ollama Host", provider: "Local", badge: "100% Private", requiredKey: "ollamaUrl", category: "Local" },
];

export default function ProblemPageAiTab({
  sourceCode,
  theme,
  problemInfo,
  onSwitchTab,
}: ProblemPageAiTabProps) {
  const [selectedModel, setSelectedModel] = useState<string>("auto");
  const [showModelDropdown, setShowModelDropdown] = useState<boolean>(false);
  const [modelSearch, setModelSearch] = useState<string>("");
  const [apiKeys, setApiKeys] = useState<Record<string, string>>({});
  const [rateLimitedModels, setRateLimitedModels] = useState<Set<string>>(new Set());

  const [chats, setChats] = useState<ChatMessage[]>([]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [inputValue, setInputValue] = useState<string>("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  const modelDropdownRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Load custom API keys from localStorage
  useEffect(() => {
    try {
      const savedKeys = localStorage.getItem("easycode_custom_keys");
      if (savedKeys) {
        setApiKeys(JSON.parse(savedKeys));
      }
    } catch (e) {}
  }, []);

  // Helper: Is a model available based strictly on valid saved key and rate limit?
  const isModelValidAndAvailable = (model: ModelItem): boolean => {
    if (rateLimitedModels.has(model.id)) return false;
    if (!model.requiredKey) return false;

    // Check if user has entered key in custom keys
    const keyVal = apiKeys[model.requiredKey];
    if (keyVal && typeof keyVal === "string" && keyVal.trim().length > 5) {
      return true;
    }

    // Default fallback available models if Gemini key is available in env
    if (model.requiredKey === "gemini") {
      return true;
    }

    return false;
  };

  // Filter ONLY available models with valid saved keys that haven't hit rate limits
  const availableModels = useMemo(() => {
    return ALL_POSSIBLE_MODELS.filter((m) => isModelValidAndAvailable(m));
  }, [apiKeys, rateLimitedModels]);

  // Close model dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (modelDropdownRef.current && !modelDropdownRef.current.contains(e.target as Node)) {
        setShowModelDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const featureCards = [
    {
      title: "Explain Intuition",
      description: "Understand the core pattern, mathematical invariant, and state logic.",
      icon: Lightbulb,
      prompt: "Explain the optimal algorithmic approach and intuition for this problem without giving the full code.",
    },
    {
      title: "Debug Editor Code",
      description: "Inspect active Monaco code for syntax, bounds, and off-by-one bugs.",
      icon: Bug,
      prompt: "Review my current code in the editor. Are there any syntax errors, off-by-one mistakes, or edge cases it fails?",
    },
    {
      title: "Progressive Hint",
      description: "Get surgical guidance to solve the challenge without spoilers.",
      icon: HelpCircle,
      prompt: "Give me a progressive hint to guide my solution step-by-step.",
    },
    {
      title: "Big-O & Limits",
      description: "Analyze time and space complexity against strict constraints.",
      icon: Clock,
      prompt: "Analyze the time and space complexity of my approach versus the optimal solution.",
    },
  ];

  const filteredModels = useMemo(() => {
    if (!modelSearch.trim()) return availableModels;
    const q = modelSearch.toLowerCase();
    return availableModels.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        m.provider.toLowerCase().includes(q) ||
        (m.category && m.category.toLowerCase().includes(q))
    );
  }, [modelSearch, availableModels]);

  const currentModelDisplayName = useMemo(() => {
    if (selectedModel === "auto") return "Auto";
    const found = ALL_POSSIBLE_MODELS.find((m) => m.id === selectedModel);
    return found ? found.name : "Auto";
  }, [selectedModel]);

  const handleSendMessage = async (userPrompt?: string) => {
    const text = userPrompt || inputValue;
    if (!text.trim() || isSubmitting) return;

    // Create a new AbortController for cancelation
    abortControllerRef.current = new AbortController();

    const messageId = Date.now().toString();
    const data = {
      inputMessage: text,
      sourceCode: sourceCode || "",
      problemInfo: problemInfo || null,
      model: selectedModel,
      customKeys: apiKeys,
    };

    setInputValue("");
    setChats((prev) => [
      ...prev,
      {
        id: messageId,
        input: text,
        output: "",
        modelUsed: selectedModel === "auto" ? "Analyzing..." : currentModelDisplayName,
      },
    ]);
    setIsSubmitting(true);

    try {
      const result = await axios.post<
        ApiResponse & { isRateLimited?: boolean; rateLimitedModel?: string; modelUsed?: string }
      >("/api/code/chat-output", data, {
        signal: abortControllerRef.current.signal,
      });

      // If the backend detected a 429 rate limit
      if (result.data.isRateLimited && result.data.rateLimitedModel) {
        setRateLimitedModels((prev) => new Set([...prev, result.data.rateLimitedModel!]));
        toast.warning(`Model ${result.data.rateLimitedModel} reached rate limit. Falling back...`);
      }

      setChats((prev) => {
        const newChats = [...prev];
        const target = newChats.find((c) => c.id === messageId);
        if (target) {
          target.output = result.data.output || "I couldn't generate a response. Please try again.";
          target.modelUsed = result.data.modelUsed || currentModelDisplayName;
        }
        return [...newChats];
      });
    } catch (error: any) {
      if (axios.isCancel(error) || error.name === "CanceledError" || error.name === "AbortError") {
        toast.info("Generation stopped");
        setChats((prev) => {
          const newChats = [...prev];
          const target = newChats.find((c) => c.id === messageId);
          if (target) {
            target.output = target.output ? `${target.output}\n\n*(Generation stopped)*` : "*(Generation canceled)*";
            target.modelUsed = "Canceled";
          }
          return [...newChats];
        });
      } else {
        toast.error("Failed to connect to AI assistant");
        setChats((prev) => {
          const newChats = [...prev];
          const target = newChats.find((c) => c.id === messageId);
          if (target) {
            target.output = "Sorry, there was an error processing your request. Please check your API key settings.";
            target.modelUsed = "Fallback";
          }
          return [...newChats];
        });
      }
    } finally {
      setIsSubmitting(false);
      abortControllerRef.current = null;
    }
  };

  const handleCancelGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleCopyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClearChat = () => {
    setChats([]);
    toast.info("Conversation cleared");
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chats, isSubmitting]);

  // Clean Markdown Renderer for Responses
  const renderFormattedMessage = (content: string) => {
    const lines = content.split("\n");

    return (
      <div className="space-y-2 text-xs leading-relaxed text-neutral-800 dark:text-neutral-200">
        {lines.map((line, idx) => {
          if (!line.trim()) {
            return <div key={idx} className="h-1.5" />;
          }

          // Bullet item
          if (line.trim().startsWith("•") || line.trim().startsWith("- ") || line.trim().startsWith("* ")) {
            const cleanText = line.trim().replace(/^[•\-\*]\s*/, "");
            return (
              <div key={idx} className="flex items-start gap-2 pl-1">
                <span className="w-1.5 h-1.5 rounded-full bg-neutral-400 dark:bg-neutral-500 mt-1.5 shrink-0" />
                <span className="flex-1">{formatInlineSpans(cleanText)}</span>
              </div>
            );
          }

          // Numbered item
          const numMatch = line.trim().match(/^(\d+)\.\s*(.+)/);
          if (numMatch) {
            return (
              <div key={idx} className="flex items-start gap-2 pl-1">
                <span className="font-mono text-[11px] font-semibold text-neutral-500 shrink-0">
                  {numMatch[1]}.
                </span>
                <span className="flex-1">{formatInlineSpans(numMatch[2])}</span>
              </div>
            );
          }

          return <p key={idx}>{formatInlineSpans(line)}</p>;
        })}
      </div>
    );
  };

  // Inline formatter for bold **bold** and code `code`
  const formatInlineSpans = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*|`.*?`)/g);

    return parts.map((part, i) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return (
          <strong key={i} className="font-semibold text-neutral-900 dark:text-neutral-100">
            {part.slice(2, -2)}
          </strong>
        );
      }
      if (part.startsWith("`") && part.endsWith("`")) {
        return (
          <code
            key={i}
            className="px-1.5 py-0.5 mx-0.5 rounded bg-black/[0.05] dark:bg-white/[0.08] font-mono text-[11px] text-neutral-900 dark:text-neutral-100 border border-black/[0.04] dark:border-white/[0.06]"
          >
            {part.slice(1, -1)}
          </code>
        );
      }
      return <React.Fragment key={i}>{part}</React.Fragment>;
    });
  };

  return (
    <div
      className="w-full h-full flex flex-col bg-white dark:bg-[#1a1a1a] text-neutral-900 dark:text-neutral-100 select-text overflow-hidden"
      style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif' }}
    >
      {/* Top Model Switcher & Control Bar */}
      <div className="h-10 px-3 border-b border-black/[0.06] dark:border-white/[0.06] flex items-center justify-between bg-black/[0.02] dark:bg-white/[0.02] shrink-0">
        {/* Model Selector Dropdown */}
        <div className="relative" ref={modelDropdownRef}>
          <button
            onClick={() => setShowModelDropdown((prev) => !prev)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-black/[0.04] dark:bg-white/[0.06] hover:bg-black/[0.08] dark:hover:bg-white/[0.1] border border-black/[0.06] dark:border-white/[0.08] text-xs font-medium text-neutral-800 dark:text-neutral-200 transition-colors cursor-pointer"
          >
            {selectedModel === "auto" ? (
              <Sparkles className="w-3.5 h-3.5 text-neutral-600 dark:text-neutral-300" />
            ) : (
              <Bot className="w-3.5 h-3.5 text-neutral-500 dark:text-neutral-400" />
            )}
            <span className="truncate max-w-[140px]">{currentModelDisplayName}</span>
            <ChevronDown className="w-3 h-3 opacity-60 ml-0.5" />
          </button>

          {/* Model Switcher Menu */}
          {showModelDropdown && (
            <div className="absolute left-0 top-full mt-1.5 w-72 rounded-xl bg-white dark:bg-[#222222] border border-neutral-200 dark:border-neutral-800 shadow-2xl z-50 overflow-hidden">
              {/* Search input */}
              <div className="p-2 border-b border-black/[0.06] dark:border-white/[0.06]">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-neutral-400" />
                  <input
                    type="text"
                    value={modelSearch}
                    onChange={(e) => setModelSearch(e.target.value)}
                    placeholder="Search available models..."
                    className="w-full pl-8 pr-2.5 py-1.5 text-xs rounded-lg bg-black/[0.03] dark:bg-white/[0.04] border border-black/[0.05] dark:border-white/[0.06] outline-hidden text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400"
                    autoFocus
                  />
                </div>
              </div>

              {/* Models List */}
              <div className="max-h-60 overflow-y-auto p-1.5 space-y-0.5">
                {/* 1. Auto Option */}
                <button
                  onClick={() => {
                    setSelectedModel("auto");
                    setShowModelDropdown(false);
                    toast.success("Enabled Auto Smart Model Routing");
                  }}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                    selectedModel === "auto"
                      ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 font-medium"
                      : "hover:bg-black/[0.04] dark:hover:bg-white/[0.06] text-neutral-700 dark:text-neutral-300"
                  }`}
                >
                  <div className="flex items-center gap-1.5 truncate">
                    <Sparkles className="w-3.5 h-3.5 text-current opacity-80" />
                    <span className="font-semibold">Auto</span>
                    <span className="text-[10px] text-neutral-400 font-normal truncate">(Smart Prompt Routing)</span>
                  </div>
                  <span
                    className={`text-[9px] px-1.5 py-0.2 rounded font-mono ${
                      selectedModel === "auto"
                        ? "bg-white/20 dark:bg-black/20 text-current"
                        : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                    }`}
                  >
                    Recommended
                  </span>
                </button>

                {/* 2. Available Models */}
                {filteredModels.map((m) => {
                  const isSelected = m.id === selectedModel;
                  return (
                    <button
                      key={m.id}
                      onClick={() => {
                        setSelectedModel(m.id);
                        setShowModelDropdown(false);
                        toast.success(`Switched model to ${m.name}`);
                      }}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                        isSelected
                          ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 font-medium"
                          : "hover:bg-black/[0.04] dark:hover:bg-white/[0.06] text-neutral-700 dark:text-neutral-300"
                      }`}
                    >
                      <div className="flex items-center gap-1.5 truncate">
                        <span className="truncate">{m.name}</span>
                        {m.badge && (
                          <span
                            className={`text-[9px] px-1 py-0.2 rounded font-mono ${
                              isSelected
                                ? "bg-white/20 dark:bg-black/20 text-current"
                                : "bg-black/[0.04] dark:bg-white/[0.06] text-neutral-500"
                            }`}
                          >
                            {m.badge}
                          </span>
                        )}
                      </div>
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded font-mono shrink-0 ml-1.5 ${
                          isSelected
                            ? "bg-white/20 dark:bg-black/20 text-current"
                            : "bg-black/[0.04] dark:bg-white/[0.06] text-neutral-500"
                        }`}
                      >
                        {m.provider}
                      </span>
                    </button>
                  );
                })}

                {filteredModels.length === 0 && (
                  <div className="p-3 text-center space-y-1">
                    <p className="text-xs text-neutral-500">No additional configured models found</p>
                    <p className="text-[11px] text-neutral-400">Add API keys in Settings to unlock more frontier models.</p>
                  </div>
                )}
              </div>

              {/* Bottom Settings Link */}
              <div className="p-1.5 border-t border-black/[0.06] dark:border-white/[0.06] bg-black/[0.02] dark:bg-white/[0.02]">
                <Link
                  href="/workspace?view=settings"
                  target="_blank"
                  className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:bg-black/[0.05] dark:hover:bg-white/[0.06] transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <Settings className="w-3.5 h-3.5 text-neutral-500" />
                    <span>Configure API Keys in Settings</span>
                  </div>
                  <ExternalLink className="w-3 h-3 text-neutral-400" />
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Right Actions: Settings Shortcut + Clear Chat */}
        <div className="flex items-center gap-1">
          <Link
            href="/workspace?view=settings"
            target="_blank"
            className="flex items-center gap-1 text-[11px] text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 px-2 py-1 rounded hover:bg-black/[0.04] dark:hover:bg-white/[0.05] transition-colors cursor-pointer"
            title="Configure API Keys in Settings"
          >
            <Settings className="w-3 h-3" />
            <span className="hidden sm:inline">Settings</span>
          </Link>

          {chats.length > 0 && (
            <button
              onClick={handleClearChat}
              className="flex items-center gap-1 text-[11px] text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 px-2 py-1 rounded hover:bg-black/[0.04] dark:hover:bg-white/[0.05] transition-colors cursor-pointer"
              title="Clear Chat"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Clear</span>
            </button>
          )}
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
        {/* Special Welcome Grid when no chat history */}
        {chats.length === 0 && (
          <div className="space-y-4 pt-1">
            {/* Header greeting */}
            <div className="p-4 rounded-xl bg-black/[0.02] dark:bg-white/[0.02] border border-black/[0.06] dark:border-white/[0.06] space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-neutral-900 dark:text-white">
                <Sparkles className="w-3.5 h-3.5 text-neutral-600 dark:text-neutral-300" />
                <span>AI Pair Programmer</span>
              </div>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                Ready to assist with <strong className="text-neutral-900 dark:text-neutral-200">{problemInfo?.title || "this problem"}</strong>. Ask questions about algorithmic patterns, request surgical hints, or inspect your Monaco Editor code in real-time.
              </p>
            </div>

            {/* 4 Interactive Feature Tiles */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {featureCards.map((card, i) => {
                const Icon = card.icon;
                return (
                  <button
                    key={i}
                    onClick={() => handleSendMessage(card.prompt)}
                    className="p-3 text-left rounded-xl bg-black/[0.02] dark:bg-white/[0.02] hover:bg-black/[0.04] dark:hover:bg-white/[0.05] border border-black/[0.06] dark:border-white/[0.06] transition-all hover:scale-[1.01] cursor-pointer group flex flex-col justify-between space-y-2 shadow-2xs"
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-black/[0.04] dark:bg-white/[0.06] text-neutral-700 dark:text-neutral-300">
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-xs font-semibold text-neutral-900 dark:text-white group-hover:text-neutral-950 dark:group-hover:text-white">
                          {card.title}
                        </span>
                      </div>
                      <ArrowUpRight className="w-3.5 h-3.5 text-neutral-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <p className="text-[11px] text-neutral-500 dark:text-neutral-400 leading-snug">
                      {card.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Active Chat Messages */}
        {chats.map((chat) => (
          <div key={chat.id} className="space-y-2">
            {/* User Message Bubble */}
            <div className="flex justify-end">
              <div className="max-w-[85%] rounded-2xl rounded-tr-xs bg-neutral-900 text-white dark:bg-[#2c2b29] dark:text-neutral-100 px-3.5 py-2.5 text-xs leading-relaxed shadow-xs">
                <p className="whitespace-pre-line">{chat.input}</p>
              </div>
            </div>

            {/* AI Assistant Response Card */}
            <div className="flex justify-start">
              <div className="w-full max-w-[96%] rounded-2xl rounded-tl-xs bg-black/[0.02] dark:bg-white/[0.025] border border-black/[0.06] dark:border-white/[0.06] p-3.5 text-xs leading-relaxed space-y-2.5 shadow-2xs">
                <div className="flex items-center justify-between border-b border-black/[0.04] dark:border-white/[0.04] pb-1.5 text-[11px] text-neutral-500">
                  <div className="flex items-center gap-1.5 font-medium text-neutral-700 dark:text-neutral-300">
                    <Sparkles className="w-3 h-3 text-neutral-400" />
                    <span>AI Assistant</span>
                  </div>

                  {chat.output && (
                    <button
                      onClick={() => handleCopyText(chat.output, chat.id)}
                      className="flex items-center gap-1 hover:text-neutral-900 dark:hover:text-white transition-colors cursor-pointer text-neutral-400"
                    >
                      {copiedId === chat.id ? (
                        <Check className="w-3 h-3 text-emerald-500" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                      <span>{copiedId === chat.id ? "Copied" : "Copy"}</span>
                    </button>
                  )}
                </div>

                {chat.output ? (
                  <div className="space-y-2">
                    {renderFormattedMessage(chat.output)}

                    {/* Model Name Displayed at the Bottom Right */}
                    {chat.modelUsed && (
                      <div className="flex justify-end pt-1">
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-black/[0.04] dark:bg-white/[0.06] text-neutral-500 dark:text-neutral-400 border border-black/[0.04] dark:border-white/[0.05]">
                          {chat.modelUsed}
                        </span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center justify-between py-1 text-neutral-400">
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-neutral-500" />
                      <span className="text-[11px]">Generating response with {selectedModel === "auto" ? "Auto Router" : currentModelDisplayName}...</span>
                    </div>

                    {/* Cancel button during active generation */}
                    <button
                      onClick={handleCancelGeneration}
                      className="flex items-center gap-1 text-[11px] px-2 py-0.5 rounded bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-500/20 transition-colors cursor-pointer"
                    >
                      <Square className="w-2.5 h-2.5 fill-current" />
                      <span>Cancel</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Action Prompt Chips (when chats exist) */}
      {chats.length > 0 && (
        <div className="px-3 pt-2 pb-1 border-t border-black/[0.06] dark:border-white/[0.06] flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {featureCards.map((qp, i) => {
            const Icon = qp.icon;
            return (
              <button
                key={i}
                onClick={() => handleSendMessage(qp.prompt)}
                disabled={isSubmitting}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/[0.03] dark:bg-white/[0.04] hover:bg-black/[0.06] dark:hover:bg-white/[0.08] border border-black/[0.05] dark:border-white/[0.06] text-[11px] text-neutral-700 dark:text-neutral-300 font-medium whitespace-nowrap transition-colors cursor-pointer shrink-0 disabled:opacity-50"
              >
                <Icon className="w-3 h-3 opacity-70" />
                <span>{qp.title}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Input Dock */}
      <div className="p-3 border-t border-black/[0.06] dark:border-white/[0.06] bg-black/[0.01] dark:bg-white/[0.01]">
        <div className="relative rounded-xl border border-neutral-300 dark:border-neutral-700/80 bg-white dark:bg-[#151515] focus-within:border-neutral-500 dark:focus-within:border-neutral-500 transition-colors p-2.5 shadow-2xs">
          <textarea
            ref={textareaRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask a question or request code feedback..."
            className="w-full bg-transparent resize-none outline-hidden text-xs leading-relaxed min-h-[44px] max-h-[120px] text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500 font-sans"
            rows={2}
          />
          <div className="flex items-center justify-end pt-1">
            {isSubmitting ? (
              <button
                onClick={handleCancelGeneration}
                className="p-1.5 px-2.5 rounded-lg bg-red-600/10 text-red-600 hover:bg-red-600 hover:text-white dark:bg-red-500/20 dark:text-red-400 dark:hover:bg-red-500 dark:hover:text-white transition-all cursor-pointer flex items-center gap-1.5 text-xs font-medium shadow-xs"
                title="Stop generating response"
              >
                <Square className="w-3 h-3 fill-current" />
                <span>Stop</span>
              </button>
            ) : (
              <button
                onClick={() => handleSendMessage()}
                disabled={!inputValue.trim()}
                className="p-1.5 rounded-lg bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 hover:opacity-90 disabled:opacity-20 disabled:cursor-not-allowed transition-all cursor-pointer flex items-center justify-center shadow-xs"
                title="Send message"
              >
                <SendHorizontal className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
