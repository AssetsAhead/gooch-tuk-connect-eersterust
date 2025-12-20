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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Plus, 
  TrendingUp, 
  TrendingDown, 
  DollarSign,
  Car,
  BarChart3,
  Users,
  Download,
  Calendar,
  MapPin,
  Clock,
  CreditCard,
  Banknote,
  Building2,
  FileSpreadsheet
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
  PieChart,
  Pie,
  Cell
} from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { format, subDays, startOfWeek, parseISO } from "date-fns";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { z } from "zod";
import { tripRevenueSchema, rankAccessFeeSchema } from "@/lib/validationSchemas";

interface TripRecord {
  id: string;
  owner_id: string;
  driver_id: string | null;
  vehicle_id: string | null;
  trip_date: string;
  trip_time: string | null;
  pickup_location: string | null;
  dropoff_location: string | null;
  route_name: string | null;
  fare_amount: number;
  payment_method: string;
  rank_access_fee: number;
  platform_fee: number;
  driver_share: number;
  owner_share: number;
  notes: string | null;
  created_at: string;
}

interface Vehicle {
  id: string;
  registration_number: string;
}

interface Driver {
  user_id: string;
  name: string;
}

interface RankAccessFee {
  id: string;
  vehicle_id: string | null;
  week_starting: string;
  amount: number;
  payment_status: string;
  paid_at: string | null;
  receipt_number: string | null;
}

const PAYMENT_METHODS = [
  { value: 'cash', label: 'Cash', icon: Banknote },
  { value: 'card', label: 'Card', icon: CreditCard },
  { value: 'mobile', label: 'Mobile Money', icon: CreditCard },
  { value: 'eft', label: 'EFT', icon: Building2 },
];

const CHART_COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', 'hsl(var(--muted))'];

export const RevenueIntelligence = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [trips, setTrips] = useState<TripRecord[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [rankFees, setRankFees] = useState<RankAccessFee[]>([]);
  const [loading, setLoading] = useState(true);
  const [tripDialogOpen, setTripDialogOpen] = useState(false);
  const [feeDialogOpen, setFeeDialogOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'owner' | 'association'>('owner');
  const [dateRange, setDateRange] = useState<'week' | 'month' | 'quarter'>('month');

  // Check admin status on mount
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user) return;
      const { data } = await supabase.rpc('is_current_user_admin');
      setIsAdmin(data === true);
    };
    checkAdminStatus();
  }, [user]);

  const [tripForm, setTripForm] = useState({
    vehicle_id: "",
    driver_id: "",
    trip_date: format(new Date(), "yyyy-MM-dd"),
    trip_time: format(new Date(), "HH:mm"),
    pickup_location: "",
    dropoff_location: "",
    route_name: "",
    fare_amount: 15,
    payment_method: "cash",
    notes: "",
  });

  const [feeForm, setFeeForm] = useState({
    vehicle_id: "",
    week_starting: format(startOfWeek(new Date(), { weekStartsOn: 1 }), "yyyy-MM-dd"),
    amount: 0,
    payment_status: "pending",
    receipt_number: "",
  });

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user, dateRange, viewMode]);

  const getDateFilter = () => {
    const now = new Date();
    switch (dateRange) {
      case 'week': return format(subDays(now, 7), "yyyy-MM-dd");
      case 'month': return format(subDays(now, 30), "yyyy-MM-dd");
      case 'quarter': return format(subDays(now, 90), "yyyy-MM-dd");
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const dateFilter = getDateFilter();
      
      // Fetch trips - admins see all, owners see their own
      const tripsQuery = supabase
        .from("trip_revenue")
        .select("*")
        .gte("trip_date", dateFilter)
        .order("trip_date", { ascending: false });
      
      if (viewMode === 'owner' || !isAdmin) {
        tripsQuery.eq("owner_id", user?.id);
      }
      
      const { data: tripsData, error: tripsError } = await tripsQuery;
      if (tripsError) throw tripsError;
      setTrips(tripsData || []);

      // Fetch vehicles
      const { data: vehiclesData } = await supabase
        .from("vehicles")
        .select("id, registration_number")
        .eq("status", "active");
      setVehicles(vehiclesData || []);

      // Fetch drivers
      const { data: driversData } = await supabase
        .from("drivers")
        .select("user_id, name");
      setDrivers(driversData || []);

      // Fetch rank fees
      const feesQuery = supabase
        .from("rank_access_fees")
        .select("*")
        .order("week_starting", { ascending: false })
        .limit(20);
      
      if (!isAdmin) {
        feesQuery.eq("owner_id", user?.id);
      }
      
      const { data: feesData, error: feesError } = await feesQuery;
      if (feesError) throw feesError;
      setRankFees(feesData || []);

    } catch (error: any) {
      console.error("Error fetching data:", error);
      toast({
        title: "Error loading data",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTripSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      // Validate input with zod schema
      const validated = tripRevenueSchema.parse({
        fare_amount: typeof tripForm.fare_amount === 'number' ? tripForm.fare_amount : parseFloat(String(tripForm.fare_amount)) || 0,
        trip_date: tripForm.trip_date,
        trip_time: tripForm.trip_time,
        pickup_location: tripForm.pickup_location,
        dropoff_location: tripForm.dropoff_location,
        route_name: tripForm.route_name,
        notes: tripForm.notes,
      });

      const { error } = await supabase.from("trip_revenue").insert({
        owner_id: user.id,
        vehicle_id: tripForm.vehicle_id || null,
        driver_id: tripForm.driver_id || null,
        trip_date: validated.trip_date,
        trip_time: validated.trip_time || null,
        pickup_location: validated.pickup_location || null,
        dropoff_location: validated.dropoff_location || null,
        route_name: validated.route_name || null,
        fare_amount: validated.fare_amount,
        payment_method: tripForm.payment_method,
        notes: validated.notes || null,
      });

      if (error) throw error;

      toast({
        title: "Trip Recorded",
        description: `R${validated.fare_amount} trip logged successfully.`,
      });

      setTripDialogOpen(false);
      fetchData();
      resetTripForm();
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        toast({
          title: "Validation Error",
          description: error.errors[0].message,
          variant: "destructive",
        });
        return;
      }
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleFeeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      // Validate input with zod schema
      const validated = rankAccessFeeSchema.parse({
        amount: typeof feeForm.amount === 'number' ? feeForm.amount : parseFloat(String(feeForm.amount)) || 0,
        week_starting: feeForm.week_starting,
        receipt_number: feeForm.receipt_number,
      });

      const { error } = await supabase.from("rank_access_fees").insert({
        owner_id: user.id,
        vehicle_id: feeForm.vehicle_id || null,
        week_starting: validated.week_starting,
        amount: validated.amount,
        payment_status: feeForm.payment_status,
        paid_at: feeForm.payment_status === 'paid' ? new Date().toISOString() : null,
        receipt_number: validated.receipt_number || null,
      });

      if (error) throw error;

      toast({
        title: "Rank Fee Recorded",
        description: `R${validated.amount} weekly fee logged.`,
      });

      setFeeDialogOpen(false);
      fetchData();
      resetFeeForm();
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        toast({
          title: "Validation Error",
          description: error.errors[0].message,
          variant: "destructive",
        });
        return;
      }
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const resetTripForm = () => {
    setTripForm({
      vehicle_id: "",
      driver_id: "",
      trip_date: format(new Date(), "yyyy-MM-dd"),
      trip_time: format(new Date(), "HH:mm"),
      pickup_location: "",
      dropoff_location: "",
      route_name: "",
      fare_amount: 15,
      payment_method: "cash",
      notes: "",
    });
  };

  const resetFeeForm = () => {
    setFeeForm({
      vehicle_id: "",
      week_starting: format(startOfWeek(new Date(), { weekStartsOn: 1 }), "yyyy-MM-dd"),
      amount: 0,
      payment_status: "pending",
      receipt_number: "",
    });
  };

  // Calculate statistics
  const totalRevenue = trips.reduce((sum, t) => sum + Number(t.fare_amount), 0);
  const totalTrips = trips.length;
  const avgFare = totalTrips > 0 ? totalRevenue / totalTrips : 0;
  const cashRevenue = trips.filter(t => t.payment_method === 'cash').reduce((sum, t) => sum + Number(t.fare_amount), 0);
  const digitalRevenue = totalRevenue - cashRevenue;
  const totalDriverShare = trips.reduce((sum, t) => sum + Number(t.driver_share), 0);
  const totalOwnerShare = trips.reduce((sum, t) => sum + Number(t.owner_share), 0);
  const uniqueVehicles = new Set(trips.map(t => t.vehicle_id).filter(Boolean)).size;
  const uniqueDrivers = new Set(trips.map(t => t.driver_id).filter(Boolean)).size;

  // Daily revenue chart data
  const dailyData = trips.reduce((acc, trip) => {
    const date = trip.trip_date;
    if (!acc[date]) {
      acc[date] = { date, revenue: 0, trips: 0 };
    }
    acc[date].revenue += Number(trip.fare_amount);
    acc[date].trips += 1;
    return acc;
  }, {} as Record<string, { date: string; revenue: number; trips: number }>);

  const chartData = Object.values(dailyData)
    .sort((a, b) => a.date.localeCompare(b.date))
    .map(d => ({
      ...d,
      date: format(parseISO(d.date), "MMM dd"),
    }));

  // Payment method breakdown
  const paymentBreakdown = PAYMENT_METHODS.map(method => ({
    name: method.label,
    value: trips.filter(t => t.payment_method === method.value).reduce((sum, t) => sum + Number(t.fare_amount), 0),
  })).filter(p => p.value > 0);

  // Export functions
  const exportToCSV = () => {
    const headers = ['Date', 'Time', 'Vehicle', 'Driver', 'Route', 'Pickup', 'Dropoff', 'Fare', 'Payment', 'Driver Share', 'Owner Share'];
    const rows = trips.map(t => [
      t.trip_date,
      t.trip_time || '',
      vehicles.find(v => v.id === t.vehicle_id)?.registration_number || '',
      drivers.find(d => d.user_id === t.driver_id)?.name || '',
      t.route_name || '',
      t.pickup_location || '',
      t.dropoff_location || '',
      t.fare_amount,
      t.payment_method,
      t.driver_share,
      t.owner_share,
    ]);

    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `revenue-report-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();

    toast({ title: "CSV Exported", description: "Revenue data downloaded." });
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(20);
    doc.text('Revenue Intelligence Report', 14, 20);
    doc.setFontSize(10);
    doc.text(`Generated: ${format(new Date(), 'PPP')}`, 14, 28);
    doc.text(`Period: Last ${dateRange}`, 14, 34);
    doc.text(`View: ${viewMode === 'owner' ? 'Owner' : 'Association-wide'}`, 14, 40);

    // Summary stats
    doc.setFontSize(14);
    doc.text('Summary Statistics', 14, 52);
    doc.setFontSize(10);
    doc.text(`Total Revenue: R${totalRevenue.toLocaleString()}`, 14, 60);
    doc.text(`Total Trips: ${totalTrips}`, 14, 66);
    doc.text(`Average Fare: R${avgFare.toFixed(2)}`, 14, 72);
    doc.text(`Cash Revenue: R${cashRevenue.toLocaleString()}`, 14, 78);
    doc.text(`Digital Revenue: R${digitalRevenue.toLocaleString()}`, 14, 84);
    doc.text(`Driver Share (40%): R${totalDriverShare.toLocaleString()}`, 14, 90);
    doc.text(`Owner Share (60%): R${totalOwnerShare.toLocaleString()}`, 14, 96);

    // Trip details table
    autoTable(doc, {
      startY: 106,
      head: [['Date', 'Vehicle', 'Fare', 'Payment', 'Driver', 'Owner']],
      body: trips.slice(0, 30).map(t => [
        t.trip_date,
        vehicles.find(v => v.id === t.vehicle_id)?.registration_number || '-',
        `R${Number(t.fare_amount).toFixed(2)}`,
        t.payment_method,
        `R${Number(t.driver_share).toFixed(2)}`,
        `R${Number(t.owner_share).toFixed(2)}`,
      ]),
      theme: 'striped',
      headStyles: { fillColor: [59, 130, 246] },
    });

    doc.save(`revenue-report-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
    toast({ title: "PDF Exported", description: "Revenue report downloaded." });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-primary/30 bg-gradient-to-r from-primary/5 to-primary/10">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-primary/20">
                <BarChart3 className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-2xl">Revenue Intelligence</CardTitle>
                <CardDescription>
                  Trip-level tracking • {viewMode === 'owner' ? 'Your Fleet' : 'Association-wide'}
                </CardDescription>
              </div>
            </div>
            
            <div className="flex flex-wrap items-center gap-2">
              {isAdmin && (
                <Select value={viewMode} onValueChange={(v: 'owner' | 'association') => setViewMode(v)}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="owner">My Fleet</SelectItem>
                    <SelectItem value="association">Association</SelectItem>
                  </SelectContent>
                </Select>
              )}
              
              <Select value={dateRange} onValueChange={(v: 'week' | 'month' | 'quarter') => setDateRange(v)}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">Last 7 days</SelectItem>
                  <SelectItem value="month">Last 30 days</SelectItem>
                  <SelectItem value="quarter">Last 90 days</SelectItem>
                </SelectContent>
              </Select>

              <Dialog open={tripDialogOpen} onOpenChange={setTripDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    Log Trip
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Log Trip Revenue</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleTripSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label className="text-xs">Date</Label>
                        <Input
                          type="date"
                          value={tripForm.trip_date}
                          onChange={(e) => setTripForm({ ...tripForm, trip_date: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Time</Label>
                        <Input
                          type="time"
                          value={tripForm.trip_time}
                          onChange={(e) => setTripForm({ ...tripForm, trip_time: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label className="text-xs">Vehicle</Label>
                        <Select
                          value={tripForm.vehicle_id}
                          onValueChange={(v) => setTripForm({ ...tripForm, vehicle_id: v })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select..." />
                          </SelectTrigger>
                          <SelectContent>
                            {vehicles.map((v) => (
                              <SelectItem key={v.id} value={v.id}>
                                {v.registration_number}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Driver</Label>
                        <Select
                          value={tripForm.driver_id}
                          onValueChange={(v) => setTripForm({ ...tripForm, driver_id: v })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select..." />
                          </SelectTrigger>
                          <SelectContent>
                            {drivers.map((d) => (
                              <SelectItem key={d.user_id} value={d.user_id}>
                                {d.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <Label className="text-xs">Route Name</Label>
                      <Input
                        value={tripForm.route_name}
                        onChange={(e) => setTripForm({ ...tripForm, route_name: e.target.value })}
                        placeholder="e.g., Eersterust to Mamelodi"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label className="text-xs">Pickup</Label>
                        <Input
                          value={tripForm.pickup_location}
                          onChange={(e) => setTripForm({ ...tripForm, pickup_location: e.target.value })}
                          placeholder="Location..."
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Dropoff</Label>
                        <Input
                          value={tripForm.dropoff_location}
                          onChange={(e) => setTripForm({ ...tripForm, dropoff_location: e.target.value })}
                          placeholder="Location..."
                        />
                      </div>
                    </div>

                    <Separator />

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label className="text-xs">Fare (R)</Label>
                        <Input
                          type="number"
                          value={tripForm.fare_amount}
                          onChange={(e) => setTripForm({ ...tripForm, fare_amount: parseFloat(e.target.value) || 0 })}
                          min={0}
                          step={5}
                          required
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Payment Method</Label>
                        <Select
                          value={tripForm.payment_method}
                          onValueChange={(v) => setTripForm({ ...tripForm, payment_method: v })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {PAYMENT_METHODS.map((m) => (
                              <SelectItem key={m.value} value={m.value}>
                                {m.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="p-3 bg-muted rounded-lg text-sm">
                      <div className="flex justify-between">
                        <span>Driver Share (40%):</span>
                        <span className="font-medium">R{(tripForm.fare_amount * 0.4).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Owner Share (60%):</span>
                        <span className="font-medium">R{(tripForm.fare_amount * 0.6).toFixed(2)}</span>
                      </div>
                    </div>

                    <Button type="submit" className="w-full">Record Trip</Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <DollarSign className="h-4 w-4" />
              <span className="text-xs">Total Revenue</span>
            </div>
            <p className="text-2xl font-bold">R{totalRevenue.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">{totalTrips} trips</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <TrendingUp className="h-4 w-4" />
              <span className="text-xs">Avg Fare</span>
            </div>
            <p className="text-2xl font-bold">R{avgFare.toFixed(0)}</p>
            <p className="text-xs text-muted-foreground">per trip</p>
          </CardContent>
        </Card>

        <Card className="bg-green-500/10 border-green-500/30">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-green-600 mb-1">
              <Users className="h-4 w-4" />
              <span className="text-xs">Owner Share</span>
            </div>
            <p className="text-2xl font-bold text-green-600">R{totalOwnerShare.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">60% of revenue</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Car className="h-4 w-4" />
              <span className="text-xs">Active Fleet</span>
            </div>
            <p className="text-2xl font-bold">{uniqueVehicles}</p>
            <p className="text-xs text-muted-foreground">{uniqueDrivers} drivers</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="analytics" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="trips">Trip Log</TabsTrigger>
          <TabsTrigger value="rank-fees">Rank Fees</TabsTrigger>
          <TabsTrigger value="export">Export</TabsTrigger>
        </TabsList>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid lg:grid-cols-2 gap-4">
            {/* Revenue Trend */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Revenue Trend</CardTitle>
              </CardHeader>
              <CardContent>
                {chartData.length > 0 ? (
                  <div className="h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis dataKey="date" className="text-xs" />
                        <YAxis tickFormatter={(v) => `R${v}`} className="text-xs" />
                        <Tooltip formatter={(value: number) => [`R${value}`, 'Revenue']} />
                        <Line 
                          type="monotone" 
                          dataKey="revenue" 
                          stroke="hsl(var(--primary))" 
                          strokeWidth={2}
                          dot={{ fill: "hsl(var(--primary))" }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-8">No trip data yet</p>
                )}
              </CardContent>
            </Card>

            {/* Payment Methods */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Payment Methods</CardTitle>
              </CardHeader>
              <CardContent>
                {paymentBreakdown.length > 0 ? (
                  <div className="h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={paymentBreakdown}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={90}
                          paddingAngle={2}
                          dataKey="value"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                          {paymentBreakdown.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value: number) => `R${value.toLocaleString()}`} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-8">No payment data yet</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Daily Trip Count */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Daily Trip Volume</CardTitle>
            </CardHeader>
            <CardContent>
              {chartData.length > 0 ? (
                <div className="h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="date" className="text-xs" />
                      <YAxis className="text-xs" />
                      <Tooltip />
                      <Bar dataKey="trips" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">No trip data yet</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trips">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Trip Log</CardTitle>
              <CardDescription>Recent trips with full details</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Time</TableHead>
                      <TableHead>Vehicle</TableHead>
                      <TableHead>Route</TableHead>
                      <TableHead>Fare</TableHead>
                      <TableHead>Payment</TableHead>
                      <TableHead>Split</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {trips.length > 0 ? trips.slice(0, 50).map((trip) => (
                      <TableRow key={trip.id}>
                        <TableCell className="font-medium">{format(parseISO(trip.trip_date), "MMM dd")}</TableCell>
                        <TableCell>{trip.trip_time || '-'}</TableCell>
                        <TableCell>
                          {vehicles.find(v => v.id === trip.vehicle_id)?.registration_number || '-'}
                        </TableCell>
                        <TableCell className="max-w-[150px] truncate">
                          {trip.route_name || trip.pickup_location || '-'}
                        </TableCell>
                        <TableCell className="font-medium">R{Number(trip.fare_amount).toFixed(0)}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">{trip.payment_method}</Badge>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          D: R{Number(trip.driver_share).toFixed(0)} / O: R{Number(trip.owner_share).toFixed(0)}
                        </TableCell>
                      </TableRow>
                    )) : (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                          No trips recorded yet. Click "Log Trip" to start.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rank-fees">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Weekly Rank Access Fees</CardTitle>
                  <CardDescription>Track Friday payments for rank parking privileges</CardDescription>
                </div>
                <Dialog open={feeDialogOpen} onOpenChange={setFeeDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="gap-2">
                      <Plus className="h-4 w-4" />
                      Log Fee
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Log Rank Access Fee</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleFeeSubmit} className="space-y-4">
                      <div className="space-y-2">
                        <Label>Week Starting (Monday)</Label>
                        <Input
                          type="date"
                          value={feeForm.week_starting}
                          onChange={(e) => setFeeForm({ ...feeForm, week_starting: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Vehicle</Label>
                        <Select
                          value={feeForm.vehicle_id}
                          onValueChange={(v) => setFeeForm({ ...feeForm, vehicle_id: v })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select vehicle..." />
                          </SelectTrigger>
                          <SelectContent>
                            {vehicles.map((v) => (
                              <SelectItem key={v.id} value={v.id}>
                                {v.registration_number}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Amount (R)</Label>
                          <Input
                            type="number"
                            value={feeForm.amount}
                            onChange={(e) => setFeeForm({ ...feeForm, amount: parseFloat(e.target.value) || 0 })}
                            min={0}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Status</Label>
                          <Select
                            value={feeForm.payment_status}
                            onValueChange={(v) => setFeeForm({ ...feeForm, payment_status: v })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="paid">Paid</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Receipt Number (Optional)</Label>
                        <Input
                          value={feeForm.receipt_number}
                          onChange={(e) => setFeeForm({ ...feeForm, receipt_number: e.target.value })}
                          placeholder="e.g., RCP-001"
                        />
                      </div>
                      <Button type="submit" className="w-full">Record Fee</Button>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Week Starting</TableHead>
                    <TableHead>Vehicle</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Receipt</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rankFees.length > 0 ? rankFees.map((fee) => (
                    <TableRow key={fee.id}>
                      <TableCell>{format(parseISO(fee.week_starting), "MMM dd, yyyy")}</TableCell>
                      <TableCell>
                        {vehicles.find(v => v.id === fee.vehicle_id)?.registration_number || '-'}
                      </TableCell>
                      <TableCell className="font-medium">R{Number(fee.amount).toFixed(0)}</TableCell>
                      <TableCell>
                        <Badge variant={fee.payment_status === 'paid' ? 'default' : 'secondary'}>
                          {fee.payment_status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{fee.receipt_number || '-'}</TableCell>
                    </TableRow>
                  )) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                        No rank fees recorded yet.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="export">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Export Data</CardTitle>
              <CardDescription>
                Download reports for Stats SA, financial institutions, or business valuations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <Card className="p-4 border-dashed cursor-pointer hover:bg-muted/50 transition-colors" onClick={exportToCSV}>
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-green-500/20">
                      <FileSpreadsheet className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium">Export to CSV</p>
                      <p className="text-sm text-muted-foreground">Spreadsheet format for analysis</p>
                    </div>
                  </div>
                </Card>

                <Card className="p-4 border-dashed cursor-pointer hover:bg-muted/50 transition-colors" onClick={exportToPDF}>
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-red-500/20">
                      <Download className="h-6 w-6 text-red-600" />
                    </div>
                    <div>
                      <p className="font-medium">Export to PDF</p>
                      <p className="text-sm text-muted-foreground">Formatted report for stakeholders</p>
                    </div>
                  </div>
                </Card>
              </div>

              <Separator />

              <div className="text-sm text-muted-foreground space-y-2">
                <p className="font-medium">Intended Use Cases:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li><strong>Stats SA:</strong> Industry statistics and economic reporting</li>
                  <li><strong>Financial Institutions:</strong> Risk assessment and loan applications</li>
                  <li><strong>Business Transfer:</strong> Valuation documentation for sale/acquisition</li>
                  <li><strong>New Entrants:</strong> Profitability benchmarks for prospective operators</li>
                  <li><strong>Tax Compliance:</strong> Revenue records for SARS</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
