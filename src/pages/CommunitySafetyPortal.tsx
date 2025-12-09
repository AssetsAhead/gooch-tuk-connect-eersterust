import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Shield, 
  Eye, 
  Camera, 
  MapPin, 
  Users, 
  AlertTriangle, 
  Heart,
  Building,
  ArrowLeft,
  Sparkles
} from "lucide-react";
import AIIncidentDetector from "@/components/camera/AIIncidentDetector";

const CommunitySafetyPortal = () => {
  const [activeTab, setActiveTab] = useState("ai-detection");

  const safetyFeatures = [
    {
      id: "ai-detection",
      icon: Sparkles,
      title: "AI Incident Detection",
      description: "AI-powered analysis of camera feeds",
      color: "primary",
      features: [
        "Automatic incident detection",
        "License plate recognition",
        "Traffic violation detection",
        "Real-time safety alerts"
      ]
    },
    {
      id: "witness",
      icon: Eye,
      title: "Safety Witness Network",
      description: "Report incidents anonymously via QR codes",
      color: "success",
      features: [
        "Anonymous incident reporting",
        "Photo/video evidence upload",
        "Real-time geofenced alerts",
        "Multi-language support"
      ]
    },
    {
      id: "neighborhood",
      icon: Users,
      title: "Neighborhood Watch",
      description: "Join community marshals and safety volunteers",
      color: "success",
      features: [
        "Volunteer community marshals",
        "Safe Haven business network",
        "Coordinated patrol routes",
        "Community safety ratings"
      ]
    },
    {
      id: "infrastructure",
      icon: Building,
      title: "Public Infrastructure Safety",
      description: "Rate and report on taxi rank safety",
      color: "tuk-blue",
      features: [
        "Taxi rank safety ratings",
        "Infrastructure issue reporting",
        "Real-time safety status",
        "Community maintenance alerts"
      ]
    },
    {
      id: "emergency",
      icon: Shield,
      title: "Emergency Response",
      description: "Extended panic button for community members",
      color: "danger",
      features: [
        "Community first responders",
        "Extended panic button access",
        "Mass alert system",
        "Emergency contact network"
      ]
    }
  ];

  const integrationPartners = [
    { name: "SAPS Community Policing", type: "Government", status: "Active" },
    { name: "Tshwane Metro Police", type: "Municipal", status: "Planned" },
    { name: "SANTACO Safety Committee", type: "Industry", status: "Active" },
    { name: "Cellular Providers", type: "Technology", status: "In Progress" },
    { name: "Municipality GIS", type: "Government", status: "Planned" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link to="/">
            <Button variant="outline" className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Button>
          </Link>
          <Badge variant="secondary" className="text-sm">
            Community Portal
          </Badge>
        </div>
        {/* Quick Home FAB */}
        <div className="fixed bottom-4 right-4 z-50">
          <Link to="/">
            <Button variant="secondary" className="shadow-lg" aria-label="Home">
              Home
            </Button>
          </Link>
        </div>

        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Shield className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="text-primary">Community Safety</span> Portal
          </h1>
          <p className="text-xl text-muted-foreground mb-6 max-w-3xl mx-auto">
            Join the movement to keep our townships safe. Even if you don't use taxis, 
            you can still be a safety hero in your community.
          </p>
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            <Badge variant="outline" className="bg-success/10 text-success border-success/20">
              🏛️ Local to National Scale
            </Badge>
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
              📱 Easy Participation
            </Badge>
            <Badge variant="outline" className="bg-tuk-blue/10 text-tuk-blue border-tuk-blue/20">
              🤝 Community Driven
            </Badge>
          </div>
        </div>

        {/* Feature Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {safetyFeatures.map((feature) => {
            const IconComponent = feature.icon;
            return (
              <Card 
                key={feature.id}
                className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                  activeTab === feature.id ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => setActiveTab(feature.id)}
              >
                <CardHeader className="text-center">
                  <div className={`w-12 h-12 bg-${feature.color}/10 rounded-full flex items-center justify-center mx-auto mb-2`}>
                    <IconComponent className={`w-6 h-6 text-${feature.color}`} />
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                  <CardDescription className="text-sm">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            );
          })}
        </div>

        {/* Active Feature Details */}
        {activeTab === "ai-detection" ? (
          <div className="mb-12">
            <AIIncidentDetector />
          </div>
        ) : (
          <Card className="mb-12">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                {(() => {
                  const activeFeature = safetyFeatures.find(f => f.id === activeTab);
                  const IconComponent = activeFeature?.icon || Shield;
                  return (
                    <>
                      <IconComponent className="w-6 h-6 text-primary" />
                      {activeFeature?.title}
                    </>
                  );
                })()}
              </CardTitle>
              <CardDescription>
                How you can contribute to community safety
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3">Key Features:</h4>
                  <ul className="space-y-2">
                    {safetyFeatures.find(f => f.id === activeTab)?.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-primary rounded-full" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-3">Getting Started:</h4>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center text-xs font-bold text-primary">1</div>
                      <p className="text-sm">Register as a community safety volunteer</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center text-xs font-bold text-primary">2</div>
                      <p className="text-sm">Choose your preferred participation level</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center text-xs font-bold text-primary">3</div>
                      <p className="text-sm">Start contributing to community safety</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Integration Partners */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Heart className="w-6 h-6 text-danger" />
              Our Safety Partners
            </CardTitle>
            <CardDescription>
              Working together with key organizations for maximum impact
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {integrationPartners.map((partner, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div>
                    <p className="font-medium">{partner.name}</p>
                    <p className="text-sm text-muted-foreground">{partner.type}</p>
                  </div>
                  <Badge 
                    variant={partner.status === 'Active' ? 'default' : 
                            partner.status === 'In Progress' ? 'secondary' : 'outline'}
                  >
                    {partner.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Call to Action */}
        <div className="text-center">
          <Button size="lg" className="bg-gradient-to-r from-primary to-success hover:from-primary/90 hover:to-success/90 text-white font-bold py-4 px-8">
            Join the Safety Network
          </Button>
          <p className="text-sm text-muted-foreground mt-4">
            Be part of the solution. Your community needs you.
          </p>
        </div>
      </div>
    </div>
  );
};

export default CommunitySafetyPortal;