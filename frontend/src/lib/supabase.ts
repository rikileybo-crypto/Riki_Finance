import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://luprxzpmhvsrggnibijup.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx1cHJ4enBtaHZzcmdnbmlianVwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg4MjQ5MDksImV4cCI6MjA5NDQwMDkwOX0.9vbpmGnEhOAiCOZMXDr6xGpNpbGM4brkHUysOWaYtIo';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
