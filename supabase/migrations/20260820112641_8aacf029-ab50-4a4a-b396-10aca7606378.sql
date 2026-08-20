DO $$
DECLARE f record;
BEGIN
  FOR f IN
    SELECT p.oid::regprocedure AS sig, p.proname
    FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public'
  LOOP
    EXECUTE format('REVOKE ALL ON FUNCTION %s FROM PUBLIC, anon, authenticated', f.sig);
    -- re-grant only what the app / RLS policies legitimately need
    IF f.proname IN ('has_role', 'has_role_text', 'safe_role_allowed', 'get_public_zone_availability') THEN
      EXECUTE format('GRANT EXECUTE ON FUNCTION %s TO anon, authenticated', f.sig);
    ELSIF f.proname IN (
      'is_current_user_admin', 'has_valid_admin_session', 'create_admin_session',
      'create_admin_session_whitelisted', 'revoke_admin_session',
      'get_next_queue_position', 'is_within_zone', 'calculate_drive_to_own_eligibility'
    ) THEN
      EXECUTE format('GRANT EXECUTE ON FUNCTION %s TO authenticated', f.sig);
    END IF;
    EXECUTE format('GRANT EXECUTE ON FUNCTION %s TO service_role', f.sig);
  END LOOP;
END $$;