import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  Code2,
  Coins,
  SearchX,
  BookTemplate,
  FolderTree,
  MessageSquarePlus,
  Braces,
  Zap,
} from 'lucide-react';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/doc-to-markdown', icon: FileText, label: 'Doc → Markdown' },
  { to: '/markdown-to-html', icon: Code2, label: 'Markdown → HTML' },
  { to: '/token-counter', icon: Coins, label: 'Token Counter' },
  { to: '/waste-detector', icon: SearchX, label: 'Waste Detector' },
  { to: '/prompt-templates', icon: BookTemplate, label: 'Prompt Templates' },
  { to: '/file-tree', icon: FolderTree, label: 'File Tree' },
  { to: '/system-prompt', icon: MessageSquarePlus, label: 'System Prompt' },
  { to: '/json-yaml', icon: Braces, label: 'JSON / YAML' },
];

export default function Sidebar() {
  return (
    <aside className="w-64 bg-dark-900 border-r border-dark-700 flex flex-col">
      <div className="p-5 border-b border-dark-700">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white leading-tight">DevAI</h1>
            <p className="text-xs text-dark-400 leading-tight">Toolkit</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-accent/10 text-accent-light border border-accent/20'
                  : 'text-dark-300 hover:text-gray-100 hover:bg-dark-800'
              }`
            }
          >
            <Icon className="w-4.5 h-4.5 flex-shrink-0" size={18} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-dark-700">
        <p className="text-xs text-dark-500 text-center">v1.0.0 &middot; MIT License</p>
      </div>
    </aside>
  );
}
