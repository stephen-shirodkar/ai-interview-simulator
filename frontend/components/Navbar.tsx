'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { SignedIn, SignedOut, UserButton } from '@clerk/nextjs';
import { useTheme } from '../context/ThemeContext';
import { isRealClerkKey } from './ClerkWrapper';
import { Sun, Moon, Sparkles, Building2, LayoutDashboard, History as HistoryIcon, Settings as SettingsIcon, PlayCircle, Bot, BookOpen } from 'lucide-react';

export const Navbar = () => {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();

  const isActive = (path: string) => pathname === path || pathname.startsWith(path + '/');

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-md bg-white/90 dark:bg-[#060913]/90 border-b border-slate-200/80 dark:border-slate-800/80 px-6 py-3.5 transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <span className="font-extrabold text-xl tracking-tight text-slate-900 dark:text-white">
            Interview<span className="text-blue-600 dark:text-blue-400">AI</span>
          </span>
        </Link>

        {/* Center Nav Links */}
        <div className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-600 dark:text-slate-300">
          <Link
            href="/dashboard"
            className={`flex items-center gap-1.5 transition-colors ${
              isActive('/dashboard') ? 'text-blue-600 dark:text-blue-400 font-extrabold' : 'hover:text-blue-600 dark:hover:text-white'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            Dashboard
          </Link>
          <Link
            href="/learning"
            className={`flex items-center gap-1.5 transition-colors ${
              isActive('/learning') ? 'text-blue-600 dark:text-blue-400 font-extrabold' : 'hover:text-blue-600 dark:hover:text-white'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            Learning Plan
          </Link>
          <Link
            href="/setup"
            className={`flex items-center gap-1.5 transition-colors ${
              isActive('/setup') ? 'text-blue-600 dark:text-blue-400 font-extrabold' : 'hover:text-blue-600 dark:hover:text-white'
            }`}
          >
            <PlayCircle className="w-3.5 h-3.5" />
            Practice
          </Link>
          <Link
            href="/companies"
            className={`flex items-center gap-1.5 transition-colors ${
              isActive('/companies') ? 'text-blue-600 dark:text-blue-400 font-extrabold' : 'hover:text-blue-600 dark:hover:text-white'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            Company Training
          </Link>
          <Link
            href="/history"
            className={`flex items-center gap-1.5 transition-colors ${
              isActive('/history') ? 'text-blue-600 dark:text-blue-400 font-extrabold' : 'hover:text-blue-600 dark:hover:text-white'
            }`}
          >
            <HistoryIcon className="w-3.5 h-3.5" />
            History
          </Link>
          <Link
            href="/settings"
            className={`flex items-center gap-1.5 transition-colors ${
              isActive('/settings') ? 'text-blue-600 dark:text-blue-400 font-extrabold' : 'hover:text-blue-600 dark:hover:text-white'
            }`}
          >
            <SettingsIcon className="w-3.5 h-3.5" />
            Settings
          </Link>
        </div>

        {/* Right Section: Theme Toggle & Actions */}
        <div className="flex items-center gap-3">
          {/* Light / Dark Mode Toggle Button */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:scale-105 transition-all shadow-sm"
            title="Toggle Light/Dark Theme"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
          </button>

          {isRealClerkKey ? (
            <>
              <SignedIn>
                <div className="flex items-center gap-3">
                  <Link
                    href="/setup"
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-md transition-all flex items-center gap-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    Start Interview
                  </Link>
                  <UserButton afterSignOutUrl="/" />
                </div>
              </SignedIn>

              <SignedOut>
                <div className="flex items-center gap-2.5">
                  <Link
                    href="/login"
                    className="px-4 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 transition-all"
                  >
                    Login
                  </Link>
                  <Link
                    href="/register"
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-[#0f172a] dark:bg-blue-600 hover:bg-slate-800 dark:hover:bg-blue-500 text-white transition-all shadow-md"
                  >
                    Get Started
                  </Link>
                </div>
              </SignedOut>
            </>
          ) : (
            <div className="flex items-center gap-2.5">
              <Link
                href="/login"
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 transition-all"
              >
                Login
              </Link>
              <Link
                href="/setup"
                className="px-4 py-2 rounded-xl text-xs font-bold bg-[#0f172a] dark:bg-blue-600 hover:bg-slate-800 dark:hover:bg-blue-500 text-white transition-all shadow-md flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Start Interview
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};
