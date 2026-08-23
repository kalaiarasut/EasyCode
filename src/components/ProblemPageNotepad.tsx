"use client";
import React, { useState, useEffect } from 'react';
import { FileText, Eye, Edit3, Trash2, X, Check } from 'lucide-react';
import { toast } from 'sonner';

interface ProblemPageNotepadProps {
  problemId: string;
  problemTitle?: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function ProblemPageNotepad({
  problemId,
  problemTitle = "Problem Notes",
  isOpen,
  onClose,
}: ProblemPageNotepadProps) {
  const [noteContent, setNoteContent] = useState<string>("");
  const [isPreview, setIsPreview] = useState<boolean>(false);
  const [isSaved, setIsSaved] = useState<boolean>(true);

  // Load saved notes for this problem
  useEffect(() => {
    if (!problemId) return;
    try {
      const saved = localStorage.getItem(`easycode_note_${problemId}`);
      if (saved !== null) {
        setNoteContent(saved);
      } else {
        setNoteContent("");
      }
    } catch (e) {
      console.error(e);
    }
  }, [problemId]);

  // Handle change & auto-save
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setNoteContent(val);
    setIsSaved(false);
    try {
      localStorage.setItem(`easycode_note_${problemId}`, val);
      setTimeout(() => setIsSaved(true), 300);
    } catch (e) {
      console.error(e);
    }
  };

  const handleClearNote = () => {
    if (confirm("Are you sure you want to clear your notes for this problem?")) {
      setNoteContent("");
      try {
        localStorage.removeItem(`easycode_note_${problemId}`);
      } catch (e) {}
      toast.info("Notes cleared");
    }
  };

  const insertTemplate = (snippet: string) => {
    const next = noteContent ? `${noteContent}\n\n${snippet}` : snippet;
    setNoteContent(next);
    try {
      localStorage.setItem(`easycode_note_${problemId}`, next);
      setIsSaved(true);
    } catch (e) {}
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed bottom-4 right-4 z-50 w-96 max-w-[calc(100vw-2rem)] h-[440px] rounded-xl shadow-2xl bg-white dark:bg-[#1e1e1e] border border-neutral-200 dark:border-neutral-700 flex flex-col overflow-hidden text-neutral-800 dark:text-neutral-200 select-none animate-in fade-in slide-in-from-bottom-4 duration-200"
      style={{
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-3.5 py-2.5 bg-neutral-100/80 dark:bg-[#252525] border-b border-neutral-200 dark:border-neutral-700">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-neutral-500" />
          <span className="font-semibold text-xs truncate max-w-[160px]">
            {problemTitle} Notes
          </span>
        </div>

        <div className="flex items-center gap-1">
          {/* Saved indicator */}
          <span className="text-[10px] text-neutral-400 flex items-center gap-1 mr-1">
            {isSaved ? <Check className="w-3 h-3 text-emerald-500" /> : null}
            {isSaved ? "Saved" : "Saving..."}
          </span>

          {/* Preview Toggle */}
          <button
            onClick={() => setIsPreview(!isPreview)}
            className="p-1 rounded hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors cursor-pointer"
            title={isPreview ? "Edit mode" : "Preview markdown"}
          >
            {isPreview ? <Edit3 className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
          </button>

          {/* Clear note */}
          <button
            onClick={handleClearNote}
            className="p-1 rounded hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-400 hover:text-rose-500 transition-colors cursor-pointer"
            title="Clear notes"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>

          {/* Close */}
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors cursor-pointer"
            title="Close notepad"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Quick tags toolbar */}
      {!isPreview && (
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-50/70 dark:bg-[#1a1a1a] border-b border-neutral-100 dark:border-neutral-800 text-[11px] overflow-x-auto">
          <span className="text-neutral-400 text-[10px] font-medium">Quick add:</span>
          <button
            onClick={() => insertTemplate("### Approach:\n- ")}
            className="px-2 py-0.5 rounded bg-neutral-200/60 dark:bg-neutral-800 hover:bg-neutral-300 dark:hover:bg-neutral-700 transition-colors cursor-pointer text-neutral-700 dark:text-neutral-300"
          >
            + Approach
          </button>
          <button
            onClick={() => insertTemplate("### Complexity:\n- Time: O(N)\n- Space: O(1)")}
            className="px-2 py-0.5 rounded bg-neutral-200/60 dark:bg-neutral-800 hover:bg-neutral-300 dark:hover:bg-neutral-700 transition-colors cursor-pointer text-neutral-700 dark:text-neutral-300"
          >
            + Complexity
          </button>
          <button
            onClick={() => insertTemplate("### Key Takeaways:\n- ")}
            className="px-2 py-0.5 rounded bg-neutral-200/60 dark:bg-neutral-800 hover:bg-neutral-300 dark:hover:bg-neutral-700 transition-colors cursor-pointer text-neutral-700 dark:text-neutral-300"
          >
            + Key Takeaways
          </button>
        </div>
      )}

      {/* Content Body */}
      <div className="flex-1 p-3 select-text overflow-y-auto">
        {!isPreview ? (
          <textarea
            value={noteContent}
            onChange={handleChange}
            placeholder="Type your notes, ideas, edge cases, and algorithm thoughts here (supports markdown)..."
            className="w-full h-full resize-none bg-transparent outline-none font-mono text-xs leading-relaxed text-neutral-800 dark:text-neutral-200 placeholder:text-neutral-400 dark:placeholder:text-neutral-600"
          />
        ) : (
          <div className="text-xs leading-relaxed space-y-2 whitespace-pre-wrap font-sans text-neutral-700 dark:text-neutral-300">
            {noteContent ? (
              noteContent
            ) : (
              <span className="text-neutral-400 italic">No notes written yet.</span>
            )}
          </div>
        )}
      </div>

      {/* Footer info */}
      <div className="flex items-center justify-between px-3 py-1.5 text-[10px] text-neutral-400 bg-neutral-50 dark:bg-[#1a1a1a] border-t border-neutral-100 dark:border-neutral-800">
        <span>{noteContent.length} characters</span>
        <span>Auto-saved to local browser</span>
      </div>
    </div>
  );
}
