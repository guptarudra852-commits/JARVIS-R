import OpenAI from 'openai';
import { env } from '../../config/env';

let groqClient: OpenAI | null = null;

function getGroq(): OpenAI {
  if (!groqClient) {
    const key = env.groqApiKey || process.env.GROQ_API_KEY;
    if (!key) {
      throw new Error("GROQ_API_KEY environment variable is required");
    }
    // Groq is fully OpenAI API combatible
    groqClient = new OpenAI({
      apiKey: key,
      baseURL: "https://api.groq.com/openai/v1"
    });
  }
  return groqClient;
}

export const groqProvider = {
  async generate(prompt: string, options: { systemInstruction?: string; model?: string; responseMimeType?: string } = {}): Promise<string> {
    const client = getGroq();
    // Default to mixtral-8x7b-32768 or llama-3.1-8b-instant
    const model = options.model || "llama-3.1-8b-instant";
    
    // Safety translation
    let modelName = model;
    if (modelName.toLowerCase().includes("gemini") || modelName.toLowerCase().includes("gpt")) {
      modelName = "llama-3.1-8b-instant";
    }

    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      { role: 'system', content: options.systemInstruction || 'You are JARVIS X.' },
      { role: 'user', content: prompt }
    ];

    const params: OpenAI.Chat.ChatCompletionCreateParams = {
      model: modelName,
      messages: messages,
    };

    if (options.responseMimeType === "application/json") {
      params.response_format = { type: "json_object" };
    }

    const response = await client.chat.completions.create(params);
    return response.choices[0].message.content || "";
  },

  async generateImage(prompt: string): Promise<string> {
    throw new Error("Groq does not natively support inline graphic synthesis.");
  }
};
