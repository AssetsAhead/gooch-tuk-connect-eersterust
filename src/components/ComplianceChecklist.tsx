import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, Circle, AlertCircle, Clock, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

interface RegulatoryBody {
  code: string;
  name: string;
  description: string;
  required: boolean;
}

interface RegistrationStatus {
  organization_code: string;
  status: string;
}

const regulatoryBodies: RegulatoryBody[] = [
  { code: "ndot", name: "National Dept of Transport", description: "E-hailing operating license", required: true },
  { code: "cipc", name: "CIPC", description: "Legal entity registration", required: true },
  { code: "pre", name: "Provincial Regulatory Entity", description: "Regional compliance", required: true },
  { code: "santaco", name: "SANTACO", description: "Taxi industry association", required: true },
  { code: "popia", name: "Information Regulator", description: "Data protection compliance", required: true },
];

// Default seed data with realistic initial statuses for PoortLink
const DEFAULT_REGISTRATIONS = [
  {
    organization_code: 'ndot',
    organization_name: 'National Department of Transport',
    description: 'E-Hailing Platform Registration under NLTA Act 23 of 2023',
    status: 'in_progress',
    deadline: '2026-03-12'
  },
  {
    organization_code: 'cipc',
    organization_name: 'Companies and Intellectual Property Commission',
    description: 'Legal entity and trademark registration',
    status: 'approved'
  },
  {
    organization_code: 'pre',
    organization_name: 'Provincial Regulatory Entity (Gauteng)',
    description: 'Provincial transport authority registration',
    status: 'in_progress'
  },
  {
    organization_code: 'santaco',
    organization_name: 'South African National Taxi Council',
    description: 'Taxi industry body coordination',
    status: 'in_progress'
  },
  {
    organization_code: 'popia',
    organization_name: 'Information Regulator (POPIA)',
    description: 'Data protection registration',
    status: 'in_progress'
  }
];

export const ComplianceChecklist = () => {
  const { user } = useAuth();
  const [registrations, setRegistrations] = useState<RegistrationStatus[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadAndSeedRegistrations();
    } else {
      // Show defaults for non-authenticated users
      setRegistrations(DEFAULT_REGISTRATIONS.map(r => ({ 
        organization_code: r.organization_code, 
        status: r.status 
      })));
      setLoading(false);
    }
  }, [user]);

  const loadAndSeedRegistrations = async () => {
    if (!user) return;
    
    try {
      // Try to load existing registrations
      const { data, error } = await supabase
        .from("regulatory_registrations")
        .select("organization_code, status")
        .eq('user_id', user.id);
      
      if (error) throw error;

      // If no registrations exist, seed them with initial data
      if (!data || data.length === 0) {
        const seedData = DEFAULT_REGISTRATIONS.map(reg => ({
          user_id: user.id,
          organization_code: reg.organization_code,
          organization_name: reg.organization_name,
          description: reg.description,
          status: reg.status,
          deadline: reg.deadline || null
        }));

        const { error: insertError } = await supabase
          .from('regulatory_registrations')
          .insert(seedData);

        if (insertError) throw insertError;

        setRegistrations(seedData.map(r => ({ 
          organization_code: r.organization_code, 
          status: r.status 
        })));
      } else {
        setRegistrations(data);
      }
    } catch (error) {
      console.error('Error loading registrations:', error);
      // Fall back to defaults on error
      setRegistrations(DEFAULT_REGISTRATIONS.map(r => ({ 
        organization_code: r.organization_code, 
        status: r.status 
      })));
    } finally {
      setLoading(false);
    }
  };

  const getStatusForBody = (code: string) => {
    const reg = registrations.find(r => r.organization_code === code);
    return reg?.status || "not_started";
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle2 className="h-5 w-5 text-sa-green" />;
      case "in_progress":
      case "pending":
      case "submitted":
        return <Clock className="h-5 w-5 text-sa-gold" />;
      case "rejected":
        return <AlertCircle className="h-5 w-5 text-destructive" />;
      default:
        return <Circle className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-sa-green/10 text-sa-green border-sa-green/20">Approved</Badge>;
      case "in_progress":
        return <Badge className="bg-sa-gold/10 text-sa-gold border-sa-gold/20">In Progress</Badge>;
      case "pending":
        return <Badge className="bg-sa-gold/10 text-sa-gold border-sa-gold/20">Pending</Badge>;
      case "submitted":
        return <Badge className="bg-sa-blue/10 text-sa-blue border-sa-blue/20">Submitted</Badge>;
      case "rejected":
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="outline">Not Started</Badge>;
    }
  };

  const completedCount = regulatoryBodies.filter(
    body => getStatusForBody(body.code) === "approved"
  ).length;
  const inProgressCount = regulatoryBodies.filter(
    body => ["in_progress", "submitted", "pending"].includes(getStatusForBody(body.code))
  ).length;
  const totalRequired = regulatoryBodies.filter(b => b.required).length;
  const progressPercent = Math.round((completedCount / regulatoryBodies.length) * 100);

  if (loading) {
    return (
      <Card className="border-border/50">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-muted rounded w-1/3" />
            <div className="h-2 bg-muted rounded w-full" />
            <div className="space-y-2">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-8 bg-muted rounded" />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <span className="text-xl">📋</span>
            Regulatory Compliance
          </CardTitle>
          <Link to="/regulatory-registration">
            <Button variant="ghost" size="sm" className="text-xs gap-1">
              View Details <ExternalLink className="h-3 w-3" />
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">
              {completedCount} of {regulatoryBodies.length} complete
              {inProgressCount > 0 && ` • ${inProgressCount} in progress`}
            </span>
            <span className="font-medium">{progressPercent}%</span>
          </div>
          <Progress value={progressPercent} className="h-2" />
        </div>

        <div className="space-y-2">
          {regulatoryBodies.map((body) => {
            const status = getStatusForBody(body.code);
            return (
              <div
                key={body.code}
                className="flex items-center justify-between p-2 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  {getStatusIcon(status)}
                  <div>
                    <p className="text-sm font-medium">{body.name}</p>
                    <p className="text-xs text-muted-foreground">{body.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {body.required && status === "not_started" && (
                    <Badge variant="outline" className="text-xs border-destructive/30 text-destructive">
                      Required
                    </Badge>
                  )}
                  {getStatusBadge(status)}
                </div>
              </div>
            );
          })}
        </div>

        {completedCount < totalRequired && (
          <div className="pt-2 border-t border-border/50">
            <p className="text-xs text-muted-foreground text-center">
              ⚠️ {totalRequired - completedCount} required registration{totalRequired - completedCount > 1 ? 's' : ''} pending
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
