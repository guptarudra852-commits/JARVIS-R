import OpenAI from 'openai';
import { AIProvider } from './openai';

let llamaClient: OpenAI | null = null;

function getLlamaClient(): OpenAI {
  if (!llamaClient) {
    const key = process.env.LLAMA_API_KEY || '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';
    llamaClient = new OpenAI({
      apiKey: key,
      baseURL: 'https://integrate.api.nvidia.com/v1',
    });
  }
  return llamaClient;
}

export const llamaProvider: AIProvider = {
  async generate(prompt, options = {}) {
    const client = getLlamaClient();
    
    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      { role: 'system', content: options.systemInstruction || 'You are JARVIS X, a modular, highly capable, and friendly digital companion. Speak like a helpful human assistant. Always address the user as Rudra.' },
      { role: 'user', content: prompt }
    ];
    
    const params: any = {
      model: "meta/llama-3.3-70b-instruct",
      messages: messages,
      temperature: 0.2,
      top_p: 0.7,
      max_tokens: options.responseMimeType === "application/json" ? 1024 : 2048, // slightly higher fallback for normal replies when needed
    };

    const completion = await client.chat.completions.create(params);
    return completion.choices[0]?.message?.content || "";
  },

  async generateImage(prompt: string) {
    return "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=600&auto=format&fit=crop";
  }
};
