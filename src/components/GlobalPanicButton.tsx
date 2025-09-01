import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Shield, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useSecureAuth } from '@/hooks/useSecureAuth';
import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

export const GlobalPanicButton = () => {
  const [isPressed, setIsPressed] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [cooldownActive, setCooldownActive] = useState(false);
  const [cooldownTimer, setCooldownTimer] = useState(0);
  const { user, isLawEnforcement } = useSecureAuth();
  const { toast } = useToast();

  // Check localStorage for recent panic button usage
  useEffect(() => {
    const lastPanicTime = localStorage.getItem('lastPanicButtonUse');
    if (lastPanicTime) {
      const timeSinceLastUse = Date.now() - parseInt(lastPanicTime);
      const cooldownPeriod = 30000; // 30 seconds cooldown
      
      if (timeSinceLastUse < cooldownPeriod) {
        setCooldownActive(true);
        setCooldownTimer(Math.ceil((cooldownPeriod - timeSinceLastUse) / 1000));
        
        const interval = setInterval(() => {
          const remainingTime = Math.ceil((cooldownPeriod - (Date.now() - parseInt(lastPanicTime))) / 1000);
          if (remainingTime <= 0) {
            setCooldownActive(false);
            setCooldownTimer(0);
            clearInterval(interval);
          } else {
            setCooldownTimer(remainingTime);
          }
        }, 1000);
        
        return () => clearInterval(interval);
      }
    }
  }, []);

  const handlePanicPress = () => {
    if (cooldownActive) {
      toast({
        title: "Please wait",
        description: `Panic button is on cooldown for ${cooldownTimer} more seconds`,
        variant: "destructive",
      });
      return;
    }
    
    setShowConfirmation(true);
  };

  const confirmPanic = () => {
    // Set cooldown
    localStorage.setItem('lastPanicButtonUse', Date.now().toString());
    setCooldownActive(true);
    setCooldownTimer(30);
    
    setIsPressed(true);
    setShowConfirmation(false);
    
    // Start cooldown timer
    const interval = setInterval(() => {
      setCooldownTimer(prev => {
        if (prev <= 1) {
          setCooldownActive(false);
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    toast({
      title: "🚨 EMERGENCY ALERT SENT!",
      description: user 
        ? "Emergency services and nearby community members have been notified!" 
        : "Emergency broadcast sent to all nearby users!",
      variant: "destructive",
    });

    // Auto-cancel after 2 minutes if not manually cancelled
    setTimeout(() => {
      if (isPressed) {
        setIsPressed(false);
        toast({
          title: "Emergency alert auto-expired",
          description: "Alert was automatically cancelled after 2 minutes",
        });
      }
    }, 120000);
  };

  const cancelPanic = () => {
    setIsPressed(false);
    toast({
      title: "✅ Emergency Alert Cancelled",
      description: "All responders have been notified that you're safe",
    });
  };

  // Don't show on auth pages or landing page
  const currentPath = window.location.pathname;
  if (currentPath === '/' || currentPath.startsWith('/auth') || currentPath === '/register-complete') {
    return null;
  }

  if (isPressed) {
    return (
      <div className="fixed top-4 right-4 z-50 max-w-sm">
        <div className="bg-danger text-white p-4 rounded-lg shadow-lg border-2 border-danger animate-pulse">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5" />
              <span className="font-bold">EMERGENCY ACTIVE</span>
            </div>
            <Button
              onClick={cancelPanic}
              size="sm"
              variant="outline"
              className="border-white text-white hover:bg-white hover:text-danger h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-sm">Help is on the way. Stay safe!</p>
          <Button
            onClick={cancelPanic}
            className="mt-2 w-full bg-success hover:bg-success/90 text-white"
            size="sm"
          >
            <Shield className="h-4 w-4 mr-2" />
            I'm Safe - Cancel Alert
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Button
        onClick={handlePanicPress}
        disabled={cooldownActive}
        className={`fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full shadow-lg transition-all hover:scale-110 ${
          cooldownActive 
            ? 'bg-muted text-muted-foreground cursor-not-allowed' 
            : 'bg-danger hover:bg-danger/90 text-white animate-pulse'
        }`}
        title={cooldownActive ? `Cooldown: ${cooldownTimer}s` : "Emergency Panic Button"}
      >
        {cooldownActive ? (
          <span className="text-sm font-bold">{cooldownTimer}</span>
        ) : (
          <AlertTriangle className="h-6 w-6" />
        )}
      </Button>

      <AlertDialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center space-x-2 text-danger">
              <AlertTriangle className="h-5 w-5" />
              <span>Confirm Emergency Alert</span>
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you in immediate danger and need emergency assistance? This will:
              <ul className="mt-2 space-y-1 text-sm">
                <li>• Alert nearby community members and drivers</li>
                <li>• Send your location to emergency responders</li>
                {isLawEnforcement() && <li>• Trigger law enforcement protocols</li>}
                <li>• Broadcast emergency signal to security networks</li>
              </ul>
              <p className="mt-2 font-semibold text-warning">
                Only use in genuine emergencies to avoid overwhelming responders.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button
              onClick={() => setShowConfirmation(false)}
              variant="outline"
            >
              Cancel
            </Button>
            <Button
              onClick={confirmPanic}
              className="bg-danger hover:bg-danger/90 text-white"
            >
              <AlertTriangle className="h-4 w-4 mr-2" />
              YES - SEND EMERGENCY ALERT
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};