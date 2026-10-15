'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, BookOpen, CheckCircle2, AlertTriangle, ShieldCheck, PlayCircle, Sparkles, Send, Award, RefreshCw, Layers } from 'lucide-react';

interface EvidenceItem {
  questionId: string;
  reason: string;
  missingConcepts?: string[];
  incorrectConcepts?: string[];
}

interface PlanStep {
  stepNumber: number;
  title: string;
  type: string;
  description: string;
  actionLabel: string;
  isCompleted?: boolean;
}

export default function TopicLearningPage() {
  const params = useParams();
  const topicParam = params?.topic as string;
  const decodedTopic = topicParam ? decodeURIComponent(topicParam) : '';

  const [loading, setLoading] = useState(true);
  const [plan, setPlan] = useState<any>(null);
  const [explanationContent, setExplanationContent] = useState('');
  const [evidenceList, setEvidenceList] = useState<EvidenceItem[]>([]);

  // Practice Modal State
  const [showPracticeModal, setShowPracticeModal] = useState(false);
  const [practiceType, setPracticeType] = useState<'PRACTICE' | 'REASSESSMENT'>('PRACTICE');
  const [practiceSession, setPracticeSession] = useState<any>(null);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [submittingPractice, setSubmittingPractice] = useState(false);
  const [practiceResult, setPracticeResult] = useState<any>(null);

  useEffect(() => {
    if (decodedTopic) {
      fetchTopicDetails();
    }
  }, [decodedTopic]);

  const fetchTopicDetails = async () => {
    try {
      const res = await fetch(`http://localhost:5001/api/learning/topic/${encodeURIComponent(decodedTopic)}`);
      const data = await res.json();
      if (data.success) {
        setPlan(data.plan);
        setExplanationContent(data.explanationContent || '');
        setEvidenceList(data.evidenceList || []);
      }
    } catch (err) {
      console.error('Failed to fetch topic details:', err);
    } finally {
      setLoading(false);
    }
  };

  const startPractice = async (type: 'PRACTICE' | 'REASSESSMENT') => {
    setPracticeType(type);
    setPracticeResult(null);
    setUserAnswers({});
    setShowPracticeModal(true);
    try {
      const res = await fetch('http://localhost:5001/api/learning/practice/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: decodedTopic, type }),
      });
      const data = await res.json();
      if (data.success) {
        setPracticeSession(data.session);
      }
    } catch (e) {
      console.error('Failed to start practice:', e);
    }
  };

  const handleAnswerChange = (qId: string, text: string) => {
    setUserAnswers((prev) => ({ ...prev, [qId]: text }));
  };

  const submitPractice = async () => {
    if (!practiceSession) return;
    setSubmittingPractice(true);
    try {
      const answersArr = Object.entries(userAnswers).map(([questionId, userAnswer]) => ({
        questionId,
        userAnswer,
      }));

      const res = await fetch('http://localhost:5001/api/learning/practice/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: practiceSession._id,
          answers: answersArr,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setPracticeResult(data);
        fetchTopicDetails(); // Refresh mastery
      }
    } catch (e) {
      console.error('Failed to submit practice answers:', e);
    } finally {
      setSubmittingPractice(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#060913] text-white flex items-center justify-center p-6">
        <div className="text-center space-y-3 animate-pulse">
          <Sparkles className="w-8 h-8 text-blue-400 mx-auto animate-spin" />
          <p className="text-slate-400 text-sm font-semibold">Retrieving RAG learning documents for {decodedTopic}...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#060913] text-white py-10 px-6 font-sans">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Navigation Back Link */}
        <Link
          href="/learning"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Learning Dashboard
        </Link>

        {/* Topic Header Card */}
        <div className="p-8 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                {plan?.category || 'Technical'}
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> RAG Grounded Concept
              </span>
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">{decodedTopic}</h1>
            <p className="text-slate-400 text-xs">
              Estimated Mastery: <strong className="text-white">{plan?.estimatedMastery || 50}%</strong>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => startPractice('PRACTICE')}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-500/20 transition-all flex items-center gap-2"
            >
              <PlayCircle className="w-4 h-4" /> Practice Now
            </button>
            <button
              onClick={() => startPractice('REASSESSMENT')}
              className="px-5 py-2.5 rounded-xl bg-purple-600/20 hover:bg-purple-600 text-purple-300 hover:text-white border border-purple-500/30 font-bold text-xs transition-all flex items-center gap-2"
            >
              <Award className="w-4 h-4" /> Take Reassessment
            </button>
          </div>
        </div>

        {/* Why You're Seeing This Evidence Card */}
        <div className="p-6 rounded-2xl bg-amber-500/5 border border-amber-500/20 space-y-3">
          <h2 className="text-sm font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" /> Why You're Seeing This
          </h2>
          <p className="text-xs text-slate-300 leading-relaxed">
            {plan?.whyText || `Evaluations from your recent interview flagged ${decodedTopic} for reinforcement.`}
          </p>

          {evidenceList && evidenceList.length > 0 && (
            <div className="pt-2 space-y-2">
              <span className="text-[11px] font-bold text-slate-400">Verified Evidence Signals:</span>
              <ul className="space-y-1.5 text-xs text-slate-300 list-disc list-inside">
                {evidenceList.map((ev, i) => (
                  <li key={i} className="text-slate-300">
                    {ev.reason}
                    {ev.missingConcepts && ev.missingConcepts.length > 0 && (
                      <span className="text-rose-400 ml-1">(Missing: {ev.missingConcepts.join(', ')})</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* 4-Step Personalized Learning Roadmap */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-blue-400" /> Personalized Learning Plan Steps
          </h2>

          <div className="grid md:grid-cols-4 gap-4">
            {plan?.steps?.map((step: PlanStep) => (
              <div
                key={step.stepNumber}
                className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2 flex flex-col justify-between"
              >
                <div className="space-y-1.5">
                  <span className="text-[11px] font-bold text-blue-400 uppercase tracking-wider">Step {step.stepNumber}</span>
                  <h3 className="text-sm font-bold text-white">{step.title}</h3>
                  <p className="text-[11px] text-slate-400 leading-normal">{step.description}</p>
                </div>
                <button
                  onClick={() => (step.type === 'PRACTICE' || step.type === 'REASSESSMENT' ? startPractice(step.type as any) : null)}
                  className="w-full py-1.5 mt-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-[11px] transition-all text-center"
                >
                  {step.actionLabel}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* RAG Grounded Concept Explanation Guide */}
        <div className="p-8 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-blue-400" /> Technical Concept Explanation
            </h2>
            <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" /> Verified Vector Context
            </span>
          </div>

          <div className="prose prose-invert max-w-none text-xs text-slate-300 leading-relaxed whitespace-pre-line">
            {explanationContent}
          </div>
        </div>

      </div>

      {/* Practice / Reassessment Modal */}
      {showPracticeModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="max-w-2xl w-full bg-[#0b1021] border border-slate-800 rounded-3xl p-6 space-y-6 shadow-2xl my-8">
            
            <div className="flex justify-between items-center border-b border-slate-800 pb-4">
              <div>
                <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">{practiceType} MODE</span>
                <h3 className="text-xl font-extrabold text-white">{decodedTopic} Targeted Assessment</h3>
              </div>
              <button
                onClick={() => setShowPracticeModal(false)}
                className="text-slate-400 hover:text-white text-sm font-bold p-2"
              >
                ✕ Close
              </button>
            </div>

            {practiceResult ? (
              /* Assessment Results Summary */
              <div className="space-y-6 py-4">
                <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 text-center space-y-3">
                  <Award className="w-12 h-12 text-emerald-400 mx-auto" />
                  <h4 className="text-xl font-extrabold text-white">Assessment Complete!</h4>
                  
                  <div className="flex justify-center items-center gap-6 pt-2">
                    <div>
                      <span className="text-xs text-slate-400">Previous Mastery</span>
                      <div className="text-lg font-bold text-slate-300">{practiceResult.previousMastery}%</div>
                    </div>
                    <div className="text-2xl font-bold text-emerald-400">→</div>
                    <div>
                      <span className="text-xs text-slate-400">New Estimated Mastery</span>
                      <div className="text-2xl font-black text-emerald-400">{practiceResult.newMastery}%</div>
                    </div>
                  </div>

                  <div className="text-xs font-bold text-emerald-400 bg-emerald-500/10 py-1.5 px-4 rounded-full inline-block border border-emerald-500/20">
                    Improvement: +{practiceResult.improvementDelta} points
                  </div>
                </div>

                <div className="space-y-3">
                  <h5 className="text-xs font-bold text-slate-400 uppercase">Question Evaluations</h5>
                  {practiceResult.session?.questions?.map((q: any, i: number) => (
                    <div key={i} className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1 text-xs">
                      <div className="flex justify-between font-bold text-white">
                        <span>{i + 1}. {q.title}</span>
                        <span className={q.score >= 70 ? 'text-emerald-400' : 'text-amber-400'}>{q.score}%</span>
                      </div>
                      <p className="text-slate-400 text-[11px]">{q.feedback}</p>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => setShowPracticeModal(false)}
                  className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 font-bold text-xs text-white transition-all"
                >
                  Return to Learning Page
                </button>
              </div>
            ) : (
              /* Question Practice Form */
              <div className="space-y-6">
                <p className="text-xs text-slate-400">
                  Answer the following targeted questions to practice active recall and update your estimated topic mastery.
                </p>

                {practiceSession?.questions?.map((q: any, i: number) => (
                  <div key={q.questionId || i} className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 text-xs">
                    <div className="flex justify-between items-start">
                      <span className="font-bold text-blue-400">Question {i + 1}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300 font-semibold">{q.difficulty}</span>
                    </div>

                    <h4 className="font-bold text-white text-sm">{q.title}</h4>
                    <p className="text-slate-300 leading-normal">{q.questionText}</p>

                    <textarea
                      rows={3}
                      placeholder="Type your explanation or technical approach here..."
                      value={userAnswers[q.questionId] || ''}
                      onChange={(e) => handleAnswerChange(q.questionId, e.target.value)}
                      className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors font-sans text-xs"
                    />
                  </div>
                ))}

                <button
                  onClick={submitPractice}
                  disabled={submittingPractice}
                  className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 font-bold text-xs text-white transition-all flex items-center justify-center gap-2 shadow-lg"
                >
                  {submittingPractice ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" /> Evaluating Answers...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" /> Submit Answers for Evaluation
                    </>
                  )}
                </button>
              </div>
            )}

          </div>
        </div>
      )}

    </main>
  );
}
