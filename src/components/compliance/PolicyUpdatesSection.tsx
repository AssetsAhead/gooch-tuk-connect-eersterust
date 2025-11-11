import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, ExternalLink, AlertCircle, Info, AlertTriangle } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

interface PolicyUpdate {
  id: string;
  title: string;
  category: string;
  effective_date: string | null;
  announcement_date: string;
  summary: string;
  impact_level: string;
  status: string;
  source_url: string | null;
  document_url: string | null;
}

export const PolicyUpdatesSection = () => {
  const [updates, setUpdates] = useState<PolicyUpdate[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchPolicyUpdates();
  }, []);

  const fetchPolicyUpdates = async () => {
    try {
      const { data, error } = await supabase
        .from("policy_updates")
        .select("*")
        .order("announcement_date", { ascending: false });

      if (error) throw error;
      setUpdates(data || []);
    } catch (error) {
      console.error("Error fetching policy updates:", error);
      toast({
        title: "Error",
        description: "Failed to load policy updates",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getImpactBadge = (level: string) => {
    switch (level) {
      case "high":
        return <Badge variant="destructive" className="gap-1"><AlertCircle className="h-3 w-3" />High Impact</Badge>;
      case "medium":
        return <Badge variant="default" className="gap-1"><AlertTriangle className="h-3 w-3" />Medium Impact</Badge>;
      case "low":
        return <Badge variant="secondary" className="gap-1"><Info className="h-3 w-3" />Low Impact</Badge>;
      default:
        return <Badge variant="outline">{level}</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge variant="default">Active</Badge>;
      case "deferred":
        return <Badge variant="secondary">Deferred</Badge>;
      case "announced":
        return <Badge variant="outline">Announced</Badge>;
      case "pending":
        return <Badge variant="outline">Pending</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Government Policy Updates</CardTitle>
          <CardDescription>Loading policy updates...</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Government Policy Updates
        </CardTitle>
        <CardDescription>
          Track changes to AARTO, SANTACO regulations, and other transport legislation
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {updates.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Info className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No policy updates available</p>
          </div>
        ) : (
          updates.map((update) => (
            <Card key={update.id} className="border-l-4 border-l-primary">
              <CardHeader>
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{update.title}</CardTitle>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <Badge variant="outline">{update.category}</Badge>
                      {getStatusBadge(update.status)}
                      {getImpactBadge(update.impact_level)}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">{update.summary}</p>
                
                <div className="flex flex-wrap gap-4 text-sm">
                  <div>
                    <span className="font-medium">Announced:</span>{" "}
                    {format(new Date(update.announcement_date), "MMM d, yyyy")}
                  </div>
                  {update.effective_date && (
                    <div>
                      <span className="font-medium">Effective:</span>{" "}
                      {format(new Date(update.effective_date), "MMM d, yyyy")}
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap gap-2">
                  {update.source_url && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2"
                      onClick={() => window.open(update.source_url!, "_blank")}
                    >
                      <ExternalLink className="h-3 w-3" />
                      View Source
                    </Button>
                  )}
                  {update.document_url && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2"
                      onClick={() => window.open(update.document_url!, "_blank")}
                    >
                      <ExternalLink className="h-3 w-3" />
                      Official Document
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </CardContent>
    </Card>
  );
};
