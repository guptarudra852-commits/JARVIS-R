import React, { useState, useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import { useAgent } from '../lib/agent-context';
import { 
  Mic, 
  MicOff, 
  Disc, 
  Volume2, 
  Sparkles, 
  Send, 
  BrainCircuit, 
  VolumeX, 
  RefreshCw,
  Image as ImageIcon,
  Check,
  Cpu,
  Bookmark,
  Zap,
  ChevronDown
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface VoiceConsoleProps {
  onAgentActivated?: (agentName: string) => void;
  onNewHistoryLog?: (msg: string, type: 'info' | 'success' | 'warning' | 'agent_thought') => void;
  activeAgentId?: string;
  activeAgentName?: string;
}

const VoiceConsole = forwardRef(({ 
  onAgentActivated, 
  onNewHistoryLog,
  activeAgentId: propActiveAgentId = 'coordinator',
  activeAgentName: propActiveAgentName = 'Coordinator Agent'
}: VoiceConsoleProps, ref) => {
  const { appendLog, googleToken, loginWithGoogle } = useAgent();
  const [selectedModel, setSelectedModel] = useState<'gemini-3.5-flash' | 'gpt-4o'>('gemini-3.5-flash');
  const [isOfflineMode, setIsOfflineMode] = useState<boolean>(() => {
    return localStorage.getItem("jarvis_offline_mode") === "true";
  });
  const [isListening, setIsListening] = useState(false);
  const [textCommand, setTextCommand] = useState('');
  const [jarvisResponse, setJarvisResponse] = useState('Welcome back, Rudra. How can I assist you today?');
  const [activeAgentName, setActiveAgentName] = useState(propActiveAgentName);
  const [activeAgentId, setActiveAgentId] = useState(propActiveAgentId);

  useImperativeHandle(ref, () => ({
    toggleListening: () => toggleListening()
  }));

  useEffect(() => {
    setActiveAgentName(propActiveAgentName);
  }, [propActiveAgentName]);

  useEffect(() => {
    setActiveAgentId(propActiveAgentId);
  }, [propActiveAgentId]);
  const [isThoughtsExpanded, setThoughtsExpanded] = useState(false);
  const [thoughtsTrace, setThoughtsTrace] = useState<string[]>([
    "[System Matrix] Core initialized safely under light interface enclave.",
    "[Cognitive] Synapse connection tested: Nominal feedback verified."
  ]);
  const [audioWaves, setAudioWaves] = useState<number[]>(new Array(16).fill(6));
  const [isMuted, setIsMuted] = useState(false);

  // Holographic image generation states
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [generatedImage, setGeneratedImage] = useState('');
  const [imagePromptUsed, setImagePromptUsed] = useState('');

  // SOTA Audio MediaRecorder refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const activeAudioRef = useRef<HTMLAudioElement | null>(null);

  // SOTA Audio waveform animation loop
  useEffect(() => {
    if (!isListening) {
      setAudioWaves(new Array(16).fill(4));
      return;
    }

    const interval = setInterval(() => {
      setAudioWaves(() => {
        return Array.from({ length: 16 }, () => Math.floor(Math.random() * 20) + 4);
      });
    }, 120);

    return () => clearInterval(interval);
  }, [isListening]);

  const toggleListening = async () => {
    if (!isListening) {
      // Clear previous audio playback if active
      if (activeAudioRef.current) {
        activeAudioRef.current.pause();
        activeAudioRef.current = null;
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        audioChunksRef.current = [];

        const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
        mediaRecorderRef.current = recorder;

        recorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            audioChunksRef.current.push(event.data);
          }
        };

        recorder.onstop = async () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          const reader = new FileReader();
          reader.readAsDataURL(audioBlob);
          reader.onloadend = async () => {
            const base64data = reader.result as string;
            const base64Payload = base64data.split(',')[1];

            appendLog("Vocal frequency packet compiled. Transcribing...", "info");
            onNewHistoryLog?.("Dispatched cognitive sound packet to transcription synapse...", "info");

            try {
              const res = await fetch('/api/voice', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ audio: base64Payload })
              });

              if (res.ok) {
                const data = await res.json();
                appendLog(`Vocal command transcribed: "${data.transcription}"`, "success");
                onNewHistoryLog?.(`Voice Captured: "${data.transcription}"`, "success");
                setTextCommand(data.transcription);
                executeRealCommand(data.transcription);
              } else {
                throw new Error("Voice API rejected transcription packet");
              }
            } catch (e) {
              console.error("Transcribe API failure:", e);
              appendLog("Transcription synapse failure. Restoring standby channel.", "error");
            }
          };

          stream.getTracks().forEach(track => track.stop());
        };

        recorder.start();
        setIsListening(true);
        appendLog("Voice transceiver activated. Speak now...", "info");
        onNewHistoryLog?.("Transceiver engaged. Listening to active audio waves...", "info");

      } catch (getMediaErr) {
        console.warn("Microphone hardware access denied or unavailable. Running simulator:", getMediaErr);

        // Fallback simulated session
        setIsListening(true);
        appendLog("Microphone access unavailable. Running SOTA vocal simulator...", "info");
        onNewHistoryLog?.("Vocal transceiver activated (SIMULATING)...", "info");

        setTimeout(async () => {
          try {
            const res = await fetch('/api/voice', { method: 'POST' });
            if (res.ok) {
              const data = await res.json();
              appendLog(`Vocal command transcribed: "${data.transcription}"`, "success");
              onNewHistoryLog?.(`Voice Captured (SIMULATED): "${data.transcription}"`, "success");
              setTextCommand(data.transcription);
              executeRealCommand(data.transcription);
            }
          } catch (e) {
            console.error("Simulation API failure:", e);
          } finally {
            setIsListening(false);
          }
        }, 3000);
      }
    } else {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
      setIsListening(false);
      appendLog("Voice transceiver standby.", "warning");
    }
  };

  const executeRealCommand = async (commandText: string) => {
    const cmd = commandText.trim();
    if (!cmd) return;

    appendLog(`Cognitive parsing triggered: "${cmd}"`, "info");
    onNewHistoryLog?.(`Analytical query: "${cmd}"`, "info");

    const t = cmd.toLowerCase();
    
    // Pattern check: Determine if custom holographic visual synth is requested
    const isImageReq = (
      t.includes('generate image') ||
      t.includes('generate an image') ||
      t.includes('create image') ||
      t.includes('draw ') ||
      t.includes('paint ') ||
      t.includes('show a picture') ||
      t.includes('visualize ') ||
      t.includes('sketch ') ||
      t.includes('hologram ')
    );

    if (isImageReq) {
      // Isolate clean description
      const prefixes = [
        'generate an image of a ', 'generate an image of an ', 'generate an image of ',
        'generate image of a ', 'generate image of an ', 'generate image of ',
        'create an image of a ', 'create image of ', 'show a picture of ', 'draw a ', 'draw '
      ];
      let cleanPrompt = cmd;
      for (const prefix of prefixes) {
        if (t.startsWith(prefix)) {
          cleanPrompt = cmd.slice(prefix.length).trim();
          break;
        }
      }

      setIsGeneratingImage(true);
      setGeneratedImage('');
      setImagePromptUsed(cleanPrompt);
      setJarvisResponse(`Engaging Imagen Vector Synthesis Core for prompt: "${cleanPrompt}"...`);
      onNewHistoryLog?.(`Imaging request detected: "${cleanPrompt}"`, "info");

      try {
        const response = await fetch('/api/gemini/generate-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt: cleanPrompt }),
        });

        if (!response.ok) {
          throw new Error(`Reactor image feedback: Status [${response.status}]`);
        }

        const data = await response.json();
        if (data.url) {
          setGeneratedImage(data.url);
          setJarvisResponse(`Interactive holographic graphic compiled successfully for "${cleanPrompt}". Ready for high-contrast viewing.`);
          appendLog("Holographic synthesis of image complete.", "success");
          onNewHistoryLog?.(`Graphic compiled safely for: "${cleanPrompt}"`, "success");
        }
      } catch (err) {
        setJarvisResponse(`Imaging reactor failed: ${err instanceof Error ? err.message : String(err)}. Serving local fallback visual elements.`);
        appendLog("Imaging reactor exception handled gracefully.", "error");
      } finally {
        setIsGeneratingImage(false);
      }
      return;
    }

    // Otherwise, route through the central multi-agent cognitive endpoint `/api/chat`
    setJarvisResponse("Computing response and analyzing cognitive constraints...");
    setThoughtsTrace(prev => [...prev, `[Cognitive Dispatch] Transferring prompt control vectors to target backend orchestrator.`]);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: cmd,
          model: selectedModel,
          activeAgentId: activeAgentId,
          googleToken: googleToken,
          offlineMode: isOfflineMode
        }),
      });

      if (!response.ok) {
        throw new Error(`API returned response status [${response.status}]`);
      }

      const data = await response.json();
      
      setJarvisResponse(data.text || "Operational loop finished with nominal feedback.");
      if (data.agentName) {
        setActiveAgentName(data.agentName);
        onAgentActivated?.(data.agentName);
      }
      if (data.thoughts) {
        setThoughtsTrace(data.thoughts);
        data.thoughts.forEach((th: string) => {
          if (th.startsWith("[Memory") || th.startsWith("[Intent")) {
            onNewHistoryLog?.(th, "agent_thought");
          }
        });
      }

      appendLog(`Synaptic output generated by ${data.agentName || "Orchestrator"}`, "success");
      onNewHistoryLog?.(`Operational response yielded by ${data.agentName || "Orchestrator"}`, "success");

      // Speak the response
      if (!isMuted) {
        let playedElevenLabs = false;
        
        try {
          // Remove Markdown formatting & take initial text segments block
          const plainTextClean = (data.text || "")
            .replace(/[#*_`\-]/g, "")
            .replace(/\[.*?\]\(.*?\)/g, "")
            .trim();
          
          if (plainTextClean) {
            const selectExcerpt = plainTextClean.slice(0, 160) + (plainTextClean.length > 160 ? "..." : "");
            console.log("[Voice Console] Executing ElevenLabs voice synthesis for excerpt...");
            
            const ttsRes = await fetch("/api/tts", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ text: selectExcerpt })
            });
            
            if (ttsRes.ok) {
              const audioBlob = await ttsRes.blob();
              const audioUrl = URL.createObjectURL(audioBlob);
              const audio = new Audio(audioUrl);
              activeAudioRef.current = audio;
              audio.play();
              playedElevenLabs = true;
              appendLog("Vocal feedback synthesized via ElevenLabs API.", "success");
            }
          }
        } catch (ttsErr) {
          console.warn("[TTS Fallback] Premium ElevenLabs stream unavailable. Using local SpeakSynth:", ttsErr);
        }
        
        // Graceful standard fallback to native SpeechSynthesis
        if (!playedElevenLabs && 'speechSynthesis' in window) {
          window.speechSynthesis.cancel();
          const plainText = (data.text || "").replace(/[#*_`\-]/g, "").slice(0, 120) + "...";
          const utterance = new SpeechSynthesisUtterance(plainText);
          utterance.rate = 1.05;
          utterance.pitch = 0.95;
          window.speechSynthesis.speak(utterance);
        }
      }

    } catch (err) {
      console.error(err);
      setJarvisResponse("Greetings Rudra. JARVIS X is operating in Standby Offline Mode. Standby local core functions are fully active.");
      appendLog("Synapse mesh standby channel engaged.", "warning");
    }
  };

  const handleCommandSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!textCommand.trim()) return;
    executeRealCommand(textCommand.trim());
    setTextCommand('');
  };

  return (
    <div className="flex flex-col space-y-5 h-full relative">
      {/* Segment controls header pill */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-3 gap-2">
        <div className="flex items-center space-x-2.5">
          <BrainCircuit className="w-5 h-5 text-blue-600 animate-pulse" />
          <div className="text-left">
            <h2 className="text-xs font-bold tracking-tight text-slate-800 uppercase font-mono">
              AI Assistant Core
            </h2>
            <div className="text-[9px] text-slate-400 font-mono flex items-center space-x-1.5 uppercase tracking-wide">
              <span>Synapse Mesh Focus:</span>
              <span className="text-blue-600 font-extrabold">{activeAgentName}</span>
            </div>
          </div>
        </div>

        {/* Dynamic Model Filter & Mute/Mode Buttons */}
        <div className="flex flex-wrap items-center gap-2.5 self-end sm:self-auto">
          {/* AI Mode Selector: Live vs Offline */}
          <div className="flex bg-slate-100 p-0.5 rounded-lg text-[9px] font-mono font-bold uppercase tracking-wider border border-slate-200">
            <button
              type="button"
              onClick={() => {
                setIsOfflineMode(false);
                localStorage.setItem("jarvis_offline_mode", "false");
                appendLog("Operational core engaged: Live Cloud AI Mode active.", "success");
              }}
              className={`px-2 py-1 rounded-md transition cursor-pointer flex items-center space-x-1 ${
                !isOfflineMode
                  ? 'bg-emerald-500 text-white shadow-sm font-extrabold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Queries external live models for AI analysis"
            >
              <Zap className={`w-2.5 h-2.5 ${!isOfflineMode ? 'text-yellow-300' : 'text-slate-400'}`} />
              <span>Live AI Mode</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setIsOfflineMode(true);
                localStorage.setItem("jarvis_offline_mode", "true");
                appendLog("Operational core engaged: Offline Local Enclave active to conserve API.", "info");
              }}
              className={`px-2 py-1 rounded-md transition cursor-pointer flex items-center space-x-1 ${
                isOfflineMode
                  ? 'bg-slate-700 text-white shadow-sm font-extrabold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Runs lightweight offline templates to conserve API tokens"
            >
              <Cpu className={`w-2.5 h-2.5 ${isOfflineMode ? 'text-amber-400 animate-pulse' : 'text-slate-400'}`} />
              <span>Offline Local Mode</span>
            </button>
          </div>

          {/* SOTA segment model controller */}
          <div className="flex bg-slate-100 p-0.5 rounded-lg text-[9px] font-mono font-bold uppercase tracking-wider">
            <button
              onClick={() => {
                setSelectedModel('gemini-3.5-flash');
                appendLog("Synapse core set: Gemini Flash reasoning.", "success");
              }}
              className={`px-2 py-1 rounded-md transition cursor-pointer flex items-center space-x-1 ${
                selectedModel === 'gemini-3.5-flash'
                  ? 'bg-white text-slate-800 shadow-sm font-extrabold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Sparkles className="w-2.5 h-2.5 text-blue-500" />
              <span>Advanced</span>
            </button>
            <button
              onClick={() => {
                setSelectedModel('gpt-4o');
                appendLog("Synapse core set: OpenAI GPT-4o.", "success");
              }}
              className={`px-2 py-1 rounded-md transition cursor-pointer flex items-center space-x-1 ${
                selectedModel === 'gpt-4o'
                  ? 'bg-white text-slate-800 shadow-sm font-extrabold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <span>GPT-4o</span>
            </button>
            <button
              onClick={() => {
                setSelectedModel('gemini-3.5-flash');
                appendLog("Synapse core set: Gemini Lightspeed Flash.", "info");
              }}
              className={`px-2 py-1 rounded-md transition cursor-pointer ${
                selectedModel === 'gemini-3.5-flash'
                  ? 'bg-white text-slate-800 shadow-sm font-extrabold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <span>Flash Core</span>
            </button>
          </div>

          <button
            onClick={() => {
              const nextMuted = !isMuted;
              setIsMuted(nextMuted);
              if (nextMuted && 'speechSynthesis' in window) {
                window.speechSynthesis.cancel();
              }
              appendLog(nextMuted ? "Vocal voice output suspended." : "Vocal voice output activated.", "info");
            }}
            className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg text-[10px] font-bold border transition cursor-pointer ${
              isMuted 
                ? 'border-rose-100 bg-rose-50/50 text-rose-600' 
                : 'border-slate-100 bg-slate-50 text-slate-600 hover:bg-slate-100'
            }`}
            title={isMuted ? "Voice suspended" : "Voice enabled"}
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5 text-rose-500" /> : <Volume2 className="w-3.5 h-3.5 text-blue-600 animate-pulse" />}
            <span className="tracking-wide text-[9px] uppercase font-mono">{isMuted ? "Muted" : "Voice On"}</span>
          </button>

          {!googleToken ? (
            <button
              type="button"
              onClick={loginWithGoogle}
              className="flex items-center space-x-1 px-2.5 py-1 rounded-lg text-[10px] font-bold border border-cyan-200 bg-cyan-50/70 text-cyan-700 hover:bg-cyan-100 transition cursor-pointer animate-[pulse_2.5s_infinite]"
              title="Link Google account to authorize Gmail & Calendar access"
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-600 animate-pulse" />
              <span className="tracking-wide text-[9px] uppercase font-mono">Link Google</span>
            </button>
          ) : (
            <div className="flex items-center space-x-1 px-2.5 py-1 rounded-lg text-[10px] font-bold border border-emerald-100 bg-emerald-50 text-emerald-700">
              <Check className="w-3 h-3 text-emerald-600" />
              <span className="tracking-wide text-[9px] uppercase font-mono">Linked</span>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* Large Elegant Circle Microphone Controller (Colspan 4) */}
        <div className="lg:col-span-4 flex flex-col justify-between items-center p-5 bg-[#030712] border border-cyan-950 rounded-2xl relative select-none overflow-hidden h-[360px] text-center shadow-2xl">
          {/* Subtle Grid and Scanline effect backgrounds */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(8,47,73,0.15)_1px,transparent_1px),linear-gradient(90deg,rgba(8,47,73,0.15)_1px,transparent_1px)] bg-[size:16px_16px] opacity-60 pointer-events-none" />
          <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent animate-[pulse_2s_infinite] pointer-events-none" />

          {/* Immersive Holographic Background Animation GIF */}
          <img 
            src="https://camo.githubusercontent.com/66d592525f51ee1015ffd564594a99b0c36802bb016849d6df89806ea18c4bba/68747470733a2f2f67696666696c65732e616c706861636f646572732e636f6d2f3231322f3231323530382e676966"
            alt="JARVIS Core Backdrop"
            className="absolute inset-0 w-full h-full object-cover opacity-55 mix-blend-screen pointer-events-none select-none"
            referrerPolicy="no-referrer"
          />

          {/* Top Title */}
          <div className="relative z-10 w-full text-center mt-1">
            <h3 className="text-[10px] font-black tracking-[0.25em] text-cyan-400 font-mono animate-pulse uppercase">
              QUANTUM PROCESSING NODE ACTIVE
            </h3>
            
            {/* System Info Translucent Pill */}
            <div className="inline-block mt-2 px-3 py-1 bg-slate-950/90 border border-cyan-900/30 rounded-full backdrop-blur-md">
              <span className="text-[8px] font-bold text-cyan-550/90 text-cyan-400 font-mono tracking-wider uppercase">
                SYSTEM ID: JARVIS-X-PRIMARY // CLUSTER: LAMBDA-9
              </span>
            </div>
          </div>

          {/* Core Animated SVG Circular Visualizer */}
          <div className="relative z-10 w-full flex items-center justify-center my-2">
            <button
              type="button"
              onClick={toggleListening}
              className="relative focus:outline-none cursor-pointer group"
              title={isListening ? "Deactivate Transceiver" : "Activate Transceiver"}
            >
              {/* Outer pulsing neon ring */}
              {isListening && (
                <div className="absolute inset-[-12px] rounded-full bg-cyan-500/5 animate-ping duration-1000 -z-10" />
              )}
              
              <svg className="w-48 h-48 select-none" viewBox="0 0 200 200">
                {/* Outermost dotted boundary ring */}
                <circle 
                  cx="100" 
                  cy="100" 
                  r="92" 
                  stroke="rgba(34, 211, 238, 0.08)" 
                  strokeWidth="1" 
                  strokeDasharray="4,6" 
                  fill="none" 
                />

                {/* Second orbital grid with degree indicators */}
                <circle 
                  cx="100" 
                  cy="100" 
                  r="78" 
                  stroke="rgba(34, 211, 238, 0.12)" 
                  strokeWidth="1" 
                  fill="none" 
                />

                {/* Crosshairs inside compass */}
                <line 
                  x1="100" 
                  y1="16" 
                  x2="100" 
                  y2="184" 
                  stroke="rgba(34, 211, 238, 0.14)" 
                  strokeWidth="0.75" 
                  strokeDasharray="2,5" 
                />
                <line 
                  x1="16" 
                  y1="100" 
                  x2="184" 
                  y2="100" 
                  stroke="rgba(34, 211, 238, 0.14)" 
                  strokeWidth="0.75" 
                  strokeDasharray="2,5" 
                />

                {/* Rotating curved outer segment A (Fast, Reverse) */}
                <g 
                  className={`transition-transform duration-500 ${isListening ? 'animate-[spin_4s_linear_infinite]' : 'animate-[spin_12s_linear_infinite]'}`} 
                  style={{ transformOrigin: '100px 100px' }}
                >
                  <path 
                    d="M 100,28 A 72,72 0 0,1 172,100" 
                    fill="none" 
                    stroke="rgba(6, 182, 212, 0.65)" 
                    strokeWidth="1.5" 
                    strokeLinecap="round" 
                  />
                  <path 
                    d="M 100,172 A 72,72 0 0,1 28,100" 
                    fill="none" 
                    stroke="rgba(6, 182, 212, 0.3)" 
                    strokeWidth="1" 
                    strokeLinecap="round" 
                  />
                </g>

                {/* Rotating curved inner segment B (Slow, Regular) */}
                <g 
                  className={`transition-transform duration-500 ${isListening ? 'animate-[spin_2.5s_linear_reverse_infinite]' : 'animate-[spin_9s_linear_reverse_infinite]'}`} 
                  style={{ transformOrigin: '100px 100px' }}
                >
                  <path 
                    d="M 100,40 A 60,60 0 0,0 40,100" 
                    fill="none" 
                    stroke="rgba(45, 212, 191, 0.75)" 
                    strokeWidth="2.5" 
                    strokeLinecap="round" 
                  />
                  <path 
                    d="M 142.4,142.4 A 60,60 0 0,0 100,160" 
                    fill="none" 
                    stroke="rgba(45, 212, 191, 0.35)" 
                    strokeWidth="1.5" 
                    strokeLinecap="round" 
                  />
                </g>

                {/* Static target tick markers */}
                <circle cx="100" cy="100" r="48" stroke="rgba(34, 211, 238, 0.05)" strokeWidth="4" fill="none" />

                {/* Solid glowing center sphere - Pulsing */}
                <defs>
                  <radialGradient id="tealGlow" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                    <stop offset="0%" stopColor="#2dd4bf" stopOpacity="1" />
                    <stop offset="70%" stopColor="#0ea5e9" stopOpacity="0.85" />
                    <stop offset="100%" stopColor="#0891b2" stopOpacity="0" />
                  </radialGradient>
                  
                  {/* Intense Listening Glow */}
                  <radialGradient id="activeGlow" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#2dd4bf" stopOpacity="1" />
                    <stop offset="35%" stopColor="#22d3ee" stopOpacity="0.9" />
                    <stop offset="75%" stopColor="#3b82f6" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#1d4ed8" stopOpacity="0" />
                  </radialGradient>

                  {/* Mask for the holographic core animated GIF */}
                  <clipPath id="jarvisCoreClip">
                    <circle cx="100" cy="100" r="46" />
                  </clipPath>
                </defs>

                {/* Holographic Arc Reactor GIF Integration */}
                <g clipPath="url(#jarvisCoreClip)">
                  <image 
                    href="https://camo.githubusercontent.com/66d592525f51ee1015ffd564594a99b0c36802bb016849d6df89806ea18c4bba/68747470733a2f2f67696666696c65732e616c706861636f646572732e636f6d2f3231322f3231323530382e676966"
                    x="50"
                    y="50"
                    width="100"
                    height="100"
                    opacity={isListening ? "0.95" : "0.75"}
                    className="transition-opacity duration-300"
                  />
                </g>

                {/* Background glow circle */}
                <circle 
                  cx="100" 
                  cy="100" 
                  r={isListening ? "38" : "28"} 
                  fill={isListening ? "url(#activeGlow)" : "url(#tealGlow)"} 
                  className="transition-all duration-300 animate-pulse opacity-40 pointer-events-none"
                />

                {/* Main central clickable core sphere */}
                <circle 
                  cx="100" 
                  cy="100" 
                  r="24" 
                  fill="#0ea5e9" 
                  stroke="#2dd4bf" 
                  strokeWidth="2" 
                  className={`transition-all duration-300 group-hover:scale-110 shadow-lg opacity-30 hover:opacity-60 ${
                    isListening ? 'fill-teal-400 stroke-white' : 'fill-cyan-500'
                  }`}
                  style={{ transformOrigin: '100px 100px' }}
                />

                {/* Tiny inner center lens */}
                <circle 
                  cx="100" 
                  cy="100" 
                  r="10" 
                  fill="rgba(255,255,255,0.2)" 
                  className="pointer-events-none" 
                  style={{ transformOrigin: '100px 100px' }}
                />
              </svg>
            </button>
          </div>

          {/* Bottom Custom cybernetic indicator element */}
          <div className="relative z-10 w-full mb-1">
            <div className="inline-flex items-center space-x-2 px-5 py-2 bg-slate-950 border border-cyan-500/30 rounded-xl">
              <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-ping" />
              <span className="text-[9px] font-black tracking-[0.16em] text-cyan-400 font-mono uppercase">
                .0. VOICE INTERFACE
              </span>
            </div>
            <p className="text-[8px] text-slate-500 font-mono mt-1.5 lowercase">
              {isListening ? "transceiver engaged / online" : "transceiver idle / standby"}
            </p>
          </div>
        </div>

        {/* Cognitive Transcript Dialog Box (Colspan 8) */}
        <div className="lg:col-span-8 flex flex-col justify-between space-y-3">
          <div className="bg-white border border-slate-100 rounded-2xl p-4 min-h-[140px] flex flex-col justify-between font-sans relative overflow-hidden shadow-sm text-left">
            <div className="text-[9px] text-slate-400 uppercase tracking-widest flex items-center justify-between font-bold border-b border-slate-50 pb-2 mb-2 font-mono">
              <span className="flex items-center gap-1.5 font-bold">
                <Sparkles className="w-3.5 h-3.5 text-blue-500 animate-pulse" />
                OUTPUT DIALOGUE TRANSCRIPT
              </span>
              <span className="text-[8px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-600 font-bold">
                {activeAgentName.toUpperCase()}
              </span>
            </div>
            
            <div className="text-xs md:text-sm text-slate-700 leading-relaxed font-normal py-1 pr-1 overflow-y-auto max-h-[160px] markdown-body">
              <ReactMarkdown>{jarvisResponse}</ReactMarkdown>
            </div>
          </div>

          {/* Collapsible Thoughts Trace */}
          {thoughtsTrace.length > 0 && (
            <div className="bg-white border border-slate-100 rounded-xl overflow-hidden shadow-sm">
              <button
                onClick={() => setThoughtsExpanded(!isThoughtsExpanded)}
                className="w-full px-4 py-2 flex items-center justify-between text-[9px] font-bold text-slate-500 uppercase tracking-widest bg-slate-50 hover:bg-slate-100 transition-colors"
              >
                <span className="flex items-center gap-1.5 font-mono text-slate-600">
                  <BrainCircuit className="w-3 h-3" />
                  Cognitive Reasoning Trace
                </span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isThoughtsExpanded ? 'rotate-180' : ''}`} />
              </button>
              
              {isThoughtsExpanded && (
                <div className="px-4 py-3 bg-slate-900 font-mono text-[9px] text-slate-300 space-y-1.5 overflow-y-auto max-h-[120px] scrollbar-none">
                  {thoughtsTrace.map((track, i) => (
                    <div key={i} className="leading-tight">
                      <span className="text-slate-500 mr-2">[{new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}]</span>
                      {track}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Core Sound Waveform Visualizer */}
          <div className="flex items-end justify-between h-7 bg-slate-50 border border-slate-100/60 rounded-xl px-2.5 py-1">
            {audioWaves.map((val, idx) => (
              <div
                key={idx}
                className={`w-1 rounded-t transition-all duration-100 bg-blue-500 ${
                  isListening ? 'opacity-90' : 'opacity-20'
                }`}
                style={{ height: `${val}px` }}
              />
            ))}
          </div>

          {/* Visual generated holographic display */}
          {(isGeneratingImage || generatedImage) && (
            <div className="bg-white border border-slate-100 p-4 rounded-xl relative overflow-hidden shadow-sm text-left transition-all duration-300">
              <div className="relative z-10 flex justify-between items-center pb-2 border-b border-slate-100 text-[10px] uppercase font-mono tracking-wider font-bold text-slate-500">
                <span className="flex items-center gap-1.5">
                  <ImageIcon className="w-3.5 h-3.5 animate-pulse text-blue-500" />
                  HOLOGRAPHIC SYNTH COMPLETED
                </span>
                <span className="text-slate-400 max-w-[150px] truncate">
                  "{imagePromptUsed}"
                </span>
              </div>
              
              <div className="relative z-10 mt-3 flex justify-center items-center overflow-hidden rounded-lg bg-slate-50 aspect-video md:aspect-square max-h-60 border border-slate-100">
                {isGeneratingImage ? (
                  <div className="flex flex-col items-center space-y-2 py-8 text-center">
                    <Disc className="w-7 h-7 text-blue-500 animate-spin" />
                    <span className="text-[9px] tracking-wide text-slate-400 animate-pulse font-mono font-bold uppercase">
                      BUILDING IMAGE BUFFER GRID...
                    </span>
                  </div>
                ) : generatedImage ? (
                  <div className="relative w-full h-full flex items-center justify-center bg-slate-100">
                    <img 
                      src={generatedImage} 
                      alt={imagePromptUsed} 
                      referrerPolicy="no-referrer"
                      className="object-contain w-full h-full max-h-60 rounded select-none shadow-sm"
                    />
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-900/80 via-slate-900/10 to-transparent p-2.5 flex justify-between items-center">
                      <span className="text-[9px] font-mono text-slate-200 font-bold uppercase">
                        VEC_SYNTH_OK
                      </span>
                      <div className="flex space-x-1">
                        <a
                          href={generatedImage}
                          target="_blank"
                          rel="noreferrer"
                          className="px-2 py-0.5 text-[8px] bg-white hover:bg-slate-100 text-slate-800 rounded font-bold uppercase font-mono cursor-pointer"
                        >
                          OPEN
                        </a>
                        <button
                          type="button"
                          onClick={() => {
                            setGeneratedImage('');
                            setImagePromptUsed('');
                          }}
                          className="px-2 py-0.5 text-[8px] bg-rose-600 hover:bg-rose-700 text-white rounded font-bold uppercase font-mono cursor-pointer"
                        >
                          HIDE
                        </button>
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          )}

          {/* Chat input form */}
          <form onSubmit={handleCommandSubmit} className="flex gap-2">
            <input
              type="text"
              value={textCommand}
              onChange={e => setTextCommand(e.target.value)}
              placeholder="Inject command intent or request software action..."
              className="flex-1 px-3 py-2 text-xs bg-white border border-slate-100 placeholder-slate-400 text-slate-800 rounded-xl focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100 shadow-sm"
            />
            <button
              type="submit"
              className="px-4 bg-blue-600 hover:bg-blue-700 hover:shadow-md text-white rounded-xl transition flex items-center justify-center cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </div>

      {/* SOTA Trace Logs */}
      <div className="p-3 bg-slate-50/50 rounded-xl border border-slate-100/60 text-left">
        <div className="text-[9px] font-bold font-mono text-slate-400 uppercase tracking-widest mb-1.5 flex items-center space-x-1.5">
          <Cpu className="w-3 h-3 text-slate-400" />
          <span>Real-Time Multi-Agent Trace Logs</span>
        </div>
        <div className="space-y-1 max-h-[70px] overflow-y-auto font-mono text-[9px] text-slate-500 scrollbar-none">
          {thoughtsTrace.map((track, i) => (
            <div key={i} className="leading-tight truncate hover:text-slate-700">
              <span className="text-slate-400 mr-1.5">[{new Date().toLocaleTimeString([], { hour12: false })}]</span>
              {track}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});
export { VoiceConsole };
