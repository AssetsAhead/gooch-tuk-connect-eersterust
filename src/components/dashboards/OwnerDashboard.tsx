import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MapPin, Car, Settings, User, Shield, TrendingUp } from "lucide-react";
import { useState } from "react";
import { PanicButton } from "@/components/PanicButton";
import { ReputationSystem } from "@/components/ReputationSystem";
import { CrimeMap } from "@/components/CrimeMap";
import { SocialProof } from "@/components/SocialProof";

export const OwnerDashboard = () => {
  const [activeTab, setActiveTab] = useState("fleet");
  
  const vehicles = [
    { id: "TT001", driver: "Sipho Mthembu", status: "Active", location: "Denlyn Mall", earnings: "R320" },
    { id: "TT002", driver: "Nomsa Dube", status: "Offline", location: "Pick n Pay Complex", earnings: "R180" },
    { id: "TT003", driver: "Thabo Nkomo", status: "Active", location: "Municipal Clinic", earnings: "R450" }
  ];

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-primary mb-2">Owner Dashboard</h1>
          <p className="text-muted-foreground">Track your fleet, earnings, and community impact</p>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="fleet">🚗 Fleet</TabsTrigger>
            <TabsTrigger value="community">🛡️ Community</TabsTrigger>
            <TabsTrigger value="analytics">📊 Analytics</TabsTrigger>
            <TabsTrigger value="safety">🚨 Safety</TabsTrigger>
          </TabsList>

          {/* Fleet Tab */}
          <TabsContent value="fleet" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <Card className="border-primary/20">
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <Car className="h-8 w-8 text-primary" />
                    <div className="ml-4">
                      <p className="text-2xl font-bold">3</p>
                      <p className="text-xs text-muted-foreground">Active Vehicles</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-success/20">
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="h-8 w-8 bg-success rounded-full flex items-center justify-center text-white text-sm font-bold">R</div>
                    <div className="ml-4">
                      <p className="text-2xl font-bold text-success">R950</p>
                      <p className="text-xs text-muted-foreground">Today's Earnings</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-warning/20">
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <User className="h-8 w-8 text-warning" />
                    <div className="ml-4">
                      <p className="text-2xl font-bold">2</p>
                      <p className="text-xs text-muted-foreground">Active Drivers</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-danger/20">
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <Settings className="h-8 w-8 text-danger" />
                    <div className="ml-4">
                      <p className="text-2xl font-bold">1</p>
                      <p className="text-xs text-muted-foreground">Maintenance Due</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* ... keep existing code (vehicle tracking and driver performance) */}
            
            {/* Action Buttons */}
            <div className="mt-8 flex flex-wrap gap-4">
              <Button className="bg-primary hover:bg-primary/90">
                Add New Driver
              </Button>
              <Button variant="outline" className="border-secondary text-secondary">
                Vehicle Maintenance Log
              </Button>
              <Button variant="outline" className="border-warning text-warning">
                Generate Report
              </Button>
              <Button variant="outline" className="border-danger text-danger">
                Emergency Contacts
              </Button>
            </div>
          </TabsContent>

          {/* Community Tab */}
          <TabsContent value="community" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <PanicButton userType="driver" userId="owner-fleet" currentLocation="Fleet Management Office" />
              <SocialProof />
            </div>
            <CrimeMap />
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <ReputationSystem 
              userType="driver" 
              currentPoints={1200} 
              currentLevel={4} 
              badges={["safety", "guardian", "perfect_week", "elder"]} 
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="border-primary/20">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingUp className="h-6 w-6 mr-2 text-primary" />
                    Fleet Performance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>Average Daily Earnings</span>
                      <span className="font-bold text-success">R850</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Fleet Efficiency</span>
                      <span className="font-bold text-primary">94%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Community Score</span>
                      <span className="font-bold text-tuk-blue">4.8/5</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-success/20">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Shield className="h-6 w-6 mr-2 text-success" />
                    Safety Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>Incidents This Month</span>
                      <span className="font-bold text-success">0</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Driver Training Status</span>
                      <span className="font-bold text-primary">100%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Insurance Claims</span>
                      <span className="font-bold text-tuk-blue">None</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Safety Tab */}
          <TabsContent value="safety" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="border-danger/20">
                <CardHeader>
                  <CardTitle className="text-danger">Emergency Protocols</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="p-3 bg-danger/5 rounded-lg">
                    <h4 className="font-medium mb-2">🚨 Driver Emergency</h4>
                    <p className="text-sm text-muted-foreground">Immediate GPS tracking & alert system</p>
                  </div>
                  <div className="p-3 bg-warning/5 rounded-lg">
                    <h4 className="font-medium mb-2">📍 Vehicle Breakdown</h4>
                    <p className="text-sm text-muted-foreground">Auto-dispatch backup vehicle</p>
                  </div>
                  <div className="p-3 bg-tuk-blue/5 rounded-lg">
                    <h4 className="font-medium mb-2">🔧 Maintenance Alert</h4>
                    <p className="text-sm text-muted-foreground">Preventive maintenance reminders</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-success/20">
                <CardHeader>
                  <CardTitle className="text-success">Driver Compliance</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {vehicles.map((vehicle) => (
                    <div key={vehicle.id} className="flex items-center justify-between p-3 bg-success/5 rounded-lg">
                      <div>
                        <div className="font-medium">{vehicle.driver}</div>
                        <p className="text-sm text-muted-foreground">{vehicle.id}</p>
                      </div>
                      <Badge className="bg-success text-white">Compliant</Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};