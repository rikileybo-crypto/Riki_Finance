import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { getAccounts, addAccount, deleteAccount } from '../lib/api';

export function useAccounts() {
  return useQuery({
    queryKey: ['accounts'],
    queryFn: getAccounts,
    refetchInterval: 5 * 60 * 1000,
  });
}

export function useAddAccount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: addAccount,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['accounts'] });
      toast.success('החשבון נוסף בהצלחה');
    },
    onError: (e: Error) => toast.error(`שגיאה: ${e.message}`),
  });
}

export function useDeleteAccount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteAccount,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['accounts'] });
      toast.success('החשבון נמחק');
    },
    onError: (e: Error) => toast.error(`שגיאה: ${e.message}`),
  });
}
