"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useSession } from "next-auth/react";
import {
  Search,
  Check,
  Plus,
  Trash2,
  Brain,
  Sliders,
  Sparkles,
  Server,
  Zap,
  ShieldCheck,
  Cpu,
  Layers,
  Key,
  AlertCircle,
  ExternalLink,
  Globe,
  HardDrive,
  Terminal,
  Activity,
  Lock,
  Presentation,
  FileText,
  BookOpen,
  TestTube2,
  Rocket,
  FileSpreadsheet,
  Download,
  Code2,
  Wand2,
  FileCheck2,
  Eye,
  Pencil,
  RotateCcw,
  Copy,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { BUILT_IN_SKILLS, DEFAULT_AI_RULES, AiSkill, AiRule } from "@/types/skillsAndRules";

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

export interface ModelItem {
  id: string;
  name: string;
  description: string;
  contextWindow: string;
  badge: string;
  requiredKey: string;
}

export interface ModelGroup {
  provider: string;
  category: "Frontier" | "Reasoning" | "Coding" | "Speed" | "Open Source" | "Search" | "Local" | "Universal";
  requiredKey: string;
  models: ModelItem[];
}

export default function SettingsView({ currentModel, onModelSelect }: SettingsViewProps) {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState<"models" | "apikeys" | "skills" | "rules" | "memory" | "general">("models");

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

  // Model Filter & Search State
  const [modelSearchQuery, setModelSearchQuery] = useState("");
  const [selectedProviderFilter, setSelectedProviderFilter] = useState("All");
  const [modelsDisplayMode, setModelsDisplayMode] = useState<"activeOnly" | "all">("activeOnly");

  // Skills State
  const [skills, setSkills] = useState<AiSkill[]>(BUILT_IN_SKILLS);
  const [skillSearchQuery, setSkillSearchQuery] = useState("");
  const [selectedSkillCategory, setSelectedSkillCategory] = useState("All");
  const [showAddSkillModal, setShowAddSkillModal] = useState(false);
  const [selectedSkillToView, setSelectedSkillToView] = useState<AiSkill | null>(null);
  const [editingSkill, setEditingSkill] = useState<AiSkill | null>(null);
  const [newSkillName, setNewSkillName] = useState("");
  const [newSkillMention, setNewSkillMention] = useState("");
  const [newSkillCategory, setNewSkillCategory] = useState<AiSkill["category"]>("Document");
  const [newSkillDescription, setNewSkillDescription] = useState("");
  const [newSkillPromptModifier, setNewSkillPromptModifier] = useState("");
  const [newSkillOutputFormat, setNewSkillOutputFormat] = useState<AiSkill["outputFormat"]>("markdown");
  const [newSkillExamplePrompt, setNewSkillExamplePrompt] = useState("");

  // Rules State
  const [rules, setRules] = useState<AiRule[]>(DEFAULT_AI_RULES);
  const [ruleSearchQuery, setRuleSearchQuery] = useState("");
  const [selectedRuleCategory, setSelectedRuleCategory] = useState("All");
  const [showAddRuleModal, setShowAddRuleModal] = useState(false);
  const [newRuleTitle, setNewRuleTitle] = useState("");
  const [newRuleCategory, setNewRuleCategory] = useState<AiRule["category"]>("Coding");
  const [newRuleDescription, setNewRuleDescription] = useState("");
  const [newRuleText, setNewRuleText] = useState("");

  // Memories State
  const [memories, setMemories] = useState<MemoryEntry[]>([]);
  const [newMemoryText, setNewMemoryText] = useState("");
  const [newMemoryCategory, setNewMemoryCategory] = useState<"Goal" | "Language" | "Topic" | "Style">("Goal");

  // Exhaustive Universe of AI Providers & API Keys
  const [apiKeys, setApiKeys] = useState<Record<string, string>>({
    // Frontier Commercial
    gemini: "",
    openai: "",
    anthropic: "",
    grok: "",
    mistral: "",
    cohere: "",
    perplexity: "",

    // Frontier Reasoning & Asian Frontier Labs
    kimi: "",
    deepseek: "",
    qwen: "",
    zhipu: "",
    yi: "",
    baichuan: "",
    siliconflow: "",

    // Hardware Inference
    groq: "",
    cerebras: "",
    sambanova: "",

    // Developer Cloud & Gateways
    openrouter: "",
    together: "",
    fireworks: "",
    deepinfra: "",
    hyperbolic: "",
    novita: "",

    // Local & Custom Endpoints
    ollamaUrl: "",
    lmStudioUrl: "",
    vllmUrl: "",
    customBaseUrl: "",
    customApiKey: "",
    customModelName: "",
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

      const savedSkills = localStorage.getItem("easycode_ai_skills");
      if (savedSkills) {
        try {
          setSkills(JSON.parse(savedSkills));
        } catch (e) {}
      }

      const savedRules = localStorage.getItem("easycode_ai_rules");
      if (savedRules) {
        try {
          setRules(JSON.parse(savedRules));
        } catch (e) {}
      }

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
    } catch (e) {}
  }, [session]);

  const handleToggleSkill = (id: string) => {
    setSkills((prev) => {
      const updated = prev.map((s) => (s.id === id ? { ...s, enabled: !s.enabled } : s));
      try {
        localStorage.setItem("easycode_ai_skills", JSON.stringify(updated));
      } catch (e) {}
      const target = updated.find((s) => s.id === id);
      toast.success(`${target?.name} ${target?.enabled ? "enabled" : "disabled"}`);
      return updated;
    });
  };

  const handleAddCustomSkill = () => {
    if (!newSkillName.trim() || !newSkillMention.trim()) {
      toast.error("Skill name and @mention shortcut are required");
      return;
    }
    const mentionKey = newSkillMention.startsWith("@") ? newSkillMention : `@${newSkillMention}`;
    const newSkill: AiSkill = {
      id: `custom-skill-${Date.now()}`,
      name: newSkillName.trim(),
      mentionKey: mentionKey.toLowerCase(),
      category: newSkillCategory,
      description: newSkillDescription.trim() || "Custom AI Skill",
      badge: "Custom Skill",
      iconName: "Sparkles",
      enabled: true,
      systemPromptModifier: newSkillPromptModifier.trim(),
      outputFormat: "markdown",
      examplePrompt: `Use ${mentionKey} to analyze the problem`,
    };
    setSkills((prev) => {
      const updated = [newSkill, ...prev];
      try {
        localStorage.setItem("easycode_ai_skills", JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
    setNewSkillName("");
    setNewSkillMention("");
    setNewSkillDescription("");
    setNewSkillPromptModifier("");
    setShowAddSkillModal(false);
    toast.success(`Skill ${newSkill.mentionKey} created!`);
  };

  const handleDeleteSkill = (id: string) => {
    setSkills((prev) => {
      const updated = prev.filter((s) => s.id !== id);
      try {
        localStorage.setItem("easycode_ai_skills", JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
    if (selectedSkillToView?.id === id) setSelectedSkillToView(null);
    if (editingSkill?.id === id) setEditingSkill(null);
    toast.success("Skill removed");
  };

  const handleSaveEditSkill = () => {
    if (!editingSkill) return;
    if (!editingSkill.name.trim() || !editingSkill.mentionKey.trim()) {
      toast.error("Skill name and @mention shortcut are required");
      return;
    }
    const mentionKey = editingSkill.mentionKey.startsWith("@") ? editingSkill.mentionKey : `@${editingSkill.mentionKey}`;
    const updatedSkill: AiSkill = {
      ...editingSkill,
      name: editingSkill.name.trim(),
      mentionKey: mentionKey.toLowerCase(),
      description: editingSkill.description.trim(),
      systemPromptModifier: editingSkill.systemPromptModifier.trim(),
      examplePrompt: editingSkill.examplePrompt.trim(),
    };
    setSkills((prev) => {
      const updated = prev.map((s) => (s.id === updatedSkill.id ? updatedSkill : s));
      try {
        localStorage.setItem("easycode_ai_skills", JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
    setEditingSkill(null);
    if (selectedSkillToView?.id === updatedSkill.id) {
      setSelectedSkillToView(updatedSkill);
    }
    toast.success(`Skill ${updatedSkill.mentionKey} updated successfully!`);
  };

  const handleResetSingleSkill = (id: string) => {
    const defaultSkill = BUILT_IN_SKILLS.find((s) => s.id === id);
    if (!defaultSkill) {
      toast.error("No default configuration found for this skill");
      return;
    }
    setSkills((prev) => {
      const updated = prev.map((s) => (s.id === id ? { ...defaultSkill } : s));
      try {
        localStorage.setItem("easycode_ai_skills", JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
    if (selectedSkillToView?.id === id) {
      setSelectedSkillToView(defaultSkill);
    }
    toast.success(`Skill ${defaultSkill.mentionKey} reset to default!`);
  };

  const handleResetAllSkills = () => {
    setSkills(BUILT_IN_SKILLS);
    try {
      localStorage.setItem("easycode_ai_skills", JSON.stringify(BUILT_IN_SKILLS));
    } catch (e) {}
    setSelectedSkillToView(null);
    setEditingSkill(null);
    toast.success("All AI Skills reset to factory default configuration!");
  };

  const handleToggleRule = (id: string) => {
    setRules((prev) => {
      const updated = prev.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r));
      try {
        localStorage.setItem("easycode_ai_rules", JSON.stringify(updated));
      } catch (e) {}
      const target = updated.find((r) => r.id === id);
      toast.success(`Rule "${target?.title}" ${target?.enabled ? "enabled" : "disabled"}`);
      return updated;
    });
  };

  const handleAddCustomRule = () => {
    if (!newRuleTitle.trim() || !newRuleText.trim()) {
      toast.error("Rule title and directive text are required");
      return;
    }
    const newRule: AiRule = {
      id: `custom-rule-${Date.now()}`,
      title: newRuleTitle.trim(),
      category: newRuleCategory,
      description: newRuleDescription.trim() || "Custom system rule directive",
      ruleText: newRuleText.trim(),
      enabled: true,
      isBuiltIn: false,
    };
    setRules((prev) => {
      const updated = [newRule, ...prev];
      try {
        localStorage.setItem("easycode_ai_rules", JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
    setNewRuleTitle("");
    setNewRuleDescription("");
    setNewRuleText("");
    setShowAddRuleModal(false);
    toast.success(`Rule "${newRule.title}" added!`);
  };

  const handleDeleteRule = (id: string) => {
    setRules((prev) => {
      const updated = prev.filter((r) => r.id !== id);
      try {
        localStorage.setItem("easycode_ai_rules", JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
    toast.success("Rule deleted");
  };

  const filteredSkills = useMemo(() => {
    return skills.filter((s) => {
      const matchesSearch =
        s.name.toLowerCase().includes(skillSearchQuery.toLowerCase()) ||
        s.mentionKey.toLowerCase().includes(skillSearchQuery.toLowerCase()) ||
        s.description.toLowerCase().includes(skillSearchQuery.toLowerCase());
      const matchesCategory = selectedSkillCategory === "All" || s.category === selectedSkillCategory;
      return matchesSearch && matchesCategory;
    });
  }, [skills, skillSearchQuery, selectedSkillCategory]);

  const filteredRules = useMemo(() => {
    return rules.filter((r) => {
      const matchesSearch =
        r.title.toLowerCase().includes(ruleSearchQuery.toLowerCase()) ||
        r.ruleText.toLowerCase().includes(ruleSearchQuery.toLowerCase()) ||
        r.description.toLowerCase().includes(ruleSearchQuery.toLowerCase());
      const matchesCategory = selectedRuleCategory === "All" || r.category === selectedRuleCategory;
      return matchesSearch && matchesCategory;
    });
  }, [rules, ruleSearchQuery, selectedRuleCategory]);

  const saveGeneralSettings = () => {
    try {
      localStorage.setItem("easycode_custom_instructions", customInstructions);
      localStorage.setItem("easycode_pref_lang", preferredLanguage);
      toast.success("Settings saved successfully");
    } catch (e) {
      toast.error("Could not save settings");
    }
  };

  const saveApiKeys = async () => {
    try {
      localStorage.setItem("easycode_custom_keys", JSON.stringify(apiKeys));
      
      // Save to Supabase cloud database
      if (session?.user) {
        await fetch("/api/user/keys", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ keys: apiKeys })
        });
      }
      toast.success("API keys saved securely in Supabase & local storage");
    } catch (e) {
      toast.success("API keys saved locally");
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
    toast.success("New memory added");
  };

  const deleteMemory = (id: string) => {
    const updated = memories.filter((m) => m.id !== id);
    setMemories(updated);
    try {
      localStorage.setItem("easycode_user_memories", JSON.stringify(updated));
    } catch (e) {}
    toast.success("Memory deleted");
  };

  const clearAllMemories = () => {
    setMemories([]);
    try {
      localStorage.removeItem("easycode_user_memories");
    } catch (e) {}
    toast.success("All memories cleared");
  };

  // Comprehensive Exhaustive List of Supported Model Groups (Verified Online)
  const ALL_SUPPORTED_GROUPS: ModelGroup[] = useMemo(() => [
    // 1. Moonshot AI (Kimi)
    {
      provider: "Moonshot AI (Kimi)",
      category: "Reasoning",
      requiredKey: "kimi",
      models: [
        {
          id: "kimi-latest",
          name: "Kimi Latest",
          description: "Moonshot AI's flagship long-context reasoning engine for complex algorithmic synthesis.",
          contextWindow: "128,000 tokens",
          badge: "Long Context",
          requiredKey: "kimi",
        },
        {
          id: "moonshot-v1-128k",
          name: "Moonshot v1 128k",
          description: "Extended 128k context reasoning and problem decomposition engine.",
          contextWindow: "128,000 tokens",
          badge: "128k Context",
          requiredKey: "kimi",
        },
        {
          id: "moonshot-v1-32k",
          name: "Moonshot v1 32k",
          description: "High-speed 32k context reasoning model for competitive programming.",
          contextWindow: "32,000 tokens",
          badge: "Fast",
          requiredKey: "kimi",
        },
        {
          id: "moonshot-v1-8k",
          name: "Moonshot v1 8k",
          description: "Lightweight and ultra-low latency version of Moonshot v1.",
          contextWindow: "8,000 tokens",
          badge: "Speed",
          requiredKey: "kimi",
        },
      ],
    },

    // 2. Google DeepMind
    {
      provider: "Google DeepMind",
      category: "Frontier",
      requiredKey: "gemini",
      models: [
        {
          id: "gemini-2.5-pro",
          name: "Gemini 2.5 Pro",
          description: "Frontier mathematical and algorithmic reasoning engine with extended 2M context window.",
          contextWindow: "2,000,000 tokens",
          badge: "Advanced",
          requiredKey: "gemini",
        },
        {
          id: "gemini-2.5-flash",
          name: "Gemini 2.5 Flash",
          description: "Ultra-fast default model for real-time problem generation, hints, and algorithmic breakdown.",
          contextWindow: "1,000,000 tokens",
          badge: "Fast",
          requiredKey: "gemini",
        },
        {
          id: "gemini-2.0-flash-thinking",
          name: "Gemini 2.0 Flash Thinking",
          description: "Dedicated chain-of-thought verification for boundary cases, proofs, and edge tests.",
          contextWindow: "1,000,000 tokens",
          badge: "Reasoning",
          requiredKey: "gemini",
        },
        {
          id: "gemini-2.0-flash",
          name: "Gemini 2.0 Flash",
          description: "Next-gen low-latency multimodal reasoning for high-frequency interactive coding.",
          contextWindow: "1,000,000 tokens",
          badge: "Speed",
          requiredKey: "gemini",
        },
        {
          id: "gemini-1.5-pro",
          name: "Gemini 1.5 Pro",
          description: "Massive 2M context window suited for entire codebase and repository synthesis.",
          contextWindow: "2,000,000 tokens",
          badge: "2M Context",
          requiredKey: "gemini",
        },
      ],
    },

    // 3. OpenAI
    {
      provider: "OpenAI",
      category: "Frontier",
      requiredKey: "openai",
      models: [
        {
          id: "o3-mini",
          name: "o3-mini",
          description: "High-reasoning STEM specialist optimized for competitive programming and mathematical proofs.",
          contextWindow: "200,000 tokens",
          badge: "STEM SOTA",
          requiredKey: "openai",
        },
        {
          id: "o1",
          name: "o1",
          description: "Full reasoning flagship spending dedicated compute time thinking before generating solutions.",
          contextWindow: "200,000 tokens",
          badge: "Deep Reasoning",
          requiredKey: "openai",
        },
        {
          id: "o1-mini",
          name: "o1-mini",
          description: "Fast mathematical reasoning model optimized for coding without multimodal overhead.",
          contextWindow: "128,000 tokens",
          badge: "Reasoning",
          requiredKey: "openai",
        },
        {
          id: "gpt-4o",
          name: "GPT-4o",
          description: "Omni multimodal flagship with high algorithmic precision and versatile instruction following.",
          contextWindow: "128,000 tokens",
          badge: "Flagship",
          requiredKey: "openai",
        },
        {
          id: "gpt-4o-mini",
          name: "GPT-4o mini",
          description: "Fast and cost-efficient version of GPT-4o for rapid code hints and sanity checks.",
          contextWindow: "128,000 tokens",
          badge: "Fast",
          requiredKey: "openai",
        },
      ],
    },

    // 4. Anthropic
    {
      provider: "Anthropic",
      category: "Coding",
      requiredKey: "anthropic",
      models: [
        {
          id: "claude-3.7-sonnet",
          name: "Claude 3.7 Sonnet",
          description: "Anthropic's flagship hybrid reasoning model with dynamic thinking tokens for complex systems.",
          contextWindow: "200,000 tokens",
          badge: "Hybrid SOTA",
          requiredKey: "anthropic",
        },
        {
          id: "claude-3.5-sonnet",
          name: "Claude 3.5 Sonnet",
          description: "Industry gold standard for competitive programming, nuanced algorithm proofs, and code craft.",
          contextWindow: "200,000 tokens",
          badge: "Top Coder",
          requiredKey: "anthropic",
        },
        {
          id: "claude-3.5-haiku",
          name: "Claude 3.5 Haiku",
          description: "Ultra-fast response latency for rapid hints, bug diagnoses, and algorithmic nudges.",
          contextWindow: "200,000 tokens",
          badge: "Fast",
          requiredKey: "anthropic",
        },
        {
          id: "claude-3-opus",
          name: "Claude 3 Opus",
          description: "Deep analytical synthesis and complex multi-component distributed system design.",
          contextWindow: "200,000 tokens",
          badge: "Deep",
          requiredKey: "anthropic",
        },
      ],
    },

    // 5. DeepSeek
    {
      provider: "DeepSeek",
      category: "Reasoning",
      requiredKey: "deepseek",
      models: [
        {
          id: "deepseek-r1",
          name: "DeepSeek R1",
          description: "Open-weights reasoning powerhouse matching proprietary frontier reasoning benchmarks.",
          contextWindow: "64,000 tokens",
          badge: "Reasoning SOTA",
          requiredKey: "deepseek",
        },
        {
          id: "deepseek-v3",
          name: "DeepSeek V3",
          description: "671B parameter Mixture-of-Experts model tailored for rapid high-precision code synthesis.",
          contextWindow: "64,000 tokens",
          badge: "671B MoE",
          requiredKey: "deepseek",
        },
        {
          id: "deepseek-coder-v2",
          name: "DeepSeek Coder V2",
          description: "236B parameter MoE coding specialist supporting 338+ programming languages.",
          contextWindow: "128,000 tokens",
          badge: "338+ Langs",
          requiredKey: "deepseek",
        },
      ],
    },

    // 6. Groq
    {
      provider: "Groq",
      category: "Speed",
      requiredKey: "groq",
      models: [
        {
          id: "groq-llama-3.3-70b",
          name: "Llama 3.3 70B (Groq)",
          description: "Real-time inference on Groq Language Processing Units.",
          contextWindow: "128,000 tokens",
          badge: "Fast",
          requiredKey: "groq",
        },
        {
          id: "groq-deepseek-r1-llama-70b",
          name: "DeepSeek R1 70B (Groq)",
          description: "DeepSeek R1 reasoning at sub-second speeds for instantaneous problem decomposition.",
          contextWindow: "128,000 tokens",
          badge: "Instant CoT",
          requiredKey: "groq",
        },
        {
          id: "groq-qwen-2.5-coder-32b",
          name: "Qwen 2.5 Coder 32B (Groq)",
          description: "Ultra-fast competitive programming specialist running on dedicated LPU hardware.",
          contextWindow: "32,000 tokens",
          badge: "Fast Coder",
          requiredKey: "groq",
        },
      ],
    },

    // 7. Alibaba Cloud (Qwen)
    {
      provider: "Alibaba Cloud (Qwen)",
      category: "Coding",
      requiredKey: "qwen",
      models: [
        {
          id: "qwen-2.5-coder-32b",
          name: "Qwen 2.5 Coder 32B",
          description: "World leading open coding model matching GPT-4o on HumanEval and live coding benchmarks.",
          contextWindow: "128,000 tokens",
          badge: "Open Champion",
          requiredKey: "qwen",
        },
        {
          id: "qwq-32b-preview",
          name: "QwQ 32B Preview",
          description: "Alibaba's dedicated Chain-of-Thought reasoning model for deep math and algorithm proofs.",
          contextWindow: "32,000 tokens",
          badge: "Math & CoT",
          requiredKey: "qwen",
        },
        {
          id: "qwen-2.5-72b-instruct",
          name: "Qwen 2.5 72B Instruct",
          description: "72B flagship general intelligence and multi-step complex code architect.",
          contextWindow: "128,000 tokens",
          badge: "72B Flagship",
          requiredKey: "qwen",
        },
      ],
    },

    // 8. Cerebras Systems
    {
      provider: "Cerebras Systems",
      category: "Speed",
      requiredKey: "cerebras",
      models: [
        {
          id: "cerebras-llama-3.3-70b",
          name: "Llama 3.3 70B (Cerebras)",
          description: "Ultra-high speed wafer-scale inference engine.",
          contextWindow: "128,000 tokens",
          badge: "Fast",
          requiredKey: "cerebras",
        },
        {
          id: "cerebras-deepseek-r1-distill-70b",
          name: "DeepSeek R1 70B (Cerebras)",
          description: "Instantaneous DeepSeek R1 reasoning on Cerebras CS-3 supercomputer chips.",
          contextWindow: "128,000 tokens",
          badge: "Instant CoT",
          requiredKey: "cerebras",
        },
      ],
    },

    // 9. SambaNova Systems
    {
      provider: "SambaNova Systems",
      category: "Speed",
      requiredKey: "sambanova",
      models: [
        {
          id: "sambanova-deepseek-r1",
          name: "DeepSeek R1 (SambaNova)",
          description: "Full DeepSeek R1 reasoning running on SambaNova DataScale accelerators.",
          contextWindow: "64,000 tokens",
          badge: "Fast",
          requiredKey: "sambanova",
        },
        {
          id: "sambanova-llama-3.3-70b",
          name: "Llama 3.3 70B (SambaNova)",
          description: "High precision enterprise Llama 3.3 70B on dedicated reconfigurable dataflow units.",
          contextWindow: "128,000 tokens",
          badge: "Fast",
          requiredKey: "sambanova",
        },
      ],
    },

    // 10. Zhipu AI (GLM)
    {
      provider: "Zhipu AI (GLM)",
      category: "Reasoning",
      requiredKey: "zhipu",
      models: [
        {
          id: "glm-4-plus",
          name: "GLM-4 Plus",
          description: "Zhipu AI's flagship reasoning and bilingual code generation engine.",
          contextWindow: "128,000 tokens",
          badge: "Flagship",
          requiredKey: "zhipu",
        },
        {
          id: "codegeex-4",
          name: "CodeGeeX-4",
          description: "Dedicated multilingual coding model optimized for repository and problem synthesis.",
          contextWindow: "128,000 tokens",
          badge: "Code SOTA",
          requiredKey: "zhipu",
        },
      ],
    },

    // 11. 01.AI (Yi)
    {
      provider: "01.AI (Yi)",
      category: "Frontier",
      requiredKey: "yi",
      models: [
        {
          id: "yi-lightning",
          name: "Yi Lightning",
          description: "01.AI's state-of-the-art flagship reasoning model ranked top on LMSYS leaderboard.",
          contextWindow: "128,000 tokens",
          badge: "Leaderboard Top",
          requiredKey: "yi",
        },
        {
          id: "yi-large",
          name: "Yi Large",
          description: "High-capability reasoning and instruction-following for algorithmic proofs.",
          contextWindow: "128,000 tokens",
          badge: "Large",
          requiredKey: "yi",
        },
      ],
    },

    // 12. SiliconFlow
    {
      provider: "SiliconFlow (SiliconCloud)",
      category: "Speed",
      requiredKey: "siliconflow",
      models: [
        {
          id: "siliconflow-deepseek-r1",
          name: "DeepSeek R1 (SiliconFlow)",
          description: "Dedicated enterprise-grade cloud hosting for full DeepSeek R1 671B model.",
          contextWindow: "64,000 tokens",
          badge: "Full 671B",
          requiredKey: "siliconflow",
        },
        {
          id: "siliconflow-qwen-2.5-coder-32b",
          name: "Qwen 2.5 Coder (SiliconFlow)",
          description: "Low-latency inference for Qwen 2.5 Coder 32B across multiple regions.",
          contextWindow: "32,000 tokens",
          badge: "Fast",
          requiredKey: "siliconflow",
        },
      ],
    },

    // 13. Mistral AI
    {
      provider: "Mistral AI",
      category: "Coding",
      requiredKey: "mistral",
      models: [
        {
          id: "codestral-latest",
          name: "Codestral 22B",
          description: "Mistral's dedicated generative model built specifically for code synthesis across 80+ languages.",
          contextWindow: "32,000 tokens",
          badge: "Code Specialist",
          requiredKey: "mistral",
        },
        {
          id: "mistral-large",
          name: "Mistral Large 2411",
          description: "123B flagship multilingual model with top-tier reasoning and tool orchestration.",
          contextWindow: "128,000 tokens",
          badge: "123B Flagship",
          requiredKey: "mistral",
        },
      ],
    },

    // 14. xAI (Grok)
    {
      provider: "xAI (Grok)",
      category: "Frontier",
      requiredKey: "grok",
      models: [
        {
          id: "grok-2",
          name: "Grok 2",
          description: "xAI's flagship frontier reasoning engine with advanced mathematical decomposition.",
          contextWindow: "128,000 tokens",
          badge: "Flagship",
          requiredKey: "grok",
        },
        {
          id: "grok-2-mini",
          name: "Grok 2 mini",
          description: "Lightweight and rapid Grok engine for high-speed code generation and hints.",
          contextWindow: "128,000 tokens",
          badge: "Fast",
          requiredKey: "grok",
        },
      ],
    },

    // 15. Together AI
    {
      provider: "Together AI",
      category: "Open Source",
      requiredKey: "together",
      models: [
        {
          id: "together-llama-3.3-70b",
          name: "Llama 3.3 70B (Together)",
          description: "Meta's flagship open-weights model hosted on Together's high-speed inference engine.",
          contextWindow: "128,000 tokens",
          badge: "Together Cloud",
          requiredKey: "together",
        },
        {
          id: "together-deepseek-r1",
          name: "DeepSeek R1 (Together)",
          description: "Full DeepSeek R1 671B reasoning on Together GPU cluster.",
          contextWindow: "64,000 tokens",
          badge: "Deep CoT",
          requiredKey: "together",
        },
      ],
    },

    // 16. Fireworks AI
    {
      provider: "Fireworks AI",
      category: "Speed",
      requiredKey: "fireworks",
      models: [
        {
          id: "fireworks-deepseek-r1",
          name: "DeepSeek R1 (Fireworks)",
          description: "Compound AI reasoning running with speculative decoding for ultra-fast response times.",
          contextWindow: "128,000 tokens",
          badge: "Fast CoT",
          requiredKey: "fireworks",
        },
        {
          id: "fireworks-qwen-2.5-coder-32b",
          name: "Qwen 2.5 Coder 32B (Fireworks)",
          description: "High-throughput coding model with optimized KV cache.",
          contextWindow: "32,000 tokens",
          badge: "Speed",
          requiredKey: "fireworks",
        },
      ],
    },

    // 17. Perplexity AI
    {
      provider: "Perplexity AI",
      category: "Search",
      requiredKey: "perplexity",
      models: [
        {
          id: "sonar-reasoning-pro",
          name: "Sonar Reasoning Pro",
          description: "Live internet grounded Chain-of-Thought reasoning for real-world API references.",
          contextWindow: "128,000 tokens",
          badge: "Grounded CoT",
          requiredKey: "perplexity",
        },
      ],
    },

    // 18. Cohere
    {
      provider: "Cohere",
      category: "Frontier",
      requiredKey: "cohere",
      models: [
        {
          id: "command-r-plus",
          name: "Command R+",
          description: "Cohere's flagship enterprise multilingual model for complex problem workflows.",
          contextWindow: "128,000 tokens",
          badge: "Enterprise",
          requiredKey: "cohere",
        },
      ],
    },

    // 19. OpenRouter (Universal Gateway)
    {
      provider: "OpenRouter (300+ Gateway)",
      category: "Universal",
      requiredKey: "openrouter",
      models: [
        {
          id: "openrouter-auto",
          name: "OpenRouter Auto",
          description: "Universal dynamic routing across 300+ models with automatic price/performance optimization.",
          contextWindow: "Dynamic",
          badge: "300+ Models",
          requiredKey: "openrouter",
        },
      ],
    },

    // 20. Local & Custom Hosts
    {
      provider: "Local LLMs (Private & Offline)",
      category: "Local",
      requiredKey: "ollamaUrl",
      models: [
        {
          id: "ollama-local",
          name: "Local Ollama Host",
          description: "Connects directly to your local Ollama instance (localhost:11434). 100% private and offline.",
          contextWindow: "Configurable",
          badge: "100% Private",
          requiredKey: "ollamaUrl",
        },
      ],
    },
  ], []);

  // Helper: Is a provider key present?
  const isKeyConfigured = (keyName: string): boolean => {
    const val = apiKeys[keyName];
    return Boolean(val && typeof val === "string" && val.trim().length > 5);
  };

  // Filter model groups based on whether user has configured keys
  const visibleModelGroups = useMemo(() => {
    return ALL_SUPPORTED_GROUPS.map((group) => {
      const keyIsReady = isKeyConfigured(group.requiredKey);

      // In activeOnly mode, ONLY show groups for which the user has configured an API key!
      if (modelsDisplayMode === "activeOnly" && !keyIsReady) {
        return null;
      }

      // Filter by category pill if not "All"
      if (
        selectedProviderFilter !== "All" &&
        group.category !== selectedProviderFilter &&
        group.provider !== selectedProviderFilter
      ) {
        return null;
      }

      // Filter models by search query
      const filteredModels = group.models.filter(
        (m) =>
          m.name.toLowerCase().includes(modelSearchQuery.toLowerCase()) ||
          m.id.toLowerCase().includes(modelSearchQuery.toLowerCase()) ||
          m.description.toLowerCase().includes(modelSearchQuery.toLowerCase()) ||
          m.badge.toLowerCase().includes(modelSearchQuery.toLowerCase())
      );

      if (filteredModels.length === 0) return null;

      return {
        ...group,
        keyIsReady,
        models: filteredModels,
      };
    }).filter(Boolean) as (ModelGroup & { keyIsReady: boolean })[];
  }, [ALL_SUPPORTED_GROUPS, apiKeys, modelsDisplayMode, selectedProviderFilter, modelSearchQuery]);

  const configuredModelCount = useMemo(() => {
    return ALL_SUPPORTED_GROUPS.reduce((acc, g) => {
      if (isKeyConfigured(g.requiredKey)) {
        return acc + g.models.length;
      }
      return acc;
    }, 0);
  }, [ALL_SUPPORTED_GROUPS, apiKeys]);

  const totalSupportedCount = useMemo(() => {
    return ALL_SUPPORTED_GROUPS.reduce((acc, g) => acc + g.models.length, 0);
  }, [ALL_SUPPORTED_GROUPS]);

  return (
    <div className="w-full max-w-3xl mx-auto py-8 px-4 md:px-0 space-y-7">
      
      {/* Hidden dummy input to completely absorb aggressive browser autofills */}
      <input type="text" style={{ display: 'none' }} tabIndex={-1} aria-hidden="true" autoComplete="off" />
      <input type="password" style={{ display: 'none' }} tabIndex={-1} aria-hidden="true" autoComplete="off" />

      {/* Title */}
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <h1 className="font-serif text-2xl md:text-3xl font-medium tracking-tight text-[#1C1B19] dark:text-[#EDEDEB]">
            Settings
          </h1>
          <span className="text-[11px] font-mono text-neutral-500 bg-black/[0.03] dark:bg-white/[0.04] px-2.5 py-1 rounded-full border border-neutral-300 dark:border-neutral-700">
            {configuredModelCount} Active / {totalSupportedCount} Supported
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#E8E4DB] dark:border-[#2D2B28] gap-5 text-xs font-medium overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab("models")}
          className={`pb-2.5 transition-colors relative whitespace-nowrap ${
            activeTab === "models"
              ? "text-[#1C1B19] dark:text-white font-semibold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-[#1C1B19] dark:after:bg-white"
              : "text-[#7A756C] dark:text-[#8C8880] hover:text-[#1C1B19] dark:hover:text-white"
          }`}
        >
          Active LLM Models
        </button>

        <button
          onClick={() => setActiveTab("apikeys")}
          className={`pb-2.5 transition-colors relative whitespace-nowrap ${
            activeTab === "apikeys"
              ? "text-[#1C1B19] dark:text-white font-semibold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-[#1C1B19] dark:after:bg-white"
              : "text-[#7A756C] dark:text-[#8C8880] hover:text-[#1C1B19] dark:hover:text-white"
          }`}
        >
          API Keys & Endpoints
        </button>

        <button
          onClick={() => setActiveTab("skills")}
          className={`pb-2.5 transition-colors relative whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === "skills"
              ? "text-[#1C1B19] dark:text-white font-semibold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-[#1C1B19] dark:after:bg-white"
              : "text-[#7A756C] dark:text-[#8C8880] hover:text-[#1C1B19] dark:hover:text-white"
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>AI Skills & Generators</span>
        </button>

        <button
          onClick={() => setActiveTab("rules")}
          className={`pb-2.5 transition-colors relative whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === "rules"
              ? "text-[#1C1B19] dark:text-white font-semibold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-[#1C1B19] dark:after:bg-white"
              : "text-[#7A756C] dark:text-[#8C8880] hover:text-[#1C1B19] dark:hover:text-white"
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span>Rules & Directives</span>
        </button>

        <button
          onClick={() => setActiveTab("memory")}
          className={`pb-2.5 transition-colors relative whitespace-nowrap ${
            activeTab === "memory"
              ? "text-[#1C1B19] dark:text-white font-semibold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-[#1C1B19] dark:after:bg-white"
              : "text-[#7A756C] dark:text-[#8C8880] hover:text-[#1C1B19] dark:hover:text-white"
          }`}
        >
          Memory
        </button>

        <button
          onClick={() => setActiveTab("general")}
          className={`pb-2.5 transition-colors relative whitespace-nowrap ${
            activeTab === "general"
              ? "text-[#1C1B19] dark:text-white font-semibold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-[#1C1B19] dark:after:bg-white"
              : "text-[#7A756C] dark:text-[#8C8880] hover:text-[#1C1B19] dark:hover:text-white"
          }`}
        >
          General
        </button>
      </div>

      {/* TAB 1: LLM MODELS & ENGINE */}
      {activeTab === "models" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-[#8C877D] dark:text-[#6E6A63]">
                Configured AI Models ({configuredModelCount} Active)
              </h2>
              <p className="text-xs text-[#7A756C] dark:text-[#8C8880]">
                Only models with configured API keys can generate problems and code.
              </p>
            </div>

            {/* Toggle: Active Only vs All Supported */}
            <div className="flex items-center bg-black/[0.04] dark:bg-white/[0.04] p-0.5 rounded-lg text-[11px] border border-black/[0.04] dark:border-white/[0.04]">
              <button
                onClick={() => setModelsDisplayMode("activeOnly")}
                className={`px-2.5 py-1 rounded-md transition-all font-medium ${
                  modelsDisplayMode === "activeOnly"
                    ? "bg-[#3A3733] text-white dark:bg-white dark:text-[#1C1B19] shadow-2xs"
                    : "text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
                }`}
              >
                Available ({configuredModelCount})
              </button>
              <button
                onClick={() => setModelsDisplayMode("all")}
                className={`px-2.5 py-1 rounded-md transition-all font-medium ${
                  modelsDisplayMode === "all"
                    ? "bg-[#3A3733] text-white dark:bg-white dark:text-[#1C1B19] shadow-2xs"
                    : "text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
                }`}
              >
                All Supported ({totalSupportedCount})
              </button>
            </div>
          </div>

          {/* EMPTY STATE: If user has 0 configured keys */}
          {configuredModelCount === 0 && modelsDisplayMode === "activeOnly" ? (
            <div className="p-8 rounded-2xl border border-dashed border-[#DFDAD0] dark:border-[#383532] bg-white/40 dark:bg-[#242321]/40 text-center space-y-4">
              <div className="w-10 h-10 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto">
                <Key className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">
                  No Active AI Models Configured
                </h3>
                <p className="text-xs text-[#7A756C] dark:text-[#8C8880] max-w-md mx-auto leading-relaxed">
                  You have not added any API keys yet. Only models with valid API keys will appear in your workspace.
                </p>
              </div>
              <button
                onClick={() => setActiveTab("apikeys")}
                className="px-4 py-2 rounded-xl bg-[#3A3733] text-white dark:bg-white dark:text-[#1C1B19] text-xs font-semibold hover:opacity-90 transition-opacity shadow-xs inline-flex items-center gap-1.5"
              >
                <span>Add Your API Key in Settings</span>
                <span>→</span>
              </button>
            </div>
          ) : (
            <>
              {/* Search Box & Quick Filter Pills */}
              <div className="space-y-3">
                <div className="relative w-full">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                  <input
                    type="search"
                    name="settings-models-search-field"
                    autoComplete="off"
                    autoCorrect="off"
                    autoCapitalize="off"
                    spellCheck={false}
                    data-form-type="other"
                    data-1p-ignore="true"
                    data-lpignore="true"
                    data-bwignore="true"
                    value={modelSearchQuery}
                    onChange={(e) => setModelSearchQuery(e.target.value)}
                    placeholder="Search active models (e.g. 'Kimi', 'Claude', 'DeepSeek', 'Qwen', 'Gemini')..."
                    className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-[#ECE8DF]/60 dark:bg-[#282624]/60 border border-[#DFDAD0] dark:border-[#383532] text-xs text-[#1C1B19] dark:text-[#EDEDEB] placeholder-[#8C877D] dark:placeholder-[#6E6A63] outline-hidden focus:border-neutral-500"
                  />
                </div>

                {/* Filter Pills */}
                <div className="flex items-center gap-1.5 flex-wrap text-[11px]">
                  {[
                    "All",
                    "Frontier",
                    "Reasoning",
                    "Coding",
                    "Speed",
                    "Local",
                  ].map((pill) => (
                    <button
                      key={pill}
                      onClick={() => setSelectedProviderFilter(pill)}
                      className={`px-2.5 py-1 rounded-lg border transition-colors ${
                        selectedProviderFilter === pill
                          ? "bg-[#3A3733] text-white dark:bg-white dark:text-[#1C1B19] border-transparent font-medium shadow-2xs"
                          : "border-[#DFDAD0] dark:border-[#383532] bg-white/40 dark:bg-[#242321]/40 text-[#6B665E] dark:text-[#9E9B93] hover:bg-white dark:hover:bg-[#2B2927]"
                      }`}
                    >
                      {pill}
                    </button>
                  ))}
                </div>
              </div>

              {/* Model Registry List */}
              <div className="space-y-6">
                {visibleModelGroups.length === 0 ? (
                  <div className="py-12 text-center text-xs text-[#8C877D] dark:text-[#6E6A63] border border-dashed border-[#DFDAD0] dark:border-[#383532] rounded-xl space-y-1">
                    <Cpu className="w-5 h-5 mx-auto opacity-40" />
                    <p className="font-medium">No matching models found</p>
                  </div>
                ) : (
                  visibleModelGroups.map((group) => (
                    <div key={group.provider} className="space-y-2.5">
                      <div className="flex items-center justify-between text-[11px] font-semibold tracking-wider text-[#4A4640] dark:text-[#C5C2BA] uppercase">
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${group.keyIsReady ? "bg-emerald-500" : "bg-neutral-400"}`} />
                          <span>{group.provider}</span>
                        </div>
                        <span className="text-[10px] font-mono opacity-60 lowercase">
                          {group.keyIsReady ? "Configured & Active" : "Key Needed"}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 gap-2">
                        {group.models.map((model) => (
                          <div
                            key={model.id}
                            onClick={() => {
                              if (!group.keyIsReady) {
                                toast.error(`Configure your ${group.provider} API key in the 'API Keys' tab first.`);
                                return;
                              }
                              onModelSelect(model.id);
                              toast.success(`Active model changed to ${model.name}`);
                            }}
                            className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start justify-between gap-3 ${
                              !group.keyIsReady
                                ? "opacity-50 border-[#DFDAD0] dark:border-[#383532] bg-black/[0.01] dark:bg-white/[0.01]"
                                : currentModel === model.id
                                ? "border-[#3A3733] dark:border-white bg-[#ECE8DF]/80 dark:bg-[#282624]/80 shadow-2xs"
                                : "border-[#DFDAD0] dark:border-[#383532] bg-white/40 dark:bg-[#242321]/40 hover:bg-white/70 dark:hover:bg-[#282624]"
                            }`}
                          >
                            <div className="space-y-1">
                              <div className="flex items-center gap-2 flex-wrap">
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
                              {group.keyIsReady ? (
                                <div
                                  className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                                    currentModel === model.id
                                      ? "border-[#3A3733] dark:border-white bg-[#3A3733] dark:bg-white text-white dark:text-[#1C1B19]"
                                      : "border-[#DFDAD0] dark:border-[#4A4742]"
                                  }`}
                                >
                                  {currentModel === model.id && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                                </div>
                              ) : (
                                <span className="text-[10px] font-mono text-neutral-400">
                                  Key needed
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </>
          )}

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
          </div>
        </div>
      )}

      {/* TAB 2: API KEYS & INFERENCE ENDPOINTS (EXHAUSTIVE) */}
      {activeTab === "apikeys" && (
        <div className="space-y-8">
          <div className="space-y-1">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-[#8C877D] dark:text-[#6E6A63]">
              API Keys & Inference Endpoints
            </h2>
            <p className="text-xs text-[#7A756C] dark:text-[#8C8880]">
              Add your API keys from any AI platform below. Once saved to your account in Supabase, only the models from your configured providers will appear in your workspace.
            </p>
          </div>

          {/* SECTION 1: FRONTIER COMMERCIAL & REASONING LABS */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
              <Sparkles className="w-3.5 h-3.5 text-neutral-500" />
              <span>Frontier Commercial & Reasoning Labs</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Moonshot AI (Kimi) */}
              <div className="space-y-1.5 p-3 rounded-xl bg-white/40 dark:bg-[#242321]/40 border border-[#DFDAD0] dark:border-[#383532]">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-[#1C1B19] dark:text-[#EDEDEB] flex items-center gap-1.5">
                    <span>Moonshot AI (Kimi)</span>
                    {apiKeys.kimi && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />}
                  </label>
                  <span className="text-[10px] font-mono text-neutral-500">
                    {apiKeys.kimi ? "Configured" : "Not Set"}
                  </span>
                </div>
                <input
                  type="password"
                  name="api-key-kimi-custom-input"
                  autoComplete="new-password"
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck={false}
                  data-form-type="other"
                  data-1p-ignore="true"
                  data-lpignore="true"
                  data-bwignore="true"
                  value={apiKeys.kimi || ""}
                  onChange={(e) => setApiKeys({ ...apiKeys, kimi: e.target.value })}
                  placeholder="sk-..."
                  className="w-full px-3 py-1.5 rounded-lg bg-[#ECE8DF]/60 dark:bg-[#282624]/60 border border-[#DFDAD0] dark:border-[#383532] text-xs font-mono text-[#1C1B19] dark:text-[#EDEDEB] placeholder-[#8C877D] dark:placeholder-[#6E6A63] outline-hidden focus:border-neutral-500"
                />
              </div>

              {/* Google AI Studio (Gemini) */}
              <div className="space-y-1.5 p-3 rounded-xl bg-white/40 dark:bg-[#242321]/40 border border-[#DFDAD0] dark:border-[#383532]">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-[#1C1B19] dark:text-[#EDEDEB] flex items-center gap-1.5">
                    <span>Google AI Studio (Gemini)</span>
                    {apiKeys.gemini && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />}
                  </label>
                  <span className="text-[10px] font-mono text-neutral-500">
                    {apiKeys.gemini ? "Configured" : "Not Set"}
                  </span>
                </div>
                <input
                  type="password"
                  name="api-key-gemini-custom-input"
                  autoComplete="new-password"
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck={false}
                  data-form-type="other"
                  data-1p-ignore="true"
                  data-lpignore="true"
                  data-bwignore="true"
                  value={apiKeys.gemini || ""}
                  onChange={(e) => setApiKeys({ ...apiKeys, gemini: e.target.value })}
                  placeholder="AIzaSy..."
                  className="w-full px-3 py-1.5 rounded-lg bg-[#ECE8DF]/60 dark:bg-[#282624]/60 border border-[#DFDAD0] dark:border-[#383532] text-xs font-mono text-[#1C1B19] dark:text-[#EDEDEB] placeholder-[#8C877D] dark:placeholder-[#6E6A63] outline-hidden focus:border-neutral-500"
                />
              </div>

              {/* OpenAI */}
              <div className="space-y-1.5 p-3 rounded-xl bg-white/40 dark:bg-[#242321]/40 border border-[#DFDAD0] dark:border-[#383532]">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-[#1C1B19] dark:text-[#EDEDEB] flex items-center gap-1.5">
                    <span>OpenAI (o1, o3-mini, GPT-4o)</span>
                    {apiKeys.openai && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />}
                  </label>
                  <span className="text-[10px] font-mono text-neutral-500">
                    {apiKeys.openai ? "Configured" : "Not Set"}
                  </span>
                </div>
                <input
                  type="password"
                  name="api-key-openai-custom-input"
                  autoComplete="new-password"
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck={false}
                  data-form-type="other"
                  data-1p-ignore="true"
                  data-lpignore="true"
                  data-bwignore="true"
                  value={apiKeys.openai || ""}
                  onChange={(e) => setApiKeys({ ...apiKeys, openai: e.target.value })}
                  placeholder="sk-proj-..."
                  className="w-full px-3 py-1.5 rounded-lg bg-[#ECE8DF]/60 dark:bg-[#282624]/60 border border-[#DFDAD0] dark:border-[#383532] text-xs font-mono text-[#1C1B19] dark:text-[#EDEDEB] placeholder-[#8C877D] dark:placeholder-[#6E6A63] outline-hidden focus:border-neutral-500"
                />
              </div>

              {/* Anthropic */}
              <div className="space-y-1.5 p-3 rounded-xl bg-white/40 dark:bg-[#242321]/40 border border-[#DFDAD0] dark:border-[#383532]">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-[#1C1B19] dark:text-[#EDEDEB] flex items-center gap-1.5">
                    <span>Anthropic (Claude 3.7 / 3.5 Sonnet)</span>
                    {apiKeys.anthropic && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />}
                  </label>
                  <span className="text-[10px] font-mono text-neutral-500">
                    {apiKeys.anthropic ? "Configured" : "Not Set"}
                  </span>
                </div>
                <input
                  type="password"
                  name="api-key-anthropic-custom-input"
                  autoComplete="new-password"
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck={false}
                  data-form-type="other"
                  data-1p-ignore="true"
                  data-lpignore="true"
                  data-bwignore="true"
                  value={apiKeys.anthropic || ""}
                  onChange={(e) => setApiKeys({ ...apiKeys, anthropic: e.target.value })}
                  placeholder="sk-ant-api..."
                  className="w-full px-3 py-1.5 rounded-lg bg-[#ECE8DF]/60 dark:bg-[#282624]/60 border border-[#DFDAD0] dark:border-[#383532] text-xs font-mono text-[#1C1B19] dark:text-[#EDEDEB] placeholder-[#8C877D] dark:placeholder-[#6E6A63] outline-hidden focus:border-neutral-500"
                />
              </div>

              {/* DeepSeek */}
              <div className="space-y-1.5 p-3 rounded-xl bg-white/40 dark:bg-[#242321]/40 border border-[#DFDAD0] dark:border-[#383532]">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-[#1C1B19] dark:text-[#EDEDEB] flex items-center gap-1.5">
                    <span>DeepSeek (R1, V3, Coder)</span>
                    {apiKeys.deepseek && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />}
                  </label>
                  <span className="text-[10px] font-mono text-neutral-500">
                    {apiKeys.deepseek ? "Configured" : "Not Set"}
                  </span>
                </div>
                <input
                  type="password"
                  name="api-key-deepseek-custom-input"
                  autoComplete="new-password"
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck={false}
                  data-form-type="other"
                  data-1p-ignore="true"
                  data-lpignore="true"
                  data-bwignore="true"
                  value={apiKeys.deepseek || ""}
                  onChange={(e) => setApiKeys({ ...apiKeys, deepseek: e.target.value })}
                  placeholder="sk-..."
                  className="w-full px-3 py-1.5 rounded-lg bg-[#ECE8DF]/60 dark:bg-[#282624]/60 border border-[#DFDAD0] dark:border-[#383532] text-xs font-mono text-[#1C1B19] dark:text-[#EDEDEB] placeholder-[#8C877D] dark:placeholder-[#6E6A63] outline-hidden focus:border-neutral-500"
                />
              </div>

              {/* xAI (Grok) */}
              <div className="space-y-1.5 p-3 rounded-xl bg-white/40 dark:bg-[#242321]/40 border border-[#DFDAD0] dark:border-[#383532]">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-[#1C1B19] dark:text-[#EDEDEB] flex items-center gap-1.5">
                    <span>xAI (Grok 2)</span>
                    {apiKeys.grok && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />}
                  </label>
                  <span className="text-[10px] font-mono text-neutral-500">
                    {apiKeys.grok ? "Configured" : "Not Set"}
                  </span>
                </div>
                <input
                  type="password"
                  name="api-key-grok-custom-input"
                  autoComplete="new-password"
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck={false}
                  data-form-type="other"
                  data-1p-ignore="true"
                  data-lpignore="true"
                  data-bwignore="true"
                  value={apiKeys.grok || ""}
                  onChange={(e) => setApiKeys({ ...apiKeys, grok: e.target.value })}
                  placeholder="xai-..."
                  className="w-full px-3 py-1.5 rounded-lg bg-[#ECE8DF]/60 dark:bg-[#282624]/60 border border-[#DFDAD0] dark:border-[#383532] text-xs font-mono text-[#1C1B19] dark:text-[#EDEDEB] placeholder-[#8C877D] dark:placeholder-[#6E6A63] outline-hidden focus:border-neutral-500"
                />
              </div>

              {/* Mistral AI */}
              <div className="space-y-1.5 p-3 rounded-xl bg-white/40 dark:bg-[#242321]/40 border border-[#DFDAD0] dark:border-[#383532]">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-[#1C1B19] dark:text-[#EDEDEB] flex items-center gap-1.5">
                    <span>Mistral AI (Codestral)</span>
                    {apiKeys.mistral && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />}
                  </label>
                  <span className="text-[10px] font-mono text-neutral-500">
                    {apiKeys.mistral ? "Configured" : "Not Set"}
                  </span>
                </div>
                <input
                  type="password"
                  name="api-key-mistral-custom-input"
                  autoComplete="new-password"
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck={false}
                  data-form-type="other"
                  data-1p-ignore="true"
                  data-lpignore="true"
                  data-bwignore="true"
                  value={apiKeys.mistral || ""}
                  onChange={(e) => setApiKeys({ ...apiKeys, mistral: e.target.value })}
                  placeholder="Mistral API key..."
                  className="w-full px-3 py-1.5 rounded-lg bg-[#ECE8DF]/60 dark:bg-[#282624]/60 border border-[#DFDAD0] dark:border-[#383532] text-xs font-mono text-[#1C1B19] dark:text-[#EDEDEB] placeholder-[#8C877D] dark:placeholder-[#6E6A63] outline-hidden focus:border-neutral-500"
                />
              </div>

              {/* Perplexity AI */}
              <div className="space-y-1.5 p-3 rounded-xl bg-white/40 dark:bg-[#242321]/40 border border-[#DFDAD0] dark:border-[#383532]">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-[#1C1B19] dark:text-[#EDEDEB] flex items-center gap-1.5">
                    <span>Perplexity AI (Sonar)</span>
                    {apiKeys.perplexity && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />}
                  </label>
                  <span className="text-[10px] font-mono text-neutral-500">
                    {apiKeys.perplexity ? "Configured" : "Not Set"}
                  </span>
                </div>
                <input
                  type="password"
                  name="api-key-perplexity-custom-input"
                  autoComplete="new-password"
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck={false}
                  data-form-type="other"
                  data-1p-ignore="true"
                  data-lpignore="true"
                  data-bwignore="true"
                  value={apiKeys.perplexity || ""}
                  onChange={(e) => setApiKeys({ ...apiKeys, perplexity: e.target.value })}
                  placeholder="pplx-..."
                  className="w-full px-3 py-1.5 rounded-lg bg-[#ECE8DF]/60 dark:bg-[#282624]/60 border border-[#DFDAD0] dark:border-[#383532] text-xs font-mono text-[#1C1B19] dark:text-[#EDEDEB] placeholder-[#8C877D] dark:placeholder-[#6E6A63] outline-hidden focus:border-neutral-500"
                />
              </div>

              {/* Cohere */}
              <div className="space-y-1.5 p-3 rounded-xl bg-white/40 dark:bg-[#242321]/40 border border-[#DFDAD0] dark:border-[#383532]">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-[#1C1B19] dark:text-[#EDEDEB] flex items-center gap-1.5">
                    <span>Cohere (Command R+)</span>
                    {apiKeys.cohere && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />}
                  </label>
                  <span className="text-[10px] font-mono text-neutral-500">
                    {apiKeys.cohere ? "Configured" : "Not Set"}
                  </span>
                </div>
                <input
                  type="password"
                  name="api-key-cohere-custom-input"
                  autoComplete="new-password"
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck={false}
                  data-form-type="other"
                  data-1p-ignore="true"
                  data-lpignore="true"
                  data-bwignore="true"
                  value={apiKeys.cohere || ""}
                  onChange={(e) => setApiKeys({ ...apiKeys, cohere: e.target.value })}
                  placeholder="Cohere API key..."
                  className="w-full px-3 py-1.5 rounded-lg bg-[#ECE8DF]/60 dark:bg-[#282624]/60 border border-[#DFDAD0] dark:border-[#383532] text-xs font-mono text-[#1C1B19] dark:text-[#EDEDEB] placeholder-[#8C877D] dark:placeholder-[#6E6A63] outline-hidden focus:border-neutral-500"
                />
              </div>
            </div>
          </div>

          {/* SECTION 2: OPEN SOURCE & ASIAN FRONTIER LABS */}
          <div className="space-y-3 pt-4 border-t border-[#E8E4DB] dark:border-[#2D2B28]">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
              <Globe className="w-3.5 h-3.5 text-neutral-500" />
              <span>Specialized Open-Weights & Asian Frontier Labs</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Alibaba Cloud (Qwen) */}
              <div className="space-y-1.5 p-3 rounded-xl bg-white/40 dark:bg-[#242321]/40 border border-[#DFDAD0] dark:border-[#383532]">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-[#1C1B19] dark:text-[#EDEDEB] flex items-center gap-1.5">
                    <span>Alibaba Cloud DashScope (Qwen)</span>
                    {apiKeys.qwen && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />}
                  </label>
                  <span className="text-[10px] font-mono text-neutral-500">
                    {apiKeys.qwen ? "Configured" : "Not Set"}
                  </span>
                </div>
                <input
                  type="password"
                  name="api-key-qwen-custom-input"
                  autoComplete="new-password"
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck={false}
                  data-form-type="other"
                  data-1p-ignore="true"
                  data-lpignore="true"
                  data-bwignore="true"
                  value={apiKeys.qwen || ""}
                  onChange={(e) => setApiKeys({ ...apiKeys, qwen: e.target.value })}
                  placeholder="sk-..."
                  className="w-full px-3 py-1.5 rounded-lg bg-[#ECE8DF]/60 dark:bg-[#282624]/60 border border-[#DFDAD0] dark:border-[#383532] text-xs font-mono text-[#1C1B19] dark:text-[#EDEDEB] placeholder-[#8C877D] dark:placeholder-[#6E6A63] outline-hidden focus:border-neutral-500"
                />
              </div>

              {/* Zhipu AI (GLM) */}
              <div className="space-y-1.5 p-3 rounded-xl bg-white/40 dark:bg-[#242321]/40 border border-[#DFDAD0] dark:border-[#383532]">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-[#1C1B19] dark:text-[#EDEDEB] flex items-center gap-1.5">
                    <span>Zhipu AI (GLM-4 & CodeGeeX)</span>
                    {apiKeys.zhipu && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />}
                  </label>
                  <span className="text-[10px] font-mono text-neutral-500">
                    {apiKeys.zhipu ? "Configured" : "Not Set"}
                  </span>
                </div>
                <input
                  type="password"
                  name="api-key-zhipu-custom-input"
                  autoComplete="new-password"
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck={false}
                  data-form-type="other"
                  data-1p-ignore="true"
                  data-lpignore="true"
                  data-bwignore="true"
                  value={apiKeys.zhipu || ""}
                  onChange={(e) => setApiKeys({ ...apiKeys, zhipu: e.target.value })}
                  placeholder="API key..."
                  className="w-full px-3 py-1.5 rounded-lg bg-[#ECE8DF]/60 dark:bg-[#282624]/60 border border-[#DFDAD0] dark:border-[#383532] text-xs font-mono text-[#1C1B19] dark:text-[#EDEDEB] placeholder-[#8C877D] dark:placeholder-[#6E6A63] outline-hidden focus:border-neutral-500"
                />
              </div>

              {/* 01.AI (Yi) */}
              <div className="space-y-1.5 p-3 rounded-xl bg-white/40 dark:bg-[#242321]/40 border border-[#DFDAD0] dark:border-[#383532]">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-[#1C1B19] dark:text-[#EDEDEB] flex items-center gap-1.5">
                    <span>01.AI (Yi Lightning)</span>
                    {apiKeys.yi && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />}
                  </label>
                  <span className="text-[10px] font-mono text-neutral-500">
                    {apiKeys.yi ? "Configured" : "Not Set"}
                  </span>
                </div>
                <input
                  type="password"
                  name="api-key-yi-custom-input"
                  autoComplete="new-password"
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck={false}
                  data-form-type="other"
                  data-1p-ignore="true"
                  data-lpignore="true"
                  data-bwignore="true"
                  value={apiKeys.yi || ""}
                  onChange={(e) => setApiKeys({ ...apiKeys, yi: e.target.value })}
                  placeholder="API key..."
                  className="w-full px-3 py-1.5 rounded-lg bg-[#ECE8DF]/60 dark:bg-[#282624]/60 border border-[#DFDAD0] dark:border-[#383532] text-xs font-mono text-[#1C1B19] dark:text-[#EDEDEB] placeholder-[#8C877D] dark:placeholder-[#6E6A63] outline-hidden focus:border-neutral-500"
                />
              </div>

              {/* SiliconFlow */}
              <div className="space-y-1.5 p-3 rounded-xl bg-white/40 dark:bg-[#242321]/40 border border-[#DFDAD0] dark:border-[#383532]">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-[#1C1B19] dark:text-[#EDEDEB] flex items-center gap-1.5">
                    <span>SiliconFlow (SiliconCloud)</span>
                    {apiKeys.siliconflow && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />}
                  </label>
                  <span className="text-[10px] font-mono text-neutral-500">
                    {apiKeys.siliconflow ? "Configured" : "Not Set"}
                  </span>
                </div>
                <input
                  type="password"
                  name="api-key-siliconflow-custom-input"
                  autoComplete="new-password"
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck={false}
                  data-form-type="other"
                  data-1p-ignore="true"
                  data-lpignore="true"
                  data-bwignore="true"
                  value={apiKeys.siliconflow || ""}
                  onChange={(e) => setApiKeys({ ...apiKeys, siliconflow: e.target.value })}
                  placeholder="sk-..."
                  className="w-full px-3 py-1.5 rounded-lg bg-[#ECE8DF]/60 dark:bg-[#282624]/60 border border-[#DFDAD0] dark:border-[#383532] text-xs font-mono text-[#1C1B19] dark:text-[#EDEDEB] placeholder-[#8C877D] dark:placeholder-[#6E6A63] outline-hidden focus:border-neutral-500"
                />
              </div>
            </div>
          </div>

          {/* SECTION 3: ULTRA-FAST HARDWARE INFERENCE */}
          <div className="space-y-3 pt-4 border-t border-[#E8E4DB] dark:border-[#2D2B28]">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
              <Zap className="w-3.5 h-3.5 text-neutral-500" />
              <span>Ultra-Fast Hardware Inference Platforms</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Groq */}
              <div className="space-y-1.5 p-3 rounded-xl bg-white/40 dark:bg-[#242321]/40 border border-[#DFDAD0] dark:border-[#383532]">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-[#1C1B19] dark:text-[#EDEDEB] flex items-center gap-1.5">
                    <span>Groq</span>
                    {apiKeys.groq && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />}
                  </label>
                  <span className="text-[10px] font-mono text-neutral-500">
                    {apiKeys.groq ? "Configured" : "Not Set"}
                  </span>
                </div>
                <input
                  type="password"
                  name="api-key-groq-custom-input"
                  autoComplete="new-password"
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck={false}
                  data-form-type="other"
                  data-1p-ignore="true"
                  data-lpignore="true"
                  data-bwignore="true"
                  value={apiKeys.groq || ""}
                  onChange={(e) => setApiKeys({ ...apiKeys, groq: e.target.value })}
                  placeholder="gsk_..."
                  className="w-full px-3 py-1.5 rounded-lg bg-[#ECE8DF]/60 dark:bg-[#282624]/60 border border-[#DFDAD0] dark:border-[#383532] text-xs font-mono text-[#1C1B19] dark:text-[#EDEDEB] placeholder-[#8C877D] dark:placeholder-[#6E6A63] outline-hidden focus:border-neutral-500"
                />
              </div>

              {/* Cerebras Systems */}
              <div className="space-y-1.5 p-3 rounded-xl bg-white/40 dark:bg-[#242321]/40 border border-[#DFDAD0] dark:border-[#383532]">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-[#1C1B19] dark:text-[#EDEDEB] flex items-center gap-1.5">
                    <span>Cerebras Systems</span>
                    {apiKeys.cerebras && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />}
                  </label>
                  <span className="text-[10px] font-mono text-neutral-500">
                    {apiKeys.cerebras ? "Configured" : "Not Set"}
                  </span>
                </div>
                <input
                  type="password"
                  name="api-key-cerebras-custom-input"
                  autoComplete="new-password"
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck={false}
                  data-form-type="other"
                  data-1p-ignore="true"
                  data-lpignore="true"
                  data-bwignore="true"
                  value={apiKeys.cerebras || ""}
                  onChange={(e) => setApiKeys({ ...apiKeys, cerebras: e.target.value })}
                  placeholder="csk-..."
                  className="w-full px-3 py-1.5 rounded-lg bg-[#ECE8DF]/60 dark:bg-[#282624]/60 border border-[#DFDAD0] dark:border-[#383532] text-xs font-mono text-[#1C1B19] dark:text-[#EDEDEB] placeholder-[#8C877D] dark:placeholder-[#6E6A63] outline-hidden focus:border-neutral-500"
                />
              </div>

              {/* SambaNova */}
              <div className="space-y-1.5 p-3 rounded-xl bg-white/40 dark:bg-[#242321]/40 border border-[#DFDAD0] dark:border-[#383532]">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-[#1C1B19] dark:text-[#EDEDEB] flex items-center gap-1.5">
                    <span>SambaNova Systems</span>
                    {apiKeys.sambanova && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />}
                  </label>
                  <span className="text-[10px] font-mono text-neutral-500">
                    {apiKeys.sambanova ? "Configured" : "Not Set"}
                  </span>
                </div>
                <input
                  type="password"
                  name="api-key-sambanova-custom-input"
                  autoComplete="new-password"
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck={false}
                  data-form-type="other"
                  data-1p-ignore="true"
                  data-lpignore="true"
                  data-bwignore="true"
                  value={apiKeys.sambanova || ""}
                  onChange={(e) => setApiKeys({ ...apiKeys, sambanova: e.target.value })}
                  placeholder="API key..."
                  className="w-full px-3 py-1.5 rounded-lg bg-[#ECE8DF]/60 dark:bg-[#282624]/60 border border-[#DFDAD0] dark:border-[#383532] text-xs font-mono text-[#1C1B19] dark:text-[#EDEDEB] placeholder-[#8C877D] dark:placeholder-[#6E6A63] outline-hidden focus:border-neutral-500"
                />
              </div>

              {/* Fireworks AI */}
              <div className="space-y-1.5 p-3 rounded-xl bg-white/40 dark:bg-[#242321]/40 border border-[#DFDAD0] dark:border-[#383532]">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-[#1C1B19] dark:text-[#EDEDEB] flex items-center gap-1.5">
                    <span>Fireworks AI</span>
                    {apiKeys.fireworks && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />}
                  </label>
                  <span className="text-[10px] font-mono text-neutral-500">
                    {apiKeys.fireworks ? "Configured" : "Not Set"}
                  </span>
                </div>
                <input
                  type="password"
                  name="api-key-fireworks-custom-input"
                  autoComplete="new-password"
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck={false}
                  data-form-type="other"
                  data-1p-ignore="true"
                  data-lpignore="true"
                  data-bwignore="true"
                  value={apiKeys.fireworks || ""}
                  onChange={(e) => setApiKeys({ ...apiKeys, fireworks: e.target.value })}
                  placeholder="fw_..."
                  className="w-full px-3 py-1.5 rounded-lg bg-[#ECE8DF]/60 dark:bg-[#282624]/60 border border-[#DFDAD0] dark:border-[#383532] text-xs font-mono text-[#1C1B19] dark:text-[#EDEDEB] placeholder-[#8C877D] dark:placeholder-[#6E6A63] outline-hidden focus:border-neutral-500"
                />
              </div>

              {/* Together AI */}
              <div className="space-y-1.5 p-3 rounded-xl bg-white/40 dark:bg-[#242321]/40 border border-[#DFDAD0] dark:border-[#383532]">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-[#1C1B19] dark:text-[#EDEDEB] flex items-center gap-1.5">
                    <span>Together AI</span>
                    {apiKeys.together && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />}
                  </label>
                  <span className="text-[10px] font-mono text-neutral-500">
                    {apiKeys.together ? "Configured" : "Not Set"}
                  </span>
                </div>
                <input
                  type="password"
                  name="api-key-together-custom-input"
                  autoComplete="new-password"
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck={false}
                  data-form-type="other"
                  data-1p-ignore="true"
                  data-lpignore="true"
                  data-bwignore="true"
                  value={apiKeys.together || ""}
                  onChange={(e) => setApiKeys({ ...apiKeys, together: e.target.value })}
                  placeholder="Together API key..."
                  className="w-full px-3 py-1.5 rounded-lg bg-[#ECE8DF]/60 dark:bg-[#282624]/60 border border-[#DFDAD0] dark:border-[#383532] text-xs font-mono text-[#1C1B19] dark:text-[#EDEDEB] placeholder-[#8C877D] dark:placeholder-[#6E6A63] outline-hidden focus:border-neutral-500"
                />
              </div>

              {/* OpenRouter */}
              <div className="space-y-1.5 p-3 rounded-xl bg-white/40 dark:bg-[#242321]/40 border border-[#DFDAD0] dark:border-[#383532]">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-[#1C1B19] dark:text-[#EDEDEB] flex items-center gap-1.5">
                    <span>OpenRouter (300+ Gateway)</span>
                    {apiKeys.openrouter && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />}
                  </label>
                  <span className="text-[10px] font-mono text-neutral-500">
                    {apiKeys.openrouter ? "Configured" : "Not Set"}
                  </span>
                </div>
                <input
                  type="password"
                  name="api-key-openrouter-custom-input"
                  autoComplete="new-password"
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck={false}
                  data-form-type="other"
                  data-1p-ignore="true"
                  data-lpignore="true"
                  data-bwignore="true"
                  value={apiKeys.openrouter || ""}
                  onChange={(e) => setApiKeys({ ...apiKeys, openrouter: e.target.value })}
                  placeholder="sk-or-v1-..."
                  className="w-full px-3 py-1.5 rounded-lg bg-[#ECE8DF]/60 dark:bg-[#282624]/60 border border-[#DFDAD0] dark:border-[#383532] text-xs font-mono text-[#1C1B19] dark:text-[#EDEDEB] placeholder-[#8C877D] dark:placeholder-[#6E6A63] outline-hidden focus:border-neutral-500"
                />
              </div>
            </div>
          </div>

          {/* SECTION 4: LOCAL & CUSTOM OPENAI-COMPATIBLE ENDPOINTS */}
          <div className="space-y-3 pt-4 border-t border-[#E8E4DB] dark:border-[#2D2B28]">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
              <HardDrive className="w-3.5 h-3.5 text-neutral-500" />
              <span>Local & Custom OpenAI-Compatible Endpoints</span>
            </div>

            <div className="space-y-3">
              {/* Ollama Local URL */}
              <div className="space-y-1.5 p-3 rounded-xl bg-white/40 dark:bg-[#242321]/40 border border-[#DFDAD0] dark:border-[#383532]">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-[#1C1B19] dark:text-[#EDEDEB] flex items-center gap-1.5">
                    <span>Local Ollama Host</span>
                    {apiKeys.ollamaUrl && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />}
                  </label>
                  <span className="text-[10px] font-mono text-neutral-500">
                    {apiKeys.ollamaUrl ? "Configured" : "Default: http://localhost:11434"}
                  </span>
                </div>
                <input
                  type="text"
                  name="api-key-ollama-host-input"
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck={false}
                  data-form-type="other"
                  data-1p-ignore="true"
                  data-lpignore="true"
                  data-bwignore="true"
                  value={apiKeys.ollamaUrl || ""}
                  onChange={(e) => setApiKeys({ ...apiKeys, ollamaUrl: e.target.value })}
                  placeholder="http://localhost:11434"
                  className="w-full px-3 py-1.5 rounded-lg bg-[#ECE8DF]/60 dark:bg-[#282624]/60 border border-[#DFDAD0] dark:border-[#383532] text-xs font-mono text-[#1C1B19] dark:text-[#EDEDEB] placeholder-[#8C877D] dark:placeholder-[#6E6A63] outline-hidden focus:border-neutral-500"
                />
              </div>

              {/* Custom Base URL & Key */}
              <div className="p-3.5 rounded-xl bg-[#ECE8DF]/40 dark:bg-[#242321]/40 border border-[#DFDAD0] dark:border-[#383532] space-y-3">
                <div className="text-xs font-medium text-neutral-900 dark:text-white">
                  Custom OpenAI-Compatible Endpoint (vLLM / LM Studio / Private Cluster)
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <input
                    type="text"
                    name="api-key-custom-base-url-input"
                    autoComplete="off"
                    autoCorrect="off"
                    autoCapitalize="off"
                    spellCheck={false}
                    data-form-type="other"
                    data-1p-ignore="true"
                    data-lpignore="true"
                    data-bwignore="true"
                    value={apiKeys.customBaseUrl || ""}
                    onChange={(e) => setApiKeys({ ...apiKeys, customBaseUrl: e.target.value })}
                    placeholder="Base URL (e.g. https://my-cluster.ai/v1)"
                    className="w-full px-3 py-1.5 rounded-lg bg-white/70 dark:bg-[#201F1D] border border-[#DFDAD0] dark:border-[#383532] text-xs font-mono text-[#1C1B19] dark:text-[#EDEDEB] outline-hidden"
                  />
                  <input
                    type="password"
                    name="api-key-custom-api-key-input"
                    autoComplete="new-password"
                    autoCorrect="off"
                    autoCapitalize="off"
                    spellCheck={false}
                    data-form-type="other"
                    data-1p-ignore="true"
                    data-lpignore="true"
                    data-bwignore="true"
                    value={apiKeys.customApiKey || ""}
                    onChange={(e) => setApiKeys({ ...apiKeys, customApiKey: e.target.value })}
                    placeholder="API Key (optional if local)"
                    className="w-full px-3 py-1.5 rounded-lg bg-white/70 dark:bg-[#201F1D] border border-[#DFDAD0] dark:border-[#383532] text-xs font-mono text-[#1C1B19] dark:text-[#EDEDEB] outline-hidden"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-[#E8E4DB] dark:border-[#2D2B28]">
            <button
              onClick={saveApiKeys}
              className="px-5 py-2.5 rounded-xl bg-[#3A3733] text-white dark:bg-white dark:text-[#1C1B19] text-xs font-semibold hover:opacity-90 transition-opacity shadow-xs"
            >
              Save API Keys & Endpoints
            </button>
          </div>
        </div>
      )}

      {/* TAB: AI SKILLS & GENERATORS */}
      {activeTab === "skills" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="space-y-1">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-[#8C877D] dark:text-[#6E6A63]">
                AI Skills & Document Generators ({skills.filter((s) => s.enabled).length} Enabled)
              </h2>
              <p className="text-xs text-[#7A756C] dark:text-[#8C8880]">
                Specialized generator engines invoked with @mention shortcuts (e.g. <span className="font-mono text-amber-600 dark:text-amber-400 font-semibold">@slides</span>, <span className="font-mono text-amber-600 dark:text-amber-400 font-semibold">@pdf-report</span>, <span className="font-mono text-amber-600 dark:text-amber-400 font-semibold">@docx</span>, <span className="font-mono text-amber-600 dark:text-amber-400 font-semibold">@create-skill</span>).
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={handleResetAllSkills}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#DFDAD0] dark:border-[#383532] bg-black/[0.02] dark:bg-white/[0.03] text-neutral-700 dark:text-neutral-300 text-xs font-medium hover:bg-black/[0.05] dark:hover:bg-white/[0.06] transition-colors cursor-pointer"
                title="Reset all skills to factory default settings"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset All to Defaults</span>
              </button>

              <button
                onClick={() => setShowAddSkillModal(true)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#1C1B19] text-white dark:bg-white dark:text-[#1C1B19] text-xs font-semibold hover:opacity-90 transition-opacity shadow-2xs cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Custom Skill</span>
              </button>
            </div>
          </div>

          {/* Search & Category Filter */}
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="relative flex-1 min-w-[220px]">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type="search"
                value={skillSearchQuery}
                onChange={(e) => setSkillSearchQuery(e.target.value)}
                placeholder="Search skills by name, @mention, or description..."
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-black/[0.03] dark:bg-white/[0.04] border border-[#DFDAD0] dark:border-[#383532] text-[#1C1B19] dark:text-[#EDEDEB] placeholder-[#8C877D] outline-hidden"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              {["All", "Presentation", "Document", "Design", "Engineering", "Analysis", "Testing"].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedSkillCategory(cat)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-medium border transition-colors ${
                    selectedSkillCategory === cat
                      ? "bg-[#3A3733] text-white dark:bg-white dark:text-[#1C1B19] border-transparent font-semibold"
                      : "border-[#DFDAD0] dark:border-[#383532] bg-white/40 dark:bg-[#242321]/40 text-[#524E48] dark:text-[#A8A49D] hover:bg-white dark:hover:bg-[#33312E]"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Skills Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filteredSkills.map((skill) => {
              const isBuiltIn = BUILT_IN_SKILLS.some((b) => b.id === skill.id);
              return (
                <div
                  key={skill.id}
                  className={`p-4 rounded-2xl border transition-all ${
                    skill.enabled
                      ? "bg-white dark:bg-[#252321] border-[#E8E4DB] dark:border-[#383531] shadow-2xs"
                      : "bg-black/[0.01] dark:bg-white/[0.01] border-dashed border-black/[0.08] dark:border-white/[0.08] opacity-60"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                        {skill.mentionKey}
                      </span>
                      <span className="text-[10px] uppercase font-semibold text-neutral-500 px-1.5 py-0.5 rounded bg-black/[0.04] dark:bg-white/[0.04]">
                        {skill.badge}
                      </span>
                      <span className="text-[10px] text-neutral-400 font-medium">
                        {skill.category}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {/* View Whole Skill Button */}
                      <button
                        onClick={() => setSelectedSkillToView(skill)}
                        className="p-1.5 rounded-lg text-neutral-500 hover:text-neutral-900 dark:hover:text-white hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition-colors cursor-pointer"
                        title="View Whole Skill & Prompt Instructions"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>

                      {/* Edit Skill Button */}
                      <button
                        onClick={() => setEditingSkill({ ...skill })}
                        className="p-1.5 rounded-lg text-neutral-500 hover:text-neutral-900 dark:hover:text-white hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition-colors cursor-pointer"
                        title="Edit Skill Details & Prompt"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>

                      {/* Delete Custom Skill Button */}
                      {skill.id.startsWith("custom-") && (
                        <button
                          onClick={() => handleDeleteSkill(skill.id)}
                          className="p-1.5 rounded-lg text-neutral-400 hover:text-red-500 hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition-colors cursor-pointer"
                          title="Delete custom skill"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {/* Enable/Disable Toggle */}
                      <button
                        onClick={() => handleToggleSkill(skill.id)}
                        className={`w-8 h-4.5 rounded-full transition-colors relative flex items-center px-0.5 cursor-pointer ml-1 ${
                          skill.enabled ? "bg-[#3A3733] dark:bg-white" : "bg-black/[0.1] dark:bg-white/[0.1]"
                        }`}
                        title={skill.enabled ? "Disable skill" : "Enable skill"}
                      >
                        <div
                          className={`w-3.5 h-3.5 rounded-full transition-transform ${
                            skill.enabled
                              ? "translate-x-3.5 bg-white dark:bg-[#1C1B19]"
                              : "translate-x-0 bg-white dark:bg-[#8C8880]"
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  <h3 className="font-semibold text-xs text-neutral-900 dark:text-white mb-1">
                    {skill.name}
                  </h3>
                  <p className="text-[11px] text-[#7A756C] dark:text-[#8C8880] leading-relaxed mb-3">
                    {skill.description}
                  </p>

                  {skill.examplePrompt && (
                    <div className="pt-2 border-t border-black/[0.04] dark:border-white/[0.04] text-[10px] font-mono text-neutral-500 truncate">
                      {skill.examplePrompt}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* VIEW WHOLE SKILL MODAL */}
          {selectedSkillToView && (
            <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="w-full max-w-2xl bg-white dark:bg-[#252321] border border-[#E8E4DB] dark:border-[#383531] rounded-2xl p-6 shadow-2xl space-y-5 animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
                <div className="flex items-start justify-between gap-4 pb-3 border-b border-black/[0.05] dark:border-white/[0.05]">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-sm font-bold px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                        {selectedSkillToView.mentionKey}
                      </span>
                      <span className="text-[11px] uppercase font-bold text-neutral-500 px-2 py-0.5 rounded bg-black/[0.05] dark:bg-white/[0.05]">
                        {selectedSkillToView.badge}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded-full border border-black/[0.08] dark:border-white/[0.08] text-neutral-600 dark:text-neutral-400 font-medium">
                        {selectedSkillToView.category}
                      </span>
                      <span className="text-[11px] font-mono text-neutral-400">
                        Format: {selectedSkillToView.outputFormat}
                      </span>
                    </div>
                    <h3 className="font-bold text-base text-neutral-900 dark:text-white pt-1">
                      {selectedSkillToView.name}
                    </h3>
                  </div>
                  
                  <button
                    onClick={() => setSelectedSkillToView(null)}
                    className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-black/[0.05] dark:hover:bg-white/[0.05] transition-colors cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-4 text-xs">
                  <div>
                    <h4 className="font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider text-[11px] mb-1.5">
                      Description
                    </h4>
                    <p className="text-neutral-600 dark:text-neutral-300 leading-relaxed bg-black/[0.02] dark:bg-white/[0.02] p-3 rounded-xl border border-black/[0.04] dark:border-white/[0.04]">
                      {selectedSkillToView.description}
                    </p>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <h4 className="font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                        <Terminal className="w-3.5 h-3.5 text-amber-500" />
                        <span>Whole System Prompt Modifier</span>
                      </h4>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(selectedSkillToView.systemPromptModifier);
                          toast.success("System Prompt Modifier copied to clipboard");
                        }}
                        className="flex items-center gap-1 text-[11px] text-amber-600 dark:text-amber-400 hover:underline cursor-pointer font-medium"
                      >
                        <Copy className="w-3 h-3" />
                        <span>Copy Modifier</span>
                      </button>
                    </div>
                    <pre className="p-3.5 rounded-xl bg-[#1C1B19] text-neutral-200 dark:bg-[#181716] font-mono text-[11px] leading-relaxed whitespace-pre-wrap max-h-56 overflow-y-auto border border-white/[0.08]">
                      {selectedSkillToView.systemPromptModifier || "(No modifier specified)"}
                    </pre>
                  </div>

                  {selectedSkillToView.examplePrompt && (
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <h4 className="font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider text-[11px]">
                          Example Prompt
                        </h4>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(selectedSkillToView.examplePrompt);
                            toast.success("Example prompt copied");
                          }}
                          className="flex items-center gap-1 text-[11px] text-neutral-500 hover:text-neutral-900 dark:hover:text-white cursor-pointer"
                        >
                          <Copy className="w-3 h-3" />
                          <span>Copy</span>
                        </button>
                      </div>
                      <div className="p-3 rounded-xl bg-black/[0.02] dark:bg-white/[0.02] border border-black/[0.04] dark:border-white/[0.04] font-mono text-[11px] text-neutral-700 dark:text-neutral-300">
                        {selectedSkillToView.examplePrompt}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between gap-3 pt-3 border-t border-black/[0.05] dark:border-white/[0.05]">
                  <div className="flex items-center gap-2">
                    {BUILT_IN_SKILLS.some((b) => b.id === selectedSkillToView.id) && (
                      <button
                        onClick={() => handleResetSingleSkill(selectedSkillToView.id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#DFDAD0] dark:border-[#383532] text-neutral-700 dark:text-neutral-300 text-xs font-medium hover:bg-black/[0.04] dark:hover:bg-white/[0.04] transition-colors cursor-pointer"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Reset to Factory Default</span>
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        const target = selectedSkillToView;
                        setSelectedSkillToView(null);
                        setEditingSkill({ ...target });
                      }}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#3A3733] text-white dark:bg-white dark:text-[#1C1B19] text-xs font-semibold hover:opacity-90 transition-opacity cursor-pointer"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                      <span>Edit Skill</span>
                    </button>
                    <button
                      onClick={() => setSelectedSkillToView(null)}
                      className="px-3.5 py-1.5 rounded-xl border border-[#DFDAD0] dark:border-[#383532] text-xs font-medium hover:bg-black/[0.04] dark:hover:bg-white/[0.04] cursor-pointer"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* EDIT SKILL MODAL */}
          {editingSkill && (
            <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="w-full max-w-lg bg-white dark:bg-[#252321] border border-[#E8E4DB] dark:border-[#383531] rounded-2xl p-6 shadow-2xl space-y-4 animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between pb-2 border-b border-black/[0.05] dark:border-white/[0.05]">
                  <div className="flex items-center gap-2">
                    <Pencil className="w-4 h-4 text-amber-500" />
                    <h3 className="font-bold text-sm text-neutral-900 dark:text-white">
                      Edit Skill: {editingSkill.name}
                    </h3>
                  </div>
                  <button onClick={() => setEditingSkill(null)} className="text-neutral-400 hover:text-neutral-900 dark:hover:text-white cursor-pointer">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-3.5 text-xs">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="font-medium block mb-1">Skill Name</label>
                      <input
                        type="text"
                        value={editingSkill.name}
                        onChange={(e) => setEditingSkill({ ...editingSkill, name: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-black/[0.02] dark:bg-white/[0.04] border border-[#DFDAD0] dark:border-[#383532] outline-hidden text-neutral-900 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="font-medium block mb-1">@mention Shortcut</label>
                      <input
                        type="text"
                        value={editingSkill.mentionKey}
                        onChange={(e) => setEditingSkill({ ...editingSkill, mentionKey: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-black/[0.02] dark:bg-white/[0.04] border border-[#DFDAD0] dark:border-[#383532] outline-hidden font-mono text-neutral-900 dark:text-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="font-medium block mb-1">Category</label>
                      <select
                        value={editingSkill.category}
                        onChange={(e) => setEditingSkill({ ...editingSkill, category: e.target.value as any })}
                        className="w-full px-3 py-2 rounded-xl bg-black/[0.02] dark:bg-white/[0.04] border border-[#DFDAD0] dark:border-[#383532] outline-hidden text-neutral-900 dark:text-white"
                      >
                        <option value="Document">Document</option>
                        <option value="Presentation">Presentation</option>
                        <option value="Design">Design</option>
                        <option value="Engineering">Engineering</option>
                        <option value="Analysis">Analysis</option>
                        <option value="Testing">Testing</option>
                      </select>
                    </div>

                    <div>
                      <label className="font-medium block mb-1">Badge Tag</label>
                      <input
                        type="text"
                        value={editingSkill.badge}
                        onChange={(e) => setEditingSkill({ ...editingSkill, badge: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-black/[0.02] dark:bg-white/[0.04] border border-[#DFDAD0] dark:border-[#383532] outline-hidden text-neutral-900 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="font-medium block mb-1">Output Format</label>
                      <select
                        value={editingSkill.outputFormat}
                        onChange={(e) => setEditingSkill({ ...editingSkill, outputFormat: e.target.value as any })}
                        className="w-full px-3 py-2 rounded-xl bg-black/[0.02] dark:bg-white/[0.04] border border-[#DFDAD0] dark:border-[#383532] outline-hidden text-neutral-900 dark:text-white"
                      >
                        <option value="markdown">Markdown</option>
                        <option value="slides">Slides (PPT/HTML)</option>
                        <option value="pdf">PDF Whitepaper</option>
                        <option value="docx">Word (.docx)</option>
                        <option value="svg">SVG / Canvas</option>
                        <option value="code">Source Code</option>
                        <option value="csv">CSV Spreadsheet</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="font-medium block mb-1">Description</label>
                    <input
                      type="text"
                      value={editingSkill.description}
                      onChange={(e) => setEditingSkill({ ...editingSkill, description: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-black/[0.02] dark:bg-white/[0.04] border border-[#DFDAD0] dark:border-[#383532] outline-hidden text-neutral-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="font-medium block mb-1">System Prompt Modifier (LLM Directive)</label>
                    <textarea
                      value={editingSkill.systemPromptModifier}
                      onChange={(e) => setEditingSkill({ ...editingSkill, systemPromptModifier: e.target.value })}
                      rows={5}
                      className="w-full px-3 py-2 rounded-xl bg-black/[0.02] dark:bg-white/[0.04] border border-[#DFDAD0] dark:border-[#383532] outline-hidden leading-relaxed font-mono text-[11px] text-neutral-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="font-medium block mb-1">Example Prompt</label>
                    <input
                      type="text"
                      value={editingSkill.examplePrompt}
                      onChange={(e) => setEditingSkill({ ...editingSkill, examplePrompt: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-black/[0.02] dark:bg-white/[0.04] border border-[#DFDAD0] dark:border-[#383532] outline-hidden text-neutral-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2 pt-3 border-t border-black/[0.05] dark:border-white/[0.05]">
                  {BUILT_IN_SKILLS.some((b) => b.id === editingSkill.id) ? (
                    <button
                      type="button"
                      onClick={() => handleResetSingleSkill(editingSkill.id)}
                      className="flex items-center gap-1 text-[11px] text-neutral-500 hover:text-amber-600 dark:hover:text-amber-400 cursor-pointer"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Reset this skill</span>
                    </button>
                  ) : <div />}

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setEditingSkill(null)}
                      className="px-3.5 py-1.5 rounded-xl border border-[#DFDAD0] dark:border-[#383532] text-xs font-medium hover:bg-black/[0.04] dark:hover:bg-white/[0.04] cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveEditSkill}
                      className="px-4 py-1.5 rounded-xl bg-[#1C1B19] text-white dark:bg-white dark:text-[#1C1B19] text-xs font-semibold hover:opacity-90 cursor-pointer shadow-xs"
                    >
                      Save Changes
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Add Custom Skill Modal */}
          {showAddSkillModal && (
            <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="w-full max-w-md bg-white dark:bg-[#252321] border border-[#E8E4DB] dark:border-[#383531] rounded-2xl p-5 shadow-2xl space-y-4 animate-in zoom-in-95">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-sm text-neutral-900 dark:text-white">Add Custom AI Skill</h3>
                  <button onClick={() => setShowAddSkillModal(false)} className="text-neutral-400 hover:text-neutral-900 dark:hover:text-white cursor-pointer">
                    ✕
                  </button>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="font-medium block mb-1">Skill Name</label>
                    <input
                      type="text"
                      value={newSkillName}
                      onChange={(e) => setNewSkillName(e.target.value)}
                      placeholder="e.g. Executive Summary Builder"
                      className="w-full px-3 py-2 rounded-xl bg-black/[0.02] dark:bg-white/[0.04] border border-[#DFDAD0] dark:border-[#383532] outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="font-medium block mb-1">@mention Shortcut</label>
                    <input
                      type="text"
                      value={newSkillMention}
                      onChange={(e) => setNewSkillMention(e.target.value)}
                      placeholder="e.g. @summary"
                      className="w-full px-3 py-2 rounded-xl bg-black/[0.02] dark:bg-white/[0.04] border border-[#DFDAD0] dark:border-[#383532] outline-hidden font-mono"
                    />
                  </div>

                  <div>
                    <label className="font-medium block mb-1">Category</label>
                    <select
                      value={newSkillCategory}
                      onChange={(e) => setNewSkillCategory(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-xl bg-black/[0.02] dark:bg-white/[0.04] border border-[#DFDAD0] dark:border-[#383532] outline-hidden"
                    >
                      <option value="Document">Document</option>
                      <option value="Presentation">Presentation</option>
                      <option value="Design">Design</option>
                      <option value="Engineering">Engineering</option>
                      <option value="Analysis">Analysis</option>
                      <option value="Testing">Testing</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-medium block mb-1">Description</label>
                    <input
                      type="text"
                      value={newSkillDescription}
                      onChange={(e) => setNewSkillDescription(e.target.value)}
                      placeholder="e.g. Formats output as an executive briefing"
                      className="w-full px-3 py-2 rounded-xl bg-black/[0.02] dark:bg-white/[0.04] border border-[#DFDAD0] dark:border-[#383532] outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="font-medium block mb-1">System Prompt Modifier</label>
                    <textarea
                      value={newSkillPromptModifier}
                      onChange={(e) => setNewSkillPromptModifier(e.target.value)}
                      placeholder="Instructions passed to the LLM when this skill is invoked..."
                      rows={3}
                      className="w-full px-3 py-2 rounded-xl bg-black/[0.02] dark:bg-white/[0.04] border border-[#DFDAD0] dark:border-[#383532] outline-hidden leading-relaxed"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-black/[0.04] dark:border-white/[0.04]">
                  <button
                    onClick={() => setShowAddSkillModal(false)}
                    className="px-3 py-1.5 rounded-xl border border-[#DFDAD0] dark:border-[#383532] text-xs font-medium hover:bg-black/[0.04] dark:hover:bg-white/[0.04] cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddCustomSkill}
                    className="px-4 py-1.5 rounded-xl bg-[#1C1B19] text-white dark:bg-white dark:text-[#1C1B19] text-xs font-semibold hover:opacity-90 cursor-pointer shadow-xs"
                  >
                    Save Skill
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB: RULES & DIRECTIVES */}
      {activeTab === "rules" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="space-y-1">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-[#8C877D] dark:text-[#6E6A63]">
                AI System Directives & Rules ({rules.filter((r) => r.enabled).length} Enabled)
              </h2>
              <p className="text-xs text-[#7A756C] dark:text-[#8C8880]">
                Universal behavioral constraints, coding standards, and algorithmic invariants automatically injected into all generations.
              </p>
            </div>

            <button
              onClick={() => setShowAddRuleModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#1C1B19] text-white dark:bg-white dark:text-[#1C1B19] text-xs font-semibold hover:opacity-90 transition-opacity shadow-2xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Custom Rule</span>
            </button>
          </div>

          {/* Search & Category Filter */}
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="relative flex-1 min-w-[220px]">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type="search"
                value={ruleSearchQuery}
                onChange={(e) => setRuleSearchQuery(e.target.value)}
                placeholder="Search rules and system directives..."
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-black/[0.03] dark:bg-white/[0.04] border border-[#DFDAD0] dark:border-[#383532] text-[#1C1B19] dark:text-[#EDEDEB] placeholder-[#8C877D] outline-hidden"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              {["All", "Coding", "Complexity", "Documentation", "Design"].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedRuleCategory(cat)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-medium border transition-colors ${
                    selectedRuleCategory === cat
                      ? "bg-[#3A3733] text-white dark:bg-white dark:text-[#1C1B19] border-transparent font-semibold"
                      : "border-[#DFDAD0] dark:border-[#383532] bg-white/40 dark:bg-[#242321]/40 text-[#524E48] dark:text-[#A8A49D] hover:bg-white dark:hover:bg-[#33312E]"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Rules List */}
          <div className="space-y-3">
            {filteredRules.map((rule) => (
              <div
                key={rule.id}
                className={`p-4 rounded-2xl border transition-all ${
                  rule.enabled
                    ? "bg-white dark:bg-[#252321] border-[#E8E4DB] dark:border-[#383531] shadow-2xs"
                    : "bg-black/[0.01] dark:bg-white/[0.01] border-dashed border-black/[0.08] dark:border-white/[0.08] opacity-60"
                }`}
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase font-semibold text-neutral-600 dark:text-neutral-300 px-2 py-0.5 rounded-full bg-black/[0.04] dark:bg-white/[0.06] border border-black/[0.04] dark:border-white/[0.04]">
                      {rule.category}
                    </span>
                    <h3 className="font-semibold text-xs text-neutral-900 dark:text-white">
                      {rule.title}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2">
                    {!rule.isBuiltIn && (
                      <button
                        onClick={() => handleDeleteRule(rule.id)}
                        className="p-1 rounded text-neutral-400 hover:text-red-500 transition-colors"
                        title="Delete rule"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      onClick={() => handleToggleRule(rule.id)}
                      className={`w-8 h-4.5 rounded-full transition-colors relative flex items-center px-0.5 cursor-pointer ${
                        rule.enabled ? "bg-[#3A3733] dark:bg-white" : "bg-black/[0.1] dark:bg-white/[0.1]"
                      }`}
                    >
                      <div
                        className={`w-3.5 h-3.5 rounded-full transition-transform ${
                          rule.enabled
                            ? "translate-x-3.5 bg-white dark:bg-[#1C1B19]"
                            : "translate-x-0 bg-white dark:bg-[#8C8880]"
                        }`}
                      />
                    </button>
                  </div>
                </div>

                <p className="text-[11px] text-[#7A756C] dark:text-[#8C8880] mb-2 leading-relaxed">
                  {rule.description}
                </p>

                <div className="p-2.5 rounded-xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.04] dark:border-white/[0.04] font-mono text-[11px] text-neutral-800 dark:text-neutral-200 leading-relaxed">
                  {rule.ruleText}
                </div>
              </div>
            ))}
          </div>

          {/* Add Custom Rule Modal */}
          {showAddRuleModal && (
            <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="w-full max-w-md bg-white dark:bg-[#252321] border border-[#E8E4DB] dark:border-[#383531] rounded-2xl p-5 shadow-2xl space-y-4 animate-in zoom-in-95">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-sm text-neutral-900 dark:text-white">Add System Rule Directive</h3>
                  <button onClick={() => setShowAddRuleModal(false)} className="text-neutral-400 hover:text-neutral-900 dark:hover:text-white">
                    ✕
                  </button>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="font-medium block mb-1">Rule Title</label>
                    <input
                      type="text"
                      value={newRuleTitle}
                      onChange={(e) => setNewRuleTitle(e.target.value)}
                      placeholder="e.g. Always Use Type Guards"
                      className="w-full px-3 py-2 rounded-xl bg-black/[0.02] dark:bg-white/[0.04] border border-[#DFDAD0] dark:border-[#383532] outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="font-medium block mb-1">Category</label>
                    <select
                      value={newRuleCategory}
                      onChange={(e) => setNewRuleCategory(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-xl bg-black/[0.02] dark:bg-white/[0.04] border border-[#DFDAD0] dark:border-[#383532] outline-hidden"
                    >
                      <option value="Coding">Coding</option>
                      <option value="Complexity">Complexity</option>
                      <option value="Documentation">Documentation</option>
                      <option value="Design">Design</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-medium block mb-1">Short Description</label>
                    <input
                      type="text"
                      value={newRuleDescription}
                      onChange={(e) => setNewRuleDescription(e.target.value)}
                      placeholder="e.g. Enforce runtime type validation in helper functions"
                      className="w-full px-3 py-2 rounded-xl bg-black/[0.02] dark:bg-white/[0.04] border border-[#DFDAD0] dark:border-[#383532] outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="font-medium block mb-1">Directive Prompt Text</label>
                    <textarea
                      value={newRuleText}
                      onChange={(e) => setNewRuleText(e.target.value)}
                      placeholder="System instruction that will be enforced for all generations..."
                      rows={3}
                      className="w-full px-3 py-2 rounded-xl bg-black/[0.02] dark:bg-white/[0.04] border border-[#DFDAD0] dark:border-[#383532] outline-hidden leading-relaxed"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-black/[0.04] dark:border-white/[0.04]">
                  <button
                    onClick={() => setShowAddRuleModal(false)}
                    className="px-3 py-1.5 rounded-xl border border-[#DFDAD0] dark:border-[#383532] text-xs font-medium hover:bg-black/[0.04] dark:hover:bg-white/[0.04]"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddCustomRule}
                    className="px-4 py-1.5 rounded-xl bg-[#1C1B19] text-white dark:bg-white dark:text-[#1C1B19] text-xs font-semibold hover:opacity-90"
                  >
                    Save Rule
                  </button>
                </div>
              </div>
            </div>
          )}
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
                name="new-memory-text-input"
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck={false}
                data-form-type="other"
                data-1p-ignore="true"
                data-lpignore="true"
                data-bwignore="true"
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

      {/* TAB 4: GENERAL */}
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
                  name="general-account-name-input"
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck={false}
                  data-form-type="other"
                  data-1p-ignore="true"
                  data-lpignore="true"
                  data-bwignore="true"
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
                  name="general-account-email-input"
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck={false}
                  data-form-type="other"
                  data-1p-ignore="true"
                  data-lpignore="true"
                  data-bwignore="true"
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
                name="general-custom-instructions-input"
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck={false}
                data-form-type="other"
                data-1p-ignore="true"
                data-lpignore="true"
                data-bwignore="true"
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

    </div>
  );
}
