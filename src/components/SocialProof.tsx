import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Users, TrendingUp, MapPin, Clock } from "lucide-react";
import { useState, useEffect } from "react";

export const SocialProof = () => {
  const [liveStats, setLiveStats] = useState({
    activeRides: 23,
    onlineDrivers: 15,
    totalEarnings: 2450,
    helpRequests: 2
  });

  // Simulate live updates
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveStats(prev => ({
        activeRides: prev.activeRides + Math.floor(Math.random() * 3) - 1,
        onlineDrivers: Math.max(10, prev.onlineDrivers + Math.floor(Math.random() * 3) - 1),
        totalEarnings: prev.totalEarnings + Math.floor(Math.random() * 50),
        helpRequests: Math.max(0, prev.helpRequests + Math.floor(Math.random() * 2) - 1)
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const popularRoutes = [
    { route: "Denlyn Mall → Municipal Clinic", rides: 45, trend: "+12%", busy: true },
    { route: "Pick n Pay → Highlands Park", rides: 38, trend: "+8%", busy: true },
    { route: "Silverton → Eastlynne", rides: 29, trend: "+5%", busy: false },
    { route: "Mamelodi Mall → Poort", rides: 22, trend: "-3%", busy: false }
  ];

  const liveActivity = [
    { user: "Sipho M.", action: "completed ride to Denlyn Mall", time: "2 min ago", points: "+15" },
    { user: "Sarah K.", action: "helped elderly passenger", time: "5 min ago", points: "+25" },
    { user: "Thabo N.", action: "returned lost phone", time: "8 min ago", points: "+50" },
    { user: "Nomsa D.", action: "reported pothole", time: "12 min ago", points: "+10" }
  ];

  const communityGoals = [
    { 
      title: "Weekly Safety Goal", 
      description: "Zero incidents this week", 
      progress: 85, 
      participants: 47,
      reward: "R500 bonus pool"
    },
    { 
      title: "Lost & Found Challenge", 
      description: "Return 10 lost items", 
      progress: 60, 
      participants: 23,
      reward: "Champion badges"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Live Community Stats */}
      <Card className="border-primary/20 relative overflow-hidden">
        <div className="absolute top-2 right-2">
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
            <span className="text-xs text-success font-medium">LIVE</span>
          </div>
        </div>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Eye className="h-6 w-6 mr-2 text-primary" />
            🔥 Right Now in Eersterust
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-primary/10 rounded-lg">
              <div className="text-2xl font-bold text-primary animate-pulse">{liveStats.activeRides}</div>
              <p className="text-xs text-muted-foreground">Active Rides</p>
            </div>
            <div className="text-center p-3 bg-success/10 rounded-lg">
              <div className="text-2xl font-bold text-success">{liveStats.onlineDrivers}</div>
              <p className="text-xs text-muted-foreground">Drivers Online</p>
            </div>
            <div className="text-center p-3 bg-warning/10 rounded-lg">
              <div className="text-2xl font-bold text-warning">R{liveStats.totalEarnings}</div>
              <p className="text-xs text-muted-foreground">Today's Earnings</p>
            </div>
            <div className="text-center p-3 bg-danger/10 rounded-lg">
              <div className="text-2xl font-bold text-danger">{liveStats.helpRequests}</div>
              <p className="text-xs text-muted-foreground">Help Requests</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Popular Routes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="h-6 w-6 mr-2 text-success" />
              📈 Trending Routes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {popularRoutes.map((route, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4 text-primary" />
                      <span className="font-medium text-sm">{route.route}</span>
                      {route.busy && (
                        <Badge className="bg-warning text-white text-xs animate-pulse">Hot!</Badge>
                      )}
                    </div>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="text-xs text-muted-foreground">{route.rides} rides today</span>
                      <span className={`text-xs font-medium ${
                        route.trend.startsWith('+') ? 'text-success' : 'text-danger'
                      }`}>
                        {route.trend}
                      </span>
                    </div>
                  </div>
                  <Button size="sm" variant="outline" className="text-xs">
                    Go There
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Live Activity Feed */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="h-6 w-6 mr-2 text-tuk-blue" />
              ⚡ Live Community Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {liveActivity.map((activity, index) => (
                <div key={index} className="flex items-start space-x-3 p-2 hover:bg-muted/20 rounded-lg transition-colors">
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white text-xs font-bold">
                    {activity.user.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm">
                      <span className="font-medium">{activity.user}</span> {activity.action}
                    </p>
                    <div className="flex items-center space-x-2 mt-1">
                      <div className="flex items-center text-xs text-muted-foreground">
                        <Clock className="h-3 w-3 mr-1" />
                        {activity.time}
                      </div>
                      <Badge className="bg-success text-white text-xs">
                        {activity.points}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="outline" className="w-full mt-3 text-xs">
              View All Activity
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Community Challenges */}
      <Card className="border-warning/20">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="h-6 w-6 mr-2 text-warning" />
            🏆 Community Challenges
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {communityGoals.map((goal, index) => (
              <div key={index} className="p-4 bg-gradient-to-r from-warning/10 to-success/10 rounded-lg border border-warning/20">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h4 className="font-bold">{goal.title}</h4>
                    <p className="text-sm text-muted-foreground">{goal.description}</p>
                  </div>
                  <Badge className="bg-warning text-white">
                    {goal.participants} joined
                  </Badge>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progress</span>
                    <span className="font-medium">{goal.progress}%</span>
                  </div>
                  <div className="w-full bg-muted h-2 rounded-full">
                    <div 
                      className="bg-gradient-to-r from-warning to-success h-2 rounded-full transition-all duration-1000"
                      style={{ width: `${goal.progress}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">Reward: {goal.reward}</span>
                    <Button size="sm" className="bg-warning hover:bg-warning/90 text-xs">
                      Join Challenge
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};