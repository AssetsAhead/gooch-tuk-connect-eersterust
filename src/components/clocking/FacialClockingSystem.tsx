import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useFacialClocking } from '@/hooks/useFacialClocking';
import {
  Camera,
  UserCheck,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Loader2,
  Play,
  Square,
  Route,
  History,
  ShieldCheck,
} from 'lucide-react';
import { format } from 'date-fns';

const FacialClockingSystem = () => {
  const {
    isProcessing,
    registration,
    clockings,
    lastResult,
    checkRegistration,
    registerFace,
    clockIn,
    fetchClockings,
  } = useFacialClocking();

  const [activeTab, setActiveTab] = useState('clock');

  useEffect(() => {
    checkRegistration();
    fetchClockings();
  }, [checkRegistration, fetchClockings]);

  return (
    <div className="space-y-4">
      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" />
            Facial Clocking System
          </CardTitle>
          <CardDescription>
            Verify your identity with facial recognition for shift and trip tracking
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="clock">
                <Clock className="h-4 w-4 mr-1" /> Clock
              </TabsTrigger>
              <TabsTrigger value="register">
                <UserCheck className="h-4 w-4 mr-1" /> Register
              </TabsTrigger>
              <TabsTrigger value="history">
                <History className="h-4 w-4 mr-1" /> History
              </TabsTrigger>
            </TabsList>

            <TabsContent value="clock" className="mt-4">
              {!registration ? (
                <div className="text-center py-8 space-y-3">
                  <AlertTriangle className="h-12 w-12 mx-auto text-yellow-500" />
                  <p className="text-muted-foreground">You need to register your face first</p>
                  <Button onClick={() => setActiveTab('register')}>Register Face</Button>
                </div>
              ) : (
                <ClockingPanel
                  isProcessing={isProcessing}
                  lastResult={lastResult}
                  onClock={clockIn}
                />
              )}
            </TabsContent>

            <TabsContent value="register" className="mt-4">
              <RegistrationPanel
                registration={registration}
                isProcessing={isProcessing}
                onRegister={registerFace}
              />
            </TabsContent>

            <TabsContent value="history" className="mt-4">
              <ClockingHistory clockings={clockings} onRefresh={fetchClockings} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

// Camera capture component
const CameraCapture = ({
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
      // Camera error handled silently
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
    return () => {
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, [stream]);

  return (
    <div className="space-y-3">
      <div className="relative aspect-[4/3] bg-muted rounded-lg overflow-hidden">
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          playsInline
          muted
          style={{ display: isStreaming ? 'block' : 'none' }}
        />
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
            <Camera className="h-4 w-4 mr-2" />
            Open Camera
          </Button>
        ) : (
          <>
            <Button onClick={capture} className="flex-1" disabled={isProcessing}>
              {isProcessing ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Camera className="h-4 w-4 mr-2" />
              )}
              {buttonLabel}
            </Button>
            <Button variant="outline" onClick={stopCamera}>
              Cancel
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

// Clocking panel
const ClockingPanel = ({
  isProcessing,
  lastResult,
  onClock,
}: {
  isProcessing: boolean;
  lastResult: any;
  onClock: (base64: string, type: 'shift_start' | 'shift_end' | 'trip_start' | 'trip_end') => void;
}) => {
  const [selectedType, setSelectedType] = useState<'shift_start' | 'shift_end' | 'trip_start' | 'trip_end'>('shift_start');

  const clockingOptions = [
    { value: 'shift_start' as const, label: 'Shift Start', icon: Play, color: 'text-green-500' },
    { value: 'shift_end' as const, label: 'Shift End', icon: Square, color: 'text-red-500' },
    { value: 'trip_start' as const, label: 'Trip Start', icon: Route, color: 'text-blue-500' },
    { value: 'trip_end' as const, label: 'Trip End', icon: CheckCircle, color: 'text-orange-500' },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-2">
        {clockingOptions.map((opt) => (
          <Button
            key={opt.value}
            variant={selectedType === opt.value ? 'default' : 'outline'}
            className="flex items-center gap-2 h-auto py-3"
            onClick={() => setSelectedType(opt.value)}
            disabled={isProcessing}
          >
            <opt.icon className={`h-4 w-4 ${selectedType === opt.value ? '' : opt.color}`} />
            {opt.label}
          </Button>
        ))}
      </div>

      <CameraCapture
        onCapture={(base64) => onClock(base64, selectedType)}
        isProcessing={isProcessing}
        buttonLabel={isProcessing ? 'Verifying...' : `Clock ${selectedType.replace('_', ' ')}`}
      />

      {lastResult && <VerificationResult result={lastResult} />}
    </div>
  );
};

// Registration panel
const RegistrationPanel = ({
  registration,
  isProcessing,
  onRegister,
}: {
  registration: any;
  isProcessing: boolean;
  onRegister: (base64: string) => void;
}) => (
  <div className="space-y-4">
    {registration && (
      <div className="flex items-center gap-2 p-3 rounded-lg border border-green-500/30 bg-green-500/5">
        <CheckCircle className="h-5 w-5 text-green-500" />
        <div>
          <p className="text-sm font-medium">Face Registered</p>
          <p className="text-xs text-muted-foreground">
            Registered {format(new Date(registration.registered_at), 'dd MMM yyyy HH:mm')}
          </p>
        </div>
      </div>
    )}
    <p className="text-sm text-muted-foreground">
      {registration
        ? 'You can re-register to update your reference photo.'
        : 'Take a clear photo of your face. This will be used to verify your identity when clocking.'}
    </p>
    <CameraCapture
      onCapture={onRegister}
      isProcessing={isProcessing}
      buttonLabel={isProcessing ? 'Registering...' : registration ? 'Update Face Photo' : 'Register Face'}
    />
  </div>
);

// Verification result display
const VerificationResult = ({ result }: { result: any }) => {
  if (result.error) {
    return (
      <div className="p-3 rounded-lg border border-destructive/30 bg-destructive/5">
        <div className="flex items-center gap-2">
          <XCircle className="h-5 w-5 text-destructive" />
          <span className="text-sm font-medium">{result.error}</span>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`p-3 rounded-lg border ${
        result.is_verified
          ? 'border-green-500/30 bg-green-500/5'
          : 'border-destructive/30 bg-destructive/5'
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {result.is_verified ? (
            <CheckCircle className="h-5 w-5 text-green-500" />
          ) : (
            <XCircle className="h-5 w-5 text-destructive" />
          )}
          <span className="text-sm font-medium">
            {result.is_verified ? 'Identity Verified' : 'Verification Failed'}
          </span>
        </div>
        <Badge variant={result.is_verified ? 'default' : 'destructive'}>
          {Math.round(result.confidence * 100)}%
        </Badge>
      </div>
      <p className="text-xs text-muted-foreground">{result.reason}</p>
      {result.is_flagged && result.fraud_indicators?.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {result.fraud_indicators.map((f: string, i: number) => (
            <Badge key={i} variant="outline" className="text-xs text-destructive">
              <AlertTriangle className="h-3 w-3 mr-1" />
              {f}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
};

// Clocking history
const ClockingHistory = ({
  clockings,
  onRefresh,
}: {
  clockings: any[];
  onRefresh: () => void;
}) => {
  const typeLabels: Record<string, string> = {
    shift_start: '🟢 Shift Start',
    shift_end: '🔴 Shift End',
    trip_start: '🔵 Trip Start',
    trip_end: '🟠 Trip End',
  };

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <p className="text-sm font-medium">Recent Clockings</p>
        <Button variant="ghost" size="sm" onClick={onRefresh}>
          Refresh
        </Button>
      </div>
      {clockings.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-4">No clockings yet</p>
      ) : (
        <div className="space-y-2 max-h-[400px] overflow-y-auto">
          {clockings.map((c) => (
            <div key={c.id} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <div>
                  <p className="text-sm font-medium">{typeLabels[c.clocking_type] || c.clocking_type}</p>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(c.clocked_at), 'dd MMM yyyy HH:mm')}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {c.is_flagged && (
                  <Badge variant="destructive" className="text-xs">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    Flagged
                  </Badge>
                )}
                {c.is_verified ? (
                  <Badge className="bg-green-500/10 text-green-600 text-xs">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    {Math.round((c.confidence_score || 0) * 100)}%
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-xs">
                    <XCircle className="h-3 w-3 mr-1" />
                    Unverified
                  </Badge>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FacialClockingSystem;
