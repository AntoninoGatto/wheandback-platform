-- Marketing plans table
-- Allows admin to update cashback/referral percentages in real time
CREATE TABLE IF NOT EXISTS public.marketing_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cashback_min NUMERIC(5,2) NOT NULL DEFAULT 5,
  cashback_max NUMERIC(5,2) NOT NULL DEFAULT 35,
  referral_level1 NUMERIC(5,2) NOT NULL DEFAULT 5,
  referral_level2 NUMERIC(5,2) NOT NULL DEFAULT 2,
  referral_level3 NUMERIC(5,2) NOT NULL DEFAULT 1,
  notes TEXT,
  is_active BOOLEAN NOT NULL DEFAULT false,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Only one plan can be active at a time
CREATE UNIQUE INDEX IF NOT EXISTS marketing_plans_active_unique
  ON public.marketing_plans (is_active)
  WHERE is_active = true;

-- Insert default active plan
INSERT INTO public.marketing_plans (cashback_min, cashback_max, referral_level1, referral_level2, referral_level3, is_active, notes)
VALUES (5, 35, 5, 2, 1, true, 'Piano iniziale di lancio — Fase 1')
ON CONFLICT DO NOTHING;

-- RLS
ALTER TABLE public.marketing_plans ENABLE ROW LEVEL SECURITY;

-- Anyone can read the active plan (public page)
CREATE POLICY "marketing_plans_public_read" ON public.marketing_plans
  FOR SELECT USING (true);

-- Only admin can insert/update
CREATE POLICY "marketing_plans_admin_write" ON public.marketing_plans
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );
