import React, { useState, useEffect } from 'react';
import { useAgent } from '../lib/agent-context';
import { 
  Activity, 
  Cpu, 
  Database,
  ShieldCheck, 
  Users, 
  Zap, 
  Wifi, 
  WifiOff,
  Server,
  Terminal,
  Clock,
  RefreshCw
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import SystemLogFeed from './SystemLogFeed';

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-950/95 border border-slate-800 p-2.5 rounded-xl text-[9px] font-mono text-slate-250 shadow-xl backdrop-blur-md">
        <p className="text-slate-400 border-b border-slate-800 pb-1 mb-1.5 font-bold">UTC: {payload[0].payload.time}</p>
        <p className="text-cyan-400 flex justify-between gap-4">
          <span>CPU USAGE:</span>
          <span className="font-extrabold text-white">{payload[0].value}%</span>
        </p>
        {payload[1] && (
          <p className="text-purple-400 flex justify-between gap-4 mt-0.5">
            <span>RAM LEVEL:</span>
            <span className="font-extrabold text-white">{payload[1].value} MB</span>
          </p>
        )}
      </div>
    );
  }
  return null;
};

export default function LiveSystemStatus() {
  const { connectionHealthy, fallbackToLocal, isAutonomousRunning, setAutonomousRunning, tasks, logs, appendLog } = useAgent();
  const [metricsHistory, setMetricsHistory] = useState<{cpu: number, ram: number, time: string}[]>(() => {
    // Generate pre-populated metrics data so chart starts immediately active and populated
    const data = [];
    const now = new Date();
    for (let i = 14; i >= 0; i--) {
      const pastTime = new Date(now.getTime() - i * 1500);
      data.push({
        cpu: Math.floor(Math.random() * 12) + 14,
        ram: Math.floor(Math.random() * 20) + 448,
        time: pastTime.toLocaleTimeString('en-US', { hour12: false, minute: '2-digit', second: '2-digit' })
      });
    }
    return data;
  });
  
  const [metrics, setMetrics] = useState({
    cpu: 18,
    ram: 452,
    syncRate: '99.98%'
  });

  // Simulation diagnostics loop - set to 1.5 seconds for active feel
  useEffect(() => {
    const handle = setInterval(() => {
      setMetrics(prev => {
        const deltaCpu = Math.floor(Math.random() * 7) - 3;
        const newCpu = Math.max(10, Math.min(48, prev.cpu + deltaCpu));
        
        const deltaRam = Math.floor(Math.random() * 10) - 5;
        const newRam = Math.max(440, Math.min(498, prev.ram + deltaRam));
        
        const newMetrics = { cpu: newCpu, ram: newRam, syncRate: '99.98%' };
        
        setMetricsHistory(history => {
          const newHistory = [...history, { 
            cpu: newCpu, 
            ram: newRam, 
            time: new Date().toLocaleTimeString('en-US', { hour12: false, minute: '2-digit', second: '2-digit' }) 
          }];
          return newHistory.slice(-15); // Keep last 15 entries
        });
        return newMetrics;
      });
    }, 1500);

    return () => clearInterval(handle);
  }, []);

  const toggleAutonomous = () => {
    const nextVal = !isAutonomousRunning;
    setAutonomousRunning(nextVal);
    appendLog(nextVal ? "Cognitive auto-threading sequence disengaged." : "Cognitive auto-threading sequence set to manual override.", "info");
  };

  const activeTasksCount = tasks.filter(t => t.status === 'in_progress').length;

  return (
    <div className="flex flex-col space-y-4">
      {/* Header bar */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center space-x-2">
          <Activity className="w-5 h-5 text-blue-600" />
          <div className="text-left">
            <h2 className="text-xs font-bold tracking-tight text-slate-800 uppercase font-mono">
              Live Diagnostics Monitor
            </h2>
            <p className="text-[10px] text-slate-400 font-mono uppercase tracking-wide">
              NOMINAL COMPILER // AUTOLINK ACTIVE
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-1.5 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100 font-mono text-[9px] font-bold text-emerald-600 animate-pulse select-none">
          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
          <span>PORT 3000 ONLINE</span>
        </div>
      </div>

      {/* Grid Diagnostics indicators */}
      <div className="grid grid-cols-2 gap-3">
        {/* Metric 1 */}
        <div className="p-3 rounded-xl bg-slate-50/50 border border-slate-100 text-left">
          <div className="flex items-center justify-between font-mono text-[10px] text-slate-400 font-bold uppercase mb-1">
            <span className="flex items-center gap-1.5"><Cpu className="w-3.5 h-3.5 text-slate-400" /> CPU CORES</span>
            <span className="text-cyan-600">{metrics.cpu}%</span>
          </div>
          <div className="w-full bg-slate-100 h-1 rounded-full relative overflow-hidden">
            <div className="bg-cyan-550 h-full rounded-full transition-all duration-300" style={{ width: `${metrics.cpu}%` }} />
          </div>
        </div>

        {/* Metric 2 */}
        <div className="p-3 rounded-xl bg-slate-50/50 border border-slate-100 text-left">
          <div className="flex items-center justify-between font-mono text-[10px] text-slate-400 font-bold uppercase mb-1">
            <span className="flex items-center gap-1.5"><Server className="w-3.5 h-3.5 text-slate-400" /> RAM CAP</span>
            <span className="text-purple-600">{metrics.ram}MB</span>
          </div>
          <div className="w-full bg-slate-100 h-1 rounded-full relative overflow-hidden">
            <div className="bg-purple-550 h-full rounded-full transition-all duration-300" style={{ width: `${(metrics.ram / 1024) * 100}%` }} />
          </div>
        </div>
      </div>

      {/* Metrics Chart */}
      <div className="h-[130px] w-full bg-slate-950 border border-slate-900 rounded-2xl p-2 relative overflow-hidden shadow-inner flex flex-col justify-between">
        {/* Futuristic Grid Overlay Lines */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b12_1px,transparent_1px),linear-gradient(to_bottom,#1e293b12_1px,transparent_1px)] bg-[size:14px_14px] pointer-events-none opacity-30" />
        
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={metricsHistory} margin={{ top: 8, right: 8, left: 8, bottom: 4 }}>
            <defs>
              <linearGradient id="cpuGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.35}/>
                <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0}/>
              </linearGradient>
              <linearGradient id="ramGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#a855f7" stopOpacity={0.35}/>
                <stop offset="95%" stopColor="#a855f7" stopOpacity={0.0}/>
              </linearGradient>
            </defs>
            <CartesianGrid stroke="#1e293b" opacity={0.25} strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="time" hide={true} />
            <YAxis yAxisId="cpu" domain={[0, 80]} hide={true} />
            <YAxis yAxisId="ram" domain={[400, 550]} hide={true} />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#334155', strokeWidth: 1 }} />
            <Area 
              yAxisId="cpu"
              type="monotone" 
              dataKey="cpu" 
              stroke="#06b6d4" 
              strokeWidth={1.5}
              fill="url(#cpuGradient)" 
              activeDot={{ r: 4, stroke: '#06b6d4', strokeWidth: 1, fill: '#ffffff' }}
            />
            <Area 
              yAxisId="ram"
              type="monotone" 
              dataKey="ram" 
              stroke="#a855f7" 
              strokeWidth={1.5}
              fill="url(#ramGradient)" 
              activeDot={{ r: 4, stroke: '#a855f7', strokeWidth: 1, fill: '#ffffff' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Interactive Switch container for autonomous threads */}
      <div className="p-3 rounded-xl bg-slate-50/40 border border-slate-100 flex items-center justify-between text-left">
        <div>
          <span className="text-[10px] font-bold font-mono text-slate-600 uppercase tracking-tight block">
            Self-Correcting Autonomous Threads
          </span>
          <span className="text-[9px] text-slate-400 font-mono tracking-wide mt-0.5 block">
            {isAutonomousRunning ? 'COORDINATOR COGNITIVE PLAN LOOPS ACTIVE' : 'AWAITING USER CORE COMMAND INPUT'}
          </span>
        </div>
        
        <button
          onClick={toggleAutonomous}
          className={`px-3 py-1.5 text-[10px] uppercase font-mono font-bold tracking-wider rounded-lg border transition-all cursor-pointer ${
            isAutonomousRunning
              ? 'bg-blue-600 border-none text-white shadow-sm hover:bg-blue-700'
              : 'border-slate-150 bg-white text-slate-600 hover:bg-slate-50'
          }`}
        >
          {isAutonomousRunning ? 'SUSPEND' : 'ENGAGE'}
        </button>
      </div>

      {/* Embedded Terminal Log Feed Card */}
      <div className="border border-slate-100 bg-white/40 p-3 rounded-xl shadow-sm text-left">
        <SystemLogFeed />
      </div>

      {/* Cloud Security Indicator */}
      {fallbackToLocal ? (
        <div className="p-3 border border-amber-100 bg-amber-50/50 rounded-xl flex items-center justify-between text-[11px] text-left">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-amber-500 animate-pulse" />
            <span className="text-amber-700 font-mono font-bold uppercase">Hybrid Enclave (Disconnected)</span>
          </div>
          <span className="text-[8px] bg-amber-150 text-amber-600 px-1.5 py-0.5 rounded font-bold font-mono">LOCAL BACKUP</span>
        </div>
      ) : connectionHealthy ? (
        <div className="p-3 border border-emerald-100 bg-emerald-50/50 rounded-xl flex items-center justify-between text-[11px] text-left">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span className="text-emerald-700 font-mono font-bold uppercase">Database Datalink: Secured</span>
          </div>
          <span className="text-[8px] bg-emerald-105 text-emerald-600 px-1.5 py-0.5 rounded font-bold font-mono">FIRESTORE</span>
        </div>
      ) : (
        <div className="p-3 border border-rose-100 bg-rose-50/50 rounded-xl flex items-center justify-between text-[11px] text-left">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-rose-500 animate-bounce" />
            <span className="text-rose-700 font-mono font-bold uppercase">Cloud Connection Offline</span>
          </div>
          <span className="text-[8px] bg-rose-105 text-rose-600 px-1.5 py-0.5 rounded font-bold font-mono">OFFLINE</span>
        </div>
      )}
    </div>
  );
}
export { LiveSystemStatus };
