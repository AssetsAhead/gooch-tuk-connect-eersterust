-- Grant admin role to all three user accounts
INSERT INTO public.user_roles (user_id, role, is_active)
VALUES 
  ('aacc0a1a-a0b0-4a6f-b7ec-a95912c800aa', 'admin', true),
  ('14e66fc2-8a12-4461-9e23-c8b8c157e27d', 'admin', true),
  ('45a07ac4-8ad4-4d66-a8cd-eae28265f826', 'admin', true)
ON CONFLICT (user_id, role) DO UPDATE SET is_active = true;