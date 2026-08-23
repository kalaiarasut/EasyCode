"use client";
import React, { useState, useEffect, useRef } from 'react';
import {
  FileText,
  Heading,
  Bold,
  Italic,
  Strikethrough,
  List,
  ListOrdered,
  Quote,
  Code,
  Eye,
  Check,
} from 'lucide-react';
import { toast } from 'sonner';

interface ProblemPageNotesPanelProps {
  problemId: string;
  problemTitle?: string;
}

export default function ProblemPageNotesPanel({
  problemId,
  problemTitle = "Problem",
}: ProblemPageNotesPanelProps) {
  const [noteContent, setNoteContent] = useState<string>("");
  const [isPreview, setIsPreview] = useState<boolean>(false);
  const [isSaved, setIsSaved] = useState<boolean>(true);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!problemId) return;
    try {
      const saved = localStorage.getItem(`easycode_note_${problemId}`);
      if (saved !== null) {
        setNoteContent(saved);
      }
    } catch (e) {}
  }, [problemId]);

  const handleNoteChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setNoteContent(val);
    setIsSaved(false);
    try {
      localStorage.setItem(`easycode_note_${problemId}`, val);
      setTimeout(() => setIsSaved(true), 250);
    } catch (e) {}
  };

  const insertFormat = (prefix: string, suffix: string = "") => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = noteContent.substring(start, end);
    const replacement = `${prefix}${selected || "text"}${suffix}`;
    const next = noteContent.substring(0, start) + replacement + noteContent.substring(end);
    setNoteContent(next);
    try {
      localStorage.setItem(`easycode_note_${problemId}`, next);
    } catch (e) {}
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, start + prefix.length + (selected.length || 4));
    }, 0);
  };

  return (
    <div
      className="w-full h-full flex flex-col bg-white dark:bg-[#1a1a1a] text-neutral-800 dark:text-neutral-200 overflow-hidden select-none"
      style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif' }}
    >
      {/* Header Tab */}
      <div
        className="w-full flex items-center justify-between px-3 shrink-0 border-b border-black/[0.06] dark:border-white/[0.06]"
        style={{
          height: '36px',
          backgroundColor: 'rgba(0,0,0,0.02)',
        }}
      >
        <div className="flex items-center gap-1.5 font-medium text-xs text-neutral-900 dark:text-white">
          <FileText className="w-3.5 h-3.5 text-amber-500" />
          <span>Notes</span>
        </div>

        <div className="flex items-center gap-2 text-[11px] text-neutral-400">
          <span className="flex items-center gap-1">
            {isSaved ? <Check className="w-3 h-3 text-emerald-500" /> : null}
            {isSaved ? "Saved" : "Saving..."}
          </span>
        </div>
      </div>

      {/* Formatting Toolbar */}
      <div
        className="w-full flex items-center gap-1 px-3 py-1 border-b border-black/[0.06] dark:border-white/[0.06] bg-transparent text-neutral-600 dark:text-neutral-400 text-xs shrink-0"
        style={{ height: '34px' }}
      >
        <button
          onClick={() => insertFormat("### ")}
          className="px-2 py-1 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 font-bold cursor-pointer text-xs"
          title="Heading"
        >
          H
        </button>

        <button
          onClick={() => insertFormat("**", "**")}
          className="px-2 py-1 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 font-bold cursor-pointer text-xs"
          title="Bold"
        >
          B
        </button>

        <button
          onClick={() => insertFormat("*", "*")}
          className="px-2 py-1 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 italic cursor-pointer text-xs"
          title="Italic"
        >
          I
        </button>

        <button
          onClick={() => insertFormat("~~", "~~")}
          className="px-2 py-1 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 line-through cursor-pointer text-xs"
          title="Strikethrough"
        >
          S
        </button>

        <button
          onClick={() => insertFormat("- ")}
          className="p-1 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer"
          title="Bullet List"
        >
          <List className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={() => insertFormat("1. ")}
          className="p-1 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer"
          title="Numbered List"
        >
          <ListOrdered className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={() => insertFormat("> ")}
          className="p-1 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer"
          title="Quote"
        >
          <Quote className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={() => insertFormat("```\n", "\n```")}
          className="p-1 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer"
          title="Code block"
        >
          <Code className="w-3.5 h-3.5" />
        </button>

        <div className="w-[1px] h-4 bg-black/10 dark:bg-white/10 mx-1" />

        <button
          onClick={() => setIsPreview(!isPreview)}
          className={`p-1 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer ${
            isPreview ? 'text-blue-500 font-semibold' : ''
          }`}
          title="Toggle Markdown Preview"
        >
          <Eye className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Editor Body */}
      <div className="flex-1 w-full p-3 overflow-y-auto select-text">
        {!isPreview ? (
          <textarea
            ref={textareaRef}
            value={noteContent}
            onChange={handleNoteChange}
            placeholder="Type here... (Markdown is supported)"
            className="w-full h-full resize-none bg-transparent outline-none font-mono text-[12.5px] leading-relaxed text-neutral-800 dark:text-neutral-200 placeholder:text-neutral-400 dark:placeholder:text-neutral-500"
          />
        ) : (
          <div className="text-xs leading-relaxed whitespace-pre-wrap font-sans text-neutral-700 dark:text-neutral-300">
            {noteContent || (
              <span className="text-neutral-400 italic">No notes written yet.</span>
            )}
          </div>
        )}
      </div>

      {/* Note Footer */}
      <div
        className="w-full flex items-center justify-between px-3 select-none shrink-0 border-t border-black/[0.06] dark:border-white/[0.06] text-[11px] text-neutral-400"
        style={{ height: '28px' }}
      >
        <span>{noteContent.length} characters</span>
        <span>Auto-saved</span>
      </div>
    </div>
  );
}
