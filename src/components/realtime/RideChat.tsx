import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Send, Phone, MapPin, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ChatMessage {
  id: string;
  sender_id: string;
  sender_type: 'driver' | 'passenger';
  message: string;
  timestamp: string;
  message_type: 'text' | 'location' | 'eta_update';
}

interface RideChatProps {
  rideId: string;
  userId: string;
  userType: 'driver' | 'passenger';
  driverName?: string;
  passengerName?: string;
}

export const RideChat = ({ rideId, userId, userType, driverName, passengerName }: RideChatProps) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Initialize with mock messages
  useEffect(() => {
    const mockMessages: ChatMessage[] = [
      {
        id: '1',
        sender_id: userType === 'driver' ? 'other-user' : userId,
        sender_type: userType === 'driver' ? 'passenger' : 'driver',
        message: 'Hello! I\'m on my way to the pickup location.',
        timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
        message_type: 'text'
      },
      {
        id: '2',
        sender_id: userType === 'driver' ? userId : 'other-user',
        sender_type: userType,
        message: 'Great! I\'ll be waiting at the main entrance.',
        timestamp: new Date(Date.now() - 3 * 60 * 1000).toISOString(),
        message_type: 'text'
      },
      {
        id: '3',
        sender_id: userType === 'driver' ? 'other-user' : userId,
        sender_type: userType === 'driver' ? 'passenger' : 'driver',
        message: 'ETA updated: 2 minutes away',
        timestamp: new Date(Date.now() - 1 * 60 * 1000).toISOString(),
        message_type: 'eta_update'
      }
    ];
    
    setMessages(mockMessages);
  }, [rideId, userId, userType]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Subscribe to real-time chat updates
  useEffect(() => {
    const chatChannel = supabase
      .channel(`ride-chat-${rideId}`)
      .on('presence', { event: 'sync' }, () => {
        // Handle presence updates
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        console.log('User joined:', key, newPresences);
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        console.log('User left:', key, leftPresences);
      })
      .subscribe();

    // Track own presence
    chatChannel.track({
      user_id: userId,
      user_type: userType,
      typing: isTyping,
      online_at: new Date().toISOString(),
    });

    return () => {
      supabase.removeChannel(chatChannel);
    };
  }, [rideId, userId, userType, isTyping]);

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    const message: ChatMessage = {
      id: Date.now().toString(),
      sender_id: userId,
      sender_type: userType,
      message: newMessage.trim(),
      timestamp: new Date().toISOString(),
      message_type: 'text'
    };

    setMessages(prev => [...prev, message]);
    setNewMessage("");

    // In a real app, this would save to database
    toast({
      title: "Message sent",
      description: "Your message has been delivered",
    });
  };

  const sendQuickMessage = (message: string, type: 'text' | 'location' | 'eta_update' = 'text') => {
    const quickMessage: ChatMessage = {
      id: Date.now().toString(),
      sender_id: userId,
      sender_type: userType,
      message,
      timestamp: new Date().toISOString(),
      message_type: type
    };

    setMessages(prev => [...prev, quickMessage]);
    
    toast({
      title: "Quick message sent",
      description: message,
    });
  };

  const getMessageStyle = (message: ChatMessage) => {
    const isOwnMessage = message.sender_id === userId;
    
    if (message.message_type === 'eta_update') {
      return 'bg-primary/10 border-primary/20 text-center';
    }
    
    return isOwnMessage 
      ? 'bg-primary text-primary-foreground ml-8' 
      : 'bg-muted mr-8';
  };

  const quickMessages = userType === 'driver' 
    ? [
        "I'm 2 minutes away",
        "I'm at the pickup location",
        "Running 5 minutes late",
        "Please come to the car"
      ]
    : [
        "I'm ready for pickup",
        "I'll be there in 2 minutes",
        "Please wait, I'm coming",
        "Thank you for the ride"
      ];

  return (
    <Card className="h-96 flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <MessageCircle className="h-5 w-5 mr-2" />
            Chat with {userType === 'driver' ? passengerName || 'Passenger' : driverName || 'Driver'}
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="bg-success/10 text-success">
              Online
            </Badge>
            <Button size="sm" variant="outline">
              <Phone className="h-4 w-4" />
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col p-0">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map((message) => (
            <div key={message.id} className="space-y-1">
              <div className={`p-3 rounded-lg max-w-xs ${getMessageStyle(message)}`}>
                {message.message_type === 'eta_update' && (
                  <div className="flex items-center justify-center mb-1">
                    <Clock className="h-3 w-3 mr-1" />
                  </div>
                )}
                <p className="text-sm">{message.message}</p>
              </div>
              <p className="text-xs text-muted-foreground px-3">
                {new Date(message.timestamp).toLocaleTimeString()}
              </p>
            </div>
          ))}
          
          {otherUserTyping && (
            <div className="flex items-center space-x-2 text-muted-foreground">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
              <span className="text-xs">typing...</span>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Messages */}
        <div className="px-4 pb-2">
          <div className="flex flex-wrap gap-1">
            {quickMessages.slice(0, 2).map((msg, index) => (
              <Button
                key={index}
                size="sm"
                variant="outline"
                className="text-xs h-6"
                onClick={() => sendQuickMessage(msg)}
              >
                {msg}
              </Button>
            ))}
          </div>
        </div>

        {/* Message Input */}
        <div className="p-4 pt-2 border-t">
          <div className="flex space-x-2">
            <Input
              placeholder="Type a message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              className="flex-1"
            />
            <Button size="sm" onClick={sendMessage} disabled={!newMessage.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Additional Quick Actions */}
          <div className="flex justify-center mt-2 space-x-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => sendQuickMessage("Sharing my location", "location")}
            >
              <MapPin className="h-3 w-3 mr-1" />
              Location
            </Button>
            {userType === 'driver' && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => sendQuickMessage("ETA updated: 3 minutes", "eta_update")}
              >
                <Clock className="h-3 w-3 mr-1" />
                Update ETA
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};