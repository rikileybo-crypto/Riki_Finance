import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import {
  Home,
  Building2,
  List,
  Target,
  BarChart2,
  LogOut,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { AlertBell } from './AlertBell';
import { Button } from './ui/Button';
import { toast } from 'sonner';
import { useEffect, useState } from 'react';

const NAV_ITEMS = [
  { label: 'ראשי', to: '/', icon: Home, exact: true },
  { label: 'חשבונות', to: '/accounts', icon: Building2 },
  { label: 'עסקאות', to: '/transactions', icon: List },
  { label: 'תקציב', to: '/budget', icon: Target },
  { label: 'דוחות', to: '/reports', icon: BarChart2 },
];

export default function Layout() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email || ''));
  }, []);

  const logout = async () => {
    await supabase.auth.signOut();
    toast.success('התנתקת בהצלחה');
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-slate-900 overflow-hidden" dir="rtl">
      {/* Sidebar - right side for RTL */}
      <aside className="w-56 bg-slate-800 border-l border-slate-700 flex flex-col shrink-0">
        {/* Logo */}
        <div className="p-5 border-b border-slate-700">
          <h1 className="text-xl font-bold text-indigo-400">Riki Finance 💰</h1>
          <p className="text-xs text-slate-400 mt-0.5">ניהול כלכלי בית</p>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 flex flex-col gap-1">
          {NAV_ITEMS.map(({ label, to, icon: Icon, exact }) => (
            <NavLink
              key={to}
              to={to}
              end={exact}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-600/30'
                    : 'text-slate-300 hover:bg-slate-700 hover:text-slate-100'
                }`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* User info */}
        <div className="p-3 border-t border-slate-700">
          <p className="text-xs text-slate-400 truncate px-2 mb-2">{email}</p>
          <Button variant="ghost" size="sm" onClick={logout} className="w-full justify-start text-slate-400 hover:text-red-300">
            <LogOut size={16} />
            התנתקות
          </Button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top header */}
        <header className="bg-slate-800 border-b border-slate-700 px-6 py-3 flex items-center justify-between shrink-0">
          <h2 className="text-base font-semibold text-slate-200">ניהול כלכלי בית</h2>
          <div className="flex items-center gap-3">
            <AlertBell />
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
