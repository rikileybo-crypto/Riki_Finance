import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { syncAll, syncAccount } from '../lib/api';

export function useSyncAll() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: syncAll,
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['accounts'] });
      qc.invalidateQueries({ queryKey: ['transactions'] });
      qc.invalidateQueries({ queryKey: ['budget-summary'] });
      qc.invalidateQueries({ queryKey: ['alerts'] });
      toast.success(`סנכרון הושלם — ${data.synced} עסקאות חדשות`);
    },
    onError: (e: Error) => toast.error(`שגיאת סנכרון: ${e.message}`),
  });
}

export function useSyncAccount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: syncAccount,
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['accounts'] });
      qc.invalidateQueries({ queryKey: ['transactions'] });
      qc.invalidateQueries({ queryKey: ['alerts'] });
      toast.success(`סנכרון הושלם — ${data.synced} עסקאות חדשות`);
    },
    onError: (e: Error) => toast.error(`שגיאת סנכרון: ${e.message}`),
  });
}
