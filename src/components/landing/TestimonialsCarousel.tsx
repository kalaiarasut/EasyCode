"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, Linkedin } from "lucide-react";

// X (formerly Twitter) official vector icon
function XLogoSvg({ className = "w-3.5 h-3.5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

// LinkedIn official vector icon
function LinkedinLogoSvg({ className = "w-3.5 h-3.5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 8.76a1.64 1.64 0 0 0 1.64-1.64c0-.91-.73-1.64-1.64-1.64s-1.64.73-1.64 1.64c0 .91.73 1.64 1.64 1.64m1.39 9.74v-8.37H5.07v8.37h2.78z" />
    </svg>
  );
}

const TESTIMONIALS = [
  {
    id: "avijit-hira",
    name: "Avijit Hira",
    role: "Full-Stack Engineer & Creator",
    avatar: "A",
    bgColor: "bg-amber-600",
    quote: "EasyCode reads our algorithmic intuition better than half the squad, it's quietly become the most productive engineer on the team.",
    linkedinUrl: "https://www.linkedin.com/in/avijit-hira-819a99258/",
    xUrl: "https://x.com"
  },
  {
    id: "devon-lane",
    name: "Devon Lane",
    role: "Systems Administrator @ Stripe",
    avatar: "D",
    bgColor: "bg-emerald-600",
    quote: "Pairing with EasyCode is like pairing with a senior staff engineer who has perfect memory and infinite patience for edge cases.",
    linkedinUrl: "https://linkedin.com",
    xUrl: "https://x.com"
  },
  {
    id: "rohit-sharma",
    name: "Rohit Sharma",
    role: "Incoming SDE @ Amazon",
    avatar: "R",
    bgColor: "bg-blue-600",
    quote: "The combination of Monaco VS Code editor and AI Leet Bot helped me understand Dynamic Programming state transitions in hours. Cleared all 4 rounds at Amazon!",
    linkedinUrl: "https://linkedin.com",
    xUrl: "https://x.com"
  },
  {
    id: "sarah-chen",
    name: "Sarah Chen",
    role: "Candidate Master, Codeforces",
    avatar: "S",
    bgColor: "bg-purple-600",
    quote: "What used to take a whole sprint of algorithm drill now takes an afternoon. JudgeAPI sandbox test suite execution is blisteringly fast.",
    linkedinUrl: "https://linkedin.com",
    xUrl: "https://x.com"
  },
  {
    id: "david-kim",
    name: "David Kim",
    role: "Software Engineer @ Google",
    avatar: "K",
    bgColor: "bg-rose-600",
    quote: "The Community Solutions Hub with LaTeX math formatting makes reading proofs actually understandable. It's like textbook editorials for every interview problem.",
    linkedinUrl: "https://linkedin.com",
    xUrl: "https://x.com"
  }
];

export default function TestimonialsCarousel() {
  const [currentIndex, setCurrentIndex] = useState(1);
  const [isPaused, setIsPaused] = useState(false);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? TESTIMONIALS.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === TESTIMONIALS.length - 1 ? 0 : prev + 1));
  };

  // Auto-advance slideshow moving towards the left slowly
  React.useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      handleNext();
    }, 4500);

    return () => clearInterval(timer);
  }, [isPaused, currentIndex]);

  return (
    <section
      id="testimonials"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className="w-full bg-gradient-to-b from-[#F7F4ED] via-[#FCFBF8] to-[#F7F4ED] dark:from-[#1C1A18] dark:via-[#181715] dark:to-[#1C1A18] py-20 sm:py-28 scroll-mt-20 overflow-hidden font-sans transition-colors duration-300 relative"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* ════════════════════════════════════════════════════════════════════════
            CENTERED SECTION HEADER (IMAGE REPLICA)
            ════════════════════════════════════════════════════════════════════════ */}
        <div className="text-center space-y-3 mb-16 max-w-2xl mx-auto">
          <div className="text-xs sm:text-[13px] font-sans font-semibold text-neutral-950 dark:text-white tracking-wide">
            Testimonials
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-sans font-bold tracking-tight text-neutral-950 dark:text-white leading-[1.15]">
            Loved by engineers{" "}
            <br className="hidden sm:inline" />
            <span className="font-serif italic font-normal text-[#38332B] dark:text-[#E8E4DB]">
              who care about the craft.
            </span>
          </h2>
        </div>

        {/* ════════════════════════════════════════════════════════════════════════
            HORIZONTAL CENTERED SLIDING CAROUSEL
            ════════════════════════════════════════════════════════════════════════ */}
        <div className="relative w-full overflow-hidden py-4">
          
          {/* Left & Right Subtle Fade Gradients */}
          <div className="pointer-events-none absolute inset-y-0 left-0 w-12 sm:w-28 bg-gradient-to-r from-white dark:from-[#181715] to-transparent z-10" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-12 sm:w-28 bg-gradient-to-l from-white dark:from-[#181715] to-transparent z-10" />

          {/* Cards Track: Dynamically Centered based on currentIndex */}
          <div className="flex justify-center items-center">
            <div className="w-full max-w-6xl overflow-visible">
              <motion.div
                className="flex items-center gap-5 sm:gap-6 justify-center"
                animate={{
                  x: 0,
                }}
                transition={{ type: "spring", stiffness: 260, damping: 28 }}
              >
                {/* Visible 3-card sliding window centered on currentIndex */}
                {[-1, 0, 1].map((offset) => {
                  const itemIndex =
                    (currentIndex + offset + TESTIMONIALS.length) % TESTIMONIALS.length;
                  const item = TESTIMONIALS[itemIndex];
                  const isCenter = offset === 0;

                  return (
                    <motion.div
                      key={`${item.id}-${offset}`}
                      onClick={() => {
                        if (offset === -1) handlePrev();
                        if (offset === 1) handleNext();
                      }}
                      layout
                      initial={{ opacity: 0.6, scale: 0.94 }}
                      animate={{
                        opacity: isCenter ? 1 : 0.45,
                        scale: isCenter ? 1 : 0.94,
                      }}
                      transition={{ duration: 0.3, ease: "easeOut" }}
                      className={`w-[300px] sm:w-[380px] md:w-[440px] shrink-0 p-6 sm:p-8 rounded-3xl transition-all duration-300 flex flex-col justify-between cursor-pointer select-none ${
                        isCenter
                          ? "bg-white dark:bg-[#201E1C] border border-neutral-300/90 dark:border-neutral-700 shadow-xl ring-1 ring-black/[0.04] dark:ring-white/[0.06]"
                          : "bg-[#F7F5F0] dark:bg-[#1E1C1A] border border-[#E8E4DB] dark:border-[#2F2C29] shadow-xs hover:opacity-75"
                      }`}
                    >
                      {/* Quote Text */}
                      <div className="space-y-4 mb-6">
                        <p className="text-sm sm:text-[15px] font-medium text-neutral-800 dark:text-neutral-200 leading-relaxed font-sans">
                          "{item.quote}"
                        </p>
                      </div>

                      {/* Author Profile + Social Icons */}
                      <div className="pt-4 border-t border-black/[0.06] dark:border-white/[0.06] flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-9 h-9 rounded-full ${item.bgColor} text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs`}
                          >
                            {item.avatar}
                          </div>
                          <div className="text-left">
                            <h4 className="text-xs sm:text-sm font-bold text-neutral-900 dark:text-white">
                              {item.name}
                            </h4>
                            <p className="text-[11px] text-neutral-500 dark:text-neutral-400 font-mono">
                              {item.role}
                            </p>
                          </div>
                        </div>

                        {/* LinkedIn & X Social Links */}
                        <div className="flex items-center gap-2 text-neutral-400 dark:text-neutral-500">
                          <a
                            href={item.linkedinUrl}
                            target="_blank"
                            rel="noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="p-1 hover:text-[#0A66C2] transition-colors"
                            aria-label="LinkedIn Profile"
                          >
                            <LinkedinLogoSvg className="w-4 h-4" />
                          </a>
                          <a
                            href={item.xUrl}
                            target="_blank"
                            rel="noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="p-1 hover:text-neutral-900 dark:hover:text-white transition-colors"
                            aria-label="X Profile"
                          >
                            <XLogoSvg className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            </div>
          </div>
        </div>

        {/* ════════════════════════════════════════════════════════════════════════
            CENTERED BOTTOM ARROW PILL BUTTONS (IMAGE REPLICA)
            ════════════════════════════════════════════════════════════════════════ */}
        <div className="flex items-center justify-center gap-3 pt-10">
          <button
            onClick={handlePrev}
            className="w-12 h-10 rounded-full bg-[#F3EFE8] dark:bg-[#282624] text-neutral-700 dark:text-neutral-300 hover:bg-[#E8E2D6] dark:hover:bg-[#33302C] hover:text-neutral-950 dark:hover:text-white transition-all flex items-center justify-center cursor-pointer shadow-xs active:scale-95"
            aria-label="Previous testimonial"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <button
            onClick={handleNext}
            className="w-12 h-10 rounded-full bg-[#F3EFE8] dark:bg-[#282624] text-neutral-700 dark:text-neutral-300 hover:bg-[#E8E2D6] dark:hover:bg-[#33302C] hover:text-neutral-950 dark:hover:text-white transition-all flex items-center justify-center cursor-pointer shadow-xs active:scale-95"
            aria-label="Next testimonial"
          >
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </section>
  );
}
