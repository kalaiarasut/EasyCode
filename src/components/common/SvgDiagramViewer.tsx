"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Code2,
  Eye,
  Copy,
  Check,
  Download,
  Maximize2,
  X,
  FileCode,
  ZoomIn,
  ZoomOut,
  Scan,
} from "lucide-react";
import { toast } from "sonner";

export interface SvgDiagramViewerProps {
  svgCode: string;
  title?: string;
  className?: string;
}

export default function SvgDiagramViewer({
  svgCode,
  title = "Vector SVG Visualizer",
  className = "",
}: SvgDiagramViewerProps) {
  const [showCode, setShowCode] = useState<boolean>(false);
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState<boolean>(false);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const containerRef = useRef<HTMLDivElement>(null);

// Advanced SVG Layout & Text Collision Auto-Healer
function healSvgCollisions(svgString: string): string {
  if (typeof window === "undefined" || !svgString) return svgString;
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(svgString, "image/svg+xml");
    if (doc.querySelector("parsererror")) {
      return svgString;
    }

    const svgEl = doc.querySelector("svg");
    if (!svgEl) return svgString;

    const allTexts = Array.from(doc.querySelectorAll("text"));
    const allRects = Array.from(doc.querySelectorAll("rect"));

    // Find step headers ("Step 1", "Step 2", etc.)
    const stepHeaders = allTexts.filter((t) => /Step\s+\d+/i.test(t.textContent || ""));

    if (stepHeaders.length > 0) {
      let cumulativeExtraHeight = 0;

      stepHeaders.forEach((stepHeader, sIdx) => {
        const stepHeaderY = parseFloat(stepHeader.getAttribute("y") || "0");
        const nextStepHeaderY = stepHeaders[sIdx + 1]
          ? parseFloat(stepHeaders[sIdx + 1].getAttribute("y") || "99999")
          : 99999;

        // Collect all text elements belonging to this step
        const stepTexts = allTexts.filter((t) => {
          const y = parseFloat(t.getAttribute("y") || "0");
          return y >= stepHeaderY - 15 && y < nextStepHeaderY;
        });

        // Find condition/subtitle text
        const conditionText = stepTexts.find((t) =>
          /Condition:|Target|Narrow|Search range|Comparing/i.test(t.textContent || "")
        );

        // Find index labels: [0], [1], [2], etc.
        const indexTexts = stepTexts.filter((t) =>
          /^\[?\d+\]?$/.test(t.textContent?.trim() || "") && parseFloat(t.getAttribute("font-size") || "14") <= 12
        );

        if (conditionText && indexTexts.length > 0) {
          const condY = parseFloat(conditionText.getAttribute("y") || "0");
          const firstIndexY = parseFloat(indexTexts[0].getAttribute("y") || "0");

          // Collision detected if condition and indices are vertically within 28px!
          if (Math.abs(condY - firstIndexY) < 28) {
            const shiftAmount = 28;
            cumulativeExtraHeight += shiftAmount;

            // 1. Shift all index labels down
            indexTexts.forEach((it) => {
              const curY = parseFloat(it.getAttribute("y") || "0");
              it.setAttribute("y", String(curY + shiftAmount));
            });

            // 2. Shift all rects (cells, badges) in this step down
            const stepRects = allRects.filter((r) => {
              const y = parseFloat(r.getAttribute("y") || "0");
              const h = parseFloat(r.getAttribute("height") || "0");
              // Exclude outer background/card rects (height > 90)
              return y >= condY - 15 && y < nextStepHeaderY && h < 90;
            });

            stepRects.forEach((r) => {
              const curY = parseFloat(r.getAttribute("y") || "0");
              r.setAttribute("y", String(curY + shiftAmount));
            });

            // 3. Shift remaining text elements (cell numbers, pointer text LOW, MID, HIGH) down
            const otherTexts = stepTexts.filter(
              (t) => t !== stepHeader && t !== conditionText && !indexTexts.includes(t)
            );

            otherTexts.forEach((ot) => {
              const curY = parseFloat(ot.getAttribute("y") || "0");
              ot.setAttribute("y", String(curY + shiftAmount));
            });

            // 4. Expand step container card if present
            const stepCard = allRects.find((r) => {
              const y = parseFloat(r.getAttribute("y") || "0");
              const h = parseFloat(r.getAttribute("height") || "0");
              return y <= stepHeaderY && y + h >= condY && h >= 90;
            });
            if (stepCard) {
              const curH = parseFloat(stepCard.getAttribute("height") || "150");
              stepCard.setAttribute("height", String(curH + shiftAmount));
            }
          }
        }
      });

      // Expand viewBox height if cards were shifted
      if (cumulativeExtraHeight > 0) {
        const viewBox = svgEl.getAttribute("viewBox");
        if (viewBox) {
          const parts = viewBox.split(/[\s,]+/).map(Number);
          if (parts.length === 4) {
            svgEl.setAttribute(
              "viewBox",
              `${parts[0]} ${parts[1]} ${parts[2]} ${parts[3] + cumulativeExtraHeight + 20}`
            );
          }
        }
      }
    }

    return new XMLSerializer().serializeToString(doc);
  } catch (e) {
    return svgString;
  }
}

  // Extract clean SVG content and normalize for full responsive container display
  const cleanSvg = React.useMemo(() => {
    let raw = svgCode.trim();
    // Remove markdown code fences if present
    raw = raw.replace(/^```(?:xml|svg|html)?\s*/i, "").replace(/```\s*$/i, "").trim();
    // Extract everything from <svg to </svg>
    const match = raw.match(/<svg[\s\S]*?<\/svg>/i);
    let svgStr = match ? match[0] : raw;

    // Ensure viewBox exists if width/height are set
    if (!svgStr.includes("viewBox")) {
      const wMatch = svgStr.match(/width=["'](\d+)["']/i);
      const hMatch = svgStr.match(/height=["'](\d+)["']/i);
      if (wMatch && hMatch) {
        svgStr = svgStr.replace(/<svg\b/i, `<svg viewBox="0 0 ${wMatch[1]} ${hMatch[1]}" `);
      }
    }

    // Ensure responsive scaling without vertical runaway
    svgStr = svgStr
      .replace(/width=["'][^"']*["']/i, 'width="100%"')
      .replace(/height=["'][^"']*["']/i, 'height="auto"');

    if (!svgStr.includes("preserveAspectRatio")) {
      svgStr = svgStr.replace(/<svg\b/i, '<svg preserveAspectRatio="xMidYMid meet" ');
    }

    // Run DOM-based collision auto-healer
    svgStr = healSvgCollisions(svgStr);

    return svgStr;
  }, [svgCode]);

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

  // Auto-fit SVG to container width/height
  const handleAutoFit = () => {
    if (!containerRef.current) return;
    const svgEl = containerRef.current.querySelector("svg");
    if (!svgEl) return;
    const containerWidth = containerRef.current.clientWidth - 48;
    const containerHeight = 440;

    let svgWidth = 0;
    let svgHeight = 0;
    const viewBox = svgEl.getAttribute("viewBox");
    if (viewBox) {
      const parts = viewBox.split(/[\s,]+/).map(Number);
      if (parts.length === 4 && parts[2] > 0 && parts[3] > 0) {
        svgWidth = parts[2];
        svgHeight = parts[3];
      }
    }
    if (!svgWidth) {
      svgWidth = svgEl.clientWidth || parseFloat(svgEl.getAttribute("width") || "0");
      svgHeight = svgEl.clientHeight || parseFloat(svgEl.getAttribute("height") || "0");
    }

    if (svgWidth > 0 && containerWidth > 0) {
      const scaleX = containerWidth / svgWidth;
      const scaleY = containerHeight / (svgHeight || containerHeight);
      const fitScale = Math.min(scaleX, scaleY, 1);
      setZoomLevel(Math.max(0.35, Number(fitScale.toFixed(2))));
    }
  };

  useEffect(() => {
    // Immediate auto-fit calculation from viewBox in cleanSvg
    const viewBoxMatch = cleanSvg.match(/viewBox=["']([0-9.\s,-]+)["']/i);
    if (viewBoxMatch) {
      const parts = viewBoxMatch[1].trim().split(/[\s,]+/).map(Number);
      if (parts.length === 4 && parts[2] > 0 && parts[3] > 0) {
        const naturalW = parts[2];
        const naturalH = parts[3];
        const targetW = (containerRef.current?.clientWidth || 800) - 48;
        const targetH = 440;
        const fitScale = Math.min(targetW / naturalW, targetH / naturalH, 1);
        if (fitScale < 0.95) {
          setZoomLevel(Math.max(0.35, Number(fitScale.toFixed(2))));
        }
      }
    }
    const timer = setTimeout(handleAutoFit, 120);
    return () => clearTimeout(timer);
  }, [cleanSvg]);

  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 0.2, 2.5));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(prev - 0.2, 0.35));
  const handleResetZoom = () => setZoomLevel(1);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(cleanSvg);
      setIsCopied(true);
      toast.success("SVG code copied to clipboard");
      setTimeout(() => setIsCopied(false), 2000);
    } catch (e) {
      toast.error("Failed to copy SVG code");
    }
  };

  const handleDownload = () => {
    try {
      const blob = new Blob([cleanSvg], { type: "image/svg+xml;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const cleanTitle = title.slice(0, 30).replace(/[^a-zA-Z0-9]/g, "_").toLowerCase();
      a.download = `${cleanTitle || "vector_diagram"}_${Date.now()}.svg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("Downloaded SVG vector file");
    } catch (e) {
      toast.error("Failed to download SVG");
    }
  };

  return (
    <div
      ref={containerRef}
      className={`my-3 rounded-2xl overflow-hidden border border-[#DFDAD0] dark:border-[#383532] bg-[#FAF8F5] dark:bg-[#121212] shadow-sm transition-all ${className}`}
      style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif' }}
    >
      {/* Top Header Bar */}
      <div className="h-9 px-3.5 bg-black/[0.02] dark:bg-white/[0.02] border-b border-[#DFDAD0] dark:border-[#383532] flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 font-mono text-[11px] text-[#1C1B19] dark:text-[#EDEDEB] font-medium">
            <FileCode className="w-3.5 h-3.5 text-[#7A756C] dark:text-[#8C8880]" />
            <span>Vector Diagram</span>
          </div>
          <span className="text-black/20 dark:text-white/20">|</span>
          <span className="text-[11px] text-[#7A756C] dark:text-[#8C8880] truncate max-w-[260px]">
            {title}
          </span>
        </div>

        {/* Header Action Controls */}
        <div className="flex items-center gap-1">
          {/* Zoom Controls */}
          {!showCode && (
            <div className="flex items-center gap-0.5 mr-1 bg-black/[0.04] dark:bg-white/[0.06] rounded-lg p-0.5 border border-black/[0.04] dark:border-white/[0.06]">
              <button
                onClick={handleZoomOut}
                className="p-1 rounded text-neutral-500 hover:text-neutral-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer"
                title="Zoom Out"
              >
                <ZoomOut className="w-3 h-3" />
              </button>
              <button
                onClick={handleResetZoom}
                className="px-1.5 py-0.5 text-[10px] font-mono text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white transition-colors cursor-pointer"
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
              <button
                onClick={handleAutoFit}
                className="p-1 rounded text-neutral-500 hover:text-neutral-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer"
                title="Auto Fit to Screen"
              >
                <Scan className="w-3 h-3" />
              </button>
            </div>
          )}

          {/* Toggle Raw Code vs Visual Diagram */}
          <button
            type="button"
            onClick={() => setShowCode(!showCode)}
            className="p-1.5 rounded-lg text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition-colors cursor-pointer flex items-center gap-1"
            title={showCode ? "Show Visual Diagram" : "View Raw SVG Code"}
          >
            {showCode ? <Eye className="w-3.5 h-3.5" /> : <Code2 className="w-3.5 h-3.5" />}
          </button>

          {/* Copy SVG Code */}
          <button
            type="button"
            onClick={handleCopy}
            className="p-1.5 rounded-lg text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition-colors cursor-pointer"
            title="Copy SVG Code"
          >
            {isCopied ? <Check className="w-3.5 h-3.5 text-neutral-900 dark:text-white" /> : <Copy className="w-3.5 h-3.5" />}
          </button>

          {/* Download SVG */}
          <button
            type="button"
            onClick={handleDownload}
            className="p-1.5 rounded-lg text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition-colors cursor-pointer"
            title="Download SVG"
          >
            <Download className="w-3.5 h-3.5" />
          </button>

          {/* Fullscreen Lightbox */}
          <button
            type="button"
            onClick={() => setIsLightboxOpen(true)}
            className="p-1.5 rounded-lg text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition-colors cursor-pointer"
            title="Fullscreen Preview"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Canvas Body - Full Container Box */}
      <div className="relative w-full min-h-[260px] max-h-[640px] overflow-auto p-4 flex items-center justify-center select-none bg-black/[0.01] dark:bg-white/[0.01]">
        {showCode ? (
          <div className="w-full max-h-[440px] overflow-auto rounded-xl bg-[#141414] text-neutral-100 p-4 text-xs font-mono select-text leading-relaxed border border-white/10">
            <pre>
              <code>{cleanSvg}</code>
            </pre>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            style={{
              transform: `scale(${zoomLevel})`,
              transformOrigin: "center center",
              transition: "transform 0.15s ease-out",
            }}
            className="w-full flex items-center justify-center [&>svg]:w-full [&>svg]:max-w-full [&>svg]:max-h-[520px] [&>svg]:h-auto [&>svg]:block [&>svg]:rounded-xl"
            dangerouslySetInnerHTML={{ __html: cleanSvg }}
          />
        )}
      </div>

      {/* Fullscreen Lightbox Modal */}
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
                <span className="font-mono text-white font-medium uppercase">Vector SVG Canvas</span>
                <span className="text-neutral-500">|</span>
                <span className="truncate max-w-[400px] text-neutral-300">{title}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleDownload}
                  className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-medium flex items-center gap-1.5 cursor-pointer text-xs transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download SVG</span>
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

            {/* Modal Center Content */}
            <div
              className="flex-1 w-full max-h-[85vh] flex items-center justify-center p-4 overflow-auto [&>svg]:max-w-full [&>svg]:max-h-full"
              dangerouslySetInnerHTML={{ __html: cleanSvg }}
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
