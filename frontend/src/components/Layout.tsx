import React, { useEffect, useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { Home, Building2, List, Target, BarChart2, LogOut } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { AlertBell } from './AlertBell';
import { toast } from 'sonner';

const NAV_ITEMS = [
  { label: 'ראשי',    to: '/',             icon: Home,      exact: true },
  { label: 'חשבונות', to: '/accounts',     icon: Building2 },
  { label: 'עסקאות',  to: '/transactions', icon: List },
  { label: 'תקציב',   to: '/budget',       icon: Target },
  { label: 'דוחות',   to: '/reports',      icon: BarChart2 },
];

export default function Layout() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  useEffect(() => { supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email || '')); }, []);
  const logout = async () => { await supabase.auth.signOut(); toast.success('התנתקת בהצלחה'); navigate('/login'); };
  const initials = email ? email[0].toUpperCase() : 'R';

  return (
    <div className="flex h-screen bg-bg overflow-hidden" dir="rtl">
      <aside className="w-60 bg-brand-700 flex flex-col shrink-0 shadow-xl">
        <div className="px-6 py-6 border-b border-brand-600">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center text-lg">💰</div>
            <div>
              <h1 className="text-base font-bold text-white leading-tight">Riki Finance</h1>
              <p className="text-xs text-brand-200">ניהול כלכלי</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
          {NAV_ITEMS.map(({ label, to, icon: Icon, exact }) => (
            <NavLink key={to} to={to} end={exact}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive ? 'bg-white text-brand-700 shadow-sm' : 'text-brand-100 hover:bg-white/10 hover:text-white'
                }`
              }>
              <Icon size={17} />{label}
            </NavLink>
          ))}
        </nav>
        <div className="px-3 py-4 border-t border-brand-600">
          <div className="flex items-center gap-3 px-2 mb-3">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-sm font-bold text-white shrink-0">{initials}</div>
            <p className="text-xs text-brand-200 truncate">{email}</p>
          </div>
          <button onClick={logout} className="w-full flex items-center gap-2 px-4 py-2 rounded-xl text-sm text-brand-200 hover:bg-white/10 hover:text-white transition-colors">
            <LogOut size={15} />התנתקות
          </button>
        </div>
      </aside>
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-gray-100 px-8 py-3.5 flex items-center justify-between shrink-0 shadow-sm">
          <p className="text-sm text-gray-400 font-medium">ניהול כלכלי בית</p>
          <AlertBell />
        </header>
        <main className="flex-1 overflow-y-auto p-7"><Outlet /></main>
      </div>
    </div>
  );
}
