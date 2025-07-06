import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Car, User, Settings } from "lucide-react";
import { useState } from "react";

export const DriverDashboard = () => {
  const [shiftStarted, setShiftStarted] = useState(false);
  const [availableRides] = useState([
    { id: 1, pickup: "Denlyn Mall", destination: "Municipal Clinic", fare: "R25", distance: "2.1km" },
    { id: 2, pickup: "Pick n Pay Complex", destination: "Highlands Park", fare: "R15", distance: "1.8km" },
    { id: 3, pickup: "Silverton", destination: "Eastlynne", fare: "R30", distance: "3.2km" }
  ]);

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-primary mb-2">Driver Dashboard</h1>
          <div className="flex items-center space-x-4">
            <Badge variant={shiftStarted ? "default" : "secondary"} className="bg-success text-white">
              {shiftStarted ? "On Duty" : "Off Duty"}
            </Badge>
            <span className="text-muted-foreground">Vehicle: TT001</span>
          </div>
        </div>

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
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-success">R450</div>
              <p className="text-xs text-muted-foreground">Today's Earnings</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-primary">18</div>
              <p className="text-xs text-muted-foreground">Rides Completed</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-tuk-blue">4.7</div>
              <p className="text-xs text-muted-foreground">Rating</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-warning">45km</div>
              <p className="text-xs text-muted-foreground">Distance</p>
            </CardContent>
          </Card>
        </div>

        {/* Available Rides */}
        {shiftStarted && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <MapPin className="mr-2 h-5 w-5" />
                Available Rides
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {availableRides.map((ride) => (
                  <div key={ride.id} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                    <div>
                      <div className="font-medium">{ride.pickup} → {ride.destination}</div>
                      <p className="text-sm text-muted-foreground">Distance: {ride.distance}</p>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <div className="font-bold text-success">{ride.fare}</div>
                      </div>
                      <Button size="sm" className="bg-primary hover:bg-primary/90">
                        Accept
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button variant="outline" className="w-full justify-start">
                <User className="mr-2 h-4 w-4" />
                Report Lost Item
              </Button>
              <Button variant="outline" className="w-full justify-start border-danger text-danger">
                <Settings className="mr-2 h-4 w-4" />
                Emergency/Panic Button
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Car className="mr-2 h-4 w-4" />
                Vehicle Issue Report
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <MapPin className="mr-2 h-4 w-4" />
                Report Suspicious Activity
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Today's Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Shift Started:</span>
                  <span className="font-medium">06:30 AM</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Last Ride:</span>
                  <span className="font-medium">2:15 PM</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Break Time:</span>
                  <span className="font-medium">45 minutes</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Fuel/Energy:</span>
                  <Badge variant="outline" className="text-xs border-success text-success">Good</Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Next Maintenance:</span>
                  <span className="font-medium">15 days</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};