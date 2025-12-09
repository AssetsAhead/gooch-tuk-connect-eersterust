import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MapPin, Car, User, Shield, Heart } from "lucide-react";
import { useState, useEffect } from "react";
import { PanicButton } from "@/components/PanicButton";
import { ReputationSystem } from "@/components/ReputationSystem";
import { CrimeMap } from "@/components/CrimeMap";
import { SocialProof } from "@/components/SocialProof";
import { SassaVerification } from "@/components/SassaVerification";
import { NotificationSystem } from "@/components/NotificationSystem";
import { SassaPaymentCalendar } from "@/components/SassaPaymentCalendar";
import { useRealTimeTracking } from "@/hooks/useRealTimeTracking";
import { useSassaDiscount } from "@/hooks/useSassaDiscount";
import { supabase } from "@/integrations/supabase/client";
import { MapsButton } from "@/components/MapsButton";
import { useToast } from "@/hooks/use-toast";
import { RealTimeMap } from "@/components/realtime/RealTimeMap";
import { LiveNotifications } from "@/components/realtime/LiveNotifications";
import { RideChat } from "@/components/realtime/RideChat";
import { LiveActivityFeed } from "@/components/realtime/LiveActivityFeed";
import { PushNotificationManager } from "@/components/realtime/PushNotificationManager";
import { FinancialInclusion } from "@/components/FinancialInclusion";
import { TownshipEconomy } from "@/components/TownshipEconomy";
import { EnhancedMultiLanguageAssistant } from "@/components/EnhancedMultiLanguageAssistant";
import { CrimePreventionNetwork } from "@/components/CrimePreventionNetwork";
import { EnhancedFinancialInclusion } from "@/components/EnhancedFinancialInclusion";
import { SmartLocationInput } from "@/components/SmartLocationInput";
import { RoleRequestForm } from "@/components/roles/RoleRequestForm";
import { MyRoleRequests } from "@/components/roles/MyRoleRequests";
import { NotificationCenter } from "@/components/notifications/NotificationCenter";
import { SmartHailCard } from "@/components/hailing/SmartHailCard";

export const PassengerDashboard = () => {
  const [pickup, setPickup] = useState("");
  const [destination, setDestination] = useState("");
  const [activeTab, setActiveTab] = useState("booking");
  const [nearbyDrivers, setNearbyDrivers] = useState([]);
  
  const { user, userProfile, signOut } = useAuth();
  const { toast } = useToast();
  
  const { activeRide, rideUpdates, createRide, isLoading } = useRealTimeTracking(
    user?.id, 
    'passenger'
  );
  
  const { discountInfo, calculateDiscountedPrice, loading: discountLoading } = useSassaDiscount(user?.id);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  // Fetch nearby drivers
  useEffect(() => {
    const fetchNearbyDrivers = async () => {
      const { data, error } = await supabase
        .from('drivers')
        .select('*')
        .eq('status', 'online')
        .limit(5);
      
      if (!error && data) {
        setNearbyDrivers(data.map(driver => ({
          id: driver.id,
          driver: driver.name,
          rating: driver.rating || 4.5,
          distance: `${Math.random() * 2 + 0.1}km`,
          eta: `${Math.floor(Math.random() * 10 + 3)} min`,
          fare: `R${Math.floor(Math.random() * 15 + 15)}`
        })));
      }
    };
    
    fetchNearbyDrivers();
  }, []);

  const saveSuggestion = async (field: 'pickup' | 'destination', text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    const key = `loc_suggestions:${user?.id || 'anon'}:${field}`;
    try {
      const existing: string[] = JSON.parse(localStorage.getItem(key) || '[]');
      const next = [trimmed, ...existing.filter((s) => s.toLowerCase() !== trimmed.toLowerCase())].slice(0, 20);
      localStorage.setItem(key, JSON.stringify(next));
    } catch (e) {}
    try {
      await supabase.from('analytics_events').insert({
        event_type: 'location_input',
        user_id: user?.id ?? null,
        session_id: crypto?.randomUUID?.() ?? 'web',
        event_data: { field, value: trimmed },
        page_url: window.location.pathname,
        user_agent: navigator.userAgent,
      });
    } catch (e) {}
  };

  const handleBookRide = async () => {
    if (!pickup || !destination) {
      toast({
        title: "Missing Information",
        description: "Please enter both pickup and destination",
        variant: "destructive",
      });
      return;
    }

    const originalPrice = Math.floor(Math.random() * 30 + 15);
    const { finalPrice } = calculateDiscountedPrice(originalPrice);
    await saveSuggestion('pickup', pickup);
    await saveSuggestion('destination', destination);
    await createRide(pickup, destination, "standard", finalPrice);
  };

  const quickDestinations = [
    { name: "Denlyn Mall", fare: "R15", time: "5 min" },
    { name: "Municipal Clinic", fare: "R20", time: "8 min" },
    { name: "Pick n Pay Complex", fare: "R15", time: "6 min" },
    { name: "Highlands Park", fare: "R25", time: "12 min" },
    { name: "Mamelodi Mall", fare: "R30", time: "15 min" },
    { name: "Silverton", fare: "R25", time: "10 min" }
  ];

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-primary mb-2">
              Welcome, {userProfile?.display_name || userProfile?.name || user?.email}
            </h1>
            <p className="text-muted-foreground">Safe, affordable transport & community safety</p>
          </div>
          <div className="flex items-center gap-2">
            <NotificationCenter />
            <Button variant="outline" onClick={signOut}>
              Sign Out
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-9 mb-8">
            <TabsTrigger value="booking">🚗 Book Ride</TabsTrigger>
            <TabsTrigger value="realtime">📍 Live</TabsTrigger>
            <TabsTrigger value="community">🛡️ Community</TabsTrigger>
            <TabsTrigger value="safety">🚨 Safety</TabsTrigger>
            <TabsTrigger value="economy">🏪 Economy</TabsTrigger>
            <TabsTrigger value="assistant">🗣️ Assistant</TabsTrigger>
            <TabsTrigger value="rewards">⭐ Rewards</TabsTrigger>
            <TabsTrigger value="payments">💰 Payments</TabsTrigger>
            <TabsTrigger value="roles">👤 Roles</TabsTrigger>
          </TabsList>

          {/* Booking Tab */}
          <TabsContent value="booking" className="space-y-6">
            {/* Smart Hail Card - The Main Hailing Experience */}
            <SmartHailCard
              userId={user?.id}
              onRideCreated={(ride) => {
                toast({
                  title: "🚗 Ride Created!",
                  description: `Your ride to ${ride.destination} has been booked.`,
                });
              }}
              discountInfo={{
                isVerified: discountInfo.isVerified,
                discountPercentage: discountInfo.discountPercentage
              }}
            />

            {/* Active Ride Tracking */}
            {activeRide && (
              <Card className="border-primary/50 bg-primary/5">
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
                  <div className="flex items-center justify-between p-4 bg-background rounded-lg">
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
                  
                  {rideUpdates.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm">Real-time Updates:</h4>
                      {rideUpdates.slice(0, 3).map((update) => (
                        <div key={update.id} className="p-3 bg-muted/30 rounded-lg">
                          <div className="flex justify-between items-start">
                            <div>
                              {update.status_message && (
                                <p className="text-sm">{update.status_message}</p>
                              )}
                              {update.estimated_arrival && (
                                <p className="text-xs text-muted-foreground">
                                  ETA: {new Date(update.estimated_arrival).toLocaleTimeString()}
                                </p>
                              )}
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {new Date(update.created_at).toLocaleTimeString()}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Pricing Info */}
            <Card className="border-muted">
              <CardContent className="p-4">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-semibold text-sm">Fare Guide</h3>
                  {discountInfo.isVerified && (
                    <Badge className="bg-success/20 text-success text-xs">
                      -{discountInfo.discountPercentage}% SASSA
                    </Badge>
                  )}
                </div>
                <div className="grid grid-cols-4 gap-2 text-center text-xs">
                  <div className="p-2 bg-muted/30 rounded">
                    <div className="font-bold text-success">R15</div>
                    <p className="text-muted-foreground">In-Poort</p>
                  </div>
                  <div className="p-2 bg-muted/30 rounded">
                    <div className="font-bold text-tuk-orange">R25</div>
                    <p className="text-muted-foreground">Out-Poort</p>
                  </div>
                  <div className="p-2 bg-muted/30 rounded">
                    <div className="font-bold text-tuk-blue">R30</div>
                    <p className="text-muted-foreground">Night</p>
                  </div>
                  <div className="p-2 bg-muted/30 rounded">
                    <div className="font-bold text-warning">R50</div>
                    <p className="text-muted-foreground">Night Out</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Legacy Quick Destinations - keeping for reference */}
            <Card className="mb-8 hidden">
              <CardHeader>
                <CardTitle>Popular Destinations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {quickDestinations.map((dest, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                      <div>
                        <div className="font-medium">{dest.name}</div>
                        <p className="text-sm text-muted-foreground">~{dest.time}</p>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-success">{dest.fare}</div>
                        <Button size="sm" variant="outline" className="text-xs">
                          Book
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Active Ride Tracking */}
            {activeRide && (
              <Card className="mb-8 border-primary/20">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Car className="mr-2 h-5 w-5" />
                      Current Ride
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
                  <div className="flex items-center justify-between p-4 bg-primary/5 rounded-lg">
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
                  
                  {rideUpdates.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm">Real-time Updates:</h4>
                      {rideUpdates.slice(0, 3).map((update) => (
                        <div key={update.id} className="p-3 bg-muted/30 rounded-lg">
                          <div className="flex justify-between items-start">
                            <div>
                              {update.status_message && (
                                <p className="text-sm">{update.status_message}</p>
                              )}
                              {update.estimated_arrival && (
                                <p className="text-xs text-muted-foreground">
                                  ETA: {new Date(update.estimated_arrival).toLocaleTimeString()}
                                </p>
                              )}
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {new Date(update.created_at).toLocaleTimeString()}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Nearby Drivers */}
            {!activeRide && (
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Car className="mr-2 h-5 w-5" />
                    Nearby Drivers
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {nearbyDrivers.map((driver) => (
                      <div key={driver.id} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-bold">
                            {driver.driver.charAt(0)}
                          </div>
                          <div>
                            <div className="flex items-center space-x-2">
                              <span className="font-medium">{driver.driver}</span>
                              <Badge variant="outline" className="text-xs">{driver.id}</Badge>
                            </div>
                            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                              <span>★ {driver.rating}</span>
                              <span>•</span>
                              <span>{driver.distance} away</span>
                              <span>•</span>
                              <span>{driver.eta}</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-success mb-2">{driver.fare}</div>
                          <Button size="sm" className="bg-primary hover:bg-primary/90">
                            Book Now
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
            
            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button variant="outline" className="h-16 text-center">
                <div>
                  <User className="h-5 w-5 mx-auto mb-1" />
                  <div className="text-sm">Report Lost Item</div>
                </div>
              </Button>
              <Button variant="outline" className="h-16 text-center">
                <div>
                  <MapPin className="h-5 w-5 mx-auto mb-1" />
                  <div className="text-sm">Rate Last Ride</div>
                </div>
              </Button>
              <Button variant="outline" className="h-16 text-center border-danger text-danger">
                <div>
                  <Shield className="h-5 w-5 mx-auto mb-1" />
                  <div className="text-sm">Emergency Help</div>
                </div>
              </Button>
            </div>
          </TabsContent>

          {/* Real-time Tab */}
          <TabsContent value="realtime" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <RealTimeMap 
                rideId={activeRide?.id} 
                userType="passenger" 
                showDrivers={true} 
              />
              <LiveNotifications 
                userId={user?.id || 'passenger-001'} 
                userType="passenger" 
              />
            </div>
            
            {activeRide && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <RideChat 
                  rideId={activeRide.id}
                  userId={user?.id || 'passenger-001'}
                  userType="passenger"
                  driverName="Driver"
                />
                <PushNotificationManager 
                  userId={user?.id || 'passenger-001'} 
                  userType="passenger" 
                />
              </div>
            )}
            
            <LiveActivityFeed />
          </TabsContent>

          {/* Community Tab */}
          <TabsContent value="community" className="space-y-6">
            <SassaVerification />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <PanicButton userType="passenger" userId="passenger-001" currentLocation="Eersterust Shopping Centre" />
              <SocialProof />
            </div>
            <CrimeMap />
          </TabsContent>

          {/* Safety Tab */}
          <TabsContent value="safety" className="space-y-6">
            <CrimeMap />
            <CrimePreventionNetwork />
            <PanicButton userType="passenger" userId={user?.id || 'passenger-001'} currentLocation="Current Location" />
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="border-danger/20">
                <CardHeader>
                  <CardTitle className="flex items-center text-danger">
                    <Shield className="h-6 w-6 mr-2" />
                    Emergency Contacts
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-danger/5 rounded-lg">
                    <span>Police Emergency</span>
                    <Button size="sm" className="bg-danger hover:bg-danger/90">10111</Button>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-warning/5 rounded-lg">
                    <span>Medical Emergency</span>
                    <Button size="sm" className="bg-warning hover:bg-warning/90">10177</Button>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-tuk-blue/5 rounded-lg">
                    <span>Taxi Marshal</span>
                    <Button size="sm" className="bg-tuk-blue hover:bg-tuk-blue/90">Call</Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-success/20">
                <CardHeader>
                  <CardTitle className="flex items-center text-success">
                    <Heart className="h-6 w-6 mr-2" />
                    Safety Tips
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="p-3 bg-success/5 rounded-lg">
                    <h4 className="font-medium mb-2">🚗 In Transit</h4>
                    <p className="text-sm text-muted-foreground">Always verify driver ID and vehicle registration</p>
                  </div>
                  <div className="p-3 bg-tuk-orange/5 rounded-lg">
                    <h4 className="font-medium mb-2">📱 Share Location</h4>
                    <p className="text-sm text-muted-foreground">Let family know your trip details</p>
                  </div>
                  <div className="p-3 bg-primary/5 rounded-lg">
                    <h4 className="font-medium mb-2">💰 Payment</h4>
                    <p className="text-sm text-muted-foreground">Use exact change when possible</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Economy Tab */}
          <TabsContent value="economy" className="space-y-6">
            <TownshipEconomy />
            <EnhancedFinancialInclusion />
          </TabsContent>

          {/* Assistant Tab */}
          <TabsContent value="assistant" className="space-y-6">
            <EnhancedMultiLanguageAssistant />
          </TabsContent>

          {/* Rewards Tab */}
          <TabsContent value="rewards" className="space-y-6">
            <ReputationSystem 
              userType="passenger" 
              currentPoints={320} 
              currentLevel={1} 
              badges={["perfect_week"]} 
            />
          </TabsContent>

          {/* Payments Tab */}
          <TabsContent value="payments" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <SassaPaymentCalendar 
                  userGrantType={discountInfo.grantType || undefined}
                  onNotificationToggle={setNotificationsEnabled}
                />
              </div>
              <div>
                <NotificationSystem 
                  userGrantType={discountInfo.grantType || undefined}
                  notificationsEnabled={notificationsEnabled}
                />
              </div>
            </div>
          </TabsContent>

          {/* Roles Tab */}
          <TabsContent value="roles" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <RoleRequestForm />
              <MyRoleRequests />
            </div>
          </TabsContent>
        </Tabs>
        <div className="fixed bottom-4 right-4 z-50">
          <Button variant="secondary" onClick={() => setActiveTab('payments')} className="shadow-lg">
            SASSA Calendar
          </Button>
        </div>
      </div>
    </div>
  );
};