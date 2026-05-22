import React, { useState } from 'react';
import { useAgent } from '../lib/agent-context';
import { BrainCircuit, Plus, Tag, Flame, ShieldAlert, Sparkles, AlertCircle, Trash2, Search } from 'lucide-react';
import { Memory } from '../types';

export default function MemoryHub() {
  const { memories, addNewMemory, deleteMemory, appendLog } = useAgent();
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<Memory['category']>('preference');
  const [importance, setImportance] = useState(5);
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);

  // Search and Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    await addNewMemory(
      content.trim(),
      category,
      importance,
      tags.length > 0 ? tags : [category]
    );

    appendLog(`Learned new context fact under category "${category}".`, "success");

    setContent('');
    setCategory('preference');
    setImportance(5);
    setTags([]);
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim().toLowerCase())) {
      setTags([...tags, tagInput.trim().toLowerCase()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (t: string) => {
    setTags(tags.filter(tag => tag !== t));
  };

  const getImportanceColor = (imp: number) => {
    if (imp >= 8) return 'text-rose-600 border-rose-100 bg-rose-50/50';
    if (imp >= 5) return 'text-amber-600 border-amber-100 bg-amber-50/50';
    return 'text-blue-600 border-blue-100 bg-blue-50/50';
  };

  // Filtering Memory items intelligently
  const filteredMemories = memories.filter(memory => {
    const matchesSearch = 
      memory.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      memory.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = 
      selectedCategoryFilter === 'all' || 
      memory.category === selectedCategoryFilter;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="flex flex-col h-full space-y-4">
      {/* Header board */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center space-x-2">
          <BrainCircuit className="w-5 h-5 text-blue-600" />
          <div className="text-left">
            <h2 className="text-xs font-bold tracking-tight text-slate-800 uppercase font-mono">
              Memory Hub & Context Engine
            </h2>
            <p className="text-[10px] text-slate-400 font-mono uppercase tracking-wide">
              {memories.length} SEMANTIC ENCLAVES CRYSTALLIZED
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Teach / Input Column (Colspan 5) */}
        <form onSubmit={handleCreate} className="lg:col-span-5 p-4 border border-slate-100 bg-slate-50/50 rounded-2xl space-y-3.5 relative text-left">
          <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center space-x-1.5 font-mono">
            <Sparkles className="w-4 h-4 text-blue-500 animate-pulse" />
            <span>Encode Synaptic Memory</span>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-[9px] font-bold font-mono text-slate-400 uppercase mb-1">Context Fact or Preference</label>
              <textarea
                required
                value={content}
                onChange={e => setContent(e.target.value)}
                placeholder="e.g. Administrator prefers light-theme Arc interface, logs syncing weekly."
                rows={2}
                className="w-full px-3 py-1.5 text-xs bg-white border border-slate-150 text-slate-800 placeholder-slate-400 rounded-xl focus:outline-none focus:border-blue-400 resize-none font-sans"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[9px] font-bold font-mono text-slate-400 uppercase mb-1">Category</label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value as Memory['category'])}
                  className="w-full px-2 py-1.5 text-xs bg-white border border-slate-150 text-slate-700 rounded-lg focus:outline-none"
                >
                  <option value="preference">Preference</option>
                  <option value="fact">Fact</option>
                  <option value="context">Context</option>
                  <option value="history">History</option>
                </select>
              </div>

              <div>
                <label className="block text-[9px] font-bold font-mono text-slate-400 uppercase mb-1">Significance ({importance})</label>
                <input 
                  type="range"
                  min="1"
                  max="10"
                  value={importance}
                  onChange={e => setImportance(Number(e.target.value))}
                  className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600 mt-2"
                />
              </div>
            </div>

            <div>
              <label className="block text-[9px] font-bold font-mono text-slate-400 uppercase mb-1">Tags</label>
              <div className="flex space-x-1.5">
                <input
                  type="text"
                  value={tagInput}
                  onChange={e => setTagInput(e.target.value)}
                  placeholder="e.g. workspace, user"
                  className="flex-1 px-3 py-1 bg-white border border-slate-150 text-slate-800 text-xs rounded-lg focus:outline-none placeholder-slate-400"
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  className="px-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold rounded-lg transition"
                >
                  +
                </button>
              </div>

              {tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {tags.map(t => (
                    <span 
                      key={t}
                      onClick={() => handleRemoveTag(t)}
                      className="text-[9px] px-2 py-0.5 border border-slate-100 bg-white hover:bg-rose-50 hover:text-rose-600 rounded-full cursor-pointer transition uppercase font-semibold text-slate-500"
                    >
                      {t} ×
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="pt-1 flex justify-end">
            <button 
              type="submit"
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg transition hover:shadow-md cursor-pointer"
            >
              LEARN CONTEXT
            </button>
          </div>
        </form>

        {/* Intelligent Search, Filters, and Memory Grid (Colspan 7) */}
        <div className="lg:col-span-7 flex flex-col space-y-3 text-left">
          {/* Custom Search bar design inside MemoryHub */}
          <div className="flex gap-2 items-center">
            {/* Search Input Container */}
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search semantic enclaves and tags..."
                className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-100 placeholder-slate-400 text-slate-800 text-xs rounded-xl focus:outline-none focus:border-blue-400 shadow-sm"
              />
            </div>
            
            {/* Category Filter selector */}
            <select
              value={selectedCategoryFilter}
              onChange={e => setSelectedCategoryFilter(e.target.value)}
              className="px-2.5 py-1.5 bg-white border border-slate-100 text-[11px] font-bold text-slate-500 rounded-xl focus:outline-none cursor-pointer"
            >
              <option value="all">ANY GENRE</option>
              <option value="preference">PREFERENCE</option>
              <option value="fact">FACTS</option>
              <option value="context">CONTEXTS</option>
              <option value="history">HISTORIES</option>
            </select>
          </div>

          {/* Memory List grid display */}
          <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
            {filteredMemories.length === 0 ? (
              <div className="py-12 border border-dashed border-slate-100 rounded-xl text-center text-slate-400">
                <span className="text-[10px] uppercase font-mono tracking-widest text-slate-400">No matching connections recorded.</span>
              </div>
            ) : (
              filteredMemories.map((memory) => (
                <div
                  key={memory.id}
                  className="p-3 bg-white hover:bg-slate-50 border border-slate-100 hover:border-slate-200 rounded-xl flex items-start justify-between gap-3 shadow-sm transition"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] text-slate-700 leading-relaxed font-normal hover:text-slate-900 break-words">
                      "{memory.content}"
                    </p>
                    <div className="flex flex-wrap items-center gap-1.5 mt-2">
                      <span className={`text-[8px] px-1.5 py-0.5 rounded-full font-bold font-mono border uppercase ${getImportanceColor(memory.importance)}`}>
                        IMP: {memory.importance}/10
                      </span>
                      {memory.tags.map(t => (
                        <span key={t} className="text-[8px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 font-mono font-medium lowercase">
                          #{t}
                        </span>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      deleteMemory(memory.id);
                      appendLog("Synapse Memory purged.", "warning");
                    }}
                    className="p-1 hover:bg-slate-100 text-slate-400 hover:text-rose-600 rounded-md transition cursor-pointer"
                    title="Purge Memory"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
export { MemoryHub };
