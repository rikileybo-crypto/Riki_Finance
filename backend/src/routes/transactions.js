import { Router } from 'express';
import asyncHandler from 'express-async-handler';
import { getSupabase } from '../services/getSupabase().js';

const router = Router();

// GET / — paginated transactions with filters
router.get('/', asyncHandler(async (req, res) => {
  const {
    accountId,
    dateFrom,
    dateTo,
    category,
    search,
    page = 1,
    limit = 50,
  } = req.query;

  const offset = (parseInt(page) - 1) * parseInt(limit);

  let query = supabase
    .from('personal_transactions')
    .select('*, personal_accounts(name, type, color)', { count: 'exact' })
    .eq('user_id', req.user.id)
    .order('date', { ascending: false })
    .range(offset, offset + parseInt(limit) - 1);

  if (accountId) query = query.eq('account_id', accountId);
  if (dateFrom) query = query.gte('date', dateFrom);
  if (dateTo) query = query.lte('date', dateTo);
  if (category) query = query.eq('category', category);
  if (search) query = query.ilike('description', `%${search}%`);

  const { data, error, count } = await query;
  if (error) return res.status(500).json({ error: error.message });

  res.json({ data, total: count, page: parseInt(page), limit: parseInt(limit) });
}));

// PATCH /:id — update category or notes
router.patch('/:id', asyncHandler(async (req, res) => {
  const { category, notes } = req.body;
  const updates = {};
  if (category !== undefined) updates.category = category;
  if (notes !== undefined) updates.notes = notes;

  const { data, error } = await supabase
    .from('personal_transactions')
    .update(updates)
    .eq('id', req.params.id)
    .eq('user_id', req.user.id)
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
}));

export default router;

