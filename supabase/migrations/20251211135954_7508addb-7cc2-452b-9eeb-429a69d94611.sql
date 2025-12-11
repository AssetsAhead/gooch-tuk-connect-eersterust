-- Insert councillor community messages as seed data
INSERT INTO public.emergency_messages (type, priority, title, message, ward, area, status, created_at)
VALUES 
  (
    'general',
    'high',
    'SASSA Satellite Offices Reopening 14 January 2026',
    E'Please note that services will be suspended from 10.12.2025 and will resume again on 14.01.2026.\n\nFor urgent assistance please make use of Mahube Offices in Mamelodi.\n\nService Schedule:\n• Wednesday: Old Age Pension\n• Tuesday & Thursday: Disability\n• Monday & Friday: Child Care Grant\n\nFor enquiries contact: 012 840 9215\n\nThank you\nCllr N. Pillay',
    'Ward 86',
    'Mamelodi',
    'active',
    '2025-12-02 09:00:00+02'
  ),
  (
    'general',
    'high',
    'Home Affairs at Eersterust Civic Centre - 11 December 2025',
    E'Home Affairs will be at the Eersterust Civic Centre tomorrow the 11 December 2025 from 10h00\n\nServices & Fees:\n• Re-activation: R460\n• Annual returns arrears: R750\n• Beneficial Ownership File: R370\n• Filing fee: R150\n• Smart Card Identities: R140\n• Passports: R600\n\n⚠️ For 60 years and over only\n⚠️ First 50 people will be attended to\n⚠️ No cash accepted - swipe only\n\nContact: 0677103146\n\nThank you\nCllr Benjamin Lawrence\nCllr N. Pillay',
    'Ward 86',
    'Eersterust',
    'active',
    '2025-12-10 14:00:00+02'
  );