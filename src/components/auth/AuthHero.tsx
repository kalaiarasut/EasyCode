"use client";

import React from "react";
import DottedWaveCanvas from "./DottedWaveCanvas";
import { Sparkles } from "lucide-react";
import Link from "next/link";

export default function AuthHero() {
  return (
    <div className="relative w-full h-full min-h-[580px] lg:min-h-full rounded-[28px] lg:rounded-[36px] bg-[#f8f8fa] dark:bg-[#111114] border border-neutral-200/90 dark:border-neutral-800/80 overflow-hidden flex flex-col justify-between p-8 lg:p-12 select-none shadow-sm">
      {/* Animated Dotted Wave Canvas Background */}
      <DottedWaveCanvas />

      {/* Subtle radial lighting gradient */}
      <div className="absolute inset-0 pointer-events-none bg-radial from-transparent via-transparent to-black/[0.02] dark:to-white/[0.01]" />

      {/* Top Header & Brand */}
      <div className="relative z-10 flex flex-col">
        <Link href="/" className="inline-flex items-center gap-2.5 group w-fit">
          <div className="w-8 h-8 rounded-xl bg-neutral-900 dark:bg-white flex items-center justify-center text-white dark:text-neutral-900 shadow-md group-hover:scale-105 transition-transform">
            <Sparkles className="w-4 h-4" />
          </div>
          <span className="font-bold tracking-widest text-sm text-neutral-900 dark:text-white uppercase group-hover:opacity-80 transition-opacity">
            EASYCODE
          </span>
        </Link>
      </div>

      {/* Bottom Title */}
      <div className="relative z-10 pt-4">
        <h2 className="text-3xl lg:text-4xl xl:text-[44px] font-medium tracking-tight text-neutral-900 dark:text-white leading-[1.15]">
          One Click Away from<br />
          <span className="font-bold">Mastering Algorithms</span>
        </h2>
      </div>
    </div>
  );
}
