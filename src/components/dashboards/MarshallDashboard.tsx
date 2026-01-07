import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MapPin, Car, User, Settings, Users, AlertTriangle, FileText } from "lucide-react";
import { useState } from "react";
import { NotificationCenter } from "@/components/notifications/NotificationCenter";
import { ZoneQueueManager } from "@/components/queue/ZoneQueueManager";

export const MarshallDashboard = () => {
  const [currentShift, setCurrentShift] = useState(false);

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
              <Badge variant={currentShift ? "default" : "secondary"} className={currentShift ? "bg-success text-white" : ""}>
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
                  {currentShift ? "You're currently managing queue operations" : "Start your shift to begin queue monitoring"}
                </p>
              </div>
              <Button 
                onClick={() => setCurrentShift(!currentShift)}
                className={currentShift ? "bg-destructive hover:bg-destructive/90" : "bg-success hover:bg-success/90"}
              >
                {currentShift ? "End Shift" : "Start Shift"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Main Content Tabs */}
        <Tabs defaultValue="queue" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="queue" className="flex items-center">
              <Users className="mr-2 h-4 w-4" />
              Queue Management
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center">
              <AlertTriangle className="mr-2 h-4 w-4" />
              Reports
            </TabsTrigger>
            <TabsTrigger value="summary" className="flex items-center">
              <FileText className="mr-2 h-4 w-4" />
              Summary
            </TabsTrigger>
          </TabsList>

          {/* Queue Management Tab */}
          <TabsContent value="queue" className="space-y-6">
            <ZoneQueueManager isMarshal={true} />
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports" className="space-y-6">
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
          </TabsContent>

          {/* Summary Tab */}
          <TabsContent value="summary" className="space-y-6">
            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
              <Button variant="outline" className="h-16 text-center border-destructive text-destructive">
                <div>
                  <AlertTriangle className="h-5 w-5 mx-auto mb-1" />
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
            <Card>
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
                    <div className="text-2xl font-bold text-primary">R60</div>
                    <p className="text-xs text-muted-foreground">Ranking Fees Collected</p>
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