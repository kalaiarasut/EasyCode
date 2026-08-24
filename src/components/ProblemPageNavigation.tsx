"use client";
import React from 'react';
import { BookText, BookOpen, FlaskConical, History, Maximize2, ChevronLeft, Sparkles, X } from 'lucide-react';

interface ProblemPageNavigationProps {
  currentTab: string;
  setCurrentTab: React.Dispatch<React.SetStateAction<string>>;
  isAskAiOpen?: boolean;
  onCloseAskAi?: () => void;
}

export default function ProblemPageNavigation({
  currentTab,
  setCurrentTab,
  isAskAiOpen = false,
  onCloseAskAi,
}: ProblemPageNavigationProps) {
  const [isAiActive, setIsAiActive] = React.useState<boolean>(false);

  // Listen to global easycode-agent-status-change event
  React.useEffect(() => {
    const handleStatus = (e: any) => {
      const detail = e.detail;
      if (!detail) return;
      setIsAiActive(Boolean(detail.isGenerating));
    };
    window.addEventListener("easycode-agent-status-change" as any, handleStatus);
    return () => {
      window.removeEventListener("easycode-agent-status-change" as any, handleStatus);
    };
  }, []);

  // Tabs: Description | Editorial | Solutions | Submissions | Ask AI (if open)
  const tabs = [
    { id: "description", label: "Description", icon: BookText },
    { id: "editorial", label: "Editorial", icon: BookOpen },
    { id: "solutions", label: "Solutions", icon: FlaskConical },
    { id: "submissions", label: "Submissions", icon: History },
    ...(isAskAiOpen || currentTab === "askAi"
      ? [{ id: "askAi", label: "Ask AI", icon: Sparkles, isAi: true }]
      : []),
  ];

  return (
    <div
      className="w-full flex items-center justify-between px-1.5 select-none shrink-0 group"
      style={{
        height: '36px',
        backgroundColor: 'rgba(0,0,0,0.02)',
        borderRadius: '8px 8px 0 0',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif',
        fontSize: '14px',
      }}
    >
      {/* Left: Tab Buttons */}
      <div className="flex items-center">
        {tabs.map((tab, idx) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;
          const isAiTab = tab.id === "askAi";

          return (
            <React.Fragment key={tab.id}>
              {idx > 0 && (
                <span style={{ color: 'rgba(0,0,0,0.15)', fontSize: '14px', margin: '0 2px', userSelect: 'none' }}>|</span>
              )}
              <div className="relative flex items-center">
                <button
                  onClick={() => setCurrentTab(tab.id)}
                  className={`relative flex items-center gap-1.5 cursor-pointer transition-all ${
                    isAiTab && isAiActive
                      ? 'bg-emerald-500/10 dark:bg-emerald-500/15 border border-emerald-500/30'
                      : ''
                  }`}
                  style={{
                    padding: isAiTab ? '4px 4px 4px 8px' : '4px 8px',
                    borderRadius: '5px',
                    height: '28px',
                    fontWeight: isActive ? 500 : 400,
                    color: isActive
                      ? 'rgb(26, 26, 26)'
                      : isAiTab && isAiActive
                      ? '#10b981'
                      : 'rgba(0, 0, 0, 0.55)',
                    fontSize: '14px',
                    lineHeight: '21px',
                    backgroundColor: isAiTab && isAiActive ? undefined : 'transparent',
                    border: isAiTab && isAiActive ? undefined : 'none',
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive && !(isAiTab && isAiActive)) (e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.04)');
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive && !(isAiTab && isAiActive)) e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <Icon
                    style={{
                      width: '14px',
                      height: '14px',
                      opacity: isActive || (isAiTab && isAiActive) ? 1 : 0.5,
                      ...(isAiTab && isAiActive ? { animationDuration: '3s' } : {}),
                    }}
                    className={
                      isAiTab && isAiActive
                        ? 'text-emerald-500 dark:text-emerald-400 animate-spin'
                        : isActive
                        ? 'text-neutral-900 dark:text-white'
                        : 'text-neutral-500 dark:text-neutral-400'
                    }
                  />
                  <span className={
                    isAiTab && isAiActive
                      ? 'text-emerald-600 dark:text-emerald-400 font-semibold'
                      : isActive
                      ? 'text-neutral-950 dark:text-white font-medium'
                      : 'text-neutral-600 dark:text-neutral-400'
                  }>
                    {tab.label}
                  </span>

                  {/* Pulsing Emerald Dot Indicator when AI is active */}
                  {isAiTab && isAiActive && (
                    <span className="relative flex h-2 w-2 ml-0.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                    </span>
                  )}
                </button>

                {/* Close button for Ask AI tab */}
                {isAiTab && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onCloseAskAi) {
                        onCloseAskAi();
                      } else {
                        setCurrentTab("description");
                      }
                    }}
                    className="p-1 mr-1 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 rounded hover:bg-black/[0.05] dark:hover:bg-white/[0.05] transition-colors cursor-pointer"
                    title="Close Ask AI tab"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            </React.Fragment>
          );
        })}
      </div>

      {/* Right: Maximize & Fold/Collapse Options on Hover */}
      <div className="flex items-center gap-1 text-neutral-400 opacity-0 group-hover:opacity-100 transition-opacity pr-1">
        <button
          className="p-1 rounded hover:bg-neutral-200/60 dark:hover:bg-neutral-800 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors cursor-pointer"
          title="Maximize tabset"
        >
          <Maximize2 className="w-3.5 h-3.5" />
        </button>
        <button
          className="p-1 rounded hover:bg-neutral-200/60 dark:hover:bg-neutral-800 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors cursor-pointer"
          title="Collapse tabset"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
