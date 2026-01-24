import { useState, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useALPR } from '@/hooks/useALPR';
import { useAIIncidentDetection } from '@/hooks/useAIIncidentDetection';
import { 
  Video, 
  Camera, 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward,
  ScanLine,
  AlertTriangle,
  Image,
  Trash2,
  Download
} from 'lucide-react';

interface ExtractedFrame {
  id: string;
  timestamp: number;
  dataUrl: string;
  analyzed: boolean;
  alprResult?: any;
  incidentResult?: any;
}

interface VideoFrameExtractorProps {
  onFrameAnalyzed?: (frame: ExtractedFrame) => void;
}

export const VideoFrameExtractor = ({ onFrameAnalyzed }: VideoFrameExtractorProps) => {
  const [videoSrc, setVideoSrc] = useState<string | null>(null);
  const [videoName, setVideoName] = useState<string>('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [extractedFrames, setExtractedFrames] = useState<ExtractedFrame[]>([]);
  const [selectedFrame, setSelectedFrame] = useState<ExtractedFrame | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { toast } = useToast();
  const { recognizePlate, isProcessing: isALPRProcessing } = useALPR();
  const { analyzeImage, isAnalyzing } = useAIIncidentDetection();

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('video/')) {
      toast({
        title: 'Invalid File',
        description: 'Please upload a video file',
        variant: 'destructive'
      });
      return;
    }

    const url = URL.createObjectURL(file);
    setVideoSrc(url);
    setVideoName(file.name);
    setExtractedFrames([]);
    setSelectedFrame(null);
    
    toast({
      title: 'Video Loaded',
      description: `${file.name} ready for frame extraction`
    });
  }, [toast]);

  const handleVideoLoaded = useCallback(() => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  }, []);

  const handleTimeUpdate = useCallback(() => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  }, []);

  const togglePlayPause = useCallback(() => {
    if (!videoRef.current) return;
    
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setIsPlaying(!isPlaying);
  }, [isPlaying]);

  const seekVideo = useCallback((value: number[]) => {
    if (videoRef.current) {
      videoRef.current.currentTime = value[0];
      setCurrentTime(value[0]);
    }
  }, []);

  const stepFrame = useCallback((direction: 'forward' | 'backward') => {
    if (!videoRef.current) return;
    const frameTime = 1 / 30; // Assume 30fps
    const newTime = direction === 'forward' 
      ? Math.min(videoRef.current.currentTime + frameTime, duration)
      : Math.max(videoRef.current.currentTime - frameTime, 0);
    videoRef.current.currentTime = newTime;
  }, [duration]);

  const captureFrame = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return;

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Draw current frame
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Get data URL
    const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
    
    const frame: ExtractedFrame = {
      id: `frame-${Date.now()}`,
      timestamp: video.currentTime,
      dataUrl,
      analyzed: false
    };
    
    setExtractedFrames(prev => [...prev, frame]);
    setSelectedFrame(frame);
    
    toast({
      title: '📸 Frame Captured',
      description: `At ${formatTime(video.currentTime)}`
    });
  }, [toast]);

  const analyzeFrameALPR = useCallback(async (frame: ExtractedFrame) => {
    // Convert data URL to base64
    const base64 = frame.dataUrl.split(',')[1];
    
    const result = await recognizePlate({ imageBase64: base64 });
    
    setExtractedFrames(prev => prev.map(f => 
      f.id === frame.id 
        ? { ...f, analyzed: true, alprResult: result }
        : f
    ));
    
    if (selectedFrame?.id === frame.id) {
      setSelectedFrame(prev => prev ? { ...prev, analyzed: true, alprResult: result } : null);
    }
    
    onFrameAnalyzed?.({ ...frame, alprResult: result });
  }, [recognizePlate, selectedFrame, onFrameAnalyzed]);

  const analyzeFrameIncident = useCallback(async (frame: ExtractedFrame) => {
    const result = await analyzeImage(frame.dataUrl);
    
    setExtractedFrames(prev => prev.map(f => 
      f.id === frame.id 
        ? { ...f, analyzed: true, incidentResult: result }
        : f
    ));
    
    if (selectedFrame?.id === frame.id) {
      setSelectedFrame(prev => prev ? { ...prev, analyzed: true, incidentResult: result } : null);
    }
    
    onFrameAnalyzed?.({ ...frame, incidentResult: result });
  }, [analyzeImage, selectedFrame, onFrameAnalyzed]);

  const deleteFrame = useCallback((frameId: string) => {
    setExtractedFrames(prev => prev.filter(f => f.id !== frameId));
    if (selectedFrame?.id === frameId) {
      setSelectedFrame(null);
    }
  }, [selectedFrame]);

  const downloadFrame = useCallback((frame: ExtractedFrame) => {
    const link = document.createElement('a');
    link.href = frame.dataUrl;
    link.download = `frame-${formatTime(frame.timestamp).replace(/:/g, '-')}.jpg`;
    link.click();
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 100);
    return `${mins}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Video className="h-5 w-5" />
            Video Frame Extractor
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* File Upload */}
          <div className="flex items-center gap-4">
            <input
              ref={fileInputRef}
              type="file"
              accept="video/*"
              onChange={handleFileUpload}
              className="hidden"
            />
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
            >
              <Video className="h-4 w-4 mr-2" />
              Load Video
            </Button>
            {videoName && (
              <Badge variant="secondary">{videoName}</Badge>
            )}
          </div>

          {/* Video Player */}
          {videoSrc && (
            <div className="space-y-4">
              <div className="relative bg-black rounded-lg overflow-hidden">
                <video
                  ref={videoRef}
                  src={videoSrc}
                  className="w-full max-h-[400px] object-contain"
                  onLoadedMetadata={handleVideoLoaded}
                  onTimeUpdate={handleTimeUpdate}
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                />
              </div>

              {/* Controls */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>{formatTime(currentTime)}</span>
                  <Slider
                    value={[currentTime]}
                    max={duration}
                    step={0.01}
                    onValueChange={seekVideo}
                    className="flex-1"
                  />
                  <span>{formatTime(duration)}</span>
                </div>

                <div className="flex items-center justify-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => stepFrame('backward')}
                  >
                    <SkipBack className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={togglePlayPause}
                  >
                    {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => stepFrame('forward')}
                  >
                    <SkipForward className="h-4 w-4" />
                  </Button>
                  <div className="w-4" />
                  <Button onClick={captureFrame}>
                    <Camera className="h-4 w-4 mr-2" />
                    Capture Frame
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Hidden canvas for frame capture */}
          <canvas ref={canvasRef} className="hidden" />
        </CardContent>
      </Card>

      {/* Extracted Frames */}
      {extractedFrames.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Image className="h-5 w-5" />
              Extracted Frames ({extractedFrames.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {extractedFrames.map((frame) => (
                <div
                  key={frame.id}
                  className={`relative group cursor-pointer rounded-lg overflow-hidden border-2 transition-colors ${
                    selectedFrame?.id === frame.id 
                      ? 'border-primary' 
                      : 'border-transparent hover:border-muted-foreground'
                  }`}
                  onClick={() => setSelectedFrame(frame)}
                >
                  <img
                    src={frame.dataUrl}
                    alt={`Frame at ${formatTime(frame.timestamp)}`}
                    className="w-full aspect-video object-cover"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-black/70 px-2 py-1 text-xs text-white">
                    {formatTime(frame.timestamp)}
                  </div>
                  {frame.analyzed && (
                    <div className="absolute top-1 right-1">
                      <Badge variant="secondary" className="text-xs">
                        Analyzed
                      </Badge>
                    </div>
                  )}
                  <div className="absolute top-1 left-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="destructive"
                      size="icon"
                      className="h-6 w-6"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteFrame(frame.id);
                      }}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Selected Frame Analysis */}
      {selectedFrame && (
        <Card>
          <CardHeader>
            <CardTitle>Frame Analysis</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <img
                  src={selectedFrame.dataUrl}
                  alt="Selected frame"
                  className="w-full rounded-lg"
                />
                <p className="text-sm text-muted-foreground mt-2">
                  Captured at {formatTime(selectedFrame.timestamp)}
                </p>
              </div>
              
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  <Button
                    onClick={() => analyzeFrameALPR(selectedFrame)}
                    disabled={isALPRProcessing}
                  >
                    <ScanLine className="h-4 w-4 mr-2" />
                    {isALPRProcessing ? 'Scanning...' : 'ALPR Scan'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => analyzeFrameIncident(selectedFrame)}
                    disabled={isAnalyzing}
                  >
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    {isAnalyzing ? 'Analyzing...' : 'Incident Detection'}
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => downloadFrame(selectedFrame)}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>

                {/* ALPR Results */}
                {selectedFrame.alprResult && (
                  <div className="p-4 bg-muted rounded-lg">
                    <h4 className="font-medium mb-2">🚗 ALPR Results</h4>
                    {selectedFrame.alprResult.plates_detected > 0 ? (
                      <div className="space-y-2">
                        {selectedFrame.alprResult.plates.map((plate: any, i: number) => (
                          <div key={i} className="flex items-center gap-2">
                            <Badge variant="default" className="font-mono text-lg">
                              {plate.plate_number}
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                              {plate.province || 'Unknown'} • {Math.round(plate.confidence * 100)}%
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground">No plates detected</p>
                    )}
                  </div>
                )}

                {/* Incident Results */}
                {selectedFrame.incidentResult?.analysis && (
                  <div className="p-4 bg-muted rounded-lg">
                    <h4 className="font-medium mb-2">🚨 Incident Analysis</h4>
                    {selectedFrame.incidentResult.analysis.incident_detected ? (
                      <div className="space-y-2">
                        <Badge 
                          variant={
                            selectedFrame.incidentResult.analysis.severity === 'critical' 
                              ? 'destructive' 
                              : 'secondary'
                          }
                        >
                          {selectedFrame.incidentResult.analysis.incident_type} - {selectedFrame.incidentResult.analysis.severity}
                        </Badge>
                        <p className="text-sm">{selectedFrame.incidentResult.analysis.description}</p>
                      </div>
                    ) : (
                      <p className="text-muted-foreground">No incidents detected</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {!videoSrc && (
        <div className="text-center py-12 text-muted-foreground">
          <Video className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Upload a video to extract frames for ALPR and incident analysis</p>
        </div>
      )}
    </div>
  );
};
