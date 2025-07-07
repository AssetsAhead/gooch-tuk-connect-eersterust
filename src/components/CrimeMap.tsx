import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, AlertTriangle, Shield, Eye, Clock } from "lucide-react";
import { useState } from "react";

export const CrimeMap = () => {
  const [selectedArea, setSelectedArea] = useState<string | null>(null);
  
  const crimeAlerts = [
    { 
      id: 1, 
      location: "Denlyn Mall", 
      type: "Theft", 
      severity: "High", 
      time: "2 minutes ago",
      description: "Phone snatching reported near entrance",
      status: "Active"
    },
    { 
      id: 2, 
      location: "Pick n Pay Complex", 
      type: "Suspicious Activity", 
      severity: "Medium", 
      time: "15 minutes ago",
      description: "Unknown individuals loitering",
      status: "Investigating"
    },
    { 
      id: 3, 
      location: "Municipal Clinic", 
      type: "Vehicle Break-in", 
      severity: "High", 
      time: "1 hour ago",
      description: "Car window broken, items stolen",
      status: "Resolved"
    }
  ];

  const safeZones = [
    { name: "Police Station", distance: "0.3km", type: "police" },
    { name: "Security Guard Post", distance: "0.1km", type: "security" },
    { name: "Municipal Building", distance: "0.5km", type: "government" },
    { name: "Clinic (CCTV)", distance: "0.2km", type: "medical" }
  ];

  const heatmapAreas = [
    { area: "Highlands Park Entrance", riskLevel: "Low", color: "success", incidents: 2 },
    { area: "Denlyn Mall", riskLevel: "High", color: "danger", incidents: 8 },
    { area: "Pick n Pay Complex", riskLevel: "Medium", color: "warning", incidents: 4 },
    { area: "Silverton Border", riskLevel: "High", color: "danger", incidents: 6 },
    { area: "Municipal Clinic", riskLevel: "Medium", color: "warning", incidents: 5 }
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "High": return "border-danger text-danger bg-danger/10";
      case "Medium": return "border-warning text-warning bg-warning/10";
      case "Low": return "border-success text-success bg-success/10";
      default: return "border-muted text-muted-foreground bg-muted/10";
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Live Crime Alerts */}
      <Card className="border-danger/20">
        <CardHeader>
          <CardTitle className="flex items-center">
            <AlertTriangle className="h-6 w-6 mr-2 text-danger" />
            🚨 Live Crime Alerts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {crimeAlerts.map((alert) => (
              <div key={alert.id} className={`p-4 rounded-lg border ${getSeverityColor(alert.severity)}`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <MapPin className="h-4 w-4" />
                      <span className="font-medium">{alert.location}</span>
                      <Badge variant="outline" className="text-xs">
                        {alert.type}
                      </Badge>
                    </div>
                    <p className="text-sm mb-2">{alert.description}</p>
                    <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                      <div className="flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {alert.time}
                      </div>
                      <Badge variant={alert.status === "Active" ? "destructive" : "outline"} className="text-xs">
                        {alert.status}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <Button className="w-full mt-4 bg-danger hover:bg-danger/90">
            <AlertTriangle className="h-4 w-4 mr-2" />
            Report New Incident
          </Button>
        </CardContent>
      </Card>

      {/* Safety Heatmap */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Eye className="h-6 w-6 mr-2 text-primary" />
            Safety Heatmap
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {heatmapAreas.map((area) => (
              <div 
                key={area.area}
                className={`p-3 rounded-lg border cursor-pointer transition-all ${
                  area.color === "danger" 
                    ? "border-danger/20 bg-danger/5" 
                    : area.color === "warning"
                    ? "border-warning/20 bg-warning/5"
                    : "border-success/20 bg-success/5"
                } ${selectedArea === area.area ? "ring-2 ring-primary" : ""}`}
                onClick={() => setSelectedArea(selectedArea === area.area ? null : area.area)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{area.area}</div>
                    <div className="text-sm text-muted-foreground">
                      {area.incidents} incidents this week
                    </div>
                  </div>
                  <Badge 
                    variant="outline" 
                    className={`text-xs ${
                      area.color === "danger" 
                        ? "border-danger text-danger" 
                        : area.color === "warning"
                        ? "border-warning text-warning"
                        : "border-success text-success"
                    }`}
                  >
                    {area.riskLevel} Risk
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Nearby Safe Zones */}
      <Card className="lg:col-span-2 border-success/20">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="h-6 w-6 mr-2 text-success" />
            🛡️ Nearest Safe Zones
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {safeZones.map((zone) => (
              <div key={zone.name} className="p-4 bg-success/10 rounded-lg border border-success/20 text-center">
                <div className="text-2xl mb-2">
                  {zone.type === "police" ? "👮" : 
                   zone.type === "security" ? "🛡️" : 
                   zone.type === "government" ? "🏛️" : "🏥"}
                </div>
                <div className="font-medium text-sm">{zone.name}</div>
                <div className="text-xs text-muted-foreground mt-1">{zone.distance} away</div>
                <Button size="sm" variant="outline" className="mt-2 text-xs border-success text-success">
                  Navigate
                </Button>
              </div>
            ))}
          </div>
          
          <div className="mt-4 p-4 bg-gradient-to-r from-success/10 to-primary/10 rounded-lg">
            <div className="text-center">
              <Shield className="h-8 w-8 text-success mx-auto mb-2" />
              <div className="font-bold text-success">Community Watch Active</div>
              <p className="text-sm text-muted-foreground">
                47 community members are currently patrolling your area
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};