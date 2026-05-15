import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { getAlertEvents, markAlertRead, markAllAlertsRead } from '../lib/api';

export function useAlerts() {
  return useQuery({
    queryKey: ['alerts'],
    queryFn: getAlertEvents,
    refetchInterval: 60 * 1000,
  });
}

export function useMarkAlertRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: markAlertRead,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['alerts'] }),
    onError: (e: Error) => toast.error(`שגיאה: ${e.message}`),
  });
}

export function useMarkAllAlertsRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: markAllAlertsRead,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['alerts'] }),
    onError: (e: Error) => toast.error(`שגיאה: ${e.message}`),
  });
}
