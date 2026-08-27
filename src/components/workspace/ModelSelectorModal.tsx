"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Search,
  Check,
  Plus,
  Trash2,
  Sliders,
  RotateCcw,
  X,
  Cpu,
  Layers,
  Code2,
  Zap,
  Brain,
  ImageIcon,
  Sparkles,
  ExternalLink,
  Globe,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
import { ProviderLogo } from "@/components/common/ProviderLogos";
import { cleanModelName } from "@/utils/cleanModelName";
import {
  RegistryModelItem,
  CustomModelItem,
  getAllModelsForProvider,
  getEnabledModelIds,
  setEnabledModelIds,
  addUserCustomModel,
  removeUserCustomModel,
  resetProviderModelsToDefaults,
} from "@/utils/customModelRegistry";

interface ModelSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  providerKey: string;
  providerDisplayName: string;
}

export default function ModelSelectorModal({
  isOpen,
  onClose,
  providerKey,
  providerDisplayName,
}: ModelSelectorModalProps) {
  // Navigation Tabs: "active" (My Configured Models) vs "explore" (1,000,000+ Hub Live Directory)
  const [activeTab, setActiveTab] = useState<"active" | "explore">("active");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [models, setModels] = useState<RegistryModelItem[]>([]);
  const [enabledIds, setEnabledIds] = useState<string[]>([]);
  const [showAddCustom, setShowAddCustom] = useState(false);

  // Live Hub Explorer State (Hugging Face 1,000,000+ Models)
  const [hubModels, setHubModels] = useState<RegistryModelItem[]>([]);
  const [hubCategory, setHubCategory] = useState<string>("all");
  const [isLoadingHub, setIsLoadingHub] = useState(false);
  const [hubLimit, setHubLimit] = useState(40);

  // Custom Model Form State
  const [customId, setCustomId] = useState("");
  const [customName, setCustomName] = useState("");
  const [customCategory, setCustomCategory] = useState<
    "Coding" | "Reasoning" | "Frontier" | "Speed" | "Universal" | "Image"
  >("Coding");

  // Load models & enabled state on modal open
  useEffect(() => {
    if (isOpen && providerKey) {
      const all = getAllModelsForProvider(providerKey);
      setModels(all);
      setEnabledIds(getEnabledModelIds(providerKey));
      setSearchQuery("");
      setShowAddCustom(false);
      setCustomId("");
      setCustomName("");
      setActiveTab("active");
    }
  }, [isOpen, providerKey]);

  // Fetch Live Hub Models from Hugging Face API
  const fetchHubModels = useCallback(async (query: string = "", category: string = "all", limit: number = 40) => {
    if (providerKey !== "huggingface") return;
    setIsLoadingHub(true);
    try {
      const params = new URLSearchParams();
      params.append("provider", "huggingface");
      if (query.trim()) params.append("query", query.trim());
      if (category !== "all") params.append("category", category);
      params.append("limit", String(limit));

      const res = await fetch(`/api/models/hub-search?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.models)) {
          setHubModels(data.models);
        }
      }
    } catch (e) {
      console.error("Failed to fetch hub models:", e);
    } finally {
      setIsLoadingHub(false);
    }
  }, [providerKey]);

  // Auto-fetch hub models when switching to Explore tab or changing hub category/search
  useEffect(() => {
    if (isOpen && providerKey === "huggingface" && activeTab === "explore") {
      const timer = setTimeout(() => {
        fetchHubModels(searchQuery, hubCategory, hubLimit);
      }, searchQuery ? 350 : 0);
      return () => clearTimeout(timer);
    }
  }, [isOpen, providerKey, activeTab, hubCategory, searchQuery, hubLimit, fetchHubModels]);

  // Handle toggling model
  const handleToggleModel = (id: string, modelObj?: RegistryModelItem) => {
    let next: string[];
    if (enabledIds.includes(id)) {
      if (enabledIds.length === 1) {
        toast.warning("At least one model must remain enabled for this provider.");
        return;
      }
      next = enabledIds.filter((item) => item !== id);
    } else {
      next = [...enabledIds, id];
      // If adding a model from the hub that isn't in local models registry yet, register it
      if (modelObj && !models.some((m) => m.id === id)) {
        const newModel: CustomModelItem = {
          id: modelObj.id,
          name: modelObj.name,
          provider: providerDisplayName,
          category: modelObj.category,
          badge: modelObj.badge,
          contextWindow: modelObj.contextWindow,
          description: modelObj.description,
          requiredKey: providerKey,
          createdAt: new Date().toISOString(),
        };
        addUserCustomModel(providerKey, newModel);
        setModels(getAllModelsForProvider(providerKey));
      }
    }
    setEnabledIds(next);
    setEnabledModelIds(providerKey, next);
  };

  // Handle Add Custom Model
  const handleAddCustomModel = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanId = customId.trim();
    if (!cleanId) {
      toast.error("Please enter a valid Model ID.");
      return;
    }

    if (models.some((m) => m.id.toLowerCase() === cleanId.toLowerCase())) {
      toast.error("This Model ID already exists in the catalog.");
      return;
    }

    const fallbackName = cleanId.split("/").pop() || cleanId;
    const finalName = customName.trim() || fallbackName;

    const newModel: CustomModelItem = {
      id: cleanId,
      name: finalName,
      provider: providerDisplayName,
      category: customCategory,
      badge: "Custom",
      contextWindow: "Configurable",
      description: `Custom registered ${providerDisplayName} model (${cleanId}).`,
      requiredKey: providerKey,
      createdAt: new Date().toISOString(),
    };

    addUserCustomModel(providerKey, newModel);
    const updatedModels = getAllModelsForProvider(providerKey);
    setModels(updatedModels);

    const nextEnabled = Array.from(new Set([...enabledIds, cleanId]));
    setEnabledIds(nextEnabled);
    setEnabledModelIds(providerKey, nextEnabled);

    setCustomId("");
    setCustomName("");
    setShowAddCustom(false);
    toast.success(`Added ${cleanModelName(finalName)} to your active models`);
  };

  // Handle Remove Custom Model
  const handleRemoveCustomModel = (id: string, name: string) => {
    removeUserCustomModel(providerKey, id);
    const updatedModels = getAllModelsForProvider(providerKey);
    setModels(updatedModels);
    setEnabledIds(getEnabledModelIds(providerKey));
    toast.info(`Removed custom model ${cleanModelName(name)}`);
  };

  // Handle Reset to Defaults
  const handleResetDefaults = () => {
    const defaultIds = resetProviderModelsToDefaults(providerKey);
    setEnabledIds(defaultIds);
    toast.success(`Reset ${providerDisplayName} models to recommended defaults`);
  };

  // Handle Select All / Deselect All
  const handleSelectAll = () => {
    const allIds = models.map((m) => m.id);
    setEnabledIds(allIds);
    setEnabledModelIds(providerKey, allIds);
    toast.success(`Enabled all ${models.length} models for ${providerDisplayName}`);
  };

  // Filtered Models List for "Active" tab
  const filteredActiveModels = useMemo(() => {
    return models.filter((m) => {
      // Category filter
      if (selectedCategory === "Custom Added" && !m.isCustom) return false;
      if (
        selectedCategory !== "All" &&
        selectedCategory !== "Custom Added" &&
        m.category.toLowerCase() !== selectedCategory.toLowerCase()
      ) {
        return false;
      }

      // Search filter
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        m.name.toLowerCase().includes(q) ||
        m.id.toLowerCase().includes(q) ||
        m.category.toLowerCase().includes(q) ||
        m.badge.toLowerCase().includes(q) ||
        m.description.toLowerCase().includes(q)
      );
    });
  }, [models, selectedCategory, searchQuery]);

  if (!isOpen) return null;

  const categories = ["All", "Coding", "Reasoning", "Speed", "Image", "Custom Added"];
  const hubCategories = [
    { id: "all", label: "All Trending" },
    { id: "coding", label: "Code & Software" },
    { id: "reasoning", label: "Reasoning & Math" },
    { id: "vision", label: "Vision Multimodal" },
    { id: "image", label: "Diffusion & Image" },
    { id: "audio", label: "Speech & Audio" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl max-h-[90vh] bg-[#FBF9F4] dark:bg-[#1E1D1B] border border-[#DFDAD0] dark:border-[#383532] rounded-2xl shadow-2xl flex flex-col overflow-hidden text-[#1C1B19] dark:text-[#EDEDEB]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#DFDAD0] dark:border-[#383532] flex items-center justify-between bg-black/[0.02] dark:bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-black/[0.04] dark:bg-white/[0.06] border border-black/[0.06] dark:border-white/[0.08]">
              <ProviderLogo
                provider={providerDisplayName}
                modelId={providerKey}
                className="w-5 h-5 text-current"
              />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-sm sm:text-base font-semibold text-[#1C1B19] dark:text-white">
                  {providerDisplayName}
                </h2>
                <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-black/[0.04] dark:bg-white/[0.08] text-[#7A756C] dark:text-[#8C8880] border border-black/[0.06] dark:border-white/[0.08]">
                  {providerKey === "huggingface"
                    ? `${enabledIds.length} Active • 1,000,000+ Hub Catalog`
                    : `${enabledIds.length} Active in Dropdowns`}
                </span>
              </div>
              <p className="text-xs text-[#7A756C] dark:text-[#8C8880] mt-0.5">
                Select which models appear in your workspace and problem editor dropdowns.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#7A756C] dark:text-[#8C8880] hover:text-[#1C1B19] dark:hover:text-white hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Top Navigation Tabs (For Mega Hub Providers like Hugging Face) */}
        {providerKey === "huggingface" && (
          <div className="flex items-center border-b border-[#DFDAD0] dark:border-[#383532] bg-black/[0.015] dark:bg-white/[0.015] px-4 pt-2">
            <button
              onClick={() => {
                setActiveTab("active");
                setSearchQuery("");
              }}
              className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
                activeTab === "active"
                  ? "border-[#1C1B19] text-[#1C1B19] dark:border-white dark:text-white"
                  : "border-transparent text-[#7A756C] dark:text-[#8C8880] hover:text-[#1C1B19] dark:hover:text-white"
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Configured Models ({models.length})</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/[0.05] dark:bg-white/[0.08] font-mono">
                {enabledIds.length} active
              </span>
            </button>

            <button
              onClick={() => {
                setActiveTab("explore");
                setSearchQuery("");
              }}
              className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
                activeTab === "explore"
                  ? "border-[#1C1B19] text-[#1C1B19] dark:border-white dark:text-white"
                  : "border-transparent text-[#7A756C] dark:text-[#8C8880] hover:text-[#1C1B19] dark:hover:text-white"
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Explore Hugging Face Hub</span>
              <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-300 font-mono font-bold">
                1,000,000+
              </span>
            </button>
          </div>
        )}

        {/* Controls Bar: Search + Add Custom Button */}
        <div className="p-4 border-b border-[#DFDAD0] dark:border-[#383532] space-y-3 bg-[#FBF9F4] dark:bg-[#1E1D1B]">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-[#7A756C] dark:text-[#8C8880]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={
                  activeTab === "explore"
                    ? "Search 1,000,000+ public Hugging Face models (e.g. gemma, deepseek, mistral, starcoder, flux)..."
                    : "Search models by name, ID, or task..."
                }
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-white dark:bg-[#252321] border border-[#DFDAD0] dark:border-[#383532] text-[#1C1B19] dark:text-[#EDEDEB] placeholder:text-[#8C877D] dark:placeholder:text-[#6E6A63] outline-hidden focus:border-black dark:focus:border-white transition-colors font-sans"
              />
            </div>

            <button
              onClick={() => setShowAddCustom((prev) => !prev)}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs rounded-xl border font-medium transition-colors cursor-pointer shrink-0 ${
                showAddCustom
                  ? "bg-[#1C1B19] text-white dark:bg-white dark:text-[#1C1B19] border-transparent"
                  : "bg-white dark:bg-[#252321] border-[#DFDAD0] dark:border-[#383532] text-[#1C1B19] dark:text-[#EDEDEB] hover:bg-black/[0.03] dark:hover:bg-white/[0.03]"
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Custom ID</span>
            </button>
          </div>

          {/* Add Custom Model Expandable Box */}
          {showAddCustom && (
            <form
              onSubmit={handleAddCustomModel}
              className="p-3.5 rounded-xl border border-black/[0.08] dark:border-white/[0.1] bg-black/[0.02] dark:bg-white/[0.03] space-y-3 animate-in fade-in slide-in-from-top-2 duration-150"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#1C1B19] dark:text-white flex items-center gap-1.5">
                  <Plus className="w-3.5 h-3.5" />
                  <span>Register Custom Model Endpoint</span>
                </span>
                <span className="text-[11px] text-[#7A756C] dark:text-[#8C8880]">
                  Any valid {providerDisplayName} repo / model ID
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="text-[11px] font-medium text-[#7A756C] dark:text-[#8C8880] block mb-1">
                    Model ID (Required)
                  </label>
                  <input
                    type="text"
                    required
                    value={customId}
                    onChange={(e) => setCustomId(e.target.value)}
                    placeholder={
                      providerKey === "cloudflare"
                        ? "@cf/mistral/mistral-7b-instruct-v0.1"
                        : "deepseek-ai/DeepSeek-Coder-V2-Instruct"
                    }
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-white dark:bg-[#252321] border border-[#DFDAD0] dark:border-[#383532] text-[#1C1B19] dark:text-[#EDEDEB] placeholder:text-[#8C877D] dark:placeholder:text-[#6E6A63] outline-hidden font-mono"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-medium text-[#7A756C] dark:text-[#8C8880] block mb-1">
                    Display Name (Optional)
                  </label>
                  <input
                    type="text"
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    placeholder="e.g. DeepSeek Coder V2"
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-white dark:bg-[#252321] border border-[#DFDAD0] dark:border-[#383532] text-[#1C1B19] dark:text-[#EDEDEB] placeholder:text-[#8C877D] dark:placeholder:text-[#6E6A63] outline-hidden"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between gap-2 pt-1 flex-wrap">
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] text-[#7A756C] dark:text-[#8C8880]">Category:</span>
                  {(["Coding", "Reasoning", "Speed", "Frontier", "Image"] as const).map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setCustomCategory(cat)}
                      className={`text-[10px] px-2 py-0.5 rounded-md border transition-colors cursor-pointer ${
                        customCategory === cat
                          ? "bg-[#1C1B19] text-white dark:bg-white dark:text-[#1C1B19] border-transparent font-semibold"
                          : "border-[#DFDAD0] dark:border-[#383532] bg-white dark:bg-[#252321] text-[#7A756C] dark:text-[#8C8880]"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                <button
                  type="submit"
                  className="px-3 py-1.5 rounded-lg bg-[#1C1B19] text-white dark:bg-white dark:text-[#1C1B19] text-xs font-semibold hover:opacity-90 transition-opacity cursor-pointer"
                >
                  Register & Enable
                </button>
              </div>
            </form>
          )}

          {/* Category Filter Pills & Preset Actions */}
          <div className="flex items-center justify-between gap-2 flex-wrap text-xs pt-1">
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
              {activeTab === "active" ? (
                categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-2.5 py-1 rounded-lg border text-xs transition-colors cursor-pointer shrink-0 ${
                      selectedCategory === cat
                        ? "bg-[#1C1B19] text-white dark:bg-white dark:text-[#1C1B19] border-transparent font-medium"
                        : "border-[#DFDAD0] dark:border-[#383532] bg-white/60 dark:bg-[#252321]/60 text-[#7A756C] dark:text-[#8C8880] hover:bg-white dark:hover:bg-[#252321]"
                    }`}
                  >
                    {cat}
                  </button>
                ))
              ) : (
                hubCategories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setHubCategory(cat.id)}
                    className={`px-2.5 py-1 rounded-lg border text-xs transition-colors cursor-pointer shrink-0 ${
                      hubCategory === cat.id
                        ? "bg-[#1C1B19] text-white dark:bg-white dark:text-[#1C1B19] border-transparent font-medium"
                        : "border-[#DFDAD0] dark:border-[#383532] bg-white/60 dark:bg-[#252321]/60 text-[#7A756C] dark:text-[#8C8880] hover:bg-white dark:hover:bg-[#252321]"
                    }`}
                  >
                    {cat.label}
                  </button>
                ))
              )}
            </div>

            {activeTab === "active" && (
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={handleSelectAll}
                  className="text-[11px] text-[#7A756C] dark:text-[#8C8880] hover:text-[#1C1B19] dark:hover:text-white transition-colors cursor-pointer"
                >
                  Select All
                </button>
                <span className="text-[#DFDAD0] dark:text-[#383532]">•</span>
                <button
                  onClick={handleResetDefaults}
                  className="text-[11px] text-[#7A756C] dark:text-[#8C8880] hover:text-[#1C1B19] dark:hover:text-white transition-colors flex items-center gap-1 cursor-pointer"
                  title="Reset to recommended defaults"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Defaults</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Models List Scroll Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2 max-h-[50vh]">
          {activeTab === "active" ? (
            /* TAB 1: Configured Active Models */
            filteredActiveModels.length === 0 ? (
              <div className="py-12 text-center text-xs text-[#7A756C] dark:text-[#8C8880] border border-dashed border-[#DFDAD0] dark:border-[#383532] rounded-xl space-y-1">
                <Cpu className="w-6 h-6 mx-auto opacity-40" />
                <p className="font-semibold text-neutral-900 dark:text-neutral-200">
                  No matching configured models found
                </p>
                <p className="text-[11px]">Switch to Explore Hub to discover and enable from 1,000,000+ public models.</p>
              </div>
            ) : (
              filteredActiveModels.map((model) => {
                const isEnabled = enabledIds.includes(model.id);
                return (
                  <div
                    key={model.id}
                    onClick={() => handleToggleModel(model.id)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start justify-between gap-3 ${
                      isEnabled
                        ? "border-[#1C1B19]/30 dark:border-white/30 bg-white dark:bg-[#252321] shadow-2xs"
                        : "border-[#DFDAD0] dark:border-[#383532] bg-black/[0.01] dark:bg-white/[0.01] opacity-60 hover:opacity-90"
                    }`}
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="mt-0.5">
                        <div
                          className={`w-4 h-4 rounded-md border flex items-center justify-center transition-colors ${
                            isEnabled
                              ? "bg-[#1C1B19] dark:bg-white text-white dark:text-[#1C1B19] border-transparent"
                              : "border-[#DFDAD0] dark:border-[#4A4742] bg-white dark:bg-[#1E1D1B]"
                          }`}
                        >
                          {isEnabled && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                        </div>
                      </div>

                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-semibold text-[#1C1B19] dark:text-[#EDEDEB] truncate">
                            {cleanModelName(model.name)}
                          </span>
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-black/[0.04] dark:bg-white/[0.06] text-[#7A756C] dark:text-[#8C8880]">
                            {model.badge}
                          </span>
                          <span className="text-[10px] font-mono text-[#7A756C] dark:text-[#8C8880]">
                            {model.contextWindow}
                          </span>
                          {model.isCustom && (
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 font-mono">
                              Custom
                            </span>
                          )}
                        </div>

                        <p className="text-[11px] font-mono text-[#7A756C] dark:text-[#8C8880] truncate">
                          {model.id}
                        </p>

                        <p className="text-[11px] text-[#7A756C] dark:text-[#8C8880] leading-snug line-clamp-1">
                          {model.description}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      {model.isCustom && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveCustomModel(model.id, model.name);
                          }}
                          className="p-1 rounded-md text-red-500/70 hover:text-red-600 hover:bg-red-500/10 transition-colors"
                          title="Delete custom model"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )
          ) : (
            /* TAB 2: Live Hugging Face Hub Explorer (1,000,000+ Models) */
            <div className="space-y-2">
              {isLoadingHub && hubModels.length === 0 ? (
                <div className="py-14 text-center text-xs text-[#7A756C] dark:text-[#8C8880] space-y-2">
                  <Loader2 className="w-5 h-5 mx-auto animate-spin text-neutral-500" />
                  <p className="font-mono">Connecting to Hugging Face Hub (1,000,000+ models)...</p>
                </div>
              ) : hubModels.length === 0 ? (
                <div className="py-12 text-center text-xs text-[#7A756C] dark:text-[#8C8880] border border-dashed border-[#DFDAD0] dark:border-[#383532] rounded-xl space-y-1">
                  <Globe className="w-6 h-6 mx-auto opacity-40" />
                  <p className="font-semibold text-neutral-900 dark:text-neutral-200">
                    No models found on Hugging Face Hub
                  </p>
                  <p className="text-[11px]">Try adjusting your search keywords or register a custom ID.</p>
                </div>
              ) : (
                <>
                  {hubModels.map((hubModel) => {
                    const isEnabled = enabledIds.includes(hubModel.id);
                    return (
                      <div
                        key={hubModel.id}
                        onClick={() => handleToggleModel(hubModel.id, hubModel)}
                        className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                          isEnabled
                            ? "border-[#1C1B19]/30 dark:border-white/30 bg-white dark:bg-[#252321] shadow-2xs"
                            : "border-[#DFDAD0] dark:border-[#383532] bg-black/[0.01] dark:bg-white/[0.01] hover:bg-white/60 dark:hover:bg-[#252321]/60"
                        }`}
                      >
                        <div className="flex items-start gap-3 min-w-0">
                          <div className="mt-0.5">
                            <div
                              className={`w-4 h-4 rounded-md border flex items-center justify-center transition-colors ${
                                isEnabled
                                  ? "bg-[#1C1B19] dark:bg-white text-white dark:text-[#1C1B19] border-transparent"
                                  : "border-[#DFDAD0] dark:border-[#4A4742] bg-white dark:bg-[#1E1D1B]"
                              }`}
                            >
                              {isEnabled && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                            </div>
                          </div>

                          <div className="space-y-0.5 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-xs font-semibold text-[#1C1B19] dark:text-[#EDEDEB] truncate">
                                {cleanModelName(hubModel.name)}
                              </span>
                              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-700 dark:text-amber-300">
                                {hubModel.badge}
                              </span>
                              <span className="text-[10px] font-mono text-[#7A756C] dark:text-[#8C8880]">
                                {hubModel.category}
                              </span>
                            </div>

                            <p className="text-[11px] font-mono text-[#7A756C] dark:text-[#8C8880] truncate">
                              {hubModel.id}
                            </p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleModel(hubModel.id, hubModel);
                          }}
                          className={`px-3 py-1 rounded-lg text-xs font-medium transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
                            isEnabled
                              ? "bg-black/[0.06] dark:bg-white/[0.08] text-[#1C1B19] dark:text-white"
                              : "bg-[#1C1B19] text-white dark:bg-white dark:text-[#1C1B19] hover:opacity-90"
                          }`}
                        >
                          {isEnabled ? (
                            <>
                              <Check className="w-3 h-3" />
                              <span>Enabled</span>
                            </>
                          ) : (
                            <>
                              <Plus className="w-3 h-3" />
                              <span>Enable</span>
                            </>
                          )}
                        </button>
                      </div>
                    );
                  })}

                  {/* Load More Button for Infinite Exploration */}
                  <div className="pt-3 pb-1 text-center">
                    <button
                      type="button"
                      disabled={isLoadingHub}
                      onClick={() => setHubLimit((prev) => prev + 40)}
                      className="px-4 py-2 rounded-xl bg-black/[0.04] dark:bg-white/[0.06] hover:bg-black/[0.08] dark:hover:bg-white/[0.1] border border-black/[0.06] dark:border-white/[0.08] text-xs font-semibold text-[#1C1B19] dark:text-white transition-colors cursor-pointer inline-flex items-center gap-2"
                    >
                      {isLoadingHub ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Loading Hub Models...</span>
                        </>
                      ) : (
                        <>
                          <Globe className="w-3.5 h-3.5" />
                          <span>Load 40 More Models from Hub</span>
                        </>
                      )}
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3.5 border-t border-[#DFDAD0] dark:border-[#383532] bg-black/[0.02] dark:bg-white/[0.02] flex items-center justify-between">
          <span className="text-xs text-[#7A756C] dark:text-[#8C8880]">
            <strong>{enabledIds.length}</strong> model{enabledIds.length === 1 ? "" : "s"} active in workspace & problem dropdowns
          </span>

          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-[#1C1B19] text-white dark:bg-white dark:text-[#1C1B19] text-xs font-semibold hover:opacity-90 transition-opacity cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
