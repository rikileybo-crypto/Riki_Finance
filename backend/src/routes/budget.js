import { Router } from 'express';
import asyncHandler from 'express-async-handler';
import { getSupabase } from '../services/supabase.js';

const router = Router();

// GET /categories
router.get('/categories', asyncHandler(async (req, res) => {
  const { data, error } = await supabase
    .from('personal_budget_categories')
    .select('*')
    .eq('user_id', req.user.id)
    .order('name');

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
}));

// POST /categories
router.post('/categories', asyncHandler(async (req, res) => {
  const { name, color, icon, monthly_limit, keywords } = req.body;
  if (!name) return res.status(400).json({ error: 'name is required' });

  const { data, error } = await supabase
    .from('personal_budget_categories')
    .insert({
      user_id: req.user.id,
      name,
      color: color || '#6366f1',
      icon: icon || 'tag',
      monthly_limit: monthly_limit || null,
      keywords: keywords || [],
    })
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(data);
}));

// PUT /categories/:id
router.put('/categories/:id', asyncHandler(async (req, res) => {
  const { name, color, icon, monthly_limit, keywords } = req.body;
  const updates = {};
  if (name !== undefined) updates.name = name;
  if (color !== undefined) updates.color = color;
  if (icon !== undefined) updates.icon = icon;
  if (monthly_limit !== undefined) updates.monthly_limit = monthly_limit;
  if (keywords !== undefined) updates.keywords = keywords;

  const { data, error } = await supabase
    .from('personal_budget_categories')
    .update(updates)
    .eq('id', req.params.id)
    .eq('user_id', req.user.id)
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
}));

// DELETE /categories/:id
router.delete('/categories/:id', asyncHandler(async (req, res) => {
  const { error } = await supabase
    .from('personal_budget_categories')
    .delete()
    .eq('id', req.params.id)
    .eq('user_id', req.user.id);

  if (error) return res.status(500).json({ error: error.message });
  res.json({ ok: true });
}));

// GET /summary?month=&year=
router.get('/summary', asyncHandler(async (req, res) => {
  const now = new Date();
  const month = parseInt(req.query.month) || now.getMonth() + 1;
  const year = parseInt(req.query.year) || now.getFullYear();

  const monthStr = String(month).padStart(2, '0');
  const dateFrom = `${year}-${monthStr}-01`;
  const lastDay = new Date(year, month, 0).getDate();
  const dateTo = `${year}-${monthStr}-${lastDay}`;

  const { data: categories, error: catError } = await supabase
    .from('personal_budget_categories')
    .select('*')
    .eq('user_id', req.user.id);

  if (catError) return res.status(500).json({ error: catError.message });

  const { data: transactions, error: txError } = await supabase
    .from('personal_transactions')
    .select('amount, category')
    .eq('user_id', req.user.id)
    .eq('type', 'expense')
    .gte('date', dateFrom)
    .lte('date', dateTo);

  if (txError) return res.status(500).json({ error: txError.message });

  const spentByCategory = {};
  for (const tx of (transactions || [])) {
    const cat = tx.category || 'אחר';
    spentByCategory[cat] = (spentByCategory[cat] || 0) + Math.abs(parseFloat(tx.amount));
  }

  const summary = (categories || []).map(cat => ({
    category: cat,
    spent: spentByCategory[cat.name] || 0,
    limit: cat.monthly_limit || 0,
    pct: cat.monthly_limit
      ? ((spentByCategory[cat.name] || 0) / cat.monthly_limit) * 100
      : 0,
  }));

  res.json({ summary, month, year });
}));

export default router;
