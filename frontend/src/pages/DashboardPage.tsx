import React from 'react';
import { RefreshCw, TrendingUp, TrendingDown, Wallet, PiggyBank } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Skeleton } from '../components/ui/Skeleton';
import { SpendingBarChart, buildMonthlyData } from '../components/SpendingBarChart';
import { CategoryPieChart } from '../components/CategoryPieChart';
import { TransactionRow } from '../components/TransactionRow';
import { BudgetProgress } from '../components/BudgetProgress';
import { useAccounts } from '../hooks/useAccounts';
import { useTransactions } from '../hooks/useTransactions';
import { useBudgetSummary } from '../hooks/useBudget';
import { useBudgetCategories } from '../hooks/useBudget';
import { useAlerts } from '../hooks/useAlerts';
import { useSyncAll } from '../hooks/useSync';
import { formatCurrency, formatDate } from '../lib/utils';

function StatCard({ title, value, icon: Icon, color }: {
  title: string; value: string; icon: React.ElementType; color: string;
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm text-slate-400">{title}</p>
          <div className={`p-2 rounded-lg ${color}`}>
            <Icon size={16} />
          </div>
        </div>
        <p className="text-xl font-bold text-slate-100">{value}</p>
      </CardContent>
    </Card>
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
  const { data: allTxData, isLoading: txLoading } = useTransactions({
    dateFrom: sixMonthsAgo.toISOString().split('T')[0],
    limit: 5000,
  });
  const { data: recentData } = useTransactions({ limit: 5, page: 1 });
  const { data: summaryData } = useBudgetSummary(month, year);
  const { data: categories = [] } = useBudgetCategories();
  const { data: alerts = [] } = useAlerts();

  const allTxns = allTxData?.data || [];
  const recentTxns = recentData?.data || [];

  const monthTxns = allTxns.filter((t) => t.date.startsWith(monthStr));
  const income = monthTxns.filter((t) => t.type === 'income').reduce((s, t) => s + Math.abs(t.amount), 0);
  const expenses = monthTxns.filter((t) => t.type === 'expense').reduce((s, t) => s + Math.abs(t.amount), 0);
  const savings = income - expenses;

  // Total balance from latest transaction balances
  const totalBalance = accounts.length > 0 ? allTxns
    .filter((t) => t.balance != null)
    .reduce((latest, t) => {
      const key = t.account_id;
      if (!latest[key] || t.date > latest[key].date) latest[key] = t;
      return latest;
    }, {} as Record<string, typeof allTxns[0]>)
  : {};
  const totalBal = Object.values(totalBalance).reduce((s, t) => s + (t.balance || 0), 0);

  // Pie chart data
  const catMap: Record<string, number> = {};
  for (const tx of monthTxns.filter(t => t.type === 'expense')) {
    const cat = tx.category || 'אחר';
    catMap[cat] = (catMap[cat] || 0) + Math.abs(tx.amount);
  }
  const pieData = Object.entries(catMap).map(([name, value], i) => ({
    name,
    value,
    color: categories.find(c => c.name === name)?.color || ['#6366f1','#22c55e','#f59e0b','#ef4444','#3b82f6','#a855f7'][i % 6],
  })).sort((a, b) => b.value - a.value).slice(0, 8);

  const barData = buildMonthlyData(allTxns, 6);
  const summary = summaryData?.summary || [];
  const unreadAlerts = alerts.filter((a) => !a.is_read);

  return (
    <div className="max-w-6xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-100">לוח בקרה</h1>
        <Button onClick={() => syncAll.mutate()} loading={syncAll.isPending} variant="outline">
          <RefreshCw size={16} />
          סנכרן הכל
        </Button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard
          title="יתרה כוללת"
          value={formatCurrency(totalBal)}
          icon={Wallet}
          color="bg-indigo-600/20 text-indigo-400"
        />
        <StatCard
          title="הכנסות החודש"
          value={formatCurrency(income)}
          icon={TrendingUp}
          color="bg-emerald-600/20 text-emerald-400"
        />
        <StatCard
          title="הוצאות החודש"
          value={formatCurrency(expenses)}
          icon={TrendingDown}
          color="bg-red-600/20 text-red-400"
        />
        <StatCard
          title="חיסכון"
          value={formatCurrency(savings)}
          icon={PiggyBank}
          color={savings >= 0 ? 'bg-emerald-600/20 text-emerald-400' : 'bg-red-600/20 text-red-400'}
        />
      </div>

      {/* Bar chart */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>הכנסות והוצאות — 6 חודשים אחרונים</CardTitle>
        </CardHeader>
        <CardContent>
          {txLoading ? <Skeleton className="h-64" /> : <SpendingBarChart data={barData} />}
        </CardContent>
      </Card>

      {/* Pie + Top expenses */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>הוצאות לפי קטגוריה החודש</CardTitle>
          </CardHeader>
          <CardContent>
            {txLoading ? <Skeleton className="h-64" /> : <CategoryPieChart data={pieData} />}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>5 הוצאות גדולות החודש</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <table className="w-full text-sm">
              <tbody>
                {monthTxns
                  .filter(t => t.type === 'expense')
                  .sort((a, b) => Math.abs(a.amount) - Math.abs(b.amount))
                  .reverse()
                  .slice(0, 5)
                  .map((tx) => (
                    <tr key={tx.id} className="flex items-center justify-between px-5 py-2.5 border-b border-slate-700/50">
                      <div>
                        <p className="text-slate-200 text-sm">{tx.description}</p>
                        <p className="text-slate-500 text-xs">{formatDate(tx.date)}</p>
                      </div>
                      <span className="text-red-400 font-semibold">{formatCurrency(Math.abs(tx.amount))}</span>
                    </tr>
                  ))}
                {monthTxns.filter(t => t.type === 'expense').length === 0 && (
                  <tr><td className="py-8 text-center text-slate-400 block">אין הוצאות החודש</td></tr>
                )}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>

      {/* Recent transactions + Budget overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>עסקאות אחרונות</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <table className="w-full">
              <tbody>
                {recentTxns.map((tx) => <TransactionRow key={tx.id} transaction={tx} />)}
                {recentTxns.length === 0 && (
                  <tr><td className="py-8 text-center text-slate-400">אין עסקאות</td></tr>
                )}
              </tbody>
            </table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>תקציב החודש</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {summary.length === 0 ? (
              <p className="text-slate-400 text-sm text-center py-4">הגדר קטגוריות תקציב</p>
            ) : (
              summary.slice(0, 5).map((s) => (
                <BudgetProgress key={s.category.id} summary={s} />
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Unread alerts */}
      {unreadAlerts.length > 0 && (
        <Card className="mt-6 border-amber-700/40">
          <CardHeader>
            <CardTitle className="text-amber-400">⚠️ התראות שלא נקראו ({unreadAlerts.length})</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {unreadAlerts.slice(0, 5).map((alert) => (
              <div key={alert.id} className="p-3 rounded-lg bg-amber-900/10 border border-amber-700/20">
                <p className="text-sm text-amber-300">{alert.message}</p>
                <p className="text-xs text-slate-500 mt-1">{formatDate(alert.triggered_at)}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
