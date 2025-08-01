import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Megaphone, 
  AlertTriangle, 
  Droplets, 
  Zap, 
  Construction, 
  Users, 
  Clock, 
  Send,
  Siren,
  MapPin,
  Phone,
  MessageCircle,
  CheckCircle,
  Eye
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface EmergencyMessage {
  id: string;
  type: 'water' | 'electricity' | 'emergency' | 'construction' | 'general';
  priority: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  ward: string;
  area: string;
  timestamp: string;
  views: number;
  responses: number;
  status: 'active' | 'resolved';
}

export const WardCouncillorMessaging = () => {
  const [messages, setMessages] = useState<EmergencyMessage[]>([]);
  const [newMessage, setNewMessage] = useState({
    type: 'general' as const,
    priority: 'medium' as const,
    title: '',
    message: '',
    ward: 'Ward 58',
    area: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchMessages();
    // Set up real-time subscription for messages
    const channel = supabase
      .channel('councillor-messages')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'emergency_messages' },
        () => fetchMessages()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchMessages = async () => {
    try {
      // Use mock data for now since emergency_messages table is new
      const mockMessages: EmergencyMessage[] = [
        {
          id: '1',
          type: 'water',
          priority: 'critical',
          title: 'Water Outage - Blocks A-C',
          message: 'Municipal water supply disrupted due to burst main pipe on Steve Biko Road. Repair teams deployed. Expected restoration: 18:00 today. Water tankers available at community hall.',
          ward: 'Ward 58',
          area: 'Eersterust Blocks A-C',
          timestamp: new Date().toISOString(),
          views: 1247,
          responses: 89,
          status: 'active'
        },
        {
          id: '2',
          type: 'electricity',
          priority: 'high',
          title: 'Load Shedding Schedule Update',
          message: 'Due to grid maintenance, Stage 3 load shedding will continue until 22:00. Blocks D-F affected 16:00-18:30. Community charging station operational at library.',
          ward: 'Ward 58',
          area: 'Eersterust Blocks D-F',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          views: 892,
          responses: 34,
          status: 'active'
        },
        {
          id: '3',
          type: 'emergency',
          priority: 'critical',
          title: 'Emergency Road Closure',
          message: 'Portion of Silverton Road closed due to gas leak. Emergency services on scene. Use alternative routes: WF Nkomo or Pretoria Road. Residents evacuated from affected area.',
          ward: 'Ward 58',
          area: 'Silverton Road',
          timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
          views: 2156,
          responses: 156,
          status: 'active'
        }
      ];
      
      setMessages(mockMessages);
    } catch (error: any) {
      console.error('Error fetching messages:', error);
      toast({
        title: "Error fetching messages",
        description: "Using demo data",
        variant: "destructive",
      });
    }
  };

  const sendMessage = async () => {
    if (!newMessage.title || !newMessage.message) {
      toast({
        title: "Missing Information",
        description: "Please fill in title and message",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // In real implementation, this would save to database
      const message: EmergencyMessage = {
        id: Date.now().toString(),
        ...newMessage,
        timestamp: new Date().toISOString(),
        views: 0,
        responses: 0,
        status: 'active'
      };

      setMessages([message, ...messages]);
      
      // Reset form
      setNewMessage({
        type: 'general',
        priority: 'medium',
        title: '',
        message: '',
        ward: 'Ward 58',
        area: ''
      });

      // Send push notifications
      await sendPushNotification(message);

      toast({
        title: "Message Sent",
        description: "Emergency message broadcast to all residents",
      });

    } catch (error: any) {
      toast({
        title: "Error sending message",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const sendPushNotification = async (message: EmergencyMessage) => {
    // In real implementation, this would trigger push notifications
    console.log('Sending push notification:', message);
    
    if ('serviceWorker' in navigator && 'Notification' in window) {
      const registration = await navigator.serviceWorker.ready;
      await registration.showNotification(`Ward Alert: ${message.title}`, {
        body: message.message,
        icon: '/icon-192.png',
        badge: '/icon-192.png',
        tag: `ward-${message.id}`,
        requireInteraction: message.priority === 'critical',
        data: { type: 'ward_emergency', messageId: message.id }
      });
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'water': return Droplets;
      case 'electricity': return Zap;
      case 'emergency': return Siren;
      case 'construction': return Construction;
      default: return Megaphone;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'danger';
      case 'high': return 'tuk-orange';
      case 'medium': return 'warning';
      default: return 'secondary';
    }
  };

  const emergencyContacts = [
    { service: 'Police Emergency', number: '10111', icon: Siren },
    { service: 'Fire Department', number: '10177', icon: AlertTriangle },
    { service: 'Ambulance', number: '10177', icon: Phone },
    { service: 'Municipal Emergency', number: '012 358 7911', icon: Construction },
    { service: 'Water Emergency', number: '012 358 7999', icon: Droplets },
    { service: 'Electricity Emergency', number: '012 358 7777', icon: Zap }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Megaphone className="h-6 w-6 text-primary" />
            Ward Councillor Emergency Centre
          </h2>
          <p className="text-muted-foreground">Real-time communication with community members</p>
        </div>
        <Badge variant="outline" className="bg-success/10 text-success border-success">
          Ward 58 - Eersterust
        </Badge>
      </div>

      <Tabs defaultValue="broadcast" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="broadcast">📢 Broadcast</TabsTrigger>
          <TabsTrigger value="messages">💬 Messages</TabsTrigger>
          <TabsTrigger value="emergency">🚨 Emergency</TabsTrigger>
        </TabsList>

        <TabsContent value="broadcast" className="space-y-6">
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Send className="h-5 w-5" />
                Send Emergency Message
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Select 
                  value={newMessage.type} 
                  onValueChange={(value: any) => setNewMessage({...newMessage, type: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Message Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="water">💧 Water Issues</SelectItem>
                    <SelectItem value="electricity">⚡ Electricity</SelectItem>
                    <SelectItem value="emergency">🚨 Emergency</SelectItem>
                    <SelectItem value="construction">🚧 Construction</SelectItem>
                    <SelectItem value="general">📢 General</SelectItem>
                  </SelectContent>
                </Select>

                <Select 
                  value={newMessage.priority} 
                  onValueChange={(value: any) => setNewMessage({...newMessage, priority: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">🟢 Low</SelectItem>
                    <SelectItem value="medium">🟡 Medium</SelectItem>
                    <SelectItem value="high">🟠 High</SelectItem>
                    <SelectItem value="critical">🔴 Critical</SelectItem>
                  </SelectContent>
                </Select>

                <Input
                  placeholder="Area (e.g., Block A-C)"
                  value={newMessage.area}
                  onChange={(e) => setNewMessage({...newMessage, area: e.target.value})}
                />
              </div>

              <Input
                placeholder="Message Title"
                value={newMessage.title}
                onChange={(e) => setNewMessage({...newMessage, title: e.target.value})}
              />

              <Textarea
                placeholder="Detailed message for residents..."
                value={newMessage.message}
                onChange={(e) => setNewMessage({...newMessage, message: e.target.value})}
                rows={4}
              />

              <div className="flex justify-between items-center">
                <div className="text-sm text-muted-foreground">
                  Message will be sent via: Push notifications, SMS, WhatsApp, Facebook
                </div>
                <Button 
                  onClick={sendMessage} 
                  disabled={isLoading}
                  className="bg-primary hover:bg-primary/90"
                >
                  {isLoading ? "Sending..." : "Send to All Residents"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="messages" className="space-y-4">
          {messages.map((msg) => {
            const Icon = getTypeIcon(msg.type);
            return (
              <Card key={msg.id} className={`border-l-4 border-l-${getPriorityColor(msg.priority)}`}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <Icon className={`h-5 w-5 text-${getPriorityColor(msg.priority)}`} />
                      <div>
                        <h4 className="font-semibold">{msg.title}</h4>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <MapPin className="h-4 w-4" />
                          {msg.area} | {msg.ward}
                          <Clock className="h-4 w-4 ml-2" />
                          {new Date(msg.timestamp).toLocaleString()}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={`bg-${getPriorityColor(msg.priority)}/10`}>
                        {msg.priority.toUpperCase()}
                      </Badge>
                      <Badge variant={msg.status === 'active' ? 'default' : 'secondary'}>
                        {msg.status}
                      </Badge>
                    </div>
                  </div>
                  
                  <p className="text-muted-foreground mb-4">{msg.message}</p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Eye className="h-4 w-4" />
                        {msg.views} views
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageCircle className="h-4 w-4" />
                        {msg.responses} responses
                      </span>
                    </div>
                    <div className="flex gap-2">
                      {msg.status === 'active' && (
                        <Button size="sm" variant="outline" className="text-success border-success">
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Mark Resolved
                        </Button>
                      )}
                      <Button size="sm" variant="outline">
                        View Responses
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>

        <TabsContent value="emergency" className="space-y-6">
          <Card className="border-danger/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-danger">
                <Siren className="h-5 w-5" />
                National Emergency Services
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {emergencyContacts.map((contact, index) => {
                  const Icon = contact.icon;
                  return (
                    <Card key={index} className="border hover:border-primary/40 transition-colors">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Icon className="h-6 w-6 text-danger" />
                            <div>
                              <h4 className="font-semibold">{contact.service}</h4>
                              <p className="text-sm text-muted-foreground">24/7 Emergency</p>
                            </div>
                          </div>
                          <Button 
                            className="bg-danger hover:bg-danger/90"
                            onClick={() => window.open(`tel:${contact.number}`, '_self')}
                          >
                            <Phone className="h-4 w-4 mr-1" />
                            {contact.number}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start text-danger border-danger">
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Declare Local Emergency
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Users className="h-4 w-4 mr-2" />
                  Activate Community Response
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Megaphone className="h-4 w-4 mr-2" />
                  Broadcast Emergency Alert
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Emergency Resources</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span>Community Hall Capacity</span>
                  <Badge>200 people</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Emergency Water Supply</span>
                  <Badge className="bg-success">Available</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Medical Volunteers</span>
                  <Badge>12 active</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Backup Generators</span>
                  <Badge>3 operational</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};