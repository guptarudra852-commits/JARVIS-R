import React, { useState, useEffect } from 'react';
import { useAgent } from '../lib/agent-context';
import { motion } from 'motion/react';
import { 
  Calendar, 
  Clock, 
  Plus, 
  Trash2, 
  AlertCircle, 
  CheckCircle2, 
  RefreshCw, 
  Sparkles, 
  Lock,
  ChevronRight
} from 'lucide-react';

interface CalendarEvent {
  id: string;
  summary: string;
  description?: string;
  start?: {
    dateTime?: string;
    date?: string;
  };
  end?: {
    dateTime?: string;
    date?: string;
  };
  htmlLink?: string;
}

export default function GoogleCalendarPanel() {
  const { googleToken, loginWithGoogle, appendLog, user } = useAgent();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form states for creating events
  const [showAddForm, setShowAddForm] = useState(false);
  const [summary, setSummary] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [duration, setDuration] = useState('60'); // Minutes
  const [isCreating, setIsCreating] = useState(false);

  // Deletion protective modal/dialog state
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [pendingDeleteTitle, setPendingDeleteTitle] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchCalendarEvents = async () => {
    if (!googleToken) return;
    setLoading(true);
    setError(null);
    try {
      const nowIso = new Date().toISOString();
      const res = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/primary/events?maxResults=8&orderBy=startTime&singleEvents=true&timeMin=${nowIso}`,
        {
          headers: {
            Authorization: `Bearer ${googleToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!res.ok) {
        if (res.status === 401) {
          throw new Error('UNAUTHORIZED_EXPIRED_TOKEN');
        }
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson?.error?.message || `Google Calendar response error: Status [${res.status}]`);
      }

      const data = await res.json();
      setEvents(data.items || []);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (googleToken) {
      fetchCalendarEvents();
      // Auto-set standard date to today for convenience
      setStartDate(new Date().toISOString().slice(0, 10));
    }
  }, [googleToken]);

  const handleRegisterEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!googleToken || !summary.trim() || !startDate) return;
    setIsCreating(true);
    setError(null);

    // Compute start ISO and end ISO
    let startDateTimeIso = '';
    let endDateTimeIso = '';
    try {
      const combineStart = new Date(`${startDate}T${startTime}:00`);
      startDateTimeIso = combineStart.toISOString();

      const durationMinutes = Number(duration) || 60;
      const combineEnd = new Date(combineStart.getTime() + durationMinutes * 60000);
      endDateTimeIso = combineEnd.toISOString();
    } catch {
      setError("Invalid dates parsed. Verify input coordinates.");
      setIsCreating(false);
      return;
    }

    try {
      const res = await fetch(
        'https://www.googleapis.com/calendar/v3/calendars/primary/events',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${googleToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            summary: summary.trim(),
            description: description.trim() || undefined,
            start: { dateTime: startDateTimeIso },
            end: { dateTime: endDateTimeIso }
          })
        }
      );

      if (!res.ok) {
        throw new Error(`Google API yielded status [${res.status}]`);
      }

      appendLog(`Successfully registered calendar event: "${summary}"`, 'success');
      setSummary('');
      setDescription('');
      setShowAddForm(false);
      fetchCalendarEvents();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsCreating(false);
    }
  };

  const triggerPurgeEvent = (id: string, titleName: string) => {
    setPendingDeleteId(id);
    setPendingDeleteTitle(titleName);
  };

  const handlePurgeConfirm = async () => {
    if (!googleToken || !pendingDeleteId) return;
    setIsDeleting(true);
    setError(null);
    try {
      const res = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/primary/events/${pendingDeleteId}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${googleToken}`
          }
        }
      );

      if (!res.ok) {
        throw new Error(`Google API yielded status [${res.status}]`);
      }

      appendLog(`Deleted calendar event: "${pendingDeleteTitle}"`, 'warning');
      setPendingDeleteId(null);
      setPendingDeleteTitle('');
      fetchCalendarEvents();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsDeleting(false);
    }
  };

  const formatEventTime = (dateTimeStr?: string, dateStr?: string) => {
    if (!dateTimeStr && !dateStr) return 'All Day';
    if (dateTimeStr) {
      const d = new Date(dateTimeStr);
      return d.toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    }
    return dateStr ? `${new Date(dateStr).toLocaleDateString([], { month: 'short', day: 'numeric' })} (All Day)` : 'All Day';
  };

  return (
    <div className="flex flex-col h-full space-y-4 text-left">
      {/* Header bar */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center space-x-2">
          <Calendar className="w-5 h-5 text-blue-600 animate-subtle-float" />
          <div className="text-left">
            <h2 className="text-xs font-bold tracking-tight text-slate-800 uppercase font-mono">
              Workspace Calendar
            </h2>
            <p className="text-[10px] text-slate-400 font-mono uppercase tracking-wide">
              {googleToken ? `${events.length} UPCOMING SLOTS` : "RESTRICTED CALENDAR"}
            </p>
          </div>
        </div>

        {googleToken && (
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center space-x-1 px-2.5 py-1 text-[11px] font-bold border border-slate-100 hover:bg-slate-50 text-slate-600 rounded-lg transition-all cursor-pointer"
          >
            {showAddForm ? '✕' : <Plus className="w-3.5 h-3.5" />}
            <span>{showAddForm ? 'CANCEL' : 'ADD WORK'}</span>
          </button>
        )}
      </div>

      {!googleToken ? (
        <div className="p-4 border border-slate-100 rounded-2xl bg-slate-50 text-center space-y-3">
          <Calendar className="w-8 h-8 text-slate-300 mx-auto" />
          <h3 className="text-xs font-bold text-slate-700 uppercase">Authorize Calendar</h3>
          <p className="text-[10px] text-slate-400 leading-relaxed max-w-xs mx-auto">
            Authorize Google Workspace Calendar scopes to manage timelines, schedule task queues, and link calendar events seamlessly.
          </p>
          <button
            onClick={loginWithGoogle}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 hover:shadow-md text-white font-bold text-xs rounded-lg transition-all cursor-pointer"
          >
            AUTHORIZE CALENDAR INTEGRATION
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {error && (
            <div className="p-3 border border-rose-100 bg-rose-50/40 rounded-xl text-[10px] text-rose-600 font-mono flex items-center space-x-1.5">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 animate-bounce" />
              <span>{error}</span>
            </div>
          )}

          {/* Create Event Form container */}
          {showAddForm && (
            <form 
              onSubmit={handleRegisterEvent}
              className="p-4 border border-slate-100 bg-slate-55 bg-slate-50/60 rounded-xl space-y-3 text-left"
            >
              <div className="text-[10px] uppercase font-bold tracking-wider text-slate-600 border-b border-slate-100 pb-1.5 flex items-center gap-1 font-mono">
                <Sparkles className="w-3.5 h-3.5 text-blue-500 animate-pulse" />
                <span>Register Calendar Event</span>
              </div>

              <div className="space-y-2">
                <div>
                  <label className="block text-[8px] font-bold font-mono text-slate-400 uppercase mb-1">Event Summary *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Conduct Containment Grid Calibration"
                    value={summary}
                    onChange={(e) => setSummary(e.target.value)}
                    className="w-full text-xs bg-white border border-slate-150 text-slate-800 placeholder-slate-400 p-2 rounded-lg outline-none focus:border-blue-400 font-sans"
                  />
                </div>

                <div>
                  <label className="block text-[8px] font-bold font-mono text-slate-400 uppercase mb-1">Description</label>
                  <textarea
                    placeholder="Provide additional operational logs context..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full text-xs bg-white border border-slate-150 text-slate-800 placeholder-slate-400 p-2 rounded-lg outline-none focus:border-blue-400 font-sans min-h-12 max-h-24 resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[8px] font-bold font-mono text-slate-404 uppercase mb-1">Date *</label>
                    <input
                      type="date"
                      required
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full text-xs bg-white border border-slate-150 text-slate-700 p-2 rounded-lg outline-none focus:border-blue-400"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-[8px] font-bold font-mono text-slate-404 uppercase mb-1">Time *</label>
                    <input
                      type="time"
                      required
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="w-full text-xs bg-white border border-slate-150 text-slate-700 p-2 rounded-lg outline-none focus:border-blue-400"
                    />
                  </div>

                  <div>
                    <label className="block text-[8px] font-bold font-mono text-slate-404 uppercase mb-1">Length *</label>
                    <select
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      className="w-full text-xs bg-white border border-slate-150 text-slate-700 p-2 rounded-lg cursor-pointer outline-none focus:border-blue-400"
                    >
                      <option value="15">15 mins</option>
                      <option value="30">30 mins</option>
                      <option value="60">1 hr</option>
                      <option value="120">2 hrs</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-1.5">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-3 py-1 text-[11px] text-slate-500 hover:text-slate-700 font-bold uppercase cursor-pointer"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="px-4 py-1 bg-blue-600 hover:bg-blue-700 hover:shadow-md text-white rounded-lg text-[11px] font-bold uppercase cursor-pointer disabled:opacity-50"
                >
                  {isCreating ? 'SYNCHRONIZING...' : 'INJECT SLOT'}
                </button>
              </div>
            </form>
          )}

          {/* Purge protective panel popup */}
          {pendingDeleteId && (
            <div className="border border-rose-200 bg-rose-50/70 p-3 rounded-xl text-slate-800 space-y-2 text-left">
              <div className="flex items-center space-x-2 text-rose-600 text-[11px] font-bold uppercase tracking-wider font-mono">
                <AlertCircle className="w-4 h-4 animate-pulse shrink-0" />
                <span>SECURITY DIALOGUE: CONFIRM ACTION</span>
              </div>
              
              <div className="text-[10px] text-slate-500 leading-relaxed font-sans">
                You are executing a <strong className="text-rose-600">DESTRUCTIVE CALENDAR PURGE</strong>.<br />
                This will permanently delete the event <strong className="text-slate-800">"{pendingDeleteTitle}"</strong> from your primary workspace calendar cluster.
              </div>

              <div className="flex justify-end space-x-2 pt-1 select-none">
                <button
                  onClick={() => {
                    setPendingDeleteId(null);
                    setPendingDeleteTitle('');
                  }}
                  className="px-2.5 py-1 bg-white hover:bg-slate-50 border border-slate-150 text-[10px] text-slate-650 rounded-lg cursor-pointer uppercase font-bold"
                >
                  ABORT
                </button>
                <button
                  onClick={handlePurgeConfirm}
                  disabled={isDeleting}
                  className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white text-[10px] font-bold rounded-lg cursor-pointer uppercase flex items-center space-x-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{isDeleting ? 'PURGING...' : 'CONFIRM PURGE'}</span>
                </button>
              </div>
            </div>
          )}

          {/* Calendar timeline listings */}
          {loading && events.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-6 text-slate-400 font-mono space-y-1.5 text-center">
              <RefreshCw className="w-5 h-5 animate-spin text-slate-400" />
              <span className="text-[9px] uppercase tracking-widest text-slate-400 font-bold">Querying calendar slot arrays...</span>
            </div>
          ) : events.length === 0 ? (
            <div className="py-12 border border-dashed border-slate-100 rounded-2xl text-center text-slate-400">
              <span className="text-[10px] uppercase font-mono tracking-widest text-slate-400">No upcoming calendar slots listed today.</span>
            </div>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {events.map((event) => (
                <div 
                  key={event.id}
                  className="group relative p-2.5 border border-slate-100 bg-white hover:bg-slate-50 hover:border-slate-200 rounded-xl transition duration-200 flex justify-between items-start gap-3 shadow-sm"
                >
                  <div className="space-y-1 text-left flex-1 min-w-0">
                    <div className="flex items-center space-x-1">
                      <ChevronRight className="w-3 h-3 text-blue-500 group-hover:translate-x-0.5 transition-transform shrink-0" />
                      <span className="text-[11.5px] font-bold text-slate-700 uppercase group-hover:text-blue-600 transition-colors truncate block">
                        {event.summary}
                      </span>
                    </div>

                    {event.description && (
                      <p className="text-[10px] text-slate-450 leading-relaxed font-medium pl-4 line-clamp-1 group-hover:line-clamp-none transition-all duration-300">
                        {event.description}
                      </p>
                    )}

                    <div className="flex items-center space-x-1 text-[9px] text-slate-400 font-sans pl-4">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span>{formatEventTime(event.start?.dateTime, event.start?.date)}</span>
                    </div>
                  </div>

                  <div className="flex-shrink-0 flex items-center space-x-1">
                    {event.htmlLink && (
                      <a
                        href={event.htmlLink}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1 hover:bg-slate-100 text-slate-400 hover:text-blue-600 rounded-md transition cursor-pointer"
                        title="View online"
                      >
                        <Calendar className="w-3.5 h-3.5" />
                      </a>
                    )}
                    <button
                      onClick={() => triggerPurgeEvent(event.id, event.summary)}
                      className="p-1 hover:bg-slate-100 text-slate-400 hover:text-rose-600 rounded-md transition cursor-pointer"
                      title="Purge Event"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
export { GoogleCalendarPanel };
