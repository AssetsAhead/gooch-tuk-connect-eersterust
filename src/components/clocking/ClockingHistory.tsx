import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { format } from 'date-fns';
import { ClockingRecord } from '@/hooks/useFacialClocking';

const typeLabels: Record<string, string> = {
  shift_start: '🟢 Shift Start',
  shift_end: '🔴 Shift End',
  trip_start: '🔵 Trip Start',
  trip_end: '🟠 Trip End',
};

const methodIcons: Record<string, string> = {
  facial: '🤖',
  pin: '🔢',
  qr: '📱',
  marshal: '👮',
};

export const ClockingHistory = ({
  clockings,
  onRefresh,
}: {
  clockings: ClockingRecord[];
  onRefresh: () => void;
}) => (
  <div className="space-y-3">
    <div className="flex justify-between items-center">
      <p className="text-sm font-medium">Recent Clockings</p>
      <Button variant="ghost" size="sm" onClick={onRefresh}>Refresh</Button>
    </div>
    {clockings.length === 0 ? (
      <p className="text-sm text-muted-foreground text-center py-4">No clockings yet</p>
    ) : (
      <div className="space-y-2 max-h-[400px] overflow-y-auto">
        {clockings.map((c) => (
          <div key={c.id} className="flex items-center justify-between p-3 border rounded-lg">
            <div>
              <p className="text-sm font-medium">{typeLabels[c.clocking_type] || c.clocking_type}</p>
              <p className="text-xs text-muted-foreground">
                {format(new Date(c.clocked_at), 'dd MMM yyyy HH:mm')}
                {' • '}{methodIcons[c.verification_method] || ''} {c.verification_method}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {c.is_flagged && (
                <Badge variant="destructive" className="text-xs">
                  <AlertTriangle className="h-3 w-3 mr-1" />Flagged
                </Badge>
              )}
              {c.is_verified ? (
                <Badge className="bg-green-500/10 text-green-600 text-xs">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  {Math.round((c.confidence_score || 0) * 100)}%
                </Badge>
              ) : (
                <Badge variant="outline" className="text-xs">
                  <XCircle className="h-3 w-3 mr-1" />Unverified
                </Badge>
              )}
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
);
