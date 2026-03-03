import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { useState } from "react";
import { AlertTriangle, Eye, EyeOff, TrendingDown, TrendingUp, Calculator, DollarSign } from "lucide-react";

export const RevenueLeakageCalculator = () => {
  const [vehicleCount, setVehicleCount] = useState(3);
  const [tripsPerDay, setTripsPerDay] = useState(40);
  const [avgFarePerTrip, setAvgFarePerTrip] = useState(15);
  const [reportedPercentage, setReportedPercentage] = useState(70);
  const [showBreakdown, setShowBreakdown] = useState(false);

  const actualDailyRevenue = vehicleCount * tripsPerDay * avgFarePerTrip;
  const reportedDailyRevenue = actualDailyRevenue * (reportedPercentage / 100);
  const dailyLeakage = actualDailyRevenue - reportedDailyRevenue;
  const monthlyLeakage = dailyLeakage * 26; // 26 working days
  const yearlyLeakage = monthlyLeakage * 12;
  const leakagePercent = 100 - reportedPercentage;

  const ownerShare = 0.6; // 60/40 split
  const ownerMonthlyLoss = monthlyLeakage * ownerShare;

  return (
    <Card className="border-destructive/30 bg-gradient-to-br from-background to-destructive/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <AlertTriangle className="h-5 w-5 text-destructive" />
          Revenue Leakage Calculator
          <Badge variant="destructive" className="ml-auto text-xs">
            Owner Intelligence Tool
          </Badge>
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          See how much revenue you're losing without digital tracking
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <label className="text-sm font-medium flex justify-between">
              <span>Vehicles in fleet</span>
              <span className="text-primary font-bold">{vehicleCount}</span>
            </label>
            <Slider
              value={[vehicleCount]}
              onValueChange={(v) => setVehicleCount(v[0])}
              min={1} max={20} step={1}
            />
          </div>

          <div className="space-y-3">
            <label className="text-sm font-medium flex justify-between">
              <span>Trips per vehicle/day</span>
              <span className="text-primary font-bold">{tripsPerDay}</span>
            </label>
            <Slider
              value={[tripsPerDay]}
              onValueChange={(v) => setTripsPerDay(v[0])}
              min={10} max={80} step={5}
            />
          </div>

          <div className="space-y-3">
            <label className="text-sm font-medium flex justify-between">
              <span>Average fare (R)</span>
              <span className="text-primary font-bold">R{avgFarePerTrip}</span>
            </label>
            <Slider
              value={[avgFarePerTrip]}
              onValueChange={(v) => setAvgFarePerTrip(v[0])}
              min={5} max={50} step={1}
            />
          </div>

          <div className="space-y-3">
            <label className="text-sm font-medium flex justify-between">
              <span>Driver reports</span>
              <span className="text-destructive font-bold">{reportedPercentage}% of actual</span>
            </label>
            <Slider
              value={[reportedPercentage]}
              onValueChange={(v) => setReportedPercentage(v[0])}
              min={40} max={100} step={5}
            />
          </div>
        </div>

        {/* Big impact numbers */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-center">
            <EyeOff className="h-6 w-6 text-destructive mx-auto mb-2" />
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Daily Hidden Revenue</p>
            <p className="text-2xl font-bold text-destructive">R{dailyLeakage.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">{leakagePercent}% unreported</p>
          </div>

          <div className="p-4 rounded-xl bg-destructive/15 border border-destructive/30 text-center">
            <TrendingDown className="h-6 w-6 text-destructive mx-auto mb-2" />
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Your Monthly Loss (60%)</p>
            <p className="text-3xl font-bold text-destructive">R{ownerMonthlyLoss.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">at 60/40 owner split</p>
          </div>

          <div className="p-4 rounded-xl bg-destructive/20 border border-destructive/40 text-center">
            <DollarSign className="h-6 w-6 text-destructive mx-auto mb-2" />
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Yearly Loss</p>
            <p className="text-2xl font-bold text-destructive">R{(yearlyLeakage * ownerShare).toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">money leaving your pocket</p>
          </div>
        </div>

        {/* Breakdown toggle */}
        <Button
          variant="outline"
          className="w-full border-primary/30"
          onClick={() => setShowBreakdown(!showBreakdown)}
        >
          {showBreakdown ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
          {showBreakdown ? "Hide" : "Show"} Detailed Breakdown
        </Button>

        {showBreakdown && (
          <div className="space-y-3 p-4 rounded-xl bg-muted/50 border">
            <h4 className="font-semibold text-sm flex items-center gap-2">
              <Calculator className="h-4 w-4 text-primary" />
              Side-by-Side: Without vs. With MojaRide
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <p className="text-xs font-semibold text-destructive uppercase">❌ Without Tracking</p>
                <div className="text-sm space-y-1">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Actual trips/day</span>
                    <span>{vehicleCount * tripsPerDay}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Driver reports</span>
                    <span className="text-destructive">{Math.round(vehicleCount * tripsPerDay * reportedPercentage / 100)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">You receive/day</span>
                    <span className="text-destructive">R{Math.round(reportedDailyRevenue * ownerShare).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between font-bold border-t pt-1">
                    <span>Monthly take-home</span>
                    <span className="text-destructive">R{Math.round(reportedDailyRevenue * ownerShare * 26).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-semibold text-success uppercase">✅ With MojaRide GPS</p>
                <div className="text-sm space-y-1">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Verified trips/day</span>
                    <span>{vehicleCount * tripsPerDay}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">100% tracked</span>
                    <span className="text-success">{vehicleCount * tripsPerDay}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">You receive/day</span>
                    <span className="text-success">R{Math.round(actualDailyRevenue * ownerShare).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between font-bold border-t pt-1">
                    <span>Monthly take-home</span>
                    <span className="text-success">R{Math.round(actualDailyRevenue * ownerShare * 26).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-3 p-3 rounded-lg bg-success/10 border border-success/20 text-center">
              <TrendingUp className="h-5 w-5 text-success mx-auto mb-1" />
              <p className="text-sm font-semibold text-success">
                You recover R{ownerMonthlyLoss.toLocaleString()}/month — MojaRide takes only 5-8% of that
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Net gain after platform fee: R{Math.round(ownerMonthlyLoss * 0.93).toLocaleString()}/month
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
