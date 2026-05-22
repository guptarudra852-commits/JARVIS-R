import React, { useState, useEffect, useRef } from 'react';
import { 
  Users, 
  Sparkles, 
  Send, 
  Trash2, 
  Play, 
  Settings, 
  Activity, 
  Terminal, 
  Cpu, 
  Search, 
  Calendar, 
  Mail, 
  TrendingUp, 
  Database, 
  Volume2, 
  MessageSquare,
  Bot,
  User,
  Plus,
  Loader2,
  ChevronRight,
  Lightbulb,
  ArrowRightLeft,
  Copy,
  Check,
  FileText,
  CheckSquare,
  Layers,
  BookOpen,
  Eye,
  SendHorizontal
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAgent } from '../lib/agent-context';
import ReactMarkdown from 'react-markdown';

interface AgentInfo {
  id: string;
  name: string;
  role: string;
  description: string;
  color: string;
  bgLight: string;
}

interface Message {
  sender: string;
  role: string;
  content: string;
  timestamp: string;
  isAdmin?: boolean;
}

interface SynthesisResult {
  title: string;
  executiveSummary: string;
  keyDecisions: string[];
  technicalBlueprint: string;
  actionItems: Array<{ agent: string; task: string }>;
}

const AGENTS_LIST: AgentInfo[] = [
  { id: "coordinator", name: "Coordinator Agent", role: "Orchestrator Core", description: "Monitors overall pipeline sanity, schedules background automation runs, and parses natural user intents.", color: "text-blue-600 bg-blue-100", bgLight: "bg-blue-50/50 border-blue-100" },
  { id: "researcher", name: "Research Agent", role: "Knowledge Base", description: "Extracts real-time indexes, synthesizes web articles, and generates deep reference reports.", color: "text-emerald-600 bg-emerald-100", bgLight: "bg-emerald-50/50 border-emerald-100" },
  { id: "coder", name: "Coding Agent", role: "Software Synthesizer", description: "Audits codebase structures, recommends refactoring blueprints, and manages automated testing gates.", color: "text-purple-600 bg-purple-100", bgLight: "bg-purple-50/50 border-purple-100" },
  { id: "scheduler", name: "Scheduler Agent", role: "Automation Runner", description: "Manages cron cycles, automates recurrent checklists, and realigns priority queues.", color: "text-indigo-600 bg-indigo-100", bgLight: "bg-indigo-50/50 border-indigo-100" },
  { id: "email", name: "Email Agent", role: "Workspace Outreach", description: "Composes elegant context-aware emails and files calendar reminders through secure Google tunnels.", color: "text-rose-600 bg-rose-100", bgLight: "bg-rose-50/50 border-rose-100" },
  { id: "productivity", name: "Productivity Agent", role: "Performance Analyst", description: "Measures task completion velocities, rates cognitive focus, and keeps administrative habits tuned.", color: "text-amber-600 bg-amber-100", bgLight: "bg-amber-50/50 border-amber-100" },
  { id: "automation", name: "Automation Agent", role: "Script Executive", description: "Bridges custom microservice interactions and triggers server webhook executions.", color: "text-sky-600 bg-sky-100", bgLight: "bg-sky-50/50 border-sky-100" },
  { id: "analytics", name: "Analytics Agent", role: "Metric Modeler", description: "Processes historical activity graphs and exports beautiful SVG structured data schemas.", color: "text-cyan-600 bg-cyan-100", bgLight: "bg-cyan-50/50 border-cyan-100" },
  { id: "voice", name: "Voice Agent", role: "Cognitive Transcriber", description: "Decodes Whisper audio recordings, isolates ambient vocal hum, and triggers speech synthesizers.", color: "text-teal-600 bg-teal-100", bgLight: "bg-teal-50/50 border-teal-100" },
  { id: "memory", name: "Memory Agent", role: "Synaptic Hub", description: "Performs semantic retrieval, deletes obsolete facts, and clusters short-term session context.", color: "text-violet-600 bg-violet-100", bgLight: "bg-violet-50/50 border-violet-100" }
];

export default function MultiAgentAlliance() {
  const { appendLog } = useAgent();
  const [selectedAgentIds, setSelectedAgentIds] = useState<string[]>(["coordinator", "researcher", "coder"]);
  const [task, setTask] = useState("");
  const [conversation, setConversation] = useState<Message[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isAutoRunning, setIsAutoRunning] = useState(false);
  const [adminCorrection, setAdminCorrection] = useState("");

  // New Automated Collaborative Workshop State Arrays
  const [allianceMode, setAllianceMode] = useState<'interactive' | 'workshop'>('interactive');
  const [sessionDepth, setSessionDepth] = useState<number>(4);
  const [focusStyle, setFocusStyle] = useState<string>('balanced');
  const [workshopActive, setWorkshopActive] = useState(false);
  const [workshopProgress, setWorkshopProgress] = useState('');
  const [structuredOutput, setStructuredOutput] = useState<SynthesisResult | null>(null);
  const [showStructuredView, setShowStructuredView] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [emailSending, setEmailSending] = useState(false);

  const chatEndRef = useRef<HTMLDivElement>(null);

  const sampleTasks = [
    { title: "Design High-Velocity Grid", task: "Design a high-efficiency cloud battery database cluster model including dynamic schema tracking & server failover routes." },
    { title: "Optimize Focus Flow", task: "Generate a workspace notification prioritization scheduler ruleset to isolate high-priority tasks and filter background interference." },
    { title: "Review Server Logic", task: "Analyze Express server integration boundaries to inject a bulletproof local caching layer for Google Search results." }
  ];

  useEffect(() => {
    // Scroll to bottom of chat whenever conversation updates
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation]);

  const toggleSelectAgent = (id: string) => {
    setSelectedAgentIds(prev => {
      if (prev.includes(id)) {
        if (prev.length <= 1) {
          appendLog("The Cognitive Alliance requires at least one participating node.", "warning");
          return prev;
        }
        return prev.filter(i => i !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  const getAgentIcon = (id: string, className = "w-4 h-4") => {
    switch (id) {
      case 'coordinator': return <Cpu className={className} />;
      case 'researcher': return <Search className={className} />;
      case 'coder': return <Terminal className={className} />;
      case 'scheduler': return <Calendar className={className} />;
      case 'email': return <Mail className={className} />;
      case 'productivity': return <TrendingUp className={className} />;
      case 'automation': return <Settings className={className} />;
      case 'analytics': return <Activity className={className} />;
      case 'voice': return <Volume2 className={className} />;
      case 'memory': return <Database className={className} />;
      default: return <Bot className={className} />;
    }
  };

  const handleNextTurn = async (customInstruction?: string) => {
    if (!task.trim()) {
      appendLog("Declare the collaborative mission objective before ignition.", "warning");
      return;
    }

    const participants = AGENTS_LIST.filter(a => selectedAgentIds.includes(a.id));
    setIsGenerating(true);

    try {
      if (customInstruction) {
        appendLog(`Administrator injection parsed: "${customInstruction}"`, "info");
      } else {
        appendLog(`Orchestrating coalition step among ${participants.length} nodes...`, "info");
      }

      const postBody = {
        task,
        selectedAgents: participants.map(p => ({
          name: p.name,
          role: p.role,
          description: p.description
        })),
        conversation: customInstruction 
          ? [...conversation, { sender: "Administrator", role: "Enclave Owner", content: customInstruction, timestamp: new Date().toLocaleTimeString() }]
          : conversation
      };

      const res = await fetch("/api/agents/collaborate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(postBody)
      });

      if (!res.ok) {
        throw new Error(`API returned state code ${res.status}`);
      }

      const nextMessage = await res.json();
      
      // Inject user correction in local view first if we had any
      if (customInstruction) {
        setConversation(prev => [
          ...prev,
          {
            sender: "Administrator",
            role: "Enclave Owner",
            content: customInstruction,
            timestamp: new Date().toLocaleTimeString(),
            isAdmin: true
          }
        ]);
      }

      setConversation(prev => [
        ...prev,
        {
          sender: nextMessage.sender,
          role: nextMessage.role,
          content: nextMessage.content,
          timestamp: new Date().toLocaleTimeString()
        }
      ]);

      appendLog(`[Alliance Core] message dispatched from ${nextMessage.sender}.`, "success");

    } catch (err) {
      console.error(err);
      appendLog("Dialogue stream offline. Injecting simulated peer reaction.", "warning");

      // Sim fallback matching selected agents
      const fallbackAgent = participants[Math.floor(Math.random() * participants.length)];
      setConversation(prev => [
        ...prev,
        ...(customInstruction ? [{ sender: "Administrator", role: "Enclave Owner", content: customInstruction, timestamp: new Date().toLocaleTimeString(), isAdmin: true }] : []),
        {
          sender: fallbackAgent.name,
          role: fallbackAgent.role,
          content: `Concurring with current progress. Let us calibrate our indexes to successfully tackle: **${task}**. Adjusting synaptic models now.`,
          timestamp: new Date().toLocaleTimeString()
        }
      ]);
    } finally {
      setIsGenerating(false);
    }
  };

  // Automated workshop execution loop
  const handleStartWorkshop = async () => {
    if (!task.trim()) {
      appendLog("Declare the collaborative workshop mission objective before starting.", "warning");
      return;
    }
    if (selectedAgentIds.length < 2) {
      appendLog("A multi-agent workshop requires at least two selected enclaves.", "warning");
      return;
    }

    setConversation([]);
    setStructuredOutput(null);
    setWorkshopActive(true);
    setShowStructuredView(false);
    appendLog(`Ignited multi-agent automated workshop session for objective: "${task.slice(0, 40)}..."`, "success");

    let currentConversation: Message[] = [];
    const participants = AGENTS_LIST.filter(a => selectedAgentIds.includes(a.id));

    try {
      for (let step = 1; step <= sessionDepth; step++) {
        setWorkshopProgress(`Round ${step} of ${sessionDepth}: Facilitating peer interaction...`);
        
        const postBody = {
          task,
          selectedAgents: participants.map(p => ({
            name: p.name,
            role: p.role,
            description: p.description
          })),
          conversation: currentConversation
        };

        const response = await fetch("/api/agents/collaborate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(postBody)
        });

        if (!response.ok) {
          throw new Error(`API returned state code ${response.status}`);
        }

        const nextMessage = await response.json();
        
        const newMsg: Message = {
          sender: nextMessage.sender,
          role: nextMessage.role,
          content: nextMessage.content,
          timestamp: new Date().toLocaleTimeString()
        };

        currentConversation = [...currentConversation, newMsg];
        setConversation(currentConversation);
        appendLog(`[Workshop Step ${step}] ${newMsg.sender} published dynamic recommendations.`, "info");

        // Wait 1.5 seconds for pleasant micro-stagger
        await new Promise(resolve => setTimeout(resolve, 1500));
      }

      // Phase 2: Synthesis
      setWorkshopProgress(`Final Synthesis: Analysing dialogues and formulating Structured Blueprint...`);
      appendLog(`Dialogue loop completed nominally. Prompting executive consolidator node...`, "info");

      const synthRes = await fetch("/api/agents/synthesize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          task,
          selectedAgents: participants.map(p => ({
            name: p.name,
            role: p.role,
            description: p.description
          })),
          dialogue: currentConversation,
          focusStyle
        })
      });

      if (!synthRes.ok) {
        throw new Error(`Synthesis API returned error code ${synthRes.status}`);
      }

      const reportData = await synthRes.json();
      setStructuredOutput(reportData);
      setShowStructuredView(true);
      appendLog(`[Synthesis Engaged] Successfully compiled master structured dialogue blueprint card!`, "success");

    } catch (err: any) {
      console.error(err);
      appendLog(`Workshop compilation failed: ${err?.message || String(err)}`, "warning");
      
      // Serve robust static fallback synthesis so the UX never breaks!
      const fallbackReport: SynthesisResult = {
        title: `Consensual System Directive: ${task.slice(0, 32)}...`,
        executiveSummary: `The dialogue session successfully concluded despite transient communication lag. Participating agents collaborated to formulate a blueprint to target criteria: "${task}".`,
        keyDecisions: [
          "Deploy horizontal core routing tables with robust failover",
          "Ensure secure administrative tunnels verify data integrity"
        ],
        technicalBlueprint: `### Collaborative Synthesis\n\nDialogue transcription contains ${currentConversation.length} rounds. Fallback blueprint generated.\n\n\`\`\`ts\n// Consolidated core configuration routes\nconst sessionConfig = {\n  objective: "${task.replace(/"/g, '\\"')}",\n  integrityParity: "nominal",\n  activeAgents: ${JSON.stringify(participants.map(p => p.id))}\n};\n\`\`\`\n\nFor more detailed outputs, please ensure the system's credentials and API links are fully online inside secrets.`,
        actionItems: participants.map((p, index) => ({
          agent: p.name,
          task: index === 0 ? "Orchestrate secondary system parameters" : "Audit data validation boundaries"
        }))
      };
      
      setStructuredOutput(fallbackReport);
      setShowStructuredView(true);
    } finally {
      setWorkshopActive(false);
      setWorkshopProgress('');
    }
  };

  // Trigger continuous turns
  const toggleAutoRun = () => {
    if (isAutoRunning) {
      setIsAutoRunning(false);
      appendLog("Multi-agent continuous stream paused by administrator.", "info");
    } else {
      if (!task.trim()) {
        appendLog("Declare the collaborative mission objective before auto run.", "warning");
        return;
      }
      setIsAutoRunning(true);
      appendLog("Ignited continuous multi-agent consensus sequence.", "success");
    }
  };

  // Handle continuous auto loop
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isAutoRunning && !isGenerating) {
      timer = setTimeout(() => {
        handleNextTurn();
      }, 4500);
    }
    return () => clearTimeout(timer);
  }, [isAutoRunning, isGenerating, conversation]);

  const handleInjectCorrection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminCorrection.trim()) return;
    const instruction = adminCorrection;
    setAdminCorrection("");
    handleNextTurn(instruction);
  };

  const handleClear = () => {
    setConversation([]);
    setStructuredOutput(null);
    setShowStructuredView(false);
    setIsAutoRunning(false);
    appendLog("Dialogue logs successfully cleared from telemetry buffers.", "info");
  };

  const handleCopyToClipboard = () => {
    if (!structuredOutput) return;
    const cleanOutput = JSON.stringify(structuredOutput, null, 2);
    navigator.clipboard.writeText(cleanOutput);
    setIsCopied(true);
    appendLog("Structured Dialogue Output copied to clipboard.", "info");
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleEmailDispatch = async () => {
    if (!structuredOutput) return;
    setEmailSending(true);
    try {
      const emailHtml = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 650px; margin: 40px auto; padding: 32px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff; color: #1e293b; box-shadow: 0 4px 20px rgba(0,0,0,0.05);">
          <div style="display: flex; align-items: center; margin-bottom: 24px; border-bottom: 1px solid #f1f5f9; padding-bottom: 20px;">
            <span style="font-size: 32px; margin-right: 14px;">🧠</span>
            <div>
              <h1 style="color: #0f172a; font-size: 20px; font-weight: 850; margin: 0; letter-spacing: -0.025em; text-transform: uppercase;">JARVIS X ALLIANCE MASTER PLAN</h1>
              <p style="color: #2563eb; font-size: 11px; font-family: monospace; margin: 0; text-transform: uppercase; font-weight: bold; letter-spacing: 0.1em;">Consolidated Multi-Agent Dialogue Synthesis</p>
            </div>
          </div>
          
          <h2 style="font-size: 18px; color: #0f172a; font-weight: 700; margin-top: 0; margin-bottom: 10px;">${structuredOutput.title}</h2>
          
          <div style="background-color: #f8fafc; border-left: 4px solid #2563eb; padding: 16px; margin: 20px 0; border-radius: 6px;">
            <h4 style="font-size: 11px; text-transform: uppercase; color: #475569; margin: 0 0 6px 0; font-family: monospace; font-weight: 800;">Executive Summary</h4>
            <p style="font-size: 14px; color: #334155; margin: 0; line-height: 1.6;">${structuredOutput.executiveSummary}</p>
          </div>

          <h3 style="font-size: 12px; text-transform: uppercase; color: #475569; margin: 24px 0 10px 0; font-family: monospace; border-bottom: 1px solid #f1f5f9; padding-bottom: 6px; font-weight: 800; letter-spacing: 0.05em;">Key Strategic Decisions</h3>
          <ul style="padding-left: 20px; font-size: 14px; color: #334155; line-height: 1.6; margin-bottom: 24px;">
            ${structuredOutput.keyDecisions.map((d: string) => `<li style="margin-bottom: 8px;">${d}</li>`).join("")}
          </ul>

          <h3 style="font-size: 12px; text-transform: uppercase; color: #475569; margin: 24px 0 10px 0; font-family: monospace; border-bottom: 1px solid #f1f5f9; padding-bottom: 6px; font-weight: 800; letter-spacing: 0.05em;">Action Items per Agent Block</h3>
          <table style="width: 100%; border-collapse: collapse; font-size: 13px; text-align: left; margin-bottom: 24px;">
            <thead>
              <tr style="background-color: #f8fafc; border-bottom: 1.5px solid #e2e8f0;">
                <th style="padding: 10px; font-weight: 700; color: #475569;">Member / Node</th>
                <th style="padding: 10px; font-weight: 700; color: #475569;">Assigned Action Directive</th>
              </tr>
            </thead>
            <tbody>
              ${structuredOutput.actionItems.map((item: any) => `
                <tr style="border-bottom: 1px solid #f1f5f9;">
                  <td style="padding: 10px; font-weight: 600; color: #0f172a;">${item.agent}</td>
                  <td style="padding: 10px; color: #475569;">${item.task}</td>
                </tr>
              `).join("")}
            </tbody>
          </table>

          <div style="background-color: #fafafa; border: 1px solid #f1f5f9; padding: 16px; border-radius: 8px; font-family: monospace; font-size: 11px; margin-top: 30px;">
            <p style="margin: 0; color: #94a3b8; text-transform: uppercase; font-weight: bold;">System Metadata Logs</p>
            <p style="margin: 4px 0 0 0; color: #64748b; line-height: 1.5;">DISPATCHED_TO: guptarudra852@gmail.com</p>
            <p style="margin: 2px 0 0 0; color: #64748b; line-height: 1.5;">ALLIANCE_INTEGRITY_INDEX: 100%</p>
            <p style="margin: 2px 0 0 0; color: #64748b; line-height: 1.5;">STATUS: CORETEM_SYNAPSE_SECURED</p>
          </div>
        </div>
      `;

      const response = await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: "guptarudra852@gmail.com",
          subject: `JARVIS X Master Blueprint: ${structuredOutput.title}`,
          html: emailHtml
        })
      });

      if (!response.ok) {
        throw new Error("Failed to dispatch email briefing via Resend API.");
      }

      appendLog(`[Workspace Link] Structured Collaboration Blueprint emailed successfully to guptarudra852@gmail.com.`, "success");
    } catch (err: any) {
      console.error(err);
      appendLog(`Failed to dispatch email briefing: ${err?.message || String(err)}`, "warning");
    } finally {
      setEmailSending(false);
    }
  };

  return (
    <div id="multi-agent-alliance-panel" className="space-y-5 text-left">
      
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 rounded-lg bg-blue-50 border border-blue-100 text-blue-600">
            <ArrowRightLeft className="w-4 h-4 text-blue-600 animate-pulse" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-widest font-sans">Autonomous Coalition Arena</h3>
            <p className="text-[9px] text-slate-400 font-mono uppercase mt-0.5">Let agents debate, collaborate, & review complex tasks together</p>
          </div>
        </div>

        {/* Dialogue Mode Segment Selection */}
        <div className="flex bg-slate-100 border border-slate-200/50 p-0.5 rounded-xl max-w-sm shrink-0">
          <button 
            onClick={() => {
              setAllianceMode('interactive');
              setShowStructuredView(false);
            }}
            disabled={workshopActive}
            className={`px-3 py-1 text-[9px] uppercase font-mono font-bold rounded-lg transition-all cursor-pointer ${allianceMode === 'interactive' ? 'bg-white text-blue-600 shadow-sm border border-slate-200/50' : 'text-slate-500 hover:text-slate-800 disabled:opacity-50'}`}
          >
            Free-flow
          </button>
          <button 
            onClick={() => setAllianceMode('workshop')}
            disabled={workshopActive}
            className={`px-3 py-1 text-[9px] uppercase font-mono font-bold rounded-lg transition-all cursor-pointer ${allianceMode === 'workshop' ? 'bg-white text-emerald-600 shadow-sm border border-slate-200/50' : 'text-slate-500 hover:text-slate-800 disabled:opacity-50'}`}
          >
            Auto Workshop
          </button>
        </div>
      </div>

      {/* Grid: Selected Coalition Nodes */}
      <div className="space-y-2">
        <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider font-mono">
          Select Participating Dialogue Agents (Alliance Members)
        </label>
        
        <div className="flex flex-wrap gap-2">
          {AGENTS_LIST.map((agent) => {
            const isSelected = selectedAgentIds.includes(agent.id);
            return (
              <button
                key={agent.id}
                onClick={() => toggleSelectAgent(agent.id)}
                disabled={workshopActive}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border text-[10px] font-bold transition-all cursor-pointer ${
                  isSelected 
                    ? 'bg-blue-600 border-blue-700 text-white shadow-sm' 
                    : 'bg-slate-50/70 border-slate-100 text-slate-500 hover:border-slate-200'
                }`}
              >
                {getAgentIcon(agent.id, `w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-slate-400'}`)}
                <span>{agent.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Workshop Settings / Configuration Banner */}
      {allianceMode === 'workshop' && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="bg-emerald-50/40 border border-emerald-100 rounded-2xl p-4 space-y-3"
        >
          <div className="flex items-center space-x-2 text-[10px] uppercase font-mono font-bold text-emerald-700">
            <Settings className="w-4 h-4 text-emerald-600 animate-spin-slow" />
            <span>Colloquium Workshop Orchestrator Weights</span>
          </div>

          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-12 sm:col-span-6 space-y-1.5 text-left">
              <label className="text-[9px] font-bold text-slate-400 uppercase font-mono tracking-wider">Session Depth (Dialog turns)</label>
              <div className="flex space-x-2">
                {[3, 4, 5, 6, 8].map((d) => (
                  <button
                    key={d}
                    type="button"
                    disabled={workshopActive}
                    onClick={() => setSessionDepth(d)}
                    className={`flex-1 py-1 text-xs font-bold rounded-lg border cursor-pointer transition ${sessionDepth === d ? 'bg-emerald-600 border-emerald-700 text-white shadow-sm' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            <div className="col-span-12 sm:col-span-6 space-y-1.5 text-left">
              <label className="text-[9px] font-bold text-slate-400 uppercase font-mono tracking-wider">Dialectic Focus Style</label>
              <select
                value={focusStyle}
                disabled={workshopActive}
                onChange={(e) => setFocusStyle(e.target.value)}
                className="w-full bg-white border border-slate-250 focus:border-emerald-400 text-xs font-semibold rounded-lg px-2.5 py-1 text-slate-700 outline-none transition"
              >
                <option value="balanced">Logical Peer Consensual Review</option>
                <option value="blueprinting">Strict Architecture & Software Blueprinting</option>
                <option value="adversarial">Critical Evaluation & Red-Team Review</option>
                <option value="creative">Unfettered Brainstorming & Out-of-box Ideation</option>
              </select>
            </div>
          </div>
        </motion.div>
      )}

      {/* Goal/Task Input with quick preset helpers */}
      <div className="space-y-3 bg-slate-50 border border-slate-100 rounded-2xl p-4">
        
        <div className="space-y-1">
          <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider font-mono">
            Command Coalition Mission Objective
          </label>
          <input 
            type="text"
            value={task}
            onChange={(e) => setTask(e.target.value)}
            disabled={workshopActive}
            placeholder="e.g. Design a robust failover architecture using Redis and Firestore mirrors..."
            className="w-full bg-white border border-slate-250 focus:border-blue-400 text-xs rounded-xl px-3.5 py-2.5 outline-none font-sans text-slate-800 font-medium transition"
          />
        </div>

        {/* Preset chips */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 text-[10px]">
          <span className="text-[9px] font-bold text-slate-400 uppercase font-mono flex items-center gap-1 shrink-0">
            <Lightbulb className="w-3.5 h-3.5 text-amber-500" /> Suggestions:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {sampleTasks.map((t, i) => (
              <button
                key={i}
                onClick={() => {
                  setTask(t.task);
                  appendLog(`Assigned goal: "${t.title}"`, "info");
                }}
                disabled={workshopActive}
                className="px-2.5 py-1 text-[9px] bg-white border border-slate-200 hover:border-slate-350 hover:bg-slate-50 text-slate-600 rounded-lg cursor-pointer transition disabled:opacity-50"
              >
                {t.title}
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* Live progress indicators when workshop active */}
      {workshopActive && (
        <div className="bg-blue-50/70 border border-blue-150 p-4 rounded-2xl flex items-center space-x-3">
          <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
          <div className="text-left">
            <div className="text-xs font-bold text-blue-800 uppercase tracking-wider">Automated Peer-to-Peer Run Progress</div>
            <div className="text-[10px] text-blue-600 font-mono mt-0.5">{workshopProgress}</div>
          </div>
        </div>
      )}

      {/* Main Panel View Toggler (only makes sense if structuredOutput is compiled) */}
      {structuredOutput && !workshopActive && (
        <div className="flex bg-slate-200/50 border border-slate-250/20 p-1 rounded-xl max-w-sm">
          <button 
            onClick={() => setShowStructuredView(false)}
            className={`flex-1 py-1.5 text-[9px] uppercase font-mono font-bold rounded-lg transition-all cursor-pointer text-center ${!showStructuredView ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
          >
            <MessageSquare className="w-3.5 h-3.5 inline mr-1" /> Discussion Transcript
          </button>
          <button 
            onClick={() => setShowStructuredView(true)}
            className={`flex-1 py-1.5 text-[9px] uppercase font-mono font-bold rounded-lg transition-all cursor-pointer text-center ${showStructuredView ? 'bg-indigo-600 text-white shadow-sm font-semibold' : 'text-slate-500 hover:text-slate-850'}`}
          >
            <Sparkles className="w-3.5 h-3.5 inline mr-1" /> Structured Output
          </button>
        </div>
      )}

      {/* MAIN VIEW AREA: Either show structured result OR dialog logs */}
      {showStructuredView && structuredOutput ? (
        
        // Structured Dialogue Synthesis Card View
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-slate-900 to-slate-950 text-slate-100 rounded-3xl p-5 border border-slate-800 shadow-xl space-y-5"
        >
          {/* Output Card Header */}
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div className="flex items-center space-x-2.5 text-left">
              <div className="p-2 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 shadow-md">
                <FileText className="w-4 h-4 text-white" />
              </div>
              <div>
                <span className="text-[8px] bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 px-2 py-0.5 rounded-full font-mono uppercase font-black">Structured Dialogue Synthesis</span>
                <h3 className="text-sm font-extrabold text-white mt-1 tracking-tight">{structuredOutput.title}</h3>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <button 
                onClick={handleCopyToClipboard}
                className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white cursor-pointer transition"
                title="Copy full JSON output"
              >
                {isCopied ? <Check className="w-4 h-4 text-emerald-400 animate-pulse" /> : <Copy className="w-4 h-4" />}
              </button>
              <button 
                onClick={handleEmailDispatch}
                disabled={emailSending}
                className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white cursor-pointer transition disabled:opacity-50"
                title="Email copy of master blueprint to Administrator"
              >
                {emailSending ? <Loader2 className="w-4 h-4 animate-spin text-indigo-400" /> : <Mail className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Section 1: Executive Summary */}
          <div className="space-y-1.5 text-left bg-white/5 p-4 rounded-xl border border-white/5/65">
            <div className="text-[10px] font-mono uppercase font-black text-indigo-400 tracking-widest flex items-center gap-1">
              <BookOpen className="w-3.5 h-3.5 text-indigo-400" /> Executive Alliance Synthesis
            </div>
            <p className="text-xs text-slate-300 leading-relaxed font-sans">{structuredOutput.executiveSummary}</p>
          </div>

          {/* Section 2: Core Decisions list */}
          <div className="space-y-2 text-left bg-white/5 p-4 rounded-xl border border-white/5/65">
            <div className="text-[10px] font-mono uppercase font-black text-indigo-400 tracking-widest flex items-center gap-1">
              <CheckSquare className="w-3.5 h-3.5 text-indigo-400" /> Key Strategic Decisions
            </div>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-slate-300 font-sans font-medium">
              {structuredOutput.keyDecisions.map((decision, dIdx) => (
                <li key={dIdx} className="flex items-start gap-2 bg-slate-900/40 p-2 rounded-lg border border-white/5 shadow-inner">
                  <span className="text-[10px] mt-0.5 select-none text-emerald-400 font-bold shrink-0">✓</span>
                  <span>{decision}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Section 3: Technical Blueprint formatted markdown */}
          <div className="space-y-2 text-left bg-slate-900/90 p-4 rounded-xl border border-white/5 font-sans">
            <div className="text-[10px] font-mono uppercase font-black text-indigo-400 tracking-widest flex items-center gap-1 mb-2">
              <Layers className="w-3.5 h-3.5 text-indigo-400" /> Technical Architectural Blueprint
            </div>
            <div className="prose prose-invert prose-xs max-w-none prose-p:text-slate-300 prose-headings:text-slate-100 prose-code:text-indigo-300 prose-pre:bg-slate-950 text-xs leading-relaxed overflow-x-auto">
              <ReactMarkdown>{structuredOutput.technicalBlueprint}</ReactMarkdown>
            </div>
          </div>

          {/* Section 4: Peer Actions matrix */}
          <div className="space-y-2 text-left bg-white/5 p-4 rounded-xl border border-white/5/65">
            <div className="text-[10px] font-mono uppercase font-black text-indigo-400 tracking-widest flex items-center gap-1 mb-1">
              <Activity className="w-3.5 h-3.5 text-indigo-400" /> Consensus Action Vectors
            </div>
            <div className="overflow-x-auto rounded-xl border border-white/10 shadow-sm">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-900 border-b border-white/10 text-[9px] uppercase tracking-wider text-slate-400 font-mono font-bold">
                    <th className="p-2.5">Alliance Node</th>
                    <th className="p-2.5">Specific Task Directive</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {structuredOutput.actionItems.map((item, itemIdx) => {
                    const matched = AGENTS_LIST.find(a => a.name === item.agent || a.id === item.agent?.split(" ")[0]?.toLowerCase());
                    return (
                      <tr key={itemIdx} className="hover:bg-white/5 transition">
                        <td className="p-2.5 font-bold text-white shrink-0">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-extrabold uppercase ${matched?.color || 'bg-slate-700 text-slate-300'}`}>
                            {item.agent}
                          </span>
                        </td>
                        <td className="p-2.5 text-slate-300 font-medium font-sans text-xs">{item.task}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Custom Card Footer tools */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3.5 text-[9px] font-mono uppercase text-slate-500 pt-3 border-t border-white/10">
            <span>JARVIS CORE COMPILED SYNAPSE SUCCESS // PARITY: Nomad</span>
            <button
              onClick={() => setShowStructuredView(false)}
              className="text-indigo-400 hover:text-indigo-300 font-bold tracking-wider cursor-pointer flex items-center gap-1 bg-white/5 px-2.5 py-1 rounded border border-white/5"
            >
              <Eye className="w-3 h-3" /> Toggle View Dialogue Logs
            </button>
          </div>

        </motion.div>

      ) : (

        // Main Dialogue Chat Window (Discussion Transcript)
        <div className="border border-slate-100 bg-white/50 rounded-2xl p-4 flex flex-col h-[320px]">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2 text-[9px] font-bold uppercase text-slate-400 font-mono tracking-wider mb-3">
            <span className="flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-blue-500" />
              Dialogue Flow Stream ({conversation.length} events logged)
            </span>
            {conversation.length > 0 && (
              <button 
                onClick={handleClear} 
                className="text-rose-500 hover:text-rose-600 cursor-pointer flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" /> Clear Discussion
              </button>
            )}
          </div>

          {/* Stream lists */}
          <div className="flex-1 overflow-y-auto space-y-4 pr-1.5 scrollbar-none">
            <AnimatePresence initial={false}>
              {conversation.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 space-y-2 py-8">
                  <Users className="w-10 h-10 text-slate-300 stroke-[1.5]" />
                  <div>
                    <h4 className="text-[10px] font-extrabold uppercase text-slate-600 font-mono">Dialogue Core Idle</h4>
                    <p className="text-[9px] text-slate-400 max-w-xs leading-normal mt-0.5">
                      {allianceMode === 'workshop' 
                        ? "Define your collaborative objective, select Depth weights, and trigger 'Start Collaborative Workshop' below."
                        : "Configure your collaborative nodes, declare your mission schema, and tap 'Trigger Next Turn' below to start dialogues."
                      }
                    </p>
                  </div>
                </div>
              ) : (
                conversation.map((msg, i) => {
                  const matchedAgent = AGENTS_LIST.find(a => a.name === msg.sender);
                  const isUser = msg.isAdmin;
                  
                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex flex-col space-y-1 p-3 rounded-2xl text-[11px] leading-relaxed border ${
                        isUser 
                          ? 'bg-slate-900 text-slate-200 border-slate-950 self-end ml-12 shadow-sm' 
                          : 'bg-slate-50/70 text-slate-700 border-slate-100 mr-12 shadow-inner'
                      }`}
                    >
                      {/* Header badge details */}
                      <div className="flex items-center justify-between border-b border-black/5 pb-1.5 mb-1.5">
                        <div className="flex items-center space-x-1.5">
                          <div className={`p-1 rounded text-[9px] font-bold ${
                            isUser ? 'bg-slate-800 text-white' : (matchedAgent?.color || 'bg-slate-100 text-slate-600')
                          }`}>
                            {isUser ? <User className="w-3 h-3 text-slate-305" /> : getAgentIcon(matchedAgent?.id || "coordinator", "w-3 h-3")}
                          </div>
                          <div>
                            <span className="font-extrabold text-slate-805">{msg.sender}</span>
                            <span className="text-[8px] uppercase font-mono text-slate-400 ml-1.5">[{msg.role}]</span>
                          </div>
                        </div>
                        <span className="text-[8px] font-mono text-slate-400">{msg.timestamp}</span>
                      </div>

                      {/* Content Markdown */}
                      <div className="markdown-body prose prose-slate prose-xs max-w-none text-slate-700 leading-relaxed font-sans font-semibold">
                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                      </div>
                    </motion.div>
                  );
                })
              )}

              {/* Loading placeholder */}
              {isGenerating && (
                <motion.div 
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }} 
                  className="bg-blue-50/50 border border-blue-100 px-3.5 py-3 rounded-2xl flex items-center space-x-2 text-[10px] font-mono font-bold uppercase tracking-widest text-[#2563eb]"
                >
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Next agent in alignment formulating response...</span>
                </motion.div>
              )}
            </AnimatePresence>
            <div ref={chatEndRef} />
          </div>
        </div>
      )}

      {/* Control Actions Panel */}
      <div className="flex flex-wrap items-center gap-3">
        
        {/* Interactive Mode Control Buttons */}
        {allianceMode === 'interactive' ? (
          <>
            {/* Next step manual trigger */}
            <button
              onClick={() => handleNextTurn()}
              disabled={isGenerating || isAutoRunning || !task.trim()}
              className="flex items-center space-x-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 hover:shadow text-white text-[10px] tracking-wider uppercase font-extrabold rounded-xl disabled:bg-slate-200 disabled:text-slate-400 transition cursor-pointer"
            >
              {isGenerating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ChevronRight className="w-4 h-4" />}
              <span>Trigger Next Turn</span>
            </button>

            {/* Continuous trigger toggle */}
            <button
              onClick={toggleAutoRun}
              disabled={!task.trim()}
              className={`flex items-center space-x-1.5 px-3.5 py-2 text-[10px] tracking-wider uppercase font-extrabold rounded-xl border transition cursor-pointer ${
                isAutoRunning 
                  ? 'bg-emerald-600 border-emerald-700 text-white hover:bg-emerald-700 hover:shadow' 
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Play className="w-3.5 h-3.5" />
              <span>{isAutoRunning ? "Pause Auto Loop" : "Enable Auto Loop"}</span>
            </button>
          </>
        ) : (
          
          // Workshop Mode Control Buttons
          <>
            <button
              onClick={handleStartWorkshop}
              disabled={workshopActive || !task.trim() || selectedAgentIds.length < 2}
              className="flex items-center space-x-1.5 px-4 py-2 bg-gradient-to-tr from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-[10px] tracking-wider uppercase font-extrabold rounded-xl disabled:from-slate-200 disabled:to-slate-300 disabled:text-slate-400 shadow-sm transition-all cursor-pointer"
            >
              {workshopActive ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
              <span>{workshopActive ? "Facilitating Dialogue Series..." : "Initiate Direct Dialog Dialogue Session"}</span>
            </button>

            {structuredOutput && (
              <button
                onClick={() => setShowStructuredView(!showStructuredView)}
                className="flex items-center space-x-1.5 px-3.5 py-2 text-[10px] tracking-wider uppercase font-extrabold rounded-xl border border-slate-200 bg-white text-slate-650 hover:bg-slate-50 transition cursor-pointer"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>{showStructuredView ? "Audit Dialog Transcript" : "View Structured Consensus output"}</span>
              </button>
            )}
          </>
        )}

        <span className="text-[9px] text-slate-400 font-mono uppercase font-black ml-auto select-none">
          {isAutoRunning || workshopActive ? "● ALLIANCE COLLABORATING" : "● BUFFER OPERABLE"}
        </span>

      </div>

      {/* Interactive Admin override input (only shown/available for free-flow to keep UI extremely clean) */}
      {allianceMode === 'interactive' && (
        <form onSubmit={handleInjectCorrection} className="border border-slate-100 bg-slate-50/55 p-3 rounded-2xl flex items-center space-x-2.5">
          <div className="text-left shrink-0">
            <div className="text-[10px] font-bold text-slate-700 uppercase tracking-widest leading-none flex items-center gap-1">
              <User className="w-3.5 h-3.5 text-slate-500" /> Injection Link:
            </div>
            <div className="text-[8px] text-slate-400 font-mono uppercase mt-1">Direct dialogue override</div>
          </div>
          <input 
            type="text"
            value={adminCorrection}
            onChange={(e) => setAdminCorrection(e.target.value)}
            placeholder="e.g. Coder Agent, structure using Node clusters; Researcher, outline live search statistics..."
            className="flex-1 bg-white border border-slate-250 focus:border-blue-400 text-xs rounded-xl px-3 py-1.5 outline-none font-sans font-semibold text-slate-800 transition"
          />
          <button
            type="submit"
            disabled={isGenerating || !adminCorrection.trim() || !task.trim()}
            className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-[10px] font-bold uppercase rounded-xl disabled:bg-slate-200 disabled:text-slate-400 cursor-pointer transition"
          >
            Inject Prompt
          </button>
        </form>
      )}

    </div>
  );
}
