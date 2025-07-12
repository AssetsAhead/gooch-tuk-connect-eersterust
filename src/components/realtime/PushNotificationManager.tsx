import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Bell, BellOff, Smartphone, Volume2, VolumeX } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface NotificationSettings {
  rideUpdates: boolean;
  safetyAlerts: boolean;
  messages: boolean;
  promotions: boolean;
  sound: boolean;
  vibration: boolean;
}

interface PushNotificationManagerProps {
  userId: string;
  userType: 'driver' | 'passenger';
}

export const PushNotificationManager = ({ userId, userType }: PushNotificationManagerProps) => {
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [settings, setSettings] = useState<NotificationSettings>({
    rideUpdates: true,
    safetyAlerts: true,
    messages: true,
    promotions: false,
    sound: true,
    vibration: true,
  });
  const [subscriptionStatus, setSubscriptionStatus] = useState<'subscribed' | 'unsubscribed' | 'pending'>('unsubscribed');
  const { toast } = useToast();

  useEffect(() => {
    // Check if push notifications are supported
    if ('Notification' in window && 'serviceWorker' in navigator) {
      setIsSupported(true);
      setPermission(Notification.permission);
    }

    // Load saved settings from localStorage
    const savedSettings = localStorage.getItem(`notification-settings-${userId}`);
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, [userId]);

  const requestPermission = async () => {
    if (!isSupported) {
      toast({
        title: "Not Supported",
        description: "Push notifications are not supported in this browser",
        variant: "destructive",
      });
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      setPermission(permission);
      
      if (permission === 'granted') {
        setSubscriptionStatus('subscribed');
        toast({
          title: "Notifications Enabled",
          description: "You'll now receive push notifications for important updates",
        });
        
        // Test notification
        showTestNotification();
      } else {
        toast({
          title: "Notifications Denied",
          description: "You won't receive push notifications. You can enable them in browser settings.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      toast({
        title: "Error",
        description: "Failed to request notification permission",
        variant: "destructive",
      });
    }
  };

  const showTestNotification = () => {
    if (permission === 'granted') {
      new Notification('TukTuk Community', {
        body: '🚗 Push notifications are now enabled! You\'ll receive updates about your rides.',
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: 'test-notification',
        requireInteraction: false,
      });
    }
  };

  const updateSetting = (key: keyof NotificationSettings, value: boolean) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    
    // Save to localStorage
    localStorage.setItem(`notification-settings-${userId}`, JSON.stringify(newSettings));
    
    toast({
      title: "Settings Updated",
      description: `${key.replace(/([A-Z])/g, ' $1').toLowerCase()} notifications ${value ? 'enabled' : 'disabled'}`,
    });
  };

  const simulateNotification = (type: string) => {
    if (permission !== 'granted') {
      toast({
        title: "Enable Notifications",
        description: "Please enable push notifications to receive updates",
        variant: "destructive",
      });
      return;
    }

    const notifications = {
      ride: {
        title: '🚗 Ride Update',
        body: 'Your driver is 2 minutes away from pickup location',
        tag: 'ride-update'
      },
      safety: {
        title: '🚨 Safety Alert',
        body: 'Avoid Denlyn Mall area - theft reported nearby',
        tag: 'safety-alert'
      },
      message: {
        title: '💬 New Message',
        body: 'Driver: "I\'m at the pickup point, wearing a blue shirt"',
        tag: 'chat-message'
      },
      promotion: {
        title: '🎉 Special Offer',
        body: '30% off your next 5 rides with SASSA verification!',
        tag: 'promotion'
      }
    };

    const notificationData = notifications[type as keyof typeof notifications];
    
    if (notificationData) {
      new Notification(notificationData.title, {
        body: notificationData.body,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: notificationData.tag,
        requireInteraction: type === 'safety'
      });

      // Show sound/vibration based on settings
      if (settings.sound) {
        // In a real app, you'd play a notification sound
        console.log('🔊 Notification sound played');
      }
      
      if (settings.vibration && 'vibrate' in navigator) {
        navigator.vibrate([200, 100, 200]);
      }
    }
  };

  const getPermissionBadge = () => {
    switch (permission) {
      case 'granted':
        return <Badge className="bg-success text-white">Enabled</Badge>;
      case 'denied':
        return <Badge variant="destructive">Denied</Badge>;
      default:
        return <Badge variant="outline">Not Set</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <Bell className="h-5 w-5 mr-2" />
            Push Notifications
          </div>
          {getPermissionBadge()}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Permission Status */}
        <div className="p-4 bg-muted/30 rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <Smartphone className="h-4 w-4" />
              <span className="font-medium">Browser Notifications</span>
            </div>
            {permission === 'granted' ? (
              <Badge className="bg-success text-white">Active</Badge>
            ) : (
              <Button size="sm" onClick={requestPermission}>
                Enable
              </Button>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            {permission === 'granted' 
              ? 'You will receive push notifications for important updates'
              : permission === 'denied'
              ? 'Notifications are blocked. Enable them in your browser settings.'
              : 'Click "Enable" to receive push notifications for ride updates and safety alerts'
            }
          </p>
        </div>

        {/* Notification Settings */}
        <div className="space-y-4">
          <h4 className="font-medium">Notification Preferences</h4>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
              <div>
                <div className="font-medium text-sm">Ride Updates</div>
                <p className="text-xs text-muted-foreground">Driver location, ETA changes, pickup notifications</p>
              </div>
              <Switch
                checked={settings.rideUpdates}
                onCheckedChange={(checked) => updateSetting('rideUpdates', checked)}
              />
            </div>

            <div className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
              <div>
                <div className="font-medium text-sm">Safety Alerts</div>
                <p className="text-xs text-muted-foreground">Crime reports, emergency notifications</p>
              </div>
              <Switch
                checked={settings.safetyAlerts}
                onCheckedChange={(checked) => updateSetting('safetyAlerts', checked)}
              />
            </div>

            <div className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
              <div>
                <div className="font-medium text-sm">Messages</div>
                <p className="text-xs text-muted-foreground">Chat messages from {userType === 'driver' ? 'passengers' : 'drivers'}</p>
              </div>
              <Switch
                checked={settings.messages}
                onCheckedChange={(checked) => updateSetting('messages', checked)}
              />
            </div>

            <div className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
              <div>
                <div className="font-medium text-sm">Promotions</div>
                <p className="text-xs text-muted-foreground">Special offers, discounts, and rewards</p>
              </div>
              <Switch
                checked={settings.promotions}
                onCheckedChange={(checked) => updateSetting('promotions', checked)}
              />
            </div>
          </div>
        </div>

        {/* Sound & Vibration */}
        <div className="space-y-4">
          <h4 className="font-medium">Alert Options</h4>
          
          <div className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
            <div className="flex items-center space-x-2">
              {settings.sound ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
              <span className="font-medium text-sm">Sound</span>
            </div>
            <Switch
              checked={settings.sound}
              onCheckedChange={(checked) => updateSetting('sound', checked)}
            />
          </div>

          <div className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
            <div className="flex items-center space-x-2">
              <Smartphone className="h-4 w-4" />
              <span className="font-medium text-sm">Vibration</span>
            </div>
            <Switch
              checked={settings.vibration}
              onCheckedChange={(checked) => updateSetting('vibration', checked)}
            />
          </div>
        </div>

        {/* Test Notifications */}
        {permission === 'granted' && (
          <div className="space-y-4">
            <h4 className="font-medium">Test Notifications</h4>
            <div className="grid grid-cols-2 gap-2">
              <Button size="sm" variant="outline" onClick={() => simulateNotification('ride')}>
                Test Ride Update
              </Button>
              <Button size="sm" variant="outline" onClick={() => simulateNotification('safety')}>
                Test Safety Alert
              </Button>
              <Button size="sm" variant="outline" onClick={() => simulateNotification('message')}>
                Test Message
              </Button>
              <Button size="sm" variant="outline" onClick={() => simulateNotification('promotion')}>
                Test Promotion
              </Button>
            </div>
          </div>
        )}

        {/* Status Info */}
        <div className="p-3 bg-gradient-to-r from-primary/5 to-muted/10 rounded-lg">
          <div className="flex items-center justify-center space-x-2 text-sm">
            {permission === 'granted' ? (
              <>
                <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
                <span className="text-success font-medium">Notifications active</span>
              </>
            ) : (
              <>
                <BellOff className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Notifications disabled</span>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};