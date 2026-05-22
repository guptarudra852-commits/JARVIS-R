import React, { useState, useEffect, useRef } from 'react';
import { AgentProvider, useAgent } from './lib/agent-context';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Cpu, 
  LogIn, 
  LogOut, 
  User as UserIcon, 
  Clock, 
  Zap,
  Sliders,
  Search,
  Bell,
  Sparkles,
  Command,
  Maximize2,
  CalendarDays,
  Activity,
  CheckCircle,
  Database,
  Grid
} from 'lucide-react';
import TaskAutomationPanel from './components/TaskAutomationPanel';
import LiveSystemStatus from './components/LiveSystemStatus';
import MemoryHub from './components/MemoryHub';
import GoogleCalendarPanel from './components/GoogleCalendarPanel';
import GoogleSheetsPanel from './components/GoogleSheetsPanel';
import GoogleGmailPanel from './components/GoogleGmailPanel';
import AnalyticsCenter from './components/AnalyticsCenter';
import NotificationFeed from './components/NotificationFeed';
import { VoiceConsole } from './components/VoiceConsole';
import ContentGenerator from './components/ContentGenerator';
import PersonalizedLearning from './components/PersonalizedLearning';
import MultiAgentAlliance from './components/MultiAgentAlliance';
import AgentMarketplace from './components/AgentMarketplace';
import AIOperatingSystemBlueprint from './components/AIOperatingSystemBlueprint';
import OfflineDocsDatabase from './components/OfflineDocsDatabase';
import { SystemNotification, SystemLog } from './types';

const agentNameToIdMap: Record<string, string> = {
  "Coordinator Agent": "coordinator",
  "Research Agent": "researcher",
  "Coding Agent": "coder",
  "Scheduler Agent": "scheduler",
  "Email Agent": "email",
  "Productivity Agent": "productivity",
  "Automation Agent": "automation",
  "Analytics Agent": "analytics",
  "Voice Agent": "voice",
  "Memory Agent": "memory"
};

function DashboardContent() {
  const { 
    user, 
    loading, 
    connectionHealthy, 
    loginWithGoogle, 
    logout, 
    appendLog,
    tasks,
    memories
  } = useAgent();
  
  const [systemTime, setSystemTime] = useState(new Date());

  // Global Interactive States
  const [workspaceTab, setWorkspaceTab] = useState<'console' | 'creator' | 'learning' | 'alliance' | 'marketplace' | 'blueprint' | 'documents'>('console');
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeAgentId, setActiveAgentId] = useState<string>('coordinator');
  const [activeAgentName, setActiveAgentName] = useState<string>('Coordinator Agent');
  const consoleRef = useRef<any>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        const target = e.target as HTMLElement;
        if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA') {
          e.preventDefault();
          consoleRef.current?.toggleListening();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
  
  // Custom Operations alerts feed
  const [notifications, setNotifications] = useState<SystemNotification[]>([
    {
      id: "not_1",
      title: "System Calibrated",
      description: "Autonomous neural cores linked smoothly inside light frosted glass enclaves.",
      timestamp: new Date().toISOString(),
      read: false,
      type: "success"
    },
    {
      id: "not_2",
      title: "Secure Identity Verified",
      description: "Administrative level is set to Owner.",
      timestamp: new Date(Date.now() - 5 * 60000).toISOString(),
      read: false,
      type: "info"
    },
    {
      id: "not_3",
      title: "Firestore Datastore Probe Nominal",
      description: "Tested connection constraints: Nominal speed certified.",
      timestamp: new Date(Date.now() - 25 * 60000).toISOString(),
      read: true,
      type: "info"
    }
  ]);

  // Synchronized clocks ticker
  useEffect(() => {
    const handle = setInterval(() => setSystemTime(new Date()), 1000);
    return () => clearInterval(handle);
  }, []);

  // Broadcast background notification alerts based on new task completions
  useEffect(() => {
    const completedTasksCount = tasks.filter(t => t.status === 'completed').length;
    if (completedTasksCount > 0) {
      const latestCompleted = tasks.find(t => t.status === 'completed');
      if (latestCompleted) {
        // Prevent duplicate notices
        const exists = notifications.some(n => n.title.includes(latestCompleted.title));
        if (!exists) {
          const newAlert: SystemNotification = {
            id: `not_${Date.now()}`,
            title: `Task Thread Complete`,
            description: `Fully automated sequence "${latestCompleted.title}" completed dynamically.`,
            timestamp: new Date().toISOString(),
            read: false,
            type: 'success'
          };
          setNotifications(prev => [newAlert, ...prev]);
        }
      }
    }
  }, [tasks]);

  const handleMarkNotificationRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const handleClearNotifications = () => {
    setNotifications([]);
  };

  const handleAddCustomLogMessage = (msg: string, type: 'info' | 'success' | 'warning' | 'agent_thought') => {
    // Add dynamic interactive logs to the state via context
    appendLog(msg, type);
    // Push relative alerts to the notifications feed occasionally if critical or success
    if (type === 'success' || type === 'warning') {
      const typeMap: Record<string, SystemNotification['type']> = {
        'success': 'success',
        'warning': 'warning',
        'info': 'info',
        'agent_thought': 'info'
      };
      const alertItem: SystemNotification = {
        id: `not_${Date.now()}`,
        title: `Operation Notice`,
        description: msg,
        timestamp: new Date().toISOString(),
        read: false,
        type: typeMap[type] || 'info'
      };
      setNotifications(prev => [alertItem, ...prev]);
    }
  };

  const handleCommandSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    appendLog(`Filing manual command line pipeline search: "${searchQuery}"`, "info");
    setSearchQuery('');
  };

  const unreadAlertsCount = notifications.filter(n => !n.read).length;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#f7f9fc] text-slate-800 font-sans">
        <Cpu className="w-14 h-14 text-blue-600 animate-spin mb-4" />
        <h2 className="text-sm font-bold tracking-widest uppercase text-slate-700">INITIALIZING JARVIS OPERATING ENCLAVE...</h2>
        <p className="text-[10px] text-slate-400 mt-2 font-mono uppercase tracking-widest">BOOTSTRAPPING SYNAPSE SCHEDULING INTERFACES</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-tr from-slate-50 via-slate-100 to-sky-50 text-slate-800 font-sans selection:bg-blue-105 selection:text-blue-900 p-4 md:p-6 overflow-x-hidden relative">
      
      {/* Decorative clean ambient lighting grids on top and bottom */}
      <div className="absolute top-0 right-1/4 w-[400px] h-[400px] bg-sky-200/20 rounded-full blur-[120px] pointer-events-none z-0" />
      <div className="absolute bottom-1/4 left-1/4 w-[400px] h-[400px] bg-blue-100/20 rounded-full blur-[120px] pointer-events-none z-0" />

      {/* Clean Apple Horizontal Top Navigation bar */}
      <nav className="relative z-40 max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 bg-white/60 backdrop-blur-md border border-white/50 p-4 mb-6 rounded-2xl shadow-sm">
        
        {/* Left: Branding */}
        <div className="flex items-center space-x-3 text-left w-full md:w-auto">
          <div className="p-1.5 rounded-lg bg-blue-605 bg-blue-600 text-white shadow-md shadow-blue-500/10">
            <Zap className="w-5 h-5 text-white animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-base font-extrabold tracking-tight text-slate-900 uppercase">
                JARVIS <span className="text-blue-600">X</span>
              </h1>
              <span className="text-[8px] bg-blue-50 border border-blue-100/50 text-blue-600 px-1.5 py-0.5 rounded-md font-bold tracking-wide uppercase">
                SYSTEMS v4.5 OWNER
              </span>
            </div>
            <p className="text-[9px] text-slate-400 font-mono tracking-wide mt-0.5 uppercase">
              24/7 AUTONOMOUS SCHEDULER & CONTEXT COGNITION CORE
            </p>
          </div>
        </div>

        {/* Center: Commend Search Input */}
        <form onSubmit={handleCommandSearchSubmit} className="relative w-full md:max-w-xs shrink-0">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search system operations..."
            className="w-full bg-slate-50 border border-slate-100/80 hover:border-slate-200 rounded-xl pl-8 pr-3 py-1.5 text-xs outline-none focus:bg-white focus:border-blue-400 shadow-inner transition-colors text-slate-800"
          />
        </form>

        {/* Right: Synced dynamic clocks + Google profiles login & notifications bell */}
        <div className="flex flex-wrap items-center justify-between md:justify-end gap-3.5 w-full md:w-auto">
          
          {/* Synchronized system clocks with UTC */}
          <div className="flex items-center space-x-2 border-r border-slate-100 pr-3.5 text-left font-mono">
            <Clock className="w-4 h-4 text-blue-500" />
            <div>
              <div className="text-[8px] text-slate-400 font-bold uppercase">UTC TIMESTAMP</div>
              <div className="text-xs font-bold text-slate-700">
                {systemTime.toUTCString().slice(17, 25)}
              </div>
            </div>
          </div>

          {/* Secure Administrative identity widget display */}
          <div className="flex items-center space-x-3 bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-xl text-left shadow-sm">
            {user ? (
              <>
                <div className="flex items-center space-x-2">
                  <UserIcon className="w-3.5 h-3.5 text-blue-600" />
                  <span className="text-[11px] font-bold text-slate-700 truncate max-w-[120px] font-sans">
                    {user.isAnonymous ? "SECURED GUEST" : (user.displayName || "ADMINISTRATOR")}
                  </span>
                </div>
                
                {user.isAnonymous && (
                  <button 
                    onClick={loginWithGoogle}
                    className="text-[9px] uppercase border border-slate-200 bg-white hover:bg-slate-50 text-slate-500 px-2 py-0.5 rounded-md transition font-bold cursor-pointer"
                  >
                    LINK GOOGLE
                  </button>
                )}

                <button 
                  onClick={logout}
                  className="text-[9px] uppercase hover:bg-rose-50 hover:text-rose-600 p-1 rounded-md text-slate-400 transition cursor-pointer"
                  title="Disconnect security gate"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </>
            ) : (
              <button 
                onClick={loginWithGoogle}
                className="flex items-center space-x-1.5 px-3 py-1 bg-blue-600 text-white hover:bg-blue-700 text-[10px] uppercase font-bold rounded-lg transition"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>LINK BIOMETRICS</span>
              </button>
            )}
          </div>

          {/* SOTA Bell Dropdown menu wrapper */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-1.5 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-100 text-slate-500 hover:text-blue-600 transition relative cursor-pointer shadow-sm"
              title="View system feeds alert logs"
            >
              <Bell className="w-4 h-4" />
              {unreadAlertsCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-rose-500 text-white font-mono font-bold text-[8px] px-1.5 py-0.5 rounded-full min-w-[16px] animate-[pulse_1.5s_infinite]">
                  {unreadAlertsCount}
                </span>
              )}
            </button>

            {/* Notification drop menu drawer */}
            <AnimatePresence>
              {showNotifications && (
                <div className="absolute right-0 mt-3 z-50">
                  <NotificationFeed
                    notifications={notifications}
                    onMarkRead={handleMarkNotificationRead}
                    onClearAll={handleClearNotifications}
                    onClose={() => setShowNotifications(false)}
                  />
                </div>
              )}
            </AnimatePresence>
          </div>

        </div>
      </nav>

      {/* Primary operating workspace matrix layout */}
      <main className="relative z-10 max-w-7xl mx-auto space-y-6">
        
        {/* CENTRE MATRIX LAYOUT GRID */}
        <div className="grid grid-cols-12 gap-6">
          
          {/* Column 1 (Colspan 7) -> Voice/Chat assistant, Analytics Center, and Memory contexts */}
          <div className="col-span-12 lg:col-span-7 space-y-6">
            
            {/* Interactive Workspace Navigation Tabs */}
            <div className="flex bg-slate-200/40 border border-slate-200/50 p-1 rounded-2xl max-w-3xl shadow-sm backdrop-blur-md overflow-x-auto scrollbar-none">
              <button 
                onClick={() => setWorkspaceTab('console')}
                className={`flex-1 min-w-[90px] py-1.5 px-3 text-[10px] uppercase font-mono font-extrabold rounded-xl transition cursor-pointer text-center ${workspaceTab === 'console' ? 'bg-white text-blue-600 shadow-sm border border-slate-100' : 'text-slate-500 hover:text-slate-850'}`}
              >
                Vocal Synapse Console
              </button>
              <button 
                onClick={() => setWorkspaceTab('creator')}
                className={`flex-1 min-w-[90px] py-1.5 px-3 text-[10px] uppercase font-mono font-extrabold rounded-xl transition cursor-pointer text-center ${workspaceTab === 'creator' ? 'bg-white text-orange-600 shadow-sm border border-slate-100' : 'text-slate-500 hover:text-slate-850'}`}
              >
                Grounded Copywriter
              </button>
              <button 
                onClick={() => setWorkspaceTab('learning')}
                className={`flex-1 min-w-[90px] py-1.5 px-3 text-[10px] uppercase font-mono font-extrabold rounded-xl transition cursor-pointer text-center ${workspaceTab === 'learning' ? 'bg-white text-indigo-600 shadow-sm border border-slate-100' : 'text-slate-500 hover:text-slate-850'}`}
              >
                Self-Adaptation
              </button>
              <button 
                onClick={() => setWorkspaceTab('alliance')}
                className={`flex-1 min-w-[90px] py-1.5 px-3 text-[10px] uppercase font-mono font-extrabold rounded-xl transition cursor-pointer text-center ${workspaceTab === 'alliance' ? 'bg-white text-emerald-600 shadow-sm border border-slate-100' : 'text-slate-500 hover:text-slate-850'}`}
              >
                Coalition Arena
              </button>
              <button 
                onClick={() => setWorkspaceTab('marketplace')}
                className={`flex-1 min-w-[90px] py-1.5 px-3 text-[10px] uppercase font-mono font-extrabold rounded-xl transition cursor-pointer text-center ${workspaceTab === 'marketplace' ? 'bg-white text-teal-600 shadow-sm border border-slate-100' : 'text-slate-500 hover:text-slate-850'}`}
              >
                Marketplace Hub
              </button>
              <button 
                onClick={() => setWorkspaceTab('blueprint')}
                className={`flex-1 min-w-[90px] py-1.5 px-3 text-[10px] uppercase font-mono font-extrabold rounded-xl transition cursor-pointer text-center ${workspaceTab === 'blueprint' ? 'bg-white text-cyan-600 shadow-sm border border-slate-100' : 'text-slate-500 hover:text-slate-850'}`}
              >
                Quantum Blueprint OS
              </button>
              <button 
                onClick={() => setWorkspaceTab('documents')}
                className={`flex-1 min-w-[90px] py-1.5 px-3 text-[10px] uppercase font-mono font-extrabold rounded-xl transition cursor-pointer text-center ${workspaceTab === 'documents' ? 'bg-white text-rose-600 shadow-sm border border-slate-100' : 'text-slate-500 hover:text-slate-850'}`}
              >
                Offline Docs DB
              </button>
            </div>

            {/* AI Assistant dialogue card console */}
            <motion.section 
              key={workspaceTab}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.15 }}
              className="bg-white/60 p-6 border border-white/50 rounded-3xl shadow-sm backdrop-blur-md"
              id="ai-assistant-core-section"
            >
              {workspaceTab === 'console' && (
                <VoiceConsole 
                  ref={consoleRef}
                  activeAgentId={activeAgentId}
                  activeAgentName={activeAgentName}
                  onAgentActivated={(agentName) => {
                    setActiveAgentName(agentName);
                    if (agentName in agentNameToIdMap) {
                      setActiveAgentId(agentNameToIdMap[agentName]);
                    }
                  }}
                  onNewHistoryLog={handleAddCustomLogMessage}
                />
              )}
              {workspaceTab === 'creator' && (
                <ContentGenerator />
              )}
              {workspaceTab === 'learning' && (
                <PersonalizedLearning />
              )}
              {workspaceTab === 'alliance' && (
                <MultiAgentAlliance />
              )}
              {workspaceTab === 'marketplace' && (
                <AgentMarketplace 
                  activeAgentId={activeAgentId}
                  activeAgentName={activeAgentName}
                  onSelectAgent={(agentId, agentName) => {
                    setActiveAgentId(agentId);
                    setActiveAgentName(agentName);
                    handleAddCustomLogMessage(`Manually designated [${agentName}] as the primary active enclave focal node.`, "success");
                  }}
                />
              )}
              {workspaceTab === 'blueprint' && (
                <AIOperatingSystemBlueprint />
              )}
              {workspaceTab === 'documents' && (
                <OfflineDocsDatabase />
              )}
            </motion.section>

            {/* Interactive charts metrics dashboard */}
            <motion.section 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white/60 p-6 border border-white/50 rounded-3xl shadow-sm backdrop-blur-md"
              id="analytics-center-section"
            >
              <AnalyticsCenter />
            </motion.section>

            {/* Learn memories searchable cabinet */}
            <motion.section 
              initial={{ opacity: 0, scale: 0.99 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.15 }}
              className="bg-white/60 p-6 border border-white/50 rounded-3xl shadow-sm backdrop-blur-md"
              id="memory-hub-section"
            >
              <MemoryHub />
            </motion.section>

          </div>

          {/* Column 2 (Colspan 5) -> Live diagnostics state, Automation sequences, Calendar items, Spread synchronizers */}
          <div className="col-span-12 lg:col-span-5 space-y-6">
            
            {/* Live System Diagnostics loads rings */}
            <motion.section 
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white/60 p-5 border border-white/50 rounded-2xl shadow-sm backdrop-blur-md"
              id="live-status-section"
            >
              <LiveSystemStatus />
            </motion.section>

            {/* Task list automation lists manager */}
            <motion.section 
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.25 }}
              className="bg-white/60 p-5 border border-white/50 rounded-2xl shadow-sm backdrop-blur-md"
              id="task-automation-section"
            >
              <TaskAutomationPanel />
            </motion.section>

            {/* Registered Calendar slot arrays */}
            <motion.section 
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white/60 p-5 border border-white/50 rounded-2xl shadow-sm backdrop-blur-md"
              id="google-calendar-section"
            >
              <GoogleCalendarPanel />
            </motion.section>

            {/* Connected cloud Sheet row sync */}
            <motion.section 
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.35 }}
              className="bg-white/60 p-5 border border-white/50 rounded-2xl shadow-sm backdrop-blur-md"
              id="google-sheets-section"
            >
              <GoogleSheetsPanel />
            </motion.section>

            {/* Google Gmail Interactive Workspace Panel */}
            <motion.section 
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white/60 p-5 border border-white/50 rounded-2xl shadow-sm backdrop-blur-md"
              id="google-gmail-section"
            >
              <GoogleGmailPanel />
            </motion.section>

          </div>

        </div>
      </main>

      {/* Classic premium minimalistic footer */}
      <footer className="relative z-10 mt-12 py-6 border-t border-slate-200/50 max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-3.5 text-[9px] text-slate-400 font-mono font-bold uppercase tracking-wide">
        <div>
          SECURE ENCRYPTED SYNAPSE TUNNEL // COMPILER: STANDBY
        </div>
        <div className="flex items-center space-x-3.5 select-none">
          <span>COGNITIVE SHIELD ENCLAVE ACTIVE</span>
          <span>© 2026 JARVIS_X OPERATING SYSTEMS GROUP</span>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AgentProvider>
      <DashboardContent />
    </AgentProvider>
  );
}
