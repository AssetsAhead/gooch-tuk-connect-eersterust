import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Camera,
  Video,
  Settings,
  Shield,
  Archive,
  Download,
  Eye,
  Calendar,
  Clock,
  MapPin,
  Car,
  ScanLine,
  CheckCircle2,
  XCircle,
  Loader2,
  Upload
} from 'lucide-react';
import { toast } from 'sonner';
import { LiveVideoStreaming } from './LiveVideoStreaming';
import { EnhancedCameraCapture } from './EnhancedCameraCapture';
import { VideoFrameExtractor } from './VideoFrameExtractor';
import { useALPR, PlateResult } from '@/hooks/useALPR';

interface IncidentRecording {
  id: string;
  cameraId: string;
  timestamp: Date;
  duration: number;
  location?: string;
  type: 'manual' | 'automatic' | 'emergency';
  fileSize: string;
  isProcessed: boolean;
}

interface CameraConfig {
  id: string;
  name: string;
  position: 'cabin' | 'front' | 'rear';
  isActive: boolean;
  streamUrl?: string;
}

interface CameraManagementSystemProps {
  userRole: 'driver' | 'passenger' | 'admin' | 'owner';
  vehicleId?: string;
}

export const CameraManagementSystem: React.FC<CameraManagementSystemProps> = ({
  userRole,
  vehicleId
}) => {
  const { recognizePlate, isProcessing, lastResult } = useALPR();
  const [alprImage, setAlprImage] = useState<string | null>(null);
  const [plateHistory, setPlateHistory] = useState<PlateResult[]>([]);
  const alprFileInputRef = useRef<HTMLInputElement>(null);
  const [cameraConfigs] = useState<CameraConfig[]>([
    {
      id: 'cabin-cam',
      name: 'Cabin Camera',
      position: 'cabin',
      isActive: true
    },
    {
      id: 'front-cam',
      name: 'Front Camera',
      position: 'front',
      isActive: true
    },
    {
      id: 'rear-cam',
      name: 'Rear Camera',
      position: 'rear',
      isActive: false
    }
  ]);

  const [incidentRecordings, setIncidentRecordings] = useState<IncidentRecording[]>([
    {
      id: 'rec-001',
      cameraId: 'cabin-cam',
      timestamp: new Date(Date.now() - 3600000),
      duration: 45,
      location: 'Taxi Rank, Johannesburg',
      type: 'manual',
      fileSize: '156 MB',
      isProcessed: true
    },
    {
      id: 'rec-002',
      cameraId: 'front-cam',
      timestamp: new Date(Date.now() - 7200000),
      duration: 120,
      location: 'N1 Highway',
      type: 'automatic',
      fileSize: '324 MB',
      isProcessed: false
    }
  ]);

  const handleStreamStart = (cameraId: string) => {
    console.log(`Stream started for camera: ${cameraId}`);
    toast.success(`${cameraConfigs.find(c => c.id === cameraId)?.name} stream started`);
  };

  const handleStreamStop = (cameraId: string) => {
    console.log(`Stream stopped for camera: ${cameraId}`);
  };

  const handleIncidentRecord = (cameraId: string, duration: number) => {
    const newRecording: IncidentRecording = {
      id: `rec-${Date.now()}`,
      cameraId,
      timestamp: new Date(),
      duration,
      location: 'Current Location',
      type: 'manual',
      fileSize: `${Math.round(duration * 2.3)} MB`,
      isProcessed: false
    };

    setIncidentRecordings(prev => [newRecording, ...prev]);
    toast.success('Incident recording saved successfully');
  };

  const handlePhotoCapture = (photo: any) => {
    toast.success('Photo captured and saved');
    console.log('Photo captured:', photo);
  };

  const downloadRecording = (recording: IncidentRecording) => {
    // Simulate download
    toast.success(`Downloading ${recording.id}...`);
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const getIncidentTypeColor = (type: string) => {
    switch (type) {
      case 'emergency': return 'destructive';
      case 'automatic': return 'default';
      default: return 'secondary';
    }
  };

  const canAccessFeature = (feature: string) => {
    const permissions = {
      driver: ['view', 'record', 'download'],
      passenger: ['view'],
      admin: ['view', 'record', 'download', 'manage'],
      owner: ['view', 'record', 'download', 'manage']
    };
    
    return permissions[userRole]?.includes(feature) || false;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5" />
            Camera Management System
            <Badge variant="outline">{userRole}</Badge>
          </CardTitle>
        </CardHeader>
      </Card>

      <Tabs defaultValue="live-stream" className="space-y-6">
        <TabsList className="grid grid-cols-6 w-full">
          <TabsTrigger value="live-stream" className="flex items-center gap-2">
            <Video className="h-4 w-4" />
            <span className="hidden sm:inline">Live</span>
          </TabsTrigger>
          <TabsTrigger value="video-frames" className="flex items-center gap-2">
            <ScanLine className="h-4 w-4" />
            <span className="hidden sm:inline">Video</span>
          </TabsTrigger>
          <TabsTrigger value="alpr" className="flex items-center gap-2">
            <Car className="h-4 w-4" />
            <span className="hidden sm:inline">ALPR</span>
          </TabsTrigger>
          <TabsTrigger value="photo-capture" className="flex items-center gap-2">
            <Camera className="h-4 w-4" />
            <span className="hidden sm:inline">Photo</span>
          </TabsTrigger>
          <TabsTrigger value="recordings" className="flex items-center gap-2">
            <Archive className="h-4 w-4" />
            <span className="hidden sm:inline">Rec</span>
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">Settings</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="live-stream">
          {canAccessFeature('view') ? (
            <LiveVideoStreaming
              cameraConfigs={cameraConfigs}
              onStreamStart={handleStreamStart}
              onStreamStop={handleStreamStop}
              onIncidentRecord={handleIncidentRecord}
              isDriver={userRole === 'driver'}
            />
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <Shield className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">
                  You don't have permission to access live streaming features.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Video Frame Extractor Tab */}
        <TabsContent value="video-frames">
          <VideoFrameExtractor />
        </TabsContent>

        {/* ALPR Tab */}
        <TabsContent value="alpr">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* ALPR Scanner */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ScanLine className="h-5 w-5" />
                  License Plate Scanner
                  <Badge variant="outline" className="ml-auto">SA Plates</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Image Preview */}
                <div 
                  className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4 min-h-[200px] flex items-center justify-center cursor-pointer hover:border-primary/50 transition-colors"
                  onClick={() => alprFileInputRef.current?.click()}
                >
                  {alprImage ? (
                    <img 
                      src={alprImage} 
                      alt="Vehicle for ALPR" 
                      className="max-h-[200px] object-contain rounded"
                    />
                  ) : (
                    <div className="text-center text-muted-foreground">
                      <Car className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>Click to upload vehicle image</p>
                      <p className="text-xs">or drag and drop</p>
                    </div>
                  )}
                </div>

                <input
                  ref={alprFileInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = async (event) => {
                        const base64 = event.target?.result as string;
                        setAlprImage(base64);
                        
                        // Auto-run ALPR
                        const result = await recognizePlate({ imageBase64: base64 });
                        if (result.success && result.plates.length > 0) {
                          setPlateHistory(prev => [...result.plates, ...prev].slice(0, 20));
                        }
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                />

                <div className="flex gap-2">
                  <Button 
                    onClick={() => alprFileInputRef.current?.click()}
                    variant="outline"
                    className="flex-1"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Image
                  </Button>
                  <Button
                    onClick={async () => {
                      if (alprImage) {
                        const result = await recognizePlate({ imageBase64: alprImage });
                        if (result.success && result.plates.length > 0) {
                          setPlateHistory(prev => [...result.plates, ...prev].slice(0, 20));
                        }
                      }
                    }}
                    disabled={!alprImage || isProcessing}
                    className="flex-1"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Scanning...
                      </>
                    ) : (
                      <>
                        <ScanLine className="h-4 w-4 mr-2" />
                        Scan Plate
                      </>
                    )}
                  </Button>
                </div>

                {/* Processing indicator */}
                {isProcessing && (
                  <div className="space-y-2">
                    <Progress value={66} className="h-2" />
                    <p className="text-xs text-center text-muted-foreground">
                      AI analyzing image for license plates...
                    </p>
                  </div>
                )}

                {/* Results */}
                {lastResult && !isProcessing && (
                  <div className="space-y-3 pt-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Processing time:</span>
                      <Badge variant="secondary">{lastResult.processing_time_ms}ms</Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Image quality:</span>
                      <Badge variant={
                        lastResult.image_quality === 'excellent' ? 'default' :
                        lastResult.image_quality === 'good' ? 'default' :
                        lastResult.image_quality === 'fair' ? 'secondary' : 'destructive'
                      }>
                        {lastResult.image_quality}
                      </Badge>
                    </div>

                    {lastResult.plates.length > 0 ? (
                      <div className="space-y-2">
                        <p className="text-sm font-medium">Detected Plates:</p>
                        {lastResult.plates.map((plate, idx) => (
                          <div 
                            key={idx}
                            className="flex items-center justify-between p-3 bg-muted rounded-lg"
                          >
                            <div className="flex items-center gap-3">
                              <div className="bg-background px-3 py-1 rounded border font-mono text-lg font-bold">
                                {plate.plate_number}
                              </div>
                              {plate.is_valid_sa_format ? (
                                <CheckCircle2 className="h-5 w-5 text-green-500" />
                              ) : (
                                <XCircle className="h-5 w-5 text-yellow-500" />
                              )}
                            </div>
                            <div className="text-right text-sm">
                              <div className="font-medium">{plate.province || 'Unknown'}</div>
                              <div className="text-muted-foreground">
                                {Math.round(plate.confidence * 100)}% confidence
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-4 text-muted-foreground">
                        <XCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p>No plates detected</p>
                        {lastResult.recommendations.length > 0 && (
                          <p className="text-xs mt-1">{lastResult.recommendations[0]}</p>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Plate History */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  Recent Plates
                  <Badge variant="secondary" className="ml-auto">{plateHistory.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {plateHistory.length > 0 ? (
                  <div className="space-y-2 max-h-[400px] overflow-y-auto">
                    {plateHistory.map((plate, idx) => (
                      <div 
                        key={idx}
                        className="flex items-center justify-between p-2 border rounded-lg hover:bg-muted/50"
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold">{plate.plate_number}</span>
                          {plate.is_valid_sa_format && (
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span>{plate.province}</span>
                          <Badge variant="outline" className="text-xs">
                            {Math.round(plate.confidence * 100)}%
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Car className="h-12 w-12 mx-auto mb-2 opacity-30" />
                    <p>No plates scanned yet</p>
                    <p className="text-xs">Upload an image to start scanning</p>
                  </div>
                )}

                {plateHistory.length > 0 && (
                  <Button 
                    variant="outline" 
                    className="w-full mt-4"
                    onClick={() => setPlateHistory([])}
                  >
                    Clear History
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>

          {/* ALPR Info */}
          <Card className="mt-6 border-primary/20 bg-primary/5">
            <CardContent className="py-4">
              <div className="flex items-start gap-3">
                <Shield className="h-5 w-5 text-primary mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium">SA License Plate Recognition</p>
                  <p className="text-muted-foreground">
                    Optimized for all South African provincial formats including GP, WC, KZN, EC, FS, LP, MP, NC, and NW plates. 
                    Results are validated against official formats for accuracy.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="photo-capture">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {cameraConfigs.map((camera) => (
              <EnhancedCameraCapture
                key={camera.id}
                onPhotoCapture={handlePhotoCapture}
                title={camera.name}
                description={`Capture photos from ${camera.position} camera`}
                multiCamera={true}
                cameraType={camera.position === 'cabin' ? 'front' : 'rear'}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="recordings">
          <div className="space-y-6">
            {/* Recordings Summary */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="text-center py-4">
                  <div className="text-2xl font-bold text-primary">{incidentRecordings.length}</div>
                  <div className="text-sm text-muted-foreground">Total Recordings</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="text-center py-4">
                  <div className="text-2xl font-bold text-red-600">
                    {incidentRecordings.filter(r => r.type === 'emergency').length}
                  </div>
                  <div className="text-sm text-muted-foreground">Emergency</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="text-center py-4">
                  <div className="text-2xl font-bold text-blue-600">
                    {incidentRecordings.filter(r => !r.isProcessed).length}
                  </div>
                  <div className="text-sm text-muted-foreground">Processing</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="text-center py-4">
                  <div className="text-2xl font-bold text-green-600">
                    {incidentRecordings.reduce((total, r) => total + parseFloat(r.fileSize), 0).toFixed(0)} MB
                  </div>
                  <div className="text-sm text-muted-foreground">Total Size</div>
                </CardContent>
              </Card>
            </div>

            {/* Recordings List */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Archive className="h-5 w-5" />
                  Incident Recordings
                </CardTitle>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-4">
                  {incidentRecordings.map((recording) => (
                    <div 
                      key={recording.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-muted rounded-lg">
                          <Video className="h-5 w-5" />
                        </div>
                        
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">
                              {cameraConfigs.find(c => c.id === recording.cameraId)?.name}
                            </span>
                            <Badge variant={getIncidentTypeColor(recording.type) as any}>
                              {recording.type}
                            </Badge>
                            {!recording.isProcessed && (
                              <Badge variant="secondary">Processing</Badge>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {recording.timestamp.toLocaleDateString()}
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {recording.timestamp.toLocaleTimeString()}
                            </div>
                            {recording.location && (
                              <div className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {recording.location}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <div className="text-right text-sm">
                          <div className="font-medium">{formatDuration(recording.duration)}</div>
                          <div className="text-muted-foreground">{recording.fileSize}</div>
                        </div>
                        
                        {canAccessFeature('download') && (
                          <Button 
                            onClick={() => downloadRecording(recording)}
                            size="sm"
                            variant="outline"
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="settings">
          {canAccessFeature('manage') ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Camera System Settings
                </CardTitle>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-6">
                  {/* Camera Status */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Camera Status</h3>
                    {cameraConfigs.map((camera) => (
                      <div key={camera.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <Camera className="h-5 w-5" />
                          <div>
                            <div className="font-medium">{camera.name}</div>
                            <div className="text-sm text-muted-foreground capitalize">
                              {camera.position} mounted
                            </div>
                          </div>
                        </div>
                        
                        <Badge variant={camera.isActive ? "default" : "secondary"}>
                          {camera.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                    ))}
                  </div>

                  {/* System Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">System Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Storage Available:</span>
                          <span className="font-medium">2.1 GB</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Recording Quality:</span>
                          <span className="font-medium">720p HD</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Auto Backup:</span>
                          <span className="font-medium">Enabled</span>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Last Maintenance:</span>
                          <span className="font-medium">3 days ago</span>
                        </div>
                        <div className="flex justify-between">
                          <span>System Version:</span>
                          <span className="font-medium">v2.1.0</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Network Status:</span>
                          <span className="font-medium text-green-600">Connected</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <Settings className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">
                  You don't have permission to access camera settings.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};