/**
 * Universal AI Media Generation Engine (Image & Video)
 * Supports multiple providers with seamless 100% free fallback (No CC required):
 * 1. Pollinations.ai (FLUX.1 Schnell, Flux Realism, SDXL Turbo, Motion Video) [Default Free]
 * 2. Hugging Face Inference API (Serverless ZeroGPU: FLUX, SDXL, Wan2.1 Video)
 * 3. OpenAI (DALL-E 3, DALL-E 2, Sora)
 * 4. Cloudflare Workers AI (@cf/black-forest-labs/flux-1-schnell)
 * 5. Stability AI (SD3 Large, SDXL)
 * 6. Fal.ai & Replicate
 */

export interface VisualEngineItem {
  id: string;
  name: string;
  provider: string;
  type: "image" | "video" | "multimodal";
  badge: string;
  description: string;
  requiredKey: string;
}

export const ALL_VISUAL_ENGINES: VisualEngineItem[] = [
  // 1. Pollinations.ai (100% Free Default)
  {
    id: "pollinations-flux",
    name: "FLUX.1 Schnell",
    provider: "Pollinations.ai",
    type: "image",
    badge: "Image",
    description: "Ultra-fast state-of-the-art image synthesis with instant zero-cost generation.",
    requiredKey: "pollinations",
  },
  {
    id: "pollinations-video",
    name: "Motion Video Stream",
    provider: "Pollinations.ai",
    type: "video",
    badge: "Video",
    description: "Animated motion video synthesis pipeline with continuous diffusion frames.",
    requiredKey: "pollinations",
  },
  {
    id: "pollinations-realism",
    name: "FLUX Realism Photo",
    provider: "Pollinations.ai",
    type: "image",
    badge: "Photoreal",
    description: "Fine-tuned photorealism model for portraits, landscapes, and architectural renders.",
    requiredKey: "pollinations",
  },

  // 2. Cloudflare Workers AI
  {
    id: "cf-flux-schnell",
    name: "FLUX.1 Schnell",
    provider: "Cloudflare",
    type: "image",
    badge: "Image",
    description: "Serverless edge FLUX generation hosted on Cloudflare Workers AI global GPU network.",
    requiredKey: "cloudflare",
  },

  // 3. Hugging Face
  {
    id: "hf-flux-dev",
    name: "FLUX.1 Dev",
    provider: "Hugging Face",
    type: "image",
    badge: "Image",
    description: "High-precision 12B parameter FLUX model hosted on Hugging Face Spaces.",
    requiredKey: "huggingface",
  },
  {
    id: "hf-wan2.1-video",
    name: "Wan2.1 Video Diffusion",
    provider: "Hugging Face",
    type: "video",
    badge: "Video",
    description: "State-of-the-art open-source video generation model.",
    requiredKey: "huggingface",
  },

  // 4. Stability AI
  {
    id: "stability-sd3.5-large",
    name: "Stable Diffusion 3.5 Large",
    provider: "Stability AI",
    type: "image",
    badge: "Image",
    description: "Stability AI's flagship 8B parameter diffusion model with typography fidelity.",
    requiredKey: "stability",
  },

  // 5. Replicate Video & Image
  {
    id: "replicate-flux-pro",
    name: "FLUX 1.1 Pro",
    provider: "Replicate",
    type: "image",
    badge: "Image",
    description: "Commercial ultra-high-resolution image rendering pipeline.",
    requiredKey: "replicate",
  },
  {
    id: "replicate-wan-video",
    name: "Wan2.1 14B Cinema",
    provider: "Replicate",
    type: "video",
    badge: "Video",
    description: "Cinema-grade 1080p video diffusion with fluid motion dynamics.",
    requiredKey: "replicate",
  },

  // 6. Fal.ai Fast Video
  {
    id: "fal-flux-fast",
    name: "FLUX.1 Realism & Fast Video",
    provider: "Fal.ai",
    type: "multimodal",
    badge: "Video",
    description: "Sub-second inference for image and video synthesis.",
    requiredKey: "fal",
  },

  // 7. Luma Dream Machine
  {
    id: "luma-ray-2",
    name: "Luma Ray 2",
    provider: "Luma AI",
    type: "video",
    badge: "Video",
    description: "Realistic physics and cinematic camera trajectory video generation.",
    requiredKey: "luma",
  },

  // 8. Kling AI
  {
    id: "kling-v1.5-pro",
    name: "Kling AI Video Studio",
    provider: "Kling AI",
    type: "video",
    badge: "Video",
    description: "High-motion dynamic video diffusion model.",
    requiredKey: "kling",
  },
];

export interface MediaGenerationOptions {
  width?: number;
  height?: number;
  seed?: number;
  model?: string;
  provider?: "pollinations" | "huggingface" | "openai" | "cloudflare" | "stability" | "replicate" | "fal";
  aspectRatio?: "1:1" | "16:9" | "9:16" | "4:3" | "3:2";
  negativePrompt?: string;
  customKeys?: Record<string, string>;
}

export interface GeneratedMediaResult {
  type: "image" | "video";
  url: string;
  posterUrl?: string;
  prompt: string;
  model: string;
  provider: string;
  aspectRatio: string;
  width: number;
  height: number;
}

const ASPECT_DIMENSIONS: Record<string, { width: number; height: number }> = {
  "1:1": { width: 1024, height: 1024 },
  "16:9": { width: 1280, height: 720 },
  "9:16": { width: 720, height: 1280 },
  "4:3": { width: 1024, height: 768 },
  "3:2": { width: 1080, height: 720 },
};

/**
 * Build Pollinations.ai Image URL (100% Free, No auth, FLUX.1)
 */
export function buildPollinationsImageUrl(
  prompt: string,
  options: MediaGenerationOptions = {}
): string {
  const aspect = options.aspectRatio || "1:1";
  const dims = ASPECT_DIMENSIONS[aspect] || ASPECT_DIMENSIONS["1:1"];
  const width = options.width || dims.width;
  const height = options.height || dims.height;
  const seed = options.seed || Math.floor(Math.random() * 1000000);
  const cleanPrompt = encodeURIComponent(prompt.trim());
  const model = options.model || "flux"; // 'flux', 'turbo', 'flux-realism', 'flux-anime', 'flux-3d'
  return `https://image.pollinations.ai/prompt/${cleanPrompt}?width=${width}&height=${height}&seed=${seed}&model=${model}&nologo=true&enhance=true`;
}

/**
 * Build Pollinations.ai Video URL (100% Free AI Video Generation)
 */
export function buildPollinationsVideoUrl(
  prompt: string,
  options: MediaGenerationOptions = {}
): { videoUrl: string; posterUrl: string } {
  const aspect = options.aspectRatio || "16:9";
  const dims = ASPECT_DIMENSIONS[aspect] || ASPECT_DIMENSIONS["16:9"];
  const width = options.width || dims.width;
  const height = options.height || dims.height;
  const seed = options.seed || Math.floor(Math.random() * 1000000);
  const cleanPrompt = encodeURIComponent(prompt.trim());
  
  // High-res keyframe poster
  const posterUrl = `https://image.pollinations.ai/prompt/${cleanPrompt}?width=${width}&height=${height}&seed=${seed}&model=flux&nologo=true&enhance=true`;
  // Pollinations motion stream
  const videoUrl = `https://image.pollinations.ai/prompt/${cleanPrompt}?width=${width}&height=${height}&seed=${seed}&model=flux&video=true&nologo=true`;
  
  return { videoUrl, posterUrl };
}

/**
 * Generate formatted Markdown for AI Images
 */
export function formatImageMarkdown(
  prompt: string,
  options: MediaGenerationOptions = {}
): string {
  const aspect = options.aspectRatio || "1:1";
  const imageUrl = buildPollinationsImageUrl(prompt, options);
  const modelName = options.model ? options.model.toUpperCase() : "FLUX.1 Schnell";
  return `![${prompt}](${imageUrl}#aspect=${aspect}&model=${encodeURIComponent(modelName)})`;
}

/**
 * Generate formatted Markdown for AI Videos
 */
export function formatVideoMarkdown(
  prompt: string,
  options: MediaGenerationOptions = {}
): string {
  const aspect = options.aspectRatio || "16:9";
  const { videoUrl, posterUrl } = buildPollinationsVideoUrl(prompt, options);
  const modelName = options.model ? options.model.toUpperCase() : "Pollinations Motion AI";
  return `@[video](${videoUrl}#poster=${encodeURIComponent(posterUrl)}&aspect=${aspect}&model=${encodeURIComponent(modelName)}&prompt=${encodeURIComponent(prompt)})`;
}
