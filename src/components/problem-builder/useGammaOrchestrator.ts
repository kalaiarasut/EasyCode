"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
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
  const [visibleSections, setVisibleSections] = useState<Set<GenerationSectionKey>>(new Set(["title"]));
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [speed, setSpeed] = useState<number>(initialSpeed);
  const [typewriterTitle, setTypewriterTitle] = useState<string>("");
  const [prefersReducedMotion, setPrefersReducedMotion] = useState<boolean>(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const typewriterTimerRef = useRef<NodeJS.Timeout | null>(null);
  const typedTitleForProblemRef = useRef<string | null>(null);
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
      title: 400,
      difficulty: 300,
      topics: 250,
      description: 600,
      constraints: 400,
      examples: 650,
      testCases: 500,
      edgeCases: 450,
      starterCode: 550,
      expectedComplexity: 300,
      hints: 350,
      followUp: 350,
    };
    const delay = baseDelays[sectionKey] || 400;
    return Math.max(70, Math.round(delay / currentSpeed));
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
      typedTitleForProblemRef.current = problem.title;
      if (onCompleteRef.current) onCompleteRef.current(problem);
    }
  }, [problem]);

  // Replay animation from beginning
  const replay = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (typewriterTimerRef.current) clearTimeout(typewriterTimerRef.current);

    typedTitleForProblemRef.current = null;
    setVisibleSections(new Set(["title"]));
    setCurrentStageIndex(0);
    setIsCompleted(false);
    setTypewriterTitle("");
    setIsPaused(false);
  }, []);

  // Single-run Title typewriter effect (prevent looping)
  useEffect(() => {
    if (!problem?.title) return;

    const fullTitle = problem.title;

    // If already typed this title, keep it locked
    if (typedTitleForProblemRef.current === fullTitle) {
      setTypewriterTitle(fullTitle);
      return;
    }

    if (speed >= 999 || prefersReducedMotion) {
      setTypewriterTitle(fullTitle);
      typedTitleForProblemRef.current = fullTitle;
      return;
    }

    let charIndex = 0;
    const stepInterval = Math.max(12, Math.round(30 / speed));

    const typeNextChar = () => {
      charIndex++;
      const partial = fullTitle.substring(0, charIndex);
      setTypewriterTitle(partial);
      if (charIndex < fullTitle.length) {
        typewriterTimerRef.current = setTimeout(typeNextChar, stepInterval);
      } else {
        typedTitleForProblemRef.current = fullTitle;
      }
    };

    typewriterTimerRef.current = setTimeout(typeNextChar, stepInterval);

    return () => {
      if (typewriterTimerRef.current) clearTimeout(typewriterTimerRef.current);
    };
  }, [problem?.title, speed, prefersReducedMotion]);

  // Main Choreography Sequencer
  useEffect(() => {
    if (!problem || !autoStart || isPaused || isCompleted) return;

    if (currentStageIndex >= GENERATION_SECTIONS.length) {
      setIsCompleted(true);
      if (onCompleteRef.current) onCompleteRef.current(problem);
      return;
    }

    const currentSection = GENERATION_SECTIONS[currentStageIndex];
    const delay = getSectionDelay(currentSection.key, speed);

    timerRef.current = setTimeout(() => {
      setVisibleSections((prev) => new Set([...Array.from(prev), currentSection.key]));
      setCurrentStageIndex((prev) => prev + 1);
    }, delay);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [problem, currentStageIndex, isPaused, isCompleted, speed, autoStart, getSectionDelay]);

  // Active Stage metadata
  const activeStageMeta = useMemo(() => {
    if (isCompleted || currentStageIndex >= GENERATION_SECTIONS.length) {
      return {
        key: "hints" as GenerationSectionKey,
        label: "Problem Built",
        description: "Algorithmic specification ready for solving",
        iconName: "CheckCircle",
        order: 13,
      };
    }
    return GENERATION_SECTIONS[currentStageIndex] || GENERATION_SECTIONS[0];
  }, [currentStageIndex, isCompleted]);

  const activeStageKey = activeStageMeta.key;

  const progressPercent = useMemo(() => {
    if (isCompleted) return 100;
    return Math.min(96, Math.round(((currentStageIndex + 1) / GENERATION_SECTIONS.length) * 100));
  }, [currentStageIndex, isCompleted]);

  const isSectionVisible = useCallback(
    (key: GenerationSectionKey): boolean => {
      return visibleSections.has(key) || isCompleted;
    },
    [visibleSections, isCompleted]
  );

  return {
    currentStageIndex,
    visibleSections,
    isCompleted,
    progressPercent,
    activeStageMeta,
    activeStageKey,
    speed,
    isPaused,
    typewriterTitle,
    setSpeed,
    skipToEnd,
    replay,
    togglePause: () => setIsPaused((prev) => !prev),
    isSectionVisible,
  };
}
