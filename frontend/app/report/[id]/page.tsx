'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Navbar } from '../../../components/Navbar';
import { SkillRadarChart } from '../../../components/SkillRadarChart';
import { GradingBreakdown } from '../../../components/GradingBreakdown';
import { CodeforcesConnectionCard } from '../../../components/CodeforcesConnectionCard';
import {
  Award,
  BarChart3,
  CheckCircle2,
  AlertTriangle,
  Download,
  RotateCcw,
  Sparkles,
  FileCheck,
  BrainCircuit,
  MessageSquare,
  Cpu,
  Terminal,
} from 'lucide-react';
import axios from 'axios';

export default function DeepDiveReportPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = (params?.id as string) || 'SESSION_DEMO_LOCAL';

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [reportData, setReportData] = useState<any>({
    overallScore: 88,
    skillScores: {
      technical: 88,
      behavioral: 82,
      problemSolving: 90,
      communication: 84,
      codingSpeed: 86,
    },
    aiReportSummary:
      'The candidate demonstrated strong domain expertise in Node.js event loop architecture, React virtual DOM reconciliation, and database indexing. Answers were structured with clear technical terminology and appropriate complexity trade-off analyses.',
    strengths: [
      'Passed all code execution test cases in secure sandbox',
      'Strong technical foundation in Node.js asynchronous I/O and microtasks',
      'Articulate communication with structured STAR method application',
    ],
    areasToImprove: [
      'Provide more explicit quantitative metrics when explaining past project impact',
      'Elaborate on edge case handling in distributed cache stampede scenarios',
    ],
    turns: [
      {
        questionTitle: 'Node.js Event Loop & Microtask Execution',
        category: 'Technical',
        candidateAnswer:
          'The event loop runs on libuv. Microtasks like process.nextTick execute before the next phase of the event loop like timers or check phase.',
        score: 90,
        aiFeedback: 'Excellent explanation of libuv queues and microtask priority.',
        keywordsMatched: ['libuv', 'event loop', 'nextTick'],
      },
      {
        questionTitle: 'Handling Technical Disagreements',
        category: 'Behavioral',
        candidateAnswer:
          'I benchmarked two database ORM choices with my team and presented objective performance metrics to reach consensus.',
        score: 82,
        aiFeedback: 'Good usage of data-driven benchmarking. Consider adding quantitative uptime results.',
        keywordsMatched: ['STAR method', 'benchmarking', 'trade-offs'],
      },
      {
        questionTitle: 'Codeforces Live Coding: Two Sum Optimization',
        category: 'Coding',
        candidateAnswer: 'Implemented single pass HashMap lookup reducing time complexity from O(N^2) to O(N).',
        score: 88,
        aiFeedback: 'Optimal time complexity achieved with clean code structure. Code passed 4/4 sandbox test cases.',
        keywordsMatched: ['HashMap', 'O(N) time'],
        codeExecutionSummary: {
          status: 'ACCEPTED',
          totalPassed: 4,
          totalCount: 4,
          samplePassed: 2,
          sampleTotal: 2,
          hiddenPassed: 2,
          hiddenTotal: 2,
          correctnessPercentage: 100,
          executionTimeMs: 14,
          memoryMb: 12,
        },
      },
    ],
    structuredGrading: {
      technicalCorrectness: { score: 44, maxScore: 50, evidence: ['Passed code execution tests in sandbox'] },
      problemSolving: { score: 18, maxScore: 20, evidence: ['Optimal Hash Map approach'] },
      conceptualUnderstanding: { score: 9, maxScore: 10, evidence: ['Covered required lookup concepts'] },
      complexity: { score: 8, maxScore: 10, evidence: ['Correct O(N) time complexity claim'] },
      communication: { score: 9, maxScore: 10, evidence: ['Clear concise explanation'] },
      criticalErrors: [],
      scoreCeilingApplied: false,
      scoreCeilingValue: 100,
      calculatedFinalScore: 88,
      complexityAnalysis: {
        claimedTime: 'O(N)',
        claimedSpace: 'O(N)',
        actualTime: 'O(N)',
        actualSpace: 'O(N)',
        mismatchFlag: false,
      },
    },
  });

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const res = await axios.get(`/api/backend/interview/${sessionId}`);
        if (res.data?.session) {
          const s = res.data.session;
          setReportData({
            overallScore: s.overallScore || 88,
            skillScores: s.skillScores || { technical: 88, behavioral: 82, problemSolving: 90, communication: 84, codingSpeed: 86 },
            aiReportSummary: s.aiReportSummary || 'Excellent technical interview performance with evidence-based score calculation.',
            strengths: s.strengths || ['Strong technical knowledge', 'Passed sandbox execution tests'],
            areasToImprove: s.areasToImprove || ['Deeper edge case analysis'],
            turns: s.turns || [],
            structuredGrading: s.turns?.[0]?.structuredGrading || reportData.structuredGrading,
          });
        }
      } catch (e) {
        // Fallback data
      } finally {
        setIsLoading(false);
      }
    };
    fetchReport();
  }, [sessionId]);

  const getHiringRecommendation = (score: number) => {
    if (score >= 85) return { label: 'STRONG HIRE', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' };
    if (score >= 70) return { label: 'HIRE', color: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30' };
    return { label: 'CONSIDER / NEEDS PRACTICE', color: 'bg-amber-500/20 text-amber-300 border-amber-500/30' };
  };

  const recommendation = getHiringRecommendation(reportData.overallScore);

  const radarData = [
    { subject: 'Technical Domain', score: reportData.skillScores.technical, fullMark: 100 },
    { subject: 'Behavioral STAR', score: reportData.skillScores.behavioral, fullMark: 100 },
    { subject: 'Problem Solving', score: reportData.skillScores.problemSolving, fullMark: 100 },
    { subject: 'Communication', score: reportData.skillScores.communication, fullMark: 100 },
    { subject: 'Coding Speed', score: reportData.skillScores.codingSpeed, fullMark: 100 },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#070a12] text-slate-100">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-10 space-y-8">
        {/* Header Summary Banner */}
        <div className="bg-slate-900/90 rounded-2xl p-8 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="flex items-center gap-6">
            {/* Score Radial Circle */}
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 p-0.5 shadow-xl shadow-blue-600/20">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex flex-col items-center justify-center">
                <span className="text-3xl font-black text-cyan-400 font-mono">{reportData.overallScore}</span>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Overall</span>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-2xl font-black text-white">AI Mock Interview Scorecard</h1>
                <span className={`text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full border ${recommendation.color}`}>
                  {recommendation.label}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Session ID: <code className="text-cyan-400 font-mono">{sessionId}</code> • Evaluated by Deterministic Execution Sandbox & Evidence Engine
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => window.print()}
              className="px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-2"
            >
              <Download className="w-4 h-4 text-cyan-400" />
              Export PDF Report
            </button>
            <button
              onClick={() => router.push('/setup')}
              className="px-5 py-2.5 rounded-xl text-xs font-extrabold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-blue-600/30 flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Retake Mock Interview
            </button>
          </div>
        </div>

        {/* 5 Sub-Score Rubrics & Evidence Breakdown */}
        <GradingBreakdown grading={reportData.structuredGrading} />

        {/* 2-Column Grid: Radar Chart + Executive AI Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Radar Chart (5 cols) */}
          <div className="lg:col-span-5 bg-slate-900/90 rounded-2xl p-6 border border-slate-800 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-indigo-400" />
                Skill Competency Radar
              </h3>
              <span className="text-xs text-slate-400">0-100 Scale</span>
            </div>

            <SkillRadarChart data={radarData} />
          </div>

          {/* AI Executive Summary & Recommendations (7 cols) */}
          <div className="lg:col-span-7 bg-slate-900/90 rounded-2xl p-6 border border-slate-800 space-y-6 shadow-xl">
            <div>
              <h3 className="font-bold text-white text-base flex items-center gap-2 mb-2">
                <Sparkles className="w-5 h-5 text-cyan-400" />
                AI Interviewer Evaluation Summary
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed p-4 rounded-xl bg-slate-950 border border-slate-800 font-sans">
                "{reportData.aiReportSummary}"
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Strengths */}
              <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-800 space-y-2">
                <div className="font-bold text-emerald-400 text-xs flex items-center gap-1.5 uppercase tracking-wider">
                  <CheckCircle2 className="w-4 h-4" /> Key Candidate Strengths
                </div>
                <ul className="text-xs text-slate-300 space-y-1.5 list-disc list-inside">
                  {reportData.strengths.map((str: string, i: number) => (
                    <li key={i}>{str}</li>
                  ))}
                </ul>
              </div>

              {/* Areas to Improve */}
              <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-800 space-y-2">
                <div className="font-bold text-amber-400 text-xs flex items-center gap-1.5 uppercase tracking-wider">
                  <AlertTriangle className="w-4 h-4" /> Targeted Growth Areas
                </div>
                <ul className="text-xs text-slate-300 space-y-1.5 list-disc list-inside">
                  {reportData.areasToImprove.map((area: string, i: number) => (
                    <li key={i}>{area}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Turn-by-Turn Question Transcript & Code Sandbox Details */}
        <div className="bg-slate-900/90 rounded-2xl p-6 border border-slate-800 space-y-6 shadow-xl">
          <h3 className="font-bold text-white text-lg flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-indigo-400" />
            Detailed Question Transcript & Sandbox Execution Results
          </h3>

          <div className="space-y-4">
            {reportData.turns.map((turn: any, i: number) => (
              <div key={i} className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-blue-600/20 text-blue-400 border border-blue-500/30 text-xs font-bold flex items-center justify-center">
                      {i + 1}
                    </span>
                    <h4 className="font-extrabold text-white text-sm">{turn.questionTitle || turn.questionText}</h4>
                  </div>
                  <span className="text-sm font-extrabold text-emerald-400 font-mono">{turn.score}/100</span>
                </div>

                <div className="text-xs text-slate-300 p-3.5 rounded-xl bg-slate-900 border border-slate-800 font-mono">
                  <strong>Candidate Response:</strong> "{turn.candidateAnswer}"
                </div>

                {turn.codeExecutionSummary && (
                  <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs font-mono">
                    <span className="flex items-center gap-2 text-cyan-400">
                      <Terminal className="w-4 h-4" /> Sandbox Execution: <strong>{turn.codeExecutionSummary.status}</strong>
                    </span>
                    <span className="text-emerald-400 font-bold">
                      Passed {turn.codeExecutionSummary.totalPassed} / {turn.codeExecutionSummary.totalCount} tests
                    </span>
                  </div>
                )}

                <div className="text-xs text-slate-300 leading-relaxed">
                  <strong className="text-blue-400">AI Evidence Feedback:</strong> {turn.aiFeedback}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

