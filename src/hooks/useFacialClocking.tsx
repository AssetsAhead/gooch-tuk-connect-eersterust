import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface ClockingRecord {
  id: string;
  driver_id: string;
  clocking_type: string;
  photo_path: string;
  verification_result: any;
  confidence_score: number;
  is_verified: boolean;
  is_flagged: boolean;
  flag_reason: string | null;
  latitude: number | null;
  longitude: number | null;
  clocked_at: string;
}

export interface FaceRegistration {
  id: string;
  driver_id: string;
  photo_path: string;
  is_active: boolean;
  registered_at: string;
}

export const useFacialClocking = () => {
  const { user } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [registration, setRegistration] = useState<FaceRegistration | null>(null);
  const [clockings, setClockings] = useState<ClockingRecord[]>([]);
  const [lastResult, setLastResult] = useState<any>(null);

  const checkRegistration = useCallback(async () => {
    if (!user) return null;
    const { data } = await supabase
      .from('driver_face_registrations')
      .select('*')
      .eq('driver_id', user.id)
      .eq('is_active', true)
      .order('registered_at', { ascending: false })
      .limit(1)
      .single();
    setRegistration(data as FaceRegistration | null);
    return data;
  }, [user]);

  const registerFace = useCallback(async (photoBase64: string) => {
    if (!user) return false;
    setIsProcessing(true);
    try {
      const buffer = Uint8Array.from(atob(photoBase64), c => c.charCodeAt(0));
      const filePath = `${user.id}/reference/${Date.now()}.jpg`;

      const { error: uploadError } = await supabase.storage
        .from('face-photos')
        .upload(filePath, buffer, { contentType: 'image/jpeg' });

      if (uploadError) throw uploadError;

      // Deactivate previous registrations
      await supabase
        .from('driver_face_registrations')
        .update({ is_active: false } as any)
        .eq('driver_id', user.id);

      const { error: insertError } = await supabase
        .from('driver_face_registrations')
        .insert({ driver_id: user.id, photo_path: filePath } as any);

      if (insertError) throw insertError;

      await checkRegistration();
      toast.success('Face registered successfully!');
      return true;
    } catch (err: any) {
      toast.error(err.message || 'Failed to register face');
      return false;
    } finally {
      setIsProcessing(false);
    }
  }, [user, checkRegistration]);

  const clockIn = useCallback(async (
    photoBase64: string,
    clockingType: 'shift_start' | 'shift_end' | 'trip_start' | 'trip_end'
  ) => {
    if (!user) return null;
    setIsProcessing(true);
    setLastResult(null);
    try {
      // Get location
      let latitude: number | undefined;
      let longitude: number | undefined;
      try {
        const pos = await new Promise<GeolocationPosition>((resolve, reject) =>
          navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 })
        );
        latitude = pos.coords.latitude;
        longitude = pos.coords.longitude;
      } catch {
        // Location optional
      }

      const { data, error } = await supabase.functions.invoke('verify-face', {
        body: {
          selfie_base64: photoBase64,
          clocking_type: clockingType,
          latitude,
          longitude,
        },
      });

      if (error) throw error;

      if (data?.error) {
        if (data.needs_registration) {
          toast.error('Please register your face first');
        } else {
          toast.error(data.error);
        }
        setLastResult({ error: data.error });
        return null;
      }

      setLastResult(data.verification);

      if (data.verification.is_verified) {
        toast.success(`${clockingType.replace('_', ' ')} verified ✓`);
      } else if (data.verification.is_flagged) {
        toast.warning(`Clocking recorded but flagged: ${data.verification.reason}`);
      }

      return data;
    } catch (err: any) {
      toast.error(err.message || 'Verification failed');
      return null;
    } finally {
      setIsProcessing(false);
    }
  }, [user]);

  const fetchClockings = useCallback(async (limit = 20) => {
    if (!user) return;
    const { data } = await supabase
      .from('driver_clockings')
      .select('*')
      .eq('driver_id', user.id)
      .order('clocked_at', { ascending: false })
      .limit(limit);
    setClockings((data || []) as ClockingRecord[]);
  }, [user]);

  return {
    isProcessing,
    registration,
    clockings,
    lastResult,
    checkRegistration,
    registerFace,
    clockIn,
    fetchClockings,
  };
};
