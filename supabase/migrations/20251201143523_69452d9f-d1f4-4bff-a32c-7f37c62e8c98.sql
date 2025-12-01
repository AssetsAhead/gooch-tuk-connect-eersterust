-- Insert Dean Swart as supplier
INSERT INTO public.parts_suppliers (id, name, phone, notes)
VALUES ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Dean Swart - Bajaj Franchise', '066 227 4407', 'Original Bajaj spares manufactured in India');

-- Insert all parts from Dean Swart's price list
INSERT INTO public.parts_inventory (supplier_id, part_name, category, price_rands, vehicle_type) VALUES
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Piston and Sleeve', 'Engine', 2000.00, 'tuk_tuk'),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Rings', 'Engine', 500.00, 'tuk_tuk'),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Piston', 'Engine', 1000.00, 'tuk_tuk'),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Oil Pump', 'Engine', 500.00, 'tuk_tuk'),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Clutch Cable', 'Cables', 250.00, 'tuk_tuk'),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Gear Cable', 'Cables', 250.00, 'tuk_tuk'),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Petrol Cable', 'Cables', 250.00, 'tuk_tuk'),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Slider Blocks', 'Suspension', 150.00, 'tuk_tuk'),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Oil Filter', 'Filters', 130.00, 'tuk_tuk'),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Bendix', 'Starter', 1200.00, 'tuk_tuk'),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Flywheel', 'Engine', 1200.00, 'tuk_tuk'),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Mirrors (Set)', 'Body', 500.00, 'tuk_tuk'),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Valves', 'Engine', 500.00, 'tuk_tuk'),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Tensioner', 'Engine', 500.00, 'tuk_tuk'),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'CV Boots', 'Drivetrain', 150.00, 'tuk_tuk'),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Brush Kit', 'Electrical', 500.00, 'tuk_tuk'),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Master Cylinder', 'Brakes', 1000.00, 'tuk_tuk'),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Megnito', 'Electrical', 1250.00, 'tuk_tuk'),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Cam Shaft', 'Engine', 1050.00, 'tuk_tuk'),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Clutch Plates', 'Clutch', 550.00, 'tuk_tuk'),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Studs X4', 'Hardware', 180.00, 'tuk_tuk'),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Master Cylinder Kit', 'Brakes', 500.00, 'tuk_tuk'),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Back Wheel Brake Cylinder', 'Brakes', 500.00, 'tuk_tuk'),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Clutch Gasket', 'Gaskets', 100.00, 'tuk_tuk'),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Top Gasket', 'Gaskets', 80.00, 'tuk_tuk');