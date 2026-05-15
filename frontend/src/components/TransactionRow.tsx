import React, { useState } from 'react';
import type { Transaction } from '../types';
import { formatCurrency, formatDate } from '../lib/utils';
import { CategoryBadge } from './CategoryBadge';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from './ui/Select';
import { useUpdateTransaction } from '../hooks/useTransactions';
import { useBudgetCategories } from '../hooks/useBudget';

interface TransactionRowProps {
  transaction: Transaction;
}

export const TransactionRow: React.FC<TransactionRowProps> = ({ transaction }) => {
  const [editing, setEditing] = useState(false);
  const update = useUpdateTransaction();
  const { data: categories = [] } = useBudgetCategories();

  const isExpense = transaction.type === 'expense';
  const displayAmount = Math.abs(transaction.amount);

  const handleCategoryChange = (cat: string) => {
    update.mutate({ id: transaction.id, data: { category: cat === '__none' ? undefined : cat } });
    setEditing(false);
  };

  const accountName = transaction.personal_accounts?.name || '—';

  return (
    <tr className="border-b border-slate-700 hover:bg-slate-800/50 transition-colors">
      <td className="py-3 px-4 text-sm text-slate-300 whitespace-nowrap">{formatDate(transaction.date)}</td>
      <td className="py-3 px-4 text-sm text-slate-200 max-w-xs">
        <span className="truncate block">{transaction.description}</span>
        {transaction.notes && <span className="text-xs text-slate-400">{transaction.notes}</span>}
      </td>
      <td className="py-3 px-4">
        {editing ? (
          <Select value={transaction.category || ''} onValueChange={handleCategoryChange}>
            <SelectTrigger className="w-36 h-7 text-xs">
              <SelectValue placeholder="קטגוריה" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__none">ללא קטגוריה</SelectItem>
              {categories.map((c) => (
                <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <CategoryBadge
            category={transaction.category}
            color={categories.find(c => c.name === transaction.category)?.color}
            onClick={() => setEditing(true)}
          />
        )}
      </td>
      <td className="py-3 px-4 text-sm text-slate-400 whitespace-nowrap">{accountName}</td>
      <td className={`py-3 px-4 text-sm font-semibold whitespace-nowrap text-left ${isExpense ? 'text-red-400' : 'text-emerald-400'}`}>
        {isExpense ? '-' : '+'}{formatCurrency(displayAmount)}
      </td>
    </tr>
  );
};
