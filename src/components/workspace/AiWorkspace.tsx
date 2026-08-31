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
  AlertCircle,
  FileText,
  FileCode,
  FileSpreadsheet,
  Image as ImageIcon,
  X,
  Loader2,
  Bot,
  UploadCloud,
  Download,
  Presentation,
  Wand2,
  Server,
  Terminal,
  Paperclip,
  FolderOpen,
  Square,
  Film,
  Network,
  Trash2,
  ArrowDown,
  Pencil,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabaseClient";
import SettingsView from "./SettingsView";
import GammaProblemCanvas from "../problem-builder/GammaProblemCanvas";
import AiMediaCard from "@/components/common/AiMediaCard";
import MermaidFlowchartViewer from "@/components/common/MermaidFlowchartViewer";
import SvgDiagramViewer from "@/components/common/SvgDiagramViewer";
import InlineMemoryModal, { MemoryInspectItem } from "@/components/common/InlineMemoryModal";
import ThinkingProcessBlock from "@/components/common/ThinkingProcessBlock";
import { GeneratedProblem } from "@/types/generatedProblem";
import { ProviderLogo } from "@/components/common/ProviderLogos";
import { BUILT_IN_SKILLS, DEFAULT_AI_RULES, AiSkill, AiRule } from "@/types/skillsAndRules";
import { ALL_VISUAL_ENGINES, VisualEngineItem } from "@/utils/mediaGenerator";
import { cleanModelName } from "@/utils/cleanModelName";
import { getAllModelsForProvider, getEnabledModelIds } from "@/utils/customModelRegistry";
import AudioRecordingVisualizer from "@/components/common/AudioRecordingVisualizer";
import {
  exportAsHtmlPresentation,
  exportAsPrintableDocument,
  exportAsWordDocument,
  downloadRawFile,
} from "@/utils/documentExporters";

// Universal File Download Utility
const downloadFile = (filename: string, content: string, mimeType = "text/plain;charset=utf-8") => {
  try {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success(`Saved and downloaded ${filename}`);
  } catch (err) {
    toast.error("Failed to download file");
  }
};

const getLanguageExtension = (lang?: string): string => {
  const l = (lang || "").toLowerCase();
  if (l.includes("python") || l === "py") return "py";
  if (l.includes("typescript") || l === "ts") return "ts";
  if (l.includes("javascript") || l === "js") return "js";
  if (l.includes("c++") || l === "cpp") return "cpp";
  if (l.includes("java")) return "java";
  if (l.includes("c#") || l === "cs") return "cs";
  if (l.includes("go") || l === "golang") return "go";
  if (l.includes("rust") || l === "rs") return "rs";
  if (l.includes("json")) return "json";
  if (l.includes("markdown") || l === "md") return "md";
  if (l.includes("sql")) return "sql";
  if (l.includes("html")) return "html";
  if (l.includes("css")) return "css";
  if (l.includes("csv")) return "csv";
  return "txt";
};

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

interface UploadedDoc {
  id: string;
  name: string;
  size: number;
  type: string;
  content?: string;
  isUploading?: boolean;
}

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  uploadedFiles?: string[];
  modelUsed?: string;
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

interface HistoryItem {
  id: string;
  title: string;
  time: string;
  timestamp?: number;
  topic?: string;
  level?: string;
  messages?: Message[];
}

function formatRealTimestamp(timestamp?: number | string): string {
  if (!timestamp) return "Just now";
  const ms = typeof timestamp === "number" ? timestamp : new Date(timestamp).getTime();
  if (isNaN(ms)) return typeof timestamp === "string" ? timestamp : "Just now";
  const now = Date.now();
  const diffSec = Math.floor((now - ms) / 1000);
  if (diffSec < 60) return "Just now";
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  return new Date(ms).toLocaleDateString([], { month: "short", day: "numeric" });
}

interface ModelDefinition {
  id: string;
  name: string;
  provider: string;
  category: "Frontier" | "Reasoning" | "Coding" | "Speed" | "Open Source" | "Search" | "Local" | "Universal" | "Image" | "Video";
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
  { id: "gemini-3.6-flash", name: "Gemini 3.6 Flash", provider: "Google", category: "Frontier", badge: "Flagship", contextWindow: "1M tokens", requiredKey: "gemini" },
  { id: "gemini-3.5-flash", name: "Gemini 3.5 Flash", provider: "Google", category: "Speed", badge: "Speed", contextWindow: "1M tokens", requiredKey: "gemini" },
  { id: "gemini-flash-latest", name: "Gemini Flash Latest", provider: "Google", category: "Speed", badge: "Fast", contextWindow: "1M tokens", requiredKey: "gemini" },
  { id: "gemini-3.7-flash", name: "Gemini 3.7 Flash", provider: "Google", category: "Reasoning", badge: "Hybrid CoT", contextWindow: "1M tokens", requiredKey: "gemini" },
  { id: "gemini-3.1-pro-preview", name: "Gemini 3.1 Pro", provider: "Google", category: "Frontier", badge: "2M Context", contextWindow: "2M tokens", requiredKey: "gemini" },

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
  { id: "groq/compound", name: "Groq Compound (MoE)", provider: "Groq", category: "Speed", badge: "Ultra Fast", contextWindow: "128k tokens", requiredKey: "groq" },
  { id: "groq/compound-mini", name: "Groq Compound Mini", provider: "Groq", category: "Speed", badge: "Instant", contextWindow: "128k tokens", requiredKey: "groq" },
  { id: "qwen/qwen3.6-27b", name: "Qwen 3.6 27B", provider: "Groq", category: "Reasoning", badge: "Deep CoT", contextWindow: "32k tokens", requiredKey: "groq" },
  { id: "openai/gpt-oss-120b", name: "GPT-OSS 120B", provider: "Groq", category: "Frontier", badge: "Flagship", contextWindow: "128k tokens", requiredKey: "groq" },
  { id: "openai/gpt-oss-20b", name: "GPT-OSS 20B", provider: "Groq", category: "Speed", badge: "Fast", contextWindow: "128k tokens", requiredKey: "groq" },
  { id: "allam-2-7b", name: "Allam 2 7B", provider: "Groq", category: "Speed", badge: "Multilingual", contextWindow: "32k tokens", requiredKey: "groq" },

  // 7. Alibaba Cloud (Qwen)
  { id: "qwen-2.5-coder-32b", name: "Qwen 2.5 Coder 32B", provider: "Alibaba Cloud", category: "Coding", badge: "Open Champion", contextWindow: "128k tokens", requiredKey: "qwen" },
  { id: "qwq-32b-preview", name: "QwQ 32B Preview", provider: "Alibaba Cloud", category: "Reasoning", badge: "Math & CoT", contextWindow: "32k tokens", requiredKey: "qwen" },
  { id: "qwen-2.5-72b-instruct", name: "Qwen 2.5 72B Instruct", provider: "Alibaba Cloud", category: "Frontier", badge: "72B Flagship", contextWindow: "128k tokens", requiredKey: "qwen" },

  // 8. Cerebras Systems
  { id: "cerebras-llama-3.3-70b", name: "Llama 3.3 70B", provider: "Cerebras", category: "Speed", badge: "Fast", contextWindow: "128k tokens", requiredKey: "cerebras" },
  { id: "cerebras-deepseek-r1-distill-70b", name: "DeepSeek R1 70B", provider: "Cerebras", category: "Reasoning", badge: "Instant CoT", contextWindow: "128k tokens", requiredKey: "cerebras" },

  // 9. SambaNova Systems
  { id: "sambanova-deepseek-r1", name: "DeepSeek R1", provider: "SambaNova", category: "Speed", badge: "Fast", contextWindow: "64k tokens", requiredKey: "sambanova" },
  { id: "sambanova-llama-3.3-70b", name: "Llama 3.3 70B", provider: "SambaNova", category: "Speed", badge: "Fast", contextWindow: "128k tokens", requiredKey: "sambanova" },

  // 10. Zhipu AI (GLM)
  { id: "glm-4-plus", name: "GLM-4 Plus", provider: "Zhipu AI", category: "Reasoning", badge: "Flagship", contextWindow: "128k tokens", requiredKey: "zhipu" },
  { id: "codegeex-4", name: "CodeGeeX-4", provider: "Zhipu AI", category: "Coding", badge: "Code SOTA", contextWindow: "128k tokens", requiredKey: "zhipu" },

  // 11. 01.AI (Yi)
  { id: "yi-lightning", name: "Yi Lightning", provider: "01.AI", category: "Frontier", badge: "Top Ranked", contextWindow: "128k tokens", requiredKey: "yi" },
  { id: "yi-large", name: "Yi Large", provider: "01.AI", category: "Frontier", badge: "Large", contextWindow: "128k tokens", requiredKey: "yi" },

  // 12. SiliconFlow
  { id: "siliconflow-deepseek-r1", name: "DeepSeek R1", provider: "SiliconFlow", category: "Speed", badge: "Full 671B", contextWindow: "64k tokens", requiredKey: "siliconflow" },
  { id: "siliconflow-qwen-2.5-coder-32b", name: "Qwen 2.5 Coder 32B", provider: "SiliconFlow", category: "Speed", badge: "Fast", contextWindow: "32k tokens", requiredKey: "siliconflow" },

  // 13. Mistral AI
  { id: "codestral-latest", name: "Codestral 22B", provider: "Mistral AI", category: "Coding", badge: "Code Specialist", contextWindow: "32k tokens", requiredKey: "mistral" },
  { id: "mistral-large", name: "Mistral Large 2411", provider: "Mistral AI", category: "Frontier", badge: "123B Flagship", contextWindow: "128k tokens", requiredKey: "mistral" },

  // 14. xAI (Grok)
  { id: "grok-2", name: "Grok 2", provider: "xAI", category: "Frontier", badge: "Flagship", contextWindow: "128k tokens", requiredKey: "grok" },
  { id: "grok-2-mini", name: "Grok 2 mini", provider: "xAI", category: "Speed", badge: "Fast", contextWindow: "128k tokens", requiredKey: "grok" },

  // 15. Together AI & Fireworks
  { id: "together-llama-3.3-70b", name: "Llama 3.3 70B", provider: "Together AI", category: "Open Source", badge: "Together Cloud", contextWindow: "128k tokens", requiredKey: "together" },
  { id: "together-deepseek-r1", name: "DeepSeek R1", provider: "Together AI", category: "Reasoning", badge: "Deep CoT", contextWindow: "64k tokens", requiredKey: "together" },
  { id: "fireworks-deepseek-r1", name: "DeepSeek R1", provider: "Fireworks AI", category: "Speed", badge: "Fast CoT", contextWindow: "128k tokens", requiredKey: "fireworks" },

  // 16. Research & Gateways
  { id: "sonar-reasoning-pro", name: "Sonar Reasoning Pro", provider: "Perplexity", category: "Search", badge: "Live Search", contextWindow: "128k tokens", requiredKey: "perplexity" },
  { id: "command-r-plus", name: "Command R+", provider: "Cohere", category: "Frontier", badge: "Enterprise", contextWindow: "128k tokens", requiredKey: "cohere" },
  { id: "openrouter-auto", name: "OpenRouter Auto", provider: "OpenRouter", category: "Frontier", badge: "300+ Routing", contextWindow: "Dynamic", requiredKey: "openrouter" },
  
  // 17. Cloudflare Workers AI Gateway
  { id: "@cf/meta/llama-3.3-70b-instruct", name: "Llama 3.3 70B", provider: "Cloudflare", category: "Speed", badge: "Edge SOTA", contextWindow: "128k tokens", requiredKey: "cloudflare" },
  { id: "@cf/deepseek-ai/deepseek-r1-distill-qwen-32b", name: "DeepSeek R1 Distill 32B", provider: "Cloudflare", category: "Reasoning", badge: "Reasoning", contextWindow: "32k tokens", requiredKey: "cloudflare" },
  { id: "@cf/qwen/qwen2.5-coder-32b-instruct", name: "Qwen 2.5 Coder 32B", provider: "Cloudflare", category: "Coding", badge: "Coding", contextWindow: "32k tokens", requiredKey: "cloudflare" },
  { id: "@cf/meta/llama-3.1-8b-instruct", name: "Llama 3.1 8B", provider: "Cloudflare", category: "Speed", badge: "Instant", contextWindow: "8k tokens", requiredKey: "cloudflare" },

  // 18. Hugging Face (Inference Endpoints & Serverless)
  { id: "Qwen/Qwen2.5-Coder-32B-Instruct", name: "Qwen 2.5 Coder 32B", provider: "Hugging Face", category: "Coding", badge: "Top Coder", contextWindow: "32k tokens", requiredKey: "huggingface" },
  { id: "meta-llama/Llama-3.3-70B-Instruct", name: "Llama 3.3 70B", provider: "Hugging Face", category: "Open Source", badge: "Open SOTA", contextWindow: "128k tokens", requiredKey: "huggingface" },
  { id: "deepseek-ai/DeepSeek-R1", name: "DeepSeek R1", provider: "Hugging Face", category: "Reasoning", badge: "Reasoning", contextWindow: "64k tokens", requiredKey: "huggingface" },

  // 19. Pollinations.ai (FLUX.1 & Multimodal)
  { id: "pollinations-flux", name: "FLUX.1 Schnell", provider: "Pollinations.ai", category: "Universal", badge: "Visual SOTA", contextWindow: "Image Gen", requiredKey: "pollinations" },
  { id: "pollinations-openai", name: "Pollinations Multimodal Chat", provider: "Pollinations.ai", category: "Universal", badge: "Free Gateway", contextWindow: "32k tokens", requiredKey: "pollinations" },

  // 20. Local Ollama
  { id: "ollama-local", name: "Local Ollama Host", provider: "Local", category: "Local", badge: "100% Private", contextWindow: "Configurable", requiredKey: "ollamaUrl" }
];

export default function AiWorkspace() {
  const { theme, setTheme } = useTheme();
  const { data: session } = useSession();
  const [mounted, setMounted] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [activeView, setActiveView] = useState<"chat" | "settings">("chat");
  const [activeModel, setActiveModel] = useState<string>(() => {
    try {
      return typeof window !== "undefined" ? localStorage.getItem("easycode_last_active_model") || "" : "";
    } catch (e) {
      return "";
    }
  });
  const [serverHostedKeys, setServerHostedKeys] = useState<Record<string, boolean>>({});

  // Auto-Scroll & Viewport Tracking (Prevents jumping when user scrolls up during live generation)
  const isUserAtBottomRef = useRef(true);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showScrollBottom, setShowScrollBottom] = useState(false);

  // Floating Ask AI on Text Selection
  const [selectionTooltip, setSelectionTooltip] = useState<{
    visible: boolean;
    text: string;
    x: number;
    y: number;
  }>({ visible: false, text: "", x: 0, y: 0 });

  // Inline Memory Inspection Modal (Directly in chat space without forwarding to Settings)
  const [selectedMemoryToInspect, setSelectedMemoryToInspect] = useState<MemoryInspectItem | null>(null);
  
  // Dropdown States
  const [showModelDropdown, setShowModelDropdown] = useState(false);
  const [showChatModelDropdown, setShowChatModelDropdown] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showTopicDropdown, setShowTopicDropdown] = useState(false);

  // Visual / Media Engine State
  const [activeVisualEngine, setActiveVisualEngine] = useState<string>(() => {
    try {
      return localStorage.getItem("easycode_visual_engine") || "pollinations-flux";
    } catch (e) {
      return "pollinations-flux";
    }
  });
  const [showVisualEngineDropdown, setShowVisualEngineDropdown] = useState(false);
  const visualEngineDropdownRef = useRef<HTMLDivElement>(null);

  const activeVisualEngineObj = useMemo(() => {
    return ALL_VISUAL_ENGINES.find((e) => e.id === activeVisualEngine) || ALL_VISUAL_ENGINES[0];
  }, [activeVisualEngine]);

  // Model & Media Search
  const [modelDropdownSearch, setModelDropdownSearch] = useState("");
  const [visualEngineSearch, setVisualEngineSearch] = useState("");
  const [isRecordingAudio, setIsRecordingAudio] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Sidebar Resizing State (Strict min: 256px, max: 500px)
  const [sidebarWidth, setSidebarWidth] = useState<number>(() => {
    try {
      const saved = typeof window !== "undefined" ? localStorage.getItem("easycode_workspace_sidebar_width") : null;
      if (saved) {
        const parsed = parseInt(saved, 10);
        if (!isNaN(parsed) && parsed >= 256 && parsed <= 500) return parsed;
      }
      return 256;
    } catch (e) {
      return 256;
    }
  });
  const [isResizingSidebar, setIsResizingSidebar] = useState(false);

  // Workspace Linear Scaling State (1.0 = 100% default, 1.12 = 112%, 1.25 = 125%)
  const [workspaceScale, setWorkspaceScale] = useState<number>(() => {
    try {
      const saved = typeof window !== "undefined" ? localStorage.getItem("easycode_workspace_scale") : null;
      if (saved) {
        const parsed = parseFloat(saved);
        if (!isNaN(parsed) && parsed >= 0.8 && parsed <= 1.5) return parsed;
      }
      return 1.0;
    } catch (e) {
      return 1.0;
    }
  });

  // Handle sidebar mouse drag resizing
  const handleSidebarMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizingSidebar(true);
  };

  useEffect(() => {
    if (!isResizingSidebar) return;

    const handleMouseMove = (e: MouseEvent) => {
      const minWidth = 256; // Strict minimum
      const maxWidth = Math.min(500, window.innerWidth * 0.45);
      const newWidth = Math.max(minWidth, Math.min(maxWidth, e.clientX));
      setSidebarWidth(newWidth);
    };

    const handleMouseUp = () => {
      setIsResizingSidebar(false);
      try {
        localStorage.setItem("easycode_workspace_sidebar_width", String(sidebarWidth));
        if (session?.user) {
          fetch("/api/user/preferences", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              preferences: {
                workspaceSidebarWidth: sidebarWidth,
              },
            }),
          }).catch(() => {});
        }
      } catch (e) {}
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
  }, [isResizingSidebar, sidebarWidth, session]);

  // Listen to real-time preference changes (linear scale & cloud preferences)
  useEffect(() => {
    const handlePrefChange = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail?.workspaceScale) {
        setWorkspaceScale(customEvent.detail.workspaceScale);
      }
    };

    window.addEventListener("easycode-preference-change", handlePrefChange);

    // Fetch cloud preferences from Supabase
    fetch("/api/user/preferences")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.preferences) {
          if (data.preferences.workspaceScale) {
            const parsed = parseFloat(data.preferences.workspaceScale);
            if (!isNaN(parsed) && parsed >= 0.8 && parsed <= 1.5) {
              setWorkspaceScale(parsed);
            }
          }
          if (data.preferences.workspaceSidebarWidth) {
            const parsed = parseInt(data.preferences.workspaceSidebarWidth, 10);
            if (!isNaN(parsed) && parsed >= 256 && parsed <= 500) {
              setSidebarWidth(parsed);
            }
          }
        }
      })
      .catch(() => {});

    return () => {
      window.removeEventListener("easycode-preference-change", handlePrefChange);
    };
  }, []);

  // Load server-hosted keys dynamically
  useEffect(() => {
    fetch("/api/user/keys")
      .then((r) => r.json())
      .then((d) => {
        if (d.serverHostedKeys) setServerHostedKeys(d.serverHostedKeys);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (searchParams?.get("view") === "settings") {
      setActiveView("settings");
    }
  }, [searchParams]);

  const [activeMode, setActiveMode] = useState<string>("Generate Problem");
  const [difficulty, setDifficulty] = useState<"Easy" | "Medium" | "Hard">("Medium");
  const [selectedTopic, setSelectedTopic] = useState("");
  const [isOnlineEnabled, setIsOnlineEnabled] = useState(true);
  const [isImageMode, setIsImageMode] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [searchFilter, setSearchFilter] = useState("");
  const [userHistory, setUserHistory] = useState<HistoryItem[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [streamingMessageId, setStreamingMessageId] = useState<string | null>(null);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState<string>("");
  const abortControllerRef = useRef<AbortController | null>(null);

  // Claude Spinner Verbs State
  const [currentVerb, setCurrentVerb] = useState<string>("Thinking");
  const [dotIndex, setDotIndex] = useState<number>(0);
  const startTimeRef = useRef<number>(0);

  // Model-state sensitive verb updater: reflects cognitive state over elapsed generation time
  useEffect(() => {
    if (!isLoading) return;

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
  }, [isLoading]);

  // Stored API Keys state
  const [apiKeys, setApiKeys] = useState<Record<string, string>>({});

  // AI Skills & Rules State
  const [skills, setSkills] = useState<AiSkill[]>(BUILT_IN_SKILLS);
  const [rules, setRules] = useState<AiRule[]>(DEFAULT_AI_RULES);
  const [showSkillMenu, setShowSkillMenu] = useState<boolean>(false);
  const [skillMentionQuery, setSkillMentionQuery] = useState<string>("");
  const [selectedSkillMenuIndex, setSelectedSkillMenuIndex] = useState<number>(0);
  const skillMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const savedSkills = localStorage.getItem("easycode_ai_skills");
      if (savedSkills) setSkills(JSON.parse(savedSkills));

      const savedRules = localStorage.getItem("easycode_ai_rules");
      if (savedRules) setRules(JSON.parse(savedRules));
    } catch (e) {}
  }, []);

  const matchingSkills = useMemo(() => {
    const q = skillMentionQuery.toLowerCase().replace(/^[@/]/, "");
    return skills
      .filter((s) => s.enabled)
      .filter((s) => !q || s.mentionKey.toLowerCase().includes(q) || s.name.toLowerCase().includes(q));
  }, [skills, skillMentionQuery]);

  const handleToggleSkillMention = (mentionKey: string) => {
    if (prompt.includes(mentionKey)) {
      setPrompt((prev) => prev.replace(new RegExp(`\\s*${mentionKey}\\s*`, "g"), " ").trim());
    } else {
      setPrompt((prev) => (prev.trim() ? `${mentionKey} ${prev.trim()}` : `${mentionKey} `));
    }
    textareaRef.current?.focus();
  };

  const handleSelectSkillMention = (mentionKey: string) => {
    setPrompt((prev) => {
      const words = prev.split(" ");
      words.pop();
      return `${words.join(" ")}${words.length > 0 ? " " : ""}${mentionKey} `;
    });
    setShowSkillMenu(false);
    textareaRef.current?.focus();
  };

  const handlePromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setPrompt(val);

    const match = val.match(/(?:^|\s)([@/][a-zA-Z0-9_-]*)$/);
    if (match) {
      setSkillMentionQuery(match[1]);
      setShowSkillMenu(true);
      setSelectedSkillMenuIndex(0);
    } else {
      setShowSkillMenu(false);
    }
  };

  const handlePromptKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (showSkillMenu && matchingSkills.length > 0) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedSkillMenuIndex((prev) => (prev + 1) % matchingSkills.length);
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedSkillMenuIndex((prev) => (prev - 1 + matchingSkills.length) % matchingSkills.length);
        return;
      }
      if (e.key === "Enter" || e.key === "Tab") {
        e.preventDefault();
        const selected = matchingSkills[selectedSkillMenuIndex];
        if (selected) {
          handleSelectSkillMention(selected.mentionKey);
        }
        return;
      }
      if (e.key === "Escape") {
        setShowSkillMenu(false);
        return;
      }
    }

    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Uploaded Documents & Drag-and-Drop state
  const [uploadedDocs, setUploadedDocs] = useState<UploadedDoc[]>([]);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [showPlusMenu, setShowPlusMenu] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragCounterRef = useRef<number>(0);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const chatModelDropdownRef = useRef<HTMLDivElement>(null);
  const topicDropdownRef = useRef<HTMLDivElement>(null);
  const plusMenuRef = useRef<HTMLDivElement>(null);

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
        type: file.type || "application/octet-stream",
        isUploading: true,
      };
      newDocs.push(newDoc);

      const isImage = file.type.startsWith("image/") || /\.(png|jpe?g|webp|svg|gif)$/i.test(file.name);

      if (isImage) {
        reader.onload = (e) => {
          const dataUrl = e.target?.result as string;
          setUploadedDocs((prev) =>
            prev.map((d) => (d.id === docId ? { ...d, content: dataUrl, isUploading: false } : d))
          );
        };
        reader.readAsDataURL(file);
      } else {
        reader.onload = (e) => {
          const text = e.target?.result as string;
          setUploadedDocs((prev) =>
            prev.map((d) => (d.id === docId ? { ...d, content: text, isUploading: false } : d))
          );
        };
        reader.readAsText(file);
      }

      reader.onerror = () => {
        setUploadedDocs((prev) => prev.map((d) => (d.id === docId ? { ...d, isUploading: false } : d)));
      };
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

  // Rate Limited Models tracking
  const [rateLimitedModels, setRateLimitedModels] = useState<Set<string>>(new Set());
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

  // Helper: Is a model available based strictly on valid key, verified status, and not rate limited?
  const isModelAvailable = (model: ModelDefinition): boolean => {
    if (!model || !model.requiredKey) return false;
    if (rateLimitedModels.has(model.id)) return false;
    const keyVal = apiKeys[model.requiredKey];
    const isHosted = Boolean(serverHostedKeys[model.requiredKey]);
    const hasValidKey = Boolean((keyVal && typeof keyVal === "string" && keyVal.trim().length > 5) || isHosted);
    if (!hasValidKey) return false;

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

  // List of ONLY available models (configured with verified keys and not rate limited)
  const availableModelsList = useMemo(() => {
    // 1. Get models from other providers
    const standardModels = ALL_MODELS.filter(
      (m) => m.requiredKey !== "cloudflare" && m.requiredKey !== "huggingface"
    ).filter((m) => isModelAvailable(m));

    // 2. Get customized / enabled models for Cloudflare
    const cfEnabledIds = getEnabledModelIds("cloudflare");
    const cfModels = getAllModelsForProvider("cloudflare")
      .filter((m) => cfEnabledIds.includes(m.id))
      .map((m) => ({
        id: m.id,
        name: m.name,
        provider: "Cloudflare",
        category: m.category,
        badge: m.badge,
        contextWindow: m.contextWindow,
        requiredKey: "cloudflare",
      }))
      .filter((m) => isModelAvailable(m));

    // 3. Get customized / enabled models for Hugging Face
    const hfEnabledIds = getEnabledModelIds("huggingface");
    const hfModels = getAllModelsForProvider("huggingface")
      .filter((m) => hfEnabledIds.includes(m.id))
      .map((m) => ({
        id: m.id,
        name: m.name,
        provider: "Hugging Face",
        category: m.category,
        badge: m.badge,
        contextWindow: m.contextWindow,
        requiredKey: "huggingface",
      }))
      .filter((m) => isModelAvailable(m));

    return [...standardModels, ...cfModels, ...hfModels];
  }, [apiKeys, serverHostedKeys, rateLimitedModels, verifiedModelsByProvider, modelsVersion]);

  // Set active model: restore remembered model from localStorage if available, or first available model
  useEffect(() => {
    if (availableModelsList.length > 0) {
      const savedModel = typeof window !== "undefined" ? localStorage.getItem("easycode_last_active_model") : null;
      if (savedModel && availableModelsList.some((m) => m.id === savedModel)) {
        if (activeModel !== savedModel) {
          setActiveModel(savedModel);
        }
      } else if (!activeModel || !availableModelsList.some((m) => m.id === activeModel)) {
        setActiveModel(availableModelsList[0].id);
      }
    } else {
      setActiveModel("");
    }
  }, [availableModelsList]);

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

      // Fetch conversations from Supabase cloud database
      const fetchSupabaseHistory = async () => {
        try {
          const userId = (session?.user as any)?._id || (session?.user as any)?.id;
          let query = supabase.from("conversations").select("*").order("updated_at", { ascending: false }).limit(50);
          if (userId) {
            query = query.or(`user_id.eq.${userId},user_id.is.null`);
          }
          const { data, error } = await query;
          if (!error && data && data.length > 0) {
            const mapped: HistoryItem[] = data.map((row: any) => ({
              id: row.id,
              title: row.title,
              time: row.updated_at ? formatRealTimestamp(row.updated_at) : "Recent",
              timestamp: row.updated_at ? new Date(row.updated_at).getTime() : undefined,
              topic: row.topic,
              level: row.level,
              messages: Array.isArray(row.messages) ? row.messages : [],
            }));
            setUserHistory((prev) => {
              const map = new Map<string, HistoryItem>();
              mapped.forEach((item) => map.set(item.id, item));
              prev.forEach((item) => {
                if (!map.has(item.id)) map.set(item.id, item);
              });
              const merged = Array.from(map.values()).slice(0, 50);
              try {
                localStorage.setItem("easycode_chat_history", JSON.stringify(merged));
              } catch (e) {}
              return merged;
            });
          }
        } catch (e) {
          console.warn("Could not load conversations from Supabase:", e);
        }
      };
      fetchSupabaseHistory();
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
      if (visualEngineDropdownRef.current && !visualEngineDropdownRef.current.contains(event.target as Node)) {
        setShowVisualEngineDropdown(false);
      }
      if (topicDropdownRef.current && !topicDropdownRef.current.contains(event.target as Node)) {
        setShowTopicDropdown(false);
      }
      if (plusMenuRef.current && !plusMenuRef.current.contains(event.target as Node)) {
        setShowPlusMenu(false);
      }
      if (skillMenuRef.current && !skillMenuRef.current.contains(event.target as Node)) {
        setShowSkillMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle container scroll to detect if user manually scrolled up
  const handleContainerScroll = () => {
    if (!scrollContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
    const isNearBottom = distanceFromBottom < 85;
    isUserAtBottomRef.current = isNearBottom;
    setShowScrollBottom(!isNearBottom && messages.length > 0);
  };

  const scrollToBottom = () => {
    isUserAtBottomRef.current = true;
    setShowScrollBottom(false);
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Only auto-scroll down if user is already at the bottom (prevents scroll jumping when user scrolls up during live generation)
  useEffect(() => {
    if (isUserAtBottomRef.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isLoading]);

  // Floating Ask AI on Text Selection (Strictly inside chat viewport, NEVER in Settings or Inputs)
  useEffect(() => {
    const handleSelectionChange = () => {
      // 1. If currently in Settings view, always hide
      if (activeView === "settings") {
        setSelectionTooltip((prev) => (prev.visible ? { ...prev, visible: false } : prev));
        return;
      }

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

      // 2. Ensure selection is strictly inside the active chat scroll viewport
      const anchorNode = selection.anchorNode;
      const focusNode = selection.focusNode;
      const container = scrollContainerRef.current;
      if (!container || !anchorNode || !focusNode || !container.contains(anchorNode) || !container.contains(focusNode)) {
        setSelectionTooltip((prev) => (prev.visible ? { ...prev, visible: false } : prev));
        return;
      }

      // 3. Ignore if selection is inside an input, textarea, or button
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
  }, [activeView]);

  const handleQuoteSelection = (quotedText: string) => {
    const quote = `> "${quotedText}"\n\n`;
    setPrompt((prev) => (prev ? `${prev}\n\n${quote}` : quote));
    setSelectionTooltip({ visible: false, text: "", x: 0, y: 0 });
    window.getSelection()?.removeAllRanges();
    textareaRef.current?.focus();
    toast.success("Referenced selection in chat");
  };

  const saveOrUpdateSession = async (
    allMessages: Message[],
    sessionId: string,
    promptTitle: string,
    topic?: string,
    level?: string
  ) => {
    const cleanTitle = promptTitle.length > 50 ? promptTitle.substring(0, 48) + "..." : promptTitle;
    const finalTopic = topic || selectedTopic;

    // Only assign difficulty level if a LeetCode problem was actually generated in this chat
    const hasGeneratedProblem = allMessages.some(
      (m) => m.generatedProblem || m.problemDetails
    );
    const finalLevel = hasGeneratedProblem ? (level || difficulty) : undefined;
    const nowMs = Date.now();

    setUserHistory((prev) => {
      const existingIdx = prev.findIndex((item) => item.id === sessionId);
      let updated: HistoryItem[];
      if (existingIdx >= 0) {
        updated = [...prev];
        updated[existingIdx] = {
          ...updated[existingIdx],
          messages: allMessages,
          time: "Just now",
          timestamp: nowMs,
          topic: finalTopic || updated[existingIdx].topic,
          level: finalLevel ?? updated[existingIdx].level,
        };
      } else {
        const newItem: HistoryItem = {
          id: sessionId,
          title: cleanTitle,
          time: "Just now",
          timestamp: nowMs,
          topic: finalTopic,
          level: finalLevel,
          messages: allMessages,
        };
        updated = [newItem, ...prev.filter((h) => h.id !== sessionId).slice(0, 49)];
      }
      try {
        localStorage.setItem("easycode_chat_history", JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    // Persist conversation to Supabase cloud database
    try {
      const payload: any = {
        id: sessionId,
        title: cleanTitle,
        topic: finalTopic || null,
        level: finalLevel || null,
        messages: allMessages,
        updated_at: new Date().toISOString(),
      };
      if (currentUserId) {
        payload.user_id = currentUserId;
      }
      await supabase.from("conversations").upsert(payload);
    } catch (e) {
      console.warn("Could not sync conversation to Supabase:", e);
    }
  };

  const handleLoadHistorySession = (item: HistoryItem) => {
    if (isLoading) {
      toast.info("Please wait for current generation to finish or click stop.");
      return;
    }
    setCurrentSessionId(item.id);
    if (item.messages && item.messages.length > 0) {
      setMessages(item.messages);
    } else {
      setMessages([
        {
          id: item.id + "_init",
          role: "user",
          content: item.title,
        },
      ]);
    }
    if (item.topic) setSelectedTopic(item.topic);
    if (item.level) setDifficulty(item.level as any);
    setActiveView("chat");
  };

  const handleDeleteConversation = async (id: string, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    setUserHistory((prev) => {
      const updated = prev.filter((item) => item.id !== id);
      try {
        localStorage.setItem("easycode_chat_history", JSON.stringify(updated));
      } catch (err) {}
      return updated;
    });

    if (currentSessionId === id) {
      setCurrentSessionId(null);
      setMessages([]);
      setPrompt("");
    }

    toast.success("Conversation deleted");

    try {
      await supabase.from("conversations").delete().eq("id", id);
    } catch (err) {
      console.warn("Could not delete conversation from Supabase:", err);
    }
  };

  const clearHistory = async () => {
    setUserHistory([]);
    try {
      localStorage.removeItem("easycode_chat_history");
    } catch (e) {}
    if (currentSessionId) {
      setCurrentSessionId(null);
      setMessages([]);
    }
    toast.success("History cleared");

    try {
      if (currentUserId) {
        await supabase.from("conversations").delete().eq("user_id", currentUserId);
      }
    } catch (err) {
      console.warn("Could not clear Supabase conversations:", err);
    }
  };

  const handleSelectModel = (model: ModelDefinition) => {
    setActiveModel(model.id);
    try {
      localStorage.setItem("easycode_last_active_model", model.id);
    } catch (e) {}
    setShowModelDropdown(false);
    setShowChatModelDropdown(false);
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

  const MODE_PROMPT_SUGGESTIONS: Record<string, { title: string; subtitle: string; placeholder: string; prompts: string[] }> = {
    "Generate Problem": {
      title: "Trending Generate Problem Prompts",
      subtitle: "Click to run",
      placeholder: "e.g. Generate a Hard DP problem on grid path optimization with obstacle costs...",
      prompts: [
        "Create a Hard Dynamic Programming challenge on grid path optimization with obstacle costs",
        "Generate a Graph Shortest Path problem with dynamic obstacle weights and teleportation portals",
        "Design a custom Trie-based autocomplete problem with real-time prefix frequency ranking",
        "Construct an interactive Binary Search problem with real-world floating point precision edge cases",
        "Build a Monotonic Stack problem for stock price span and next greater temperature analysis",
        "Generate a Two-Pointer challenge for trapping rainwater variations with variable container widths",
      ],
    },
    "Explain Algorithm": {
      title: "Trending Explain Algorithm Prompts",
      subtitle: "Deep-dive intuition",
      placeholder: "e.g. Explain the mathematical proof and intuition of the Floyd-Warshall algorithm...",
      prompts: [
        "Explain the mathematical proof and intuition of the Floyd-Warshall all-pairs shortest path algorithm",
        "Break down the KMP string search algorithm's prefix function (LPS) with a step-by-step trace",
        "How does the Segment Tree with Lazy Propagation maintain range update queries in O(log N)?",
        "Explain Monotonic Queue for sliding window maximums and why it achieves amortized O(1) time",
        "Deconstruct the A* pathfinding algorithm with admissible heuristic bounds vs Dijkstra",
        "Explain Union-Find with Path Compression & Rank Optimization and its inverse Ackermann complexity",
      ],
    },
    "Test Cases & Edge Cases": {
      title: "Trending Test Cases & Edge Cases Prompts",
      subtitle: "Adversarial test synthesis",
      placeholder: "e.g. Generate 10 adversarial edge cases for an Array In-Place Rotation algorithm...",
      prompts: [
        "Generate 10 adversarial edge cases for an Array In-Place Rotation algorithm (empty, single, negative, duplicates)",
        "Create a rigorous test matrix for Binary Search on continuous floating-point ranges with epsilon bounds",
        "Construct stress test cases for Longest Increasing Subsequence with all duplicate elements",
        "Generate deep tree degenerate edge cases (skewed linked list tree, empty root, extreme values) for BST validation",
        "Provide boundary test cases for 32-bit integer overflow in math power and division algorithms",
        "Generate graph cycle detection test cases with self-loops, disconnected components, and DAG branches",
      ],
    },
    "Optimize Time & Space": {
      title: "Trending Time & Space Optimization Prompts",
      subtitle: "Algorithmic bottlenecks",
      placeholder: "e.g. Optimize a recursive DP solution to O(1) auxiliary space using state compression...",
      prompts: [
        "Optimize a recursive dynamic programming solution to O(1) auxiliary space using state compression",
        "Convert an O(N^2) brute force sub-array search into an optimal O(N) sliding window hashmap approach",
        "Optimize graph traversal memory footprint using bitmasks for visited state representation",
        "Reduce space complexity of 2D grid DP (e.g. Unique Paths / Edit Distance) to 1D rolling array O(N)",
        "Optimize sorting and searching with Bit Manipulation tricks (XOR swaps, Brian Kernighan bit count)",
        "Transform a recursive DFS tree traversal to iterative Morris Traversal with O(1) extra space",
      ],
    },
    "System Design": {
      title: "Trending System Design Prompts",
      subtitle: "High-scale architecture",
      placeholder: "e.g. Design a distributed real-time code execution engine with sandboxing and memory isolation...",
      prompts: [
        "Design a distributed real-time code execution engine with sandboxing, timeout limits, and memory isolation",
        "Architect an enterprise LeetCode contest leaderboard system handling 100K concurrent score updates",
        "Design an in-memory LRU cache with O(1) read/write, TTL eviction, and thread-safe concurrency",
        "Architect a high-throughput API rate limiter using Sliding Window Counter and Token Bucket algorithms",
        "Design a resilient collaborative code editor syncing state with Operational Transformation / CRDTs",
        "Design a scalable test case validation worker queue with Redis and Docker micro-containers",
      ],
    },
  };

  const currentModeData = MODE_PROMPT_SUGGESTIONS[activeMode] || MODE_PROMPT_SUGGESTIONS["Generate Problem"];

  // Clean LaTeX / Math formulas into readable programming notation
  const cleanAiMathFormula = (formula: string): string => {
    if (!formula) return "";
    return formula
      .replace(/\\mathcal\{O\}\(([^)]+)\)/g, "O($1)")
      .replace(/\\mathcal\{O\}/g, "O")
      .replace(/\\mathcal\{([^}]+)\}/g, "$1")
      .replace(/\\mathbb\{R\}/g, "R")
      .replace(/\\mathbb\{Z\}/g, "Z")
      .replace(/\\mathbb\{N\}/g, "N")
      .replace(/\\mathbf\{([^}]+)\}/g, "$1")
      .replace(/\\mathrm\{([^}]+)\}/g, "$1")
      .replace(/\\text\{([^}]+)\}/g, "$1")
      .replace(/\\texttt\{([^}]+)\}/g, "$1")
      // Floor & Ceiling notation
      .replace(/\\lfloor\s*([\s\S]+?)\s*\\rfloor/g, "floor($1)")
      .replace(/\\lceil\s*([\s\S]+?)\s*\\rceil/g, "ceil($1)")
      .replace(/\\lfloor\b/g, "floor(")
      .replace(/\\rfloor\b/g, ")")
      .replace(/\\lceil\b/g, "ceil(")
      .replace(/\\rceil\b/g, ")")
      // Arrows & Progressions
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
      // Comparisons & Arithmetic Operators
      .replace(/\\le\b|\\leq\b/g, "<=")
      .replace(/\\ge\b|\\geq\b/g, ">=")
      .replace(/\\ne\b|\\neq\b/g, "!=")
      .replace(/\\approx\b/g, "≈")
      .replace(/\\pm\b/g, "±")
      .replace(/\\mp\b/g, "∓")
      .replace(/\\times\b/g, " * ")
      .replace(/\\cdot\b/g, " * ")
      .replace(/\\div\b/g, " / ")
      .replace(/\\in\b/g, "∈")
      .replace(/\\notin\b/g, "∉")
      .replace(/\\infty\b/g, "∞")
      .replace(/\\min\b/g, "min")
      .replace(/\\max\b/g, "max")
      // Fractions & Roots
      .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, "($1 / $2)")
      .replace(/\\sqrt\{([^}]+)\}/g, "sqrt($1)")
      // Brackets & Spacing
      .replace(/\\left[\[\(\{]/g, "(")
      .replace(/\\right[\]\)\}]/g, ")")
      .replace(/\\left|\\right/g, "")
      .replace(/\\quad\b|\\qquad\b/g, " ")
      .replace(/\\,|\\;|\\!/g, " ")
      .replace(/\\_/g, "_")
      .replace(/\{([^{}]+)\}/g, "$1")
      .replace(/\^\{([^}]+)\}/g, "^$1")
      .trim();
  };

  // Format inline spans: **bold**, *italic*, `code`, $math$, [links](url), and strip emojis
  const formatInlineSpans = (text: string) => {
    // 1. Strip emojis to strictly enforce zero-emoji design system
    let cleaned = text.replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F1E6}-\u{1F1FF}]/gu, "").trim();

    // 2. Replace display and inline LaTeX math $...$ or $$...$$ with clean code badge
    cleaned = cleaned
      .replace(/\$\$([\s\S]+?)\$\$/g, (_, m) => `\`${cleanAiMathFormula(m)}\``)
      .replace(/\$([^$\n]+)\$/g, (_, m) => `\`${cleanAiMathFormula(m)}\``)
      .replace(/\\\(([\s\S]+?)\\\)/g, (_, m) => `\`${cleanAiMathFormula(m)}\``)
      .replace(/\\\[([\s\S]+?)\\\]/g, (_, m) => `\`${cleanAiMathFormula(m)}\``);

    // 3. Also clean any leftover raw LaTeX tokens embedded in plain text
    cleaned = cleanAiMathFormula(cleaned);

    // 4. Tokenize by inline code, bold, italic, links
    const parts = cleaned.split(/(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*|\[[^\]]+\]\([^)]+\))/g);

    return parts.map((part, idx) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return (
          <strong key={idx} className="font-semibold text-neutral-900 dark:text-white">
            {part.slice(2, -2)}
          </strong>
        );
      }
      if (part.startsWith("*") && part.endsWith("*")) {
        return <em key={idx} className="italic text-neutral-800 dark:text-neutral-200">{part.slice(1, -1)}</em>;
      }
      if (part.startsWith("`") && part.endsWith("`")) {
        return (
          <code
            key={idx}
            className="px-1.5 py-0.5 mx-0.5 rounded bg-black/[0.05] dark:bg-white/[0.08] font-mono text-[12px] text-neutral-900 dark:text-neutral-100 border border-black/[0.04] dark:border-white/[0.06]"
          >
            {part.slice(1, -1)}
          </code>
        );
      }
      const linkMatch = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
      if (linkMatch) {
        return (
          <a
            key={idx}
            href={linkMatch[2]}
            target="_blank"
            rel="noopener noreferrer"
            className="text-neutral-900 dark:text-white underline underline-offset-2 hover:opacity-80 transition-opacity font-medium"
          >
            {linkMatch[1]}
          </a>
        );
      }
      return <React.Fragment key={idx}>{part}</React.Fragment>;
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

  const renderFormattedMessage = (content: string) => {
    const lines = content.split("\n");
    const elements: React.ReactNode[] = [];
    let i = 0;

    while (i < lines.length) {
      const line = lines[i];
      const trimmed = line.trim();

      // Check for <think>...</think> Reasoning / Chain of Thought Block
      if (trimmed.startsWith("<think>") || (trimmed.includes("<think>") && !trimmed.startsWith("```"))) {
        const thinkLines: string[] = [];
        const firstLine = trimmed.replace(/^.*?<think>/i, "").trim();
        if (firstLine) thinkLines.push(firstLine);
        i++;
        let isClosed = false;
        while (i < lines.length && !lines[i].includes("</think>")) {
          thinkLines.push(lines[i]);
          i++;
        }
        if (i < lines.length && lines[i].includes("</think>")) {
          isClosed = true;
          const lastLine = lines[i].replace(/<\/think>[\s\S]*$/i, "").trim();
          if (lastLine) thinkLines.push(lastLine);
          i++;
        }
        const thinkText = thinkLines.join("\n").trim();
        if (thinkText) {
          elements.push(
            <ThinkingProcessBlock
              key={`think-${i}`}
              thinkingContent={thinkText}
              isStreaming={isLoading && !isClosed}
              verb={currentVerb}
            />
          );
        }
        continue;
      }

      // Check for Memory Saved Block (:::memory-saved{...}:::)
      if (trimmed.includes(":::memory-saved")) {
        const memMatch = trimmed.match(/:::memory-saved(\{.*?\})(?::::)?/);
        if (memMatch) {
          try {
            const memoryData: MemoryInspectItem = JSON.parse(memMatch[1]);
            // Automatically persist to localStorage if not exists
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
                className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/30 hover:border-amber-500/50 text-amber-950 dark:text-amber-100 text-xs font-medium transition-all cursor-pointer select-none my-2.5 shadow-2xs group w-fit max-w-xl"
                title="Click to view or edit this memory in place"
              >
                <div className="w-6 h-6 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0 group-hover:scale-110 transition-transform">
                  <Brain className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-semibold text-amber-700 dark:text-amber-300 uppercase tracking-wide">
                      Memory Saved
                    </span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-800 dark:text-amber-200 font-mono">
                      {memoryData.category || "Goal"}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-800 dark:text-neutral-200 truncate mt-0.5 font-normal">
                    {memoryData.content}
                  </p>
                </div>
                <span className="text-[11px] text-amber-700 dark:text-amber-400 underline font-medium opacity-80 group-hover:opacity-100 shrink-0 ml-1">
                  View &rarr;
                </span>
              </div>
            );
            i++;
            continue;
          } catch (e) {}
        }
      }

      // Check for Mermaid Code Block (```mermaid ... ```)
      if (trimmed.startsWith("```mermaid")) {
        const mermaidLines: string[] = [];
        i++; // skip ```mermaid
        while (i < lines.length && !lines[i].trim().startsWith("```")) {
          mermaidLines.push(lines[i]);
          i++;
        }
        if (i < lines.length && lines[i].trim().startsWith("```")) {
          i++; // skip closing ```
        }
        const chartCode = mermaidLines.join("\n").trim();
        elements.push(
          <MermaidFlowchartViewer
            key={`mermaid-${i}`}
            chart={chartCode}
            title="System Architecture / Flowchart"
          />
        );
        continue;
      }

      // Check for Code Fenced Block (```lang ... ```)
      if (trimmed.startsWith("```")) {
        const lang = trimmed.slice(3).trim() || "code";
        const codeLines: string[] = [];
        i++; // skip opening ```
        while (i < lines.length && !lines[i].trim().startsWith("```")) {
          codeLines.push(lines[i]);
          i++;
        }
        if (i < lines.length && lines[i].trim().startsWith("```")) {
          i++; // skip closing ```
        }
        const codeText = codeLines.join("\n");

        // Check if this is an SVG Vector Diagram
        const isSvgCode =
          lang.toLowerCase() === "svg" ||
          (lang.toLowerCase() === "xml" && codeText.includes("<svg") && codeText.includes("</svg>")) ||
          (codeText.trim().startsWith("<svg") && codeText.includes("</svg>"));

        if (isSvgCode) {
          elements.push(
            <SvgDiagramViewer
              key={`svg-${i}`}
              svgCode={codeText}
              title="Vector Architecture Diagram"
            />
          );
          continue;
        }

        elements.push(
          <div
            key={`code-${i}`}
            className="my-3 rounded-xl overflow-hidden border border-[#DFDAD0] dark:border-[#383532] bg-[#141414] text-neutral-100 font-mono text-xs shadow-xs"
          >
            <div className="flex items-center justify-between px-3 py-1.5 bg-[#1C1B19] border-b border-white/[0.08] text-[11px] text-neutral-400">
              <span className="font-mono text-neutral-300">{lang}</span>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(codeText);
                  toast.success("Code copied to clipboard");
                }}
                className="flex items-center gap-1 text-neutral-400 hover:text-white transition-colors cursor-pointer text-[11px]"
              >
                <Copy className="w-3 h-3" />
                <span>Copy</span>
              </button>
            </div>
            <pre className="p-3.5 overflow-x-auto leading-relaxed whitespace-pre font-mono text-xs text-neutral-200">
              {codeText}
            </pre>
          </div>
        );
        continue;
      }

      // Check for Raw SVG Block (<svg ... </svg>)
      if (trimmed.startsWith("<svg") || (trimmed.includes("<svg") && !trimmed.startsWith("```"))) {
        const svgLines: string[] = [];
        while (i < lines.length && !lines[i].includes("</svg>")) {
          svgLines.push(lines[i]);
          i++;
        }
        if (i < lines.length && lines[i].includes("</svg>")) {
          svgLines.push(lines[i]);
          i++;
        }
        const rawSvgCode = svgLines.join("\n").trim();
        if (rawSvgCode.includes("<svg") && rawSvgCode.includes("</svg>")) {
          elements.push(
            <SvgDiagramViewer
              key={`svg-raw-${i}`}
              svgCode={rawSvgCode}
              title="Vector Architecture Diagram"
            />
          );
          continue;
        }
      }

      // Check for Video (@[video](...))
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

      // Check for Image (![alt](...))
      const imageMatch = trimmed.match(/!\[([^\]]*)\]\(([^)]+)\)/);
      if (imageMatch) {
        const alt = imageMatch[1] || "Generated Visual";
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

      // Check for Markdown Table
      if (
        trimmed.startsWith("|") &&
        trimmed.endsWith("|") &&
        i + 1 < lines.length &&
        lines[i + 1].trim().includes("---")
      ) {
        const tableLines: string[] = [];
        while (i < lines.length && lines[i].trim().startsWith("|")) {
          tableLines.push(lines[i]);
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

      // Headers (H1, H2, H3, H4)
      if (trimmed.startsWith("# ")) {
        elements.push(
          <h1 key={`h1-${i}`} className="text-lg sm:text-xl font-bold text-neutral-950 dark:text-white pt-3 pb-1 tracking-tight font-sans border-b border-black/[0.06] dark:border-white/[0.08]">
            {formatInlineSpans(trimmed.replace(/^#\s+/, ""))}
          </h1>
        );
        i++;
        continue;
      }

      if (trimmed.startsWith("## ")) {
        elements.push(
          <h2 key={`h2-${i}`} className="text-base sm:text-lg font-bold text-neutral-900 dark:text-neutral-50 pt-2.5 pb-1 tracking-tight font-sans">
            {formatInlineSpans(trimmed.replace(/^##\s+/, ""))}
          </h2>
        );
        i++;
        continue;
      }

      if (trimmed.startsWith("### ")) {
        elements.push(
          <h3 key={`h3-${i}`} className="text-sm font-bold text-neutral-900 dark:text-neutral-100 pt-2 pb-1 tracking-tight">
            {formatInlineSpans(trimmed.replace(/^###\s+/, ""))}
          </h3>
        );
        i++;
        continue;
      }

      if (trimmed.startsWith("#### ")) {
        elements.push(
          <h4 key={`h4-${i}`} className="text-xs font-bold text-neutral-900 dark:text-neutral-100 pt-1.5 pb-0.5 uppercase tracking-wider">
            {formatInlineSpans(trimmed.replace(/^####\s+/, ""))}
          </h4>
        );
        i++;
        continue;
      }

      // Blockquotes
      if (trimmed.startsWith("> ")) {
        elements.push(
          <blockquote key={`quote-${i}`} className="border-l-2 border-neutral-300 dark:border-neutral-700 pl-3 py-1 my-1.5 text-xs italic text-neutral-600 dark:text-neutral-400">
            {formatInlineSpans(trimmed.replace(/^>\s*/, ""))}
          </blockquote>
        );
        i++;
        continue;
      }

      // Bullet items (* , - , • )
      if (trimmed.startsWith("•") || trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
        const cleanText = trimmed.replace(/^[•\-\*]\s*/, "");
        elements.push(
          <div key={`bullet-${i}`} className="flex items-start gap-2.5 pl-1 my-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-neutral-400 dark:bg-neutral-500 mt-2 shrink-0" />
            <span className="flex-1 text-[inherit] leading-relaxed text-[#242220] dark:text-[#E2DFD8]">
              {formatInlineSpans(cleanText)}
            </span>
          </div>
        );
        i++;
        continue;
      }

      // Numbered items (1. , 2. )
      const numMatch = trimmed.match(/^(\d+)\.\s*(.+)/);
      if (numMatch) {
        elements.push(
          <div key={`num-${i}`} className="flex items-start gap-2 pl-1 my-1.5">
            <span className="font-mono text-[0.85em] font-semibold text-neutral-500 shrink-0 mt-0.5">
              {numMatch[1]}.
            </span>
            <span className="flex-1 text-[inherit] leading-relaxed text-[#242220] dark:text-[#E2DFD8]">
              {formatInlineSpans(numMatch[2])}
            </span>
          </div>
        );
        i++;
        continue;
      }

      // Standard text line
      if (trimmed) {
        elements.push(
          <p key={`line-${i}`} className="leading-relaxed my-1 text-[#242220] dark:text-[#E2DFD8]">
            {formatInlineSpans(line)}
          </p>
        );
      } else {
        elements.push(<div key={`space-${i}`} className="h-1.5" />);
      }
      i++;
    }

    return <div className="space-y-0.5">{elements}</div>;
  };

  const handleCancelGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsLoading(false);
      toast.info("Generation interrupted");
    }
  };

  const handleSaveEditedMessage = (msgId: string) => {
    if (!editingText.trim() || isLoading) return;
    const msgIndex = messages.findIndex((m) => m.id === msgId);
    if (msgIndex === -1) return;

    // Reset / fork conversation history to this point (truncate all messages from msgIndex onwards)
    const trimmedMessages = messages.slice(0, msgIndex);
    const newText = editingText;
    setEditingMessageId(null);
    setEditingText("");

    handleSend(newText, trimmedMessages);
  };

  const handleSend = async (customPromptText?: string, overrideMessages?: Message[]) => {
    const textToSend = customPromptText !== undefined ? customPromptText : prompt;
    if ((!textToSend.trim() && uploadedDocs.length === 0) || isLoading) return;

    isUserAtBottomRef.current = true;
    setShowScrollBottom(false);
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 60);

    const lowerText = textToSend.toLowerCase().trim();

    // 1. Detect Image & Video Synthesis Requests
    const isImageQuery =
      isImageMode ||
      lowerText.startsWith("/image") ||
      lowerText.startsWith("create image") ||
      lowerText.startsWith("create a image") ||
      lowerText.startsWith("create an image") ||
      lowerText.startsWith("generate image") ||
      lowerText.startsWith("generate a image") ||
      lowerText.startsWith("generate an image") ||
      lowerText.startsWith("draw an image") ||
      lowerText.startsWith("draw a image") ||
      lowerText.startsWith("draw a picture") ||
      lowerText.startsWith("draw picture") ||
      lowerText.startsWith("draw a diagram") ||
      lowerText.startsWith("draw diagram") ||
      lowerText.startsWith("draw ") ||
      lowerText.startsWith("make an image") ||
      lowerText.startsWith("make a image") ||
      lowerText.startsWith("make image") ||
      lowerText.startsWith("render an image") ||
      lowerText.startsWith("render a image") ||
      lowerText.startsWith("render image") ||
      lowerText.startsWith("visualize an image") ||
      lowerText.startsWith("visualize in image") ||
      lowerText.includes("generate an image") ||
      lowerText.includes("generate a image") ||
      lowerText.includes("create an image of") ||
      lowerText.includes("generate image of") ||
      lowerText.includes("draw an image of");

    const isVideoQuery =
      lowerText.startsWith("/video") ||
      lowerText.startsWith("create video") ||
      lowerText.startsWith("create a video") ||
      lowerText.startsWith("generate video") ||
      lowerText.startsWith("generate a video") ||
      lowerText.startsWith("generate an video") ||
      lowerText.startsWith("make a video") ||
      lowerText.startsWith("make video") ||
      lowerText.startsWith("render video") ||
      lowerText.startsWith("render a video") ||
      lowerText.includes("generate a video") ||
      lowerText.includes("create a video");

    // 2. Detect Explicit Problem Generation Requests (navigates to /problem/new with Gamma live engine)
    const isExplicitProblemRequest =
      !isImageQuery &&
      !isVideoQuery &&
      (lowerText.startsWith("construct an interactive") ||
        lowerText.startsWith("generate a coding problem") ||
        lowerText.startsWith("generate a dsa problem") ||
        lowerText.startsWith("generate a leetcode problem") ||
        lowerText.startsWith("generate an algorithm problem") ||
        lowerText.startsWith("create a coding problem") ||
        lowerText.startsWith("create a dsa problem") ||
        lowerText.startsWith("create a leetcode problem") ||
        lowerText.startsWith("build a coding problem") ||
        lowerText.startsWith("create a hard ") ||
        lowerText.startsWith("create a medium ") ||
        lowerText.startsWith("create an easy ") ||
        lowerText.includes("problem specification for leetcode") ||
        lowerText.includes("generate a problem on") ||
        lowerText.includes("create a problem on"));

    // Save prompt & generation params
    try {
      sessionStorage.setItem("easycode_live_generate_prompt", textToSend);
      sessionStorage.setItem("easycode_live_generate_diff", difficulty);
      sessionStorage.setItem("easycode_live_generate_topic", selectedTopic || "Algorithms");
      sessionStorage.setItem("easycode_live_generate_model", activeModel || "gemini-3.6-flash");
    } catch (e) {}

    // If asking explicitly for problem generation, navigate to Problem Page with live Gamma builder
    if (isExplicitProblemRequest) {
      window.location.href = `/problem/new?generate=true&prompt=${encodeURIComponent(textToSend)}&difficulty=${encodeURIComponent(difficulty)}&topic=${encodeURIComponent(selectedTopic || "Algorithms")}&model=${encodeURIComponent(activeModel || "gemini-3.6-flash")}`;
      return;
    }

    const sessionId = currentSessionId || Date.now().toString();
    if (!currentSessionId) {
      setCurrentSessionId(sessionId);
    }

    const baseMessages = overrideMessages !== undefined ? overrideMessages : messages;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: textToSend,
      uploadedFiles: uploadedDocs.length > 0 ? uploadedDocs.map((d) => d.name) : undefined,
    };

    const assistantId = (Date.now() + 1).toString();
    const initialAssistantMsg: Message = {
      id: assistantId,
      role: "assistant",
      content: "",
      modelUsed: activeModel,
    };

    const nextMessages = [...baseMessages, userMessage, initialAssistantMsg];
    setMessages(nextMessages);
    setStreamingMessageId(assistantId);
    setPrompt("");
    const docsToSend = [...uploadedDocs];
    setUploadedDocs([]);

    setIsLoading(true);
    const controller = new AbortController();
    abortControllerRef.current = controller;

    let accumulatedText = "";
    let finalModelUsed = activeModel;

    try {
      let loadedMemories: any[] = [];
      try {
        loadedMemories = JSON.parse(localStorage.getItem("easycode_user_memories") || "[]");
      } catch (e) {}

      const willStream = !isImageQuery && !isVideoQuery;
      const res = await fetch("/api/code/chat-output", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          inputMessage: textToSend,
          messages: baseMessages.map((m) => ({ role: m.role, content: m.content })),
          model: activeModel || "auto",
          visualEngine: activeVisualEngine,
          customKeys: apiKeys,
          onlineSearch: isOnlineEnabled,
          isImageMode: isImageMode || isImageQuery,
          uploadedDocs: docsToSend,
          problemInfo: selectedTopic ? { title: selectedTopic, level: difficulty } : null,
          skills: skills,
          rules: rules,
          memories: loadedMemories,
          stream: willStream,
        }),
      });

      const contentType = res.headers.get("content-type") || "";

      if (willStream && res.ok && res.body && !contentType.includes("application/json")) {
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const raw = line.slice(6).trim();
              if (!raw || raw === "[DONE]") continue;
              try {
                const event = JSON.parse(raw);
                if (event.type === "chunk") {
                  const chunk = event.text || event.content || "";
                  if (chunk) {
                    accumulatedText += chunk;
                    setMessages((prev) =>
                      prev.map((m) =>
                        m.id === assistantId ? { ...m, content: accumulatedText } : m
                      )
                    );
                  }
                } else if (event.type === "thinking_stage") {
                  if (event.verb) setCurrentVerb(event.verb);
                } else if (event.type === "done") {
                  if (event.output && !accumulatedText) {
                    accumulatedText = event.output;
                  }
                  if (event.modelUsed) finalModelUsed = event.modelUsed;
                } else if (event.type === "error") {
                  throw new Error(event.error || "Generation error");
                }
              } catch (parseErr: any) {
                // Ignore partial json parse error during chunk split
              }
            }
          }
        }
      } else {
        const data = await res.json();
        if (data?.isRateLimited && data?.rateLimitedModel) {
          setRateLimitedModels((prev) => new Set([...prev, data.rateLimitedModel]));
        }
        accumulatedText = data?.output || "I'm EasyCode AI. How can I help you code, analyze algorithms, or design software today?";
        if (data?.modelUsed) finalModelUsed = data.modelUsed;
      }

      // Helper: parse code block if single clean code block
      let codeSnippetData: { code: string; language: string } | undefined = undefined;
      const codeBlockMatch = accumulatedText.match(/```([a-zA-Z0-9_-]*)\n([\s\S]*?)```/);
      if (codeBlockMatch && accumulatedText.trim().startsWith("```") && accumulatedText.trim().endsWith("```")) {
        codeSnippetData = {
          language: codeBlockMatch[1] || "python",
          code: codeBlockMatch[2],
        };
      }

      const assistantMsg: Message = {
        id: assistantId,
        role: "assistant",
        content: accumulatedText,
        modelUsed: finalModelUsed,
        codeSnippet: codeSnippetData,
      };

      setMessages((prev) => {
        const updated = prev.map((m) => (m.id === assistantId ? assistantMsg : m));
        saveOrUpdateSession(updated, sessionId, textToSend, selectedTopic, difficulty);
        return updated;
      });
    } catch (err: any) {
      if (err?.name === "AbortError") {
        const interruptedMsg: Message = {
          id: assistantId,
          role: "assistant",
          content: accumulatedText
            ? `${accumulatedText}\n\n*(Generation interrupted by user)*`
            : "*(Generation interrupted by user)*",
          modelUsed: finalModelUsed,
        };
        setMessages((prev) => {
          const updated = prev.map((m) => (m.id === assistantId ? interruptedMsg : m));
          saveOrUpdateSession(updated, sessionId, textToSend, selectedTopic, difficulty);
          return updated;
        });
      } else {
        const errorMsg: Message = {
          id: assistantId,
          role: "assistant",
          content: `**Error**: \`${err?.message || "Failed to communicate with AI server"}\`\n\n*Please verify your API key and connection settings in Settings.*`,
          modelUsed: finalModelUsed,
        };
        setMessages((prev) => {
          const updated = prev.map((m) => (m.id === assistantId ? errorMsg : m));
          saveOrUpdateSession(updated, sessionId, textToSend, selectedTopic, difficulty);
          return updated;
        });
      }
    } finally {
      setIsLoading(false);
      setStreamingMessageId(null);
      abortControllerRef.current = null;
      if (isImageMode) setIsImageMode(false);
    }
  };

  const copyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const startNewChat = () => {
    if (isLoading) {
      handleCancelGeneration();
    }
    setCurrentSessionId(null);
    setStreamingMessageId(null);
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

  const activeModelObj = useMemo(() => {
    return ALL_MODELS.find((m) => m.id === activeModel);
  }, [activeModel]);

  const currentUserId = (session?.user as any)?._id || (session?.user as any)?.id || "";
  const username = session?.user?.name || (session?.user as any)?.username || "Developer";
  const userEmail = session?.user?.email || "";

  const renderPromptBox = () => (
    <div
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className="relative z-30 w-full bg-[#ECE8DF]/70 dark:bg-[#282624]/70 backdrop-blur-xl border border-[#DFDAD0] dark:border-[#383532] rounded-2xl shadow-lg shadow-black/[0.02] dark:shadow-black/20 p-3.5 transition-all focus-within:border-black/20 dark:focus-within:border-white/20"
    >
      {/* Hidden File Input for Any Extension */}
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

      {/* Skill Mention Autocomplete Popup */}
      {showSkillMenu && matchingSkills.length > 0 && (
        <div
          ref={skillMenuRef}
          className="absolute bottom-full left-0 mb-2 w-80 bg-white dark:bg-[#1E1D1B] border border-[#DFDAD0] dark:border-[#383532] rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-bottom-2"
        >
          <div className="px-3 py-1.5 bg-black/[0.03] dark:bg-white/[0.04] border-b border-black/[0.04] dark:border-white/[0.04] flex items-center justify-between text-[11px] text-neutral-500 font-medium">
            <span>Mention AI Skill</span>
            <span className="text-[10px]">↑↓ navigate • Enter/Tab insert</span>
          </div>
          <div className="max-h-52 overflow-y-auto p-1 space-y-0.5">
            {matchingSkills.map((skill, idx) => (
              <button
                key={skill.id}
                type="button"
                onClick={() => handleSelectSkillMention(skill.mentionKey)}
                onMouseEnter={() => setSelectedSkillMenuIndex(idx)}
                className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between cursor-pointer transition-colors ${
                  selectedSkillMenuIndex === idx
                    ? "bg-amber-500 text-white font-medium"
                    : "text-neutral-800 dark:text-neutral-200 hover:bg-black/[0.04] dark:hover:bg-white/[0.06]"
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <span className="font-mono font-bold text-[11px]">{skill.mentionKey}</span>
                  <span className="truncate text-[11px] opacity-85">{skill.name}</span>
                </div>
                <span className="text-[10px] opacity-70 ml-2 uppercase font-semibold shrink-0">
                  {skill.badge}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Drag & Drop Overlay inside Prompt Box */}
      {isDragging && (
        <div className="absolute inset-0 z-50 bg-[#ECE8DF]/95 dark:bg-[#282624]/95 backdrop-blur-xs rounded-2xl border-2 border-dashed border-neutral-400 dark:border-neutral-600 flex flex-col items-center justify-center text-center p-6 space-y-2 animate-in fade-in duration-150">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-black/[0.05] dark:bg-white/[0.08] text-neutral-700 dark:text-neutral-200">
              <FileText className="w-5 h-5" />
            </div>
            <div className="p-2.5 rounded-xl bg-black/[0.05] dark:bg-white/[0.08] text-neutral-700 dark:text-neutral-200">
              <ImageIcon className="w-5 h-5" />
            </div>
            <div className="p-2.5 rounded-xl bg-black/[0.05] dark:bg-white/[0.08] text-neutral-700 dark:text-neutral-200">
              <FileCode className="w-5 h-5" />
            </div>
          </div>
          <div className="space-y-0.5">
            <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">
              Drag & drop files to upload
            </h3>
            <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
              or <span className="underline cursor-pointer" onClick={() => fileInputRef.current?.click()}>browse file</span> on your computer
            </p>
          </div>
        </div>
      )}

      {/* Uploaded Document Chips */}
      {uploadedDocs.length > 0 && (
        <div className="flex items-center gap-1.5 flex-wrap pb-2 mb-2 border-b border-black/[0.04] dark:border-white/[0.04]">
          {uploadedDocs.map((doc) => {
            const Icon = getFileIcon(doc.name);
            return (
              <div
                key={doc.id}
                className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/80 dark:bg-[#1e1d1b] border border-black/[0.08] dark:border-white/[0.08] text-xs font-medium text-neutral-800 dark:text-neutral-200 shadow-2xs animate-in fade-in"
              >
                {doc.isUploading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-neutral-500" />
                ) : (
                  <Icon className="w-3.5 h-3.5 text-neutral-600 dark:text-neutral-400" />
                )}
                <span className="truncate max-w-[140px]">{doc.name}</span>
                <button
                  onClick={() => handleRemoveDoc(doc.id)}
                  className="p-0.5 rounded-full hover:bg-black/10 dark:hover:bg-white/10 text-neutral-400 hover:text-neutral-700 dark:hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Active Mode Badges */}
      {(isImageMode || isOnlineEnabled) && (
        <div className="flex items-center gap-1.5 flex-wrap pb-2 mb-1.5">
          {isImageMode && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-[#EFECE6] dark:bg-[#2A2825] text-[#1C1B19] dark:text-[#EDEDEB] border border-[#DFDAD0] dark:border-[#383532] shadow-2xs animate-in fade-in">
              <ImageIcon className="w-3.5 h-3.5 text-[#524E48] dark:text-[#A8A49D]" />
              <span>Image Mode</span>
              <span className="w-1.5 h-1.5 rounded-full bg-amber-600 dark:bg-amber-400" />
              <button
                type="button"
                onClick={() => setIsImageMode(false)}
                className="hover:text-black dark:hover:text-white ml-0.5 transition-colors cursor-pointer text-[#8C877D]"
                title="Disable Image Mode"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {isOnlineEnabled && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-[#EFECE6] dark:bg-[#2A2825] text-[#1C1B19] dark:text-[#EDEDEB] border border-[#DFDAD0] dark:border-[#383532] shadow-2xs animate-in fade-in">
              <Globe className="w-3.5 h-3.5 text-[#524E48] dark:text-[#A8A49D]" />
              <span>Web Search Active</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 dark:bg-emerald-400" />
              <button
                type="button"
                onClick={() => setIsOnlineEnabled(false)}
                className="hover:text-black dark:hover:text-white ml-0.5 transition-colors cursor-pointer text-[#8C877D]"
                title="Disable Web Search"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
        </div>
      )}

      {/* Text Input or Audio Visualizer */}
      {isRecordingAudio ? (
        <div className="py-1">
          <AudioRecordingVisualizer
            isOpen={isRecordingAudio}
            onTranscription={(text) => {
              setPrompt((prev) => (prev ? `${prev} ${text}` : text));
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
          value={prompt}
          onChange={handlePromptChange}
          onKeyDown={handlePromptKeyDown}
          placeholder={
            isImageMode
              ? "Describe the visual flowchart, system architecture, or diagram to generate..."
              : currentModeData.placeholder
          }
          className="w-full bg-transparent resize-none outline-hidden text-[#1C1B19] dark:text-[#EDEDEB] placeholder-[#8C877D] dark:placeholder-[#736F68] text-sm md:text-base min-h-[56px] leading-relaxed"
          rows={2}
        />
      )}

      {/* Bottom Toolbar: STRICTLY SINGLE ROW, NEVER WRAPS */}
      <div className="pt-2.5 border-t border-black/[0.04] dark:border-white/[0.04] flex items-center justify-between gap-2">
        
        {/* Left Controls: Plus, Mode, Model, Visual Engine */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Plus (+) Button */}
          <div className="relative shrink-0" ref={plusMenuRef}>
            <button
              type="button"
              onClick={() => setShowPlusMenu(!showPlusMenu)}
              className={`w-8 h-8 rounded-xl border transition-all flex items-center justify-center cursor-pointer shadow-2xs ${
                showPlusMenu
                  ? "bg-[#1C1B19] text-white dark:bg-white dark:text-[#1C1B19] border-transparent"
                  : "border-black/[0.08] dark:border-white/[0.1] bg-white/70 dark:bg-white/[0.04] hover:bg-white dark:hover:bg-white/[0.08] text-neutral-700 dark:text-neutral-300"
              }`}
              title="Attach files, skills, and tools"
            >
              <Plus className={`w-4 h-4 transition-transform duration-200 ${showPlusMenu ? "rotate-45" : ""}`} />
            </button>

            {showPlusMenu && (
              <div
                className="absolute bottom-full left-0 mb-2.5 w-72 md:w-84 bg-[#FBF9F4] dark:bg-[#1E1D1B] border border-[#DFDAD0] dark:border-[#383532] rounded-2xl shadow-xl dark:shadow-2xl p-1.5 z-50 animate-in fade-in text-xs"
              >
                <button
                  type="button"
                  onClick={() => {
                    setShowPlusMenu(false);
                    fileInputRef.current?.click();
                  }}
                  className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-black/[0.05] dark:hover:bg-white/[0.08] flex items-center gap-3 transition-colors cursor-pointer group"
                >
                  <Paperclip className="w-4 h-4 text-[#524E48] dark:text-neutral-300 group-hover:text-black dark:group-hover:text-white shrink-0" />
                  <div className="flex items-baseline gap-2 flex-wrap min-w-0">
                    <span className="font-medium text-[#1C1B19] dark:text-white text-[13px]">Add photos & files</span>
                    <span className="text-[11px] text-[#7A756C] dark:text-[#8C8880]">Upload from computer</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowPlusMenu(false);
                    if (userHistory.length > 0) {
                      toast.info(`Viewing recent library (${userHistory.length} saved sessions)`);
                    } else {
                      toast.info("No saved library items yet. Your generated problems and files will appear here.");
                    }
                  }}
                  className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-black/[0.05] dark:hover:bg-white/[0.08] flex items-center gap-3 transition-colors cursor-pointer group"
                >
                  <FolderOpen className="w-4 h-4 text-[#524E48] dark:text-neutral-300 group-hover:text-black dark:group-hover:text-white shrink-0" />
                  <div className="flex items-baseline gap-2 flex-wrap min-w-0">
                    <span className="font-medium text-[#1C1B19] dark:text-white text-[13px]">Add from library</span>
                    <span className="text-[11px] text-[#7A756C] dark:text-[#8C8880]">Browse and search your files</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowPlusMenu(false);
                    const next = !isImageMode;
                    setIsImageMode(next);
                    if (next) {
                      toast.success("Image Generation Mode enabled: Describe any visual, diagram, or artwork.");
                    } else {
                      toast.info("Image Generation Mode disabled");
                    }
                    textareaRef.current?.focus();
                  }}
                  className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-black/[0.05] dark:hover:bg-white/[0.08] flex items-center gap-3 transition-colors cursor-pointer group"
                >
                  <ImageIcon className="w-4 h-4 text-[#524E48] dark:text-neutral-300 group-hover:text-black dark:group-hover:text-white shrink-0" />
                  <div className="flex items-baseline gap-2 flex-wrap min-w-0">
                    <span className="font-medium text-[#1C1B19] dark:text-white text-[13px] flex items-center gap-1.5">
                      <span>Create image</span>
                      {isImageMode && <span className="w-1.5 h-1.5 rounded-full bg-amber-600 dark:bg-amber-400" />}
                    </span>
                    <span className="text-[11px] text-[#7A756C] dark:text-[#8C8880]">FLUX.1 / DALL-E</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowPlusMenu(false);
                    setPrompt("/video ");
                    textareaRef.current?.focus();
                    toast.info("Video Generation: Type what video or motion you want to render.");
                  }}
                  className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-black/[0.05] dark:hover:bg-white/[0.08] flex items-center gap-3 transition-colors cursor-pointer group"
                >
                  <Film className="w-4 h-4 text-[#524E48] dark:text-neutral-300 group-hover:text-black dark:group-hover:text-white shrink-0" />
                  <div className="flex items-baseline gap-2 flex-wrap min-w-0">
                    <span className="font-medium text-[#1C1B19] dark:text-white text-[13px]">
                      <span>Generate video</span>
                    </span>
                    <span className="text-[11px] text-[#7A756C] dark:text-[#8C8880]">Motion AI / Wan 2.1</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowPlusMenu(false);
                    setPrompt("/flowchart ");
                    textareaRef.current?.focus();
                    toast.info("Flowchart Studio: Describe the system architecture, logic loop, or algorithm flow.");
                  }}
                  className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-black/[0.05] dark:hover:bg-white/[0.08] flex items-center gap-3 transition-colors cursor-pointer group"
                >
                  <Network className="w-4 h-4 text-[#524E48] dark:text-neutral-300 group-hover:text-black dark:group-hover:text-white shrink-0" />
                  <div className="flex items-baseline gap-2 flex-wrap min-w-0">
                    <span className="font-medium text-[#1C1B19] dark:text-white text-[13px]">
                      <span>Build flowchart</span>
                    </span>
                    <span className="text-[11px] text-[#7A756C] dark:text-[#8C8880]">Mermaid Architecture</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowPlusMenu(false);
                    const next = !isOnlineEnabled;
                    setIsOnlineEnabled(next);
                    if (next) {
                      toast.success("Web search enabled: Real-time info");
                    } else {
                      toast.info("Web search disabled");
                    }
                  }}
                  className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-black/[0.05] dark:hover:bg-white/[0.08] flex items-center gap-3 transition-colors cursor-pointer group"
                >
                  <Globe className="w-4 h-4 shrink-0 text-[#524E48] dark:text-neutral-300 group-hover:text-black dark:group-hover:text-white transition-colors" />
                  <div className="flex items-baseline gap-2 flex-wrap min-w-0">
                    <span className="font-medium text-[#1C1B19] dark:text-white text-[13px] flex items-center gap-1.5">
                      <span>Web search</span>
                      {isOnlineEnabled && <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 dark:bg-emerald-400" />}
                    </span>
                    <span className="text-[11px] text-[#7A756C] dark:text-[#8C8880]">Find real-time news and info</span>
                  </div>
                </button>
              </div>
            )}
          </div>

          {/* Mode Pill */}
          <div className="relative shrink-0" ref={topicDropdownRef}>
            <button
              onClick={() => setShowTopicDropdown(!showTopicDropdown)}
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-xl border border-black/[0.08] dark:border-white/[0.1] bg-white/70 dark:bg-white/[0.04] hover:bg-white dark:hover:bg-white/[0.08] text-[#4A4640] dark:text-[#C5C2BA] shadow-2xs transition-colors shrink-0 whitespace-nowrap cursor-pointer"
            >
              <Layers className="w-3.5 h-3.5 opacity-60 shrink-0" />
              <span className="truncate max-w-[110px]">{selectedTopic || activeMode}</span>
              <ChevronDown className="w-3 h-3 opacity-60 shrink-0" />
            </button>

            {showTopicDropdown && (
              <div className="absolute bottom-full left-0 mb-2.5 w-52 max-h-56 overflow-y-auto bg-white dark:bg-[#252321] border border-[#E8E4DB] dark:border-[#383531] rounded-xl shadow-xl py-1 z-50 text-xs">
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

          {/* Model Selection Pill */}
          <div className="relative shrink-0" ref={chatModelDropdownRef}>
            <button
              onClick={() => setShowChatModelDropdown(!showChatModelDropdown)}
              className="flex items-center gap-2 text-xs px-3 py-1.5 rounded-xl border border-black/[0.08] dark:border-white/[0.1] bg-white/70 dark:bg-white/[0.04] hover:bg-white dark:hover:bg-white/[0.08] text-[#1C1B19] dark:text-[#EDEDEB] shadow-2xs transition-colors font-medium shrink-0 whitespace-nowrap cursor-pointer"
            >
              <ProviderLogo provider={activeModelObj?.provider} modelId={activeModel} className="w-3.5 h-3.5 text-current shrink-0" />
              <span className="truncate max-w-[130px]">
                {activeModelObj ? cleanModelName(activeModelObj.name) : "Select Model"}
              </span>
              <ChevronDown className="w-3 h-3 opacity-60 ml-0.5 shrink-0" />
            </button>

            {showChatModelDropdown && (
              <div className="absolute bottom-full left-0 mb-2.5 w-72 max-h-60 overflow-y-auto bg-white dark:bg-[#252321] border border-[#E8E4DB] dark:border-[#383531] rounded-xl shadow-2xl py-1 z-50 text-xs font-mono">
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
                            <ProviderLogo provider={m.provider} modelId={m.id} className="w-3.5 h-3.5 shrink-0 text-current" />
                            <div className="flex flex-col">
                              <span className="truncate">{cleanModelName(m.name)}</span>
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

          {/* Visual & Media Engine Selection Pill */}
          <div className="relative shrink-0" ref={visualEngineDropdownRef}>
            <button
              onClick={() => setShowVisualEngineDropdown(!showVisualEngineDropdown)}
              className="flex items-center gap-2 text-xs px-3 py-1.5 rounded-xl border border-black/[0.08] dark:border-white/[0.1] bg-white/70 dark:bg-white/[0.04] hover:bg-white dark:hover:bg-white/[0.08] text-[#1C1B19] dark:text-[#EDEDEB] shadow-2xs transition-colors font-medium shrink-0 whitespace-nowrap cursor-pointer"
              title="Select Image & Video Generation Engine"
            >
              <ProviderLogo provider={activeVisualEngineObj.provider} modelId={activeVisualEngineObj.id} className="w-3.5 h-3.5 text-current shrink-0" />
              <span className="truncate max-w-[130px]">
                {cleanModelName(activeVisualEngineObj.name)}
              </span>
              <ChevronDown className="w-3 h-3 opacity-60 ml-0.5 shrink-0" />
            </button>

            {showVisualEngineDropdown && (
              <div className="absolute bottom-full left-0 mb-2.5 w-76 max-h-72 overflow-y-auto bg-white dark:bg-[#252321] border border-[#E8E4DB] dark:border-[#383531] rounded-xl shadow-2xl py-1 z-50 text-xs font-mono">
                <div className="p-2 border-b border-black/[0.04] dark:border-white/[0.04]">
                  <input
                    type="search"
                    name="in-chat-visual-engine-search"
                    autoComplete="off"
                    autoCorrect="off"
                    autoCapitalize="off"
                    spellCheck={false}
                    data-form-type="other"
                    data-1p-ignore="true"
                    data-lpignore="true"
                    data-bwignore="true"
                    value={visualEngineSearch}
                    onChange={(e) => setVisualEngineSearch(e.target.value)}
                    placeholder="Search media engines..."
                    className="w-full px-2.5 py-1 text-xs rounded-md bg-black/[0.03] dark:bg-white/[0.04] border border-neutral-200 dark:border-neutral-700 outline-hidden font-sans"
                    autoFocus
                  />
                </div>

                <div className="py-1">
                  {filteredVisualEngines.map((eng) => (
                    <button
                      key={eng.id}
                      onClick={() => {
                        setActiveVisualEngine(eng.id);
                        try {
                          localStorage.setItem("easycode_visual_engine", eng.id);
                        } catch (e) {}
                        setShowVisualEngineDropdown(false);
                        toast.success(`Selected ${cleanModelName(eng.name)} for image/video generation`);
                      }}
                      className={`w-full text-left px-3 py-2 transition-colors flex items-center justify-between ${
                        activeVisualEngine === eng.id
                          ? "bg-black/[0.05] dark:bg-white/[0.08] text-neutral-950 dark:text-white font-semibold"
                          : "text-[#524E48] dark:text-[#A8A49D] hover:bg-black/[0.04] dark:hover:bg-white/[0.06]"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <ProviderLogo provider={eng.provider} modelId={eng.id} className="w-3.5 h-3.5 shrink-0 text-current" />
                        <div className="flex flex-col">
                          <span className="truncate">{cleanModelName(eng.name)}</span>
                          <span className="text-[10px] font-sans opacity-60">{eng.provider} • {eng.badge}</span>
                        </div>
                      </div>
                      {activeVisualEngine === eng.id && <Check className="w-3.5 h-3.5" />}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Action Icons: Mic & Send Button */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={() => setIsRecordingAudio((prev) => !prev)}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer shrink-0 ${
              isRecordingAudio
                ? "bg-black/[0.08] text-neutral-900 dark:bg-white/[0.1] dark:text-white animate-pulse"
                : "text-[#7A756C] dark:text-[#8C8880] hover:text-[#1C1B19] dark:hover:text-white"
            }`}
            title={isRecordingAudio ? "Stop voice input" : "Voice input (Groq Whisper Large v3)"}
          >
            <Mic className="w-4 h-4" />
          </button>

          {/* Send / Stop Button */}
          {isLoading ? (
            <button
              onClick={handleCancelGeneration}
              className="w-9 h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer shadow-xs bg-[#1C1B19] text-white hover:bg-black dark:bg-white dark:text-[#1C1B19] dark:hover:bg-neutral-100 shrink-0"
              title="Stop generating"
            >
              <Square className="w-3.5 h-3.5 fill-current" />
            </button>
          ) : (
            <button
              onClick={() => handleSend()}
              disabled={!prompt.trim() && uploadedDocs.length === 0}
              className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer shadow-xs shrink-0 ${
                prompt.trim() || uploadedDocs.length > 0
                  ? "bg-[#1C1B19] text-white hover:bg-black dark:bg-white dark:text-[#1C1B19] dark:hover:bg-neutral-100 shadow-neutral-900/10"
                  : "bg-black/[0.06] dark:bg-white/[0.06] text-[#9E9A91] dark:text-[#615E57] cursor-not-allowed"
              }`}
              title="Send message"
            >
              <ArrowUp className="w-4 h-4 stroke-[2.5]" />
            </button>
          )}
        </div>
      </div>
    </div>
  );

  if (!mounted) return null;

  return (
    <div
      style={{ zoom: workspaceScale }}
      className="h-screen max-h-screen w-full bg-[#FBF9F4] dark:bg-[#1C1B19] text-[#1C1B19] dark:text-[#E8E6E3] flex flex-col overflow-hidden transition-all duration-200 font-sans selection:bg-neutral-500/20"
    >
      
      {/* Hidden dummy inputs to absorb aggressive browser autofill */}
      <input type="text" style={{ display: 'none' }} tabIndex={-1} aria-hidden="true" autoComplete="off" />
      <input type="password" style={{ display: 'none' }} tabIndex={-1} aria-hidden="true" autoComplete="off" />

      {/* Subtle animated vertical neutral grid texture - Only before first prompt is sent */}
      {messages.length === 0 && (
        <div className="fixed top-14 inset-x-0 bottom-0 pointer-events-none z-0 overflow-hidden">
          <div className="absolute -inset-x-32 inset-y-0 opacity-[0.06] dark:opacity-[0.08] bg-[linear-gradient(to_right,#000_1px,transparent_1px),linear-gradient(to_bottom,#000_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#fff_1px,transparent_1px),linear-gradient(to_bottom,#fff_1px,transparent_1px)] bg-[size:64px_64px] animate-grid-left" />
        </div>
      )}

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
        
        {/* LEFT SIDEBAR (Resizable with strict min width: 256px) */}
        <aside
          style={{ width: `${sidebarWidth}px` }}
          className="relative border-r border-[#E8E4DB] dark:border-[#2D2B28] bg-[#FBF9F4]/40 dark:bg-[#1C1B19]/40 backdrop-blur-xs flex flex-col justify-between p-3.5 shrink-0 hidden md:flex select-none"
        >
          
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
                <div className="space-y-1 max-h-56 overflow-y-auto -mr-2.5 pr-2 pl-0.5">
                  {filteredHistory.map((item) => {
                    const isActive = currentSessionId === item.id;
                    const tagLabel = item.level
                      ? item.level
                      : item.topic && item.topic !== "General"
                      ? item.topic
                      : "Chat";

                    return (
                      <div
                        key={item.id}
                        onClick={() => handleLoadHistorySession(item)}
                        className={`w-full text-left p-2 rounded-xl text-xs transition-all cursor-pointer group flex items-center justify-between gap-2 ${
                          isActive
                            ? "bg-black/[0.06] dark:bg-white/[0.08] text-black dark:text-white font-medium shadow-2xs"
                            : "hover:bg-black/[0.04] dark:hover:bg-white/[0.04] text-[#3A3733] dark:text-[#C5C2BA]"
                        }`}
                        title={item.title}
                      >
                        <div className="flex-1 min-w-0 flex flex-col gap-0.5">
                          <div className="flex items-center justify-between text-[10px] text-neutral-400">
                            <span className="font-semibold">{tagLabel}</span>
                            <span>{formatRealTimestamp(item.timestamp || item.time)}</span>
                          </div>
                          <span className="truncate font-medium group-hover:text-black dark:group-hover:text-white">
                            {item.title}
                          </span>
                        </div>

                        {/* Delete Conversation Button (Theme-wise) */}
                        <button
                          type="button"
                          onClick={(e) => handleDeleteConversation(item.id, e)}
                          className="opacity-0 group-hover:opacity-100 p-1 rounded-md hover:bg-black/[0.08] dark:hover:bg-white/[0.1] text-neutral-400 hover:text-[#1C1B19] dark:hover:text-[#EDEDEB] transition-all shrink-0 cursor-pointer"
                          title="Delete conversation"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                  })}
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

          {/* Interactive Drag Handle Gutter on Right Edge */}
          <div
            onMouseDown={handleSidebarMouseDown}
            onDoubleClick={() => {
              setSidebarWidth(256);
              localStorage.setItem("easycode_workspace_sidebar_width", "256");
            }}
            title="Drag to resize menu width (Double-click to reset)"
            className="absolute -right-1.5 top-0 bottom-0 w-3 cursor-col-resize z-30 group flex items-center justify-center hover:bg-amber-500/10 active:bg-amber-500/20 transition-colors"
          >
            <div
              className={`w-0.5 h-10 rounded-full transition-all duration-150 ${
                isResizingSidebar
                  ? "bg-amber-500 scale-y-125"
                  : "bg-transparent group-hover:bg-amber-500/60 dark:group-hover:bg-amber-400/60"
              }`}
            />
          </div>
        </aside>

        {/* MAIN CANVAS */}
        <main className="flex-1 min-h-0 overflow-hidden flex flex-col relative w-full">
          
          {/* RENDER SETTINGS VIEW WHEN ACTIVE */}
          {activeView === "settings" ? (
            <div className="flex-1 overflow-y-auto px-4 py-8 md:py-12 flex justify-center w-full">
              <SettingsView
                currentModel={activeModel}
                onModelSelect={(id) => {
                  setActiveModel(id);
                  try {
                    localStorage.setItem("easycode_last_active_model", id);
                  } catch (e) {}
                }}
              />
            </div>
          ) : (
            <div className="flex-1 flex flex-col min-h-0 relative w-full overflow-hidden">
              
              {/* SCROLLABLE VIEWPORT */}
              <div
                ref={scrollContainerRef}
                onScroll={handleContainerScroll}
                className="flex-1 overflow-y-auto flex flex-col items-center px-4 pt-6 pb-40 w-full"
              >
                
                {/* EMPTY STATE: Compact max-w-2xl container (user's preferred classic sizes) */}
                {messages.length === 0 ? (
                  <div className="w-full max-w-2xl flex flex-col items-center gap-6">
                    {/* HERO GREETING */}
                    <div className="text-center space-y-1 my-3">
                      <h1 className="text-3xl md:text-4xl font-serif text-[#1C1B19] dark:text-[#EDEDEB] tracking-tight">
                        Hey <span className="italic font-normal">{username}</span>
                      </h1>
                      <p className="text-3xl md:text-4xl font-serif text-[#1C1B19] dark:text-[#EDEDEB] tracking-tight">
                        What can I help you code today?
                      </p>
                    </div>

                    {/* SKILLS PILLS TOOLBAR (Visible ONLY on empty initial screen, disappears after first prompt) */}
                    <div className="w-full flex items-center justify-between gap-2 overflow-x-auto no-scrollbar pb-1 select-none">
                      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
                        <span className="text-[11px] font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider flex items-center gap-1 shrink-0 pr-1">
                          <Sparkles className="w-3 h-3 text-amber-500" />
                          <span>Skills:</span>
                        </span>
                        {skills.filter((s) => s.enabled).map((skill) => {
                          const isMentioned = prompt.includes(skill.mentionKey);
                          return (
                            <button
                              key={skill.id}
                              type="button"
                              onClick={() => handleToggleSkillMention(skill.mentionKey)}
                              className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                                isMentioned
                                  ? "bg-[#3A3733] text-white dark:bg-white dark:text-[#1C1B19] border-transparent shadow-2xs font-semibold"
                                  : "bg-[#FBF9F4] dark:bg-[#1C1B19] border-[#DFDAD0] dark:border-[#383532] text-neutral-700 dark:text-neutral-300 hover:bg-white dark:hover:bg-[#252321]"
                              }`}
                              title={skill.description}
                            >
                              <span className="font-mono text-[11px] text-amber-600 dark:text-amber-400 font-semibold">{skill.mentionKey}</span>
                              <span className="text-[10px] opacity-75">{skill.badge}</span>
                            </button>
                          );
                        })}
                        <button
                          type="button"
                          onClick={() => setActiveView("settings")}
                          className="px-2.5 py-1 rounded-full text-xs font-medium border border-dashed border-[#DFDAD0] dark:border-[#383532] text-neutral-500 hover:text-neutral-900 dark:hover:text-white hover:bg-white dark:hover:bg-[#252321] transition-all flex items-center gap-1 cursor-pointer whitespace-nowrap"
                          title="Configure or create custom AI skills"
                        >
                          <Plus className="w-3 h-3" />
                          <span>More Skills</span>
                        </button>
                      </div>
                    </div>

                    {/* MAIN INPUT PROMPT BOX (Centered in Empty Screen) */}
                    {renderPromptBox()}

                    {/* QUICK MODE SELECTION PILLS */}
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

                    {/* COMMONLY SEARCHED & RELEVANT PROMPTS */}
                    <div className="w-full pt-3 space-y-3">
                      <div className="flex items-center justify-between text-xs text-[#8C877D] dark:text-[#6E6A63] font-medium">
                        <span>{currentModeData.title}</span>
                        <span className="text-[11px] opacity-70">{currentModeData.subtitle}</span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                        {currentModeData.prompts.map((suggestion) => (
                          <button
                            key={suggestion}
                            onClick={() => {
                              setPrompt(suggestion);
                              textareaRef.current?.focus();
                            }}
                            className="text-left p-3.5 rounded-xl border border-[#DFDAD0] dark:border-[#383532] bg-[#FBF9F4] dark:bg-[#1C1B19] hover:bg-white dark:hover:bg-[#252321] text-xs text-[#4A4640] dark:text-[#C5C2BA] hover:text-black dark:hover:text-white transition-all shadow-xs leading-relaxed cursor-pointer"
                          >
                            {suggestion}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  /* IN-CONVERSATION STREAM: Wide response area */
                  <div className="w-full max-w-4xl xl:max-w-[1080px] space-y-5 pb-6">
                    {messages.map((msg) => {
                      const isMediaOnly =
                        msg.role === "assistant" &&
                        !msg.generatedProblem &&
                        !msg.problemDetails &&
                        (msg.content.trim().startsWith("![") || msg.content.trim().startsWith("@[video]")) &&
                        !msg.content.trim().includes("\n\n");

                      return (
                        <div
                          key={msg.id}
                          className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}
                        >
                          <div
                            className={`leading-relaxed ${
                              isMediaOnly
                                ? "p-0 bg-transparent border-none shadow-none"
                                : msg.role === "user"
                                ? "w-fit max-w-[70%] sm:max-w-md px-4 py-2 rounded-2xl bg-[#1C1B19] text-white dark:bg-[#2A2826] dark:text-[#EDEDEB] shadow-2xs select-text text-sm"
                                : "w-full py-2 text-[#1C1B19] dark:text-[#EDEDEB] text-sm"
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
                          ) : msg.role === "user" ? (
                            editingMessageId === msg.id ? (
                              <div className="w-full min-w-[280px] sm:min-w-[420px] max-w-xl space-y-2.5 p-3.5 rounded-2xl bg-[#1C1B19] dark:bg-[#2A2826] border border-white/10 text-white shadow-xl animate-in fade-in zoom-in-98 duration-150">
                                <textarea
                                  ref={(el) => {
                                    if (el) {
                                      el.style.height = "auto";
                                      el.style.height = `${el.scrollHeight}px`;
                                    }
                                  }}
                                  value={editingText}
                                  onChange={(e) => {
                                    setEditingText(e.target.value);
                                    e.target.style.height = "auto";
                                    e.target.style.height = `${e.target.scrollHeight}px`;
                                  }}
                                  className="w-full bg-transparent text-white dark:text-[#EDEDEB] p-0.5 border-0 outline-none focus:outline-none focus:ring-0 font-sans resize-none overflow-hidden transition-all leading-relaxed text-sm"
                                  autoFocus
                                  onKeyDown={(e) => {
                                    const isChanged = editingText.trim() !== msg.content.trim();
                                    if (e.key === "Enter" && !e.shiftKey) {
                                      e.preventDefault();
                                      if (isChanged && editingText.trim() && !isLoading) {
                                        handleSaveEditedMessage(msg.id);
                                      }
                                    } else if (e.key === "Escape") {
                                      setEditingMessageId(null);
                                    }
                                  }}
                                />
                                <div className="flex items-center justify-end gap-2 pt-0.5">
                                  <button
                                    type="button"
                                    onClick={() => setEditingMessageId(null)}
                                    className="px-3 py-1.5 rounded-lg text-xs font-medium text-neutral-400 hover:text-white bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
                                  >
                                    Cancel
                                  </button>
                                  <button
                                    type="button"
                                    disabled={editingText.trim() === msg.content.trim() || !editingText.trim() || isLoading}
                                    onClick={() => {
                                      if (editingText.trim() !== msg.content.trim() && editingText.trim() && !isLoading) {
                                        handleSaveEditedMessage(msg.id);
                                      }
                                    }}
                                    className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all shadow-xs ${
                                      editingText.trim() !== msg.content.trim() && editingText.trim() && !isLoading
                                        ? "bg-white text-[#1C1B19] dark:bg-[#EDEDEB] dark:text-[#1C1B19] hover:opacity-90 active:scale-95 cursor-pointer"
                                        : "bg-white/15 text-white/40 dark:bg-white/10 dark:text-white/30 cursor-not-allowed"
                                    }`}
                                    title={
                                      editingText.trim() === msg.content.trim()
                                        ? "Make a change to resend and reset the conversation"
                                        : "Resend prompt and regenerate conversation from this point"
                                    }
                                  >
                                    Resend
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div className="group/user relative">
                                <p className="whitespace-pre-wrap font-sans text-white dark:text-[#EDEDEB] leading-relaxed select-text text-sm">
                                  {msg.content}
                                </p>

                                {/* Floating Hover Action Bar: Edit & Reset, Copy */}
                                <div className="absolute -bottom-7 right-0 opacity-0 group-hover/user:opacity-100 transition-opacity flex items-center gap-1.5 py-0.5 px-2 rounded-lg bg-[#1C1B19]/95 dark:bg-[#2A2826]/95 backdrop-blur-xs border border-white/10 shadow-lg text-[11px] text-neutral-300 z-20">
                                  <button
                                    onClick={() => {
                                      setEditingMessageId(msg.id);
                                      setEditingText(msg.content);
                                    }}
                                    className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer py-0.5 px-1 rounded hover:bg-white/10"
                                    title="Edit prompt and reset conversation to this point"
                                  >
                                    <Pencil className="w-3 h-3 text-amber-400" />
                                    <span>Edit</span>
                                  </button>
                                  <span className="opacity-30">|</span>
                                  <button
                                    onClick={() => copyText(msg.content, msg.id)}
                                    className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer py-0.5 px-1 rounded hover:bg-white/10"
                                    title="Copy prompt"
                                  >
                                    {copiedId === msg.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                                  </button>
                                </div>
                              </div>
                            )
                          ) : (
                            /* Assistant message with live streaming token cursor support */
                            <div className="relative">
                              {msg.content ? (
                                <>
                                  {renderFormattedMessage(msg.content)}
                                  {isLoading && msg.id === streamingMessageId && (
                                    <span className="inline-block w-2 h-4 ml-1 rounded-xs bg-[#1C1B19] dark:bg-white animate-pulse align-middle" />
                                  )}
                                </>
                              ) : (
                                <ThinkingProcessBlock
                                  thinkingContent="Synthesizing algorithmic logic and formulating solution..."
                                  isStreaming={true}
                                  verb={currentVerb}
                                />
                              )}
                            </div>
                          )}

                          {msg.role === "assistant" && !msg.generatedProblem && (
                            <div className="mt-3 pt-2 border-t border-black/[0.04] dark:border-white/[0.04] flex items-center justify-between gap-2 text-xs text-neutral-500 dark:text-neutral-400">
                              {/* Solve in Problem Editor button if problem content detected */}
                              {msg.content && (msg.content.includes("# Problem") || msg.content.includes("Problem Description") || msg.content.includes("Difficulty:")) ? (
                                <button
                                  onClick={() => {
                                    try {
                                      sessionStorage.setItem("easycode_live_generate_prompt", msg.content);
                                    } catch (e) {}
                                    window.location.href = `/problem/new?generate=true&prompt=${encodeURIComponent(msg.content.substring(0, 150))}`;
                                  }}
                                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#1C1B19] text-white dark:bg-white dark:text-[#1C1B19] hover:opacity-90 transition-opacity font-medium text-[11px] cursor-pointer shadow-2xs"
                                >
                                  <Zap className="w-3 h-3 fill-amber-400 text-amber-400" />
                                  <span>Solve in Problem Editor ↗</span>
                                </button>
                              ) : <div />}

                              <div className="flex items-center gap-2">
                                {/* Copy Text */}
                                {msg.content && (
                                  <button
                                    onClick={() => copyText(msg.content, msg.id)}
                                    className="flex items-center gap-1 px-2 py-0.5 rounded-md hover:bg-black/5 dark:hover:bg-white/5 hover:text-neutral-900 dark:hover:text-white transition-colors cursor-pointer text-[11px]"
                                    title="Copy response"
                                  >
                                    {copiedId === msg.id ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                                    <span>{copiedId === msg.id ? "Copied" : "Copy"}</span>
                                  </button>
                                )}

                                {/* Delete Conversation at End of Conversation */}
                                {currentSessionId && (
                                  <button
                                    onClick={() => handleDeleteConversation(currentSessionId)}
                                    className="flex items-center gap-1 px-2 py-0.5 rounded-md hover:bg-black/[0.06] dark:hover:bg-white/[0.08] text-neutral-400 hover:text-[#1C1B19] dark:hover:text-[#EDEDEB] transition-colors cursor-pointer text-[11px]"
                                    title="Delete this conversation"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                    <span>Delete</span>
                                  </button>
                                )}
                              </div>
                            </div>
                          )}

                          {!msg.generatedProblem && msg.codeSnippet && (
                            <div className="mt-4 rounded-xl bg-[#181716] p-3.5 border border-white/[0.08] text-xs font-mono text-neutral-200">
                              <div className="flex items-center justify-between pb-2 border-b border-white/[0.06] text-[11px] text-neutral-400 uppercase font-semibold">
                                <span>Starter Solution ({msg.codeSnippet.language})</span>
                                <div className="flex items-center gap-3">
                                  <button
                                    onClick={() => {
                                      const ext = getLanguageExtension(msg.codeSnippet?.language);
                                      downloadFile(`solution.${ext}`, msg.codeSnippet?.code || "");
                                    }}
                                    className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer"
                                    title="Download code file"
                                  >
                                    <Download className="w-3 h-3" />
                                    <span>Download</span>
                                  </button>
                                  <button
                                    onClick={() => copyText(msg.codeSnippet?.code || "", msg.id)}
                                    className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer"
                                  >
                                    {copiedId === msg.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                                    <span>{copiedId === msg.id ? "Copied" : "Copy"}</span>
                                  </button>
                                </div>
                              </div>
                              <pre className="mt-2 overflow-x-auto p-1 leading-relaxed text-neutral-300">
                                {msg.codeSnippet.code}
                              </pre>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                    <div ref={messagesEndRef} />
                  </div>
                )}

              </div>

              {/* DOCKED FLOATING PROMPT BOX AT BOTTOM (ChatGPT style) - Stays fixed floating above responses */}
              {messages.length > 0 && (
                <div className="absolute bottom-0 inset-x-0 flex flex-col items-center px-4 pb-4 pt-6 bg-gradient-to-t from-[#FBF9F4] via-[#FBF9F4]/90 to-transparent dark:from-[#1C1B19] dark:via-[#1C1B19]/90 dark:to-transparent z-30 pointer-events-none">
                  <div className="w-full max-w-2xl pointer-events-auto">
                    {renderPromptBox()}
                  </div>
                </div>
              )}

              {/* Floating Scroll-to-Bottom Button (Fixed at Bottom-Right of the Page) */}
              {showScrollBottom && (
                <div className="fixed bottom-7 right-7 md:bottom-8 md:right-8 z-40 animate-in fade-in zoom-in-90 duration-200">
                  <div className="relative group">
                    <button
                      onClick={scrollToBottom}
                      className="flex items-center justify-center w-11 h-11 md:w-12 md:h-12 rounded-full bg-[#1C1B19] dark:bg-[#EDEDEB] text-white dark:text-[#1C1B19] border border-black/10 dark:border-white/15 shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all cursor-pointer"
                      aria-label="Scroll to bottom"
                    >
                      <ArrowDown className="w-5 h-5 transition-transform group-hover:translate-y-0.5" />
                    </button>

                    {/* Sleek Tooltip on hover */}
                    <div className="absolute bottom-full right-0 mb-2 px-3 py-1.5 rounded-xl bg-[#1C1B19] dark:bg-[#EDEDEB] text-white dark:text-[#1C1B19] text-xs font-semibold whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-150 shadow-2xl scale-95 group-hover:scale-100 origin-bottom-right">
                      Scroll to bottom
                      <span className="absolute top-full right-4 -mt-1 border-4 border-transparent border-t-[#1C1B19] dark:border-t-[#EDEDEB]" />
                    </div>
                  </div>
                </div>
              )}

            </div>
          )}
        </main>
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
            title="Quote and ask AI about this selection"
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
