"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";

export default function LandingNavbar() {
  const { theme, setTheme } = useTheme();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        isScrolled
          ? "py-3.5 bg-[#FBF9F4]/80 dark:bg-[#1C1B19]/80 backdrop-blur-xl border-b border-[#E8E4DB]/60 dark:border-[#2D2B28]/60 shadow-xs"
          : "py-6 bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 sm:px-8 flex items-center justify-between">
        
        {/* Brand Logo & Name */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-[#1C1B19] dark:bg-white flex items-center justify-center text-white dark:text-[#1C1B19] shadow-xs font-mono font-bold text-sm transition-transform group-hover:scale-105">
            E
          </div>
          <span className="font-sans text-xl font-bold tracking-tight text-[#1A1918] dark:text-[#F3F2F0]">
            EasyCode
          </span>
        </Link>

        {/* Right Cluster: Theme Switcher & Large Sign up Button */}
        <div className="flex items-center gap-3.5">
          
          {/* Theme Toggle Button */}
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="w-9 h-9 rounded-full flex items-center justify-center border border-[#DCD7CC] dark:border-[#3A3733] bg-white/60 dark:bg-white/[0.04] hover:bg-white dark:hover:bg-white/[0.08] text-[#4A4640] dark:text-[#C5C2BA] transition-colors"
            title="Toggle theme"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? <Sun className="w-4 h-4 text-neutral-200" /> : <Moon className="w-4 h-4 text-[#5A5650]" />}
          </button>

          {/* Large Sign up Button Matching Reference Image */}
          <Link
            href="/sign-up"
            className="inline-flex items-center gap-2 text-sm font-medium px-6 py-2.5 sm:px-7 sm:py-3 rounded-2xl border border-[#DDD6CB] dark:border-[#3D3A37] bg-[#ECE7DE] dark:bg-[#2A2725] text-[#1C1B19] dark:text-[#F3F2F0] hover:bg-[#E3DDD1] dark:hover:bg-[#34312E] transition-all shadow-xs cursor-pointer select-none"
          >
            <span>Sign up</span>
            <span className="text-sm font-sans font-normal text-neutral-700 dark:text-neutral-300">›</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
