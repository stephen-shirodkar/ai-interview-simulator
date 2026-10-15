'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { SignUp } from '@clerk/nextjs';
import { Navbar } from '../../components/Navbar';
import { clerkAppearance } from '../../lib/clerkTheme';
import { Sparkles, CheckCircle2, UserCheck, KeyRound, Bot } from 'lucide-react';

const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || '';
const isRealClerkKey =
  publishableKey.startsWith('pk_test_') || publishableKey.startsWith('pk_live_');

export default function RegisterPage() {
  const router = useRouter();

  const handleDemoRegister = () => {
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 dark:bg-[#090d16] text-slate-100">
      <Navbar />

      <main className="flex-1 max-w-6xl mx-auto w-full px-6 py-12 flex flex-col lg:flex-row items-center justify-center gap-12">
        {/* Left Side: Product Branding */}
        <div className="lg:w-1/2 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            Create Free Candidate Account
          </div>

          <h1 className="text-4xl font-extrabold tracking-tight leading-tight">
            Start Practicing <span className="glow-gradient-text">Realistic AI Interviews</span>
          </h1>

          <p className="text-slate-300 text-sm leading-relaxed">
            Create your account in seconds to generate resume-aware technical questions, participate in live voice dialogue rounds, and track your Codeforces ratings.
          </p>

          <div className="space-y-3 pt-2">
            {[
              '100% Free Account & Unlimited Mock Sessions',
              'RAG Question Engine tailored to your Resume',
              'Voice Speech Dialogue & Audio Wave Visualizer',
              'Monaco Code Editor for Codeforces Problems',
            ].map((feat, i) => (
              <div key={i} className="flex items-center gap-3 text-xs text-slate-300 font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                {feat}
              </div>
            ))}
          </div>
        </div>

        {/* Right Side: Authentication Container */}
        <div className="lg:w-1/2 flex flex-col items-center justify-center">
          <div className="w-full max-w-md flex flex-col items-center">
            {isRealClerkKey ? (
              <SignUp appearance={clerkAppearance} routing="hash" signInUrl="/login" />
            ) : (
              <div className="w-full glass-card p-8 rounded-2xl border border-slate-800 shadow-2xl space-y-6 text-center">
                <div className="flex items-center justify-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md">
                    <Bot className="w-6 h-6 text-white" />
                  </div>
                  <div className="font-bold text-lg text-slate-100">AI Interview Simulator</div>
                </div>

                <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-300 leading-relaxed">
                  <KeyRound className="w-5 h-5 text-cyan-400 mx-auto mb-2" />
                  <strong>Clerk Registration Ready</strong>
                  <p className="mt-1 text-[11px] text-slate-400">
                    Add your live <code className="text-cyan-300">NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY</code> in <code className="text-cyan-300">frontend/.env.local</code> to enable Clerk Auth.
                  </p>
                </div>

                <button
                  onClick={handleDemoRegister}
                  className="w-full py-3.5 px-4 rounded-xl font-bold text-sm bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
                >
                  <UserCheck className="w-4 h-4" />
                  Create Free Account & Open Dashboard
                </button>

                <div className="text-xs text-slate-400">
                  Already have an account?{' '}
                  <Link href="/login" className="text-indigo-400 font-semibold hover:underline">
                    Sign In
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
