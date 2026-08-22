"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";

interface KeyProps {
  label: string;
  variant: "orange" | "silver";
  isPressed: boolean;
  isPowered: boolean;
  onPress: () => void;
  onRelease: () => void;
}

function MechanicalKey({
  label,
  variant,
  isPressed,
  isPowered,
  onPress,
  onRelease,
}: KeyProps) {
  const isOrange = variant === "orange";

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={`Key ${label}`}
      onMouseDown={onPress}
      onMouseUp={onRelease}
      onMouseLeave={onRelease}
      onTouchStart={onPress}
      onTouchEnd={onRelease}
      className={`relative w-28 h-28 sm:w-36 sm:h-36 md:w-44 md:h-44 lg:w-48 lg:h-48 select-none cursor-pointer group transition-all duration-150 ease-out ${
        isPressed ? "translate-y-2 scale-[0.985]" : "hover:-translate-y-0.5 active:translate-y-2"
      }`}
      style={{ perspective: "1000px" }}
    >
      {/* 1. Recessed Keycap Base / Well Frame */}
      <div className="absolute inset-0 rounded-[20px] sm:rounded-[26px] md:rounded-[30px] bg-[#111114] shadow-[inset_0_5px_14px_rgba(0,0,0,0.95)] border border-[#27272A]/40" />

      {/* 2. Keycap Outer Skirt (Slanted 3D Walls) */}
      <div
        className={`absolute inset-1.5 sm:inset-2 md:inset-2.5 rounded-[16px] sm:rounded-[20px] md:rounded-[24px] p-2.5 sm:p-3.5 md:p-4.5 flex flex-col transition-all duration-150 ${
          isOrange
            ? isPowered
              ? "bg-gradient-to-b from-[#E04B0A] via-[#B83204] to-[#6E1C02]"
              : "bg-gradient-to-b from-[#8C2802] via-[#661800] to-[#3B0C00] opacity-85"
            : isPowered
            ? "bg-gradient-to-b from-[#E0E0E6] via-[#B2B2BC] to-[#5C5C66]"
            : "bg-gradient-to-b from-[#8E8E96] via-[#63636B] to-[#35353C] opacity-85"
        }`}
        style={{
          boxShadow: isPressed
            ? isOrange
              ? "0 2px 4px rgba(0,0,0,0.6), inset 0 1px 1px rgba(255,255,255,0.4)"
              : "0 2px 4px rgba(0,0,0,0.6), inset 0 1px 1px rgba(255,255,255,0.8)"
            : isOrange
            ? "0 10px 20px -2px rgba(0,0,0,0.7), 0 4px 8px rgba(0,0,0,0.5), inset 0 1.5px 2px rgba(255,255,255,0.5), inset 0 -4px 8px rgba(0,0,0,0.6)"
            : "0 10px 20px -2px rgba(0,0,0,0.7), 0 4px 8px rgba(0,0,0,0.5), inset 0 1.5px 2px rgba(255,255,255,0.9), inset 0 -4px 8px rgba(0,0,0,0.45)",
        }}
      >
        {/* 3. Keycap Scooped Dish (Top Typing Surface) */}
        <div
          className={`relative w-full h-full rounded-[10px] sm:rounded-[14px] md:rounded-[18px] p-2.5 sm:p-3.5 md:p-4 flex items-start justify-start transition-all duration-150 overflow-hidden ${
            isOrange
              ? isPowered
                ? "bg-gradient-to-br from-[#F15A10] via-[#DE3D00] to-[#8C2000]"
                : "bg-gradient-to-br from-[#9C3000] via-[#751B00] to-[#450A00]"
              : isPowered
              ? "bg-gradient-to-br from-[#ECECF0] via-[#C8C8D0] to-[#6E6E78]"
              : "bg-gradient-to-br from-[#A2A2AA] via-[#787880] to-[#404046]"
          }`}
          style={{
            boxShadow: isPressed
              ? isOrange
                ? "inset 0 6px 14px rgba(0,0,0,0.7), inset 0 2px 4px rgba(0,0,0,0.9)"
                : "inset 0 6px 14px rgba(0,0,0,0.55), inset 0 2px 4px rgba(0,0,0,0.8)"
              : isOrange
              ? "inset 0 4px 8px rgba(0,0,0,0.45), inset 0 -2px 5px rgba(255,255,255,0.25), 0 1.5px 3px rgba(0,0,0,0.4)"
              : "inset 0 4px 8px rgba(0,0,0,0.35), inset 0 -2px 5px rgba(255,255,255,0.6), 0 1.5px 3px rgba(0,0,0,0.3)",
          }}
        >
          {/* Top Bevel Specular Lighting */}
          <div
            className={`absolute top-0 inset-x-0 h-3 sm:h-4 pointer-events-none transition-opacity duration-150 ${
              isOrange
                ? isPowered
                  ? "bg-gradient-to-b from-white/35 to-transparent opacity-100"
                  : "bg-gradient-to-b from-white/15 to-transparent opacity-30"
                : isPowered
                ? "bg-gradient-to-b from-white/70 to-transparent opacity-100"
                : "bg-gradient-to-b from-white/30 to-transparent opacity-30"
            }`}
          />

          {/* Keycap Legend (Number) */}
          <span
            className={`relative z-10 text-2xl sm:text-3xl md:text-4xl lg:text-[42px] font-medium leading-none select-none tracking-tight font-sans transition-all duration-150 ${
              isOrange
                ? isPowered
                  ? "text-white drop-shadow-[0_1.5px_2px_rgba(0,0,0,0.45)]"
                  : "text-white/40 drop-shadow-[0_1px_1px_rgba(0,0,0,0.6)]"
                : isPowered
                ? "text-[#18181B] drop-shadow-[0_1px_0_rgba(255,255,255,0.7)]"
                : "text-[#18181B]/40 drop-shadow-[0_1px_0_rgba(255,255,255,0.2)]"
            }`}
          >
            {label}
          </span>
        </div>
      </div>
    </div>
  );
}

export default function MacropadNotFound() {
  const [isPluggedIn, setIsPluggedIn] = useState<boolean>(true);
  const [plugOffset, setPlugOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [pressedKey, setPressedKey] = useState<string | null>(null);
  const [showPowerNotice, setShowPowerNotice] = useState<boolean>(false);

  // Dynamic layout measurements
  const [layout, setLayout] = useState<{ socketX: number; socketY: number; containerW: number }>({
    socketX: 600,
    socketY: 180,
    containerW: 1200,
  });

  const portRef = useRef<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const lastSoundTimeRef = useRef<number>(0);
  const hasMovedRef = useRef<boolean>(false);

  const dragStartRef = useRef<{ startX: number; startY: number; initX: number; initY: number }>({
    startX: 0,
    startY: 0,
    initX: 0,
    initY: 0,
  });

  // Calculate exact position of the port relative to the whole container
  const updateLayout = useCallback(() => {
    if (!containerRef.current || !portRef.current) return;
    const containerRect = containerRef.current.getBoundingClientRect();
    const portRect = portRef.current.getBoundingClientRect();

    const socketX = portRect.left + portRect.width / 2 - containerRect.left;
    const socketY = portRect.top - containerRect.top;

    setLayout({
      socketX,
      socketY,
      containerW: containerRect.width,
    });
  }, []);

  useEffect(() => {
    updateLayout();
    window.addEventListener("resize", updateLayout);
    return () => window.removeEventListener("resize", updateLayout);
  }, [updateLayout]);

  // -------------------------------------------------------------
  // AUDIO SYNTHESIZER (Single clean real Mac Power Chime & Click)
  // -------------------------------------------------------------
  const getAudioContext = useCallback(() => {
    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      return AudioCtx ? new AudioCtx() : null;
    } catch {
      return null;
    }
  }, []);

  // 1. Real Mac Power Chime (Single trigger, debounced)
  const playMacPowerChime = useCallback(() => {
    const nowMs = Date.now();
    if (nowMs - lastSoundTimeRef.current < 250) return;
    lastSoundTimeRef.current = nowMs;

    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = "sine";
    osc1.frequency.setValueAtTime(523.25, now);
    gain1.gain.setValueAtTime(0, now);
    gain1.gain.linearRampToValueAtTime(0.24, now + 0.015);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.42);

    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = "sine";
    osc2.frequency.setValueAtTime(783.99, now + 0.045);
    gain2.gain.setValueAtTime(0, now + 0.045);
    gain2.gain.linearRampToValueAtTime(0.28, now + 0.06);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.55);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.045);
    osc2.stop(now + 0.58);
  }, [getAudioContext]);

  // 2. Real Mac Disconnect Sound (Single trigger, debounced)
  const playMacDisconnectSound = useCallback(() => {
    const nowMs = Date.now();
    if (nowMs - lastSoundTimeRef.current < 250) return;
    lastSoundTimeRef.current = nowMs;

    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(340, now);
    osc.frequency.exponentialRampToValueAtTime(140, now + 0.07);

    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.18, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.08);
  }, [getAudioContext]);

  // 3. Mechanical switch click (Only when plugged in)
  const playMechanicalClick = useCallback(
    (freq = 440) => {
      if (!isPluggedIn) return;
      const ctx = getAudioContext();
      if (!ctx) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.04);

      gain.gain.setValueAtTime(0.22, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.045);
    },
    [isPluggedIn, getAudioContext]
  );

  // Connect action
  const handleConnect = useCallback(() => {
    setIsPluggedIn(true);
    setPlugOffset({ x: 0, y: 0 });
    playMacPowerChime();
    setShowPowerNotice(false);
  }, [playMacPowerChime]);

  // Disconnect action
  const handleDisconnect = useCallback(() => {
    setIsPluggedIn(false);
    setPlugOffset({ x: -10, y: -50 });
    playMacDisconnectSound();
  }, [playMacDisconnectSound]);

  // Fast snappy pointer drag handling
  const handlePointerDown = (e: React.PointerEvent) => {
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    setIsDragging(true);
    hasMovedRef.current = false;
    dragStartRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initX: plugOffset.x,
      initY: plugOffset.y,
    };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    const dy = e.clientY - dragStartRef.current.startY;
    const dx = e.clientX - dragStartRef.current.startX;

    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
      hasMovedRef.current = true;
    }

    const newY = Math.min(6, Math.max(-100, dragStartRef.current.initY + dy));
    const newX = Math.max(-50, Math.min(50, dragStartRef.current.initX + dx * 0.5));

    setPlugOffset({ x: newX, y: newY });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDragging) return;
    setIsDragging(false);

    if (!hasMovedRef.current) {
      if (isPluggedIn) {
        handleDisconnect();
      } else {
        handleConnect();
      }
      return;
    }

    // Auto magnetic snap threshold (<= 8px)
    if (Math.abs(plugOffset.y) <= 8 && Math.abs(plugOffset.x) <= 12) {
      handleConnect();
    } else {
      setIsPluggedIn(false);
      setPlugOffset((prev) => ({ x: prev.x * 0.7, y: Math.min(-36, prev.y) }));
      playMacDisconnectSound();
    }
  };

  // Key press handlers
  const handleKeyPress = (keyId: string, freq = 440) => {
    setPressedKey(keyId);
    if (isPluggedIn) {
      playMechanicalClick(freq);
    } else {
      setShowPowerNotice(true);
      setTimeout(() => setShowPowerNotice(false), 2000);
    }
  };

  const handleKeyRelease = () => {
    setPressedKey(null);
  };

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return;
      if (e.key === "4") {
        handleKeyPress("left4", 440);
      } else if (e.key === "0") {
        handleKeyPress("zero", 380);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === "4" || e.key === "0") {
        handleKeyRelease();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [isPluggedIn]);

  // Unified Full-Width SVG Calculation:
  // Plug base center is docked at (socketX + plugOffset.x, socketY - 6 + plugOffset.y)
  const plugX = layout.socketX + plugOffset.x;
  const plugY = layout.socketY - 6 + plugOffset.y;
  const tipX = plugX;
  const tipY = plugY - 28;
  const W = layout.containerW || 1200;

  // The cable comes from the TOP-RIGHT (crossing the top border near the right corner),
  // descends smoothly across the screen, curves gracefully around the left side above the left '4' key,
  // and enters the top of the plug neck!
  const exitX = Math.min(W - 40, W * 0.9);
  const exitY = -12; // Exits through top border at the top-right
  const cablePathD = `M ${tipX} ${tipY} C ${tipX - 28} ${tipY - 35}, ${
    tipX - 150
  } ${tipY - 18}, ${tipX - 170} ${tipY - 55} C ${tipX - 190} ${tipY - 95}, ${
    exitX - 180
  } 45, ${exitX} ${exitY}`;

  return (
    <div
      ref={containerRef}
      className="relative w-full min-h-[calc(100vh-3.5rem)] flex flex-col items-center justify-center bg-[#F9F9FB] dark:bg-[#0B0B0E] px-4 py-8 overflow-hidden select-none"
    >
      {/* ------------------------------------------------------------- */}
      {/* 1. FULL-WIDTH SYNCHRONIZED SVG (CABLE + PLUG PHYSICALLY TIED) */}
      {/* ------------------------------------------------------------- */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none z-20 overflow-visible"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="magsafeBodyGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#38383E" />
            <stop offset="50%" stopColor="#242428" />
            <stop offset="100%" stopColor="#18181C" />
          </linearGradient>
        </defs>

        {/* Dynamic USB Cable coming directly from the top-right edge */}
        {/* Cable Outer Shadow */}
        <path
          d={cablePathD}
          fill="none"
          stroke="rgba(0,0,0,0.18)"
          strokeWidth="9"
          strokeLinecap="round"
          className={isDragging ? "" : "transition-all duration-150 ease-out"}
        />
        {/* Cable Dark Body */}
        <path
          d={cablePathD}
          fill="none"
          stroke="#27272C"
          strokeWidth="6"
          strokeLinecap="round"
          className={isDragging ? "" : "transition-all duration-150 ease-out"}
        />
        {/* Cable Subtle Highlight */}
        <path
          d={cablePathD}
          fill="none"
          stroke="#45454F"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeDasharray="6 10"
          className={`opacity-50 ${isDragging ? "" : "transition-all duration-150 ease-out"}`}
        />

        {/* Interactive Magnetic Plug Group */}
        <g
          transform={`translate(${plugX}, ${plugY}) rotate(${!isPluggedIn ? -4 : 0})`}
          className={`cursor-grab active:cursor-grabbing pointer-events-auto group ${
            isDragging ? "" : "transition-all duration-150 ease-out"
          }`}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
        >
          {/* Hit area for drag/click */}
          <rect
            x="-30"
            y="-34"
            width="60"
            height="48"
            fill="transparent"
            className="outline-none"
          />

          {/* Hover Tooltip Badge */}
          <g
            className="opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none"
            transform="translate(0, -42)"
          >
            <rect
              x="-66"
              y="-12"
              width="132"
              height="22"
              rx="11"
              fill="rgba(10, 10, 12, 0.88)"
              stroke="rgba(255, 255, 255, 0.15)"
              strokeWidth="0.8"
            />
            <text
              x="0"
              y="3"
              textAnchor="middle"
              fill="#FFFFFF"
              fontSize="10"
              fontWeight="500"
              fontFamily="system-ui, -apple-system, sans-serif"
            >
              {isPluggedIn ? "Click or drag to unplug" : "Click or drag to plug in"}
            </text>
          </g>

          {/* Strain-Relief Neck (Cable attaches at top tip: (0, -28)) */}
          <path
            d="M -6 -14 L -4 -28 Q 0 -30 4 -28 L 6 -14 Z"
            fill="#202024"
            stroke="#3F3F46"
            strokeWidth="0.8"
          />
          <line x1="-3" y1="-21" x2="3" y2="-21" stroke="#121215" strokeWidth="1.2" />

          {/* Main Metallic Plug Body */}
          <rect
            x="-16"
            y="-14"
            width="32"
            height="22"
            rx="4"
            fill="url(#magsafeBodyGrad)"
            stroke="#4B4B54"
            strokeWidth="1"
          />

          {/* Grip Ridges */}
          <line x1="-6" y1="-8" x2="-6" y2="-2" stroke="rgba(255,255,255,0.3)" strokeWidth="1.2" strokeLinecap="round" />
          <line x1="0" y1="-8" x2="0" y2="-2" stroke="rgba(255,255,255,0.3)" strokeWidth="1.2" strokeLinecap="round" />
          <line x1="6" y1="-8" x2="6" y2="-2" stroke="rgba(255,255,255,0.3)" strokeWidth="1.2" strokeLinecap="round" />

          {/* Golden Magnetic Pogo Pins */}
          <circle cx="-10" cy="5" r="1.5" fill="#F59E0B" />
          <circle cx="-5" cy="5" r="1.5" fill="#F59E0B" />
          <circle cx="0" cy="5" r="1.5" fill="#F59E0B" />
          <circle cx="5" cy="5" r="1.5" fill="#F59E0B" />
          <circle cx="10" cy="5" r="1.5" fill="#F59E0B" />
        </g>
      </svg>

      {/* ------------------------------------------------------------- */}
      {/* 2. MECHANICAL MACROPAD KEYBOARD ENCLOSURE                     */}
      {/* ------------------------------------------------------------- */}
      <div className="relative z-10 flex flex-col items-center mt-12 sm:mt-16 mb-8 sm:mb-10">
        {/* ----------------------------------------------------------- */}
        {/* 2a. KEYBOARD MAGNETIC DOCK PORT (REFERENCE ANCHOR)           */}
        {/* ----------------------------------------------------------- */}
        <div
          ref={portRef}
          onClick={() => {
            if (!isPluggedIn) handleConnect();
          }}
          className="relative z-10 -mt-1 mb-0 flex flex-col items-center cursor-pointer group"
          title="Magnetic Port — click to connect"
        >
          <div className="w-10 sm:w-12 h-3 bg-[#161619] rounded-t-sm border-t border-x border-[#3F3F46] flex items-center justify-center shadow-inner group-hover:border-[#F59E0B]/50 transition-colors">
            <div className="w-7 h-1 bg-[#09090B] rounded-xs flex items-center justify-around px-0.5">
              <div className="w-0.5 h-0.5 bg-[#D97706] rounded-full" />
              <div className="w-0.5 h-0.5 bg-[#D97706] rounded-full" />
              <div className="w-0.5 h-0.5 bg-[#D97706] rounded-full" />
              <div className="w-0.5 h-0.5 bg-[#D97706] rounded-full" />
            </div>
          </div>
        </div>

        {/* ----------------------------------------------------------- */}
        {/* 2b. MAIN KEYBOARD CHASSIS                                   */}
        {/* ----------------------------------------------------------- */}
        <div
          className="relative rounded-[32px] sm:rounded-[40px] md:rounded-[48px] p-3.5 sm:p-5 md:p-6.5 bg-gradient-to-b from-[#303036] via-[#242428] to-[#18181B] border-2 sm:border-[3px] border-[#44444C]/80 dark:border-[#2E2E36] transition-all duration-300"
          style={{
            boxShadow: isPluggedIn
              ? `
                0 38px 70px -10px rgba(0, 0, 0, 0.45),
                0 20px 32px -6px rgba(0, 0, 0, 0.35),
                0 8px 16px rgba(0, 0, 0, 0.25),
                inset 0 1.5px 2px rgba(255, 255, 255, 0.25),
                inset 0 -3px 6px rgba(0, 0, 0, 0.7)
              `
              : `
                0 25px 45px -10px rgba(0, 0, 0, 0.3),
                0 12px 20px -6px rgba(0, 0, 0, 0.2),
                inset 0 1px 1px rgba(255, 255, 255, 0.15),
                inset 0 -3px 6px rgba(0, 0, 0, 0.8)
              `,
          }}
        >
          {/* Inner Recessed Keyplate Area with 3 Mechanical Keys */}
          <div className="flex items-center gap-3 sm:gap-4.5 md:gap-6">
            {/* Left Key ("4") */}
            <MechanicalKey
              label="4"
              variant="orange"
              isPowered={isPluggedIn}
              isPressed={pressedKey === "left4"}
              onPress={() => handleKeyPress("left4", 440)}
              onRelease={handleKeyRelease}
            />

            {/* Middle Key ("0") */}
            <MechanicalKey
              label="0"
              variant="silver"
              isPowered={isPluggedIn}
              isPressed={pressedKey === "zero"}
              onPress={() => handleKeyPress("zero", 380)}
              onRelease={handleKeyRelease}
            />

            {/* Right Key ("4") */}
            <MechanicalKey
              label="4"
              variant="orange"
              isPowered={isPluggedIn}
              isPressed={pressedKey === "right4"}
              onPress={() => handleKeyPress("right4", 440)}
              onRelease={handleKeyRelease}
            />
          </div>
        </div>

        {/* Subtle Power Reminder when typing while unplugged */}
        <div
          className={`absolute -bottom-9 px-3.5 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 backdrop-blur-xs transition-all duration-200 pointer-events-none shadow-xs ${
            showPowerNotice ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-1"
          }`}
        >
          ⚡ Unplugged — click or drag cable to reconnect power!
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 3. HEADINGS & ACTION BUTTON (EXACT MATCH TO REFERENCE)        */}
      {/* ------------------------------------------------------------- */}
      <div className="relative z-10 flex flex-col items-center text-center max-w-2xl px-4 mt-2">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[#111827] dark:text-[#F3F4F6] mb-3 sm:mb-4">
          Page Not Found
        </h1>

        <p className="text-sm sm:text-base md:text-lg text-[#6B7280] dark:text-[#9CA3AF] font-normal leading-relaxed mb-7 sm:mb-9 max-w-xl">
          It seems the page you&apos;re looking for doesn&apos;t exist. Let&apos;s get you back on track.
        </p>

        <Link
          href="/"
          className="inline-flex items-center justify-center px-8 sm:px-9 py-3 sm:py-3.5 rounded-full text-xs sm:text-sm font-semibold text-white bg-[#0A0A0C] hover:bg-[#232326] active:scale-95 transition-all duration-150 shadow-md shadow-black/20 hover:shadow-lg dark:bg-white dark:text-black dark:hover:bg-neutral-200"
        >
          Back to Homepage
        </Link>
      </div>
    </div>
  );
}
