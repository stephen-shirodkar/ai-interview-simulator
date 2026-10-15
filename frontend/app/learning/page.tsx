'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { BookOpen, TrendingUp, AlertTriangle, CheckCircle2, ArrowRight, ShieldAlert, Sparkles, Target, Zap, Clock } from 'lucide-react';

interface Weakness {
  _id: string;
  topic: string;
  category: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  score: number;
  confidence: number;
  evidence: Array<{ questionId: string; reason: string; missingConcepts?: string[]; incorrectConcepts?: string[] }>;
  recommendedAction: string;
}

interface MasteryItem {
  topic: string;
  category: string;
  estimatedScore: number;
  confidence: number;
  evidenceCount: number;
  trend: 'IMPROVING' | 'STABLE' | 'DECLINING' | 'INSUFFICIENT_DATA';
  lastAssessedAt: string;
}

export default function LearningDashboardPage() {
  const [weaknesses, setWeaknesses] = useState<Weakness[]>([]);
  const [masteryList, setMasteryList] = useState<MasteryItem[]>([]);
  const [metrics, setMetrics] = useState({
    activeWeaknessesCount: 0,
    topicsImproved: 0,
    practiceQuestionsCompleted: 0,
    learningStreakDays: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const res = await fetch('http://localhost:5001/api/learning/dashboard');
      const data = await res.json();
      if (data.success) {
        setWeaknesses(data.weaknesses || []);
        setMasteryList(data.masteryList || []);
        setMetrics(data.metrics || { activeWeaknessesCount: 0, topicsImproved: 0, practiceQuestionsCompleted: 0, learningStreakDays: 0 });
      }
    } catch (err) {
      console.error('Failed to fetch learning dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const getSeverityBadge = (sev: string) => {
    switch (sev) {
      case 'CRITICAL':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-500/10 text-rose-500 border border-rose-500/20 flex items-center gap-1"><ShieldAlert className="w-3 h-3" /> Critical Priority</span>;
      case 'HIGH':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20 flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> High Priority</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-500/10 text-blue-500 border border-blue-500/20 flex items-center gap-1"><Target className="w-3 h-3" /> Medium Priority</span>;
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'IMPROVING':
        return <span className="text-emerald-500 font-bold flex items-center gap-1 text-xs"><TrendingUp className="w-3.5 h-3.5" /> Improving</span>;
      case 'DECLINING':
        return <span className="text-rose-500 font-bold flex items-center gap-1 text-xs"><AlertTriangle className="w-3.5 h-3.5" /> Declining</span>;
      default:
        return <span className="text-slate-400 font-semibold flex items-center gap-1 text-xs"><Clock className="w-3.5 h-3.5" /> Stable</span>;
    }
  };

  return (
    <main className="min-h-screen bg-[#060913] text-white py-10 px-6 font-sans">
      <div className="max-w-7xl mx-auto space-y-10">
        
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <div className="flex items-center gap-2 text-blue-400 text-xs font-bold uppercase tracking-wider mb-1">
              <Sparkles className="w-4 h-4" /> Evidence-Based AI Learning Loop
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white">Personalized Learning Plan</h1>
            <p className="text-slate-400 text-sm mt-1">
              Automatically generated from your actual technical interview evaluations and verified RAG vector content.
            </p>
          </div>
          <Link
            href="/setup"
            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-500/20 transition-all flex items-center gap-2 self-start md:self-auto"
          >
            <Zap className="w-4 h-4" /> Practice Full Mock Interview
          </Link>
        </div>

        {/* Stats Metrics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800/80 space-y-2">
            <span className="text-xs text-slate-400 font-semibold">Active Weaknesses</span>
            <div className="text-2xl font-black text-amber-400">{metrics.activeWeaknessesCount}</div>
            <span className="text-[11px] text-slate-500">Requires targeted practice</span>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800/80 space-y-2">
            <span className="text-xs text-slate-400 font-semibold">Topics Improved</span>
            <div className="text-2xl font-black text-emerald-400">+{metrics.topicsImproved}</div>
            <span className="text-[11px] text-emerald-500/80 font-medium">Positive mastery trend</span>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800/80 space-y-2">
            <span className="text-xs text-slate-400 font-semibold">Practice Questions</span>
            <div className="text-2xl font-black text-blue-400">{metrics.practiceQuestionsCompleted}</div>
            <span className="text-[11px] text-slate-500">Completed in targeted mode</span>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800/80 space-y-2">
            <span className="text-xs text-slate-400 font-semibold">Learning Streak</span>
            <div className="text-2xl font-black text-purple-400">{metrics.learningStreakDays} Days</div>
            <span className="text-[11px] text-slate-500">Consistent learning pace</span>
          </div>
        </div>

        {/* Priority Weaknesses Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-blue-400" /> Focus Areas & Priority Weaknesses
            </h2>
            <span className="text-xs text-slate-400">Prioritized by error severity & evidence</span>
          </div>

          {loading ? (
            <div className="p-12 text-center text-slate-500 bg-slate-900/50 rounded-2xl border border-slate-800 animate-pulse">
              Loading your personalized learning plan...
            </div>
          ) : weaknesses.length === 0 ? (
            <div className="p-10 text-center bg-slate-900/40 rounded-2xl border border-slate-800 space-y-3">
              <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
              <h3 className="text-lg font-bold text-white">No Critical Weaknesses Flagged!</h3>
              <p className="text-slate-400 text-xs max-w-md mx-auto">
                Complete a mock interview to allow the AI diagnosis engine to identify specific technical improvement areas.
              </p>
              <Link
                href="/setup"
                className="inline-flex items-center gap-2 text-xs font-bold text-blue-400 hover:text-blue-300 pt-2"
              >
                Start an Interview <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {weaknesses.map((w) => (
                <div
                  key={w._id}
                  className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800/90 hover:border-slate-700 transition-all flex flex-col justify-between space-y-5 shadow-xl"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">{w.category}</span>
                      {getSeverityBadge(w.severity)}
                    </div>

                    <h3 className="text-lg font-extrabold text-white tracking-tight">{w.topic}</h3>

                    {/* Mastery Bar */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-slate-400">Estimated Mastery</span>
                        <span className={w.score < 50 ? 'text-rose-400' : 'text-amber-400'}>{w.score}%</span>
                      </div>
                      <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            w.score < 50 ? 'bg-rose-500' : w.score < 70 ? 'bg-amber-500' : 'bg-emerald-500'
                          }`}
                          style={{ width: `${w.score}%` }}
                        />
                      </div>
                    </div>

                    {/* Evidence Quote */}
                    {w.evidence && w.evidence.length > 0 && (
                      <p className="text-xs text-slate-400 bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 italic line-clamp-3">
                        "{w.evidence[0].reason}"
                      </p>
                    )}
                  </div>

                  <Link
                    href={`/learning/${encodeURIComponent(w.topic)}`}
                    className="w-full py-2.5 rounded-xl bg-blue-600/20 hover:bg-blue-600 text-blue-300 hover:text-white border border-blue-500/30 font-bold text-xs transition-all flex items-center justify-center gap-2 group"
                  >
                    <span>Review → Practice → Test</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Topic Mastery Summary Table */}
        <div className="space-y-4 pt-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-400" /> Overall Topic Mastery Tracking
          </h2>

          <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/60">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
                <tr>
                  <th className="p-4">Topic</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Estimated Mastery</th>
                  <th className="p-4">Evidence Count</th>
                  <th className="p-4">Trend</th>
                  <th className="p-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300 font-medium">
                {masteryList.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-6 text-center text-slate-500">
                      No mastery history recorded yet. Complete an interview to track performance trends.
                    </td>
                  </tr>
                ) : (
                  masteryList.map((m, idx) => (
                    <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                      <td className="p-4 font-bold text-white">{m.topic}</td>
                      <td className="p-4 text-slate-400">{m.category}</td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white">{m.estimatedScore}%</span>
                          <div className="w-20 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-blue-500 rounded-full"
                              style={{ width: `${m.estimatedScore}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-slate-400">{m.evidenceCount} evaluations</td>
                      <td className="p-4">{getTrendIcon(m.trend)}</td>
                      <td className="p-4 text-right">
                        <Link
                          href={`/learning/${encodeURIComponent(m.topic)}`}
                          className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-bold transition-all"
                        >
                          Learn & Practice
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </main>
  );
}
