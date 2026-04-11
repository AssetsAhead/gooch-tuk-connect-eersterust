import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Eye,
  Shield,
  AlertTriangle,
  MessageCircle,
  Search,
  CheckCircle,
  Clock,
  TrendingUp,
  Filter,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

const CATEGORIES = [
  { value: "all", label: "All", icon: MessageCircle, color: "text-foreground" },
  { value: "safety", label: "Safety", icon: AlertTriangle, color: "text-destructive" },
  { value: "dispute", label: "Disputes", icon: Shield, color: "text-orange-500" },
  { value: "compliance", label: "Compliance", icon: CheckCircle, color: "text-blue-500" },
  { value: "operations", label: "Operations", icon: TrendingUp, color: "text-green-500" },
  { value: "general", label: "General", icon: MessageCircle, color: "text-muted-foreground" },
];

const categoryBadgeVariant = (cat: string) => {
  switch (cat) {
    case "safety": return "destructive";
    case "dispute": return "outline";
    case "compliance": return "secondary";
    case "operations": return "default";
    default: return "outline";
  }
};

export const WhatsAppIntelHub = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMessage, setSelectedMessage] = useState<any>(null);
  const [reviewNotes, setReviewNotes] = useState("");
  const [recategoriseTo, setRecategoriseTo] = useState("");

  // Fetch intel messages
  const { data: messages = [], isLoading } = useQuery({
    queryKey: ["whatsapp-intel", activeCategory, searchQuery],
    queryFn: async () => {
      let query = supabase
        .from("whatsapp_intel_messages")
        .select("*")
        .order("received_at", { ascending: false })
        .limit(200);

      if (activeCategory !== "all") {
        query = query.eq("category", activeCategory);
      }
      if (searchQuery) {
        query = query.ilike("message_body", `%${searchQuery}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  // Mark as reviewed mutation
  const reviewMutation = useMutation({
    mutationFn: async ({ id, notes, category }: { id: string; notes: string; category?: string }) => {
      const updates: any = {
        is_reviewed: true,
        review_notes: notes,
      };
      if (category) updates.category = category;

      const { error } = await supabase
        .from("whatsapp_intel_messages")
        .update(updates)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["whatsapp-intel"] });
      setSelectedMessage(null);
      setReviewNotes("");
      setRecategoriseTo("");
      toast({ title: "Reviewed", description: "Message marked as reviewed." });
    },
  });

  // Stats
  const totalMessages = messages.length;
  const unreviewedCount = messages.filter((m: any) => !m.is_reviewed).length;
  const safetyCount = messages.filter((m: any) => m.category === "safety").length;

  const maskNumber = (num: string) => {
    if (!num || num.length < 4) return num;
    return `***${num.slice(-4)}`;
  };

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Eye className="h-6 w-6 text-primary" />
            WhatsApp Intel Hub
          </h1>
          <p className="text-sm text-muted-foreground">
            Forwarded group intelligence • Trend analysis • Record keeping
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card>
          <CardContent className="p-4 text-center">
            <MessageCircle className="h-5 w-5 mx-auto mb-1 text-primary" />
            <div className="text-2xl font-bold">{totalMessages}</div>
            <div className="text-xs text-muted-foreground">Total Messages</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Clock className="h-5 w-5 mx-auto mb-1 text-orange-500" />
            <div className="text-2xl font-bold">{unreviewedCount}</div>
            <div className="text-xs text-muted-foreground">Unreviewed</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <AlertTriangle className="h-5 w-5 mx-auto mb-1 text-destructive" />
            <div className="text-2xl font-bold">{safetyCount}</div>
            <div className="text-xs text-muted-foreground">Safety Alerts</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <TrendingUp className="h-5 w-5 mx-auto mb-1 text-green-500" />
            <div className="text-2xl font-bold">
              {totalMessages > 0 ? Math.round(((totalMessages - unreviewedCount) / totalMessages) * 100) : 0}%
            </div>
            <div className="text-xs text-muted-foreground">Reviewed</div>
          </CardContent>
        </Card>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search messages..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Category Tabs */}
      <Tabs value={activeCategory} onValueChange={setActiveCategory}>
        <TabsList className="flex flex-wrap h-auto gap-1">
          {CATEGORIES.map((cat) => (
            <TabsTrigger key={cat.value} value={cat.value} className="text-xs">
              <cat.icon className={`h-3 w-3 mr-1 ${cat.color}`} />
              {cat.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* Message List (same content for all tabs, filtered by query) */}
        <TabsContent value={activeCategory} className="mt-4">
          {isLoading ? (
            <div className="text-center py-12 text-muted-foreground">Loading intel...</div>
          ) : messages.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                <Eye className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p className="font-medium">No messages yet</p>
                <p className="text-sm mt-1">
                  Forward WhatsApp group messages to your TukConnect number to start capturing intel.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {messages.map((msg: any) => (
                <Card
                  key={msg.id}
                  className={`cursor-pointer hover:bg-accent/50 transition-colors ${
                    !msg.is_reviewed ? "border-l-4 border-l-primary" : ""
                  }`}
                  onClick={() => {
                    setSelectedMessage(msg);
                    setReviewNotes(msg.review_notes || "");
                    setRecategoriseTo(msg.category);
                  }}
                >
                  <CardContent className="p-3 flex items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <Badge variant={categoryBadgeVariant(msg.category)} className="text-[10px]">
                          {msg.category}
                        </Badge>
                        {msg.forwarded_from && (
                          <Badge variant="outline" className="text-[10px]">⏩ forwarded</Badge>
                        )}
                        {!msg.is_reviewed && (
                          <Badge variant="secondary" className="text-[10px]">new</Badge>
                        )}
                        <span className="text-[10px] text-muted-foreground ml-auto">
                          {format(new Date(msg.received_at), "dd MMM HH:mm")}
                        </span>
                      </div>
                      <p className="text-sm truncate">{msg.message_body || "(media only)"}</p>
                      <p className="text-[10px] text-muted-foreground mt-1">
                        From: {maskNumber(msg.from_number)}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Review Dialog */}
      <Dialog open={!!selectedMessage} onOpenChange={() => setSelectedMessage(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Review Intel Message
            </DialogTitle>
          </DialogHeader>

          {selectedMessage && (
            <div className="space-y-4">
              <div className="bg-muted rounded-lg p-3">
                <p className="text-sm whitespace-pre-wrap">{selectedMessage.message_body}</p>
                {selectedMessage.media_url && (
                  <p className="text-xs text-blue-500 mt-2">📎 Media attached</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-muted-foreground">From:</span>{" "}
                  {maskNumber(selectedMessage.from_number)}
                </div>
                <div>
                  <span className="text-muted-foreground">Received:</span>{" "}
                  {format(new Date(selectedMessage.received_at), "dd MMM yyyy HH:mm")}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Category</label>
                <Select value={recategoriseTo} onValueChange={setRecategoriseTo}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.filter((c) => c.value !== "all").map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium">Review Notes</label>
                <Textarea
                  placeholder="Add context, observations, or action items..."
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  rows={3}
                />
              </div>

              <Button
                onClick={() =>
                  reviewMutation.mutate({
                    id: selectedMessage.id,
                    notes: reviewNotes,
                    category: recategoriseTo !== selectedMessage.category ? recategoriseTo : undefined,
                  })
                }
                disabled={reviewMutation.isPending}
                className="w-full"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                {selectedMessage.is_reviewed ? "Update Review" : "Mark as Reviewed"}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
