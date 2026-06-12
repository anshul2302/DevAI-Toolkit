import { useState } from 'react';
import { MessageSquarePlus, Copy, Plus, X, Download } from 'lucide-react';
import toast from 'react-hot-toast';
import { buildSystemPrompts } from '../utils/clientTools';

export default function SystemPromptBuilder() {
  const [role, setRole] = useState('');
  const [expertise, setExpertise] = useState([]);
  const [expertiseInput, setExpertiseInput] = useState('');
  const [tone, setTone] = useState('professional');
  const [constraints, setConstraints] = useState([]);
  const [constraintInput, setConstraintInput] = useState('');
  const [outputFormat, setOutputFormat] = useState('');
  const [results, setResults] = useState([]);
  const [activeTab, setActiveTab] = useState(0);

  const addTag = (list, setList, input, setInput) => {
    const val = input.trim();
    if (val && !list.includes(val)) {
      setList([...list, val]);
      setInput('');
    }
  };

  const removeTag = (list, setList, idx) => {
    setList(list.filter((_, i) => i !== idx));
  };

  const handleBuild = () => {
    if (!role.trim()) return toast.error('Enter a role');
    try {
      const prompts = buildSystemPrompts({
        role,
        expertise,
        tone,
        constraints: constraints.length > 0 ? constraints : null,
        outputFormat: outputFormat || null,
      });
      setResults(prompts);
      setActiveTab(0);
      toast.success('3 production-grade prompts generated');
    } catch (err) {
      toast.error('Failed to generate prompts');
    }
  };

  const downloadPrompt = (text, label) => {
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `system-prompt-${label.toLowerCase().replace(/\s+/g, '-')}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const tones = [
    { value: 'professional', label: 'Professional' },
    { value: 'casual', label: 'Casual' },
    { value: 'academic', label: 'Academic' },
    { value: 'concise', label: 'Concise' },
    { value: 'teaching', label: 'Teaching' },
  ];

  const tabColors = ['bg-emerald-500/10 text-emerald-400 border-emerald-500/30', 'bg-blue-500/10 text-blue-400 border-blue-500/30', 'bg-amber-500/10 text-amber-400 border-amber-500/30'];
  const tabColorsActive = ['bg-emerald-500/20 text-emerald-300 border-emerald-400', 'bg-blue-500/20 text-blue-300 border-blue-400', 'bg-amber-500/20 text-amber-300 border-amber-400'];

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-pink-500/10 rounded-lg flex items-center justify-center">
          <MessageSquarePlus className="w-5 h-5 text-pink-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">System Prompt Builder</h1>
          <p className="text-dark-300 text-sm">Generate 3 production-grade system prompts from minimal input</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="card">
            <h2 className="font-semibold text-white mb-3">1. Define the Role</h2>
            <input
              className="input-field"
              placeholder="e.g. Product Manager, Software Engineer, Data Scientist..."
              value={role}
              onChange={(e) => setRole(e.target.value)}
            />
          </div>

          <div className="card">
            <h2 className="font-semibold text-white mb-3">2. Areas of Expertise</h2>
            <div className="flex gap-2 mb-3">
              <input
                className="input-field"
                placeholder="Add expertise (press Enter)"
                value={expertiseInput}
                onChange={(e) => setExpertiseInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addTag(expertise, setExpertise, expertiseInput, setExpertiseInput)}
              />
              <button
                onClick={() => addTag(expertise, setExpertise, expertiseInput, setExpertiseInput)}
                className="btn-secondary"
              >
                <Plus size={16} />
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {expertise.map((e, i) => (
                <span key={i} className="badge badge-blue flex items-center gap-1">
                  {e}
                  <button onClick={() => removeTag(expertise, setExpertise, i)}>
                    <X size={12} />
                  </button>
                </span>
              ))}
            </div>
            <p className="text-xs text-dark-500 mt-2">Leave empty for smart defaults based on your role</p>
          </div>

          <div className="card">
            <h2 className="font-semibold text-white mb-3">3. Tone</h2>
            <div className="grid grid-cols-3 gap-2">
              {tones.map((t) => (
                <button
                  key={t.value}
                  onClick={() => setTone(t.value)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors border ${
                    tone === t.value
                      ? 'bg-accent/10 text-accent-light border-accent/30'
                      : 'bg-dark-800 text-dark-300 border-dark-600 hover:border-dark-500'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div className="card">
            <h2 className="font-semibold text-white mb-3">4. Constraints (optional)</h2>
            <div className="flex gap-2 mb-3">
              <input
                className="input-field"
                placeholder="Add constraint (press Enter)"
                value={constraintInput}
                onChange={(e) => setConstraintInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addTag(constraints, setConstraints, constraintInput, setConstraintInput)}
              />
              <button
                onClick={() => addTag(constraints, setConstraints, constraintInput, setConstraintInput)}
                className="btn-secondary"
              >
                <Plus size={16} />
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {constraints.map((c, i) => (
                <span key={i} className="badge badge-yellow flex items-center gap-1">
                  {c}
                  <button onClick={() => removeTag(constraints, setConstraints, i)}>
                    <X size={12} />
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div className="card">
            <h2 className="font-semibold text-white mb-3">5. Output Format (optional)</h2>
            <input
              className="input-field"
              placeholder="e.g. JSON, Markdown, bullet points, code only..."
              value={outputFormat}
              onChange={(e) => setOutputFormat(e.target.value)}
            />
          </div>

          <button onClick={handleBuild} className="btn-primary w-full">
            Generate 3 System Prompts
          </button>
        </div>

        <div className="sticky top-8 self-start space-y-0">
          {results.length > 0 ? (
            <>
              <div className="flex gap-1 mb-0">
                {results.map((r, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveTab(i)}
                    className={`px-4 py-2.5 rounded-t-lg text-sm font-medium transition-colors border border-b-0 ${
                      activeTab === i ? tabColorsActive[i] : tabColors[i] + ' opacity-60 hover:opacity-100'
                    }`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
              <div className="card rounded-tl-none">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-dark-400">{results[activeTab].description}</p>
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => { navigator.clipboard.writeText(results[activeTab].prompt); toast.success('Copied'); }}
                      className="btn-secondary flex items-center gap-1.5 text-sm"
                    >
                      <Copy size={13} /> Copy
                    </button>
                    <button
                      onClick={() => downloadPrompt(results[activeTab].prompt, results[activeTab].label)}
                      className="btn-secondary flex items-center gap-1.5 text-sm"
                    >
                      <Download size={13} /> .md
                    </button>
                  </div>
                </div>
                <pre className="textarea-field min-h-[500px] whitespace-pre-wrap text-sm">{results[activeTab].prompt}</pre>
              </div>
            </>
          ) : (
            <div className="card">
              <div className="flex flex-col items-center justify-center min-h-[400px] text-dark-500 text-sm text-center px-6">
                <MessageSquarePlus className="w-10 h-10 mb-3 opacity-30" />
                <p className="mb-2">Fill in the form and click Generate</p>
                <p className="text-xs text-dark-600">You'll get 3 prompt variants:<br/>Comprehensive · Focused Operator · Minimal & Potent</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
