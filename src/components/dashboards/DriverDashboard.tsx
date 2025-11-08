import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MapPin, Car, User, Settings, Trophy, Wallet } from "lucide-react";
import { MapsButton } from "@/components/MapsButton";
import { useState, useEffect } from "react";
import { PanicButton } from "@/components/PanicButton";
import { ReputationSystem } from "@/components/ReputationSystem";
import { CrimeMap } from "@/components/CrimeMap";
import { FinancialServices } from "@/components/FinancialServices";
import { TownshipEconomy } from "@/components/TownshipEconomy";
import { FinancialInclusion } from "@/components/FinancialInclusion";
import { CrimePreventionNetwork } from "@/components/CrimePreventionNetwork";
import { EnhancedMultiLanguageAssistant } from "@/components/EnhancedMultiLanguageAssistant";
import { EnhancedFinancialInclusion } from "@/components/EnhancedFinancialInclusion";
import { SocialProof } from "@/components/SocialProof";
import { DriverIncentives } from "@/components/DriverIncentives";
import { useRealTimeTracking } from "@/hooks/useRealTimeTracking";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { RealTimeMap } from "@/components/realtime/RealTimeMap";
import { LiveNotifications } from "@/components/realtime/LiveNotifications";
import { RideChat } from "@/components/realtime/RideChat";
import { LiveActivityFeed } from "@/components/realtime/LiveActivityFeed";
import { PushNotificationManager } from "@/components/realtime/PushNotificationManager";
import PaymentCollection from "@/components/payments/PaymentCollection";
import DriverLocationSharing from "@/components/location/DriverLocationSharing";
import { CameraManagementSystem } from "@/components/camera/CameraManagementSystem";
import { NotificationCenter } from "@/components/notifications/NotificationCenter";

export const DriverDashboard = () => {
  const [shiftStarted, setShiftStarted] = useState(false);
  const [availableRides, setAvailableRides] = useState([]);
  const [user, setUser] = useState(null);
  const { toast } = useToast();
  
  const { activeRide, rideUpdates, acceptRide, updateDriverLocation, updateRideStatus } = useRealTimeTracking(
    user?.id, 
    'driver'
  );

  // Get current user
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();
  }, []);

  // Fetch available rides when shift is started
  useEffect(() => {
    if (!shiftStarted || !user) return;

    const fetchAvailableRides = async () => {
      const { data, error } = await supabase
        .from('rides')
        .select('*')
        .eq('status', 'requested')
        .is('driver_id', null)
        .limit(5);
      
      if (!error && data) {
        setAvailableRides(data.map(ride => ({
          id: ride.id,
          pickup: ride.pickup_location,
          destination: ride.destination,
          fare: `R${ride.price}`,
          distance: `${Math.random() * 3 + 1}km`,
          surge: Math.random() > 0.6
        })));
      }
    };
    
    fetchAvailableRides();
    
    // Subscribe to new rides
    const ridesChannel = supabase
      .channel('new-rides')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'rides',
          filter: 'status=eq.requested',
        },
        () => fetchAvailableRides()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(ridesChannel);
    };
  }, [shiftStarted, user]);

  const handleAcceptRide = async (rideId: string) => {
    const success = await acceptRide(rideId);
    if (success) {
      setAvailableRides(prev => prev.filter(ride => ride.id !== rideId));
    }
  };

  const handleLocationUpdate = () => {
    if (navigator.geolocation && activeRide) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          updateDriverLocation(
            {
              lat: position.coords.latitude,
              lng: position.coords.longitude
            },
            new Date(Date.now() + 10 * 60 * 1000), // ETA: 10 minutes from now
            "On my way to pickup location"
          );
        },
        (error) => {
          console.error('Error getting location:', error);
          toast({
            title: "Location Error",
            description: "Unable to get your location",
            variant: "destructive",
          });
        }
      );
    }
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-primary mb-2">Driver Dashboard</h1>
              <div className="flex items-center space-x-4">
                <Badge variant={shiftStarted ? "default" : "secondary"} className="bg-success text-white">
                  {shiftStarted ? "On Duty" : "Off Duty"}
                </Badge>
                <span className="text-muted-foreground">Vehicle: TT001</span>
                <Badge className="bg-warning text-white animate-pulse">Level 3 Guardian 🛡️</Badge>
              </div>
            </div>
            <NotificationCenter />
            <div className="text-right">
              <div className="text-2xl font-bold text-success">R450</div>
              <p className="text-sm text-muted-foreground">Today's Earnings</p>
            </div>
          </div>
        </div>

        <Tabs defaultValue="rides" className="space-y-6">
          <TabsList className="grid w-full grid-cols-12">
            <TabsTrigger value="rides">🚗 Rides</TabsTrigger>
            <TabsTrigger value="cameras">📹 Cameras</TabsTrigger>
            <TabsTrigger value="location">📍 Location</TabsTrigger>
            <TabsTrigger value="realtime">📡 Live</TabsTrigger>
            <TabsTrigger value="incentives">🎯 Incentives</TabsTrigger>
            <TabsTrigger value="reputation">🏆 Reputation</TabsTrigger>
            <TabsTrigger value="safety">🛡️ Safety</TabsTrigger>
            <TabsTrigger value="economy">🏪 Economy</TabsTrigger>
            <TabsTrigger value="assistant">🗣️ Assistant</TabsTrigger>
            <TabsTrigger value="wallet">💰 Wallet</TabsTrigger>
            <TabsTrigger value="community">👥 Community</TabsTrigger>
            <TabsTrigger value="emergency">🚨 Emergency</TabsTrigger>
          </TabsList>

          <TabsContent value="rides" className="space-y-6">

            {/* Shift Control */}
            <Card className="mb-8">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold mb-2">Shift Status</h3>
                    <p className="text-muted-foreground">
                      {shiftStarted ? "You're currently on duty and available for rides" : "Start your shift to begin receiving ride requests"}
                    </p>
                  </div>
                  <Button 
                    onClick={() => setShiftStarted(!shiftStarted)}
                    className={shiftStarted ? "bg-danger hover:bg-danger/90" : "bg-success hover:bg-success/90"}
                  >
                    {shiftStarted ? "End Shift" : "Start Shift"}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Today's Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <Card className="border-success/20">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-success">R450</div>
                  <p className="text-xs text-muted-foreground">Today's Earnings</p>
                  <Badge className="bg-success/20 text-success text-xs mt-1">+15% vs yesterday</Badge>
                </CardContent>
              </Card>
              <Card className="border-primary/20">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-primary">18</div>
                  <p className="text-xs text-muted-foreground">Rides Completed</p>
                  <Badge className="bg-primary/20 text-primary text-xs mt-1">Rank #3 today</Badge>
                </CardContent>
              </Card>
              <Card className="border-tuk-blue/20">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-tuk-blue">4.7⭐</div>
                  <p className="text-xs text-muted-foreground">Rating</p>
                  <Badge className="bg-tuk-blue/20 text-tuk-blue text-xs mt-1">85 community points</Badge>
                </CardContent>
              </Card>
              <Card className="border-warning/20">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-warning">45km</div>
                  <p className="text-xs text-muted-foreground">Distance</p>
                  <Badge className="bg-warning/20 text-warning text-xs mt-1">Eco-friendly 🌱</Badge>
                </CardContent>
              </Card>
            </div>

            {/* Active Ride */}
            {activeRide && (
              <Card className="mb-8 border-success/20">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Car className="mr-2 h-5 w-5" />
                      Active Ride
                    </div>
                    <Badge className={`${
                      activeRide.status === 'accepted' ? 'bg-warning' :
                      activeRide.status === 'in_progress' ? 'bg-primary' :
                      'bg-secondary'
                    } text-white`}>
                      {activeRide.status?.toUpperCase()}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-success/5 rounded-lg">
                    <div>
                      <div className="font-medium">{activeRide.pickup_location} → {activeRide.destination}</div>
                      <div className="text-sm text-muted-foreground">Fare: R{activeRide.price}</div>
                    </div>
                    <MapsButton 
                      destination={activeRide.destination}
                      startLocation={activeRide.pickup_location}
                      variant="outline"
                      size="sm"
                    />
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button 
                      onClick={handleLocationUpdate}
                      variant="outline"
                      size="sm"
                    >
                      Update Location
                    </Button>
                    {activeRide.status === 'accepted' && (
                      <Button 
                        onClick={() => updateRideStatus('in_progress')}
                        className="bg-primary hover:bg-primary/90"
                        size="sm"
                      >
                        Start Trip
                      </Button>
                    )}
                    {activeRide.status === 'in_progress' && (
                      <Button 
                        onClick={() => updateRideStatus('completed')}
                        className="bg-success hover:bg-success/90"
                        size="sm"
                      >
                        Complete Trip
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Available Rides */}
            {shiftStarted && !activeRide && (
              <Card className="mb-8 border-primary/20">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center">
                      <MapPin className="mr-2 h-5 w-5" />
                      🔥 Available Rides
                    </div>
                    <Badge className="bg-primary text-white">
                      {availableRides.length} rides
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {availableRides.map((ride) => (
                      <div 
                        key={ride.id} 
                        className={`flex items-center justify-between p-4 rounded-lg border transition-all hover:scale-102 ${
                          ride.surge 
                            ? "bg-gradient-to-r from-warning/10 to-success/10 border-warning/20" 
                            : "bg-muted/30 border-muted/20"
                        }`}
                      >
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-medium">{ride.pickup} → {ride.destination}</span>
                            {ride.surge && (
                              <Badge className="bg-warning text-white text-xs animate-pulse">
                                🔥 Surge +50%
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">Distance: {ride.distance} • ETA: ~12 min</p>
                        </div>
                         <div className="flex items-center space-x-2">
                           <MapsButton 
                             destination={ride.destination}
                             startLocation={ride.pickup}
                             variant="outline"
                             size="sm"
                           />
                           <div className="text-right">
                             <div className="font-bold text-success text-lg">{ride.fare}</div>
                             <div className="text-xs text-muted-foreground">+5 points</div>
                           </div>
                           <Button 
                             size="sm" 
                             className={`${
                               ride.surge 
                                 ? "bg-warning hover:bg-warning/90 animate-pulse" 
                                 : "bg-primary hover:bg-primary/90"
                             }`}
                             onClick={() => handleAcceptRide(ride.id)}
                           >
                             Accept Ride
                           </Button>
                         </div>
                      </div>
                    ))}
                  </div>
                  
                  {availableRides.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      No rides available at the moment. Check back soon!
                    </div>
                  )}
                  
                  <div className="mt-4 p-3 bg-gradient-to-r from-primary/10 to-success/10 rounded-lg">
                    <div className="flex items-center justify-center space-x-2">
                      <Trophy className="h-4 w-4 text-warning" />
                      <span className="font-medium">Daily Challenge:</span>
                      <span className="text-sm">Complete 5 more rides for +50 bonus points!</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="cameras" className="space-y-6">
            <CameraManagementSystem userRole="driver" vehicleId="TT001" />
          </TabsContent>

          <TabsContent value="location" className="space-y-6">
            <DriverLocationSharing 
              userId={user?.id || ''}
              onShiftStart={() => setShiftStarted(true)}
              onShiftEnd={() => setShiftStarted(false)}
            />
          </TabsContent>

          <TabsContent value="realtime" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <RealTimeMap 
                rideId={activeRide?.id} 
                userType="driver" 
                showDrivers={true} 
              />
              <LiveNotifications 
                userId={user?.id || 'driver-001'} 
                userType="driver" 
              />
            </div>
            
            {activeRide && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <RideChat 
                  rideId={activeRide.id}
                  userId={user?.id || 'driver-001'}
                  userType="driver"
                  passengerName="Passenger"
                />
                <PushNotificationManager 
                  userId={user?.id || 'driver-001'} 
                  userType="driver" 
                />
              </div>
            )}
            
            <LiveActivityFeed />
          </TabsContent>

          <TabsContent value="incentives">
            <DriverIncentives />
          </TabsContent>

          <TabsContent value="reputation">
            <ReputationSystem 
              userType="driver" 
              currentPoints={650} 
              currentLevel={2} 
              badges={["lost_found", "safety", "perfect_week"]} 
            />
          </TabsContent>

          <TabsContent value="safety">
            <CrimeMap />
            <CrimePreventionNetwork />
          </TabsContent>

          <TabsContent value="economy">
            <TownshipEconomy />
            <EnhancedFinancialInclusion />
          </TabsContent>

          <TabsContent value="assistant">
            <EnhancedMultiLanguageAssistant />
          </TabsContent>

          <TabsContent value="wallet">
            <PaymentCollection userType="driver" userId={user?.id || ''} />
          </TabsContent>

          <TabsContent value="community">
            <SocialProof />
          </TabsContent>

          <TabsContent value="emergency">
            <PanicButton userType="driver" userId="TT001" currentLocation="Denlyn Mall" />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};