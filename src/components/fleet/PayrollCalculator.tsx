import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Calculator, 
  DollarSign, 
  TrendingUp,
  FileText,
  Users,
  Calendar,
  Download,
  Printer
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { format, startOfMonth, endOfMonth, subMonths } from "date-fns";
import { generatePayslipPDF, generateAllPayslips } from "./PayslipGenerator";

interface RevenueRecord {
  id: string;
  vehicle_id: string | null;
  tracking_date: string;
  gross_revenue: number;
  trips_completed: number;
}

interface Vehicle {
  id: string;
  registration_number: string;
  assigned_driver_id: string | null;
}

interface PayrollSummary {
  grossRevenue: number;
  driverShare: number; // 60%
  ownerShare: number; // 40%
  uifDeduction: number; // 1% of driver share
  payeDeduction: number; // Based on tax brackets
  netDriverPay: number;
}

// 2024/2025 South African PAYE Tax Brackets (Simplified monthly)
const calculatePAYE = (monthlyIncome: number): number => {
  const annualIncome = monthlyIncome * 12;
  let annualTax = 0;
  
  if (annualIncome <= 237100) {
    annualTax = annualIncome * 0.18;
  } else if (annualIncome <= 370500) {
    annualTax = 42678 + (annualIncome - 237100) * 0.26;
  } else if (annualIncome <= 512800) {
    annualTax = 77362 + (annualIncome - 370500) * 0.31;
  } else if (annualIncome <= 673000) {
    annualTax = 121475 + (annualIncome - 512800) * 0.36;
  } else if (annualIncome <= 857900) {
    annualTax = 179147 + (annualIncome - 673000) * 0.39;
  } else if (annualIncome <= 1817000) {
    annualTax = 251258 + (annualIncome - 857900) * 0.41;
  } else {
    annualTax = 644489 + (annualIncome - 1817000) * 0.45;
  }
  
  // Apply primary rebate (R17,235 for under 65)
  const rebate = 17235;
  annualTax = Math.max(0, annualTax - rebate);
  
  return annualTax / 12;
};

export const PayrollCalculator = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [records, setRecords] = useState<RevenueRecord[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), "yyyy-MM"));
  const [selectedVehicle, setSelectedVehicle] = useState<string>("all");

  useEffect(() => {
    if (user) {
      fetchVehicles();
    }
  }, [user]);

  useEffect(() => {
    if (user && selectedMonth) {
      fetchRecords();
    }
  }, [user, selectedMonth]);

  const fetchVehicles = async () => {
    try {
      const { data, error } = await supabase
        .from("vehicles")
        .select("id, registration_number, assigned_driver_id")
        .eq("status", "active");

      if (error) throw error;
      setVehicles(data || []);
    } catch (error) {
      console.error("Error fetching vehicles:", error);
    }
  };

  const fetchRecords = async () => {
    try {
      setLoading(true);
      const monthDate = new Date(selectedMonth + "-01");
      const start = format(startOfMonth(monthDate), "yyyy-MM-dd");
      const end = format(endOfMonth(monthDate), "yyyy-MM-dd");

      const { data, error } = await supabase
        .from("fleet_revenue_tracking")
        .select("id, vehicle_id, tracking_date, gross_revenue, trips_completed")
        .gte("tracking_date", start)
        .lte("tracking_date", end)
        .order("tracking_date", { ascending: true });

      if (error) throw error;
      setRecords(data || []);
    } catch (error) {
      console.error("Error fetching records:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculatePayroll = (vehicleId?: string): PayrollSummary => {
    const filteredRecords = vehicleId && vehicleId !== "all"
      ? records.filter(r => r.vehicle_id === vehicleId)
      : records;

    const grossRevenue = filteredRecords.reduce((sum, r) => sum + Number(r.gross_revenue), 0);
    const ownerShare = grossRevenue * 0.6; // 60% to owner
    const driverShare = grossRevenue * 0.4; // 40% to driver
    const uifDeduction = driverShare * 0.01; // 1% UIF on driver's share
    const payeDeduction = calculatePAYE(driverShare);
    const netDriverPay = driverShare - uifDeduction - payeDeduction;

    return {
      grossRevenue,
      driverShare,
      ownerShare,
      uifDeduction,
      payeDeduction,
      netDriverPay,
    };
  };

  const summary = calculatePayroll(selectedVehicle);

  // Generate last 6 months for selection
  const monthOptions = Array.from({ length: 6 }, (_, i) => {
    const date = subMonths(new Date(), i);
    return {
      value: format(date, "yyyy-MM"),
      label: format(date, "MMMM yyyy"),
    };
  });

  // Per-vehicle breakdown with days and trips
  const vehicleBreakdowns = vehicles.map(vehicle => {
    const vehicleRecords = records.filter(r => r.vehicle_id === vehicle.id);
    return {
      vehicle,
      payroll: calculatePayroll(vehicle.id),
      daysWorked: vehicleRecords.length,
      tripsCompleted: vehicleRecords.reduce((sum, r) => sum + (r.trips_completed || 0), 0),
    };
  }).filter(v => v.payroll.grossRevenue > 0);

  const selectedMonthLabel = format(new Date(selectedMonth + "-01"), "MMMM yyyy");

  const handleDownloadPayslip = (breakdown: typeof vehicleBreakdowns[0]) => {
    generatePayslipPDF({
      employerName: "Poortlink Fleet Services",
      employerAddress: "Cape Town, South Africa",
      employeeName: `Driver - ${breakdown.vehicle.registration_number}`,
      employeeId: breakdown.vehicle.id.slice(0, 8).toUpperCase(),
      vehicleReg: breakdown.vehicle.registration_number,
      payPeriod: selectedMonthLabel,
      payDate: format(new Date(), "dd MMMM yyyy"),
      grossRevenue: breakdown.payroll.grossRevenue,
      driverShare: breakdown.payroll.driverShare,
      ownerShare: breakdown.payroll.ownerShare,
      uifDeduction: breakdown.payroll.uifDeduction,
      payeDeduction: breakdown.payroll.payeDeduction,
      netPay: breakdown.payroll.netDriverPay,
      daysWorked: breakdown.daysWorked,
      tripsCompleted: breakdown.tripsCompleted,
    });
    toast({
      title: "Payslip Downloaded",
      description: `Payslip for ${breakdown.vehicle.registration_number} has been generated.`,
    });
  };

  const handleDownloadAllPayslips = () => {
    if (vehicleBreakdowns.length === 0) {
      toast({
        title: "No Payslips",
        description: "No revenue data available for the selected period.",
        variant: "destructive",
      });
      return;
    }
    generateAllPayslips(vehicleBreakdowns, selectedMonthLabel);
    toast({
      title: "Generating Payslips",
      description: `Downloading ${vehicleBreakdowns.length} payslips...`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-green-500/30 bg-gradient-to-r from-green-500/5 to-green-500/10">
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-green-500/20">
                <Calculator className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <CardTitle className="text-2xl">Driver Payroll Calculator</CardTitle>
                <CardDescription>
                  60/40 commission with automatic UIF & PAYE deductions
                </CardDescription>
              </div>
            </div>
            <div className="flex gap-3">
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {monthOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedVehicle} onValueChange={setSelectedVehicle}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="All vehicles" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Vehicles</SelectItem>
                  {vehicles.map(v => (
                    <SelectItem key={v.id} value={v.id}>
                      {v.registration_number}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <DollarSign className="h-4 w-4" />
              <span className="text-xs">Gross Revenue</span>
            </div>
            <p className="text-xl font-bold">R{summary.grossRevenue.toLocaleString()}</p>
          </CardContent>
        </Card>

        <Card className="bg-blue-500/10 border-blue-500/30">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-blue-600 mb-1">
              <Users className="h-4 w-4" />
              <span className="text-xs">Driver Share (60%)</span>
            </div>
            <p className="text-xl font-bold text-blue-600">R{summary.driverShare.toLocaleString()}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <TrendingUp className="h-4 w-4" />
              <span className="text-xs">Owner Share (40%)</span>
            </div>
            <p className="text-xl font-bold">R{summary.ownerShare.toLocaleString()}</p>
          </CardContent>
        </Card>

        <Card className="bg-orange-500/10 border-orange-500/30">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-orange-600 mb-1">
              <FileText className="h-4 w-4" />
              <span className="text-xs">UIF (1%)</span>
            </div>
            <p className="text-xl font-bold text-orange-600">-R{summary.uifDeduction.toFixed(2)}</p>
          </CardContent>
        </Card>

        <Card className="bg-orange-500/10 border-orange-500/30">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-orange-600 mb-1">
              <FileText className="h-4 w-4" />
              <span className="text-xs">PAYE</span>
            </div>
            <p className="text-xl font-bold text-orange-600">-R{summary.payeDeduction.toFixed(2)}</p>
          </CardContent>
        </Card>

        <Card className="bg-green-500/10 border-green-500/30">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-green-600 mb-1">
              <DollarSign className="h-4 w-4" />
              <span className="text-xs">Net Driver Pay</span>
            </div>
            <p className="text-xl font-bold text-green-600">R{summary.netDriverPay.toFixed(2)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Deduction Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Statutory Deductions Breakdown</CardTitle>
          <CardDescription>Based on SARS 2024/2025 tax tables</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="font-medium flex items-center gap-2">
                <Badge variant="outline">UIF</Badge>
                Unemployment Insurance Fund
              </h4>
              <div className="text-sm text-muted-foreground space-y-1">
                <p>• Employee contribution: 1% of remuneration</p>
                <p>• Employer contribution: 1% (separate)</p>
                <p>• Maximum monthly earnings ceiling: R17,712.00</p>
                <p>• Max employee UIF deduction: R177.12</p>
              </div>
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm">Driver UIF: R{Math.min(summary.uifDeduction, 177.12).toFixed(2)}</p>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium flex items-center gap-2">
                <Badge variant="outline">PAYE</Badge>
                Pay As You Earn
              </h4>
              <div className="text-sm text-muted-foreground space-y-1">
                <p>• Tax-free threshold: R95,750/year</p>
                <p>• Primary rebate: R17,235</p>
                <p>• Based on monthly equivalent income</p>
                <p>• Calculated using 2024/2025 brackets</p>
              </div>
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm">Driver PAYE: R{summary.payeDeduction.toFixed(2)}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Per-Vehicle Breakdown */}
      {vehicleBreakdowns.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between flex-wrap gap-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Per-Vehicle Payroll Summary
              </CardTitle>
              <Button onClick={handleDownloadAllPayslips} className="gap-2">
                <Printer className="h-4 w-4" />
                Download All Payslips
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Vehicle</TableHead>
                  <TableHead className="text-right">Days</TableHead>
                  <TableHead className="text-right">Trips</TableHead>
                  <TableHead className="text-right">Gross Revenue</TableHead>
                  <TableHead className="text-right">Driver (60%)</TableHead>
                  <TableHead className="text-right">Deductions</TableHead>
                  <TableHead className="text-right">Net Pay</TableHead>
                  <TableHead className="text-center">Payslip</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {vehicleBreakdowns.map((breakdown) => (
                  <TableRow key={breakdown.vehicle.id}>
                    <TableCell className="font-medium">{breakdown.vehicle.registration_number}</TableCell>
                    <TableCell className="text-right">{breakdown.daysWorked}</TableCell>
                    <TableCell className="text-right">{breakdown.tripsCompleted}</TableCell>
                    <TableCell className="text-right">R{breakdown.payroll.grossRevenue.toLocaleString()}</TableCell>
                    <TableCell className="text-right text-blue-600">R{breakdown.payroll.driverShare.toLocaleString()}</TableCell>
                    <TableCell className="text-right text-orange-600">
                      -R{(breakdown.payroll.uifDeduction + breakdown.payroll.payeDeduction).toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right font-bold text-green-600">R{breakdown.payroll.netDriverPay.toFixed(2)}</TableCell>
                    <TableCell className="text-center">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleDownloadPayslip(breakdown)}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {records.length === 0 && !loading && (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">No revenue records found for {format(new Date(selectedMonth + "-01"), "MMMM yyyy")}.</p>
            <p className="text-sm text-muted-foreground mt-1">Log revenue in the Revenue Tracking section first.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
