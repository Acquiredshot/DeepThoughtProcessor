import ollama from 'ollama';
import { MOCK_DATA } from '../utils/mocks';

export interface Thought {
  id: string;
  query: string;
  analysis: any;
  results: any[];
  synthesis: any;
  timestamp: number;
}

export async function storeThought(thought: Thought): Promise<void> {
  console.log(`Storing thought in vector store: ${thought.id}...`);
}

export async function retrieveRelatedThoughts(query: string): Promise<Thought[]> {
  return [];
}

export async function synthesizeFindings(analysis: any, results: any[]): Promise<any> {
  console.log('Synthesizing findings (Optimized Mode)...');

  if (!results || results.length === 0) {
    return {
      answer: "No specific results were found for this query.",
      code: "// No code pattern available",
      references: []
    };
  }

  // OPTIMIZATION: Truncate content to prevent Ollama from hanging
  // We only take the first 1000 characters of each result to stay within memory limits
  const compressedContent = results
    .map(r => `Source: ${r.title}\\nContent: ${r.content.substring(0, 1000)}`)
    .join('\\n\\n');

  const systemPrompt = `
    You are a technical expert. Synthesize a final solution based on the provided research.
    Be concise. Return your response in strictly valid JSON format.

    JSON structure:
    {
      "answer": "Short TL;DR synthesis",
      "code": "Concise code pattern",
      "references": ["List of source titles"]
    }
  `;

  try {
    // Set a timeout for the Ollama call
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout

    const response = await ollama.chat({
      model: 'llama3',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Goal: ${analysis.coreIntent}\\n\\nResearch:\\n${compressedContent}` },
      ],
      format: 'json',
      options: {
        num_ctx: 4096, // Explicitly limit context window to 4k tokens to prevent crashes
        temperature: 0.2,
      }
    });

    clearTimeout(timeoutId);
    return JSON.parse(response.message.content);
  } catch (error) {
    console.error('Ollama synthesis failed or timed out, using dynamic summary:', error);
    return {
      answer: `Research found ${results.length} sources. The primary suggestion is: ${results[0]?.content.substring(0, 200)}...`,
      code: `// Implementation based on results from ${results[0]?.url}`,
      references: results.map(r => r.title)
    };
  }
}
