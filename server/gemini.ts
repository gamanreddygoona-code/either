import { GoogleGenAI } from '@google/genai';
import { ThreatIntelEngine } from './threatIntel';

let aiInstance: GoogleGenAI | null = null;

export function getGenAI(): GoogleGenAI | null {
  if (!aiInstance && process.env.GEMINI_API_KEY) {
    aiInstance = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
    });
  }
  return aiInstance;
}

/**
 * Executes a function calling chat interaction with tools
 */
export async function executeGenAIChat(params: {
  prompt: string;
  history?: any[];
  model?: string;
  systemInstruction?: string;
}) {
  const ai = getGenAI();
  if (!ai) {
    throw new Error('GEMINI_API_KEY not configured in environment');
  }

  const modelName = params.model || 'gemini-2.5-flash';
  const contents: any[] = [];

  if (params.history && Array.isArray(params.history)) {
    for (const msg of params.history) {
      contents.push({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content || '' }]
      });
    }
  }

  contents.push({
    role: 'user',
    parts: [{ text: params.prompt }]
  });

  const response = await ai.models.generateContent({
    model: modelName,
    contents,
    config: {
      systemInstruction: params.systemInstruction || 'You are Either AI, an intelligent, sovereign, privacy-first workspace assistant.',
      temperature: 0.7,
    }
  });

  return {
    text: response.text || '',
    candidates: response.candidates,
    usageMetadata: response.usageMetadata
  };
}
