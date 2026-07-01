-- Partner / supplier onboarding (invitations, contract, extended profiles)

ALTER TABLE public.seller_profiles
  ADD COLUMN IF NOT EXISTS contact_name TEXT,
  ADD COLUMN IF NOT EXISTS contact_email TEXT,
  ADD COLUMN IF NOT EXISTS contact_phone TEXT,
  ADD COLUMN IF NOT EXISTS product_categories TEXT,
  ADD COLUMN IF NOT EXISTS description TEXT,
  ADD COLUMN IF NOT EXISTS supplier_country TEXT DEFAULT 'IT',
  ADD COLUMN IF NOT EXISTS delivery_sla_days INTEGER DEFAULT 5,
  ADD COLUMN IF NOT EXISTS invitation_id UUID,
  ADD COLUMN IF NOT EXISTS contract_version TEXT,
  ADD COLUMN IF NOT EXISTS contract_accepted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS contract_signed_received_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS rejected_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS rejected_by UUID REFERENCES public.profiles(id),
  ADD COLUMN IF NOT EXISTS rejection_reason TEXT,
  ADD COLUMN IF NOT EXISTS signed_contract_note TEXT;

ALTER TABLE public.seller_profiles
  DROP CONSTRAINT IF EXISTS seller_profiles_user_id_unique;

ALTER TABLE public.seller_profiles
  ADD CONSTRAINT seller_profiles_user_id_unique UNIQUE (user_id);

CREATE TABLE IF NOT EXISTS public.seller_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  token TEXT NOT NULL UNIQUE,
  company_name TEXT,
  contact_name TEXT,
  product_categories TEXT,
  notes TEXT,
  invited_by UUID REFERENCES public.profiles(id),
  expires_at TIMESTAMPTZ NOT NULL,
  accepted_at TIMESTAMPTZ,
  seller_profile_id UUID REFERENCES public.seller_profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS seller_invitations_token_idx ON public.seller_invitations(token);
CREATE INDEX IF NOT EXISTS seller_invitations_email_idx ON public.seller_invitations(email);

ALTER TABLE public.seller_profiles
  DROP CONSTRAINT IF EXISTS seller_profiles_invitation_id_fkey;

ALTER TABLE public.seller_profiles
  ADD CONSTRAINT seller_profiles_invitation_id_fkey
  FOREIGN KEY (invitation_id) REFERENCES public.seller_invitations(id) ON DELETE SET NULL;

ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

-- RLS for seller_profiles (was enabled without policies)
DROP POLICY IF EXISTS "seller_profiles_select_own" ON public.seller_profiles;
DROP POLICY IF EXISTS "seller_profiles_insert_own" ON public.seller_profiles;
DROP POLICY IF EXISTS "seller_profiles_update_own_pending" ON public.seller_profiles;
DROP POLICY IF EXISTS "seller_profiles_admin_all" ON public.seller_profiles;

CREATE POLICY "seller_profiles_select_own"
  ON public.seller_profiles FOR SELECT
  USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "seller_profiles_insert_own"
  ON public.seller_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "seller_profiles_update_own_pending"
  ON public.seller_profiles FOR UPDATE
  USING (auth.uid() = user_id AND approved_at IS NULL)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "seller_profiles_admin_all"
  ON public.seller_profiles FOR ALL
  USING (public.is_admin());

ALTER TABLE public.seller_invitations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "seller_invitations_admin_all" ON public.seller_invitations;

CREATE POLICY "seller_invitations_admin_all"
  ON public.seller_invitations FOR ALL
  USING (public.is_admin());
