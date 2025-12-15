-- Grant admin role to the phone-authenticated user
INSERT INTO user_roles (user_id, role, is_active) 
VALUES ('0bc09c5e-be2c-48fc-b2f5-92f64ff92899', 'admin', true)
ON CONFLICT (user_id, role) DO UPDATE SET is_active = true;