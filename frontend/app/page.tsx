'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Navbar } from '../components/Navbar';
import {
  ArrowRight,
  Play,
  Check,
  Mic,
  Video,
  Settings,
  Clock,
  FileText,
  Brain,
  BarChart,
  Bot,
  Sparkles,
  ShieldCheck,
  Zap,
  Cpu,
  Layers,
  MessageSquare,
  TrendingUp,
} from 'lucide-react';

export default function LandingPage() {
  const [activeTab, setActiveTab] = useState<'feedback' | 'transcript'>('feedback');

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc] dark:bg-[#040711] text-slate-900 dark:text-slate-100 selection:bg-blue-600 selection:text-white transition-colors duration-300">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-10 pb-20 px-6 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center relative z-10">
          {/* Left Column: Hero Text & Value Props */}
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200/80 dark:border-blue-800/80 text-blue-600 dark:text-blue-400 text-[11px] font-extrabold uppercase tracking-wider">
              AI-POWERED INTERVIEW PRACTICE
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.12] text-slate-900 dark:text-white">
              Practice Smarter. <br />
              <span className="text-blue-600 dark:text-blue-400">
                Get Hired
              </span>{' '}
              Faster.
            </h1>

            <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base leading-relaxed max-w-xl font-normal">
              Realistic AI interview simulations, personalized feedback and tailored question sets to help you ace your next technical or behavioral interview.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3.5 pt-2">
              <Link
                href="/setup"
                className="px-6 py-3.5 rounded-xl font-bold text-xs bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 transition-all"
              >
                Start Practicing
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                href="/dashboard"
                className="px-6 py-3.5 rounded-xl font-bold text-xs bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-center gap-2 transition-all"
              >
                <Play className="w-3.5 h-3.5 text-slate-700 dark:text-slate-300 fill-current" />
                Watch Demo
              </Link>
            </div>

            {/* Trust Checkmarks */}
            <div className="flex flex-wrap items-center gap-5 pt-2 text-[11px] font-medium text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 stroke-[3]" /> Real interview questions
              </span>
              <span className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 stroke-[3]" /> Instant feedback
              </span>
              <span className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 stroke-[3]" /> Track your progress
              </span>
            </div>
          </div>

          {/* Right Column: Mock Workspace Card */}
          <div className="lg:col-span-6">
            <div className="bg-white dark:bg-[#0c1220] rounded-2xl p-4 sm:p-5 shadow-xl border border-slate-200 dark:border-slate-800/80 space-y-4">
              {/* Header Bar */}
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span className="font-extrabold text-xs text-slate-800 dark:text-slate-200">
                    Technical Interview
                  </span>
                </div>

                <div className="flex items-center gap-4 text-xs font-mono">
                  <span className="text-slate-500 dark:text-slate-400 font-semibold flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> 12:34 / 30:00
                  </span>
                  <button className="px-3 py-1 rounded-lg text-[11px] font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900/60">
                    End Interview
                  </button>
                </div>
              </div>

              {/* Inner Layout: Video & Feedback Panel */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                {/* AI Avatar Video Frame */}
                <div className="sm:col-span-7 relative h-[250px] rounded-xl bg-slate-900 dark:bg-[#070b14] overflow-hidden border border-slate-200 dark:border-slate-800 flex flex-col justify-between p-3">
                  <div className="relative z-10 flex justify-end gap-1.5">
                    <div className="w-6 h-6 rounded-md bg-slate-800/80 border border-slate-700 flex items-center justify-center text-slate-300">
                      <Mic className="w-3 h-3" />
                    </div>
                    <div className="w-6 h-6 rounded-md bg-slate-800/80 border border-slate-700 flex items-center justify-center text-slate-300">
                      <Video className="w-3 h-3" />
                    </div>
                    <div className="w-6 h-6 rounded-md bg-slate-800/80 border border-slate-700 flex items-center justify-center text-slate-300">
                      <Settings className="w-3 h-3" />
                    </div>
                  </div>

                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-20 h-20 rounded-full bg-blue-600/15 dark:bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-500 shadow-lg shadow-blue-500/10">
                      <Bot className="w-10 h-10 text-blue-500" />
                    </div>
                  </div>

                  <div className="relative z-10 bg-white/95 dark:bg-slate-900/95 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 flex items-center gap-2 shadow-md">
                    <Bot className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                    <p className="text-[11px] font-semibold text-slate-800 dark:text-slate-100 leading-snug">
                      "Can you explain the difference between an array and a linked list?"
                    </p>
                  </div>
                </div>

                {/* Live Feedback Column */}
                <div className="sm:col-span-5 flex flex-col justify-between space-y-2.5">
                  <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-2 text-[11px] font-bold">
                    <button
                      onClick={() => setActiveTab('feedback')}
                      className={`pb-0.5 border-b-2 transition-colors ${
                        activeTab === 'feedback'
                          ? 'border-blue-600 dark:border-blue-400 text-blue-600 dark:text-blue-400 font-extrabold'
                          : 'border-transparent text-slate-400'
                      }`}
                    >
                      Live Feedback
                    </button>
                    <button
                      onClick={() => setActiveTab('transcript')}
                      className={`pb-0.5 border-b-2 transition-colors ${
                        activeTab === 'transcript'
                          ? 'border-blue-600 dark:border-blue-400 text-blue-600 dark:text-blue-400 font-extrabold'
                          : 'border-transparent text-slate-400'
                      }`}
                    >
                      Transcript
                    </button>
                  </div>

                  {/* Score Meter */}
                  <div className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800">
                    <div className="relative w-10 h-10 flex items-center justify-center flex-shrink-0">
                      <div className="w-full h-full rounded-full border-4 border-emerald-500 border-t-transparent" />
                      <span className="absolute font-black text-[10px] text-slate-900 dark:text-white">78%</span>
                    </div>
                    <div>
                      <div className="font-extrabold text-[11px] text-slate-900 dark:text-white">Good Response</div>
                      <div className="text-[9px] font-normal text-slate-500 dark:text-slate-400 leading-tight">
                        Clear explanation with relevant examples. Try to be more concise.
                      </div>
                    </div>
                  </div>

                  {/* Checklist Feedback Items */}
                  <div className="space-y-1.5 text-[10px] font-bold">
                    <div className="p-1.5 rounded-md bg-[#ecfdf5] dark:bg-emerald-950/60 border border-[#a7f3d0] dark:border-emerald-800 text-[#047857] dark:text-emerald-300 flex items-center gap-1.5">
                      <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                      <span>Correctly explained core concept</span>
                    </div>

                    <div className="p-1.5 rounded-md bg-[#eff6ff] dark:bg-blue-950/60 border border-[#bfdbfe] dark:border-blue-800 text-[#1d4ed8] dark:text-blue-300 flex items-center gap-1.5">
                      <Check className="w-3 h-3 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                      <span>Good use of examples</span>
                    </div>

                    <div className="p-1.5 rounded-md bg-[#fff7ed] dark:bg-amber-950/60 border border-[#fed7aa] dark:border-amber-800 text-[#c2410c] dark:text-amber-300 flex items-center gap-1.5">
                      <span className="text-amber-600 dark:text-amber-400 font-bold">↓</span>
                      <span>Try to improve time management</span>
                    </div>

                    <div className="p-1.5 rounded-md bg-[#fef2f2] dark:bg-rose-950/60 border border-[#fecaca] dark:border-rose-900 text-[#b91c1c] dark:text-rose-300 flex items-center gap-1.5">
                      <span className="text-rose-600 dark:text-rose-400 font-bold">+</span>
                      <span>Add time and space complexity details</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trusted By Students Banner */}
      <section className="py-8 px-6 border-y border-slate-200/80 dark:border-slate-800/80 bg-white/50 dark:bg-slate-900/30">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 whitespace-nowrap">
            TRUSTED BY STUDENTS FROM
          </span>

          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12 font-black text-slate-700 dark:text-slate-300 text-lg">
            <span className="font-sans tracking-tight">Google</span>
            <span className="font-sans flex items-center gap-1">
              <span className="w-3 h-3 bg-blue-600 inline-block" /> Microsoft
            </span>
            <span className="font-sans lowercase italic">amazon</span>
            <span className="font-sans tracking-wide text-blue-600 dark:text-blue-400">∞ Meta</span>
            <span className="font-sans font-extrabold tracking-wider">A Adobe</span>
            <span className="font-sans text-blue-600 dark:text-blue-400">Infosys</span>
          </div>
        </div>
      </section>

      {/* "How It Works" Section */}
      <section className="py-16 px-6 max-w-7xl mx-auto w-full text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 text-[10px] font-extrabold uppercase tracking-wider mb-3">
          HOW IT WORKS
        </div>

        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Go from Practice to Placement
        </h2>

        <p className="text-slate-500 dark:text-slate-400 text-xs font-normal mt-1 max-w-xl mx-auto">
          A simple and effective way to improve your interview skills with the power of AI.
        </p>

        {/* 3 Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
          {/* Step 1 */}
          <div className="bg-white dark:bg-[#0c1220] p-6 rounded-2xl text-left flex flex-col justify-between border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <span className="w-7 h-7 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center">
                1
              </span>
              <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-slate-900 border border-blue-100 dark:border-slate-800 flex items-center justify-center text-blue-600 dark:text-blue-400">
                <FileText className="w-5 h-5" />
              </div>
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
                Choose Your Interview Type
              </h3>
              <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed font-normal">
                Select from technical, behavioral, system design or company-specific interviews.
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="bg-white dark:bg-[#0c1220] p-6 rounded-2xl text-left flex flex-col justify-between border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <span className="w-7 h-7 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center">
                2
              </span>
              <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-slate-900 border border-blue-100 dark:border-slate-800 flex items-center justify-center text-blue-600 dark:text-blue-400">
                <Brain className="w-5 h-5" />
              </div>
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
                Practice with AI
              </h3>
              <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed font-normal">
                Answer realistic questions in a natural conversation with our AI interviewer.
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="bg-white dark:bg-[#0c1220] p-6 rounded-2xl text-left flex flex-col justify-between border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <span className="w-7 h-7 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center">
                3
              </span>
              <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-slate-900 border border-blue-100 dark:border-slate-800 flex items-center justify-center text-blue-600 dark:text-blue-400">
                <BarChart className="w-5 h-5" />
              </div>
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
                Get Detailed Feedback
              </h3>
              <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed font-normal">
                Receive instant feedback, scores and suggestions to improve.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid Section ("Everything you need to ace your interviews") */}
      <section id="features" className="py-16 px-6 max-w-7xl mx-auto w-full border-t border-slate-200/80 dark:border-slate-800/80">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left Title Box (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 text-[10px] font-extrabold uppercase tracking-wider">
              FEATURES
            </div>

            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Everything you need to ace your interviews
            </h2>

            <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed">
              Powerful tools and features designed to help you build confidence and improve your performance.
            </p>

            <Link
              href="/setup"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-xs bg-[#0f172a] dark:bg-blue-600 hover:bg-slate-800 dark:hover:bg-blue-500 text-white shadow-md transition-all"
            >
              Get Started
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Right 2x2 Cards Grid (7 cols) */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white dark:bg-[#0c1220] p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
              <div className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-slate-900 border border-blue-100 dark:border-slate-800 flex items-center justify-center text-blue-600 dark:text-blue-400">
                <Video className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-extrabold text-slate-900 dark:text-white">Realistic AI Interviews</h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-normal leading-relaxed">
                Practice with industry-relevant questions and scenarios.
              </p>
            </div>

            <div className="bg-white dark:bg-[#0c1220] p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
              <div className="w-9 h-9 rounded-lg bg-emerald-50 dark:bg-slate-900 border border-emerald-100 dark:border-slate-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <MessageSquare className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-extrabold text-slate-900 dark:text-white">Personalized Feedback</h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-normal leading-relaxed">
                Get detailed feedback and improvement suggestions.
              </p>
            </div>

            <div className="bg-white dark:bg-[#0c1220] p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
              <div className="w-9 h-9 rounded-lg bg-indigo-50 dark:bg-slate-900 border border-indigo-100 dark:border-slate-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                <Layers className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-extrabold text-slate-900 dark:text-white">Multiple Interview Types</h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-normal leading-relaxed">
                Technical, behavioral, system design and more.
              </p>
            </div>

            <div className="bg-white dark:bg-[#0c1220] p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
              <div className="w-9 h-9 rounded-lg bg-cyan-50 dark:bg-slate-900 border border-cyan-100 dark:border-slate-800 flex items-center justify-center text-cyan-600 dark:text-cyan-400">
                <TrendingUp className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-extrabold text-slate-900 dark:text-white">Track Progress</h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-normal leading-relaxed">
                Monitor your performance over time with detailed analytics.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 px-6 max-w-7xl mx-auto w-full text-center border-t border-slate-200/80 dark:border-slate-800/80">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 text-[10px] font-extrabold uppercase tracking-wider mb-3">
          TESTIMONIALS
        </div>

        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Loved by students and professionals
        </h2>

        <p className="text-slate-500 dark:text-slate-400 text-xs font-normal mt-1 max-w-xl mx-auto">
          See how InterviewAI is helping people land their dream jobs.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
          {/* Card 1 */}
          <div className="bg-white dark:bg-[#0c1220] p-5 rounded-xl text-left border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-blue-100 dark:bg-slate-800 flex items-center justify-center font-bold text-blue-600 text-xs">
                RK
              </div>
              <div>
                <h4 className="text-xs font-extrabold text-slate-900 dark:text-white">"Helped me crack my internship!"</h4>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">Rohan K. • Computer Science Student</p>
              </div>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-300 font-normal leading-relaxed">
              The AI feedback is incredibly detailed and helped me improve so much on technical problem solving.
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-white dark:bg-[#0c1220] p-5 rounded-xl text-left border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-emerald-100 dark:bg-slate-800 flex items-center justify-center font-bold text-emerald-600 text-xs">
                AS
              </div>
              <div>
                <h4 className="text-xs font-extrabold text-slate-900 dark:text-white">"Feels like a real interview"</h4>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">Aditi S. • Software Engineer</p>
              </div>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-300 font-normal leading-relaxed">
              The questions and feedback are so realistic. Highly recommend it to anyone preparing for interviews!
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-white dark:bg-[#0c1220] p-5 rounded-xl text-left border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-purple-100 dark:bg-slate-800 flex items-center justify-center font-bold text-purple-600 text-xs">
                KP
              </div>
              <div>
                <h4 className="text-xs font-extrabold text-slate-900 dark:text-white">"Best interview prep tool"</h4>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">Karan P. • Data Science Student</p>
              </div>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-300 font-normal leading-relaxed">
              Covers everything from technical to behavioral. A must-have for every serious job seeker!
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200/80 dark:border-slate-800/80 py-6 px-6 text-center text-xs text-slate-500 dark:text-slate-400 font-medium bg-white dark:bg-[#03050c]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            InterviewAI • Next.js, Express, Codeforces & ElevenLabs AI
          </div>
          <div>100% Free Professional Edition</div>
        </div>
      </footer>
    </div>
  );
}
