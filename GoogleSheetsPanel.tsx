import React, { useState, useEffect } from 'react';
import { useAgent } from '../lib/agent-context';
import { motion, AnimatePresence } from 'motion/react';
import { 
  FileSpreadsheet, 
  RefreshCw, 
  Trash2, 
  Plus, 
  AlertCircle, 
  CheckCircle2, 
  ExternalLink, 
  Lock, 
  Table, 
  Download, 
  ArrowRight,
  Database,
  Sparkles
} from 'lucide-react';

interface SheetInfo {
  properties: {
    title: string;
    sheetId: number;
  };
}

export default function GoogleSheetsPanel() {
  const { googleToken, loginWithGoogle, appendLog, logs } = useAgent();
  
  // Spreadsheet state
  const [spreadsheetId, setSpreadsheetId] = useState<string>('');
  const [spreadsheetTitle, setSpreadsheetTitle] = useState<string>('');
  const [sheets, setSheets] = useState<SheetInfo[]>([]);
  const [activeSheetName, setActiveSheetName] = useState<string>('');
  const [rows, setRows] = useState<string[][]>([]);
  
  // UI States
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isAppending, setIsAppending] = useState<boolean>(false);
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [errorWord, setErrorWord] = useState<string | null>(null);
  const [successWord, setSuccessWord] = useState<string | null>(null);

  // Form input states for adding custom record
  const [customFields, setCustomFields] = useState<string>(JSON.stringify(["Operational update", "Status nominal", "Diagnostics OK"]));

  // Load spreadsheet id from localStorage if already saved
  useEffect(() => {
    const savedId = localStorage.getItem('jarvis_sheets_id');
    if (savedId) {
      setSpreadsheetId(savedId);
    }
  }, []);

  const handleSpreadsheetIdChange = (id: string) => {
    setSpreadsheetId(id);
    localStorage.setItem('jarvis_sheets_id', id);
  };

  const fetchSpreadsheetMetadata = async (idToFetch: string = spreadsheetId) => {
    if (!googleToken || !idToFetch) return;
    setIsLoading(true);
    setErrorWord(null);
    setSuccessWord(null);

    let parsedId = idToFetch.trim();
    if (parsedId.includes('docs.google.com/spreadsheets')) {
      const match = parsedId.match(/\/d\/([a-zA-Z0-9-_]+)/);
      if (match && match[1]) {
        parsedId = match[1];
      }
    }

    try {
      const res = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${parsedId}?includeGridData=false`, {
        headers: {
          Authorization: `Bearer ${googleToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!res.ok) {
        if (res.status === 401) {
          throw new Error('TOKEN_EXPIRED');
        }
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson?.error?.message || `Google API returned status [${res.status}]`);
      }

      const data = await res.json();
      setSpreadsheetTitle(data.properties.title || 'Untitled Cloud Sheet');
      setSheets(data.sheets || []);
      
      if (data.sheets && data.sheets[0]) {
        const firstSheetName = data.sheets[0].properties.title;
        setActiveSheetName(firstSheetName);
        fetchSheetRows(parsedId, firstSheetName);
      }
      
      setSuccessWord('Spreadsheet connection confirmed successfully!');
      appendLog(`Successfully linked Google Spreadsheet: "${data.properties.title}"`, 'success');

    } catch (err) {
      console.error(err);
      setErrorWord(err instanceof Error ? err.message : String(err));
      appendLog("Google Spreadsheet connection failed.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSheetRows = async (spreadId: string = spreadsheetId, sheetName: string = activeSheetName) => {
    if (!googleToken || !spreadId || !sheetName) return;
    setIsLoading(true);
    try {
      const res = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadId}/values/${encodeURIComponent(sheetName)}!A1:Z50`, {
        headers: {
          Authorization: `Bearer ${googleToken}`
        }
      });

      if (res.ok) {
        const data = await res.json();
        setRows(data.values || []);
      }
    } catch (e) {
      console.error("Fetch rows failed:", e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateSpreadsheet = async () => {
    if (!googleToken) return;
    setIsCreating(true);
    setErrorWord(null);
    setSuccessWord(null);
    try {
      const res = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${googleToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          properties: {
            title: `JARVIS X Operational logs (${new Date().toLocaleDateString()})`
          },
          sheets: [
            {
              properties: {
                title: 'Diagnostics_Feed'
              }
            }
          ]
        })
      });

      if (!res.ok) {
        throw new Error(`Google API returned status [${res.status}]`);
      }

      const data = await res.json();
      const newId = data.spreadsheetId;
      handleSpreadsheetIdChange(newId);
      setSpreadsheetTitle(data.properties.title);
      setSheets(data.sheets || []);
      setActiveSheetName('Diagnostics_Feed');
      setRows([]);
      setSuccessWord('New cloud spreadsheet provisioned successfully!');
      appendLog("Created new connected Google Spreadsheet.", "success");

    } catch (err) {
      setErrorWord(err instanceof Error ? err.message : String(err));
    } finally {
      setIsCreating(false);
    }
  };

  const handleExportSystemLogs = async () => {
    if (!googleToken || !spreadsheetId || !activeSheetName || logs.length === 0) return;
    setIsAppending(true);
    setErrorWord(null);
    setSuccessWord(null);

    const valuesToAppend = logs.map(log => [
      log.timestamp || new Date().toISOString(),
      log.type.toUpperCase(),
      log.message
    ]);

    try {
      const res = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(activeSheetName)}!A1:append?valueInputOption=USER_ENTERED`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${googleToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            range: `${activeSheetName}!A1`,
            majorDimension: 'ROWS',
            values: valuesToAppend
          })
        }
      );

      if (!res.ok) {
        throw new Error(`Google API returned status [${res.status}]`);
      }

      setSuccessWord(`Successfully exported ${logs.length} operations records to cloud grid!`);
      appendLog("Bulk operations records synchronized to Google Sheets.", "success");
      fetchSheetRows(spreadsheetId, activeSheetName);

    } catch (err) {
      setErrorWord(err instanceof Error ? err.message : String(err));
    } finally {
      setIsAppending(false);
    }
  };

  const handleAddCustomRow = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!googleToken || !spreadsheetId || !activeSheetName) return;
    setIsAppending(true);
    setErrorWord(null);
    setSuccessWord(null);

    let parsedValues = [];
    try {
      parsedValues = JSON.parse(customFields);
      if (!Array.isArray(parsedValues)) {
        throw new Error("Must be a JSON Array.");
      }
    } catch {
      setErrorWord("Invalid JSON Array. Format must be [\"Cell 1\", \"Cell 2\"].");
      setIsAppending(false);
      return;
    }

    try {
      const res = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(activeSheetName)}!A1:append?valueInputOption=USER_ENTERED`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${googleToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            range: `${activeSheetName}!A1`,
            majorDimension: 'ROWS',
            values: [parsedValues]
          })
        }
      );

      if (!res.ok) {
        throw new Error(`Google API returned status [${res.status}]`);
      }

      setSuccessWord("Individual row packet appended successfully!");
      appendLog("Apt individual row packet synced.", "success");
      fetchSheetRows(spreadsheetId, activeSheetName);

    } catch (err) {
      setErrorWord(err instanceof Error ? err.message : String(err));
    } finally {
      setIsAppending(false);
    }
  };

  const handleSheetTabChange = (sheetName: string) => {
    setActiveSheetName(sheetName);
    fetchSheetRows(spreadsheetId, sheetName);
  };

  return (
    <div className="flex flex-col h-full space-y-4 text-left">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center space-x-2">
          <Database className="w-5 h-5 text-blue-600" />
          <div className="text-left">
            <h2 className="text-xs font-bold tracking-tight text-slate-800 uppercase font-mono">
              Google Sheets Linker
            </h2>
            <p className="text-[10px] text-slate-400 font-mono uppercase tracking-wide">
              COLD TELEMETRY SENSORS BACKUP
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2 font-mono text-[9px]">
          {googleToken ? (
            <span className="text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg font-bold border border-emerald-100 flex items-center space-x-1 uppercase">
              <span>Secured Link Active</span>
            </span>
          ) : (
            <span className="text-amber-600 bg-amber-50 px-2.5 py-1 rounded-lg font-bold border border-amber-100 flex items-center space-x-1 uppercase">
              <Lock className="w-3 h-3" />
              <span>Restricted</span>
            </span>
          )}
        </div>
      </div>

      {!googleToken ? (
        <div className="p-4 border border-slate-100 rounded-2xl bg-slate-50 text-center space-y-3">
          <FileSpreadsheet className="w-8 h-8 text-slate-300 mx-auto" />
          <h3 className="text-xs font-bold text-slate-700 uppercase">Authorization Required</h3>
          <p className="text-[10px] text-slate-400 leading-relaxed max-w-xs mx-auto">
            Authorize Google OAuth scopes to write operation logs, metrics records, and system analytics directly to your personal Google spreadsheets.
          </p>
          <button
            onClick={loginWithGoogle}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 hover:shadow-md text-white font-bold text-xs rounded-lg transition-all cursor-pointer"
          >
            AUTHORIZE WORKSPACE CONNECTION
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Linked Spreadsheet management */}
          <div className="flex flex-col sm:flex-row sm:items-end gap-3 p-3 bg-slate-50/55 border border-slate-100 rounded-xl">
            <div className="flex-1 space-y-1">
              <label className="block text-[9px] font-bold font-mono text-slate-400 uppercase">Existing Sheets ID or URL</label>
              <input
                type="text"
                value={spreadsheetId}
                onChange={(e) => handleSpreadsheetIdChange(e.target.value)}
                placeholder="Paste spreadsheets ID code or URL"
                className="w-full px-3 py-1.5 text-xs bg-white border border-slate-150 rounded-lg focus:outline-none focus:border-blue-400 text-slate-800"
              />
            </div>
            
            <div className="flex space-x-2">
              <button
                type="button"
                onClick={() => fetchSpreadsheetMetadata()}
                disabled={isLoading || !spreadsheetId}
                className="px-3.5 py-2 border border-slate-100 hover:bg-white text-slate-600 text-[11px] font-bold rounded-lg transition-all uppercase disabled:opacity-40 flex items-center space-x-1.5 cursor-pointer shadow-sm"
              >
                {isLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                <span>CONNECT</span>
              </button>
              
              <button
                type="button"
                onClick={handleCreateSpreadsheet}
                disabled={isCreating}
                className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 hover:shadow-md text-white text-[11px] font-bold rounded-lg transition-all uppercase disabled:opacity-40 flex items-center space-x-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>NEW SHEET</span>
              </button>
            </div>
          </div>

          {/* Feedback messages */}
          {errorWord && (
            <div className="p-3 border border-rose-100 bg-rose-50/40 rounded-xl text-[10px] text-rose-600 font-mono flex items-center space-x-1.5">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
              <span>{errorWord}</span>
            </div>
          )}

          {successWord && (
            <div className="p-3 border border-emerald-100 bg-emerald-50/40 rounded-xl text-[10px] text-emerald-600 font-mono flex items-center space-x-1.5 animate-[fadeIn_0.3s]">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>{successWord}</span>
            </div>
          )}

          {spreadsheetTitle && (
            <div className="space-y-3 border-t border-slate-100 pt-3">
              <div className="flex items-center justify-between text-[11px] font-mono">
                <div className="text-slate-500 font-bold flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-blue-500 animate-pulse" />
                  <span>TARGET GRID: <strong className="text-slate-800 uppercase">{spreadsheetTitle}</strong></span>
                </div>
                {spreadsheetId && (
                  <a
                    href={`https://docs.google.com/spreadsheets/d/${spreadsheetId}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 hover:underline font-bold flex items-center space-x-1 border border-slate-100 px-2 py-0.5 rounded bg-white shadow-sm"
                  >
                    <span>BROWSER WEB LINK</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>

              {/* Sheet tabs navigation */}
              <div className="flex items-center space-x-1 border-b border-slate-100 overflow-x-auto pb-1 max-w-full">
                {sheets.map((sheet) => {
                  const sTitle = sheet.properties.title;
                  const isActive = sTitle === activeSheetName;
                  return (
                    <button
                      key={sheet.properties.sheetId}
                      onClick={() => handleSheetTabChange(sTitle)}
                      className={`px-3 py-1 font-mono text-[10px] font-bold tracking-tight uppercase border-t border-x rounded-t-lg transition-all cursor-pointer whitespace-nowrap ${
                        isActive 
                        ? 'border-slate-100 bg-slate-50 text-slate-800 shadow-sm border-b-white' 
                        : 'border-transparent text-slate-400 hover:text-slate-600'
                      }`}
                    >
                      {sTitle}
                    </button>
                  );
                })}
              </div>

              {/* Data Table Matrix representation */}
              <div className="relative border border-slate-100 rounded-xl bg-slate-55 overflow-hidden shadow-sm">
                <div className="overflow-auto max-h-52 max-w-full">
                  {rows.length === 0 ? (
                    <div className="p-8 text-center text-[10.5px] font-mono text-slate-400 uppercase tracking-wide">
                      This layer coordinate grid is currently blank.
                    </div>
                  ) : (
                    <table className="w-full text-left font-mono text-[9px] border-collapse bg-white">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 uppercase font-bold sticky top-0 z-10">
                          <th className="p-2 border-r border-slate-100 text-center min-w-8 bg-slate-100/30">#</th>
                          {rows[0].map((cell, idx) => (
                            <th key={idx} className="p-2 border-r border-slate-100 min-w-[100px]">
                              {cell || `Col ${idx + 1}`}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-600">
                        {rows.slice(1).map((row, rowIdx) => (
                          <tr key={rowIdx} className="hover:bg-slate-50">
                            <td className="p-2 border-r border-slate-100 text-center text-slate-400 bg-slate-50/50 text-[8px] font-bold">
                              {rowIdx + 1}
                            </td>
                            {rows[0].map((_, colIdx) => (
                              <td key={colIdx} className="p-2 border-r border-slate-100 truncate max-w-[150px] font-medium text-slate-700">
                                {row[colIdx] || <span className="text-slate-350 opacity-40">--</span>}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>

              {/* Spread utilities */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pb-1">
                {/* Bulk Export logs to Spreadsheet */}
                <div className="p-3 border border-slate-100 bg-slate-50/50 hover:bg-slate-50 rounded-xl space-y-2 flex flex-col justify-between">
                  <div className="space-y-1">
                    <div className="text-[9px] font-bold tracking-wider text-slate-500 uppercase flex items-center space-x-1.5 font-mono">
                      <Download className="w-3.5 h-3.5 text-blue-600 animate-bounce" />
                      <span>Telemetry Bulk Sync</span>
                    </div>
                    <p className="text-[10px] text-slate-400 leading-relaxed font-sans">
                      Bulk sync all active diagnostics containing {logs.length} system operations records to Sheet "{activeSheetName}".
                    </p>
                  </div>
                  <button
                    onClick={handleExportSystemLogs}
                    disabled={isAppending || logs.length === 0}
                    className="w-full px-3 py-1.5 border border-slate-150 hover:bg-white hover:shadow-sm text-slate-600 text-[10px] rounded-lg transition-all font-bold uppercase disabled:opacity-40 cursor-pointer flex items-center justify-center space-x-1 mt-1 shrink-0"
                  >
                    <span>BULK EXPORT</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>

                {/* Single Row actions */}
                <form onSubmit={handleAddCustomRow} className="p-3 border border-slate-100 bg-slate-50/50 hover:bg-slate-50 rounded-xl space-y-2 flex flex-col justify-between">
                  <div>
                    <div className="text-[9px] font-bold tracking-wider text-slate-500 uppercase flex items-center space-x-1.5 font-mono">
                      <Table className="w-3.5 h-3.5 text-blue-600" />
                      <span>Manual Pack Append</span>
                    </div>
                    
                    <div className="space-y-1 mt-1.5">
                      <label className="block text-[8px] font-mono text-slate-400 font-bold uppercase">Field Values Array (JSON Format)</label>
                      <input
                        type="text"
                        value={customFields}
                        onChange={(e) => setCustomFields(e.target.value)}
                        placeholder='["Manual Log", "Diagnostics nominal", "Ok"]'
                        className="w-full text-[10px] bg-white border border-slate-150 p-1.5 rounded-lg text-slate-800"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isAppending}
                    className="w-full px-3 py-1.5 bg-blue-605 bg-blue-600 hover:bg-blue-700 hover:shadow-md text-white rounded-lg transition text-[10px] font-bold uppercase disabled:opacity-40 cursor-pointer mt-1"
                  >
                    {isAppending ? 'TRANSMITTING...' : 'APPEND ROW'}
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
