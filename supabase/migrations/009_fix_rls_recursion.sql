-- Fix infinite recursion: admin policies must not query profiles under RLS.
-- SECURITY DEFINER runs as owner and bypasses RLS on the inner SELECT.

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;

-- Helper: update admin policy only if the table exists
CREATE OR REPLACE FUNCTION public._fix_admin_policy(table_name text, policy_name text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF to_regclass('public.' || table_name) IS NOT NULL THEN
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', policy_name, table_name);
    EXECUTE format(
      'CREATE POLICY %I ON public.%I FOR ALL USING (public.is_admin())',
      policy_name,
      table_name
    );
  END IF;
END;
$$;

SELECT public._fix_admin_policy('profiles', 'Admins can view all profiles');
SELECT public._fix_admin_policy('products', 'Admins can manage all products');
SELECT public._fix_admin_policy('orders', 'Admins can view all orders');
SELECT public._fix_admin_policy('cashback_transactions', 'Admins can view all cashback');
SELECT public._fix_admin_policy('referral_rewards', 'Admins can manage all referral data');
SELECT public._fix_admin_policy('royalty_reports', 'Admins only: royalty reports');
SELECT public._fix_admin_policy('charity_reports', 'Admins only: charity reports');
SELECT public._fix_admin_policy('marketing_plans', 'marketing_plans_admin_write');
SELECT public._fix_admin_policy('import_logs', 'import_logs_admin_only');

DROP FUNCTION public._fix_admin_policy(text, text);
