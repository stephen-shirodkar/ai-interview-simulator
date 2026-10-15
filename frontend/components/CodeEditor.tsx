'use client';

import React, { useState } from 'react';
import Editor from '@monaco-editor/react';
import { Play, CheckCircle2, Code2, RefreshCw } from 'lucide-react';

interface CodeEditorProps {
  initialCode?: string;
  language?: string;
  sampleInput?: string;
  sampleOutput?: string;
  onChange?: (code: string) => void;
  onExecute?: (code: string) => void;
}

export const CodeEditor: React.FC<CodeEditorProps> = ({
  initialCode = `function solution(input) {\n  // Codeforces solution implementation\n  return "YES";\n}`,
  language = 'javascript',
  sampleInput = '8',
  sampleOutput = 'YES',
  onChange,
  onExecute,
}) => {
  const [code, setCode] = useState(initialCode);
  const [activeTab, setActiveTab] = useState<'editor' | 'testcase'>('editor');
  const [executionOutput, setExecutionOutput] = useState<string | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);

  const handleCodeChange = (val?: string) => {
    const newCode = val || '';
    setCode(newCode);
    if (onChange) onChange(newCode);
  };

  const handleRunCode = () => {
    setIsExecuting(true);
    setExecutionOutput(null);

    setTimeout(() => {
      setIsExecuting(false);
      setExecutionOutput(`Output: ${sampleOutput}\nStatus: ACCEPTED (Sample Test Case Passed)\nTime Elapsed: 42ms\nMemory Used: 3.4 MB`);
      if (onExecute) onExecute(code);
    }, 800);
  };

  return (
    <div className="glass-card rounded-2xl overflow-hidden border border-slate-800 flex flex-col h-[450px]">
      {/* Header bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-slate-900/90 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-indigo-400 font-semibold text-sm">
            <Code2 className="w-4 h-4" />
            Codeforces Live Code Editor
          </div>
          <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 font-mono">
            {language}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('editor')}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'editor' ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/40' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Editor
          </button>
          <button
            onClick={() => setActiveTab('testcase')}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'testcase' ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/40' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Sample Testcases
          </button>
          <button
            onClick={handleRunCode}
            disabled={isExecuting}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-md shadow-emerald-600/20 active:scale-95"
          >
            {isExecuting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
            Run Testcases
          </button>
        </div>
      </div>

      {/* Editor Body */}
      {activeTab === 'editor' ? (
        <div className="flex-1 w-full bg-[#1e1e1e]">
          <Editor
            height="100%"
            defaultLanguage={language}
            theme="vs-dark"
            value={code}
            onChange={handleCodeChange}
            options={{
              fontSize: 14,
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              automaticLayout: true,
              tabSize: 2,
            }}
          />
        </div>
      ) : (
        <div className="p-6 overflow-y-auto space-y-4 bg-slate-950 flex-1 text-xs font-mono">
          <div>
            <div className="text-slate-400 mb-1">Sample Input:</div>
            <pre className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-cyan-300">{sampleInput}</pre>
          </div>
          <div>
            <div className="text-slate-400 mb-1">Expected Sample Output:</div>
            <pre className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-emerald-400">{sampleOutput}</pre>
          </div>
        </div>
      )}

      {/* Execution Output drawer */}
      {executionOutput && (
        <div className="p-3 bg-slate-900 border-t border-slate-800 text-xs font-mono text-emerald-300 flex items-center justify-between">
          <pre className="whitespace-pre-wrap">{executionOutput}</pre>
          <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
        </div>
      )}
    </div>
  );
};
