import { toast } from 'sonner';
import { supabase } from './supabase';
import type { Account, Transaction, BudgetCategory, AlertEvent, BudgetSummary, TransactionsResponse } from '../types';

const getBaseUrl = () => {
  const url = import.meta.env.VITE_BACKEND_URL;
  if (!url) {
    toast.error('VITE_BACKEND_URL is not set. Please configure the environment variable.');
  }
  return url || '';
};

async function getAuthHeaders(): Promise<HeadersInit> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${getBaseUrl()}${path}`, {
    ...options,
    headers: { ...headers, ...options.headers },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return res.json();
}

// Accounts
export const getAccounts = () => apiFetch<Account[]>('/api/accounts');

export const addAccount = (data: {
  name: string;
  type: string;
  account_number?: string;
  color?: string;
  credentials: Record<string, string>;
}) => apiFetch<Account>('/api/accounts', { method: 'POST', body: JSON.stringify(data) });

export const deleteAccount = (id: string) =>
  apiFetch<{ ok: boolean }>(`/api/accounts/${id}`, { method: 'DELETE' });

// Sync
export const syncAll = () =>
  apiFetch<{ synced: number; accounts: any[] }>('/api/sync', { method: 'POST', body: JSON.stringify({}) });

export const syncAccount = (id: string) =>
  apiFetch<{ synced: number; accounts: any[] }>('/api/sync', {
    method: 'POST',
    body: JSON.stringify({ accountId: id }),
  });

export const getSyncStatus = () =>
  apiFetch<{ id: string; name: string; last_sync_at: string; last_sync_status: string }[]>('/api/sync/status');

// Transactions
export interface TransactionFilters {
  accountId?: string;
  dateFrom?: string;
  dateTo?: string;
  category?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export const getTransactions = (filters: TransactionFilters = {}) => {
  const params = new URLSearchParams();
  if (filters.accountId) params.set('accountId', filters.accountId);
  if (filters.dateFrom) params.set('dateFrom', filters.dateFrom);
  if (filters.dateTo) params.set('dateTo', filters.dateTo);
  if (filters.category) params.set('category', filters.category);
  if (filters.search) params.set('search', filters.search);
  if (filters.page) params.set('page', String(filters.page));
  if (filters.limit) params.set('limit', String(filters.limit));
  return apiFetch<TransactionsResponse>(`/api/transactions?${params.toString()}`);
};

export const updateTransaction = (id: string, data: { category?: string; notes?: string }) =>
  apiFetch<Transaction>(`/api/transactions/${id}`, { method: 'PATCH', body: JSON.stringify(data) });

// Budget
export const getBudgetCategories = () => apiFetch<BudgetCategory[]>('/api/budget/categories');

export const saveBudgetCategory = (data: Partial<BudgetCategory> & { id?: string }) => {
  if (data.id) {
    return apiFetch<BudgetCategory>(`/api/budget/categories/${data.id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }
  return apiFetch<BudgetCategory>('/api/budget/categories', {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

export const deleteBudgetCategory = (id: string) =>
  apiFetch<{ ok: boolean }>(`/api/budget/categories/${id}`, { method: 'DELETE' });

export const getBudgetSummary = (month: number, year: number) =>
  apiFetch<{ summary: BudgetSummary[]; month: number; year: number }>(
    `/api/budget/summary?month=${month}&year=${year}`
  );

// Alerts
export const getAlertEvents = () => apiFetch<AlertEvent[]>('/api/alerts/events');

export const markAlertRead = (id: string) =>
  apiFetch<{ ok: boolean }>(`/api/alerts/events/${id}/read`, { method: 'PATCH' });

export const markAllAlertsRead = () =>
  apiFetch<{ ok: boolean }>('/api/alerts/events/read-all', { method: 'PATCH' });
