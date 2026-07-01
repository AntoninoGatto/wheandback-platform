-- Cashback transactions
-- IMPORTANT: cashback is INTERNAL CREDIT ONLY, never withdrawable as cash.
-- Funds always remain in Buy All Free LTD bank account.

CREATE TYPE cashback_status AS ENUM ('pending', 'credited', 'used', 'expired', 'cancelled');
CREATE TYPE cashback_source AS ENUM ('purchase', 'referral', 'bonus');

CREATE TABLE public.cashback_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
  source cashback_source NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  status cashback_status NOT NULL DEFAULT 'pending',
  -- This column is always FALSE. Cashback is never withdrawable.
  is_withdrawable BOOLEAN NOT NULL DEFAULT FALSE,
  credited_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT amount_positive CHECK (amount > 0),
  CONSTRAINT never_withdrawable CHECK (is_withdrawable = FALSE)
);

-- Credit cashback after withdrawal period expires
CREATE OR REPLACE FUNCTION credit_cashback_on_withdrawal_expiry()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.withdrawal_expires_at IS NOT NULL
     AND NEW.withdrawal_expires_at <= NOW()
     AND OLD.cashback_credited_at IS NULL
  THEN
    UPDATE public.cashback_transactions
    SET status = 'credited', credited_at = NOW()
    WHERE order_id = NEW.id AND status = 'pending';

    UPDATE public.profiles
    SET
      cashback_balance = cashback_balance + (
        SELECT COALESCE(SUM(amount), 0)
        FROM public.cashback_transactions
        WHERE order_id = NEW.id AND status = 'credited'
      ),
      cashback_pending = cashback_pending - (
        SELECT COALESCE(SUM(amount), 0)
        FROM public.cashback_transactions
        WHERE order_id = NEW.id AND status = 'credited'
      )
    WHERE id = NEW.user_id;

    NEW.cashback_credited_at := NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER cashback_credit_trigger
  BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION credit_cashback_on_withdrawal_expiry();

-- Anti-fraud: flag suspicious cashback patterns
CREATE OR REPLACE FUNCTION flag_suspicious_cashback()
RETURNS TRIGGER AS $$
DECLARE
  recent_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO recent_count
  FROM public.cashback_transactions
  WHERE user_id = NEW.user_id
    AND created_at > NOW() - INTERVAL '24 hours'
    AND status = 'pending';

  IF recent_count > 20 THEN
    RAISE WARNING 'ANTI-FRAUD: User % has % pending cashback transactions in 24h',
      NEW.user_id, recent_count;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER cashback_fraud_check
  AFTER INSERT ON public.cashback_transactions
  FOR EACH ROW EXECUTE FUNCTION flag_suspicious_cashback();

ALTER TABLE public.cashback_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own cashback"
  ON public.cashback_transactions FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Admins can view all cashback"
  ON public.cashback_transactions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
