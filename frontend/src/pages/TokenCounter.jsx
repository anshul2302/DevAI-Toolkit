import { useState } from 'react';
import { Coins, Zap } from 'lucide-react';
import toast from 'react-hot-toast';
import { analyzeTokens } from '../utils/clientTools';

export default function TokenCounter() {
  const [text, setText] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleAnalyze = () => {
    if (!text.trim()) return toast.error('Enter some text first');
    try {
      const data = analyzeTokens(text);
      setResults(data);
      toast.success('Analysis complete');
    } catch (err) {
      toast.error('Analysis failed');
    }
  };

  const formatCost = (cost) => (cost < 0.01 ? `$${cost.toFixed(6)}` : `$${cost.toFixed(4)}`);

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-amber-500/10 rounded-lg flex items-center justify-center">
          <Coins className="w-5 h-5 text-amber-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Token Counter & Cost Estimator</h1>
          <p className="text-dark-300 text-sm">Count tokens across models and estimate API costs</p>
        </div>
      </div>

      <div className="card mb-6">
        <textarea
          className="textarea-field min-h-[200px]"
          placeholder="Paste your prompt, code, or any text here..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <div className="flex items-center justify-between mt-4">
          <span className="text-sm text-dark-400">
            {text.length.toLocaleString()} chars &middot; {text.split(/\s+/).filter(Boolean).length.toLocaleString()} words
          </span>
          <button onClick={handleAnalyze} disabled={loading} className="btn-primary flex items-center gap-2">
            <Zap size={16} />
            {loading ? 'Analyzing...' : 'Analyze'}
          </button>
        </div>
      </div>

      {results && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {Object.entries(results.results).map(([model, data]) => (
            <div key={model} className="card">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-white text-sm">{model}</h3>
                <span
                  className={`badge ${
                    data.utilization_pct < 25
                      ? 'badge-green'
                      : data.utilization_pct < 75
                      ? 'badge-yellow'
                      : 'badge-red'
                  }`}
                >
                  {data.utilization_pct}% used
                </span>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-dark-400">Tokens</span>
                  <span className="text-white font-mono">{data.tokens.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-dark-400">Input Cost</span>
                  <span className="text-emerald-400 font-mono">{formatCost(data.input_cost)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-dark-400">Output Cost</span>
                  <span className="text-amber-400 font-mono">{formatCost(data.output_cost)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-dark-400">Context Window</span>
                  <span className="text-dark-200 font-mono">{(data.context_window / 1000).toFixed(0)}K</span>
                </div>

                <div className="w-full bg-dark-800 rounded-full h-1.5 mt-1">
                  <div
                    className={`h-1.5 rounded-full transition-all ${
                      data.utilization_pct < 25
                        ? 'bg-green-500'
                        : data.utilization_pct < 75
                        ? 'bg-yellow-500'
                        : 'bg-red-500'
                    }`}
                    style={{ width: `${Math.min(data.utilization_pct, 100)}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
