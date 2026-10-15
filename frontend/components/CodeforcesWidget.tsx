'use client';

import React from 'react';
import { Award, Zap, CheckCircle2, User } from 'lucide-react';

interface CodeforcesWidgetProps {
  stats?: {
    handle: string;
    rank: string;
    rating: number;
    maxRating: number;
    solvedCount: number;
    avatar?: string;
  };
}

export const CodeforcesWidget: React.FC<CodeforcesWidgetProps> = ({
  stats = {
    handle: 'tourist_mock',
    rank: 'Candidate Master',
    rating: 1920,
    maxRating: 1980,
    solvedCount: 420,
  },
}) => {
  return (
    <div className="glass-card rounded-2xl p-5 border border-indigo-500/20 bg-slate-900/60 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 p-0.5 shadow-lg shadow-cyan-500/20">
          <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
            {stats.avatar ? (
              <img src={stats.avatar} alt={stats.handle} className="w-full h-full rounded-[10px] object-cover" />
            ) : (
              <User className="w-6 h-6 text-cyan-400" />
            )}
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2">
            <h4 className="font-bold text-slate-100 text-base">{stats.handle}</h4>
            <span className="text-[10px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              {stats.rank}
            </span>
          </div>
          <div className="flex items-center gap-4 text-xs text-slate-400 mt-1">
            <span className="flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-amber-400" /> Rating: <strong className="text-amber-300">{stats.rating}</strong>
            </span>
            <span className="flex items-center gap-1">
              <Award className="w-3.5 h-3.5 text-purple-400" /> Max: <strong className="text-purple-300">{stats.maxRating}</strong>
            </span>
          </div>
        </div>
      </div>

      <div className="text-right">
        <div className="text-xs text-slate-400">Codeforces Solved</div>
        <div className="text-lg font-bold text-emerald-400 flex items-center justify-end gap-1">
          <CheckCircle2 className="w-4 h-4" /> {stats.solvedCount}
        </div>
      </div>
    </div>
  );
};
