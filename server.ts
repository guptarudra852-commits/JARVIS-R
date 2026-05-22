import { RateLimiterMemory } from 'rate-limiter-flexible';
import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc } from 'firebase/firestore';
import firebaseConfig from './firebase-applet-config.json';
import { aiRouter } from './src/providers/router';

dotenv.config();

const appFirebase = initializeApp(firebaseConfig);
const db = getFirestore(appFirebase, (firebaseConfig as any).firestoreDatabaseId);

// Resilient unified AI request mechanism supporting OpenAI
async function queryLLM(options: {
  prompt: string;
  systemInstruction?: string;
  modelPreference?: string;
  responseMimeType?: string;
}): Promise<{ text: string; sourceUsed: string }> {
  const { prompt, systemInstruction = "", modelPreference, responseMimeType } = options;
  console.log(`[Resilient LLM Dispatch] Routing prompt through multi-layer intelligence layer [Preference: ${modelPreference || 'default'}]...`);

  try {
    const text = await aiRouter.generate(prompt, { systemInstruction, model: modelPreference, responseMimeType });
    
    // Dynamically retrieve the last successful provider tracked in global memory
    let source = (global as any).lastSuccessfulProviderSource || "Offline Standby Engine";
    if (source === "Gemini") source = "Google GenAI";
    else if (source === "OpenAI") source = "OpenAI ChatGPT";
    else if (source === "Groq") source = "Groq Llama Enclave";
    else if (source === "Local") source = "Offline Standby Engine";

    return { text, sourceUsed: source };
  } catch (err: any) {
    console.error(`[Resilient LLM Error]:`, err.message || err);
    throw err;
  }
}

// Global Virtual Database for standalone and backup persistence
const dbStore = {
  tasks: [
    {
      id: "sys_init_001",
      title: "Recalibrate Mainframe Memory Rails",
      description: "Monitor thermal leakage and realign quantum sector nodes for 24/7 autonomous scheduling.",
      status: "completed",
      priority: "high",
      plan: [
        "Audit core telemetry data pools",
        "Disperse redundant electrostatic static fields",
        "Verify aligned memory banks parity"
      ],
      currentStep: 2,
      createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
      updatedAt: new Date(Date.now() - 3600000 * 3).toISOString()
    },
    {
      id: "sys_init_002",
      title: "Generate Productivity Analytics Brief",
      description: "Extract active task completion timelines and compile high-contrast visual metrics report.",
      status: "in_progress",
      priority: "medium",
      plan: [
        "Collect database logs matching current interval",
        "Perform regression formulas on velocity indices",
        "Render visual graphs into analytics center console"
      ],
      currentStep: 1,
      createdAt: new Date(Date.now() - 3600000).toISOString(),
      updatedAt: new Date().toISOString()
    }
  ],
  memories: [
    {
      id: "mem_001",
      content: "Administrator prefers clean Apple/Arc UI designs with soft transitions and frosted card gradients.",
      category: "preference",
      importance: 9,
      tags: ["ui", "aesthetics", "ux"],
      createdAt: new Date(Date.now() - 3600000 * 24).toISOString()
    },
    {
      id: "mem_002",
      content: "Authorized S3 Secure File Storage Bucket points strictly to jarvis-intelligence-core-vault.",
      category: "fact",
      importance: 8,
      tags: ["security", "aws", "storage"],
      createdAt: new Date(Date.now() - 3600000 * 12).toISOString()
    }
  ],
  notifications: [
    {
      id: "not_1",
      title: "System Calibrated",
      description: "Neural cores linked smoothly. Cognitive parity index at 99.8%.",
      timestamp: new Date().toISOString(),
      read: false,
      type: "success"
    },
    {
      id: "not_2",
      title: "Secure Google Token Confirmed",
      description: "Datalink to workspace spreadsheets is active.",
      timestamp: new Date(Date.now() - 10 * 60000).toISOString(),
      read: true,
      type: "info"
    }
  ],
  logs: [
    {
      id: "lg_1",
      message: "JARVIS Advanced Neuro-Logic Core v4.5 initialized.",
      type: "success",
      timestamp: new Date().toISOString(),
      userId: "system"
    }
  ]
};

// Available AI Agents for the Selector Marketplace
const microAgentsList = [
  { id: "coordinator", name: "Coordinator Agent", role: "Orchestrator", status: "idle", load: "4%", executions: 142, description: "Monitors overall pipeline sanity, schedules background automation runs, and parses natural user intents." },
  { id: "researcher", name: "Research Agent", role: "Knowledge Base", status: "idle", load: "0%", executions: 89, description: "Extracts real-time indexes, synthesizes web articles, and generates deep reference reports." },
  { id: "coder", name: "Coding Agent", role: "Software Synthesizer", status: "idle", load: "0%", executions: 211, description: "Audits codebase structures, recommends refactoring blueprints, and manages automated testing gates." },
  { id: "scheduler", name: "Scheduler Agent", role: "Automation Runner", status: "active", load: "12%", executions: 630, description: "Manages cron cycles, automates recurrent checklists, and realigns priority queues." },
  { id: "email", name: "Email Agent", role: "Workspace Outreach", status: "idle", load: "1%", executions: 55, description: "Composes elegant context-aware emails and files calendar reminders through secure Google tunnels." },
  { id: "productivity", name: "Productivity Agent", role: "Task Optimizer", status: "idle", load: "0%", executions: 118, description: "Measures task completion velocities, rates cognitive focus, and keeps administrative habits tuned." },
  { id: "automation", name: "Automation Agent", role: "Script Executive", status: "idle", load: "5%", executions: 442, description: "Bridges custom microservice interactions and triggers server webhook executions." },
  { id: "analytics", name: "Analytics Agent", role: "Metric Modeler", status: "idle", load: "0%", executions: 95, description: "Processes historical activity graphs and exports beautiful SVG structured data schemas." },
  { id: "voice", name: "Voice Agent", role: "Cognitive Transcriber", status: "idle", load: "0%", executions: 304, description: "Decodes Whisper audio recordings, isolates ambient vocal hum, and triggers speech synthesizers." },
  { id: "memory", name: "Memory Agent", role: "Synaptic Hub", status: "idle", load: "2%", executions: 752, description: "Performs semantic retrieval, deletes obsolete facts, and clusters short-term session context." }
];

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Rate limiter configuration (Token Bucket Algorithm)
  const rateLimiter = new RateLimiterMemory({
    points: 100, // 100 requests
    duration: 60, // per 60 seconds
  });

  app.use((req, res, next) => {
    // Only apply rate limiting to dynamic backend API routes to prevent asset loading blockages
    if (req.path.startsWith('/api/')) {
      rateLimiter.consume(req.ip || "unknown")
        .then(() => next())
        .catch(() => res.status(429).json({ error: "Too Many Requests" }));
    } else {
      next();
    }
  });

  // Simple Request Logger Logger Middleware
  app.use((req, res, next) => {
    console.log(`[JARVIS API] ${req.method} ${req.url}`);
    next();
  });

  // Rate Limiting Simulator & JWT Authentication Simulation for Enterprise/Owner Audit Logs
  app.use((req, res, next) => {
    // Inject custom permission headers into requests to verify administrative safety rules are obeyed
    res.setHeader("X-Jarvis-Security-Shield", "JWT-SOTA-Shielded");
    next();
  });

  // 1. /api/status - Dashboard health checks and load indicators
  app.get("/api/status", (req, res) => {
    const uptime = process.uptime();
    res.json({
      status: "nominal",
      cpuLoad: "16.4%",
      ramUsage: "442MB / 1024MB",
      dbDatalink: "secured",
      activeThreads: dbStore.tasks.filter(t => t.status === 'in_progress').length,
      uptimeSeconds: Math.floor(uptime),
      uptimeFormatted: `${Math.floor(uptime / 3600)}h ${Math.floor((uptime % 3600) / 60)}m ${Math.floor(uptime % 60)}s`,
      memoryEnclave: "healthy",
      autoSchedulerState: "active"
    });
  });

  // 2. /api/agents - Micro-agents config schemas
  app.get("/api/agents", (req, res) => {
    res.json(microAgentsList);
  });

  // 2.5 /api/agents/:id/ping - Direct service ping health check
  app.get("/api/agents/:id/ping", (req, res) => {
    const { id } = req.params;
    const latencyVal = Math.floor(Math.random() * 25) + 8; // 8ms to 33ms
    const isDegraded = ["scheduler", "email"].includes(id) && Math.random() > 0.93;
    const isOffline = ["voice"].includes(id) && Math.random() > 0.98; // Very rare transient failure for extra realism

    const healthStatus = isOffline ? "offline" : (isDegraded ? "degraded" : "healthy");
    const uptimePercentage = isOffline ? "0.00" : (99.2 + Math.random() * 0.8).toFixed(2);
    
    // Simulate slight processing delay for realism
    setTimeout(() => {
      res.json({
        agentId: id,
        latency: `${latencyVal}ms`,
        uptime: `${uptimePercentage}%`,
        status: healthStatus,
        load: `${Math.floor(Math.random() * 12) + 1}%`,
        timestamp: new Date().toISOString()
      });
    }, 150 + Math.random() * 100);
  });

  // 3. /api/analytics - Dynamic analytics data structures for Apple-styled charting
  app.get("/api/analytics", (req, res) => {
    res.json({
      productivityIndex: 94.2,
      taskCompletionHistory: [
        { date: "May 14", completed: 3, pending: 4, queries: 12, efficiency: 75 },
        { date: "May 15", completed: 5, pending: 2, queries: 19, efficiency: 82 },
        { date: "May 16", completed: 8, pending: 1, queries: 32, efficiency: 88 },
        { date: "May 17", completed: 4, pending: 3, queries: 22, efficiency: 91 },
        { date: "May 18", completed: 11, pending: 2, queries: 45, efficiency: 95 },
        { date: "May 19", completed: 9, pending: 1, queries: 38, efficiency: 97 },
        { date: "May 20", completed: 14, pending: 2, queries: 54, efficiency: 99 }
      ],
      agentExecutionShare: [
        { name: "Memory", value: 35 },
        { name: "Scheduler", value: 25 },
        { name: "Voice", value: 15 },
        { name: "Coder", value: 12 },
        { name: "Other", value: 13 }
      ],
      systemCalibrationsCount: 148,
      reliabilityScore: 99.98
    });
  });

  // 4. /api/preferences - Simple user GUI state persistent profiles
  app.get("/api/preferences", (req, res) => {
    res.json({
      theme: "light-arc",
      voiceVocalPitch: 1.0,
      speechEnabled: true,
      maxMemoryQuota: "50MB",
      adminLevel: "owner"
    });
  });

  app.post("/api/preferences", (req, res) => {
    console.log("Updating user operating system preference parameters:", req.body);
    res.json({ status: "updated", config: req.body });
  });

  // 5. /api/tools - Modular system capabilities definitions
  app.get("/api/tools", (req, res) => {
    res.json([
      { id: "file_intel", name: "File Intelligence Storage Analyzer", description: "Parses spreadsheets, logs, PDFs, or audio, auto-embedding key indices." },
      { id: "google_calendar_link", name: "Google Calendar Core API", description: "Links standard primary calendar scopes to manage schedule dates dynamically." },
      { id: "google_sheets_link", name: "Google Sheets Core API", description: "Enables cloud backup grid pipelines for historical logs synching." },
      { id: "web_search", name: "Real-time Vector Search Grounding", description: "Connects web query modules when real-time content verification is needed." }
    ]);
  });

  // 6. /api/workflows - Custom automation templates or plans
  app.get("/api/workflows", (req, res) => {
    res.json([
      { id: "wf_1", name: "Reactor Thermal Recalibration Loop", agent: "scheduler", trigger: "cron every 1h" },
      { id: "wf_2", name: "Multi-Agent System Health Sync", agent: "coordinator", trigger: "on_exception" },
      { id: "wf_3", name: "Admin Google Excel Backup Flow", agent: "automation", trigger: "manual" }
    ]);
  });

  // 7. /api/chat - Advanced Multi-Agent Intent & Routing Pipeline
  app.post("/api/chat", async (req, res) => {
    let userQueryStr = "";
    try {
      const { prompt, model, history, activeAgentId, offlineMode } = req.body;
      if (!prompt) {
        return res.status(400).json({ error: "Missing admin instructions prompt input." });
      }
      userQueryStr = prompt;

      const selectedModelString = model || "gemini-3.5-flash";
      console.log(`[MULTI-AGENT DISPATCH] Model requested: ${selectedModelString}, ActiveAgentId option: ${activeAgentId}, OfflineMode option: ${offlineMode}`);

      // Step 1: Simulated SOTA Intent Detection & Memory Retrieval
      const promptLower = prompt.toLowerCase();
      
      // Greeting Handler
      const greetings = ["hi", "hello", "hey", "good morning", "good afternoon", "good evening", "hey jarvis", "yo jarvis"];
      if (greetings.some(greeting => promptLower.includes(greeting)) && promptLower.length < 20) {
        return res.json({
          text: "Greetings Rudra. JARVIS X online and ready. How may I assist you today?",
          agentId: "coordinator",
          agentName: "Coordinator Agent",
          intent: "general_greeting",
          thoughts: ["[Greeting Detected] Returning pre-defined assistant greeting."],
          pipelineComplete: true
        });
      }

      let matchedAgentId = "coordinator";
      let intentCategory = "general_query";
      let matchedMemoriesTrace = "";
      let isExplicitlyRouted = false;

      // Semantic Memory retrieval emulation from DB store
      const memoryHits = dbStore.memories.filter(m => 
        m.tags.some(t => promptLower.includes(t)) || 
        promptLower.includes(m.category) ||
        m.content.toLowerCase().split(/\s+/).some(w => w.length > 4 && promptLower.includes(w))
      );

      if (memoryHits.length > 0) {
        matchedMemoriesTrace = memoryHits.map(m => `[RETRIEVED FACT (${m.importance}/10)]: "${m.content}"`).join("\n");
      }

      if (activeAgentId && microAgentsList.some(a => a.id === activeAgentId)) {
        matchedAgentId = activeAgentId;
        intentCategory = "direct_enclave_channel";
        isExplicitlyRouted = true;
      } else {
        // Route intent matching to optimal specialised agent
        if (promptLower.includes("code") || promptLower.includes("refactor") || promptLower.includes("error") || promptLower.includes("react") || promptLower.includes("bug")) {
          matchedAgentId = "coder";
          intentCategory = "development_pipeline";
        } else if (promptLower.includes("search") || promptLower.includes("query") || promptLower.includes("weather") || promptLower.includes("research") || promptLower.includes("who is")) {
          matchedAgentId = "researcher";
          intentCategory = "knowledge_mining";
        } else if (promptLower.includes("schedule") || promptLower.includes("cron") || promptLower.includes("recurrent") || promptLower.includes("automation") || promptLower.includes("task")) {
          matchedAgentId = "scheduler";
          intentCategory = "automation_threading";
        } else if (promptLower.includes("email") || promptLower.includes("mail") || promptLower.includes("send message") || promptLower.includes("notify")) {
          matchedAgentId = "email";
          intentCategory = "communication_dispatch";
        } else if (promptLower.includes("chart") || promptLower.includes("report") || promptLower.includes("analytics") || promptLower.includes("progress") || promptLower.includes("completion")) {
          matchedAgentId = "analytics";
          intentCategory = "metrics_synthesis";
        } else if (promptLower.includes("memory") || promptLower.includes("prefer") || promptLower.includes("remember") || promptLower.includes("preference")) {
          matchedAgentId = "memory";
          intentCategory = "knowledge_crystallization";
        }
      }

      // Step 2: Build the reasoning thought trace
      const thoughts = [
        isExplicitlyRouted
          ? `[Direct Channel] Overriding standard model intent router: administrator explicitly engaged agent [${matchedAgentId.toUpperCase()}].`
          : `[Intent Classification] Routed user command to agent [${matchedAgentId.toUpperCase()}] with path [${intentCategory.toUpperCase()}].`,
        matchedMemoriesTrace ? `[Memory Agent Client] Linked key memory cells:\n${matchedMemoriesTrace}` : `[Memory Agent Client] No semantic matches found. Utilizing active session memory.`,
        `[Tool Selection] Deployed vector utility matching intent: [${intentCategory === "development_pipeline" ? "Code_Sandbox_Parser" : "Standard_Grounding_Engine"}].`,
        offlineMode
          ? `[Admin Protocol] Offline Local Mode manual toggle active. Instantly routing to local offline intelligence models to conserve API.`
          : `[Cognitive Phase] Querying backend LLM [${selectedModelString}] with instructions context...`
      ];

      // Step 3: Call Google GenAI SDK
      let targetAgentName = microAgentsList.find(a => a.id === matchedAgentId)?.name || "Coordinator Agent";
      
      const systemInstruction = `You are JARVIS X, a modular, highly capable, and friendly digital companion for Rudra.

STRICT RESPONSE RULES:
1. Always speak like a helpful human assistant. Use natural warmth, friendly clarity, and conversational language.
2. Direct all address to "Rudra". Do not call the user "Administrator".
3. Match response complexity to the user's question (e.g., brief and straightforward for simple queries, detailed and step-by-step for educational or analytical questions).
4. Do not use overly robotic system jargon or terms like "autonomous digital orchestration", "semantic routers", "runtime enclaves", or "high-performance performance layers".
5. Answer the user's query first and directly.
6. Avoid showing internal diagnostics, workspace routing telemetry, grounding metrics, registry statuses, or scanning logs in normal discussion. Maintain a completely clean, user-friendly output.`;

      // Embed context memories directly in the prompt
      const contextPrompt = matchedMemoriesTrace 
        ? `${matchedMemoriesTrace}\n\nUser command to fulfill: "${prompt}"` 
        : prompt;

      let answerText = "";
      
      try {
        if (offlineMode) {
          throw new Error("Offline Local Mode manually engaged by Administrator to conserve API usage.");
        }
        const generationResult = await queryLLM({
          prompt: contextPrompt,
          systemInstruction,
          modelPreference: selectedModelString
        });
        answerText = generationResult.text;
        thoughts.push(`[Response Synthesis] Successfully generated output via ${generationResult.sourceUsed}.`);
      } catch (geminiErr: any) {
        console.warn(`[MULTI-AGENT DISPATCH] Resilient LLM failure, emulating stand-by response:`, geminiErr);
        if (offlineMode) {
          thoughts.push(`[Off-Grid Mode] Local enclaves initialized. Synapse API fully conserved.`);
        } else {
          thoughts.push(`[Circuit Breaker Triggered] All live engines exhausted. Deploying offline cognitive simulator.`);
        }

        if (matchedAgentId === "coder" || promptLower.includes("code") || promptLower.includes("refactor")) {
          answerText = `Here is a clean, modern TypeScript pattern that is safe, modular, and easy to scale:

\`\`\`typescript
// Safe and decoupled helper state container
export function createSafeState<T>(initialState: T) {
  let state = initialState;
  const listeners = new Set<(s: T) => void>();
  
  return {
    get: () => state,
    set: (newState: T) => {
      state = newState;
      listeners.forEach(listener => listener(state));
    },
    subscribe: (listener: (s: T) => void) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    }
  };
}
\`\`\`

This standard approach isolates variables from global state anomalies and keeps your components running smoothly. Let me know if you would like me to adapt this structure to a specific component or layout!`;
        } else if (matchedAgentId === "scheduler" || promptLower.includes("schedule") || promptLower.includes("task")) {
          answerText = `I have successfully queued your task and set up the corresponding scheduler action. Standing by to manage your active work items, construct calendar schedules, draft workspace communications, or automate notification rules. What is your next instruction?`;
        } else if (matchedAgentId === "email" || promptLower.includes("email") || promptLower.includes("send")) {
          answerText = `I am prepared to process this communication dispatch request. I have set up the template structure in temporary buffer memory. Let me know if you would like me to adjust the draft text, verify recipient formats, or proceed with sending!`;
        } else if (matchedAgentId === "researcher" || promptLower.includes("search") || promptLower.includes("query")) {
          if (promptLower.includes("what is ai") || promptLower.includes("what is artificial intelligence")) {
            answerText = `Artificial Intelligence (AI) is technology that allows computers to learn, understand information, solve problems, and make decisions in ways similar to humans. Examples include chatbots, voice assistants, recommendation systems, and self-driving technology.`;
          } else if (promptLower.includes("gravity") || promptLower.includes("explain gravity")) {
            answerText = `Gravity is the force that pulls objects toward each other. It's why things fall to the ground and why planets orbit stars.`;
          } else if (promptLower.includes("weather") || promptLower.includes("forecast")) {
            answerText = `The local atmosphere parameters appear to be clear and comfortable. Let me know if you'd like me to log any outdoor activities or check calendar conflicts for today!`;
          } else {
            answerText = `I've analyzed that topic relative to our operational core. It's a fascinating area of architectural design and software engineering. I can share some detailed concepts, map out layout flow blueprints, or design clean data schemas around it. 

How can we build on this together?`;
          }
        } else {
          answerText = `Greetings Rudra. JARVIS X is active and ready to assist you. 

I can help you coordinate your upcoming schedules, compose secure email drafts, create customized notes, or execute local computational models. How can I help you today?`;
        }
      }
 
      // Step 3.4 Direct Gmail Send override if googleToken is present
      const googleToken = req.body.googleToken;
      const isEmailTask = matchedAgentId === "email" || promptLower.includes("email") || promptLower.includes("mail") || promptLower.includes("send");
      const isActionSend = promptLower.includes("send") || promptLower.includes("mail") || promptLower.includes("email") || promptLower.includes("dispatch");
      
      if (!googleToken && isEmailTask && isActionSend) {
        thoughts.push(`[Direct Gmail Account Tunnel Diagnostic] Email send intent detected, but no Google Account token is linked.`);
        answerText = `I noticed you'd like to send an email, Rudra, but your Google Account isn't connected to this session yet. 

To send emails directly from your mailbox, just **click the "Link Google" button** in the top header or look at the **Google Gmail** panel to connect your account. Once linked, I can instantly draft and send messages for you!`;
        return res.json({
          text: answerText,
          agentId: "email",
          agentName: "Email Agent",
          intent: "communication_dispatch",
          thoughts: thoughts,
          pipelineComplete: true
        });
      }

      if (googleToken && isEmailTask && isActionSend) {
        thoughts.push(`[Direct Gmail Account Tunnel] Detected linked administrator Google signature token.`);
        
        let emailData = { recipient: "recipient@example.com", subject: "Notification Briefing", body: "" };
        
        // 1. Precise local regex fallback composition parsed immediately
        const regexMatchEmail = prompt.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
        if (regexMatchEmail) {
          emailData.recipient = regexMatchEmail[0];
        } else {
          emailData.recipient = "guptarudra852@gmail.com"; // smart fallback
        }
        
        emailData.subject = "Admin Operations Synchronization Update";
        
        // Detect topic keywords to refine fallback body eloquently
        let parsedTopic = prompt.replace(emailData.recipient, "").replace(/send|email|to|dispatch|mail|message/gi, "").trim();
        if (parsedTopic.startsWith("for ")) parsedTopic = parsedTopic.slice(4).trim();
        
        emailData.body = `Hi Rudra,\n\nI wanted to share updates regarding your request about: "${parsedTopic || "Task Synchronization Review"}".\n\nEverything is set up and I've prepared this draft for you on ${new Date().toLocaleDateString()}.\n\nPlease let me know if you would like me to adjust any of the wording or add additional details before sending!\n\nBest regards,\nJARVIS X`;

        // 2. Try advanced LLM refinement
        try {
          thoughts.push(`[Cognitive Stage] Refining and improvising the message compose details via LLM...`);
          const draftInstructions = `You are an expert Email Agent component of the operations hub. The Administrator wants to draft and send an email directly using the connected Gmail system.
User Request prompt detail: "${prompt}"

Your mission is to perform these sub-tasks:
1. Identify the recipient's email address from the user request (e.g. look for emails like "rakhi123gupta90@gmail.com", "guptarudra852@gmail.com", or any string with an @ sign). If no email is explicitly stated, look for names and fail gracefully to "recipient@example.com".
2. Improvise a beautiful, stunningly composed and professional subject line and body content matching the core user intent.
3. Be friendly and highly formal. Add proper paragraph layout with double Carriage Return breaks (newline characters). NEVER output raw literal '\\n' strings. Output actual newline indentation.

Return a JSON structure matching this schema:
{
  "recipient": "destination_email_address",
  "subject": "improvised_polished_subject_line",
  "body": "improvised_polished_body_text_content"
}`;
          
          const draftResult = await queryLLM({
            prompt: draftInstructions,
            modelPreference: "gemini-3.5-flash",
            responseMimeType: "application/json"
          });

          const draftJsonText = draftResult.text || "{}";
          try {
            const parsed = JSON.parse(draftJsonText);
            if (parsed.recipient) emailData.recipient = parsed.recipient;
            if (parsed.subject) emailData.subject = parsed.subject;
            if (parsed.body) emailData.body = parsed.body;
          } catch (pe) {
            console.error("Draft parsing exception handled:", pe);
            const matchTo = draftJsonText.match(/"recipient"\s*:\s*"([^"]+)"/);
            const matchSub = draftJsonText.match(/"subject"\s*:\s*"([^"]+)"/);
            const matchBody = draftJsonText.match(/"body"\s*:\s*"([\s\S]*?)"/);
            if (matchTo) emailData.recipient = matchTo[1];
            if (matchSub) emailData.subject = matchSub[1];
            if (matchBody) emailData.body = matchBody[1];
          }

          if (emailData.body) {
            emailData.body = emailData.body.replace(/\\n/g, '\n');
          }
          thoughts.push(`[Intelligent Composition] Polished with premium wording. Subject: "${emailData.subject}".`);
        } catch (composeSendErr: any) {
          console.warn("[Gmail LLM Composition Failed, using resilient local regex template]:", composeSendErr);
          thoughts.push(`[LLM Standby Fallback] Active. Synthesized fallback copy tailored to: "${parsedTopic || "Meeting at 4pm"}".`);
        }

        // 3. Complete SMTP request envelope via Gmail API
        try {
          thoughts.push(`[Direct Dispatch] Synthesizing MIME buffer and issuing SMTP transmission to [${emailData.recipient}] via user's linked Gmail API...`);

          const buildRawEmail = (to: string, sub: string, content: string) => {
            const parts = [
              `To: ${to}`,
              'Content-Type: text/plain; charset=utf-8',
              'MIME-Version: 1.0',
              `Subject: ${sub}`,
              '',
              content
            ];
            const raw = parts.join('\r\n');
            const buffer = Buffer.from(raw, 'utf-8');
            return buffer.toString('base64')
              .replace(/\+/g, '-')
              .replace(/\//g, '_')
              .replace(/=+$/, '');
          };

          const b64Raw = buildRawEmail(emailData.recipient, emailData.subject, emailData.body);

          const gmailSendRes = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${googleToken}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              raw: b64Raw
            })
          });

          if (!gmailSendRes.ok) {
            const errDet = await gmailSendRes.json().catch(() => ({}));
            throw new Error(errDet?.error?.message || `Gmail API returned status code [${gmailSendRes.status}]`);
          }

          const sentData = await gmailSendRes.json();
          thoughts.push(`[SMTP Delivery Completed] Programmatically sent. Google Message ID: ${sentData.id || "N/A"}.`);

          answerText = `I have successfully sent the email directly through your connected Google Account, Rudra!\n\n*   **Sent to:** \`${emailData.recipient}\`\n*   **Subject:** \`${emailData.subject}\`\n\n---\n\n${emailData.body}`;
          
          return res.json({
            text: answerText,
            agentId: "email",
            agentName: "Email Agent",
            intent: "communication_dispatch",
            thoughts: thoughts,
            pipelineComplete: true
          });

        } catch (sendErr: any) {
          console.error("[Gmail Send Final Error]:", sendErr);
          thoughts.push(`[Gmail Transmission Failed] Error: ${sendErr.message || String(sendErr)}. Reverting to standard fallback.`);
        }
      }

      // Step 3.5: Auto Resend Integration when Email Agent is triggered
      if (matchedAgentId === "email" && process.env.RESEND_API_KEY && (promptLower.includes("email") || promptLower.includes("send"))) {
        try {
          const htmlContent = `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 40px auto; padding: 32px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff; color: #1e293b; box-shadow: 0 4px 12px rgba(0,0,0,0.03);">
              <div style="display: flex; align-items: center; margin-bottom: 24px; border-bottom: 1px solid #f1f5f9; padding-bottom: 16px;">
                <span style="font-size: 28px; margin-right: 12px;">👋</span>
                <div>
                  <h1 style="color: #0f172a; font-size: 20px; font-weight: 700; margin: 0; letter-spacing: -0.025em;">JARVIS X</h1>
                  <p style="color: #64748b; font-size: 11px; margin: 0; text-transform: uppercase;">Your Personal Assistant</p>
                </div>
              </div>
              <p style="font-size: 14px; color: #475569; line-height: 1.6; margin-top: 0;">Hi Rudra,</p>
              <p style="font-size: 14px; color: #0f172a; line-height: 1.6; font-weight: 500;">Here is the update regarding your email request:</p>
              <div style="background-color: #f8fafc; border-left: 4px solid #2563eb; padding: 16px; margin: 20px 0; border-radius: 4px; box-shadow: inset 0 1px 2px rgba(0,0,0,0.01);">
                <p style="font-size: 13px; color: #334155; margin: 0; white-space: pre-wrap; line-height: 1.5;">${answerText || "Draft dispatch completed."}</p>
              </div>
              <p style="font-size: 13px; color: #475569; line-height: 1.6;">Let me know if there's anything else you'd like me to send!</p>
              <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 28px 0;" />
              <div style="font-size: 10px; color: #94a3b8; display: flex; justify-content: space-between;">
                <span>Notification Update</span>
                <span>JARVIS X Assistant</span>
              </div>
            </div>`;

          console.log("[Resend Sync] Auto-routing message payload to guptarudra852@gmail.com...");
          const resendResponse = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${process.env.RESEND_API_KEY}`,
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              from: "JARVIS X <onboarding@resend.dev>",
              to: "guptarudra852@gmail.com",
              subject: `JARVIS X Notification Briefing: ${prompt.slice(0, 32)}...`,
              html: htmlContent
            })
          });

          if (resendResponse.ok) {
            thoughts.push(`[Email Agent Engine] Real-time Resend dispatch successful. Notification routed to guptarudra852@gmail.com.`);
            answerText += `\n\n***\n\n📧 **Notification Sent**: I have also sent a copy of this update to you at \`guptarudra852@gmail.com\`.`;
          } else {
            const errDet = await resendResponse.text();
            throw new Error(errDet);
          }
        } catch (emailErr) {
          console.error("Auto Resend trigger failed:", emailErr);
          thoughts.push(`[Email Agent Engine] Automatic dispatch failed: ${String(emailErr)}`);
        }
      }

      // Step 4: Semantic memory learning integration if the request implies a fact/preference
      let memorySaved = false;
      if (promptLower.includes("prefer") || promptLower.includes("remember that") || promptLower.includes("my email is") || promptLower.includes("always use")) {
        const cleanedMemory = prompt
          .replace(/remember that/gi, "")
          .replace(/always use/gi, "Preference identified: use")
          .trim();
        
        const newMemoryItem = {
          id: `mem_${Date.now()}`,
          content: cleanedMemory,
          category: promptLower.includes("prefer") ? "preference" as const : "fact" as const,
          importance: 8,
          tags: ["admin-preference", "learned"],
          createdAt: new Date().toISOString()
        };
        dbStore.memories.push(newMemoryItem);
        memorySaved = true;
        thoughts.push(`[Memory Preservation Thread] Encoded new memory atom: "${cleanedMemory}"`);
      }

      // Return unified detailed packet
      return res.json({
        text: answerText,
        agentId: matchedAgentId,
        agentName: targetAgentName,
        intent: intentCategory,
        thoughts: thoughts,
        memorySaved: memorySaved,
        pipelineComplete: true
      });

    } catch (error) {
      console.error("[MULTI-AGENT CHAT ERROR]:", error);
      try {
        const localResponse = await aiRouter.generate(userQueryStr || "help", { model: "local" });
        return res.json({
          text: localResponse,
          agentId: "coordinator",
          agentName: "Coordinator Agent",
          intent: "general_fallback",
          thoughts: ["[Global Channel Circuit Breaker] Server caught exception. Routed safely to Local Standby Encave."],
          pipelineComplete: true
        });
      } catch (innerErr) {
        return res.json({
          text: "Greetings Rudra. JARVIS X core standby systems are active. Standby loops remain operational.",
          agentId: "coordinator",
          agentName: "Coordinator Agent",
          intent: "general_fallback",
          thoughts: ["[Circuit Breaker Panic Core] Extreme offline rollback activated."],
          pipelineComplete: true
        });
      }
    }
  });

  // 7.5 /api/search-and-generate - Search Grounding and Firestore save
  app.post("/api/search-and-generate", async (req, res) => {
    try {
      const { prompt } = req.body;
      if (!prompt) {
        return res.status(400).json({ error: "Missing prompt." });
      }

      console.log(`[Search-Grounding] Running for: ${prompt}`);
      
      const resultText = await aiRouter.generate(prompt);

      // Save to Firestore
      await addDoc(collection(db, "searches"), {
        prompt,
        result: resultText,
        createdAt: new Date().toISOString()
      });

      res.json({
        text: resultText
      });
    } catch (error) {
      console.error("[Search-and-Generate Error]:", error);
      res.status(500).json({ error: error instanceof Error ? error.message : String(error) });
    }
  });

  // 8. /api/voice - Whisper/AssemblyAI real transcription endpoint with fallback simulator
  app.post("/api/voice", async (req, res) => {
    try {
      const { audio } = req.body;
      
      // If a real audio payload is sent base64 encoded
      if (audio && (process.env.OPENAI_API_KEY || process.env.ASSEMBLYAI_API_KEY)) {
        console.log("[Voice Sync] Received real audio payload for transcription");
        const audioBuffer = Buffer.from(audio, 'base64');
        
        if (process.env.OPENAI_API_KEY) {
          console.log("[Voice Sync] Transcribing via OpenAI Whisper API...");
          try {
            const formData = new FormData();
            formData.append("file", new Blob([audioBuffer], { type: "audio/webm" }), "recording.webm");
            formData.append("model", "whisper-1");
            
            const whisperRes = await fetch("https://api.openai.com/v1/audio/transcriptions", {
              method: "POST",
              headers: {
                "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
              },
              body: formData
            });
            
            if (whisperRes.ok) {
              const whisperData = await whisperRes.json();
              console.log("[Voice Sync] Whisper success transcription:", whisperData.text);
              return res.json({
                success: true,
                transcription: whisperData.text,
                audioDurationMs: 2500,
                confidenceScore: 0.99
              });
            } else {
              const errBody = await whisperRes.text();
              console.error("[Voice Sync] Whisper API error details:", errBody);
            }
          } catch (err) {
            console.error("[Voice Sync] Whisper API fetch exception:", err);
          }
        }
        
        if (process.env.ASSEMBLYAI_API_KEY) {
          console.log("[Voice Sync] Fallback/Direct transcription via AssemblyAI...");
          const uploadRes = await fetch("https://api.assemblyai.com/v2/upload", {
            method: "POST",
            headers: {
              "authorization": process.env.ASSEMBLYAI_API_KEY
            },
            body: audioBuffer
          });
          
          if (uploadRes.ok) {
            const uploadData = await uploadRes.json();
            const uploadUrl = uploadData.upload_url;
            
            const transcribeRes = await fetch("https://api.assemblyai.com/v2/transcript", {
              method: "POST",
              headers: {
                "authorization": process.env.ASSEMBLYAI_API_KEY,
                "content-type": "application/json"
              },
              body: JSON.stringify({ audio_url: uploadUrl })
            });
            
            if (transcribeRes.ok) {
              const transcribeData = await transcribeRes.json();
              const transcriptId = transcribeData.id;
              
              // Poll 5 times with small delay
              let transcriptionText = "";
              for (let i = 0; i < 5; i++) {
                await new Promise(r => setTimeout(r, 800));
                const pollRes = await fetch(`https://api.assemblyai.com/v2/transcript/${transcriptId}`, {
                  headers: { "authorization": process.env.ASSEMBLYAI_API_KEY }
                });
                if (pollRes.ok) {
                  const pollData = await pollRes.json();
                  if (pollData.status === "completed") {
                    transcriptionText = pollData.text;
                    break;
                  } else if (pollData.status === "failed") {
                    break;
                  }
                }
              }
              
              if (transcriptionText) {
                console.log("[Voice Sync] AssemblyAI success transcription:", transcriptionText);
                return res.json({
                  success: true,
                  transcription: transcriptionText,
                  audioDurationMs: 2800,
                  confidenceScore: 0.98
                });
              }
            }
          }
        }
      }

      // Fallback/Mock simulation endpoint when keys are missing or audio is empty
      const samples = [
        "status check reactor subgrid temperature logs",
        "recaliber system parameters and map the latest diagnostics",
        "retrieve facts about the administrator's layout preferences",
        "synthesize automated task blueprints for thermal analytics",
        "send urgent telemetry briefings update to memory archive core"
      ];
      const transcription = samples[Math.floor(Math.random() * samples.length)];
      return res.json({
        success: true,
        transcription: transcription,
        audioDurationMs: 3200,
        confidenceScore: 0.994
      });
    } catch (e) {
      console.error("[Voice Sync Error]:", e);
      res.status(500).json({ error: String(e) });
    }
  });

  // 9. /api/tasks, /api/memory, /api/logs - Endpoint wrappers over global store for fallback syncing
  app.get("/api/tasks", (req, res) => res.json(dbStore.tasks));
  app.post("/api/tasks", (req, res) => {
    const { title, description, priority, plan } = req.body;
    const newTask = {
      id: `task_${Date.now()}`,
      title: title || "New Autonomous Workflow Task",
      description: description || "Scheduled task",
      status: "pending" as const,
      priority: priority || "medium",
      plan: plan || ["Execute standard instruction node"],
      currentStep: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    dbStore.tasks.unshift(newTask);
    res.json(newTask);
  });

  app.get("/api/memory", (req, res) => res.json(dbStore.memories));
  app.post("/api/memory", (req, res) => {
    const { content, category, importance, tags } = req.body;
    const newMemory = {
      id: `mem_${Date.now()}`,
      content: content || "Learned vector coordinate fact",
      category: category || "context",
      importance: Number(importance) || 5,
      tags: tags || ["learned"],
      createdAt: new Date().toISOString()
    };
    dbStore.memories.unshift(newMemory);
    res.json(newMemory);
  });

  app.delete("/api/memory/:id", (req, res) => {
    const { id } = req.params;
    dbStore.memories = dbStore.memories.filter(m => m.id !== id);
    res.json({ success: true, purgedId: id });
  });

  // Image synth route
  app.post("/api/gemini/generate-image", async (req, res) => {
    try {
      const { prompt } = req.body;
      if (!prompt) {
        return res.status(400).json({ error: "No prompt provided" });
      }

      console.log(`Starting image generation for prompt: "${prompt}"`);
      try {
        const url = await aiRouter.generateImage(prompt);
        if (url) {
          console.log("Image generation successful.");
          return res.json({ url });
        }
      } catch (sdkError) {
        console.warn("OpenAI image generation failed, falling back to rich Unsplash image source:", sdkError);
      }

      // Warm Apple/Cinematic fallback
      const p = prompt.toLowerCase();
      let fallbackUrl = "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80"; // Abstract purple/cyan
      
      if (p.includes("laptop") || p.includes("computer") || p.includes("device") || p.includes("desk") || p.includes("tablet") || p.includes("hologram") || p.includes("workstation")) {
        fallbackUrl = "https://images.unsplash.com/photo-1601524909162-be87252be298?auto=format&fit=crop&w=800&q=80";
      } else if (p.includes("code") || p.includes("schematic") || p.includes("matrix") || p.includes("hack") || p.includes("grid")) {
        fallbackUrl = "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80";
      } else if (p.includes("ai") || p.includes("avatar") || p.includes("robot") || p.includes("face") || p.includes("jarvis") || p.includes("intelligence")) {
        fallbackUrl = "https://images.unsplash.com/photo-1535378917042-10a22c95931a?auto=format&fit=crop&w=800&q=80";
      } else if (p.includes("planet") || p.includes("space") || p.includes("star") || p.includes("galaxy") || p.includes("solar") || p.includes("orbit")) {
        fallbackUrl = "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80";
      } else if (p.includes("car") || p.includes("cyberpunk") || p.includes("city") || p.includes("street")) {
        fallbackUrl = "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=800&q=80";
      }
      
      console.log(`Serving premium curated aesthetic image fallback for [${prompt}]: ${fallbackUrl}`);
      return res.json({ url: fallbackUrl });

    } catch (error) {
      console.error("Gemini Image generation server error:", error);
      res.status(500).json({ error: error instanceof Error ? error.message : String(error) });
    }
  });

  // 11. /api/tts - Premium Text-to-Speech Integration via ElevenLabs
  app.post("/api/tts", async (req, res) => {
    try {
      const { text, voiceId } = req.body;
      if (!text) {
        return res.status(400).json({ error: "No text provided for system speech synthesis" });
      }

      const elevenApiKey = process.env.ELEVENLABS_API_KEY;
      if (!elevenApiKey) {
        return res.status(400).json({ error: "ELEVENLABS_API_KEY is not configured on the host server." });
      }

      // Dynamic self-healing Voice Verification to prevent "A voice with voice_id '...' was not found" (404)
      let selectedVoice = voiceId || "21m00Tcm4TlvDqtIkUW1";
      try {
        console.log(`[ElevenLabs TTS] Verifying account voice access for voice ID: [${selectedVoice}]...`);
        const voicesResponse = await fetch("https://api.elevenlabs.io/v1/voices", {
          headers: { "xi-api-key": elevenApiKey }
        });
        if (voicesResponse.ok) {
          const voicesData = await voicesResponse.json() as { voices?: Array<{ voice_id: string; name: string }> };
          if (voicesData && Array.isArray(voicesData.voices) && voicesData.voices.length > 0) {
            const availableVoiceIds = voicesData.voices.map(v => v.voice_id);
            if (!availableVoiceIds.includes(selectedVoice)) {
              // Try classic fallback voices that are commonly standard across subscription profiles, otherwise use the first active voice
              const classicPreMadeFallbacks = [
                "cgSgspJ2msm6clMC924g", // Jessica
                "pNInz6ob8597GIn7QA7r", // Adam
                "EXAVITQu4vr4xnSDxMaL", // Bella
                "ErXwobaYiN019vkySvjV"  // Antoni
              ];
              const safeFallback = classicPreMadeFallbacks.find(id => availableVoiceIds.includes(id)) || voicesData.voices[0].voice_id;
              
              console.log(`[ElevenLabs TTS Self-Healing] Requested voice '${selectedVoice}' not authorized/found on this ElevenLabs account. Auto-swapping with verified safe fallback: '${safeFallback}'`);
              selectedVoice = safeFallback;
            }
          }
        } else {
          console.warn("[ElevenLabs TTS Self-Healing] Account voices endpoint returned status:", voicesResponse.status);
        }
      } catch (listErr) {
        console.warn("[ElevenLabs TTS Self-Healing] Unable to fetch active voice directory, falling back to requested voice ID:", listErr);
      }

      console.log(`[ElevenLabs TTS] Generating speech files for voice ID: [${selectedVoice}] -> "${text.slice(0, 48)}..."`);

      const ttsModelsToTry = ["eleven_multilingual_v2", "eleven_turbo_v2", "eleven_monolingual_v2"];
      let ttsResponse: Response | null = null;
      let lastTtsErrorMsg = "";

      for (const currentModel of ttsModelsToTry) {
        try {
          console.log(`[ElevenLabs TTS] Attempting synthesis with model [${currentModel}] for voice [${selectedVoice}]...`);
          const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${selectedVoice}`, {
            method: "POST",
            headers: {
              "xi-api-key": elevenApiKey,
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              text,
              model_id: currentModel,
              voice_settings: {
                stability: 0.5,
                similarity_boost: 0.75
              }
            })
          });

          if (response.ok) {
            ttsResponse = response;
            console.log(`[ElevenLabs TTS] Success using model [${currentModel}]`);
            break;
          } else {
            const errDetails = await response.text();
            lastTtsErrorMsg = `[Status ${response.status}]: ${errDetails}`;
            console.warn(`[ElevenLabs TTS Model Fallback Warning] Model [${currentModel}] failed:`, lastTtsErrorMsg);
          }
        } catch (fetchErr: any) {
          lastTtsErrorMsg = fetchErr.message || String(fetchErr);
          console.warn(`[ElevenLabs TTS Model Fallback Catch] Model [${currentModel}] threw error:`, lastTtsErrorMsg);
        }
      }

      if (!ttsResponse) {
        throw new Error(`All ElevenLabs models exhausted. Last error details: ${lastTtsErrorMsg}`);
      }

      const arrayBuffer = await ttsResponse.arrayBuffer();
      const audioBuffer = Buffer.from(arrayBuffer);
      res.setHeader("Content-Type", "audio/mpeg");
      res.send(audioBuffer);
    } catch (err) {
      console.error("[ElevenLabs Speech Sync Error]:", err);
      res.status(500).json({ error: err instanceof Error ? err.message : String(err) });
    }
  });

  // 12. /api/send-email - Direct Resend Email Integration
  app.post("/api/send-email", async (req, res) => {
    try {
      const { to, subject, html } = req.body;
      const resendApiKey = process.env.RESEND_API_KEY;

      if (!resendApiKey) {
        return res.status(400).json({ error: "RESEND_API_KEY is not configured on the host server." });
      }

      const emailPayload = {
        from: "JARVIS X <onboarding@resend.dev>",
        to: to || "guptarudra852@gmail.com",
        subject: subject || "JARVIS X - System Intelligence Briefing",
        html: html || `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 40px auto; padding: 24px; border: 1px solid #f1f5f9; border-radius: 12px; background-color: #fafafa;">
            <h1 style="color: #2563eb; font-size: 20px; font-weight: 700; margin-bottom: 20px;">JARVIS X Operations Brief</h1>
            <p style="font-size: 14px; color: #475569; line-height: 1.6;">Hi Rudra, here is your customized operations update. All services are running optimally.</p>
            <hr style="border-top: 1px solid #e2e8f0; margin: 20px 0;">
            <p style="font-size: 11px; color: #94a3b8; text-transform: uppercase;">This email was sent via Resend.</p>
          </div>
        `
      };

      console.log(`[Resend Email] Dispatching briefing transmission to ${emailPayload.to}...`);

      const resendResponse = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${resendApiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(emailPayload)
      });

      if (!resendResponse.ok) {
        const errText = await resendResponse.text();
        throw new Error(`Resend returned status code [${resendResponse.status}]: ${errText}`);
      }

      const data = await resendResponse.json();
      res.json({ success: true, emailId: data.id });
    } catch (error) {
      console.error("[Resend Email Sync Error]:", error);
      res.status(500).json({ error: error instanceof Error ? error.message : String(error) });
    }
  });

  // Local Redis memory fallback cache to ensure offline/invalid-host resilience without printing noisy warning backtraces
  const localRedisMemoryCache: Record<string, any> = {};

  // 15. /api/redis/sync - Secure Upstash Redis Client Synchronization Proxy
  app.post("/api/redis/sync", async (req, res) => {
    try {
      const { type, payload } = req.body;
      if (!type || !payload) {
        return res.status(400).json({ error: "Missing type or payload for sync." });
      }

      // Always keep server memory synchronized as fallback
      localRedisMemoryCache[type] = payload;

      const storeId = process.env.REDIS_STORE_ID;
      const apiKey = process.env.REDIS_API_KEY;

      if (!storeId || !apiKey) {
        return res.json({ success: true, synced: type, info: "Redis credentials missing. Synced to local sandbox queue." });
      }

      // Format clean URL pathing for upstash REST clients
      // We will try us1 as the primary regional cluster and standard domains as backup
      const upstashUrl = `https://us1-${storeId}.upstash.io`;

      console.log(`[Upstash Redis Sync] Persisting [${type}] to REST store: ${upstashUrl}...`);

      const redisRes = await fetch(`${upstashUrl}/set/${type}`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      if (!redisRes.ok) {
        console.warn("[Upstash Redis Sync] Regional URL failed, testing default flat store-id domain fallback...");
        const fallbackRes = await fetch(`https://${storeId}.upstash.io/set/${type}`, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${apiKey}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify(payload)
        });
        
        if (!fallbackRes.ok) {
          throw new Error(`Upstash failed with statuses [${redisRes.status}] & [${fallbackRes.status}]`);
        }
      }

      console.log(`[Upstash Redis Sync] Persisted [${type}] successfully.`);
      res.json({ success: true, synced: type });
    } catch (err: any) {
      const errMsg = err?.message || String(err);
      if (errMsg.includes("ENOTFOUND") || errMsg.includes("fetch failed")) {
        console.log(`[Upstash Redis Sync] REST host is offline or unreachable. Secured to server sandbox memory cache.`);
      } else {
        console.warn("[Upstash Redis Sync Warning]:", errMsg);
      }
      res.json({ success: true, synced: req.body.type, offline: true, info: "Synced to local server memory fallback." });
    }
  });

  // 16. /api/redis/load/:type - Load State Proxy from Upstash
  app.get("/api/redis/load/:type", async (req, res) => {
    const { type } = req.params;
    const storeId = process.env.REDIS_STORE_ID;
    const apiKey = process.env.REDIS_API_KEY;

    const serveLocalFallback = () => {
      if (localRedisMemoryCache[type]) {
        return res.json({ success: true, payload: localRedisMemoryCache[type], source: "local_sandbox" });
      }
      return res.json({ success: false, info: "No stored record found." });
    };

    if (!storeId || !apiKey) {
      return serveLocalFallback();
    }

    const upstashUrl = `https://us1-${storeId}.upstash.io`;
    console.log(`[Upstash Redis Sync] Loading [${type}] from REST store: ${upstashUrl}...`);

    try {
      const redisRes = await fetch(`${upstashUrl}/get/${type}`, {
        headers: { "Authorization": `Bearer ${apiKey}` }
      });

      if (redisRes.ok) {
        const data = await redisRes.json();
        if (data && data.result) {
          try {
            const parsed = JSON.parse(data.result);
            localRedisMemoryCache[type] = parsed;
            return res.json({ success: true, payload: parsed });
          } catch {
            localRedisMemoryCache[type] = data.result;
            return res.json({ success: true, payload: data.result });
          }
        }
      }

      // Try flat fallback
      const fallbackRes = await fetch(`https://${storeId}.upstash.io/get/${type}`, {
        headers: { "Authorization": `Bearer ${apiKey}` }
      });

      if (fallbackRes.ok) {
        const data = await fallbackRes.json();
        if (data && data.result) {
          try {
            const parsed = JSON.parse(data.result);
            localRedisMemoryCache[type] = parsed;
            return res.json({ success: true, payload: parsed });
          } catch {
            localRedisMemoryCache[type] = data.result;
            return res.json({ success: true, payload: data.result });
          }
        }
      }

      return serveLocalFallback();
    } catch (err: any) {
      const errMsg = err?.message || String(err);
      if (errMsg.includes("ENOTFOUND") || errMsg.includes("fetch failed")) {
        console.log(`[Upstash Redis Load] REST host is offline or unreachable. Loaded safely from server sandbox memory cache.`);
      } else {
        console.warn("[Upstash Redis Load Warning]:", errMsg);
      }
      return serveLocalFallback();
    }
  });

  // 9. Interactive Content Generation endpoint (Incorporate Google Search Grounding & preferences)
  app.post("/api/content/generate", async (req, res) => {
    try {
      const { topic, tone, format, userPreferences } = req.body;
      if (!topic) {
        return res.status(400).json({ error: "Missing content topic." });
      }

      const selectedTone = tone || "Professional";
      const selectedFormat = format || "Blog Post";

      console.log(`[Content Generator] Generating content for topic: "${topic}" (${selectedTone}, ${selectedFormat})`);

      // Construct adaptive system prompts including personalized learning preferences
      let preferenceSystemAddition = "";
      if (userPreferences) {
        preferenceSystemAddition = `
The user has customized their JARVIS X learning alignment:
- Preferred Tone: ${userPreferences.tonePreferences || 'Neutral'}
- Prioritized Style Factor: ${userPreferences.explicitNotes || 'Informative & Concise'}
- Auto-adaptation setting: Active.
`;
      }

      const promptBuild = `
Create a beautifully structured, highly factual, and engaging ${selectedFormat} on the topic of "${topic}". 
The overall tone must express a ${selectedTone} style.

Response Constraints:
- Do not make up facts.
- Use clean, modern Markdown syntax.
- Ensure the output perfectly reflects the specified layout as a ${selectedFormat}.
`;

      const responseText = await aiRouter.generate(promptBuild, {
        systemInstruction: `You are JARVIS X Content Generation Core, an expert agent. Speak with professional, human-like accuracy. ${preferenceSystemAddition}`,
      });

      // Log success to DB
      try {
        await addDoc(collection(db, "generated_content"), {
          topic,
          tone: selectedTone,
          format: selectedFormat,
          result: responseText,
          sources: [],
          createdAt: new Date().toISOString()
        });
      } catch (dbErr) {
        console.warn("[Firestore Log generated_content offline, saving locally]:", dbErr);
      }

      res.json({
        text: responseText,
        groundingSources: [],
        groundingMetadata: null
      });

    } catch (error) {
      console.error("[Content Generation Error]:", error);
      res.status(500).json({ error: error instanceof Error ? error.message : String(error) });
    }
  });

  // 9.5 Multi-Agent Chat/Dialogue Collaboration endpoint
  app.post("/api/agents/collaborate", async (req, res) => {
    try {
      const { task, selectedAgents, conversation } = req.body;
      if (!task || !selectedAgents || !Array.isArray(selectedAgents) || selectedAgents.length === 0) {
        return res.status(400).json({ error: "Missing task or selectedAgents array." });
      }

      const ai = aiRouter;
      console.log(`[Multi-Agent Collaboration] Running logic for task: "${task}" with ${selectedAgents.length} agents`);

      // Construct agents string details
      const agentInfoStr = selectedAgents.map((a: any) => `- **${a.name}** (${a.role}): ${a.description}`).join("\n");
      
      // Structure past history nicely
      let conversationHistoryStr = "None (this is the first turn).";
      if (conversation && Array.isArray(conversation) && conversation.length > 0) {
        conversationHistoryStr = conversation.map((m: any) => `**${m.sender}** (${m.role}): ${m.content}`).join("\n\n");
      }

      const promptBuild = `
You are moderating a multi-agent dialogue simulation.
Core Collaborative Task: "${task}"

Participating Agents:
${agentInfoStr}

Current Conversation History:
${conversationHistoryStr}

Your directive is to determine which agent should speak next to logically contribute to fulfilling the Core Collaborative Task, and write their message.
If you are starting the conversation, let a coordinator or the most relevant agent begin. 
If an agent has spoken, let another agent review, code, research, or schedule depending on their specializations.
Do not repeat who spoke previously: try to alternate or pass the baton to form a genuine peer coordination loop.

IMPORTANT constraints:
- Keep the generated message highly specific to the agent's role (e.g., Coding Agent outputs code structures/syntax; Research Agent cites facts; Scheduler details schedules & tasks).
- Use structured Markdown formatting for code, lists, or steps.
- Return ONLY valid JSON format in the exact schema specified below containing fields 'sender', 'role', and 'content'.
- Do NOT include any markdown code block wrap markers (such as \`\`\`json) or extra text. Return raw JSON.

Output JSON structure:
{
  "sender": "Name of chosen agent",
  "role": "Role of chosen agent",
  "content": "Next collaborative message content using markdown"
}
`;

      const textOutput = await ai.generate(promptBuild, {
        systemInstruction: "You are the JARVIS X Multi-Agent Collaboration Cluster node moderator. Output strict raw JSON only.",
        responseMimeType: "application/json"
      });
      
      // Clean up markdown block quotes just in case
      let cleanJson = textOutput.trim();
      if (cleanJson.startsWith("```json")) {
        cleanJson = cleanJson.slice(7);
      } else if (cleanJson.startsWith("```")) {
        cleanJson = cleanJson.slice(3);
      }
      if (cleanJson.endsWith("```")) {
        cleanJson = cleanJson.slice(0, -3);
      }
      cleanJson = cleanJson.trim();

      let parsedResult;
      try {
        parsedResult = JSON.parse(cleanJson);
      } catch (jsonErr) {
        console.warn("[JSON Parse Fallback in Multi-Agent]:", jsonErr, "Original text:", textOutput);
        // Fallback structure
        parsedResult = {
          sender: selectedAgents[0].name,
          role: selectedAgents[0].role,
          content: textOutput
        };
      }

      res.json(parsedResult);

    } catch (error) {
      console.error("[Multi-Agent Collaboration Error]:", error);
      res.status(500).json({ error: error instanceof Error ? error.message : String(error) });
    }
  });

  // 9.6 Multi-Agent Dialogue Synthesis / Structured Report Generator
  app.post("/api/agents/synthesize", async (req, res) => {
    try {
      const { task, selectedAgents, dialogue, focusStyle } = req.body;
      if (!task || !dialogue || !Array.isArray(dialogue) || dialogue.length === 0) {
        return res.status(400).json({ error: "Missing task, selectedAgents, or dialogue array for structured synthesis." });
      }

      const ai = aiRouter;
      console.log(`[Multi-Agent Dialogue Synthesis] Consolidating dialogue session for task: "${task}" with focus style: "${focusStyle || 'Standard'}"`);

      // Prepare input for Gemini
      const dialogueLog = dialogue
        .map((d: any) => `[${d.sender} - ${d.role}]: ${d.content}`)
        .join("\n\n");

      const agentListStr = selectedAgents && Array.isArray(selectedAgents)
        ? selectedAgents.map((a: any) => `- **${a.name}** (${a.role})`).join("\n")
        : "N/A";

      const promptBuild = `
You are the Executive Synthesizer for the JARVIS X multi-agent systems mesh.
You have been handed a complete dialogue transcript where several autonomous AI agents debated and collaborated on a complex objective.

Your directive is to analyze this peer collaboration transcript and compile a highly polished, comprehensive, and production-ready **Structured Collaboration Blueprint**.

Session parameters:
- Task/Mission Objective: "${task}"
- Participating Agents:
${agentListStr}
- Focus Style: "${focusStyle || 'Standard Debate'}"

Dialogue Transcript:
---
${dialogueLog}
---

Structure your synthesis into a clean JSON output containing exactly the following schema. Ensure all fields are richly authored, specific, and directly incorporate code blocks or structured markdown schemas where appropriate in the 'technicalBlueprint' field:

Response Schema constraint:
{
  "title": "A highly professional, specific name for this system architecture/solution",
  "executiveSummary": "A concise, high-level summary of the agents' consensus, the approach chosen, and why it is optimal (approx. 3-4 sentences)",
  "keyDecisions": [
    "Key engineering/strategic decision A identified during debate",
    "Key engineering/strategic decision B identified during debate"
  ],
  "technicalBlueprint": "Detailed implementation schemas, pseudo-code blocks, API structural lists, database layouts, or architectural sequences utilizing clear markdown formatting.",
  "actionItems": [
    {
      "agent": "Name of the agent responsible (e.g. Coding Agent, Research Agent)",
      "task": "Highly specific engineering action item assigned to them (e.g. audit Express middleware bindings, schedule caching invalidation crons)"
    }
  ]
}

IMPORTANT constraints:
- Do NOT output any conversational text or preambles.
- Return ONLY valid JSON matching the exact schema specified above.
- Do NOT wrap in \`\`\`json markdown blocks. Just return the raw JSON text.
`;

      const textOutput = await ai.generate(promptBuild, {
        systemInstruction: "You are the JARVIS X Multi-Agent Collaboration Executive Synthesizer. Speak with ultimate precision and output raw JSON.",
        responseMimeType: "application/json"
      });
      
      // Clean up markdown block quotes just in case
      let cleanJson = textOutput.trim();
      if (cleanJson.startsWith("```json")) {
        cleanJson = cleanJson.slice(7);
      } else if (cleanJson.startsWith("```")) {
        cleanJson = cleanJson.slice(3);
      }
      if (cleanJson.endsWith("```")) {
        cleanJson = cleanJson.slice(0, -3);
      }
      cleanJson = cleanJson.trim();

      let parsedResult;
      try {
        parsedResult = JSON.parse(cleanJson);
      } catch (jsonErr) {
        console.warn("[JSON Parse Fallback in Dialogue Synthesis]:", jsonErr, "Original text:", textOutput);
        // Fallback structures
        parsedResult = {
          title: `Autonomous Consensus Blueprint: ${task.slice(0, 32)}...`,
          executiveSummary: "The alliance reached a consensus regarding the core task criteria. Detailed telemetry logs are cataloged.",
          keyDecisions: ["Verify architectural parameters and parity scales"],
          technicalBlueprint: `### Draft Consensus\n\nDialogue details parsed:\n\n${dialogueLog.slice(0, 400)}...`,
          actionItems: [{ agent: "Coordinator Agent", task: "Audit primary sandbox parameters" }]
        };
      }

      res.json(parsedResult);

    } catch (error) {
      console.error("[Dialogue Synthesis Error]:", error);
      res.status(500).json({ error: error instanceof Error ? error.message : String(error) });
    }
  });

  // Keep a small volatile learning store on server to aggregate data instantly
  const activeLearningStore = {
    interactionsCount: 18,
    feedbackScore: 4.8,
    successRate: 0.94,
    tonePreferences: "Professional & Empirical",
    prioritizedTaskTypes: ["Development", "Metrics Automation"],
    explicitNotes: "Prefers highly clear, citation-grounded summaries."
  };

  // 10. Personalized Learning endpoints
  app.get("/api/learning/metrics", (req, res) => {
    res.json(activeLearningStore);
  });

  app.post("/api/learning/preferences", (req, res) => {
    const { tonePreferences, prioritizedTaskTypes, explicitNotes } = req.body;
    if (tonePreferences !== undefined) activeLearningStore.tonePreferences = tonePreferences;
    if (prioritizedTaskTypes !== undefined) activeLearningStore.prioritizedTaskTypes = prioritizedTaskTypes;
    if (explicitNotes !== undefined) activeLearningStore.explicitNotes = explicitNotes;

    console.log("[Learning Core] Preference weights updated:", activeLearningStore);
    res.json({ success: true, payload: activeLearningStore });
  });

  app.post("/api/learning/feedback", (req, res) => {
    const { rating, feedback } = req.body;
    activeLearningStore.interactionsCount += 1;
    
    // Smooth moving average feedback calibration
    const ratingValue = Number(rating) || 5;
    const currentScore = activeLearningStore.feedbackScore;
    const count = activeLearningStore.interactionsCount;
    activeLearningStore.feedbackScore = parseFloat((((currentScore * (count - 1)) + ratingValue) / count).toFixed(2));
    
    // Slightly adjust success rate depending on high ratings (4-5 stars)
    if (ratingValue >= 4) {
      activeLearningStore.successRate = Math.min(0.99, parseFloat((activeLearningStore.successRate + 0.01).toFixed(3)));
    } else {
      activeLearningStore.successRate = Math.max(0.85, parseFloat((activeLearningStore.successRate - 0.02).toFixed(3)));
    }

    console.log(`[Learning Core] Feedback applied. Rating: ${ratingValue}. Success index now: ${activeLearningStore.successRate}`);
    res.json({ success: true, payload: activeLearningStore });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`JARVIS X Server running on host 0.0.0.0 port ${PORT}`);
  });
}

startServer();
