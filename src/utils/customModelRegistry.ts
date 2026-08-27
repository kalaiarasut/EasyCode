import { cleanModelName } from "./cleanModelName";

export interface RegistryModelItem {
  id: string;
  name: string;
  provider: string;
  category: "Coding" | "Reasoning" | "Frontier" | "Speed" | "Universal" | "Image" | "Video" | "Open Source" | "Search" | "Local";
  badge: string;
  contextWindow: string;
  description: string;
  requiredKey: string;
  defaultEnabled?: boolean;
  isCustom?: boolean;
}

export interface CustomModelItem {
  id: string;
  name: string;
  provider: string;
  category: "Coding" | "Reasoning" | "Frontier" | "Speed" | "Universal" | "Image" | "Video" | "Open Source" | "Search" | "Local";
  badge: string;
  contextWindow: string;
  description: string;
  requiredKey: string;
  createdAt: string;
}

// 1. Expanded Catalog for Hugging Face (Serverless & ZeroGPU Endpoints)
export const HUGGINGFACE_CATALOG: RegistryModelItem[] = [
  {
    id: "Qwen/Qwen2.5-Coder-32B-Instruct",
    name: "Qwen 2.5 Coder 32B",
    provider: "Hugging Face",
    category: "Coding",
    badge: "Top Coder",
    contextWindow: "32k tokens",
    description: "SOTA open-weights competitive coding and algorithmic powerhouse with 32k context.",
    requiredKey: "huggingface",
    defaultEnabled: true,
  },
  {
    id: "meta-llama/Llama-3.3-70B-Instruct",
    name: "Llama 3.3 70B",
    provider: "Hugging Face",
    category: "Frontier",
    badge: "Open SOTA",
    contextWindow: "128k tokens",
    description: "Meta's flagship 70B instruction-tuned model matching industry frontier benchmarks.",
    requiredKey: "huggingface",
    defaultEnabled: true,
  },
  {
    id: "deepseek-ai/DeepSeek-R1",
    name: "DeepSeek R1",
    provider: "Hugging Face",
    category: "Reasoning",
    badge: "Reasoning SOTA",
    contextWindow: "64k tokens",
    description: "DeepSeek R1 full reasoning model on Hugging Face Serverless endpoints.",
    requiredKey: "huggingface",
    defaultEnabled: true,
  },
  {
    id: "deepseek-ai/DeepSeek-V3",
    name: "DeepSeek V3",
    provider: "Hugging Face",
    category: "Frontier",
    badge: "671B MoE",
    contextWindow: "64k tokens",
    description: "671B parameter Mixture-of-Experts architecture with 37B activated parameters.",
    requiredKey: "huggingface",
    defaultEnabled: true,
  },
  {
    id: "mistralai/Mistral-Small-24B-Instruct-2501",
    name: "Mistral Small 24B",
    provider: "Hugging Face",
    category: "Coding",
    badge: "Code & Math",
    contextWindow: "32k tokens",
    description: "High-speed, reasoning-optimized 24B model with low latency and strong code synthesis.",
    requiredKey: "huggingface",
    defaultEnabled: true,
  },
  {
    id: "Qwen/Qwen2.5-Coder-7B-Instruct",
    name: "Qwen 2.5 Coder 7B",
    provider: "Hugging Face",
    category: "Coding",
    badge: "Fast Coder",
    contextWindow: "32k tokens",
    description: "Ultra-fast 7B code specialist excelling in Python, C++, Java, and algorithms.",
    requiredKey: "huggingface",
    defaultEnabled: false,
  },
  {
    id: "Qwen/Qwen2.5-72B-Instruct",
    name: "Qwen 2.5 72B Instruct",
    provider: "Hugging Face",
    category: "Frontier",
    badge: "Flagship 72B",
    contextWindow: "128k tokens",
    description: "Alibaba's 72B flagship model with exceptional multilingual and reasoning proficiency.",
    requiredKey: "huggingface",
    defaultEnabled: false,
  },
  {
    id: "deepseek-ai/DeepSeek-Coder-V2-Instruct",
    name: "DeepSeek Coder V2",
    provider: "Hugging Face",
    category: "Coding",
    badge: "338+ Langs",
    contextWindow: "128k tokens",
    description: "236B parameter MoE architecture specialized for large repository and algorithmic design.",
    requiredKey: "huggingface",
    defaultEnabled: false,
  },
  {
    id: "meta-llama/Llama-3.2-3B-Instruct",
    name: "Llama 3.2 3B",
    provider: "Hugging Face",
    category: "Speed",
    badge: "Instant",
    contextWindow: "128k tokens",
    description: "Ultra-fast lightweight edge reasoning model for quick suggestions and tests.",
    requiredKey: "huggingface",
    defaultEnabled: false,
  },
  {
    id: "meta-llama/Llama-3.2-1B-Instruct",
    name: "Llama 3.2 1B",
    provider: "Hugging Face",
    category: "Speed",
    badge: "Sub-Second",
    contextWindow: "128k tokens",
    description: "Sub-second micro model ideal for fast token completion and quick linting.",
    requiredKey: "huggingface",
    defaultEnabled: false,
  },
  {
    id: "meta-llama/Llama-3.2-11B-Vision-Instruct",
    name: "Llama 3.2 11B Vision",
    provider: "Hugging Face",
    category: "Frontier",
    badge: "Vision LLM",
    contextWindow: "128k tokens",
    description: "Multimodal image and visual chart reasoning model from Meta.",
    requiredKey: "huggingface",
    defaultEnabled: false,
  },
  {
    id: "google/gemma-2-9b-it",
    name: "Gemma 2 9B",
    provider: "Hugging Face",
    category: "Reasoning",
    badge: "Google Open",
    contextWindow: "8k tokens",
    description: "Google DeepMind's high-efficiency open model built from Gemini technology.",
    requiredKey: "huggingface",
    defaultEnabled: false,
  },
  {
    id: "google/gemma-2-27b-it",
    name: "Gemma 2 27B",
    provider: "Hugging Face",
    category: "Frontier",
    badge: "Gemini Class",
    contextWindow: "8k tokens",
    description: "Powerful 27B parameter open model delivering competitive frontier performance.",
    requiredKey: "huggingface",
    defaultEnabled: false,
  },
  {
    id: "mistralai/Mistral-Nemo-Instruct-2407",
    name: "Mistral Nemo 12B",
    provider: "Hugging Face",
    category: "Speed",
    badge: "128k Window",
    contextWindow: "128k tokens",
    description: "Built with NVIDIA, a 12B state-of-the-art model with a 128k token context window.",
    requiredKey: "huggingface",
    defaultEnabled: false,
  },
  {
    id: "THUDM/glm-4-9b-chat",
    name: "GLM-4 9B Chat",
    provider: "Hugging Face",
    category: "Reasoning",
    badge: "Bilingual CoT",
    contextWindow: "128k tokens",
    description: "High-capability bilingual reasoning and structured JSON output model.",
    requiredKey: "huggingface",
    defaultEnabled: false,
  },
  {
    id: "microsoft/Phi-3.5-mini-instruct",
    name: "Phi 3.5 Mini",
    provider: "Hugging Face",
    category: "Speed",
    badge: "3.8B Compact",
    contextWindow: "128k tokens",
    description: "Microsoft's lightweight 3.8B model with 128k context and high STEM benchmark scores.",
    requiredKey: "huggingface",
    defaultEnabled: false,
  },
  {
    id: "CohereForAI/c4ai-command-r-plus-08-2024",
    name: "Command R+ (08-2024)",
    provider: "Hugging Face",
    category: "Frontier",
    badge: "Enterprise RAG",
    contextWindow: "128k tokens",
    description: "Cohere's premier 104B multilingual model optimized for reasoning, tools, and code.",
    requiredKey: "huggingface",
    defaultEnabled: false,
  },
  {
    id: "bigcode/starcoder2-15b",
    name: "StarCoder 2 15B",
    provider: "Hugging Face",
    category: "Coding",
    badge: "BigCode 600+",
    contextWindow: "16k tokens",
    description: "Transparent open coding model trained on 600+ programming languages.",
    requiredKey: "huggingface",
    defaultEnabled: false,
  },
  {
    id: "black-forest-labs/FLUX.1-schnell",
    name: "FLUX.1 Schnell",
    provider: "Hugging Face",
    category: "Image",
    badge: "Visual SOTA",
    contextWindow: "Image Gen",
    description: "Ultra-fast state-of-the-art 12B rectified flow transformer for visual generation.",
    requiredKey: "huggingface",
    defaultEnabled: false,
  },
  {
    id: "black-forest-labs/FLUX.1-dev",
    name: "FLUX.1 Dev",
    provider: "Hugging Face",
    category: "Image",
    badge: "12B Precision",
    contextWindow: "Image Gen",
    description: "12B parameter non-commercial open weights image generation model hosted on ZeroGPU.",
    requiredKey: "huggingface",
    defaultEnabled: false,
  },
  {
    id: "stabilityai/stable-diffusion-3.5-large",
    name: "Stable Diffusion 3.5 Large",
    provider: "Hugging Face",
    category: "Image",
    badge: "8B MMDiT",
    contextWindow: "Image Gen",
    description: "Stability AI's 8B parameter Multimodal Diffusion Transformer with high prompt fidelity.",
    requiredKey: "huggingface",
    defaultEnabled: false,
  },
  {
    id: "openai/whisper-large-v3",
    name: "Whisper Large v3",
    provider: "Hugging Face",
    category: "Speed",
    badge: "Audio STT",
    contextWindow: "Speech-to-Text",
    description: "State-of-the-art speech recognition and multilingual audio transcription on Hugging Face.",
    requiredKey: "huggingface",
    defaultEnabled: false,
  },
];

// 2. Expanded Catalog for Cloudflare Workers AI Gateway
export const CLOUDFLARE_CATALOG: RegistryModelItem[] = [
  {
    id: "@cf/meta/llama-3.3-70b-instruct",
    name: "Llama 3.3 70B",
    provider: "Cloudflare",
    category: "Speed",
    badge: "Edge SOTA",
    contextWindow: "128k tokens",
    description: "Cloudflare's serverless edge inference running Meta's premier open 70B model.",
    requiredKey: "cloudflare",
    defaultEnabled: true,
  },
  {
    id: "@cf/deepseek-ai/deepseek-r1-distill-qwen-32b",
    name: "DeepSeek R1 Distill 32B",
    provider: "Cloudflare",
    category: "Reasoning",
    badge: "Reasoning",
    contextWindow: "32k tokens",
    description: "High-speed edge reasoning model running on Cloudflare global edge network.",
    requiredKey: "cloudflare",
    defaultEnabled: true,
  },
  {
    id: "@cf/qwen/qwen2.5-coder-32b-instruct",
    name: "Qwen 2.5 Coder 32B",
    provider: "Cloudflare",
    category: "Coding",
    badge: "Coding",
    contextWindow: "32k tokens",
    description: "Specialized competitive programming and algorithmic coding model on Cloudflare.",
    requiredKey: "cloudflare",
    defaultEnabled: true,
  },
  {
    id: "@cf/meta/llama-3.1-8b-instruct",
    name: "Llama 3.1 8B",
    provider: "Cloudflare",
    category: "Speed",
    badge: "Instant",
    contextWindow: "8k tokens",
    description: "Ultra-low latency serverless edge model with sub-100ms first token time.",
    requiredKey: "cloudflare",
    defaultEnabled: true,
  },
  {
    id: "@cf/meta/llama-3.1-70b-instruct",
    name: "Llama 3.1 70B",
    provider: "Cloudflare",
    category: "Frontier",
    badge: "70B Frontier",
    contextWindow: "8k tokens",
    description: "Meta's flagship 70B instruction model on Cloudflare Workers AI edge GPUs.",
    requiredKey: "cloudflare",
    defaultEnabled: false,
  },
  {
    id: "@cf/meta/llama-3.2-3b-instruct",
    name: "Llama 3.2 3B",
    provider: "Cloudflare",
    category: "Speed",
    badge: "Edge Fast",
    contextWindow: "8k tokens",
    description: "Lightweight 3B parameter edge model running with sub-100ms latency.",
    requiredKey: "cloudflare",
    defaultEnabled: false,
  },
  {
    id: "@cf/meta/llama-3.2-1b-instruct",
    name: "Llama 3.2 1B",
    provider: "Cloudflare",
    category: "Speed",
    badge: "Micro Edge",
    contextWindow: "8k tokens",
    description: "Ultra-compact 1B parameter model with instant execution on global edge locations.",
    requiredKey: "cloudflare",
    defaultEnabled: false,
  },
  {
    id: "@cf/mistral/mistral-7b-instruct-v0.2",
    name: "Mistral 7B Instruct v0.2",
    provider: "Cloudflare",
    category: "Speed",
    badge: "32k Context",
    contextWindow: "32k tokens",
    description: "Updated Mistral 7B with 32k context window on Cloudflare edge.",
    requiredKey: "cloudflare",
    defaultEnabled: false,
  },
  {
    id: "@cf/mistral/mistral-7b-instruct-v0.1",
    name: "Mistral 7B Instruct",
    provider: "Cloudflare",
    category: "Speed",
    badge: "Reliable",
    contextWindow: "8k tokens",
    description: "Fast, reliable 7B instruction model on Cloudflare Workers AI.",
    requiredKey: "cloudflare",
    defaultEnabled: false,
  },
  {
    id: "@cf/google/gemma-7b-it",
    name: "Gemma 7B",
    provider: "Cloudflare",
    category: "Reasoning",
    badge: "Google Open",
    contextWindow: "8k tokens",
    description: "Google's lightweight, state-of-the-art open model from DeepMind research.",
    requiredKey: "cloudflare",
    defaultEnabled: false,
  },
  {
    id: "@cf/google/gemma-2b-it",
    name: "Gemma 2B",
    provider: "Cloudflare",
    category: "Speed",
    badge: "Fast Edge",
    contextWindow: "8k tokens",
    description: "Compact 2B parameter model for instant responses on mobile and edge devices.",
    requiredKey: "cloudflare",
    defaultEnabled: false,
  },
  {
    id: "@cf/qwen/qwen1.5-14b-chat-awq",
    name: "Qwen 1.5 14B Chat",
    provider: "Cloudflare",
    category: "Reasoning",
    badge: "14B Quantized",
    contextWindow: "8k tokens",
    description: "Alibaba's 14B multilingual chat model with high algorithmic precision.",
    requiredKey: "cloudflare",
    defaultEnabled: false,
  },
  {
    id: "@cf/qwen/qwen1.5-7b-chat-awq",
    name: "Qwen 1.5 7B Chat",
    provider: "Cloudflare",
    category: "Speed",
    badge: "7B Edge",
    contextWindow: "8k tokens",
    description: "High-speed 7B chat model with strong logic and math reasoning.",
    requiredKey: "cloudflare",
    defaultEnabled: false,
  },
  {
    id: "@cf/thebloke/codellama-7b-instruct-awq",
    name: "CodeLlama 7B",
    provider: "Cloudflare",
    category: "Coding",
    badge: "CodeLlama",
    contextWindow: "8k tokens",
    description: "Meta's code generation model fine-tuned on code datasets and syntax.",
    requiredKey: "cloudflare",
    defaultEnabled: false,
  },
  {
    id: "@cf/defog/sqlcoder-7b-2",
    name: "SQLCoder 7B",
    provider: "Cloudflare",
    category: "Coding",
    badge: "SQL Expert",
    contextWindow: "8k tokens",
    description: "Defog's SOTA text-to-SQL generation model surpassing GPT-3.5 on sql benchmarks.",
    requiredKey: "cloudflare",
    defaultEnabled: false,
  },
  {
    id: "@cf/tiiuae/falcon-7b-instruct",
    name: "Falcon 7B",
    provider: "Cloudflare",
    category: "Speed",
    badge: "Falcon",
    contextWindow: "2k tokens",
    description: "TII's 7B parameter causal decoder model trained on 1,500B tokens of RefinedWeb.",
    requiredKey: "cloudflare",
    defaultEnabled: false,
  },
  {
    id: "@cf/microsoft/phi-2",
    name: "Phi 2",
    provider: "Cloudflare",
    category: "Speed",
    badge: "2.7B Microsoft",
    contextWindow: "2k tokens",
    description: "Microsoft Research's 2.7B Small Language Model with high reasoning efficiency.",
    requiredKey: "cloudflare",
    defaultEnabled: false,
  },
  {
    id: "@cf/black-forest-labs/flux-1-schnell",
    name: "FLUX.1 Schnell",
    provider: "Cloudflare",
    category: "Image",
    badge: "Edge Visual",
    contextWindow: "Image Gen",
    description: "Direct serverless image synthesis at the edge via Cloudflare Workers AI GPU cluster.",
    requiredKey: "cloudflare",
    defaultEnabled: false,
  },
  {
    id: "@cf/stabilityai/stable-diffusion-xl-base-1.0",
    name: "Stable Diffusion XL",
    provider: "Cloudflare",
    category: "Image",
    badge: "SDXL Edge",
    contextWindow: "Image Gen",
    description: "Flagship 1024x1024 text-to-image synthesis running on Cloudflare Workers AI.",
    requiredKey: "cloudflare",
    defaultEnabled: false,
  },
  {
    id: "@cf/runwayml/stable-diffusion-v1-5",
    name: "Stable Diffusion v1.5",
    provider: "Cloudflare",
    category: "Image",
    badge: "Fast Diffusion",
    contextWindow: "Image Gen",
    description: "Classic lightweight image generation model on Cloudflare edge GPUs.",
    requiredKey: "cloudflare",
    defaultEnabled: false,
  },
  {
    id: "@cf/openai/whisper",
    name: "Cloudflare Whisper",
    provider: "Cloudflare",
    category: "Speed",
    badge: "Edge STT",
    contextWindow: "Speech-to-Text",
    description: "OpenAI Whisper automatic speech recognition hosted on Cloudflare Workers AI.",
    requiredKey: "cloudflare",
    defaultEnabled: false,
  },
];

// Map of Catalogs by Provider Key
export const CATALOG_BY_PROVIDER: Record<string, RegistryModelItem[]> = {
  huggingface: HUGGINGFACE_CATALOG,
  cloudflare: CLOUDFLARE_CATALOG,
};

// ----------------------------------------------------
// Local Storage & State Management Functions
// ----------------------------------------------------

const ENABLED_MODELS_KEY_PREFIX = "easycode_enabled_models_";
const CUSTOM_MODELS_KEY_PREFIX = "easycode_custom_models_";

export function getEnabledModelIds(providerKey: string): string[] {
  if (typeof window === "undefined") {
    const catalog = CATALOG_BY_PROVIDER[providerKey] || [];
    return catalog.filter((m) => m.defaultEnabled).map((m) => m.id);
  }
  try {
    const raw = localStorage.getItem(`${ENABLED_MODELS_KEY_PREFIX}${providerKey}`);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {}

  // Return default enabled models
  const catalog = CATALOG_BY_PROVIDER[providerKey] || [];
  return catalog.filter((m) => m.defaultEnabled).map((m) => m.id);
}

export function setEnabledModelIds(providerKey: string, ids: string[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(`${ENABLED_MODELS_KEY_PREFIX}${providerKey}`, JSON.stringify(ids));
    window.dispatchEvent(new Event("easycode_models_updated"));
  } catch (e) {}
}

export function getUserCustomModels(providerKey: string): CustomModelItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(`${CUSTOM_MODELS_KEY_PREFIX}${providerKey}`);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {}
  return [];
}

export function addUserCustomModel(providerKey: string, model: CustomModelItem): void {
  if (typeof window === "undefined") return;
  try {
    const existing = getUserCustomModels(providerKey);
    const updated = [model, ...existing.filter((m) => m.id !== model.id)];
    localStorage.setItem(`${CUSTOM_MODELS_KEY_PREFIX}${providerKey}`, JSON.stringify(updated));

    // Also auto-enable the new custom model
    const enabledIds = getEnabledModelIds(providerKey);
    if (!enabledIds.includes(model.id)) {
      setEnabledModelIds(providerKey, [...enabledIds, model.id]);
    } else {
      window.dispatchEvent(new Event("easycode_models_updated"));
    }
  } catch (e) {}
}

export function removeUserCustomModel(providerKey: string, modelId: string): void {
  if (typeof window === "undefined") return;
  try {
    const existing = getUserCustomModels(providerKey);
    const updated = existing.filter((m) => m.id !== modelId);
    localStorage.setItem(`${CUSTOM_MODELS_KEY_PREFIX}${providerKey}`, JSON.stringify(updated));

    // Remove from enabled list if present
    const enabledIds = getEnabledModelIds(providerKey);
    setEnabledModelIds(
      providerKey,
      enabledIds.filter((id) => id !== modelId)
    );
  } catch (e) {}
}

export function getAllModelsForProvider(providerKey: string): RegistryModelItem[] {
  const catalog = CATALOG_BY_PROVIDER[providerKey] || [];
  const customModels = getUserCustomModels(providerKey);

  const customRegistryItems: RegistryModelItem[] = customModels.map((cm) => ({
    id: cm.id,
    name: cm.name,
    provider: cm.provider,
    category: cm.category,
    badge: cm.badge,
    contextWindow: cm.contextWindow,
    description: cm.description,
    requiredKey: cm.requiredKey,
    isCustom: true,
  }));

  return [...catalog, ...customRegistryItems];
}

export function resetProviderModelsToDefaults(providerKey: string): string[] {
  const catalog = CATALOG_BY_PROVIDER[providerKey] || [];
  const defaultIds = catalog.filter((m) => m.defaultEnabled).map((m) => m.id);
  setEnabledModelIds(providerKey, defaultIds);
  return defaultIds;
}
