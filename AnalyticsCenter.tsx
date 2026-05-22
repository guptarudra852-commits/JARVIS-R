import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  TrendingUp, 
  CheckCircle, 
  MessageSquare, 
  Activity, 
  Award,
  Zap,
  Clock,
  Cpu
} from 'lucide-react';

interface MetricsData {
  date: string;
  completed: number;
  pending: number;
  queries: number;
  efficiency: number;
}

const ANALYTICS_DB: MetricsData[] = [
  { date: "May 14", completed: 3, pending: 4, queries: 12, efficiency: 75 },
  { date: "May 15", completed: 5, pending: 2, queries: 19, efficiency: 82 },
  { date: "May 16", completed: 8, pending: 1, queries: 32, efficiency: 88 },
  { date: "May 17", completed: 4, pending: 3, queries: 22, efficiency: 91 },
  { date: "May 18", completed: 11, pending: 2, queries: 45, efficiency: 95 },
  { date: "May 19", completed: 9, pending: 1, queries: 38, efficiency: 97 },
  { date: "May 20", completed: 14, pending: 2, queries: 54, efficiency: 99 }
];

export default function AnalyticsCenter() {
  const [activeTab, setActiveTab] = useState<'productivity' | 'queries' | 'efficiency'>('productivity');
  const [stats, setStats] = useState<MetricsData[]>(ANALYTICS_DB);

  // SVG Chart Calculation Helpers
  const width = 600;
  const height = 180;
  const padding = 25;
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;

  // Max calculations for optimal graphing layout
  const maxCompleted = Math.max(...stats.map(s => s.completed)) || 1;
  const maxQueries = Math.max(...stats.map(s => s.queries)) || 1;
  const maxEfficiency = 100;

  const getPoints = () => {
    return stats.map((item, index) => {
      const x = padding + (index / (stats.length - 1)) * chartWidth;
      let yValue = 0;
      if (activeTab === 'productivity') {
        yValue = (item.completed / maxCompleted) * chartHeight;
      } else if (activeTab === 'queries') {
        yValue = (item.queries / maxQueries) * chartHeight;
      } else {
        yValue = (item.efficiency / maxEfficiency) * chartHeight;
      }
      const y = height - padding - yValue;
      return { x, y, value: activeTab === 'productivity' ? item.completed : activeTab === 'queries' ? item.queries : item.efficiency, date: item.date };
    });
  };

  const points = getPoints();
  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const areaPath = points.length > 0 
    ? `${linePath} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`
    : '';

  return (
    <div className="flex flex-col space-y-4">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-3 gap-2">
        <div className="flex items-center space-x-2">
          <TrendingUp className="w-5 h-5 text-blue-600" />
          <div>
            <h2 className="text-sm font-semibold tracking-tight text-slate-800 uppercase">
              Synaptic Analytics Center
            </h2>
            <p className="text-[10px] text-slate-400 font-mono">
              REAL-TIME OPERATIONAL VELOCITY MONITOR // SOTA v4.5
            </p>
          </div>
        </div>

        {/* Tab switcher */}
        <div className="flex bg-slate-100 p-0.5 rounded-lg text-[10px] font-mono tracking-tight self-end sm:self-auto uppercase font-bold">
          <button
            onClick={() => setActiveTab('productivity')}
            className={`px-3 py-1 rounded-md transition cursor-pointer ${activeTab === 'productivity' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
          >
            Productivity
          </button>
          <button
            onClick={() => setActiveTab('queries')}
            className={`px-3 py-1 rounded-md transition cursor-pointer ${activeTab === 'queries' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
          >
            AI Queries
          </button>
          <button
            onClick={() => setActiveTab('efficiency')}
            className={`px-3 py-1 rounded-md transition cursor-pointer ${activeTab === 'efficiency' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
          >
            Core Parity
          </button>
        </div>
      </div>

      {/* Grid Quick Stats Displays */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="p-3 rounded-xl border border-slate-100 bg-white/50 backdrop-blur-sm flex items-center space-x-3 shadow-sm">
          <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
            <CheckCircle className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] text-slate-400 uppercase font-mono">Tasks Optimized</div>
            <div className="text-base font-extrabold text-slate-800">148 Units</div>
          </div>
        </div>

        <div className="p-3 rounded-xl border border-slate-100 bg-white/50 backdrop-blur-sm flex items-center space-x-3 shadow-sm">
          <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
            <MessageSquare className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] text-slate-400 uppercase font-mono">AI Interactions</div>
            <div className="text-base font-extrabold text-slate-800">512 Hits</div>
          </div>
        </div>

        <div className="p-3 rounded-xl border border-slate-100 bg-white/50 backdrop-blur-sm flex items-center space-x-3 shadow-sm">
          <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] text-slate-400 uppercase font-mono">Uptime Parity</div>
            <div className="text-base font-extrabold text-slate-800">99.98% Stable</div>
          </div>
        </div>

        <div className="p-3 rounded-xl border border-slate-100 bg-white/50 backdrop-blur-sm flex items-center space-x-3 shadow-sm">
          <div className="p-2 rounded-lg bg-violet-50 text-violet-600">
            <Award className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] text-slate-400 uppercase font-mono">Cognitive Index</div>
            <div className="text-base font-extrabold text-slate-800">98.4 / 100 SOTA</div>
          </div>
        </div>
      </div>

      {/* Graphical SVG Area */}
      <div className="border border-slate-100 bg-white/40 p-3 rounded-xl shadow-sm relative overflow-hidden">
        {/* Responsive container */}
        <div className="w-full overflow-x-auto">
          <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto min-w-[500px]">
            {/* Horizontal Grid lines */}
            {[0, 0.25, 0.5, 0.75, 1].map((ratio, index) => {
              const y = padding + ratio * chartHeight;
              return (
                <line
                  key={index}
                  x1={padding}
                  y1={y}
                  x2={width - padding}
                  y2={y}
                  stroke="#f1f5f9"
                  strokeWidth="1"
                  strokeDasharray="4 4"
                />
              );
            })}

            {/* Area under line */}
            {areaPath && (
              <motion.path
                d={areaPath}
                fill={
                  activeTab === 'productivity' 
                    ? 'rgba(16, 185, 129, 0.08)' 
                    : activeTab === 'queries' 
                    ? 'rgba(37, 99, 235, 0.08)' 
                    : 'rgba(99, 102, 241, 0.08)'
                }
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              />
            )}

            {/* Line graph */}
            {linePath && (
              <motion.path
                d={linePath}
                fill="none"
                stroke={
                  activeTab === 'productivity' 
                    ? '#10b981' 
                    : activeTab === 'queries' 
                    ? '#2563eb' 
                    : '#6366f1'
                }
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
            )}

            {/* Interactive Data Nodes */}
            {points.map((p, idx) => (
              <g key={idx} className="group cursor-pointer">
                <circle
                  cx={p.x}
                  cy={p.y}
                  r="4"
                  fill="white"
                  stroke={
                    activeTab === 'productivity' 
                      ? '#10b981' 
                      : activeTab === 'queries' 
                      ? '#2563eb' 
                      : '#6366f1'
                  }
                  strokeWidth="2.5"
                />
                
                {/* Visual glow on hover */}
                <circle
                  cx={p.x}
                  cy={p.y}
                  r="8"
                  fill={
                    activeTab === 'productivity' 
                      ? 'rgba(16, 185, 129, 0.3)' 
                      : activeTab === 'queries' 
                      ? 'rgba(37, 99, 235, 0.3)' 
                      : 'rgba(99, 102, 241, 0.3)'
                  }
                  className="opacity-0 group-hover:opacity-100 transition duration-150"
                />

                {/* Point values tooltip overlays */}
                <text
                  x={p.x}
                  y={p.y - 10}
                  textAnchor="middle"
                  fill="#475569"
                  fontSize="9"
                  fontWeight="bold"
                  fontFamily="monospace"
                  className="opacity-0 group-hover:opacity-100 transition duration-150 bg-white"
                >
                  {p.value}
                </text>

                {/* X Axis Labels */}
                <text
                  x={p.x}
                  y={height - 6}
                  textAnchor="middle"
                  fill="#94a3b8"
                  fontSize="9"
                  fontFamily="monospace"
                >
                  {p.date}
                </text>
              </g>
            ))}
          </svg>
        </div>
      </div>
    </div>
  );
}
