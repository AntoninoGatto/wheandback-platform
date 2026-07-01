-- Products and categories
CREATE TYPE product_status AS ENUM (
  'draft', 'pending_approval', 'published', 'rejected', 'blacklisted'
);

CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  category_id TEXT NOT NULL,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  stock INTEGER NOT NULL DEFAULT 0,
  images TEXT[] NOT NULL DEFAULT '{}',
  cashback_percent DECIMAL(5, 2) NOT NULL,
  margin_percent DECIMAL(5, 2) NOT NULL,
  status product_status NOT NULL DEFAULT 'draft',
  is_blacklisted BOOLEAN NOT NULL DEFAULT FALSE,
  blacklist_reason TEXT,
  approved_by UUID REFERENCES public.profiles(id),
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT cashback_min CHECK (cashback_percent >= 5),
  CONSTRAINT cashback_max CHECK (cashback_percent <= 35),
  CONSTRAINT price_positive CHECK (price > 0),
  CONSTRAINT stock_non_negative CHECK (stock >= 0)
);

-- Multi-language product translations
CREATE TABLE public.product_translations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  locale TEXT NOT NULL CHECK (locale IN ('it', 'en', 'fr', 'es', 'de')),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  UNIQUE (product_id, locale)
);

-- Blacklist check function
CREATE OR REPLACE FUNCTION check_product_blacklist()
RETURNS TRIGGER AS $$
DECLARE
  blacklisted_terms TEXT[] := ARRAY[
    'monopattino', 'monopattini', 'accendino', 'accendini',
    'sigaretta', 'tabacco', 'alcolici', 'scommesse',
    'gioco d''azzardo', 'armi'
  ];
  term TEXT;
BEGIN
  FOREACH term IN ARRAY blacklisted_terms LOOP
    IF LOWER(NEW.name) LIKE '%' || term || '%'
    OR LOWER(NEW.description) LIKE '%' || term || '%' THEN
      NEW.is_blacklisted := TRUE;
      NEW.status := 'blacklisted';
      NEW.blacklist_reason := 'Prodotto non consentito: ' || term;
      RETURN NEW;
    END IF;
  END LOOP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER product_blacklist_check
  BEFORE INSERT OR UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION check_product_blacklist();

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view published products"
  ON public.products FOR SELECT
  USING (status = 'published' AND is_blacklisted = FALSE);

CREATE POLICY "Sellers can manage own products"
  ON public.products FOR ALL
  USING (seller_id = auth.uid());

CREATE POLICY "Admins can manage all products"
  ON public.products FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
