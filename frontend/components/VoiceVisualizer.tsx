'use client';

import React from 'react';
import { SpeechState } from '../lib/speechEngine';

interface VoiceVisualizerProps {
  state: SpeechState;
  interviewerName?: string;
}

export const VoiceVisualizer: React.FC<VoiceVisualizerProps> = ({
  state,
  interviewerName = 'Alex (AI Technical Recruiter)',
}) => {
  return (
    <div className="glass-card rounded-2xl p-6 relative overflow-hidden border border-indigo-500/20">
      {/* Background ambient glow effect */}
      <div
        className={`absolute -inset-1 blur-2xl opacity-20 transition-all duration-700 ${
          state === 'speaking'
            ? 'bg-gradient-to-r from-cyan-500 to-indigo-500 opacity-40'
            : state === 'listening'
            ? 'bg-gradient-to-r from-emerald-500 to-teal-500 opacity-40'
            : state === 'processing'
            ? 'bg-gradient-to-r from-purple-500 to-pink-500 opacity-40'
            : 'bg-indigo-600'
        }`}
      />

      <div className="relative z-10 flex flex-col items-center text-center gap-4">
        {/* Avatar Circle with Audio Waves */}
        <div className="relative flex items-center justify-center">
          {/* Animated pulse rings when speaking/listening */}
          {(state === 'speaking' || state === 'listening') && (
            <>
              <div
                className={`absolute w-32 h-32 rounded-full animate-ping opacity-25 ${
                  state === 'speaking' ? 'bg-indigo-500' : 'bg-emerald-500'
                }`}
              />
              <div
                className={`absolute w-28 h-28 rounded-full animate-pulse opacity-40 ${
                  state === 'speaking' ? 'bg-cyan-400' : 'bg-teal-400'
                }`}
              />
            </>
          )}

          <div className="w-24 h-24 rounded-full bg-slate-900 border-2 border-indigo-500/40 p-1 flex items-center justify-center shadow-xl shadow-indigo-500/20 overflow-hidden">
            <div className="w-full h-full rounded-full bg-slate-950 flex items-center justify-center overflow-hidden p-1">
              <img
                src="/logo.png"
                alt="AI Interviewer Avatar"
                className={`w-full h-full object-contain transition-transform duration-300 ${
                  state === 'speaking' ? 'scale-110' : state === 'listening' ? 'scale-105' : 'scale-100'
                }`}
              />
            </div>
          </div>
        </div>

        {/* Status Text & Name */}
        <div>
          <h3 className="font-semibold text-lg text-slate-100 flex items-center justify-center gap-2">
            {interviewerName}
          </h3>
          <p className="text-xs text-slate-400 mt-1 flex items-center justify-center gap-2">
            <span
              className={`w-2 h-2 rounded-full ${
                state === 'speaking'
                  ? 'bg-cyan-400 animate-pulse'
                  : state === 'listening'
                  ? 'bg-emerald-400 animate-ping'
                  : state === 'processing'
                  ? 'bg-purple-400 animate-spin'
                  : 'bg-slate-500'
              }`}
            />
            {state === 'speaking' && 'AI Interviewer is speaking...'}
            {state === 'listening' && 'Listening to your spoken answer... (Speak into mic)'}
            {state === 'processing' && 'RAG + Llama 3 is analyzing your answer...'}
            {state === 'idle' && 'Voice AI standby'}
          </p>
        </div>

        {/* Audio Waveform Bars Simulation */}
        <div className="flex items-center justify-center gap-1 h-8 mt-1">
          {[12, 24, 18, 32, 16, 28, 20, 36, 14, 22].map((height, i) => (
            <div
              key={i}
              className={`w-1 rounded-full transition-all duration-300 ${
                state === 'speaking'
                  ? 'bg-cyan-400 animate-pulse'
                  : state === 'listening'
                  ? 'bg-emerald-400 animate-pulse'
                  : 'bg-slate-700'
              }`}
              style={{
                height:
                  state === 'speaking' || state === 'listening'
                    ? `${Math.max(6, height * (i % 2 === 0 ? 1.2 : 0.8))}px`
                    : '6px',
                animationDelay: `${i * 100}ms`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
