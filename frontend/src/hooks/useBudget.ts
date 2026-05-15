import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { getBudgetCategories, saveBudgetCategory, deleteBudgetCategory, getBudgetSummary } from '../lib/api';
import type { BudgetCategory } from '../types';

export function useBudgetCategories() {
  return useQuery({
    queryKey: ['budget-categories'],
    queryFn: getBudgetCategories,
  });
}

export function useBudgetSummary(month: number, year: number) {
  return useQuery({
    queryKey: ['budget-summary', month, year],
    queryFn: () => getBudgetSummary(month, year),
  });
}

export function useSaveBudgetCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<BudgetCategory> & { id?: string }) => saveBudgetCategory(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['budget-categories'] });
      qc.invalidateQueries({ queryKey: ['budget-summary'] });
      toast.success('הקטגוריה נשמרה');
    },
    onError: (e: Error) => toast.error(`שגיאה: ${e.message}`),
  });
}

export function useDeleteBudgetCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteBudgetCategory,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['budget-categories'] });
      qc.invalidateQueries({ queryKey: ['budget-summary'] });
      toast.success('הקטגוריה נמחקה');
    },
    onError: (e: Error) => toast.error(`שגיאה: ${e.message}`),
  });
}
