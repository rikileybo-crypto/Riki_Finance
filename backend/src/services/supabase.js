import { createClient } from '@supabase/supabase-js';
import ws from 'ws';

let _client = null;

export function getSupabase() {
  if (!_client) {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
        _client = createClient(url, key, { global: { WebSocket: ws } });
  }
  return _client;
}
