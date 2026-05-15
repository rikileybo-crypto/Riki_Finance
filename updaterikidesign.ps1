# Riki Finance - Design Update Script
# Run from: C:\Users\RikiLeybowitz\Documents\riki-finance-real

Set-Location $PSScriptRoot

# ── index.css ──────────────────────────────────────────────────────────────────
$indexCss = @'
@tailwind base;
@tailwind components;
@tailwind utilities;

@import url('https://fonts.googleapis.com/css2?family=Rubik:wght@300;400;500;600;700&display=swap');

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html {
  direction: rtl;
}

body {
  background-color: #EEF2F8;
  color: #1A2332;
  font-family: 'Rubik', 'Segoe UI', system-ui, sans-serif;
  min-height: 100vh;
}

#root {
  min-height: 100vh;
}

::-webkit-scrollbar { width: 5px; height: 5px; }
::-webkit-scrollbar-track { background: #EEF2F8; }
::-webkit-scrollbar-thumb { background: #CBD5E1; border-radius: 10px; }
::-webkit-scrollbar-thumb:hover { background: #94A3B8; }
'@
Set-Content -Path "frontend\src\index.css" -Value $indexCss -Encoding UTF8
Write-Host "✓ index.css"

# ── tailwind.config.js ─────────────────────────────────────────────────────────
$tailwindConfig = @'
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#EEF4FF',
          100: '#D9E8FF',
          200: '#B3D0FF',
          300: '#80B0FF',
          400: '#4D8FFF',
          500: '#1A6AE0',
          600: '#0052CC',
          700: '#003EA5',
          800: '#002D7A',
          900: '#001C52',
        },
        success: { DEFAULT: '#16A34A', light: '#DCFCE7' },
        danger:  { DEFAULT: '#DC2626', light: '#FEE2E2' },
        warning: { DEFAULT: '#D97706', light: '#FEF3C7' },
        surface: '#FFFFFF',
        bg:      '#EEF2F8',
      },
      fontFamily: {
        sans: ['Rubik', 'Segoe UI', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 4px 0 rgba(0,62,165,0.07), 0 4px 16px 0 rgba(0,62,165,0.05)',
        'card-hover': '0 4px 16px 0 rgba(0,62,165,0.14)',
      },
      borderRadius: {
        xl: '1rem',
        '2xl': '1.25rem',
      },
    },
  },
  plugins: [],
};
'@
Set-Content -Path "frontend\tailwind.config.js" -Value $tailwindConfig -Encoding UTF8
Write-Host "✓ tailwind.config.js"

# ── Layout.tsx ─────────────────────────────────────────────────────────────────
$layout = @'
import React, { useEffect, useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { Home, Building2, List, Target, BarChart2, LogOut } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { AlertBell } from './AlertBell';
import { toast } from 'sonner';

const NAV_ITEMS = [
  { label: 'ראשי',     to: '/',             icon: Home,      exact: true },
  { label: 'חשבונות',  to: '/accounts',     icon: Building2 },
  { label: 'עסקאות',   to: '/transactions', icon: List },
  { label: 'תקציב',    to: '/budget',       icon: Target },
  { label: 'דוחות',    to: '/reports',      icon: BarChart2 },
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
            <NavLink
              key={to}
              to={to}
              end={exact}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-white text-brand-700 shadow-sm'
                    : 'text-brand-100 hover:bg-white/10 hover:text-white'
                }`
              }
            >
              <Icon size={17} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="px-3 py-4 border-t border-brand-600">
          <div className="flex items-center gap-3 px-2 mb-3">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-sm font-bold text-white shrink-0">
              {initials}
            </div>
            <p className="text-xs text-brand-200 truncate">{email}</p>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center gap-2 px-4 py-2 rounded-xl text-sm text-brand-200 hover:bg-white/10 hover:text-white transition-colors"
          >
            <LogOut size={15} />
            התנתקות
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-gray-100 px-8 py-3.5 flex items-center justify-between shrink-0 shadow-sm">
          <p className="text-sm text-gray-400 font-medium">ניהול כלכלי בית</p>
          <AlertBell />
        </header>
        <main className="flex-1 overflow-y-auto p-7">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
'@
Set-Content -Path "frontend\src\components\Layout.tsx" -Value $layout -Encoding UTF8
Write-Host "✓ Layout.tsx"

# ── LoginPage.tsx ──────────────────────────────────────────────────────────────
$loginPage = @'
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

const schema = z.object({
  email: z.string().email('כתובת אימייל לא תקינה'),
  password: z.string().min(6, 'סיסמה חייבת להיות לפחות 6 תווים'),
});

type FormValues = z.infer<typeof schema>;

export default function LoginPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormValues) => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });
    setLoading(false);
    if (error) {
      toast.error(error.message === 'Invalid login credentials' ? 'אימייל או סיסמה שגויים' : error.message);
    } else {
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-bg flex" dir="rtl">
      <div className="hidden lg:flex flex-col justify-between w-2/5 bg-brand-700 p-12">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-white/15 flex items-center justify-center text-xl">💰</div>
          <span className="text-white font-bold text-lg">Riki Finance</span>
        </div>
        <div>
          <h2 className="text-3xl font-bold text-white leading-snug mb-4">
            שליטה מלאה<br />על הכלכלה שלך
          </h2>
          <p className="text-brand-200 text-sm leading-relaxed">
            חיבור אוטומטי לחשבון הבנק, פילוח הוצאות חכם ותקציב חודשי — הכל במקום אחד.
          </p>
        </div>
        <p className="text-brand-300 text-xs">© 2025 Riki Finance</p>
      </div>

      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-brand-700 flex items-center justify-center text-2xl mx-auto mb-4 shadow-lg">💰</div>
            <h1 className="text-2xl font-bold text-gray-800">כניסה לחשבון</h1>
            <p className="text-gray-400 text-sm mt-1">Riki Finance</p>
          </div>
          <div className="bg-white rounded-2xl shadow-card p-8">
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700">אימייל</label>
                <input
                  type="email"
                  {...register('email')}
                  placeholder="you@example.com"
                  dir="ltr"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent bg-gray-50 transition"
                />
                {errors.email && <p className="text-xs text-danger">{errors.email.message}</p>}
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700">סיסמה</label>
                <input
                  type="password"
                  {...register('password')}
                  placeholder="••••••••"
                  dir="ltr"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent bg-gray-50 transition"
                />
                {errors.password && <p className="text-xs text-danger">{errors.password.message}</p>}
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-brand-700 hover:bg-brand-600 text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 mt-1 disabled:opacity-60"
              >
                {loading && <Loader2 size={16} className="animate-spin" />}
                כניסה
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
'@
Set-Content -Path "frontend\src\pages\LoginPage.tsx" -Value $loginPage -Encoding UTF8
Write-Host "✓ LoginPage.tsx"

# ── AccountCard.tsx ────────────────────────────────────────────────────────────
$accountCard = @'
import React, { useState } from 'react';
import { RefreshCw, Trash2, Building2, CreditCard } from 'lucide-react';
import { Button } from './ui/Button';
import type { Account } from '../types';
import { formatCurrency, getRelativeTime } from '../lib/utils';
import { useDeleteAccount } from '../hooks/useAccounts';
import { useSyncAccount } from '../hooks/useSync';

interface AccountCardProps {
  account: Account;
  balance?: number;
}

export const AccountCard: React.FC<AccountCardProps> = ({ account, balance }) => {
  const deleteAccount = useDeleteAccount();
  const syncAccount = useSyncAccount();
  const [confirmDelete, setConfirmDelete] = useState(false);

  const isLeumi = account.type === 'leumi';
  const isSyncing = account.last_sync_status === 'syncing' || syncAccount.isPending;

  const statusColor = isSyncing
    ? 'bg-warning animate-pulse'
    : account.last_sync_status === 'success' ? 'bg-success'
    : account.last_sync_status === 'error' ? 'bg-danger'
    : 'bg-gray-300';

  return (
    <div
      className="bg-white rounded-2xl shadow-card overflow-hidden hover:shadow-card-hover transition-shadow"
      style={{ borderTop: `3px solid ${account.color || '#003EA5'}` }}
    >
      <div className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${statusColor}`} />
            <h3 className="font-semibold text-gray-800 text-base">{account.name}</h3>
          </div>
          <span className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1 rounded-full ${
            isLeumi ? 'bg-brand-50 text-brand-700' : 'bg-amber-50 text-amber-700'
          }`}>
            {isLeumi ? <><Building2 size={11} />לאומי</> : <><CreditCard size={11} />MAX</>}
          </span>
        </div>
        {balance !== undefined && (
          <div className="mb-4">
            <p className="text-xs text-gray-400 mb-0.5">יתרה</p>
            <p className={`text-2xl font-bold ${balance >= 0 ? 'text-success' : 'text-danger'}`}>
              {formatCurrency(balance)}
            </p>
          </div>
        )}
        <p className="text-xs text-gray-400">
          {account.last_sync_at ? `סונכרן ${getRelativeTime(account.last_sync_at)}` : 'טרם סונכרן'}
        </p>
        {account.last_sync_status === 'error' && (
          <p className="text-xs text-danger mt-1">שגיאה בסנכרון האחרון</p>
        )}
      </div>
      <div className="px-5 pb-5 flex gap-2">
        <Button size="sm" variant="outline" onClick={() => syncAccount.mutate(account.id)} loading={isSyncing} className="flex-1 border-gray-200 text-gray-600 hover:bg-gray-50">
          <RefreshCw size={14} />סנכרן
        </Button>
        {confirmDelete ? (
          <div className="flex gap-1">
            <button onClick={() => deleteAccount.mutate(account.id)} className="px-3 py-1.5 text-xs bg-danger text-white rounded-lg font-medium">אשר מחיקה</button>
            <button onClick={() => setConfirmDelete(false)} className="px-3 py-1.5 text-xs text-gray-500 rounded-lg hover:bg-gray-100">ביטול</button>
          </div>
        ) : (
          <button onClick={() => setConfirmDelete(true)} className="p-2 text-gray-400 hover:text-danger hover:bg-danger/5 rounded-lg transition-colors">
            <Trash2 size={15} />
          </button>
        )}
      </div>
    </div>
  );
};
'@
Set-Content -Path "frontend\src\components\AccountCard.tsx" -Value $accountCard -Encoding UTF8
Write-Host "✓ AccountCard.tsx"

# ── DashboardPage.tsx ──────────────────────────────────────────────────────────
$dashboardPage = @'
import React from 'react';
import { RefreshCw, TrendingUp, TrendingDown, Wallet, PiggyBank } from 'lucide-react';
import { Skeleton } from '../components/ui/Skeleton';
import { SpendingBarChart, buildMonthlyData } from '../components/SpendingBarChart';
import { CategoryPieChart } from '../components/CategoryPieChart';
import { TransactionRow } from '../components/TransactionRow';
import { BudgetProgress } from '../components/BudgetProgress';
import { useAccounts } from '../hooks/useAccounts';
import { useTransactions } from '../hooks/useTransactions';
import { useBudgetSummary, useBudgetCategories } from '../hooks/useBudget';
import { useAlerts } from '../hooks/useAlerts';
import { useSyncAll } from '../hooks/useSync';
import { formatCurrency, formatDate } from '../lib/utils';

function StatCard({ title, value, icon: Icon, iconBg, iconColor, valueColor = 'text-gray-800' }: {
  title: string; value: string; icon: React.ElementType;
  iconBg: string; iconColor: string; valueColor?: string;
}) {
  return (
    <div className="bg-white rounded-2xl shadow-card p-5 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${iconBg}`}>
        <Icon size={22} className={iconColor} />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-gray-400 font-medium mb-0.5">{title}</p>
        <p className={`text-xl font-bold leading-tight ${valueColor}`}>{value}</p>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();
  const monthStr = `${year}-${String(month).padStart(2, '0')}`;
  const sixMonthsAgo = new Date(year, now.getMonth() - 5, 1);

  const syncAll = useSyncAll();
  const { data: accounts = [] } = useAccounts();
  const { data: allTxData, isLoading: txLoading } = useTransactions({ dateFrom: sixMonthsAgo.toISOString().split('T')[0], limit: 5000 });
  const { data: recentData } = useTransactions({ limit: 5, page: 1 });
  const { data: summaryData } = useBudgetSummary(month, year);
  const { data: categories = [] } = useBudgetCategories();
  const { data: alerts = [] } = useAlerts();

  const allTxns = allTxData?.data || [];
  const recentTxns = recentData?.data || [];
  const monthTxns = allTxns.filter((t) => t.date.startsWith(monthStr));
  const income   = monthTxns.filter(t => t.type === 'income').reduce((s, t) => s + Math.abs(t.amount), 0);
  const expenses = monthTxns.filter(t => t.type === 'expense').reduce((s, t) => s + Math.abs(t.amount), 0);
  const savings  = income - expenses;

  const balMap = accounts.length > 0
    ? allTxns.filter(t => t.balance != null).reduce((m, t) => {
        if (!m[t.account_id] || t.date > m[t.account_id].date) m[t.account_id] = t;
        return m;
      }, {} as Record<string, typeof allTxns[0]>)
    : {};
  const totalBal = Object.values(balMap).reduce((s, t) => s + (t.balance || 0), 0);

  const catMap: Record<string, number> = {};
  for (const tx of monthTxns.filter(t => t.type === 'expense')) {
    const c = tx.category || 'אחר';
    catMap[c] = (catMap[c] || 0) + Math.abs(tx.amount);
  }
  const pieData = Object.entries(catMap)
    .map(([name, value], i) => ({ name, value, color: categories.find(c => c.name === name)?.color || ['#0052CC','#16A34A','#D97706','#DC2626','#7C3AED','#0891B2'][i % 6] }))
    .sort((a, b) => b.value - a.value).slice(0, 8);

  const barData = buildMonthlyData(allTxns, 6);
  const summary = summaryData?.summary || [];
  const unreadAlerts = alerts.filter(a => !a.is_read);
  const monthNames = ['ינואר','פברואר','מרץ','אפריל','מאי','יוני','יולי','אוגוסט','ספטמבר','אוקטובר','נובמבר','דצמבר'];

  return (
    <div className="max-w-6xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">שלום, רקי 👋</h1>
          <p className="text-sm text-gray-400 mt-0.5">{monthNames[now.getMonth()]} {year}</p>
        </div>
        <button onClick={() => syncAll.mutate()} disabled={syncAll.isPending}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 shadow-sm transition disabled:opacity-50">
          <RefreshCw size={15} className={syncAll.isPending ? 'animate-spin' : ''} />
          סנכרן הכל
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="יתרה כוללת"   value={formatCurrency(totalBal)}  icon={Wallet}       iconBg="bg-brand-50"    iconColor="text-brand-600"  valueColor={totalBal >= 0 ? 'text-gray-800' : 'text-danger'} />
        <StatCard title="הכנסות החודש" value={formatCurrency(income)}     icon={TrendingUp}   iconBg="bg-green-50"    iconColor="text-success"    valueColor="text-success" />
        <StatCard title="הוצאות החודש" value={formatCurrency(expenses)}   icon={TrendingDown} iconBg="bg-red-50"      iconColor="text-danger"     valueColor="text-danger" />
        <StatCard title="חיסכון"       value={formatCurrency(savings)}    icon={PiggyBank}    iconBg={savings >= 0 ? 'bg-green-50' : 'bg-red-50'} iconColor={savings >= 0 ? 'text-success' : 'text-danger'} valueColor={savings >= 0 ? 'text-success' : 'text-danger'} />
      </div>

      <div className="bg-white rounded-2xl shadow-card p-6">
        <h2 className="text-base font-semibold text-gray-700 mb-4">הכנסות והוצאות — 6 חודשים אחרונים</h2>
        {txLoading ? <Skeleton className="h-56" /> : <SpendingBarChart data={barData} />}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="bg-white rounded-2xl shadow-card p-6">
          <h2 className="text-base font-semibold text-gray-700 mb-4">הוצאות לפי קטגוריה</h2>
          {txLoading ? <Skeleton className="h-56" /> : <CategoryPieChart data={pieData} />}
        </div>
        <div className="bg-white rounded-2xl shadow-card overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-50">
            <h2 className="text-base font-semibold text-gray-700">5 הוצאות גדולות החודש</h2>
          </div>
          <div className="divide-y divide-gray-50">
            {monthTxns.filter(t => t.type === 'expense').sort((a, b) => Math.abs(b.amount) - Math.abs(a.amount)).slice(0, 5).map(tx => (
              <div key={tx.id} className="flex items-center justify-between px-6 py-3.5">
                <div>
                  <p className="text-sm font-medium text-gray-700">{tx.description}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{formatDate(tx.date)}</p>
                </div>
                <span className="text-danger font-semibold text-sm">{formatCurrency(Math.abs(tx.amount))}</span>
              </div>
            ))}
            {monthTxns.filter(t => t.type === 'expense').length === 0 && (
              <p className="text-center text-gray-400 text-sm py-10">אין הוצאות החודש</p>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="bg-white rounded-2xl shadow-card overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-50">
            <h2 className="text-base font-semibold text-gray-700">עסקאות אחרונות</h2>
          </div>
          <table className="w-full">
            <tbody>
              {recentTxns.map(tx => <TransactionRow key={tx.id} transaction={tx} />)}
              {recentTxns.length === 0 && <tr><td className="py-10 text-center text-gray-400 text-sm">אין עסקאות</td></tr>}
            </tbody>
          </table>
        </div>
        <div className="bg-white rounded-2xl shadow-card p-6">
          <h2 className="text-base font-semibold text-gray-700 mb-4">תקציב החודש</h2>
          <div className="flex flex-col gap-3">
            {summary.length === 0
              ? <p className="text-gray-400 text-sm text-center py-6">הגדר קטגוריות תקציב</p>
              : summary.slice(0, 5).map(s => <BudgetProgress key={s.category.id} summary={s} />)
            }
          </div>
        </div>
      </div>

      {unreadAlerts.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
          <h2 className="text-sm font-semibold text-warning mb-3">התראות ({unreadAlerts.length})</h2>
          <div className="flex flex-col gap-2">
            {unreadAlerts.slice(0, 5).map(alert => (
              <div key={alert.id} className="flex items-start justify-between gap-4">
                <p className="text-sm text-gray-700">{alert.message}</p>
                <p className="text-xs text-gray-400 shrink-0">{formatDate(alert.triggered_at)}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
'@
Set-Content -Path "frontend\src\pages\DashboardPage.tsx" -Value $dashboardPage -Encoding UTF8
Write-Host "✓ DashboardPage.tsx"

Write-Host ""
Write-Host "כל הקבצים עודכנו בהצלחה!" -ForegroundColor Green
Write-Host "עכשיו הריצי: git add . && git commit -m 'Redesign: clean banking UI' && git push https://rikileybo-crypto@github.com/rikileybo-crypto/Riki_Finance.git main"
