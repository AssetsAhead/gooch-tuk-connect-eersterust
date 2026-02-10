import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Car, 
  MapPin, 
  Navigation, 
  Star, 
  Clock, 
  Loader2,
  RefreshCw,
  Circle
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { WhatsAppLocationShare } from '@/components/location/WhatsAppLocationShare';

interface Driver {
  id: string;
  user_id: string;
  name: string;
  vehicle: string;
  rating: number;
  status: string;
  location: string;
  eta: number;
  distance: string;
  posX?: number;
  posY?: number;
  photo_url?: string;
}

interface LiveDriverMapProps {
  onSelectDriver?: (driver: Driver) => void;
  selectedDriverId?: string;
  userLocation?: { latitude: number; longitude: number };
}

export const LiveDriverMap = ({
  onSelectDriver,
  selectedDriverId,
  userLocation
}: LiveDriverMapProps) => {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const fetchDrivers = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('drivers')
        .select('id, user_id, name, vehicle, rating, status, location, eta, photo_url')
        .eq('status', 'online')
        .limit(8);

      if (error) {
        console.error('Error fetching drivers:', error);
        return;
      }

      // Add positioning for visual display
      const driversWithPosition: Driver[] = (data || []).map((driver, index) => ({
        id: driver.id,
        user_id: driver.user_id,
        name: driver.name,
        vehicle: driver.vehicle,
        rating: driver.rating || 4.5,
        status: driver.status || 'online',
        location: driver.location,
        eta: driver.eta || Math.floor(Math.random() * 8 + 2),
        distance: `${(Math.random() * 2 + 0.3).toFixed(1)}km`,
        posX: 20 + (index % 3) * 30 + Math.random() * 10,
        posY: 20 + Math.floor(index / 3) * 25 + Math.random() * 10,
        photo_url: driver.photo_url,
      }));

      setDrivers(driversWithPosition);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetching drivers:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDrivers();
    
    // Real-time subscription to driver changes
    const channel = supabase
      .channel('drivers-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'drivers' },
        () => fetchDrivers()
      )
      .subscribe();

    // Refresh every 10 seconds for live feel
    const interval = setInterval(fetchDrivers, 10000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, []);

  const getDriverColor = (index: number) => {
    const colors = [
      'bg-primary',
      'bg-success',
      'bg-tuk-orange',
      'bg-tuk-blue',
      'bg-purple-500',
      'bg-pink-500',
      'bg-cyan-500',
      'bg-amber-500'
    ];
    return colors[index % colors.length];
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Navigation className="h-5 w-5 text-primary" />
            Live Drivers Near You
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              <Circle className="h-2 w-2 fill-success text-success mr-1 animate-pulse" />
              {drivers.length} online
            </Badge>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={fetchDrivers}
              disabled={isLoading}
            >
              <RefreshCw className={cn('h-4 w-4', isLoading && 'animate-spin')} />
            </Button>
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          Last updated: {lastUpdated.toLocaleTimeString()}
        </p>
      </CardHeader>
      <CardContent className="p-0">
        {/* Visual Map Area */}
        <div className="relative h-48 bg-gradient-to-br from-muted/50 to-muted overflow-hidden">
          {/* Grid lines for map effect */}
          <div className="absolute inset-0 opacity-20">
            {[...Array(10)].map((_, i) => (
              <React.Fragment key={i}>
                <div 
                  className="absolute h-full w-px bg-foreground/20" 
                  style={{ left: `${i * 10}%` }} 
                />
                <div 
                  className="absolute w-full h-px bg-foreground/20" 
                  style={{ top: `${i * 10}%` }} 
                />
              </React.Fragment>
            ))}
          </div>

          {/* User location marker */}
          <div 
            className="absolute z-20 flex flex-col items-center"
            style={{ left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }}
          >
            <div className="relative">
              <div className="absolute inset-0 bg-primary/30 rounded-full animate-ping" />
              <div className="w-4 h-4 bg-primary rounded-full border-2 border-white shadow-lg" />
            </div>
            <span className="text-[10px] font-medium mt-1 bg-background/80 px-1 rounded">You</span>
          </div>

          {/* Driver markers */}
          {drivers.map((driver, index) => (
            <div
              key={driver.id}
              className={cn(
                'absolute z-10 cursor-pointer transition-all duration-300 hover:scale-110',
                selectedDriverId === driver.id && 'scale-125 z-30'
              )}
              style={{ 
                left: `${driver.posX}%`, 
                top: `${driver.posY}%`,
                transform: 'translate(-50%, -50%)'
              }}
              onClick={() => onSelectDriver?.(driver)}
            >
              <div className="relative">
                {selectedDriverId === driver.id && (
                  <div className="absolute inset-0 bg-primary/40 rounded-full animate-ping" />
                )}
                <div className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center shadow-lg',
                  getDriverColor(index),
                  'text-white'
                )}>
                  <Car className="h-4 w-4" />
                </div>
              </div>
              <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap">
                <Badge variant="secondary" className="text-[9px] px-1 py-0">
                  {driver.eta}m
                </Badge>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/50">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}
        </div>

        {/* Driver List */}
        <div className="p-3 max-h-60 overflow-y-auto space-y-2">
          {drivers.map((driver, index) => (
            <div
              key={driver.id}
              onClick={() => onSelectDriver?.(driver)}
              className={cn(
                'flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all',
                'hover:bg-muted/50',
                selectedDriverId === driver.id 
                  ? 'bg-primary/10 border border-primary/30' 
                  : 'bg-muted/30'
              )}
            >
              <div className="flex items-center gap-3">
                <Avatar className={cn('h-10 w-10 border-2', getDriverColor(index).replace('bg-', 'border-'))}>
                  <AvatarImage src={driver.photo_url} alt={driver.name} />
                  <AvatarFallback className={cn(getDriverColor(index), 'text-white font-bold')}>
                    {driver.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{driver.name}</span>
                    <div className="flex items-center text-xs text-yellow-500">
                      <Star className="h-3 w-3 fill-current" />
                      <span className="ml-0.5">{driver.rating}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{driver.vehicle}</span>
                    <span>•</span>
                    <span>{driver.distance}</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-1 text-primary font-bold">
                  <Clock className="h-3 w-3" />
                  <span>{driver.eta} min</span>
                </div>
                <Button 
                  size="sm" 
                  variant={selectedDriverId === driver.id ? 'default' : 'outline'}
                  className="mt-1 h-7 text-xs"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectDriver?.(driver);
                  }}
                >
                  {selectedDriverId === driver.id ? 'Selected' : 'Select'}
                </Button>
              </div>
            </div>
          ))}
        </div>
        <div className="p-3 border-t">
          <WhatsAppLocationShare
            variant="compact"
            message="📍 I'm waiting for a ride here — MojaRide passenger location:"
          />
        </div>
      </CardContent>
    </Card>
  );
};
