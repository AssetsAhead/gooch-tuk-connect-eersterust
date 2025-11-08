import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, CheckCircle, XCircle } from "lucide-react";
import { format } from "date-fns";

interface RoleRequest {
  id: string;
  user_id: string;
  requested_role: string;
  justification: string;
  status: string;
  verification_notes: string | null;
  created_at: string;
  reviewed_at: string | null;
}

export function RoleRequestsManager() {
  const [requests, setRequests] = useState<RoleRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [verificationNotes, setVerificationNotes] = useState<Record<string, string>>({});
  const { toast } = useToast();

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

  const handleApprove = async (request: RoleRequest) => {
    setProcessingId(request.id);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Update request status
      const { error: updateError } = await supabase
        .from("role_requests")
        .update({
          status: "approved",
          reviewed_by: user.id,
          reviewed_at: new Date().toISOString(),
          verification_notes: verificationNotes[request.id] || null,
        })
        .eq("id", request.id);

      if (updateError) throw updateError;

      // Grant the role to the user
      const { error: roleError } = await supabase
        .from("user_roles")
        .insert({
          user_id: request.user_id,
          role: request.requested_role,
          is_active: true,
        });

      if (roleError) throw roleError;

      // Get user email for notification
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", request.user_id)
        .single();

      // Send approval notification (email + SMS)
      try {
        await supabase.functions.invoke("send-role-request-email", {
          body: {
            requestId: request.id,
            userEmail: profile?.display_name || "user@example.com",
            userId: request.user_id,
            requestedRole: request.requested_role,
            status: 'approved',
            verificationNotes: verificationNotes[request.id],
          },
        });
      } catch (notificationError) {
        console.error("Failed to send notification:", notificationError);
      }

      toast({
        title: "Request Approved",
        description: `${request.requested_role} role has been granted to the user.`,
      });

      fetchRequests();
      setVerificationNotes((prev) => ({ ...prev, [request.id]: "" }));
    } catch (error: any) {
      console.error("Error approving request:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to approve request",
        variant: "destructive",
      });
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (request: RoleRequest) => {
    if (!verificationNotes[request.id]) {
      toast({
        title: "Feedback Required",
        description: "Please provide feedback explaining the rejection.",
        variant: "destructive",
      });
      return;
    }

    setProcessingId(request.id);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("role_requests")
        .update({
          status: "rejected",
          reviewed_by: user.id,
          reviewed_at: new Date().toISOString(),
          verification_notes: verificationNotes[request.id],
        })
        .eq("id", request.id);

      if (error) throw error;

      // Get user email for notification
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", request.user_id)
        .single();

      // Send rejection notification (email + SMS)
      try {
        await supabase.functions.invoke("send-role-request-email", {
          body: {
            requestId: request.id,
            userEmail: profile?.display_name || "user@example.com",
            userId: request.user_id,
            requestedRole: request.requested_role,
            status: 'rejected',
            verificationNotes: verificationNotes[request.id],
          },
        });
      } catch (notificationError) {
        console.error("Failed to send notification:", notificationError);
      }

      toast({
        title: "Request Rejected",
        description: "The user has been notified of the decision.",
      });

      fetchRequests();
      setVerificationNotes((prev) => ({ ...prev, [request.id]: "" }));
    } catch (error: any) {
      console.error("Error rejecting request:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to reject request",
        variant: "destructive",
      });
    } finally {
      setProcessingId(null);
    }
  };

  const renderRequest = (request: RoleRequest) => (
    <div key={request.id} className="border rounded-lg p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="font-semibold capitalize">{request.requested_role}</span>
          <Badge variant="outline">{request.status}</Badge>
        </div>
        <span className="text-sm text-muted-foreground">
          {format(new Date(request.created_at), "MMM d, yyyy")}
        </span>
      </div>

      <div>
        <p className="text-sm font-medium text-muted-foreground mb-1">Justification:</p>
        <p className="text-sm">{request.justification}</p>
      </div>

      {request.status === "pending" && (
        <div className="space-y-3">
          <div>
            <Label htmlFor={`notes-${request.id}`}>Verification Notes</Label>
            <Textarea
              id={`notes-${request.id}`}
              placeholder="Add verification notes or feedback..."
              value={verificationNotes[request.id] || ""}
              onChange={(e) =>
                setVerificationNotes((prev) => ({ ...prev, [request.id]: e.target.value }))
              }
              className="mt-1"
            />
          </div>

          <div className="flex gap-2">
            <Button
              onClick={() => handleApprove(request)}
              disabled={processingId === request.id}
              className="flex-1"
            >
              {processingId === request.id ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <CheckCircle className="h-4 w-4 mr-2" />
              )}
              Approve
            </Button>
            <Button
              onClick={() => handleReject(request)}
              disabled={processingId === request.id}
              variant="destructive"
              className="flex-1"
            >
              {processingId === request.id ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <XCircle className="h-4 w-4 mr-2" />
              )}
              Reject
            </Button>
          </div>
        </div>
      )}

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
  );

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  const pendingRequests = requests.filter((r) => r.status === "pending");
  const reviewedRequests = requests.filter((r) => r.status !== "pending");

  return (
    <Card>
      <CardHeader>
        <CardTitle>Role Requests Management</CardTitle>
        <CardDescription>Review and approve or reject user role elevation requests.</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="pending">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="pending">
              Pending ({pendingRequests.length})
            </TabsTrigger>
            <TabsTrigger value="reviewed">
              Reviewed ({reviewedRequests.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-4 mt-4">
            {pendingRequests.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No pending requests</p>
            ) : (
              pendingRequests.map(renderRequest)
            )}
          </TabsContent>

          <TabsContent value="reviewed" className="space-y-4 mt-4">
            {reviewedRequests.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No reviewed requests</p>
            ) : (
              reviewedRequests.map(renderRequest)
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
