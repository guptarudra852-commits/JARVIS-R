import React, { useState } from 'react';
import { useAgent } from '../lib/agent-context';
import { Task } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Play, 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  TrendingUp, 
  Plus, 
  ChevronRight, 
  Settings, 
  Trash2, 
  Activity, 
  Check, 
  BrainCircuit, 
  ChevronDown,
  Sparkles,
  Bookmark,
  Edit2
} from 'lucide-react';

export default function TaskAutomationPanel() {
  const { tasks, createNewTask, updateTaskStatus, advanceTaskStep, deleteTask, appendLog } = useAgent();
  const [isAdding, setIsAdding] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Task['priority']>('medium');
  const [stepInput, setStepInput] = useState('');
  const [steps, setSteps] = useState<string[]>([
    "Audit mainframe core registers",
    "Identify anomalous cognitive cycles",
    "Align scheduling queues autonomously"
  ]);

  // Editing state
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editPriority, setEditPriority] = useState<Task['priority']>('medium');

  const handleAddStep = () => {
    if (stepInput.trim()) {
      setSteps([...steps, stepInput.trim()]);
      setStepInput('');
    }
  };

  const handleRemoveStep = (index: number) => {
    setSteps(steps.filter((_, i) => i !== index));
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    
    await createNewTask(
      title.trim(), 
      description.trim(), 
      priority, 
      steps.length > 0 ? steps : ["Executing scheduled software validation pipeline"]
    );

    // reset forms
    setTitle('');
    setDescription('');
    setPriority('medium');
    setSteps([
      "Audit mainframe core registers",
      "Identify anomalous cognitive cycles",
      "Align scheduling queues autonomously"
    ]);
    setIsAdding(false);
    appendLog(`Task "${title}" scheduled successfully.`, "success");
  };

  const triggerStepSimulation = async (taskId: string) => {
    appendLog(`Simulating autonomous worker progression for task ID [${taskId.slice(0, 6)}].`, "info");
    await advanceTaskStep(taskId);
  };

  const getPriorityColor = (p: Task['priority']) => {
    switch (p) {
      case 'critical': return 'border-rose-100 text-rose-600 bg-rose-50/50';
      case 'high': return 'border-amber-100 text-amber-600 bg-amber-50/50';
      case 'medium': return 'border-blue-105 text-blue-600 bg-blue-50/50';
      case 'low': return 'border-emerald-100 text-emerald-600 bg-emerald-50/50';
    }
  };

  const getStatusIcon = (status: Task['status']) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4 text-emerald-500 animate-[bounce_1s]" />;
      case 'in_progress': return <Activity className="w-4 h-4 text-blue-500 animate-pulse" />;
      case 'pending': return <Clock className="w-4 h-4 text-slate-400" />;
      case 'failed': return <AlertTriangle className="w-4 h-4 text-rose-500" />;
    }
  };

  return (
    <div className="flex flex-col h-full space-y-4">
      {/* Panel Headers */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center space-x-2">
          <BrainCircuit className="w-5 h-5 text-blue-600" />
          <div className="text-left">
            <h2 className="text-xs font-bold tracking-tight text-slate-800 uppercase font-mono">
              Task Automation Workspace
            </h2>
            <p className="text-[10px] text-slate-400 font-mono uppercase tracking-wide">
              {tasks.length} automation sequences queued
            </p>
          </div>
        </div>
        
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center space-x-1 px-3 py-1 text-[11px] font-bold border border-slate-100 hover:bg-slate-50 text-slate-600 rounded-lg transition-all cursor-pointer"
        >
          {isAdding ? <ChevronDown className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
          <span>{isAdding ? "CANCEL" : "SCHEDULE TASK"}</span>
        </button>
      </div>

      <AnimatePresence mode="wait">
        {isAdding && (
          <motion.form 
            key="add-form"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            onSubmit={handleCreate}
            className="p-4 border border-slate-100 bg-slate-50/50 rounded-xl space-y-3 relative text-left"
          >
            {/* Quick Presets blueprint bar */}
            <div className="p-2 bg-white border border-slate-100/80 rounded-lg flex flex-col space-y-1.5">
              <span className="text-[9px] tracking-wider text-slate-400 uppercase font-mono font-bold flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-blue-500" />
                Quick Blueprint Templates:
              </span>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    setTitle("Mainframe Reactor Heat Audit");
                    setDescription("Inspect thermal containment grids, dissipate thermic noise index, and audit micro-register telemetry logs.");
                    setPriority("high");
                    setSteps([
                      "Verify central thermal reactor core load",
                      "Analyze thermal logs for electrostatic fields",
                      "Recalibrate cooling fan coefficients autonomously"
                    ]);
                    appendLog("Reactor pre-set blueprint loaded.", "info");
                  }}
                  className="px-2 py-0.5 border border-slate-100 text-[9px] font-mono hover:bg-slate-50 rounded-md text-slate-600 transition cursor-pointer"
                >
                  Reactor Temp Audit
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setTitle("Sync Google Workspace Backup");
                    setDescription("Export all custom factual memories and automation state logs into secure connected spreadsheets.");
                    setPriority("medium");
                    setSteps([
                      "Retrieve active Firestore memories collection",
                      "Initialize spreadsheet rows authorization token",
                      "Post-compile backlogged records successfully"
                    ]);
                    appendLog("Backup preset loaded.", "info");
                  }}
                  className="px-2 py-0.5 border border-slate-100 text-[9px] font-mono hover:bg-slate-50 rounded-md text-slate-600 transition cursor-pointer"
                >
                  Workspace Spread Sync
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="flex flex-col space-y-1">
                <label className="text-[10px] font-bold font-mono text-slate-450 uppercase tracking-tight">Title</label>
                <input 
                  type="text" 
                  value={title} 
                  onChange={e => setTitle(e.target.value)}
                  placeholder="Task Name"
                  className="px-3 py-1.5 text-xs bg-white border border-slate-150 rounded-lg focus:outline-none focus:border-blue-400 text-slate-800"
                />
              </div>

              <div className="flex flex-col space-y-1">
                <label className="text-[10px] font-bold font-mono text-slate-450 uppercase tracking-tight">Priority Level</label>
                <select 
                  value={priority} 
                  onChange={e => setPriority(e.target.value as Task['priority'])}
                  className="px-3 py-1.5 text-xs bg-white border border-slate-150 rounded-lg focus:outline-none focus:border-blue-400 text-slate-800 font-mono"
                >
                  <option value="low">Low Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="high">High Priority</option>
                  <option value="critical">Critical Priority</option>
                </select>
              </div>
            </div>

            <div className="flex flex-col space-y-1">
              <label className="text-[10px] font-bold font-mono text-slate-455 uppercase tracking-tight">Functional Description</label>
              <textarea 
                value={description} 
                onChange={e => setDescription(e.target.value)}
                placeholder="Scope description for custom autonomous tasks execution..."
                className="px-3 py-1.5 text-xs bg-white border border-slate-150 rounded-lg focus:outline-none focus:border-blue-400 h-16 text-slate-800"
              />
            </div>

            {/* Stepped Blueprint checklist editor */}
            <div className="border-t border-slate-100 pt-3 flex flex-col space-y-2">
              <span className="text-[10px] font-bold font-mono text-slate-450 uppercase">Step-by-Step Action Blueprint ({steps.length})</span>
              <div className="space-y-1.5">
                {steps.map((step, idx) => (
                  <div key={idx} className="flex items-center justify-between bg-white px-2 py-1 rounded-lg border border-slate-100 text-[10px] font-mono">
                    <span className="text-slate-600 truncate">{idx + 1}. {step}</span>
                    <button 
                      type="button" 
                      onClick={() => handleRemoveStep(idx)}
                      className="text-slate-400 hover:text-rose-500 font-extrabold tracking-tight px-1 cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex gap-1.5">
                <input 
                  type="text" 
                  value={stepInput} 
                  onChange={e => setStepInput(e.target.value)}
                  placeholder="Insert subsequent task step..."
                  className="flex-1 px-3 py-1 text-xs bg-white border border-slate-150 rounded-lg focus:outline-none text-slate-800"
                />
                <button 
                  type="button" 
                  onClick={handleAddStep}
                  className="px-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold rounded-lg transition-all cursor-pointer"
                >
                  Add Step
                </button>
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <button 
                type="submit"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 hover:shadow-md text-white font-bold text-xs rounded-lg transition-all cursor-pointer"
              >
                SCHEDULE THREAD RUN
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Task list list grids */}
      <div className="space-y-2.5 max-h-[350px] overflow-y-auto pr-1">
        {tasks.length === 0 ? (
          <div className="py-12 border border-dashed border-slate-100 rounded-xl text-center text-slate-400">
            <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400">No autonomous pipeline threads scheduled.</span>
          </div>
        ) : (
          tasks.map((task) => {
            const isFinished = task.status === 'completed';
            const progressRatio = task.plan.length > 0 ? (task.currentStep / task.plan.length) * 100 : 0;
            const currentPlanStepText = task.plan[task.currentStep] || "Sequence finished successfully.";

            return (
              <motion.div
                key={task.id}
                layoutId={`task-${task.id}`}
                className="p-4 bg-white hover:bg-slate-50 border border-slate-100 hover:border-slate-250 rounded-xl flex flex-col justify-between shadow-sm hover:shadow-md transition-all text-left"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="shrink-0">{getStatusIcon(task.status)}</span>
                      <h3 className={`text-[11px] font-bold text-slate-800 leading-snug truncate ${isFinished ? 'line-through text-slate-450' : ''}`}>
                        {task.title}
                      </h3>
                      <span className={`text-[8px] px-1.5 py-0.5 rounded font-bold font-mono border uppercase ${getPriorityColor(task.priority)}`}>
                        {task.priority}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500 leading-relaxed mt-1 line-clamp-2">
                      {task.description}
                    </p>
                  </div>

                  {/* Operational elements */}
                  <div className="flex items-center space-x-1.5 shrink-0">
                    {task.status !== 'completed' && task.status !== 'failed' && (
                      <button
                        onClick={() => triggerStepSimulation(task.id)}
                        className="p-1 px-2 border border-slate-100 hover:bg-slate-100 text-[10px] text-blue-600 rounded-md font-bold font-mono uppercase tracking-wide cursor-pointer select-none"
                        title="Step Advance"
                      >
                        ADVANCE
                      </button>
                    )}
                    <button
                      onClick={() => deleteTask(task.id)}
                      className="p-1 text-slate-400 hover:text-rose-500 rounded-md hover:bg-slate-100 cursor-pointer"
                      title="Purge Task"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Sub-steps scheduler progress index bar */}
                <div className="mt-3 pt-3 border-t border-slate-100">
                  <div className="flex justify-between items-center text-[9px] font-mono text-slate-400 mb-1.5">
                    <span className="truncate max-w-[180px] font-bold text-slate-500">
                      STEP {task.currentStep + 1}/{task.plan.length}: "{currentPlanStepText}"
                    </span>
                    <span>{Math.round(progressRatio)}%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1 relative overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-300 ${isFinished ? 'bg-emerald-500' : 'bg-blue-600'}`}
                      style={{ width: `${progressRatio}%` }}
                    />
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}
export { TaskAutomationPanel };
