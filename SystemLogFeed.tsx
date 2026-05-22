import React, { useRef, useEffect } from 'react';
import { useAgent } from '../lib/agent-context';
import { Terminal, Copy, ShieldAlert, Cpu } from 'lucide-react';

export default function SystemLogFeed() {
  const { logs, connectionHealthy } = useAgent();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTo({
        top: containerRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [logs]);

  const getLogColor = (type: string) => {
    switch (type) {
      case 'success': return 'text-emerald-600 font-bold';
      case 'warning': return 'text-amber-500 font-bold';
      case 'error': return 'text-rose-600 font-extrabold';
      case 'agent_thought': return 'text-blue-500 italic';
      default: return 'text-slate-500';
    }
  };

  const getLogPrefix = (type: string) => {
    switch (type) {
      case 'success': return '[  OK  ]';
      case 'warning': return '[ CALIBR]';
      case 'error': return '[ CRIT ]';
      case 'agent_thought': return '[ THINK]';
      default: return '[ INFO ]';
    }
  };

  return (
    <div className="flex flex-col h-full space-y-2.5">
      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
        <div className="flex items-center space-x-1.5">
          <Terminal className="w-4 h-4 text-slate-500" />
          <h2 className="text-[11px] font-bold font-mono tracking-wider text-slate-700 uppercase">
            Jarvis Diagnostics Logstream
          </h2>
        </div>
        <div className="text-[8px] text-slate-400 font-mono uppercase font-bold tracking-tight">
          FX OS SECURE PORT
        </div>
      </div>

      {/* Modern crisp monospace logs list box */}
      <div ref={containerRef} className="flex-1 bg-slate-900 border border-slate-950/20 rounded-xl p-3 font-mono text-[9px] space-y-1.5 overflow-y-auto max-h-[160px] min-h-[110px] scrollbar-none text-left">
        <div className="text-slate-500 opacity-60">
          FX ENCLAVE: DIAGNOSTIC READOUT CONNECTIVITY NOMINAL
        </div>
        
        {logs.map((log) => (
          <div key={log.id} className="flex space-x-2 leading-relaxed hover:bg-white/5 p-1 rounded transition-colors group">
            <span className="text-slate-600 flex-shrink-0 select-none">
              {log.timestamp ? new Date(log.timestamp).toLocaleTimeString([], { hour12: false }) : '00:00:00'}
            </span>
            <span className={`flex-shrink-0 select-none ${getLogColor(log.type)}`}>
              {getLogPrefix(log.type)}
            </span>
            <span className="text-slate-200 break-all">{log.message}</span>
          </div>
        ))}

        {logs.length === 0 && (
          <div className="flex items-center justify-center py-6 text-slate-500 italic">
            Awaiting synaptic log streams...
          </div>
        )}
      </div>

      <div className="flex justify-between items-center text-[8px] text-slate-400 font-bold uppercase tracking-wide">
        <span>STATE RESOLVER: ACTIVE</span>
        <span className="text-emerald-600 animate-pulse font-bold">• STABLE SYSTEM SYNC</span>
      </div>
    </div>
  );
}
export { SystemLogFeed };
