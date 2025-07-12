import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  MapPin, 
  Navigation, 
  Car, 
  Clock, 
  Shield, 
  AlertTriangle,
  Eye,
  EyeOff,
  RefreshCw
} from 'lucide-react';

interface Vehicle {
  id: string;
  owner_name: string;
  vehicle_type: string;
  registration: string;
  route: string;
}

interface LocationData {
  lat: number;
  lng: number;
  accuracy: number;
  timestamp: string;
  speed?: number;
  heading?: number;
}

interface DriverLocationSharingProps {
  userId: string;
  onShiftStart?: () => void;
  onShiftEnd?: () => void;
}

export default function DriverLocationSharing({ 
  userId, 
  onShiftStart, 
  onShiftEnd 
}: DriverLocationSharingProps) {
  const [isOnShift, setIsOnShift] = useState(false);
  const [locationSharing, setLocationSharing] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<LocationData | null>(null);
  const [selectedVehicle, setSelectedVehicle] = useState<string>('');
  const [availableVehicles, setAvailableVehicles] = useState<Vehicle[]>([]);
  const [locationAccuracy, setLocationAccuracy] = useState<'high' | 'balanced' | 'low'>('balanced');
  const [autoUpdate, setAutoUpdate] = useState(true);
  const [locationHistory, setLocationHistory] = useState<LocationData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [watchId, setWatchId] = useState<number | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchAvailableVehicles();
    checkShiftStatus();
  }, [userId]);

  useEffect(() => {
    if (isOnShift && locationSharing && autoUpdate) {
      startLocationTracking();
    } else {
      stopLocationTracking();
    }

    return () => stopLocationTracking();
  }, [isOnShift, locationSharing, autoUpdate, locationAccuracy]);

  const fetchAvailableVehicles = async () => {
    try {
      // Mock data - in real app this would come from database
      const mockVehicles: Vehicle[] = [
        { id: '1', owner_name: 'Thabo Motors', vehicle_type: 'Toyota Hiace', registration: 'TT001', route: 'Soshanguve - Pretoria' },
        { id: '2', owner_name: 'Lucky Transport', vehicle_type: 'Quantum', registration: 'LT205', route: 'Mamelodi - CBD' },
        { id: '3', owner_name: 'Safe Ride Co', vehicle_type: 'Avanza', registration: 'SR103', route: 'Hammanskraal - Pretoria' },
      ];
      setAvailableVehicles(mockVehicles);
    } catch (error) {
      console.error('Error fetching vehicles:', error);
      toast({
        title: "Error",
        description: "Failed to load available vehicles",
        variant: "destructive"
      });
    }
  };

  const checkShiftStatus = async () => {
    try {
      const { data } = await supabase
        .from('drivers')
        .select('status')
        .eq('user_id', userId)
        .single();
      
      if (data?.status === 'online') {
        setIsOnShift(true);
        setLocationSharing(true);
      }
    } catch (error) {
      console.error('Error checking shift status:', error);
    }
  };

  const getLocationOptions = () => {
    switch (locationAccuracy) {
      case 'high':
        return {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 1000
        };
      case 'balanced':
        return {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 5000
        };
      case 'low':
        return {
          enableHighAccuracy: false,
          timeout: 20000,
          maximumAge: 10000
        };
    }
  };

  const startLocationTracking = () => {
    if (!navigator.geolocation) {
      toast({
        title: "Location Not Supported",
        description: "Your device doesn't support location tracking",
        variant: "destructive"
      });
      return;
    }

    const options = getLocationOptions();

    const id = navigator.geolocation.watchPosition(
      (position) => {
        const locationData: LocationData = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: new Date().toISOString(),
          speed: position.coords.speed || undefined,
          heading: position.coords.heading || undefined
        };

        setCurrentLocation(locationData);
        updateDriverLocation(locationData);
        
        // Keep location history (last 20 points)
        setLocationHistory(prev => 
          [...prev, locationData].slice(-20)
        );
      },
      (error) => {
        console.error('Location error:', error);
        let message = "Location tracking failed";
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            message = "Location permission denied. Please enable location access.";
            break;
          case error.POSITION_UNAVAILABLE:
            message = "Location information unavailable.";
            break;
          case error.TIMEOUT:
            message = "Location request timed out.";
            break;
        }
        
        toast({
          title: "Location Error",
          description: message,
          variant: "destructive"
        });
      },
      options
    );

    setWatchId(id);
  };

  const stopLocationTracking = () => {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
    }
  };

  const updateDriverLocation = async (location: LocationData) => {
    try {
      await supabase
        .from('drivers')
        .update({
          location: `${location.lat},${location.lng}`,
          updated_at: location.timestamp
        })
        .eq('user_id', userId);
    } catch (error) {
      console.error('Error updating driver location:', error);
    }
  };

  const handleShiftToggle = async () => {
    if (!selectedVehicle && !isOnShift) {
      toast({
        title: "Vehicle Required",
        description: "Please select a vehicle before starting your shift",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const newShiftStatus = !isOnShift;
      
      await supabase
        .from('drivers')
        .update({
          status: newShiftStatus ? 'online' : 'offline',
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);

      setIsOnShift(newShiftStatus);
      setLocationSharing(newShiftStatus);

      if (newShiftStatus) {
        onShiftStart?.();
        toast({
          title: "Shift Started",
          description: `You're now online with ${availableVehicles.find(v => v.id === selectedVehicle)?.registration}`,
        });
      } else {
        onShiftEnd?.();
        setCurrentLocation(null);
        setLocationHistory([]);
        toast({
          title: "Shift Ended",
          description: "You're now offline and location sharing is disabled",
        });
      }
    } catch (error) {
      console.error('Error toggling shift:', error);
      toast({
        title: "Error",
        description: "Failed to update shift status",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const manualLocationUpdate = () => {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const locationData: LocationData = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: new Date().toISOString(),
          speed: position.coords.speed || undefined,
          heading: position.coords.heading || undefined
        };

        setCurrentLocation(locationData);
        updateDriverLocation(locationData);
        
        toast({
          title: "Location Updated",
          description: `Position updated with ${Math.round(locationData.accuracy)}m accuracy`,
        });
      },
      (error) => {
        toast({
          title: "Location Error",
          description: "Failed to get current location",
          variant: "destructive"
        });
      },
      getLocationOptions()
    );
  };

  return (
    <div className="space-y-6">
      {/* Vehicle Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Car className="h-5 w-5" />
            Vehicle Assignment
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Select Vehicle</label>
            <Select value={selectedVehicle} onValueChange={setSelectedVehicle} disabled={isOnShift}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a vehicle to operate" />
              </SelectTrigger>
              <SelectContent>
                {availableVehicles.map((vehicle) => (
                  <SelectItem key={vehicle.id} value={vehicle.id}>
                    <div className="flex flex-col">
                      <span className="font-medium">{vehicle.registration} - {vehicle.vehicle_type}</span>
                      <span className="text-sm text-gray-600">{vehicle.owner_name} • {vehicle.route}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {selectedVehicle && (
            <div className="p-3 bg-blue-50 rounded-lg">
              {(() => {
                const vehicle = availableVehicles.find(v => v.id === selectedVehicle);
                return vehicle ? (
                  <div>
                    <p className="font-medium text-blue-900">{vehicle.registration} - {vehicle.vehicle_type}</p>
                    <p className="text-sm text-blue-700">Owner: {vehicle.owner_name}</p>
                    <p className="text-sm text-blue-700">Route: {vehicle.route}</p>
                  </div>
                ) : null;
              })()}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Shift Control */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Shift Management
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Shift Status</h3>
              <p className="text-sm text-gray-600">
                {isOnShift ? "You're currently on duty" : "Start your shift to begin receiving rides"}
              </p>
            </div>
            <Button 
              onClick={handleShiftToggle}
              disabled={isLoading}
              className={isOnShift ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"}
            >
              {isLoading ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  {isOnShift ? "Ending..." : "Starting..."}
                </>
              ) : (
                <>
                  {isOnShift ? "End Shift" : "Start Shift"}
                </>
              )}
            </Button>
          </div>
          
          <div className="flex items-center space-x-4">
            <Badge variant={isOnShift ? "default" : "secondary"}>
              {isOnShift ? "On Duty" : "Off Duty"}
            </Badge>
            {isOnShift && locationSharing && (
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                <Navigation className="h-3 w-3 mr-1" />
                Location Sharing Active
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Location Controls */}
      {isOnShift && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Location Tracking
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Share Location</h3>
                <p className="text-sm text-gray-600">Allow passengers to track your location</p>
              </div>
              <div className="flex items-center gap-2">
                {locationSharing ? <Eye className="h-4 w-4 text-green-600" /> : <EyeOff className="h-4 w-4 text-gray-400" />}
                <Switch 
                  checked={locationSharing} 
                  onCheckedChange={setLocationSharing}
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Auto-Update Location</h3>
                <p className="text-sm text-gray-600">Automatically update your position</p>
              </div>
              <Switch 
                checked={autoUpdate} 
                onCheckedChange={setAutoUpdate}
                disabled={!locationSharing}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Location Accuracy</label>
              <Select value={locationAccuracy} onValueChange={(value: 'high' | 'balanced' | 'low') => setLocationAccuracy(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">High (More battery usage)</SelectItem>
                  <SelectItem value="balanced">Balanced (Recommended)</SelectItem>
                  <SelectItem value="low">Low (Battery saving)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2">
              <Button 
                onClick={manualLocationUpdate} 
                variant="outline" 
                size="sm"
                disabled={!locationSharing}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Update Now
              </Button>
            </div>

            {currentLocation && (
              <div className="p-3 bg-gray-50 rounded-lg">
                <h4 className="font-medium mb-2">Current Location</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>Latitude: {currentLocation.lat.toFixed(6)}</div>
                  <div>Longitude: {currentLocation.lng.toFixed(6)}</div>
                  <div>Accuracy: {Math.round(currentLocation.accuracy)}m</div>
                  <div>Updated: {new Date(currentLocation.timestamp).toLocaleTimeString()}</div>
                  {currentLocation.speed && (
                    <div>Speed: {Math.round(currentLocation.speed * 3.6)} km/h</div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Security Notice */}
      <Card className="border-orange-200 bg-orange-50">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Shield className="h-5 w-5 text-orange-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-orange-900">Security Notice</h4>
              <p className="text-sm text-orange-800 mt-1">
                Your phone location is tracked for passenger safety and ride coordination. 
                Vehicle theft protection: Only your phone location is shared, not the vehicle's built-in tracking systems.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
