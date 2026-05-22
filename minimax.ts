import OpenAI from 'openai';
import { AIProvider } from './openai';

let minimaxClient: OpenAI | null = null;

function getMinimaxClient(): OpenAI {
  if (!minimaxClient) {
    const key = process.env.MINIMAX_API_KEY || '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';
    minimaxClient = new OpenAI({
      apiKey: key,
      baseURL: 'https://integrate.api.nvidia.com/v1',
    });
  }
  return minimaxClient;
}

export const minimaxProvider: AIProvider = {
  async generate(prompt, options = {}) {
    const client = getMinimaxClient();
    
    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      { role: 'system', content: options.systemInstruction || 'You are JARVIS X, a modular, highly capable, and friendly digital companion. Speak like a helpful human assistant. Always address the user as Rudra.' },
      { role: 'user', content: prompt }
    ];
    
    const params: any = {
      model: "minimaxai/minimax-m2.7",
      messages: messages,
      temperature: 1,
      top_p: 0.95,
      max_tokens: 16384,
    };

    const completion = await client.chat.completions.create(params);
    return completion.choices[0]?.message?.content || "";
  },

  async generateImage(prompt: string) {
    return "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=600&auto=format&fit=crop";
  }
};
