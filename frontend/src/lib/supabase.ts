import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  'https://luprxzpmhvsrggnibijup.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx1cHJ4enBtaHZzcmdnbmlianVwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg4MjQ5MDksImV4cCI6MjA5NDQwMDkwOX0.9vbpmGnEhOAiCOZMXDr6xGpNpbGM4brkHUysOWaYtIo'
);
