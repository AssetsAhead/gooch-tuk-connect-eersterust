import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Calculator, 
  TrendingUp, 
  Fuel, 
  Wrench, 
  Users, 
  Calendar,
  DollarSign,
  PiggyBank,
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
  PieChart,
  Pie,
  Cell
} from "recharts";
import { InvestorPitchExport } from "./InvestorPitchExport";
import { RevenueTracking } from "./RevenueTracking";

interface ROIInputs {
  vehicleCost: number;
  fleetSize: number;
  dailyRevenue: number;
  tripsPerDay: number;
  farePerTrip: number;
  fuelSavingsPerDay: number;
  maintenanceCostMonthly: number;
  operatingDaysPerMonth: number;
}

// SA Employment cost constants
const EMPLOYMENT_COSTS = {
  UIF_RATE: 0.01, // 1% employer contribution
  SDL_RATE: 0.01, // Skills Development Levy 1%
  LEAVE_PROVISION: 0.0417, // ~15 days annual leave / 360 = 4.17%
  WORKMAN_COMP: 0.01, // Compensation fund ~1%
};

// Revenue split
const OWNER_SPLIT = 0.60;
const DRIVER_SPLIT = 0.40;

export const FleetROICalculator = () => {
  const [inputs, setInputs] = useState<ROIInputs>({
    vehicleCost: 100000,
    fleetSize: 10,
    dailyRevenue: 700,
    tripsPerDay: 47, // ~700/15
    farePerTrip: 15,
    fuelSavingsPerDay: 100,
    maintenanceCostMonthly: 1500,
    operatingDaysPerMonth: 26,
  });

  // Calculate derived values
  const monthlyGrossRevenue = inputs.dailyRevenue * inputs.operatingDaysPerMonth;
  const ownerGrossShare = monthlyGrossRevenue * OWNER_SPLIT;
  const driverGrossShare = monthlyGrossRevenue * DRIVER_SPLIT;

  // Employment costs on driver share (employer's additional costs)
  const employmentOverhead = 
    EMPLOYMENT_COSTS.UIF_RATE + 
    EMPLOYMENT_COSTS.SDL_RATE + 
    EMPLOYMENT_COSTS.LEAVE_PROVISION + 
    EMPLOYMENT_COSTS.WORKMAN_COMP;
  
  const employmentCostsMonthly = driverGrossShare * employmentOverhead;
  
  // Fuel savings (electric vs petrol)
  const monthlyFuelSavings = inputs.fuelSavingsPerDay * inputs.operatingDaysPerMonth;
  
  // Net owner income per vehicle
  const netOwnerIncomePerVehicle = ownerGrossShare - inputs.maintenanceCostMonthly - employmentCostsMonthly + monthlyFuelSavings;
  
  // Fleet totals
  const totalInvestment = inputs.vehicleCost * inputs.fleetSize;
  const totalMonthlyNetIncome = netOwnerIncomePerVehicle * inputs.fleetSize;
  
  // Payback calculation
  const paybackMonths = totalInvestment / totalMonthlyNetIncome;
  const annualROI = ((totalMonthlyNetIncome * 12) / totalInvestment) * 100;

  // Generate payback timeline data
  const generatePaybackData = () => {
    const data = [];
    let cumulativeProfit = -totalInvestment;
    
    for (let month = 0; month <= Math.min(36, Math.ceil(paybackMonths) + 6); month++) {
      cumulativeProfit += month === 0 ? 0 : totalMonthlyNetIncome;
      data.push({
        month: `M${month}`,
        cumulative: Math.round(cumulativeProfit),
        monthly: month === 0 ? 0 : Math.round(totalMonthlyNetIncome),
        breakeven: 0,
      });
    }
    return data;
  };

  // Cost breakdown for pie chart
  const costBreakdown = [
    { name: "Owner Net (60%)", value: ownerGrossShare - employmentCostsMonthly, color: "hsl(var(--primary))" },
    { name: "Driver Wage (40%)", value: driverGrossShare, color: "hsl(var(--secondary))" },
    { name: "Employment Costs", value: employmentCostsMonthly, color: "hsl(var(--destructive))" },
    { name: "Maintenance", value: inputs.maintenanceCostMonthly, color: "hsl(var(--muted))" },
  ];

  // Monthly breakdown data
  const monthlyBreakdown = [
    { category: "Gross Revenue", amount: monthlyGrossRevenue },
    { category: "Owner Share (60%)", amount: ownerGrossShare },
    { category: "Driver Share (40%)", amount: driverGrossShare },
    { category: "Employment Costs", amount: -employmentCostsMonthly },
    { category: "Maintenance", amount: -inputs.maintenanceCostMonthly },
    { category: "Fuel Savings", amount: monthlyFuelSavings },
    { category: "Net Owner Income", amount: netOwnerIncomePerVehicle },
  ];

  const updateInput = (key: keyof ROIInputs, value: number) => {
    setInputs(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-primary/30 bg-gradient-to-r from-primary/5 to-primary/10">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-primary/20">
                <Calculator className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-2xl">Fleet ROI Calculator</CardTitle>
                <CardDescription>
                  Electric Bike Fleet Financial Model • 60/40 Split • SA Employment Compliant
                </CardDescription>
              </div>
            </div>
            <InvestorPitchExport 
              data={{
                vehicleCost: inputs.vehicleCost,
                fleetSize: inputs.fleetSize,
                dailyRevenue: inputs.dailyRevenue,
                fuelSavingsPerDay: inputs.fuelSavingsPerDay,
                maintenanceCostMonthly: inputs.maintenanceCostMonthly,
                operatingDaysPerMonth: inputs.operatingDaysPerMonth,
                monthlyGrossRevenue,
                ownerGrossShare,
                driverGrossShare,
                employmentCostsMonthly,
                monthlyFuelSavings,
                netOwnerIncomePerVehicle,
                totalInvestment,
                totalMonthlyNetIncome,
                paybackMonths,
                annualROI,
              }}
            />
          </div>
        </CardHeader>
      </Card>

      {/* Key Metrics Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-green-500/10 border-green-500/30">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-green-600 mb-1">
              <TrendingUp className="h-4 w-4" />
              <span className="text-sm font-medium">Annual ROI</span>
            </div>
            <p className="text-2xl font-bold text-green-700">{annualROI.toFixed(1)}%</p>
          </CardContent>
        </Card>

        <Card className="bg-blue-500/10 border-blue-500/30">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-blue-600 mb-1">
              <Calendar className="h-4 w-4" />
              <span className="text-sm font-medium">Payback Period</span>
            </div>
            <p className="text-2xl font-bold text-blue-700">{paybackMonths.toFixed(1)} months</p>
          </CardContent>
        </Card>

        <Card className="bg-purple-500/10 border-purple-500/30">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-purple-600 mb-1">
              <PiggyBank className="h-4 w-4" />
              <span className="text-sm font-medium">Monthly Net/Bike</span>
            </div>
            <p className="text-2xl font-bold text-purple-700">R{netOwnerIncomePerVehicle.toLocaleString()}</p>
          </CardContent>
        </Card>

        <Card className="bg-orange-500/10 border-orange-500/30">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-orange-600 mb-1">
              <DollarSign className="h-4 w-4" />
              <span className="text-sm font-medium">Total Investment</span>
            </div>
            <p className="text-2xl font-bold text-orange-700">R{totalInvestment.toLocaleString()}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Input Controls */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Model Inputs
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Vehicle Cost */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label className="flex items-center gap-2">
                  <Fuel className="h-4 w-4" />
                  Vehicle Cost (landed)
                </Label>
                <span className="font-mono text-sm">R{inputs.vehicleCost.toLocaleString()}</span>
              </div>
              <Slider
                value={[inputs.vehicleCost]}
                onValueChange={([v]) => updateInput('vehicleCost', v)}
                min={50000}
                max={200000}
                step={5000}
              />
            </div>

            {/* Fleet Size */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Fleet Size
                </Label>
                <span className="font-mono text-sm">{inputs.fleetSize} bikes</span>
              </div>
              <Slider
                value={[inputs.fleetSize]}
                onValueChange={([v]) => updateInput('fleetSize', v)}
                min={1}
                max={50}
                step={1}
              />
            </div>

            {/* Daily Revenue */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Daily Revenue per Bike
                </Label>
                <span className="font-mono text-sm">R{inputs.dailyRevenue}</span>
              </div>
              <Slider
                value={[inputs.dailyRevenue]}
                onValueChange={([v]) => updateInput('dailyRevenue', v)}
                min={300}
                max={1200}
                step={50}
              />
            </div>

            {/* Fuel Savings */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label className="flex items-center gap-2">
                  <Fuel className="h-4 w-4 text-green-600" />
                  Daily Fuel Savings (Electric)
                </Label>
                <span className="font-mono text-sm text-green-600">+R{inputs.fuelSavingsPerDay}</span>
              </div>
              <Slider
                value={[inputs.fuelSavingsPerDay]}
                onValueChange={([v]) => updateInput('fuelSavingsPerDay', v)}
                min={50}
                max={200}
                step={10}
              />
            </div>

            {/* Maintenance */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label className="flex items-center gap-2">
                  <Wrench className="h-4 w-4" />
                  Monthly Maintenance
                </Label>
                <span className="font-mono text-sm">R{inputs.maintenanceCostMonthly}</span>
              </div>
              <Slider
                value={[inputs.maintenanceCostMonthly]}
                onValueChange={([v]) => updateInput('maintenanceCostMonthly', v)}
                min={500}
                max={5000}
                step={100}
              />
            </div>

            {/* Operating Days */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Operating Days/Month
                </Label>
                <span className="font-mono text-sm">{inputs.operatingDaysPerMonth} days</span>
              </div>
              <Slider
                value={[inputs.operatingDaysPerMonth]}
                onValueChange={([v]) => updateInput('operatingDaysPerMonth', v)}
                min={20}
                max={30}
                step={1}
              />
            </div>
          </CardContent>
        </Card>

        {/* Employment Costs Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="h-5 w-5" />
              Employment Model (60/40 Split)
            </CardTitle>
            <CardDescription>
              SA Labour Law Compliant • Employed Drivers
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-muted/50 rounded-lg p-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Gross Monthly Revenue</span>
                <span className="font-mono font-semibold">R{monthlyGrossRevenue.toLocaleString()}</span>
              </div>
              <Separator />
              <div className="flex justify-between items-center">
                <span className="text-sm">Owner Share (60%)</span>
                <span className="font-mono text-primary">R{ownerGrossShare.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Driver Wage (40%)</span>
                <span className="font-mono">R{driverGrossShare.toLocaleString()}</span>
              </div>
              <Separator />
              <div className="text-xs text-muted-foreground space-y-1">
                <div className="flex justify-between">
                  <span>• UIF (1%)</span>
                  <span>-R{(driverGrossShare * EMPLOYMENT_COSTS.UIF_RATE).toFixed(0)}</span>
                </div>
                <div className="flex justify-between">
                  <span>• SDL (1%)</span>
                  <span>-R{(driverGrossShare * EMPLOYMENT_COSTS.SDL_RATE).toFixed(0)}</span>
                </div>
                <div className="flex justify-between">
                  <span>• Leave Provision (4.17%)</span>
                  <span>-R{(driverGrossShare * EMPLOYMENT_COSTS.LEAVE_PROVISION).toFixed(0)}</span>
                </div>
                <div className="flex justify-between">
                  <span>• Workman's Comp (1%)</span>
                  <span>-R{(driverGrossShare * EMPLOYMENT_COSTS.WORKMAN_COMP).toFixed(0)}</span>
                </div>
              </div>
              <div className="flex justify-between items-center text-destructive">
                <span className="text-sm font-medium">Total Employment Costs</span>
                <span className="font-mono">-R{employmentCostsMonthly.toFixed(0)}</span>
              </div>
              <div className="flex justify-between items-center text-orange-600">
                <span className="text-sm font-medium">Maintenance</span>
                <span className="font-mono">-R{inputs.maintenanceCostMonthly}</span>
              </div>
              <div className="flex justify-between items-center text-green-600">
                <span className="text-sm font-medium">Fuel Savings (Electric)</span>
                <span className="font-mono">+R{monthlyFuelSavings.toLocaleString()}</span>
              </div>
              <Separator />
              <div className="flex justify-between items-center text-lg">
                <span className="font-semibold">Net Owner Income/Bike</span>
                <span className="font-mono font-bold text-primary">R{netOwnerIncomePerVehicle.toLocaleString()}</span>
              </div>
            </div>

            <div className="flex items-start gap-2 p-3 bg-blue-500/10 rounded-lg border border-blue-500/30">
              <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-800">
                <strong>Compliance Note:</strong> Employment model includes UIF, SDL, leave provisions, and workman's compensation as required by SA labour law.
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payback Timeline Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Payback Timeline ({inputs.fleetSize} bikes)
          </CardTitle>
          <CardDescription>
            Cumulative profit over time • Break-even at month {Math.ceil(paybackMonths)}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={generatePaybackData()}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="month" className="text-xs" />
                <YAxis 
                  tickFormatter={(v) => `R${(v/1000).toFixed(0)}k`}
                  className="text-xs"
                />
                <Tooltip 
                  formatter={(value: number) => [`R${value.toLocaleString()}`, 'Cumulative']}
                  labelFormatter={(label) => `Month ${label.replace('M', '')}`}
                />
                <Line 
                  type="monotone" 
                  dataKey="cumulative" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={3}
                  dot={{ fill: "hsl(var(--primary))" }}
                />
                <Line 
                  type="monotone" 
                  dataKey="breakeven" 
                  stroke="hsl(var(--muted-foreground))" 
                  strokeDasharray="5 5"
                  strokeWidth={1}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Fleet Summary */}
      <Card className="border-green-500/30 bg-green-500/5">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <PiggyBank className="h-5 w-5 text-green-600" />
            Fleet Summary ({inputs.fleetSize} Electric Bikes)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-background rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Total Investment</p>
              <p className="text-xl font-bold">R{totalInvestment.toLocaleString()}</p>
            </div>
            <div className="text-center p-4 bg-background rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Monthly Fleet Income</p>
              <p className="text-xl font-bold text-green-600">R{totalMonthlyNetIncome.toLocaleString()}</p>
            </div>
            <div className="text-center p-4 bg-background rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Annual Fleet Income</p>
              <p className="text-xl font-bold text-green-600">R{(totalMonthlyNetIncome * 12).toLocaleString()}</p>
            </div>
            <div className="text-center p-4 bg-background rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Year 2 Profit</p>
              <p className="text-xl font-bold text-primary">R{((totalMonthlyNetIncome * 24) - totalInvestment).toLocaleString()}</p>
            </div>
          </div>

          <div className="mt-4 p-4 bg-green-100 dark:bg-green-900/30 rounded-lg">
            <p className="text-sm text-green-800 dark:text-green-200">
              <strong>Bottom Line:</strong> With {inputs.fleetSize} electric bikes at R{inputs.vehicleCost.toLocaleString()} each, 
              you'll recover your R{totalInvestment.toLocaleString()} investment in <strong>{paybackMonths.toFixed(1)} months</strong> and 
              generate <strong>R{((totalMonthlyNetIncome * 24) - totalInvestment).toLocaleString()}</strong> profit by end of Year 2.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Actual Revenue Tracking */}
      <RevenueTracking 
        projectedValues={{
          dailyRevenue: inputs.dailyRevenue,
          fuelSavingsPerDay: inputs.fuelSavingsPerDay,
          maintenanceCostMonthly: inputs.maintenanceCostMonthly,
          operatingDaysPerMonth: inputs.operatingDaysPerMonth,
        }}
      />
    </div>
  );
};
