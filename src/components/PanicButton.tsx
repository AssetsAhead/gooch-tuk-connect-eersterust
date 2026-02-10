import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Shield, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { WhatsAppLocationShare } from "@/components/location/WhatsAppLocationShare";

interface PanicButtonProps {
  userType: "driver" | "passenger";
  userId: string;
  currentLocation?: string;
}

export const PanicButton = ({ userType, userId, currentLocation }: PanicButtonProps) => {
  const [isActive, setIsActive] = useState(false);
  const [nearbyHelpers] = useState([
    { id: "TT001", name: "Sipho M.", distance: "0.2km", type: "driver", eta: "1 min" },
    { id: "TT003", name: "Nomsa D.", distance: "0.4km", type: "driver", eta: "2 min" },
    { id: "guard1", name: "Security Guard", distance: "0.1km", type: "security", eta: "30 sec" }
  ]);
  const { toast } = useToast();

  const triggerPanic = () => {
    setIsActive(true);
    toast({
      title: "🚨 Emergency Alert Sent!",
      description: "All nearby community members have been notified. Help is on the way!",
      variant: "destructive",
    });

    // Simulate broadcasting to community
    setTimeout(() => {
      toast({
        title: "🛡️ Community Response Active",
        description: `3 helpers are heading to your location. ETA: 30 seconds`,
      });
    }, 2000);
  };

  const cancelPanic = () => {
    setIsActive(false);
    toast({
      title: "✅ Emergency Cancelled",
      description: "All responders have been notified that you're safe.",
    });
  };

  if (isActive) {
    return (
      <Card className="border-danger bg-danger/5">
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            <div className="animate-pulse">
              <AlertTriangle className="h-16 w-16 text-danger mx-auto mb-4" />
              <h3 className="text-xl font-bold text-danger">🚨 EMERGENCY ACTIVE 🚨</h3>
              <p className="text-muted-foreground">Broadcasting to all nearby community members...</p>
            </div>
            
            <div className="bg-card p-4 rounded-lg">
              <h4 className="font-bold mb-2 flex items-center">
                <Users className="h-4 w-4 mr-2" />
                Nearby Helpers Responding:
              </h4>
              <div className="space-y-2">
                {nearbyHelpers.map((helper) => (
                  <div key={helper.id} className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-2">
                      <Badge variant={helper.type === "driver" ? "default" : "secondary"}>
                        {helper.type === "driver" ? "🚗" : "🛡️"}
                      </Badge>
                      <span>{helper.name}</span>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-success">{helper.distance}</div>
                      <div className="text-xs text-muted-foreground">ETA: {helper.eta}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex space-x-4">
              <Button 
                onClick={cancelPanic} 
                className="flex-1 bg-success hover:bg-success/90"
              >
                <Shield className="h-4 w-4 mr-2" />
                I'm Safe - Cancel Alert
              </Button>
              <WhatsAppLocationShare
                variant="emergency"
                message="🚨 EMERGENCY — I need help! Here is my location:"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-danger/20 hover:border-danger transition-all">
      <CardContent className="p-6">
        <div className="text-center space-y-4">
          <Shield className="h-12 w-12 text-danger mx-auto" />
          <div>
            <h3 className="text-lg font-bold">Community Guardian Mode</h3>
            <p className="text-sm text-muted-foreground">
              Instant alert to all nearby drivers, security, and community members
            </p>
          </div>
          
          <div className="bg-muted/30 p-3 rounded-lg">
            <div className="flex items-center justify-center space-x-2 text-sm">
              <Users className="h-4 w-4 text-primary" />
              <span className="font-medium">{nearbyHelpers.length} helpers nearby</span>
              <Badge variant="outline" className="text-xs">
                Avg response: 45 seconds
              </Badge>
            </div>
          </div>

          <Button 
            onClick={triggerPanic}
            className="w-full bg-danger hover:bg-danger/90 text-white font-bold py-4"
          >
            <AlertTriangle className="h-5 w-5 mr-2" />
            🚨 EMERGENCY - NEED HELP NOW 🚨
          </Button>
          
          <p className="text-xs text-muted-foreground">
            This will alert police, nearby drivers, security guards, and community watch members
          </p>
        </div>
      </CardContent>
    </Card>
  );
};