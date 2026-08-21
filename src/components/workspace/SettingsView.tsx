"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import {
  Cpu,
  Key,
  Brain,
  Check,
  Shield,
  Sparkles,
  Save,
  Plus,
  Trash2,
  Lock,
  ExternalLink,
  Code2,
  Zap,
  Info,
  Server,
  Database
} from "lucide-react";
import { toast } from "sonner";

interface SettingsViewProps {
  currentModel: string;
  onModelSelect: (modelId: string) => void;
}

interface MemoryEntry {
  id: string;
  content: string;
  category: "Goal" | "Language" | "Topic" | "Style";
  createdAt: string;
}

export default function SettingsView({ currentModel, onModelSelect }: SettingsViewProps) {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState<"general" | "models" | "memory" | "apikeys">("general");

  // Form State
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [customInstructions, setCustomInstructions] = useState(
    "Generate code in Python 3 with clean type hints. Provide strict time and space complexity analysis."
  );
  const [privacyMode, setPrivacyMode] = useState(true);
  const [useMemory, setUseMemory] = useState(true);
  const [preferredLanguage, setPreferredLanguage] = useState("Python");
  const [temperature, setTemperature] = useState(0.3);

  // Memories State
  const [memories, setMemories] = useState<MemoryEntry[]>([]);
  const [newMemoryText, setNewMemoryText] = useState("");
  const [newMemoryCategory, setNewMemoryCategory] = useState<"Goal" | "Language" | "Topic" | "Style">("Goal");

  // Provider API Keys (Clean BYOK)
  const [apiKeys, setApiKeys] = useState({
    gemini: "",
    openai: "",
    anthropic: "",
    deepseek: "",
    groq: "",
    openrouter: "",
    mistral: "",
    together: "",
    cohere: "",
    ollamaUrl: "http://localhost:11434",
  });

  useEffect(() => {
    if (session?.user) {
      setFullName(session.user.name || (session.user as any).username || "");
      setEmail(session.user.email || "");
    }
    try {
      const savedInstructions = localStorage.getItem("easycode_custom_instructions");
      if (savedInstructions) setCustomInstructions(savedInstructions);
      
      const savedLang = localStorage.getItem("easycode_pref_lang");
      if (savedLang) setPreferredLanguage(savedLang);

      const savedMemories = localStorage.getItem("easycode_user_memories");
      if (savedMemories) {
        setMemories(JSON.parse(savedMemories));
      } else {
        const initialMemories: MemoryEntry[] = [
          {
            id: "1",
            content: "Targeting Meta & Google Software Engineer coding rounds",
            category: "Goal",
            createdAt: "3 days ago",
          },
          {
            id: "2",
            content: "Prefers concise Python 3 implementations with asymptotic time/space proofs",
            category: "Style",
            createdAt: "1 week ago",
          },
          {
            id: "3",
            content: "Currently focusing on Graph Shortest Path, Dynamic Programming, and Monotonic Stacks",
            category: "Topic",
            createdAt: "2 weeks ago",
          },
        ];
        setMemories(initialMemories);
      }

      const savedKeys = localStorage.getItem("easycode_custom_keys");
      if (savedKeys) {
        setApiKeys((prev) => ({ ...prev, ...JSON.parse(savedKeys) }));
      }
    } catch (e) {}
  }, [session]);

  const saveGeneralSettings = () => {
    try {
      localStorage.setItem("easycode_custom_instructions", customInstructions);
      localStorage.setItem("easycode_pref_lang", preferredLanguage);
      toast("Settings saved successfully");
    } catch (e) {
      toast("Could not save settings");
    }
  };

  const saveApiKeys = () => {
    try {
      localStorage.setItem("easycode_custom_keys", JSON.stringify(apiKeys));
      toast("API keys saved securely in local storage");
    } catch (e) {
      toast("Could not save API keys");
    }
  };

  const addMemory = () => {
    if (!newMemoryText.trim()) return;
    const newEntry: MemoryEntry = {
      id: Date.now().toString(),
      content: newMemoryText.trim(),
      category: newMemoryCategory,
      createdAt: "Just now",
    };
    const updated = [newEntry, ...memories];
    setMemories(updated);
    setNewMemoryText("");
    try {
      localStorage.setItem("easycode_user_memories", JSON.stringify(updated));
    } catch (e) {}
    toast("New memory added");
  };

  const deleteMemory = (id: string) => {
    const updated = memories.filter((m) => m.id !== id);
    setMemories(updated);
    try {
      localStorage.setItem("easycode_user_memories", JSON.stringify(updated));
    } catch (e) {}
    toast("Memory deleted");
  };

  const clearAllMemories = () => {
    setMemories([]);
    try {
      localStorage.removeItem("easycode_user_memories");
    } catch (e) {}
    toast("All memories cleared");
  };

  // Clean LLM Models registry without messy parentheticals
  const availableModels = [
    {
      provider: "Google DeepMind",
      models: [
        {
          id: "gemini-2.5-flash",
          name: "Gemini 2.5 Flash",
          description: "Ultra-fast, high efficiency model for real-time problem drafting and code generation.",
          contextWindow: "1,000,000 tokens",
          badge: "Default",
        },
        {
          id: "gemini-2.5-pro",
          name: "Gemini 2.5 Pro",
          description: "State-of-the-art reasoning for complex Dynamic Programming and Graph proofs.",
          contextWindow: "2,000,000 tokens",
          badge: "Advanced",
        },
        {
          id: "gemini-2.0-flash-thinking",
          name: "Gemini 2.0 Flash Thinking",
          description: "Explicit chain-of-thought verification for edge test cases and math problems.",
          contextWindow: "1,000,000 tokens",
          badge: "Reasoning",
        },
      ],
    },
    {
      provider: "Anthropic",
      models: [
        {
          id: "claude-3.5-sonnet",
          name: "Claude 3.5 Sonnet",
          description: "Industry gold standard for nuanced competitive programming code generation.",
          contextWindow: "200,000 tokens",
          badge: "Top Coder",
        },
        {
          id: "claude-3.5-haiku",
          name: "Claude 3.5 Haiku",
          description: "Fastest response times for simple hints and syntax explanations.",
          contextWindow: "200,000 tokens",
          badge: "Fast",
        },
        {
          id: "claude-3-opus",
          name: "Claude 3 Opus",
          description: "Deep algorithmic analysis and comprehensive system design problem formulation.",
          contextWindow: "200,000 tokens",
          badge: "Deep",
        },
      ],
    },
    {
      provider: "OpenAI",
      models: [
        {
          id: "gpt-4o",
          name: "GPT-4o",
          description: "Multimodal flagship model with high algorithmic precision.",
          contextWindow: "128,000 tokens",
          badge: "Flagship",
        },
        {
          id: "gpt-4o-mini",
          name: "GPT-4o mini",
          description: "Lightweight and cost-efficient version of GPT-4o for rapid code hints.",
          contextWindow: "128,000 tokens",
          badge: "Fast",
        },
        {
          id: "o1",
          name: "o1",
          description: "Spends dedicated compute time thinking before generating mathematical solutions.",
          contextWindow: "200,000 tokens",
          badge: "Reasoning",
        },
        {
          id: "o3-mini",
          name: "o3-mini",
          description: "Compact high-reasoning model optimized for STEM and competitive coding.",
          contextWindow: "128,000 tokens",
          badge: "STEM",
        },
      ],
    },
    {
      provider: "DeepSeek",
      models: [
        {
          id: "deepseek-r1",
          name: "DeepSeek R1",
          description: "Open weights reasoning powerhouse matching top proprietary reasoning models.",
          contextWindow: "64,000 tokens",
          badge: "Reasoning",
        },
        {
          id: "deepseek-v3",
          name: "DeepSeek V3",
          description: "671B parameter Mixture-of-Experts model tailored for rapid code completion.",
          contextWindow: "64,000 tokens",
          badge: "MoE",
        },
      ],
    },
    {
      provider: "Groq",
      models: [
        {
          id: "groq-llama-3.3-70b",
          name: "Llama 3.3 70B",
          description: "500+ tokens/sec inference speed for instant interactive problem solving.",
          contextWindow: "128,000 tokens",
          badge: "500+ t/s",
        },
        {
          id: "groq-qwen-2.5-coder",
          name: "Qwen 2.5 Coder 32B",
          description: "Specialized competitive coding LLM running on Groq LPUs.",
          contextWindow: "32,000 tokens",
          badge: "Ultra Fast",
        },
      ],
    },
    {
      provider: "Mistral AI",
      models: [
        {
          id: "codestral-latest",
          name: "Codestral",
          description: "Mistral's dedicated 22B code generation model supporting 80+ programming languages.",
          contextWindow: "32,000 tokens",
          badge: "Code",
        },
        {
          id: "mistral-large",
          name: "Mistral Large",
          description: "Top-tier flagship reasoning model from Mistral AI.",
          contextWindow: "128,000 tokens",
          badge: "Flagship",
        },
      ],
    },
    {
      provider: "OpenRouter",
      models: [
        {
          id: "openrouter-auto",
          name: "OpenRouter Auto",
          description: "Access 300+ AI models through a single universal API key.",
          contextWindow: "Dynamic",
          badge: "Universal",
        },
      ],
    },
    {
      provider: "Local LLM",
      models: [
        {
          id: "ollama-local",
          name: "Local Ollama",
          description: "Runs 100% locally on your machine via localhost:11434. Completely private and offline.",
          contextWindow: "Configurable",
          badge: "Private",
        },
      ],
    },
  ];

  return (
    <div className="w-full max-w-2xl mx-auto py-8 px-4 md:px-0 space-y-7">
      
      {/* Title */}
      <div className="space-y-1">
        <h1 className="font-serif text-2xl md:text-3xl font-medium tracking-tight text-[#1C1B19] dark:text-[#EDEDEB]">
          Settings
        </h1>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#E8E4DB] dark:border-[#2D2B28] gap-6 text-xs font-medium">
        <button
          onClick={() => setActiveTab("general")}
          className={`pb-2.5 transition-colors relative ${
            activeTab === "general"
              ? "text-[#1C1B19] dark:text-white font-semibold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-[#1C1B19] dark:after:bg-white"
              : "text-[#7A756C] dark:text-[#8C8880] hover:text-[#1C1B19] dark:hover:text-white"
          }`}
        >
          General
        </button>

        <button
          onClick={() => setActiveTab("models")}
          className={`pb-2.5 transition-colors relative ${
            activeTab === "models"
              ? "text-[#1C1B19] dark:text-white font-semibold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-[#1C1B19] dark:after:bg-white"
              : "text-[#7A756C] dark:text-[#8C8880] hover:text-[#1C1B19] dark:hover:text-white"
          }`}
        >
          LLM Models & Engine
        </button>

        <button
          onClick={() => setActiveTab("memory")}
          className={`pb-2.5 transition-colors relative ${
            activeTab === "memory"
              ? "text-[#1C1B19] dark:text-white font-semibold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-[#1C1B19] dark:after:bg-white"
              : "text-[#7A756C] dark:text-[#8C8880] hover:text-[#1C1B19] dark:hover:text-white"
          }`}
        >
          Memory
        </button>

        <button
          onClick={() => setActiveTab("apikeys")}
          className={`pb-2.5 transition-colors relative ${
            activeTab === "apikeys"
              ? "text-[#1C1B19] dark:text-white font-semibold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-[#1C1B19] dark:after:bg-white"
              : "text-[#7A756C] dark:text-[#8C8880] hover:text-[#1C1B19] dark:hover:text-white"
          }`}
        >
          API keys
        </button>
      </div>

      {/* TAB 1: GENERAL */}
      {activeTab === "general" && (
        <div className="space-y-8">
          
          {/* Account Section */}
          <div className="space-y-4">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-[#8C877D] dark:text-[#6E6A63]">
              Account
            </h2>

            <div className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[#1C1B19] dark:text-[#EDEDEB] block">
                  Full name
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. John Doe"
                  className="w-full px-3.5 py-2 rounded-xl bg-[#ECE8DF]/60 dark:bg-[#282624]/60 border border-[#DFDAD0] dark:border-[#383532] text-xs text-[#1C1B19] dark:text-[#EDEDEB] placeholder-[#8C877D] dark:placeholder-[#6E6A63] outline-hidden focus:border-neutral-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[#1C1B19] dark:text-[#EDEDEB] block">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your email address"
                  className="w-full px-3.5 py-2 rounded-xl bg-[#ECE8DF]/60 dark:bg-[#282624]/60 border border-[#DFDAD0] dark:border-[#383532] text-xs text-[#1C1B19] dark:text-[#EDEDEB] placeholder-[#8C877D] dark:placeholder-[#6E6A63] outline-hidden focus:border-neutral-500"
                />
              </div>
            </div>
          </div>

          {/* Preferences Section */}
          <div className="space-y-5 pt-2 border-t border-[#E8E4DB] dark:border-[#2D2B28]">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-[#8C877D] dark:text-[#6E6A63]">
              Preferences
            </h2>

            {/* Custom instructions */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[#1C1B19] dark:text-[#EDEDEB] block">
                Custom instructions
              </label>
              <p className="text-[11px] text-[#7A756C] dark:text-[#8C8880]">
                Give the AI any instructions or specify any preferences for the output.
              </p>
              <textarea
                value={customInstructions}
                onChange={(e) => setCustomInstructions(e.target.value)}
                placeholder="Example: Give only concise responses. Provide time and space complexity."
                rows={3}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#ECE8DF]/60 dark:bg-[#282624]/60 border border-[#DFDAD0] dark:border-[#383532] text-xs text-[#1C1B19] dark:text-[#EDEDEB] placeholder-[#8C877D] dark:placeholder-[#6E6A63] outline-hidden focus:border-neutral-500 leading-relaxed"
              />
            </div>

            {/* Preferred Programming Language */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[#1C1B19] dark:text-[#EDEDEB] block">
                Preferred Code Language
              </label>
              <div className="flex gap-2 flex-wrap">
                {["Python", "C++", "Java", "TypeScript", "Go", "Rust"].map((lang) => (
                  <button
                    key={lang}
                    onClick={() => setPreferredLanguage(lang)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                      preferredLanguage === lang
                        ? "bg-[#3A3733] text-white dark:bg-white dark:text-[#1C1B19] border-transparent font-semibold"
                        : "border-[#DFDAD0] dark:border-[#383532] bg-white/50 dark:bg-[#282624]/50 text-[#524E48] dark:text-[#A8A49D] hover:bg-white dark:hover:bg-[#33312E]"
                    }`}
                  >
                    {lang}
                  </button>
                ))}
              </div>
            </div>

            {/* Privacy Mode Toggle */}
            <div className="flex items-center justify-between py-1">
              <div>
                <div className="text-xs font-medium text-[#1C1B19] dark:text-[#EDEDEB]">Privacy mode</div>
                <div className="text-[11px] text-[#7A756C] dark:text-[#8C8880]">
                  Prevents training on your prompts and code solutions
                </div>
              </div>
              <button
                onClick={() => setPrivacyMode(!privacyMode)}
                className={`w-9 h-5 rounded-full transition-colors relative flex items-center px-0.5 ${
                  privacyMode ? "bg-[#3A3733] dark:bg-white" : "bg-black/[0.1] dark:bg-white/[0.1]"
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full transition-transform ${
                    privacyMode
                      ? "translate-x-4 bg-white dark:bg-[#1C1B19]"
                      : "translate-x-0 bg-white dark:bg-[#8C8880]"
                  }`}
                />
              </button>
            </div>

            {/* Use Memory Toggle */}
            <div className="flex items-center justify-between py-1">
              <div>
                <div className="text-xs font-medium text-[#1C1B19] dark:text-[#EDEDEB]">Use memory</div>
                <div className="text-[11px] text-[#7A756C] dark:text-[#8C8880]">
                  Remembers previous generated problems and problem-solving level
                </div>
              </div>
              <button
                onClick={() => setUseMemory(!useMemory)}
                className={`w-9 h-5 rounded-full transition-colors relative flex items-center px-0.5 ${
                  useMemory ? "bg-[#3A3733] dark:bg-white" : "bg-black/[0.1] dark:bg-white/[0.1]"
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full transition-transform ${
                    useMemory
                      ? "translate-x-4 bg-white dark:bg-[#1C1B19]"
                      : "translate-x-0 bg-white dark:bg-[#8C8880]"
                  }`}
                />
              </button>
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={saveGeneralSettings}
              className="px-4 py-2 rounded-xl bg-[#3A3733] text-white dark:bg-white dark:text-[#1C1B19] text-xs font-semibold hover:opacity-90 transition-opacity shadow-xs"
            >
              Save Preferences
            </button>
          </div>
        </div>
      )}

      {/* TAB 2: LLM MODELS & ENGINE */}
      {activeTab === "models" && (
        <div className="space-y-6">
          <div className="space-y-1">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-[#8C877D] dark:text-[#6E6A63]">
              Active AI Model Configuration
            </h2>
            <p className="text-xs text-[#7A756C] dark:text-[#8C8880]">
              Select which LLM powers your problem generation, solution proofs, and algorithmic test case synthesis.
            </p>
          </div>

          {/* Model Registry List */}
          <div className="space-y-6">
            {availableModels.map((group) => (
              <div key={group.provider} className="space-y-2.5">
                <div className="text-[11px] font-semibold tracking-wider text-[#4A4640] dark:text-[#C5C2BA] uppercase">
                  {group.provider}
                </div>

                <div className="grid grid-cols-1 gap-2">
                  {group.models.map((model) => (
                    <div
                      key={model.id}
                      onClick={() => {
                        onModelSelect(model.id);
                        toast(`Active model changed to ${model.name}`);
                      }}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start justify-between gap-3 ${
                        currentModel === model.id
                          ? "border-[#3A3733] dark:border-white bg-[#ECE8DF]/80 dark:bg-[#282624]/80 shadow-2xs"
                          : "border-[#DFDAD0] dark:border-[#383532] bg-white/40 dark:bg-[#242321]/40 hover:bg-white/70 dark:hover:bg-[#282624]"
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-[#1C1B19] dark:text-[#EDEDEB]">
                            {model.name}
                          </span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded border border-neutral-300 dark:border-neutral-700 bg-black/[0.03] dark:bg-white/[0.04] text-neutral-600 dark:text-neutral-400">
                            {model.badge}
                          </span>
                          <span className="text-[10px] font-mono text-neutral-400">
                            {model.contextWindow}
                          </span>
                        </div>
                        <p className="text-[11px] text-[#7A756C] dark:text-[#8C8880] leading-relaxed">
                          {model.description}
                        </p>
                      </div>

                      <div className="pt-0.5 shrink-0">
                        <div
                          className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                            currentModel === model.id
                              ? "border-[#3A3733] dark:border-white bg-[#3A3733] dark:bg-white text-white dark:text-[#1C1B19]"
                              : "border-[#DFDAD0] dark:border-[#4A4742]"
                          }`}
                        >
                          {currentModel === model.id && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Model Temperature Slider */}
          <div className="pt-4 border-t border-[#E8E4DB] dark:border-[#2D2B28] space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-[#1C1B19] dark:text-[#EDEDEB]">Creativity / Temperature</span>
              <span className="font-mono text-neutral-500">{temperature}</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={temperature}
              onChange={(e) => setTemperature(parseFloat(e.target.value))}
              className="w-full accent-neutral-800 dark:accent-neutral-200 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-neutral-400">
              <span>Deterministic & Exact (0.0)</span>
              <span>Balanced (0.5)</span>
              <span>Creative Problem Variations (1.0)</span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: MEMORY BANK */}
      {activeTab === "memory" && (
        <div className="space-y-6">
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-[#8C877D] dark:text-[#6E6A63]">
                AI Memory Bank
              </h2>
              {memories.length > 0 && (
                <button
                  onClick={clearAllMemories}
                  className="text-[11px] text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors"
                >
                  Clear All
                </button>
              )}
            </div>
            <p className="text-xs text-[#7A756C] dark:text-[#8C8880]">
              Memories give the AI continuous context about your coding background, target companies, favorite algorithms, and preferred problem types.
            </p>
          </div>

          {/* Add New Memory Box */}
          <div className="p-3.5 rounded-xl bg-[#ECE8DF]/60 dark:bg-[#282624]/60 border border-[#DFDAD0] dark:border-[#383532] space-y-3">
            <div className="flex gap-2">
              <input
                type="text"
                value={newMemoryText}
                onChange={(e) => setNewMemoryText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") addMemory();
                }}
                placeholder="Add a new custom memory (e.g. 'Preparing for Meta coding rounds with Python')..."
                className="flex-1 px-3 py-1.5 rounded-lg bg-white/70 dark:bg-[#201F1D] border border-[#DFDAD0] dark:border-[#383532] text-xs text-[#1C1B19] dark:text-[#EDEDEB] placeholder-[#8C877D] dark:placeholder-[#6E6A63] outline-hidden focus:border-neutral-500"
              />
              <select
                value={newMemoryCategory}
                onChange={(e) => setNewMemoryCategory(e.target.value as any)}
                className="px-2.5 py-1.5 rounded-lg bg-white/70 dark:bg-[#201F1D] border border-[#DFDAD0] dark:border-[#383532] text-xs text-[#1C1B19] dark:text-[#EDEDEB] outline-hidden cursor-pointer"
              >
                <option value="Goal">Goal</option>
                <option value="Topic">Topic</option>
                <option value="Style">Style</option>
                <option value="Language">Language</option>
              </select>
              <button
                onClick={addMemory}
                className="px-3 py-1.5 rounded-lg bg-[#3A3733] text-white dark:bg-white dark:text-[#1C1B19] text-xs font-semibold hover:opacity-90 transition-opacity flex items-center gap-1 shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </div>
          </div>

          {/* Memory List */}
          <div className="space-y-2">
            {memories.length === 0 ? (
              <div className="py-12 px-4 text-center text-xs text-[#8C877D] dark:text-[#6E6A63] space-y-1.5 border border-dashed border-[#DFDAD0] dark:border-[#383532] rounded-xl">
                <Brain className="w-5 h-5 mx-auto opacity-40 text-neutral-500" />
                <p className="font-medium">No memories stored yet</p>
                <p className="text-[11px] opacity-70">
                  Add memories above or enable "Use memory" in General Settings to automatically learn from your interactions.
                </p>
              </div>
            ) : (
              memories.map((mem) => (
                <div
                  key={mem.id}
                  className="p-3 rounded-xl border border-[#DFDAD0] dark:border-[#383532] bg-white/40 dark:bg-[#242321]/40 flex items-start justify-between gap-3 group"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] px-1.5 py-0.2 rounded border border-neutral-300 dark:border-neutral-700 bg-black/[0.03] dark:bg-white/[0.04] text-neutral-600 dark:text-neutral-400 font-mono">
                        {mem.category}
                      </span>
                      <span className="text-[10px] text-neutral-400">{mem.createdAt}</span>
                    </div>
                    <p className="text-xs text-[#1C1B19] dark:text-[#EDEDEB] leading-relaxed">{mem.content}</p>
                  </div>

                  <button
                    onClick={() => deleteMemory(mem.id)}
                    className="p-1 text-neutral-400 hover:text-neutral-900 dark:hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Delete memory"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 4: API KEYS (Clean BYOK) */}
      {activeTab === "apikeys" && (
        <div className="space-y-6">
          <div className="space-y-1">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-[#8C877D] dark:text-[#6E6A63]">
              API Providers & Keys
            </h2>
            <p className="text-xs text-[#7A756C] dark:text-[#8C8880]">
              Configure your provider API keys. Calls are made directly from your API endpoints with zero markup. Keys are stored safely in local encrypted storage.
            </p>
          </div>

          <div className="space-y-4">
            
            {/* Google AI Studio */}
            <div className="space-y-1.5 p-3 rounded-xl bg-white/40 dark:bg-[#242321]/40 border border-[#DFDAD0] dark:border-[#383532]">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-[#1C1B19] dark:text-[#EDEDEB]">
                  Google AI Studio
                </label>
                <span className="text-[10px] font-mono text-neutral-500">
                  {apiKeys.gemini ? "Configured" : "Default Backend Active"}
                </span>
              </div>
              <input
                type="password"
                value={apiKeys.gemini}
                onChange={(e) => setApiKeys({ ...apiKeys, gemini: e.target.value })}
                placeholder="AIzaSy..."
                className="w-full px-3 py-1.5 rounded-lg bg-[#ECE8DF]/60 dark:bg-[#282624]/60 border border-[#DFDAD0] dark:border-[#383532] text-xs font-mono text-[#1C1B19] dark:text-[#EDEDEB] placeholder-[#8C877D] dark:placeholder-[#6E6A63] outline-hidden focus:border-neutral-500"
              />
            </div>

            {/* OpenAI */}
            <div className="space-y-1.5 p-3 rounded-xl bg-white/40 dark:bg-[#242321]/40 border border-[#DFDAD0] dark:border-[#383532]">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-[#1C1B19] dark:text-[#EDEDEB]">
                  OpenAI
                </label>
                <span className="text-[10px] font-mono text-neutral-500">
                  {apiKeys.openai ? "Configured" : "Optional"}
                </span>
              </div>
              <input
                type="password"
                value={apiKeys.openai}
                onChange={(e) => setApiKeys({ ...apiKeys, openai: e.target.value })}
                placeholder="sk-proj-..."
                className="w-full px-3 py-1.5 rounded-lg bg-[#ECE8DF]/60 dark:bg-[#282624]/60 border border-[#DFDAD0] dark:border-[#383532] text-xs font-mono text-[#1C1B19] dark:text-[#EDEDEB] placeholder-[#8C877D] dark:placeholder-[#6E6A63] outline-hidden focus:border-neutral-500"
              />
            </div>

            {/* Anthropic */}
            <div className="space-y-1.5 p-3 rounded-xl bg-white/40 dark:bg-[#242321]/40 border border-[#DFDAD0] dark:border-[#383532]">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-[#1C1B19] dark:text-[#EDEDEB]">
                  Anthropic
                </label>
                <span className="text-[10px] font-mono text-neutral-500">
                  {apiKeys.anthropic ? "Configured" : "Optional"}
                </span>
              </div>
              <input
                type="password"
                value={apiKeys.anthropic}
                onChange={(e) => setApiKeys({ ...apiKeys, anthropic: e.target.value })}
                placeholder="sk-ant-api..."
                className="w-full px-3 py-1.5 rounded-lg bg-[#ECE8DF]/60 dark:bg-[#282624]/60 border border-[#DFDAD0] dark:border-[#383532] text-xs font-mono text-[#1C1B19] dark:text-[#EDEDEB] placeholder-[#8C877D] dark:placeholder-[#6E6A63] outline-hidden focus:border-neutral-500"
              />
            </div>

            {/* DeepSeek */}
            <div className="space-y-1.5 p-3 rounded-xl bg-white/40 dark:bg-[#242321]/40 border border-[#DFDAD0] dark:border-[#383532]">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-[#1C1B19] dark:text-[#EDEDEB]">
                  DeepSeek
                </label>
                <span className="text-[10px] font-mono text-neutral-500">
                  {apiKeys.deepseek ? "Configured" : "Optional"}
                </span>
              </div>
              <input
                type="password"
                value={apiKeys.deepseek}
                onChange={(e) => setApiKeys({ ...apiKeys, deepseek: e.target.value })}
                placeholder="sk-..."
                className="w-full px-3 py-1.5 rounded-lg bg-[#ECE8DF]/60 dark:bg-[#282624]/60 border border-[#DFDAD0] dark:border-[#383532] text-xs font-mono text-[#1C1B19] dark:text-[#EDEDEB] placeholder-[#8C877D] dark:placeholder-[#6E6A63] outline-hidden focus:border-neutral-500"
              />
            </div>

            {/* Groq */}
            <div className="space-y-1.5 p-3 rounded-xl bg-white/40 dark:bg-[#242321]/40 border border-[#DFDAD0] dark:border-[#383532]">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-[#1C1B19] dark:text-[#EDEDEB]">
                  Groq
                </label>
                <span className="text-[10px] font-mono text-neutral-500">
                  {apiKeys.groq ? "Configured" : "Optional"}
                </span>
              </div>
              <input
                type="password"
                value={apiKeys.groq}
                onChange={(e) => setApiKeys({ ...apiKeys, groq: e.target.value })}
                placeholder="gsk_..."
                className="w-full px-3 py-1.5 rounded-lg bg-[#ECE8DF]/60 dark:bg-[#282624]/60 border border-[#DFDAD0] dark:border-[#383532] text-xs font-mono text-[#1C1B19] dark:text-[#EDEDEB] placeholder-[#8C877D] dark:placeholder-[#6E6A63] outline-hidden focus:border-neutral-500"
              />
            </div>

            {/* OpenRouter */}
            <div className="space-y-1.5 p-3 rounded-xl bg-white/40 dark:bg-[#242321]/40 border border-[#DFDAD0] dark:border-[#383532]">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-[#1C1B19] dark:text-[#EDEDEB]">
                  OpenRouter
                </label>
                <span className="text-[10px] font-mono text-neutral-500">
                  {apiKeys.openrouter ? "Configured" : "Optional"}
                </span>
              </div>
              <input
                type="password"
                value={apiKeys.openrouter}
                onChange={(e) => setApiKeys({ ...apiKeys, openrouter: e.target.value })}
                placeholder="sk-or-v1-..."
                className="w-full px-3 py-1.5 rounded-lg bg-[#ECE8DF]/60 dark:bg-[#282624]/60 border border-[#DFDAD0] dark:border-[#383532] text-xs font-mono text-[#1C1B19] dark:text-[#EDEDEB] placeholder-[#8C877D] dark:placeholder-[#6E6A63] outline-hidden focus:border-neutral-500"
              />
            </div>

            {/* Mistral AI */}
            <div className="space-y-1.5 p-3 rounded-xl bg-white/40 dark:bg-[#242321]/40 border border-[#DFDAD0] dark:border-[#383532]">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-[#1C1B19] dark:text-[#EDEDEB]">
                  Mistral AI
                </label>
                <span className="text-[10px] font-mono text-neutral-500">
                  {apiKeys.mistral ? "Configured" : "Optional"}
                </span>
              </div>
              <input
                type="password"
                value={apiKeys.mistral}
                onChange={(e) => setApiKeys({ ...apiKeys, mistral: e.target.value })}
                placeholder="Mistral API key..."
                className="w-full px-3 py-1.5 rounded-lg bg-[#ECE8DF]/60 dark:bg-[#282624]/60 border border-[#DFDAD0] dark:border-[#383532] text-xs font-mono text-[#1C1B19] dark:text-[#EDEDEB] placeholder-[#8C877D] dark:placeholder-[#6E6A63] outline-hidden focus:border-neutral-500"
              />
            </div>

            {/* Together AI */}
            <div className="space-y-1.5 p-3 rounded-xl bg-white/40 dark:bg-[#242321]/40 border border-[#DFDAD0] dark:border-[#383532]">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-[#1C1B19] dark:text-[#EDEDEB]">
                  Together AI
                </label>
                <span className="text-[10px] font-mono text-neutral-500">
                  {apiKeys.together ? "Configured" : "Optional"}
                </span>
              </div>
              <input
                type="password"
                value={apiKeys.together}
                onChange={(e) => setApiKeys({ ...apiKeys, together: e.target.value })}
                placeholder="Together API key..."
                className="w-full px-3 py-1.5 rounded-lg bg-[#ECE8DF]/60 dark:bg-[#282624]/60 border border-[#DFDAD0] dark:border-[#383532] text-xs font-mono text-[#1C1B19] dark:text-[#EDEDEB] placeholder-[#8C877D] dark:placeholder-[#6E6A63] outline-hidden focus:border-neutral-500"
              />
            </div>

            {/* Local Ollama Host */}
            <div className="space-y-1.5 p-3 rounded-xl bg-white/40 dark:bg-[#242321]/40 border border-[#DFDAD0] dark:border-[#383532]">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-[#1C1B19] dark:text-[#EDEDEB]">
                  Local Ollama Host
                </label>
                <span className="text-[10px] font-mono text-neutral-500">Local Instance</span>
              </div>
              <input
                type="text"
                value={apiKeys.ollamaUrl}
                onChange={(e) => setApiKeys({ ...apiKeys, ollamaUrl: e.target.value })}
                placeholder="http://localhost:11434"
                className="w-full px-3 py-1.5 rounded-lg bg-[#ECE8DF]/60 dark:bg-[#282624]/60 border border-[#DFDAD0] dark:border-[#383532] text-xs font-mono text-[#1C1B19] dark:text-[#EDEDEB] placeholder-[#8C877D] dark:placeholder-[#6E6A63] outline-hidden focus:border-neutral-500"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={saveApiKeys}
              className="px-4 py-2 rounded-xl bg-[#3A3733] text-white dark:bg-white dark:text-[#1C1B19] text-xs font-semibold hover:opacity-90 transition-opacity shadow-xs"
            >
              Save API Keys
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
