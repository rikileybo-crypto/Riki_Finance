import { Router } from 'express';
import asyncHandler from 'express-async-handler';
import { getSupabase } from '../services/supabase.js';
import { encrypt } from '../services/encryption.js';
const router = Router();
// GET / — list accounts (without credentials)
router.get('/', asyncHandler(async (req, res) => {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('personal_accounts')
    .select('id, name, type, account_number, color, last_sync_at, last_sync_status, is_active, created_at')
    .eq('user_id', req.user.id)
    .order('created_at', { ascending: true });

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
}));

// POST / — add account
router.post('/', asyncHandler(async (req, res) => {
  const supabase = getSupabase();
  const { name, type, account_number, color, credentials } = req.body;

  if (!name || !type || !credentials) {
    return res.status(400).json({ error: 'name, type, and credentials are required' });
  }

  const credentialsJson = JSON.stringify(credentials);
  const credentials_encrypted = encrypt(credentialsJson);

  const { data, error } = await supabase
    .from('personal_accounts')
    .insert({
      user_id: req.user.id,
      name,
      type,
      account_number: account_number || null,
      color: color || '#6366f1',
      credentials_encrypted,
      is_active: true,
    })
    .select('id, name, type, account_number, color, last_sync_at, last_sync_status, is_active, created_at')
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(data);
}));

// DELETE /:id — delete account
router.delete('/:id', asyncHandler(async (req, res) => {
  const supabase = getSupabase();
  const { error } = await supabase
    .from('personal_accounts')
    .delete()
    .eq('id', req.params.id)
    .eq('user_id', req.user.id);

  if (error) return res.status(500).json({ error: error.message });
  res.json({ ok: true });
}));

export default router;

