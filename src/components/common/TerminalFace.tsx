"use client";

import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface TerminalFaceProps {
  verb?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
}

interface FaceGlyphs {
  left: string;
  mid: string;
  right: string;
}

export default function TerminalFace({
  verb = "Thinking",
  className = "",
  size = "md",
}: TerminalFaceProps) {
  const [isBlinking, setIsBlinking] = useState(false);

  // Periodic organic micro-blink (120ms eyelid closure every 2.5-3.5s)
  useEffect(() => {
    let blinkTimeout: NodeJS.Timeout;
    let nextBlinkTimeout: NodeJS.Timeout;

    const scheduleNextBlink = () => {
      const delay = 2500 + Math.random() * 1200;
      nextBlinkTimeout = setTimeout(() => {
        setIsBlinking(true);
        blinkTimeout = setTimeout(() => {
          setIsBlinking(false);
          scheduleNextBlink();
        }, 120);
      }, delay);
    };

    scheduleNextBlink();

    return () => {
      clearTimeout(blinkTimeout);
      clearTimeout(nextBlinkTimeout);
    };
  }, []);

  // Compute 3-character face from active verb
  const glyphs: FaceGlyphs = useMemo(() => {
    const v = (verb || "").toLowerCase();

    // 1. Playful / Clauding
    if (v.includes("claud") || v.includes("noodl") || v.includes("boop") || v.includes("flibb")) {
      return { left: ">", mid: "_", right: "Q" };
    }

    // 2. Intake / Ingestion / Scanning
    if (v.includes("perus") || v.includes("deciph") || v.includes("pars") || v.includes("absorb") || v.includes("survey")) {
      return { left: "•", mid: "_", right: "•" };
    }

    // 3. Reasoning / Cognition
    if (v.includes("ponder") || v.includes("cogitat") || v.includes("ruminat") || v.includes("contemplat") || v.includes("mull")) {
      return { left: "?", mid: "_", right: "Q" };
    }

    // 4. Optimization / Math / Fermentation
    if (v.includes("brew") || v.includes("simmer") || v.includes("percolat") || v.includes("temper") || v.includes("baking")) {
      return { left: "*", mid: "_", right: "*" };
    }

    // 5. Synthesis / Code Generation / Architecture
    if (v.includes("synth") || v.includes("architect") || v.includes("forg") || v.includes("craft") || v.includes("assembl")) {
      return { left: ">", mid: "_", right: ">" };
    }

    // 6. Manifestation / Polishing
    if (v.includes("actual") || v.includes("manifest") || v.includes("polish") || v.includes("beam")) {
      return { left: "✦", mid: "_", right: "✦" };
    }

    // Default iconic terminal face
    return { left: ">", mid: "_", right: "Q" };
  }, [verb]);

  const sizeClasses = {
    sm: "text-[11px]",
    md: "text-xs",
    lg: "text-sm",
  }[size];

  const leftChar = isBlinking ? (glyphs.left === "•" || glyphs.left === "✦" ? "-" : glyphs.left) : glyphs.left;
  const midChar = isBlinking ? "-" : glyphs.mid;
  const rightChar = isBlinking ? "-" : glyphs.right;

  return (
    <span
      className={`inline-flex items-center font-mono font-bold select-none tracking-tight mr-1.5 ${sizeClasses} ${className}`}
      aria-hidden="true"
    >
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={`left-${leftChar}`}
          initial={{ y: 2, opacity: 0.7, scale: 0.9 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: -2, opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.15, ease: "easeOut" }}
          className="text-neutral-800 dark:text-neutral-200"
        >
          {leftChar}
        </motion.span>
      </AnimatePresence>

      <span className="text-neutral-500 dark:text-neutral-400 mx-[0.5px]">
        {midChar}
      </span>

      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={`right-${rightChar}-${isBlinking ? "blink" : "open"}`}
          initial={{ y: 2, opacity: 0.7, scale: 0.85 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: -2, opacity: 0, scale: 0.85 }}
          transition={{ duration: 0.15, ease: "easeOut" }}
          className="text-amber-500 dark:text-amber-400 drop-shadow-[0_0_6px_rgba(245,158,11,0.55)] font-extrabold"
        >
          {rightChar}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}
