import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Building2, 
  TrendingUp, 
  Users, 
  Heart, 
  Upload, 
  Facebook, 
  Instagram, 
  Linkedin, 
  Youtube,
  ArrowUp,
  ArrowDown,
  Star,
  Shield,
  MapPin,
  Camera
} from "lucide-react";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Area, AreaChart } from "recharts";
import { PanicButton } from "@/components/PanicButton";
import { ReputationSystem } from "@/components/ReputationSystem";
import { CrimeMap } from "@/components/CrimeMap";
import { SocialProof } from "@/components/SocialProof";

const BusinessPortal = () => {
  const [activeTab, setActiveTab] = useState("overview");

  // Sample data for impressive graphs
  const communityImpactData = [
    { name: "Jan", crimes_prevented: 45, good_deeds: 89, community_score: 92 },
    { name: "Feb", crimes_prevented: 52, good_deeds: 95, community_score: 94 },
    { name: "Mar", crimes_prevented: 38, good_deeds: 103, community_score: 89 },
    { name: "Apr", crimes_prevented: 61, good_deeds: 127, community_score: 96 },
    { name: "May", crimes_prevented: 49, good_deeds: 142, community_score: 98 },
    { name: "Jun", crimes_prevented: 73, good_deeds: 156, community_score: 99 }
  ];

  const businessCategoriesData = [
    { name: "Taxi Services", value: 45, color: "hsl(var(--primary))" },
    { name: "Small Shops", value: 28, color: "hsl(var(--success))" },
    { name: "Security", value: 15, color: "hsl(var(--tuk-blue))" },
    { name: "Services", value: 12, color: "hsl(var(--tuk-orange))" }
  ];

  const safetyMetrics = [
    { month: "Jan", incidents: 23, resolved: 21, prevention_rate: 91 },
    { month: "Feb", incidents: 18, resolved: 17, prevention_rate: 94 },
    { month: "Mar", incidents: 15, resolved: 15, prevention_rate: 100 },
    { month: "Apr", incidents: 12, resolved: 12, prevention_rate: 100 },
    { month: "May", incidents: 8, resolved: 8, prevention_rate: 100 },
    { month: "Jun", incidents: 5, resolved: 5, prevention_rate: 100 }
  ];

  const chartConfig = {
    crimes_prevented: {
      label: "Crimes Prevented",
      color: "hsl(var(--danger))"
    },
    good_deeds: {
      label: "Good Deeds",
      color: "hsl(var(--success))"
    },
    community_score: {
      label: "Community Score",
      color: "hsl(var(--primary))"
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Back Button */}
      <div className="fixed top-4 left-4 z-50">
        <Button
          onClick={() => window.history.back()}
          variant="outline"
          className="bg-background/90 backdrop-blur-sm"
        >
          ← Back to Home
        </Button>
      </div>

      <div className="container mx-auto px-4 py-8 pt-20">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Building2 className="h-12 w-12 text-primary" />
            <h1 className="text-4xl md:text-5xl font-bold">
              <span className="text-primary">Business</span>{" "}
              <span className="text-success">Heroes</span>{" "}
              <span className="text-tuk-blue">Portal</span>
            </h1>
          </div>
          <p className="text-xl text-muted-foreground mb-6 max-w-3xl mx-auto">
            Where businesses become community champions. Showcase your good deeds, 
            access digital services, and be part of South Africa's safety revolution.
          </p>
          
          {/* Key Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto mb-8">
            <div className="bg-success/10 p-4 rounded-lg border border-success/20">
              <div className="text-3xl font-bold text-success">2,847</div>
              <p className="text-sm text-muted-foreground">Registered Businesses</p>
            </div>
            <div className="bg-primary/10 p-4 rounded-lg border border-primary/20">
              <div className="text-3xl font-bold text-primary">99.2%</div>
              <p className="text-sm text-muted-foreground">Safety Score</p>
            </div>
            <div className="bg-danger/10 p-4 rounded-lg border border-danger/20">
              <div className="text-3xl font-bold text-danger flex items-center">
                73 <ArrowDown className="h-4 w-4 ml-1" />
              </div>
              <p className="text-sm text-muted-foreground">Crime Incidents (↓60%)</p>
            </div>
            <div className="bg-tuk-blue/10 p-4 rounded-lg border border-tuk-blue/20">
              <div className="text-3xl font-bold text-tuk-blue flex items-center">
                R2.1M <ArrowUp className="h-4 w-4 ml-1" />
              </div>
              <p className="text-sm text-muted-foreground">Economic Impact</p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 mb-8">
            <TabsTrigger value="overview">📊 Overview</TabsTrigger> 
            <TabsTrigger value="register">🏢 Register</TabsTrigger>
            <TabsTrigger value="community">🛡️ Community</TabsTrigger>
            <TabsTrigger value="services">💼 Services</TabsTrigger>
            <TabsTrigger value="social">📱 Connect</TabsTrigger>
          </TabsList>

          {/* Overview Tab - Impressive Graphs */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Community Impact Chart */}
              <Card className="border-primary/20">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingUp className="h-6 w-6 mr-2 text-success" />
                    Community Impact Trajectory
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={chartConfig} className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={communityImpactData}>
                        <defs>
                          <linearGradient id="goodDeeds" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="hsl(var(--success))" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="hsl(var(--success))" stopOpacity={0.1}/>
                          </linearGradient>
                          <linearGradient id="crimesPrevented" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="hsl(var(--danger))" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="hsl(var(--danger))" stopOpacity={0.1}/>
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="name" />
                        <YAxis />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Area type="monotone" dataKey="good_deeds" stackId="1" stroke="hsl(var(--success))" fill="url(#goodDeeds)" />
                        <Area type="monotone" dataKey="crimes_prevented" stackId="1" stroke="hsl(var(--danger))" fill="url(#crimesPrevented)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>

              {/* Business Categories */}
              <Card className="border-tuk-blue/20">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Building2 className="h-6 w-6 mr-2 text-tuk-blue" />
                    Business Hero Categories
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={chartConfig} className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={businessCategoriesData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {businessCategoriesData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <ChartTooltip content={<ChartTooltipContent />} />
                      </PieChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                  <div className="grid grid-cols-2 gap-2 mt-4">
                    {businessCategoriesData.map((item, index) => (
                      <div key={index} className="flex items-center text-sm">
                        <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: item.color }} />
                        <span>{item.name}: {item.value}%</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Safety Performance */}
            <Card className="border-success/20">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="h-6 w-6 mr-2 text-success" />
                  Community Safety Performance - Exceeding Expectations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={safetyMetrics}>
                      <XAxis dataKey="month" />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Line 
                        type="monotone" 
                        dataKey="prevention_rate" 
                        stroke="hsl(var(--success))" 
                        strokeWidth={3}
                        dot={{ fill: "hsl(var(--success))", strokeWidth: 2, r: 6 }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="incidents" 
                        stroke="hsl(var(--danger))" 
                        strokeWidth={2}
                        strokeDasharray="5 5"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Business Registration */}
          <TabsContent value="register" className="space-y-6">
            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Building2 className="h-6 w-6 mr-2 text-primary" />
                  Register Your Business as a Community Hero
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Business Name</label>
                    <Input placeholder="Sipho's Taxi Service" />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Category</label>
                    <select className="w-full p-2 border rounded-md">
                      <option>Taxi Service</option>
                      <option>Small Shop</option>
                      <option>Security Service</option>
                      <option>Other Service</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-2 block">Location</label>
                  <Input placeholder="Eersterust, Pretoria" />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Tell us about your good deeds</label>
                  <Textarea 
                    placeholder="How does your business help the community? What good deeds have you done?"
                    className="h-32"
                  />
                </div>

                {/* File Upload Section */}
                <div className="border-2 border-dashed border-primary/30 rounded-lg p-6 text-center">
                  <Upload className="h-12 w-12 text-primary mx-auto mb-4" />
                  <p className="text-lg font-medium mb-2">Upload Photos & Documents</p>
                  <p className="text-sm text-muted-foreground mb-4">
                    Show your community work, certificates, before/after photos
                  </p>
                  <Button className="bg-primary hover:bg-primary/90">
                    <Camera className="h-4 w-4 mr-2" />
                    Choose Files
                  </Button>
                </div>

                <Button className="w-full bg-success hover:bg-success/90 text-white">
                  <Heart className="h-4 w-4 mr-2" />
                  Join the Community Heroes
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Community Features */}
          <TabsContent value="community" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <PanicButton userType="driver" userId="business-hero" currentLocation="Eersterust Main Road" />
              <SocialProof />
            </div>
            
            <CrimeMap />
            
            <ReputationSystem 
              userType="driver" 
              currentPoints={450} 
              currentLevel={2} 
              badges={["safety", "guardian", "perfect_week"]} 
            />
          </TabsContent>

          {/* Digital Services */}
          <TabsContent value="services" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="border-primary/20 hover:border-primary/40 transition-colors">
                <CardHeader>
                  <CardTitle className="text-lg">📊 Business Analytics</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Track your community impact, customer satisfaction, and business growth
                  </p>
                  <Badge className="bg-success text-white">Popular</Badge>
                  <div className="mt-4">
                    <span className="text-2xl font-bold text-primary">R299</span>
                    <span className="text-sm text-muted-foreground">/month</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-tuk-blue/20 hover:border-tuk-blue/40 transition-colors">
                <CardHeader>
                  <CardTitle className="text-lg">🌐 Digital Presence</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Professional website, social media management, online booking
                  </p>
                  <Badge className="bg-warning text-white">New</Badge>
                  <div className="mt-4">
                    <span className="text-2xl font-bold text-tuk-blue">R499</span>
                    <span className="text-sm text-muted-foreground">/month</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-success/20 hover:border-success/40 transition-colors">
                <CardHeader>
                  <CardTitle className="text-lg">💳 Payment Solutions</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Accept card payments, mobile money, automated invoicing
                  </p>
                  <Badge className="bg-primary text-white">Essential</Badge>
                  <div className="mt-4">
                    <span className="text-2xl font-bold text-success">R199</span>
                    <span className="text-sm text-muted-foreground">/month</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-tuk-orange/20 hover:border-tuk-orange/40 transition-colors">
                <CardHeader>
                  <CardTitle className="text-lg">🛡️ Insurance Services</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Vehicle insurance, business insurance, driver protection plans
                  </p>
                  <Badge className="bg-danger text-white">Premium</Badge>
                  <div className="mt-4">
                    <span className="text-2xl font-bold text-tuk-orange">R799</span>
                    <span className="text-sm text-muted-foreground">/month</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-secondary/20 hover:border-secondary/40 transition-colors">
                <CardHeader>
                  <CardTitle className="text-lg">📱 Mobile App Development</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Custom mobile app for your business with booking and tracking
                  </p>
                  <Badge className="bg-tuk-blue text-white">Custom</Badge>
                  <div className="mt-4">
                    <span className="text-2xl font-bold text-secondary">R2,999</span>
                    <span className="text-sm text-muted-foreground">/one-time</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-warning/20 hover:border-warning/40 transition-colors">
                <CardHeader>
                  <CardTitle className="text-lg">🎯 Marketing & Advertising</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Targeted ads, community engagement, reputation management
                  </p>
                  <Badge className="bg-success text-white">Growth</Badge>
                  <div className="mt-4">
                    <span className="text-2xl font-bold text-warning">R599</span>
                    <span className="text-sm text-muted-foreground">/month</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Social Media Integration */}
          <TabsContent value="social" className="space-y-6">
            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Heart className="h-6 w-6 mr-2 text-primary" />
                  Connect Your Social Media & Amplify Your Good Deeds
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Social Media Links */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Button variant="outline" className="h-20 flex-col border-blue-500/20 hover:border-blue-500/40">
                    <Facebook className="h-8 w-8 text-blue-600 mb-2" />
                    <span>Facebook</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex-col border-pink-500/20 hover:border-pink-500/40">
                    <Instagram className="h-8 w-8 text-pink-600 mb-2" />
                    <span>Instagram</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex-col border-blue-700/20 hover:border-blue-700/40">
                    <Linkedin className="h-8 w-8 text-blue-700 mb-2" />
                    <span>LinkedIn</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex-col border-red-500/20 hover:border-red-500/40">
                    <Youtube className="h-8 w-8 text-red-600 mb-2" />
                    <span>YouTube</span>
                  </Button>
                </div>

                {/* Social Proof Display */}
                <div className="bg-gradient-to-r from-success/10 to-primary/10 p-6 rounded-lg border border-success/20">
                  <h3 className="text-lg font-bold mb-4 flex items-center">
                    <Star className="h-5 w-5 text-warning mr-2" />
                    Showcase Your Community Impact
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-success">4.9⭐</div>
                      <p className="text-sm text-muted-foreground">Community Rating</p>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-primary">1,247</div>
                      <p className="text-sm text-muted-foreground">People Helped</p>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-tuk-blue">89</div>
                      <p className="text-sm text-muted-foreground">Good Deeds</p>
                    </div>
                  </div>
                </div>

                {/* Share Widget */}
                <div className="bg-card p-6 rounded-lg border">
                  <h4 className="font-bold mb-4">Share Your Latest Good Deed</h4>
                  <Textarea 
                    placeholder="Tell the community about how you helped today..."
                    className="mb-4"
                  />
                  <div className="flex gap-2">
                    <Button className="bg-primary hover:bg-primary/90">
                      📢 Share to All Platforms
                    </Button>
                    <Button variant="outline">
                      📸 Add Photo
                    </Button>
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

export default BusinessPortal;