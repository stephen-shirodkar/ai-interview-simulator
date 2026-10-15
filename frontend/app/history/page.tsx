'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSafeAuth } from '../../lib/useSafeAuth';
import { Navbar } from '../../components/Navbar';
import {
  History,
  Calendar,
  Award,
  Play,
  ArrowUpRight,
  BrainCircuit,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { apiClient, setAuthToken } from '../../lib/apiClient';

export default function HistoryPage() {
  const { getToken } = useSafeAuth();
  const [history, setHistory] = useState<any[]>([
    {
      sessionId: 'SESSION_DEMO_LOCAL',
      targetRole: 'Full Stack Engineer',
      mode: 'Full Mock',
      status: 'Completed',
      overallScore: 88,
      createdAt: '2026-09-24T10:58:55Z',
    },
    {
      sessionId: 'SESSION_MOCK_02',
      targetRole: 'Backend Engineer',
      mode: 'Technical Only',
      status: 'Completed',
      overallScore: 83,
      createdAt: '2026-09-23T14:20:10Z',
    },
  ]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        if (getToken) {
          const token = await getToken();
          setAuthToken(token);
        }
        const res = await apiClient.get('/api/interview/history');
        if (res.data?.history) {
          setHistory(res.data.history);
        }
      } catch (e) {
        // Fallback history set
      } finally {
        setIsLoading(false);
      }
    };
    fetchHistory();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-[#070a12] text-slate-100 transition-colors duration-300">
      <Navbar />

      <main className="flex-1 max-w-6xl mx-auto w-full px-6 py-10 space-y-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-bold mb-2">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
              Authenticated Session Log
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight">Mock Interview History</h1>
            <p className="text-slate-400 text-sm mt-1">
              Review your past AI interview transcripts, scores, and coaching reports.
            </p>
          </div>

          <Link
            href="/setup"
            className="px-6 py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-blue-600/25 flex items-center gap-2"
          >
            <Play className="w-4 h-4 fill-current" />
            Start New Mock Session
          </Link>
        </div>

        {/* History Table Container */}
        <div className="bg-slate-900/90 rounded-2xl p-6 border border-slate-800 space-y-4 shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400">
                  <th className="py-3.5 px-4 font-semibold">Session ID</th>
                  <th className="py-3.5 px-4 font-semibold">Target Engineering Role</th>
                  <th className="py-3.5 px-4 font-semibold">Interview Format</th>
                  <th className="py-3.5 px-4 font-semibold">Date</th>
                  <th className="py-3.5 px-4 font-semibold">Score</th>
                  <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {history.map((session, i) => (
                  <tr key={i} className="hover:bg-slate-800/50 transition-colors">
                    <td className="py-3.5 px-4 font-mono text-cyan-400 font-bold">
                      {session.sessionId}
                    </td>
                    <td className="py-3.5 px-4 font-extrabold text-white">{session.targetRole}</td>
                    <td className="py-3.5 px-4 text-slate-300">{session.mode}</td>
                    <td className="py-3.5 px-4 text-slate-400">
                      {new Date(session.createdAt || Date.now()).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-emerald-400 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      {session.overallScore || 88}/100
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Link
                        href={`/report/${session.sessionId}`}
                        className="inline-flex items-center gap-1 text-xs font-bold text-blue-400 hover:text-cyan-300 hover:underline"
                      >
                        View Scorecard <ArrowUpRight className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}

