import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, AlertCircle, FileText, ExternalLink, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
  const [isAdmin, setIsAdmin] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadPolicyUpdates();
    checkAdminStatus();
  }, []);

  const checkAdminStatus = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .in("role", ["admin", "councillor"])
      .eq("is_active", true)
      .single();

    setIsAdmin(!!data);
  };

  const loadPolicyUpdates = async () => {
    try {
      const { data, error } = await supabase
        .from("policy_updates")
        .select("*")
        .order("announcement_date", { ascending: false })
        .limit(10);

      if (error) throw error;
      setUpdates(data || []);
    } catch (error) {
      console.error("Error loading policy updates:", error);
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
    const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; label: string }> = {
      high: { variant: "destructive", label: "High Impact" },
      medium: { variant: "default", label: "Medium Impact" },
      low: { variant: "secondary", label: "Low Impact" },
    };
    const config = variants[level] || variants.medium;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "outline"; label: string }> = {
      announced: { variant: "default", label: "Announced" },
      active: { variant: "default", label: "Active" },
      deferred: { variant: "secondary", label: "Deferred" },
      cancelled: { variant: "outline", label: "Cancelled" },
    };
    const config = variants[status] || variants.announced;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const handleAddUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    try {
      const { error } = await supabase.from("policy_updates").insert({
        title: formData.get("title") as string,
        category: formData.get("category") as string,
        effective_date: formData.get("effective_date") as string || null,
        announcement_date: formData.get("announcement_date") as string,
        summary: formData.get("summary") as string,
        impact_level: formData.get("impact_level") as string,
        status: formData.get("status") as string,
        source_url: formData.get("source_url") as string || null,
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Policy update added successfully",
      });

      setDialogOpen(false);
      loadPolicyUpdates();
    } catch (error) {
      console.error("Error adding policy update:", error);
      toast({
        title: "Error",
        description: "Failed to add policy update",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Government Policy Updates</CardTitle>
          <CardDescription>Loading policy updates...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Government Policy Updates
            </CardTitle>
            <CardDescription>
              Track changes to AARTO, SANTACO regulations, and transport legislation
            </CardDescription>
          </div>
          {isAdmin && (
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Update
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Add Policy Update</DialogTitle>
                  <DialogDescription>
                    Add a new government policy or legislation update
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleAddUpdate} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title</Label>
                    <Input id="title" name="title" required />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="category">Category</Label>
                      <Select name="category" required>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="AARTO">AARTO</SelectItem>
                          <SelectItem value="SANTACO">SANTACO</SelectItem>
                          <SelectItem value="NLTAA">NLTAA</SelectItem>
                          <SelectItem value="Road Safety">Road Safety</SelectItem>
                          <SelectItem value="Licensing">Licensing</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="impact_level">Impact Level</Label>
                      <Select name="impact_level" required>
                        <SelectTrigger>
                          <SelectValue placeholder="Select impact" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="low">Low</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="announcement_date">Announcement Date</Label>
                      <Input id="announcement_date" name="announcement_date" type="date" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="effective_date">Effective Date</Label>
                      <Input id="effective_date" name="effective_date" type="date" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select name="status" required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="announced">Announced</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="deferred">Deferred</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="summary">Summary</Label>
                    <Textarea id="summary" name="summary" rows={4} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="source_url">Source URL (optional)</Label>
                    <Input id="source_url" name="source_url" type="url" />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">Add Update</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {updates.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No policy updates available</p>
          </div>
        ) : (
          <div className="space-y-4">
            {updates.map((update) => (
              <Card key={update.id} className="border-l-4 border-l-primary">
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline">{update.category}</Badge>
                        {getStatusBadge(update.status)}
                        {getImpactBadge(update.impact_level)}
                      </div>
                      <CardTitle className="text-lg">{update.title}</CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">{update.summary}</p>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>Announced: {format(new Date(update.announcement_date), "MMM d, yyyy")}</span>
                    </div>
                    {update.effective_date && (
                      <div className="flex items-center gap-2">
                        <AlertCircle className="h-4 w-4" />
                        <span>Effective: {format(new Date(update.effective_date), "MMM d, yyyy")}</span>
                      </div>
                    )}
                    {update.source_url && (
                      <Button
                        variant="link"
                        size="sm"
                        className="h-auto p-0"
                        asChild
                      >
                        <a href={update.source_url} target="_blank" rel="noopener noreferrer">
                          View Source <ExternalLink className="h-3 w-3 ml-1" />
                        </a>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
