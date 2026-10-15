'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Navbar } from '../../components/Navbar';
import { SkillRadarChart } from '../../components/SkillRadarChart';
import { DSAProfileCard } from '../../components/DSAProfileCard';
import { TWENTY_COMPANIES } from '../../lib/companies';
import {
  TrendingUp,
  Play,
  Sparkles,
  Building2,
  Code2,
  Brain,
  ArrowRight,
  Target,
  CheckCircle2,
  Zap,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import axios from 'axios';

export default function DashboardPage() {
  const [stats, setStats] = useState<any>({
    totalInterviews: 4,
    completedCount: 4,
    avgOverallScore: 88,
    skillBreakdown: [
      { subject: 'Technical Domain', score: 88, fullMark: 100 },
      { subject: 'Behavioral STAR', score: 82, fullMark: 100 },
      { subject: 'Problem Solving', score: 90, fullMark: 100 },
      { subject: 'Communication', score: 84, fullMark: 100 },
      { subject: 'Coding Speed', score: 86, fullMark: 100 },
    ],
    historicalProgress: [
      { sessionName: 'Mock #1', date: 'Sep 20', score: 72 },
      { sessionName: 'Mock #2', date: 'Sep 21', score: 78 },
      { sessionName: 'Mock #3', date: 'Sep 23', score: 83 },
      { sessionName: 'Mock #4', date: 'Sep 24', score: 88 },
    ],
    recentSessions: [
      { sessionId: 'SESSION_DEMO_LOCAL', targetRole: 'Full Stack Engineer', mode: 'Full Mock', overallScore: 88, date: '2026-09-24' },
      { sessionId: 'SESSION_MOCK_02', targetRole: 'Backend Engineer', mode: 'Technical Only', overallScore: 83, date: '2026-09-23' },
    ],
  });

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const res = await axios.get('http://localhost:5001/api/analytics/dashboard/user_demo');
        if (res.data?.stats) {
          setStats(res.data.stats);
        }
      } catch (e) {}
    };
    fetchDashboardStats();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc] dark:bg-[#040711] text-slate-900 dark:text-slate-100 transition-colors duration-300">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-10 space-y-8">
        {/* Dashboard Title & Quick Action Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border-b border-slate-200 dark:border-slate-800 pb-6">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 text-xs font-extrabold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              DEVELOPER DASHBOARD
            </div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Candidate Analytics & Practice Hub</h1>
            <p className="text-slate-500 dark:text-slate-400 text-xs font-normal">
              Monitor your interview score progression, topic mastery, and target company preparation.
            </p>
          </div>

          {/* Quick Actions Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
            <Link
              href="/setup"
              className="px-5 py-3 rounded-xl font-bold text-xs bg-blue-600 hover:bg-blue-500 text-white shadow-md flex items-center gap-1.5 transition-all"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              Start Interview
            </Link>
            <Link
              href="/setup?mode=Coding"
              className="px-4 py-3 rounded-xl font-bold text-xs bg-white dark:bg-slate-900 hover:bg-slate-50 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-1.5 transition-all"
            >
              <Code2 className="w-3.5 h-3.5 text-blue-600" />
              Practice DSA
            </Link>
            <Link
              href="/companies"
              className="px-4 py-3 rounded-xl font-bold text-xs bg-white dark:bg-slate-900 hover:bg-slate-50 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-1.5 transition-all"
            >
              <Building2 className="w-3.5 h-3.5 text-emerald-600" />
              Company Training
            </Link>
          </div>
        </div>

        {/* Top Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="bg-white dark:bg-[#0c1220] rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Average Score</div>
            <div className="text-3xl font-black text-blue-600 dark:text-blue-400 font-mono mt-2 flex items-center gap-2">
              {stats.avgOverallScore}%
              <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold flex items-center">
                <TrendingUp className="w-3.5 h-3.5 mr-0.5" /> +12%
              </span>
            </div>
            <div className="text-[11px] text-slate-500 mt-1">Evidence-based evaluation</div>
          </div>

          <div className="bg-white dark:bg-[#0c1220] rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Completed Sessions</div>
            <div className="text-3xl font-black text-indigo-600 dark:text-indigo-400 font-mono mt-2">{stats.completedCount}</div>
            <div className="text-[11px] text-slate-500 mt-1">Technical & behavioral</div>
          </div>

          <div className="bg-white dark:bg-[#0c1220] rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Personalized Plan</div>
            <div className="text-xl font-extrabold text-blue-600 dark:text-blue-400 mt-2">Active AI Coach</div>
            <Link href="/learning" className="text-[11px] text-blue-600 dark:text-blue-400 font-bold hover:underline mt-1 block">
              View Learning Plan →
            </Link>
          </div>

          <div className="bg-white dark:bg-[#0c1220] rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Code Execution Sandbox</div>
            <div className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-2">Isolated Sandbox Active</div>
            <div className="text-[11px] text-slate-500 mt-1">JS / Python / C++ / Java</div>
          </div>
        </div>

        {/* Continue Improving — Personalized Learning Loop Widget */}
        <div className="bg-gradient-to-r from-blue-900/20 via-slate-900 to-indigo-900/20 p-6 rounded-2xl border border-blue-500/20 shadow-lg space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-[11px] font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> Continue Improving
              </span>
              <h2 className="text-lg font-extrabold text-white">Targeted Weakness Learning Loop</h2>
            </div>

            <Link
              href="/learning"
              className="text-xs font-extrabold text-blue-400 hover:text-blue-300 hover:underline flex items-center gap-1"
            >
              View Full Learning Dashboard <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
            <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
              <div className="flex justify-between items-start">
                <span className="text-xs font-bold text-white">Graph Algorithms</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20">41% Mastery</span>
              </div>
              <p className="text-[11px] text-slate-400 line-clamp-2">Flagged for BFS vs DFS selection and queue visited arrays.</p>
              <Link
                href="/learning/Graph%20Algorithms"
                className="w-full py-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600 text-blue-300 hover:text-white font-bold text-[11px] transition-all flex items-center justify-center gap-1 mt-2"
              >
                <span>Continue Learning</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
              <div className="flex justify-between items-start">
                <span className="text-xs font-bold text-white">Spring Dependency Injection</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">54% Mastery</span>
              </div>
              <p className="text-[11px] text-slate-400 line-clamp-2">Focus on Constructor Injection vs Field Injection and singleton bean scope.</p>
              <Link
                href="/learning/Spring%20Dependency%20Injection"
                className="w-full py-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600 text-blue-300 hover:text-white font-bold text-[11px] transition-all flex items-center justify-center gap-1 mt-2"
              >
                <span>Continue Learning</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
              <div className="flex justify-between items-start">
                <span className="text-xs font-bold text-white">Database Indexing</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">63% Mastery</span>
              </div>
              <p className="text-[11px] text-slate-400 line-clamp-2">Review B-Tree query mechanics and composite index column ordering rules.</p>
              <Link
                href="/learning/Database%20Indexing"
                className="w-full py-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600 text-blue-300 hover:text-white font-bold text-[11px] transition-all flex items-center justify-center gap-1 mt-2"
              >
                <span>Continue Learning</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>

        {/* Company-Specific Interview Training Section */}
        <div className="bg-white dark:bg-[#0c1220] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <h2 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Building2 className="w-5 h-5 text-blue-600" />
                Company-Specific Interview Training
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-normal">
                Practice interview questions and patterns commonly reported for leading technology companies.
              </p>
            </div>

            <Link
              href="/companies"
              className="text-xs font-extrabold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
            >
              Explore 20 Companies <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Carousel / Quick Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 pt-2">
            {TWENTY_COMPANIES.slice(0, 6).map((c) => (
              <Link
                key={c.id}
                href={`/companies/${c.id}`}
                className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 hover:border-blue-500 text-center space-y-1.5 transition-all group"
              >
                <div className="text-2xl">{c.logo}</div>
                <div className="font-extrabold text-xs text-slate-900 dark:text-white group-hover:text-blue-600">{c.name}</div>
                <div className="text-[9px] text-slate-500 font-medium line-clamp-1">{c.primaryFocus}</div>
              </Link>
            ))}
          </div>
        </div>

        {/* Candidate DSA Skill Profile Card */}
        <DSAProfileCard />

        {/* Trend Area Chart & Radar */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-7 bg-white dark:bg-[#0c1220] rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-500" /> Score Progression
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.historicalProgress}>
                  <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} />
                  <YAxis domain={[0, 100]} stroke="#94a3b8" fontSize={11} />
                  <Tooltip />
                  <Area type="monotone" dataKey="score" stroke="#2563eb" fill="#3b82f6" fillOpacity={0.15} strokeWidth={3} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="lg:col-span-5 bg-white dark:bg-[#0c1220] rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 className="font-bold text-slate-900 dark:text-white text-base mb-4 flex items-center gap-2">
              <Brain className="w-5 h-5 text-indigo-500" /> Skill Breakdown
            </h3>
            <SkillRadarChart data={stats.skillBreakdown} />
          </div>
        </div>
      </main>
    </div>
  );
}
