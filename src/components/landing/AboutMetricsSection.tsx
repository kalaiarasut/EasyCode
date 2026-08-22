"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { motion, useInView } from "framer-motion";
import { ArrowRight, Star, TrendingUp, Sparkles, Shield, Users, Check } from "lucide-react";

// Real high-frequency company interview tags from data-sources/1-company-tags
const COMPANY_LOGOS = [
  { name: "Google", domain: "google.com", tag: "640+ Problems" },
  { name: "Meta", domain: "meta.com", tag: "520+ Problems" },
  { name: "Amazon", domain: "amazon.com", tag: "780+ Problems" },
  { name: "Apple", domain: "apple.com", tag: "310+ Problems" },
  { name: "Microsoft", domain: "microsoft.com", tag: "490+ Problems" },
  { name: "ByteDance", domain: "bytedance.com", tag: "420+ Problems" },
  { name: "Netflix", domain: "netflix.com", tag: "190+ Problems" },
  { name: "Uber", domain: "uber.com", tag: "280+ Problems" },
  { name: "Stripe", domain: "stripe.com", tag: "210+ Problems" },
  { name: "Airbnb", domain: "airbnb.com", tag: "160+ Problems" },
  { name: "Bloomberg", domain: "bloomberg.com", tag: "350+ Problems" },
  { name: "Spotify", domain: "spotify.com", tag: "140+ Problems" }
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
    <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto font-sans">
      
      {/* TWO-COLUMN ABOUT & STAT LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mb-20">
        
        {/* Left Column: Editorial Headline & Social Proof */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/[0.04] dark:bg-white/[0.06] border border-black/[0.06] dark:border-white/[0.06] text-xs font-mono text-neutral-600 dark:text-neutral-300">
            <span>About EasyCode</span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-sans font-bold tracking-tight text-neutral-900 dark:text-white leading-[1.12]">
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

      {/* TRUSTED COMPANY INTERVIEW TAGS INFINITE MARQUEE */}
      <div className="pt-8 border-t border-[#E8E4DB] dark:border-[#2D2B28]">
        <div className="text-center mb-6">
          <p className="text-xs font-mono uppercase tracking-wider text-neutral-500">
            Practice curated interview question sets from leading tech companies
          </p>
        </div>

        {/* Marquee Container with pause on hover */}
        <div className="relative overflow-hidden w-full mask-gradient py-2">
          <div className="animate-marquee flex items-center gap-8 sm:gap-12">
            {[...COMPANY_LOGOS, ...COMPANY_LOGOS].map((company, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2.5 px-4 py-2 rounded-xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.04] dark:border-white/[0.06] hover:bg-black/[0.06] dark:hover:bg-white/[0.08] transition-colors shrink-0 group cursor-default"
              >
                <div className="w-5 h-5 rounded-md bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center text-[10px] font-bold text-neutral-700 dark:text-neutral-300">
                  {company.name.charAt(0)}
                </div>
                <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 group-hover:text-neutral-950 dark:group-hover:text-white transition-colors">
                  {company.name}
                </span>
                <span className="text-[10px] font-mono text-neutral-400 dark:text-neutral-500">
                  {company.tag}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
