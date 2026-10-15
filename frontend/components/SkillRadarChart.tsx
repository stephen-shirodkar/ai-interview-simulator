'use client';

import React from 'react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from 'recharts';

interface SkillRadarChartProps {
  data?: Array<{ subject: string; score: number; fullMark: number }>;
}

const defaultData = [
  { subject: 'Technical Domain', score: 85, fullMark: 100 },
  { subject: 'Behavioral STAR', score: 80, fullMark: 100 },
  { subject: 'Problem Solving', score: 88, fullMark: 100 },
  { subject: 'Communication', score: 82, fullMark: 100 },
  { subject: 'Coding Speed', score: 78, fullMark: 100 },
];

export const SkillRadarChart: React.FC<SkillRadarChartProps> = ({ data = defaultData }) => {
  return (
    <div className="w-full h-[280px]">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="75%" data={data}>
          <PolarGrid stroke="#334155" />
          <PolarAngleAxis dataKey="subject" stroke="#94a3b8" tick={{ fontSize: 11 }} />
          <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#475569" />
          <Radar
            name="Candidate Competency"
            dataKey="score"
            stroke="#6366f1"
            fill="#818cf8"
            fillOpacity={0.45}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};
