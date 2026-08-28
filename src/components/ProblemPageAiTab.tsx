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
  Eye,
  EyeOff,
  Film,
  Network,
  Mic,
  Brain,
  Pencil,
} from "lucide-react";
import { toast } from "sonner";
import { ApiResponse } from "@/types/ApiResponse";
import Link from "next/link";
import { ProviderLogo } from "@/components/common/ProviderLogos";
import { computeLineDiff, DiffResult } from "@/utils/diffHelper";
import { ALL_VISUAL_ENGINES, VisualEngineItem } from "@/utils/mediaGenerator";
import { cleanModelName } from "@/utils/cleanModelName";
import { getAllModelsForProvider, getEnabledModelIds } from "@/utils/customModelRegistry";
import AudioRecordingVisualizer from "@/components/common/AudioRecordingVisualizer";
import AiMediaCard from "@/components/common/AiMediaCard";
import MermaidFlowchartViewer from "@/components/common/MermaidFlowchartViewer";
import SvgDiagramViewer from "@/components/common/SvgDiagramViewer";
import InlineMemoryModal, { MemoryInspectItem } from "@/components/common/InlineMemoryModal";
import ThinkingProcessBlock from "@/components/common/ThinkingProcessBlock";

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
  { id: "gemini-3.6-flash", name: "Gemini 3.6 Flash", provider: "Google", badge: "Flagship", requiredKey: "gemini", category: "Frontier" },
  { id: "gemini-3.5-flash", name: "Gemini 3.5 Flash", provider: "Google", badge: "Speed", requiredKey: "gemini", category: "Speed" },
  { id: "gemini-flash-latest", name: "Gemini Flash Latest", provider: "Google", badge: "Fast", requiredKey: "gemini", category: "Speed" },
  { id: "gemini-3.7-flash", name: "Gemini 3.7 Flash", provider: "Google", badge: "Hybrid CoT", requiredKey: "gemini", category: "Reasoning" },
  { id: "gemini-3.1-pro-preview", name: "Gemini 3.1 Pro", provider: "Google", badge: "2M Context", requiredKey: "gemini", category: "Frontier" },

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
  { id: "groq/compound", name: "Groq Compound (MoE)", provider: "Groq", badge: "Ultra Fast", requiredKey: "groq", category: "Speed" },
  { id: "groq/compound-mini", name: "Groq Compound Mini", provider: "Groq", badge: "Instant", requiredKey: "groq", category: "Speed" },
  { id: "qwen/qwen3.6-27b", name: "Qwen 3.6 27B", provider: "Groq", badge: "Deep CoT", requiredKey: "groq", category: "Reasoning" },
  { id: "openai/gpt-oss-120b", name: "GPT-OSS 120B", provider: "Groq", badge: "Flagship", requiredKey: "groq", category: "Frontier" },
  { id: "openai/gpt-oss-20b", name: "GPT-OSS 20B", provider: "Groq", badge: "Fast", requiredKey: "groq", category: "Speed" },
  { id: "allam-2-7b", name: "Allam 2 7B", provider: "Groq", badge: "Multilingual", requiredKey: "groq", category: "Speed" },

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
  { id: "cerebras-llama-3.3-70b", name: "Llama 3.3 70B", provider: "Cerebras", badge: "Fast", requiredKey: "cerebras", category: "Speed" },
  { id: "sambanova-deepseek-r1", name: "DeepSeek R1", provider: "SambaNova", badge: "Fast CoT", requiredKey: "sambanova", category: "Speed" },

  // 11. Perplexity & Cohere
  { id: "sonar-reasoning-pro", name: "Sonar Reasoning Pro", provider: "Perplexity", badge: "Live Search", requiredKey: "perplexity", category: "Search" },
  { id: "command-r-plus", name: "Command R+", provider: "Cohere", badge: "Enterprise", requiredKey: "cohere", category: "Frontier" },

  // 12. Cloudflare Workers AI Gateway
  { id: "@cf/meta/llama-3.3-70b-instruct", name: "Llama 3.3 70B", provider: "Cloudflare", badge: "Edge SOTA", requiredKey: "cloudflare", category: "Speed" },
  { id: "@cf/deepseek-ai/deepseek-r1-distill-qwen-32b", name: "DeepSeek R1 Distill 32B", provider: "Cloudflare", badge: "Reasoning", requiredKey: "cloudflare", category: "Reasoning" },
  { id: "@cf/qwen/qwen2.5-coder-32b-instruct", name: "Qwen 2.5 Coder 32B", provider: "Cloudflare", badge: "Coding", requiredKey: "cloudflare", category: "Coding" },
  { id: "@cf/meta/llama-3.1-8b-instruct", name: "Llama 3.1 8B", provider: "Cloudflare", badge: "Instant", requiredKey: "cloudflare", category: "Speed" },

  // 13. Hugging Face
  { id: "Qwen/Qwen2.5-Coder-32B-Instruct", name: "Qwen 2.5 Coder 32B", provider: "Hugging Face", badge: "Top Coder", requiredKey: "huggingface", category: "Coding" },
  { id: "meta-llama/Llama-3.3-70B-Instruct", name: "Llama 3.3 70B", provider: "Hugging Face", badge: "Open SOTA", requiredKey: "huggingface", category: "Frontier" },
  { id: "deepseek-ai/DeepSeek-R1", name: "DeepSeek R1", provider: "Hugging Face", badge: "Reasoning", requiredKey: "huggingface", category: "Reasoning" },

  // 14. Pollinations.ai
  { id: "pollinations-flux", name: "FLUX.1 Schnell", provider: "Pollinations.ai", badge: "Visual SOTA", requiredKey: "pollinations", category: "Universal" },
  { id: "pollinations-openai", name: "Pollinations Multimodal Chat", provider: "Pollinations.ai", badge: "Free Gateway", requiredKey: "pollinations", category: "Universal" },

  // 15. Local Ollama
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
  const [selectedModel, setSelectedModel] = useState<string>(() => {
    try {
      return typeof window !== "undefined" ? localStorage.getItem("easycode_last_active_model") || "auto" : "auto";
    } catch (e) {
      return "auto";
    }
  });

  // Floating Ask AI on Text Selection
  const [selectionTooltip, setSelectionTooltip] = useState<{
    visible: boolean;
    text: string;
    x: number;
    y: number;
  }>({ visible: false, text: "", x: 0, y: 0 });

  // Inline Memory Inspection Modal (Directly in chat space without forwarding to Settings)
  const [selectedMemoryToInspect, setSelectedMemoryToInspect] = useState<MemoryInspectItem | null>(null);
  const [showModelDropdown, setShowModelDropdown] = useState<boolean>(false);
  const [modelSearch, setModelSearch] = useState<string>("");
  const [apiKeys, setApiKeys] = useState<Record<string, string>>({});
  const [rateLimitedModels, setRateLimitedModels] = useState<Set<string>>(new Set());
  const [serverHostedKeys, setServerHostedKeys] = useState<Record<string, boolean>>({});

  // Visual / Media Engine State
  const [selectedVisualEngine, setSelectedVisualEngine] = useState<string>(() => {
    try {
      return localStorage.getItem("easycode_visual_engine") || "pollinations-flux";
    } catch (e) {
      return "pollinations-flux";
    }
  });
  const [showVisualEngineDropdown, setShowVisualEngineDropdown] = useState<boolean>(false);
  const [visualEngineSearch, setVisualEngineSearch] = useState<string>("");
  const visualEngineDropdownRef = useRef<HTMLDivElement>(null);

  const currentVisualEngineMeta = useMemo(() => {
    return ALL_VISUAL_ENGINES.find((e) => e.id === selectedVisualEngine) || ALL_VISUAL_ENGINES[0];
  }, [selectedVisualEngine]);

  const filteredVisualEngines = useMemo(() => {
    if (!visualEngineSearch.trim()) return ALL_VISUAL_ENGINES;
    const q = visualEngineSearch.toLowerCase();
    return ALL_VISUAL_ENGINES.filter(
      (e) =>
        e.name.toLowerCase().includes(q) ||
        e.id.toLowerCase().includes(q) ||
        e.provider.toLowerCase().includes(q) ||
        e.badge.toLowerCase().includes(q)
    );
  }, [visualEngineSearch]);

  useEffect(() => {
    fetch("/api/user/keys")
      .then((r) => r.json())
      .then((d) => {
        if (d.serverHostedKeys) setServerHostedKeys(d.serverHostedKeys);
      })
      .catch(() => {});
  }, []);

  // Uploaded Documents State
  const [uploadedDocs, setUploadedDocs] = useState<UploadedDoc[]>([]);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const [chats, setChats] = useState<ChatMessage[]>([]);
  const [editingChatId, setEditingChatId] = useState<string | null>(null);
  const [editingChatText, setEditingChatText] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [inputValue, setInputValue] = useState<string>("");
  const [isRecordingAudio, setIsRecordingAudio] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [appliedCodeId, setAppliedCodeId] = useState<string | null>(null);

  // Agent Mode State & Pending Diff Review
  const [isAgentMode, setIsAgentMode] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem("easycode_agent_mode");
      return saved !== null ? JSON.parse(saved) : true;
    } catch (e) {
      return true;
    }
  });
  const [pendingDiff, setPendingDiff] = useState<{
    id: string;
    code: string;
    language: string;
    diff: DiffResult;
    originalCode: string;
  } | null>(null);
  const [showDiffView, setShowDiffView] = useState<boolean>(false);

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

  // Load API Keys from Local Storage
  useEffect(() => {
    try {
      const savedKeys = localStorage.getItem("easycode_custom_keys");
      if (savedKeys) {
        setApiKeys(JSON.parse(savedKeys));
      }
    } catch (e) {}
  }, []);

  // Claudionary Model State Thinking Engine
  const [thinkingCluster, setThinkingCluster] = useState<string>("cognition");
  const [thinkingVerb, setThinkingVerb] = useState<string>("Analyzing");
  const [thinkingDotIdx, setThinkingDotIdx] = useState<number>(0);
  const [thinkingPhase, setThinkingPhase] = useState<"ingestion" | "reasoning" | "synthesis">("reasoning");

  // Dynamic Thinking Animation Cycle
  useEffect(() => {
    if (!isSubmitting) return;

    const dotInterval = setInterval(() => {
      setThinkingDotIdx((prev) => (prev + 1) % DOT_SEQUENCE.length);
    }, 400);

    const verbInterval = setInterval(() => {
      const verbs = MODEL_STATE_CLUSTERS[thinkingCluster as keyof typeof MODEL_STATE_CLUSTERS] || MODEL_STATE_CLUSTERS.cognition;
      const nextVerb = verbs[Math.floor(Math.random() * verbs.length)];
      setThinkingVerb(nextVerb);
    }, 1800);

    return () => {
      clearInterval(dotInterval);
      clearInterval(verbInterval);
    };
  }, [isSubmitting, thinkingCluster]);

  const [verifiedModelsByProvider, setVerifiedModelsByProvider] = useState<Record<string, string[]>>({});

  // Verify models dynamically against provider APIs
  useEffect(() => {
    if (Object.keys(apiKeys).length > 0) {
      fetch("/api/models/available", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customKeys: apiKeys }),
      })
        .then((r) => r.json())
        .then((data) => {
          if (data.success && data.availableByProvider) {
            setVerifiedModelsByProvider(data.availableByProvider);
          }
        })
        .catch(() => {});
    }
  }, [apiKeys]);

  // Floating Ask AI on Text Selection (Strictly inside chat viewport, NEVER in Settings or Inputs)
  useEffect(() => {
    const handleSelectionChange = () => {
      const selection = window.getSelection();
      if (!selection || selection.isCollapsed) {
        setSelectionTooltip((prev) => (prev.visible ? { ...prev, visible: false } : prev));
        return;
      }

      const text = selection.toString().trim();
      if (text.length < 3) {
        setSelectionTooltip((prev) => (prev.visible ? { ...prev, visible: false } : prev));
        return;
      }

      // 1. Ensure selection is strictly inside the active chat scroll viewport
      const anchorNode = selection.anchorNode;
      const focusNode = selection.focusNode;
      const container = scrollRef.current;
      if (!container || !anchorNode || !focusNode || !container.contains(anchorNode) || !container.contains(focusNode)) {
        setSelectionTooltip((prev) => (prev.visible ? { ...prev, visible: false } : prev));
        return;
      }

      // 2. Ignore if selection is inside an input, textarea, or button
      const parentEl = anchorNode.parentElement;
      if (parentEl?.closest("textarea, input, button, [data-no-ask-ai='true']")) {
        setSelectionTooltip((prev) => (prev.visible ? { ...prev, visible: false } : prev));
        return;
      }

      try {
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) return;

        setSelectionTooltip({
          visible: true,
          text,
          x: Math.max(80, Math.min(window.innerWidth - 80, rect.left + rect.width / 2)),
          y: Math.max(10, rect.top - 46),
        });
      } catch (e) {}
    };

    document.addEventListener("selectionchange", handleSelectionChange);
    return () => document.removeEventListener("selectionchange", handleSelectionChange);
  }, []);

  const handleQuoteSelection = (quotedText: string) => {
    const quote = `> "${quotedText}"\n\n`;
    setInputValue((prev) => (prev ? `${prev}\n\n${quote}` : quote));
    setSelectionTooltip({ visible: false, text: "", x: 0, y: 0 });
    window.getSelection()?.removeAllRanges();
    textareaRef.current?.focus();
    toast.success("Referenced selection in chat");
  };

  // Helper: Is a model available based strictly on valid saved key, verified status, and rate limit?
  const isModelValidAndAvailable = (model: ModelItem): boolean => {
    if (rateLimitedModels.has(model.id)) return false;
    if (!model.requiredKey) return false;

    const keyVal = apiKeys[model.requiredKey];
    const isHosted = Boolean(serverHostedKeys[model.requiredKey]);
    const hasValidKey = Boolean((keyVal && typeof keyVal === "string" && keyVal.trim().length > 5) || isHosted);
    if (!hasValidKey) {
      return false;
    }

    if (verifiedModelsByProvider[model.requiredKey]) {
      const activeList = verifiedModelsByProvider[model.requiredKey];
      if (activeList.length === 0) return false;
      if (model.requiredKey === "gemini") {
        const cleanId = model.id.replace("-exp", "").replace("-latest", "");
        return activeList.some((m) => m.includes(cleanId) || cleanId.includes(m) || m.includes("gemini"));
      }
    }

    return true;
  };

  const [modelsVersion, setModelsVersion] = useState(0);

  useEffect(() => {
    const handleUpdate = () => setModelsVersion((v) => v + 1);
    window.addEventListener("easycode_models_updated", handleUpdate);
    return () => window.removeEventListener("easycode_models_updated", handleUpdate);
  }, []);

  // Filter ONLY available models with valid saved keys that haven't hit rate limits
  const availableModels = useMemo(() => {
    const standardModels = ALL_POSSIBLE_MODELS.filter(
      (m) => m.requiredKey !== "cloudflare" && m.requiredKey !== "huggingface"
    ).filter((m) => isModelValidAndAvailable(m));

    const cfEnabledIds = getEnabledModelIds("cloudflare");
    const cfModels = getAllModelsForProvider("cloudflare")
      .filter((m) => cfEnabledIds.includes(m.id))
      .map((m) => ({
        id: m.id,
        name: m.name,
        provider: "Cloudflare",
        category: m.category,
        badge: m.badge,
        requiredKey: "cloudflare",
      }))
      .filter((m) => isModelValidAndAvailable(m));

    const hfEnabledIds = getEnabledModelIds("huggingface");
    const hfModels = getAllModelsForProvider("huggingface")
      .filter((m) => hfEnabledIds.includes(m.id))
      .map((m) => ({
        id: m.id,
        name: m.name,
        provider: "Hugging Face",
        category: m.category,
        badge: m.badge,
        requiredKey: "huggingface",
      }))
      .filter((m) => isModelValidAndAvailable(m));

    return [...standardModels, ...cfModels, ...hfModels];
  }, [apiKeys, serverHostedKeys, rateLimitedModels, verifiedModelsByProvider, modelsVersion]);

  // Close model dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (modelDropdownRef.current && !modelDropdownRef.current.contains(e.target as Node)) {
        setShowModelDropdown(false);
      }
      if (visualEngineDropdownRef.current && !visualEngineDropdownRef.current.contains(e.target as Node)) {
        setShowVisualEngineDropdown(false);
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

  const handleSaveEditedChat = (chatId: string) => {
    if (!editingChatText.trim() || isSubmitting) return;
    const chatIdx = chats.findIndex((c) => c.id === chatId);
    if (chatIdx === -1) return;

    // Reset / fork conversation history to this point (truncate all chats from chatIdx onwards)
    const trimmedChats = chats.slice(0, chatIdx);
    const newText = editingChatText;
    setEditingChatId(null);
    setEditingChatText("");

    handleSendMessage(newText, trimmedChats);
  };

  const handleSendMessage = async (userPrompt?: string, overrideChats?: ChatMessage[]) => {
    const text = userPrompt !== undefined ? userPrompt : inputValue;
    if (!text.trim() || isSubmitting) return;

    abortControllerRef.current = new AbortController();

    const baseChats = overrideChats !== undefined ? overrideChats : chats;
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

    let savedMemories: any[] = [];
    try {
      savedMemories = JSON.parse(localStorage.getItem("easycode_user_memories") || "[]");
    } catch (e) {}

    const conversationHistory = baseChats.flatMap((c) => [
      { role: "user", content: c.input },
      ...(c.output ? [{ role: "assistant", content: c.output }] : []),
    ]);

    const data = {
      inputMessage: fullPrompt,
      messages: conversationHistory,
      sourceCode: sourceCode || "",
      problemInfo: problemInfo || null,
      model: selectedModel,
      visualEngine: selectedVisualEngine,
      customKeys: apiKeys,
      memories: savedMemories,
    };

    const currentAttached = uploadedDocs.map((d) => ({ name: d.name }));
    setInputValue("");
    setUploadedDocs([]);

    setChats([
      ...baseChats,
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
    window.dispatchEvent(new CustomEvent("easycode-agent-status-change", {
      detail: { isGenerating: true, verb: "Thinking", isAgentMode },
    }));

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
                  window.dispatchEvent(new CustomEvent("easycode-agent-status-change", {
                    detail: { isGenerating: true, verb: event.verb, isAgentMode },
                  }));
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
                  const finalOutput = event.output || accumulatedText;
                  setChats((prev) => {
                    const newChats = [...prev];
                    const target = newChats.find((c) => c.id === messageId);
                    if (target) {
                      target.output = finalOutput;
                      target.modelUsed = event.modelUsed || currentModelMeta.name;
                      target.isStreaming = false;
                    }
                    return [...newChats];
                  });

                  // Detect code snippet from AI response
                  const codeBlockMatch = finalOutput.match(/```([a-zA-Z0-9_-]*)\n([\s\S]*?)```/);
                  if (codeBlockMatch) {
                    const extractedLang = codeBlockMatch[1] || "code";
                    const extractedCode = sanitizeLeetCodeSnippet(codeBlockMatch[2].trim());
                    const currentOriginalCode = sourceCodeRef.current || sourceCode || "";
                    const diff = computeLineDiff(currentOriginalCode, extractedCode);

                    if (diff.hasChanges) {
                      if (isAgentMode) {
                        // Directly apply to editor
                        if (onApplyCode) {
                          onApplyCode(extractedCode);
                          setAppliedCodeId(messageId);
                          toast.success(`⚡ Agent Mode: Applied changes (+${diff.additions} -${diff.deletions} lines) directly to editor!`);
                          window.dispatchEvent(new CustomEvent("easycode-agent-diff-applied", {
                            detail: {
                              addedLineIndices: diff.addedLineIndices,
                              additions: diff.additions,
                              deletions: diff.deletions,
                              oldCode: currentOriginalCode,
                              newCode: extractedCode,
                              diff: diff,
                            },
                          }));
                        }
                      } else {
                        // Propose diff review for user Accept/Reject
                        setPendingDiff({
                          id: messageId,
                          code: extractedCode,
                          language: extractedLang,
                          diff,
                          originalCode: currentOriginalCode,
                        });
                        toast.info(`Review Mode: Proposed changes (+${diff.additions} -${diff.deletions} lines). Review above input.`);
                      }
                    }
                  }
                  if (event.isRateLimited && event.rateLimitedModel) {
                    setRateLimitedModels((prev) => new Set([...prev, event.rateLimitedModel]));
                  }
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
        setChats((prev) => {
          const newChats = [...prev];
          const target = newChats.find((c) => c.id === messageId);
          if (target) {
            target.output = `❌ **Error**: \`${error?.message || "Failed to connect to AI assistant"}\`\n\n*Please check your API key and connection settings.*`;
            target.modelUsed = "Error";
            target.isStreaming = false;
          }
          return [...newChats];
        });
      }
    } finally {
      setIsSubmitting(false);
      abortControllerRef.current = null;
      window.dispatchEvent(new CustomEvent("easycode-agent-status-change", {
        detail: { isGenerating: false, isAgentMode },
      }));
    }
  };

  const sanitizeLeetCodeSnippet = (rawCode: string): string => {
    if (!rawCode) return "";
    let code = rawCode;
    // Strip if __name__ == "__main__": and following driver/verification block
    code = code.replace(/#\s*---\s*Verification[\s\S]*$/i, "");
    code = code.replace(/if\s+__name__\s*==\s*['"]__main__['"]\s*:[\s\S]*$/i, "");
    // Strip verbose parameter docstring blocks
    code = code.replace(/"""[\s\S]*?:param[\s\S]*?:return[\s\S]*?"""/g, "");
    code = code.replace(/'''[\s\S]*?:param[\s\S]*?:return[\s\S]*?'''/g, "");
    return code.trim();
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
    const cleanCode = sanitizeLeetCodeSnippet(code);
    if (onApplyCode) {
      onApplyCode(cleanCode);
      setAppliedCodeId(blockId);
      setTimeout(() => setAppliedCodeId(null), 2500);
    } else {
      navigator.clipboard.writeText(cleanCode);
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
            // Check for Mermaid Flowchart / Diagram
            if (part.lang?.toLowerCase() === "mermaid") {
              return (
                <MermaidFlowchartViewer
                  key={idx}
                  chart={part.code}
                  title="Algorithmic Decision Flowchart"
                />
              );
            }

            // Check for Enterprise SVG Vector Diagram
            if (
              part.lang?.toLowerCase() === "svg" ||
              part.lang?.toLowerCase() === "xml" ||
              part.code.trim().startsWith("<svg")
            ) {
              return (
                <SvgDiagramViewer
                  key={idx}
                  svgCode={part.code}
                  title="Vector Diagram"
                />
              );
            }

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

          // Clean Free-Flowing Prose with markdown and LaTeX math
          return renderProseBlock(part.text || "", idx);
        })}
      </div>
    );
  };
  const sourceCodeRef = useRef(sourceCode);
  useEffect(() => {
    sourceCodeRef.current = sourceCode;
  }, [sourceCode]);

  // Clean LaTeX and math markup in Ask AI responses
  const cleanAiLatexMath = (raw: string): string => {
    if (!raw) return "";
    return raw
      .replace(/\\mathcal\{O\}\(([^)]+)\)/g, "O($1)")
      .replace(/\\mathcal\{O\}/g, "O")
      .replace(/\\mathcal\{([^}]+)\}/g, "$1")
      .replace(/\\mathbb\{R\}/g, "R")
      .replace(/\\mathbb\{Z\}/g, "Z")
      .replace(/\\mathbb\{N\}/g, "N")
      .replace(/\\text\{([^}]+)\}/g, "$1")
      .replace(/\\mathrm\{([^}]+)\}/g, "$1")
      .replace(/\\mathbf\{([^}]+)\}/g, "$1")
      // Floor & Ceiling notation
      .replace(/\\lfloor\s*([\s\S]+?)\s*\\rfloor/g, "floor($1)")
      .replace(/\\lceil\s*([\s\S]+?)\s*\\rceil/g, "ceil($1)")
      .replace(/\\lfloor\b/g, "floor(")
      .replace(/\\rfloor\b/g, ")")
      .replace(/\\lceil\b/g, "ceil(")
      .replace(/\\rceil\b/g, ")")
      // Progressions & Dots
      .replace(/\\to\b|\\rightarrow\b|\\longrightarrow\b/g, "→")
      .replace(/\\leftarrow\b|\\longleftarrow\b/g, "←")
      .replace(/\\leftrightarrow\b/g, "↔")
      .replace(/\\dots\b|\\ldots\b|\\cdots\b/g, "...")
      // Logarithms & Subscripts
      .replace(/\\log_2\b/g, "log₂")
      .replace(/\\log_\{2\}\b/g, "log₂")
      .replace(/\\log_([0-9a-zA-Z])/g, "log_$1")
      .replace(/\\log_\{([^}]+)\}/g, "log_($1)")
      .replace(/\\log\b/g, "log")
      .replace(/\\ln\b/g, "ln")
      // Comparisons & Arithmetic
      .replace(/\\max\b/g, "max")
      .replace(/\\min\b/g, "min")
      .replace(/\\times\b/g, " * ")
      .replace(/\\cdot\b/g, " * ")
      .replace(/\\div\b/g, " / ")
      .replace(/\\le\b|\\leq\b/g, "<=")
      .replace(/\\ge\b|\\geq\b/g, ">=")
      .replace(/\\ne\b|\\neq\b/g, "!=")
      .replace(/\\in\b/g, "∈")
      .replace(/\\notin\b/g, "∉")
      .replace(/\\infty\b/g, "∞")
      .replace(/\\alpha\b/g, "alpha")
      .replace(/\\beta\b/g, "beta")
      .replace(/\\gamma\b/g, "gamma")
      .replace(/\\epsilon\b/g, "epsilon")
      .replace(/\\Delta\b/g, "delta")
      .replace(/\\approx\b/g, "≈")
      .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, "($1 / $2)")
      .replace(/\\sqrt\{([^}]+)\}/g, "sqrt($1)")
      .replace(/\\left[\[\(\{]/g, "(")
      .replace(/\\right[\]\)\}]/g, ")")
      .replace(/\\left|\\right/g, "")
      .replace(/\\quad\b|\\qquad\b/g, " ")
      .replace(/\\,|\\;|\\!/g, " ")
      .replace(/\\_/g, "_");
  };

  const cleanAiMathFormula = (math: string): string => {
    let cleaned = cleanAiLatexMath(math)
      .replace(/_\{([^}]+)\}/g, "[$1]")
      .replace(/_([a-zA-Z0-9])/g, "[$1]")
      .replace(/\^\{([^}]+)\}/g, "^$1")
      .trim();
    return `\`${cleaned}\``;
  };

  const formatInlineSpans = (text: string) => {
    let cleaned = cleanAiLatexMath(text);
    // Replace display and inline $...$ or $$...$$ with code formatted math
    cleaned = cleaned
      .replace(/\$\$([\s\S]+?)\$\$/g, (_, m) => cleanAiMathFormula(m))
      .replace(/\$([^$\n]+)\$/g, (_, m) => cleanAiMathFormula(m))
      .replace(/\\\(([\s\S]+?)\\\)/g, (_, m) => cleanAiMathFormula(m))
      .replace(/\\\[([\s\S]+?)\\\]/g, (_, m) => cleanAiMathFormula(m));

    // Also clean any leftover raw LaTeX tokens
    cleaned = cleanAiLatexMath(cleaned);

    const parts = cleaned.split(/(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*)/g);

    return parts.map((part, i) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return (
          <strong key={i} className="font-bold text-neutral-950 dark:text-white">
            {part.slice(2, -2)}
          </strong>
        );
      }
      if (part.startsWith("*") && part.endsWith("*")) {
        return <em key={i}>{part.slice(1, -1)}</em>;
      }
      if (part.startsWith("`") && part.endsWith("`")) {
        return (
          <code
            key={i}
            className="px-1.5 py-0.5 mx-0.5 rounded bg-black/[0.05] dark:bg-white/[0.08] font-mono text-[12px] text-neutral-900 dark:text-neutral-100 border border-black/[0.04] dark:border-white/[0.06]"
          >
            {part.slice(1, -1)}
          </code>
        );
      }
      return <React.Fragment key={i}>{part}</React.Fragment>;
    });
  };

  // Render markdown table rows into a clean responsive table
  const renderMarkdownTable = (lines: string[], keyIdx: number) => {
    const headerLine = lines[0];
    const bodyLines = lines.slice(2); // Skip header and separator

    const parseRow = (row: string) =>
      row
        .split("|")
        .map((c) => c.trim())
        .filter((_, idx, arr) => idx > 0 && idx < arr.length - 1);

    const headers = parseRow(headerLine);

    return (
      <div key={keyIdx} className="my-3 overflow-x-auto rounded-xl border border-black/[0.08] dark:border-white/[0.08] bg-black/[0.01] dark:bg-white/[0.01]">
        <table className="w-full text-left text-xs font-mono">
          <thead className="bg-black/[0.03] dark:bg-white/[0.03] border-b border-black/[0.08] dark:border-white/[0.08] font-sans font-semibold text-neutral-800 dark:text-neutral-200">
            <tr>
              {headers.map((h, i) => (
                <th key={i} className="px-3 py-2 text-xs">
                  {formatInlineSpans(h)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-black/[0.04] dark:divide-white/[0.04]">
            {bodyLines.map((row, rIdx) => {
              const cells = parseRow(row);
              return (
                <tr key={rIdx} className="hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors">
                  {cells.map((cell, cIdx) => (
                    <td key={cIdx} className="px-3 py-2 text-neutral-700 dark:text-neutral-300 font-sans text-xs">
                      {formatInlineSpans(cell)}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  // Render Prose Block with headers, math blocks, lists, and tables
  const renderProseBlock = (text: string, blockIdx: number) => {
    const rawLines = text.split("\n");
    const elements: React.ReactNode[] = [];
    let i = 0;

    while (i < rawLines.length) {
      const line = rawLines[i];
      const trimmed = line.trim();

      if (!trimmed) {
        elements.push(<div key={`space-${i}`} className="h-1" />);
        i++;
        continue;
      }

      // Check for <think>...</think> Reasoning / Chain of Thought Block
      if (trimmed.startsWith("<think>") || (trimmed.includes("<think>") && !trimmed.startsWith("```"))) {
        const thinkLines: string[] = [];
        const firstLine = trimmed.replace(/^.*?<think>/i, "").trim();
        if (firstLine) thinkLines.push(firstLine);
        i++;
        let isClosed = false;
        while (i < rawLines.length && !rawLines[i].includes("</think>")) {
          thinkLines.push(rawLines[i]);
          i++;
        }
        if (i < rawLines.length && rawLines[i].includes("</think>")) {
          isClosed = true;
          const lastLine = rawLines[i].replace(/<\/think>[\s\S]*$/i, "").trim();
          if (lastLine) thinkLines.push(lastLine);
          i++;
        }
        const thinkText = thinkLines.join("\n").trim();
        if (thinkText) {
          elements.push(
            <ThinkingProcessBlock
              key={`think-${i}`}
              thinkingContent={thinkText}
              isStreaming={isSubmitting && !isClosed}
            />
          );
        }
        continue;
      }

      // Check for Memory Saved block (:::memory-saved{...}:::)
      if (trimmed.includes(":::memory-saved")) {
        const memMatch = trimmed.match(/:::memory-saved(\{.*?\})(?::::)?/);
        if (memMatch) {
          try {
            const memoryData: MemoryInspectItem = JSON.parse(memMatch[1]);
            // Automatically save to localStorage
            try {
              const existing = JSON.parse(localStorage.getItem("easycode_user_memories") || "[]");
              if (!existing.some((m: any) => m.content.toLowerCase() === memoryData.content.toLowerCase())) {
                const updatedList = [
                  {
                    id: memoryData.id || Date.now().toString(),
                    content: memoryData.content,
                    category: memoryData.category || "Goal",
                    createdAt: "Just now",
                  },
                  ...existing,
                ];
                localStorage.setItem("easycode_user_memories", JSON.stringify(updatedList));
                window.dispatchEvent(new Event("easycode_memory_updated"));
              }
            } catch (e) {}

            elements.push(
              <div
                key={`mem-${i}`}
                onClick={() => setSelectedMemoryToInspect(memoryData)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/30 hover:border-amber-500/50 text-amber-950 dark:text-amber-100 text-xs font-medium transition-all cursor-pointer select-none my-2 shadow-2xs group w-fit max-w-full"
                title="Click to view or edit this memory in place"
              >
                <div className="w-5 h-5 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0 group-hover:scale-110 transition-transform">
                  <Brain className="w-3 h-3" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] font-semibold text-amber-700 dark:text-amber-300 uppercase tracking-wide">
                      Memory Saved
                    </span>
                    <span className="text-[9px] px-1 py-0.2 rounded bg-amber-500/20 text-amber-800 dark:text-amber-200 font-mono">
                      {memoryData.category || "Goal"}
                    </span>
                  </div>
                  <p className="text-[11px] text-neutral-800 dark:text-neutral-200 truncate mt-0.5 font-normal">
                    {memoryData.content}
                  </p>
                </div>
                <span className="text-[10px] text-amber-700 dark:text-amber-400 underline font-medium opacity-80 group-hover:opacity-100 shrink-0 ml-1">
                  View &rarr;
                </span>
              </div>
            );
            i++;
            continue;
          } catch (e) {}
        }
      }

      // Check for Video Media block (@[video](...))
      const videoMatch = trimmed.match(/@\[video\]\(([^)]+)\)/);
      if (videoMatch) {
        const fullUrl = videoMatch[1];
        const [cleanUrl, hashParams] = fullUrl.split("#");
        const params = new URLSearchParams(hashParams || "");
        const poster = params.get("poster") || undefined;
        const aspect = (params.get("aspect") as any) || "16:9";
        const model = params.get("model") || "Motion AI Video Studio";
        const videoPrompt = params.get("prompt") || "AI Generated Video";

        elements.push(
          <AiMediaCard
            key={`video-${i}`}
            type="video"
            src={cleanUrl}
            poster={poster}
            prompt={videoPrompt}
            model={model}
            aspectRatio={aspect}
          />
        );
        i++;
        continue;
      }

      // Check for Image Media block (![alt](...))
      const imageMatch = trimmed.match(/!\[([^\]]*)\]\(([^)]+)\)/);
      if (imageMatch) {
        const alt = imageMatch[1] || "AI Generated Visual";
        const fullUrl = imageMatch[2];
        const [cleanUrl, hashParams] = fullUrl.split("#");
        const params = new URLSearchParams(hashParams || "");
        const aspect = (params.get("aspect") as any) || "1:1";
        const model = params.get("model") || "Vision AI Image Studio";

        elements.push(
          <AiMediaCard
            key={`img-${i}`}
            type="image"
            src={cleanUrl}
            prompt={alt}
            alt={alt}
            model={model}
            aspectRatio={aspect}
          />
        );
        i++;
        continue;
      }

      // Check for Markdown Table (at least 3 lines with |)
      if (
        trimmed.startsWith("|") &&
        trimmed.endsWith("|") &&
        i + 1 < rawLines.length &&
        rawLines[i + 1].trim().includes("---")
      ) {
        const tableLines: string[] = [];
        while (i < rawLines.length && rawLines[i].trim().startsWith("|")) {
          tableLines.push(rawLines[i]);
          i++;
        }
        elements.push(renderMarkdownTable(tableLines, i));
        continue;
      }

      // Horizontal Rule
      if (trimmed === "---" || trimmed === "***" || trimmed === "___") {
        elements.push(<hr key={`hr-${i}`} className="my-3 border-black/[0.08] dark:border-white/[0.08]" />);
        i++;
        continue;
      }

      // Display Math block ($$ ... $$)
      if (trimmed.startsWith("$$") && trimmed.endsWith("$$")) {
        const formula = trimmed.slice(2, -2).trim();
        elements.push(
          <div
            key={`math-${i}`}
            className="my-2.5 p-2.5 rounded-lg bg-black/[0.03] dark:bg-white/[0.04] font-mono text-xs text-neutral-800 dark:text-neutral-200 border border-black/[0.05] dark:border-white/[0.06] overflow-x-auto leading-relaxed"
          >
            {cleanAiLatexMath(formula)}
          </div>
        );
        i++;
        continue;
      }

      // H1 Header (# ...)
      if (trimmed.startsWith("# ")) {
        elements.push(
          <h1
            key={`h1-${i}`}
            className="text-lg sm:text-xl font-bold text-neutral-950 dark:text-white pt-3 pb-1 tracking-tight font-sans border-b border-black/[0.06] dark:border-white/[0.08]"
          >
            {formatInlineSpans(trimmed.replace(/^#\s+/, ""))}
          </h1>
        );
        i++;
        continue;
      }

      // H2 Header (## ...)
      if (trimmed.startsWith("## ")) {
        elements.push(
          <h2
            key={`h2-${i}`}
            className="text-base sm:text-lg font-bold text-neutral-900 dark:text-neutral-50 pt-2.5 pb-1 tracking-tight font-sans"
          >
            {formatInlineSpans(trimmed.replace(/^##\s+/, ""))}
          </h2>
        );
        i++;
        continue;
      }

      // H3 Header (### ...)
      if (trimmed.startsWith("### ")) {
        elements.push(
          <h3
            key={`h3-${i}`}
            className="text-[14px] font-bold text-neutral-950 dark:text-neutral-50 pt-2 pb-0.5 tracking-tight font-sans"
          >
            {formatInlineSpans(trimmed.replace(/^###\s+/, ""))}
          </h3>
        );
        i++;
        continue;
      }

      // H4 Header (#### ...)
      if (trimmed.startsWith("#### ")) {
        elements.push(
          <h4
            key={`h4-${i}`}
            className="text-[13px] font-semibold text-neutral-900 dark:text-neutral-100 pt-1.5 pb-0.5 font-sans"
          >
            {formatInlineSpans(trimmed.replace(/^####\s+/, ""))}
          </h4>
        );
        i++;
        continue;
      }

      // Bullet item
      if (trimmed.startsWith("•") || trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
        const cleanText = trimmed.replace(/^[•\-\*]\s*/, "");
        elements.push(
          <div key={`bullet-${i}`} className="flex items-start gap-2 pl-1 my-1">
            <span className="w-1.5 h-1.5 rounded-full bg-neutral-400 dark:bg-neutral-500 mt-2 shrink-0" />
            <span className="flex-1 text-sm leading-relaxed">{formatInlineSpans(cleanText)}</span>
          </div>
        );
        i++;
        continue;
      }

      // Numbered item
      const numMatch = trimmed.match(/^(\d+)\.\s*(.+)/);
      if (numMatch) {
        elements.push(
          <div key={`num-${i}`} className="flex items-start gap-2 pl-1 my-1">
            <span className="font-mono text-xs font-semibold text-neutral-500 shrink-0 mt-0.5">
              {numMatch[1]}.
            </span>
            <span className="flex-1 text-sm leading-relaxed">{formatInlineSpans(numMatch[2])}</span>
          </div>
        );
        i++;
        continue;
      }

      // Standard prose line
      elements.push(
        <p key={`p-${i}`} className="text-sm leading-relaxed text-neutral-800 dark:text-neutral-200 font-sans">
          {formatInlineSpans(line)}
        </p>
      );
      i++;
    }

    return (
      <div key={blockIdx} className="space-y-1.5">
        {elements}
      </div>
    );
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
        <div className="flex items-center gap-2">
          {/* Model Selector Dropdown with Provider Logo */}
          <div className="relative" ref={modelDropdownRef}>
            <button
              onClick={() => setShowModelDropdown((prev) => !prev)}
              className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-white dark:bg-[#201f1d] hover:bg-black/[0.04] dark:hover:bg-white/[0.06] border border-black/[0.08] dark:border-white/[0.1] text-xs font-medium text-neutral-800 dark:text-neutral-200 transition-all cursor-pointer shadow-2xs"
            >
              <ProviderLogo provider={currentModelMeta.provider} modelId={selectedModel} className="w-3.5 h-3.5 text-neutral-700 dark:text-neutral-300" />
              <span className="truncate max-w-[140px]">{cleanModelName(currentModelMeta.name)}</span>
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
                      try {
                        localStorage.setItem("easycode_last_active_model", "auto");
                      } catch (e) {}
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
                          try {
                            localStorage.setItem("easycode_last_active_model", m.id);
                          } catch (e) {}
                          setShowModelDropdown(false);
                          toast.success(`Switched model to ${cleanModelName(m.name)}`);
                        }}
                        className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                          isSelected
                            ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 font-medium"
                            : "hover:bg-black/[0.04] dark:hover:bg-white/[0.06] text-neutral-700 dark:text-neutral-300"
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <ProviderLogo provider={m.provider} modelId={m.id} className="w-3.5 h-3.5 shrink-0 text-current" />
                          <span className="truncate">{cleanModelName(m.name)}</span>
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

          {/* Visual Media Studio Engine Dropdown */}
          <div className="relative" ref={visualEngineDropdownRef}>
            <button
              onClick={() => setShowVisualEngineDropdown((prev) => !prev)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white dark:bg-[#201f1d] hover:bg-black/[0.04] dark:hover:bg-white/[0.06] border border-black/[0.08] dark:border-white/[0.1] text-xs font-medium text-neutral-800 dark:text-neutral-200 transition-all cursor-pointer shadow-2xs"
              title="Select Image & Video Generation Engine"
            >
              <ProviderLogo provider={currentVisualEngineMeta.provider} modelId={selectedVisualEngine} className="w-3.5 h-3.5 text-neutral-700 dark:text-neutral-300 shrink-0" />
              <span className="truncate max-w-[130px]">{cleanModelName(currentVisualEngineMeta.name)}</span>
              <ChevronDown className="w-3 h-3 opacity-60 ml-0.5" />
            </button>

            {showVisualEngineDropdown && (
              <div className="absolute left-0 top-full mt-1.5 w-76 rounded-xl bg-white dark:bg-[#222222] border border-neutral-200 dark:border-neutral-800 shadow-2xl z-50 overflow-hidden">
                <div className="p-2 border-b border-black/[0.06] dark:border-white/[0.06]">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-neutral-400" />
                    <input
                      type="text"
                      value={visualEngineSearch}
                      onChange={(e) => setVisualEngineSearch(e.target.value)}
                      placeholder="Search media engines..."
                      className="w-full pl-8 pr-2.5 py-1.5 text-xs rounded-lg bg-black/[0.03] dark:bg-white/[0.04] border border-black/[0.05] dark:border-white/[0.06] outline-hidden text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400"
                      autoFocus
                    />
                  </div>
                </div>

                <div className="max-h-60 overflow-y-auto p-1.5 space-y-0.5">
                  {filteredVisualEngines.map((eng) => {
                    const isSelected = selectedVisualEngine === eng.id;
                    return (
                      <button
                        key={eng.id}
                        onClick={() => {
                          setSelectedVisualEngine(eng.id);
                          try {
                            localStorage.setItem("easycode_visual_engine", eng.id);
                          } catch (e) {}
                          setShowVisualEngineDropdown(false);
                          toast.success(`Selected ${cleanModelName(eng.name)}`);
                        }}
                        className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                          isSelected
                            ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 font-medium"
                            : "hover:bg-black/[0.04] dark:hover:bg-white/[0.06] text-neutral-700 dark:text-neutral-300"
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <ProviderLogo provider={eng.provider} modelId={eng.id} className="w-3.5 h-3.5 shrink-0 text-current" />
                          <div className="flex flex-col text-left truncate">
                            <span className="truncate">{cleanModelName(eng.name)}</span>
                            <span className={`text-[10px] truncate ${isSelected ? "opacity-75" : "text-neutral-400"}`}>
                              {eng.provider} • {eng.badge}
                            </span>
                          </div>
                        </div>
                        {isSelected && <Check className="w-3.5 h-3.5 shrink-0 text-current ml-1" />}
                      </button>
                    );
                  })}
                  {filteredVisualEngines.length === 0 && (
                    <div className="p-3 text-center text-xs text-neutral-500">
                      No media engines match your search
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
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
              {editingChatId === chat.id ? (
                <div className="w-full min-w-[260px] sm:min-w-[360px] max-w-lg space-y-2 p-3 rounded-2xl bg-[#F0EEE6] dark:bg-[#2A2826] text-[#1C1B19] dark:text-[#ECEAE4] border border-black/10 dark:border-white/10 shadow-lg animate-in fade-in zoom-in-98 duration-150">
                  <textarea
                    ref={(el) => {
                      if (el) {
                        el.style.height = "auto";
                        el.style.height = `${el.scrollHeight}px`;
                      }
                    }}
                    value={editingChatText}
                    onChange={(e) => {
                      setEditingChatText(e.target.value);
                      e.target.style.height = "auto";
                      e.target.style.height = `${e.target.scrollHeight}px`;
                    }}
                    className="w-full bg-transparent text-neutral-900 dark:text-neutral-100 p-0.5 border-0 outline-none focus:outline-none focus:ring-0 text-xs sm:text-sm font-sans resize-none overflow-hidden transition-all leading-relaxed"
                    autoFocus
                    onKeyDown={(e) => {
                      const isChanged = editingChatText.trim() !== chat.input.trim();
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        if (isChanged && editingChatText.trim() && !isSubmitting) {
                          handleSaveEditedChat(chat.id);
                        }
                      } else if (e.key === "Escape") {
                        setEditingChatId(null);
                      }
                    }}
                  />
                  <div className="flex items-center justify-end gap-2 pt-0.5">
                    <button
                      type="button"
                      onClick={() => setEditingChatId(null)}
                      className="px-2.5 py-1 rounded-lg text-xs font-medium text-neutral-600 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-white bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      disabled={editingChatText.trim() === chat.input.trim() || !editingChatText.trim() || isSubmitting}
                      onClick={() => {
                        if (editingChatText.trim() !== chat.input.trim() && editingChatText.trim() && !isSubmitting) {
                          handleSaveEditedChat(chat.id);
                        }
                      }}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all shadow-xs ${
                        editingChatText.trim() !== chat.input.trim() && editingChatText.trim() && !isSubmitting
                          ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 hover:opacity-90 active:scale-95 cursor-pointer"
                          : "bg-black/10 text-neutral-400 dark:bg-white/10 dark:text-neutral-500 cursor-not-allowed"
                      }`}
                      title={
                        editingChatText.trim() === chat.input.trim()
                          ? "Make a change to resend and reset the conversation"
                          : "Resend prompt and regenerate conversation from this point"
                      }
                    >
                      Resend
                    </button>
                  </div>
                </div>
              ) : (
                <div className="group/user relative max-w-[85%] rounded-3xl bg-[#F0EEE6] text-[#1C1B19] dark:bg-[#2A2826] dark:text-[#ECEAE4] px-4 py-2.5 text-sm leading-relaxed shadow-2xs space-y-1.5">
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

                  {/* Floating Hover Action Bar: Edit & Reset, Copy */}
                  <div className="absolute -bottom-6 right-2 opacity-0 group-hover/user:opacity-100 transition-opacity flex items-center gap-1.5 py-0.5 px-2 rounded-lg bg-neutral-900/90 dark:bg-[#2A2826]/95 backdrop-blur-xs border border-black/10 dark:border-white/10 shadow-lg text-[10px] text-white z-20">
                    <button
                      onClick={() => {
                        setEditingChatId(chat.id);
                        setEditingChatText(chat.input);
                      }}
                      className="flex items-center gap-1 hover:text-amber-300 transition-colors cursor-pointer py-0.5 px-1 rounded"
                      title="Edit prompt and reset conversation to this point"
                    >
                      <Pencil className="w-2.5 h-2.5 text-amber-400" />
                      <span>Edit</span>
                    </button>
                    <span className="opacity-30">|</span>
                    <button
                      onClick={() => handleCopyText(chat.input, `user-${chat.id}`)}
                      className="flex items-center gap-1 hover:text-amber-300 transition-colors cursor-pointer py-0.5 px-1 rounded"
                      title="Copy prompt"
                    >
                      {copiedId === `user-${chat.id}` ? (
                        <Check className="w-2.5 h-2.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-2.5 h-2.5" />
                      )}
                    </button>
                  </div>
                </div>
              )}
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
                /* Shimmering "Thinking..." block matching Antigravity / Workspace */
                <div className="flex items-center justify-between py-1 text-neutral-500 dark:text-neutral-400 animate-in fade-in duration-200">
                  <ThinkingProcessBlock
                    thinkingContent="Synthesizing algorithmic logic and analyzing edge cases..."
                    isStreaming={true}
                  />

                  <button
                    onClick={handleCancelGeneration}
                    className="flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-full bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-500/20 transition-colors cursor-pointer"
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

      {/* Pending Code Diff Review Banner (When not in Agent Mode or proposed changes pending) */}
      {pendingDiff && (
        <div className="mx-3 mb-2 rounded-xl border border-amber-500/30 bg-[#FDFBF7] dark:bg-[#1E1D1B] p-2.5 shadow-md animate-in slide-in-from-bottom-2 space-y-2">
          <div className="flex items-center justify-between gap-2 flex-wrap text-xs">
            <div className="flex items-center gap-2 font-mono">
              <span className="font-semibold text-neutral-900 dark:text-white flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-500" />
                Proposed Code Changes:
              </span>
              <span className="px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold text-[11px] border border-emerald-500/25">
                +{pendingDiff.diff.additions}
              </span>
              <span className="px-1.5 py-0.5 rounded bg-red-500/15 text-red-600 dark:text-red-400 font-bold text-[11px] border border-red-500/25">
                -{pendingDiff.diff.deletions}
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              {/* Toggle Diff View */}
              <button
                type="button"
                onClick={() => setShowDiffView(!showDiffView)}
                className="px-2 py-1 rounded-lg text-[11px] font-medium border border-black/[0.08] dark:border-white/[0.1] bg-white/70 dark:bg-white/[0.04] text-neutral-700 dark:text-neutral-300 hover:bg-white dark:hover:bg-white/[0.08] flex items-center gap-1 transition-colors cursor-pointer"
                title="Toggle visual line diff"
              >
                {showDiffView ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                <span>{showDiffView ? "Hide Diff" : "View Diff"}</span>
              </button>

              {/* Accept & Apply Button */}
              <button
                type="button"
                onClick={() => {
                  if (onApplyCode) {
                    onApplyCode(pendingDiff.code);
                    toast.success(`Accepted & applied code changes (+${pendingDiff.diff.additions} -${pendingDiff.diff.deletions} lines) to editor!`);
                    window.dispatchEvent(new CustomEvent("easycode-agent-diff-applied", {
                      detail: {
                        addedLineIndices: pendingDiff.diff.addedLineIndices,
                        additions: pendingDiff.diff.additions,
                        deletions: pendingDiff.diff.deletions,
                        oldCode: pendingDiff.originalCode,
                        newCode: pendingDiff.code,
                        diff: pendingDiff.diff,
                        isReviewModeAccept: true,
                      }
                    }));
                    setPendingDiff(null);
                    setShowDiffView(false);
                  }
                }}
                className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-[#1C1B19] text-white hover:bg-black dark:bg-white dark:text-[#1C1B19] dark:hover:bg-neutral-100 flex items-center gap-1 shadow-xs transition-colors cursor-pointer"
                title="Accept and apply code to Monaco Editor"
              >
                <Check className="w-3 h-3 text-emerald-400 dark:text-emerald-600" />
                <span>Accept</span>
              </button>

              {/* Reject Button */}
              <button
                type="button"
                onClick={() => {
                  setPendingDiff(null);
                  setShowDiffView(false);
                  toast.info("Proposed changes rejected");
                }}
                className="px-2 py-1 rounded-lg text-[11px] font-medium hover:bg-black/5 dark:hover:bg-white/5 text-neutral-500 hover:text-red-600 dark:hover:text-red-400 transition-colors cursor-pointer flex items-center gap-1"
                title="Reject and discard changes"
              >
                <X className="w-3 h-3" />
                <span>Reject</span>
              </button>
            </div>
          </div>

          {/* Visual Green / Red Line-by-Line Diff Preview */}
          {showDiffView && (
            <div className="max-h-56 overflow-y-auto rounded-lg border border-black/[0.08] dark:border-white/[0.08] bg-[#141414] text-xs font-mono p-2 space-y-0.5 select-text">
              {pendingDiff.diff.lines.map((dl, idx) => (
                <div
                  key={idx}
                  className={`px-1.5 py-0.5 rounded leading-tight flex items-start gap-2 ${
                    dl.type === "add"
                      ? "bg-emerald-500/20 text-emerald-300 border-l-2 border-emerald-500 font-medium"
                      : dl.type === "delete"
                      ? "bg-red-500/20 text-red-300 border-l-2 border-red-500 line-through opacity-80"
                      : "text-neutral-400"
                  }`}
                >
                  <span className="w-4 shrink-0 text-right opacity-50 select-none">
                    {dl.type === "add" ? "+" : dl.type === "delete" ? "-" : " "}
                  </span>
                  <span className="whitespace-pre overflow-x-auto">{dl.line || " "}</span>
                </div>
              ))}
            </div>
          )}
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

          {/* Prompt Textarea or Live Audio Frequency Visualizer */}
          {isRecordingAudio ? (
            <div className="py-1">
              <AudioRecordingVisualizer
                isOpen={isRecordingAudio}
                onTranscription={(text) => {
                  setInputValue((prev) => (prev ? `${prev} ${text}` : text));
                  setIsRecordingAudio(false);
                  setTimeout(() => textareaRef.current?.focus(), 50);
                }}
                onCancel={() => setIsRecordingAudio(false)}
                customKeys={apiKeys}
              />
            </div>
          ) : (
            <textarea
              ref={textareaRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask a question, request code feedback, or debug logic..."
              className="w-full bg-transparent resize-none outline-hidden text-xs leading-relaxed min-h-[44px] max-h-[120px] text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500 font-sans"
              rows={2}
            />
          )}

          {/* Bottom Controls: Plus (+) Button on Left, Send/Stop on Right */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-7 h-7 rounded-lg border border-black/[0.08] dark:border-white/[0.1] bg-black/[0.02] dark:bg-white/[0.04] hover:bg-black/[0.06] dark:hover:bg-white/[0.08] text-neutral-700 dark:text-neutral-300 flex items-center justify-center transition-colors cursor-pointer"
                title="Attach documents, code files, or data"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>

              {/* Agent Mode Toggle Button */}
              <button
                type="button"
                onClick={() => {
                  const next = !isAgentMode;
                  setIsAgentMode(next);
                  try {
                    localStorage.setItem("easycode_agent_mode", JSON.stringify(next));
                  } catch (e) {}
                }}
                className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg border transition-all cursor-pointer shadow-2xs ${
                  isAgentMode
                    ? "bg-[#1C1B19] text-white dark:bg-white dark:text-[#1C1B19] border-transparent font-medium"
                    : "border-black/[0.08] dark:border-white/[0.1] bg-white/70 dark:bg-white/[0.04] text-[#524E48] dark:text-[#A8A49D] hover:bg-white dark:hover:bg-white/[0.08]"
                }`}
                title={isAgentMode ? "Agent Mode: Automatically edits the Monaco Editor with diff highlight" : "Review Mode: Proposes diff with Accept/Reject options"}
              >
                <Zap className={`w-3.5 h-3.5 ${isAgentMode ? "fill-amber-400 text-amber-400" : "text-[#7A756C] dark:text-[#8C8880]"}`} />
                <span>{isAgentMode ? "Agent Mode" : "Review Mode"}</span>
                <span className={`w-1.5 h-1.5 rounded-full ${isAgentMode ? "bg-emerald-400 animate-pulse" : "bg-neutral-400"}`} />
              </button>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setIsRecordingAudio((prev) => !prev)}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  isRecordingAudio
                    ? "bg-red-500/10 text-red-500 dark:text-red-400 animate-pulse"
                    : "text-[#7A756C] dark:text-[#8C8880] hover:text-[#1C1B19] dark:hover:text-white"
                }`}
                title={isRecordingAudio ? "Stop voice input" : "Voice input (Groq Whisper Large v3)"}
              >
                <Mic className="w-3.5 h-3.5" />
              </button>

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

      {/* Floating Ask AI / Quote Selection Tooltip */}
      {selectionTooltip.visible && (
        <div
          style={{
            position: "fixed",
            left: `${selectionTooltip.x}px`,
            top: `${selectionTooltip.y}px`,
            transform: "translateX(-50%)",
          }}
          className="z-50 flex items-center gap-1 p-1 rounded-xl bg-[#1C1B19]/95 dark:bg-[#2A2826]/95 backdrop-blur-md text-white border border-white/10 shadow-xl select-none animate-in fade-in zoom-in-95 duration-150"
          onMouseDown={(e) => e.preventDefault()}
        >
          <button
            onClick={() => handleQuoteSelection(selectionTooltip.text)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium hover:bg-white/15 transition-colors cursor-pointer text-white"
            title="Quote in prompt and ask AI"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            <span>Ask AI</span>
          </button>
          <span className="text-white/20">|</span>
          <button
            onClick={() => {
              navigator.clipboard.writeText(selectionTooltip.text);
              toast.success("Selection copied to clipboard");
              setSelectionTooltip({ visible: false, text: "", x: 0, y: 0 });
            }}
            className="p-1 rounded-lg hover:bg-white/15 text-neutral-300 hover:text-white transition-colors cursor-pointer"
            title="Copy selection"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Inline Memory Inspection & Editing Modal (In-space without forwarding to Settings) */}
      {selectedMemoryToInspect && (
        <InlineMemoryModal
          memory={selectedMemoryToInspect}
          onClose={() => setSelectedMemoryToInspect(null)}
          onUpdate={(updated) => {
            setSelectedMemoryToInspect(null);
            toast.success("Memory entry updated");
          }}
          onDelete={() => {
            setSelectedMemoryToInspect(null);
          }}
        />
      )}
    </div>
  );
}
