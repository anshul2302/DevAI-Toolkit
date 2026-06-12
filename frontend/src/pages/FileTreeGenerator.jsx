import { useState } from 'react';
import { FolderTree, Copy } from 'lucide-react';
import toast from 'react-hot-toast';

export default function FileTreeGenerator() {
  const [fileList, setFileList] = useState('');
  const [rootName, setRootName] = useState('my-project');
  const [tree, setTree] = useState('');

  const handleGenerate = () => {
    if (!fileList.trim()) return toast.error('Paste a file list first');
    const paths = fileList
      .split('\n')
      .map((l) => l.trim().replace(/\\/g, '/'))
      .filter(Boolean)
      .sort();

    const treeObj = {};
    for (const p of paths) {
      const parts = p.split('/');
      let node = treeObj;
      for (const part of parts) {
        if (!node[part]) node[part] = {};
        node = node[part];
      }
    }

    const lines = [`${rootName}/`];
    renderTree(treeObj, '', lines);
    setTree(lines.join('\n'));
    toast.success('Tree generated');
  };

  const renderTree = (node, prefix, lines) => {
    const keys = Object.keys(node);
    keys.forEach((key, i) => {
      const isLast = i === keys.length - 1;
      const connector = isLast ? '└── ' : '├── ';
      const hasChildren = Object.keys(node[key]).length > 0;
      lines.push(`${prefix}${connector}${key}${hasChildren ? '/' : ''}`);
      if (hasChildren) {
        renderTree(node[key], prefix + (isLast ? '    ' : '│   '), lines);
      }
    });
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-cyan-500/10 rounded-lg flex items-center justify-center">
          <FolderTree className="w-5 h-5 text-cyan-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">File Tree Generator</h1>
          <p className="text-dark-300 text-sm">Paste file paths to generate a tree structure for AI prompts</p>
        </div>
      </div>

      <div className="card mb-6">
        <div className="mb-4">
          <label className="text-sm text-dark-400 mb-1 block">Root Name</label>
          <input
            className="input-field"
            placeholder="my-project"
            value={rootName}
            onChange={(e) => setRootName(e.target.value)}
          />
        </div>

        <label className="text-sm text-dark-400 mb-1 block">
          File Paths (one per line — paste output of <code className="text-accent text-xs">find</code>, <code className="text-accent text-xs">tree</code>, or <code className="text-accent text-xs">dir /s /b</code>)
        </label>
        <textarea
          className="textarea-field min-h-[200px] mb-4"
          placeholder={"src/App.jsx\nsrc/main.jsx\nsrc/components/Layout.jsx\nsrc/pages/Dashboard.jsx\npackage.json\nvite.config.js"}
          value={fileList}
          onChange={(e) => setFileList(e.target.value)}
        />

        <button onClick={handleGenerate} className="btn-primary w-full">
          Generate Tree
        </button>
      </div>

      {tree && (
        <div className="card">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-white">Project Tree</h2>
            <button
              onClick={() => { navigator.clipboard.writeText(tree); toast.success('Copied'); }}
              className="btn-secondary flex items-center gap-2 text-sm"
            >
              <Copy size={14} /> Copy
            </button>
          </div>
          <pre className="textarea-field min-h-[300px] overflow-auto whitespace-pre text-xs">{tree}</pre>
        </div>
      )}
    </div>
  );
}
