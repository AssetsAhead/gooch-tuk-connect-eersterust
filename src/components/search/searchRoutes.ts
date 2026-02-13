import { NavigateFunction } from "react-router-dom";

export interface SearchableItem {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  keywords: string[];
  path: string;
  roles?: string[]; // if empty, available to all
}

// Every route and feature in the app, with rich keywords for deep search
export const ALL_SEARCHABLE_ITEMS: SearchableItem[] = [
  // ── Core Dashboards ──
  { id: 'home', title: 'Home / Landing Page', subtitle: 'Main landing page', category: 'Navigation', keywords: ['home', 'landing', 'index', 'start', 'welcome'], path: '/' },
  { id: 'dashboard', title: 'Dashboard', subtitle: 'Role-based main dashboard', category: 'Navigation', keywords: ['dashboard', 'main', 'overview', 'hub'], path: '/dashboard' },
  { id: 'admin', title: 'Admin Dashboard', subtitle: 'Complete oversight of the ecosystem', category: 'Dashboards', keywords: ['admin', 'management', 'oversight', 'approvals', 'pending', 'users', 'system'], path: '/admin', roles: ['admin'] },
  { id: 'driver', title: 'Driver Dashboard', subtitle: 'Rides, earnings, queue status', category: 'Dashboards', keywords: ['driver', 'rides', 'earnings', 'queue', 'trips', 'income', 'daily'], path: '/driver', roles: ['driver', 'admin'] },
  { id: 'passenger', title: 'Passenger Dashboard', subtitle: 'Book rides, history, SASSA discount', category: 'Dashboards', keywords: ['passenger', 'book', 'ride', 'trip', 'history', 'sassa', 'discount', 'hail'], path: '/passenger', roles: ['passenger', 'admin'] },
  { id: 'owner', title: 'Owner Dashboard', subtitle: 'Fleet management, drivers, revenue', category: 'Dashboards', keywords: ['owner', 'fleet', 'vehicles', 'drivers', 'revenue', 'payouts', 'earnings'], path: '/owner', roles: ['owner', 'admin'] },
  { id: 'marshall', title: 'Marshall Dashboard', subtitle: 'Queue management, vehicle log, incidents', category: 'Dashboards', keywords: ['marshall', 'marshal', 'queue', 'rank', 'departures', 'incidents', 'log'], path: '/marshall', roles: ['marshall', 'admin'] },
  { id: 'police', title: 'Police Dashboard', subtitle: 'Flagged vehicles, incidents, fines', category: 'Dashboards', keywords: ['police', 'law enforcement', 'flagged', 'vehicles', 'incidents', 'fines', 'investigations', 'saps'], path: '/police', roles: ['police', 'admin'] },

  // ── SASSA ──
  { id: 'sassa-admin', title: 'SASSA Verifications (Admin)', subtitle: 'Review grant card verifications', category: 'SASSA & Social Grants', keywords: ['sassa', 'grant', 'card', 'verification', 'social', 'review', 'approve'], path: '/admin/sassa-verifications', roles: ['admin'] },

  // ── Business & Community ──
  { id: 'business-portal', title: 'Business Portal', subtitle: 'Business services and township economy hub', category: 'Business', keywords: ['business', 'portal', 'services', 'township', 'economy', 'spaza', 'stokvels'], path: '/business-portal' },
  { id: 'community-safety', title: 'Community Safety Portal', subtitle: 'Safety network, crime map, panic alerts', category: 'Community', keywords: ['community', 'safety', 'crime', 'map', 'panic', 'alert', 'security', 'network', 'neighbourhood'], path: '/community-safety' },
  { id: 'community-announcements', title: 'Community Announcements', subtitle: 'Ward councillor messaging and alerts', category: 'Community', keywords: ['community', 'announcements', 'ward', 'councillor', 'messaging', 'alerts', 'municipal'], path: '/community-announcements' },
  { id: 'passenger-recruitment', title: 'Passenger Recruitment', subtitle: 'Campaign for local sign-ups', category: 'Growth', keywords: ['recruitment', 'passengers', 'sign-up', 'campaign', 'marketing', 'onboarding', 'growth'], path: '/passenger-recruitment' },

  // ── Compliance & Regulatory ──
  { id: 'compliance', title: 'Compliance Hub', subtitle: 'Legal, NLTA, SANTACO, POPIA requirements', category: 'Compliance', keywords: ['compliance', 'legal', 'nlta', 'santaco', 'popia', 'regulatory', 'requirements', 'documentation', 'law'], path: '/compliance' },
  { id: 'regulatory-registration', title: 'Regulatory Registration', subtitle: 'CIPC, SARS, DOT, UIF registrations', category: 'Compliance', keywords: ['regulatory', 'registration', 'cipc', 'sars', 'dot', 'uif', 'coida', 'register', 'government'], path: '/regulatory-registration' },
  { id: 'operating-license', title: 'Operating License Application', subtitle: 'DOT operating license application form', category: 'Compliance', keywords: ['operating', 'license', 'dot', 'application', 'permit', 'transport', 'department'], path: '/operating-license-application' },
  { id: 'form-9a', title: 'DOT Form 9A', subtitle: 'Official DOT application form', category: 'Compliance', keywords: ['form', '9a', 'dot', 'application', 'official', 'department', 'transport'], path: '/form-9a' },
  { id: 'dot-presentation', title: 'DOT Presentation', subtitle: 'Department of Transport pitch deck', category: 'Compliance', keywords: ['dot', 'presentation', 'pitch', 'deck', 'department', 'transport', 'slides'], path: '/dot-presentation' },

  // ── Fleet & Vehicles ──
  { id: 'fleet-vehicles', title: 'Fleet Vehicles Dashboard', subtitle: 'All fleet vehicles, registrations, e-numbers', category: 'Fleet', keywords: ['fleet', 'vehicles', 'registration', 'e-number', 'car', 'taxi', 'minibus', 'status', 'kitting'], path: '/fleet-vehicles' },

  // ── Investor ──
  { id: 'investor', title: 'Investor Portal', subtitle: 'Investment proposals and pitch materials', category: 'Investor', keywords: ['investor', 'portal', 'investment', 'proposal', 'pitch', 'funding', 'capital'], path: '/investor' },
  { id: 'investor-r2m', title: 'R2M Fleet Proposal', subtitle: 'Route-to-Market fleet investment', category: 'Investor', keywords: ['r2m', 'route', 'market', 'fleet', 'proposal', 'investment'], path: '/investor/r2m-fleet' },
  { id: 'investor-hardware', title: 'Hardware Only Proposal', subtitle: 'Vehicle kitting and hardware investment', category: 'Investor', keywords: ['hardware', 'kitting', 'gps', 'dashcam', 'camera', 'tracker', 'device', 'equipment', 'vehicle kitting'], path: '/investor/hardware-only' },
  { id: 'investor-scale', title: 'Scale Funding Proposal', subtitle: 'Growth and scaling investment', category: 'Investor', keywords: ['scale', 'funding', 'growth', 'expansion', 'scaling'], path: '/investor/scale-funding' },
  { id: 'investor-hybrid', title: 'Hybrid Funding Proposal', subtitle: 'Combined funding model', category: 'Investor', keywords: ['hybrid', 'funding', 'combined', 'model', 'mixed'], path: '/investor/hybrid-funding' },

  // ── Cost & Finance ──
  { id: 'cost-breakdown', title: 'Cost Breakdown', subtitle: 'DOT route costs, vehicle kitting, security agency', category: 'Finance', keywords: ['cost', 'breakdown', 'budget', 'pricing', 'expenses', 'kitting', 'security', 'agency', 'dot', 'api', 'integration', 'pdf', 'report'], path: '/cost-breakdown' },

  // ── Payments ──
  { id: 'payment-success', title: 'Payment Success', subtitle: 'Payment confirmation page', category: 'Payments', keywords: ['payment', 'success', 'confirmation', 'paid', 'yoco'], path: '/payment-success' },
  { id: 'payment-cancelled', title: 'Payment Cancelled', subtitle: 'Payment cancellation page', category: 'Payments', keywords: ['payment', 'cancelled', 'failed', 'yoco'], path: '/payment-cancelled' },

  // ── Auth & Account ──
  { id: 'auth', title: 'Sign In / Register', subtitle: 'Authentication and registration', category: 'Account', keywords: ['login', 'sign in', 'register', 'signup', 'auth', 'account', 'password', 'google', 'otp', 'phone'], path: '/auth' },
  { id: 'register-complete', title: 'Registration Complete', subtitle: 'Post-registration confirmation', category: 'Account', keywords: ['register', 'complete', 'confirmation', 'welcome'], path: '/register-complete' },

  // ── Legal ──
  { id: 'privacy', title: 'Privacy Policy', subtitle: 'POPIA-compliant privacy policy', category: 'Legal', keywords: ['privacy', 'policy', 'popia', 'data', 'protection', 'personal', 'information'], path: '/privacy-policy' },
  { id: 'terms', title: 'Terms of Service', subtitle: 'Terms and conditions', category: 'Legal', keywords: ['terms', 'service', 'conditions', 'agreement', 'legal'], path: '/terms-of-service' },

  // ── Safety ──
  { id: 'safe-mode', title: 'Safe Mode', subtitle: 'Emergency safe mode fallback', category: 'Safety', keywords: ['safe', 'mode', 'emergency', 'fallback', 'offline', 'panic'], path: '/safe' },

  // ── In-Dashboard Features (not separate routes but searchable concepts) ──
  { id: 'feat-panic', title: 'Panic Button', subtitle: 'Emergency alert system for all users', category: 'Features', keywords: ['panic', 'button', 'emergency', 'alert', 'sos', 'help', 'danger', 'distress'], path: '/dashboard' },
  { id: 'feat-load-shedding', title: 'Load Shedding Tracker', subtitle: 'Eskom schedule and alerts', category: 'Features', keywords: ['load', 'shedding', 'eskom', 'electricity', 'power', 'outage', 'schedule', 'stage'], path: '/dashboard' },
  { id: 'feat-sassa-discount', title: 'SASSA Discount Verification', subtitle: 'Grant card verification for fare discounts', category: 'Features', keywords: ['sassa', 'discount', 'grant', 'card', 'verification', 'fare', 'concession', 'social'], path: '/passenger' },
  { id: 'feat-ride-booking', title: 'Book a Ride / Hail a Taxi', subtitle: 'Request a minibus taxi ride', category: 'Features', keywords: ['book', 'ride', 'hail', 'taxi', 'request', 'trip', 'pickup', 'destination', 'minibus'], path: '/passenger' },
  { id: 'feat-queue', title: 'Rank Queue Management', subtitle: 'Manage taxi rank loading queues', category: 'Features', keywords: ['queue', 'rank', 'loading', 'zone', 'departure', 'waiting', 'position', 'line'], path: '/marshall' },
  { id: 'feat-revenue', title: 'Revenue Tracking', subtitle: 'Daily/weekly income and expense tracking', category: 'Features', keywords: ['revenue', 'tracking', 'income', 'expense', 'earnings', 'money', 'profit', 'daily', 'weekly'], path: '/owner' },
  { id: 'feat-driver-documents', title: 'Driver Document Upload', subtitle: 'PDP, license, ID uploads', category: 'Features', keywords: ['driver', 'document', 'upload', 'pdp', 'license', 'id', 'certification', 'expiry'], path: '/owner' },
  { id: 'feat-vehicle-registration', title: 'Vehicle Registration Agreement', subtitle: 'Register vehicles to fleet', category: 'Features', keywords: ['vehicle', 'registration', 'agreement', 'fleet', 'add', 'register', 'contract'], path: '/owner' },
  { id: 'feat-payroll', title: 'Payroll Calculator', subtitle: 'Driver pay and deductions', category: 'Features', keywords: ['payroll', 'calculator', 'pay', 'salary', 'deductions', 'uif', 'paye', 'wages'], path: '/owner' },
  { id: 'feat-payslip', title: 'Payslip Generator', subtitle: 'Generate driver payslips (PDF)', category: 'Features', keywords: ['payslip', 'generator', 'pdf', 'pay', 'statement', 'driver'], path: '/owner' },
  { id: 'feat-employment-contract', title: 'Employment Contract Generator', subtitle: 'Generate driver employment contracts', category: 'Features', keywords: ['employment', 'contract', 'generator', 'hire', 'agreement', 'labour', 'labor'], path: '/owner' },
  { id: 'feat-parts', title: 'Parts Inventory', subtitle: 'Spare parts and supplier management', category: 'Features', keywords: ['parts', 'inventory', 'spare', 'supplier', 'stock', 'maintenance', 'purchase', 'order'], path: '/owner' },
  { id: 'feat-fines', title: 'Fine Management', subtitle: 'Issue and track traffic fines', category: 'Features', keywords: ['fine', 'management', 'traffic', 'penalty', 'issue', 'track', 'infringement'], path: '/police' },
  { id: 'feat-camera', title: 'Camera Management', subtitle: 'CCTV, ALPR, dashcam systems', category: 'Features', keywords: ['camera', 'cctv', 'alpr', 'anpr', 'license plate', 'dashcam', 'surveillance', 'video', 'recording'], path: '/community-safety' },
  { id: 'feat-crime-map', title: 'Crime Map', subtitle: 'Interactive crime and incident mapping', category: 'Features', keywords: ['crime', 'map', 'incident', 'hotspot', 'location', 'area', 'danger', 'report'], path: '/community-safety' },
  { id: 'feat-financial', title: 'Financial Inclusion', subtitle: 'Banking, stokvels, micro-loans', category: 'Features', keywords: ['financial', 'inclusion', 'banking', 'stokvel', 'loan', 'micro', 'savings', 'credit', 'fintech'], path: '/business-portal' },
  { id: 'feat-township-economy', title: 'Township Economy', subtitle: 'Spaza shops, local businesses', category: 'Features', keywords: ['township', 'economy', 'spaza', 'shop', 'local', 'business', 'enterprise', 'informal'], path: '/business-portal' },
  { id: 'feat-municipal', title: 'Municipal Services', subtitle: 'Water, electricity, rates management', category: 'Features', keywords: ['municipal', 'services', 'water', 'electricity', 'rates', 'bill', 'council', 'municipality'], path: '/business-portal' },
  { id: 'feat-government', title: 'Government Services', subtitle: 'Government portal integrations', category: 'Features', keywords: ['government', 'services', 'portal', 'home affairs', 'dha', 'id', 'passport'], path: '/business-portal' },
  { id: 'feat-ip', title: 'IP Documentation System', subtitle: 'Patent and intellectual property filings', category: 'Features', keywords: ['ip', 'patent', 'intellectual', 'property', 'cipc', 'filing', 'trademark'], path: '/compliance' },
  { id: 'feat-insurance', title: 'Insurance Cost Calculator', subtitle: 'Fleet insurance quotes and estimates', category: 'Features', keywords: ['insurance', 'cost', 'calculator', 'quote', 'premium', 'cover', 'policy', 'fleet'], path: '/compliance' },
  { id: 'feat-ev', title: 'EV vs Petrol Calculator', subtitle: 'Compare electric vs petrol costs', category: 'Features', keywords: ['ev', 'electric', 'petrol', 'diesel', 'fuel', 'calculator', 'compare', 'green', 'energy'], path: '/owner' },
  { id: 'feat-roi', title: 'Fleet ROI Calculator', subtitle: 'Return on investment for fleet', category: 'Features', keywords: ['roi', 'return', 'investment', 'calculator', 'fleet', 'profit', 'margin'], path: '/owner' },
  { id: 'feat-whatsapp', title: 'WhatsApp Messaging', subtitle: 'Send messages via WhatsApp', category: 'Features', keywords: ['whatsapp', 'messaging', 'message', 'send', 'chat', 'communication'], path: '/dashboard' },
  { id: 'feat-sms', title: 'SMS Messaging', subtitle: 'Send SMS notifications and OTPs', category: 'Features', keywords: ['sms', 'text', 'message', 'otp', 'notification', 'send'], path: '/dashboard' },
  { id: 'feat-translation', title: 'Speech Translator', subtitle: 'Multi-language voice translation', category: 'Features', keywords: ['translate', 'translation', 'speech', 'voice', 'language', 'zulu', 'xhosa', 'sotho', 'afrikaans', 'multilingual'], path: '/dashboard' },
  { id: 'feat-notifications', title: 'Notification Center', subtitle: 'All app notifications and alerts', category: 'Features', keywords: ['notification', 'center', 'alerts', 'bell', 'messages', 'updates'], path: '/dashboard' },
  { id: 'feat-analytics', title: 'Analytics Dashboard', subtitle: 'Platform metrics, usage, and insights', category: 'Features', keywords: ['analytics', 'dashboard', 'metrics', 'insights', 'usage', 'statistics', 'data', 'reports'], path: '/admin' },
  { id: 'feat-reputation', title: 'Driver Reputation System', subtitle: 'Ratings, compliance scores, champion acts', category: 'Features', keywords: ['reputation', 'rating', 'score', 'compliance', 'champion', 'driver', 'stars', 'review'], path: '/driver' },
  { id: 'feat-file13', title: 'File 13 Requests', subtitle: 'Driver availability and transfer requests', category: 'Features', keywords: ['file 13', 'file13', 'transfer', 'driver', 'availability', 'request', 'claim'], path: '/owner' },
  { id: 'feat-flagged', title: 'Flagged Individuals', subtitle: 'Blacklisted or flagged persons', category: 'Features', keywords: ['flagged', 'blacklist', 'banned', 'individual', 'person', 'warning', 'alert'], path: '/community-safety' },
  { id: 'feat-geofence', title: 'Geofence Zones', subtitle: 'Virtual boundaries and zone rules', category: 'Features', keywords: ['geofence', 'zone', 'boundary', 'area', 'restrict', 'virtual', 'fence'], path: '/admin' },
  { id: 'feat-rank-fees', title: 'Rank Access Fees', subtitle: 'Weekly rank access fee tracking', category: 'Features', keywords: ['rank', 'access', 'fee', 'weekly', 'payment', 'levy', 'association'], path: '/owner' },
  { id: 'infringement-monitoring', title: 'Road Infringement Monitoring', subtitle: 'AI traffic violation detection, AARTO demerits, DOT reports', category: 'Safety & Monitoring', keywords: ['infringement', 'violation', 'traffic', 'road', 'aarto', 'demerit', 'fine', 'speeding', 'red light', 'overloading', 'reckless', 'dot', 'compliance', 'report', 'camera', 'ai', 'monitoring', 'tsinglink'], path: '/infringement-monitoring', roles: ['admin', 'owner', 'police', 'marshall'] },
];
