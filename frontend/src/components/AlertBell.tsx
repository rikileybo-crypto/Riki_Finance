import React, { useState } from 'react';
import { Bell, BellRing } from 'lucide-react';
import { useAlerts, useMarkAllAlertsRead, useMarkAlertRead } from '../hooks/useAlerts';
import { formatDate } from '../lib/utils';
import { Button } from './ui/Button';

export const AlertBell: React.FC = () => {
  const [open, setOpen] = useState(false);
  const { data: alerts = [] } = useAlerts();
  const markAll = useMarkAllAlertsRead();
  const markOne = useMarkAlertRead();

  const unread = alerts.filter((a) => !a.is_read).length;

  const alertTypeColor = (type: string) => {
    if (type === 'budget_exceeded') return 'text-red-400';
    if (type === 'budget_warning') return 'text-amber-400';
    if (type === 'large_transaction') return 'text-indigo-400';
    return 'text-slate-400';
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-lg text-slate-300 hover:bg-slate-700 hover:text-slate-100 transition-colors"
      >
        {unread > 0 ? <BellRing size={20} className="text-amber-400" /> : <Bell size={20} />}
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center rounded-full bg-red-500 text-white text-xs font-bold">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-12 z-50 w-80 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-slate-700">
              <h3 className="text-sm font-semibold text-slate-200">התראות</h3>
              {unread > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => markAll.mutate()}
                  loading={markAll.isPending}
                  className="text-xs"
                >
                  סמן הכל כנקרא
                </Button>
              )}
            </div>

            <div className="max-h-80 overflow-y-auto">
              {alerts.length === 0 ? (
                <div className="p-6 text-center text-slate-400 text-sm">אין התראות</div>
              ) : (
                alerts.slice(0, 20).map((alert) => (
                  <div
                    key={alert.id}
                    onClick={() => !alert.is_read && markOne.mutate(alert.id)}
                    className={`p-3 border-b border-slate-700 cursor-pointer hover:bg-slate-700 transition-colors ${alert.is_read ? 'opacity-50' : ''}`}
                  >
                    <p className={`text-xs font-medium mb-1 ${alertTypeColor(alert.type)}`}>
                      {alert.type === 'budget_exceeded' ? '🚨 חריגת תקציב' :
                       alert.type === 'budget_warning' ? '⚠️ אזהרת תקציב' :
                       '💸 עסקה גדולה'}
                    </p>
                    <p className="text-xs text-slate-300 leading-relaxed">{alert.message}</p>
                    <p className="text-xs text-slate-500 mt-1">{formatDate(alert.triggered_at)}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
