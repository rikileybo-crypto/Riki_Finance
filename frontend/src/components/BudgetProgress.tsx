import React from 'react';
import type { BudgetSummary } from '../types';
import { formatCurrency } from '../lib/utils';
import { cn } from '../lib/utils';

interface BudgetProgressProps {
  summary: BudgetSummary;
}

export const BudgetProgress: React.FC<BudgetProgressProps> = ({ summary }) => {
  const { category, spent, limit, pct } = summary;
  const isOverBudget = pct >= 100;
  const isWarning = pct >= 80 && pct < 100;

  const clampedPct = Math.min(pct, 100);

  return (
    <div className="flex flex-col gap-2 p-4 rounded-xl bg-slate-800 border border-slate-700">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: category.color || '#6366f1' }}
          />
          <span className="text-sm font-medium text-slate-200">{category.name}</span>
          {isOverBudget && (
            <span className="text-xs text-red-400 font-medium">חריגה!</span>
          )}
        </div>
        <span className={cn('text-sm font-semibold', isOverBudget ? 'text-red-400' : isWarning ? 'text-amber-400' : 'text-slate-300')}>
          {Math.round(pct)}%
        </span>
      </div>

      <div className="w-full h-2 rounded-full bg-slate-700 overflow-hidden">
        <div
          className={cn(
            'h-full rounded-full transition-all duration-500',
            isOverBudget ? 'bg-red-500' : isWarning ? 'bg-amber-500' : 'bg-indigo-500'
          )}
          style={{ width: `${clampedPct}%` }}
        />
      </div>

      <div className="flex justify-between text-xs text-slate-400">
        <span>{formatCurrency(spent)} הוצאו</span>
        {limit > 0 && <span>תקציב: {formatCurrency(limit)}</span>}
      </div>
    </div>
  );
};
