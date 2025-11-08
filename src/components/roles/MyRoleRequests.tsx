import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import { format } from "date-fns";

interface RoleRequest {
  id: string;
  requested_role: string;
  justification: string;
  status: string;
  verification_notes: string | null;
  created_at: string;
  reviewed_at: string | null;
}

export function MyRoleRequests() {
  const [requests, setRequests] = useState<RoleRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const { data, error } = await supabase
        .from("role_requests")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setRequests(data || []);
    } catch (error) {
      console.error("Error fetching role requests:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20">Pending</Badge>;
      case "approved":
        return <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20">Approved</Badge>;
      case "rejected":
        return <Badge variant="outline" className="bg-red-500/10 text-red-600 border-red-500/20">Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (requests.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>My Role Requests</CardTitle>
          <CardDescription>You haven't submitted any role requests yet.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>My Role Requests</CardTitle>
        <CardDescription>View the status of your role elevation requests.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {requests.map((request) => (
          <div key={request.id} className="border rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="font-semibold capitalize">{request.requested_role}</span>
                {getStatusBadge(request.status)}
              </div>
              <span className="text-sm text-muted-foreground">
                {format(new Date(request.created_at), "MMM d, yyyy")}
              </span>
            </div>

            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Justification:</p>
              <p className="text-sm">{request.justification}</p>
            </div>

            {request.verification_notes && (
              <div className="bg-muted/50 rounded-md p-3">
                <p className="text-sm font-medium mb-1">Admin Feedback:</p>
                <p className="text-sm">{request.verification_notes}</p>
                {request.reviewed_at && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Reviewed on {format(new Date(request.reviewed_at), "MMM d, yyyy 'at' h:mm a")}
                  </p>
                )}
              </div>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
