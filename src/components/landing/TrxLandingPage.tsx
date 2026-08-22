"use client";

import React, { useState } from "react";
import SmoothScrollProvider from "./SmoothScrollProvider";
import LandingNavbar from "./LandingNavbar";
import HeroSection from "./HeroSection";
import AgenticSolutionsPanel from "./AgenticSolutionsPanel";
import AboutMetricsSection from "./AboutMetricsSection";
import CapabilitiesGrid from "./CapabilitiesGrid";
import ProcessTimelineSection from "./ProcessTimelineSection";
import PersonaStrip from "./PersonaStrip";
import TestimonialsCarousel from "./TestimonialsCarousel";
import LandingFooter from "./LandingFooter";
import DemoModal from "./DemoModal";

export default function TrxLandingPage() {
  const [demoModalOpen, setDemoModalOpen] = useState(false);

  return (
    <SmoothScrollProvider>
      <div className="min-h-screen w-full bg-[#FBF9F4] dark:bg-[#1C1B19] text-[#1C1B19] dark:text-[#E8E6E3] transition-colors duration-300 font-sans selection:bg-neutral-500/20 overflow-x-hidden">
        
        {/* Sticky Glass Navbar */}
        <LandingNavbar />

        {/* Main Content Sections */}
        <main className="relative z-10">
          {/* Section 2: Hero Section */}
          <HeroSection onOpenDemo={() => setDemoModalOpen(true)} />

          {/* Section 3: "Agentic Solutions" Panel */}
          <AgenticSolutionsPanel />

          {/* Section 4: About & Metrics Section + Logo Marquee */}
          <AboutMetricsSection />

          {/* Section 5: Capabilities 2x2 Grid */}
          <CapabilitiesGrid />

          {/* Section 6: "From chaos to clarity in 3 steps" Process Timeline */}
          <ProcessTimelineSection />

          {/* Section 7: Persona Strip */}
          <PersonaStrip />

          {/* Section 8: Testimonials Carousel */}
          <TestimonialsCarousel />
        </main>

        {/* Section 9: Dark Footer with Giant Outlined Wordmark */}
        <LandingFooter />

        {/* Interactive Demo Scheduler Modal */}
        <DemoModal isOpen={demoModalOpen} onClose={() => setDemoModalOpen(false)} />
      </div>
    </SmoothScrollProvider>
  );
}
