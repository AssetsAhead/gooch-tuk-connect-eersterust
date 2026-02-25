import React, { useRef, useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Camera, Loader2 } from 'lucide-react';

export const CameraCapture = ({
  onCapture,
  isProcessing,
  buttonLabel = 'Capture',
}: {
  onCapture: (base64: string) => void;
  isProcessing: boolean;
  buttonLabel?: string;
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);

  const startCamera = useCallback(async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: 640, height: 480 },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        await videoRef.current.play();
      }
      setStream(mediaStream);
      setIsStreaming(true);
    } catch {
      // Camera error
    }
  }, []);

  const stopCamera = useCallback(() => {
    stream?.getTracks().forEach((t) => t.stop());
    setStream(null);
    setIsStreaming(false);
  }, [stream]);

  const capture = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;
    const canvas = canvasRef.current;
    canvas.width = 640;
    canvas.height = 480;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(videoRef.current, 0, 0, 640, 480);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
    const base64 = dataUrl.split(',')[1];
    stopCamera();
    onCapture(base64);
  }, [onCapture, stopCamera]);

  useEffect(() => {
    return () => { stream?.getTracks().forEach((t) => t.stop()); };
  }, [stream]);

  return (
    <div className="space-y-3">
      <div className="relative aspect-[4/3] bg-muted rounded-lg overflow-hidden">
        <video ref={videoRef} className="w-full h-full object-cover" playsInline muted style={{ display: isStreaming ? 'block' : 'none' }} />
        {!isStreaming && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Camera className="h-16 w-16 text-muted-foreground/30" />
          </div>
        )}
      </div>
      <canvas ref={canvasRef} className="hidden" />
      <div className="flex gap-2">
        {!isStreaming ? (
          <Button onClick={startCamera} className="flex-1" disabled={isProcessing}>
            <Camera className="h-4 w-4 mr-2" /> Open Camera
          </Button>
        ) : (
          <>
            <Button onClick={capture} className="flex-1" disabled={isProcessing}>
              {isProcessing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Camera className="h-4 w-4 mr-2" />}
              {buttonLabel}
            </Button>
            <Button variant="outline" onClick={stopCamera}>Cancel</Button>
          </>
        )}
      </div>
    </div>
  );
};
