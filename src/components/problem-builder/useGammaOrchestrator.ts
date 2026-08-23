"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { GeneratedProblem, GenerationSectionKey, GENERATION_SECTIONS } from "@/types/generatedProblem";

interface UseGammaOrchestratorProps {
  problem: GeneratedProblem | null;
  isGenerating: boolean;
  initialSpeed?: number; // 0.5, 1, 2, or 999 (instant)
  onComplete?: (problem: GeneratedProblem) => void;
  autoStart?: boolean;
}

export function useGammaOrchestrator({
  problem,
  isGenerating,
  initialSpeed = 1,
  onComplete,
  autoStart = true,
}: UseGammaOrchestratorProps) {
  const [currentStageIndex, setCurrentStageIndex] = useState<number>(0);
  const [visibleSections, setVisibleSections] = useState<Set<GenerationSectionKey>>(new Set());
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [speed, setSpeed] = useState<number>(initialSpeed);
  const [typewriterTitle, setTypewriterTitle] = useState<string>("");
  const [prefersReducedMotion, setPrefersReducedMotion] = useState<boolean>(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const typewriterTimerRef = useRef<NodeJS.Timeout | null>(null);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  // Check for reduced motion preferences
  useEffect(() => {
    if (typeof window !== "undefined") {
      const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
      setPrefersReducedMotion(mediaQuery.matches);
      const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
      mediaQuery.addEventListener("change", handler);
      return () => mediaQuery.removeEventListener("change", handler);
    }
  }, []);

  // Base timings in milliseconds per section
  const getSectionDelay = useCallback((sectionKey: GenerationSectionKey, currentSpeed: number): number => {
    if (currentSpeed >= 999 || prefersReducedMotion) return 10;
    const baseDelays: Record<GenerationSectionKey, number> = {
      title: 500,
      difficulty: 350,
      topics: 300,
      description: 600,
      constraints: 400,
      examples: 750,
      testCases: 550,
      edgeCases: 500,
      starterCode: 600,
      expectedComplexity: 350,
      hints: 450,
      followUp: 400,
    };
    const delay = baseDelays[sectionKey] || 450;
    return Math.max(80, Math.round(delay / currentSpeed));
  }, [prefersReducedMotion]);

  // Fast skip to complete
  const skipToEnd = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (typewriterTimerRef.current) clearTimeout(typewriterTimerRef.current);

    const allSections = new Set<GenerationSectionKey>(GENERATION_SECTIONS.map((s) => s.key));
    setVisibleSections(allSections);
    setCurrentStageIndex(GENERATION_SECTIONS.length);
    setIsCompleted(true);
    if (problem) {
      setTypewriterTitle(problem.title);
      if (onCompleteRef.current) onCompleteRef.current(problem);
    }
  }, [problem]);

  // Replay animation from beginning
  const replay = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (typewriterTimerRef.current) clearTimeout(typewriterTimerRef.current);

    setVisibleSections(new Set());
    setCurrentStageIndex(0);
    setIsCompleted(false);
    setTypewriterTitle("");
    setIsPaused(false);
  }, []);

  // Title typewriter effect
  useEffect(() => {
    if (!problem || !visibleSections.has("title")) return;

    const fullTitle = problem.title;
    if (speed >= 999 || prefersReducedMotion) {
      setTypewriterTitle(fullTitle);
      return;
    }

    let charIndex = 0;
    const stepInterval = Math.max(12, Math.round(35 / speed));

    const typeNextChar = () => {
      charIndex++;
      setTypewriterTitle(fullTitle.substring(0, charIndex));
      if (charIndex < fullTitle.length) {
        typewriterTimerRef.current = setTimeout(typeNextChar, stepInterval);
      }
    };

    typewriterTimerRef.current = setTimeout(typeNextChar, stepInterval);

    return () => {
      if (typewriterTimerRef.current) clearTimeout(typewriterTimerRef.current);
    };
  }, [problem, visibleSections, speed, prefersReducedMotion]);

  // Progressive Section Progression Choreography
  useEffect(() => {
    if (!problem || isCompleted || isPaused || !autoStart) return;

    if (prefersReducedMotion || speed >= 999) {
      skipToEnd();
      return;
    }

    if (currentStageIndex >= GENERATION_SECTIONS.length) {
      setIsCompleted(true);
      if (onCompleteRef.current) onCompleteRef.current(problem);
      return;
    }

    const currentMeta = GENERATION_SECTIONS[currentStageIndex];
    const delay = getSectionDelay(currentMeta.key, speed);

    timerRef.current = setTimeout(() => {
      setVisibleSections((prev) => new Set([...prev, currentMeta.key]));
      setCurrentStageIndex((prev) => prev + 1);
    }, delay);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [problem, currentStageIndex, isCompleted, isPaused, speed, autoStart, getSectionDelay, prefersReducedMotion, skipToEnd]);

  const progressPercent = Math.min(100, Math.round((currentStageIndex / GENERATION_SECTIONS.length) * 100));
  const activeStageMeta = GENERATION_SECTIONS[Math.min(currentStageIndex, GENERATION_SECTIONS.length - 1)];

  return {
    currentStageIndex,
    isCompleted,
    isGenerating,
    isPaused,
    speed,
    progressPercent,
    activeStageMeta,
    visibleSections,
    typewriterTitle,
    prefersReducedMotion,
    setSpeed,
    skipToEnd,
    replay,
    togglePause: () => setIsPaused((prev) => !prev),
    isSectionVisible: (key: GenerationSectionKey) => visibleSections.has(key),
  };
}
