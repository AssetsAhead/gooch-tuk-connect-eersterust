import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Car, Settings, User } from "lucide-react";

export const OwnerDashboard = () => {
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
          <p className="text-muted-foreground">Track your fleet and earnings in real-time</p>
        </div>

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

        {/* Vehicle Tracking */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MapPin className="mr-2 h-5 w-5" />
                Vehicle Tracking
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {vehicles.map((vehicle) => (
                  <div key={vehicle.id} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                    <div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={vehicle.status === "Active" ? "default" : "secondary"}>
                          {vehicle.id}
                        </Badge>
                        <span className="font-medium">{vehicle.driver}</span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{vehicle.location}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-success">{vehicle.earnings}</p>
                      <Badge variant={vehicle.status === "Active" ? "default" : "outline"} className="text-xs">
                        {vehicle.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Driver Performance */}
          <Card>
            <CardHeader>
              <CardTitle>Driver Performance & Compliance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-success/10 rounded-lg border border-success/20">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Sipho Mthembu</span>
                    <Badge className="bg-success text-white">Champion</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">Returned lost wallet yesterday</p>
                  <div className="flex justify-between text-xs mt-2">
                    <span>Rating: 4.8/5</span>
                    <span>License: Valid</span>
                  </div>
                </div>

                <div className="p-4 bg-warning/10 rounded-lg border border-warning/20">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Nomsa Dube</span>
                    <Badge variant="outline" className="border-warning text-warning">Review</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">Late report submission</p>
                  <div className="flex justify-between text-xs mt-2">
                    <span>Rating: 4.2/5</span>
                    <span>License: Expires in 30 days</span>
                  </div>
                </div>

                <div className="p-4 bg-danger/10 rounded-lg border border-danger/20">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Thabo Nkomo</span>
                    <Badge variant="destructive">Flagged</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">Passenger complaint filed</p>
                  <div className="flex justify-between text-xs mt-2">
                    <span>Rating: 3.1/5</span>
                    <span>License: Valid</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

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
      </div>
    </div>
  );
};