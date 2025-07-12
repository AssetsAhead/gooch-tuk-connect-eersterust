import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Camera, CameraResultType, CameraSource, Photo } from '@capacitor/camera';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Camera as CameraIcon, 
  RotateCcw, 
  Zap, 
  ZapOff, 
  Grid3X3, 
  Focus,
  Video,
  Settings,
  Eye,
  EyeOff
} from 'lucide-react';
import { toast } from 'sonner';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface CameraSettings {
  quality: number;
  allowEditing: boolean;
  saveToGallery: boolean;
  flash: boolean;
  gridLines: boolean;
  autoFocus: boolean;
}

interface EnhancedCameraCaptureProps {
  onPhotoCapture: (photo: Photo | File) => void;
  title?: string;
  description?: string;
  multiCamera?: boolean; // For future bike camera integration
  cameraType?: 'front' | 'rear' | 'cabin'; // For bike camera types
}

export const EnhancedCameraCapture: React.FC<EnhancedCameraCaptureProps> = ({
  onPhotoCapture,
  title = "Camera Capture",
  description = "Take a photo using your device camera",
  multiCamera = false,
  cameraType = 'rear'
}) => {
  const [isCapturing, setIsCapturing] = useState(false);
  const [lastPhoto, setLastPhoto] = useState<string | null>(null);
  const [settings, setSettings] = useState<CameraSettings>({
    quality: 90,
    allowEditing: false,
    saveToGallery: false,
    flash: false,
    gridLines: true,
    autoFocus: true
  });
  const [cameraPermission, setCameraPermission] = useState<'granted' | 'denied' | 'prompt'>('prompt');
  const [isWebCamera, setIsWebCamera] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    checkCameraPermission();
    detectWebCamera();
    
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const checkCameraPermission = async () => {
    try {
      const result = await navigator.permissions.query({ name: 'camera' as PermissionName });
      setCameraPermission(result.state);
      
      result.addEventListener('change', () => {
        setCameraPermission(result.state);
      });
    } catch (error) {
      console.log('Permission API not supported, defaulting to prompt');
    }
  };

  const detectWebCamera = () => {
    setIsWebCamera(!('Camera' in window) || !(window as any).Capacitor?.isNativePlatform());
  };

  const capturePhoto = async () => {
    setIsCapturing(true);
    
    try {
      if (isWebCamera) {
        await captureWebPhoto();
      } else {
        await captureNativePhoto();
      }
    } catch (error) {
      console.error('Photo capture failed:', error);
      toast.error('Failed to capture photo. Please try again.');
    } finally {
      setIsCapturing(false);
    }
  };

  const captureNativePhoto = async () => {
    try {
      const photo = await Camera.getPhoto({
        quality: settings.quality,
        allowEditing: settings.allowEditing,
        resultType: CameraResultType.Uri,
        source: CameraSource.Camera,
        saveToGallery: settings.saveToGallery,
        direction: cameraType === 'front' ? 'FRONT' as any : 'REAR' as any,
      });

      setLastPhoto(photo.webPath || '');
      onPhotoCapture(photo);
      toast.success('Photo captured successfully!');
    } catch (error: any) {
      if (error.message?.includes('cancelled')) {
        toast.info('Photo capture cancelled');
      } else {
        throw error;
      }
    }
  };

  const captureWebPhoto = async () => {
    if (!videoRef.current || !canvasRef.current) {
      // Fallback to file input
      fileInputRef.current?.click();
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) {
      throw new Error('Canvas context not available');
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0);

    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], `photo_${Date.now()}.jpg`, { type: 'image/jpeg' });
        setLastPhoto(URL.createObjectURL(blob));
        onPhotoCapture(file);
        toast.success('Photo captured successfully!');
      }
    }, 'image/jpeg', settings.quality / 100);
  };

  const startWebCamera = async () => {
    try {
      const constraints = {
        video: {
          facingMode: cameraType === 'front' ? 'user' : 'environment',
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      };

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(mediaStream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      
      setCameraPermission('granted');
    } catch (error) {
      console.error('Camera access failed:', error);
      setCameraPermission('denied');
      toast.error('Camera access denied or not available');
    }
  };

  const handleFileInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setLastPhoto(URL.createObjectURL(file));
      onPhotoCapture(file);
      toast.success('Photo selected successfully!');
    }
  };

  const updateSetting = <K extends keyof CameraSettings>(key: K, value: CameraSettings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    
    const settingNames = {
      quality: 'Photo Quality',
      allowEditing: 'Allow Editing',
      saveToGallery: 'Save to Gallery',
      flash: 'Flash',
      gridLines: 'Grid Lines',
      autoFocus: 'Auto Focus'
    };
    
    toast.success(`${settingNames[key]} ${typeof value === 'boolean' ? (value ? 'enabled' : 'disabled') : 'updated'}`);
  };

  const getCameraStatusBadge = () => {
    switch (cameraPermission) {
      case 'granted':
        return <Badge variant="default" className="gap-1"><Eye className="h-3 w-3" />Ready</Badge>;
      case 'denied':
        return <Badge variant="destructive" className="gap-1"><EyeOff className="h-3 w-3" />Denied</Badge>;
      default:
        return <Badge variant="secondary" className="gap-1">Checking...</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CameraIcon className="h-5 w-5" />
            {title}
            {multiCamera && (
              <Badge variant="outline" className="text-xs">
                {cameraType.charAt(0).toUpperCase() + cameraType.slice(1)}
              </Badge>
            )}
          </div>
          {getCameraStatusBadge()}
        </CardTitle>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Camera Preview for Web */}
        {isWebCamera && cameraPermission === 'granted' && (
          <div className="relative">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-64 object-cover rounded-lg bg-muted"
              style={{ display: stream ? 'block' : 'none' }}
            />
            <canvas ref={canvasRef} className="hidden" />
            
            {settings.gridLines && (
              <div className="absolute inset-0 pointer-events-none">
                <div className="w-full h-full grid grid-cols-3 grid-rows-3 opacity-30">
                  {Array.from({ length: 9 }).map((_, i) => (
                    <div key={i} className="border border-white"></div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Last Captured Photo */}
        {lastPhoto && (
          <div className="space-y-2">
            <Label className="text-sm font-medium">Last Captured</Label>
            <img 
              src={lastPhoto} 
              alt="Last captured" 
              className="w-full h-48 object-cover rounded-lg border"
            />
          </div>
        )}

        {/* Camera Controls */}
        <div className="flex flex-col gap-4">
          {isWebCamera && cameraPermission !== 'granted' && (
            <Button onClick={startWebCamera} variant="outline" className="w-full">
              <CameraIcon className="h-4 w-4 mr-2" />
              Start Camera
            </Button>
          )}

          <Button 
            onClick={capturePhoto}
            disabled={isCapturing || (isWebCamera && !stream && cameraPermission !== 'granted')}
            className="w-full"
            size="lg"
          >
            {isCapturing ? (
              "Capturing..."
            ) : (
              <>
                <CameraIcon className="h-5 w-5 mr-2" />
                Capture Photo
              </>
            )}
          </Button>

          {/* Fallback File Input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFileInput}
            className="hidden"
          />
          
          <Button 
            onClick={() => fileInputRef.current?.click()} 
            variant="outline"
            className="w-full"
          >
            Choose from Gallery
          </Button>
        </div>

        <Separator />

        {/* Camera Settings */}
        <div className="space-y-4">
          <Label className="text-base font-medium flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Camera Settings
          </Label>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="allow-editing">Allow Editing</Label>
                <p className="text-xs text-muted-foreground">Edit photos before saving</p>
              </div>
              <Switch
                id="allow-editing"
                checked={settings.allowEditing}
                onCheckedChange={(checked) => updateSetting('allowEditing', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="save-gallery">Save to Gallery</Label>
                <p className="text-xs text-muted-foreground">Automatically save captured photos</p>
              </div>
              <Switch
                id="save-gallery"
                checked={settings.saveToGallery}
                onCheckedChange={(checked) => updateSetting('saveToGallery', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Grid3X3 className="h-4 w-4" />
                <Label htmlFor="grid-lines">Grid Lines</Label>
              </div>
              <Switch
                id="grid-lines"
                checked={settings.gridLines}
                onCheckedChange={(checked) => updateSetting('gridLines', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Focus className="h-4 w-4" />
                <Label htmlFor="auto-focus">Auto Focus</Label>
              </div>
              <Switch
                id="auto-focus"
                checked={settings.autoFocus}
                onCheckedChange={(checked) => updateSetting('autoFocus', checked)}
              />
            </div>
          </div>
        </div>

        {/* Future Multi-Camera Support */}
        {multiCamera && (
          <>
            <Separator />
            <div className="space-y-4">
              <Label className="text-base font-medium flex items-center gap-2">
                <Video className="h-4 w-4" />
                Multi-Camera Support
              </Label>
              
              <div className="grid grid-cols-1 gap-2 text-sm text-muted-foreground">
                <div className="flex items-center justify-between p-2 rounded bg-muted/50">
                  <span>Front Camera</span>
                  <Badge variant="outline">Ready</Badge>
                </div>
                <div className="flex items-center justify-between p-2 rounded bg-muted/50">
                  <span>Rear Camera</span>
                  <Badge variant="outline">Ready</Badge>
                </div>
                <div className="flex items-center justify-between p-2 rounded bg-muted/30">
                  <span>Cabin Camera</span>
                  <Badge variant="secondary">Future</Badge>
                </div>
              </div>
              
              <p className="text-xs text-muted-foreground">
                Multi-camera setup will enable front, rear, and in-cabin monitoring for enhanced security and safety.
              </p>
            </div>
          </>
        )}

        {/* Status Information */}
        <div className="rounded-lg bg-muted/50 p-3 text-sm">
          <div className="flex items-center justify-between">
            <span>Camera Type:</span>
            <span className="text-muted-foreground">{isWebCamera ? 'Web Camera' : 'Native Camera'}</span>
          </div>
          <div className="flex items-center justify-between mt-1">
            <span>Quality:</span>
            <span className="text-muted-foreground">{settings.quality}%</span>
          </div>
          <div className="flex items-center justify-between mt-1">
            <span>Auto Save:</span>
            <Badge variant={settings.saveToGallery ? "default" : "secondary"} className="text-xs">
              {settings.saveToGallery ? "Enabled" : "Disabled"}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};