
-- Road infringements table - tracks individual violations detected by AI or manually reported
CREATE TABLE public.road_infringements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id UUID REFERENCES public.drivers(id) ON DELETE SET NULL,
  vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE SET NULL,
  capture_id UUID REFERENCES public.camera_captures(id) ON DELETE SET NULL,
  ai_incident_id UUID REFERENCES public.ai_incidents(id) ON DELETE SET NULL,
  
  infringement_type TEXT NOT NULL, -- speeding, red_light, illegal_parking, overloading, unroadworthy, no_license, reckless_driving, etc.
  infringement_code TEXT, -- SA AARTO code if applicable
  severity TEXT NOT NULL DEFAULT 'minor' CHECK (severity IN ('minor', 'moderate', 'serious', 'major')),
  
  description TEXT,
  location JSONB, -- {latitude, longitude, address, zone}
  evidence_urls TEXT[], -- links to images/video
  license_plate TEXT,
  
  detected_by TEXT NOT NULL DEFAULT 'ai' CHECK (detected_by IN ('ai', 'marshal', 'police', 'camera', 'manual')),
  confidence_score NUMERIC,
  
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'disputed', 'resolved', 'dismissed')),
  reviewed_by UUID,
  reviewed_at TIMESTAMPTZ,
  review_notes TEXT,
  
  -- Reputation impact
  demerit_points INTEGER DEFAULT 0,
  reputation_impact NUMERIC DEFAULT 0, -- negative impact on driver score
  fine_amount NUMERIC DEFAULT 0, -- in Rands
  
  -- Insurance relevance
  insurance_notified BOOLEAN DEFAULT false,
  insurance_claim_ref TEXT,
  
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- DOT compliance reports - generated from aggregated infringement data
CREATE TABLE public.dot_compliance_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_type TEXT NOT NULL DEFAULT 'monthly' CHECK (report_type IN ('weekly', 'monthly', 'quarterly', 'annual', 'incident')),
  report_period_start DATE NOT NULL,
  report_period_end DATE NOT NULL,
  
  generated_by UUID,
  
  -- Aggregated stats
  total_infringements INTEGER DEFAULT 0,
  total_incidents INTEGER DEFAULT 0,
  total_vehicles_monitored INTEGER DEFAULT 0,
  total_drivers_monitored INTEGER DEFAULT 0,
  
  -- Breakdown by severity
  minor_count INTEGER DEFAULT 0,
  moderate_count INTEGER DEFAULT 0,
  serious_count INTEGER DEFAULT 0,
  major_count INTEGER DEFAULT 0,
  
  -- Breakdown by type (JSONB for flexibility)
  infringement_breakdown JSONB DEFAULT '{}',
  
  -- Compliance metrics
  compliance_score NUMERIC DEFAULT 100, -- percentage
  repeat_offender_count INTEGER DEFAULT 0,
  average_response_time_minutes NUMERIC,
  
  -- Report content
  summary TEXT,
  recommendations TEXT[],
  report_data JSONB, -- full report payload for PDF generation
  
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'final', 'submitted', 'acknowledged')),
  submitted_at TIMESTAMPTZ,
  submitted_to TEXT, -- DOT reference
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.road_infringements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dot_compliance_reports ENABLE ROW LEVEL SECURITY;

-- RLS for road_infringements
CREATE POLICY "Admins can manage all infringements"
ON public.road_infringements FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Police can view and create infringements"
ON public.road_infringements FOR SELECT
USING (public.has_role(auth.uid(), 'police'));

CREATE POLICY "Police can insert infringements"
ON public.road_infringements FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'police'));

CREATE POLICY "Marshalls can view and create infringements"
ON public.road_infringements FOR SELECT
USING (public.has_role(auth.uid(), 'marshall'));

CREATE POLICY "Marshalls can insert infringements"
ON public.road_infringements FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'marshall'));

CREATE POLICY "Owners can view infringements for their vehicles"
ON public.road_infringements FOR SELECT
USING (public.has_role(auth.uid(), 'owner'));

CREATE POLICY "Drivers can view own infringements"
ON public.road_infringements FOR SELECT
USING (
  driver_id IN (SELECT id FROM public.drivers WHERE user_id = auth.uid())
);

-- RLS for dot_compliance_reports
CREATE POLICY "Admins can manage all reports"
ON public.dot_compliance_reports FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Owners can view reports"
ON public.dot_compliance_reports FOR SELECT
USING (public.has_role(auth.uid(), 'owner'));

-- Indexes
CREATE INDEX idx_infringements_driver ON public.road_infringements(driver_id);
CREATE INDEX idx_infringements_vehicle ON public.road_infringements(vehicle_id);
CREATE INDEX idx_infringements_type ON public.road_infringements(infringement_type);
CREATE INDEX idx_infringements_status ON public.road_infringements(status);
CREATE INDEX idx_infringements_occurred ON public.road_infringements(occurred_at DESC);
CREATE INDEX idx_infringements_plate ON public.road_infringements(license_plate);
CREATE INDEX idx_dot_reports_period ON public.dot_compliance_reports(report_period_start, report_period_end);

-- Trigger for updated_at
CREATE TRIGGER update_road_infringements_updated_at
BEFORE UPDATE ON public.road_infringements
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_dot_compliance_reports_updated_at
BEFORE UPDATE ON public.dot_compliance_reports
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function to auto-update driver reputation when infringement is confirmed
CREATE OR REPLACE FUNCTION public.apply_infringement_to_reputation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Only apply when status changes to 'confirmed'
  IF NEW.status = 'confirmed' AND (OLD.status IS NULL OR OLD.status <> 'confirmed') THEN
    -- Update driver reputation
    IF NEW.driver_id IS NOT NULL THEN
      UPDATE public.driver_reputation
      SET 
        infringements = COALESCE(infringements, 0) + 1,
        compliance_score = GREATEST(0, COALESCE(compliance_score, 100) - NEW.reputation_impact),
        updated_at = now()
      WHERE driver_id = (SELECT user_id FROM public.drivers WHERE id = NEW.driver_id);
    END IF;
    
    -- Create notification for the driver
    IF NEW.driver_id IS NOT NULL THEN
      PERFORM public.create_notification(
        (SELECT user_id FROM public.drivers WHERE id = NEW.driver_id),
        'Infringement Recorded',
        'A ' || NEW.severity || ' infringement (' || NEW.infringement_type || ') has been recorded. Demerit points: ' || COALESCE(NEW.demerit_points, 0),
        'warning',
        NEW.id,
        'infringement'
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER apply_infringement_reputation
AFTER INSERT OR UPDATE ON public.road_infringements
FOR EACH ROW EXECUTE FUNCTION public.apply_infringement_to_reputation();
