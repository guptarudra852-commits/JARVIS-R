import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Bell, 
  Check, 
  Trash2, 
  Info, 
  AlertTriangle, 
  AlertCircle, 
  CheckCircle, 
  X,
  Sparkles
} from 'lucide-react';
import { SystemNotification } from '../types';

interface NotificationFeedProps {
  notifications: SystemNotification[];
  onMarkRead: (id: string) => void;
  onClearAll: () => void;
  onClose?: () => void;
}

export default function NotificationFeed({ notifications, onMarkRead, onClearAll, onClose }: NotificationFeedProps) {
  const unreadCount = notifications.filter(n => !n.read).length;

  const getNotificationIcon = (type: SystemNotification['type']) => {
    switch (type) {
      case 'success': return <CheckCircle className="w-4 h-4 text-emerald-500" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-amber-500" />;
      case 'error':
      case 'critical': return <AlertCircle className="w-4 h-4 text-rose-500" />;
      case 'info':
      default: return <Info className="w-4 h-4 text-blue-500" />;
    }
  };

  const getBorderColor = (type: SystemNotification['type'], read: boolean) => {
    if (read) return 'border-slate-100 bg-white/70';
    switch (type) {
      case 'success': return 'border-emerald-100 bg-emerald-50/20';
      case 'warning': return 'border-amber-100 bg-amber-50/20';
      case 'error':
      case 'critical': return 'border-rose-100 bg-rose-50/20';
      case 'info':
      default: return 'border-blue-100 bg-blue-50/20';
    }
  };

  return (
    <div className="flex flex-col h-full max-h-[400px] w-80 bg-white rounded-2xl border border-slate-100 shadow-xl overflow-hidden text-left">
      <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
        <div className="flex items-center space-x-2">
          <Bell className="w-4 h-4 text-blue-600 animate-bounce" />
          <span className="text-xs font-bold font-mono text-slate-800 uppercase tracking-tight">
            Administrative Feed ({unreadCount})
          </span>
        </div>
        
        <div className="flex items-center space-x-2">
          {notifications.length > 0 && (
            <button
              onClick={onClearAll}
              className="text-[10px] text-slate-400 hover:text-rose-500 font-bold uppercase tracking-wider flex items-center space-x-1 transition cursor-pointer"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          )}
          {onClose && (
            <button onClick={onClose} className="p-1 rounded-md hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition cursor-pointer">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      <div className="overflow-y-auto flex-1 p-3 space-y-2">
        <AnimatePresence initial={false}>
          {notifications.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-12 text-slate-400 space-y-2"
            >
              <Sparkles className="w-8 h-8 text-slate-200" />
              <p className="text-[10px] font-mono uppercase tracking-wider text-slate-400">All feeds clear. Matrix secure.</p>
            </motion.div>
          ) : (
            notifications.map((notification) => (
              <motion.div
                key={notification.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className={`p-3 rounded-xl border flex items-start space-x-3 transition-colors ${getBorderColor(notification.type, notification.read)}`}
              >
                <div className="mt-0.5 shrink-0">
                  {getNotificationIcon(notification.type)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className={`text-[11px] font-bold text-slate-800 leading-snug truncate ${notification.read ? 'text-slate-500 font-normal' : ''}`}>
                      {notification.title}
                    </span>
                    {!notification.read && (
                      <button
                        onClick={() => onMarkRead(notification.id)}
                        className="p-0.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-blue-600 transition cursor-pointer"
                        title="Mark as read"
                      >
                        <Check className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-500 leading-relaxed mt-0.5 word-break">
                    {notification.description}
                  </p>
                  <span className="text-[8px] font-mono text-slate-400 mt-1 block">
                    {new Date(notification.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
