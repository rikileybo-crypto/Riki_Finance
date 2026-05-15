import React, { useState } from 'react';
import { Download, Search, ChevronRight, ChevronLeft } from 'lucide-react';
import * as XLSX from 'xlsx';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '../components/ui/Select';
import { TransactionRow } from '../components/TransactionRow';
import { Skeleton } from '../components/ui/Skeleton';
import { useTransactions } from '../hooks/useTransactions';
import { useAccounts } from '../hooks/useAccounts';
import { useBudgetCategories } from '../hooks/useBudget';
import { formatCurrency } from '../lib/utils';

export default function TransactionsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [accountId, setAccountId] = useState('');
  const [category, setCategory] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const LIMIT = 25;

  const { data, isLoading } = useTransactions({
    page,
    limit: LIMIT,
    search: search || undefined,
    accountId: accountId || undefined,
    category: category || undefined,
    dateFrom: dateFrom || undefined,
    dateTo: dateTo || undefined,
  });

  const { data: accounts = [] } = useAccounts();
  const { data: categories = [] } = useBudgetCategories();

  const transactions = data?.data || [];
  const total = data?.total || 0;
  const totalPages = Math.ceil(total / LIMIT);

  const totalIncome = transactions.filter(t => t.type === 'income').reduce((s, t) => s + Math.abs(t.amount), 0);
  const totalExpenses = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + Math.abs(t.amount), 0);

  const exportToExcel = () => {
    const rows = transactions.map((t) => ({
      תאריך: t.date,
      תיאור: t.description,
      קטגוריה: t.category || '',
      סכום: t.amount,
      סוג: t.type === 'income' ? 'הכנסה' : 'הוצאה',
      חשבון: t.personal_accounts?.name || '',
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'עסקאות');
    XLSX.writeFile(wb, `riki-finance-transactions-${new Date().toISOString().slice(0,10)}.xlsx`);
  };

  return (
    <div className="max-w-6xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-100">עסקאות</h1>
        <Button variant="outline" onClick={exportToExcel}>
          <Download size={16} />
          ייצוא Excel
        </Button>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 mb-4 p-4 bg-slate-800 rounded-xl border border-slate-700">
        <div className="relative col-span-2 md:col-span-1">
          <Search size={14} className="absolute top-2.5 right-3 text-slate-400" />
          <Input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="חיפוש..."
            className="pr-8"
          />
        </div>

        <Select value={accountId} onValueChange={(v) => { setAccountId(v === '__all' ? '' : v); setPage(1); }}>
          <SelectTrigger>
            <SelectValue placeholder="כל החשבונות" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all">כל החשבונות</SelectItem>
            {accounts.map((a) => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}
          </SelectContent>
        </Select>

        <Select value={category} onValueChange={(v) => { setCategory(v === '__all' ? '' : v); setPage(1); }}>
          <SelectTrigger>
            <SelectValue placeholder="כל הקטגוריות" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all">כל הקטגוריות</SelectItem>
            {categories.map((c) => <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>)}
          </SelectContent>
        </Select>

        <Input type="date" value={dateFrom} onChange={(e) => { setDateFrom(e.target.value); setPage(1); }} className="text-sm" />
        <Input type="date" value={dateTo} onChange={(e) => { setDateTo(e.target.value); setPage(1); }} className="text-sm" />
      </div>

      {/* Summary */}
      <div className="flex gap-4 mb-4 text-sm">
        <span className="text-slate-400">{total} עסקאות</span>
        <span className="text-emerald-400">הכנסות: {formatCurrency(totalIncome)}</span>
        <span className="text-red-400">הוצאות: {formatCurrency(totalExpenses)}</span>
      </div>

      {/* Table */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
        {isLoading ? (
          <div className="p-4 flex flex-col gap-2">
            {[1,2,3,4,5].map((i) => <Skeleton key={i} className="h-12" />)}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700 text-right">
                  <th className="py-3 px-4 text-xs font-medium text-slate-400">תאריך</th>
                  <th className="py-3 px-4 text-xs font-medium text-slate-400">תיאור</th>
                  <th className="py-3 px-4 text-xs font-medium text-slate-400">קטגוריה</th>
                  <th className="py-3 px-4 text-xs font-medium text-slate-400">חשבון</th>
                  <th className="py-3 px-4 text-xs font-medium text-slate-400 text-left">סכום</th>
                </tr>
              </thead>
              <tbody>
                {transactions.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-400">אין עסקאות להצגה</td>
                  </tr>
                ) : (
                  transactions.map((tx) => <TransactionRow key={tx.id} transaction={tx} />)
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-sm text-slate-400">עמוד {page} מתוך {totalPages}</p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setPage(p => p - 1)} disabled={page === 1}>
              <ChevronRight size={16} />
            </Button>
            <Button variant="outline" size="sm" onClick={() => setPage(p => p + 1)} disabled={page >= totalPages}>
              <ChevronLeft size={16} />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
