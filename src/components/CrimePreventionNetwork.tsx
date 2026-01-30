import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Shield, 
  AlertTriangle, 
  Users, 
  MapPin,
  Clock,
  Phone,
  Camera,
  TrendingDown,
  Eye,
  UserCheck
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export const CrimePreventionNetwork = () => {
  const [tipDetails, setTipDetails] = useState("");
  const [selectedIncident, setSelectedIncident] = useState("");
  const { toast } = useToast();

  const sapsStatistics = [
    { 
      area: "Eersterust", 
      crime: "Theft", 
      incidents: 23, 
      trend: "down", 
      change: "-15%",
      month: "November 2024"
    },
    { 
      area: "Silverton Border", 
      crime: "Vehicle Break-ins", 
      incidents: 8, 
      trend: "up", 
      change: "+12%",
      month: "November 2024"
    },
    { 
      area: "Mamelodi Road", 
      crime: "Robbery", 
      incidents: 5, 
      trend: "down", 
      change: "-25%",
      month: "November 2024"
    }
  ];

  const communityPatrols = [
    {
      name: "Alpha Team",
      leader: "Community Leader Sipho",
      area: "Block A & B",
      members: 12,
      schedule: "Mon, Wed, Fri - 18:00-22:00",
      contact: "084 123 4567",
      status: "active"
    },
    {
      name: "Night Guards",
      leader: "Security Chief Nomsa", 
      area: "Main Road & Shopping Area",
      members: 8,
      schedule: "Daily - 22:00-06:00",
      contact: "073 987 6543",
      status: "active"
    },
    {
      name: "School Safety",
      leader: "Principal Thabo",
      area: "Schools & Playgrounds", 
      members: 15,
      schedule: "School Days - 07:00-08:00, 14:00-16:00",
      contact: "082 456 7890",
      status: "recruiting"
    }
  ];

  const watchSchedule = [
    { time: "06:00-10:00", team: "Morning Watch", area: "All Blocks", status: "scheduled" },
    { time: "10:00-14:00", team: "Day Patrol", area: "Commercial Area", status: "active" },
    { time: "14:00-18:00", team: "School Guard", area: "Schools & Parks", status: "scheduled" },
    { time: "18:00-22:00", team: "Alpha Team", area: "Block A & B", status: "active" },
    { time: "22:00-02:00", team: "Night Guards", area: "Main Road", status: "scheduled" },
    { time: "02:00-06:00", team: "Late Night", area: "All Areas", status: "scheduled" }
  ];

  const handleAnonymousTip = () => {
    if (!tipDetails.trim()) {
      toast({
        title: "Missing Information",
        description: "Please provide details about the incident",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "🚨 Anonymous Tip Submitted",
      description: "Your tip has been forwarded to SAPS and community watch. Reference: TIP" + Math.random().toString(36).substr(2, 6).toUpperCase(),
    });
    setTipDetails("");
  };

  const handleJoinPatrol = (teamName: string) => {
    toast({
      title: "Patrol Application Sent",
      description: `Your application to join ${teamName} has been sent to the team leader`,
    });
  };

  return (
    <Card className="border-danger/20">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Shield className="h-6 w-6 mr-2 text-danger" />
          Crime Prevention Network
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="statistics" className="w-full">
          <TabsList className="w-full overflow-x-auto flex justify-start md:grid md:grid-cols-4">
            <TabsTrigger value="statistics" className="whitespace-nowrap flex-shrink-0">
              <span className="mr-1">📊</span>
              <span className="hidden sm:inline">SAPS Stats</span>
              <span className="sm:hidden">Stats</span>
            </TabsTrigger>
            <TabsTrigger value="patrols" className="whitespace-nowrap flex-shrink-0">
              <span className="mr-1">👮</span>
              <span>Patrols</span>
            </TabsTrigger>
            <TabsTrigger value="tips" className="whitespace-nowrap flex-shrink-0">
              <span className="mr-1">🔍</span>
              <span className="hidden sm:inline">Anonymous Tips</span>
              <span className="sm:hidden">Tips</span>
            </TabsTrigger>
            <TabsTrigger value="schedule" className="whitespace-nowrap flex-shrink-0">
              <span className="mr-1">⏰</span>
              <span className="hidden sm:inline">Watch Schedule</span>
              <span className="sm:hidden">Schedule</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="statistics" className="space-y-4">
            {/* SAPS Integration */}
            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <TrendingDown className="h-5 w-5 mr-2 text-primary" />
                  SAPS Crime Statistics Integration
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {sapsStatistics.map((stat, index) => (
                    <Card key={index} className={`border-l-4 ${
                      stat.trend === 'down' ? 'border-l-success' : 'border-l-warning'
                    }`}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-bold">{stat.area} - {stat.crime}</h4>
                            <p className="text-sm text-muted-foreground">{stat.month}</p>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold">{stat.incidents}</div>
                            <Badge className={`${
                              stat.trend === 'down' ? 'bg-success' : 'bg-warning'
                            } text-white`}>
                              {stat.change}
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                
                <div className="mt-4 p-4 bg-primary/10 rounded-lg">
                  <div className="flex items-center justify-center space-x-2">
                    <AlertTriangle className="h-4 w-4 text-primary" />
                    <span className="font-medium">Real-time Integration with SAPS Database</span>
                  </div>
                  <p className="text-sm text-muted-foreground text-center mt-1">
                    Updated every 6 hours • Last sync: 2 hours ago
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Crime Hotspots */}
            <Card className="border-warning/20">
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <MapPin className="h-5 w-5 mr-2 text-warning" />
                  Current Crime Hotspots
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-danger/10 rounded-lg">
                    <div>
                      <div className="font-medium">Denlyn Mall Parking</div>
                      <div className="text-sm text-muted-foreground">Vehicle break-ins reported</div>
                    </div>
                    <Badge className="bg-danger text-white">High Risk</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-warning/10 rounded-lg">
                    <div>
                      <div className="font-medium">Evening Taxi Rank</div>
                      <div className="text-sm text-muted-foreground">Pickpocketing incidents</div>
                    </div>
                    <Badge className="bg-warning text-black">Medium Risk</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-success/10 rounded-lg">
                    <div>
                      <div className="font-medium">Municipal Clinic Area</div>
                      <div className="text-sm text-muted-foreground">Well patrolled, low incidents</div>
                    </div>
                    <Badge className="bg-success text-white">Low Risk</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="patrols" className="space-y-4">
            <div className="grid gap-4">
              {communityPatrols.map((patrol, index) => (
                <Card key={index} className="border-tuk-blue/20 hover:border-tuk-blue/40 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-start space-x-3">
                        <Users className="h-6 w-6 text-tuk-blue mt-1" />
                        <div>
                          <h4 className="font-bold text-lg">{patrol.name}</h4>
                          <p className="text-sm text-muted-foreground">Led by {patrol.leader}</p>
                          <div className="flex items-center text-sm text-muted-foreground">
                            <MapPin className="h-3 w-3 mr-1" />
                            <span>{patrol.area}</span>
                          </div>
                        </div>
                      </div>
                      <Badge className={`${
                        patrol.status === 'active' ? 'bg-success' : 'bg-warning'
                      } text-white`}>
                        {patrol.status}
                      </Badge>
                    </div>

                    <div className="mb-3 grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm text-muted-foreground">Members</div>
                        <div className="font-bold text-primary">{patrol.members} volunteers</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Schedule</div>
                        <div className="font-medium">{patrol.schedule}</div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="flex-1"
                      >
                        📞 {patrol.contact}
                      </Button>
                      <Button 
                        size="sm" 
                        className="bg-tuk-blue hover:bg-tuk-blue/90"
                        onClick={() => handleJoinPatrol(patrol.name)}
                      >
                        👮 Join Patrol
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Community Watch Stats */}
            <Card className="border-success/20">
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <UserCheck className="h-5 w-5 mr-2 text-success" />
                  Community Watch Impact
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-success/10 rounded-lg">
                    <div className="text-2xl font-bold text-success">47</div>
                    <div className="text-xs text-muted-foreground">Active Volunteers</div>
                  </div>
                  <div className="text-center p-3 bg-primary/10 rounded-lg">
                    <div className="text-2xl font-bold text-primary">156</div>
                    <div className="text-xs text-muted-foreground">Hours This Month</div>
                  </div>
                  <div className="text-center p-3 bg-warning/10 rounded-lg">
                    <div className="text-2xl font-bold text-warning">23</div>
                    <div className="text-xs text-muted-foreground">Incidents Prevented</div>
                  </div>
                  <div className="text-center p-3 bg-tuk-blue/10 rounded-lg">
                    <div className="text-2xl font-bold text-tuk-blue">92%</div>
                    <div className="text-xs text-muted-foreground">Safety Rating</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tips" className="space-y-4">
            {/* Anonymous Tip System */}
            <Card className="border-danger/20">
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Eye className="h-5 w-5 mr-2 text-danger" />
                  Anonymous Tip Reporting
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-muted/30 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <Shield className="h-4 w-4 text-success" />
                    <span className="font-medium text-success">100% Anonymous & Secure</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Your identity is protected. No personal information is collected or stored.
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Type of Incident</label>
                  <select 
                    className="w-full p-2 border rounded-md"
                    value={selectedIncident}
                    onChange={(e) => setSelectedIncident(e.target.value)}
                  >
                    <option value="">Select incident type</option>
                    <option value="theft">Theft</option>
                    <option value="drugs">Drug Activity</option>
                    <option value="violence">Violence/Assault</option>
                    <option value="vandalism">Vandalism</option>
                    <option value="suspicious">Suspicious Activity</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Details</label>
                  <Textarea
                    placeholder="Describe what you witnessed, when, and where. Include any relevant details that could help..."
                    value={tipDetails}
                    onChange={(e) => setTipDetails(e.target.value)}
                    className="h-24"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input placeholder="Location (optional)" />
                  <Input placeholder="Date/Time (optional)" />
                </div>

                <div className="flex gap-2">
                  <Button 
                    onClick={handleAnonymousTip}
                    className="flex-1 bg-danger hover:bg-danger/90"
                    disabled={!tipDetails.trim()}
                  >
                    🚨 Submit Anonymous Tip
                  </Button>
                  <Button variant="outline">
                    📞 Call SAPS Directly
                  </Button>
                </div>

                <div className="p-3 bg-primary/10 rounded-lg">
                  <div className="text-sm font-medium">Emergency Numbers:</div>
                  <div className="text-sm text-muted-foreground">
                    Police: 10111 • Ambulance: 10177 • Fire: 10177
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="schedule" className="space-y-4">
            {/* Watch Schedule */}
            <Card className="border-tuk-orange/20">
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Clock className="h-5 w-5 mr-2 text-tuk-orange" />
                  24/7 Neighbourhood Watch Schedule
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {watchSchedule.map((shift, index) => (
                    <Card key={index} className={`border-l-4 ${
                      shift.status === 'active' ? 'border-l-success bg-success/5' : 
                      shift.status === 'scheduled' ? 'border-l-primary bg-primary/5' : 
                      'border-l-muted bg-muted/5'
                    }`}>
                      <CardContent className="p-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="text-lg font-mono font-bold">{shift.time}</div>
                            <div>
                              <div className="font-medium">{shift.team}</div>
                              <div className="text-sm text-muted-foreground">{shift.area}</div>
                            </div>
                          </div>
                          <Badge className={`${
                            shift.status === 'active' ? 'bg-success animate-pulse' : 
                            shift.status === 'scheduled' ? 'bg-primary' : 'bg-muted'
                          } text-white`}>
                            {shift.status}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <div className="mt-4 p-4 bg-gradient-to-r from-success/10 to-primary/10 rounded-lg">
                  <div className="text-center">
                    <div className="font-bold text-lg">Community Coverage: 24/7</div>
                    <p className="text-sm text-muted-foreground">
                      Every area is monitored around the clock by dedicated volunteers
                    </p>
                    <Button className="mt-3 bg-tuk-orange hover:bg-tuk-orange/90">
                      🔔 Get Schedule Notifications
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Volunteer Opportunities */}
            <Card className="border-secondary/20">
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Users className="h-5 w-5 mr-2 text-secondary" />
                  Volunteer Opportunities
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-bold mb-2">Available Shifts</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center p-2 border rounded">
                        <span className="text-sm">Weekday Mornings</span>
                        <Badge className="bg-warning text-black">2 spots open</Badge>
                      </div>
                      <div className="flex justify-between items-center p-2 border rounded">
                        <span className="text-sm">Weekend Evenings</span>
                        <Badge className="bg-danger text-white">Urgent need</Badge>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-bold mb-2">Training & Benefits</h4>
                    <div className="text-sm space-y-1">
                      <div>✅ Free security training provided</div>
                      <div>✅ Community recognition program</div>
                      <div>✅ Direct line to SAPS</div>
                      <div>✅ Safety equipment provided</div>
                    </div>
                  </div>
                </div>
                <Button className="w-full mt-4 bg-secondary hover:bg-secondary/90">
                  🙋‍♂️ Sign Up as Volunteer
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};