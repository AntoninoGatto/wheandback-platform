-- Add dropshipping columns to products table
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS cj_product_id TEXT,
  ADD COLUMN IF NOT EXISTS cj_variant_id TEXT,
  ADD COLUMN IF NOT EXISTS supplier TEXT DEFAULT 'manual',
  ADD COLUMN IF NOT EXISTS purchase_price NUMERIC(10,2),
  ADD COLUMN IF NOT EXISTS supplier_price_updated_at TIMESTAMPTZ;

-- Import log table
CREATE TABLE IF NOT EXISTS public.import_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  imported_by UUID REFERENCES public.profiles(id),
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  cj_product_id TEXT,
  product_name TEXT,
  supplier TEXT NOT NULL DEFAULT 'cj',
  purchase_price NUMERIC(10,2),
  sell_price NUMERIC(10,2),
  cashback_percent NUMERIC(5,2),
  status TEXT NOT NULL DEFAULT 'imported', -- imported | failed | auto_approved
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS products_cj_id_idx ON public.products(cj_product_id);
CREATE INDEX IF NOT EXISTS import_logs_created_idx ON public.import_logs(created_at DESC);

-- RLS
ALTER TABLE public.import_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "import_logs_admin_only" ON public.import_logs
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );
