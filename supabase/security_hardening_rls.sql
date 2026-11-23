-- =====================================================================
-- SECURITY HARDENING: Row Level Security (least privilege)
-- Run ONCE in Supabase Dashboard -> SQL Editor.
-- Safe to re-run (idempotent).
--
-- IMPORTANT: Deploy the new code to Vercel (with SUPABASE_SERVICE_ROLE_KEY,
-- KDS_PIN, KDS_SESSION_SECRET set) BEFORE running this, otherwise the
-- Kitchen Display will lose access to orders. The service_role key bypasses
-- RLS, so the server endpoints keep working.
-- =====================================================================

-- 0. Make sure RLS is on
ALTER TABLE public.orders             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calendar_blackouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_settings       ENABLE ROW LEVEL SECURITY;

-- 1. Drop EVERY existing policy on these tables (removes all the USING (true) holes)
DO $$
DECLARE r record;
BEGIN
  FOR r IN
    SELECT policyname, tablename FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename IN ('orders', 'calendar_blackouts', 'app_settings')
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', r.policyname, r.tablename);
  END LOOP;
END $$;

-- 2. Revoke blanket table privileges, then grant back only what is needed
REVOKE ALL ON public.orders             FROM anon, authenticated;
REVOKE ALL ON public.calendar_blackouts FROM anon, authenticated;
REVOKE ALL ON public.app_settings       FROM anon, authenticated;

-- orders: customers may ONLY place an order (INSERT). No read / update / delete.
GRANT INSERT ON public.orders TO anon;
CREATE POLICY "anon can only insert orders"
  ON public.orders FOR INSERT TO anon
  WITH CHECK (
    status = 'new'
    AND coalesce(char_length(customer_name), 0) BETWEEN 1 AND 200
  );

-- calendar_blackouts: public read-only (checkout calendar needs closed dates)
GRANT SELECT ON public.calendar_blackouts TO anon;
CREATE POLICY "anon can read blackouts"
  ON public.calendar_blackouts FOR SELECT TO anon
  USING (true);

-- app_settings: public read-only, and ONLY for explicitly whitelisted non-secret keys.
-- Secrets (gemini_api_key, qbo_refresh_token, ...) are never readable by anon.
GRANT SELECT ON public.app_settings TO anon;
CREATE POLICY "anon can read whitelisted public settings"
  ON public.app_settings FOR SELECT TO anon
  USING (key IN ('tiffin_menu_settings', 'gallery_items', 'deleted_gallery_ids'));

-- 3. Remove the leaked Gemini key from the database (also rotate it in Google AI Studio!)
DELETE FROM public.app_settings WHERE key = 'gemini_api_key';

-- 4. Stop broadcasting full order rows (with customer PII) over public Realtime
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'orders'
  ) THEN
    ALTER PUBLICATION supabase_realtime DROP TABLE public.orders;
  END IF;
END $$;

-- 5. Verify (optional): anon should only see the 3 policies below
-- SELECT tablename, policyname, roles, cmd FROM pg_policies WHERE schemaname='public' ORDER BY 1,2;
