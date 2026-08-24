"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Download,
  Copy,
  Check,
  Maximize2,
  Minimize2,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Sparkles,
  Film,
  Image as ImageIcon,
  ExternalLink,
  Loader2,
  RefreshCw,
  X,
} from "lucide-react";
import { toast } from "sonner";

export interface AiMediaCardProps {
  type: "image" | "video";
  src: string;
  poster?: string;
  prompt: string;
  alt?: string;
  model?: string;
  aspectRatio?: "1:1" | "16:9" | "9:16" | "4:3";
  isGenerating?: boolean;
  className?: string;
}

const IMAGE_GENERATION_STEPS = [
  { label: "Conceptualizing visual composition", percent: 20 },
  { label: "Refining semantic prompt vectors", percent: 50 },
  { label: "Rendering neural textures & lighting", percent: 80 },
  { label: "Polishing high-res artifacts", percent: 100 },
];

const VIDEO_GENERATION_STEPS = [
  { label: "Storyboarding keyframes & scene dynamics", percent: 20 },
  { label: "Synthesizing temporal motion vectors", percent: 50 },
  { label: "Rendering coherent video frames", percent: 80 },
  { label: "Finalizing MP4 media stream", percent: 100 },
];

export default function AiMediaCard({
  type,
  src,
  poster,
  prompt,
  alt,
  model = type === "image" ? "FLUX.1 Schnell" : "Pollinations Motion AI",
  aspectRatio = type === "image" ? "1:1" : "16:9",
  isGenerating = false,
  className = "",
}: AiMediaCardProps) {
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [hasError, setHasError] = useState<boolean>(false);
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState<boolean>(false);

  // Progressive Stage Steps for ChatGPT-like feel
  const steps = type === "image" ? IMAGE_GENERATION_STEPS : VIDEO_GENERATION_STEPS;
  const [currentStepIdx, setCurrentStepIdx] = useState<number>(0);
  const [progressPercent, setProgressPercent] = useState<number>(15);

  // Video State
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(true);
  const [isLooping, setIsLooping] = useState<boolean>(true);
  const [videoProgress, setVideoProgress] = useState<number>(0);

  // Simulate progressive stages on load
  useEffect(() => {
    if (isLoaded) {
      setProgressPercent(100);
      setCurrentStepIdx(steps.length - 1);
      return;
    }

    const interval = setInterval(() => {
      setCurrentStepIdx((prev) => {
        const next = prev < steps.length - 2 ? prev + 1 : prev;
        setProgressPercent(steps[next].percent);
        return next;
      });
    }, 1200);

    return () => clearInterval(interval);
  }, [isLoaded, steps]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(src);
      setIsCopied(true);
      toast.success("Media link copied to clipboard");
      setTimeout(() => setIsCopied(false), 2000);
    } catch (e) {
      toast.error("Failed to copy link");
    }
  };

  const handleDownload = async () => {
    try {
      toast.loading("Preparing download...", { id: "media-dl" });
      const res = await fetch(src);
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const cleanName = prompt.slice(0, 30).replace(/[^a-zA-Z0-9]/g, "_").toLowerCase();
      a.download = `${cleanName || "generated_media"}_${Date.now()}.${type === "image" ? "png" : "mp4"}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      toast.success("Download started!", { id: "media-dl" });
    } catch (e) {
      // Fallback direct open
      window.open(src, "_blank");
      toast.success("Opened media in new tab", { id: "media-dl" });
    }
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const aspectClass =
    aspectRatio === "1:1"
      ? "aspect-square max-w-[420px]"
      : aspectRatio === "16:9"
      ? "aspect-video max-w-[540px]"
      : aspectRatio === "9:16"
      ? "aspect-[9/16] max-w-[320px]"
      : "aspect-[4/3] max-w-[480px]";

  return (
    <div
      className={`my-3.5 rounded-2xl overflow-hidden border border-black/[0.08] dark:border-white/[0.08] bg-[#0f0f0f] text-neutral-100 shadow-md ${className}`}
      style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif' }}
    >
      {/* Top Media Header */}
      <div className="h-9 px-3.5 bg-black/40 dark:bg-white/[0.03] border-b border-white/[0.06] flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          {type === "image" ? (
            <div className="flex items-center gap-1.5 font-mono text-[11px] text-amber-400 font-medium">
              <ImageIcon className="w-3.5 h-3.5" />
              <span>IMAGE</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 font-mono text-[11px] text-cyan-400 font-medium">
              <Film className="w-3.5 h-3.5" />
              <span>VIDEO</span>
            </div>
          )}
          <span className="text-white/20">|</span>
          <span className="text-[11px] text-neutral-400 font-mono">{model}</span>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-1">
          <button
            onClick={handleCopy}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            title="Copy URL"
          >
            {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={handleDownload}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            title="Download high-res media"
          >
            <Download className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setIsLightboxOpen(true)}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            title="Expand Fullscreen"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Square / Video Container (ChatGPT Style) */}
      <div className={`relative w-full ${aspectClass} mx-auto bg-[#141414] overflow-hidden flex items-center justify-center select-none`}>
        {/* Oceanic Wave Shimmer Background while loading */}
        {!isLoaded && !hasError && (
          <motion.div
            animate={{
              backgroundPosition: ["0% 100%", "100% 0%"],
              opacity: [0.45, 0.85, 0.55, 0.95, 0.45],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            style={{
              background:
                "linear-gradient(135deg, transparent 0%, rgba(16, 185, 129, 0.1) 25%, rgba(6, 182, 212, 0.2) 50%, rgba(16, 185, 129, 0.1) 75%, transparent 100%)",
              backgroundSize: "250% 250%",
            }}
            className="absolute inset-0 z-0"
          />
        )}

        {/* Centered Stage Progression in Middle of Square (ChatGPT Style) */}
        {!isLoaded && !hasError && (
          <div className="relative z-10 flex flex-col items-center justify-center text-center p-6 space-y-3 max-w-[85%]">
            {/* Pulsing Icon Halo */}
            <div className="relative flex items-center justify-center">
              <span className="animate-ping absolute inline-flex h-12 w-12 rounded-full bg-emerald-400/20" />
              <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 shadow-inner">
                {type === "image" ? (
                  <Sparkles className="w-6 h-6 animate-spin" style={{ animationDuration: '4s' }} />
                ) : (
                  <Film className="w-6 h-6 animate-pulse" />
                )}
              </div>
            </div>

            {/* Step Label & Percentage */}
            <div className="space-y-1">
              <p className="text-xs font-semibold text-neutral-200 tracking-tight flex items-center justify-center gap-1.5">
                <span>{steps[currentStepIdx]?.label || "Synthesizing visual content..."}</span>
              </p>
              <p className="text-[11px] font-mono text-emerald-400 font-bold">{progressPercent}%</p>
            </div>

            {/* Mini Progress Bar */}
            <div className="w-36 h-1 rounded-full bg-white/10 overflow-hidden">
              <motion.div
                initial={{ width: "10%" }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 0.8 }}
                className="h-full bg-gradient-to-r from-emerald-500 to-cyan-400 rounded-full"
              />
            </div>
          </div>
        )}

        {/* The Media (Image or Video) with Blur-up Smooth Fade */}
        {type === "image" ? (
          <img
            src={src}
            alt={alt || prompt}
            onLoad={() => setIsLoaded(true)}
            onError={() => {
              setHasError(true);
              setIsLoaded(true);
            }}
            onClick={() => setIsLightboxOpen(true)}
            className={`w-full h-full object-contain transition-all duration-700 cursor-pointer ${
              isLoaded ? "opacity-100 blur-0 scale-100" : "opacity-0 blur-md scale-95"
            }`}
          />
        ) : (
          <div className="relative w-full h-full group" onClick={togglePlay}>
            <video
              ref={videoRef}
              src={src}
              poster={poster}
              playsInline
              loop={isLooping}
              muted={isMuted}
              onLoadedData={() => setIsLoaded(true)}
              onError={() => {
                setHasError(true);
                setIsLoaded(true);
              }}
              onTimeUpdate={() => {
                if (videoRef.current) {
                  const p = (videoRef.current.currentTime / (videoRef.current.duration || 1)) * 100;
                  setVideoProgress(p);
                }
              }}
              className={`w-full h-full object-contain transition-all duration-700 ${
                isLoaded ? "opacity-100 blur-0" : "opacity-0 blur-md"
              }`}
            />

            {/* Video Play/Pause Overlay */}
            {isLoaded && !isPlaying && (
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center cursor-pointer transition-opacity">
                <div className="p-3.5 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white shadow-xl hover:scale-110 transition-transform">
                  <Play className="w-6 h-6 ml-0.5" />
                </div>
              </div>
            )}

            {/* Video Bottom Progress Bar */}
            {isLoaded && (
              <div className="absolute bottom-0 inset-x-0 h-1 bg-black/50">
                <div className="h-full bg-cyan-400 transition-all" style={{ width: `${videoProgress}%` }} />
              </div>
            )}
          </div>
        )}

        {/* Error Fallback */}
        {hasError && (
          <div className="relative z-10 flex flex-col items-center justify-center p-6 text-center space-y-2 text-rose-400 text-xs">
            <X className="w-6 h-6" />
            <p>Failed to load media preview. Click below to view directly.</p>
            <a
              href={src}
              target="_blank"
              rel="noopener noreferrer"
              className="text-white bg-white/10 px-3 py-1 rounded-lg hover:bg-white/20"
            >
              Open Direct Stream ↗
            </a>
          </div>
        )}
      </div>

      {/* Media Footer: Prompt details */}
      <div className="p-3 bg-black/60 dark:bg-white/[0.02] border-t border-white/[0.06] text-xs space-y-1">
        <p className="text-neutral-300 line-clamp-2 leading-relaxed font-sans select-text">
          <span className="text-neutral-500 font-mono text-[11px] mr-1.5 uppercase font-medium">Prompt:</span>
          &ldquo;{prompt}&rdquo;
        </p>
      </div>

      {/* Fullscreen Lightbox Modal */}
      <AnimatePresence>
        {isLightboxOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col items-center justify-between p-4 select-none"
            onClick={() => setIsLightboxOpen(false)}
          >
            {/* Modal Header */}
            <div className="w-full flex items-center justify-between text-neutral-300 text-xs py-2 px-4" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center gap-2">
                <span className="font-mono text-emerald-400 font-bold uppercase">{type} Fullscreen</span>
                <span className="text-neutral-500">|</span>
                <span className="truncate max-w-[300px] text-neutral-400">&ldquo;{prompt}&rdquo;</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleDownload}
                  className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-medium flex items-center gap-1.5 cursor-pointer text-xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download</span>
                </button>
                <button
                  onClick={() => setIsLightboxOpen(false)}
                  className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white cursor-pointer"
                  title="Close (Esc)"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Modal Center Content */}
            <div className="flex-1 w-full max-h-[85vh] flex items-center justify-center p-2" onClick={(e) => e.stopPropagation()}>
              {type === "image" ? (
                <img
                  src={src}
                  alt={prompt}
                  className="max-w-full max-h-full object-contain rounded-xl shadow-2xl"
                />
              ) : (
                <video
                  src={src}
                  controls
                  autoPlay
                  loop
                  playsInline
                  className="max-w-full max-h-full object-contain rounded-xl shadow-2xl"
                />
              )}
            </div>

            {/* Modal Footer */}
            <div className="text-neutral-500 text-[11px] font-mono py-2">
              Click anywhere outside or press Esc to close
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
