'use client';

import React from 'react';
import Link from 'next/link';
import { BrainCircuit, TrendingUp, AlertCircle, ArrowRight, CheckCircle2 } from 'lucide-react';

export interface DsaTopicStat {
  topicKey: string;
  label: string;
  attempts: number;
  successful: number;
  accuracy: number; // 0 to 100
}

export interface DSAProfileCardProps {
  rating?: number;
  rank?: string;
  topics?: DsaTopicStat[];
}

export const DEFAULT_TOPIC_STATS: DsaTopicStat[] = [
  { topicKey: 'arrays', label: 'Arrays & Two Pointers', attempts: 20, successful: 18, accuracy: 90 },
  { topicKey: 'greedy', label: 'Greedy Algorithms', attempts: 15, successful: 12, accuracy: 80 },
  { topicKey: 'strings', label: 'Strings & Hashing', attempts: 14, successful: 11, accuracy: 78 },
  { topicKey: 'binarySearch', label: 'Binary Search', attempts: 12, successful: 9, accuracy: 75 },
  { topicKey: 'dataStructures', label: 'Stacks & Queues', attempts: 10, successful: 7, accuracy: 70 },
  { topicKey: 'graphs', label: 'Graphs (BFS/DFS)', attempts: 10, successful: 5, accuracy: 50 },
  { topicKey: 'dynamicProgramming', label: 'Dynamic Programming', attempts: 8, successful: 3, accuracy: 38 },
];

export const DSAProfileCard: React.FC<DSAProfileCardProps> = ({
  rating = 1542,
  rank = 'Specialist',
  topics = DEFAULT_TOPIC_STATS,
}) => {
  const weakTopics = topics.filter((t) => t.accuracy < 60);
  const strongTopics = topics.filter((t) => t.accuracy >= 75);

  return (
    <div className="bg-slate-900/90 rounded-2xl p-6 border border-slate-800 shadow-xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-bold mb-1">
            <BrainCircuit className="w-3.5 h-3.5 text-cyan-400 animate-pulse" /> Candidate DSA Skill Profile
          </div>
          <h3 className="text-xl font-black text-white tracking-tight">Algorithmic Competencies</h3>
          <p className="text-slate-400 text-xs mt-0.5">
            Per-topic accuracy tracking driven by interview submissions & Codeforces problem solving.
          </p>
        </div>

        <Link
          href="/setup"
          className="px-5 py-2.5 rounded-xl text-xs font-black bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 transition-all hover:scale-105"
        >
          Practice Weak Areas
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Weak & Strong Summary Pills */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-800/80">
          <div className="text-xs font-extrabold text-emerald-400 flex items-center gap-1.5 mb-1.5">
            <CheckCircle2 className="w-4 h-4" /> Strongest Competencies ({strongTopics.length}):
          </div>
          <div className="flex flex-wrap gap-1.5">
            {strongTopics.map((st) => (
              <span key={st.topicKey} className="px-2.5 py-0.5 rounded-lg bg-emerald-500/20 text-emerald-200 border border-emerald-500/30 text-[11px] font-bold">
                {st.label} ({st.accuracy}%)
              </span>
            ))}
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-800/80">
          <div className="text-xs font-extrabold text-rose-400 flex items-center gap-1.5 mb-1.5">
            <AlertCircle className="w-4 h-4" /> Focus Areas for Practice ({weakTopics.length}):
          </div>
          <div className="flex flex-wrap gap-1.5">
            {weakTopics.map((wt) => (
              <span key={wt.topicKey} className="px-2.5 py-0.5 rounded-lg bg-rose-500/20 text-rose-200 border border-rose-500/30 text-[11px] font-bold">
                {wt.label} ({wt.accuracy}%)
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Detailed Topic Progress Bars */}
      <div className="space-y-4 pt-2">
        <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Detailed Topic Mastery Breakdown</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
          {topics.map((item) => {
            const isWeak = item.accuracy < 60;
            const isStrong = item.accuracy >= 75;
            const barColor = isStrong ? 'bg-emerald-400' : isWeak ? 'bg-rose-400' : 'bg-amber-400';
            const badgeColor = isStrong
              ? 'text-emerald-400 bg-emerald-950 border-emerald-800'
              : isWeak
              ? 'text-rose-400 bg-rose-950 border-rose-800'
              : 'text-amber-400 bg-amber-950 border-amber-800';

            return (
              <div key={item.topicKey} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-200 flex items-center gap-1.5">
                    {item.label}
                    <span className="text-[10px] text-slate-400 font-mono">
                      ({item.successful}/{item.attempts} solved)
                    </span>
                  </span>
                  <span className={`font-mono text-[11px] font-bold px-2 py-0.5 rounded-md border ${badgeColor}`}>
                    {item.accuracy}%
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-950 overflow-hidden border border-slate-800">
                  <div className={`h-full rounded-full ${barColor} transition-all duration-500`} style={{ width: `${item.accuracy}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
