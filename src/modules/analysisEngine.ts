import ollama from 'ollama';
import { CONFIG } from '../utils/config';

export interface GapAnalysis {
  coreIntent: string;
  knowns: string[];
  unknowns: string[];
  actionPlan: 'reasoning' | 'search' | 'hybrid';
  searchQueries?: string[];
}

export async function analyzePrompt(prompt: string): Promise<GapAnalysis> {
  console.log(`[Ollama] 🚀 Requesting analysis for: "${prompt}"`);

  const systemPrompt = `
    You are a technical gap analysis engine. Decompose the user's query into a structured plan.
    Return ONLY strictly valid JSON.

    JSON structure:
    {
      "coreIntent": "The goal",
      "knowns": ["facts"],
      "unknowns": ["missing info"],
      "actionPlan": "reasoning" | "search" | "hybrid",
      "searchQueries": ["queries"]
    }
  `;

  const timeout = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error('OLLAMA_TIMEOUT')), 20000)
  );

  try {
    const response = await Promise.race([
      ollama.chat({
        model: 'phi3', // SWITCHED TO phi3 FOR SPEED AND RELIABILITY
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt },
        ],
        format: 'json',
        options: {
          num_predict: 256,
          temperature: 0.1,
        }
      }),
      timeout
    ]);

    console.log('[Ollama] ✅ Response received successfully');
    const text = response.message.content;
    return JSON.parse(text);
  } catch (error: any) {
    console.error(`[Ollama] ❌ Error/Timeout: ${error.message}. Falling back to dynamic analysis.`);
    return {
      coreIntent: `Research: ${prompt}`,
      knowns: [`User query: ${prompt}`],
      unknowns: [`Latest implementation details for ${prompt}`],
      actionPlan: 'hybrid',
      searchQueries: [`${prompt} explanation`, `${prompt} guide`]
    };
  }
}
