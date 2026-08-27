/**
 * Utility to sanitize model display names.
 * Strips out redundant provider suffixes like `(Groq)`, `(Cloudflare)`, `(HuggingFace)`,
 * `(Cerebras)`, `(SambaNova)`, `(Together)`, `(Fireworks)`, `(SiliconFlow)`, etc.,
 * while preserving algorithmic notations like `(MoE)`, `(Preview)`, `(128k)`, `(CoT)`.
 */
export function cleanModelName(name: string | undefined | null): string {
  if (!name) return "";
  return name
    .replace(
      /\s*\((?:Groq|Cerebras|SambaNova|SiliconFlow|Together|Fireworks|HuggingFace|Hugging\s*Face|Cloudflare|Pollinations|OpenRouter|Ollama|Local|Replicate|Fal\.ai|Stability|DeepInfra|Moonshot|Google|OpenAI|Anthropic|Mistral|Zhipu|xAI|01\.AI)\)/gi,
      ""
    )
    .replace(/\s*\([^)]+\)$/, (match) => {
      // Keep technical descriptors
      if (/MoE|CoT|Preview|Latest|Experimental|Pro|Fast|Instruct|Audio|Vision|Flash|Mini|Plus|Thinking/i.test(match)) {
        return match;
      }
      return "";
    })
    .trim();
}
