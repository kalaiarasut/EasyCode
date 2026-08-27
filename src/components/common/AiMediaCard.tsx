"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Download,
  Copy,
  Check,
  Maximize2,
  Play,
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

export default function AiMediaCard({
  type,
  src,
  poster,
  prompt,
  alt,
  model = type === "image" ? "FLUX.1 Schnell" : "Pollinations Motion AI",
  aspectRatio = type === "image" ? "1:1" : "16:9",
  className = "",
}: AiMediaCardProps) {
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [hasError, setHasError] = useState<boolean>(false);
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState<boolean>(false);

  // Video State
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [videoProgress, setVideoProgress] = useState<number>(0);

  // Keyboard shortcut listener for Lightbox (Esc key)
  useEffect(() => {
    if (!isLightboxOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsLightboxOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isLightboxOpen]);

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(src);
      setIsCopied(true);
      toast.success("Media link copied to clipboard");
      setTimeout(() => setIsCopied(false), 2000);
    } catch (e) {
      toast.error("Failed to copy link");
    }
  };

  const handleDownload = async (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      toast.loading("Preparing download...", { id: "media-dl" });
      const res = await fetch(src);
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const cleanName = prompt.slice(0, 30).replace(/[^a-zA-Z0-9]/g, "_").toLowerCase();
      a.download = `${cleanName || "generated_visual"}_${Date.now()}.${type === "image" ? "png" : "mp4"}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      toast.success("Download started", { id: "media-dl" });
    } catch (e) {
      window.open(src, "_blank");
      toast.success("Opened media in new tab", { id: "media-dl" });
    }
  };

  const togglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
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
      ? "aspect-square max-w-[480px]"
      : aspectRatio === "16:9"
      ? "aspect-video max-w-[560px]"
      : aspectRatio === "9:16"
      ? "aspect-[9/16] max-w-[340px]"
      : "aspect-[4/3] max-w-[500px]";

  return (
    <div
      className={`relative w-full ${aspectClass} my-2 rounded-2xl overflow-hidden bg-black border border-white/[0.08] shadow-xl flex items-center justify-center select-none ${className}`}
      style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif' }}
    >
      {/* 1. Oceanic Wave Shimmer Background during Generation (Bottom-Left to Top-Right) */}
      {!isLoaded && !hasError && (
        <motion.div
          animate={{
            backgroundPosition: ["0% 100%", "100% 0%"],
          }}
          transition={{
            duration: 2.8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          style={{
            background:
              "linear-gradient(135deg, rgba(255, 255, 255, 0.01) 0%, rgba(255, 255, 255, 0.04) 25%, rgba(255, 255, 255, 0.14) 50%, rgba(255, 255, 255, 0.04) 75%, rgba(255, 255, 255, 0.01) 100%)",
            backgroundSize: "280% 280%",
          }}
          className="absolute inset-0 z-0 pointer-events-none"
        />
      )}

      {/* 2. Generating Text with Pure CSS Shimmer */}
      {!isLoaded && !hasError && (
        <div className="relative z-10 flex flex-col items-center justify-center p-6 text-center space-y-2">
          <p className="shimmer text-xs font-mono tracking-widest uppercase">
            Generating with {model}...
          </p>
        </div>
      )}

      {/* 3. The Visual Media (Image or Video) */}
      {type === "image" ? (
        <img
          src={src}
          alt={alt || prompt}
          onLoad={() => setIsLoaded(true)}
          onError={() => {
            setHasError(true);
            setIsLoaded(true);
          }}
          onClick={() => isLoaded && setIsLightboxOpen(true)}
          className={`w-full h-full object-contain transition-all duration-700 ${
            isLoaded ? "opacity-100 cursor-zoom-in" : "opacity-0 absolute inset-0"
          }`}
        />
      ) : (
        <div
          className={`relative w-full h-full group ${
            isLoaded ? "opacity-100" : "opacity-0 absolute inset-0"
          }`}
          onClick={togglePlay}
        >
          <video
            ref={videoRef}
            src={src}
            poster={poster}
            playsInline
            loop
            muted
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
            className="w-full h-full object-contain"
          />

          {/* Video Play/Pause Overlay */}
          {isLoaded && !isPlaying && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center cursor-pointer">
              <div className="p-3.5 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white shadow-xl hover:scale-110 transition-transform">
                <Play className="w-5 h-5 ml-0.5" />
              </div>
            </div>
          )}

          {/* Video Bottom Progress Bar */}
          {isLoaded && (
            <div className="absolute bottom-0 inset-x-0 h-1 bg-white/10">
              <div className="h-full bg-white/80 transition-all" style={{ width: `${videoProgress}%` }} />
            </div>
          )}
        </div>
      )}

      {/* 4. Controls Overlay (Appears ONLY after Generation Complete) */}
      {isLoaded && !hasError && (
        <div className="absolute top-0 inset-x-0 p-3 bg-gradient-to-b from-black/80 via-black/40 to-transparent flex items-center justify-between z-20 pointer-events-auto">
          {/* Model Pill Badge */}
          <span className="text-[11px] font-mono px-2.5 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-neutral-200">
            {model}
          </span>

          {/* Action Icons */}
          <div className="flex items-center gap-1.5 bg-black/40 backdrop-blur-md px-1.5 py-1 rounded-xl border border-white/10">
            <button
              onClick={handleCopy}
              className="p-1.5 rounded-lg text-neutral-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              title="Copy Link"
            >
              {isCopied ? <Check className="w-3.5 h-3.5 text-white" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={handleDownload}
              className="p-1.5 rounded-lg text-neutral-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              title="Download Media"
            >
              <Download className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsLightboxOpen(true);
              }}
              className="p-1.5 rounded-lg text-neutral-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              title="Fullscreen"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* 5. Error Fallback */}
      {hasError && (
        <div className="relative z-10 flex flex-col items-center justify-center p-6 text-center space-y-2 text-neutral-400 text-xs">
          <p>Failed to render media preview</p>
          <a
            href={src}
            target="_blank"
            rel="noopener noreferrer"
            className="text-white bg-white/10 px-3 py-1 rounded-lg hover:bg-white/20 transition-colors"
          >
            Open in new tab ↗
          </a>
        </div>
      )}

      {/* 6. Fullscreen Lightbox Modal (Click anywhere or press Esc to close) */}
      <AnimatePresence>
        {isLightboxOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col items-center justify-between p-4 select-none cursor-pointer"
            onClick={() => setIsLightboxOpen(false)}
          >
            {/* Modal Header */}
            <div
              className="w-full flex items-center justify-between text-neutral-300 text-xs py-2 px-4 cursor-default"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-2">
                <span className="font-mono text-white font-medium uppercase">{model}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleDownload}
                  className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-medium flex items-center gap-1.5 cursor-pointer text-xs transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download</span>
                </button>
                <button
                  onClick={() => setIsLightboxOpen(false)}
                  className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white cursor-pointer transition-colors"
                  title="Close (Esc)"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Modal Center Content (Clicking anywhere closes modal) */}
            <div className="flex-1 w-full max-h-[85vh] flex items-center justify-center p-2">
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
                  onClick={(e) => e.stopPropagation()}
                  className="max-w-full max-h-full object-contain rounded-xl shadow-2xl cursor-default"
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
