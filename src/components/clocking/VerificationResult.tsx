import React from 'react';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

export const VerificationResult = ({ result }: { result: any }) => {
  if (result.error) {
    return (
      <div className="p-3 rounded-lg border border-destructive/30 bg-destructive/5">
        <div className="flex items-center gap-2">
          <XCircle className="h-5 w-5 text-destructive" />
          <span className="text-sm font-medium">{result.error}</span>
        </div>
      </div>
    );
  }

  const verified = result.is_verified;
  const method = result.method || 'facial';
  const methodLabels: Record<string, string> = {
    facial: '🤖 Facial AI',
    pin: '🔢 PIN',
    qr: '📱 QR Code',
    marshal: '👮 Marshal',
  };

  return (
    <div className={`p-3 rounded-lg border ${verified ? 'border-green-500/30 bg-green-500/5' : 'border-destructive/30 bg-destructive/5'}`}>
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          {verified ? <CheckCircle className="h-5 w-5 text-green-500" /> : <XCircle className="h-5 w-5 text-destructive" />}
          <span className="text-sm font-medium">
            {verified ? 'Clocked Successfully' : 'Verification Failed'}
          </span>
        </div>
        <Badge variant={verified ? 'default' : 'destructive'} className="text-xs">
          {methodLabels[method] || method}
        </Badge>
      </div>
      {result.reason && <p className="text-xs text-muted-foreground">{result.reason}</p>}
      {result.is_flagged && result.fraud_indicators?.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {result.fraud_indicators.map((f: string, i: number) => (
            <Badge key={i} variant="outline" className="text-xs text-destructive">
              <AlertTriangle className="h-3 w-3 mr-1" />{f}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
};
