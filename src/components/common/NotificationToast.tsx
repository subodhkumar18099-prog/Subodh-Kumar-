/**
 * Sunvault Expenses Manager - Notification Toast
 */

import React from 'react';
import { useApp } from '../../context/AppContext';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export const NotificationToast: React.FC = () => {
  const { notification, setNotification } = useApp();

  if (!notification) return null;

  const bgStyles = {
    success: 'bg-emerald-950/95 border-emerald-500/50 text-emerald-200',
    error: 'bg-rose-950/95 border-rose-500/50 text-rose-200',
    info: 'bg-slate-900/95 border-amber-500/50 text-slate-100',
  }[notification.type];

  const Icon = {
    success: CheckCircle2,
    error: AlertCircle,
    info: Info,
  }[notification.type];

  return (
    <div className="fixed bottom-20 lg:bottom-6 right-4 left-4 sm:left-auto sm:w-96 z-50 animate-in fade-in slide-in-from-bottom-4 duration-200">
      <div className={`flex items-start gap-3 p-3.5 rounded-xl border shadow-2xl backdrop-blur-md ${bgStyles}`}>
        <Icon className="w-5 h-5 shrink-0 mt-0.5 text-amber-400" />
        <div className="text-xs font-medium leading-relaxed flex-1">{notification.message}</div>
        <button
          onClick={() => setNotification(null)}
          className="text-slate-400 hover:text-white p-0.5 rounded transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
