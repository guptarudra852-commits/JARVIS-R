import React, { useState, useEffect } from 'react';
import { useAgent } from '../lib/agent-context';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Mail, 
  Send, 
  Trash2, 
  RefreshCw, 
  Search, 
  Sparkles, 
  Lock, 
  AlertCircle, 
  CheckCircle2, 
  User, 
  Paperclip,
  ChevronRight,
  SendHorizontal,
  X,
  FileText,
  ShieldAlert,
  Loader2
} from 'lucide-react';

interface GmailMessageHeader {
  name: string;
  value: string;
}

interface ParsedEmail {
  id: string;
  subject: string;
  from: string;
  to: string;
  date: string;
  snippet: string;
  body: string;
}

export default function GoogleGmailPanel() {
  const { googleToken, loginWithGoogle, appendLog } = useAgent();
  
  // Gmail state variables
  const [emails, setEmails] = useState<ParsedEmail[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedEmail, setSelectedEmail] = useState<ParsedEmail | null>(null);
  
  // Tab states: 'inbox' | 'compose'
  const [activeTab, setActiveTab] = useState<'inbox' | 'compose'>('inbox');
  
  // UI Loading & operation states
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSending, setIsSending] = useState<boolean>(false);
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);
  const [errorWord, setErrorWord] = useState<string | null>(null);
  const [successWord, setSuccessWord] = useState<string | null>(null);
  const [isAIOptimizing, setIsAIOptimizing] = useState<boolean>(false);

  // Compose email states
  const [toInput, setToInput] = useState<string>('');
  const [subjectInput, setSubjectInput] = useState<string>('');
  const [bodyInput, setBodyInput] = useState<string>('');

  // Confirmation dialog state before sending/mutating data
  const [showSendConfirm, setShowSendConfirm] = useState<boolean>(false);
  const [showDeleteConfirmId, setShowDeleteConfirmId] = useState<string | null>(null);

  // Load emails automatically if auth is available
  useEffect(() => {
    if (googleToken) {
      fetchEmails();
    }
  }, [googleToken]);

  // Decode Gmail Base64 contents resiliently
  const decodeBase64 = (data: string): string => {
    try {
      const base64 = data.replace(/-/g, '+').replace(/_/g, '/');
      return decodeURIComponent(
        window.atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
    } catch (err) {
      try {
        const base64 = data.replace(/-/g, '+').replace(/_/g, '/');
        return window.atob(base64);
      } catch (e) {
        return '';
      }
    }
  };

  // Traverses nested message payload bodies to retrieve text
  const findTextPart = (parts: any[], mimeType: string): any => {
    for (const part of parts) {
      if (part.mimeType === mimeType && part.body?.data) {
        return part;
      }
      if (part.parts && Array.isArray(part.parts)) {
        const found = findTextPart(part.parts, mimeType);
        if (found) return found;
      }
    }
    return null;
  };

  // Convert raw API message object to simple structured dataset
  const parseMessageDetail = (msg: any): ParsedEmail => {
    const headers: GmailMessageHeader[] = msg.payload?.headers || [];
    const subject = headers.find((h) => h.name.toLowerCase() === 'subject')?.value || '(No Subject)';
    const from = headers.find((h) => h.name.toLowerCase() === 'from')?.value || 'Unknown Sender';
    const to = headers.find((h) => h.name.toLowerCase() === 'to')?.value || '';
    const date = headers.find((h) => h.name.toLowerCase() === 'date')?.value || '';
    
    let body = '';
    
    if (msg.payload?.body?.data) {
      body = decodeBase64(msg.payload.body.data);
    } else if (msg.payload?.parts && Array.isArray(msg.payload.parts)) {
      // Prioritize plain text, fallback to HTML bodies
      const plainTextPart = findTextPart(msg.payload.parts, 'text/plain') || findTextPart(msg.payload.parts, 'text/html');
      if (plainTextPart?.body?.data) {
        body = decodeBase64(plainTextPart.body.data);
      }
    }

    // Strips excessive HTML or metadata elements if present
    if (body.includes('<body') || body.includes('<div')) {
      body = body.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
                  .replace(/<[^>]+>/g, ' ')
                  .replace(/\s+/g, ' ')
                  .trim();
    }
    
    if (!body) {
      body = msg.snippet || '';
    }

    return {
      id: msg.id,
      subject,
      from,
      to,
      date,
      snippet: msg.snippet || '',
      body
    };
  };

  // Fetch standard message list & hydrate detailed email cells
  const fetchEmails = async (keywordQuery: string = searchQuery) => {
    if (!googleToken) return;
    setIsLoading(true);
    setErrorWord(null);
    setSuccessWord(null);

    try {
      let url = 'https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=7';
      if (keywordQuery.trim()) {
        url += `&q=${encodeURIComponent(keywordQuery.trim())}`;
      }

      const res = await fetch(url, {
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
        throw new Error(errJson?.error?.message || `Gmail API error with status [${res.status}]`);
      }

      const listData = await res.json();
      const messageList = listData.messages || [];

      if (messageList.length === 0) {
        setEmails([]);
        setIsLoading(false);
        return;
      }

      // Concurrently parse the detailed subjects, dates, and bodies of listed emails
      const detailedEmails = await Promise.all(
        messageList.map(async (item: { id: string }) => {
          try {
            const detailRes = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${item.id}`, {
              headers: { Authorization: `Bearer ${googleToken}` }
            });
            if (detailRes.ok) {
              const originalObj = await detailRes.json();
              return parseMessageDetail(originalObj);
            }
            return null;
          } catch (e) {
            console.error(`Error resolving message ${item.id}`, e);
            return null;
          }
        })
      );

      const resolvedEmails = detailedEmails.filter((email): email is ParsedEmail => email !== null);
      setEmails(resolvedEmails);
      appendLog(`Gmail synchronized. Loaded ${resolvedEmails.length} messages successfully.`, "info");
    } catch (err: any) {
      console.error(err);
      if (err.message === 'TOKEN_EXPIRED') {
        setErrorWord('Secure credentials expired. Please sign out and sign in again via Google.');
      } else {
        setErrorWord(err instanceof Error ? err.message : String(err));
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Trashing/Deleting a message
  const handleDeleteEmail = async (id: string) => {
    if (!googleToken) return;
    setIsDeletingId(id);
    setErrorWord(null);
    setSuccessWord(null);

    try {
      const res = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${id}/trash`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${googleToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson?.error?.message || `Gmail delete response returned [${res.status}]`);
      }

      setEmails(prev => prev.filter(email => email.id !== id));
      if (selectedEmail?.id === id) {
        setSelectedEmail(null);
      }
      setSuccessWord('Message moved to Trash successfully.');
      appendLog('Gmail command: Selected node trashed securely with confirmation clearance.', 'success');
    } catch (err: any) {
      console.error(err);
      setErrorWord(err.message || String(err));
    } finally {
      setIsDeletingId(null);
      setShowDeleteConfirmId(null);
    }
  };

  // Trigger base64url encoded SMTP send sequence
  const handleComposeSend = async () => {
    if (!googleToken) return;
    if (!toInput.trim() || !subjectInput.trim() || !bodyInput.trim()) {
      setErrorWord('Ensure all compose fields (To, Subject, Body) are configured.');
      return;
    }

    setIsSending(true);
    setErrorWord(null);
    setSuccessWord(null);

    try {
      // Craft MIME formatted RAW email
      const emailContentParts = [
        `To: ${toInput.trim()}`,
        'Content-Type: text/plain; charset=utf-8',
        'MIME-Version: 1.0',
        `Subject: ${subjectInput.trim()}`,
        '',
        bodyInput
      ];

      const rawEmail = emailContentParts.join('\r\n');
      
      // Safe base64 url encoding
      const utf8Bytes = new TextEncoder().encode(rawEmail);
      const binaryString = Array.from(utf8Bytes).map(b => String.fromCharCode(b)).join('');
      const base64Encoded = window.btoa(binaryString)
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');

      const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${googleToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          raw: base64Encoded
        })
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson?.error?.message || `SMTP dispatch returned status [${res.status}]`);
      }

      setSuccessWord(`Email successfully dispatched to [${toInput}].`);
      appendLog(`SMTP email sent successfully via encrypted primary route. Recipient: ${toInput}`, "success");
      
      // Reset compose state
      setToInput('');
      setSubjectInput('');
      setBodyInput('');
      setActiveTab('inbox');
      fetchEmails();
    } catch (err: any) {
      console.error(err);
      setErrorWord(err.message || String(err));
    } finally {
      setIsSending(false);
      setShowSendConfirm(false);
    }
  };

  // AI draft assistant uses the agent routing module to optimize draft content
  const optimizeDraftWithAI = async () => {
    if (!bodyInput.trim() && !subjectInput.trim()) {
      setErrorWord('Please enter some text or topic in the Subject/Body for the Email Agent to optimize.');
      return;
    }

    setIsAIOptimizing(true);
    setErrorWord(null);
    appendLog("Deploying Email Agent to structure formal email draft optimization...", "info");

    try {
      const systemTopicPrompt = `Optimize and expand this email draft into a highly polished, professional message.
Subject prompt: "${subjectInput}"
Current body draft: "${bodyInput}"

If you detect any email address mentioned in either the subject prompt or the current body draft (such as "rakhi123gupta90@gmail.com"), extract it and return it in the "recipient" field of the JSON structure.

Ensure the output is clean, professional, concise, with correct spacing and clear paragraph structures using real newline layout. Return a JSON structure exactly matching this schema:
{
  "recipient": "extracted email address here, or empty if not found",
  "subject": "polished subject line here",
  "body": "polished email body here"
}`;

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: systemTopicPrompt,
          model: 'gemini-3.5-flash',
          activeAgentId: 'email'
        })
      });

      if (!res.ok) {
        throw new Error(`AI optimizer returned status [${res.status}]`);
      }

      const resultData = await res.json();
      
      // Extract code block or parse JSON structured string from response
      const serverResponseText = resultData.text || resultData.response || '';
      
      // Simple parse attempt for JSON response inside Markdown wraps or straight text
      let parsedJson: { recipient?: string; subject?: string; body?: string } | null = null;
      try {
        const rawMatch = serverResponseText.match(/\{[\s\S]*\}/);
        if (rawMatch) {
          parsedJson = JSON.parse(rawMatch[0]);
        } else {
          parsedJson = JSON.parse(serverResponseText);
        }
      } catch (e) {
        // Fallback plain content assignment if JSON structuring failed
        parsedJson = {
          recipient: '',
          subject: subjectInput || 'Polished Update',
          body: serverResponseText.replace(/```json|```/gi, '').trim()
        };
      }

      if (parsedJson?.recipient && parsedJson.recipient.includes('@') && parsedJson.recipient !== 'recipient@example.com') {
        setToInput(parsedJson.recipient.trim());
      }
      if (parsedJson?.subject) {
        setSubjectInput(parsedJson.subject);
      }
      if (parsedJson?.body) {
        const cleanBody = parsedJson.body.replace(/\\n/g, '\n');
        setBodyInput(cleanBody);
      }

      setSuccessWord('Email Agent optimized draft successfully.');
      appendLog('Email Agent completed draft refinement successfully.', 'success');
    } catch (e: any) {
      console.error(e);
      setErrorWord(`AI Drafter feedback: ${e.message || String(e)}`);
    } finally {
      setIsAIOptimizing(false);
    }
  };

  return (
    <div className="text-slate-800 font-sans">
      {/* Header section with telemetry badge status */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100/60 mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-rose-50 border border-rose-200">
            <Mail className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-left">
            <h3 className="text-xs font-bold text-slate-800 tracking-tight uppercase leading-none">
              Gmail Workspace Core
            </h3>
            <span className="text-[9px] font-mono text-slate-400">
              SMTP / IMAP ACTIVE DIRECTORY
            </span>
          </div>
        </div>

        {/* Lock indicator / Login interface helper */}
        <div className="flex items-center gap-2">
          {googleToken ? (
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 font-mono text-[9px] font-extrabold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              CONNECTED
            </div>
          ) : (
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-50 border border-slate-200 text-slate-400 font-mono text-[9px]">
              <Lock className="w-3 h-3" />
              LOCKED
            </div>
          )}
        </div>
      </div>

      {/* Main Container Block */}
      {!googleToken ? (
        <div className="py-8 px-4 border border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center text-center bg-slate-50/50">
          <Lock className="w-7 h-7 text-slate-350 mb-2.5 animate-pulse" />
          <h4 className="text-[11px] font-bold text-slate-800 tracking-tight uppercase mb-1">
            Gmail Enclave Sandbox Restricted
          </h4>
          <p className="text-[9px] text-slate-400 max-w-[240px] leading-relaxed mb-4 font-medium">
            Requires Google authentication with authorized Gmail permissions to synchronize active mail cells.
          </p>
          <button
            onClick={loginWithGoogle}
            className="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-[10px] font-mono font-bold text-white tracking-wide rounded-xl shadow-sm transition hover:scale-[1.02] active:scale-95 flex items-center gap-2 cursor-pointer"
          >
            <Mail className="w-3.5 h-3.5" />
            <span>LINK GMAIL SYSTEM</span>
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          
          {/* Diagnostic feedback outputs */}
          <AnimatePresence mode="wait">
            {errorWord && (
              <motion.div 
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-[10px] leading-relaxed flex items-start gap-2 text-left font-semibold"
              >
                <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <div>{errorWord}</div>
              </motion.div>
            )}
            {successWord && (
              <motion.div 
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200 text-emerald-800 text-[10px] leading-relaxed flex items-start gap-2 text-left font-semibold"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>{successWord}</div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation Action tabs */}
          <div className="flex items-center justify-between border-b border-slate-100/60 pb-1.5">
            <div className="flex items-center space-x-1">
              <button
                onClick={() => { setActiveTab('inbox'); setSelectedEmail(null); }}
                className={`px-3 py-1.5 rounded-xl font-mono text-[9px] font-extrabold transition-all border ${
                  activeTab === 'inbox' 
                    ? 'bg-slate-900 border-slate-900 text-white shadow-sm' 
                    : 'bg-white border-slate-100/80 text-slate-500 hover:bg-slate-50'
                }`}
              >
                INBOX MATRIX
              </button>
              <button
                onClick={() => setActiveTab('compose')}
                className={`px-3 py-1.5 rounded-xl font-mono text-[9px] font-extrabold transition-all border flex items-center gap-1.5 ${
                  activeTab === 'compose' 
                    ? 'bg-rose-500 border-rose-500 text-white shadow-sm' 
                    : 'bg-white border-slate-100/80 text-slate-500 hover:bg-slate-50'
                }`}
              >
                <SendHorizontal className="w-3 h-3" />
                COMPOSE EMAIL
              </button>
            </div>

            {activeTab === 'inbox' && (
              <button
                onClick={() => fetchEmails()}
                disabled={isLoading}
                className="p-1.5 rounded-lg border border-slate-100 text-slate-400 hover:bg-slate-50 hover:text-slate-700 transition"
                title="Refresh mailbox feed"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-rose-500' : ''}`} />
              </button>
            )}
          </div>

          {/* Tab Content Display */}
          {activeTab === 'inbox' ? (
            <div className="space-y-3">
              {/* Inbox Search input */}
              <div className="relative">
                <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Query emails (e.g. 'from:boss', 'status update')..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') fetchEmails(); }}
                  className="w-full bg-slate-50/70 border border-slate-100/80 pl-9 pr-24 py-2 rounded-xl text-[10px] font-mono tracking-tight text-slate-800 placeholder-slate-400 focus:outline-none focus:border-rose-400/50 focus:bg-white transition"
                />
                <button
                  type="button"
                  onClick={() => fetchEmails()}
                  className="absolute right-1.5 top-1.5 py-1 px-3 bg-slate-900 font-mono text-[8px] font-extrabold text-white rounded-lg hover:bg-rose-500 transition uppercase"
                >
                  Query Node
                </button>
              </div>

              {/* Email details interactive popup overlay */}
              {selectedEmail && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-4 border border-rose-100 rounded-2xl bg-gradient-to-br from-rose-50/20 to-white text-left space-y-3.5 shadow-sm relative"
                >
                  <button 
                    onClick={() => setSelectedEmail(null)}
                    className="absolute right-3 top-3 p-1 rounded-lg border border-slate-100 hover:bg-slate-50 text-slate-400 hover:text-slate-700"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>

                  <div className="space-y-1 pr-6">
                    <div className="text-[11px] font-bold text-slate-800 mr-2 leading-tight">
                      {selectedEmail.subject}
                    </div>
                    <div className="flex flex-wrap items-center gap-x-2 font-mono text-[9px] text-slate-400 pt-0.5">
                      <span className="font-bold text-slate-700 flex items-center gap-1">
                        <User className="w-3 h-3 text-rose-400" /> {selectedEmail.from}
                      </span>
                      <span>•</span>
                      <span>{selectedEmail.date}</span>
                    </div>
                  </div>

                  <div className="max-h-[160px] overflow-y-auto border-t border-b border-slate-100/60 py-3 text-[10px] leading-relaxed text-slate-600 font-mono whitespace-pre-wrap break-words">
                    {selectedEmail.body}
                  </div>

                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => setShowDeleteConfirmId(selectedEmail.id)}
                      className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg text-[9px] font-mono font-bold flex items-center gap-1.5"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      TRASH MESSAGE
                    </button>
                    
                    <button
                      onClick={() => {
                        setToInput(selectedEmail.from.match(/<([^>]+)>/)?.[1] || selectedEmail.from);
                        setSubjectInput(`Re: ${selectedEmail.subject.startsWith('Re:') ? '' : 'Re: '}${selectedEmail.subject}`);
                        setBodyInput(`\n\n--- On ${selectedEmail.date}, ${selectedEmail.from} wrote:\n> ${selectedEmail.body.slice(0, 150)}...`);
                        setActiveTab('compose');
                        setSelectedEmail(null);
                      }}
                      className="px-4 py-1.5 bg-slate-900 hover:bg-rose-500 transition text-white rounded-lg text-[9px] font-mono font-bold"
                    >
                      COMPOSE REPLY
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Loader */}
              {isLoading ? (
                <div className="py-12 flex flex-col items-center justify-center text-slate-400">
                  <Loader2 className="w-6 h-6 animate-spin text-rose-500 mb-2" />
                  <span className="text-[9px] font-mono tracking-widest uppercase">Querying IMAP servers...</span>
                </div>
              ) : emails.length === 0 ? (
                <div className="py-12 text-slate-400 border border-dashed border-slate-100 rounded-2xl bg-slate-50/30 text-center text-[10px] font-mono font-medium">
                  No aligned email nodes found under query parameters.
                </div>
              ) : (
                /* Listed Emails Grid */
                <div className="space-y-2">
                  {emails.map((email) => (
                    <div
                      key={email.id}
                      onClick={() => setSelectedEmail(email)}
                      className={`p-3 text-left rounded-xl border relative cursor-pointer group transition-all duration-200 ${
                        selectedEmail?.id === email.id
                          ? 'bg-rose-50/20 border-rose-350 shadow-sm'
                          : 'bg-white border-slate-100/90 hover:border-slate-200 hover:bg-slate-50/30'
                      }`}
                    >
                      <div className="pb-1.5 flex items-center justify-between font-mono text-[9px] text-slate-450">
                        <span className="font-extrabold text-slate-700 max-w-[170px] truncate block">
                          {email.from.split('<')[0]?.trim() || email.from}
                        </span>
                        <span className="text-[8px] opacity-75">{email.date.split(',')[1]?.trim() || email.date}</span>
                      </div>
                      
                      <h4 className="text-[10px] font-extrabold text-slate-800 truncate mb-1 leading-none group-hover:text-rose-600 transition-colors">
                        {email.subject}
                      </h4>
                      
                      <p className="text-[9px] text-slate-400 leading-normal line-clamp-2 pr-6">
                        {email.snippet}
                      </p>

                      <div className="absolute right-2.5 bottom-2.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <ChevronRight className="w-3.5 h-3.5 text-rose-400" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            /* Compose Email Form */
            <div className="space-y-3.5 text-left">
              <div className="space-y-1">
                <label className="block text-[8px] font-mono font-extrabold text-slate-400 uppercase">
                  RECIPIENT MATRIX (TO)
                </label>
                <input
                  type="email"
                  placeholder="recipient@example.com"
                  value={toInput}
                  onChange={(e) => setToInput(e.target.value)}
                  className="w-full bg-slate-50/70 border border-slate-100/80 px-3 py-2 rounded-xl text-[10px] font-mono tracking-tight text-slate-800 placeholder-slate-400 focus:outline-none focus:border-rose-400/50 focus:bg-white transition"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[8px] font-mono font-extrabold text-slate-400 uppercase">
                  SUBJECT ENVELOPE
                </label>
                <input
                  type="text"
                  placeholder="Synthesized Analytics Report..."
                  value={subjectInput}
                  onChange={(e) => setSubjectInput(e.target.value)}
                  className="w-full bg-slate-50/70 border border-slate-100/80 px-3 py-2 rounded-xl text-[10px] font-mono tracking-tight text-slate-800 placeholder-slate-400 focus:outline-none focus:border-rose-400/50 focus:bg-white transition"
                />
              </div>

              <div className="space-y-1 relative">
                <div className="flex items-center justify-between">
                  <label className="block text-[8px] font-mono font-extrabold text-slate-400 uppercase">
                    BODY STRUCTURE
                  </label>
                  
                  {/* AI Refiner Button */}
                  <button
                    type="button"
                    onClick={optimizeDraftWithAI}
                    disabled={isAIOptimizing}
                    className="py-1 px-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg text-[8px] font-mono font-extrabold flex items-center gap-1 border border-rose-200 shrink-0 transition"
                  >
                    {isAIOptimizing ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <Sparkles className="w-3 h-3 text-rose-500" />
                    )}
                    <span>EMAIL AGENT REFINER</span>
                  </button>
                </div>

                <textarea
                  placeholder="Write the message payload or outline instructions for the Email Agent helper..."
                  value={bodyInput}
                  onChange={(e) => setBodyInput(e.target.value)}
                  rows={6}
                  className="w-full bg-slate-50/70 border border-slate-100/80 px-3 py-2 rounded-xl text-[10px] font-mono tracking-tight text-slate-800 placeholder-slate-400 focus:outline-none focus:border-rose-400/50 focus:bg-white transition resize-none mt-1"
                />
              </div>

              {/* Action Rows */}
              <div className="pt-1.5 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => {
                    setToInput('');
                    setSubjectInput('');
                    setBodyInput('');
                  }}
                  className="px-3.5 py-2 hover:bg-slate-50 border border-slate-100 text-slate-500 rounded-xl text-[9px] font-mono font-black"
                >
                  CLEAR CELLS
                </button>

                <button
                  type="button"
                  onClick={() => setShowSendConfirm(true)}
                  disabled={isSending}
                  className="px-5 py-2 bg-slate-900 border border-slate-900 hover:bg-rose-500 text-white rounded-xl text-[10px] font-mono font-black transition flex items-center gap-2 shadow-sm cursor-pointer"
                >
                  {isSending ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Send className="w-3.5 h-3.5" />
                  )}
                  <span>SEND PRIMARY SMTP</span>
                </button>
              </div>
            </div>
          )}

          {/* SEND CONFIRMATION MODAL - MANDATORY VISUAL VERIFICATION MUTATION CONSTRAINT */}
          {showSendConfirm && (
            <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm flex items-center justify-center p-4 z-55">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white p-5 rounded-3xl border border-slate-100 max-w-sm w-full text-left space-y-4 shadow-xl"
              >
                <div className="flex items-center gap-2.5 text-amber-600">
                  <ShieldAlert className="w-5 h-5" />
                  <h4 className="text-xs font-bold font-mono tracking-tight uppercase">SMTP Verification Mandate</h4>
                </div>
                
                <p className="text-[10px] text-slate-500 leading-relaxed font-semibold">
                  You are enabling a real email dispatch command directly on your Gmail mailbox envelope on behalf of the administration.
                </p>

                <div className="p-3 rounded-2xl bg-slate-50 font-mono text-[9px] text-slate-650 space-y-1.5 border border-slate-100">
                  <div className="truncate"><span className="font-extrabold text-slate-800">RECIPIENT:</span> {toInput}</div>
                  <div className="truncate"><span className="font-extrabold text-slate-800">SUBJECT:</span> {subjectInput}</div>
                  <div className="line-clamp-2"><span className="font-extrabold text-slate-800">PREVIEW:</span> {bodyInput}</div>
                </div>

                <div className="flex items-center gap-2 pt-1.5">
                  <button
                    onClick={() => setShowSendConfirm(false)}
                    className="w-1/2 py-2 border border-slate-100 hover:bg-slate-50 rounded-xl text-[9px] font-mono font-black text-slate-500"
                  >
                    ABORT INITIATION
                  </button>
                  <button
                    onClick={handleComposeSend}
                    className="w-1/2 py-2 bg-rose-500 hover:bg-rose-600 rounded-xl text-[9px] font-mono font-black text-white"
                  >
                    CONFIRM DISPATCH
                  </button>
                </div>
              </motion.div>
            </div>
          )}

          {/* TRASH CONFIRMATION MODAL - MANDATORY VISUAL DELETION MUTATION CONSTRAINT */}
          {showDeleteConfirmId && (
            <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm flex items-center justify-center p-4 z-55">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white p-5 rounded-3xl border border-slate-100 max-w-sm w-full text-left space-y-4 shadow-xl"
              >
                <div className="flex items-center gap-2.5 text-rose-600">
                  <Trash2 className="w-5 h-5 shrink-0" />
                  <h4 className="text-xs font-bold font-mono tracking-tight uppercase">Trash Confirmation Core</h4>
                </div>
                
                <p className="text-[10px] text-slate-500 leading-relaxed font-semibold">
                  Confirm the deletion of this mail node? This mutates mail directory placement and will file this email under your Gmail Trash category.
                </p>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={() => setShowDeleteConfirmId(null)}
                    className="w-1/2 py-2 border border-slate-100 hover:bg-slate-50 rounded-xl text-[9px] font-mono font-black text-slate-500"
                  >
                    KEEP CELL
                  </button>
                  <button
                    onClick={() => handleDeleteEmail(showDeleteConfirmId)}
                    className="w-1/2 py-2 bg-rose-500 hover:bg-rose-600 rounded-xl text-[9px] font-mono font-black text-white"
                  >
                    MOVE TO TRASH
                  </button>
                </div>
              </motion.div>
            </div>
          )}

        </div>
      )}
    </div>
  );
}
