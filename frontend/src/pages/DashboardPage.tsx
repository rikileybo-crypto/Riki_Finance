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
  title: string; value: string; icon: React.ElementType; iconBg: string; iconColor: string; valueColor?: string;
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
  const monthTxns = allTxns.filter(t => t.date.startsWith(monthStr));
  const income   = monthTxns.filter(t => t.type === 'income').reduce((s, t) => s + Math.abs(t.amount), 0);
  const expenses = monthTxns.filter(t => t.type === 'expense').reduce((s, t) => s + Math.abs(t.amount), 0);
  const savings  = income - expenses;

  const balMap = accounts.length > 0
    ? allTxns.filter(t => t.balance != null).reduce((m, t) => {
        if (!m[t.account_id] || t.date > m[t.account_id].date) m[t.account_id] = t; return m;
      }, {} as Record<string, typeof allTxns[0]>) : {};
  const totalBal = Object.values(balMap).reduce((s, t) => s + (t.balance || 0), 0);

  const catMap: Record<string, number> = {};
  for (const tx of monthTxns.filter(t => t.type === 'expense')) {
    const c = tx.category || 'אחר'; catMap[c] = (catMap[c] || 0) + Math.abs(tx.amount);
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
          <RefreshCw size={15} className={syncAll.isPending ? 'animate-spin' : ''} />סנכרן הכל
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="יתרה כוללת"   value={formatCurrency(totalBal)}  icon={Wallet}       iconBg="bg-blue-50"   iconColor="text-blue-600"  valueColor={totalBal >= 0 ? 'text-gray-800' : 'text-red-600'} />
        <StatCard title="הכנסות החודש" value={formatCurrency(income)}     icon={TrendingUp}   iconBg="bg-green-50"  iconColor="text-green-600" valueColor="text-green-600" />
        <StatCard title="הוצאות החודש" value={formatCurrency(expenses)}   icon={TrendingDown} iconBg="bg-red-50"    iconColor="text-red-600"   valueColor="text-red-600" />
        <StatCard title="חיסכון"       value={formatCurrency(savings)}    icon={PiggyBank}    iconBg={savings >= 0 ? 'bg-green-50' : 'bg-red-50'} iconColor={savings >= 0 ? 'text-green-600' : 'text-red-600'} valueColor={savings >= 0 ? 'text-green-600' : 'text-red-600'} />
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
                <span className="text-red-600 font-semibold text-sm">{formatCurrency(Math.abs(tx.amount))}</span>
              </div>
            ))}
            {monthTxns.filter(t => t.type === 'expense').length === 0 && <p className="text-center text-gray-400 text-sm py-10">אין הוצאות החודש</p>}
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
          <h2 className="text-sm font-semibold text-amber-700 mb-3">התראות ({unreadAlerts.length})</h2>
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
