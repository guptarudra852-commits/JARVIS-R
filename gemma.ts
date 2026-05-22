import OpenAI from 'openai';
import { AIProvider } from './openai';

let gemmaClient: OpenAI | null = null;

function getGemmaClient(): OpenAI {
  if (!gemmaClient) {
    const key = process.env.GEMMA_API_KEY || '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';
    gemmaClient = new OpenAI({
      apiKey: key,
      baseURL: 'https://integrate.api.nvidia.com/v1',
    });
  }
  return gemmaClient;
}

export const gemmaProvider: AIProvider = {
  async generate(prompt, options = {}) {
    const client = getGemmaClient();
    
    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      { role: 'system', content: options.systemInstruction || 'You are JARVIS X, a modular, highly capable, and friendly digital companion. Speak like a helpful human assistant. Always address the user as Rudra.' },
      { role: 'user', content: prompt }
    ];
    
    const params: any = {
      model: "google/gemma-4-31b-it",
      messages: messages,
      temperature: 1.00,
      top_p: 0.95,
      max_tokens: 16384,
      chat_template_kwargs: { "enable_thinking": true }
    };

    const completion = await client.chat.completions.create(params);
    return completion.choices[0]?.message?.content || "";
  },

  async generateImage(prompt: string) {
    return "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=600&auto=format&fit=crop";
  }
};
