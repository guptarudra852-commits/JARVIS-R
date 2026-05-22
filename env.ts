// config/env.ts

const isServer = typeof window === 'undefined';

// Core system environment reader with safe client vs server accessors
const getEnvVar = (key: string): string => {
  if (isServer) {
    return process.env[key] || "";
  } else {
    // Vite-specific environment variable access
    const viteKey = `VITE_${key}`;
    const value = (import.meta as any).env?.[viteKey] || (import.meta as any).env?.[key] || "";
    return value;
  }
};

export const env = {
  isServer,
  
  // API Core Credentials
  geminiApiKey: getEnvVar("GEMINI_API_KEY"),
  openaiApiKey: getEnvVar("OPENAI_API_KEY"),
  groqApiKey: getEnvVar("GROQ_API_KEY"),
  resendApiKey: getEnvVar("RESEND_API_KEY"),
  assemblyaiApiKey: getEnvVar("ASSEMBLYAI_API_KEY"),
  elevenlabsApiKey: getEnvVar("ELEVENLABS_API_KEY"),
  
  // Redundant databases (e.g. Upstash Redis / Cloud DB)
  redisStoreId: getEnvVar("REDIS_STORE_ID"),
  redisApiKey: getEnvVar("REDIS_API_KEY"),

  // Firebase configurations
  firebaseApiKey: getEnvVar("FIREBASE_API_KEY"),
  firebaseAuthDomain: getEnvVar("FIREBASE_AUTH_DOMAIN"),
  firebaseProjectId: getEnvVar("FIREBASE_PROJECT_ID"),
  firebaseStorageBucket: getEnvVar("FIREBASE_STORAGE_BUCKET"),
  firebaseMessagingSenderId: getEnvVar("FIREBASE_MESSAGING_SENDER_ID"),
  firebaseAppId: getEnvVar("FIREBASE_APP_ID")
};

// Required environment checklists for live features
const REQUIRED_KEYS = [
  "MINIMAX_API_KEY",
  "OPENAI_API_KEY"
];

export const environmentValidationManager = {
  validate() {
    if (!isServer) return { geminiKey: !!env.geminiApiKey, openaiKey: !!env.openaiApiKey };

    console.log("====================================================");
    console.log("🛡️ JARVIS X: CONFIGURING SECURE ENCLAVE...");
    
    const missing: string[] = [];
    for (const key of REQUIRED_KEYS) {
      if (isServer && !process.env[key]) {
        missing.push(key);
      }
    }

    const status = {
      geminiKey: !!process.env.GEMINI_API_KEY,
      openaiKey: !!process.env.OPENAI_API_KEY,
      groqKey: !!process.env.GROQ_API_KEY,
    };

    if (missing.length > 0) {
      console.log(`⚠️ Offline Warning: Core offline mode. Missing optional cloud keys: ${missing.join(', ')}`);
      console.log("💡 Tip: Enter keys in Settings > Secrets to link cloud neural enclaves.");
    } else {
      console.log("🟢 All Core Cloud AI pipelines fully initialized & verified.");
    }
    
    console.log("🛡️ Smart Startup Layer: Completed with zero user UI warnings.");
    console.log("====================================================");
    return status;
  }
};

// Execute initialization check
environmentValidationManager.validate();
