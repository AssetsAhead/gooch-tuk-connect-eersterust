import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MapPin, Car, User, Settings, Trophy, Wallet } from "lucide-react";
import { useState } from "react";
import { PanicButton } from "@/components/PanicButton";
import { ReputationSystem } from "@/components/ReputationSystem";
import { CrimeMap } from "@/components/CrimeMap";
import { FinancialServices } from "@/components/FinancialServices";
import { SocialProof } from "@/components/SocialProof";

export const DriverDashboard = () => {
  const [shiftStarted, setShiftStarted] = useState(false);
  const [availableRides] = useState([
    { id: 1, pickup: "Denlyn Mall", destination: "Municipal Clinic", fare: "R25", distance: "2.1km", surge: true },
    { id: 2, pickup: "Pick n Pay Complex", destination: "Highlands Park", fare: "R15", distance: "1.8km", surge: false },
    { id: 3, pickup: "Silverton", destination: "Eastlynne", fare: "R30", distance: "3.2km", surge: true }
  ]);

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
            <div className="text-right">
              <div className="text-2xl font-bold text-success">R450</div>
              <p className="text-sm text-muted-foreground">Today's Earnings</p>
            </div>
          </div>
        </div>

        <Tabs defaultValue="rides" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="rides">🚗 Rides</TabsTrigger>
            <TabsTrigger value="reputation">🏆 Reputation</TabsTrigger>
            <TabsTrigger value="safety">🛡️ Safety</TabsTrigger>
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

            {/* Available Rides */}
            {shiftStarted && (
              <Card className="mb-8 border-primary/20">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center">
                      <MapPin className="mr-2 h-5 w-5" />
                      🔥 Hot Rides Available
                    </div>
                    <Badge className="bg-primary text-white animate-pulse">3 surge areas</Badge>
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
                        <div className="flex items-center space-x-4">
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
                          >
                            Accept Ride
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                  
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
          </TabsContent>

          <TabsContent value="wallet">
            <FinancialServices userType="driver" currentBalance={450} />
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