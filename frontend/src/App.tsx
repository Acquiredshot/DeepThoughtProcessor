import React, { useState } from 'react';
import axios from 'axios';
import { Search, Brain, Database, ExternalLink, Loader2, Sparkles, CheckCircle2, XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const API_BASE = 'http://localhost:3001/api';

export default function ThoughtProcessorUI() {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [step, setStep] = useState(0);
  const [currentRequestId, setCurrentRequestId] = useState<string | null>(null);

  const steps = [
    { id: 1, label: 'Gap Analysis', icon: Brain },
    { id: 2, label: 'Autonomous Research', icon: Search },
    { id: 3, label: 'Synthesis', icon: Sparkles },
  ];

  const handleProcess = async () => {
    if (!prompt) return;

    const rid = Date.now().toString();
    setCurrentRequestId(rid);
    setLoading(true);
    setResult(null);
    setStep(1);

    try {
      setTimeout(() => setStep(2), 1500);
      setTimeout(() => setStep(3), 3000);

      const response = await axios.post(`${API_BASE}/process`, {
        prompt,
        requestId: rid
      });
      setResult(response.data);
    } catch (error) {
      console.error('Error:', error);
      // We don't alert if it was a manual stop
      if (!currentRequestId) alert('Failed to connect to the ThoughtProcessor backend.');
    } finally {
      setLoading(false);
      setStep(0);
      setCurrentRequestId(null);
    }
  };

  const handleStop = async () => {
    if (!currentRequestId) return;
    try {
      await axios.post(`${API_BASE}/stop`, { requestId: currentRequestId });
      setLoading(false);
      setStep(0);
      setCurrentRequestId(null);
    } catch (error) {
      console.error('Stop error:', error);
    }
  };

  return (
    <div className="min-h-screen p-8 bg-brand-bg text-brand-text">
      <div className="max-w-5xl mx-auto">
        <header className="flex items-center gap-4 mb-12">
          <div className="p-3 bg-brand-accent rounded-xl text-brand-bg">
            <Brain size={32} strokeWidth={3} />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">ThoughtProcessor</h1>
            <p className="text-slate-400">Autonomous Technical Research Agent</p>
          </div>
        </header>

        <div className="relative mb-12">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleProcess()}
            placeholder="Enter a complex technical query..."
            className="w-full p-6 pr-44 bg-brand-card rounded-2xl border border-slate-700 focus:border-brand-accent outline-none text-xl transition-all shadow-2xl"
          />
          <div className="absolute right-3 top-3 bottom-3 flex gap-2">
            {loading && (
              <button
                onClick={handleStop}
                className="px-4 bg-red-500/20 text-red-400 border border-red-500/50 font-bold rounded-xl hover:bg-red-500 hover:text-white transition-all flex items-center gap-2"
              >
                <XCircle size={20} />
                Stop
              </button>
            )}
            <button
              onClick={handleProcess}
              disabled={loading}
              className="px-6 bg-brand-accent text-brand-bg font-bold rounded-xl hover:bg-sky-400 disabled:opacity-50 transition-colors flex items-center gap-2"
            >
              {loading ? <Loader2 className="animate-spin" /> : <Search size={20} />}
              {loading ? 'Processing...' : 'Research'}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {loading && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex justify-between mb-12 relative"
            >
              <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-800 -translate-y-1/2 z-0" />
              {steps.map((s) => {
                const Icon = s.icon;
                const isActive = step >= s.id;
                const isCurrent = step === s.id;
                return (
                  <div key={s.id} className="relative z-10 flex flex-col items-center gap-2">
                    <div className={`p-4 rounded-full transition-all duration-500 ${
                      isActive ? 'bg-brand-accent text-brand-bg' : 'bg-brand-card text-slate-500'
                    } ${isCurrent ? 'ring-4 ring-brand-accent/30 scale-110' : ''}`}>
                      <Icon size={24} />
                    </div>
                    <span className={`text-sm font-medium ${isActive ? 'text-brand-text' : 'text-slate-500'}`}>
                      {s.label}
                    </span>
                  </div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>

        {result && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          >
            <div className="lg:col-span-1 space-y-6">
              <div className="p-6 bg-brand-card rounded-2xl border border-slate-700">
                <div className="flex items-center gap-2 mb-4 text-brand-accent font-bold">
                  <Brain size={20} /> <h2>Gap Analysis</h2>
                </div>
                <div className="space-y-4">
                  <div>
                    <p className="text-xs text-slate-500 uppercase font-bold mb-1">Core Intent</p>
                    <p className="text-sm">{result.analysis.coreIntent}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase font-bold mb-1">Knowns</p>
                    <div className="flex flex-wrap gap-2">
                      {result.analysis.knowns.map((k: string, i: number) => (
                        <span key={i} className="px-2 py-1 bg-slate-800 text-xs rounded-md border border-slate-700">{k}</span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase font-bold mb-1">Unknowns</p>
                    <div className="flex flex-wrap gap-2">
                      {result.analysis.unknowns.map((u: string, i: number) => (
                        <span key={i} className="px-2 py-1 bg-red-900/30 text-red-400 text-xs rounded-md border border-red-800/50">{u}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-6 bg-brand-card rounded-2xl border border-slate-700">
                <div className="flex items-center gap-2 mb-4 text-brand-accent font-bold">
                  <Database size={20} /> <h2>Stored in Memory</h2>
                </div>
                <div className="flex items-center gap-2 text-green-400 text-sm">
                  <CheckCircle2 size={16} /> Thought persisted to local vector DB
                </div>
              </div>
            </div>

            <div className="lg:col-span-2 space-y-6">
              <div className="p-8 bg-brand-card rounded-2xl border border-slate-700 shadow-xl">
                <div className="flex items-center gap-2 mb-6 text-brand-accent font-bold text-xl">
                  <Sparkles size={24} /> <h2>Final Solution</h2>
                </div>

                <div className="space-y-6">
                  <section>
                    <p className="text-xs text-slate-500 uppercase font-bold mb-2">The TL;DR</p>
                    <p className="text-lg leading-relaxed">{result.synthesis.answer}</p>
                  </section>

                  <section>
                    <p className="text-xs text-slate-500 uppercase font-bold mb-2">Implementation Pattern</p>
                    <div className="p-4 bg-black rounded-xl border border-slate-800 font-mono text-sm overflow-x-auto">
                      <pre className="text-sky-300">{result.synthesis.code}</pre>
                    </div>
                  </section>

                  <section>
                    <p className="text-xs text-slate-500 uppercase font-bold mb-2">Verified References</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {result.results.map((res: any, i: number) => (
                        <a
                          key={i}
                          href={res.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-3 bg-slate-800 rounded-lg border border-slate-700 hover:border-brand-accent transition-colors flex items-center justify-between group"
                        >
                          <span className="text-sm truncate mr-2">{res.title}</span>
                          <ExternalLink size={14} className="text-slate-500 group-hover:text-brand-accent" />
                        </a>
                      ))}
                    </div>
                  </section>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
