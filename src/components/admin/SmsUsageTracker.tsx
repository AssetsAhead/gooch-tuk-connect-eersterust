import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { MessageSquare, TrendingUp, DollarSign, RefreshCw, Phone } from 'lucide-react';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';

interface SmsUsageLog {
  id: string;
  phone_number: string;
  message_type: string;
  status: string;
  cost_estimate: number;
  created_at: string;
}

interface UsageStats {
  totalSent: number;
  totalFailed: number;
  totalCost: number;
  byType: Record<string, number>;
}

export const SmsUsageTracker = () => {
  const [logs, setLogs] = useState<SmsUsageLog[]>([]);
  const [stats, setStats] = useState<UsageStats>({ totalSent: 0, totalFailed: 0, totalCost: 0, byType: {} });
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('7');
  const { toast } = useToast();

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const startDate = startOfDay(subDays(new Date(), parseInt(dateRange)));
      const endDate = endOfDay(new Date());

      const { data, error } = await supabase
        .from('sms_usage_logs')
        .select('*')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;

      const logsData = (data || []) as SmsUsageLog[];
      setLogs(logsData);

      // Calculate stats
      const totalSent = logsData.filter(l => l.status === 'sent').length;
      const totalFailed = logsData.filter(l => l.status === 'failed').length;
      const totalCost = logsData.reduce((sum, l) => sum + (l.cost_estimate || 0), 0);
      const byType: Record<string, number> = {};
      logsData.forEach(l => {
        byType[l.message_type] = (byType[l.message_type] || 0) + 1;
      });

      setStats({ totalSent, totalFailed, totalCost, byType });
    } catch (error: any) {
      console.error('Error fetching SMS logs:', error);
      toast({
        title: 'Error',
        description: 'Failed to load SMS usage data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [dateRange]);

  const maskPhone = (phone: string) => {
    if (phone.length > 6) {
      return phone.substring(0, 5) + '***' + phone.substring(phone.length - 2);
    }
    return phone;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">SMS Usage Tracker</h2>
          <p className="text-muted-foreground">Monitor SMS costs and usage patterns</p>
        </div>
        <div className="flex gap-2">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">Today</SelectItem>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon" onClick={fetchLogs} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              SMS Sent
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">{stats.byType['otp'] || 0}</div>
            <p className="text-xs text-muted-foreground">~R0.50 each</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-green-500" />
              WhatsApp Sent
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{stats.byType['whatsapp'] || 0}</div>
            <p className="text-xs text-muted-foreground">~R0.05 each</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Failed
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-destructive">{stats.totalFailed}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Est. Cost (ZAR)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">R{stats.totalCost.toFixed(2)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <Phone className="h-4 w-4" />
              Success Rate
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {stats.totalSent + stats.totalFailed > 0 
                ? ((stats.totalSent / (stats.totalSent + stats.totalFailed)) * 100).toFixed(1)
                : 0}%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Message Types Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Messages by Type</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {Object.entries(stats.byType).map(([type, count]) => (
              <Badge key={type} variant="secondary" className="text-sm">
                {type}: {count}
              </Badge>
            ))}
            {Object.keys(stats.byType).length === 0 && (
              <p className="text-muted-foreground">No messages in selected period</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Recent Logs Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent SMS Activity</CardTitle>
          <CardDescription>Last 100 SMS messages</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Loading...</div>
          ) : logs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No SMS activity in selected period</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-2">Time</th>
                    <th className="text-left py-2 px-2">Phone</th>
                    <th className="text-left py-2 px-2">Type</th>
                    <th className="text-left py-2 px-2">Status</th>
                    <th className="text-right py-2 px-2">Cost</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr key={log.id} className="border-b hover:bg-muted/50">
                      <td className="py-2 px-2 text-muted-foreground">
                        {format(new Date(log.created_at), 'MMM d, HH:mm')}
                      </td>
                      <td className="py-2 px-2 font-mono">{maskPhone(log.phone_number)}</td>
                      <td className="py-2 px-2">
                        <Badge variant={log.message_type === 'whatsapp' ? 'outline' : 'secondary'}>
                          {log.message_type === 'whatsapp' ? '💬 WhatsApp' : '📱 SMS'}
                        </Badge>
                      </td>
                      <td className="py-2 px-2">
                        <Badge variant={log.status === 'sent' ? 'default' : 'destructive'}>
                          {log.status}
                        </Badge>
                      </td>
                      <td className="py-2 px-2 text-right">R{log.cost_estimate?.toFixed(2) || '0.00'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
