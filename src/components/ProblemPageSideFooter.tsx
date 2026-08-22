"use client";
import React, { useState } from 'react';
import { CircleHelp, MessageSquare, Share2, Star, ThumbsDown, ThumbsUp } from 'lucide-react';
import { toast } from 'sonner';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

export default function ProblemSideFooter() {
  const [liked, setLiked] = useState<boolean | null>(null);
  const [likeCount, setLikeCount] = useState<number>(69300);
  const [isStarred, setIsStarred] = useState<boolean>(false);

  const handleLike = () => {
    if (liked === true) {
      setLiked(null);
      setLikeCount((prev) => prev - 1);
    } else {
      if (liked === false) setLiked(true);
      else {
        setLiked(true);
        setLikeCount((prev) => prev + 1);
      }
    }
  };

  const handleDislike = () => {
    if (liked === false) {
      setLiked(null);
    } else {
      if (liked === true) {
        setLikeCount((prev) => prev - 1);
      }
      setLiked(false);
    }
  };

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Problem link copied to clipboard");
    }
  };

  const formatCount = (num: number) => {
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  return (
    <div
      className="w-full flex items-center justify-between select-none shrink-0 z-30"
      style={{
        height: '36px',
        padding: '4px 12px',
        borderTop: '1px solid rgba(0,0,0,0.08)',
        color: 'rgb(115, 115, 115)',
        fontSize: '14px',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif',
      }}
    >
      {/* Left side actions */}
      <div className="flex items-center gap-3">
        {/* Like / Dislike pill */}
        <div className="flex items-center rounded-md bg-neutral-200/60 dark:bg-neutral-800/80 px-2 py-0.5 gap-1.5">
          <button
            onClick={handleLike}
            className={`flex items-center gap-1 hover:text-neutral-900 dark:hover:text-white transition-colors cursor-pointer ${
              liked === true ? 'text-blue-500 font-semibold' : ''
            }`}
          >
            <ThumbsUp className={`w-3.5 h-3.5 ${liked === true ? 'fill-current' : ''}`} />
            <span className="text-[11px]">{formatCount(likeCount)}</span>
          </button>
          <div className="h-3 w-[1px] bg-neutral-300 dark:bg-neutral-700 mx-0.5" />
          <button
            onClick={handleDislike}
            className={`hover:text-neutral-900 dark:hover:text-white transition-colors cursor-pointer ${
              liked === false ? 'text-rose-500' : ''
            }`}
          >
            <ThumbsDown className={`w-3.5 h-3.5 ${liked === false ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* Discussions */}
        <Tooltip>
          <TooltipTrigger asChild>
            <button className="flex items-center gap-1 hover:text-neutral-900 dark:hover:text-white transition-colors cursor-pointer">
              <MessageSquare className="w-3.5 h-3.5" />
              <span className="text-[11px]">2K</span>
            </button>
          </TooltipTrigger>
          <TooltipContent>Discussions</TooltipContent>
        </Tooltip>

        {/* Star / Favorite */}
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={() => setIsStarred(!isStarred)}
              className={`hover:text-amber-500 transition-colors cursor-pointer ${
                isStarred ? 'text-amber-500' : ''
              }`}
            >
              <Star className={`w-3.5 h-3.5 ${isStarred ? 'fill-amber-500 text-amber-500' : ''}`} />
            </button>
          </TooltipTrigger>
          <TooltipContent>{isStarred ? 'Remove from favorites' : 'Add to favorites'}</TooltipContent>
        </Tooltip>

        {/* Share */}
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={handleCopyLink}
              className="hover:text-neutral-900 dark:hover:text-white transition-colors cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" />
            </button>
          </TooltipTrigger>
          <TooltipContent>Share Problem</TooltipContent>
        </Tooltip>

        {/* Help */}
        <Tooltip>
          <TooltipTrigger asChild>
            <button className="hover:text-neutral-900 dark:hover:text-white transition-colors cursor-pointer">
              <CircleHelp className="w-3.5 h-3.5" />
            </button>
          </TooltipTrigger>
          <TooltipContent>Feedback & Help</TooltipContent>
        </Tooltip>
      </div>

      {/* Right side: Live Online Counter */}
      <div className="flex items-center gap-1.5 text-[11px] text-neutral-500 dark:text-neutral-400">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        <span>1638 Online</span>
      </div>
    </div>
  );
}
