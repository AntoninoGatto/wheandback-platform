-- RBAC: user roles and profiles
CREATE TYPE user_role AS ENUM ('customer', 'seller', 'admin');
CREATE TYPE user_status AS ENUM ('active', 'suspended', 'pending_approval');

CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'customer',
  status user_status NOT NULL DEFAULT 'active',
  full_name TEXT,
  referral_code TEXT UNIQUE NOT NULL,
  referred_by TEXT,
  cashback_balance DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  cashback_pending DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  date_of_birth DATE,
  is_minor BOOLEAN NOT NULL DEFAULT FALSE,
  privacy_accepted_at TIMESTAMPTZ,
  terms_accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT cashback_balance_non_negative CHECK (cashback_balance >= 0),
  CONSTRAINT cashback_pending_non_negative CHECK (cashback_pending >= 0)
);

CREATE TABLE public.seller_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  vat_number TEXT,
  terms_accepted_at TIMESTAMPTZ NOT NULL,
  approved_at TIMESTAMPTZ,
  approved_by UUID REFERENCES public.profiles(id),
  is_active BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Block minors from being created as sellers (trigger instead of check constraint)
CREATE OR REPLACE FUNCTION check_seller_is_adult()
RETURNS TRIGGER AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = NEW.user_id AND is_minor = TRUE
  ) THEN
    RAISE EXCEPTION 'I minori non possono registrarsi come venditori';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER seller_must_be_adult
  BEFORE INSERT ON public.seller_profiles
  FOR EACH ROW EXECUTE FUNCTION check_seller_is_adult();

-- Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seller_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
