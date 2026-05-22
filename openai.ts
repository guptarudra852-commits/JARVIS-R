import OpenAI from 'openai';
import { MODELS } from './models';
import { env } from '../../config/env';

let openaiClient: OpenAI | null = null;

function getOpenAI(): OpenAI {
  if (!openaiClient) {
    const key = env.openaiApiKey || process.env.OPENAI_API_KEY;
    if (!key) {
      throw new Error('OPENAI_API_KEY environment variable is required');
    }
    openaiClient = new OpenAI({ apiKey: key });
  }
  return openaiClient;
}

export interface AIProvider {
  generate(prompt: string, options?: { systemInstruction?: string; model?: string; responseMimeType?: string }): Promise<string>;
  generateImage(prompt: string): Promise<string>;
}

export const openaiProvider: AIProvider = {
  async generate(prompt, options = {}) {
    const openai = getOpenAI();
    let model = options.model || MODELS.PRIMARY;
    if (model.toLowerCase().includes("gemini")) {
      model = MODELS.FAST;
    }
    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      { role: 'system', content: options.systemInstruction || 'You are JARVIS X.' },
      { role: 'user', content: prompt }
    ];
    
    const params: OpenAI.Chat.ChatCompletionCreateParams = {
      model: model,
      messages: messages,
    };
    
    if (options.responseMimeType === "application/json") {
      params.response_format = { type: "json_object" };
    }

    const response = await openai.chat.completions.create(params);
    return response.choices[0].message.content || "";
  },

  async generateImage(prompt: string) {
    const openai = getOpenAI();
    const response = await openai.images.generate({
        model: "dall-e-3",
        prompt: prompt,
        n: 1,
        size: "1024x1024",
    });
    return response.data[0].url || "";
  }
};
