import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Camera,
  Video,
  Settings,
  AlertTriangle,
  Shield,
  Archive,
  Download,
  Eye,
  Calendar,
  Clock,
  MapPin
} from 'lucide-react';
import { toast } from 'sonner';
import { LiveVideoStreaming } from './LiveVideoStreaming';
import { EnhancedCameraCapture } from './EnhancedCameraCapture';

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
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="live-stream" className="flex items-center gap-2">
            <Video className="h-4 w-4" />
            Live Stream
          </TabsTrigger>
          <TabsTrigger value="photo-capture" className="flex items-center gap-2">
            <Camera className="h-4 w-4" />
            Photo Capture
          </TabsTrigger>
          <TabsTrigger value="recordings" className="flex items-center gap-2">
            <Archive className="h-4 w-4" />
            Recordings
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Settings
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