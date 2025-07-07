import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Building, 
  FileText, 
  Vote, 
  MapPin, 
  Droplets, 
  Calendar,
  AlertTriangle,
  CheckCircle,
  Clock
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export const GovernmentServices = () => {
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const { toast } = useToast();

  const municipalServices = [
    {
      id: "potholes",
      title: "Report Potholes",
      icon: MapPin,
      status: "active",
      reports: 247,
      resolved: 186
    },
    {
      id: "water",
      title: "Water Outages",
      icon: Droplets,
      status: "urgent",
      reports: 89,
      resolved: 23
    },
    {
      id: "electricity",
      title: "Power Issues",
      icon: AlertTriangle,
      status: "monitoring",
      reports: 156,
      resolved: 89
    }
  ];

  const civicServices = [
    { id: "voting", title: "Voter Registration", icon: Vote, description: "Check registration status & register to vote" },
    { id: "sars", title: "Tax Compliance", icon: FileText, description: "Informal business tax assistance" },
    { id: "permits", title: "Business Permits", icon: Building, description: "Apply for trading licenses" }
  ];

  const handleServiceReport = (serviceType: string) => {
    toast({
      title: "Report Submitted",
      description: `Your ${serviceType} report has been forwarded to City of Tshwane`,
    });
  };

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Building className="h-6 w-6 mr-2 text-primary" />
          Government & Municipal Services
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="municipal" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="municipal">🏛️ Municipal</TabsTrigger>
            <TabsTrigger value="civic">🗳️ Civic Services</TabsTrigger>
          </TabsList>

          <TabsContent value="municipal" className="space-y-4">
            {/* Service Status Dashboard */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {municipalServices.map((service) => {
                const Icon = service.icon;
                const statusColors = {
                  active: "success",
                  urgent: "danger", 
                  monitoring: "warning"
                };
                
                return (
                  <Card 
                    key={service.id}
                    className={`cursor-pointer transition-colors hover:border-primary/40 ${
                      selectedService === service.id ? "border-primary" : ""
                    }`}
                    onClick={() => setSelectedService(service.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <Icon className="h-5 w-5 text-primary" />
                        <Badge variant="outline" className={`bg-${statusColors[service.status as keyof typeof statusColors]}/10`}>
                          {service.status}
                        </Badge>
                      </div>
                      <h4 className="font-medium mb-1">{service.title}</h4>
                      <div className="text-sm text-muted-foreground">
                        <div>Reports: {service.reports}</div>
                        <div className="flex items-center">
                          <CheckCircle className="h-3 w-3 mr-1 text-success" />
                          Resolved: {service.resolved}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Quick Report Form */}
            <Card className="border-tuk-blue/20">
              <CardHeader>
                <CardTitle className="text-lg">🚨 Quick Report</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input placeholder="Location (Street, Area)" />
                  <select className="w-full p-2 border rounded-md">
                    <option>Select Issue Type</option>
                    <option>Pothole</option>
                    <option>Water Leak</option>
                    <option>Street Light</option>
                    <option>Refuse Collection</option>
                    <option>Traffic Light</option>
                  </select>
                </div>
                <Textarea placeholder="Describe the issue..." className="h-20" />
                <div className="flex gap-2">
                  <Button 
                    onClick={() => handleServiceReport("municipal issue")}
                    className="bg-primary hover:bg-primary/90"
                  >
                    📸 Add Photo & Submit
                  </Button>
                  <Button variant="outline">
                    📍 Use Current Location
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="civic" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {civicServices.map((service) => {
                const Icon = service.icon;
                return (
                  <Card key={service.id} className="border-success/20 hover:border-success/40 transition-colors">
                    <CardContent className="p-4 text-center">
                      <Icon className="h-8 w-8 text-success mx-auto mb-3" />
                      <h4 className="font-bold mb-2">{service.title}</h4>
                      <p className="text-sm text-muted-foreground mb-4">{service.description}</p>
                      <Button variant="outline" className="w-full">
                        Get Started
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Voting Information */}
            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Vote className="h-5 w-5 mr-2 text-primary" />
                  2024 Election Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-bold mb-2">Registration Status</h4>
                    <div className="bg-success/10 p-4 rounded-lg border border-success/20">
                      <div className="flex items-center">
                        <CheckCircle className="h-5 w-5 text-success mr-2" />
                        <span className="font-medium">Registered to Vote</span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        Voting station: Eersterust Primary School
                      </p>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-bold mb-2">Important Dates</h4>
                    <div className="space-y-2">
                      <div className="flex items-center text-sm">
                        <Calendar className="h-4 w-4 mr-2 text-primary" />
                        <span>Special Votes: May 27-28, 2024</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <Calendar className="h-4 w-4 mr-2 text-primary" />
                        <span>Election Day: May 29, 2024</span>
                      </div>
                    </div>
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