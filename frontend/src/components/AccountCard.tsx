import React, { useState } from 'react';
import { RefreshCw, Trash2, Building2, CreditCard } from 'lucide-react';
import { Button } from './ui/Button';
import type { Account } from '../types';
import { formatCurrency, getRelativeTime } from '../lib/utils';
import { useDeleteAccount } from '../hooks/useAccounts';
import { useSyncAccount } from '../hooks/useSync';

interface AccountCardProps { account: Account; balance?: number; }

export const AccountCard: React.FC<AccountCardProps> = ({ account, balance }) => {
  const deleteAccount = useDeleteAccount();
  const syncAccount = useSyncAccount();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const isLeumi = account.type === 'leumi';
  const isSyncing = account.last_sync_status === 'syncing' || syncAccount.isPending;
  const statusColor = isSyncing ? 'bg-yellow-400 animate-pulse'
    : account.last_sync_status === 'success' ? 'bg-green-500'
    : account.last_sync_status === 'error' ? 'bg-red-500' : 'bg-gray-300';

  return (
    <div className="bg-white rounded-2xl shadow-card overflow-hidden hover:shadow-card-hover transition-shadow"
      style={{ borderTop: `3px solid ${account.color || '#003EA5'}` }}>
      <div className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${statusColor}`} />
            <h3 className="font-semibold text-gray-800 text-base">{account.name}</h3>
          </div>
          <span className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1 rounded-full ${isLeumi ? 'bg-blue-50 text-blue-700' : 'bg-amber-50 text-amber-700'}`}>
            {isLeumi ? <><Building2 size={11}/>לאומי</> : <><CreditCard size={11}/>MAX</>}
          </span>
        </div>
        {balance !== undefined && (
          <div className="mb-4">
            <p className="text-xs text-gray-400 mb-0.5">יתרה</p>
            <p className={`text-2xl font-bold ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>{formatCurrency(balance)}</p>
          </div>
        )}
        <p className="text-xs text-gray-400">{account.last_sync_at ? `סונכרן ${getRelativeTime(account.last_sync_at)}` : 'טרם סונכרן'}</p>
        {account.last_sync_status === 'error' && <p className="text-xs text-red-500 mt-1">שגיאה בסנכרון האחרון</p>}
      </div>
      <div className="px-5 pb-5 flex gap-2">
        <Button size="sm" variant="outline" onClick={() => syncAccount.mutate(account.id)} loading={isSyncing} className="flex-1 border-gray-200 text-gray-600 hover:bg-gray-50">
          <RefreshCw size={14}/>סנכרן
        </Button>
        {confirmDelete ? (
          <div className="flex gap-1">
            <button onClick={() => deleteAccount.mutate(account.id)} className="px-3 py-1.5 text-xs bg-red-600 text-white rounded-lg font-medium">אשר מחיקה</button>
            <button onClick={() => setConfirmDelete(false)} className="px-3 py-1.5 text-xs text-gray-500 rounded-lg hover:bg-gray-100">ביטול</button>
          </div>
        ) : (
          <button onClick={() => setConfirmDelete(true)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
            <Trash2 size={15}/>
          </button>
        )}
      </div>
    </div>
  );
};
