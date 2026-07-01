-- Royalty and charity tracking
-- Licensor: Antonino Gatto | Licensee: Buy All Free LTD
-- Royalty: 0.3% of revenue + €12,000 fixed/year (minimum guaranteed: €24,000/year)
-- Charity: 1% of monthly revenue to "Il Segreto di Aladino"

CREATE TABLE public.royalty_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  total_revenue DECIMAL(14, 2) NOT NULL,
  royalty_percent DECIMAL(5, 3) NOT NULL DEFAULT 0.3,
  royalty_amount DECIMAL(14, 2) NOT NULL,
  fixed_annual_fee DECIMAL(14, 2) NOT NULL DEFAULT 12000.00,
  minimum_guaranteed DECIMAL(14, 2) NOT NULL DEFAULT 24000.00,
  total_due DECIMAL(14, 2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'paid', 'disputed')),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  -- Frequency: quarterly (every 3 months)
  CONSTRAINT valid_period CHECK (period_end > period_start)
);

CREATE TABLE public.charity_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  month DATE NOT NULL UNIQUE,
  total_revenue DECIMAL(14, 2) NOT NULL,
  charity_percent DECIMAL(5, 3) NOT NULL DEFAULT 1.0,
  charity_amount DECIMAL(14, 2) NOT NULL,
  beneficiary TEXT NOT NULL DEFAULT 'Il Segreto di Aladino',
  transfer_date DATE,
  transfer_reference TEXT,
  document_url TEXT,
  is_published BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Only admins can read/write royalty and charity data
ALTER TABLE public.royalty_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.charity_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins only: royalty reports"
  ON public.royalty_reports FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins only: charity reports"
  ON public.charity_reports FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Published charity reports are publicly readable"
  ON public.charity_reports FOR SELECT
  USING (is_published = TRUE);
