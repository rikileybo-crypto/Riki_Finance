import { getSupabase } from './supabase.js';

const LARGE_TRANSACTION_THRESHOLD = 1000;

export async function checkAlerts(userId, transactions, budgetCategories) {
  const supabase = getSupabase();
  const alerts = [];

  for (const tx of transactions) {
    if (tx.type === 'expense' && Math.abs(tx.amount) >= LARGE_TRANSACTION_THRESHOLD) {
      alerts.push({
        user_id: userId,
        type: 'large_transaction',
        message: `עסקה גדולה זוהתה: ${tx.description} בסכום ${new Intl.NumberFormat('he-IL', { style: 'currency', currency: 'ILS' }).format(Math.abs(tx.amount))}`,
        amount: Math.abs(tx.amount),
        category: tx.category || null,
      });
    }
  }

  if (budgetCategories && budgetCategories.length > 0) {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];

    for (const cat of budgetCategories) {
      if (!cat.monthly_limit) continue;

      const { data: txData } = await supabase
        .from('personal_transactions')
        .select('amount')
        .eq('user_id', userId)
        .eq('category', cat.name)
        .eq('type', 'expense')
        .gte('date', monthStart)
        .lte('date', monthEnd);

      if (!txData) continue;

      const totalSpent = txData.reduce((sum, t) => sum + Math.abs(parseFloat(t.amount)), 0);
      const pct = (totalSpent / cat.monthly_limit) * 100;
      const fmt = new Intl.NumberFormat('he-IL', { style: 'currency', currency: 'ILS' });

      if (pct >= 100) {
        alerts.push({
          user_id: userId,
          type: 'budget_exceeded',
          message: `חרגת מהתקציב בקטגוריה "${cat.name}": הוצאת ${fmt.format(totalSpent)} מתוך ${fmt.format(cat.monthly_limit)}`,
          amount: totalSpent,
          category: cat.name,
        });
      } else if (pct >= 80) {
        alerts.push({
          user_id: userId,
          type: 'budget_warning',
          message: `אזהרת תקציב בקטגוריה "${cat.name}": הוצאת ${pct.toFixed(0)}% מהתקציב (${fmt.format(totalSpent)} מתוך ${fmt.format(cat.monthly_limit)})`,
          amount: totalSpent,
          category: cat.name,
        });
      }
    }
  }

  if (alerts.length > 0) {
    await supabase.from('personal_alert_events').insert(alerts);
  }

  return alerts;
}
