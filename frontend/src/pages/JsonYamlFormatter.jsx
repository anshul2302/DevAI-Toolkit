import { useState } from 'react';
import { Braces, ArrowRightLeft, Copy } from 'lucide-react';
import toast from 'react-hot-toast';
import { formatData } from '../utils/clientTools';

export default function JsonYamlFormatter() {
  const [input, setInput] = useState('');
  const [fromFormat, setFromFormat] = useState('json');
  const [toFormat, setToFormat] = useState('yaml');
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleConvert = () => {
    if (!input.trim()) return toast.error('Enter some content first');
    try {
      const result = formatData(input, fromFormat, toFormat);
      setOutput(result);
      toast.success('Formatted!');
    } catch (err) {
      toast.error(err.message || 'Format error');
    }
  };

  const handleFormat = () => {
    if (!input.trim()) return toast.error('Enter some content first');
    try {
      const result = formatData(input, fromFormat, fromFormat);
      setOutput(result);
      toast.success('Formatted!');
    } catch (err) {
      toast.error(err.message || 'Format error');
    }
  };

  const swapFormats = () => {
    setFromFormat(toFormat);
    setToFormat(fromFormat);
    if (output) {
      setInput(output);
      setOutput('');
    }
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-orange-500/10 rounded-lg flex items-center justify-center">
          <Braces className="w-5 h-5 text-orange-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">JSON / YAML Formatter</h1>
          <p className="text-dark-300 text-sm">Format, validate, and convert between data formats</p>
        </div>
      </div>

      <div className="flex items-center gap-3 mb-4">
        <select
          className="select-field"
          value={fromFormat}
          onChange={(e) => setFromFormat(e.target.value)}
        >
          <option value="json">JSON</option>
          <option value="yaml">YAML</option>
        </select>

        <button onClick={swapFormats} className="btn-secondary p-2.5" title="Swap formats">
          <ArrowRightLeft size={16} />
        </button>

        <select
          className="select-field"
          value={toFormat}
          onChange={(e) => setToFormat(e.target.value)}
        >
          <option value="json">JSON</option>
          <option value="yaml">YAML</option>
        </select>

        <div className="flex-1" />

        <button onClick={handleFormat} className="btn-secondary">
          Format Only
        </button>
        <button onClick={handleConvert} disabled={loading} className="btn-primary">
          {loading ? 'Converting...' : 'Convert'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="card">
          <h2 className="font-semibold text-white mb-3">
            Input ({fromFormat.toUpperCase()})
          </h2>
          <textarea
            className="textarea-field min-h-[400px]"
            placeholder={
              fromFormat === 'json'
                ? '{\n  "name": "DevAI Toolkit",\n  "version": "1.0.0"\n}'
                : 'name: DevAI Toolkit\nversion: 1.0.0'
            }
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-white">
              Output ({toFormat.toUpperCase()})
            </h2>
            {output && (
              <button
                onClick={() => { navigator.clipboard.writeText(output); toast.success('Copied'); }}
                className="btn-secondary flex items-center gap-2 text-sm"
              >
                <Copy size={14} /> Copy
              </button>
            )}
          </div>
          {output ? (
            <pre className="textarea-field min-h-[400px] whitespace-pre-wrap text-xs">{output}</pre>
          ) : (
            <div className="flex items-center justify-center min-h-[400px] text-dark-500 text-sm">
              Convert or format to see the output
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
