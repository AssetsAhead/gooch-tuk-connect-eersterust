import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Video, 
  VideoOff, 
  Circle, 
  Square, 
  AlertTriangle,
  Shield,
  Eye,
  Camera,
  Wifi,
  WifiOff,
  Settings
} from 'lucide-react';
import { toast } from 'sonner';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface CameraConfig {
  id: string;
  name: string;
  position: 'cabin' | 'front' | 'rear';
  isActive: boolean;
  streamUrl?: string;
}

interface LiveVideoStreamingProps {
  cameraConfigs: CameraConfig[];
  onStreamStart: (cameraId: string) => void;
  onStreamStop: (cameraId: string) => void;
  onIncidentRecord: (cameraId: string, duration: number) => void;
  isDriver?: boolean;
}

export const LiveVideoStreaming: React.FC<LiveVideoStreamingProps> = ({
  cameraConfigs,
  onStreamStart,
  onStreamStop,
  onIncidentRecord,
  isDriver = false
}) => {
  const [activeStreams, setActiveStreams] = useState<Set<string>>(new Set());
  const [recording, setRecording] = useState<Set<string>>(new Set());
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'connecting'>('disconnected');
  const [streamQuality, setStreamQuality] = useState<'720p' | '1080p' | '480p'>('720p');
  const [autoIncidentDetection, setAutoIncidentDetection] = useState(true);
  const [recordingDuration, setRecordingDuration] = useState<{ [key: string]: number }>({});
  
  const videoRefs = useRef<{ [key: string]: HTMLVideoElement | null }>({});
  const mediaRecorders = useRef<{ [key: string]: MediaRecorder | null }>({});
  const recordingIntervals = useRef<{ [key: string]: NodeJS.Timeout }>({});

  useEffect(() => {
    // Simulate connection status
    setConnectionStatus('connecting');
    const timer = setTimeout(() => {
      setConnectionStatus('connected');
      toast.success('Live streaming system connected');
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const startStream = async (cameraId: string) => {
    try {
      setConnectionStatus('connecting');
      
      const constraints = {
        video: {
          width: streamQuality === '1080p' ? 1920 : streamQuality === '720p' ? 1280 : 640,
          height: streamQuality === '1080p' ? 1080 : streamQuality === '720p' ? 720 : 480,
          frameRate: 30
        },
        audio: true
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      if (videoRefs.current[cameraId]) {
        videoRefs.current[cameraId]!.srcObject = stream;
      }

      setActiveStreams(prev => new Set([...prev, cameraId]));
      setConnectionStatus('connected');
      onStreamStart(cameraId);
      
      toast.success(`Live stream started for ${cameraConfigs.find(c => c.id === cameraId)?.name}`);
    } catch (error) {
      console.error('Failed to start stream:', error);
      setConnectionStatus('disconnected');
      toast.error('Failed to start live stream');
    }
  };

  const stopStream = (cameraId: string) => {
    const video = videoRefs.current[cameraId];
    if (video?.srcObject) {
      const stream = video.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      video.srcObject = null;
    }

    setActiveStreams(prev => {
      const newSet = new Set(prev);
      newSet.delete(cameraId);
      return newSet;
    });

    onStreamStop(cameraId);
    toast.info(`Live stream stopped for ${cameraConfigs.find(c => c.id === cameraId)?.name}`);
  };

  const startIncidentRecording = async (cameraId: string) => {
    try {
      const video = videoRefs.current[cameraId];
      if (!video?.srcObject) {
        await startStream(cameraId);
        return;
      }

      const stream = video.srcObject as MediaStream;
      const recorder = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp9'
      });

      const chunks: BlobPart[] = [];
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        const duration = recordingDuration[cameraId] || 0;
        onIncidentRecord(cameraId, duration);
        
        // Create download link for incident footage
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `incident_${cameraId}_${new Date().toISOString()}.webm`;
        a.click();
        URL.revokeObjectURL(url);
      };

      recorder.start();
      mediaRecorders.current[cameraId] = recorder;
      
      setRecording(prev => new Set([...prev, cameraId]));
      setRecordingDuration(prev => ({ ...prev, [cameraId]: 0 }));

      // Start recording timer
      recordingIntervals.current[cameraId] = setInterval(() => {
        setRecordingDuration(prev => ({
          ...prev,
          [cameraId]: (prev[cameraId] || 0) + 1
        }));
      }, 1000);

      toast.success('Incident recording started');
    } catch (error) {
      console.error('Failed to start recording:', error);
      toast.error('Failed to start incident recording');
    }
  };

  const stopIncidentRecording = (cameraId: string) => {
    const recorder = mediaRecorders.current[cameraId];
    if (recorder && recorder.state === 'recording') {
      recorder.stop();
    }

    if (recordingIntervals.current[cameraId]) {
      clearInterval(recordingIntervals.current[cameraId]);
      delete recordingIntervals.current[cameraId];
    }

    setRecording(prev => {
      const newSet = new Set(prev);
      newSet.delete(cameraId);
      return newSet;
    });

    mediaRecorders.current[cameraId] = null;
    toast.success('Incident recording saved');
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getConnectionBadge = () => {
    switch (connectionStatus) {
      case 'connected':
        return <Badge variant="default" className="gap-1"><Wifi className="h-3 w-3" />Connected</Badge>;
      case 'connecting':
        return <Badge variant="secondary" className="gap-1">Connecting...</Badge>;
      default:
        return <Badge variant="destructive" className="gap-1"><WifiOff className="h-3 w-3" />Disconnected</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Control Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Video className="h-5 w-5" />
              Live Video Streaming System
            </div>
            {getConnectionBadge()}
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Stream Settings */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="stream-quality">Stream Quality</Label>
              <Select value={streamQuality} onValueChange={(value: '720p' | '1080p' | '480p') => setStreamQuality(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="480p">480p (Data Saver)</SelectItem>
                  <SelectItem value="720p">720p (Recommended)</SelectItem>
                  <SelectItem value="1080p">1080p (High Quality)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="auto-incident">Auto Incident Detection</Label>
                <p className="text-xs text-muted-foreground">Automatically record during emergencies</p>
              </div>
              <Switch
                id="auto-incident"
                checked={autoIncidentDetection}
                onCheckedChange={setAutoIncidentDetection}
              />
            </div>
          </div>

          {/* Global Controls */}
          <div className="flex flex-wrap gap-2">
            <Button 
              onClick={() => cameraConfigs.forEach(config => {
                if (!activeStreams.has(config.id)) startStream(config.id);
              })}
              disabled={connectionStatus !== 'connected'}
              variant="default"
            >
              <Video className="h-4 w-4 mr-2" />
              Start All Streams
            </Button>
            
            <Button 
              onClick={() => activeStreams.forEach(cameraId => stopStream(cameraId))}
              variant="outline"
            >
              <VideoOff className="h-4 w-4 mr-2" />
              Stop All Streams
            </Button>

            {isDriver && (
              <Button 
                onClick={() => cameraConfigs.forEach(config => {
                  if (activeStreams.has(config.id) && !recording.has(config.id)) {
                    startIncidentRecording(config.id);
                  }
                })}
                variant="destructive"
                className="gap-2"
              >
                <AlertTriangle className="h-4 w-4" />
                Emergency Record All
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Camera Feeds */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {cameraConfigs.map((camera) => (
          <Card key={camera.id}>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between text-base">
                <div className="flex items-center gap-2">
                  <Camera className="h-4 w-4" />
                  {camera.name}
                  <Badge variant="outline" className="text-xs">
                    {camera.position}
                  </Badge>
                </div>
                
                <div className="flex items-center gap-2">
                  {activeStreams.has(camera.id) && (
                    <Badge variant="default" className="gap-1">
                      <Eye className="h-3 w-3" />
                      Live
                    </Badge>
                  )}
                  {recording.has(camera.id) && (
                    <Badge variant="destructive" className="gap-1 animate-pulse">
                      <Circle className="h-3 w-3 fill-current" />
                      REC
                    </Badge>
                  )}
                </div>
              </CardTitle>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Video Preview */}
              <div className="relative">
                <video
                  ref={(el) => { videoRefs.current[camera.id] = el; }}
                  autoPlay
                  muted
                  playsInline
                  className="w-full h-48 object-cover rounded-lg bg-muted"
                  style={{ display: activeStreams.has(camera.id) ? 'block' : 'none' }}
                />
                
                {!activeStreams.has(camera.id) && (
                  <div className="w-full h-48 rounded-lg bg-muted flex items-center justify-center">
                    <div className="text-center text-muted-foreground">
                      <VideoOff className="h-8 w-8 mx-auto mb-2" />
                      <p className="text-sm">Camera Offline</p>
                    </div>
                  </div>
                )}

                {/* Recording Overlay */}
                {recording.has(camera.id) && (
                  <div className="absolute top-2 left-2 bg-red-600 text-white px-2 py-1 rounded text-xs font-medium flex items-center gap-1">
                    <Circle className="h-3 w-3 fill-current animate-pulse" />
                    {formatDuration(recordingDuration[camera.id] || 0)}
                  </div>
                )}

                {/* Stream Quality Indicator */}
                {activeStreams.has(camera.id) && (
                  <div className="absolute top-2 right-2 bg-black/50 text-white px-2 py-1 rounded text-xs">
                    {streamQuality}
                  </div>
                )}
              </div>

              {/* Camera Controls */}
              <div className="flex flex-wrap gap-2">
                {!activeStreams.has(camera.id) ? (
                  <Button 
                    onClick={() => startStream(camera.id)}
                    disabled={connectionStatus !== 'connected'}
                    size="sm"
                    className="flex-1"
                  >
                    <Video className="h-4 w-4 mr-2" />
                    Start Stream
                  </Button>
                ) : (
                  <Button 
                    onClick={() => stopStream(camera.id)}
                    variant="outline"
                    size="sm"
                    className="flex-1"
                  >
                    <VideoOff className="h-4 w-4 mr-2" />
                    Stop Stream
                  </Button>
                )}

                {activeStreams.has(camera.id) && (
                  <>
                    {!recording.has(camera.id) ? (
                      <Button 
                        onClick={() => startIncidentRecording(camera.id)}
                        variant="destructive"
                        size="sm"
                      >
                        <Circle className="h-4 w-4 mr-2" />
                        Record
                      </Button>
                    ) : (
                      <Button 
                        onClick={() => stopIncidentRecording(camera.id)}
                        variant="outline"
                        size="sm"
                      >
                        <Square className="h-4 w-4 mr-2" />
                        Stop
                      </Button>
                    )}
                  </>
                )}
              </div>

              {/* Camera Status */}
              <div className="text-xs text-muted-foreground space-y-1">
                <div className="flex justify-between">
                  <span>Status:</span>
                  <span>{activeStreams.has(camera.id) ? 'Streaming' : 'Offline'}</span>
                </div>
                {recording.has(camera.id) && (
                  <div className="flex justify-between">
                    <span>Recording:</span>
                    <span className="text-red-600 font-medium">
                      {formatDuration(recordingDuration[camera.id] || 0)}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* System Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Security & Monitoring Status
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="space-y-2">
              <div className="text-2xl font-bold text-primary">{activeStreams.size}</div>
              <div className="text-sm text-muted-foreground">Active Streams</div>
            </div>
            
            <div className="space-y-2">
              <div className="text-2xl font-bold text-green-600">{cameraConfigs.length}</div>
              <div className="text-sm text-muted-foreground">Total Cameras</div>
            </div>
            
            <div className="space-y-2">
              <div className="text-2xl font-bold text-red-600">{recording.size}</div>
              <div className="text-sm text-muted-foreground">Recording</div>
            </div>
            
            <div className="space-y-2">
              <div className="text-2xl font-bold text-blue-600">{streamQuality}</div>
              <div className="text-sm text-muted-foreground">Quality</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};