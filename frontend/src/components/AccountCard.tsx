import React, { useState } from 'react';
import { RefreshCw, Trash2, Building2, CreditCard } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from './ui/Card';
import { Badge } from './ui/Badge';
import { Button } from './ui/Button';
import type { Account } from '../types';
import { formatCurrency, getRelativeTime } from '../lib/utils';
import { useDeleteAccount } from '../hooks/useAccounts';
import { useSyncAccount } from '../hooks/useSync';

interface AccountCardProps {
  account: Account;
  balance?: number;
}

export const AccountCard: React.FC<AccountCardProps> = ({ account, balance }) => {
  const deleteAccount = useDeleteAccount();
  const syncAccount = useSyncAccount();
  const [confirmDelete, setConfirmDelete] = useState(false);

  const isLeumi = account.type === 'leumi';
  const isSyncing = account.last_sync_status === 'syncing' || syncAccount.isPending;

  const statusDot = () => {
    if (isSyncing) return <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" title="מסנכרן..." />;
    if (account.last_sync_status === 'success') return <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" title="סנכרון הצליח" />;
    if (account.last_sync_status === 'error') return <span className="w-2.5 h-2.5 rounded-full bg-red-400" title="שגיאת סנכרון" />;
    return <span className="w-2.5 h-2.5 rounded-full bg-slate-600" title="לא סונכרן" />;
  };

  return (
    <Card className="hover:border-slate-600 transition-colors" style={{ borderTopColor: account.color, borderTopWidth: 3 }}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {statusDot()}
            <CardTitle className="text-base">{account.name}</CardTitle>
          </div>
          <Badge variant={isLeumi ? 'default' : 'warning' as any} className={isLeumi ? 'bg-blue-600/20 text-blue-300 border-blue-600/30' : 'bg-amber-600/20 text-amber-300 border-amber-600/30'}>
            {isLeumi ? <><Building2 size={12} className="ml-1" />לאומי</> : <><CreditCard size={12} className="ml-1" />MAX</>}
          </Badge>
        </div>

        {balance !== undefined && (
          <div className="mt-2">
            <p className="text-xs text-slate-400">יתרה</p>
            <p className={`text-2xl font-bold ${balance >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {formatCurrency(balance)}
            </p>
          </div>
        )}
      </CardHeader>

      <CardContent>
        <p className="text-xs text-slate-400">
          {account.last_sync_at
            ? `סונכרן ${getRelativeTime(account.last_sync_at)}`
            : 'טרם סונכרן'}
        </p>
        {account.last_sync_status === 'error' && (
          <p className="text-xs text-red-400 mt-1">⚠️ שגיאה בסנכרון האחרון</p>
        )}
      </CardContent>

      <CardFooter className="gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={() => syncAccount.mutate(account.id)}
          loading={isSyncing}
          className="flex-1"
        >
          <RefreshCw size={14} />
          סנכרן
        </Button>

        {confirmDelete ? (
          <div className="flex gap-1">
            <Button
              size="sm"
              variant="destructive"
              onClick={() => deleteAccount.mutate(account.id)}
              loading={deleteAccount.isPending}
            >
              אשר מחיקה
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setConfirmDelete(false)}>
              ביטול
            </Button>
          </div>
        ) : (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setConfirmDelete(true)}
            className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
          >
            <Trash2 size={14} />
            מחק
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};
