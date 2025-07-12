import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, X, CheckCircle, AlertCircle, Info, Calendar } from 'lucide-react';
import { format, isToday, isTomorrow, differenceInDays } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

interface Notification {
  id: string;
  type: 'payment_reminder' | 'discount_available' | 'transport_info' | 'system';
  title: string;
  message: string;
  date: Date;
  read: boolean;
  urgent: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface NotificationSystemProps {
  userGrantType?: string;
  notificationsEnabled?: boolean;
}

export const NotificationSystem: React.FC<NotificationSystemProps> = ({
  userGrantType,
  notificationsEnabled = false
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showAll, setShowAll] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (!notificationsEnabled) return;

    const generateNotifications = (): Notification[] => {
      const today = new Date();
      const notifications: Notification[] = [];

      // Payment reminder notifications
      if (userGrantType) {
        const nextPaymentDate = getNextPaymentDate(userGrantType);
        const daysUntilPayment = differenceInDays(nextPaymentDate, today);

        if (daysUntilPayment <= 3 && daysUntilPayment >= 0) {
          notifications.push({
            id: 'payment_reminder_' + daysUntilPayment,
            type: 'payment_reminder',
            title: daysUntilPayment === 0 ? 'Payment Day!' : 'Payment Reminder',
            message: daysUntilPayment === 0 
              ? 'Your SASSA grant is available today. Transport discounts are now active!'
              : `Your SASSA payment is ${daysUntilPayment} day${daysUntilPayment !== 1 ? 's' : ''} away.`,
            date: today,
            read: false,
            urgent: daysUntilPayment <= 1,
            action: {
              label: 'Book Discounted Ride',
              onClick: () => {
                toast({
                  title: "Opening Ride Booking",
                  description: "Navigate to booking tab to use your discount",
                });
              }
            }
          });
        }

        // Discount available notification
        if (isPaymentPeriod(userGrantType)) {
          notifications.push({
            id: 'discount_available',
            type: 'discount_available',
            title: 'Transport Discount Active',
            message: `Your ${getDiscountPercentage(userGrantType)}% SASSA discount is available for all rides this month.`,
            date: today,
            read: false,
            urgent: false,
            action: {
              label: 'Book Ride Now',
              onClick: () => {
                toast({
                  title: "Discount Applied",
                  description: "Your discount will be automatically applied",
                });
              }
            }
          });
        }
      }

      // Transport info notifications
      notifications.push({
        id: 'transport_info',
        type: 'transport_info',
        title: 'Peak Hours Alert',
        message: 'Avoid peak hours (7-9 AM, 5-7 PM) for cheaper rates and shorter waiting times.',
        date: new Date(today.getTime() - 2 * 60 * 60 * 1000), // 2 hours ago
        read: false,
        urgent: false
      });

      // System notifications
      notifications.push({
        id: 'system_update',
        type: 'system',
        title: 'Service Update',
        message: 'New safety features added: Real-time driver tracking and emergency contacts.',
        date: new Date(today.getTime() - 24 * 60 * 60 * 1000), // 1 day ago
        read: false,
        urgent: false
      });

      return notifications.sort((a, b) => {
        // Sort by urgency first, then by date
        if (a.urgent && !b.urgent) return -1;
        if (!a.urgent && b.urgent) return 1;
        return b.date.getTime() - a.date.getTime();
      });
    };

    setNotifications(generateNotifications());
  }, [userGrantType, notificationsEnabled]);

  const getNextPaymentDate = (grantType: string): Date => {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    
    // Simplified logic - in real app, this would be more sophisticated
    let paymentDay = 5; // Default
    if (['old_age_pension', 'disability_grant'].includes(grantType)) {
      paymentDay = 3;
    } else if (grantType === 'war_veterans_grant') {
      paymentDay = 4;
    }

    let nextPayment = new Date(currentYear, currentMonth, paymentDay);
    if (nextPayment <= today) {
      nextPayment = new Date(currentYear, currentMonth + 1, paymentDay);
    }

    return nextPayment;
  };

  const isPaymentPeriod = (grantType: string): boolean => {
    // Simplified logic - assume payment period is 5 days after payment date
    const paymentDate = getNextPaymentDate(grantType);
    const today = new Date();
    const daysSincePayment = differenceInDays(today, paymentDate);
    return daysSincePayment >= -5 && daysSincePayment <= 5;
  };

  const getDiscountPercentage = (grantType: string): number => {
    switch (grantType) {
      case 'old_age_pension':
      case 'disability_grant':
        return 25;
      case 'child_support_grant':
      case 'foster_child_grant':
        return 20;
      case 'care_dependency_grant':
        return 30;
      case 'war_veterans_grant':
        return 35;
      default:
        return 15;
    }
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  const dismissNotification = (id: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  };

  const getTypeIcon = (type: Notification['type']) => {
    switch (type) {
      case 'payment_reminder':
        return <Calendar className="h-4 w-4" />;
      case 'discount_available':
        return <CheckCircle className="h-4 w-4" />;
      case 'transport_info':
        return <Info className="h-4 w-4" />;
      case 'system':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: Notification['type']) => {
    switch (type) {
      case 'payment_reminder':
        return 'text-primary';
      case 'discount_available':
        return 'text-success';
      case 'transport_info':
        return 'text-blue-600';
      case 'system':
        return 'text-orange-600';
      default:
        return 'text-muted-foreground';
    }
  };

  if (!notificationsEnabled) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <Bell className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              Enable notifications to receive payment reminders and transport updates
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const unreadCount = notifications.filter(n => !n.read).length;
  const displayNotifications = showAll ? notifications : notifications.slice(0, 3);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Notifications</CardTitle>
            {unreadCount > 0 && (
              <Badge variant="destructive" className="text-xs">
                {unreadCount}
              </Badge>
            )}
          </div>
          {notifications.length > 3 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAll(!showAll)}
            >
              {showAll ? 'Show Less' : `Show All (${notifications.length})`}
            </Button>
          )}
        </CardHeader>
        <CardContent className="space-y-3">
          {notifications.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-sm text-muted-foreground">No notifications</p>
            </div>
          ) : (
            displayNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-3 rounded-lg border transition-colors ${
                  notification.read 
                    ? 'bg-muted/30 border-muted' 
                    : notification.urgent
                    ? 'bg-destructive/5 border-destructive/20'
                    : 'bg-background border-border'
                } ${!notification.read ? 'border-l-4 border-l-primary' : ''}`}
              >
                <div className="flex items-start gap-3">
                  <div className={`mt-0.5 ${getTypeColor(notification.type)}`}>
                    {getTypeIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <h4 className={`font-medium text-sm ${
                          notification.urgent ? 'text-destructive' : ''
                        }`}>
                          {notification.title}
                          {notification.urgent && (
                            <Badge variant="destructive" className="ml-2 text-xs">
                              Urgent
                            </Badge>
                          )}
                        </h4>
                        <p className="text-xs text-muted-foreground mt-1">
                          {notification.message}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {isToday(notification.date) 
                            ? 'Today' 
                            : isTomorrow(notification.date)
                            ? 'Tomorrow'
                            : format(notification.date, 'MMM d, h:mm a')
                          }
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() => dismissNotification(notification.id)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                    {notification.action && (
                      <div className="flex gap-2 mt-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-xs"
                          onClick={() => {
                            notification.action?.onClick();
                            markAsRead(notification.id);
                          }}
                        >
                          {notification.action.label}
                        </Button>
                        {!notification.read && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 text-xs"
                            onClick={() => markAsRead(notification.id)}
                          >
                            Mark as Read
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
};