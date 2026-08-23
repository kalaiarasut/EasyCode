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
  Settings,
  ExternalLink,
  Square,
  ArrowUpRight,
  Plus,
  FileText,
  FileCode,
  File,
  X,
  UploadCloud,
  FileSpreadsheet,
  Image as ImageIcon,
  Music,
  ArrowDownToLine,
  CheckCheck,
  Terminal,
} from "lucide-react";
import { toast } from "sonner";
import axios from "axios";
import { ApiResponse } from "@/types/ApiResponse";
import Link from "next/link";
import { ProviderLogo } from "@/components/common/ProviderLogos";

interface ProblemPageAiTabProps {
  sourceCode: string;
  theme: string | undefined;
  problemInfo?: any;
  onSwitchTab?: (tab: string) => void;
  onApplyCode?: (code: string) => void;
}

interface ModelItem {
  id: string;
  name: string;
  provider: string;
  badge?: string;
  requiredKey: string;
  category?: string;
}

interface UploadedDoc {
  id: string;
  name: string;
  size: number;
  type: string;
  content?: string;
  isUploading?: boolean;
}

interface ChatMessage {
  id: string;
  input: string;
  output: string;
  modelUsed?: string;
  attachedDocs?: { name: string }[];
  isStreaming?: boolean;
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

// Model Thinking State Clusters from Claudionary (https://claudionary.com/)
const MODEL_STATE_CLUSTERS = {
  ingestion: ["Perusing", "Deciphering", "Inferring", "Parsing", "Dissecting", "Absorbing", "Surveying"],
  cognition: ["Pondering", "Cogitating", "Ruminating", "Contemplating", "Deliberating", "Mulling", "Philosophising"],
  fermentation: ["Brewing", "Simmering", "Marinating", "Percolating", "Caramelizing", "Baking", "Tempering"],
  synthesis: ["Synthesizing", "Architecting", "Wrangling", "Assembling", "Forging", "Crafting", "Harmonizing"],
  playful: ["Noodling", "Clauding", "Combobulating", "Quantumizing", "Tinkering", "Booping", "Flibbertigibbeting"],
  manifestation: ["Actualizing", "Manifesting", "Unfurling", "Actioning", "Accomplishing", "Beaming", "Polishing"],
};

const DOT_SEQUENCE = [".", "..", "...", "..", "."];

export default function ProblemPageAiTab({
  sourceCode,
  theme,
  problemInfo,
  onSwitchTab,
  onApplyCode,
}: ProblemPageAiTabProps) {
  const [selectedModel, setSelectedModel] = useState<string>("auto");
  const [showModelDropdown, setShowModelDropdown] = useState<boolean>(false);
  const [modelSearch, setModelSearch] = useState<string>("");
  const [apiKeys, setApiKeys] = useState<Record<string, string>>({});
  const [rateLimitedModels, setRateLimitedModels] = useState<Set<string>>(new Set());

  // Uploaded Documents State
  const [uploadedDocs, setUploadedDocs] = useState<UploadedDoc[]>([]);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const [chats, setChats] = useState<ChatMessage[]>([]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [inputValue, setInputValue] = useState<string>("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [appliedCodeId, setAppliedCodeId] = useState<string | null>(null);

  // Claude thinking state animation
  const [currentVerb, setCurrentVerb] = useState<string>("Thinking");
  const [dotIndex, setDotIndex] = useState<number>(0);
  const startTimeRef = useRef<number>(0);

  const scrollRef = useRef<HTMLDivElement>(null);
  const modelDropdownRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const dragCounterRef = useRef<number>(0);

  // Model-state sensitive verb updater: reflects cognitive state over elapsed generation time
  useEffect(() => {
    if (!isSubmitting) return;

    startTimeRef.current = Date.now();
    setCurrentVerb("Thinking");
    setDotIndex(0);

    const updateStateVerb = () => {
      const elapsedSec = (Date.now() - startTimeRef.current) / 1000;
      let cluster: string[];

      if (elapsedSec < 2.5) {
        cluster = MODEL_STATE_CLUSTERS.ingestion;
      } else if (elapsedSec < 5.5) {
        cluster = MODEL_STATE_CLUSTERS.cognition;
      } else if (elapsedSec < 9.0) {
        cluster = MODEL_STATE_CLUSTERS.fermentation;
      } else if (elapsedSec < 13.0) {
        cluster = MODEL_STATE_CLUSTERS.synthesis;
      } else if (elapsedSec < 17.0) {
        cluster = MODEL_STATE_CLUSTERS.playful;
      } else {
        cluster = MODEL_STATE_CLUSTERS.manifestation;
      }

      const randomVerb = cluster[Math.floor(Math.random() * cluster.length)];
      setCurrentVerb(randomVerb);
    };

    updateStateVerb();
    const phraseInterval = setInterval(updateStateVerb, 1600);

    const dotInterval = setInterval(() => {
      setDotIndex((prev) => (prev + 1) % DOT_SEQUENCE.length);
    }, 280);

    return () => {
      clearInterval(phraseInterval);
      clearInterval(dotInterval);
    };
  }, [isSubmitting]);

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

    const keyVal = apiKeys[model.requiredKey];
    if (keyVal && typeof keyVal === "string" && keyVal.trim().length > 5) {
      return true;
    }

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

  const currentModelMeta = useMemo(() => {
    if (selectedModel === "auto") return { name: "Auto", provider: "Platform", id: "auto" };
    const found = ALL_POSSIBLE_MODELS.find((m) => m.id === selectedModel);
    return found || { name: "Auto", provider: "Platform", id: "auto" };
  }, [selectedModel]);

  const getFileIcon = (fileName: string) => {
    const ext = fileName.split(".").pop()?.toLowerCase();
    if (["py", "cpp", "c", "java", "ts", "js", "go", "rs", "rb", "html", "css"].includes(ext || "")) {
      return FileCode;
    }
    if (["csv", "xlsx", "xls", "json"].includes(ext || "")) {
      return FileSpreadsheet;
    }
    return FileText;
  };

  const handleFiles = (files: FileList | File[]) => {
    const newDocs: UploadedDoc[] = [];

    Array.from(files).forEach((file) => {
      const docId = `doc-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      const reader = new FileReader();

      const newDoc: UploadedDoc = {
        id: docId,
        name: file.name,
        size: file.size,
        type: file.type,
        isUploading: true,
      };
      newDocs.push(newDoc);

      reader.onload = (e) => {
        const text = e.target?.result as string;
        setUploadedDocs((prev) =>
          prev.map((d) => (d.id === docId ? { ...d, content: text, isUploading: false } : d))
        );
      };
      reader.onerror = () => {
        setUploadedDocs((prev) => prev.map((d) => (d.id === docId ? { ...d, isUploading: false } : d)));
      };

      reader.readAsText(file);
    });

    setUploadedDocs((prev) => [...prev, ...newDocs]);
    toast.success(`Attached ${newDocs.length} file${newDocs.length > 1 ? "s" : ""}`);
  };

  const handleRemoveDoc = (id: string) => {
    setUploadedDocs((prev) => prev.filter((d) => d.id !== id));
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current += 1;
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current -= 1;
    if (dragCounterRef.current <= 0) {
      setIsDragging(false);
      dragCounterRef.current = 0;
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    dragCounterRef.current = 0;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
      e.dataTransfer.clearData();
    }
  };

  const handleSendMessage = async (userPrompt?: string) => {
    const text = userPrompt || inputValue;
    if (!text.trim() || isSubmitting) return;

    abortControllerRef.current = new AbortController();

    const messageId = Date.now().toString();
    const attachedFilesPayload = uploadedDocs.map((d) => ({
      name: d.name,
      content: d.content || "",
    }));

    let fullPrompt = text;
    if (attachedFilesPayload.length > 0) {
      fullPrompt +=
        "\n\nAttached Documents/Files:\n" +
        attachedFilesPayload.map((f) => `--- File: ${f.name} ---\n${f.content}\n--- End File ---`).join("\n\n");
    }

    const data = {
      inputMessage: fullPrompt,
      sourceCode: sourceCode || "",
      problemInfo: problemInfo || null,
      model: selectedModel,
      customKeys: apiKeys,
    };

    const currentAttached = uploadedDocs.map((d) => ({ name: d.name }));
    setInputValue("");
    setUploadedDocs([]);

    setChats((prev) => [
      ...prev,
      {
        id: messageId,
        input: text,
        output: "",
        modelUsed: selectedModel === "auto" ? "Analyzing..." : currentModelMeta.name,
        attachedDocs: currentAttached,
        isStreaming: true,
      },
    ]);
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/code/chat-output", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, stream: true }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        throw new Error("Failed to connect to AI engine");
      }

      if (response.body) {
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        let accumulatedText = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const dataStr = line.replace("data: ", "").trim();
              if (!dataStr) continue;

              try {
                const event = JSON.parse(dataStr);
                if (event.type === "thinking_stage" && event.verb) {
                  setCurrentVerb(event.verb);
                } else if (event.type === "chunk" && event.text) {
                  accumulatedText += event.text;
                  setChats((prev) => {
                    const newChats = [...prev];
                    const target = newChats.find((c) => c.id === messageId);
                    if (target) {
                      target.output = accumulatedText;
                    }
                    return [...newChats];
                  });
                } else if (event.type === "done") {
                  setChats((prev) => {
                    const newChats = [...prev];
                    const target = newChats.find((c) => c.id === messageId);
                    if (target) {
                      target.output = event.output || accumulatedText;
                      target.modelUsed = event.modelUsed || currentModelMeta.name;
                      target.isStreaming = false;
                    }
                    return [...newChats];
                  });
                }
              } catch (e) {}
            }
          }
        }
      }
    } catch (error: any) {
      if (error.name === "CanceledError" || error.name === "AbortError") {
        toast.info("Generation stopped");
        setChats((prev) => {
          const newChats = [...prev];
          const target = newChats.find((c) => c.id === messageId);
          if (target) {
            target.output = target.output
              ? `${target.output}\n\n*(Generation stopped)*`
              : "*(Generation stopped)*";
            target.modelUsed = "Canceled";
            target.isStreaming = false;
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
            target.isStreaming = false;
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

  const handleApplyCodeSnippet = (code: string, blockId: string) => {
    if (onApplyCode) {
      onApplyCode(code);
      setAppliedCodeId(blockId);
      setTimeout(() => setAppliedCodeId(null), 2500);
    } else {
      navigator.clipboard.writeText(code);
      toast.success("Code copied (ready to paste in editor)");
    }
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

  // Extract and render Markdown: ONLY code gets a dedicated Monaco Card, rest is free-flowing text
  const renderFormattedMessage = (content: string, messageId: string) => {
    const codeBlockRegex = /```([a-zA-Z0-9_-]*)\n([\s\S]*?)```/g;
    const parts: { type: "text" | "code"; lang?: string; code?: string; text?: string; id?: string }[] = [];
    let lastIndex = 0;
    let match: RegExpExecArray | null;
    let blockCount = 0;

    while ((match = codeBlockRegex.exec(content)) !== null) {
      if (match.index > lastIndex) {
        parts.push({
          type: "text",
          text: content.substring(lastIndex, match.index),
        });
      }
      blockCount++;
      parts.push({
        type: "code",
        lang: match[1] || "code",
        code: match[2].trim(),
        id: `${messageId}-block-${blockCount}`,
      });
      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < content.length) {
      parts.push({
        type: "text",
        text: content.substring(lastIndex),
      });
    }

    return (
      <div className="space-y-3 font-sans">
        {parts.map((part, idx) => {
          if (part.type === "code" && part.code) {
            const isApplied = appliedCodeId === part.id;
            const isCopied = copiedId === part.id;
            return (
              <div
                key={idx}
                className="rounded-xl overflow-hidden border border-black/[0.08] dark:border-white/[0.08] bg-[#161616] dark:bg-[#141414] text-neutral-200 shadow-sm my-3"
              >
                {/* Code Header with Tag on Left, Copy & Apply on Right */}
                <div className="h-8 px-3 bg-[#1e1e1e] dark:bg-[#1b1b1b] border-b border-white/[0.06] flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 font-mono text-[11px] text-neutral-400 font-medium">
                    <Terminal className="w-3.5 h-3.5 text-neutral-400" />
                    <span className="uppercase">{part.lang || "Code"}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleCopyText(part.code!, part.id!)}
                      className="flex items-center gap-1 text-[11px] text-neutral-400 hover:text-white transition-colors cursor-pointer"
                      title="Copy code to clipboard"
                    >
                      {isCopied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{isCopied ? "Copied" : "Copy"}</span>
                    </button>

                    {onApplyCode && (
                      <button
                        onClick={() => handleApplyCodeSnippet(part.code!, part.id!)}
                        className={`flex items-center gap-1 text-[11px] px-2 py-0.5 rounded transition-all cursor-pointer font-medium ${
                          isApplied
                            ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                            : "bg-white/10 hover:bg-white/20 text-white border border-white/10"
                        }`}
                        title="Insert code directly into Monaco Editor"
                      >
                        {isApplied ? (
                          <>
                            <CheckCheck className="w-3 h-3 text-emerald-400" />
                            <span>Applied</span>
                          </>
                        ) : (
                          <>
                            <ArrowDownToLine className="w-3 h-3" />
                            <span>Apply</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>

                {/* Monaco styled Code Body */}
                <pre
                  className="p-3.5 text-xs overflow-x-auto leading-relaxed text-neutral-200 select-text"
                  style={{
                    fontFamily: 'Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
                  }}
                >
                  <code>{part.code}</code>
                </pre>
              </div>
            );
          }

          // Clean Free-Flowing Prose (No box / card wrapper!)
          return (
            <div key={idx} className="space-y-2 text-sm leading-relaxed text-neutral-800 dark:text-neutral-200">
              {part.text?.split("\n").map((line, lineIdx) => {
                if (!line.trim()) return <div key={lineIdx} className="h-1.5" />;

                // Bullet item
                if (line.trim().startsWith("•") || line.trim().startsWith("- ") || line.trim().startsWith("* ")) {
                  const cleanText = line.trim().replace(/^[•\-\*]\s*/, "");
                  return (
                    <div key={lineIdx} className="flex items-start gap-2.5 pl-1 my-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-neutral-400 dark:bg-neutral-500 mt-2 shrink-0" />
                      <span className="flex-1">{formatInlineSpans(cleanText)}</span>
                    </div>
                  );
                }

                // Numbered item
                const numMatch = line.trim().match(/^(\d+)\.\s*(.+)/);
                if (numMatch) {
                  return (
                    <div key={lineIdx} className="flex items-start gap-2.5 pl-1 my-1">
                      <span className="font-mono text-xs font-semibold text-neutral-500 shrink-0 mt-0.5">
                        {numMatch[1]}.
                      </span>
                      <span className="flex-1">{formatInlineSpans(numMatch[2])}</span>
                    </div>
                  );
                }

                return <p key={lineIdx}>{formatInlineSpans(line)}</p>;
              })}
            </div>
          );
        })}
      </div>
    );
  };

  const formatInlineSpans = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*|`.*?`)/g);

    return parts.map((part, i) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return (
          <strong key={i} className="font-semibold text-neutral-950 dark:text-white">
            {part.slice(2, -2)}
          </strong>
        );
      }
      if (part.startsWith("`") && part.endsWith("`")) {
        return (
          <code
            key={i}
            className="px-1.5 py-0.5 mx-0.5 rounded bg-black/[0.05] dark:bg-white/[0.08] font-mono text-xs text-neutral-900 dark:text-neutral-100 border border-black/[0.04] dark:border-white/[0.06]"
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
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className="relative w-full h-full flex flex-col bg-white dark:bg-[#1a1a1a] text-neutral-900 dark:text-neutral-100 select-text overflow-hidden"
      style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif' }}
    >
      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) {
            handleFiles(e.target.files);
            e.target.value = "";
          }
        }}
      />

      {/* Drag & Drop Full Overlay Modal (Matching Image 2) */}
      {isDragging && (
        <div className="absolute inset-0 z-50 bg-white/90 dark:bg-[#161616]/95 backdrop-blur-xs flex items-center justify-center p-6 animate-in fade-in duration-150">
          <div className="w-full h-full rounded-2xl border-2 border-dashed border-neutral-400 dark:border-neutral-600 flex flex-col items-center justify-center text-center p-6 space-y-3 bg-black/[0.02] dark:bg-white/[0.02]">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-black/[0.05] dark:bg-white/[0.08] text-neutral-700 dark:text-neutral-200">
                <FileText className="w-6 h-6" />
              </div>
              <div className="p-3 rounded-xl bg-black/[0.05] dark:bg-white/[0.08] text-neutral-700 dark:text-neutral-200">
                <ImageIcon className="w-6 h-6" />
              </div>
              <div className="p-3 rounded-xl bg-black/[0.05] dark:bg-white/[0.08] text-neutral-700 dark:text-neutral-200">
                <FileCode className="w-6 h-6" />
              </div>
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-semibold text-neutral-900 dark:text-white">
                Drag & drop files to upload
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                or <span className="underline cursor-pointer">browse file</span> on your computer
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Top Model Switcher & Control Bar with Company Logos */}
      <div className="h-10 px-3 border-b border-black/[0.06] dark:border-white/[0.06] flex items-center justify-between bg-black/[0.02] dark:bg-white/[0.02] shrink-0">
        {/* Model Selector Dropdown with Provider Logo */}
        <div className="relative" ref={modelDropdownRef}>
          <button
            onClick={() => setShowModelDropdown((prev) => !prev)}
            className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-white dark:bg-[#201f1d] hover:bg-black/[0.04] dark:hover:bg-white/[0.06] border border-black/[0.08] dark:border-white/[0.1] text-xs font-medium text-neutral-800 dark:text-neutral-200 transition-all cursor-pointer shadow-2xs"
          >
            <ProviderLogo provider={currentModelMeta.provider} modelId={selectedModel} className="w-3.5 h-3.5 text-neutral-700 dark:text-neutral-300" />
            <span className="truncate max-w-[140px]">{currentModelMeta.name}</span>
            <ChevronDown className="w-3 h-3 opacity-60 ml-0.5" />
          </button>

          {/* Model Switcher Menu */}
          {showModelDropdown && (
            <div className="absolute left-0 top-full mt-1.5 w-72 rounded-xl bg-white dark:bg-[#222222] border border-neutral-200 dark:border-neutral-800 shadow-2xl z-50 overflow-hidden">
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

              <div className="max-h-60 overflow-y-auto p-1.5 space-y-0.5">
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
                  <div className="flex items-center gap-2 truncate">
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
                      <div className="flex items-center gap-2 truncate">
                        <ProviderLogo provider={m.provider} modelId={m.id} className="w-3.5 h-3.5 shrink-0 text-current" />
                        <span className="truncate">{m.name}</span>
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

        {/* Right Actions: Settings + Clear */}
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

      {/* Messages Scroll Area - Clean Flowing Conversation Stream (Like ChatGPT/Claude) */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-6 min-h-0">
        {chats.length === 0 && (
          <div className="space-y-4 pt-1">
            <div className="p-4 rounded-xl bg-black/[0.02] dark:bg-white/[0.02] border border-black/[0.06] dark:border-white/[0.06] space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-neutral-900 dark:text-white">
                <Sparkles className="w-3.5 h-3.5 text-neutral-600 dark:text-neutral-300" />
                <span>Pair Programmer</span>
              </div>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                Ready to assist with <strong className="text-neutral-900 dark:text-neutral-200">{problemInfo?.title || "this problem"}</strong>. Ask questions about algorithmic patterns, request surgical hints, or inspect your Monaco Editor code in real-time.
              </p>
            </div>

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

        {chats.map((chat) => (
          <div key={chat.id} className="space-y-4">
            {/* User Message (ChatGPT/Claude Style Pill on Right) */}
            <div className="flex justify-end">
              <div className="max-w-[85%] rounded-3xl bg-[#F0EEE6] text-[#1C1B19] dark:bg-[#2A2826] dark:text-[#ECEAE4] px-4 py-2.5 text-sm leading-relaxed shadow-2xs space-y-1.5">
                {chat.attachedDocs && chat.attachedDocs.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pb-1">
                    {chat.attachedDocs.map((doc, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-black/10 dark:bg-white/10 text-[10px] font-mono"
                      >
                        <FileText className="w-3 h-3 opacity-70" />
                        <span>{doc.name}</span>
                      </span>
                    ))}
                  </div>
                )}
                <p className="whitespace-pre-line font-sans">{chat.input}</p>
              </div>
            </div>

            {/* AI Assistant Free-Flowing Response (No outer box / card container!) */}
            <div className="w-full text-left space-y-2 pt-1 pl-0.5">
              {chat.output ? (
                <div className="space-y-2">
                  {renderFormattedMessage(chat.output, chat.id)}

                  {/* Clean Bottom Actions & Model Badge */}
                  <div className="flex items-center justify-between pt-2 text-xs text-neutral-400">
                    <button
                      onClick={() => handleCopyText(chat.output, chat.id)}
                      className="flex items-center gap-1 hover:text-neutral-800 dark:hover:text-neutral-200 transition-colors cursor-pointer text-[11px]"
                    >
                      {copiedId === chat.id ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedId === chat.id ? "Copied" : "Copy"}</span>
                    </button>

                    {chat.modelUsed && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-black/[0.04] dark:bg-white/[0.06] text-neutral-500 dark:text-neutral-400 border border-black/[0.04] dark:border-white/[0.05]">
                        {chat.modelUsed}
                      </span>
                    )}
                  </div>
                </div>
              ) : (
                /* Claude-Style Spinner Verbs & Cycling Dots Animation (from Claudionary) */
                <div className="flex items-center justify-between py-2 text-neutral-500 dark:text-neutral-400 animate-in fade-in duration-200">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-500 dark:text-amber-400 animate-pulse shrink-0" />
                    <div className="flex items-center italic text-xs font-mono font-medium text-neutral-800 dark:text-neutral-200 select-none">
                      <span>{currentVerb}</span>
                      <span className="text-amber-600 dark:text-amber-400 font-bold tracking-widest ml-0.5 inline-block min-w-[20px] text-left">{DOT_SEQUENCE[dotIndex]}</span>
                    </div>
                  </div>

                  <button
                    onClick={handleCancelGeneration}
                    className="flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-500/20 transition-colors cursor-pointer"
                  >
                    <Square className="w-2.5 h-2.5 fill-current" />
                    <span>Cancel</span>
                  </button>
                </div>
              )}
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

      {/* Input Dock Area (Matching Image 1 with document chips & + button) */}
      <div className="p-3 border-t border-black/[0.06] dark:border-white/[0.06] bg-black/[0.01] dark:bg-white/[0.01]">
        <div className="relative rounded-2xl border border-neutral-300 dark:border-neutral-700/80 bg-white dark:bg-[#151515] focus-within:border-neutral-500 dark:focus-within:border-neutral-500 transition-colors p-2.5 shadow-2xs space-y-2">
          
          {/* Uploaded Document Chips (Matching Image 1) */}
          {uploadedDocs.length > 0 && (
            <div className="flex items-center gap-1.5 flex-wrap pb-1 border-b border-black/[0.04] dark:border-white/[0.04]">
              {uploadedDocs.map((doc) => {
                const Icon = getFileIcon(doc.name);
                return (
                  <div
                    key={doc.id}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/[0.04] dark:bg-white/[0.06] border border-black/[0.06] dark:border-white/[0.08] text-xs font-medium text-neutral-800 dark:text-neutral-200 animate-in fade-in"
                  >
                    {doc.isUploading ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-neutral-500" />
                    ) : (
                      <Icon className="w-3.5 h-3.5 text-neutral-500 dark:text-neutral-400" />
                    )}
                    <span className="truncate max-w-[130px]">{doc.name}</span>
                    <button
                      onClick={() => handleRemoveDoc(doc.id)}
                      className="p-0.5 rounded hover:bg-black/10 dark:hover:bg-white/10 text-neutral-400 hover:text-neutral-700 dark:hover:text-white transition-colors cursor-pointer"
                      title="Remove file"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {/* Prompt Textarea */}
          <textarea
            ref={textareaRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask a question, request code feedback, or debug logic..."
            className="w-full bg-transparent resize-none outline-hidden text-xs leading-relaxed min-h-[44px] max-h-[120px] text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500 font-sans"
            rows={2}
          />

          {/* Bottom Controls: Plus (+) Button on Left, Send/Stop on Right */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-7 h-7 rounded-lg border border-black/[0.08] dark:border-white/[0.1] bg-black/[0.02] dark:bg-white/[0.04] hover:bg-black/[0.06] dark:hover:bg-white/[0.08] text-neutral-700 dark:text-neutral-300 flex items-center justify-center transition-colors cursor-pointer"
                title="Attach documents, code files, or data"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="flex items-center gap-2">
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
                  disabled={!inputValue.trim() && uploadedDocs.length === 0}
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
    </div>
  );
}
