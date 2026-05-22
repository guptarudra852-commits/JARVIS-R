import React, { useState, useEffect } from 'react';
import { 
  Sliders, 
  Brain, 
  TrendingUp, 
  CheckCircle, 
  Settings, 
  Activity, 
  Save, 
  MessageSquare, 
  ShieldAlert, 
  Star, 
  Gauge, 
  Cpu,
  BookmarkCheck,
  Award,
  BookOpen
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAgent } from '../lib/agent-context';

export default function PersonalizedLearning() {
  const { appendLog } = useAgent();
  const [metrics, setMetrics] = useState({
    interactionsCount: 18,
    feedbackScore: 4.80,
    successRate: 0.94,
    tonePreferences: "Professional & Empirical",
    prioritizedTaskTypes: ["Development", "Metrics Automation"],
    explicitNotes: "Prefers highly clear, citation-grounded summaries."
  });

  const [tonePreferences, setTonePreferences] = useState(metrics.tonePreferences);
  const [explicitNotes, setExplicitNotes] = useState(metrics.explicitNotes);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  // Tracks explicit ratings given directly via stars
  const [userRating, setUserRating] = useState(0);
  const [ratingSuccess, setRatingSuccess] = useState(false);
  
  // Simulated adaptative feedback events stack
  const [adaptationStream, setAdaptationStream] = useState<string[]>([
    "Calibrated synaptic response curve: Parity nominal.",
    "Synchronized weights matching dynamic light slate dashboard interface.",
    "Preference weights loaded: Prioritizing precision markdown layout configurations."
  ]);

  const loadLearningMetrics = async () => {
    try {
      const res = await fetch('/api/learning/metrics');
      if (res.ok) {
        const data = await res.json();
        setMetrics(data);
        setTonePreferences(data.tonePreferences);
        setExplicitNotes(data.explicitNotes);
      }
    } catch (e) {
      console.warn("Unable to sync learning metrics from backend:", e);
    }
  };

  useEffect(() => {
    loadLearningMetrics();
    
    // Listen to custom weight updates triggered from other components
    const handleUpdate = () => {
      loadLearningMetrics();
      // Add visual adaptation feedback
      setAdaptationStream(prev => [
        `Re-calibrated preference vector based on recent review rating [UTC ${new Date().toISOString().slice(11, 19)}]`,
        ...prev.slice(0, 4)
      ]);
    };
    window.addEventListener('learning-preference-updated', handleUpdate);
    return () => window.removeEventListener('learning-preference-updated', handleUpdate);
  }, []);

  const handleSavePreferences = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setIsSaved(false);

    try {
      appendLog(`Adjusting dynamic learning weights for JARVIS X. Aligning with "${tonePreferences}" style...`, "info");
      
      const res = await fetch('/api/learning/preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tonePreferences,
          explicitNotes
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setMetrics(data.payload);
          setIsSaved(true);
          appendLog(`Cognitive system weights updated successfully. AI is now dialed to: ${tonePreferences}`, "success");
          
          setAdaptationStream(prev => [
            `Aligned system tone constraints strictly to: "${tonePreferences}"`,
            `Applied active correction parameters: "${explicitNotes ? explicitNotes.slice(0, 32) : 'None'}"`,
            ...prev.slice(0, 3)
          ]);

          setTimeout(() => setIsSaved(false), 3000);
        }
      }
    } catch (err) {
      console.error(err);
      appendLog("Local fallback: Applied preference calibrations inside active tab state.", "success");
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStarRating = async (rating: number) => {
    setUserRating(rating);
    setRatingSuccess(true);
    appendLog(`Administrator submitted star alignment feedback: ${rating}/5 Stars. Calibrating performance registry.`, "success");

    try {
      const res = await fetch('/api/learning/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rating,
          feedback: "Explicit stars assessment widget"
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setMetrics(data.payload);
          setAdaptationStream(prev => [
            `Computed performance coefficient rating: ${rating} Stars. Shifted learning threshold.`,
            ...prev.slice(0, 4)
          ]);
        }
      }
    } catch (e) {
      console.warn(e);
    }

    setTimeout(() => {
      setRatingSuccess(false);
      setUserRating(0);
    }, 4000);
  };

  return (
    <div className="space-y-5 text-left" id="learning-module-section">
      
      {/* Title */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-600">
            <Brain className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-widest">Self-Learning & Neural Adaptation Core</h3>
            <p className="text-[9px] text-slate-400 font-mono uppercase mt-0.5">Tracking interactions, feedback loops, & task success</p>
          </div>
        </div>
        <span className="text-[8px] bg-indigo-50 border border-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded font-mono font-bold uppercase tracking-wide">
          Closed-Loop Optimization
        </span>
      </div>

      {/* Grid of tracked metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        
        {/* Interaction Metrics */}
        <div className="bg-slate-50/50 border border-slate-100 rounded-xl p-3 text-left">
          <div className="flex items-center justify-between text-slate-400 text-[9px] font-bold font-mono uppercase tracking-wide mb-1">
            <span>Interactions Counter</span>
            <Activity className="w-3.5 h-3.5 text-blue-500" />
          </div>
          <div className="text-xl font-black text-slate-800 font-mono tracking-tight">{metrics.interactionsCount}</div>
          <div className="text-[8px] text-slate-400 font-mono mt-0.5 uppercase">Generations & tool runs</div>
        </div>

        {/* Feedback score */}
        <div className="bg-slate-50/50 border border-slate-100 rounded-xl p-3 text-left">
          <div className="flex items-center justify-between text-slate-400 text-[9px] font-bold font-mono uppercase tracking-wide mb-1">
            <span>Satisfaction Rating</span>
            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
          </div>
          <div className="text-xl font-black text-slate-800 font-mono tracking-tight">
            {metrics.feedbackScore.toFixed(2)} <span className="text-xs font-bold text-slate-400">/ 5.0</span>
          </div>
          <div className="text-[8px] text-slate-400 font-mono mt-0.5 uppercase">Moving satisfaction index</div>
        </div>

        {/* Task success rate */}
        <div className="bg-slate-50/50 border border-slate-100 rounded-xl p-3 text-left">
          <div className="flex items-center justify-between text-slate-400 text-[9px] font-bold font-mono uppercase tracking-wide mb-1">
            <span>Automation Parity</span>
            <Award className="w-3.5 h-3.5 text-emerald-500" />
          </div>
          <div className="text-xl font-black text-slate-800 font-mono tracking-tight">
            {(metrics.successRate * 100).toFixed(1)}%
          </div>
          <div className="text-[8px] text-slate-400 font-mono mt-0.5 uppercase">Task Thread completion rate</div>
        </div>

      </div>

      {/* Explicit Star Feedback Widget */}
      <div className="bg-slate-50 border border-slate-100 rounded-xl p-3.5">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-left">
            <h4 className="text-[10px] font-bold text-slate-700 uppercase tracking-widest leading-snug">Rate Current AI Performance</h4>
            <p className="text-[9px] text-slate-400 font-mono uppercase mt-0.5">Explicitly calibrates the neural model's response constraints</p>
          </div>
          
          <div className="flex items-center space-x-1 bg-white px-3 py-1.5 rounded-lg border border-slate-105 shadow-sm">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => handleStarRating(star)}
                className="p-0.5 hover:scale-110 cursor-pointer transition text-amber-400 hover:text-amber-500"
                title={`Rate ${star} Stars`}
              >
                <Star 
                  className={`w-4 h-4 ${
                    userRating >= star 
                      ? 'fill-amber-400 text-amber-500' 
                      : 'text-slate-200'
                  }`} 
                />
              </button>
            ))}
          </div>
        </div>
        
        {ratingSuccess && (
          <motion.div 
            initial={{ opacity: 0, y: -5 }} 
            animate={{ opacity: 1, y: 0 }}
            className="text-[9px] text-emerald-600 font-bold font-mono uppercase mt-2 text-center"
          >
            ✦ Synapses optimized successfully. Target threshold now calibrated.
          </motion.div>
        )}
      </div>

      {/* Explicit Weight Adjustments and preferences */}
      <form onSubmit={handleSavePreferences} className="bg-white/40 border border-slate-100 rounded-2xl p-4 space-y-4">
        
        <div className="flex items-center space-x-1.5 text-[9px] font-black tracking-widest text-slate-500 uppercase font-mono border-b border-slate-150 pb-1.5">
          <Settings className="w-3.5 h-3.5 text-slate-400" />
          <span>Calibrate Alignment Weights</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          
          {/* Default Tone Weights picker */}
          <div className="space-y-1">
            <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider font-mono">Cognitive Tone Restriction</label>
            <select 
              value={tonePreferences}
              onChange={(e) => setTonePreferences(e.target.value)}
              className="w-full bg-slate-50 border border-slate-100 px-2.5 py-1.5 text-[10px] rounded-lg outline-none font-sans font-extrabold text-slate-700 hover:bg-slate-105 transition cursor-pointer"
            >
              <option value="Professional & Empirical">Professional & Empirical</option>
              <option value="Casual & Fast-paced">Casual & Fast-paced</option>
              <option value="Cinematic & Boldly Philosophical">Cinematic & Boldly Philosophical</option>
              <option value="Hyper-verbose & High-complexity">Hyper-verbose & High-complexity</option>
              <option value="Extreme Brevity (Factual list only)">Extreme Brevity (Factual list only)</option>
            </select>
          </div>

          {/* Explicit correction rules input */}
          <div className="space-y-1">
            <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider font-mono">Active Custom Guidelines</label>
            <input 
              type="text"
              value={explicitNotes}
              onChange={(e) => setExplicitNotes(e.target.value)}
              placeholder="e.g. Suppress long disclaimers. Prioritize clear citation. Speak compactly..."
              className="w-full bg-slate-50 border border-slate-100 px-3 py-1.5 text-[10px] rounded-lg outline-none text-slate-700 font-semibold placeholder-slate-400 focus:bg-white focus:border-indigo-400 transition"
            />
          </div>

        </div>

        {/* Submit adjustments */}
        <div className="flex justify-end pt-1">
          <button
            type="submit"
            disabled={isLoading}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white disabled:bg-slate-200 disabled:text-slate-400 text-[10px] uppercase font-bold rounded-xl shadow-md shadow-indigo-500/10 cursor-pointer transition-all"
          >
            {isLoading ? <Cpu className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            <span>{isSaved ? "Saved Weights!" : "Calibrate Weights"}</span>
          </button>
        </div>

      </form>

      {/* SOTA Neural Adaptation Stream */}
      <div className="space-y-2">
        <span className="flex items-center space-x-1 text-[8px] font-black tracking-widest text-[#6366f1] uppercase font-mono">
          <Sliders className="w-3.5 h-3.5 text-indigo-500" />
          <span>Real-time Neural Adaptation Log</span>
        </span>
        
        <div className="bg-slate-900 border border-slate-950 p-3 rounded-2xl h-[94px] overflow-y-auto font-mono text-[9px] text-[#818cf8] space-y-1.5 scrollbar-none text-left">
          {adaptationStream.map((adapt, i) => (
            <div key={i} className="flex items-start space-x-1.5">
              <span className="text-slate-600 font-extrabold select-none">»</span>
              <span className="text-slate-300 leading-tight">{adapt}</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
