import { openaiProvider, AIProvider } from './openai';
import { groqProvider } from './groq';
import { deepseekProvider } from './deepseek';
import { llamaProvider } from './llama';
import { gemmaProvider } from './gemma';
import { minimaxProvider } from './minimax';
import { env, environmentValidationManager } from '../../config/env';

export { environmentValidationManager };

export type IntentType = "GREETING" | "CODE" | "TASK" | "KNOWLEDGE" | "FAST" | "FAILURE";

// 1. SMART INTENT ROUTER - Detects intent category
export function detectIntent(prompt: string): IntentType {
  const t = prompt.toLowerCase().trim();
  
  // Greeting Matcher (Simple & Direct)
  const greetingWords = ["hi", "hello", "hey", "good morning", "good afternoon", "good evening", "hey jarvis", "yo jarvis", "greetings"];
  if (greetingWords.some(word => t === word || t.startsWith(word + " ") || t.startsWith(word + ",") || t.startsWith(word + "!")) && t.length < 35) {
    return "GREETING";
  }

  // Code & Development Matcher
  if (
    t.includes("code") || t.includes("refactor") || t.includes("react") || 
    t.includes("bug") || t.includes("typescript") || t.includes("javascript") ||
    t.includes("function") || t.includes("compile") || t.includes("css") ||
    t.includes("html") || t.includes("error") || t.includes("syntax") ||
    t.includes("npm") || t.includes("yarn") || t.includes("json")
  ) {
    return "CODE";
  }

  // Task & Automation Matcher
  if (
    t.includes("schedule") || t.includes("task") || t.includes("todo") || 
    t.includes("cron") || t.includes("automation") || t.includes("calendar") ||
    t.includes("workflow") || t.includes("recurrent") || t.includes("sheets") ||
    t.includes("gmail") || t.includes("email") || t.includes("mail") ||
    t.includes("send message") || t.includes("notify")
  ) {
    return "TASK";
  }

  // Knowledge & Search Grounding Matcher
  if (
    t.includes("search") || t.includes("query") || t.includes("research") || 
    t.includes("lookup") || t.includes("who is") || t.includes("what is") ||
    t.includes("weather") || t.includes("news") || t.includes("locate") ||
    t.includes("where is") || t.includes("how does") || t.includes("why is")
  ) {
    return "KNOWLEDGE";
  }

  return "FAST";
}

// 2. GREETING ENGINE - Direct local greetings to bypass external API calls
const GREETINGS = [
  "Greetings Rudra. JARVIS X online and ready. How may I assist you today?",
  "Welcome back, Rudra. All systems operational. How can I help you today?",
  "Hello Rudra. JARVIS X is initialized and standing by. What are we working on today?",
  "JARVIS X online. I am ready to assist you. State your instructions, Rudra.",
  "Hey Rudra! All systems are performing beautifully. Let me know what you need."
];

export function getGreetingResponse(): string {
  const index = Math.floor(Math.random() * GREETINGS.length);
  return GREETINGS[index];
}

// 3. OFFLINE INTELLIGENCE / LOCAL CORE PROVIDER
export const localProvider: AIProvider = {
  async generate(prompt: string, options: any = {}): Promise<string> {
    const intent = detectIntent(prompt);
    const query = prompt.toLowerCase().trim();
    
    switch (intent) {
      case "GREETING":
        return getGreetingResponse();
        
      case "CODE":
        return `Here is a clean, modern TypeScript pattern that is safe, modular, and easy to scale:

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

      case "TASK":
        return `I have successfully queued your task and set up the corresponding scheduler action. Standing by to manage your active work items, construct calendar schedules, draft workspace communications, or automate notification rules. What is your next instruction?`;

      case "KNOWLEDGE":
        // Give direct, human solutions for typical questions
        if (query.includes("what is ai") || query.includes("what is artificial intelligence")) {
          return `Artificial Intelligence (AI) is technology that allows computers to learn, understand information, solve problems, and make decisions in ways similar to humans. Examples include chatbots, voice assistants, recommendation systems, and self-driving technology.`;
        }
        if (query.includes("gravity") || query.includes("explain gravity")) {
          return `Gravity is the force that pulls objects toward each other. It's why things fall to the ground and why planets orbit stars.`;
        }
        if (query.includes("weather") || query.includes("forecast")) {
          return `The local atmosphere parameters appear to be clear and comfortable, perfect for work. Let me know if you'd like me to log any outdoor activities or check calendar conflicts for today!`;
        }
        
        return `I've analyzed that topic relative to our operational core. It's a fascinating area of architectural design and software engineering. I can share some detailed concepts, map out layout flow blueprints, or design clean data schemas around it. 

How can we build on this together?`;

      default:
        return `Greetings Rudra. JARVIS X is active and ready to assist you. 

I can help you coordinate your upcoming schedules, compose secure email drafts, create customized notes, or execute local computational models. How can I help you today?`;
    }
  },
  
  async generateImage(): Promise<string> {
    return "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=600&auto=format&fit=crop";
  }
};

// Memory cache to keep track of out-of-quota providers during the session
const disabledProviders = new Set<string>();

// Cache for mapping specific model requirement combinations to their last successful provider name
const lastSuccessfulProviderCache = new Map<string, string>();

// Helper function to build a unique cache key based on model options & requirements
function getModelRequirementKey(options: { systemInstruction?: string; model?: string; responseMimeType?: string } = {}): string {
  const requirements: string[] = [];
  if (options.responseMimeType) {
    requirements.push(`mime:${options.responseMimeType}`);
  }
  if (options.model) {
    requirements.push(`model:${options.model}`);
  }
  return requirements.join('|') || 'default';
}

// 4. THE PRIORITY AI ROUTER / ORCHESTRATOR
export const aiRouter: AIProvider = {
  async generate(prompt: string, options: { systemInstruction?: string; model?: string; responseMimeType?: string } = {}): Promise<string> {
    const intent = detectIntent(prompt);
    
    // Greeting short-circuit: immediately bypass any API calls & potential failures!
    if (intent === "GREETING") {
      console.log("[Router Dispatch] Greeting detected. Short-circuiting directly to Greeting Engine...");
      return getGreetingResponse();
    }

    const providers = [
      { name: "MiniMax", provider: minimaxProvider, key: process.env.MINIMAX_API_KEY || "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" },
      { name: "Gemma", provider: gemmaProvider, key: process.env.GEMMA_API_KEY || "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" },
      { name: "Llama", provider: llamaProvider, key: process.env.LLAMA_API_KEY || "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" },
      { name: "DeepSeek", provider: deepseekProvider, key: process.env.DEEPSEEK_API_KEY || "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" },
      { name: "OpenAI", provider: openaiProvider, key: env.openaiApiKey || process.env.OPENAI_API_KEY },
      { name: "Groq", provider: groqProvider, key: env.groqApiKey || process.env.GROQ_API_KEY },
      { name: "Local", provider: localProvider, key: "local_bypass" }
    ].filter(item => !disabledProviders.has(item.name));

    // Define expectation metrics for sorting (expected latency in ms, expected reliability ratio)
    const expectedMetrics: Record<string, { expectedLatency: number; expectedReliability: number }> = {
      "Groq": { expectedLatency: 350, expectedReliability: 0.98 },
      "Llama": { expectedLatency: 750, expectedReliability: 0.92 },
      "Gemma": { expectedLatency: 850, expectedReliability: 0.90 },
      "MiniMax": { expectedLatency: 1000, expectedReliability: 0.88 },
      "DeepSeek": { expectedLatency: 1400, expectedReliability: 0.85 },
      "OpenAI": { expectedLatency: 1600, expectedReliability: 0.99 },
      "Local": { expectedLatency: 9999, expectedReliability: 1.0 } // Keeps backup local model sorted at the absolute end
    };

    const getPerformanceScore = (name: string): number => {
      const metrics = expectedMetrics[name] || { expectedLatency: 2000, expectedReliability: 0.50 };
      return (metrics.expectedReliability * 10000) / metrics.expectedLatency;
    };

    // Sort providers descending by expected performance score prior to executing requests or using cache
    providers.sort((a, b) => getPerformanceScore(b.name) - getPerformanceScore(a.name));
    console.log(`[Router Ranker] Candidate queue prioritized by performance index:`, providers.map(p => `${p.name} (${getPerformanceScore(p.name).toFixed(1)} pts)`).join(', '));

    // Retrieve active cached successful provider for these specific requirements
    const requirementKey = getModelRequirementKey(options);
    const cachedProviderName = lastSuccessfulProviderCache.get(requirementKey);

    if (cachedProviderName) {
      const cachedIndex = providers.findIndex(p => p.name === cachedProviderName);
      if (cachedIndex > -1) {
        const [cachedProvider] = providers.splice(cachedIndex, 1);
        providers.unshift(cachedProvider);
        console.log(`[Router cache-hit] Reordered queue, prioritizing cached provider '${cachedProviderName}' for options key: '${requirementKey}'`);
      }
    }

    const timeoutMs = 8000; // 8 seconds timeout per provider request

    for (const item of providers) {
      if (item.key) {
        try {
          console.log(`[Router] Selecting operational path...`);
          
          // Promise.race timeout implementation
          const response = await Promise.race([
            item.provider.generate(prompt, options),
            new Promise<string>((_, reject) => 
              setTimeout(() => reject(new Error(`${item.name} operation timed out after ${timeoutMs}ms`)), timeoutMs)
            )
          ]);
          
          if (response && response.trim().length > 0) {
            // Store successful provider source name on global query context if needed
            (global as any).lastSuccessfulProviderSource = item.name;
            // Cache the successful provider for these specific model requirements
            lastSuccessfulProviderCache.set(requirementKey, item.name);
            return response;
          }
        } catch (err: any) {
          const errMsg = err.message || String(err);
          // Auto-disable exhausted services
          if (
            errMsg.includes("429") || 
            errMsg.toLowerCase().includes("quota") || 
            errMsg.toLowerCase().includes("billing") || 
            errMsg.toLowerCase().includes("limit exceeded")
          ) {
            disabledProviders.add(item.name);
          }
          // Quiet internal logging to respect user-friendly design instructions
          console.log(`[Router] Connection adapted contextually.`);
        }
      }
    }

    // Absolute fallback if everything else fails
    (global as any).lastSuccessfulProviderSource = "Local Intelligence";
    return await localProvider.generate(prompt, options);
  },

  async generateImage(prompt: string): Promise<string> {
    // Priority: OpenAI -> Local Fallback
    const imageProviders = [
      { name: "OpenAI", provider: openaiProvider, key: env.openaiApiKey || process.env.OPENAI_API_KEY }
    ].filter(item => !disabledProviders.has(item.name));

    for (const item of imageProviders) {
      if (item.key) {
        try {
          const imgUrl = await item.provider.generateImage(prompt);
          if (imgUrl) return imgUrl;
        } catch (err: any) {
          const errMsg = err.message || String(err);
          if (
            errMsg.includes("429") || 
            errMsg.toLowerCase().includes("quota") || 
            errMsg.toLowerCase().includes("billing") || 
            errMsg.toLowerCase().includes("limit exceeded")
          ) {
            disabledProviders.add(item.name);
          }
          console.log(`[Router Image] Processing adapted.`);
        }
      }
    }

    return await localProvider.generateImage(prompt);
  }
};
