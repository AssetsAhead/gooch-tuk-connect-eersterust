DROP POLICY IF EXISTS "Anyone can view active loading zones" ON public.loading_zones;
CREATE POLICY "Anyone can view active loading zones"
ON public.loading_zones
FOR SELECT
TO anon
USING (is_active = true);

GRANT SELECT ON public.loading_zones TO anon;

CREATE OR REPLACE FUNCTION public.get_public_zone_availability()
RETURNS TABLE(
  zone_id uuid,
  zone_name text,
  zone_type text,
  municipality text,
  address text,
  has_marshal boolean,
  drivers_waiting integer,
  departures_last_hour integer,
  estimated_wait_minutes integer
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    lz.id,
    lz.zone_name,
    lz.zone_type,
    lz.municipality,
    lz.address,
    COALESCE(lz.has_marshal, false),
    COALESCE(w.waiting, 0)::integer,
    COALESCE(d.departed, 0)::integer,
    CASE
      WHEN COALESCE(d.departed, 0) = 0 THEN NULL
      ELSE GREATEST(1, ROUND((COALESCE(w.waiting, 0)::numeric * 60) / d.departed))::integer
    END
  FROM public.loading_zones lz
  LEFT JOIN (
    SELECT zone_id, COUNT(*) AS waiting
    FROM public.zone_queue
    WHERE status = 'waiting'
    GROUP BY zone_id
  ) w ON w.zone_id = lz.id
  LEFT JOIN (
    SELECT zone_id, COUNT(*) AS departed
    FROM public.zone_queue
    WHERE status = 'departed'
      AND departed_at > now() - interval '1 hour'
    GROUP BY zone_id
  ) d ON d.zone_id = lz.id
  WHERE lz.is_active = true
  ORDER BY lz.zone_name;
$$;

GRANT EXECUTE ON FUNCTION public.get_public_zone_availability() TO anon, authenticated;