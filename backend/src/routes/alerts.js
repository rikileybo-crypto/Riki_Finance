import { Router } from 'express';
import asyncHandler from 'express-async-handler';
import { getSupabase } from '../services/supabase.js';

const router = Router()
// GET /events
router.get('/events', asyncHandler(async (req, res) => {
  const { data, error } = await supabase
    .from('personal_alert_events')
    .select('*')
    .eq('user_id', req.user.id)
    .order('triggered_at', { ascending: false })
    .limit(50);

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
}));

// PATCH /events/:id/read
router.patch('/events/:id/read', asyncHandler(async (req, res) => {
  const { error } = await supabase
    .from('personal_alert_events')
    .update({ is_read: true })
    .eq('id', req.params.id)
    .eq('user_id', req.user.id);

  if (error) return res.status(500).json({ error: error.message });
  res.json({ ok: true });
}));

// PATCH /events/read-all
router.patch('/events/read-all', asyncHandler(async (req, res) => {
  const { error } = await supabase
    .from('personal_alert_events')
    .update({ is_read: true })
    .eq('user_id', req.user.id)
    .eq('is_read', false);

  if (error) return res.status(500).json({ error: error.message });
  res.json({ ok: true });
}));

export default router;

