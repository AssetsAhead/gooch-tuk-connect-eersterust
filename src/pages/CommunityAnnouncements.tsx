import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  ArrowLeft, 
  Megaphone, 
  MapPin, 
  Calendar,
  Droplets,
  Zap,
  AlertTriangle,
  Construction,
  Bell,
  Phone
} from "lucide-react";
import { format } from "date-fns";

interface EmergencyMessage {
  id: string;
  type: string;
  priority: string;
  title: string;
  message: string;
  ward: string;
  area: string | null;
  status: string;
  created_at: string;
  views: number | null;
  responses: number | null;
}

const CommunityAnnouncements = () => {
  const [messages, setMessages] = useState<EmergencyMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedWard, setSelectedWard] = useState<string>("all");
  const [wards, setWards] = useState<string[]>([]);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('emergency_messages')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setMessages(data || []);
      
      // Extract unique wards
      const uniqueWards = [...new Set(data?.map(m => m.ward) || [])];
      setWards(uniqueWards);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredMessages = selectedWard === "all" 
    ? messages 
    : messages.filter(m => m.ward === selectedWard);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'water': return <Droplets className="h-5 w-5 text-blue-500" />;
      case 'electricity': return <Zap className="h-5 w-5 text-yellow-500" />;
      case 'emergency': return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case 'construction': return <Construction className="h-5 w-5 text-orange-500" />;
      default: return <Bell className="h-5 w-5 text-primary" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-500 text-white';
      case 'high': return 'bg-orange-500 text-white';
      case 'medium': return 'bg-yellow-500 text-black';
      default: return 'bg-blue-500 text-white';
    }
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      water: 'Water',
      electricity: 'Electricity',
      emergency: 'Emergency',
      construction: 'Construction',
      general: 'General'
    };
    return labels[type] || type;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-sa-green to-sa-green-light text-white py-8 px-4">
        <div className="container mx-auto max-w-4xl">
          <Link to="/">
            <Button variant="ghost" className="text-white hover:bg-white/20 mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </Link>
          <div className="flex items-center gap-3 mb-2">
            <Megaphone className="h-8 w-8" />
            <h1 className="text-3xl font-bold">Community Announcements</h1>
          </div>
          <p className="text-white/80">
            Stay informed with the latest announcements from your local councillors
          </p>
        </div>
      </div>

      {/* Filter Section */}
      <div className="container mx-auto max-w-4xl px-4 py-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-muted-foreground" />
            <span className="text-sm font-medium">Filter by Ward:</span>
          </div>
          <Select value={selectedWard} onValueChange={setSelectedWard}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select ward" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Wards</SelectItem>
              {wards.map(ward => (
                <SelectItem key={ward} value={ward}>{ward}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Badge variant="secondary" className="ml-auto">
            {filteredMessages.length} announcement{filteredMessages.length !== 1 ? 's' : ''}
          </Badge>
        </div>

        {/* Messages List */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-3/4" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-2/3" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredMessages.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Megaphone className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Announcements</h3>
              <p className="text-muted-foreground">
                There are no active announcements for the selected ward.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredMessages.map(message => (
              <Card key={message.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      {getTypeIcon(message.type)}
                      <div>
                        <CardTitle className="text-lg leading-tight">{message.title}</CardTitle>
                        <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                          <MapPin className="h-3 w-3" />
                          <span>{message.ward}</span>
                          {message.area && (
                            <>
                              <span>•</span>
                              <span>{message.area}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <Badge className={getPriorityColor(message.priority)}>
                        {message.priority}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {getTypeLabel(message.type)}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="whitespace-pre-wrap text-sm text-muted-foreground mb-4 bg-muted/50 p-4 rounded-lg">
                    {message.message}
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>Posted {format(new Date(message.created_at), 'dd MMM yyyy, HH:mm')}</span>
                    </div>
                    {(message.views || 0) > 0 && (
                      <span>{message.views} views</span>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Emergency Contacts */}
        <Card className="mt-8 border-sa-red/20 bg-sa-red/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sa-red">
              <Phone className="h-5 w-5" />
              Emergency Contacts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="font-semibold">Police Emergency</p>
                <p className="text-muted-foreground">10111</p>
              </div>
              <div>
                <p className="font-semibold">Ambulance</p>
                <p className="text-muted-foreground">10177</p>
              </div>
              <div>
                <p className="font-semibold">Fire Department</p>
                <p className="text-muted-foreground">10177</p>
              </div>
              <div>
                <p className="font-semibold">SASSA Helpline</p>
                <p className="text-muted-foreground">0800 60 10 11</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CommunityAnnouncements;
