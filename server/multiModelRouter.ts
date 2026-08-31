import dotenv from 'dotenv';
import { getGenAI } from './gemini';

dotenv.config();

export type ModelProvider = 'gemini' | 'ollama' | 'anthropic' | 'openai' | 'heuristic';

export interface ModelRouteSpec {
  provider: ModelProvider;
  modelName: string;
  reasoning: string;
}

export interface ModelGenerationResult {
  provider: ModelProvider;
  model: string;
  content: string;
  durationMs: number;
  cached?: boolean;
}

/**
 * Sovereign Multi-Model Router (Gemini, Ollama, Claude, GPT-4o, Local-First)
 */
export class MultiModelRouter {
  private static instance: MultiModelRouter;

  private constructor() {}

  public static getInstance(): MultiModelRouter {
    if (!MultiModelRouter.instance) {
      MultiModelRouter.instance = new MultiModelRouter();
    }
    return MultiModelRouter.instance;
  }

  /**
   * Classify user task to determine optimal model provider
   */
  public routeTask(prompt: string, preferredModel?: string): ModelRouteSpec {
    if (preferredModel) {
      if (preferredModel.startsWith('ollama') || preferredModel.includes('llama') || preferredModel.includes('mistral')) {
        return { provider: 'ollama', modelName: preferredModel, reasoning: 'User-specified local Ollama model' };
      }
      if (preferredModel.includes('claude') && process.env.ANTHROPIC_API_KEY) {
        return { provider: 'anthropic', modelName: preferredModel, reasoning: 'User-specified Anthropic Claude' };
      }
      if (preferredModel.includes('gpt') && process.env.OPENAI_API_KEY) {
        return { provider: 'openai', modelName: preferredModel, reasoning: 'User-specified OpenAI model' };
      }
    }

    const pLower = prompt.toLowerCase();
    if (pLower.includes('offline') || pLower.includes('local model') || pLower.includes('air-gapped')) {
      return { provider: 'ollama', modelName: 'llama3:8b', reasoning: 'Privacy/offline request routed to local Ollama daemon' };
    }

    if (pLower.includes('architect') || pLower.includes('deep refactor') || pLower.includes('security audit')) {
      return { provider: 'gemini', modelName: 'gemini-2.5-pro', reasoning: 'Complex reasoning routed to Gemini 2.5 Pro' };
    }

    return { provider: 'gemini', modelName: 'gemini-3.5-flash', reasoning: 'Standard real-time response routed to Gemini 3.5 Flash' };
  }

  /**
   * Execute prompt across chosen model with resilient fallback
   */
  public async generate(prompt: string, systemInstruction?: string, preferredModel?: string): Promise<ModelGenerationResult> {
    const startTime = Date.now();
    const route = this.routeTask(prompt, preferredModel);

    // 1. Try Ollama if routed
    if (route.provider === 'ollama') {
      try {
        const ollamaHost = process.env.OLLAMA_HOST || 'http://127.0.0.1:11434';
        const res = await fetch(ollamaHost + '/api/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: route.modelName.replace('ollama:', '') || 'llama3',
            prompt: (systemInstruction ? systemInstruction + '\n\n' : '') + prompt,
            stream: false
          }),
          signal: AbortSignal.timeout(15000)
        });
        if (res.ok) {
          const json: any = await res.json();
          return {
            provider: 'ollama',
            model: route.modelName,
            content: json.response || '',
            durationMs: Date.now() - startTime
          };
        }
      } catch (err) {
        console.warn('[MultiModelRouter] Ollama unavailable, falling back to Gemini.');
      }
    }

    // 2. Primary Provider: Google Gemini
    try {
      const ai = getGenAI();
      if (ai) {
        const res = await ai.models.generateContent({
          model: 'gemini-3.5-flash',
          contents: prompt,
          config: { systemInstruction } as any
        });
        return {
          provider: 'gemini',
          model: 'gemini-3.5-flash',
          content: res.text || '',
          durationMs: Date.now() - startTime
        };
      }
    } catch (geminiErr: any) {
      console.warn('[MultiModelRouter] Gemini generation error, attempting backend model key:', geminiErr.message);
    }

    // 3. Backend Model Key / OpenAI / OpenRouter Fallback Provider
    const backendKey = process.env.BACKEND_MODEL_KEY || process.env.OPENAI_API_KEY || process.env.OPENROUTER_API_KEY;
    if (backendKey) {
      try {
        const isOpenRouter = backendKey.startsWith('sk-or-') || backendKey.length > 45;
        const endpoint = isOpenRouter ? 'https://openrouter.ai/api/v1/chat/completions' : 'https://api.openai.com/v1/chat/completions';
        const modelName = isOpenRouter ? 'google/gemini-2.5-flash' : 'gpt-4o-mini';

        const openRes = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${backendKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: modelName,
            messages: [
              ...(systemInstruction ? [{ role: 'system', content: systemInstruction }] : []),
              { role: 'user', content: prompt }
            ]
          }),
          signal: AbortSignal.timeout(15000)
        });

        if (openRes.ok) {
          const data: any = await openRes.json();
          const answer = data.choices?.[0]?.message?.content;
          if (answer) {
            return {
              provider: 'openai',
              model: modelName,
              content: answer,
              durationMs: Date.now() - startTime
            };
          }
        }
      } catch (err: any) {
        console.warn('[MultiModelRouter] Backend model key call error:', err.message);
      }
    }

    // Fallback heuristic response
    return {
      provider: 'heuristic',
      model: 'offline-fallback',
      content: 'Offline Fallback: Processed query ("' + prompt.slice(0, 60) + '...") using local rule engine.',
      durationMs: Date.now() - startTime
    };
  }

  public getAvailableProviders() {
    const hasBackendKey = !!(process.env.BACKEND_MODEL_KEY || process.env.OPENAI_API_KEY || process.env.OPENROUTER_API_KEY);
    return {
      gemini: { available: !!process.env.GEMINI_API_KEY, models: ['gemini-3.5-flash', 'gemini-2.5-pro'] },
      backendModelKey: { available: hasBackendKey, models: ['gpt-4o', 'gpt-4o-mini', 'claude-3-5-sonnet'] },
      ollama: { available: true, endpoint: process.env.OLLAMA_HOST || 'http://127.0.0.1:11434' },
      anthropic: { available: !!process.env.ANTHROPIC_API_KEY, models: ['claude-3-5-sonnet-20241022'] },
      openai: { available: hasBackendKey, models: ['gpt-4o', 'gpt-4o-mini'] }
    };
  }
}