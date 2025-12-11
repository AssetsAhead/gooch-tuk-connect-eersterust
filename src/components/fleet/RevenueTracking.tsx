import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Plus, 
  TrendingUp, 
  TrendingDown, 
  Calendar,
  DollarSign,
  Car,
  BarChart3,
  Target,
  AlertCircle
} from "lucide-react";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
  ComposedChart,
  Area
} from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { format, subDays, startOfMonth, endOfMonth } from "date-fns";

interface RevenueRecord {
  id: string;
  vehicle_id: string | null;
  tracking_date: string;
  trips_completed: number;
  gross_revenue: number;
  fuel_cost: number;
  maintenance_cost: number;
  other_costs: number;
  notes: string | null;
}

interface Vehicle {
  id: string;
  registration_number: string;
}

interface ProjectedValues {
  dailyRevenue: number;
  fuelSavingsPerDay: number;
  maintenanceCostMonthly: number;
  operatingDaysPerMonth: number;
}

interface Props {
  projectedValues?: ProjectedValues;
}

export const RevenueTracking = ({ projectedValues }: Props) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [records, setRecords] = useState<RevenueRecord[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    vehicle_id: "",
    tracking_date: format(new Date(), "yyyy-MM-dd"),
    trips_completed: 0,
    gross_revenue: 0,
    fuel_cost: 0,
    maintenance_cost: 0,
    other_costs: 0,
    notes: "",
  });

  // Default projections if not provided
  const projections = projectedValues || {
    dailyRevenue: 700,
    fuelSavingsPerDay: 100,
    maintenanceCostMonthly: 1500,
    operatingDaysPerMonth: 26,
  };

  useEffect(() => {
    if (user) {
      fetchRecords();
      fetchVehicles();
    }
  }, [user]);

  const fetchRecords = async () => {
    try {
      const thirtyDaysAgo = format(subDays(new Date(), 30), "yyyy-MM-dd");
      const { data, error } = await supabase
        .from("fleet_revenue_tracking")
        .select("*")
        .gte("tracking_date", thirtyDaysAgo)
        .order("tracking_date", { ascending: true });

      if (error) throw error;
      setRecords(data || []);
    } catch (error) {
      console.error("Error fetching records:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchVehicles = async () => {
    try {
      const { data, error } = await supabase
        .from("vehicles")
        .select("id, registration_number")
        .eq("status", "active");

      if (error) throw error;
      setVehicles(data || []);
    } catch (error) {
      console.error("Error fetching vehicles:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const { error } = await supabase.from("fleet_revenue_tracking").upsert({
        owner_id: user.id,
        vehicle_id: formData.vehicle_id || null,
        tracking_date: formData.tracking_date,
        trips_completed: formData.trips_completed,
        gross_revenue: formData.gross_revenue,
        fuel_cost: formData.fuel_cost,
        maintenance_cost: formData.maintenance_cost,
        other_costs: formData.other_costs,
        notes: formData.notes || null,
      }, {
        onConflict: "vehicle_id,tracking_date",
      });

      if (error) throw error;

      toast({
        title: "Revenue Recorded",
        description: `Revenue for ${formData.tracking_date} has been saved.`,
      });

      setDialogOpen(false);
      fetchRecords();
      resetForm();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      vehicle_id: "",
      tracking_date: format(new Date(), "yyyy-MM-dd"),
      trips_completed: 0,
      gross_revenue: 0,
      fuel_cost: 0,
      maintenance_cost: 0,
      other_costs: 0,
      notes: "",
    });
  };

  // Calculate actual totals
  const totalActualRevenue = records.reduce((sum, r) => sum + Number(r.gross_revenue), 0);
  const totalActualTrips = records.reduce((sum, r) => sum + r.trips_completed, 0);
  const totalActualCosts = records.reduce((sum, r) => 
    sum + Number(r.fuel_cost) + Number(r.maintenance_cost) + Number(r.other_costs), 0);
  const totalActualNet = totalActualRevenue - totalActualCosts;
  const avgDailyRevenue = records.length > 0 ? totalActualRevenue / records.length : 0;
  const avgDailyTrips = records.length > 0 ? totalActualTrips / records.length : 0;

  // Compare with projections
  const projectedDailyNet = projections.dailyRevenue * 0.6 - (projections.maintenanceCostMonthly / projections.operatingDaysPerMonth);
  const actualDailyNet = records.length > 0 ? totalActualNet / records.length : 0;
  const performanceVsProjection = projectedDailyNet > 0 ? ((actualDailyNet / projectedDailyNet) * 100) : 0;

  // Prepare chart data
  const chartData = records.map(record => {
    const netRevenue = Number(record.gross_revenue) - Number(record.fuel_cost) - 
                       Number(record.maintenance_cost) - Number(record.other_costs);
    return {
      date: format(new Date(record.tracking_date), "MMM dd"),
      actual: Number(record.gross_revenue),
      projected: projections.dailyRevenue,
      netActual: netRevenue,
      netProjected: projectedDailyNet,
      trips: record.trips_completed,
    };
  });

  // Weekly aggregation for comparison
  const getWeeklyData = () => {
    const weeks: { [key: string]: { actual: number; projected: number; days: number } } = {};
    
    records.forEach(record => {
      const date = new Date(record.tracking_date);
      const weekStart = format(subDays(date, date.getDay()), "MMM dd");
      
      if (!weeks[weekStart]) {
        weeks[weekStart] = { actual: 0, projected: 0, days: 0 };
      }
      
      weeks[weekStart].actual += Number(record.gross_revenue);
      weeks[weekStart].days += 1;
      weeks[weekStart].projected = weeks[weekStart].days * projections.dailyRevenue;
    });

    return Object.entries(weeks).map(([week, data]) => ({
      week,
      actual: data.actual,
      projected: data.projected,
      variance: data.actual - data.projected,
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-blue-500/30 bg-gradient-to-r from-blue-500/5 to-blue-500/10">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-blue-500/20">
                <BarChart3 className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-2xl">Revenue Tracking</CardTitle>
                <CardDescription>
                  Track actual performance vs projections • Last 30 days
                </CardDescription>
              </div>
            </div>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Log Revenue
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Log Daily Revenue</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Date</Label>
                      <Input
                        type="date"
                        value={formData.tracking_date}
                        onChange={(e) => setFormData({ ...formData, tracking_date: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Vehicle (Optional)</Label>
                      <Select
                        value={formData.vehicle_id}
                        onValueChange={(v) => setFormData({ ...formData, vehicle_id: v })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="All vehicles" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">All vehicles</SelectItem>
                          {vehicles.map((v) => (
                            <SelectItem key={v.id} value={v.id}>
                              {v.registration_number}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Trips Completed</Label>
                      <Input
                        type="number"
                        value={formData.trips_completed}
                        onChange={(e) => setFormData({ ...formData, trips_completed: parseInt(e.target.value) || 0 })}
                        min={0}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Gross Revenue (R)</Label>
                      <Input
                        type="number"
                        value={formData.gross_revenue}
                        onChange={(e) => setFormData({ ...formData, gross_revenue: parseFloat(e.target.value) || 0 })}
                        min={0}
                        step={0.01}
                      />
                    </div>
                  </div>

                  <Separator />
                  <p className="text-sm text-muted-foreground">Costs (leave 0 for electric bikes)</p>
                  
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Fuel (R)</Label>
                      <Input
                        type="number"
                        value={formData.fuel_cost}
                        onChange={(e) => setFormData({ ...formData, fuel_cost: parseFloat(e.target.value) || 0 })}
                        min={0}
                        step={0.01}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Maintenance (R)</Label>
                      <Input
                        type="number"
                        value={formData.maintenance_cost}
                        onChange={(e) => setFormData({ ...formData, maintenance_cost: parseFloat(e.target.value) || 0 })}
                        min={0}
                        step={0.01}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Other (R)</Label>
                      <Input
                        type="number"
                        value={formData.other_costs}
                        onChange={(e) => setFormData({ ...formData, other_costs: parseFloat(e.target.value) || 0 })}
                        min={0}
                        step={0.01}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Notes</Label>
                    <Textarea
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      placeholder="Any notes for this day..."
                    />
                  </div>

                  <Button type="submit" className="w-full">Save Revenue Record</Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
      </Card>

      {/* Performance Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <DollarSign className="h-4 w-4" />
              <span className="text-sm">Avg Daily Revenue</span>
            </div>
            <p className="text-2xl font-bold">R{avgDailyRevenue.toFixed(0)}</p>
            <p className="text-xs text-muted-foreground">
              Projected: R{projections.dailyRevenue}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Car className="h-4 w-4" />
              <span className="text-sm">Avg Daily Trips</span>
            </div>
            <p className="text-2xl font-bold">{avgDailyTrips.toFixed(1)}</p>
            <p className="text-xs text-muted-foreground">
              @R15/trip = {(avgDailyTrips * 15).toFixed(0)}
            </p>
          </CardContent>
        </Card>

        <Card className={performanceVsProjection >= 100 ? "bg-green-500/10 border-green-500/30" : "bg-orange-500/10 border-orange-500/30"}>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 mb-1">
              {performanceVsProjection >= 100 ? (
                <TrendingUp className="h-4 w-4 text-green-600" />
              ) : (
                <TrendingDown className="h-4 w-4 text-orange-600" />
              )}
              <span className="text-sm">vs Projection</span>
            </div>
            <p className={`text-2xl font-bold ${performanceVsProjection >= 100 ? "text-green-600" : "text-orange-600"}`}>
              {performanceVsProjection.toFixed(0)}%
            </p>
            <p className="text-xs text-muted-foreground">
              {performanceVsProjection >= 100 ? "Above target" : "Below target"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Calendar className="h-4 w-4" />
              <span className="text-sm">Days Tracked</span>
            </div>
            <p className="text-2xl font-bold">{records.length}</p>
            <p className="text-xs text-muted-foreground">
              Total: R{totalActualRevenue.toLocaleString()}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      {records.length > 0 ? (
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Daily Revenue Comparison */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Target className="h-5 w-5" />
                Actual vs Projected Revenue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="date" className="text-xs" />
                    <YAxis tickFormatter={(v) => `R${v}`} className="text-xs" />
                    <Tooltip 
                      formatter={(value: number, name: string) => [
                        `R${value.toLocaleString()}`, 
                        name === "actual" ? "Actual" : "Projected"
                      ]}
                    />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="projected"
                      fill="hsl(var(--muted))"
                      stroke="hsl(var(--muted-foreground))"
                      strokeDasharray="5 5"
                      name="Projected"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="actual" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={3}
                      dot={{ fill: "hsl(var(--primary))" }}
                      name="Actual"
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Weekly Comparison */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Weekly Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={getWeeklyData()}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="week" className="text-xs" />
                    <YAxis tickFormatter={(v) => `R${(v/1000).toFixed(0)}k`} className="text-xs" />
                    <Tooltip 
                      formatter={(value: number) => [`R${value.toLocaleString()}`, '']}
                    />
                    <Legend />
                    <Bar dataKey="actual" fill="hsl(var(--primary))" name="Actual" />
                    <Bar dataKey="projected" fill="hsl(var(--muted))" name="Projected" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <AlertCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No Revenue Data Yet</h3>
            <p className="text-muted-foreground mb-4">
              Start logging daily revenue to compare against your projections.
            </p>
            <Button onClick={() => setDialogOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Log First Day's Revenue
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Recent Records */}
      {records.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Records</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {records.slice(-7).reverse().map((record) => {
                const net = Number(record.gross_revenue) - Number(record.fuel_cost) - 
                           Number(record.maintenance_cost) - Number(record.other_costs);
                const vsProjection = ((Number(record.gross_revenue) / projections.dailyRevenue) * 100);
                
                return (
                  <div 
                    key={record.id} 
                    className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-sm font-medium">
                        {format(new Date(record.tracking_date), "EEE, MMM dd")}
                      </div>
                      <Badge variant="outline">{record.trips_completed} trips</Badge>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-semibold">R{Number(record.gross_revenue).toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">Net: R{net.toFixed(0)}</p>
                      </div>
                      <Badge className={vsProjection >= 100 ? "bg-green-500" : "bg-orange-500"}>
                        {vsProjection.toFixed(0)}%
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
