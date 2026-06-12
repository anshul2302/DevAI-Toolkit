import { useState } from 'react';
import { SearchX, AlertTriangle, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { detectWaste } from '../utils/clientTools';

export default function WasteDetector() {
  const [transcript, setTranscript] = useState('');
  const [model, setModel] = useState('gpt-4o');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleDetect = () => {
    if (!transcript.trim()) return toast.error('Paste a transcript first');
    try {
      const data = detectWaste(transcript);
      setResult(data);
      toast.success('Analysis complete');
    } catch (err) {
      toast.error('Analysis failed');
    }
  };

  const typeColors = {
    duplicate: 'text-red-400 bg-red-500/10',
    filler: 'text-yellow-400 bg-yellow-500/10',
    verbose: 'text-orange-400 bg-orange-500/10',
    repeated_instruction: 'text-purple-400 bg-purple-500/10',
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-red-500/10 rounded-lg flex items-center justify-center">
          <SearchX className="w-5 h-5 text-red-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Transcript Waste Detector</h1>
          <p className="text-dark-300 text-sm">Find wasted tokens in AI conversation transcripts</p>
        </div>
      </div>

      <div className="card mb-6">
        <div className="flex items-center gap-3 mb-3">
          <label className="text-sm text-dark-300">Model:</label>
          <select
            className="select-field text-sm"
            value={model}
            onChange={(e) => setModel(e.target.value)}
          >
            <option value="gpt-4o">GPT-4o</option>
            <option value="gpt-4o-mini">GPT-4o Mini</option>
            <option value="claude-3.5-sonnet">Claude 3.5 Sonnet</option>
            <option value="gemini-1.5-pro">Gemini 1.5 Pro</option>
          </select>
        </div>

        <textarea
          className="textarea-field min-h-[250px]"
          placeholder="Paste your AI conversation transcript here..."
          value={transcript}
          onChange={(e) => setTranscript(e.target.value)}
        />
        <button onClick={handleDetect} disabled={loading} className="btn-primary w-full mt-4">
          {loading ? 'Analyzing...' : 'Detect Waste'}
        </button>
      </div>

      {result && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="card text-center">
              <p className="text-dark-400 text-sm mb-1">Efficiency Score</p>
              <p
                className={`text-3xl font-bold ${
                  result.efficiency_score >= 80
                    ? 'text-green-400'
                    : result.efficiency_score >= 50
                    ? 'text-yellow-400'
                    : 'text-red-400'
                }`}
              >
                {result.efficiency_score}%
              </p>
            </div>
            <div className="card text-center">
              <p className="text-dark-400 text-sm mb-1">Total Tokens</p>
              <p className="text-3xl font-bold text-white">{result.total_tokens.toLocaleString()}</p>
            </div>
            <div className="card text-center">
              <p className="text-dark-400 text-sm mb-1">Wasted Tokens</p>
              <p className="text-3xl font-bold text-red-400">{result.waste_tokens.toLocaleString()}</p>
            </div>
          </div>

          {result.issues.length > 0 ? (
            <div className="card">
              <h2 className="font-semibold text-white mb-4 flex items-center gap-2">
                <AlertTriangle size={16} className="text-yellow-400" />
                Issues Found ({result.issue_count})
              </h2>
              <div className="space-y-3">
                {result.issues.map((issue, i) => (
                  <div key={i} className="bg-dark-800 rounded-lg p-4 border border-dark-700">
                    <div className="flex items-center gap-2 mb-2">
                      <span
                        className={`badge text-xs px-2 py-0.5 rounded ${
                          typeColors[issue.type] || 'text-dark-300 bg-dark-700'
                        }`}
                      >
                        {issue.type}
                      </span>
                      <span className="text-dark-500 text-xs">Line {issue.line}</span>
                      <span className="text-dark-500 text-xs">&middot; {issue.wasted_tokens} tokens wasted</span>
                    </div>
                    <p className="text-sm text-dark-200 font-mono mb-1.5">"{issue.text}"</p>
                    <p className="text-xs text-dark-400">{issue.suggestion}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="card flex items-center gap-3 text-green-400">
              <CheckCircle2 size={20} />
              <span>No waste detected — transcript looks well-optimized!</span>
            </div>
          )}
        </>
      )}
    </div>
  );
}
