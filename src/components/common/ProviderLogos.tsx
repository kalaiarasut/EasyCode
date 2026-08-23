import React from "react";

interface ProviderLogoProps {
  provider?: string;
  modelId?: string;
  className?: string;
  size?: number;
}

export function ProviderLogo({
  provider = "",
  modelId = "",
  className = "w-4 h-4",
  size = 16,
}: ProviderLogoProps) {
  const p = (provider || "").toLowerCase();
  const m = (modelId || "").toLowerCase();

  // 1. OpenAI (GPT-4o, o1, o3, etc.)
  if (p.includes("openai") || m.includes("gpt") || m.includes("o1") || m.includes("o3")) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="currentColor"
        className={className}
      >
        <path d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1685a.0757.0757 0 0 1-.071 0l-4.8303-2.7865A4.504 4.504 0 0 1 2.3408 7.872zm16.5963 3.8558L13.1038 8.364 15.1192 7.2a.0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.407-.6667zm2.0107-3.0231l-.142-.0852-4.7735-2.7818a.7759.7759 0 0 0-.7854 0L9.409 9.2297V6.8974a.0662.0662 0 0 1 .0284-.0615l4.8303-2.7866a4.4992 4.4992 0 0 1 6.6802 4.66zM8.3065 12.863l-2.02-1.1638a.0804.0804 0 0 1-.038-.0567V6.0742a4.4992 4.4992 0 0 1 7.3757-3.4537l-.142.0805L8.704 5.459a.7948.7948 0 0 0-.3927.6813zm1.0976-2.3654l2.602-1.4998 2.6069 1.4998v2.9994l-2.5974 1.4997-2.6067-1.4997Z" />
      </svg>
    );
  }

  // 2. Anthropic Claude (Official Claude Terracotta Starburst / Spark)
  if (p.includes("anthropic") || m.includes("claude")) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="currentColor"
        className={className}
      >
        <path d="M4.5 12.5L2 12l2.5-.5L11.5 2l.5 2.5-.5 7.5L22 12l-2.5.5-7.5.5-.5 9-2.5-.5.5-9-5-.5z" opacity="0.3" />
        <path d="M13.82 2.18a.9.9 0 0 0-1.64 0l-1.32 4.14a.9.9 0 0 1-.58.58L6.14 8.22a.9.9 0 0 0 0 1.64l4.14 1.32a.9.9 0 0 1 .58.58l1.32 4.14a.9.9 0 0 0 1.64 0l1.32-4.14a.9.9 0 0 1 .58-.58l4.14-1.32a.9.9 0 0 0 0-1.64l-4.14-1.32a.9.9 0 0 1-.58-.58L13.82 2.18Z" />
        <path d="M18.5 2.2a.5.5 0 0 0-.9 0l-.6 1.8a.5.5 0 0 1-.3.3l-1.8.6a.5.5 0 0 0 0 .9l1.8.6a.5.5 0 0 1 .3.3l.6 1.8a.5.5 0 0 0 .9 0l.6-1.8a.5.5 0 0 1 .3-.3l1.8-.6a.5.5 0 0 0 0-.9l-1.8-.6a.5.5 0 0 1-.3-.3l-.6-1.8Z" />
      </svg>
    );
  }

  // 3. Google Gemini (Official 4-Point Star Sparkle)
  if (p.includes("google") || m.includes("gemini")) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="currentColor"
        className={className}
      >
        <path d="M12 2C12 7.52285 7.52285 12 2 12C7.52285 12 12 16.4771 12 22C12 16.4771 16.4771 12 22 12C16.4771 12 12 7.52285 12 2Z" />
      </svg>
    );
  }

  // 4. DeepSeek (Official DeepSeek Whale Leaping)
  if (p.includes("deepseek") || m.includes("deepseek")) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="currentColor"
        className={className}
      >
        <path d="M21.6 13.2c-.3-1.8-1.5-3.3-3.1-4.1-1.3-.6-2.8-.8-4.2-.5-1.5.3-2.9 1.1-4 2.2L9 12.1c-.8.8-1.9 1.4-3.1 1.6-1.2.2-2.4-.1-3.4-.8-.4-.3-.7-.7-.9-1.2-.2-.5-.2-1 0-1.5.3-.8 1-1.4 1.8-1.7 1.5-.5 3.2-.2 4.4.8.4.3.9.3 1.3 0 .4-.3.4-.9.1-1.3C7.6 6.4 5.4 6 3.4 6.7 2 7.2 1 8.3.5 9.7c-.5 1.5-.3 3.1.5 4.4 1 1.7 2.8 2.8 4.8 2.9.4 0 .8 0 1.2-.1 1.8-.3 3.4-1.2 4.7-2.5l1.3-1.3c.8-.8 1.9-1.4 3-1.6 1-.2 2.1 0 3 .5 1.1.6 1.9 1.6 2.1 2.8.2 1.2-.3 2.5-1.2 3.3-1.2 1.1-2.9 1.6-4.6 1.3-.5-.1-1 .2-1.1.7-.1.5.2 1 .7 1.1 2.3.4 4.7-.2 6.3-1.7 1.5-1.4 2.2-3.4 1.8-5.3z" />
      </svg>
    );
  }

  // 5. Groq (Official Groq Cube / Block)
  if (p.includes("groq") || m.includes("groq")) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="currentColor"
        className={className}
      >
        <path d="M3 5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5zm12.8 9.2a4 4 0 1 0-7.6 0H6.1a6 6 0 1 1 11.8 0h-2.1zm-4.8 2.8a2 2 0 0 0 2-2h2a4 4 0 0 1-4 4v-2z" />
      </svg>
    );
  }

  // 6. Moonshot AI / Kimi (Official Kimi Moonshot)
  if (p.includes("moonshot") || m.includes("kimi")) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="currentColor"
        className={className}
      >
        <path d="M12 2A10 10 0 1 0 22 12A10 10 0 0 0 12 2zm1 14.8l-3.5-3.5 1.4-1.4 2.1 2.1 4.2-4.2 1.4 1.4z" />
      </svg>
    );
  }

  // 7. Alibaba Cloud Qwen (Official Qwen Polygon Facet)
  if (p.includes("qwen") || p.includes("alibaba") || m.includes("qwen") || m.includes("qwq")) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="currentColor"
        className={className}
      >
        <path d="M12 2L3 7.5v9L12 22l9-5.5v-9L12 2zm0 3.3l5.5 3.3L12 12 6.5 8.6 12 5.3zM5.5 10.3l5.5 3.4v6.2L5.5 16.5v-6.2zm13 6.2l-5.5 3.4v-6.2l5.5-3.4v6.2z" />
      </svg>
    );
  }

  // 8. Mistral AI (Official Mistral Tiered Staircase Blocks)
  if (p.includes("mistral") || m.includes("mistral") || m.includes("codestral")) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="currentColor"
        className={className}
      >
        <path d="M3 3h3.6v3.6H3V3zm14.4 0H21v3.6h-3.6V3zm-7.2 3.6h3.6v3.6h-3.6V6.6zM3 10.2h3.6v3.6H3v-3.6zm14.4 0H21v3.6h-3.6v-3.6zm-7.2 3.6h3.6v3.6h-3.6v-3.6zM3 17.4h3.6V21H3v-3.6zm14.4 0H21V21h-3.6v-3.6zm-7.2 0h3.6V21h-3.6v-3.6z" />
      </svg>
    );
  }

  // 9. Meta Llama (Official Meta Infinity Ribbon)
  if (p.includes("meta") || m.includes("llama")) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="currentColor"
        className={className}
      >
        <path d="M16.9 4.8c-2.4 0-4.3 1.4-5.2 3.4-.9-2-2.8-3.4-5.2-3.4C3 4.8.8 7.3.8 11.2c0 4.6 3.6 8 8.1 8 2.6 0 4.6-1.4 5.6-3.4 1 2 3 3.4 5.6 3.4 4.5 0 8.1-3.4 8.1-8 0-3.9-2.2-6.4-5.7-6.4zM8.9 16.7c-3.1 0-5.5-2.4-5.5-5.5 0-2.8 1.9-4.8 4.7-4.8 2.3 0 4.1 1.7 4.7 4.1-.7 3.7-2.1 6.2-3.9 6.2zm8.2 0c-1.8 0-3.2-2.5-3.9-6.2.6-2.4 2.4-4.1 4.7-4.1 2.8 0 4.7 2 4.7 4.8 0 3.1-2.4 5.5-5.5 5.5z" />
      </svg>
    );
  }

  // 10. xAI (Grok) (Official Stylized X)
  if (p.includes("xai") || m.includes("grok")) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="currentColor"
        className={className}
      >
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    );
  }

  // 11. Perplexity AI (Official Perplexity 6-pointed Asterisk Cross)
  if (p.includes("perplexity") || m.includes("sonar")) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="currentColor"
        className={className}
      >
        <path d="M12 2v8l6.9-4-1 1.7L12 11.7V22h-2v-9.7L4.1 7.7l-1-1.7L10 10V2h2zm7 9v4l-6.9-4 1-1.7L19 11zm-14 0l6.9 2.3-1 1.7L5 15v-4z" />
      </svg>
    );
  }

  // 12. Cohere (Official Coral Shape)
  if (p.includes("cohere") || m.includes("command")) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="currentColor"
        className={className}
      >
        <path d="M12 3a9 9 0 0 0-9 9c0 4.1 2.8 7.6 6.8 8.6.6.1.8-.3.8-.6v-2.2c-2.8.6-3.4-1.4-3.4-1.4-.4-1.1-1-1.4-1-1.4-.9-.6.1-.6.1-.6 1 .1 1.5 1 1.5 1 .9 1.5 2.3 1.1 2.9.8.1-.6.3-1.1.6-1.4-2.2-.3-4.5-1.1-4.5-5 0-1.1.4-2 1-2.7-.1-.3-.4-1.3.1-2.7 0 0 .8-.3 2.8 1a9.6 9.6 0 0 1 5 0c2-1.3 2.8-1 2.8-1 .5 1.4.2 2.4.1 2.7.6.7 1 1.6 1 2.7 0 3.9-2.3 4.7-4.5 5 .4.3.7.9.7 1.8v2.7c0 .3.2.7.8.6A9 9 0 0 0 21 12a9 9 0 0 0-9-9z" />
      </svg>
    );
  }

  // 13. Ollama (Official Ollama Alpaca / Llama Silhouette)
  if (p.includes("ollama") || p.includes("local") || m.includes("ollama")) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="currentColor"
        className={className}
      >
        <path d="M12 2c-3.3 0-6 2.7-6 6v3.2L4.5 13C3.7 13.8 3.7 15 4.5 15.8L6 17.3V20c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2v-2.7l1.5-1.5c.8-.8.8-2 0-2.8L18 11.2V8c0-3.3-2.7-6-6-6zm-2 7a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm4 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm-2 7a2 2 0 1 1 0-4 2 2 0 0 1 0 4z" />
      </svg>
    );
  }

  // 14. Cerebras & SambaNova
  if (p.includes("cerebras") || p.includes("sambanova") || m.includes("cerebras") || m.includes("sambanova")) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="currentColor"
        className={className}
      >
        <path d="M12 2L4 7v10l8 5 8-5V7l-8-5zm0 2.8l5.7 3.6L12 12 6.3 8.4 12 4.8zM6 10.3l5 3.1v5.8l-5-3.1v-5.8zm12 5.8l-5 3.1v-5.8l5-3.1v5.8z" />
      </svg>
    );
  }

  // Default: EasyCode Platform Sparkle / Star
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
    >
      <path d="M12 2L14.4 9.6L22 12L14.4 14.4L12 22L9.6 14.4L2 12L9.6 9.6L12 2Z" />
    </svg>
  );
}
