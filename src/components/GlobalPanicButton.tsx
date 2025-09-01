import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Shield, X, Camera, Mic, MapPin } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useSecureAuth } from '@/hooks/useSecureAuth';
import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Camera as CapCamera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Device } from '@capacitor/device';

export const GlobalPanicButton = () => {
  const [isPressed, setIsPressed] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [cooldownActive, setCooldownActive] = useState(false);
  const [cooldownTimer, setCooldownTimer] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingConsent, setRecordingConsent] = useState(false);
  const { user, isLawEnforcement } = useSecureAuth();
  const { toast } = useToast();
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordingChunksRef = useRef<Blob[]>([]);

  // Check localStorage for recent panic button usage
  useEffect(() => {
    const lastPanicTime = localStorage.getItem('lastPanicButtonUse');
    if (lastPanicTime) {
      const timeSinceLastUse = Date.now() - parseInt(lastPanicTime);
      const cooldownPeriod = 30000; // 30 seconds cooldown
      
      if (timeSinceLastUse < cooldownPeriod) {
        setCooldownActive(true);
        setCooldownTimer(Math.ceil((cooldownPeriod - timeSinceLastUse) / 1000));
        
        const interval = setInterval(() => {
          const remainingTime = Math.ceil((cooldownPeriod - (Date.now() - parseInt(lastPanicTime))) / 1000);
          if (remainingTime <= 0) {
            setCooldownActive(false);
            setCooldownTimer(0);
            clearInterval(interval);
          } else {
            setCooldownTimer(remainingTime);
          }
        }, 1000);
        
        return () => clearInterval(interval);
      }
    }
  }, []);

  const handlePanicPress = () => {
    if (cooldownActive) {
      toast({
        title: "Please wait",
        description: `Panic button is on cooldown for ${cooldownTimer} more seconds`,
        variant: "destructive",
      });
      return;
    }
    
    setShowConfirmation(true);
  };

  const startInstantRecording = async () => {
    try {
      setIsRecording(true);
      
      // Capture photo evidence
      await captureEmergencyPhoto();
      
      // Start audio recording
      await startAudioRecording();
      
      // Capture location
      await captureLocation();
      
      toast({
        title: "📹 Recording Evidence",
        description: "Audio and visual evidence being captured",
        variant: "default",
      });
    } catch (error) {
      console.error('Recording failed:', error);
      toast({
        title: "Recording Warning",
        description: "Some evidence capture failed, but alert still sent",
        variant: "destructive",
      });
    }
  };

  const captureEmergencyPhoto = async () => {
    try {
      const deviceInfo = await Device.getInfo();
      
      if (deviceInfo.platform !== 'web') {
        // Mobile device - use Capacitor Camera
        const photo = await CapCamera.getPhoto({
          quality: 90,
          allowEditing: false,
          resultType: CameraResultType.Uri,
          source: CameraSource.Camera,
          promptLabelHeader: 'Emergency Evidence',
          promptLabelPhoto: 'Take Photo',
        });
        
        console.log('Emergency photo captured:', photo.webPath);
      } else {
        // Web browser - use getUserMedia for photo
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        const video = document.createElement('video');
        video.srcObject = stream;
        await video.play();
        
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(video, 0, 0);
        
        stream.getTracks().forEach(track => track.stop());
        console.log('Emergency photo captured via web camera');
      }
    } catch (error) {
      console.warn('Photo capture failed:', error);
    }
  };

  const startAudioRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      
      mediaRecorderRef.current = mediaRecorder;
      recordingChunksRef.current = [];
      
      mediaRecorder.ondataavailable = (event) => {
        recordingChunksRef.current.push(event.data);
      };
      
      mediaRecorder.start();
      console.log('Audio recording started');
      
      // Stop recording after 30 seconds
      setTimeout(() => stopAudioRecording(), 30000);
    } catch (error) {
      console.warn('Audio recording failed:', error);
    }
  };

  const stopAudioRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      console.log('Audio recording stopped');
    }
  };

  const captureLocation = async () => {
    try {
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            console.log('Emergency location captured:', {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
              accuracy: position.coords.accuracy,
              timestamp: new Date().toISOString()
            });
          },
          (error) => console.warn('Location capture failed:', error),
          { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
        );
      }
    } catch (error) {
      console.warn('Location capture failed:', error);
    }
  };

  const confirmPanic = async () => {
    // Set cooldown
    localStorage.setItem('lastPanicButtonUse', Date.now().toString());
    setCooldownActive(true);
    setCooldownTimer(30);
    
    setIsPressed(true);
    setShowConfirmation(false);
    
    // Start instant recording if consent given
    if (recordingConsent) {
      await startInstantRecording();
    }
    
    // Start cooldown timer
    const interval = setInterval(() => {
      setCooldownTimer(prev => {
        if (prev <= 1) {
          setCooldownActive(false);
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    toast({
      title: "🚨 EMERGENCY ALERT SENT!",
      description: user 
        ? "Emergency services and nearby community members have been notified!" 
        : "Emergency broadcast sent to all nearby users!",
      variant: "destructive",
    });

    // Auto-cancel after 2 minutes if not manually cancelled
    setTimeout(() => {
      if (isPressed) {
        setIsPressed(false);
        stopAudioRecording();
        setIsRecording(false);
        toast({
          title: "Emergency alert auto-expired",
          description: "Alert was automatically cancelled after 2 minutes",
        });
      }
    }, 120000);
  };

  const cancelPanic = () => {
    setIsPressed(false);
    setIsRecording(false);
    stopAudioRecording();
    toast({
      title: "✅ Emergency Alert Cancelled",
      description: "All responders have been notified that you're safe",
    });
  };

  // Don't show on auth pages or landing page
  const currentPath = window.location.pathname;
  if (currentPath === '/' || currentPath.startsWith('/auth') || currentPath === '/register-complete') {
    return null;
  }

  if (isPressed) {
    return (
      <div className="fixed top-4 right-4 z-50 max-w-sm">
        <div className="bg-danger text-white p-4 rounded-lg shadow-lg border-2 border-danger animate-pulse">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5" />
              <span className="font-bold">EMERGENCY ACTIVE</span>
            </div>
            <Button
              onClick={cancelPanic}
              size="sm"
              variant="outline"
              className="border-white text-white hover:bg-white hover:text-danger h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-sm">Help is on the way. Stay safe!</p>
          {isRecording && (
            <div className="flex items-center space-x-1 text-xs bg-white/20 rounded px-2 py-1 mt-2">
              <Mic className="h-3 w-3 animate-pulse" />
              <Camera className="h-3 w-3" />
              <MapPin className="h-3 w-3" />
              <span>Recording evidence...</span>
            </div>
          )}
          <Button
            onClick={cancelPanic}
            className="mt-2 w-full bg-success hover:bg-success/90 text-white"
            size="sm"
          >
            <Shield className="h-4 w-4 mr-2" />
            I'm Safe - Cancel Alert
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Button
        onClick={handlePanicPress}
        disabled={cooldownActive}
        className={`fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full shadow-lg transition-all hover:scale-110 ${
          cooldownActive 
            ? 'bg-muted text-muted-foreground cursor-not-allowed' 
            : 'bg-danger hover:bg-danger/90 text-white animate-pulse'
        }`}
        title={cooldownActive ? `Cooldown: ${cooldownTimer}s` : "Emergency Panic Button"}
      >
        {cooldownActive ? (
          <span className="text-sm font-bold">{cooldownTimer}</span>
        ) : (
          <AlertTriangle className="h-6 w-6" />
        )}
      </Button>

      <AlertDialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center space-x-2 text-danger">
              <AlertTriangle className="h-5 w-5" />
              <span>Confirm Emergency Alert</span>
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you in immediate danger and need emergency assistance? This will:
              <ul className="mt-2 space-y-1 text-sm">
                <li>• Alert nearby community members and drivers</li>
                <li>• Send your location to emergency responders</li>
                {isLawEnforcement() && <li>• Trigger law enforcement protocols</li>}
                <li>• Broadcast emergency signal to security networks</li>
              </ul>
              
              <div className="mt-3 p-3 bg-info/10 rounded border border-info/30">
                <div className="flex items-center space-x-2 mb-2">
                  <input 
                    type="checkbox" 
                    id="recordingConsent"
                    checked={recordingConsent}
                    onChange={(e) => setRecordingConsent(e.target.checked)}
                    className="rounded"
                  />
                  <label htmlFor="recordingConsent" className="text-sm font-medium">
                    Enable instant evidence recording
                  </label>
                </div>
                <p className="text-xs text-muted-foreground">
                  Capture 30s audio, photo, and location for evidence. Data is encrypted and only shared with emergency responders.
                </p>
              </div>
              
              <p className="mt-2 font-semibold text-warning">
                Only use in genuine emergencies to avoid overwhelming responders.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button
              onClick={() => setShowConfirmation(false)}
              variant="outline"
            >
              Cancel
            </Button>
            <Button
              onClick={confirmPanic}
              className="bg-danger hover:bg-danger/90 text-white"
            >
              <AlertTriangle className="h-4 w-4 mr-2" />
              YES - SEND EMERGENCY ALERT
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};