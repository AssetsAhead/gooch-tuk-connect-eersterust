import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { AlertTriangle, MessageSquare, Smartphone, Zap, WifiOff } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { MessageSIDValidator } from './MessageSIDValidator';

interface BackupMessagingSystemProps {
  userRole?: string;
}

export const BackupMessagingSystem: React.FC<BackupMessagingSystemProps> = ({ userRole = 'passenger' }) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'emergency' | 'notification' | 'reminder' | 'info'>('notification');
  const [isLoading, setIsLoading] = useState(false);
  const [whatsappFirst, setWhatsappFirst] = useState(true);
  const [networkStatus, setNetworkStatus] = useState('online');
  const [messageHistory, setMessageHistory] = useState<any[]>([]);

  // Monitor network status
  useEffect(() => {
    const updateNetworkStatus = () => {
      setNetworkStatus(navigator.onLine ? 'online' : 'offline');
    };

    window.addEventListener('online', updateNetworkStatus);
    window.addEventListener('offline', updateNetworkStatus);
    
    return () => {
      window.removeEventListener('online', updateNetworkStatus);
      window.removeEventListener('offline', updateNetworkStatus);
    };
  }, []);

  const formatPhoneNumber = (phone: string): string => {
    let formatted = phone.replace(/\D/g, '');
    if (formatted.startsWith('0')) {
      formatted = '+27' + formatted.substring(1);
    } else if (!formatted.startsWith('+27')) {
      formatted = '+27' + formatted;
    }
    return formatted;
  };

  const sendWhatsAppMessage = async (formattedPhone: string, messageText: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('send-whatsapp-message', {
        body: {
          to: formattedPhone,
          freeformMessage: messageText
        }
      });

      if (error) throw error;
      return data;
    } catch (error) {
      throw error;
    }
  };

  const sendSMSMessage = async (formattedPhone: string, messageText: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('send-sms-message', {
        body: {
          to: formattedPhone,
          message: messageText,
          type: messageType
        }
      });

      if (error) throw error;
      return data;
    } catch (error) {
      throw error;
    }
  };

  const sendMessage = async () => {
    if (!phoneNumber || !message) {
      toast.error("Phone number and message are required");
      return;
    }

    setIsLoading(true);
    const formattedPhone = formatPhoneNumber(phoneNumber);
    
    try {
      let primaryMethod = whatsappFirst ? 'WhatsApp' : 'SMS';
      let backupMethod = whatsappFirst ? 'SMS' : 'WhatsApp';
      let result = null;

      // Try primary method first
      try {
        if (whatsappFirst) {
          result = await sendWhatsAppMessage(formattedPhone, message);
          toast.success(`Message sent via WhatsApp!`);
        } else {
          result = await sendSMSMessage(formattedPhone, message);
          toast.success(`Message sent via SMS!`);
        }
      } catch (primaryError: any) {
        console.log(`${primaryMethod} failed, trying ${backupMethod}:`, primaryError);
        toast.warning(`${primaryMethod} failed, trying ${backupMethod}...`);
        
        // Try backup method
        try {
          if (whatsappFirst) {
            result = await sendSMSMessage(formattedPhone, message);
            toast.success(`Message sent via SMS backup!`);
          } else {
            result = await sendWhatsAppMessage(formattedPhone, message);
            toast.success(`Message sent via WhatsApp backup!`);
          }
        } catch (backupError: any) {
          throw new Error(`Both ${primaryMethod} and ${backupMethod} failed: ${backupError.message}`);
        }
      }

      if (result?.success) {
        setMessageHistory(prev => [...prev, {
          id: result.messageSid,
          to: formattedPhone,
          message: message,
          timestamp: new Date().toISOString(),
          status: result.status,
          method: result.type || (whatsappFirst ? 'WhatsApp' : 'SMS'),
          type: messageType
        }]);
        
        // Reset form
        setPhoneNumber('');
        setMessage('');
      }
    } catch (error: any) {
      console.error('Error sending message:', error);
      toast.error(`Failed to send message: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <MessageSIDValidator />
      
      {/* Network Status Indicator */}
      <Card className={networkStatus === 'offline' ? 'border-red-200 bg-red-50' : ''}>
        <CardContent className="pt-6">
          <div className="flex items-center gap-2">
            {networkStatus === 'offline' ? (
              <WifiOff className="h-5 w-5 text-red-500" />
            ) : (
              <Zap className="h-5 w-5 text-green-500" />
            )}
            <span className={`font-medium ${networkStatus === 'offline' ? 'text-red-700' : 'text-green-700'}`}>
              Network Status: {networkStatus === 'offline' ? 'Offline - SMS Preferred' : 'Online - Both Available'}
            </span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Backup Messaging System
          </CardTitle>
          <CardDescription>
            Automatic failover between WhatsApp and SMS for reliable communication during load shedding
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Message Priority Setting */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-2">
              <Smartphone className="h-5 w-5" />
              <span className="font-medium">Primary Method: {whatsappFirst ? 'WhatsApp' : 'SMS'}</span>
            </div>
            <Switch
              checked={whatsappFirst}
              onCheckedChange={setWhatsappFirst}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                placeholder="+27123456789 or 0123456789"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="type">Message Type</Label>
              <Select value={messageType} onValueChange={(value: any) => setMessageType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="emergency">🚨 Emergency</SelectItem>
                  <SelectItem value="notification">📱 Notification</SelectItem>
                  <SelectItem value="reminder">⏰ Reminder</SelectItem>
                  <SelectItem value="info">ℹ️ Information</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              placeholder="Enter your message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
            />
          </div>

          <Button 
            onClick={sendMessage} 
            disabled={isLoading || !message || !phoneNumber}
            className="w-full"
          >
            {isLoading ? 'Sending...' : `Send Message (${whatsappFirst ? 'WhatsApp→SMS' : 'SMS→WhatsApp'} Backup)`}
          </Button>
        </CardContent>
      </Card>

      {/* Reliability Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Load Shedding & Outage Reliability
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                WhatsApp Business
              </h4>
              <ul className="space-y-1 text-sm">
                <li>✅ Rich media & links</li>
                <li>✅ Lower cost (~R1.09)</li>
                <li>❌ Requires internet/data</li>
                <li>❌ Fails during network outages</li>
              </ul>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <Smartphone className="h-4 w-4" />
                SMS Backup
              </h4>
              <ul className="space-y-1 text-sm">
                <li>✅ Works without internet</li>
                <li>✅ Reliable during load shedding</li>
                <li>✅ Works on basic phones</li>
                <li>⚠️ Higher cost (~R1.56)</li>
              </ul>
            </div>
          </div>
          
          <div className="p-3 bg-amber-50 rounded-lg">
            <p className="text-sm font-medium text-amber-800">
              💡 Smart Backup Strategy:
            </p>
            <ul className="text-sm text-amber-700 mt-1 space-y-1">
              <li>• System automatically tries WhatsApp first (cheaper)</li>
              <li>• Falls back to SMS if WhatsApp fails (reliable)</li>
              <li>• During known load shedding, prioritize SMS</li>
              <li>• Emergency messages always use both channels</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Message History */}
      {messageHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Messages</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {messageHistory.slice(-5).reverse().map((msg) => (
                <div key={msg.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{msg.to}</p>
                    <p className="text-sm text-muted-foreground">{msg.message}</p>
                    <p className="text-xs text-muted-foreground">{new Date(msg.timestamp).toLocaleString()}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <Badge variant="outline">{msg.method}</Badge>
                    <Badge variant={msg.type === 'emergency' ? 'destructive' : 'default'}>
                      {msg.type}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};