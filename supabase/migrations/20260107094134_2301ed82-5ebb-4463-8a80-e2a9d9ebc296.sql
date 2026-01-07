-- Remove zones outside operating area
DELETE FROM public.loading_zones 
WHERE zone_name IN ('Mamelodi Rank', 'Bosman Station');

-- Add Volga Street and 7de Laan
INSERT INTO public.loading_zones (zone_name, zone_type, latitude, longitude, radius_meters, municipality, ward, address)
VALUES 
  ('Volga Street', 'loading_point', -25.7635, 28.3180, 50, 'City of Tshwane', 'Ward 10', 'Volga Street, Eersterust'),
  ('7de Laan', 'loading_point', -25.7590, 28.3220, 50, 'City of Tshwane', 'Ward 10', '7de Laan, Eersterust')
ON CONFLICT DO NOTHING;