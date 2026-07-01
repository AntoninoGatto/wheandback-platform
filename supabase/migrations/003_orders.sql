-- Orders
CREATE TYPE order_status AS ENUM (
  'pending', 'payment_confirmed', 'processing',
  'shipped', 'delivered', 'cancelled', 'refunded'
);

CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  status order_status NOT NULL DEFAULT 'pending',
  total_amount DECIMAL(10, 2) NOT NULL,
  cashback_total DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  referral_code_used TEXT,
  delivered_at TIMESTAMPTZ,
  withdrawal_expires_at TIMESTAMPTZ,
  cashback_credited_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT total_positive CHECK (total_amount > 0)
);

CREATE TABLE public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price DECIMAL(10, 2) NOT NULL,
  cashback_percent DECIMAL(5, 2) NOT NULL,
  cashback_amount DECIMAL(10, 2) NOT NULL,
  CONSTRAINT quantity_positive CHECK (quantity > 0),
  CONSTRAINT unit_price_positive CHECK (unit_price > 0)
);

-- Block payments from minors
CREATE OR REPLACE FUNCTION block_minor_payments()
RETURNS TRIGGER AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = NEW.user_id AND is_minor = TRUE
  ) THEN
    RAISE EXCEPTION 'I minori non possono effettuare acquisti';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER check_minor_on_order
  BEFORE INSERT ON public.orders
  FOR EACH ROW EXECUTE FUNCTION block_minor_payments();

-- Set withdrawal expiry (14 days) on delivery
CREATE OR REPLACE FUNCTION set_withdrawal_expiry()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'delivered' AND OLD.status != 'delivered' THEN
    NEW.delivered_at := NOW();
    NEW.withdrawal_expires_at := NOW() + INTERVAL '14 days';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER order_delivery_trigger
  BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION set_withdrawal_expiry();

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own orders"
  ON public.orders FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Admins can view all orders"
  ON public.orders FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
