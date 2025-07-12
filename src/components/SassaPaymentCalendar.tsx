import React, { useState, useEffect } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Bell, BellOff, CalendarDays } from 'lucide-react';
import { format, isSameDay, addDays, startOfMonth, endOfMonth } from 'date-fns';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface PaymentDate {
  date: Date;
  grantTypes: string[];
  description: string;
}

interface SassaPaymentCalendarProps {
  userGrantType?: string;
  onNotificationToggle?: (enabled: boolean) => void;
}

export const SassaPaymentCalendar: React.FC<SassaPaymentCalendarProps> = ({
  userGrantType,
  onNotificationToggle
}) => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [paymentDates, setPaymentDates] = useState<PaymentDate[]>([]);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const { toast } = useToast();

  // Generate SASSA payment dates for the current month
  useEffect(() => {
    const generatePaymentDates = () => {
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();
      
      // SASSA payment schedule (typical dates)
      const payments: PaymentDate[] = [
        {
          date: new Date(currentYear, currentMonth, 3),
          grantTypes: ['old_age_pension', 'disability_grant'],
          description: 'Old Age Pension & Disability Grant'
        },
        {
          date: new Date(currentYear, currentMonth, 4),
          grantTypes: ['war_veterans_grant'],
          description: 'War Veterans Grant'
        },
        {
          date: new Date(currentYear, currentMonth, 5),
          grantTypes: ['child_support_grant', 'foster_child_grant', 'care_dependency_grant'],
          description: 'Child Support, Foster Child & Care Dependency Grants'
        },
        // Next month dates
        {
          date: new Date(currentYear, currentMonth + 1, 3),
          grantTypes: ['old_age_pension', 'disability_grant'],
          description: 'Old Age Pension & Disability Grant'
        },
        {
          date: new Date(currentYear, currentMonth + 1, 4),
          grantTypes: ['war_veterans_grant'],
          description: 'War Veterans Grant'
        },
        {
          date: new Date(currentYear, currentMonth + 1, 5),
          grantTypes: ['child_support_grant', 'foster_child_grant', 'care_dependency_grant'],
          description: 'Child Support, Foster Child & Care Dependency Grants'
        }
      ];

      setPaymentDates(payments);
    };

    generatePaymentDates();
  }, []);

  const isPaymentDate = (date: Date): PaymentDate | undefined => {
    return paymentDates.find(payment => isSameDay(payment.date, date));
  };

  const isUserGrantDate = (date: Date): boolean => {
    if (!userGrantType) return false;
    const paymentDate = isPaymentDate(date);
    return paymentDate ? paymentDate.grantTypes.includes(userGrantType) : false;
  };

  const handleNotificationToggle = () => {
    const newState = !notificationsEnabled;
    setNotificationsEnabled(newState);
    onNotificationToggle?.(newState);
    
    toast({
      title: newState ? "Notifications Enabled" : "Notifications Disabled",
      description: newState 
        ? "You'll receive reminders about payment dates and transport discounts"
        : "You won't receive payment notifications anymore",
    });
  };

  const selectedDatePayment = selectedDate ? isPaymentDate(selectedDate) : null;
  const daysUntilNextPayment = () => {
    const now = new Date();
    const nextPayment = paymentDates.find(payment => payment.date > now);
    if (!nextPayment) return null;
    
    const diffTime = nextPayment.date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return { days: diffDays, payment: nextPayment };
  };

  const nextPaymentInfo = daysUntilNextPayment();

  return (
    <div className="space-y-6">
      {/* Header with notification toggle */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">SASSA Payment Calendar</CardTitle>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleNotificationToggle}
            className="flex items-center gap-2"
          >
            {notificationsEnabled ? (
              <>
                <Bell className="h-4 w-4" />
                Notifications On
              </>
            ) : (
              <>
                <BellOff className="h-4 w-4" />
                Notifications Off
              </>
            )}
          </Button>
        </CardHeader>
        <CardContent>
          {nextPaymentInfo && (
            <div className="mb-4 p-3 bg-primary/5 rounded-lg border border-primary/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-primary">
                    Next Payment: {format(nextPaymentInfo.payment.date, 'MMMM d, yyyy')}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {nextPaymentInfo.payment.description}
                  </p>
                </div>
                <Badge variant="secondary" className="ml-2">
                  {nextPaymentInfo.days} day{nextPaymentInfo.days !== 1 ? 's' : ''}
                </Badge>
              </div>
              {userGrantType && nextPaymentInfo.payment.grantTypes.includes(userGrantType) && (
                <div className="mt-2 p-2 bg-success/10 rounded border border-success/20">
                  <p className="text-sm text-success font-medium">
                    ✓ Your transport discount will be available after this payment
                  </p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Calendar */}
      <Card>
        <CardContent className="p-6">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            className="rounded-md border w-full"
            modifiers={{
              paymentDate: (date) => !!isPaymentDate(date),
              userPaymentDate: (date) => isUserGrantDate(date),
            }}
            modifiersStyles={{
              paymentDate: {
                backgroundColor: 'hsl(var(--primary) / 0.1)',
                color: 'hsl(var(--primary))',
                fontWeight: 'bold'
              },
              userPaymentDate: {
                backgroundColor: 'hsl(var(--success) / 0.2)',
                color: 'hsl(var(--success))',
                fontWeight: 'bold',
                border: '2px solid hsl(var(--success))'
              }
            }}
          />
        </CardContent>
      </Card>

      {/* Selected date details */}
      {selectedDatePayment && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              {format(selectedDate!, 'MMMM d, yyyy')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <h4 className="font-medium mb-2">Payment Information</h4>
                <p className="text-sm text-muted-foreground">
                  {selectedDatePayment.description}
                </p>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Eligible Grants</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedDatePayment.grantTypes.map((grantType) => (
                    <Badge 
                      key={grantType}
                      variant={userGrantType === grantType ? "default" : "secondary"}
                      className={cn(
                        userGrantType === grantType && "bg-success text-success-foreground"
                      )}
                    >
                      {grantType.replace(/_/g, ' ').toUpperCase()}
                    </Badge>
                  ))}
                </div>
              </div>

              {isUserGrantDate(selectedDate!) && (
                <div className="p-3 bg-success/10 rounded-lg border border-success/20">
                  <p className="text-sm font-medium text-success">
                    🎉 This is your payment date! Your transport discounts will be available.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Legend */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Legend</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 rounded bg-primary/20 border border-primary"></div>
            <span className="text-sm">SASSA Payment Date</span>
          </div>
          {userGrantType && (
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 rounded bg-success/20 border-2 border-success"></div>
              <span className="text-sm">Your Payment Date</span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};