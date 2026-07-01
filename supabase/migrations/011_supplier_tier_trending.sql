-- Supplier tier + trending metrics (Phase 1)
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS supplier_tier TEXT NOT NULL DEFAULT 'partner'
    CHECK (supplier_tier IN ('partner', 'premium', 'cj')),
  ADD COLUMN IF NOT EXISTS view_count INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS sales_count INTEGER NOT NULL DEFAULT 0;

UPDATE public.products SET supplier_tier = 'cj' WHERE supplier = 'cj';
UPDATE public.products SET supplier_tier = 'partner' WHERE supplier IS NULL OR supplier = 'manual';

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS supplier_country TEXT,
  ADD COLUMN IF NOT EXISTS delivery_sla_days INTEGER;

CREATE INDEX IF NOT EXISTS products_supplier_tier_idx ON public.products(supplier_tier);
CREATE INDEX IF NOT EXISTS products_trending_idx ON public.products(status, sales_count DESC, view_count DESC);
