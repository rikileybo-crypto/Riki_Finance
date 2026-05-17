import { Router } from 'express';
import asyncHandler from 'express-async-handler';
import { getSupabase } from '../services/supabase.js';
import { decrypt } from '../services/encryption.js';
import { scrapeAccount } from '../services/scraper.js';
import { checkAlerts } from '../services/alertChecker.js';

const router = Router();

async function syncSingleAccount(account, userId) {
  // Mark as syncing
  await supabase
    .from('personal_accounts')
    .update({ last_sync_status: 'syncing' })
    .eq('id', account.id);

  try {
    const credentialsJson = decrypt(account.credentials_encrypted);
    const credentials = JSON.parse(credentialsJson);

    const scrapedAccounts = await scrapeAccount(account.type, credentials);
    const newTransactions = [];

    for (const scraped of scrapedAccounts) {
      for (const tx of (scraped.txns || [])) {
        const amount = parseFloat(tx.chargedAmount || tx.originalAmount || 0);
        const txType = amount >= 0 ? 'income' : 'expense';

        const txDate = tx.date
          ? new Date(tx.date).toISOString().split('T')[0]
          : new Date().toISOString().split('T')[0];

        newTransactions.push({
          account_id: account.id,
          user_id: userId,
          date: txDate,
          description: tx.description || tx.memo || '',
          amount: amount,
          category: tx.category || null,
          reference: tx.identifier ? String(tx.identifier) : null,
          balance: tx.balance != null ? parseFloat(tx.balance) : null,
          type: txType,
        });
      }
    }

    // Upsert transactions (deduplicate by date+description+amount+account_id)
    let syncedCount = 0;
    for (const tx of newTransactions) {
      const { data: existing } = await supabase
        .from('personal_transactions')
        .select('id')
        .eq('account_id', tx.account_id)
        .eq('date', tx.date)
        .eq('description', tx.description)
        .eq('amount', tx.amount)
        .limit(1);

      if (!existing || existing.length === 0) {
        await getSupabase().from('personal_transactions').insert(tx);
        syncedCount++;
      }
    }

    // Update last sync status
    await supabase
      .from('personal_accounts')
      .update({ last_sync_at: new Date().toISOString(), last_sync_status: 'success' })
      .eq('id', account.id);

    // Fetch budget categories for alert checking
    const { data: budgetCategories } = await supabase
      .from('personal_budget_categories')
      .select('*')
      .eq('user_id', userId);

    // Run alert checker on newly inserted transactions
    await checkAlerts(userId, newTransactions, budgetCategories || []);

    return { accountId: account.id, synced: syncedCount, error: null };
  } catch (err) {
    await supabase
      .from('personal_accounts')
      .update({ last_sync_at: new Date().toISOString(), last_sync_status: 'error' })
      .eq('id', account.id);

    return { accountId: account.id, synced: 0, error: err.message };
  }
}

// POST / — sync accounts
router.post('/', asyncHandler(async (req, res) => {
  const { accountId } = req.body;

  let query = supabase
    .from('personal_accounts')
    .select('id, name, type, credentials_encrypted, is_active')
    .eq('user_id', req.user.id)
    .eq('is_active', true);

  if (accountId) {
    query = query.eq('id', accountId);
  }

  const { data: accounts, error } = await query;
  if (error) return res.status(500).json({ error: error.message });
  if (!accounts || accounts.length === 0) {
    return res.json({ synced: 0, accounts: [] });
  }

  const results = await Promise.all(
    accounts.map(acc => syncSingleAccount(acc, req.user.id))
  );

  const totalSynced = results.reduce((sum, r) => sum + r.synced, 0);
  res.json({ synced: totalSynced, accounts: results });
}));

// GET /status — last sync status per account
router.get('/status', asyncHandler(async (req, res) => {
  const { data, error } = await supabase
    .from('personal_accounts')
    .select('id, name, last_sync_at, last_sync_status')
    .eq('user_id', req.user.id);

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
}));

export default router;

