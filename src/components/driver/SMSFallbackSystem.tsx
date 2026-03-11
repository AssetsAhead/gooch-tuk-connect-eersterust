import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { 
  MessageSquare, 
  Smartphone, 
  WifiOff, 
  Wifi, 
  MapPin, 
  Bell, 
  Shield, 
  Zap,
  Signal,
  AlertTriangle
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface SMSFallbackSystemProps {
  userId?: string;
  driverPhone?: string;
}

interface ConnectivityBundle {
  provider: string;
  name: string;
  price: string;
  data: string;
  ussd: string;
  recommended?: boolean;
  note?: string;
}

const SA_BUNDLES: ConnectivityBundle[] = [
  {
    provider: 'Vodacom',
    name: 'WhatsApp Bundle',
    price: 'R5',
    data: '100MB WhatsApp',
    ussd: '*111*5#',
    recommended: true,
    note: 'Cheapest option – WhatsApp only'
  },
  {
    provider: 'Cell C',
    name: 'Social Bundle',
    price: 'R7',
    data: '150MB Social',
    ussd: '*147*100#',
    note: 'Includes WhatsApp + Facebook'
  },
  {
    provider: 'MTN',
    name: 'Social Bundle',
    price: 'R10',
    data: '200MB Social',
    ussd: '*136*2#',
    note: 'WhatsApp + YouTube included'
  },
  {
    provider: 'Telkom',
    name: 'FreeMe 1GB',
    price: 'R29',
    data: '1GB Data',
    ussd: '*180#',
    note: 'Full data – best if driver uses maps'
  },
];

export const SMSFallbackSystem: React.FC<SMSFallbackSystemProps> = ({ userId, driverPhone }) => {
  const [smsMode, setSmsMode] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [lastLocationSent, setLastLocationSent] = useState<string | null>(null);
  const [isSendingLocation, setIsSendingLocation] = useState(false);

  useEffect(() => {
    const onOnline = () => setIsOnline(true);
    const onOffline = () => { setIsOnline(false); setSmsMode(true); };
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, []);

  const sendLocationViaSMS = async () => {
    if (!driverPhone || !userId) {
      toast.error('Phone number required');
      return;
    }

    setIsSendingLocation(true);
    try {
      let locationText = 'Location unavailable';
      
      if ('geolocation' in navigator) {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 10000 });
        });
        const { latitude, longitude } = position.coords;
        const mapsLink = `https://maps.google.com/?q=${latitude},${longitude}`;
        locationText = `📍 Driver Location: ${mapsLink}`;

        // Also log to DB if online
        if (isOnline) {
          await supabase.from('location_logs').insert({
            user_id: userId,
            latitude,
            longitude,
            accuracy: position.coords.accuracy,
          });
        }
      }

      const { error } = await supabase.functions.invoke('send-sms-message', {
        body: {
          to: driverPhone,
          message: locationText,
          type: 'info'
        }
      });

      if (error) throw error;

      setLastLocationSent(new Date().toLocaleTimeString());
      toast.success('Location sent via SMS');
    } catch (err: any) {
      console.error('SMS location error:', err);
      toast.error('Failed to send location SMS');
    } finally {
      setIsSendingLocation(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Connectivity Status */}
      <Card className={!isOnline ? 'border-destructive/50 bg-destructive/5' : 'border-green-500/30 bg-green-500/5'}>
        <CardContent className="pt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {isOnline ? (
                <Wifi className="h-5 w-5 text-green-600" />
              ) : (
                <WifiOff className="h-5 w-5 text-destructive" />
              )}
              <span className="font-medium">
                {isOnline ? 'Online – WhatsApp active' : 'Offline – SMS fallback active'}
              </span>
            </div>
            <Badge variant={isOnline ? 'default' : 'destructive'}>
              {isOnline ? 'Data' : 'No Data'}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* SMS Fallback Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Signal className="h-5 w-5" />
            SMS Fallback Mode
          </CardTitle>
          <CardDescription>
            Receive ride requests and share location via SMS when you have no data
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/30">
            <div className="flex items-center gap-2">
              <Smartphone className="h-4 w-4" />
              <Label htmlFor="sms-mode" className="cursor-pointer">
                Force SMS Mode (no data)
              </Label>
            </div>
            <Switch
              id="sms-mode"
              checked={smsMode}
              onCheckedChange={setSmsMode}
            />
          </div>

          {(smsMode || !isOnline) && (
            <div className="space-y-3 p-3 bg-accent/30 rounded-lg border border-accent">
              <p className="text-sm font-medium flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-500" />
                SMS Mode Active – Features available:
              </p>
              <div className="grid grid-cols-1 gap-2 text-sm">
                <div className="flex items-center gap-2">
                  <Bell className="h-3.5 w-3.5 text-primary" />
                  <span>Ride request alerts via SMS</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-primary" />
                  <span>Share location via Google Maps link</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="h-3.5 w-3.5 text-primary" />
                  <span>Emergency panic alerts</span>
                </div>
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-3.5 w-3.5 text-primary" />
                  <span>Status updates to passengers</span>
                </div>
              </div>

              <Button
                onClick={sendLocationViaSMS}
                disabled={isSendingLocation || !driverPhone}
                className="w-full"
                variant="outline"
              >
                <MapPin className="h-4 w-4 mr-2" />
                {isSendingLocation ? 'Sending...' : 'Send Location via SMS'}
              </Button>

              {lastLocationSent && (
                <p className="text-xs text-muted-foreground text-center">
                  Last sent: {lastLocationSent}
                </p>
              )}
            </div>
          )}

          <Separator />

          {/* Cost per SMS */}
          <div className="p-3 bg-muted/30 rounded-lg text-sm space-y-1">
            <p className="font-medium">SMS Cost Breakdown (Twilio SA):</p>
            <div className="flex justify-between">
              <span>Ride alert SMS</span>
              <span className="font-mono">~R0.30</span>
            </div>
            <div className="flex justify-between">
              <span>Location share SMS</span>
              <span className="font-mono">~R0.30</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Est. daily cost (10 rides)</span>
              <span className="font-mono">~R6.00</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Bundles Reference */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Zap className="h-5 w-5" />
            Cheapest Data Bundles (SA)
          </CardTitle>
          <CardDescription>
            Buy a WhatsApp bundle to avoid SMS costs — dial the USSD code from your phone
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {SA_BUNDLES.map((bundle) => (
              <div
                key={`${bundle.provider}-${bundle.name}`}
                className={`flex items-center justify-between p-3 rounded-lg border ${
                  bundle.recommended ? 'border-primary/50 bg-primary/5' : 'bg-muted/20'
                }`}
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm">{bundle.provider}</span>
                    {bundle.recommended && (
                      <Badge variant="default" className="text-[10px] px-1.5 py-0">Best Value</Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">{bundle.data} • {bundle.note}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-sm">{bundle.price}/mo</p>
                  <a
                    href={`tel:${bundle.ussd.replace(/[*#]/g, '')}`}
                    className="text-[11px] text-primary underline font-mono"
                  >
                    {bundle.ussd}
                  </a>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 p-3 bg-accent/20 rounded-lg">
            <p className="text-xs text-muted-foreground">
              💡 <strong>Tip:</strong> Ask your owner to include a R5–R10 data allowance in your kitting package.
              It's cheaper than SMS fallback costs (R6/day × 26 days = R156/mo).
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
