export interface GeneratedAiImage {
  url: string;
  prompt: string;
  aspectRatio: string;
  markdown: string;
}

export function buildPollinationsImageUrl(prompt: string, options: { width?: number; height?: number; seed?: number } = {}): string {
  const width = options.width || 1024;
  const height = options.height || 1024;
  const seed = options.seed || Math.floor(Math.random() * 1000000);
  const cleanPrompt = encodeURIComponent(prompt.trim());
  return `https://image.pollinations.ai/prompt/${cleanPrompt}?width=${width}&height=${height}&seed=${seed}&nologo=true&enhance=true`;
}

export function formatImageMarkdownResponse(prompt: string, title?: string): string {
  const imageUrl = buildPollinationsImageUrl(prompt);
  const displayTitle = title || prompt.substring(0, 60);
  return `### 🎨 Generated Visual Design\n\n![${displayTitle}](${imageUrl})\n\n*Prompt:* **"${prompt}"**\n\n[Open Full High-Res Image ↗](${imageUrl})`;
}
