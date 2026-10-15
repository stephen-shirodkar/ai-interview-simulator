'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Navbar } from '../../components/Navbar';
import { TWENTY_COMPANIES } from '../../lib/companies';
import { Building2, Search, ArrowRight, ShieldAlert, Sparkles, Target, Layers } from 'lucide-react';

export default function CompaniesPage() {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCompanies = TWENTY_COMPANIES.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.commonTopics.some((t) => t.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc] dark:bg-[#040711] text-slate-900 dark:text-slate-100 transition-colors duration-300">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-10 space-y-8">
        {/* Page Header */}
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 text-xs font-extrabold uppercase tracking-wider">
            <Building2 className="w-3.5 h-3.5" />
            20 TECH LEADERS CATALOG
          </div>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Company-Specific Interview Training
              </h1>
              <p className="text-slate-600 dark:text-slate-400 text-sm font-normal mt-1 max-w-2xl">
                Practice interview questions and algorithmic patterns commonly reported by candidate interview experiences for leading technology companies.
              </p>
            </div>

            {/* Search Input */}
            <div className="relative w-full md:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search Google, Amazon, Graphs..."
                className="w-full pl-9 pr-4 py-2.5 rounded-xl text-xs font-medium bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-slate-100"
              />
            </div>
          </div>

          {/* Disclaimer Banner */}
          <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-amber-900 dark:text-amber-200 text-xs flex items-start gap-2.5">
            <ShieldAlert className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
            <span>
              <strong>Public Information Disclaimer:</strong> Questions and patterns displayed below represent publicly available community-reported interview experiences and general industry topics. They do not constitute official company question banks or guaranteed predictions.
            </span>
          </div>
        </div>

        {/* 20 Companies Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredCompanies.map((company) => (
            <div
              key={company.id}
              className="bg-white dark:bg-[#0c1220] rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-blue-500/50 dark:hover:border-blue-500/50 transition-all flex flex-col justify-between space-y-4 group"
            >
              <div className="space-y-3">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl p-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                      {company.logo}
                    </span>
                    <div>
                      <h2 className="text-base font-extrabold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {company.name}
                      </h2>
                      <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded-md border border-blue-200 dark:border-blue-900/50">
                        {company.primaryFocus}
                      </span>
                    </div>
                  </div>
                </div>

                <p className="text-slate-500 dark:text-slate-400 text-xs font-normal line-clamp-2 leading-relaxed">
                  {company.description}
                </p>

                {/* Common Topics */}
                <div className="space-y-1.5">
                  <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1">
                    <Layers className="w-3 h-3" /> Reported Topics
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {company.commonTopics.slice(0, 3).map((topic, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300"
                      >
                        {topic}
                      </span>
                    ))}
                    {company.commonTopics.length > 3 && (
                      <span className="px-1.5 py-0.5 text-[10px] font-bold text-slate-400">
                        +{company.commonTopics.length - 3}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <Link
                href={`/companies/${company.id}`}
                className="w-full py-2.5 rounded-xl font-bold text-xs bg-slate-900 dark:bg-blue-600 hover:bg-slate-800 dark:hover:bg-blue-500 text-white flex items-center justify-center gap-1.5 transition-all shadow-sm group-hover:scale-[1.01]"
              >
                Practice {company.name}
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
