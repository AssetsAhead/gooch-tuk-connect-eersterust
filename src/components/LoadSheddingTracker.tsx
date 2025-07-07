import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Zap, 
  ZapOff, 
  Clock, 
  MapPin, 
  Battery, 
  Fuel,
  Users,
  TrendingUp,
  AlertTriangle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export const LoadSheddingTracker = () => {
  const [currentStage, setCurrentStage] = useState(2);
  const [nextOutage, setNextOutage] = useState("14:00 - 16:30");
  const [areaStatus, setAreaStatus] = useState("powered");
  const { toast } = useToast();

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate stage changes
      if (Math.random() > 0.8) {
        const newStage = Math.floor(Math.random() * 6);
        setCurrentStage(newStage);
      }
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const scheduleData = [
    { time: "06:00-08:30", stage: 2, area: "Eersterust Block A", status: "completed" },
    { time: "10:00-12:30", stage: 2, area: "Eersterust Block B", status: "completed" },
    { time: "14:00-16:30", stage: 2, area: "Eersterust Block C", status: "active" },
    { time: "18:00-20:30", stage: 2, area: "Eersterust Block D", status: "upcoming" },
    { time: "22:00-00:30", stage: 2, area: "Eersterust Block A", status: "upcoming" }
  ];

  const backupOptions = [
    { 
      type: "Generator Rental", 
      provider: "PowerShare Eersterust", 
      price: "R180/day", 
      capacity: "5kVA",
      available: 3,
      rating: 4.8
    },
    { 
      type: "Inverter + Battery", 
      provider: "Solar Solutions SA", 
      price: "R2,400/month", 
      capacity: "3kVA + 200Ah",
      available: 2,
      rating: 4.9
    },
    { 
      type: "Community UPS", 
      provider: "Neighbourhood Power", 
      price: "R45/hour", 
      capacity: "Shared 50kVA",
      available: 1,
      rating: 4.6
    }
  ];

  const handleRouteOptimization = () => {
    toast({
      title: "Route Optimized",
      description: "Alternative route calculated avoiding affected areas during load shedding",
    });
  };

  const getStageColor = (stage: number) => {
    if (stage === 0) return "success";
    if (stage <= 2) return "warning";
    if (stage <= 4) return "tuk-orange";
    return "danger";
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "text-muted-foreground";
      case "active": return "text-danger";
      case "upcoming": return "text-warning";
      default: return "text-muted-foreground";
    }
  };

  return (
    <Card className="border-tuk-orange/20">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Zap className="h-6 w-6 mr-2 text-tuk-orange" />
          Load Shedding Intelligence Hub
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="status" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="status">⚡ Status</TabsTrigger>
            <TabsTrigger value="schedule">📅 Schedule</TabsTrigger>
            <TabsTrigger value="backup">🔋 Backup Power</TabsTrigger>
          </TabsList>

          <TabsContent value="status" className="space-y-4">
            {/* Current Status */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className={`border-${getStageColor(currentStage)}/20`}>
                <CardContent className="p-4 text-center">
                  <div className="flex items-center justify-center mb-2">
                    {currentStage === 0 ? (
                      <Zap className="h-8 w-8 text-success" />
                    ) : (
                      <ZapOff className="h-8 w-8 text-danger" />
                    )}
                  </div>
                  <div className="text-2xl font-bold mb-1">Stage {currentStage}</div>
                  <Badge variant="outline" className={`bg-${getStageColor(currentStage)}/10`}>
                    {currentStage === 0 ? "No Load Shedding" : `Stage ${currentStage} Active`}
                  </Badge>
                </CardContent>
              </Card>

              <Card className="border-primary/20">
                <CardContent className="p-4 text-center">
                  <Clock className="h-8 w-8 text-primary mx-auto mb-2" />
                  <div className="text-lg font-bold mb-1">Next Outage</div>
                  <div className="text-sm text-muted-foreground">{nextOutage}</div>
                  <div className="text-xs text-warning mt-1">Eersterust Block C</div>
                </CardContent>
              </Card>

              <Card className="border-success/20">
                <CardContent className="p-4 text-center">
                  <MapPin className="h-8 w-8 text-success mx-auto mb-2" />
                  <div className="text-lg font-bold mb-1">Your Area</div>
                  <Badge variant="outline" className="bg-success/10">
                    Currently Powered
                  </Badge>
                  <div className="text-xs text-muted-foreground mt-1">Block A - Ward 58</div>
                </CardContent>
              </Card>
            </div>

            {/* Smart Route Optimization */}
            <Card className="border-tuk-blue/20">
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2 text-tuk-blue" />
                  Smart Route Intelligence
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-3">
                      AI-powered route optimization during load shedding
                    </p>
                    <div className="space-y-2">
                      <div className="flex items-center text-sm">
                        <Zap className="h-4 w-4 mr-2 text-success" />
                        <span>Powered areas: Silverton, Mamelodi West</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <ZapOff className="h-4 w-4 mr-2 text-danger" />
                        <span>Affected areas: Eersterust Block C, Eastlynne</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Button 
                      onClick={handleRouteOptimization}
                      className="bg-tuk-blue hover:bg-tuk-blue/90"
                    >
                      🗺️ Optimize My Routes
                    </Button>
                    <Button variant="outline">
                      📱 Get Real-time Alerts
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="schedule" className="space-y-4">
            <div className="space-y-3">
              {scheduleData.map((slot, index) => (
                <Card key={index} className={`border-l-4 ${
                  slot.status === 'active' ? 'border-l-danger' : 
                  slot.status === 'upcoming' ? 'border-l-warning' : 'border-l-muted'
                }`}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="text-lg font-bold">{slot.time}</div>
                        <Badge variant="outline">Stage {slot.stage}</Badge>
                        <div className="text-sm text-muted-foreground">{slot.area}</div>
                      </div>
                      <div className={`text-sm font-medium ${getStatusColor(slot.status)}`}>
                        {slot.status.charAt(0).toUpperCase() + slot.status.slice(1)}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Alert Settings */}
            <Card className="border-warning/20">
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <AlertTriangle className="h-5 w-5 mr-2 text-warning" />
                  Smart Notifications
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">30-minute advance warning</span>
                    <Badge className="bg-success text-white">Active</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Route disruption alerts</span>
                    <Badge className="bg-success text-white">Active</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Stage change notifications</span>
                    <Badge className="bg-success text-white">Active</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="backup" className="space-y-4">
            <div className="grid gap-4">
              {backupOptions.map((option, index) => (
                <Card key={index} className="border-primary/20 hover:border-primary/40 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <Battery className="h-6 w-6 text-primary" />
                        <div>
                          <h4 className="font-bold">{option.type}</h4>
                          <p className="text-sm text-muted-foreground">{option.provider}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold text-primary">{option.price}</div>
                        <div className="text-sm text-muted-foreground">{option.capacity}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center text-sm">
                          <Users className="h-4 w-4 mr-1 text-success" />
                          <span>{option.available} available</span>
                        </div>
                        <div className="flex items-center text-sm">
                          <span className="text-warning">★</span>
                          <span className="ml-1">{option.rating}</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          📍 View Location
                        </Button>
                        <Button size="sm" className="bg-success hover:bg-success/90">
                          💰 Book Now
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Community Power Sharing */}
            <Card className="border-tuk-blue/20">
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Users className="h-5 w-5 mr-2 text-tuk-blue" />
                  Community Power Network
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-bold mb-2">Share Your Power</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      Have backup power? Share with neighbors and earn money
                    </p>
                    <Button variant="outline" className="w-full">
                      🔌 List My Generator
                    </Button>
                  </div>
                  <div>
                    <h4 className="font-bold mb-2">Find Nearby Power</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      Connect to community power sources during outages
                    </p>
                    <Button className="w-full bg-tuk-blue hover:bg-tuk-blue/90">
                      🗺️ Find Power Sources
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};