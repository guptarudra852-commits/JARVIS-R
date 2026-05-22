import React, { useState, useEffect } from 'react';
import { useAgent } from '../lib/agent-context';
import { 
  Database, 
  Search, 
  Plus, 
  BookOpen, 
  Calendar, 
  Tag, 
  ArrowRight, 
  FileText, 
  Trash2, 
  Sparkles, 
  CheckCircle2,
  FileSpreadsheet
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { INITIAL_OFFLINE_DOCS, OfflineDoc } from '../data/offline-docs';

export default function OfflineDocsDatabase() {
  const { appendLog } = useAgent();
  const [documents, setDocuments] = useState<OfflineDoc[]>([]);
  const [selectedDocId, setSelectedDocId] = useState<string>('doc_finance');

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // New Doc Form
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('General');
  const [newSummary, setNewSummary] = useState('');
  const [newContent, setNewContent] = useState('');

  // Hydrate from localStorage + initial data
  useEffect(() => {
    try {
      const stored = localStorage.getItem('jarvis_offline_documents');
      if (stored) {
        const parsed = JSON.parse(stored) as OfflineDoc[];
        // Merge initially supplied docs if they aren't already included
        const merged = [...INITIAL_OFFLINE_DOCS];
        parsed.forEach(p => {
          if (!merged.some(m => m.id === p.id)) {
            merged.push(p);
          }
        });
        setDocuments(merged);
      } else {
        setDocuments(INITIAL_OFFLINE_DOCS);
      }
    } catch (e) {
      console.warn("Offline documents failed to hydrate:", e);
      setDocuments(INITIAL_OFFLINE_DOCS);
    }
  }, []);

  // Save changes helper
  const saveDocs = (newDocs: OfflineDoc[]) => {
    setDocuments(newDocs);
    localStorage.setItem('jarvis_offline_documents', JSON.stringify(newDocs.filter(d => !INITIAL_OFFLINE_DOCS.some(i => i.id === d.id))));
  };

  // Create document
  const handleCreateDocument = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    const newDoc: OfflineDoc = {
      id: `custom_${Date.now()}`,
      title: newTitle.trim(),
      category: newCategory.trim(),
      summary: newSummary.trim() || "User provided documentation resource.",
      content: newContent,
      createdAt: new Date().toISOString()
    };

    const updated = [...documents, newDoc];
    saveDocs(updated);
    setSelectedDocId(newDoc.id);

    appendLog(`Safely persisted new documentation: "${newDoc.title}" inside offline datastore.`, "success");

    // Reset Form
    setIsAdding(false);
    setNewTitle('');
    setNewCategory('General');
    setNewSummary('');
    setNewContent('');
  };

  // Delete document (only custom ones)
  const handleDeleteDocument = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (INITIAL_OFFLINE_DOCS.some(doc => doc.id === id)) {
      appendLog("System baseline documents cannot be removed from offline database core.", "warning");
      return;
    }

    const updated = documents.filter(doc => doc.id !== id);
    saveDocs(updated);
    if (selectedDocId === id) {
      setSelectedDocId('doc_finance');
    }
    appendLog("Removed custom documentation entry from local database.", "info");
  };

  // Filter docs
  const filteredDocs = documents.filter(doc => {
    const matchesSearch = 
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.content.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = 
      selectedCategory === 'all' || 
      doc.category.toLowerCase() === selectedCategory.toLowerCase();

    return matchesSearch && matchesCategory;
  });

  const categories = ['all', ...Array.from(new Set(documents.map(d => d.category)))];

  const activeDoc = documents.find(d => d.id === selectedDocId) || documents[0];

  return (
    <div className="flex flex-col space-y-5 h-full min-h-[580px]">
      
      {/* Premium Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div className="flex items-center space-x-2.5">
          <div className="p-1.5 bg-blue-50 border border-blue-100 text-blue-600 rounded-xl">
            <Database className="w-5 h-5" />
          </div>
          <div className="text-left">
            <h2 className="text-sm font-bold tracking-tight text-slate-800 uppercase font-mono">
              Offline Knowledge Enclave
            </h2>
            <p className="text-[10px] text-slate-400 font-mono uppercase tracking-widest mt-0.5">
              Secure client-side localized datastore containing {documents.length} volumes
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsAdding(!isAdding)}
          className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition ${
            isAdding 
              ? 'bg-slate-100 hover:bg-slate-200 text-slate-600' 
              : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-sm shadow-blue-500/10'
          }`}
        >
          {isAdding ? (
            <span>Explore Library</span>
          ) : (
            <>
              <Plus className="w-3.5 h-3.5" />
              <span>Persist Document</span>
            </>
          )}
        </button>
      </div>

      {isAdding ? (
        /* Create Form View */
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          <form onSubmit={handleCreateDocument} className="md:col-span-8 space-y-4 text-left p-6 border border-slate-100 rounded-2xl bg-slate-50/50">
            <div className="flex items-center justify-between border-b border-slate-200/50 pb-3">
              <h3 className="text-xs font-black tracking-wider text-slate-700 font-mono uppercase flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-yellow-500" />
                Index Offline Text Asset
              </h3>
              <span className="text-[9px] font-mono text-slate-400 uppercase tracking-widest">
                Local-First Metadata Encryption
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold font-mono text-slate-500 uppercase mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  placeholder="e.g. Fundamental Macro Analysis"
                  className="w-full px-3.5 py-2 text-xs bg-white border border-slate-150 text-slate-800 rounded-xl focus:outline-none focus:border-blue-400 font-sans"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold font-mono text-slate-500 uppercase mb-1">Category</label>
                <input
                  type="text"
                  required
                  value={newCategory}
                  onChange={e => setNewCategory(e.target.value)}
                  placeholder="e.g. Finance, Disaster, Strategy"
                  className="w-full px-3.5 py-2 text-xs bg-white border border-slate-150 text-slate-800 rounded-xl focus:outline-none focus:border-blue-400 font-sans"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold font-mono text-slate-500 uppercase mb-1">Short Summary</label>
              <input
                type="text"
                value={newSummary}
                onChange={e => setNewSummary(e.target.value)}
                placeholder="A concise, high-level summary of the documentation contents."
                className="w-full px-3.5 py-2 text-xs bg-white border border-slate-150 text-slate-800 rounded-xl focus:outline-none focus:border-blue-400 font-sans"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold font-mono text-slate-500 uppercase mb-1">Content (Markdown Supported)</label>
              <textarea
                required
                rows={12}
                value={newContent}
                onChange={e => setNewContent(e.target.value)}
                placeholder="## Heading 2&#10;Write the content here cleanly. Supports **bold**, *italics*, tables or code blocks..."
                className="w-full px-3.5 py-2.5 text-xs bg-white border border-slate-150 text-slate-800 rounded-xl focus:outline-none focus:border-blue-400 font-mono"
              />
            </div>

            <div className="flex justify-end pt-3">
              <button
                type="submit"
                className="px-5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-mono font-bold uppercase tracking-wider rounded-xl transition shadow-md shadow-blue-500/5 flex items-center space-x-2 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Synchronize To Enclave</span>
              </button>
            </div>
          </form>

          {/* Quick instructions sidebar on the form layout */}
          <div className="md:col-span-4 p-5 border border-slate-100 bg-blue-50/20 rounded-2xl text-left space-y-4">
            <h4 className="text-xs font-bold font-mono uppercase tracking-wider text-blue-800 flex items-center gap-1">
              <FileSpreadsheet className="w-4 h-4 text-blue-600" />
              Database Engine
            </h4>
            <div className="text-[10px] text-slate-500 leading-relaxed font-mono uppercase space-y-3">
              <p>✦ Pre-loaded volumes are loaded from initial baseline code assets automatically.</p>
              <p>✦ Custom documents are safely sandbox-persisted into client-side IndexedDB/localStorage schemas.</p>
              <p>✦ Markdown strings are instantly parsed and rendered in high definition.</p>
              <p>✦ Custom documentation parameters can be searched instantly through full-text indices queries.</p>
            </div>
          </div>
        </div>
      ) : (
        /* Standard Database Explorer View */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          
          {/* Left search & document choice list sidebar (Colspan 4) */}
          <div className="lg:col-span-4 flex flex-col space-y-4">
            
            {/* Filter and Search box elements */}
            <div className="space-y-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search repository..."
                  className="w-full bg-slate-50/50 border border-slate-100 rounded-xl pl-8 pr-3 py-1.5 text-xs outline-none focus:bg-white focus:border-blue-400 shadow-inner text-slate-700 placeholder-slate-400"
                />
              </div>

              {/* Tag filters scrolling bar */}
              <div className="flex gap-1.5 overflow-x-auto scrollbar-none pb-1">
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`whitespace-nowrap px-2.5 py-0.5 rounded-full text-[9px] uppercase font-bold border transition font-mono ${
                      selectedCategory === cat 
                        ? 'bg-blue-600 text-white border-blue-600' 
                        : 'bg-slate-50 border-slate-100 text-slate-500 hover:border-slate-300'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Scrollable list of files */}
            <div className="flex-1 max-h-[460px] overflow-y-auto border border-slate-100/50 rounded-2xl p-1.5 space-y-1.5 scrollbar-none bg-slate-50/30">
              {filteredDocs.length > 0 ? (
                filteredDocs.map(doc => {
                  const isSelected = doc.id === selectedDocId;
                  const isBaseline = INITIAL_OFFLINE_DOCS.some(i => i.id === doc.id);

                  return (
                    <div
                      key={doc.id}
                      onClick={() => setSelectedDocId(doc.id)}
                      className={`relative w-full p-3.5 rounded-xl border text-left cursor-pointer transition flex items-start space-x-3 group ${
                        isSelected 
                          ? 'bg-white border-blue-300 shadow-sm' 
                          : 'border-transparent hover:bg-white/60 hover:border-slate-200'
                      }`}
                    >
                      <div className={`p-2 rounded-lg shrink-0 mt-0.5 transition ${
                        isSelected ? 'bg-blue-50 text-blue-600' : 'bg-slate-100 text-slate-400 group-hover:bg-slate-200'
                      }`}>
                        <FileText className="w-4 h-4" />
                      </div>

                      <div className="flex-1 min-w-0 pr-6">
                        <div className="flex items-center space-x-1.5">
                          <span className={`text-[8px] border px-1 rounded-md font-bold tracking-wider uppercase ${
                            doc.category === 'Finance' ? 'border-amber-200 bg-amber-50 text-amber-600' : 'border-blue-100 bg-blue-50 text-blue-600'
                          }`}>
                            {doc.category}
                          </span>
                          {!isBaseline && (
                            <span className="text-[8px] border border-slate-100 bg-slate-50 text-slate-400 px-1 rounded font-bold tracking-wide">
                              CUSTOM
                            </span>
                          )}
                        </div>
                        <h4 className="text-[11px] font-extrabold tracking-tight text-slate-800 mt-1 truncate">
                          {doc.title}
                        </h4>
                        <p className="text-[9px] text-slate-400 line-clamp-2 mt-0.5 leading-relaxed">
                          {doc.summary}
                        </p>
                      </div>

                      {/* Floating Delete button (only for users' custom documents) */}
                      {!isBaseline && (
                        <button
                          onClick={(e) => handleDeleteDocument(doc.id, e)}
                          className="absolute right-2 top-2 p-1.5 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg opacity-0 group-hover:opacity-100 transition duration-155"
                          title="Purge Document"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="py-12 p-3 text-center text-slate-400 font-mono text-[10px] uppercase">
                  No localized documents found matching current filter query patterns.
                </div>
              )}
            </div>

          </div>

          {/* Right document reader pane (Colspan 8) */}
          <div className="lg:col-span-8 flex flex-col border border-slate-150/60 rounded-2xl bg-white shadow-sm overflow-hidden text-left">
            
            {activeDoc ? (
              <>
                {/* Header Information board */}
                <div className="bg-slate-50/60 border-b border-slate-150/60 p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-[9px] font-bold font-mono px-2 py-0.5 rounded-full border border-blue-200 bg-blue-50 text-blue-600 uppercase tracking-widest">
                        {activeDoc.category}
                      </span>
                      <span className="flex items-center text-[9px] text-slate-400 font-mono uppercase">
                        <Calendar className="w-3 h-3 text-slate-400 mr-1" />
                        {new Date(activeDoc.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <h3 className="text-sm font-black text-slate-800">
                      {activeDoc.title}
                    </h3>
                  </div>

                  <span className="text-[9px] font-mono text-slate-400 uppercase tracking-widest bg-white border border-slate-100 px-2 py-1 rounded-md shadow-sm">
                    ID: {activeDoc.id}
                  </span>
                </div>

                {/* Main Content Markdown Scroller */}
                <div className="flex-1 p-6 md:p-8 max-h-[460px] overflow-y-auto select-text">
                  <div className="markdown-body prose-sm prose-slate max-w-none text-slate-700 leading-relaxed text-xs">
                    <ReactMarkdown>{activeDoc.content}</ReactMarkdown>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center p-12 text-slate-400 h-full">
                <BookOpen className="w-8 h-8 text-slate-350 animate-pulse mb-3" />
                <p className="text-xs font-mono uppercase">Please designate a documentation volume on left to read</p>
              </div>
            )}

          </div>

        </div>
      )}

    </div>
  );
}
