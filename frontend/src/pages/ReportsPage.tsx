import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { SpendingBarChart, buildMonthlyData } from '../components/SpendingBarChart';
import { CategoryPieChart } from '../components/CategoryPieChart';
import { Skeleton } from '../components/ui/Skeleton';
import { useTransactions } from '../hooks/useTransactions';
import { useBudgetCategories } from '../hooks/useBudget';
import { formatCurrency, HEBREW_MONTHS } from '../lib/utils';

export default function ReportsPage() {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());

  // Last 12 months of data for bar chart
  const yearAgo = new Date(year, month - 13, 1);
  const { data: allData, isLoading } = useTransactions({
    dateFrom: yearAgo.toISOString().split('T')[0],
    limit: 5000,
  });

  const { data: categories = [] } = useBudgetCategories();

  const allTxns = allData?.data || [];

  // Current month transactions
  const monthStr = `${year}-${String(month).padStart(2, '0')}`;
  const monthTxns = allTxns.filter((t) => t.date.startsWith(monthStr));
  const expenses = monthTxns.filter((t) => t.type === 'expense');

  // Category breakdown
  const catMap: Record<string, number> = {};
  for (const tx of expenses) {
    const cat = tx.category || 'אחר';
    catMap[cat] = (catMap[cat] || 0) + Math.abs(tx.amount);
  }
  const pieData = Object.entries(catMap).map(([name, value], i) => ({
    name,
    value,
    color: categories.find(c => c.name === name)?.color || ['#6366f1','#22c55e','#f59e0b','#ef4444','#3b82f6','#a855f7'][i % 6],
  })).sort((a, b) => b.value - a.value);

  // Category table
  const catTable = Object.entries(catMap).map(([name, total]) => {
    const txs = expenses.filter(t => (t.category || 'אחר') === name);
    return { name, total, count: txs.length, avg: total / txs.length };
  }).sort((a, b) => b.total - a.total);

  // Top 10 expenses
  const top10 = [...expenses].sort((a, b) => Math.abs(a.amount) - Math.abs(b.amount)).reverse().slice(0, 10);

  const barData = buildMonthlyData(allTxns, 12);

  return (
    <div className="max-w-6xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-100">דוחות</h1>
        <div className="flex items-center gap-3 p-3 bg-slate-800 rounded-xl border border-slate-700">
          <select
            value={month}
            onChange={(e) => setMonth(parseInt(e.target.value))}
            className="bg-transparent text-slate-200 text-sm focus:outline-none"
          >
            {HEBREW_MONTHS.map((m, i) => (
              <option key={i} value={i + 1} className="bg-slate-800">{m}</option>
            ))}
          </select>
          <select
            value={year}
            onChange={(e) => setYear(parseInt(e.target.value))}
            className="bg-transparent text-slate-200 text-sm focus:outline-none"
          >
            {[year - 1, year, year + 1].map((y) => (
              <option key={y} value={y} className="bg-slate-800">{y}</option>
            ))}
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {/* Bar chart - 12 months */}
          <Card>
            <CardHeader>
              <CardTitle>הכנסות והוצאות — 12 חודשים אחרונים</CardTitle>
            </CardHeader>
            <CardContent>
              <SpendingBarChart data={barData} />
            </CardContent>
          </Card>

          {/* Pie + table */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>הוצאות לפי קטגוריה — {HEBREW_MONTHS[month - 1]} {year}</CardTitle>
              </CardHeader>
              <CardContent>
                <CategoryPieChart data={pieData} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>פירוט לפי קטגוריה</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-700">
                      <th className="py-2 px-4 text-right text-slate-400 font-medium">קטגוריה</th>
                      <th className="py-2 px-4 text-right text-slate-400 font-medium">עסקאות</th>
                      <th className="py-2 px-4 text-left text-slate-400 font-medium">סה"כ</th>
                      <th className="py-2 px-4 text-left text-slate-400 font-medium">ממוצע</th>
                    </tr>
                  </thead>
                  <tbody>
                    {catTable.length === 0 ? (
                      <tr><td colSpan={4} className="py-8 text-center text-slate-400">אין נתונים</td></tr>
                    ) : catTable.map((row) => (
                      <tr key={row.name} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                        <td className="py-2 px-4 text-slate-200">{row.name}</td>
                        <td className="py-2 px-4 text-slate-400">{row.count}</td>
                        <td className="py-2 px-4 text-right text-red-400 font-medium">{formatCurrency(row.total)}</td>
                        <td className="py-2 px-4 text-right text-slate-400">{formatCurrency(row.avg)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </div>

          {/* Top 10 expenses */}
          <Card>
            <CardHeader>
              <CardTitle>10 ההוצאות הגדולות ביותר — {HEBREW_MONTHS[month - 1]} {year}</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-700">
                    <th className="py-2 px-4 text-right text-slate-400 font-medium">#</th>
                    <th className="py-2 px-4 text-right text-slate-400 font-medium">תאריך</th>
                    <th className="py-2 px-4 text-right text-slate-400 font-medium">תיאור</th>
                    <th className="py-2 px-4 text-right text-slate-400 font-medium">קטגוריה</th>
                    <th className="py-2 px-4 text-left text-slate-400 font-medium">סכום</th>
                  </tr>
                </thead>
                <tbody>
                  {top10.length === 0 ? (
                    <tr><td colSpan={5} className="py-8 text-center text-slate-400">אין נתונים</td></tr>
                  ) : top10.map((tx, i) => (
                    <tr key={tx.id} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                      <td className="py-2 px-4 text-slate-500">{i + 1}</td>
                      <td className="py-2 px-4 text-slate-400 whitespace-nowrap">{tx.date}</td>
                      <td className="py-2 px-4 text-slate-200">{tx.description}</td>
                      <td className="py-2 px-4 text-slate-400">{tx.category || '—'}</td>
                      <td className="py-2 px-4 text-right text-red-400 font-semibold">{formatCurrency(Math.abs(tx.amount))}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
