import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { MapPin, Car, User, Settings } from "lucide-react";
import { useState } from "react";
import { NotificationCenter } from "@/components/notifications/NotificationCenter";

export const MarshallDashboard = () => {
  const [currentShift, setCurrentShift] = useState(false);
  const [vehicles] = useState([
    { id: "TT001", driver: "Sipho Mthembu", status: "waiting", arrivalTime: "08:30", location: "Rank A" },
    { id: "TT003", driver: "Nomsa Dube", status: "departed", departureTime: "09:15", destination: "Municipal Clinic" },
    { id: "TT007", driver: "Thabo Nkomo", status: "waiting", arrivalTime: "09:45", location: "Rank B" }
  ]);

  const rankLocations = [
    { name: "Denlyn Mall", capacity: 8, current: 5, status: "normal" },
    { name: "Municipal Clinic", capacity: 6, current: 3, status: "normal" },
    { name: "Pick n Pay Complex", capacity: 10, current: 8, status: "busy" },
    { name: "Highlands Park", capacity: 4, current: 4, status: "full" }
  ];

  const pendingReports = [
    { id: "R001", type: "Conflict", vehicles: "TT005 vs TT012", time: "10:30", priority: "high" },
    { id: "R002", type: "Late Arrival", vehicle: "TT009", time: "11:15", priority: "medium" },
    { id: "R003", type: "Fare Dispute", vehicle: "TT004", time: "11:45", priority: "low" }
  ];

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-primary mb-2">Marshall Dashboard</h1>
            <div className="flex items-center space-x-4">
              <Badge variant={currentShift ? "default" : "secondary"} className="bg-success text-white">
                {currentShift ? "On Duty" : "Off Duty"}
              </Badge>
              <span className="text-muted-foreground">Eersterust Tuk Tuk Association</span>
            </div>
          </div>
          <NotificationCenter />
        </div>

        {/* Shift Control */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold mb-2">Shift Management</h3>
                <p className="text-muted-foreground">
                  {currentShift ? "You're currently managing rank operations" : "Start your shift to begin rank monitoring"}
                </p>
              </div>
              <Button 
                onClick={() => setCurrentShift(!currentShift)}
                className={currentShift ? "bg-danger hover:bg-danger/90" : "bg-success hover:bg-success/90"}
              >
                {currentShift ? "End Shift" : "Start Shift"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Rank Status Overview */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <MapPin className="mr-2 h-5 w-5" />
              Rank Status Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {rankLocations.map((rank, index) => (
                <div key={index} className="p-4 bg-muted/30 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium text-sm">{rank.name}</span>
                    <Badge 
                      variant={rank.status === "full" ? "destructive" : 
                             rank.status === "busy" ? "default" : "outline"}
                      className={rank.status === "busy" ? "bg-warning text-white" : ""}
                    >
                      {rank.status.toUpperCase()}
                    </Badge>
                  </div>
                  <div className="text-2xl font-bold text-primary mb-1">
                    {rank.current}/{rank.capacity}
                  </div>
                  <p className="text-xs text-muted-foreground">Vehicles available</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Vehicle Tracking */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Car className="mr-2 h-5 w-5" />
                Vehicle Movement Log
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {vehicles.map((vehicle) => (
                  <div key={vehicle.id} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                    <div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline">{vehicle.id}</Badge>
                        <span className="font-medium">{vehicle.driver}</span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {vehicle.status === "waiting" 
                          ? `Arrived: ${vehicle.arrivalTime} at ${vehicle.location}`
                          : `Departed: ${vehicle.departureTime} to ${vehicle.destination}`
                        }
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge 
                        variant={vehicle.status === "waiting" ? "default" : "outline"}
                        className={vehicle.status === "waiting" ? "bg-success text-white" : ""}
                      >
                        {vehicle.status}
                      </Badge>
                      {vehicle.status === "waiting" && (
                        <Button size="sm" variant="outline">
                          Dispatch
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex space-x-2">
                <Input placeholder="Vehicle ID (e.g., TT008)" className="flex-1" />
                <Button className="bg-primary hover:bg-primary/90">
                  Log Arrival
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Reports & Complaints */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="mr-2 h-5 w-5" />
                Pending Reports
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pendingReports.map((report) => (
                  <div key={report.id} className="p-4 bg-muted/30 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline">{report.id}</Badge>
                        <span className="font-medium text-sm">{report.type}</span>
                      </div>
                      <Badge 
                        variant={report.priority === "high" ? "destructive" : 
                               report.priority === "medium" ? "default" : "outline"}
                        className={report.priority === "medium" ? "bg-warning text-white" : ""}
                      >
                        {report.priority.toUpperCase()}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      {report.vehicles || report.vehicle} - Reported at {report.time}
                    </p>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline" className="text-xs">
                        Investigate
                      </Button>
                      <Button size="sm" className="bg-success hover:bg-success/90 text-xs">
                        Resolve
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
          <Button variant="outline" className="h-16 text-center border-primary text-primary">
            <div>
              <User className="h-5 w-5 mx-auto mb-1" />
              <div className="text-sm">Register New Driver</div>
            </div>
          </Button>
          <Button variant="outline" className="h-16 text-center border-warning text-warning">
            <div>
              <Settings className="h-5 w-5 mx-auto mb-1" />
              <div className="text-sm">Log Complaint</div>
            </div>
          </Button>
          <Button variant="outline" className="h-16 text-center border-danger text-danger">
            <div>
              <Settings className="h-5 w-5 mx-auto mb-1" />
              <div className="text-sm">Emergency Alert</div>
            </div>
          </Button>
          <Button variant="outline" className="h-16 text-center border-success text-success">
            <div>
              <MapPin className="h-5 w-5 mx-auto mb-1" />
              <div className="text-sm">Generate Daily Report</div>
            </div>
          </Button>
        </div>

        {/* Daily Summary */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Today's Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-success">47</div>
                <p className="text-xs text-muted-foreground">Vehicles Processed</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">12</div>
                <p className="text-xs text-muted-foreground">Reports Filed</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-warning">3</div>
                <p className="text-xs text-muted-foreground">Conflicts Resolved</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-tuk-blue">R60</div>
                <p className="text-xs text-muted-foreground">Ranking Fees Collected</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};