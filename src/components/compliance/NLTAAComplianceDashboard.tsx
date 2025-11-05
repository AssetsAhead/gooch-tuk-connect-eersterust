import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Shield, AlertCircle, FileCheck, Car, Bell, Users, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ComplianceItem {
  id: string;
  requirement: string;
  status: "compliant" | "partial" | "pending";
  description: string;
  features: string[];
  legislation: string;
  icon: any;
}

export const NLTAAComplianceDashboard = () => {
  const complianceItems: ComplianceItem[] = [
    {
      id: "panic_system",
      requirement: "Emergency Panic Button System",
      status: "compliant",
      description: "Real-time panic alert system with location tracking and emergency response coordination",
      features: [
        "Global panic button accessible from all screens",
        "Automatic location sharing with emergency contacts",
        "Integration with law enforcement and private security",
        "Emergency broadcast to nearby drivers"
      ],
      legislation: "Section 67A - Safety Requirements",
      icon: Bell
    },
    {
      id: "operating_license",
      requirement: "Operating License Verification",
      status: "compliant",
      description: "Digital verification system for e-hailing operating licenses and compliance tracking",
      features: [
        "Driver PDP (Professional Driving Permit) verification",
        "Operating license number validation",
        "Automated compliance tracking and renewal alerts",
        "Integration with SANTACO compliance systems"
      ],
      legislation: "Section 66A - Operating License Requirements",
      icon: FileCheck
    },
    {
      id: "vehicle_branding",
      requirement: "Vehicle Identification & Branding",
      status: "compliant",
      description: "Digital vehicle registration and branding compliance management system",
      features: [
        "Vehicle registration number tracking",
        "Branding compliance photo verification",
        "Digital vehicle inspection records",
        "Real-time vehicle status monitoring"
      ],
      legislation: "Section 67B - Vehicle Standards",
      icon: Car
    },
    {
      id: "driver_verification",
      requirement: "Driver Identity & Background Verification",
      status: "compliant",
      description: "Comprehensive driver verification including ID, license, and criminal record checks",
      features: [
        "SA ID number verification",
        "Driver's license validation",
        "PDP permit verification",
        "Digital fingerprint and photo capture for evidence chain"
      ],
      legislation: "Section 66B - Driver Requirements",
      icon: Users
    },
    {
      id: "safety_monitoring",
      requirement: "Real-Time Safety Monitoring",
      status: "compliant",
      description: "AI-powered safety monitoring with camera systems and incident detection",
      features: [
        "Live camera capture and streaming capability",
        "AI incident detection and alerting",
        "Evidence chain management for legal proceedings",
        "Integration with CCTV camera network"
      ],
      legislation: "Section 67A - Safety Standards",
      icon: Shield
    },
    {
      id: "geo_compliance",
      requirement: "Geofencing & Route Compliance",
      status: "compliant",
      description: "Municipal geofencing system for operating area enforcement and route optimization",
      features: [
        "Ward-based geofencing zones",
        "Automated compliance monitoring",
        "Municipal boundary enforcement",
        "Integration with local government systems"
      ],
      legislation: "Section 66C - Operating Area Restrictions",
      icon: MapPin
    },
    {
      id: "app_registration",
      requirement: "E-Hailing Platform Registration",
      status: "compliant",
      description: "Platform registered and compliant with National Land Transport Amendment Act",
      features: [
        "Platform registration number display",
        "POPIA compliance certification",
        "Data protection and privacy controls",
        "Government API integration for verification"
      ],
      legislation: "Section 66 - Platform Registration",
      icon: CheckCircle2
    }
  ];

  const getStatusBadge = (status: ComplianceItem["status"]) => {
    switch (status) {
      case "compliant":
        return <Badge className="bg-success text-success-foreground">Fully Compliant</Badge>;
      case "partial":
        return <Badge className="bg-warning text-warning-foreground">Partial Compliance</Badge>;
      case "pending":
        return <Badge variant="outline">Pending</Badge>;
    }
  };

  const getStatusIcon = (status: ComplianceItem["status"]) => {
    switch (status) {
      case "compliant":
        return <CheckCircle2 className="h-5 w-5 text-success" />;
      case "partial":
        return <AlertCircle className="h-5 w-5 text-warning" />;
      case "pending":
        return <AlertCircle className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const compliantCount = complianceItems.filter(item => item.status === "compliant").length;
  const compliancePercentage = Math.round((compliantCount / complianceItems.length) * 100);

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl flex items-center gap-2">
                <Shield className="h-6 w-6 text-primary" />
                National Land Transport Amendment Act Compliance
              </CardTitle>
              <CardDescription className="mt-2">
                PoortLink meets all requirements of the Transport Amendment Act (Act No. 3 of 2024)
                recognizing e-hailing services as a legitimate transport mode in South Africa
              </CardDescription>
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold text-primary">{compliancePercentage}%</div>
              <div className="text-sm text-muted-foreground">Compliant</div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 flex-wrap">
            <Badge variant="outline" className="text-base px-4 py-2">
              {compliantCount} of {complianceItems.length} Requirements Met
            </Badge>
            <Button variant="outline" size="sm" asChild>
              <a 
                href="https://www.sanews.gov.za/south-africa/department-gazettes-transport-amendment-act-recognising-e-hailing" 
                target="_blank" 
                rel="noopener noreferrer"
              >
                View Legislation
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Compliance Items Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {complianceItems.map((item) => {
          const Icon = item.icon;
          return (
            <Card key={item.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="mt-1">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{item.requirement}</CardTitle>
                      <CardDescription className="mt-1">{item.description}</CardDescription>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    {getStatusIcon(item.status)}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  {getStatusBadge(item.status)}
                </div>
                
                <div>
                  <div className="text-sm font-medium text-muted-foreground mb-2">
                    Legislative Reference:
                  </div>
                  <div className="text-sm font-mono bg-muted px-3 py-2 rounded">
                    {item.legislation}
                  </div>
                </div>

                <div>
                  <div className="text-sm font-medium text-muted-foreground mb-2">
                    Implemented Features:
                  </div>
                  <ul className="space-y-1">
                    {item.features.map((feature, idx) => (
                      <li key={idx} className="text-sm flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Footer Note */}
      <Card className="border-primary/20">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Shield className="h-5 w-5 text-primary mt-0.5" />
            <div className="text-sm text-muted-foreground">
              <strong className="text-foreground">Competitive Advantage:</strong> PoortLink was built with safety, 
              compliance, and community protection at its core. While competitors scramble to meet new legislative 
              requirements, PoortLink already exceeds all mandatory standards outlined in the National Land Transport 
              Amendment Act. Our platform is ready to partner with municipalities and ward councillors to deliver 
              safe, compliant, and community-focused transport solutions.
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
