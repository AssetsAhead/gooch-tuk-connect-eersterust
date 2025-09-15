import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Search, Copy } from "lucide-react";
import { toast } from "sonner";

interface MessageSIDValidatorProps {
  onValidSID?: (sid: string) => void;
}

export const MessageSIDValidator: React.FC<MessageSIDValidatorProps> = ({ onValidSID }) => {
  const [messageSID, setMessageSID] = useState('');
  const [validationResult, setValidationResult] = useState<{
    isValid: boolean;
    details: string;
    format?: string;
  } | null>(null);

  const validateMessageSID = (sid: string): { isValid: boolean; details: string; format?: string } => {
    if (!sid || sid.trim().length === 0) {
      return { isValid: false, details: 'Message SID cannot be empty' };
    }

    const trimmedSID = sid.trim();

    // Twilio Message SID format validation
    // Format: SMxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx (34 characters total, starts with SM)
    const twilioSIDPattern = /^SM[a-fA-F0-9]{32}$/;
    
    if (twilioSIDPattern.test(trimmedSID)) {
      return {
        isValid: true,
        details: 'Valid Twilio Message SID format',
        format: 'Twilio SMS/WhatsApp Message SID'
      };
    }

    // Check for common format issues
    if (trimmedSID.length !== 34) {
      return {
        isValid: false,
        details: `Invalid length: ${trimmedSID.length} characters (expected 34)`
      };
    }

    if (!trimmedSID.startsWith('SM')) {
      return {
        isValid: false,
        details: 'Message SID must start with "SM"'
      };
    }

    if (!/^[a-fA-F0-9]+$/.test(trimmedSID.substring(2))) {
      return {
        isValid: false,
        details: 'Message SID contains invalid characters (must be hexadecimal after "SM")'
      };
    }

    return {
      isValid: false,
      details: 'Unknown validation error'
    };
  };

  const handleValidation = () => {
    const result = validateMessageSID(messageSID);
    setValidationResult(result);
    
    if (result.isValid) {
      toast.success('Valid Message SID format!');
      onValidSID?.(messageSID.trim());
    } else {
      toast.error(result.details);
    }
  };

  const copyToClipboard = async () => {
    if (messageSID) {
      try {
        await navigator.clipboard.writeText(messageSID.trim());
        toast.success('Message SID copied to clipboard');
      } catch (error) {
        toast.error('Failed to copy to clipboard');
      }
    }
  };

  const handleInputChange = (value: string) => {
    setMessageSID(value);
    if (validationResult) {
      setValidationResult(null); // Clear previous validation when typing
    }
  };

  // Auto-validate on paste if it looks like a complete SID
  const handlePaste = (e: React.ClipboardEvent) => {
    const pastedText = e.clipboardData.getData('text');
    if (pastedText.length === 34 && pastedText.startsWith('SM')) {
      setTimeout(() => {
        const result = validateMessageSID(pastedText);
        setValidationResult(result);
        if (result.isValid) {
          toast.success('Valid Message SID pasted!');
          onValidSID?.(pastedText.trim());
        }
      }, 100);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="h-5 w-5" />
          Message SID Validator
        </CardTitle>
        <CardDescription>
          Verify Twilio Message SID format for WhatsApp and SMS messages
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="messageSID">Message SID</Label>
          <div className="flex gap-2">
            <Input
              id="messageSID"
              placeholder="SMxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
              value={messageSID}
              onChange={(e) => handleInputChange(e.target.value)}
              onPaste={handlePaste}
              className={`font-mono text-sm ${
                validationResult?.isValid === true 
                  ? 'border-green-500 bg-green-50' 
                  : validationResult?.isValid === false 
                  ? 'border-red-500 bg-red-50' 
                  : ''
              }`}
            />
            <Button
              variant="outline"
              size="sm"
              onClick={copyToClipboard}
              disabled={!messageSID}
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Expected format: SM followed by 32 hexadecimal characters (34 total)
          </p>
        </div>

        <Button 
          onClick={handleValidation} 
          disabled={!messageSID.trim()}
          className="w-full"
        >
          <Search className="h-4 w-4 mr-2" />
          Validate Message SID
        </Button>

        {validationResult && (
          <div className={`p-4 rounded-lg border ${
            validationResult.isValid 
              ? 'bg-green-50 border-green-200' 
              : 'bg-red-50 border-red-200'
          }`}>
            <div className="flex items-center gap-2 mb-2">
              {validationResult.isValid ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <XCircle className="h-5 w-5 text-red-600" />
              )}
              <span className={`font-medium ${
                validationResult.isValid ? 'text-green-800' : 'text-red-800'
              }`}>
                {validationResult.isValid ? 'Valid Message SID' : 'Invalid Message SID'}
              </span>
            </div>
            <p className={`text-sm ${
              validationResult.isValid ? 'text-green-700' : 'text-red-700'
            }`}>
              {validationResult.details}
            </p>
            {validationResult.format && (
              <Badge variant="outline" className="mt-2">
                {validationResult.format}
              </Badge>
            )}
          </div>
        )}

        <div className="space-y-2">
          <h4 className="text-sm font-medium">Message SID Examples:</h4>
          <div className="space-y-1 text-xs text-muted-foreground font-mono">
            <div>✅ SM4c1234567890abcdef1234567890abcd</div>
            <div>❌ SM4c1234567890abcdef1234567890abc (too short)</div>
            <div>❌ AC4c1234567890abcdef1234567890abcd (wrong prefix)</div>
            <div>❌ SM4g1234567890abcdef1234567890abcd (invalid character 'g')</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};