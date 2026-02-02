import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import {
  TrendingUp,
  Users,
  Shield,
  CheckCircle2,
  Car,
  Smartphone,
  MapPin,
  DollarSign,
  PieChart,
  Target,
  Zap,
  Globe,
  FileCheck,
  Mail,
  Phone,
  Building2,
  ArrowRight,
  Play,
  BarChart3,
  Wallet,
  Clock,
  Award,
  Scale,
  Receipt,
  FileText
} from "lucide-react";
import { Link } from "react-router-dom";
import { InvestorProposalR2M } from "@/components/fleet/InvestorProposalR2M";

const InvestorPortal = () => {
  const { toast } = useToast();
  const [investorForm, setInvestorForm] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    investmentRange: "",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate submission
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    toast({
      title: "Interest Registered!",
      description: "Thank you for your interest. Our team will contact you within 24 hours.",
    });
    
    setInvestorForm({
      name: "",
      email: "",
      phone: "",
      company: "",
      investmentRange: "",
      message: ""
    });
    setIsSubmitting(false);
  };

  const marketStats = [
    { label: "Minibus Taxis in SA", value: "250,000+", icon: Car },
    { label: "Daily Passengers", value: "15 Million", icon: Users },
    { label: "Annual Industry Value", value: "R90 Billion", icon: DollarSign },
    { label: "Market Digitization", value: "<5%", icon: Smartphone }
  ];

  const complianceItems = [
    { name: "SARS Income Tax", number: "9065004328", status: "approved", icon: Receipt },
    { name: "CIPC Registration", status: "approved", icon: Building2 },
    { name: "POPIA Compliance", status: "approved", icon: Shield },
    { name: "SANTACO Alignment", status: "in_progress", icon: Users }
  ];

  const useOfFunds = [
    { category: "Technology Development", percentage: 35, amount: "R350,000" },
    { category: "Fleet Acquisition (E-Bikes)", percentage: 25, amount: "R250,000" },
    { category: "Marketing & User Acquisition", percentage: 20, amount: "R200,000" },
    { category: "Operations & Compliance", percentage: 12, amount: "R120,000" },
    { category: "Working Capital", percentage: 8, amount: "R80,000" }
  ];

  const milestones = [
    { phase: "Phase 1", title: "MVP Launch", timeline: "Q1 2025", status: "completed" },
    { phase: "Phase 2", title: "Pilot Program", timeline: "Q2 2025", status: "current" },
    { phase: "Phase 3", title: "Scale to 50 Vehicles", timeline: "Q3 2025", status: "upcoming" },
    { phase: "Phase 4", title: "Regional Expansion", timeline: "Q4 2025", status: "upcoming" }
  ];

  const teamHighlights = [
    "Deep understanding of SA taxi industry dynamics",
    "Technical expertise in mobile & fleet management",
    "Strong regulatory relationships",
    "Proven execution track record"
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Tab Navigation */}
      <Tabs defaultValue="overview" className="w-full">
        <div className="bg-muted/30 border-b sticky top-0 z-10">
          <div className="max-w-6xl mx-auto px-4">
            <TabsList className="h-14 bg-transparent overflow-x-auto flex justify-start md:justify-center">
              <TabsTrigger value="overview" className="gap-2">
                <Target className="h-4 w-4" />
                <span className="hidden sm:inline">Overview</span>
              </TabsTrigger>
              <TabsTrigger value="r2m-proposal" className="gap-2">
                <FileText className="h-4 w-4" />
                <span className="hidden sm:inline">R2M Proposal</span>
              </TabsTrigger>
            </TabsList>
          </div>
        </div>

        <TabsContent value="overview" className="mt-0">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-accent/10 py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge className="mb-4" variant="secondary">
                <Zap className="h-3 w-3 mr-1" />
                Seed Investment Opportunity
              </Badge>
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6 leading-tight">
                Digitizing South Africa's <span className="text-primary">R90 Billion</span> Taxi Industry
              </h1>
              <p className="text-xl text-muted-foreground mb-8">
                MOBILITY ONE is building the operating system for minibus taxis — connecting passengers, 
                drivers, and owners through technology that respects industry traditions while unlocking 
                massive efficiency gains.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button size="lg" asChild>
                  <a href="#invest">
                    Express Interest <ArrowRight className="ml-2 h-4 w-4" />
                  </a>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link to="/fleet-vehicles">
                    <Play className="mr-2 h-4 w-4" /> See Platform Demo
                  </Link>
                </Button>
              </div>
            </div>
            <div className="relative">
              <Card className="bg-card/80 backdrop-blur border-primary/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-primary" />
                    Investment Highlights
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
                    <div>
                      <p className="font-medium">First-Mover Advantage</p>
                      <p className="text-sm text-muted-foreground">{"<"}5% of taxi industry digitized</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
                    <div>
                      <p className="font-medium">Asset-Light Model</p>
                      <p className="text-sm text-muted-foreground">Platform revenue with 40/60 split</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
                    <div>
                      <p className="font-medium">Regulatory Ready</p>
                      <p className="text-sm text-muted-foreground">SARS, POPIA, DOT compliant</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
                    <div>
                      <p className="font-medium">Working Product</p>
                      <p className="text-sm text-muted-foreground">Live MVP with real users</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Market Opportunity */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">The Market Opportunity</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              South Africa's minibus taxi industry is the backbone of public transport, 
              yet remains largely untouched by digital transformation.
            </p>
          </div>
          
          <div className="grid md:grid-cols-4 gap-6 mb-12">
            {marketStats.map((stat, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <stat.icon className="h-10 w-10 text-primary mx-auto mb-4" />
                  <p className="text-3xl font-bold text-foreground mb-2">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
            <CardContent className="p-8">
              <div className="grid md:grid-cols-3 gap-8">
                <div>
                  <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                    <Globe className="h-5 w-5 text-primary" />
                    The Problem
                  </h3>
                  <p className="text-muted-foreground">
                    Cash-based operations, no route optimization, safety concerns, 
                    and lack of transparency between owners and drivers.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                    <Zap className="h-5 w-5 text-primary" />
                    Our Solution
                  </h3>
                  <p className="text-muted-foreground">
                    Digital payments, real-time tracking, automated revenue sharing, 
                    and compliance management in one platform.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    The Opportunity
                  </h3>
                  <p className="text-muted-foreground">
                    Capture 1% of the market = R900M annual transaction volume 
                    with sustainable platform fees.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Business Model */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Business Model</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              A transparent revenue model that aligns incentives between platform, owners, and drivers.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5 text-primary" />
                  Revenue Split Model
                </CardTitle>
                <CardDescription>
                  Industry-standard 40/60 split with platform fee
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="font-medium">Owner Share</span>
                    <span className="text-primary font-bold">40%</span>
                  </div>
                  <Progress value={40} className="h-3" />
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="font-medium">Driver Share</span>
                    <span className="text-primary font-bold">55%</span>
                  </div>
                  <Progress value={55} className="h-3" />
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="font-medium">Platform Fee</span>
                    <span className="text-primary font-bold">5%</span>
                  </div>
                  <Progress value={5} className="h-3" />
                </div>
                <Separator />
                <p className="text-sm text-muted-foreground">
                  Based on R8,000 daily revenue per vehicle, platform earns R400/day per active vehicle.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  Unit Economics
                </CardTitle>
                <CardDescription>
                  Per vehicle financial model
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                    <span>Daily Gross Revenue</span>
                    <span className="font-bold">R8,000</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                    <span>Monthly Revenue (26 days)</span>
                    <span className="font-bold">R208,000</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                    <span>Platform Monthly Fee</span>
                    <span className="font-bold text-primary">R10,400</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                    <span>Owner Net (after costs)</span>
                    <span className="font-bold text-green-600">R45,000+</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center p-3 bg-primary/10 rounded-lg">
                    <span className="font-medium">50 Vehicles Target</span>
                    <span className="font-bold text-primary">R520,000/month</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Additional Revenue Streams */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wallet className="h-5 w-5 text-primary" />
                Additional Revenue Streams
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-4 gap-4">
                <div className="p-4 bg-muted/50 rounded-lg text-center">
                  <Smartphone className="h-8 w-8 text-primary mx-auto mb-2" />
                  <p className="font-medium">Airtime & Data</p>
                  <p className="text-sm text-muted-foreground">VAS commissions</p>
                </div>
                <div className="p-4 bg-muted/50 rounded-lg text-center">
                  <Shield className="h-8 w-8 text-primary mx-auto mb-2" />
                  <p className="font-medium">Insurance</p>
                  <p className="text-sm text-muted-foreground">Referral fees</p>
                </div>
                <div className="p-4 bg-muted/50 rounded-lg text-center">
                  <Car className="h-8 w-8 text-primary mx-auto mb-2" />
                  <p className="font-medium">Vehicle Finance</p>
                  <p className="text-sm text-muted-foreground">Loan facilitation</p>
                </div>
                <div className="p-4 bg-muted/50 rounded-lg text-center">
                  <MapPin className="h-8 w-8 text-primary mx-auto mb-2" />
                  <p className="font-medium">Data Analytics</p>
                  <p className="text-sm text-muted-foreground">Route insights</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Compliance & Traction */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12">
            {/* Compliance Status */}
            <div>
              <h2 className="text-3xl font-bold mb-6 flex items-center gap-2">
                <Scale className="h-8 w-8 text-primary" />
                Regulatory Compliance
              </h2>
              <p className="text-muted-foreground mb-6">
                We've invested in compliance from day one, reducing risk and building trust with stakeholders.
              </p>
              <div className="space-y-4">
                {complianceItems.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-card rounded-lg border">
                    <div className="flex items-center gap-3">
                      <item.icon className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-medium">{item.name}</p>
                        {item.number && (
                          <p className="text-sm text-muted-foreground">Ref: {item.number}</p>
                        )}
                      </div>
                    </div>
                    <Badge variant={item.status === 'approved' ? 'default' : 'secondary'}>
                      {item.status === 'approved' ? (
                        <><CheckCircle2 className="h-3 w-3 mr-1" /> Approved</>
                      ) : (
                        <><Clock className="h-3 w-3 mr-1" /> In Progress</>
                      )}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>

            {/* Milestones */}
            <div>
              <h2 className="text-3xl font-bold mb-6 flex items-center gap-2">
                <Target className="h-8 w-8 text-primary" />
                Roadmap & Milestones
              </h2>
              <p className="text-muted-foreground mb-6">
                Clear path from MVP to market leadership in the SA taxi tech space.
              </p>
              <div className="space-y-4">
                {milestones.map((milestone, index) => (
                  <div 
                    key={index} 
                    className={`flex items-center gap-4 p-4 rounded-lg border ${
                      milestone.status === 'current' 
                        ? 'bg-primary/10 border-primary' 
                        : milestone.status === 'completed'
                        ? 'bg-green-500/10 border-green-500/30'
                        : 'bg-card'
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      milestone.status === 'completed' 
                        ? 'bg-green-500 text-white'
                        : milestone.status === 'current'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground'
                    }`}>
                      {milestone.status === 'completed' ? (
                        <CheckCircle2 className="h-6 w-6" />
                      ) : (
                        <span className="font-bold">{index + 1}</span>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{milestone.title}</p>
                      <p className="text-sm text-muted-foreground">{milestone.phase} • {milestone.timeline}</p>
                    </div>
                    {milestone.status === 'current' && (
                      <Badge variant="default">Current</Badge>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Use of Funds */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Investment Ask: R1,000,000</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Seed funding to scale from pilot to 50+ active vehicles and achieve positive unit economics.
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-primary" />
                Use of Funds
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {useOfFunds.map((item, index) => (
                  <div key={index}>
                    <div className="flex justify-between mb-2">
                      <span className="font-medium">{item.category}</span>
                      <div className="text-right">
                        <span className="font-bold text-primary">{item.amount}</span>
                        <span className="text-muted-foreground ml-2">({item.percentage}%)</span>
                      </div>
                    </div>
                    <Progress value={item.percentage} className="h-2" />
                  </div>
                ))}
              </div>
              
              <Separator className="my-8" />
              
              <div className="grid md:grid-cols-3 gap-6 text-center">
                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="text-3xl font-bold text-primary">18 months</p>
                  <p className="text-sm text-muted-foreground">Runway</p>
                </div>
                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="text-3xl font-bold text-primary">50+</p>
                  <p className="text-sm text-muted-foreground">Target Vehicles</p>
                </div>
                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="text-3xl font-bold text-primary">R520K</p>
                  <p className="text-sm text-muted-foreground">Monthly Revenue Target</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Team */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Why Us?</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              A team built for this specific challenge.
            </p>
          </div>

          <Card>
            <CardContent className="p-8">
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                    <Award className="h-5 w-5 text-primary" />
                    Team Strengths
                  </h3>
                  <ul className="space-y-3">
                    {teamHighlights.map((highlight, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
                        <span>{highlight}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                    <FileCheck className="h-5 w-5 text-primary" />
                    What We've Built
                  </h3>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
                      <span>Full-featured passenger & driver apps</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
                      <span>Owner fleet management dashboard</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
                      <span>Real-time tracking & panic button</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
                      <span>Payment processing integration</span>
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Contact Form */}
      <section id="invest" className="py-16 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Express Your Interest</h2>
            <p className="text-muted-foreground">
              Interested in joining us on this journey? Let's start a conversation.
            </p>
          </div>

          <Card>
            <CardContent className="p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      value={investorForm.name}
                      onChange={(e) => setInvestorForm(prev => ({ ...prev, name: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={investorForm.email}
                      onChange={(e) => setInvestorForm(prev => ({ ...prev, email: e.target.value }))}
                      required
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      value={investorForm.phone}
                      onChange={(e) => setInvestorForm(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="+27"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="company">Company/Fund</Label>
                    <Input
                      id="company"
                      value={investorForm.company}
                      onChange={(e) => setInvestorForm(prev => ({ ...prev, company: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="investmentRange">Investment Range</Label>
                  <select
                    id="investmentRange"
                    className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                    value={investorForm.investmentRange}
                    onChange={(e) => setInvestorForm(prev => ({ ...prev, investmentRange: e.target.value }))}
                  >
                    <option value="">Select range...</option>
                    <option value="R50,000 - R100,000">R50,000 - R100,000</option>
                    <option value="R100,000 - R250,000">R100,000 - R250,000</option>
                    <option value="R250,000 - R500,000">R250,000 - R500,000</option>
                    <option value="R500,000 - R1,000,000">R500,000 - R1,000,000</option>
                    <option value="R1,000,000+">R1,000,000+</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    value={investorForm.message}
                    onChange={(e) => setInvestorForm(prev => ({ ...prev, message: e.target.value }))}
                    placeholder="Tell us about your interest and any questions you have..."
                    rows={4}
                  />
                </div>

                <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? (
                    "Submitting..."
                  ) : (
                    <>
                      <Mail className="mr-2 h-4 w-4" />
                      Submit Interest
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          <div className="mt-8 text-center text-muted-foreground">
            <p className="flex items-center justify-center gap-2">
              <Phone className="h-4 w-4" />
              Or contact us directly: +27 XX XXX XXXX
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t">
        <div className="max-w-6xl mx-auto text-center text-muted-foreground">
          <p className="mb-2">© 2025 MOBILITY ONE. All rights reserved.</p>
          <div className="flex justify-center gap-4">
            <Link to="/" className="hover:text-primary">Home</Link>
            <Link to="/privacy-policy" className="hover:text-primary">Privacy Policy</Link>
            <Link to="/terms-of-service" className="hover:text-primary">Terms of Service</Link>
          </div>
        </div>
      </footer>
        </TabsContent>

        <TabsContent value="r2m-proposal" className="mt-0">
          <section className="py-8 px-4">
            <div className="max-w-6xl mx-auto">
              <InvestorProposalR2M />
            </div>
          </section>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default InvestorPortal;
