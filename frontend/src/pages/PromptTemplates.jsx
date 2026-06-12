import { useState, useEffect } from 'react';
import { BookTemplate, Plus, Trash2, Copy, Edit3, X, Save } from 'lucide-react';
import toast from 'react-hot-toast';

export default function PromptTemplates() {
  const [templates, setTemplates] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', category: 'general', description: '', template: '', variables: '' });

  useEffect(() => {
    loadTemplates();
  }, []);

  const STORAGE_KEY = 'devai_prompt_templates';

  const loadTemplates = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      setTemplates(stored ? JSON.parse(stored) : []);
    } catch {
      setTemplates([]);
    }
  };

  const saveToStorage = (list) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    setTemplates(list);
  };

  const handleSave = () => {
    if (!form.name.trim() || !form.template.trim()) return toast.error('Name and template are required');
    const payload = {
      name: form.name,
      category: form.category,
      description: form.description,
      template: form.template,
      variables: form.variables ? form.variables.split(',').map((v) => v.trim()) : [],
    };
    let updated;
    if (editing) {
      updated = templates.map((t) => (t.id === editing ? { ...t, ...payload } : t));
      toast.success('Template updated');
    } else {
      updated = [{ id: Date.now(), ...payload }, ...templates];
      toast.success('Template created');
    }
    saveToStorage(updated);
    resetForm();
  };

  const handleDelete = (id) => {
    const updated = templates.filter((t) => t.id !== id);
    saveToStorage(updated);
    toast.success('Deleted');
  };

  const resetForm = () => {
    setForm({ name: '', category: 'general', description: '', template: '', variables: '' });
    setEditing(null);
    setShowForm(false);
  };

  const startEdit = (t) => {
    setForm({
      name: t.name,
      category: t.category,
      description: t.description || '',
      template: t.template,
      variables: (t.variables || []).join(', '),
    });
    setEditing(t.id);
    setShowForm(true);
  };

  const categories = ['general', 'coding', 'writing', 'analysis', 'debugging', 'testing'];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-purple-500/10 rounded-lg flex items-center justify-center">
            <BookTemplate className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Prompt Templates</h1>
            <p className="text-dark-300 text-sm">Save and reuse prompt templates with variables</p>
          </div>
        </div>
        <button
          onClick={() => { setShowForm(!showForm); if (showForm) resetForm(); }}
          className="btn-primary flex items-center gap-2"
        >
          {showForm ? <X size={16} /> : <Plus size={16} />}
          {showForm ? 'Cancel' : 'New Template'}
        </button>
      </div>

      {showForm && (
        <div className="card mb-6">
          <h2 className="font-semibold text-white mb-4">{editing ? 'Edit Template' : 'New Template'}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <input
              className="input-field"
              placeholder="Template name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            <select
              className="select-field w-full"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
            >
              {categories.map((c) => (
                <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
              ))}
            </select>
          </div>
          <input
            className="input-field mb-4"
            placeholder="Short description (optional)"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
          <textarea
            className="textarea-field min-h-[200px] mb-4"
            placeholder="Your prompt template... Use {{variable_name}} for variables"
            value={form.template}
            onChange={(e) => setForm({ ...form, template: e.target.value })}
          />
          <input
            className="input-field mb-4"
            placeholder="Variables (comma-separated, e.g. language, framework, task)"
            value={form.variables}
            onChange={(e) => setForm({ ...form, variables: e.target.value })}
          />
          <button onClick={handleSave} className="btn-primary flex items-center gap-2">
            <Save size={16} /> {editing ? 'Update' : 'Save'} Template
          </button>
        </div>
      )}

      {templates.length === 0 ? (
        <div className="card text-center py-12 text-dark-400">
          <BookTemplate className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No templates yet. Create your first one!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {templates.map((t) => (
            <div key={t.id} className="card">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-semibold text-white">{t.name}</h3>
                  {t.description && <p className="text-sm text-dark-400 mt-0.5">{t.description}</p>}
                </div>
                <div className="flex items-center gap-1">
                  <span className="badge badge-blue mr-2">{t.category}</span>
                  <button onClick={() => { navigator.clipboard.writeText(t.template); toast.success('Copied'); }}
                    className="p-1.5 hover:bg-dark-700 rounded transition-colors text-dark-400 hover:text-white">
                    <Copy size={14} />
                  </button>
                  <button onClick={() => startEdit(t)}
                    className="p-1.5 hover:bg-dark-700 rounded transition-colors text-dark-400 hover:text-white">
                    <Edit3 size={14} />
                  </button>
                  <button onClick={() => handleDelete(t.id)}
                    className="p-1.5 hover:bg-dark-700 rounded transition-colors text-dark-400 hover:text-red-400">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              <pre className="text-xs text-dark-300 bg-dark-800 rounded-lg p-3 mt-2 whitespace-pre-wrap font-mono max-h-32 overflow-y-auto">
                {t.template}
              </pre>
              {t.variables && t.variables.length > 0 && (
                <div className="flex gap-1.5 mt-2 flex-wrap">
                  {t.variables.map((v) => (
                    <span key={v} className="badge bg-dark-700 text-dark-300 text-xs">{`{{${v}}}`}</span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
