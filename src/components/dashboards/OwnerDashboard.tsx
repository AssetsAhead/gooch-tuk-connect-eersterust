import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MapPin, Car, Settings, User, Shield, TrendingUp, Calculator } from "lucide-react";
import { useState } from "react";
import { PanicButton } from "@/components/PanicButton";
import { ReputationSystem } from "@/components/ReputationSystem";
import { CrimeMap } from "@/components/CrimeMap";
import { SocialProof } from "@/components/SocialProof";
import { NotificationCenter } from "@/components/notifications/NotificationCenter";
import { FleetManagement } from "@/components/fleet/FleetManagement";
import { PartsInventory } from "@/components/fleet/PartsInventory";
import { FleetROICalculator } from "@/components/fleet/FleetROICalculator";
import { EmploymentContractGenerator } from "@/components/fleet/EmploymentContractGenerator";
import { PayrollCalculator } from "@/components/fleet/PayrollCalculator";
import { DriverOnboardingChecklist } from "@/components/fleet/DriverOnboardingChecklist";

export const OwnerDashboard = () => {
  const [activeTab, setActiveTab] = useState("fleet");

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-primary mb-2">Owner Dashboard</h1>
            <p className="text-muted-foreground">Track your fleet, earnings, and community impact</p>
          </div>
          <NotificationCenter />
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 md:grid-cols-8 mb-8">
            <TabsTrigger value="fleet">🚗 Fleet</TabsTrigger>
            <TabsTrigger value="drivers">👤 Drivers</TabsTrigger>
            <TabsTrigger value="payroll">💵 Payroll</TabsTrigger>
            <TabsTrigger value="roi">💰 ROI</TabsTrigger>
            <TabsTrigger value="parts">🔧 Parts</TabsTrigger>
            <TabsTrigger value="community">🛡️ Community</TabsTrigger>
            <TabsTrigger value="analytics">📊 Analytics</TabsTrigger>
            <TabsTrigger value="safety">🚨 Safety</TabsTrigger>
          </TabsList>

          {/* Fleet Tab */}
          <TabsContent value="fleet" className="space-y-6">
            <FleetManagement />
            <EmploymentContractGenerator />
          </TabsContent>

          {/* Drivers Tab */}
          <TabsContent value="drivers" className="space-y-6">
            <DriverOnboardingChecklist />
          </TabsContent>

          {/* Payroll Tab */}
          <TabsContent value="payroll" className="space-y-6">
            <PayrollCalculator />
          </TabsContent>

          {/* ROI Calculator Tab */}
          <TabsContent value="roi" className="space-y-6">
            <FleetROICalculator />
          </TabsContent>

          {/* Parts Tab */}
          <TabsContent value="parts" className="space-y-6">
            <PartsInventory />
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
                  <p className="text-sm text-muted-foreground">
                    View driver compliance status in the Fleet tab
                  </p>
                  <Button variant="outline" onClick={() => setActiveTab('fleet')}>
                    Go to Fleet Management
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};