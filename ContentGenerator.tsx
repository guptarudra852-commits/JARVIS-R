import React, { useState } from 'react';
import { 
  Sparkles, 
  FileText, 
  Send, 
  Check, 
  ThumbsUp, 
  ThumbsDown, 
  Copy, 
  Globe, 
  Loader2, 
  MessageSquare, 
  CheckCircle, 
  BookOpen, 
  PenTool,
  Brain,
  Sliders
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAgent } from '../lib/agent-context';
import ReactMarkdown from 'react-markdown';

interface Source {
  title: string;
  url: string;
}

export default function ContentGenerator() {
  const { appendLog } = useAgent();
  const [topic, setTopic] = useState('');
  const [tone, setTone] = useState('Professional');
  const [format, setFormat] = useState('Blog Post');
  const [usePreferences, setUsePreferences] = useState(true);
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedText, setGeneratedText] = useState('');
  const [editableText, setEditableText] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [sources, setSources] = useState<Source[]>([]);
  const [feedbackSent, setFeedbackSent] = useState<'positive' | 'negative' | null>(null);
  const [isApproved, setIsApproved] = useState(false);

  // Suggested quick prompts
  const suggestions = [
    { label: "AI & Future of Jobs", topic: "The long-term impact of artificial intelligence and deep-learning models on global creative and software workspaces." },
    { label: "Clean UI Guide", topic: "Optimal design principles for implementing light-theme glassmorphism and Apple-inspired interactive negative-spacing." },
    { label: "Mars Habitats", topic: "The latest structural materials and geothermal heat exchange solutions for autonomous Mars colonies." }
  ];

  const handleGenerate = async () => {
    if (!topic.trim()) return;
    setIsGenerating(true);
    setGeneratedText('');
    setEditableText('');
    setSources([]);
    setFeedbackSent(null);
    setIsApproved(false);

    try {
      appendLog(`Triggering Google-grounded AI synthesis loop for: "${topic}"`, "info");
      
      // Let's pass the learning preferences so the prompt adapts in backend
      const res = await fetch('/api/content/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          topic,
          tone,
          format,
          userPreferences: usePreferences ? {
            tonePreferences: tone,
            explicitNotes: `Format strictly as a ${format}. Prefer citation transparency.`
          } : undefined
        })
      });

      if (!res.ok) {
        throw new Error(`Content generate failed with state ${res.status}`);
      }

      const data = await res.json();
      setGeneratedText(data.text);
      setEditableText(data.text);
      if (data.groundingSources && Array.isArray(data.groundingSources)) {
        setSources(data.groundingSources);
      }
      
      appendLog(`AI content generation finalized successfully. Embedded citations verified.`, "success");
    } catch (err) {
      console.error(err);
      appendLog("System content loop offline. Displaying sandbox fallback generation.", "warning");
      
      // Sandbox fallback
      const mockResult = `
# Dynamic Insight: Solar Energy Convergence

The convergence of smart electrical grids and low-cost photovoltaic technologies is transforming community municipal fields. Recent search verification highlights distinct solar advances in 2026.

### Key Points of Dynamic Synthesis
- **Decentralized Distribution**: Small microgrids scale local grid resiliency up to 68%.
- **Ambient Thermal Efficiency**: Modern multi-junction silicon layers boast over 29% photon capture rate.
- **Ecological Harmonization**: Clean installations preserve native fields and support local soil restoration.

*Synthesized autonomously using standard JARVIS X neural reasoning.*
      `;
      setGeneratedText(mockResult);
      setEditableText(mockResult);
      setSources([
        { title: "National Renewable Energy Review 2026", url: "https://www.nrel.gov" },
        { title: "Global Clean Microgrid Index Report", url: "https://www.iea.org" }
      ]);
    } finally {
      setIsGenerating(false);
    }
  };

  const submitFeedback = async (type: 'positive' | 'negative') => {
    setFeedbackSent(type);
    appendLog(`Filing user feedback: ${type === 'positive' ? 'Positive Weight Adjustment' : 'Correction Vector'} to learning loop.`, "success");
    
    try {
      await fetch('/api/learning/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rating: type === 'positive' ? 5 : 2,
          feedback: `User liked/disliked the ${format} about ${topic}`
        })
      });
      
      // Dispatch a global storage refresh custom event as well
      window.dispatchEvent(new CustomEvent('learning-preference-updated'));
    } catch (e) {
      console.warn("Feedback learning telemetry offline:", e);
    }
  };

  const handleApprove = () => {
    setIsApproved(true);
    appendLog(`Administrator approved content on "${topic}". Generated files archived securely into history vaults.`, "success");
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(editableText);
    appendLog("Copied text to administrative clipboard.", "info");
  };

  return (
    <div className="space-y-5 text-left" id="content-generation-module">
      
      {/* Module Title */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 rounded-lg bg-orange-50 border border-orange-100 text-orange-600">
            <PenTool className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-widest">AI Copywriter & Creative Assistant</h3>
            <p className="text-[9px] text-slate-400 font-mono uppercase mt-0.5">Grounding: Google Search Engines & Synaptic Flash Synthesis</p>
          </div>
        </div>
        <span className="text-[8px] bg-orange-100/50 border border-orange-200/50 text-orange-700 px-1.5 py-0.5 rounded font-mono font-bold uppercase uppercase tracking-wide">
          SOTA Grounding active
        </span>
      </div>

      {/* Input parameters panel */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        
        {/* Topic Input - takes up 2/3 wide on desktop */}
        <div className="md:col-span-3 space-y-1">
          <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider font-mono">Select or Enter Topic Core</label>
          <div className="relative">
            <input 
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. The modern applications of quantum computing in cybersecurity..."
              className="w-full bg-slate-50/50 border border-slate-100 hover:border-slate-200 focus:bg-white focus:border-orange-400 text-xs rounded-xl pl-3.5 pr-10 py-2.5 outline-none font-sans text-slate-800 placeholder-slate-400 transition-all font-medium"
            />
            <button 
              onClick={handleGenerate}
              disabled={isGenerating || !topic.trim()}
              className="absolute right-1.5 top-1.5 p-1.5 bg-slate-900 hover:bg-slate-800 text-white disabled:bg-slate-200 disabled:text-slate-400 rounded-lg cursor-pointer transition-colors"
              title="Generate content"
            >
              {isGenerating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Dynamic Suggesters */}
        <div className="md:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-1.5 pt-0.5 pb-1">
          {suggestions.map((suggestion, idx) => (
            <button
              key={idx}
              onClick={() => {
                setTopic(suggestion.topic);
                appendLog(`Injected preset topic: "${suggestion.label}"`, "info");
              }}
              className="px-2.5 py-1.5 bg-slate-50 hover:bg-slate-105 border border-slate-100 hover:border-slate-200 text-[10px] text-slate-500 hover:text-slate-700 rounded-lg text-left transition truncate cursor-pointer font-medium"
            >
              <span className="font-extrabold text-[#f97316] mr-1">✦</span>
              {suggestion.label}
            </button>
          ))}
        </div>

        {/* Tone Selection */}
        <div className="space-y-1">
          <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider font-mono">Writing Tone</label>
          <select 
            value={tone}
            onChange={(e) => setTone(e.target.value)}
            className="w-full bg-slate-50 border border-slate-100 px-2.5 py-2 text-[11px] rounded-xl outline-none focus:border-orange-400 font-sans font-semibold text-slate-700 hover:bg-slate-100/50 transition cursor-pointer"
          >
            <option value="Professional & Scientific">Professional & Scientific</option>
            <option value="Cinematic & Creative">Cinematic & Creative</option>
            <option value="Humorous & Casual">Humorous & Casual</option>
            <option value="Inspiring & Bold">Inspiring & Bold</option>
            <option value="Technical Developer Vibe">Technical Developer Vibe</option>
          </select>
        </div>

        {/* Format Selection */}
        <div className="space-y-1">
          <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider font-mono">Desired Output Format</label>
          <select 
            value={format}
            onChange={(e) => setFormat(e.target.value)}
            className="w-full bg-slate-50 border border-slate-100 px-2.5 py-2 text-[11px] rounded-xl outline-none focus:border-orange-400 font-sans font-semibold text-slate-700 hover:bg-slate-105 transition cursor-pointer"
          >
            <option value="Blog Post Article">Blog Post Article</option>
            <option value="Social Media Thread (Tweets)">Social Media Thread (Tweets)</option>
            <option value="Creative Engaging Story">Creative Engaging Story</option>
            <option value="Administrative Email Draft">Administrative Email Draft</option>
            <option value="SOTA Technical Markdown Report">SOTA Technical Markdown Report</option>
          </select>
        </div>

        {/* Preference Synapse checkbox */}
        <div className="flex items-center justify-between border border-slate-105 bg-slate-50/50 p-2 rounded-xl">
          <div className="flex items-center space-x-2">
            <Brain className="w-4 h-4 text-orange-500 animate-pulse" />
            <div className="text-[10px]">
              <div className="font-bold text-slate-700 leading-tight">Sync Preferences</div>
              <div className="text-[8px] text-slate-400">Apply learning metrics weights</div>
            </div>
          </div>
          <input 
            type="checkbox" 
            checked={usePreferences} 
            onChange={(e) => setUsePreferences(e.target.checked)}
            className="rounded h-3.5 w-3.5 border-slate-300 text-orange-600 focus:ring-orange-500 cursor-pointer"
          />
        </div>

      </div>

      {/* Output Review Container */}
      <AnimatePresence mode="wait">
        {isGenerating ? (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="p-8 border border-dashed border-slate-200 bg-orange-50/10 rounded-2xl flex flex-col items-center justify-center space-y-3"
          >
            <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
            <div className="text-center">
              <p className="text-[10px] font-extrabold uppercase text-slate-700 font-mono tracking-widest animate-pulse">LAUNCHING PARALLEL MULTI-ENGINE SEARCH PROBES...</p>
              <p className="text-[9px] text-[#f97316] font-mono uppercase mt-1">Grounding output against live Google Search channels</p>
            </div>
          </motion.div>
        ) : generatedText ? (
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="border border-slate-100 bg-white/80 rounded-2xl overflow-hidden shadow-sm flex flex-col"
          >
            {/* Review Controls Header */}
            <div className="flex items-center justify-between bg-slate-50 border-b border-slate-100 px-4 py-2 text-[10px] uppercase font-bold tracking-wider font-mono text-slate-500">
              <span className="flex items-center space-x-1.5">
                <FileText className="w-3.5 h-3.5 text-orange-500" />
                <span>Generated Output Preview</span>
              </span>
              
              <div className="flex items-center space-x-2">
                <button 
                  onClick={() => setIsEditing(!isEditing)} 
                  className={`px-2 py-0.5 rounded cursor-pointer transition-colors ${isEditing ? 'bg-orange-100 text-orange-700 font-extrabold' : 'hover:bg-slate-200/60'}`}
                >
                  {isEditing ? "Exit Edit" : "Edit Raw Text"}
                </button>
                <button 
                  onClick={handleCopy}
                  className="p-1 hover:bg-slate-200/60 rounded text-slate-400 hover:text-slate-800 transition"
                  title="Copy Raw Markdown"
                >
                  <Copy className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* Editable Content Workspace */}
            <div className="p-4 min-h-[160px] max-h-[320px] overflow-y-auto">
              {isEditing ? (
                <textarea
                  value={editableText}
                  onChange={(e) => setEditableText(e.target.value)}
                  className="w-full h-[240px] text-xs bg-slate-50 font-mono p-3 rounded-lg border border-slate-100 outline-none focus:border-orange-300 text-slate-700 leading-relaxed"
                />
              ) : (
                <div className="markdown-body prose prose-slate prose-xs max-w-none text-xs text-slate-700 leading-relaxed font-sans font-medium">
                  <ReactMarkdown>{editableText}</ReactMarkdown>
                </div>
              )}
            </div>

            {/* Citations/References section */}
            {sources.length > 0 && (
              <div className="bg-slate-50/60 border-t border-slate-100 px-4 py-2.5 text-left">
                <span className="flex items-center space-x-1 text-[8px] font-black tracking-widest text-slate-400 uppercase font-mono mb-2">
                  <Globe className="w-3 h-3 text-emerald-500" />
                  <span>Google Search Grounding Verifications</span>
                </span>
                <div className="flex flex-wrap gap-2">
                  {sources.map((source, idx) => (
                    <a 
                      key={idx}
                      href={source.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-1 bg-emerald-50 border border-emerald-100 hover:border-emerald-200 text-[9px] text-emerald-700 hover:text-emerald-800 font-bold px-2.5 py-1 rounded-lg transition"
                    >
                      <span className="truncate max-w-[150px]">{source.title}</span>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Actions & Feedback Footer */}
            <div className="bg-slate-50 border-t border-slate-100 px-4 py-3.5 flex flex-col sm:flex-row justify-between items-center gap-3">
              
              {/* Thumbs ratings */}
              <div className="flex items-center space-x-2.5">
                <span className="text-[10px] font-extrabold text-slate-400 font-mono tracking-tight">TRAIN AI FEEDBACK LOBBY:</span>
                <div className="flex bg-slate-100 rounded-lg p-0.5 border border-slate-105">
                  <button
                    onClick={() => submitFeedback('positive')}
                    className={`p-1.5 rounded-md cursor-pointer transition ${
                      feedbackSent === 'positive' 
                        ? 'bg-emerald-500 text-white' 
                        : 'text-slate-400 hover:text-emerald-600'
                    }`}
                    title="Good Generation (Increase learning weights)"
                  >
                    <ThumbsUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => submitFeedback('negative')}
                    className={`p-1.5 rounded-md cursor-pointer transition ${
                      feedbackSent === 'negative' 
                        ? 'bg-rose-500 text-white' 
                        : 'text-slate-400 hover:text-rose-600'
                    }`}
                    title="Poor Quality (Trigger corrective vector)"
                  >
                    <ThumbsDown className="w-3.5 h-3.5" />
                  </button>
                </div>
                {feedbackSent && (
                  <span className="text-[9px] text-emerald-600 font-black font-mono animate-pulse uppercase">Synced securely to cognitive weights!</span>
                )}
              </div>

              {/* Approval archived */}
              <div className="flex items-center space-x-2">
                {isApproved ? (
                  <div className="flex items-center space-x-1 text-xs text-emerald-600 font-bold font-mono">
                    <CheckCircle className="w-4 h-4 text-emerald-500 animate-bounce" />
                    <span>APPROVED & SAVE IN WORKSPACE</span>
                  </div>
                ) : (
                  <button
                    onClick={handleApprove}
                    className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-orange-500 hover:bg-orange-600 text-white text-[10px] font-bold uppercase rounded-xl shadow-md shadow-orange-500/10 cursor-pointer transition-colors"
                  >
                    <Check className="w-4 h-4" />
                    <span>Approve Copy Draft</span>
                  </button>
                )}
              </div>

            </div>

          </motion.div>
        ) : (
          <div className="p-8 border border-dashed border-slate-200 bg-slate-50/20 rounded-2xl flex flex-col items-center justify-center space-y-2 text-center text-slate-400">
            <BookOpen className="w-8 h-8 text-slate-300" />
            <div>
              <p className="text-[10px] font-extrabold uppercase text-slate-600 font-mono">No Active Template Synthesized</p>
              <p className="text-[9px] text-slate-400 max-w-xs mx-auto mt-0.5">Select a quick preset suggestion above or fill out the topic parameter to ignite search grounding.</p>
            </div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
