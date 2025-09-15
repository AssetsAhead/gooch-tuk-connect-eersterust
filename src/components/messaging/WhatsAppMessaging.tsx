import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Send, Users, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface WhatsAppMessagingProps {
  userRole?: string;
}

export const WhatsAppMessaging: React.FC<WhatsAppMessagingProps> = ({ userRole = 'passenger' }) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [templateType, setTemplateType] = useState('');
  const [customMessage, setCustomMessage] = useState('');
  const [templateParams, setTemplateParams] = useState<string[]>(['', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [messageHistory, setMessageHistory] = useState<any[]>([]);

  const formatPhoneNumber = (phone: string): string => {
    // Format for South African numbers
    let formatted = phone.replace(/\D/g, '');
    if (formatted.startsWith('0')) {
      formatted = '+27' + formatted.substring(1);
    } else if (!formatted.startsWith('+27')) {
      formatted = '+27' + formatted;
    }
    return formatted;
  };

  const sendWhatsAppMessage = async () => {
    if (!phoneNumber) {
      toast.error("Phone number is required");
      return;
    }

    setIsLoading(true);
    try {
      const formattedPhone = formatPhoneNumber(phoneNumber);
      
      const payload = {
        to: formattedPhone,
        templateName: templateType || undefined,
        templateParams: templateType ? templateParams.filter(p => p.trim()) : undefined,
        freeformMessage: !templateType ? customMessage : undefined,
      };

      console.log('Sending WhatsApp message:', payload);

      const { data, error } = await supabase.functions.invoke('send-whatsapp-message', {
        body: payload
      });

      if (error) throw error;

      if (data.success) {
        toast.success("WhatsApp message sent successfully!");
        setMessageHistory(prev => [...prev, {
          id: data.messageSid,
          to: formattedPhone,
          message: templateType ? `Template: ${templateType}` : customMessage,
          timestamp: new Date().toISOString(),
          status: data.status
        }]);
        
        // Reset form
        setPhoneNumber('');
        setCustomMessage('');
        setTemplateParams(['', '', '']);
        setTemplateType('');
      } else {
        throw new Error(data.error);
      }
    } catch (error: any) {
      console.error('Error sending WhatsApp message:', error);
      toast.error(`Failed to send message: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const templateOptions = {
    ride_confirmation: "🚖 Ride Confirmation",
    payment_reminder: "💰 Payment Reminder", 
    emergency_alert: "🚨 Emergency Alert",
    driver_notification: "🚗 Driver Notification"
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            WhatsApp Business Messaging
          </CardTitle>
          <CardDescription>
            Send WhatsApp messages to passengers, drivers, and service users
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
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
              <Label htmlFor="template">Message Template</Label>
              <Select value={templateType} onValueChange={setTemplateType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select template or send custom message" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Custom Message</SelectItem>
                  {Object.entries(templateOptions).map(([key, label]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {templateType && (
            <div className="space-y-2">
              <Label>Template Parameters</Label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                {templateParams.map((param, index) => (
                  <Input
                    key={index}
                    placeholder={`Parameter ${index + 1}`}
                    value={param}
                    onChange={(e) => {
                      const newParams = [...templateParams];
                      newParams[index] = e.target.value;
                      setTemplateParams(newParams);
                    }}
                  />
                ))}
              </div>
            </div>
          )}

          {!templateType && (
            <div className="space-y-2">
              <Label htmlFor="message">Custom Message</Label>
              <Textarea
                id="message"
                placeholder="Enter your custom WhatsApp message..."
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                rows={3}
              />
            </div>
          )}

          <Button 
            onClick={sendWhatsAppMessage} 
            disabled={isLoading || (!customMessage && !templateType)}
            className="w-full"
          >
            <Send className="h-4 w-4 mr-2" />
            {isLoading ? 'Sending...' : 'Send WhatsApp Message'}
          </Button>
        </CardContent>
      </Card>

      {/* Pricing Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            WhatsApp Business API Pricing
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold mb-2">Twilio Fees (per message)</h4>
              <ul className="space-y-1 text-sm">
                <li>• Base fee: $0.005 USD (~R0.09)</li>
                <li>• Inbound/Outbound: Same rate</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Meta Template Fees (South Africa)</h4>
              <ul className="space-y-1 text-sm">
                <li>• Utility: ~$0.055 USD (~R1.00)</li>
                <li>• Authentication: ~$0.045 USD (~R0.82)</li>
                <li>• Marketing: ~$0.095 USD (~R1.73)</li>
                <li>• Service (24hr window): FREE</li>
              </ul>
            </div>
          </div>
          <div className="p-3 bg-blue-50 rounded-lg">
            <p className="text-sm font-medium text-blue-800">
              💡 Cost Optimization Tips:
            </p>
            <ul className="text-sm text-blue-700 mt-1 space-y-1">
              <li>• Use service window for free responses (24hrs after user message)</li>
              <li>• Batch notifications to reduce per-message costs</li>
              <li>• Consider SMS for simple notifications (R1.56 vs R1.09+ for WhatsApp)</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Message History */}
      {messageHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Recent Messages
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {messageHistory.slice(-5).reverse().map((message) => (
                <div key={message.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{message.to}</p>
                    <p className="text-sm text-gray-600">{message.message}</p>
                    <p className="text-xs text-gray-400">{new Date(message.timestamp).toLocaleString()}</p>
                  </div>
                  <Badge variant={message.status === 'delivered' ? 'default' : 'secondary'}>
                    {message.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};