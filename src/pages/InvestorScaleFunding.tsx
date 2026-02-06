import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowLeft, TrendingUp, Users, Shield, CheckCircle2, Car, Smartphone,
  MapPin, DollarSign, PieChart, Target, Zap, Globe, FileCheck, Mail,
  Phone, Building2, ArrowRight, Play, BarChart3, Wallet, Clock, Award,
  Scale, Receipt
} from "lucide-react";
import { Link } from "react-router-dom";

const InvestorScaleFunding = () => {
  const { toast } = useToast();
  const [investorForm, setInvestorForm] = useState({
    name: "", email: "", phone: "", company: "", investmentRange: "", message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    toast({ title: "Interest Registered!", description: "Our team will contact you within 24 hours." });
    setInvestorForm({ name: "", email: "", phone: "", company: "", investmentRange: "", message: "" });
    setIsSubmitting(false);
  };

  const useOfFunds = [
    { category: "Technology Development", percentage: 35, amount: "R350,000" },
    { category: "Fleet Acquisition (E-Bikes)", percentage: 25, amount: "R250,000" },
    { category: "Marketing & User Acquisition", percentage: 20, amount: "R200,000" },
    { category: "Operations & Compliance", percentage: 12, amount: "R120,000" },
    { category: "Working Capital", percentage: 8, amount: "R80,000" },
  ];

  const milestones = [
    { phase: "Phase 1", title: "MVP Launch", timeline: "Q1 2025", status: "completed" },
    { phase: "Phase 2", title: "Pilot Program", timeline: "Q2 2025", status: "current" },
    { phase: "Phase 3", title: "Scale to 50 Vehicles", timeline: "Q3 2025", status: "upcoming" },
    { phase: "Phase 4", title: "Regional Expansion", timeline: "Q4 2025", status: "upcoming" },
  ];

  const complianceItems = [
    { name: "SARS Income Tax", number: "9065004328", status: "approved", icon: Receipt },
    { name: "CIPC Registration", status: "approved", icon: Building2 },
    { name: "POPIA Compliance", status: "approved", icon: Shield },
    { name: "SANTACO Alignment", status: "in_progress", icon: Users },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-muted/30 border-b py-4 px-4">
        <div className="max-w-6xl mx-auto">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/investor">
              <ArrowLeft className="mr-2 h-4 w-4" /> All Investment Options
            </Link>
          </Button>
        </div>
      </div>

      {/* Hero */}
      <section className="py-16 px-4 bg-gradient-to-br from-blue-500/10 via-background to-accent/10">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <Badge className="bg-blue-600">Scale Funding</Badge>
            <Badge variant="outline">R1,000,000</Badge>
            <Badge variant="outline">20% Equity</Badge>
          </div>
          <h1 className="text-4xl font-bold mb-4">Platform Expansion — Scale to 50+ Vehicles</h1>
          <p className="text-xl text-muted-foreground max-w-3xl">
            Seed funding to scale from pilot to 50+ active vehicles across multiple areas and achieve
            positive unit economics with sustainable platform fees.
          </p>
        </div>
      </section>

      {/* Business Model */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5 text-primary" /> Revenue Split Model
                </CardTitle>
                <CardDescription>Industry-standard 40/60 split with platform fee</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {[
                  { label: "Owner Share", value: 40 },
                  { label: "Driver Share", value: 55 },
                  { label: "Platform Fee", value: 5 },
                ].map((item, i) => (
                  <div key={i}>
                    <div className="flex justify-between mb-2">
                      <span className="font-medium">{item.label}</span>
                      <span className="text-primary font-bold">{item.value}%</span>
                    </div>
                    <Progress value={item.value} className="h-3" />
                  </div>
                ))}
                <Separator />
                <p className="text-sm text-muted-foreground">
                  Based on R8,000 daily revenue per vehicle, platform earns R400/day per active vehicle.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-primary" /> Unit Economics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    ["Daily Gross Revenue", "R8,000"],
                    ["Monthly Revenue (26 days)", "R208,000"],
                    ["Platform Monthly Fee", "R10,400"],
                    ["Owner Net (after costs)", "R45,000+"],
                  ].map(([label, value], i) => (
                    <div key={i} className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                      <span>{label}</span>
                      <span className={`font-bold ${i === 3 ? "text-green-600" : i === 2 ? "text-primary" : ""}`}>{value}</span>
                    </div>
                  ))}
                  <Separator />
                  <div className="flex justify-between items-center p-3 bg-primary/10 rounded-lg">
                    <span className="font-medium">50 Vehicles Target</span>
                    <span className="font-bold text-primary">R520,000/month</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Additional Revenue */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wallet className="h-5 w-5 text-primary" /> Additional Revenue Streams
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { icon: Smartphone, label: "Airtime & Data", sub: "VAS commissions" },
                  { icon: Shield, label: "Insurance", sub: "Referral fees" },
                  { icon: Car, label: "Vehicle Finance", sub: "Loan facilitation" },
                  { icon: MapPin, label: "Data Analytics", sub: "Route insights" },
                ].map((item, i) => (
                  <div key={i} className="p-4 bg-muted/50 rounded-lg text-center">
                    <item.icon className="h-8 w-8 text-primary mx-auto mb-2" />
                    <p className="font-medium">{item.label}</p>
                    <p className="text-sm text-muted-foreground">{item.sub}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Compliance & Milestones */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12">
          <div>
            <h2 className="text-3xl font-bold mb-6 flex items-center gap-2">
              <Scale className="h-8 w-8 text-primary" /> Regulatory Compliance
            </h2>
            <div className="space-y-4">
              {complianceItems.map((item, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-card rounded-lg border">
                  <div className="flex items-center gap-3">
                    <item.icon className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">{item.name}</p>
                      {"number" in item && item.number && (
                        <p className="text-sm text-muted-foreground">Ref: {item.number}</p>
                      )}
                    </div>
                  </div>
                  <Badge variant={item.status === "approved" ? "default" : "secondary"}>
                    {item.status === "approved" ? (
                      <><CheckCircle2 className="h-3 w-3 mr-1" /> Approved</>
                    ) : (
                      <><Clock className="h-3 w-3 mr-1" /> In Progress</>
                    )}
                  </Badge>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-3xl font-bold mb-6 flex items-center gap-2">
              <Target className="h-8 w-8 text-primary" /> Roadmap
            </h2>
            <div className="space-y-4">
              {milestones.map((m, i) => (
                <div
                  key={i}
                  className={`flex items-center gap-4 p-4 rounded-lg border ${
                    m.status === "current" ? "bg-primary/10 border-primary"
                    : m.status === "completed" ? "bg-green-500/10 border-green-500/30" : "bg-card"
                  }`}
                >
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    m.status === "completed" ? "bg-green-500 text-white"
                    : m.status === "current" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                  }`}>
                    {m.status === "completed" ? <CheckCircle2 className="h-6 w-6" /> : <span className="font-bold">{i + 1}</span>}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{m.title}</p>
                    <p className="text-sm text-muted-foreground">{m.phase} • {m.timeline}</p>
                  </div>
                  {m.status === "current" && <Badge>Current</Badge>}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Use of Funds */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-primary" /> Use of Funds — R1,000,000
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {useOfFunds.map((item, i) => (
                  <div key={i}>
                    <div className="flex justify-between mb-2">
                      <span className="font-medium">{item.category}</span>
                      <span className="font-bold text-primary">{item.amount} ({item.percentage}%)</span>
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

      {/* Contact */}
      <section id="invest" className="py-16 px-4 bg-muted/30">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4">Express Your Interest</h2>
            <p className="text-muted-foreground">Interested? Let's start a conversation.</p>
          </div>
          <Card>
            <CardContent className="p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name *</Label>
                    <Input id="name" value={investorForm.name} onChange={(e) => setInvestorForm(prev => ({ ...prev, name: e.target.value }))} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input id="email" type="email" value={investorForm.email} onChange={(e) => setInvestorForm(prev => ({ ...prev, email: e.target.value }))} required />
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input id="phone" value={investorForm.phone} onChange={(e) => setInvestorForm(prev => ({ ...prev, phone: e.target.value }))} placeholder="+27" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="company">Company/Fund</Label>
                    <Input id="company" value={investorForm.company} onChange={(e) => setInvestorForm(prev => ({ ...prev, company: e.target.value }))} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea id="message" value={investorForm.message} onChange={(e) => setInvestorForm(prev => ({ ...prev, message: e.target.value }))} placeholder="Tell us about your interest..." rows={4} />
                </div>
                <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? "Submitting..." : <><Mail className="mr-2 h-4 w-4" /> Submit Interest</>}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default InvestorScaleFunding;
