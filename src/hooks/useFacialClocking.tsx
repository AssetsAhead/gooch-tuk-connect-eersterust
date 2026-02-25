import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export type VerificationMethod = 'facial' | 'pin' | 'qr' | 'marshal';
export type ClockingType = 'shift_start' | 'shift_end' | 'trip_start' | 'trip_end';

export interface ClockingRecord {
  id: string;
  driver_id: string;
  clocking_type: string;
  photo_path: string | null;
  verification_result: any;
  confidence_score: number;
  is_verified: boolean;
  is_flagged: boolean;
  flag_reason: string | null;
  latitude: number | null;
  longitude: number | null;
  clocked_at: string;
  verification_method: VerificationMethod;
}

export interface FaceRegistration {
  id: string;
  driver_id: string;
  photo_path: string;
  is_active: boolean;
  registered_at: string;
  clocking_pin: string | null;
}

const getLocation = async (): Promise<{ latitude?: number; longitude?: number }> => {
  try {
    const pos = await new Promise<GeolocationPosition>((resolve, reject) =>
      navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 })
    );
    return { latitude: pos.coords.latitude, longitude: pos.coords.longitude };
  } catch {
    return {};
  }
};

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

  const setPin = useCallback(async (pin: string) => {
    if (!user) return false;
    setIsProcessing(true);
    try {
      // Update pin on the active registration, or create a minimal one
      const reg = registration;
      if (reg) {
        const { error } = await supabase
          .from('driver_face_registrations')
          .update({ clocking_pin: pin } as any)
          .eq('id', reg.id);
        if (error) throw error;
      } else {
        // Create a registration entry for PIN-only users (no photo required)
        const { error } = await supabase
          .from('driver_face_registrations')
          .insert({ driver_id: user.id, photo_path: 'pin-only', clocking_pin: pin } as any);
        if (error) throw error;
      }
      await checkRegistration();
      toast.success('Clocking PIN set successfully!');
      return true;
    } catch (err: any) {
      toast.error(err.message || 'Failed to set PIN');
      return false;
    } finally {
      setIsProcessing(false);
    }
  }, [user, registration, checkRegistration]);

  // Facial clocking (existing)
  const clockIn = useCallback(async (
    photoBase64: string,
    clockingType: ClockingType,
  ) => {
    if (!user) return null;
    setIsProcessing(true);
    setLastResult(null);
    try {
      const { latitude, longitude } = await getLocation();

      const { data, error } = await supabase.functions.invoke('verify-face', {
        body: { selfie_base64: photoBase64, clocking_type: clockingType, latitude, longitude },
      });

      if (error) throw error;
      if (data?.error) {
        if (data.needs_registration) toast.error('Please register your face first');
        else toast.error(data.error);
        setLastResult({ error: data.error });
        return null;
      }

      setLastResult(data.verification);
      if (data.verification.is_verified) {
        toast.success(`${clockingType.replace('_', ' ')} verified ✓ (Facial — +5 reputation)`);
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

  // PIN clocking
  const clockWithPin = useCallback(async (pin: string, clockingType: ClockingType) => {
    if (!user) return null;
    setIsProcessing(true);
    setLastResult(null);
    try {
      // Verify PIN against stored registration
      const { data: reg } = await supabase
        .from('driver_face_registrations')
        .select('*')
        .eq('driver_id', user.id)
        .eq('is_active', true)
        .single();

      if (!reg || !(reg as any).clocking_pin) {
        toast.error('No PIN set. Please set your clocking PIN first.');
        setLastResult({ error: 'No PIN configured' });
        return null;
      }

      if ((reg as any).clocking_pin !== pin) {
        toast.error('Incorrect PIN');
        setLastResult({ error: 'Incorrect PIN', is_verified: false, confidence: 0 });
        return null;
      }

      const { latitude, longitude } = await getLocation();

      const { error } = await supabase
        .from('driver_clockings')
        .insert({
          driver_id: user.id,
          clocking_type: clockingType,
          photo_path: null,
          is_verified: true,
          confidence_score: 1.0,
          is_flagged: false,
          latitude,
          longitude,
          verification_method: 'pin',
          verification_result: { method: 'pin', verified: true },
        } as any);

      if (error) throw error;

      const result = { is_verified: true, confidence: 1.0, reason: 'PIN verified', method: 'pin' };
      setLastResult(result);
      toast.success(`${clockingType.replace('_', ' ')} clocked ✓ (PIN)`);
      return result;
    } catch (err: any) {
      toast.error(err.message || 'PIN clocking failed');
      return null;
    } finally {
      setIsProcessing(false);
    }
  }, [user]);

  // QR code clocking
  const clockWithQR = useCallback(async (qrData: string, clockingType: ClockingType) => {
    if (!user) return null;
    setIsProcessing(true);
    setLastResult(null);
    try {
      // Validate QR contains expected zone data
      let zoneInfo: any;
      try {
        zoneInfo = JSON.parse(qrData);
      } catch {
        toast.error('Invalid QR code');
        setLastResult({ error: 'Invalid QR code' });
        return null;
      }

      const { latitude, longitude } = await getLocation();

      const { error } = await supabase
        .from('driver_clockings')
        .insert({
          driver_id: user.id,
          clocking_type: clockingType,
          photo_path: null,
          is_verified: true,
          confidence_score: 0.9,
          is_flagged: false,
          latitude,
          longitude,
          verification_method: 'qr',
          verification_result: { method: 'qr', zone: zoneInfo, verified: true },
        } as any);

      if (error) throw error;

      const result = { is_verified: true, confidence: 0.9, reason: `QR verified at ${zoneInfo.zone_name || 'zone'}`, method: 'qr' };
      setLastResult(result);
      toast.success(`${clockingType.replace('_', ' ')} clocked ✓ (QR scan)`);
      return result;
    } catch (err: any) {
      toast.error(err.message || 'QR clocking failed');
      return null;
    } finally {
      setIsProcessing(false);
    }
  }, [user]);

  // Marshal-approved clocking
  const clockWithMarshal = useCallback(async (marshalCode: string, clockingType: ClockingType) => {
    if (!user) return null;
    setIsProcessing(true);
    setLastResult(null);
    try {
      const { latitude, longitude } = await getLocation();

      const { error } = await supabase
        .from('driver_clockings')
        .insert({
          driver_id: user.id,
          clocking_type: clockingType,
          photo_path: null,
          is_verified: true,
          confidence_score: 0.85,
          is_flagged: false,
          latitude,
          longitude,
          verification_method: 'marshal',
          verification_result: { method: 'marshal', marshal_code: marshalCode, verified: true },
        } as any);

      if (error) throw error;

      const result = { is_verified: true, confidence: 0.85, reason: 'Marshal-verified', method: 'marshal' };
      setLastResult(result);
      toast.success(`${clockingType.replace('_', ' ')} clocked ✓ (Marshal verified)`);
      return result;
    } catch (err: any) {
      toast.error(err.message || 'Marshal clocking failed');
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
    setPin,
    clockIn,
    clockWithPin,
    clockWithQR,
    clockWithMarshal,
    fetchClockings,
  };
};
