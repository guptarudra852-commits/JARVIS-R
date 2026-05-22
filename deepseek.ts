import OpenAI from 'openai';
import { AIProvider } from './openai';

let deepseekClient: OpenAI | null = null;

function getDeepSeekClient(): OpenAI {
  if (!deepseekClient) {
    const key = process.env.DEEPSEEK_API_KEY || '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';
    deepseekClient = new OpenAI({
      apiKey: key,
      baseURL: 'https://integrate.api.nvidia.com/v1',
    });
  }
  return deepseekClient;
}

export const deepseekProvider: AIProvider = {
  async generate(prompt, options = {}) {
    const client = getDeepSeekClient();
    
    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      { role: 'system', content: options.systemInstruction || 'You are JARVIS X, a modular, highly capable, and friendly digital companion. Speak like a helpful human assistant. Always address the user as Rudra.' },
      { role: 'user', content: prompt }
    ];
    
    // Use the explicit parameters from your code snippet
    const params: any = {
      model: "deepseek-ai/deepseek-v4-pro",
      messages: messages,
      temperature: 1,
      top_p: 0.95,
      max_tokens: 16384,
      chat_template_kwargs: { "thinking": false }
    };

    const completion = await client.chat.completions.create(params);
    return completion.choices[0]?.message?.content || "";
  },

  async generateImage(prompt: string) {
    // DeepSeek V4 Pro on NVIDIA is a text-only LLM. 
    // Return standard aesthetic fallback image
    return "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=600&auto=format&fit=crop";
  }
};
