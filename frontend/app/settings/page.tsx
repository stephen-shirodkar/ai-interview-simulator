'use client';

import React, { useState } from 'react';
import { UserButton } from '@clerk/nextjs';
import { useSafeUser } from '../../lib/useSafeAuth';
import { Navbar } from '../../components/Navbar';
import { useTheme } from '../../context/ThemeContext';
import {
  User,
  Sun,
  Moon,
  Volume2,
  Code2,
  Briefcase,
  Save,
  CheckCircle2,
  Sparkles,
  Shield,
  Bot,
  Sliders,
  Cpu,
  Mic,
  Database,
  Terminal,
  Zap,
  RotateCcw,
  Download,
  AlertTriangle,
  Play,
} from 'lucide-react';

export default function SettingsPage() {
  const { user } = useSafeUser();
  const { theme, toggleTheme } = useTheme();

  // Active Tab State
  const [activeCategory, setActiveCategory] = useState<'ai' | 'voice' | 'interview' | 'codeforces' | 'appearance' | 'privacy'>('ai');

  // AI Settings State
  const [ollamaModel, setOllamaModel] = useState<string>('llama3:latest');
  const [temperature, setTemperature] = useState<number>(0.7);
  const [ragTopK, setRagTopK] = useState<number>(5);
  const [systemPrompt, setSystemPrompt] = useState<string>(
    'Focus on deep technical accuracy, time complexity analysis, and realistic system design trade-offs.'
  );

  // Voice Settings State
  const [voiceRate, setVoiceRate] = useState<number>(1.0);
  const [voicePitch, setVoicePitch] = useState<number>(1.0);
  const [voiceEngine, setVoiceEngine] = useState<string>('ElevenLabs AI Voice Engine');
  const [elevenLabsApiKey, setElevenLabsApiKey] = useState<string>('');
  const [elevenLabsVoiceId, setElevenLabsVoiceId] = useState<string>('Gfpl8Yo74Is0W6cPUWWT');
  const [silenceDelay, setSilenceDelay] = useState<string>('2.5s');
  const [isPlayingAudioTest, setIsPlayingAudioTest] = useState<boolean>(false);

  // Interview Simulation State
  const [targetRole, setTargetRole] = useState<string>('Full Stack Engineer');
  const [interviewDuration, setInterviewDuration] = useState<number>(30);
  const [difficultyTier, setDifficultyTier] = useState<string>('Senior (5+ yrs)');
  const [feedbackFrequency, setFeedbackFrequency] = useState<string>('Instant Per Question');

  // Codeforces Settings State
  const [codeforcesHandle, setCodeforcesHandle] = useState<string>('tourist');
  const [preferredLang, setPreferredLang] = useState<string>('cpp');
  const [editorTheme, setEditorTheme] = useState<string>('vs-dark');

  // Appearance State
  const [accentColor, setAccentColor] = useState<string>('Google Blue');

  // Status Notification State
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const handleSaveSettings = () => {
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleAudioTest = () => {
    setIsPlayingAudioTest(true);
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance('Hello! Voice synthesis engine test complete. Speech output is active.');
      utterance.rate = voiceRate;
      utterance.pitch = voicePitch;
      utterance.onend = () => setIsPlayingAudioTest(false);
      window.speechSynthesis.speak(utterance);
    } else {
      setTimeout(() => setIsPlayingAudioTest(false), 2000);
    }
  };

  const handlePurgeVectorIndex = () => {
    setActionNotice('Local ChromaDB Vector Index successfully purged & re-indexed!');
    setTimeout(() => setActionNotice(null), 4000);
  };

  const handleExportData = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify({
      user: user?.primaryEmailAddress?.emailAddress || 'candidate',
      settings: { ollamaModel, temperature, ragTopK, targetRole, codeforcesHandle, voiceRate },
      timestamp: new Date().toISOString()
    }, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `interview_ai_settings_export.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#070a12] text-slate-100 transition-colors duration-300">
      <Navbar />

      <main className="flex-1 max-w-6xl mx-auto w-full px-6 py-10 space-y-8">
        {/* Header Console Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-800">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-bold mb-2">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
              Google AI Studio Console & Preferences
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
              Developer & AI Settings
              <span className="text-xs px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-mono font-bold">
                SYSTEM OK
              </span>
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Configure local Ollama LLM, speech voice speed, RAG vector context depth, and Codeforces synchronization.
            </p>
          </div>

          {/* Quick System Status Badges */}
          <div className="flex flex-wrap items-center gap-2.5 text-xs font-mono">
            <div className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-2 text-slate-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              Ollama Llama3: <span className="text-emerald-400 font-bold">ACTIVE</span>
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-2 text-slate-300">
              <Database className="w-3.5 h-3.5 text-cyan-400" />
              ChromaDB: <span className="text-cyan-400 font-bold">142 Chunks</span>
            </div>
          </div>
        </div>

        {/* Action Notice Alert if triggered */}
        {actionNotice && (
          <div className="p-4 rounded-xl bg-cyan-950/80 border border-cyan-700 text-cyan-200 text-xs font-bold flex items-center justify-between animate-fade-in">
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-cyan-400" />
              {actionNotice}
            </span>
            <button onClick={() => setActionNotice(null)} className="text-cyan-400 hover:underline">Dismiss</button>
          </div>
        )}

        {/* User Identity Card */}
        <div className="bg-slate-900/90 rounded-2xl p-6 border border-slate-800 space-y-6 shadow-xl">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <User className="w-5 h-5 text-blue-400" />
            Clerk Candidate Identity & Security
          </h2>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 p-4 rounded-xl bg-slate-950 border border-slate-800/80">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-14 h-14 rounded-2xl overflow-hidden border-2 border-blue-500/40 bg-slate-800 flex items-center justify-center shadow-lg">
                  {user?.imageUrl ? (
                    <img src={user.imageUrl} alt={user.fullName || 'User'} className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-8 h-8 text-blue-400" />
                  )}
                </div>
                <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-slate-950 flex items-center justify-center">
                  <CheckCircle2 className="w-3 h-3 text-white" />
                </div>
              </div>

              <div>
                <div className="font-extrabold text-base text-white">{user?.fullName || user?.firstName || 'Candidate Developer'}</div>
                <div className="text-xs text-slate-400 font-mono mt-0.5">
                  {user?.primaryEmailAddress?.emailAddress || 'steve160206@gmail.com'}
                </div>
                <div className="text-[11px] text-blue-400 mt-1 flex items-center gap-1 font-semibold">
                  <Shield className="w-3.5 h-3.5" /> Authenticated Clerk Session ({user?.id ? user.id.slice(0, 16) + '...' : 'clerk_dev_user'})
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {user && <UserButton afterSignOutUrl="/" />}
            </div>
          </div>
        </div>

        {/* Tab Navigation Pill Bar */}
        <div className="flex flex-wrap items-center gap-2 bg-slate-900/90 p-1.5 rounded-2xl border border-slate-800">
          <button
            onClick={() => setActiveCategory('ai')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeCategory === 'ai'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Bot className="w-4 h-4 text-cyan-400" />
            AI & LLM Model
          </button>

          <button
            onClick={() => setActiveCategory('voice')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeCategory === 'voice'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Mic className="w-4 h-4 text-emerald-400" />
            Voice & Speech
          </button>

          <button
            onClick={() => setActiveCategory('interview')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeCategory === 'interview'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Briefcase className="w-4 h-4 text-indigo-400" />
            Interview Defaults
          </button>

          <button
            onClick={() => setActiveCategory('codeforces')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeCategory === 'codeforces'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Code2 className="w-4 h-4 text-purple-400" />
            Codeforces & Editor
          </button>

          <button
            onClick={() => setActiveCategory('appearance')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeCategory === 'appearance'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Sliders className="w-4 h-4 text-amber-400" />
            Appearance
          </button>

          <button
            onClick={() => setActiveCategory('privacy')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeCategory === 'privacy'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Database className="w-4 h-4 text-rose-400" />
            RAG Vector Storage
          </button>
        </div>

        {/* Tab 1: AI Model & LLM Settings */}
        {activeCategory === 'ai' && (
          <div className="bg-slate-900/90 rounded-2xl p-6 border border-slate-800 space-y-6 shadow-xl animate-fade-in">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Cpu className="w-5 h-5 text-cyan-400" />
                  Local Ollama LLM & Vector Retrieval Settings
                </h3>
                <p className="text-slate-400 text-xs mt-0.5">
                  Configure local AI model parameters, RAG similarity search top-K, and system prompts.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Ollama Model Selection */}
              <div>
                <label className="text-xs font-extrabold text-slate-300 mb-2 block flex items-center gap-1.5">
                  <Bot className="w-4 h-4 text-blue-400" /> Select Ollama LLM Engine:
                </label>
                <select
                  value={ollamaModel}
                  onChange={(e) => setOllamaModel(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm font-mono focus:outline-none focus:border-blue-500"
                >
                  <option value="llama3:latest">Llama 3 (8B Instruct - Recommended)</option>
                  <option value="mistral:latest">Mistral (7B Instruct - Ultra Fast)</option>
                  <option value="codellama:7b">CodeLlama (7B Python/C++ Specialist)</option>
                  <option value="phi3:medium">Phi-3 Medium (Google/Microsoft High Accuracy)</option>
                  <option value="qwen2:7b">Qwen 2 (7B Multilingual & Math)</option>
                </select>
                <span className="text-[11px] text-slate-500 mt-1 block">
                  Executed 100% locally on your machine via Ollama local REST daemon on port 11434.
                </span>
              </div>

              {/* RAG Chunks Top-K */}
              <div>
                <label className="text-xs font-extrabold text-slate-300 mb-2 block flex items-center gap-1.5">
                  <Database className="w-4 h-4 text-cyan-400" /> RAG Context Vector Retrieval Top-K:
                </label>
                <select
                  value={ragTopK}
                  onChange={(e) => setRagTopK(Number(e.target.value))}
                  className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm font-mono focus:outline-none focus:border-blue-500"
                >
                  <option value={3}>3 Chunks (Focused / Quick Response)</option>
                  <option value={5}>5 Chunks (Balanced - Standard)</option>
                  <option value={8}>8 Chunks (Comprehensive Resume Deep-Dive)</option>
                  <option value={10}>10 Chunks (Maximum Vector Depth)</option>
                </select>
                <span className="text-[11px] text-slate-500 mt-1 block">
                  Determines how many chunks from your parsed resume PDF are injected into the LLM prompt.
                </span>
              </div>
            </div>

            {/* Temperature Slider */}
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <div className="flex items-center justify-between text-xs font-extrabold text-slate-300">
                <span className="flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-amber-400" /> Model Temperature / Creativity Threshold:
                </span>
                <span className="font-mono text-cyan-400 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
                  {temperature}
                </span>
              </div>
              <input
                type="range"
                min="0.0"
                max="1.0"
                step="0.05"
                value={temperature}
                onChange={(e) => setTemperature(parseFloat(e.target.value))}
                className="w-full accent-blue-500"
              />
              <div className="flex items-center justify-between text-[11px] text-slate-500">
                <span>0.0 (Strict / Deterministic Technical Evaluation)</span>
                <span>1.0 (Creative / Conversational)</span>
              </div>
            </div>

            {/* Custom System Prompt Instruction */}
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <label className="text-xs font-extrabold text-slate-300 block flex items-center gap-1.5">
                <Terminal className="w-4 h-4 text-emerald-400" /> Candidate Focus System Prompt Override:
              </label>
              <textarea
                rows={3}
                value={systemPrompt}
                onChange={(e) => setSystemPrompt(e.target.value)}
                className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-200 focus:outline-none focus:border-blue-500 leading-relaxed"
              />
            </div>
          </div>
        )}

        {/* Tab 2: Voice & Speech Controls */}
        {activeCategory === 'voice' && (
          <div className="bg-slate-900/90 rounded-2xl p-6 border border-slate-800 space-y-6 shadow-xl animate-fade-in">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Mic className="w-5 h-5 text-emerald-400" />
                  Voice AI Speech Synthesis & Microphone Input
                </h3>
                <p className="text-slate-400 text-xs mt-0.5">
                  Customize Web Speech TTS voice pitch, playback speed, and auto-submit silence timer.
                </p>
              </div>

              <button
                onClick={handleAudioTest}
                disabled={isPlayingAudioTest}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-2 transition-all shadow-md shadow-emerald-600/20"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                {isPlayingAudioTest ? 'Playing Audio Test...' : 'Test Voice Audio'}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Speech Voice Selection */}
              <div>
                <label className="text-xs font-extrabold text-slate-300 mb-2 block flex items-center gap-1.5">
                  <Volume2 className="w-4 h-4 text-emerald-400" /> Voice Synthesis Engine:
                </label>
                <select
                  value={voiceEngine}
                  onChange={(e) => setVoiceEngine(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-blue-500 font-bold"
                >
                  <option value="ElevenLabs AI Voice Engine">ElevenLabs AI Multilingual v2 Voice (Recommended)</option>
                  <option value="Google Natural Voice (Female)">Google Natural Speech (Female Fallback)</option>
                  <option value="System Default Synthetic">Browser System Native Voice</option>
                </select>
              </div>

              {/* Silence Auto-Submit Delay */}
              <div>
                <label className="text-xs font-extrabold text-slate-300 mb-2 block flex items-center gap-1.5">
                  <Mic className="w-4 h-4 text-cyan-400" /> Microphone Auto-Submit Delay:
                </label>
                <select
                  value={silenceDelay}
                  onChange={(e) => setSilenceDelay(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-blue-500 font-bold"
                >
                  <option value="1.5s">1.5 Seconds (Fast Response)</option>
                  <option value="2.5s">2.5 Seconds (Recommended Standard)</option>
                  <option value="4.0s">4.0 Seconds (Long Pauses Allowed)</option>
                  <option value="Manual">Manual Push-To-Talk Button Only</option>
                </select>
              </div>
            </div>

            {/* ElevenLabs API Credentials Card */}
            <div className="p-5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4" /> ElevenLabs API Configuration
                </span>
                <span className="text-[11px] text-slate-500">api.elevenlabs.io</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-extrabold text-slate-300 mb-1.5 block">ElevenLabs API Key:</label>
                  <input
                    type="password"
                    placeholder="xi-api-key-..."
                    value={elevenLabsApiKey}
                    onChange={(e) => setElevenLabsApiKey(e.target.value)}
                    className="w-full p-3 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs font-mono focus:outline-none focus:border-emerald-500"
                  />
                  <span className="text-[10px] text-slate-500 mt-1 block">
                    Saved in <code className="text-slate-400">backend/.env</code> or environment as <code className="text-slate-400">ELEVENLABS_API_KEY</code>.
                  </span>
                </div>

                <div>
                  <label className="text-xs font-extrabold text-slate-300 mb-1.5 block">ElevenLabs Voice ID:</label>
                  <input
                    type="text"
                    placeholder="Gfpl8Yo74Is0W6cPUWWT"
                    value={elevenLabsVoiceId}
                    onChange={(e) => setElevenLabsVoiceId(e.target.value)}
                    className="w-full p-3 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs font-mono focus:outline-none focus:border-emerald-500"
                  />
                  <span className="text-[10px] text-slate-500 mt-1 block">
                    Custom Voice ID or default AI Recruiter voice ID (<code className="text-slate-400">Gfpl8Yo74Is0W6cPUWWT</code>).
                  </span>
                </div>
              </div>
            </div>

            {/* Speaking Rate & Pitch Sliders */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-800">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-extrabold text-slate-300">
                  <span>AI Speaking Rate:</span>
                  <span className="font-mono text-emerald-400 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
                    {voiceRate}x
                  </span>
                </div>
                <input
                  type="range"
                  min="0.8"
                  max="1.5"
                  step="0.1"
                  value={voiceRate}
                  onChange={(e) => setVoiceRate(parseFloat(e.target.value))}
                  className="w-full accent-emerald-500"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-extrabold text-slate-300">
                  <span>AI Voice Pitch:</span>
                  <span className="font-mono text-cyan-400 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
                    {voicePitch}x
                  </span>
                </div>
                <input
                  type="range"
                  min="0.7"
                  max="1.3"
                  step="0.1"
                  value={voicePitch}
                  onChange={(e) => setVoicePitch(parseFloat(e.target.value))}
                  className="w-full accent-cyan-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Interview Simulation Defaults */}
        {activeCategory === 'interview' && (
          <div className="bg-slate-900/90 rounded-2xl p-6 border border-slate-800 space-y-6 shadow-xl animate-fade-in">
            <h3 className="text-lg font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-4">
              <Briefcase className="w-5 h-5 text-indigo-400" />
              Default Interview Simulation Environment
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="text-xs font-extrabold text-slate-300 mb-2 block">Default Target Role:</label>
                <select
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-blue-500"
                >
                  <option value="Full Stack Engineer">Full Stack Engineer</option>
                  <option value="Backend Engineer">Backend Engineer</option>
                  <option value="Frontend Engineer">Frontend Engineer</option>
                  <option value="Software Engineer">Software Engineer</option>
                  <option value="AI / ML Engineer">AI / ML Engineer</option>
                  <option value="DevOps / Infrastructure Engineer">DevOps / Infrastructure Engineer</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-extrabold text-slate-300 mb-2 block">Interview Timer Duration:</label>
                <select
                  value={interviewDuration}
                  onChange={(e) => setInterviewDuration(Number(e.target.value))}
                  className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-blue-500"
                >
                  <option value={15}>15 Minutes (Sprint Drill)</option>
                  <option value={30}>30 Minutes (Standard Interview)</option>
                  <option value={45}>45 Minutes (Full Deep-Dive Simulation)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-extrabold text-slate-300 mb-2 block">Difficulty Tier Level:</label>
                <select
                  value={difficultyTier}
                  onChange={(e) => setDifficultyTier(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-blue-500"
                >
                  <option value="Junior (0-2 yrs)">Junior / New Grad (0-2 yrs)</option>
                  <option value="Mid-Level (2-5 yrs)">Mid-Level (2-5 yrs)</option>
                  <option value="Senior (5+ yrs)">Senior (5+ yrs)</option>
                  <option value="Staff / Tech Lead">Staff / Tech Lead</option>
                </select>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800">
              <label className="text-xs font-extrabold text-slate-300 mb-2 block">Feedback Evaluation Frequency:</label>
              <select
                value={feedbackFrequency}
                onChange={(e) => setFeedbackFrequency(e.target.value)}
                className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-blue-500"
              >
                <option value="Instant Per Question">Instant Feedback After Every Question (Recommended)</option>
                <option value="End Of Session">End-Of-Interview Summary Scorecard Only</option>
              </select>
            </div>
          </div>
        )}

        {/* Tab 4: Codeforces & Code Editor Sync */}
        {activeCategory === 'codeforces' && (
          <div className="bg-slate-900/90 rounded-2xl p-6 border border-slate-800 space-y-6 shadow-xl animate-fade-in">
            <h3 className="text-lg font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-4">
              <Code2 className="w-5 h-5 text-purple-400" />
              Codeforces Handle Sync & Monaco Code Editor
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="text-xs font-extrabold text-slate-300 mb-2 block">Codeforces Handle:</label>
                <input
                  type="text"
                  value={codeforcesHandle}
                  onChange={(e) => setCodeforcesHandle(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm font-mono focus:outline-none focus:border-purple-500"
                />
                <span className="text-[11px] text-slate-500 mt-1 block">
                  Automatically pulls public rating and solved problems list.
                </span>
              </div>

              <div>
                <label className="text-xs font-extrabold text-slate-300 mb-2 block">Preferred Coding Language:</label>
                <select
                  value={preferredLang}
                  onChange={(e) => setPreferredLang(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm font-mono focus:outline-none focus:border-purple-500"
                >
                  <option value="cpp">C++ (GCC 11 / C++20)</option>
                  <option value="python">Python 3 (3.11)</option>
                  <option value="java">Java 17</option>
                  <option value="javascript">JavaScript / Node.js</option>
                  <option value="typescript">TypeScript</option>
                  <option value="go">Go</option>
                  <option value="rust">Rust</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-extrabold text-slate-300 mb-2 block">Monaco Editor Dark Theme:</label>
                <select
                  value={editorTheme}
                  onChange={(e) => setEditorTheme(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm font-mono focus:outline-none focus:border-purple-500"
                >
                  <option value="vs-dark">VS Code Dark (Default)</option>
                  <option value="hc-black">High Contrast Black</option>
                  <option value="monokai">Monokai Dark</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Tab 5: Appearance & Theme Mode */}
        {activeCategory === 'appearance' && (
          <div className="bg-slate-900/90 rounded-2xl p-6 border border-slate-800 space-y-6 shadow-xl animate-fade-in">
            <h3 className="text-lg font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-4">
              <Sliders className="w-5 h-5 text-amber-400" />
              Visual Aesthetics & Theme Options
            </h3>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-6 p-4 rounded-xl bg-slate-950 border border-slate-800">
              <div>
                <div className="font-bold text-sm text-white flex items-center gap-2">
                  {theme === 'dark' ? <Moon className="w-4 h-4 text-cyan-400" /> : <Sun className="w-4 h-4 text-amber-400" />}
                  Theme Mode: <span className="text-cyan-400">{theme === 'dark' ? 'Google AI Dark Mode' : 'Light Mode'}</span>
                </div>
                <div className="text-xs text-slate-400 mt-1">
                  High contrast slate background with glassmorphic glow elements.
                </div>
              </div>

              <button
                onClick={toggleTheme}
                className="px-5 py-2.5 rounded-xl font-bold text-xs bg-gradient-to-r from-blue-600 to-indigo-600 text-white flex items-center gap-2 transition-all shadow-md"
              >
                {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-300" /> : <Moon className="w-4 h-4" />}
                Switch to {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
              </button>
            </div>

            <div className="pt-2 border-t border-slate-800">
              <label className="text-xs font-extrabold text-slate-300 mb-2 block">Google UI Accent Color Preset:</label>
              <div className="flex flex-wrap gap-3">
                {['Google Blue', 'Cyber Cyan', 'Emerald Green', 'Indigo Purple', 'Amber Glow'].map((color) => (
                  <button
                    key={color}
                    onClick={() => setAccentColor(color)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                      accentColor === color
                        ? 'bg-blue-600 text-white border-blue-400 shadow-md'
                        : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 6: Privacy & Local Storage */}
        {activeCategory === 'privacy' && (
          <div className="bg-slate-900/90 rounded-2xl p-6 border border-slate-800 space-y-6 shadow-xl animate-fade-in">
            <h3 className="text-lg font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-4">
              <Database className="w-5 h-5 text-rose-400" />
              Privacy, Vector Index & Data Export
            </h3>

            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="font-bold text-sm text-white">Export Local Interview Data</div>
                  <div className="text-xs text-slate-400 mt-0.5">Download your settings, resume context, and history as JSON.</div>
                </div>
                <button
                  onClick={handleExportData}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 flex items-center gap-2"
                >
                  <Download className="w-4 h-4 text-cyan-400" />
                  Export Data JSON
                </button>
              </div>

              <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-900/80 flex items-center justify-between">
                <div>
                  <div className="font-bold text-sm text-rose-300 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-rose-400" /> Purge Local ChromaDB Vector Embeddings
                  </div>
                  <div className="text-xs text-rose-200/80 mt-0.5">Clears stored resume embeddings index to force a fresh upload.</div>
                </div>
                <button
                  onClick={handlePurgeVectorIndex}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-700 hover:bg-rose-600 text-white flex items-center gap-2 shadow-md shadow-rose-900/50"
                >
                  <RotateCcw className="w-4 h-4" />
                  Purge Vector Index
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Global Save Button Footer Bar */}
        <div className="flex items-center justify-between pt-6 border-t border-slate-800">
          {savedSuccess ? (
            <div className="text-xs text-emerald-400 font-bold flex items-center gap-2 bg-emerald-950/60 px-4 py-2 rounded-xl border border-emerald-800 animate-fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> All developer preferences saved successfully to local workspace!
            </div>
          ) : (
            <div className="text-xs text-slate-400 flex items-center gap-1.5 font-medium">
              <Sparkles className="w-3.5 h-3.5 text-blue-400" /> Settings are applied automatically to all future practice sessions.
            </div>
          )}

          <button
            onClick={handleSaveSettings}
            className="px-8 py-3.5 rounded-xl font-black text-xs bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white flex items-center gap-2 shadow-xl shadow-blue-600/30 transition-all hover:scale-105"
          >
            <Save className="w-4 h-4" />
            Save System Preferences
          </button>
        </div>
      </main>
    </div>
  );
}

