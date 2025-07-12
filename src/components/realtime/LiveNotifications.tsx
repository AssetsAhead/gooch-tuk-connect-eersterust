import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bell, BellOff, MessageCircle, Car, AlertTriangle, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Notification {
  id: string;
  type: 'ride_update' | 'message' | 'safety_alert' | 'system';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  priority: 'low' | 'medium' | 'high';
  data?: any;
}

interface LiveNotificationsProps {
  userId: string;
  userType: 'driver' | 'passenger';
}

export const LiveNotifications = ({ userId, userType }: LiveNotificationsProps) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isEnabled, setIsEnabled] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const { toast } = useToast();

  // Mock notifications for demo
  const initializeNotifications = () => {
    const mockNotifications: Notification[] = [
      {
        id: '1',
        type: 'ride_update',
        title: 'Driver Update',
        message: 'Your driver is 2 minutes away from pickup location',
        timestamp: new Date().toISOString(),
        read: false,
        priority: 'high'
      },
      {
        id: '2',
        type: 'safety_alert',
        title: 'Safety Alert',
        message: 'Avoid Denlyn Mall area - theft reported 10 minutes ago',
        timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
        read: false,
        priority: 'high'
      },
      {
        id: '3',
        type: 'message',
        title: 'Driver Message',
        message: 'I\'m at the pickup point, wearing a blue shirt',
        timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
        read: true,
        priority: 'medium'
      },
      {
        id: '4',
        type: 'system',
        title: 'Fare Update',
        message: 'SASSA discount applied: 30% off your ride',
        timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
        read: false,
        priority: 'low'
      }
    ];
    
    setNotifications(mockNotifications);
    setUnreadCount(mockNotifications.filter(n => !n.read).length);
  };

  useEffect(() => {
    initializeNotifications();

    // Subscribe to real-time updates
    const channel = supabase
      .channel('live-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'ride_updates',
        },
        (payload) => {
          const newNotification: Notification = {
            id: Date.now().toString(),
            type: 'ride_update',
            title: 'Ride Update',
            message: payload.new.status_message || 'Your ride has been updated',
            timestamp: new Date().toISOString(),
            read: false,
            priority: 'medium',
            data: payload.new
          };
          
          addNotification(newNotification);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  const addNotification = (notification: Notification) => {
    setNotifications(prev => [notification, ...prev.slice(0, 9)]);
    setUnreadCount(prev => prev + 1);
    
    if (isEnabled) {
      toast({
        title: notification.title,
        description: notification.message,
        duration: notification.priority === 'high' ? 8000 : 5000,
      });
    }
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'ride_update':
        return <Car className="h-4 w-4" />;
      case 'message':
        return <MessageCircle className="h-4 w-4" />;
      case 'safety_alert':
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'border-danger text-danger bg-danger/5';
      case 'medium':
        return 'border-warning text-warning bg-warning/5';
      default:
        return 'border-muted text-muted-foreground bg-muted/5';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <Bell className="h-5 w-5 mr-2" />
            Live Notifications
            {unreadCount > 0 && (
              <Badge className="ml-2 bg-danger text-white">
                {unreadCount}
              </Badge>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsEnabled(!isEnabled)}
              className={isEnabled ? 'text-success' : 'text-muted-foreground'}
            >
              {isEnabled ? <Bell className="h-4 w-4" /> : <BellOff className="h-4 w-4" />}
            </Button>
            {unreadCount > 0 && (
              <Button size="sm" variant="outline" onClick={markAllAsRead}>
                Mark All Read
              </Button>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No notifications yet</p>
            </div>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-3 rounded-lg border cursor-pointer transition-all hover:bg-muted/20 ${
                  notification.read ? 'opacity-70' : ''
                } ${getPriorityColor(notification.priority)}`}
                onClick={() => !notification.read && markAsRead(notification.id)}
              >
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-0.5">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium">{notification.title}</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {notification.message}
                        </p>
                      </div>
                      {!notification.read && (
                        <div className="w-2 h-2 bg-primary rounded-full ml-2 mt-2"></div>
                      )}
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-muted-foreground">
                        {new Date(notification.timestamp).toLocaleTimeString()}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {notification.type.replace('_', ' ')}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        
        {/* Quick Actions */}
        <div className="mt-4 p-3 bg-gradient-to-r from-primary/5 to-muted/10 rounded-lg">
          <div className="flex items-center justify-center space-x-4 text-sm">
            <div className="flex items-center text-success">
              <CheckCircle className="h-4 w-4 mr-1" />
              Live tracking active
            </div>
            <div className="text-muted-foreground">•</div>
            <div className="flex items-center text-primary">
              <Bell className="h-4 w-4 mr-1" />
              {isEnabled ? 'Notifications on' : 'Notifications off'}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};