"use client";

import React, { useEffect, useRef, useState, useId } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Maximize2,
  Minimize2,
  Copy,
  Check,
  Download,
  Code2,
  Eye,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Network,
  Share2,
  Sparkles,
  Layers,
  AlertCircle,
  FileCode,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { useTheme } from "next-themes";

export interface MermaidFlowchartViewerProps {
  chart: string;
  title?: string;
  isGenerating?: boolean;
  className?: string;
}

const FLOWCHART_GENERATION_STEPS = [
  { label: "Parsing structural logic & decision nodes", percent: 20 },
  { label: "Computing topological node placement & hierarchy", percent: 50 },
  { label: "Routing optimal vector paths & edge connectors", percent: 80 },
  { label: "Polishing diagram styling & theme tokens", percent: 100 },
];

export default function MermaidFlowchartViewer({
  chart,
  title = "System Architecture / Logic Flowchart",
  isGenerating = false,
  className = "",
}: MermaidFlowchartViewerProps) {
  const { theme } = useTheme();
  const uniqueId = useId().replace(/[^a-zA-Z0-9]/g, "_");
  const containerRef = useRef<HTMLDivElement>(null);
  const svgWrapperRef = useRef<HTMLDivElement>(null);

  const [svgContent, setSvgContent] = useState<string>("");
  const [isRendering, setIsRendering] = useState<boolean>(true);
  const [renderError, setRenderError] = useState<string | null>(null);
  const [showRawCode, setShowRawCode] = useState<boolean>(false);
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState<boolean>(false);

  // Zoom & Pan state
  const [zoomLevel, setZoomLevel] = useState<number>(1);

  // Progressive Stage Steps
  const [currentStepIdx, setCurrentStepIdx] = useState<number>(0);
  const [progressPercent, setProgressPercent] = useState<number>(20);

  useEffect(() => {
    if (!isRendering) {
      setProgressPercent(100);
      setCurrentStepIdx(FLOWCHART_GENERATION_STEPS.length - 1);
      return;
    }

    const interval = setInterval(() => {
      setCurrentStepIdx((prev) => {
        const next = prev < FLOWCHART_GENERATION_STEPS.length - 2 ? prev + 1 : prev;
        setProgressPercent(FLOWCHART_GENERATION_STEPS[next].percent);
        return next;
      });
    }, 1100);

    return () => clearInterval(interval);
  }, [isRendering]);

  // Render Mermaid Diagram to SVG
  useEffect(() => {
    let isMounted = true;

    async function renderMermaidChart() {
      setIsRendering(true);
      setRenderError(null);

      try {
        const mermaidModule = await import("mermaid");
        const mermaid = mermaidModule.default;

        const isDark = theme === "dark";

        // Initialize with sleek LeetCode / EasyCode dark & light theme tokens
        mermaid.initialize({
          startOnLoad: false,
          theme: "base",
          securityLevel: "loose",
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, monospace',
          themeVariables: isDark
            ? {
                darkMode: true,
                background: "#141414",
                primaryColor: "#1f2937",
                primaryTextColor: "#f3f4f6",
                primaryBorderColor: "#10b981",
                lineColor: "#6ee7b7",
                secondaryColor: "#1e1e24",
                secondaryTextColor: "#e5e7eb",
                secondaryBorderColor: "#06b6d4",
                tertiaryColor: "#18181b",
                tertiaryTextColor: "#e5e7eb",
                tertiaryBorderColor: "#f59e0b",
                mainBkg: "#18181b",
                nodeBorder: "#10b981",
                clusterBkg: "rgba(255, 255, 255, 0.03)",
                clusterBorder: "rgba(255, 255, 255, 0.15)",
                titleColor: "#ffffff",
                edgeLabelBackground: "#18181b",
                nodeTextColor: "#f9fafb",
              }
            : {
                darkMode: false,
                background: "#fcfbf9",
                primaryColor: "#ffffff",
                primaryTextColor: "#1c1b19",
                primaryBorderColor: "#0f766e",
                lineColor: "#0d9488",
                secondaryColor: "#f3f4f6",
                secondaryTextColor: "#1c1b19",
                secondaryBorderColor: "#0284c7",
                tertiaryColor: "#fafaf9",
                tertiaryTextColor: "#1c1b19",
                tertiaryBorderColor: "#d97706",
                mainBkg: "#ffffff",
                nodeBorder: "#0f766e",
                clusterBkg: "rgba(0, 0, 0, 0.02)",
                clusterBorder: "rgba(0, 0, 0, 0.12)",
                titleColor: "#1c1b19",
                edgeLabelBackground: "#ffffff",
                nodeTextColor: "#1c1b19",
              },
        });

        const renderId = `mermaid_flowchart_${uniqueId}_${Date.now()}`;
        const { svg } = await mermaid.render(renderId, chart.trim());

        if (isMounted) {
          setSvgContent(svg);
          setIsRendering(false);
        }
      } catch (err: any) {
        if (isMounted) {
          setRenderError(err?.message || "Failed to parse flowchart structure");
          setIsRendering(false);
        }
      }
    }

    renderMermaidChart();

    return () => {
      isMounted = false;
    };
  }, [chart, theme, uniqueId]);

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(chart);
      setIsCopied(true);
      toast.success("Mermaid diagram code copied to clipboard");
      setTimeout(() => setIsCopied(false), 2000);
    } catch (e) {
      toast.error("Failed to copy code");
    }
  };

  const handleDownloadSvg = () => {
    if (!svgContent) return;
    try {
      const blob = new Blob([svgContent], { type: "image/svg+xml;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      const cleanTitle = title.slice(0, 30).replace(/[^a-zA-Z0-9]/g, "_").toLowerCase();
      link.download = `${cleanTitle || "flowchart"}_${Date.now()}.svg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success("Downloaded SVG vector flowchart!");
    } catch (e) {
      toast.error("Failed to download SVG");
    }
  };

  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 0.2, 2.5));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(prev - 0.2, 0.5));
  const handleResetZoom = () => setZoomLevel(1);

  return (
    <div
      ref={containerRef}
      className={`my-4 rounded-2xl overflow-hidden border border-black/[0.08] dark:border-white/[0.08] bg-[#fcfbf9] dark:bg-[#121212] shadow-md transition-all ${className}`}
      style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif' }}
    >
      {/* Top Header Bar */}
      <div className="h-9 px-3.5 bg-black/[0.03] dark:bg-white/[0.03] border-b border-black/[0.06] dark:border-white/[0.06] flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 font-mono text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
            <Network className="w-3.5 h-3.5" />
            <span>FLOWCHART & DIAGRAM</span>
          </div>
          <span className="text-black/20 dark:text-white/20">|</span>
          <span className="text-[11px] text-neutral-500 dark:text-neutral-400 truncate max-w-[240px]">
            {title}
          </span>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1">
          {/* Zoom Controls */}
          {!showRawCode && !isRendering && !renderError && (
            <div className="flex items-center gap-0.5 mr-1 bg-black/[0.04] dark:bg-white/[0.06] rounded-lg p-0.5">
              <button
                onClick={handleZoomOut}
                className="p-1 rounded text-neutral-500 hover:text-neutral-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer"
                title="Zoom Out"
              >
                <ZoomOut className="w-3 h-3" />
              </button>
              <button
                onClick={handleResetZoom}
                className="px-1.5 py-0.5 text-[10px] font-mono text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors cursor-pointer"
                title="Reset Zoom"
              >
                {Math.round(zoomLevel * 100)}%
              </button>
              <button
                onClick={handleZoomIn}
                className="p-1 rounded text-neutral-500 hover:text-neutral-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer"
                title="Zoom In"
              >
                <ZoomIn className="w-3 h-3" />
              </button>
            </div>
          )}

          {/* Toggle Raw Mermaid Code */}
          <button
            onClick={() => setShowRawCode(!showRawCode)}
            className="p-1.5 rounded-lg text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition-colors cursor-pointer flex items-center gap-1"
            title={showRawCode ? "Show Visual Diagram" : "View Raw Mermaid Code"}
          >
            {showRawCode ? <Eye className="w-3.5 h-3.5" /> : <Code2 className="w-3.5 h-3.5" />}
          </button>

          {/* Copy Mermaid Code */}
          <button
            onClick={handleCopyCode}
            className="p-1.5 rounded-lg text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition-colors cursor-pointer"
            title="Copy Diagram Code"
          >
            {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
          </button>

          {/* Download Vector SVG */}
          <button
            onClick={handleDownloadSvg}
            disabled={!svgContent || isRendering}
            className="p-1.5 rounded-lg text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition-colors cursor-pointer disabled:opacity-40"
            title="Export as Vector SVG"
          >
            <Download className="w-3.5 h-3.5" />
          </button>

          {/* Fullscreen Lightbox */}
          <button
            onClick={() => setIsLightboxOpen(true)}
            className="p-1.5 rounded-lg text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition-colors cursor-pointer"
            title="Expand Fullscreen"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Flowchart Canvas Container */}
      <div className="relative w-full min-h-[260px] max-h-[580px] overflow-auto p-4 flex items-center justify-center select-none bg-radial from-emerald-500/[0.02] via-transparent to-transparent">
        {/* Cybernetic Neural Blueprint Grid Shimmer while generating / rendering */}
        {isRendering && !renderError && (
          <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
            {/* Animated Circuit / Blueprint Grid */}
            <motion.div
              animate={{
                backgroundPosition: ["0px 0px", "60px 60px"],
                opacity: [0.4, 0.8, 0.5, 0.9, 0.4],
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: "linear",
              }}
              style={{
                backgroundImage:
                  theme === "dark"
                    ? "linear-gradient(to right, rgba(16, 185, 129, 0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(6, 182, 212, 0.1) 1px, transparent 1px)"
                    : "linear-gradient(to right, rgba(13, 148, 136, 0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(2, 132, 199, 0.08) 1px, transparent 1px)",
                backgroundSize: "30px 30px",
              }}
              className="absolute inset-0"
            />

            {/* Diagonal Sweeping Laser Scanner */}
            <motion.div
              animate={{
                x: ["-100%", "200%"],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              style={{
                background:
                  "linear-gradient(90deg, transparent 0%, rgba(16, 185, 129, 0.15) 50%, transparent 100%)",
                width: "40%",
              }}
              className="absolute inset-y-0"
            />
          </div>
        )}

        {/* Centered Stage Progression Steps (Cybernetic Blueprint Style) */}
        {isRendering && !renderError && (
          <div className="relative z-10 flex flex-col items-center justify-center text-center p-6 space-y-3 max-w-[85%]">
            {/* Pulsing Circuit Node Halo */}
            <div className="relative flex items-center justify-center">
              <span className="animate-ping absolute inline-flex h-12 w-12 rounded-full bg-emerald-400/20" />
              <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 shadow-inner">
                <Network className="w-6 h-6 animate-pulse" />
              </div>
            </div>

            {/* Step Label & Percentage */}
            <div className="space-y-1">
              <p className="text-xs font-semibold text-neutral-800 dark:text-neutral-200 tracking-tight flex items-center justify-center gap-1.5">
                <Sparkles className="w-3 h-3 text-emerald-500 animate-spin" style={{ animationDuration: '3s' }} />
                <span>{FLOWCHART_GENERATION_STEPS[currentStepIdx]?.label || "Synthesizing diagram layout..."}</span>
              </p>
              <p className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                {progressPercent}%
              </p>
            </div>

            {/* Mini Progress Bar */}
            <div className="w-40 h-1 rounded-full bg-black/10 dark:bg-white/10 overflow-hidden">
              <motion.div
                initial={{ width: "10%" }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 0.8 }}
                className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full"
              />
            </div>
          </div>
        )}

        {/* Visual Rendered SVG Diagram */}
        {!showRawCode && !isRendering && !renderError && svgContent && (
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            ref={svgWrapperRef}
            style={{
              transform: `scale(${zoomLevel})`,
              transformOrigin: "center center",
              transition: "transform 0.15s ease-out",
            }}
            className="w-full flex items-center justify-center p-2 [&>svg]:max-w-full [&>svg]:h-auto [&>svg]:overflow-visible"
            dangerouslySetInnerHTML={{ __html: svgContent }}
          />
        )}

        {/* Raw Mermaid Code View */}
        {showRawCode && (
          <div className="w-full max-h-[420px] overflow-auto rounded-xl bg-black/90 text-neutral-100 p-4 text-xs font-mono select-text leading-relaxed border border-white/10">
            <pre>
              <code>{chart}</code>
            </pre>
          </div>
        )}

        {/* Error Fallback */}
        {renderError && (
          <div className="relative z-10 flex flex-col items-center justify-center p-6 text-center space-y-2 text-rose-500 text-xs">
            <AlertCircle className="w-6 h-6" />
            <p className="font-semibold">Flowchart Syntax Error</p>
            <p className="text-neutral-500 max-w-[340px] text-[11px]">{renderError}</p>
            <button
              onClick={() => setShowRawCode(true)}
              className="text-xs bg-rose-500/10 text-rose-600 dark:text-rose-400 px-3 py-1 rounded-lg hover:bg-rose-500/20 transition-colors"
            >
              View Raw Code
            </button>
          </div>
        )}
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
            <div
              className="w-full flex items-center justify-between text-neutral-300 text-xs py-2 px-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-2">
                <span className="font-mono text-emerald-400 font-bold uppercase">Flowchart Canvas</span>
                <span className="text-neutral-500">|</span>
                <span className="truncate max-w-[400px] text-neutral-300">{title}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleDownloadSvg}
                  className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-medium flex items-center gap-1.5 cursor-pointer text-xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download SVG</span>
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
            <div
              className="flex-1 w-full max-h-[85vh] flex items-center justify-center p-4 overflow-auto [&>svg]:max-w-full [&>svg]:max-h-full"
              onClick={(e) => e.stopPropagation()}
              dangerouslySetInnerHTML={{ __html: svgContent }}
            />

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
