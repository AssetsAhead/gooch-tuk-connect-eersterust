import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, AlertCircle, FileText, ExternalLink, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useServerVerifiedAdmin } from "@/hooks/useServerVerifiedAdmin";
import { format } from "date-fns";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

const policyUpdateSchema = z.object({
  title: z.string()
    .trim()
    .min(1, "Title is required")
    .max(200, "Title must be less than 200 characters"),
  category: z.enum(["AARTO", "SANTACO", "NLTAA", "Road Safety", "Licensing", "Other"], {
    required_error: "Please select a category",
  }),
  impact_level: z.enum(["high", "medium", "low"], {
    required_error: "Please select an impact level",
  }),
  announcement_date: z.string()
    .min(1, "Announcement date is required")
    .refine((date) => !isNaN(Date.parse(date)), "Invalid date format"),
  effective_date: z.string()
    .optional()
    .refine((date) => !date || !isNaN(Date.parse(date)), "Invalid date format"),
  status: z.enum(["announced", "active", "deferred", "cancelled"], {
    required_error: "Please select a status",
  }),
  summary: z.string()
    .trim()
    .min(1, "Summary is required")
    .max(2000, "Summary must be less than 2000 characters"),
  source_url: z.string()
    .trim()
    .url("Must be a valid URL")
    .max(500, "URL must be less than 500 characters")
    .optional()
    .or(z.literal("")),
});

type PolicyUpdateFormData = z.infer<typeof policyUpdateSchema>;

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
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();
  const { isAdmin } = useServerVerifiedAdmin();

  const form = useForm<PolicyUpdateFormData>({
    resolver: zodResolver(policyUpdateSchema),
    defaultValues: {
      title: "",
      category: undefined,
      impact_level: undefined,
      announcement_date: "",
      effective_date: "",
      status: undefined,
      summary: "",
      source_url: "",
    },
  });

  useEffect(() => {
    loadPolicyUpdates();
  }, []);

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

  const handleAddUpdate = async (data: PolicyUpdateFormData) => {
    try {
      const { error } = await supabase.from("policy_updates").insert({
        title: data.title,
        category: data.category,
        effective_date: data.effective_date || null,
        announcement_date: data.announcement_date,
        summary: data.summary,
        impact_level: data.impact_level,
        status: data.status,
        source_url: data.source_url || null,
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Policy update added successfully",
      });

      form.reset();
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
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Add Policy Update</DialogTitle>
                  <DialogDescription>
                    Add a new government policy or legislation update
                  </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(handleAddUpdate)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Title</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Enter policy title" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="category"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Category</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="AARTO">AARTO</SelectItem>
                                <SelectItem value="SANTACO">SANTACO</SelectItem>
                                <SelectItem value="NLTAA">NLTAA</SelectItem>
                                <SelectItem value="Road Safety">Road Safety</SelectItem>
                                <SelectItem value="Licensing">Licensing</SelectItem>
                                <SelectItem value="Other">Other</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="impact_level"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Impact Level</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select impact" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="high">High</SelectItem>
                                <SelectItem value="medium">Medium</SelectItem>
                                <SelectItem value="low">Low</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="announcement_date"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Announcement Date</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="effective_date"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Effective Date (Optional)</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={form.control}
                      name="status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Status</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select status" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="announced">Announced</SelectItem>
                              <SelectItem value="active">Active</SelectItem>
                              <SelectItem value="deferred">Deferred</SelectItem>
                              <SelectItem value="cancelled">Cancelled</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="summary"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Summary</FormLabel>
                          <FormControl>
                            <Textarea {...field} rows={4} placeholder="Provide a brief summary of the policy update" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="source_url"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Source URL (Optional)</FormLabel>
                          <FormControl>
                            <Input {...field} type="url" placeholder="https://example.com/policy" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="flex justify-end gap-2">
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => {
                          form.reset();
                          setDialogOpen(false);
                        }}
                      >
                        Cancel
                      </Button>
                      <Button type="submit" disabled={form.formState.isSubmitting}>
                        {form.formState.isSubmitting ? "Adding..." : "Add Update"}
                      </Button>
                    </div>
                  </form>
                </Form>
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
