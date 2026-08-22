"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Github, Twitter, Linkedin, Youtube, Instagram, Send } from "lucide-react";

export default function LandingFooter() {
  return (
    <footer className="relative bg-[#141312] text-neutral-300 pt-20 pb-12 overflow-hidden border-t border-white/[0.08] font-sans">
      
      {/* Subtle Mountain Landscape Silhouette Texture at bottom */}
      <div className="absolute bottom-0 inset-x-0 h-80 pointer-events-none opacity-20 -z-0">
        <svg
          className="w-full h-full object-cover object-bottom"
          viewBox="0 0 1440 320"
          fill="none"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M0 160L160 110L360 190L600 90L840 180L1080 100L1280 170L1440 130V320H0V160Z"
            fill="white"
            opacity="0.3"
          />
          <path
            d="M0 220L200 170L440 240L720 150L960 230L1200 160L1440 210V320H0V220Z"
            fill="white"
            opacity="0.5"
          />
        </svg>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Main Footer Columns */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 pb-16 border-b border-white/[0.08]">
          
          {/* Left Column: Brand, Tagline, & CTA */}
          <div className="md:col-span-5 space-y-6">
            <Link href="/" className="flex items-center gap-2.5 group inline-flex">
              <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-[#141312] shadow-sm font-mono font-bold text-sm">
                E
              </div>
              <span className="font-sans text-xl font-bold tracking-tight text-white">
                EasyCode<span className="text-amber-400 font-normal">.ai</span>
              </span>
            </Link>

            <h3 className="text-2xl sm:text-3xl font-sans font-medium text-white max-w-sm leading-snug">
              Code with the calm of a{" "}
              <span className="font-serif italic font-normal text-amber-200/90">
                goodmorning.
              </span>
            </h3>

            <div>
              <Link
                href="/problems"
                className="group px-6 py-2.5 rounded-full bg-white text-[#141312] text-xs font-semibold hover:bg-neutral-100 transition-colors inline-flex items-center gap-2 shadow-sm cursor-pointer"
              >
                <span>Start practicing free</span>
                <span className="transition-transform group-hover:translate-x-0.5">›</span>
              </Link>
            </div>

            <p className="text-[11px] font-mono text-neutral-500 pt-2">
              © 2026 EasyCode • Crafted by Avijit Hira & contributors.
            </p>
          </div>

          {/* Right Navigation Columns */}
          <div className="md:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-8 text-xs">
            
            {/* Product Column */}
            <div className="space-y-3">
              <h4 className="font-mono text-[11px] uppercase tracking-wider text-neutral-400 font-semibold">
                Platform
              </h4>
              <ul className="space-y-2.5 text-neutral-400">
                <li>
                  <Link href="/problems" className="hover:text-white transition-colors">
                    3,500+ Problem Catalog
                  </Link>
                </li>
                <li>
                  <Link href="/workspace" className="hover:text-white transition-colors">
                    AI Algorithmic Workspace
                  </Link>
                </li>
                <li>
                  <Link href="/solution" className="hover:text-white transition-colors">
                    Community Solutions Hub
                  </Link>
                </li>
                <li>
                  <Link href="/problems" className="hover:text-white transition-colors">
                    Monaco JudgeAPI Runner
                  </Link>
                </li>
                <li>
                  <Link href="/workspace?view=settings" className="hover:text-white transition-colors">
                    Settings & BYOK Keys
                  </Link>
                </li>
              </ul>
            </div>

            {/* Resources Column */}
            <div className="space-y-3">
              <h4 className="font-mono text-[11px] uppercase tracking-wider text-neutral-400 font-semibold">
                Resources
              </h4>
              <ul className="space-y-2.5 text-neutral-400">
                <li>
                  <Link href="/about" className="hover:text-white transition-colors">
                    About Creator (Avijit)
                  </Link>
                </li>
                <li>
                  <Link href="/problems" className="hover:text-white transition-colors">
                    Company Tag Collections
                  </Link>
                </li>
                <li>
                  <Link href="/about" className="hover:text-white transition-colors">
                    Architecture & Benchmarks
                  </Link>
                </li>
                <li>
                  <Link href="/solution" className="hover:text-white transition-colors">
                    LaTeX Markdown Editorials
                  </Link>
                </li>
                <li>
                  <Link href="/about" className="hover:text-white transition-colors">
                    MIT Open Source License
                  </Link>
                </li>
              </ul>
            </div>

            {/* Social / Developers Column */}
            <div className="space-y-3 col-span-2 sm:col-span-1">
              <h4 className="font-mono text-[11px] uppercase tracking-wider text-neutral-400 font-semibold">
                Connect
              </h4>
              <ul className="space-y-2.5 text-neutral-400">
                <li>
                  <a href="https://github.com/Avijit200318/" target="_blank" rel="noreferrer" className="hover:text-white transition-colors flex items-center gap-1.5">
                    <Github className="w-3.5 h-3.5" />
                    <span>GitHub (@Avijit)</span>
                  </a>
                </li>
                <li>
                  <a href="https://www.linkedin.com/in/avijit-hira-819a99258/" target="_blank" rel="noreferrer" className="hover:text-white transition-colors flex items-center gap-1.5">
                    <Linkedin className="w-3.5 h-3.5" />
                    <span>LinkedIn Profile</span>
                  </a>
                </li>
                <li>
                  <a href="https://www.youtube.com/@DevWaveDiaries" target="_blank" rel="noreferrer" className="hover:text-white transition-colors flex items-center gap-1.5">
                    <Youtube className="w-3.5 h-3.5" />
                    <span>YouTube (@DevWave)</span>
                  </a>
                </li>
                <li>
                  <a href="https://www.instagram.com/avijit.hira.332/" target="_blank" rel="noreferrer" className="hover:text-white transition-colors flex items-center gap-1.5">
                    <Instagram className="w-3.5 h-3.5" />
                    <span>Instagram</span>
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Legal & GIANT OUTLINED WORDMARK */}
        <div className="pt-8">
          <div className="flex flex-wrap items-center justify-between gap-4 text-[11px] font-mono text-neutral-500 mb-6">
            <div className="flex items-center gap-4">
              <Link href="/about" className="hover:text-neutral-300 transition-colors">
                MIT License
              </Link>
              <span>•</span>
              <Link href="/about" className="hover:text-neutral-300 transition-colors">
                JudgeAPI Sandbox
              </Link>
              <span>•</span>
              <Link href="/about" className="hover:text-neutral-300 transition-colors">
                BYOK Security
              </Link>
            </div>
            <div>
              <span>Status: JudgeAPI & AI Engine Operational (99.99%)</span>
            </div>
          </div>

          {/* Giant Outlined Wordmark Bleeding off the bottom */}
          <div className="w-full select-none pointer-events-none overflow-hidden text-center pt-4">
            <h1
              className="text-[17vw] font-sans font-black tracking-tighter leading-none text-transparent"
              style={{
                WebkitTextStroke: "1.5px rgba(255, 255, 255, 0.12)",
              }}
            >
              EasyCode
            </h1>
          </div>
        </div>
      </div>
    </footer>
  );
}
