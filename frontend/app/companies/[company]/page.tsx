'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { Navbar } from '../../../components/Navbar';
import { TWENTY_COMPANIES, CompanyMeta } from '../../../lib/companies';
import { Building2, ArrowLeft, ArrowRight, ShieldCheck, Sparkles, Code2, Layers, Cpu, CheckCircle2, Clock } from 'lucide-react';

export default function CompanyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const companyId = (params.company as string)?.toLowerCase();

  const company = TWENTY_COMPANIES.find((c) => c.id.toLowerCase() === companyId);
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!company) return;

    fetch(`http://localhost:5001/api/companies/${companyId}/questions`)
      .then((res) => res.json())
      .then((data) => {
        if (data.questions) {
          setQuestions(data.questions);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [companyId, company]);

  if (!company) {
    return (
      <div className="min-h-screen flex flex-col bg-[#f8fafc] dark:bg-[#040711] text-slate-900 dark:text-slate-100">
        <Navbar />
        <main className="flex-1 max-w-4xl mx-auto w-full px-6 py-20 text-center space-y-4">
          <Building2 className="w-12 h-12 text-slate-400 mx-auto" />
          <h1 className="text-2xl font-extrabold">Company Data Being Prepared</h1>
          <p className="text-sm text-slate-500">Company catalog data for "{companyId}" is currently updating.</p>
          <Link href="/companies" className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl">
            <ArrowLeft className="w-4 h-4" /> Return to Companies Catalog
          </Link>
        </main>
      </div>
    );
  }

  const handleStartPractice = (mode: string) => {
    router.push(`/setup?company=${company.id}&mode=${encodeURIComponent(mode)}`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc] dark:bg-[#040711] text-slate-900 dark:text-slate-100 transition-colors duration-300">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-10 space-y-8">
        {/* Back Link */}
        <Link href="/companies" className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-blue-600 transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to 20 Companies Catalog
        </Link>

        {/* Company Banner */}
        <div className="bg-white dark:bg-[#0c1220] rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <span className="text-4xl p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              {company.logo}
            </span>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2.5">
                <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                  {company.name} Interview Training
                </h1>
                <span className="text-xs font-extrabold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-3 py-1 rounded-full border border-blue-200 dark:border-blue-900/50">
                  {company.primaryFocus}
                </span>
              </div>
              <p className="text-slate-600 dark:text-slate-300 text-xs max-w-2xl font-normal leading-relaxed">
                {company.description}
              </p>
            </div>
          </div>

          {/* Practice Action CTAs */}
          <div className="flex flex-wrap gap-2.5 w-full md:w-auto">
            <button
              onClick={() => handleStartPractice('Full Mock')}
              className="px-5 py-3 rounded-xl font-extrabold text-xs bg-blue-600 hover:bg-blue-500 text-white shadow-md flex items-center justify-center gap-2 transition-all"
            >
              <Sparkles className="w-4 h-4" />
              Full Mock Interview
            </button>
            <button
              onClick={() => handleStartPractice('Coding')}
              className="px-4 py-3 rounded-xl font-bold text-xs bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 text-white border border-slate-700 flex items-center justify-center gap-1.5 transition-all"
            >
              <Code2 className="w-3.5 h-3.5 text-cyan-400" />
              Practice DSA
            </button>
          </div>
        </div>

        {/* Public Information Disclaimer */}
        <div className="p-3.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 text-blue-900 dark:text-blue-200 text-xs flex items-center gap-2.5">
          <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
          <span>
            <strong>Public Preparation Note:</strong> Questions listed below are sourced from publicly reported candidate interview experiences and curated competitive-programming problem datasets commonly associated with {company.name}.
          </span>
        </div>

        {/* Grid Overview: Interview Stages & Common Focus Areas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Interview Stages */}
          <div className="bg-white dark:bg-[#0c1220] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <h2 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-600" /> Reported Interview Stages
            </h2>
            <div className="space-y-2">
              {company.interviewStages.map((stage, idx) => (
                <div key={idx} className="flex items-center gap-2.5 text-xs font-semibold text-slate-700 dark:text-slate-300 p-2 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
                  <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[10px] font-extrabold flex items-center justify-center">
                    {idx + 1}
                  </span>
                  <span>{stage}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Common Focus Topics */}
          <div className="bg-white dark:bg-[#0c1220] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <h2 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <Cpu className="w-4 h-4 text-emerald-600" /> Core Topics & Skills
            </h2>
            <div className="flex flex-wrap gap-2">
              {company.commonTopics.map((topic, idx) => (
                <span key={idx} className="px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  {topic}
                </span>
              ))}
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-wrap gap-2">
              <button onClick={() => handleStartPractice('Technical')} className="px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800 hover:bg-slate-200">
                Practice Technical
              </button>
              <button onClick={() => handleStartPractice('Behavioral')} className="px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800 hover:bg-slate-200">
                Practice Behavioral
              </button>
            </div>
          </div>
        </div>

        {/* Reported Questions List */}
        <div className="bg-white dark:bg-[#0c1220] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-blue-600" />
              Publicly Reported Questions ({questions.length})
            </h2>
            <span className="text-xs text-slate-400">Source: Community Reports & Problem Datasets</span>
          </div>

          {loading ? (
            <div className="p-8 text-center text-xs text-slate-400">Loading {company.name} questions...</div>
          ) : questions.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">
              Questions for {company.name} are being prepared in the background engine. You can still generate personalized interviews using the Practice button above.
            </div>
          ) : (
            <div className="space-y-3">
              {questions.map((q) => (
                <div key={q.id} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-sm text-slate-900 dark:text-white">{q.title}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        q.difficulty === 'EASY' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' :
                        q.difficulty === 'HARD' ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300' :
                        'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                      }`}>
                        {q.difficulty}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400 border border-blue-200 dark:border-blue-900">
                        {q.confidence || 'HIGH'} CONFIDENCE
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-400 font-normal line-clamp-1">{q.statement || q.questionText}</p>

                    <div className="flex items-center gap-3 text-[10px] text-slate-400 font-semibold pt-1">
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> ~{q.estimatedDuration || 10} min</span>
                      <span>Source: {q.source === 'COMPANY_REPORTED' ? 'Public Candidate Report' : q.source || 'Curated'}</span>
                      {q.reportCount && <span>Reported by {q.reportCount}+ candidates</span>}
                    </div>
                  </div>

                  <button
                    onClick={() => handleStartPractice('Coding')}
                    className="px-4 py-2 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-sm flex items-center gap-1 transition-all flex-shrink-0"
                  >
                    Solve Problem
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
