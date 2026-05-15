import React, { useState } from 'react';
import { Plus, RefreshCw, Building2 } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { AccountCard } from '../components/AccountCard';
import { AddAccountDialog } from '../components/AddAccountDialog';
import { Skeleton } from '../components/ui/Skeleton';
import { useAccounts } from '../hooks/useAccounts';
import { useSyncAll } from '../hooks/useSync';
import { useTransactions } from '../hooks/useTransactions';

export default function AccountsPage() {
  const [addOpen, setAddOpen] = useState(false);
  const { data: accounts = [], isLoading } = useAccounts();
  const syncAll = useSyncAll();
  const { data: txData } = useTransactions({ limit: 1000 });

  const getBalance = (accountId: string) => {
    const txns = txData?.data?.filter((t) => t.account_id === accountId) || [];
    if (!txns.length) return undefined;
    const withBalance = txns.find((t) => t.balance != null);
    return withBalance?.balance;
  };

  return (
    <div className="max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-100">חשבונות בנק</h1>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => syncAll.mutate()}
            loading={syncAll.isPending}
          >
            <RefreshCw size={16} />
            סנכרן הכל
          </Button>
          <Button onClick={() => setAddOpen(true)}>
            <Plus size={16} />
            הוסף חשבון
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-48" />)}
        </div>
      ) : accounts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="text-6xl mb-4">🏦</div>
          <h3 className="text-xl font-semibold text-slate-200 mb-2">אין חשבונות מחוברים</h3>
          <p className="text-slate-400 mb-6 max-w-sm">
            חבר את חשבון הבנק שלך כדי לעקוב אחרי הוצאות ויתרות בזמן אמת
          </p>
          <Button onClick={() => setAddOpen(true)} size="lg">
            <Plus size={18} />
            הוסף חשבון ראשון
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {accounts.map((account) => (
            <AccountCard
              key={account.id}
              account={account}
              balance={getBalance(account.id)}
            />
          ))}
        </div>
      )}

      <AddAccountDialog open={addOpen} onOpenChange={setAddOpen} />
    </div>
  );
}
