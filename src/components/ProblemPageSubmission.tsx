"use client";
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { formatDate } from '@/helpers/formatDate';
import { IProblem } from '@/models/Problem';
import { ApiResponse, codeSubmissionResultType } from '@/types/ApiResponse';
import { Clock, Cpu, FileCode2, History } from 'lucide-react';
import { Skeleton } from './ui/skeleton';

interface ProblemPageSubmissionType {
  theme: string | undefined;
  problemInfo: IProblem;
  setCurrentTab: React.Dispatch<React.SetStateAction<string>>;
  setSubmissionOutput: React.Dispatch<React.SetStateAction<codeSubmissionResultType | null>>;
}

export default function ProblemPageSubmission({
  theme,
  problemInfo,
  setCurrentTab,
  setSubmissionOutput,
}: ProblemPageSubmissionType) {
  const [submissions, setSubmissions] = useState<codeSubmissionResultType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    const fetchSubmissions = async () => {
      if (!problemInfo?._id) {
        setLoading(false);
        return;
      }
      try {
        const res = await axios.get<ApiResponse>(`/api/problem/get-submitted-code?problemId=${problemInfo._id}`, {
          timeout: 5000,
        });
        if (isMounted) {
          setSubmissions((res.data.submissions as codeSubmissionResultType[]) || []);
        }
      } catch (error) {
        if (isMounted) {
          setSubmissions([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    fetchSubmissions();
    return () => {
      isMounted = false;
    };
  }, [problemInfo?._id]);

  const handleClick = (ele: codeSubmissionResultType) => {
    setSubmissionOutput(ele);
    setCurrentTab("testResult");
  };

  return (
    <div className="w-full flex-1 flex flex-col p-4 bg-white dark:bg-[#1a1a1a] text-neutral-800 dark:text-neutral-200 select-none">
      {/* Table Header */}
      <div className="w-full grid grid-cols-12 text-xs font-semibold text-neutral-500 dark:text-neutral-400 pb-3 mb-2 border-b border-black/[0.06] dark:border-white/[0.06]">
        <div className="col-span-4">Status</div>
        <div className="col-span-2">Language</div>
        <div className="col-span-3">Runtime</div>
        <div className="col-span-3">Memory</div>
      </div>

      {/* Loading Skeleton */}
      {loading && (
        <div className="space-y-3 pt-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center justify-between p-2">
              <Skeleton className="h-5 w-28 rounded" />
              <Skeleton className="h-5 w-16 rounded" />
              <Skeleton className="h-5 w-20 rounded" />
              <Skeleton className="h-5 w-20 rounded" />
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && submissions.length === 0 && (
        <div className="w-full flex-1 min-h-[300px] flex flex-col items-center justify-center text-center p-6 text-neutral-400 dark:text-neutral-500">
          <div className="w-12 h-12 rounded-full bg-neutral-100 dark:bg-neutral-800/80 flex items-center justify-center mb-3">
            <History className="w-6 h-6 opacity-60" />
          </div>
          <h3 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
            No Submissions Yet
          </h3>
          <p className="text-xs max-w-sm text-neutral-500 dark:text-neutral-400">
            Submit your solution to track your progress, runtime performance, and memory analysis here.
          </p>
        </div>
      )}

      {/* Submissions List */}
      {!loading && submissions.length > 0 && (
        <div className="space-y-1 overflow-y-auto">
          {submissions.map((item, idx) => {
            const isAccepted = item.status === "Accepted";
            return (
              <div
                key={idx}
                onClick={() => handleClick(item)}
                className="w-full grid grid-cols-12 items-center p-2.5 rounded-lg hover:bg-neutral-100/80 dark:hover:bg-neutral-800/60 transition-colors cursor-pointer text-xs"
              >
                {/* Status + Date */}
                <div className="col-span-4 flex flex-col">
                  <span
                    className={`font-semibold ${
                      isAccepted
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-rose-600 dark:text-rose-400"
                    }`}
                  >
                    {item.status}
                  </span>
                  <span className="text-[11px] text-neutral-400">
                    {formatDate(item.createdAt as Date)}
                  </span>
                </div>

                {/* Language */}
                <div className="col-span-2">
                  <span className="px-2 py-0.5 rounded-md bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 font-mono text-[11px]">
                    {item.language}
                  </span>
                </div>

                {/* Runtime */}
                <div className="col-span-3 flex items-center gap-1 text-neutral-600 dark:text-neutral-300">
                  <Clock className="w-3.5 h-3.5 opacity-50" />
                  <span>
                    {isAccepted ? `${(item.time * 1000).toFixed(0)} ms` : "N/A"}
                  </span>
                </div>

                {/* Memory */}
                <div className="col-span-3 flex items-center gap-1 text-neutral-600 dark:text-neutral-300">
                  <Cpu className="w-3.5 h-3.5 opacity-50" />
                  <span>
                    {isAccepted ? `${item.memory.toFixed(1)} MB` : "N/A"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
