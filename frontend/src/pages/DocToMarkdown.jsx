import { useState } from 'react';
import { FileText, Upload, Copy, Download } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api';

export default function DocToMarkdown() {
  const [file, setFile] = useState(null);
  const [markdown, setMarkdown] = useState('');
  const [loading, setLoading] = useState(false);

  const handleUpload = async () => {
    if (!file) return toast.error('Please select a file first');
    setLoading(true);
    try {
      const ext = file.name.split('.').pop().toLowerCase();
      if (ext === 'txt' || ext === 'md' || ext === 'csv' || ext === 'log') {
        const text = await file.text();
        const lines = text.split('\n').map((l) => l.trimEnd()).filter((l, i, arr) => !(l === '' && arr[i - 1] === ''));
        setMarkdown(lines.join('\n\n'));
        toast.success('Converted successfully!');
      } else if (ext === 'docx') {
        const formData = new FormData();
        formData.append('file', file);
        const res = await api.post('/convert/doc-to-markdown', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        setMarkdown(res.data.markdown);
        toast.success('Converted successfully!');
      } else {
        toast.error(`Unsupported file type: .${ext}`);
      }
    } catch (err) {
      toast.error('Conversion failed: ' + (err.message || ''));
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(markdown);
    toast.success('Copied to clipboard');
  };

  const downloadMd = () => {
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = (file?.name?.replace(/\.[^.]+$/, '') || 'output') + '.md';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center">
          <FileText className="w-5 h-5 text-blue-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Doc → Markdown</h1>
          <p className="text-dark-300 text-sm">Convert DOCX or TXT files to clean Markdown</p>
        </div>
      </div>

      <div className="card mb-6">
        <label className="block mb-4">
          <div className="border-2 border-dashed border-dark-600 rounded-lg p-8 text-center cursor-pointer hover:border-accent/50 transition-colors">
            <Upload className="w-8 h-8 text-dark-400 mx-auto mb-3" />
            <p className="text-dark-300 text-sm">
              {file ? file.name : 'Click to upload or drag a .docx or .txt file'}
            </p>
            <input
              type="file"
              accept=".docx,.txt"
              className="hidden"
              onChange={(e) => setFile(e.target.files[0])}
            />
          </div>
        </label>

        <button onClick={handleUpload} disabled={loading || !file} className="btn-primary w-full">
          {loading ? 'Converting...' : 'Convert to Markdown'}
        </button>
      </div>

      {markdown && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-white">Output</h2>
            <div className="flex gap-2">
              <button onClick={copyToClipboard} className="btn-secondary flex items-center gap-2 text-sm">
                <Copy size={14} /> Copy
              </button>
              <button onClick={downloadMd} className="btn-secondary flex items-center gap-2 text-sm">
                <Download size={14} /> Download .md
              </button>
            </div>
          </div>
          <pre className="textarea-field min-h-[300px] overflow-auto whitespace-pre-wrap">{markdown}</pre>
        </div>
      )}
    </div>
  );
}
