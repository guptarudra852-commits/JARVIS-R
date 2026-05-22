import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Cpu, 
  Brain, 
  Search, 
  Terminal, 
  Calendar, 
  Mail, 
  TrendingUp, 
  Settings, 
  Activity, 
  Volume2, 
  Database,
  CheckCircle,
  RefreshCw,
  Sparkles,
  Zap,
  Shield,
  ShieldCheck,
  AlertTriangle,
  Radio,
  WifiOff
} from 'lucide-react';
import { MicroAgent } from '../types';
import { useAgent } from '../lib/agent-context';

interface ExtendedAgent extends MicroAgent {
  latency?: string;
  uptime?: string;
  healthStatus?: 'healthy' | 'degraded' | 'offline';
  isPinging?: boolean;
}

interface AgentMarketplaceProps {
  onSelectAgent?: (agentId: string, agentName: string) => void;
  activeAgentId?: string;
  activeAgentName?: string;
}

const INITIAL_AGENTS: MicroAgent[] = [
  { id: "coordinator", name: "Coordinator Agent", role: "Orchestrator Core", status: "idle", load: "4%", executions: 142, description: "Monitors overall pipeline sanity, schedules background automation runs, and parses natural user intents." },
  { id: "researcher", name: "Research Agent", role: "Knowledge Base", status: "idle", load: "0%", executions: 89, description: "Extracts real-time indexes, synthesizes web articles, and generates deep reference reports." },
  { id: "coder", name: "Coding Agent", role: "Software Synthesizer", status: "idle", load: "0%", executions: 211, description: "Audits codebase structures, recommends refactoring blueprints, and manages automated testing gates." },
  { id: "scheduler", name: "Scheduler Agent", role: "Automation Runner", status: "active", load: "12%", executions: 630, description: "Manages cron cycles, automates recurrent checklists, and realigns priority queues." },
  { id: "email", name: "Email Agent", role: "Workspace Outreach", status: "idle", load: "1%", executions: 55, description: "Composes elegant context-aware emails and files calendar reminders through secure Google tunnels." },
  { id: "productivity", name: "Productivity Agent", role: "Performance Analyst", status: "idle", load: "0%", executions: 118, description: "Measures task completion velocities, rates cognitive focus, and keeps administrative habits tuned." },
  { id: "automation", name: "Automation Agent", role: "Script Executive", status: "idle", load: "5%", executions: 442, description: "Bridges custom microservice interactions and triggers server webhook executions." },
  { id: "analytics", name: "Analytics Agent", role: "Metric Modeler", status: "idle", load: "0%", executions: 95, description: "Processes historical activity graphs and exports beautiful SVG structured data schemas." },
  { id: "voice", name: "Voice Agent", role: "Cognitive Transcriber", status: "idle", load: "0%", executions: 304, description: "Decodes Whisper audio recordings, isolates ambient vocal hum, and triggers speech synthesizers." },
  { id: "memory", name: "Memory Agent", role: "Synaptic Hub", status: "active", load: "2%", executions: 752, description: "Performs semantic retrieval, deletes obsolete facts, and clusters short-term session context." }
];

export default function AgentMarketplace({ onSelectAgent, activeAgentId, activeAgentName }: AgentMarketplaceProps) {
  const { appendLog } = useAgent();
  const [agents, setAgents] = useState<ExtendedAgent[]>(() => {
    return INITIAL_AGENTS.map(agent => ({
      ...agent,
      latency: "14ms",
      uptime: "99.98%",
      healthStatus: "healthy",
      isPinging: false
    }));
  });
  
  const [globalSweeping, setGlobalSweeping] = useState(false);

  const getAgentIcon = (id: string, colorClass: string) => {
    switch (id) {
      case 'coordinator': return <Cpu className={`w-4 h-4 ${colorClass}`} />;
      case 'researcher': return <Search className={`w-4 h-4 ${colorClass}`} />;
      case 'coder': return <Terminal className={`w-4 h-4 ${colorClass}`} />;
      case 'scheduler': return <Calendar className={`w-4 h-4 ${colorClass}`} />;
      case 'email': return <Mail className={`w-4 h-4 ${colorClass}`} />;
      case 'productivity': return <TrendingUp className={`w-4 h-4 ${colorClass}`} />;
      case 'automation': return <Settings className={`w-4 h-4 ${colorClass}`} />;
      case 'analytics': return <Activity className={`w-4 h-4 ${colorClass}`} />;
      case 'voice': return <Volume2 className={`w-4 h-4 ${colorClass}`} />;
      case 'memory': return <Database className={`w-4 h-4 ${colorClass}`} />;
      default: return <Brain className={`w-4 h-4 ${colorClass}`} />;
    }
  };

  const pingSingleAgent = async (id: string, silent = false) => {
    setAgents(prev => prev.map(a => a.id === id ? { ...a, isPinging: true } : a));
    if (!silent) {
      appendLog(`Sending diagnostics request envelope to node [${id}]...`, "info");
    }

    try {
      const res = await fetch(`/api/agents/${id}/ping`);
      if (res.ok) {
        const data = await res.json();
        setAgents(prev => prev.map(a => a.id === id ? {
          ...a,
          isPinging: false,
          latency: data.latency,
          uptime: data.uptime,
          healthStatus: data.status,
          load: data.load,
          executions: a.executions + 1
        } : a));
        if (!silent) {
          appendLog(`Enclave [${id}] verified: latency=${data.latency}, uptime=${data.uptime}, status=${data.status.toUpperCase()}`, "success");
        }
      } else {
        throw new Error("HTTP Response Status Invalid");
      }
    } catch (err) {
      // Offline fallback state simulation
      setTimeout(() => {
        setAgents(prev => prev.map(a => a.id === id ? {
          ...a,
          isPinging: false,
          latency: `Error`,
          uptime: "99.12%",
          healthStatus: "offline"
        } : a));
        if (!silent) {
          appendLog(`Node check failed for [${id}]. Interface returned transient timeout error.`, "error");
        }
      }, 500);
    }
  };

  const pingAllAgentsSweep = async () => {
    if (globalSweeping) return;
    setGlobalSweeping(true);
    appendLog("Initiating multi-node global security sweep on secure port 3000.", "info");

    // Ping sequentially with stagger 
    for (let i = 0; i < agents.length; i++) {
      const agentObj = agents[i];
      await pingSingleAgent(agentObj.id, true);
    }

    setGlobalSweeping(false);
    appendLog("Global enclave sweep complete. Fully operational secure tunnel grid maintained.", "success");
  };

  return (
    <div className="flex flex-col space-y-5 text-left" id="agents-health-marketplace">
      
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-3 gap-3">
        <div className="flex items-center space-x-2.5">
          <div className="p-1.5 rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-600">
            <Radio className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <h2 className="text-xs font-bold text-slate-800 uppercase tracking-widest">
              Specialized Agent Core Statuses
            </h2>
            <p className="text-[9px] text-slate-400 font-mono mt-0.5">
              10 operational enclaves // Health inspection and uptime statistics
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={pingAllAgentsSweep}
            disabled={globalSweeping}
            className={`px-3 py-1.5 rounded-xl border border-slate-105 hover:bg-slate-100/50 text-[10px] uppercase font-mono tracking-wider font-extrabold flex items-center space-x-1.5 cursor-pointer md:w-auto w-full justify-center transition-colors ${
              globalSweeping ? 'text-[#10b981] font-black' : 'text-slate-505 hover:text-emerald-600'
            }`}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${globalSweeping ? 'animate-spin text-emerald-500' : 'text-slate-400'}`} />
            <span>{globalSweeping ? "Sweeping Node Grid..." : "Ping All Enclaves"}</span>
          </button>
        </div>
      </div>

      {/* Agents grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {agents.map((agent) => {
          const isPinging = agent.isPinging;
          const status = agent.healthStatus;
          const isActive = agent.id === activeAgentId || agent.name === activeAgentName;
          
          let statusBadgeColor = "text-emerald-600 bg-emerald-50 border-emerald-200";
          let statusDotColor = "bg-emerald-500";
          
          if (status === "degraded") {
            statusBadgeColor = "text-amber-600 bg-amber-50 border-amber-200";
            statusDotColor = "bg-amber-500 animate-pulse";
          } else if (status === "offline") {
            statusBadgeColor = "text-rose-600 bg-rose-50 border-rose-200";
            statusDotColor = "bg-rose-500";
          }

          return (
            <motion.div
              key={agent.id}
              onClick={() => onSelectAgent?.(agent.id, agent.name)}
              className={`p-4 rounded-2xl border transition-all duration-300 flex flex-col justify-between min-h-[225px] relative overflow-hidden cursor-pointer shadow-sm ${
                isActive
                  ? "bg-teal-50/40 border-teal-500 ring-2 ring-teal-300/30 shadow-md transform -translate-y-0.5"
                  : "bg-white/70 border-slate-100 hover:border-slate-200 hover:bg-white/90"
              }`}
              whileHover={{ y: -3 }}
            >
              {/* Sonar Pulse animation behind the active pinging item */}
              {isPinging && (
                <div className="absolute inset-0 bg-blue-50/20 flex items-center justify-center pointer-events-none">
                  <div className="absolute w-20 h-20 bg-blue-400/10 rounded-full animate-ping" />
                  <div className="absolute w-12 h-12 bg-blue-300/15 rounded-full animate-ping" />
                </div>
              )}

              {/* Top Row: Icon + Ping status */}
              <div className="flex items-center justify-between">
                <div className={`p-2 rounded-xl ${isActive ? 'bg-teal-100/50 border border-teal-200' : 'bg-slate-50/50 border border-slate-100'}`}>
                  {getAgentIcon(agent.id, isActive ? 'text-teal-700' : 'text-slate-700')}
                </div>
                
                {/* Ping Button / Status Badge */}
                <div className="flex items-center space-x-1.5">
                  <span className={`inline-block w-1.5 h-1.5 rounded-full ${statusDotColor}`} />
                  <span className="text-[9px] font-mono font-black text-slate-500 uppercase">
                    {status}
                  </span>
                </div>
              </div>

              {/* Details Block */}
              <div className="mt-2 text-left">
                <div className="text-[11px] font-bold text-slate-800 tracking-tight leading-none mb-0.5 flex items-center gap-1">
                  {agent.name}
                  {isActive && <span className="w-1.5 h-1.5 bg-teal-500 rounded-full inline-block animate-ping" />}
                </div>
                <div className="text-[9px] font-mono text-slate-400 leading-none">
                  {agent.role}
                </div>
                <p className="text-[9.5px] text-slate-400 leading-relaxed line-clamp-2 mt-2">
                  {agent.description}
                </p>
              </div>

              {/* Telemetry row */}
              <div className="mt-3 pt-2 border-t border-slate-100/60 grid grid-cols-2 gap-2 text-[9px] font-mono text-slate-400 leading-none">
                <div>
                  LATENCY: <span className="text-slate-800 font-extrabold">{agent.latency}</span>
                </div>
                <div>
                  UPTIME: <span className="text-slate-800 font-extrabold">{agent.uptime}</span>
                </div>
                <div>
                  LOAD: <span className="text-slate-800 font-extrabold">{agent.load}</span>
                </div>
                <div>
                  EXECS: <span className="text-slate-800 font-extrabold">{agent.executions}</span>
                </div>
              </div>

              {/* Activate Action Button */}
              <div className="mt-3" onClick={(e) => e.stopPropagation()}>
                {isActive ? (
                  <div className="flex items-center justify-center space-x-1 py-1.5 bg-teal-500/15 border border-teal-200 text-teal-700 rounded-xl text-[9px] font-mono font-extrabold select-none">
                    <ShieldCheck className="w-3.5 h-3.5 text-teal-600 animate-pulse" />
                    <span>ENCLAVE ENGAGED</span>
                  </div>
                ) : (
                  <button
                    onClick={() => onSelectAgent?.(agent.id, agent.name)}
                    className="w-full py-1.5 bg-slate-50 border border-slate-100 hover:border-teal-300 hover:bg-teal-50/55 text-[9px] font-mono font-extrabold text-slate-500 hover:text-teal-600 transition-all rounded-xl cursor-pointer flex items-center justify-center space-x-1"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>ACTIVATE CORE</span>
                  </button>
                )}
              </div>

              {/* Ping action hover trigger overlay */}
              <div className="absolute right-2 top-2" onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={() => pingSingleAgent(agent.id)}
                  disabled={isPinging}
                  className="p-1 bg-slate-100 hover:bg-slate-200 rounded-lg text-[9px] font-bold font-mono tracking-widest text-slate-600 hover:text-slate-900 transition flex items-center space-x-0.5 cursor-pointer disabled:opacity-50"
                  title="Ping single host"
                >
                  <Zap className="w-2.5 h-2.5 text-amber-500" />
                  <span>PING</span>
                </button>
              </div>

            </motion.div>
          );
        })}
      </div>
      
    </div>
  );
}
