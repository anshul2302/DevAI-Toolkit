import { useState, useRef } from 'react';
import { Code2, Copy, Eye, Code, Download, Upload } from 'lucide-react';
import toast from 'react-hot-toast';
import { markdownToHtml } from '../utils/clientTools';

export default function MarkdownToHtml() {
  const [markdown, setMarkdown] = useState('');
  const [html, setHtml] = useState('');
  const [viewMode, setViewMode] = useState('preview');
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  const downloadHtml = () => {
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'output.html';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const text = await file.text();
      setMarkdown(text);
      toast.success(`Loaded ${file.name}`);
    } catch {
      toast.error('Failed to read file');
    }
    e.target.value = '';
  };

  const handleConvert = () => {
    if (!markdown.trim()) return toast.error('Enter some Markdown first');
    try {
      const result = markdownToHtml(markdown);
      setHtml(result);
      toast.success('Converted!');
    } catch (err) {
      toast.error('Conversion failed');
    }
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-emerald-500/10 rounded-lg flex items-center justify-center">
          <Code2 className="w-5 h-5 text-emerald-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Markdown → HTML</h1>
          <p className="text-dark-300 text-sm">Convert Markdown to styled HTML with syntax highlighting</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="card">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-white">Markdown Input</h2>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="btn-secondary flex items-center gap-2 text-sm"
            >
              <Upload size={14} /> Upload File
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".md,.txt,.markdown,.mdx,.text"
              className="hidden"
              onChange={handleFileUpload}
            />
          </div>
          <textarea
            className="textarea-field min-h-[400px]"
            placeholder="# Hello World\n\nType your **markdown** here or upload a file..."
            value={markdown}
            onChange={(e) => setMarkdown(e.target.value)}
          />
          <button onClick={handleConvert} disabled={loading} className="btn-primary w-full mt-4">
            {loading ? 'Converting...' : 'Convert'}
          </button>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-white">Output</h2>
            <div className="flex gap-1">
              <button
                onClick={() => setViewMode('preview')}
                className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                  viewMode === 'preview' ? 'bg-accent text-white' : 'bg-dark-700 text-dark-300'
                }`}
              >
                <Eye size={14} className="inline mr-1" /> Preview
              </button>
              <button
                onClick={() => setViewMode('code')}
                className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                  viewMode === 'code' ? 'bg-accent text-white' : 'bg-dark-700 text-dark-300'
                }`}
              >
                <Code size={14} className="inline mr-1" /> HTML
              </button>
            </div>
          </div>

          {html ? (
            viewMode === 'preview' ? (
              <div>
                <div className="bg-white rounded-lg min-h-[400px] overflow-auto">
                  <iframe
                    srcDoc={html}
                    className="w-full min-h-[400px] rounded-lg"
                    title="HTML Preview"
                    sandbox=""
                  />
                </div>
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => { navigator.clipboard.writeText(html); toast.success('HTML copied'); }}
                    className="btn-secondary flex items-center gap-2 text-sm"
                  >
                    <Copy size={14} /> Copy HTML
                  </button>
                  <button onClick={downloadHtml} className="btn-secondary flex items-center gap-2 text-sm">
                    <Download size={14} /> Download .html
                  </button>
                </div>
              </div>
            ) : (
              <div className="relative">
                <pre className="textarea-field min-h-[400px] overflow-auto whitespace-pre-wrap text-xs">
                  {html}
                </pre>
                <div className="absolute top-2 right-2 flex gap-1">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(html);
                      toast.success('HTML copied');
                    }}
                    className="btn-secondary text-xs flex items-center gap-1"
                  >
                    <Copy size={12} /> Copy
                  </button>
                  <button
                    onClick={downloadHtml}
                    className="btn-secondary text-xs flex items-center gap-1"
                  >
                    <Download size={12} /> Download
                  </button>
                </div>
              </div>
            )
          ) : (
            <div className="flex items-center justify-center min-h-[400px] text-dark-500 text-sm">
              Convert Markdown to see the output here
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
