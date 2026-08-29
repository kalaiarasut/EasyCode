"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { motion, useInView } from "framer-motion";
import { Building2, Sparkles } from "lucide-react";

// Authentic Official Vector SVG Icons for Leading Tech Companies
function CompanyLogoSvg({ name }: { name: string }) {
  switch (name) {
    case "Google":
      return (
        <svg className="w-5 h-5" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z" />
          <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z" />
          <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z" />
          <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z" />
        </svg>
      );
    case "Meta":
      return (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#0081FB">
          <path d="M16.99 6.25c-1.87 0-3.52.88-4.99 2.45-1.47-1.57-3.12-2.45-4.99-2.45C3.06 6.25 0 9.37 0 13.37c0 4.19 3.32 7.38 7.37 7.38 2.01 0 3.79-.88 4.63-2.3 0 0 .73 1.25 1.58 1.83 1.01.69 2.09.47 3.41.47 4.05 0 7.01-3.19 7.01-7.38 0-4-3.06-7.12-7.01-7.12zm-9.62 12c-2.6 0-4.75-2.14-4.75-4.88 0-2.73 2.15-4.87 4.75-4.87 1.81 0 3.23 1.06 4.3 2.76-1.18 2.16-2.58 4.99-4.3 6.99zm9.62 0c-1.72-2-3.12-4.83-4.3-6.99 1.07-1.7 2.49-2.76 4.3-2.76 2.6 0 4.75 2.14 4.75 4.87 0 2.74-2.15 4.88-4.75 4.88z" />
        </svg>
      );
    case "Amazon":
      return (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
          <path
            d="M13.435 12.016c-.07-.33-.314-.54-.67-.54-.523 0-.839.39-.839 1.006 0 .644.341 1.006.84 1.006.374 0 .626-.23.669-.533v-.939zm-2.66-1.202c.428-.492 1.072-.77 1.819-.77 1.364 0 2.001.84 2.001 2.338v2.238c0 .259.07.37.28.37.112 0 .252-.04.385-.11.125-.07.223.03.167.17-.195.43-.572.71-1.076.71-.587 0-.923-.36-.923-1.03v-.34c-.377.78-1.187 1.43-2.14 1.43-1.272 0-2.154-.87-2.154-2.04 0-1.43 1.118-2.18 2.44-2.18.797 0 1.3.21 1.6.41v-.43c0-.9-.475-1.34-1.37-1.34-.63 0-1.16.27-1.538.66-.1.1-.195.06-.293-.06l-.784-.81c-.084-.1-.042-.18.07-.3z"
            fill="currentColor"
            className="text-neutral-900 dark:text-white"
          />
          <path
            d="M20.25 17.5c-2.13 1.6-5.18 2.43-7.87 2.43-3.75 0-7.12-1.4-9.67-3.74-.21-.2-.02-.47.23-.32 2.77 1.64 6.14 2.63 9.61 2.63 2.4 0 5.09-.59 7.5-1.84.37-.18.63.24.2.57z"
            fill="#FF9900"
          />
          <path
            d="M21.27 16.34c-.27-.35-1.8-.17-2.48-.08-.21.03-.24-.15-.05-.29 1.26-.88 3.32-.62 3.56-.32.25.3-.06 2.38-1.24 3.35-.18.15-.35.08-.27-.12.26-.67 1.61-2.2.48-2.54z"
            fill="#FF9900"
          />
        </svg>
      );
    case "Apple":
      return (
        <svg className="w-5 h-5 text-neutral-900 dark:text-white" viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.38c.62-.75 1.04-1.8 0.92-2.85-.9.04-1.99.6-2.61 1.34-.55.63-1.03 1.68-.9 2.7 1 .08 2.02-.48 2.59-1.19z" />
        </svg>
      );
    case "Microsoft":
      return (
        <svg className="w-5 h-5" viewBox="0 0 24 24">
          <rect x="2" y="2" width="9" height="9" fill="#F25022" rx="1" />
          <rect x="13" y="2" width="9" height="9" fill="#7FBA00" rx="1" />
          <rect x="2" y="13" width="9" height="9" fill="#00A4EF" rx="1" />
          <rect x="13" y="13" width="9" height="9" fill="#FFB900" rx="1" />
        </svg>
      );
    case "NVIDIA":
      return (
        <svg className="w-5 h-5 text-[#76B900]" viewBox="0 0 24 24" fill="currentColor">
          <path d="M9.167 9.866c0-.98.795-1.775 1.775-1.775 1.753 0 2.57 1.464 2.57 1.464s-.846 1.416-2.57 1.416c-.98 0-1.775-.795-1.775-1.7-.105.006-.105-.405 0-.405zm1.775-2.902c-2.548 0-4.606 2.058-4.606 4.606 0 2.548 2.058 4.606 4.606 4.606 2.176 0 4.417-1.379 5.228-3.686.14-.39-.156-.763-.56-.763h-.144c-.276 0-.517.172-.588.435-.542 1.924-2.304 3.03-3.936 3.03-1.81 0-3.27-1.46-3.27-3.27 0-1.81 1.46-3.27 3.27-3.27 1.507 0 2.78.917 3.2 2.22.072.227.28.381.518.381h.11c.351 0 .613-.321.524-.66-.82-2.18-2.67-3.629-4.882-3.629zm-.167-2.902C5.64 4.062 1.5 8.202 1.5 13.337c0 5.135 4.14 9.275 9.275 9.275 4.35 0 8.682-2.923 9.948-6.98.156-.474-.216-.948-.716-.948h-.16c-.33 0-.616.208-.732.518-1.188 3.39-5.064 5.568-8.685 5.568-4.14 0-7.42-3.28-7.42-7.42 0-4.14 3.28-7.42 7.42-7.42 3.62 0 6.78 2.008 8.16 5.11.12.27.38.44.68.44h.15c.46 0 .76-.48.57-.9C18.66 6.55 14.88 4.062 10.775 4.062z" />
        </svg>
      );
    case "ByteDance":
      return (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
          <rect x="3" y="10" width="3.5" height="10" rx="1.75" fill="#3C8CFF" />
          <rect x="8.5" y="4" width="3.5" height="16" rx="1.75" fill="#00C4CC" />
          <rect x="14" y="8" width="3.5" height="12" rx="1.75" fill="#3C8CFF" />
          <rect x="19.5" y="12" width="3.5" height="8" rx="1.75" fill="#00C4CC" />
        </svg>
      );
    case "Netflix":
      return (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
          <path d="M5.5 3v18h3.5v-10.5l6.5 10.5h3.5v-18h-3.5v10.5l-6.5-10.5z" fill="#E50914" />
        </svg>
      );
    case "Uber":
      return (
        <svg className="w-5 h-5 text-neutral-900 dark:text-white" viewBox="0 0 24 24" fill="currentColor">
          <path d="M4 4.5v9.5c0 4.14 3.36 7.5 7.5 7.5s7.5-3.36 7.5-7.5V4.5h-3.8v9.5c0 2.04-1.66 3.7-3.7 3.7s-3.7-1.66-3.7-3.7V4.5H4z" />
        </svg>
      );
    case "Spotify":
      return (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#1ED760">
          <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
        </svg>
      );
    case "Stripe":
      return (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#635BFF">
          <path d="M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.683-1.305 1.901-1.305 2.227 0 4.515.858 6.09 1.631l.89-5.494C18.252.975 15.697 0 12.165 0 9.667 0 7.589.654 6.104 1.872 4.56 3.147 3.757 4.992 3.757 7.218c0 4.039 2.467 5.76 6.476 7.219 2.585.92 3.445 1.574 3.445 2.583 0 .98-.84 1.545-2.354 1.545-1.875 0-4.965-.921-6.99-2.109l-.9 5.555C5.175 22.99 8.385 24 11.714 24c2.641 0 4.843-.624 6.328-1.813 1.664-1.305 2.525-3.236 2.525-5.732 0-4.128-2.524-5.851-6.591-7.305z"/>
        </svg>
      );
    case "Airbnb":
      return (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#FF5A5F">
          <path d="M12.001 0C8.508 0 5.48 2.051 4.542 5.093c-.927 3.013.144 6.702 2.766 10.963 1.368 2.222 2.977 4.521 4.693 6.944.382.538 1.157.538 1.539 0 1.716-2.423 3.325-4.722 4.693-6.944 2.622-4.261 3.693-7.95 2.766-10.963C18.522 2.051 15.494 0 12.001 0zm0 14.5c-1.381 0-2.5-1.119-2.5-2.5s1.119-2.5 2.5-2.5 2.5 1.119 2.5 2.5-1.119 2.5-2.5 2.5z"/>
        </svg>
      );
    case "Bloomberg":
      return (
        <svg className="w-5 h-5 text-neutral-900 dark:text-white" viewBox="0 0 24 24" fill="currentColor">
          <path d="M4 3h7.5c2.5 0 4.5 1.5 4.5 3.8 0 1.6-.9 2.9-2.2 3.4 1.8.5 3.2 2 3.2 4 0 2.6-2.2 4.8-4.8 4.8H4V3zm3.8 3.2v3.6h3.4c1 0 1.8-.8 1.8-1.8s-.8-1.8-1.8-1.8H7.8zm0 6.6V16h3.8c1.1 0 2-.9 2-2s-.9-2-2-2H7.8z" />
        </svg>
      );
    case "LinkedIn":
      return (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#0A66C2">
          <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 8.76a1.64 1.64 0 0 0 1.64-1.64c0-.91-.73-1.64-1.64-1.64s-1.64.73-1.64 1.64c0 .91.73 1.64 1.64 1.64m1.39 9.74v-8.37H5.07v8.37h2.78z" />
        </svg>
      );
    case "Adobe":
      return (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#FF0000">
          <path d="M13.966 22h3.044L12.005 9.878 7.034 22h3.044l1.927-4.79h1.961zm-4.96-12L4.022 22H0L8.006 2.5zm6.002 0L20 22h3.978L15.994 2.5z" />
        </svg>
      );
    case "Oracle":
      return (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#F80000">
          <path d="M16.5 4.5h-9C3.36 4.5 0 7.86 0 12s3.36 7.5 7.5 7.5h9c4.14 0 7.5-3.36 7.5-7.5s-3.36-7.5-7.5-7.5zm-.4 10.5H7.9c-1.66 0-3-1.34-3-3s1.34-3 3-3h8.2c1.66 0 3 1.34 3 3s-1.34 3-3 3z"/>
        </svg>
      );
    default:
      return <Building2 className="w-5 h-5 text-amber-500" />;
  }
}

// Track 1: Global Tech Leaders & FAANG
const COMPANY_LOGOS_ROW1 = [
  { name: "Google", tag: "1,400+ Problems" },
  { name: "Amazon", tag: "1,500+ Problems" },
  { name: "Meta", tag: "1,100+ Problems" },
  { name: "Microsoft", tag: "800+ Problems" },
  { name: "Bloomberg", tag: "650+ Problems" },
  { name: "ByteDance", tag: "600+ Problems" },
  { name: "Apple", tag: "500+ Problems" },
  { name: "Uber", tag: "400+ Problems" },
];

// Track 2: High-Growth Fintech, Unicorns & Enterprise
const COMPANY_LOGOS_ROW2 = [
  { name: "Adobe", tag: "350+ Problems" },
  { name: "Oracle", tag: "320+ Problems" },
  { name: "LinkedIn", tag: "300+ Problems" },
  { name: "NVIDIA", tag: "260+ Problems" },
  { name: "Stripe", tag: "210+ Problems" },
  { name: "Netflix", tag: "190+ Problems" },
  { name: "Airbnb", tag: "160+ Problems" },
  { name: "Spotify", tag: "140+ Problems" },
];

export default function AboutMetricsSection() {
  const statRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(statRef, { once: true, margin: "-100px" });

  const [counter, setCounter] = useState(0);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);

  // Animated counting up to 40%
  useEffect(() => {
    if (!isInView) return;

    let start = 0;
    const end = 40;
    const duration = 1200; // 1.2s
    const stepTime = duration / end;

    const timer = setInterval(() => {
      start += 1;
      setCounter(start);
      if (start >= end) {
        clearInterval(timer);
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [isInView]);

  // Subtle 3D tilt on mouse hover
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!statRef.current) return;
    const rect = statRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    setRotateX(-y * 0.04);
    setRotateY(x * 0.04);
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
  };

  return (
    <section className="pt-16 sm:pt-20 pb-4 sm:pb-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto font-sans">
      
      {/* TWO-COLUMN ABOUT & STAT LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mb-16">
        
        {/* Left Column: Editorial Headline & Social Proof */}
        <div className="lg:col-span-7 space-y-6">
          <div className="text-xs sm:text-[13px] font-sans font-semibold text-neutral-950 dark:text-white tracking-wide">
            About EasyCode
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-sans font-bold tracking-tight text-neutral-950 dark:text-white leading-[1.12]">
            Experience intelligent engineering as EasyCode transforms your workflow,{" "}
            <span className="font-serif italic font-normal text-[#38332B] dark:text-[#E8E4DB]">
              turning complex algorithmic puzzles into accepted submissions.
            </span>
          </h2>

          <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400 max-w-xl leading-relaxed font-normal">
            Designed for engineers, students, and competitive programmers. EasyCode integrates VS Code's Monaco Editor, multi-language JudgeAPI sandbox execution, and 20+ frontier AI models into a distraction-free learning environment.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-4">
            <Link
              href="/problems"
              className="group px-6 py-3 rounded-full bg-[#1C1B19] text-white dark:bg-white dark:text-[#1C1B19] text-xs sm:text-sm font-medium hover:opacity-90 transition-all shadow-sm flex items-center gap-2 cursor-pointer"
            >
              <span>Explore Problem Catalog</span>
              <span className="transition-transform group-hover:translate-x-0.5">›</span>
            </Link>

            {/* Avatar Cluster */}
            <div className="flex items-center gap-3">
              <div className="flex -space-x-2">
                <div className="w-8 h-8 rounded-full bg-amber-600 text-white font-bold text-xs flex items-center justify-center border-2 border-white dark:border-[#1C1B19]">
                  A
                </div>
                <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center border-2 border-white dark:border-[#1C1B19]">
                  D
                </div>
                <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center border-2 border-white dark:border-[#1C1B19]">
                  S
                </div>
                <div className="w-8 h-8 rounded-full bg-purple-600 text-white font-bold text-xs flex items-center justify-center border-2 border-white dark:border-[#1C1B19]">
                  M
                </div>
              </div>
              <div className="text-xs text-neutral-600 dark:text-neutral-400">
                <strong className="text-neutral-900 dark:text-white font-semibold">18,000+</strong> developers practicing daily
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Floating 3D Parallax Stat Card */}
        <div className="lg:col-span-5 flex justify-center">
          <div
            ref={statRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{
              transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
              transition: "transform 0.15s ease-out",
            }}
            className="w-full max-w-md rounded-2xl bg-[#1C1B19] text-white p-7 sm:p-8 shadow-2xl border border-white/[0.1] relative overflow-hidden group cursor-pointer"
          >
            {/* Top Traffic Light Indicator */}
            <div className="flex items-center gap-1.5 mb-6">
              <span className="w-2.5 h-2.5 rounded-full bg-red-400 inline-block" />
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-400 inline-block" />
              <span className="w-2.5 h-2.5 rounded-full bg-green-400 inline-block" />
            </div>

            {/* Background Texture & Warm Glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 via-transparent to-black/80 pointer-events-none" />
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-amber-400/10 rounded-full blur-2xl pointer-events-none" />

            <div className="relative z-10 space-y-4">
              {/* Stat Number */}
              <div className="space-y-1">
                <div className="text-5xl sm:text-6xl font-sans font-bold tracking-tight text-white flex items-baseline gap-1">
                  <span>{counter}%</span>
                </div>
                <h3 className="text-lg font-semibold text-amber-300">
                  Faster Problem Mastery
                </h3>
              </div>

              <p className="text-xs text-neutral-300 leading-relaxed font-normal">
                Developers practicing on EasyCode understand edge cases, refactor time complexities, and clear coding interview benchmarks 40% faster.
              </p>

              {/* Sub Metrics Strip */}
              <div className="pt-4 border-t border-white/[0.1] grid grid-cols-2 gap-3 text-[11px] font-mono text-neutral-400">
                <div>
                  <span className="text-white font-semibold">3,500+</span> Problems
                </div>
                <div>
                  <span className="text-white font-semibold">5</span> Languages (C, C++, Java, Py, JS)
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════════════════
          TRUSTED COMPANY INTERVIEW CURATION — SEAMLESS MARQUEE SHOWCASE
          ════════════════════════════════════════════════════════════════════════ */}
      <div className="mt-12 sm:mt-16 mb-4 space-y-8">
        
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <div className="text-xs sm:text-[13px] font-sans font-semibold text-neutral-950 dark:text-white tracking-wide">
            Targeted Interview Question Sets
          </div>
          <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
            Curated by leading tech companies & tier-1 recruiters
          </h3>
          <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 font-normal">
            Master the most frequently asked questions tagged by company, frequency, and difficulty.
          </p>
        </div>

        {/* Dual-Track Marquee with Edge Gradient Blur Masks */}
        <div className="relative overflow-hidden w-full py-2 space-y-4">
          
          {/* Left & Right Gradient Fades */}
          <div className="pointer-events-none absolute inset-y-0 left-0 w-24 sm:w-44 bg-gradient-to-r from-[#FBF9F4] dark:from-[#1C1B19] to-transparent z-10" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-24 sm:w-44 bg-gradient-to-l from-[#FBF9F4] dark:from-[#1C1B19] to-transparent z-10" />

          {/* Track 1: Flowing Left */}
          <div className="animate-marquee flex items-center gap-4 sm:gap-6">
            {[...COMPANY_LOGOS_ROW1, ...COMPANY_LOGOS_ROW1].map((company, idx) => (
              <Link
                key={`row1-${idx}`}
                href="/problems"
                className="flex items-center gap-3.5 px-5 py-3 rounded-2xl bg-white dark:bg-[#181715] border border-[#E8E4DB] dark:border-[#33302C] shadow-xs hover:shadow-md hover:border-amber-500/40 hover:-translate-y-0.5 transition-all shrink-0 group select-none cursor-pointer"
              >
                <div className="w-9 h-9 rounded-xl bg-neutral-100 dark:bg-white/[0.06] border border-black/[0.04] dark:border-white/[0.06] flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
                  <CompanyLogoSvg name={company.name} />
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-sm font-bold text-neutral-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                    {company.name}
                  </span>
                  <span className="text-[11px] font-mono font-medium text-neutral-500 dark:text-neutral-400">
                    {company.tag}
                  </span>
                </div>
              </Link>
            ))}
          </div>

          {/* Track 2: Flowing Right (Reverse) */}
          <div className="animate-marquee-reverse flex items-center gap-4 sm:gap-6">
            {[...COMPANY_LOGOS_ROW2, ...COMPANY_LOGOS_ROW2].map((company, idx) => (
              <Link
                key={`row2-${idx}`}
                href="/problems"
                className="flex items-center gap-3.5 px-5 py-3 rounded-2xl bg-white dark:bg-[#181715] border border-[#E8E4DB] dark:border-[#33302C] shadow-xs hover:shadow-md hover:border-amber-500/40 hover:-translate-y-0.5 transition-all shrink-0 group select-none cursor-pointer"
              >
                <div className="w-9 h-9 rounded-xl bg-neutral-100 dark:bg-white/[0.06] border border-black/[0.04] dark:border-white/[0.06] flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
                  <CompanyLogoSvg name={company.name} />
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-sm font-bold text-neutral-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                    {company.name}
                  </span>
                  <span className="text-[11px] font-mono font-medium text-neutral-500 dark:text-neutral-400">
                    {company.tag}
                  </span>
                </div>
              </Link>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}
