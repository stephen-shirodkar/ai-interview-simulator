'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Navbar } from '../../components/Navbar';
import { TWENTY_COMPANIES } from '../../lib/companies';
import {
  FileText,
  Code2,
  Briefcase,
  Play,
  CheckCircle2,
  Sparkles,
  Clock,
  Building2,
  Layers,
  ArrowRight,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import axios from 'axios';

export default function SetupPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialCompany = searchParams.get('company') || '';
  const initialMode = searchParams.get('mode') || 'Full Mock';

  // Config State
  const [interviewType, setInterviewType] = useState<string>(initialMode);
  const [targetRole, setTargetRole] = useState<string>('Software Engineer');
  const [experienceLevel, setExperienceLevel] = useState<string>('Mid');
  const [difficulty, setDifficulty] = useState<string>('Medium');
  const [durationMinutes, setDurationMinutes] = useState<number>(45);
  const [companyId, setCompanyId] = useState<string>(initialCompany);
  const [selectedTopics, setSelectedTopics] = useState<string[]>(['Arrays', 'Binary Search']);
  const [resumeText, setResumeText] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const availableTopics = [
    'Arrays',
    'Strings',
    'Hashing',
    'Two Pointers',
    'Sliding Window',
    'Binary Search',
    'Sorting',
    'Linked Lists',
    'Stacks',
    'Queues',
    'Heaps',
    'Trees',
    'Graphs',
    'BFS',
    'DFS',
    'Topological Sort',
    'Greedy',
    'Dynamic Programming',
    'System Design',
    'Behavioral',
  ];

  const toggleTopic = (t: string) => {
    if (selectedTopics.includes(t)) {
      setSelectedTopics(selectedTopics.filter((x) => x !== t));
    } else {
      setSelectedTopics([...selectedTopics, t]);
    }
  };

  // Calculate dynamic question count & time budget estimate
  const availableQuestionTime = durationMinutes === 30 ? 26 : durationMinutes === 60 ? 54 : 40;
  const avgQuestionDuration = interviewType === 'Behavioral' ? 6 : interviewType === 'System Design' ? 18 : 9;
  const estimatedQuestionCount = Math.max(2, Math.round(availableQuestionTime / avgQuestionDuration));

  // Launch AI Interview Session
  const handleStartSession = async () => {
    setIsLoading(true);
    try {
      const res = await axios.post('http://localhost:5001/api/interview/start', {
        targetRole,
        resumeText,
        mode: interviewType,
        difficulty,
        durationMinutes,
        companyId,
        topics: selectedTopics,
        experienceLevel,
      });

      if (res.data?.sessionId) {
        router.push(`/interview/${res.data.sessionId}`);
      } else {
        router.push('/interview/SESSION_DEMO_LOCAL');
      }
    } catch (e) {
      router.push('/interview/SESSION_DEMO_LOCAL');
    } finally {
      setIsLoading(false);
    }
  };

  const selectedCompanyObj = TWENTY_COMPANIES.find((c) => c.id.toLowerCase() === companyId.toLowerCase());

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc] dark:bg-[#040711] text-slate-900 dark:text-slate-100 transition-colors duration-300">
      <Navbar />

      <main className="flex-1 max-w-5xl mx-auto w-full px-6 py-10 space-y-8">
        {/* Title Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 text-xs font-extrabold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            PERSONALIZED INTERVIEW CONFIGURATION
          </div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">Configure Your Mock Interview</h1>
          <p className="text-slate-500 dark:text-slate-400 text-xs font-normal max-w-lg mx-auto">
            Select your interview type, duration, target company, and technical topics to generate a personalized question set.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Form Controls (7 cols) */}
          <div className="lg:col-span-7 space-y-6 bg-white dark:bg-[#0c1220] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            {/* 1. Interview Duration */}
            <div className="space-y-3">
              <label className="text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-blue-600" />
                Interview Duration
              </label>

              <div className="grid grid-cols-3 gap-3">
                {[
                  { mins: 30, label: '30 min', desc: 'Quick technical screening' },
                  { mins: 45, label: '45 min', desc: 'Standard interview practice' },
                  { mins: 60, label: '60 min', desc: 'Full-length mock simulation' },
                ].map((d) => (
                  <button
                    key={d.mins}
                    type="button"
                    onClick={() => setDurationMinutes(d.mins)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      durationMinutes === d.mins
                        ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-600 dark:border-blue-500 text-blue-600 dark:text-blue-400 shadow-sm'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                    }`}
                  >
                    <div className="font-extrabold text-sm">{d.label}</div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 leading-tight">{d.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Interview Type */}
            <div className="space-y-3">
              <label className="text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-indigo-600" />
                Interview Format & Mode
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {['Full Mock', 'Coding', 'Technical', 'Behavioral', 'System Design', 'Company Specific'].map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setInterviewType(m)}
                    className={`p-2.5 rounded-xl border text-xs font-extrabold transition-all text-center ${
                      interviewType === m
                        ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-600 dark:border-indigo-500 text-indigo-600 dark:text-indigo-400'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Target Role & Difficulty */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300">Target Role</label>
                <select
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold"
                >
                  <option>Software Engineer</option>
                  <option>Full Stack Engineer</option>
                  <option>Frontend Engineer</option>
                  <option>Backend Engineer</option>
                  <option>AI/ML Engineer</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300">Difficulty Level</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {['Easy', 'Medium', 'Hard'].map((diff) => (
                    <button
                      key={diff}
                      type="button"
                      onClick={() => setDifficulty(diff)}
                      className={`py-2 rounded-lg border text-xs font-bold ${
                        difficulty === diff
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {diff}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* 4. Target Company (Optional) */}
            <div className="space-y-2">
              <label className="text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-emerald-600" />
                Target Company (Optional)
              </label>

              <select
                value={companyId}
                onChange={(e) => setCompanyId(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold"
              >
                <option value="">General Practice (No Company Selected)</option>
                {TWENTY_COMPANIES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.logo} {c.name} ({c.primaryFocus})
                  </option>
                ))}
              </select>
            </div>

            {/* 5. DSA Topics Selection */}
            <div className="space-y-2">
              <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300">Selected DSA & Core Topics</label>
              <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-2 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-800">
                {availableTopics.map((topic) => (
                  <button
                    key={topic}
                    type="button"
                    onClick={() => toggleTopic(topic)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-all ${
                      selectedTopics.includes(topic)
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    {topic}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Dynamic Preview & Launch Card (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white dark:bg-[#0c1220] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-md space-y-5">
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-500" />
                Interview Format Preview
              </h2>

              <div className="space-y-3 text-xs">
                <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500">Duration:</span>
                  <span className="font-extrabold text-slate-900 dark:text-white">{durationMinutes} Minutes</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500">Question Time Budget:</span>
                  <span className="font-extrabold text-blue-600 dark:text-blue-400">~{availableQuestionTime} Minutes</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500">Estimated Questions:</span>
                  <span className="font-extrabold text-slate-900 dark:text-white">~{estimatedQuestionCount} Questions</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500">Format:</span>
                  <span className="font-bold text-slate-900 dark:text-white">{interviewType}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500">Difficulty:</span>
                  <span className="font-bold text-amber-600">{difficulty}</span>
                </div>
                {selectedCompanyObj && (
                  <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-slate-500">Company Target:</span>
                    <span className="font-extrabold text-emerald-600 flex items-center gap-1">
                      {selectedCompanyObj.logo} {selectedCompanyObj.name}
                    </span>
                  </div>
                )}
              </div>

              {selectedCompanyObj && (
                <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-amber-900 dark:text-amber-200 text-[11px] leading-tight">
                  Questions will be drawn from community-reported interview patterns for {selectedCompanyObj.name}.
                </div>
              )}

              <button
                onClick={handleStartSession}
                disabled={isLoading}
                className="w-full py-4 rounded-xl font-black text-sm bg-blue-600 hover:bg-blue-500 text-white shadow-xl shadow-blue-500/20 flex items-center justify-center gap-2 transition-all hover:scale-[1.01] disabled:opacity-50"
              >
                {isLoading ? (
                  'Generating Personalized Interview...'
                ) : (
                  <>
                    Start Personalized Interview
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
