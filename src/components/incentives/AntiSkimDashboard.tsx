import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ShieldCheck, Eye, AlertTriangle, TrendingUp } from 'lucide-react';

const metrics = [
  {
    label: "Digital Capture Rate",
    value: "80%",
    target: "90%",
    status: "warning",
    icon: Eye,
    detail: "28 of 35 trips logged digitally",
  },
  {
    label: "Revenue Visibility",
    value: "R2,660",
    target: "R3,500",
    status: "warning",
    icon: TrendingUp,
    detail: "Owner can see R2,660 of estimated R3,500",
  },
  {
    label: "Bonus Earned This Week",
    value: "R84",
    target: "R175",
    status: "info",
    icon: ShieldCheck,
    detail: "Log all trips digitally to maximize",
  },
  {
    label: "Unlogged Gaps",
    value: "3",
    target: "0",
    status: "danger",
    icon: AlertTriangle,
    detail: "3 time gaps detected without trip logs",
  },
];

export const AntiSkimDashboard = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <ShieldCheck className="h-5 w-5 text-primary" />
          Transparency Score
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Higher transparency = more bonuses + owner trust. Gaps hurt your score.
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {metrics.map((metric) => {
            const Icon = metric.icon;
            return (
              <div key={metric.label} className="p-3 rounded-lg border bg-card space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                    <span className="text-xs font-medium text-muted-foreground">{metric.label}</span>
                  </div>
                  <Badge
                    variant={
                      metric.status === 'danger' ? 'destructive' :
                      metric.status === 'warning' ? 'secondary' : 'default'
                    }
                  >
                    {metric.value}
                  </Badge>
                </div>
                <p className="text-[11px] text-muted-foreground">{metric.detail}</p>
              </div>
            );
          })}
        </div>

        <div className="mt-4 p-3 rounded-lg bg-primary/5 border border-primary/20">
          <p className="text-xs">
            <strong className="text-primary">Why this matters:</strong> Owners see real-time gaps. Drivers with 90%+ digital rates get priority bookings, fuel vouchers, and lower platform fees. Transparency pays more than skimming.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
