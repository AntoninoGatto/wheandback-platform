-- Store CJ reviews and extra product metadata
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS reviews JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS listed_num INTEGER,
  ADD COLUMN IF NOT EXISTS weight_grams INTEGER;
