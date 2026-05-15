CREATE TABLE IF NOT EXISTS personal_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('leumi', 'max')),
  account_number TEXT,
  color TEXT DEFAULT '#6366f1',
  credentials_encrypted TEXT,
  last_sync_at TIMESTAMPTZ,
  last_sync_status TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS personal_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID REFERENCES personal_accounts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  description TEXT NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  category TEXT,
  reference TEXT,
  balance DECIMAL(12,2),
  type TEXT DEFAULT 'expense' CHECK (type IN ('income', 'expense')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS personal_budget_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT DEFAULT '#6366f1',
  icon TEXT DEFAULT 'tag',
  monthly_limit DECIMAL(12,2),
  keywords TEXT[],
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS personal_alert_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  message TEXT NOT NULL,
  amount DECIMAL(12,2),
  category TEXT,
  is_read BOOLEAN DEFAULT false,
  triggered_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE personal_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE personal_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE personal_budget_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE personal_alert_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own accounts" ON personal_accounts FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "own transactions" ON personal_transactions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "own categories" ON personal_budget_categories FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "own alerts" ON personal_alert_events FOR ALL USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_pt_user_date ON personal_transactions(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_pt_account ON personal_transactions(account_id);
CREATE INDEX IF NOT EXISTS idx_pt_category ON personal_transactions(category);
