import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  MapPin, 
  Users, 
  Clock, 
  Car, 
  Loader2, 
  Navigation,
  SkipForward,
  LogOut,
  Play,
  CheckCircle,
  AlertTriangle,
  RefreshCw
} from "lucide-react";
import { useZoneQueue, QueueEntry, LoadingZone } from '@/hooks/useZoneQueue';
import { formatDistanceToNow } from 'date-fns';

interface ZoneQueueManagerProps {
  isMarshal?: boolean;
  currentUserId?: string;
}

export const ZoneQueueManager = ({ isMarshal = false, currentUserId }: ZoneQueueManagerProps) => {
  const {
    zones,
    queue,
    isLoading,
    selectedZone,
    setSelectedZone,
    startLoading,
    markDeparted,
    skipDriver,
    removeFromQueue,
    fetchQueue
  } = useZoneQueue();

  const getZoneTypeIcon = (type: string) => {
    switch (type) {
      case 'station': return '🚉';
      case 'mall': return '🏬';
      case 'hospital': return '🏥';
      case 'rank': return '🚕';
      default: return '📍';
    }
  };

  const getZoneTypeLabel = (type: string) => {
    switch (type) {
      case 'station': return 'Station';
      case 'mall': return 'Mall';
      case 'hospital': return 'Hospital';
      case 'rank': return 'Taxi Rank';
      default: return 'Loading Zone';
    }
  };

  const getStatusColor = (entry: QueueEntry) => {
    if (!entry.is_gps_verified) return 'bg-destructive';
    if (entry.status === 'loading') return 'bg-warning';
    if (entry.queue_position === 1) return 'bg-success';
    return 'bg-primary';
  };

  const getTimeInQueue = (joinedAt: string) => {
    return formatDistanceToNow(new Date(joinedAt), { addSuffix: false });
  };

  return (
    <div className="space-y-6">
      {/* Zone Selector */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center">
              <MapPin className="mr-2 h-5 w-5" />
              Loading Zone Queue
            </span>
            {selectedZone && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => fetchQueue(selectedZone.id)}
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Select
            value={selectedZone?.id || ''}
            onValueChange={(value) => {
              const zone = zones.find(z => z.id === value);
              setSelectedZone(zone || null);
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a loading zone" />
            </SelectTrigger>
            <SelectContent>
              {zones.map((zone) => (
                <SelectItem key={zone.id} value={zone.id}>
                  <span className="flex items-center">
                    <span className="mr-2">{getZoneTypeIcon(zone.zone_type)}</span>
                    {zone.zone_name}
                    <Badge variant="outline" className="ml-2 text-xs">
                      {getZoneTypeLabel(zone.zone_type)}
                    </Badge>
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {selectedZone && (
            <div className="mt-4 p-3 bg-muted/30 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">{selectedZone.zone_name}</p>
                  <p className="text-xs text-muted-foreground">{selectedZone.address}</p>
                </div>
                <div className="text-right">
                  <Badge variant="outline">{selectedZone.radius_meters}m radius</Badge>
                  {selectedZone.has_marshal && (
                    <Badge className="ml-2 bg-success">Marshal Present</Badge>
                  )}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Queue Display */}
      {selectedZone && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center">
                <Users className="mr-2 h-5 w-5" />
                Current Queue
              </span>
              <Badge variant="outline" className="text-lg px-3">
                {queue.filter(q => q.status === 'waiting').length} waiting
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : queue.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Car className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No drivers in queue</p>
                <p className="text-sm">Drivers will appear here when they join</p>
              </div>
            ) : (
              <div className="space-y-3">
                {queue.map((entry, index) => (
                  <div 
                    key={entry.id} 
                    className={`p-4 rounded-lg border-2 transition-all ${
                      entry.queue_position === 1 
                        ? 'border-success bg-success/5' 
                        : 'border-transparent bg-muted/30'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        {/* Position Badge */}
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${getStatusColor(entry)}`}>
                          {entry.status === 'loading' ? (
                            <Play className="h-5 w-5" />
                          ) : (
                            entry.queue_position
                          )}
                        </div>

                        {/* Driver Info */}
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-medium">{entry.driver_name}</span>
                            <Badge variant="outline" className="text-xs">
                              {entry.vehicle_registration}
                            </Badge>
                          </div>
                          <div className="flex items-center space-x-3 text-sm text-muted-foreground mt-1">
                            <span className="flex items-center">
                              <Clock className="h-3 w-3 mr-1" />
                              {getTimeInQueue(entry.joined_at)}
                            </span>
                            {entry.is_gps_verified ? (
                              <span className="flex items-center text-success">
                                <Navigation className="h-3 w-3 mr-1" />
                                Verified
                              </span>
                            ) : (
                              <span className="flex items-center text-destructive">
                                <AlertTriangle className="h-3 w-3 mr-1" />
                                Outside zone
                              </span>
                            )}
                            {entry.skip_count > 0 && (
                              <span className="flex items-center text-warning">
                                <SkipForward className="h-3 w-3 mr-1" />
                                Skipped {entry.skip_count}x
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Marshal Actions */}
                      {isMarshal && (
                        <div className="flex items-center space-x-2">
                          {entry.status === 'waiting' && entry.queue_position === 1 && (
                            <Button 
                              size="sm" 
                              className="bg-success hover:bg-success/90"
                              onClick={() => startLoading(entry.id)}
                            >
                              <Play className="h-4 w-4 mr-1" />
                              Load
                            </Button>
                          )}
                          {entry.status === 'loading' && (
                            <Button 
                              size="sm" 
                              className="bg-primary hover:bg-primary/90"
                              onClick={() => markDeparted(entry.id)}
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Depart
                            </Button>
                          )}
                          {entry.status === 'waiting' && (
                            <>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => skipDriver(entry.id, 'Not ready')}
                              >
                                <SkipForward className="h-4 w-4" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline"
                                className="text-destructive border-destructive"
                                onClick={() => removeFromQueue(entry.id, 'Removed by marshal')}
                              >
                                <LogOut className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Zone Stats */}
      {selectedZone && queue.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{queue.length}</div>
              <p className="text-xs text-muted-foreground">In Queue</p>
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-success">
                {queue.filter(q => q.is_gps_verified).length}
              </div>
              <p className="text-xs text-muted-foreground">GPS Verified</p>
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-warning">
                {queue.filter(q => q.status === 'loading').length}
              </div>
              <p className="text-xs text-muted-foreground">Loading</p>
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-muted-foreground">
                {queue.reduce((sum, q) => sum + q.skip_count, 0)}
              </div>
              <p className="text-xs text-muted-foreground">Total Skips</p>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
