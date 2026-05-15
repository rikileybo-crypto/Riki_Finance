export type AccountType = 'leumi' | 'max';

export interface Account {
  id: string;
  name: string;
  type: AccountType;
  account_number?: string;
  color: string;
  last_sync_at?: string;
  last_sync_status?: 'success' | 'error' | 'syncing';
  is_active: boolean;
}

export interface Transaction {
  id: string;
  account_id: string;
  date: string;
  description: string;
  amount: number;
  category?: string;
  balance?: number;
  type: 'income' | 'expense';
  notes?: string;
  personal_accounts?: {
    name: string;
    type: AccountType;
    color: string;
  };
}

export interface BudgetCategory {
  id: string;
  name: string;
  color: string;
  icon: string;
  monthly_limit?: number;
  keywords?: string[];
}

export interface AlertEvent {
  id: string;
  type: string;
  message: string;
  amount?: number;
  category?: string;
  is_read: boolean;
  triggered_at: string;
}

export interface BudgetSummary {
  category: BudgetCategory;
  spent: number;
  limit: number;
  pct: number;
}

export interface TransactionsResponse {
  data: Transaction[];
  total: number;
  page: number;
  limit: number;
}
