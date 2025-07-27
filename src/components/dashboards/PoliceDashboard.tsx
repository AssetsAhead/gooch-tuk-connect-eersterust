import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MapPin, Car, User, Settings, FileText, Smartphone } from "lucide-react";
import { DigitalFineIssuer } from "@/components/police/DigitalFineIssuer";
import { FineManagement } from "@/components/police/FineManagement";

export const PoliceDashboard = () => {
  const flaggedVehicles = [
    { id: "TT008", driver: "Moses Tshwane", issue: "Theft Report", severity: "high", status: "investigating", time: "2 hours ago" },
    { id: "TT015", driver: "Peter Mabaso", issue: "Assault Complaint", severity: "high", status: "pending", time: "4 hours ago" },
    { id: "TT003", driver: "Thabo Nkomo", issue: "Unlicensed Operation", severity: "medium", status: "verified", time: "1 day ago" }
  ];

  const emergencyAlerts = [
    { id: "EMG001", vehicle: "TT007", location: "Silverton", type: "Panic Button Activated", time: "15 min ago", status: "active" },
    { id: "EMG002", vehicle: "TT012", location: "Mamelodi Mall", type: "Accident Report", time: "45 min ago", status: "resolved" }
  ];

  const licenseChecks = [
    { id: "TT001", driver: "Sipho Mthembu", license: "Valid", expiry: "2025-08-15", status: "compliant" },
    { id: "TT005", driver: "Nomsa Dube", license: "Expires Soon", expiry: "2025-01-20", status: "warning" },
    { id: "TT009", driver: "John Mokgosi", license: "Expired", expiry: "2024-11-30", status: "violation" }
  ];

  const incidentReports = [
    { id: "RPT001", type: "Break-in", reporter: "Maria Santos", location: "Eastlynne", time: "3 hours ago", status: "investigating" },
    { id: "RPT002", type: "Gate Motor Theft", reporter: "David Khumalo", location: "Highlands Park", time: "1 day ago", status: "closed" },
    { id: "RPT003", type: "Fare Dispute Escalation", reporter: "Marshall Mike", location: "Denlyn Mall", time: "2 days ago", status: "resolved" }
  ];

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-primary mb-2">Police & Traffic Department</h1>
          <p className="text-muted-foreground">Law enforcement oversight for Gooch Tuk Service operations</p>
        </div>

        {/* Emergency Alerts */}
        <Card className="mb-8 border-danger/20">
          <CardHeader>
            <CardTitle className="flex items-center text-danger">
              <Settings className="mr-2 h-5 w-5" />
              Active Emergency Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            {emergencyAlerts.filter(alert => alert.status === "active").length > 0 ? (
              <div className="space-y-4">
                {emergencyAlerts.filter(alert => alert.status === "active").map((alert) => (
                  <div key={alert.id} className="flex items-center justify-between p-4 bg-danger/10 rounded-lg border border-danger/20">
                    <div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="destructive">{alert.id}</Badge>
                        <span className="font-medium">{alert.type}</span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        Vehicle: {alert.vehicle} | Location: {alert.location} | {alert.time}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <Button size="sm" className="bg-danger hover:bg-danger/90">
                        Respond
                      </Button>
                      <Button size="sm" variant="outline">
                        Track Location
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Settings className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No active emergency alerts</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Tabs defaultValue="issue-fine" className="space-y-8">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="issue-fine" className="flex items-center space-x-1">
              <Smartphone className="h-4 w-4" />
              <span>Issue Fine</span>
            </TabsTrigger>
            <TabsTrigger value="manage-fines" className="flex items-center space-x-1">
              <FileText className="h-4 w-4" />
              <span>Manage Fines</span>
            </TabsTrigger>
            <TabsTrigger value="flagged">Flagged Vehicles</TabsTrigger>
            <TabsTrigger value="compliance">License Compliance</TabsTrigger>
            <TabsTrigger value="incidents">Incident Reports</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="issue-fine" className="space-y-6">
            <DigitalFineIssuer />
          </TabsContent>

          <TabsContent value="manage-fines" className="space-y-6">
            <FineManagement />
          </TabsContent>

          <TabsContent value="flagged" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Car className="mr-2 h-5 w-5" />
                  Flagged Vehicles & Drivers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {flaggedVehicles.map((vehicle) => (
                    <div key={vehicle.id} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                      <div>
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline">{vehicle.id}</Badge>
                          <span className="font-medium">{vehicle.driver}</span>
                          <Badge 
                            variant={vehicle.severity === "high" ? "destructive" : "default"}
                            className={vehicle.severity === "medium" ? "bg-warning text-white" : ""}
                          >
                            {vehicle.severity.toUpperCase()}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {vehicle.issue} - {vehicle.time}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={vehicle.status === "investigating" ? "default" : "outline"}>
                          {vehicle.status}
                        </Badge>
                        <Button size="sm" variant="outline">
                          View Details
                        </Button>
                        <Button size="sm" className="bg-primary hover:bg-primary/90">
                          Track Vehicle
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Quick Vehicle Lookup</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Input placeholder="Enter vehicle ID (e.g., TT001)" />
                  <Button className="w-full bg-primary hover:bg-primary/90">
                    Search Vehicle History
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Driver Background Check</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Input placeholder="Enter driver name or ID number" />
                  <Button className="w-full bg-secondary hover:bg-secondary/90">
                    Run Background Check
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="compliance" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="mr-2 h-5 w-5" />
                  License Compliance Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {licenseChecks.map((check) => (
                    <div key={check.id} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                      <div>
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline">{check.id}</Badge>
                          <span className="font-medium">{check.driver}</span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          License: {check.license} | Expires: {check.expiry}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge 
                          variant={check.status === "violation" ? "destructive" : 
                                 check.status === "warning" ? "default" : "outline"}
                          className={check.status === "warning" ? "bg-warning text-white" : 
                                   check.status === "compliant" ? "bg-success text-white" : ""}
                        >
                          {check.status.toUpperCase()}
                        </Badge>
                        {check.status === "violation" && (
                          <Button size="sm" className="bg-danger hover:bg-danger/90">
                            Issue Citation
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="incidents" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Settings className="mr-2 h-5 w-5" />
                  Recent Incident Reports
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {incidentReports.map((report) => (
                    <div key={report.id} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                      <div>
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline">{report.id}</Badge>
                          <span className="font-medium">{report.type}</span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          Reporter: {report.reporter} | Location: {report.location} | {report.time}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge 
                          variant={report.status === "investigating" ? "default" : 
                                 report.status === "resolved" ? "outline" : "secondary"}
                          className={report.status === "investigating" ? "bg-warning text-white" : 
                                   report.status === "resolved" ? "bg-success text-white" : ""}
                        >
                          {report.status.toUpperCase()}
                        </Badge>
                        <Button size="sm" variant="outline">
                          View Report
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="text-2xl font-bold text-danger">23</div>
                  <p className="text-xs text-muted-foreground">Open Investigations</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="text-2xl font-bold text-warning">8</div>
                  <p className="text-xs text-muted-foreground">License Violations</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="text-2xl font-bold text-success">156</div>
                  <p className="text-xs text-muted-foreground">Cases Resolved</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="text-2xl font-bold text-primary">92%</div>
                  <p className="text-xs text-muted-foreground">Compliance Rate</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Crime Pattern Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Gate Motor Theft</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-32 bg-muted rounded-full h-2">
                        <div className="bg-danger h-2 rounded-full" style={{ width: "68%" }}></div>
                      </div>
                      <span className="text-sm font-medium">68%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Fare Disputes</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-32 bg-muted rounded-full h-2">
                        <div className="bg-warning h-2 rounded-full" style={{ width: "45%" }}></div>
                      </div>
                      <span className="text-sm font-medium">45%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Vehicle Break-ins</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-32 bg-muted rounded-full h-2">
                        <div className="bg-tuk-orange h-2 rounded-full" style={{ width: "32%" }}></div>
                      </div>
                      <span className="text-sm font-medium">32%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};