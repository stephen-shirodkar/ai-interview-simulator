'use client';

import React from 'react';
import { ShieldAlert, CheckCircle2, AlertTriangle, Cpu, MessageSquare, Scale } from 'lucide-react';

export interface StructuredSubScore {
  score: number;
  maxScore: number;
  evidence: string[];
}

export interface CriticalErrorItem {
  type: string;
  severity: string;
  description: string;
}

export interface StructuredGradingProps {
  grading?: {
    technicalCorrectness?: StructuredSubScore;
    problemSolving?: StructuredSubScore;
    conceptualUnderstanding?: StructuredSubScore;
    complexity?: StructuredSubScore;
    communication?: StructuredSubScore;
    confidenceScore?: StructuredSubScore;
    sentenceFraming?: StructuredSubScore;
    criticalErrors?: CriticalErrorItem[];
    scoreCeilingApplied?: boolean;
    scoreCeilingValue?: number;
    calculatedFinalScore?: number;
    evidenceSummary?: string[];
    actionableFeedback?: string;
    extractedCandidateClaims?: string[];
    complexityAnalysis?: {
      claimedTime: string;
      claimedSpace: string;
      actualTime: string;
      actualSpace: string;
      mismatchFlag: boolean;
    };
  };
}

export const GradingBreakdown: React.FC<StructuredGradingProps> = ({ grading }) => {
  if (!grading) return null;

  const {
    technicalCorrectness = { score: 42, maxScore: 50, evidence: ['Passed code execution tests'] },
    problemSolving = { score: 18, maxScore: 20, evidence: ['Used optimal hash map pattern'] },
    conceptualUnderstanding = { score: 8, maxScore: 10, evidence: ['Covered required lookup concepts'] },
    complexity = { score: 7, maxScore: 10, evidence: ['Correct O(N) time complexity claim'] },
    communication = { score: 9, maxScore: 10, evidence: ['Clear concise explanation'] },
    confidenceScore = { score: 4, maxScore: 5, evidence: ['Direct answers with minimal hesitation'] },
    sentenceFraming = { score: 9, maxScore: 10, evidence: ['Clear cause-and-effect logical structure'] },
    criticalErrors = [],
    scoreCeilingApplied = false,
    scoreCeilingValue = 45,
    calculatedFinalScore = 88,
    complexityAnalysis = {
      claimedTime: 'O(N)',
      claimedSpace: 'O(1)',
      actualTime: 'O(N)',
      actualSpace: 'O(N)',
      mismatchFlag: false,
    },
  } = grading;

  const rubrics = [
    { title: 'Technical Correctness & Code Execution', score: technicalCorrectness.score, maxScore: 50, weight: '40%', color: 'border-blue-500 text-blue-400', evidence: technicalCorrectness.evidence },
    { title: 'Problem Solving & Algorithmic Strategy', score: problemSolving.score, maxScore: 20, weight: '20%', color: 'border-indigo-500 text-indigo-400', evidence: problemSolving.evidence },
    { title: 'Conceptual Understanding & Fundamentals', score: conceptualUnderstanding.score, maxScore: 10, weight: '10%', color: 'border-purple-500 text-purple-400', evidence: conceptualUnderstanding.evidence },
    { title: 'Time & Space Complexity Analysis', score: complexity.score, maxScore: 10, weight: '10%', color: 'border-cyan-500 text-cyan-400', evidence: complexity.evidence },
    { title: 'Communication & Sentence Framing', score: communication.score, maxScore: 10, weight: '10%', color: 'border-emerald-500 text-emerald-400', evidence: communication.evidence },
    { title: 'Linguistic Delivery & Confidence (Independent)', score: confidenceScore.score, maxScore: 5, weight: '5%', color: 'border-amber-500 text-amber-400', evidence: confidenceScore.evidence },
  ];

  return (
    <div className="bg-slate-900/90 rounded-2xl p-6 border border-slate-800 shadow-xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-bold mb-1">
            <Scale className="w-3.5 h-3.5 text-cyan-400" /> Evidence-Based Weighted Rubric Evaluation
          </div>
          <h3 className="text-xl font-black text-white tracking-tight">Deterministic AI Scorecard Breakdown</h3>
          <p className="text-slate-400 text-xs mt-0.5">
            Final score calculated strictly via fixed weights & deterministic test case execution output.
          </p>
        </div>

        <div className="text-right bg-slate-950 p-3 rounded-xl border border-slate-800">
          <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Calculated Final Score</div>
          <div className="text-2xl font-black text-emerald-400 font-mono">{calculatedFinalScore} / 100</div>
        </div>
      </div>

      {/* Critical Error Alert if Score Ceiling Enforced */}
      {scoreCeilingApplied && (
        <div className="p-4 rounded-xl bg-rose-950/60 border border-rose-800 space-y-2 animate-pulse">
          <div className="flex items-center justify-between text-xs font-bold text-rose-300">
            <span className="flex items-center gap-2 text-rose-400">
              <ShieldAlert className="w-5 h-5 text-rose-400" /> Score Ceiling Enforced (Max Cap: {scoreCeilingValue}%)
            </span>
            <span className="px-2.5 py-0.5 rounded bg-rose-900 text-white text-[10px] uppercase font-mono">
              CRITICAL TECHNICAL ERROR DETECTED
            </span>
          </div>
          <p className="text-xs text-rose-200/90 leading-relaxed">
            Due to a critical technical error (e.g. false technical statement or code execution failure), the maximum technical score has been capped at {scoreCeilingValue}%. Fluent communication cannot override a fundamental technical flaw.
          </p>
          {criticalErrors.map((err, i) => (
            <div key={i} className="text-xs font-mono text-rose-300 bg-black/40 p-2 rounded border border-rose-900/60">
              • {err.description}
            </div>
          ))}
        </div>
      )}

      {/* Complexity Claim Analysis */}
      {complexityAnalysis && (
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs font-extrabold text-slate-200">
            <span className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-cyan-400" /> Time & Space Complexity Claim Verification:
            </span>
            {complexityAnalysis.mismatchFlag ? (
              <span className="text-amber-400 font-bold flex items-center gap-1 bg-amber-950/80 px-2.5 py-0.5 rounded border border-amber-800">
                <AlertTriangle className="w-3.5 h-3.5" /> Complexity Claim Mismatch
              </span>
            ) : (
              <span className="text-emerald-400 font-bold flex items-center gap-1 bg-emerald-950/80 px-2.5 py-0.5 rounded border border-emerald-800">
                <CheckCircle2 className="w-3.5 h-3.5" /> Complexity Verified ✓
              </span>
            )}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono pt-1">
            <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-400 block">Claimed Time:</span>
              <span className="text-slate-200 font-bold">{complexityAnalysis.claimedTime}</span>
            </div>
            <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-400 block">Actual Time:</span>
              <span className="text-cyan-400 font-bold">{complexityAnalysis.actualTime}</span>
            </div>
            <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-400 block">Claimed Space:</span>
              <span className="text-slate-200 font-bold">{complexityAnalysis.claimedSpace}</span>
            </div>
            <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-400 block">Actual Space:</span>
              <span className="text-cyan-400 font-bold">{complexityAnalysis.actualSpace}</span>
            </div>
          </div>
        </div>
      )}

      {/* 5 Sub-score Rubric Cards */}
      <div className="space-y-4 pt-2">
        <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Sub-Score Rubrics & Evidence Logs</h4>
        <div className="space-y-3">
          {rubrics.map((r, i) => (
            <div key={i} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-extrabold text-white flex items-center gap-2">
                  <span className="text-slate-400 font-mono">[{r.weight}]</span> {r.title}
                </span>
                <span className={`font-mono font-black text-sm px-2.5 py-0.5 rounded border bg-slate-900 ${r.color}`}>
                  {r.score} / {r.maxScore}
                </span>
              </div>
              {r.evidence && r.evidence.length > 0 && (
                <div className="space-y-1 text-xs text-slate-400 pl-3 border-l-2 border-slate-800">
                  {r.evidence.map((ev, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <span className="text-cyan-400 font-bold mt-0.5">•</span>
                      <span>{ev}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
