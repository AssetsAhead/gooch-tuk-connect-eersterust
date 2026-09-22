INSERT INTO public.user_roles (user_id, role)
SELECT u.id, r.role
FROM auth.users u
CROSS JOIN (SELECT unnest(enum_range(NULL::app_role)) AS role) r
WHERE u.email IN ('assetsahead.sa@gmail.com','realone.mel@gmail.com','27826370673@phone.tukconnect.app')
ON CONFLICT (user_id, role) DO NOTHING;