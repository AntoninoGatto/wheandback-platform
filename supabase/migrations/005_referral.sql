-- Referral system (multi-level, unlimited invites)

CREATE TABLE public.referral_rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  referred_user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  level INTEGER NOT NULL DEFAULT 1,
  reward_amount DECIMAL(10, 2) NOT NULL,
  credited_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT level_positive CHECK (level >= 1),
  CONSTRAINT reward_positive CHECK (reward_amount > 0),
  UNIQUE (referrer_id, order_id, level)
);

-- Future: Whe&Back Coin token balances
-- Placeholder table for tokenization phase
CREATE TABLE public.wheback_coin_balances (
  user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  balance DECIMAL(18, 8) NOT NULL DEFAULT 0,
  total_earned DECIMAL(18, 8) NOT NULL DEFAULT 0,
  last_updated TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT balance_non_negative CHECK (balance >= 0)
);

ALTER TABLE public.referral_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wheback_coin_balances ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own referral rewards"
  ON public.referral_rewards FOR SELECT
  USING (referrer_id = auth.uid());

CREATE POLICY "Users can view own coin balance"
  ON public.wheback_coin_balances FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Admins can manage all referral data"
  ON public.referral_rewards FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
