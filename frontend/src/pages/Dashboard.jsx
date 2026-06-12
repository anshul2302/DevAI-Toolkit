import { Link } from 'react-router-dom';
import {
  FileText,
  Code2,
  Coins,
  SearchX,
  BookTemplate,
  FolderTree,
  MessageSquarePlus,
  Braces,
} from 'lucide-react';

const tools = [
  {
    to: '/doc-to-markdown',
    icon: FileText,
    title: 'Doc → Markdown',
    desc: 'Convert DOCX and TXT files to clean, well-formatted Markdown.',
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
  },
  {
    to: '/markdown-to-html',
    icon: Code2,
    title: 'Markdown → HTML',
    desc: 'Convert Markdown to styled HTML with syntax highlighting.',
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
  },
  {
    to: '/token-counter',
    icon: Coins,
    title: 'Token Counter & Cost',
    desc: 'Count tokens across GPT-4o, Claude, Gemini and estimate API costs.',
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
  },
  {
    to: '/waste-detector',
    icon: SearchX,
    title: 'Waste Detector',
    desc: 'Analyze AI conversation transcripts for wasted tokens and filler.',
    color: 'text-red-400',
    bg: 'bg-red-500/10',
  },
  {
    to: '/prompt-templates',
    icon: BookTemplate,
    title: 'Prompt Templates',
    desc: 'Save, organize, and reuse prompt templates with variables.',
    color: 'text-purple-400',
    bg: 'bg-purple-500/10',
  },
  {
    to: '/file-tree',
    icon: FolderTree,
    title: 'File Tree Generator',
    desc: 'Generate project directory tree for AI context and documentation.',
    color: 'text-cyan-400',
    bg: 'bg-cyan-500/10',
  },
  {
    to: '/system-prompt',
    icon: MessageSquarePlus,
    title: 'System Prompt Builder',
    desc: 'Build effective system prompts with a guided wizard.',
    color: 'text-pink-400',
    bg: 'bg-pink-500/10',
  },
  {
    to: '/json-yaml',
    icon: Braces,
    title: 'JSON / YAML Formatter',
    desc: 'Format, validate, and convert between JSON and YAML.',
    color: 'text-orange-400',
    bg: 'bg-orange-500/10',
  },
];

export default function Dashboard() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">DevAI Toolkit</h1>
        <p className="text-dark-300 mt-2 text-lg">
          Tools to help developers get the most out of AI.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tools.map(({ to, icon: Icon, title, desc, color, bg }) => (
          <Link
            key={to}
            to={to}
            className="card group hover:border-dark-500 transition-all duration-200 hover:-translate-y-0.5"
          >
            <div className={`w-10 h-10 ${bg} rounded-lg flex items-center justify-center mb-4`}>
              <Icon className={`w-5 h-5 ${color}`} />
            </div>
            <h3 className="font-semibold text-white group-hover:text-accent-light transition-colors">
              {title}
            </h3>
            <p className="text-sm text-dark-300 mt-1.5 leading-relaxed">{desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
