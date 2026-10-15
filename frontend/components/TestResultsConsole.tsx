'use client';

import React, { useState } from 'react';
import { CheckCircle2, XCircle, AlertTriangle, Clock, Cpu, Terminal, ShieldAlert } from 'lucide-react';

export interface SingleTestResult {
  input: string;
  expectedOutput: string;
  actualOutput: string;
  passed: boolean;
  status: 'ACCEPTED' | 'WRONG_ANSWER' | 'RUNTIME_ERROR' | 'TIME_LIMIT_EXCEEDED';
  isSample: boolean;
  executionTimeMs: number;
  errorDetails?: string;
}

export interface CodeExecutionSummary {
  status: 'ACCEPTED' | 'WRONG_ANSWER' | 'COMPILE_ERROR' | 'RUNTIME_ERROR' | 'TIME_LIMIT_EXCEEDED' | 'MEMORY_LIMIT_EXCEEDED' | 'PARTIAL';
  totalPassed: number;
  totalCount: number;
  samplePassed: number;
  sampleTotal: number;
  hiddenPassed: number;
  hiddenTotal: number;
  correctnessPercentage: number;
  compileErrorDetails?: string;
  testResults: SingleTestResult[];
  executionTimeMs: number;
  memoryMb: number;
}

export interface TestResultsConsoleProps {
  execution?: CodeExecutionSummary;
  isExecuting?: boolean;
}

export const TestResultsConsole: React.FC<TestResultsConsoleProps> = ({ execution, isExecuting = false }) => {
  const [activeTestIndex, setActiveTestIndex] = useState<number>(0);

  if (isExecuting) {
    return (
      <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 text-center space-y-3">
        <div className="w-8 h-8 mx-auto rounded-full border-4 border-cyan-400 border-t-transparent animate-spin" />
        <div className="text-xs font-bold text-slate-200">Executing Solution in Isolated Sandbox Environment...</div>
        <div className="text-[11px] text-slate-400">Running standard input/output test cases against CPU time limit (3000ms).</div>
      </div>
    );
  }

  if (!execution) {
    return (
      <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 text-xs font-medium flex items-center justify-between">
        <span className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-cyan-400" /> Click <strong>"Run Code"</strong> to execute your code against test cases in the secure sandbox.
        </span>
        <span className="text-[10px] font-mono text-slate-500">Node / Python / C++ / Java</span>
      </div>
    );
  }

  const { status, totalPassed, totalCount, correctnessPercentage, compileErrorDetails, testResults, executionTimeMs, memoryMb } = execution;

  const isAccepted = status === 'ACCEPTED';
  const isCompileErr = status === 'COMPILE_ERROR';

  const statusColor = isAccepted
    ? 'text-emerald-400 bg-emerald-950/80 border-emerald-800'
    : isCompileErr
    ? 'text-rose-400 bg-rose-950/80 border-rose-800'
    : 'text-amber-400 bg-amber-950/80 border-amber-800';

  const activeTest = testResults[activeTestIndex] || testResults[0];

  return (
    <div className="rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden shadow-2xl space-y-4 p-5">
      {/* Header Bar Status Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-3">
          <div className={`px-3 py-1 rounded-xl text-xs font-black border flex items-center gap-1.5 ${statusColor}`}>
            {isAccepted ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            ) : isCompileErr ? (
              <ShieldAlert className="w-4 h-4 text-rose-400" />
            ) : (
              <XCircle className="w-4 h-4 text-amber-400" />
            )}
            {status}
          </div>

          <div className="text-xs font-extrabold text-slate-200">
            Passed {totalPassed} / {totalCount} Test Cases ({correctnessPercentage}%)
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono text-slate-400">
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-cyan-400" /> {executionTimeMs} ms
          </span>
          <span className="flex items-center gap-1">
            <Cpu className="w-3.5 h-3.5 text-purple-400" /> {memoryMb} MB RAM
          </span>
        </div>
      </div>

      {/* Compile Error Console Stacktrace */}
      {isCompileErr && (
        <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-900/80 space-y-2">
          <div className="text-xs font-extrabold text-rose-300 flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-rose-400" /> Compilation Error Output:
          </div>
          <pre className="text-[11px] font-mono text-rose-200/90 overflow-x-auto whitespace-pre-wrap p-3 rounded-lg bg-black/60 border border-rose-900/50 leading-relaxed">
            {compileErrorDetails}
          </pre>
        </div>
      )}

      {/* Test Case Tab Selection & Details */}
      {!isCompileErr && testResults.length > 0 && (
        <div className="space-y-3">
          {/* Test Tabs */}
          <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-2">
            {testResults.map((tc, idx) => (
              <button
                key={idx}
                onClick={() => setActiveTestIndex(idx)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeTestIndex === idx
                    ? 'bg-slate-800 text-white border border-slate-700'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    tc.passed ? 'bg-emerald-400' : 'bg-rose-400'
                  }`}
                />
                Test #{idx + 1} {tc.isSample ? '(Sample)' : '(Hidden)'}
              </button>
            ))}
          </div>

          {/* Selected Test Case Console Display */}
          {activeTest && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
              <div>
                <label className="text-[11px] font-bold text-slate-400 mb-1 block">Input:</label>
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 overflow-x-auto min-h-[60px]">
                  {activeTest.input}
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-400 mb-1 block">Expected Output:</label>
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-emerald-300 overflow-x-auto min-h-[60px]">
                  {activeTest.expectedOutput}
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="text-[11px] font-bold text-slate-400 mb-1 block flex items-center justify-between">
                  <span>Actual Output:</span>
                  <span className={activeTest.passed ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                    {activeTest.passed ? 'PASSED ✓' : `FAILED (${activeTest.status})`}
                  </span>
                </label>
                <div
                  className={`p-3 rounded-xl border font-mono text-xs overflow-x-auto min-h-[60px] ${
                    activeTest.passed
                      ? 'bg-slate-900 border-slate-800 text-slate-100'
                      : 'bg-rose-950/30 border-rose-900 text-rose-200'
                  }`}
                >
                  {activeTest.actualOutput || activeTest.errorDetails || 'No output'}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
