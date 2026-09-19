import express from 'express';
import cors from 'cors';
import ollama from 'ollama';
import { analyzePrompt } from './modules/analysisEngine';
import { performSearch } from './modules/scraper';
import { synthesizeFindings, storeThought } from './modules/memory';
import { MOCK_DATA } from './utils/mocks';

const app = express();
app.use(cors());
app.use(express.json());

const activeRequests = new Map();

console.log('--------------------------------------------------');
console.log('🚀 THOUGHTPROCESSOR SERVER STARTING (Version: 2.4.0)');
console.log('--------------------------------------------------');

async function checkOllama() {
  try {
    const models = await ollama.list();
    const hasLlama3 = models.models.some(m => m.name.includes('llama3'));
    console.log(`🔍 Ollama Connection: ${hasLlama3 ? '✅ Llama3 Found' : '❌ Llama3 NOT Found'}`);
  } catch (e) {
    console.log('❌ Ollama Connection: FAILED');
  }
}
checkOllama();

app.post('/api/process', async (req, res) => {
  const { prompt, requestId } = req.body;
  const rid = requestId || Date.now().toString();

  console.log(`\n📥 Received Prompt [${rid}]: "${prompt}"`);

  if (!prompt) return res.status(400).json({ error: 'Prompt is required' });

  activeRequests.set(rid, true);

  try {
    // 1. Gap Analysis
    console.log(`[${rid}] ⚙️ Gap Analysis...`);
    const analysis = await analyzePrompt(prompt);

    if (!activeRequests.has(rid)) {
      console.log(`[${rid}] 🛑 Cancelled after Analysis.`);
      return;
    }

    // 2. Search
    let results = [];
    let synthesis = null;
    if (analysis.actionPlan === 'search' || analysis.actionPlan === 'hybrid') {
      console.log(`[${rid}] 🌐 Researching...`);
      results = await performSearch(analysis.searchQueries || []);

      if (!activeRequests.has(rid)) {
        console.log(`[${rid}] 🛑 Cancelled after Research.`);
        return;
      }

      console.log(`[${rid}] 🧠 Synthesizing...`);
      synthesis = await synthesizeFindings(analysis, results);
    }

    if (!activeRequests.has(rid)) {
      console.log(`[${rid}] 🛑 Cancelled after Synthesis.`);
      return;
    }

    // 3. Memory
    await storeThought({
      id: rid,
      query: prompt,
      analysis,
      results,
      synthesis,
      timestamp: Date.now()
    });

    // IMPORTANT: Only send response if the request is still active
    if (activeRequests.has(rid)) {
      res.json({
        analysis,
        results,
        synthesis,
        status: 'success'
      });
    }

  } catch (error: any) {
    console.error(`[${rid}] ❌ Error:`, error);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Internal server error' });
    }
  } finally {
    activeRequests.delete(rid);
  }
});

app.post('/api/stop', async (req, res) => {
  const { requestId } = req.body;
  if (requestId && activeRequests.has(requestId)) {
    activeRequests.delete(requestId);
    console.log(`🛑 STOP SIGNAL RECEIVED for [${requestId}].`);
    return res.json({ status: 'stopped' });
  }
  res.status(404).json({ error: 'Request not found' });
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`🚀 Backend running at http://localhost:${PORT}`);
});
