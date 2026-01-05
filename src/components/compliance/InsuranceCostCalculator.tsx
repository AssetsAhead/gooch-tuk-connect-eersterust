import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { 
  Shield, 
  Car, 
  Calculator, 
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Info
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface InsuranceEstimate {
  minAnnual: number;
  maxAnnual: number;
  minMonthly: number;
  maxMonthly: number;
  coverageLevel: string;
  riskLevel: string;
}

export const InsuranceCostCalculator = () => {
  const [vehicleCount, setVehicleCount] = useState<number>(1);
  const [coverageAmount, setCoverageAmount] = useState<string>("5m");
  const [businessType, setBusinessType] = useState<string>("e-hailing");
  const [hasClaimsHistory, setHasClaimsHistory] = useState<boolean>(false);
  const [includePassengerLiability, setIncludePassengerLiability] = useState<boolean>(true);
  const [estimate, setEstimate] = useState<InsuranceEstimate | null>(null);

  // Base rates per vehicle type and coverage
  const BASE_RATES = {
    "e-hailing": { base: 8000, riskMultiplier: 1.3 },
    "metered-taxi": { base: 10000, riskMultiplier: 1.4 },
    "minibus-taxi": { base: 12000, riskMultiplier: 1.5 },
    "shuttle": { base: 9000, riskMultiplier: 1.25 }
  };

  const COVERAGE_MULTIPLIERS = {
    "5m": { multiplier: 1.0, label: "R5 Million" },
    "10m": { multiplier: 1.4, label: "R10 Million" },
    "20m": { multiplier: 1.8, label: "R20 Million" }
  };

  const calculateEstimate = () => {
    const baseRate = BASE_RATES[businessType as keyof typeof BASE_RATES] || BASE_RATES["e-hailing"];
    const coverageMultiplier = COVERAGE_MULTIPLIERS[coverageAmount as keyof typeof COVERAGE_MULTIPLIERS]?.multiplier || 1.0;
    
    // Calculate base cost
    let baseCost = baseRate.base * coverageMultiplier;
    
    // Adjust for vehicle count (discount for multiple vehicles)
    const vehicleMultiplier = vehicleCount === 1 ? 1 : 
      vehicleCount <= 3 ? 0.9 : 
      vehicleCount <= 10 ? 0.8 : 0.7;
    
    baseCost = baseCost * vehicleCount * vehicleMultiplier;
    
    // Claims history adjustment
    if (hasClaimsHistory) {
      baseCost *= 1.25;
    }
    
    // Passenger liability add-on
    if (includePassengerLiability) {
      baseCost += 2000 * vehicleCount;
    }
    
    // Calculate range (±20%)
    const minAnnual = Math.round(baseCost * 0.85);
    const maxAnnual = Math.round(baseCost * 1.25);
    
    // Determine risk level
    let riskLevel = "Medium";
    if (baseRate.riskMultiplier >= 1.4) riskLevel = "High";
    if (baseRate.riskMultiplier <= 1.25 && !hasClaimsHistory) riskLevel = "Low";
    
    setEstimate({
      minAnnual,
      maxAnnual,
      minMonthly: Math.round(minAnnual / 12),
      maxMonthly: Math.round(maxAnnual / 12),
      coverageLevel: COVERAGE_MULTIPLIERS[coverageAmount as keyof typeof COVERAGE_MULTIPLIERS]?.label || "R5 Million",
      riskLevel
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getRiskBadge = (level: string) => {
    switch (level) {
      case "Low":
        return <Badge className="bg-green-500/20 text-green-400 border-green-500/30"><CheckCircle2 className="h-3 w-3 mr-1" />Low Risk</Badge>;
      case "High":
        return <Badge className="bg-red-500/20 text-red-400 border-red-500/30"><AlertTriangle className="h-3 w-3 mr-1" />High Risk</Badge>;
      default:
        return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30"><Info className="h-3 w-3 mr-1" />Medium Risk</Badge>;
    }
  };

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Shield className="h-6 w-6 text-primary" />
          </div>
          <div>
            <CardTitle className="text-lg">Public Liability Insurance Calculator</CardTitle>
            <CardDescription>
              Estimate your insurance costs based on SA 2025 market rates
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Input Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="businessType">Business Type</Label>
            <Select value={businessType} onValueChange={setBusinessType}>
              <SelectTrigger>
                <SelectValue placeholder="Select business type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="e-hailing">E-Hailing Platform</SelectItem>
                <SelectItem value="metered-taxi">Metered Taxi</SelectItem>
                <SelectItem value="minibus-taxi">Minibus Taxi</SelectItem>
                <SelectItem value="shuttle">Shuttle Service</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="vehicleCount">Number of Vehicles</Label>
            <div className="flex items-center gap-2">
              <Car className="h-4 w-4 text-muted-foreground" />
              <Input
                id="vehicleCount"
                type="number"
                min={1}
                max={100}
                value={vehicleCount}
                onChange={(e) => setVehicleCount(parseInt(e.target.value) || 1)}
                className="flex-1"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="coverage">Coverage Amount</Label>
            <Select value={coverageAmount} onValueChange={setCoverageAmount}>
              <SelectTrigger>
                <SelectValue placeholder="Select coverage" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5m">R5 Million (Basic)</SelectItem>
                <SelectItem value="10m">R10 Million (Standard)</SelectItem>
                <SelectItem value="20m">R20 Million (Comprehensive)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Label htmlFor="claims" className="cursor-help flex items-center gap-1">
                      Previous Claims History
                      <Info className="h-3 w-3 text-muted-foreground" />
                    </Label>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs">Claims in the past 3 years typically increase premiums by ~25%</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <Switch
                id="claims"
                checked={hasClaimsHistory}
                onCheckedChange={setHasClaimsHistory}
              />
            </div>

            <div className="flex items-center justify-between">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Label htmlFor="passenger" className="cursor-help flex items-center gap-1">
                      Passenger Liability Add-on
                      <Info className="h-3 w-3 text-muted-foreground" />
                    </Label>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs">Required for e-hailing/taxi operations - covers injury to passengers</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <Switch
                id="passenger"
                checked={includePassengerLiability}
                onCheckedChange={setIncludePassengerLiability}
              />
            </div>
          </div>
        </div>

        <Button onClick={calculateEstimate} className="w-full">
          <Calculator className="h-4 w-4 mr-2" />
          Calculate Insurance Estimate
        </Button>

        {/* Results Section */}
        {estimate && (
          <>
            <Separator />
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-lg">Estimated Costs</h4>
                {getRiskBadge(estimate.riskLevel)}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="bg-muted/50">
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-2 text-muted-foreground mb-2">
                      <TrendingUp className="h-4 w-4" />
                      <span className="text-sm">Annual Premium</span>
                    </div>
                    <div className="text-2xl font-bold text-primary">
                      {formatCurrency(estimate.minAnnual)} - {formatCurrency(estimate.maxAnnual)}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      per year for {estimate.coverageLevel} coverage
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-muted/50">
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-2 text-muted-foreground mb-2">
                      <Calculator className="h-4 w-4" />
                      <span className="text-sm">Monthly Premium</span>
                    </div>
                    <div className="text-2xl font-bold text-primary">
                      {formatCurrency(estimate.minMonthly)} - {formatCurrency(estimate.maxMonthly)}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      per month ({vehicleCount} vehicle{vehicleCount > 1 ? 's' : ''})
                    </p>
                  </CardContent>
                </Card>
              </div>

              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                <h5 className="font-medium text-blue-400 mb-2 flex items-center gap-2">
                  <Info className="h-4 w-4" />
                  Cost Breakdown Factors
                </h5>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Base rate for {businessType.replace('-', ' ')} operations</li>
                  <li>• {estimate.coverageLevel} public liability coverage</li>
                  {vehicleCount > 1 && <li>• Fleet discount applied ({vehicleCount} vehicles)</li>}
                  {hasClaimsHistory && <li>• Claims history loading (+25%)</li>}
                  {includePassengerLiability && <li>• Passenger liability protection included</li>}
                </ul>
              </div>

              <div className="text-xs text-muted-foreground bg-muted/30 rounded-lg p-3">
                <strong>Disclaimer:</strong> These are estimates based on average 2025 SA market rates. 
                Actual premiums may vary based on insurer, location, vehicle age, and other factors. 
                We recommend getting quotes from multiple providers including FNB, Santam, OUTsurance, and Old Mutual.
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default InsuranceCostCalculator;
