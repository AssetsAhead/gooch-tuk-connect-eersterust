import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { MapPin, Car, User } from "lucide-react";
import { useState } from "react";

export const PassengerDashboard = () => {
  const [pickup, setPickup] = useState("");
  const [destination, setDestination] = useState("");
  const [nearbyDrivers] = useState([
    { id: "TT001", driver: "Sipho M.", rating: 4.8, distance: "0.2km", eta: "3 min", fare: "R15" },
    { id: "TT003", driver: "Nomsa D.", rating: 4.5, distance: "0.5km", eta: "5 min", fare: "R18" },
    { id: "TT007", driver: "Thabo N.", rating: 4.2, distance: "0.8km", eta: "7 min", fare: "R20" }
  ]);

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
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-primary mb-2">Book Your Ride</h1>
          <p className="text-muted-foreground">Safe, affordable transport in Eersterust & surrounding areas</p>
        </div>

        {/* Pricing Info */}
        <Card className="mb-8 border-primary/20">
          <CardContent className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-xl font-bold text-success">R15</div>
                <p className="text-xs text-muted-foreground">In-Poort (Day)</p>
              </div>
              <div>
                <div className="text-xl font-bold text-tuk-orange">R25</div>
                <p className="text-xs text-muted-foreground">Out-of-Township</p>
              </div>
              <div>
                <div className="text-xl font-bold text-tuk-blue">R30</div>
                <p className="text-xs text-muted-foreground">Night In-Poort</p>
              </div>
              <div>
                <div className="text-xl font-bold text-warning">R50</div>
                <p className="text-xs text-muted-foreground">Night Out-Township</p>
              </div>
            </div>
            <div className="mt-4 text-center">
              <Badge className="bg-success/20 text-success">33% OFF on Pension Collection Days</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Ride Booking */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <MapPin className="mr-2 h-5 w-5" />
              Book a Ride
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Pickup Location</label>
              <Input 
                placeholder="Enter pickup location..."
                value={pickup}
                onChange={(e) => setPickup(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Destination</label>
              <Input 
                placeholder="Where to?"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
              />
            </div>
            <Button className="w-full bg-primary hover:bg-primary/90">
              Find Available Rides
            </Button>
          </CardContent>
        </Card>

        {/* Quick Destinations */}
        <Card className="mb-8">
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

        {/* Nearby Drivers */}
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
              <Car className="h-5 w-5 mx-auto mb-1" />
              <div className="text-sm">Emergency Help</div>
            </div>
          </Button>
        </div>
      </div>
    </div>
  );
};