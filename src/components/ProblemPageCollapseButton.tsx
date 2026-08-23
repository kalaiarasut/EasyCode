"use client";
import React, { useState } from 'react';
import { IProblem } from '@/models/Problem';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronRight, Building2, ListFilter, Lightbulb, MessageSquare, SquarePen, Tag } from 'lucide-react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

export default function ProblemPageCollapseButton({ problemInfo }: { problemInfo: IProblem }) {
  const [openTopics, setOpenTopics] = useState<boolean>(false);
  const [openCompanies, setOpenCompanies] = useState<boolean>(false);
  const [openHint1, setOpenHint1] = useState<boolean>(false);
  const [openHint2, setOpenHint2] = useState<boolean>(false);
  const [openHint3, setOpenHint3] = useState<boolean>(false);
  const [openSimilar, setOpenSimilar] = useState<boolean>(false);
  const { data: session } = useSession();

  const topicsList = Array.isArray(problemInfo.topics)
    ? problemInfo.topics
    : typeof problemInfo.topics === 'string'
    ? problemInfo.topics.split(',').map((t) => t.trim()).filter(Boolean)
    : [];

  const companiesList = Array.isArray(problemInfo.companies)
    ? problemInfo.companies
    : typeof problemInfo.companies === 'string'
    ? problemInfo.companies.split(',').map((c) => c.trim()).filter(Boolean)
    : [];

  return (
    <div className="w-full mt-6 border-t border-neutral-200 dark:border-neutral-800 divide-y divide-neutral-200 dark:divide-neutral-800 text-xs">
      {/* Topics Accordion */}
      <Collapsible open={openTopics} onOpenChange={setOpenTopics} className="w-full py-3">
        <CollapsibleTrigger className="flex items-center justify-between w-full text-left group hover:text-neutral-900 dark:hover:text-white transition-colors cursor-pointer">
          <div className="flex items-center gap-2.5 font-medium text-neutral-700 dark:text-neutral-300">
            <Tag className="w-3.5 h-3.5 text-neutral-500" />
            <span>Topics</span>
          </div>
          <ChevronRight className={`w-3.5 h-3.5 text-neutral-400 transition-transform duration-200 ${openTopics ? 'rotate-90' : ''}`} />
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-3 flex flex-wrap gap-1.5">
          {topicsList.length > 0 ? (
            topicsList.map((topic: string, index: number) => (
              <span
                key={index}
                className="px-2.5 py-1 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 text-xs hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
              >
                {topic}
              </span>
            ))
          ) : (
            <span className="text-neutral-400">Array, Dynamic Programming, Hash Table</span>
          )}
        </CollapsibleContent>
      </Collapsible>

      {/* Companies Accordion */}
      <Collapsible open={openCompanies} onOpenChange={setOpenCompanies} className="w-full py-3">
        <CollapsibleTrigger className="flex items-center justify-between w-full text-left group hover:text-neutral-900 dark:hover:text-white transition-colors cursor-pointer">
          <div className="flex items-center gap-2.5 font-medium text-neutral-700 dark:text-neutral-300">
            <Building2 className="w-3.5 h-3.5 text-neutral-500" />
            <span>Companies</span>
          </div>
          <ChevronRight className={`w-3.5 h-3.5 text-neutral-400 transition-transform duration-200 ${openCompanies ? 'rotate-90' : ''}`} />
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-3 flex flex-wrap gap-1.5">
          {companiesList.length > 0 ? (
            companiesList.map((company: string, index: number) => (
              <span
                key={index}
                className="px-2.5 py-1 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 text-xs hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
              >
                {company}
              </span>
            ))
          ) : (
            <div className="flex gap-2">
              <span className="px-2.5 py-1 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 text-xs">Google</span>
              <span className="px-2.5 py-1 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 text-xs">Amazon</span>
              <span className="px-2.5 py-1 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 text-xs">Meta</span>
            </div>
          )}
        </CollapsibleContent>
      </Collapsible>

      {/* Hint 1 */}
      <Collapsible open={openHint1} onOpenChange={setOpenHint1} className="w-full py-3">
        <CollapsibleTrigger className="flex items-center justify-between w-full text-left group hover:text-neutral-900 dark:hover:text-white transition-colors cursor-pointer">
          <div className="flex items-center gap-2.5 font-medium text-neutral-700 dark:text-neutral-300">
            <Lightbulb className="w-3.5 h-3.5 text-neutral-500" />
            <span>Hint 1</span>
          </div>
          <ChevronRight className={`w-3.5 h-3.5 text-neutral-400 transition-transform duration-200 ${openHint1 ? 'rotate-90' : ''}`} />
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-2.5 text-neutral-600 dark:text-neutral-400 text-xs leading-relaxed">
          A really brute force way would be to search for all possible pairs of numbers but that would be too slow. Can you think of an optimization using extra memory or a hash map?
        </CollapsibleContent>
      </Collapsible>

      {/* Hint 2 */}
      <Collapsible open={openHint2} onOpenChange={setOpenHint2} className="w-full py-3">
        <CollapsibleTrigger className="flex items-center justify-between w-full text-left group hover:text-neutral-900 dark:hover:text-white transition-colors cursor-pointer">
          <div className="flex items-center gap-2.5 font-medium text-neutral-700 dark:text-neutral-300">
            <Lightbulb className="w-3.5 h-3.5 text-neutral-500" />
            <span>Hint 2</span>
          </div>
          <ChevronRight className={`w-3.5 h-3.5 text-neutral-400 transition-transform duration-200 ${openHint2 ? 'rotate-90' : ''}`} />
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-2.5 text-neutral-600 dark:text-neutral-400 text-xs leading-relaxed">
          So, if we check each element in one pass, can we look up its complement in \(O(1)\) time?
        </CollapsibleContent>
      </Collapsible>

      {/* Hint 3 */}
      <Collapsible open={openHint3} onOpenChange={setOpenHint3} className="w-full py-3">
        <CollapsibleTrigger className="flex items-center justify-between w-full text-left group hover:text-neutral-900 dark:hover:text-white transition-colors cursor-pointer">
          <div className="flex items-center gap-2.5 font-medium text-neutral-700 dark:text-neutral-300">
            <Lightbulb className="w-3.5 h-3.5 text-neutral-500" />
            <span>Hint 3</span>
          </div>
          <ChevronRight className={`w-3.5 h-3.5 text-neutral-400 transition-transform duration-200 ${openHint3 ? 'rotate-90' : ''}`} />
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-2.5 text-neutral-600 dark:text-neutral-400 text-xs leading-relaxed">
          Store elements you've seen so far in a hash table with their index for quick lookup!
        </CollapsibleContent>
      </Collapsible>

      {/* Similar Questions */}
      <Collapsible open={openSimilar} onOpenChange={setOpenSimilar} className="w-full py-3">
        <CollapsibleTrigger className="flex items-center justify-between w-full text-left group hover:text-neutral-900 dark:hover:text-white transition-colors cursor-pointer">
          <div className="flex items-center gap-2.5 font-medium text-neutral-700 dark:text-neutral-300">
            <ListFilter className="w-3.5 h-3.5 text-neutral-500" />
            <span>Similar Questions</span>
          </div>
          <ChevronRight className={`w-3.5 h-3.5 text-neutral-400 transition-transform duration-200 ${openSimilar ? 'rotate-90' : ''}`} />
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-2.5 space-y-2">
          <div className="flex items-center justify-between py-1.5 px-2 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer transition-colors">
            <span className="font-medium text-neutral-800 dark:text-neutral-200">3Sum</span>
            <span className="text-amber-500 text-[11px] font-semibold">Medium</span>
          </div>
          <div className="flex items-center justify-between py-1.5 px-2 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer transition-colors">
            <span className="font-medium text-neutral-800 dark:text-neutral-200">4Sum</span>
            <span className="text-amber-500 text-[11px] font-semibold">Medium</span>
          </div>
          <div className="flex items-center justify-between py-1.5 px-2 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer transition-colors">
            <span className="font-medium text-neutral-800 dark:text-neutral-200">Two Sum II - Input Array Is Sorted</span>
            <span className="text-amber-500 text-[11px] font-semibold">Medium</span>
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Discussion Link */}
      <div className="py-3 flex items-center justify-between text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white transition-colors cursor-pointer">
        <div className="flex items-center gap-2.5 font-medium">
          <MessageSquare className="w-3.5 h-3.5 text-neutral-500" />
          <span>Discussion (2K)</span>
        </div>
      </div>

      {/* Admin Edit Link */}
      {session?.user?.userType === "admin" && (
        <Link href={`/update-problem/${problemInfo._id}`} className="block py-3">
          <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400 font-medium">
            <div className="flex items-center gap-2.5">
              <SquarePen className="w-3.5 h-3.5" />
              <span>Edit Problem</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5" />
          </div>
        </Link>
      )}
    </div>
  );
}
