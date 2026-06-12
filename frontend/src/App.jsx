import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import DocToMarkdown from './pages/DocToMarkdown';
import MarkdownToHtml from './pages/MarkdownToHtml';
import TokenCounter from './pages/TokenCounter';
import WasteDetector from './pages/WasteDetector';
import PromptTemplates from './pages/PromptTemplates';
import FileTreeGenerator from './pages/FileTreeGenerator';
import SystemPromptBuilder from './pages/SystemPromptBuilder';
import JsonYamlFormatter from './pages/JsonYamlFormatter';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="doc-to-markdown" element={<DocToMarkdown />} />
        <Route path="markdown-to-html" element={<MarkdownToHtml />} />
        <Route path="token-counter" element={<TokenCounter />} />
        <Route path="waste-detector" element={<WasteDetector />} />
        <Route path="prompt-templates" element={<PromptTemplates />} />
        <Route path="file-tree" element={<FileTreeGenerator />} />
        <Route path="system-prompt" element={<SystemPromptBuilder />} />
        <Route path="json-yaml" element={<JsonYamlFormatter />} />
      </Route>
    </Routes>
  );
}
