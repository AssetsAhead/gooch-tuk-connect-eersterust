INSERT INTO public.user_roles (user_id, role, is_active) 
VALUES ('bb22c9d8-d7ae-42e8-9603-fc1ed3d88d0d', 'passenger', true)
ON CONFLICT (user_id, role) DO UPDATE SET is_active = true;

INSERT INTO public.portal_access (user_id, portal_type, access_granted) 
VALUES ('bb22c9d8-d7ae-42e8-9603-fc1ed3d88d0d', 'passenger', true)
ON CONFLICT (user_id, portal_type) DO UPDATE SET access_granted = true;