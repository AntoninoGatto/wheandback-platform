-- Keep free-tier Supabase awake: real Postgres writes (not /auth/v1/health).
-- Called daily by .github/workflows/supabase-keepalive.yml

CREATE TABLE IF NOT EXISTS public.keepalive_pings (
  id INT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  pinged_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ping_count BIGINT NOT NULL DEFAULT 0
);

INSERT INTO public.keepalive_pings (id, pinged_at, ping_count)
VALUES (1, NOW(), 0)
ON CONFLICT (id) DO NOTHING;

ALTER TABLE public.keepalive_pings ENABLE ROW LEVEL SECURITY;

-- No direct table access for anon; only via RPC below.
DROP POLICY IF EXISTS keepalive_pings_no_direct ON public.keepalive_pings;

CREATE OR REPLACE FUNCTION public.keepalive_ping()
RETURNS TIMESTAMPTZ
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  ts TIMESTAMPTZ;
BEGIN
  INSERT INTO public.keepalive_pings (id, pinged_at, ping_count)
  VALUES (1, NOW(), 1)
  ON CONFLICT (id) DO UPDATE
    SET pinged_at = NOW(),
        ping_count = public.keepalive_pings.ping_count + 1
  RETURNING pinged_at INTO ts;
  RETURN ts;
END;
$$;

REVOKE ALL ON FUNCTION public.keepalive_ping() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.keepalive_ping() TO anon, authenticated, service_role;
