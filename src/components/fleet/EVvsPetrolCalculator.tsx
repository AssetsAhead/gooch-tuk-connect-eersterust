import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Zap, Fuel, TrendingDown, Leaf, AlertCircle, Globe, Wrench, BatteryCharging } from "lucide-react";

// SA-specific defaults (Feb 2026 estimates)
const SA_DEFAULTS = {
  petrolPricePerLitre: 22.50,       // R/L inland 95 ULP
  electricityRatePerKwh: 2.80,      // R/kWh Eskom prepaid avg
  petrolConsumption: 8,             // L/100km for tuk-tuk (petrol)
  evConsumption: 6,                 // kWh/100km for electric tuk-tuk
  monthlyKm: 1560,                  // ~60km/day × 26 days
  batteryCapacity: 5,               // kWh per battery (tuk-tuk scale)
};

export const EVvsPetrolCalculator = () => {
  const [monthlyKm, setMonthlyKm] = useState(SA_DEFAULTS.monthlyKm);
  const [petrolPrice, setPetrolPrice] = useState(SA_DEFAULTS.petrolPricePerLitre);
  const [electricityRate, setElectricityRate] = useState(SA_DEFAULTS.electricityRatePerKwh);
  const [petrolConsumption, setPetrolConsumption] = useState(SA_DEFAULTS.petrolConsumption);
  const [evConsumption, setEvConsumption] = useState(SA_DEFAULTS.evConsumption);

  // Calculations
  const petrolCostMonthly = (monthlyKm / 100) * petrolConsumption * petrolPrice;
  const evCostMonthly = (monthlyKm / 100) * evConsumption * electricityRate;
  const monthlySavings = petrolCostMonthly - evCostMonthly;
  const annualSavings = monthlySavings * 12;
  const savingsPercent = petrolCostMonthly > 0 ? ((monthlySavings / petrolCostMonthly) * 100) : 0;
  const costPerKmPetrol = (petrolConsumption / 100) * petrolPrice;
  const costPerKmEV = (evConsumption / 100) * electricityRate;

  // CO2 estimation: ~2.31 kg CO2/L petrol
  const co2SavedMonthly = ((monthlyKm / 100) * petrolConsumption) * 2.31;
  const co2SavedAnnual = co2SavedMonthly * 12;

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-green-500/30 bg-gradient-to-r from-green-500/5 to-emerald-500/10">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-green-500/20">
              <BatteryCharging className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <CardTitle className="text-2xl">EV vs Petrol Savings Calculator</CardTitle>
              <CardDescription>
                South African Rand (ZAR) • Tuk-Tuk Fleet • Eersterust POC
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Impact Statements */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card className="bg-green-500/5 border-green-500/20">
          <CardContent className="pt-4">
            <div className="flex items-start gap-3">
              <Globe className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-green-700 mb-1">The Global EV Shift Is Here</p>
                <p className="text-xs text-muted-foreground">
                  India crossed <strong>1 million EVs sold in FY25</strong> — the fastest-growing EV market globally. 
                  South Africa's charging infrastructure market is projected to reach <strong>$1.01 billion by 2029</strong>. 
                  The question isn't if electric — it's when.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-emerald-500/5 border-emerald-500/20">
          <CardContent className="pt-4">
            <div className="flex items-start gap-3">
              <Leaf className="h-5 w-5 text-emerald-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-emerald-700 mb-1">Why Electric Tuk-Tuks for Eersterust?</p>
                <p className="text-xs text-muted-foreground">
                  Electric vehicles eliminate <strong>70-80% of fuel costs</strong>, produce zero tailpipe emissions, 
                  and require <strong>60% less maintenance</strong> (no oil changes, fewer brake replacements). 
                  For fleet owners, this means faster ROI and predictable operating costs.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Savings Hero */}
      <Card className={`border-2 ${savingsPercent > 50 ? 'border-green-500 bg-green-500/10' : 'border-primary/30 bg-primary/5'}`}>
        <CardContent className="pt-6 text-center">
          <p className="text-lg font-medium text-muted-foreground mb-1">Your Monthly Fuel Savings</p>
          <p className="text-5xl font-bold text-green-600">
            {savingsPercent.toFixed(0)}%
          </p>
          <p className="text-2xl font-bold text-green-700 mt-2">
            R{monthlySavings.toLocaleString(undefined, { maximumFractionDigits: 0 })} / month
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            That's <strong>R{annualSavings.toLocaleString(undefined, { maximumFractionDigits: 0 })}</strong> saved per year, per vehicle
          </p>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Input Sliders */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Fuel className="h-5 w-5" />
              Calculator Inputs
            </CardTitle>
            <CardDescription>Adjust to match your fleet's operating profile</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label>Monthly Travel (km)</Label>
                <span className="font-mono text-sm font-semibold">{monthlyKm.toLocaleString()} km</span>
              </div>
              <Slider value={[monthlyKm]} onValueChange={([v]) => setMonthlyKm(v)} min={500} max={5000} step={100} />
              <p className="text-xs text-muted-foreground">~{(monthlyKm / 26).toFixed(0)} km/day over 26 operating days</p>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <Label>Petrol Price (R/litre)</Label>
                <span className="font-mono text-sm font-semibold">R{petrolPrice.toFixed(2)}</span>
              </div>
              <Slider value={[petrolPrice]} onValueChange={([v]) => setPetrolPrice(v)} min={18} max={30} step={0.50} />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <Label>Electricity Rate (R/kWh)</Label>
                <span className="font-mono text-sm font-semibold">R{electricityRate.toFixed(2)}</span>
              </div>
              <Slider value={[electricityRate]} onValueChange={([v]) => setElectricityRate(v)} min={1.50} max={5.00} step={0.10} />
              <p className="text-xs text-muted-foreground">Eskom prepaid ~R2.50-R3.20/kWh (2025/26)</p>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <Label>Petrol Consumption (L/100km)</Label>
                <span className="font-mono text-sm font-semibold">{petrolConsumption} L/100km</span>
              </div>
              <Slider value={[petrolConsumption]} onValueChange={([v]) => setPetrolConsumption(v)} min={4} max={15} step={0.5} />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <Label>EV Consumption (kWh/100km)</Label>
                <span className="font-mono text-sm font-semibold">{evConsumption} kWh/100km</span>
              </div>
              <Slider value={[evConsumption]} onValueChange={([v]) => setEvConsumption(v)} min={3} max={15} step={0.5} />
            </div>
          </CardContent>
        </Card>

        {/* Cost Comparison */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-green-600" />
              Cost Comparison
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-red-500/5 rounded-lg p-4 border border-red-500/20">
              <div className="flex items-center gap-2 mb-3">
                <Fuel className="h-5 w-5 text-red-600" />
                <span className="font-semibold text-red-700">Petrol Tuk-Tuk</span>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Monthly Fuel Cost</span>
                  <span className="font-mono font-bold text-red-600">R{petrolCostMonthly.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                </div>
                <div className="flex justify-between">
                  <span>Cost per km</span>
                  <span className="font-mono">R{costPerKmPetrol.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Annual Fuel Cost</span>
                  <span className="font-mono font-bold">R{(petrolCostMonthly * 12).toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                </div>
              </div>
            </div>

            <div className="bg-green-500/5 rounded-lg p-4 border border-green-500/20">
              <div className="flex items-center gap-2 mb-3">
                <Zap className="h-5 w-5 text-green-600" />
                <span className="font-semibold text-green-700">Electric Tuk-Tuk</span>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Monthly Charging Cost</span>
                  <span className="font-mono font-bold text-green-600">R{evCostMonthly.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                </div>
                <div className="flex justify-between">
                  <span>Cost per km</span>
                  <span className="font-mono">R{costPerKmEV.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Annual Charging Cost</span>
                  <span className="font-mono font-bold">R{(evCostMonthly * 12).toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                </div>
              </div>
            </div>

            <Separator />

            <div className="space-y-2 text-sm">
              <div className="flex justify-between items-center">
                <span className="font-semibold">Monthly Savings</span>
                <span className="font-mono font-bold text-green-600 text-lg">R{monthlySavings.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-semibold">Annual Savings</span>
                <span className="font-mono font-bold text-green-600 text-lg">R{annualSavings.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
              </div>
            </div>

            <Separator />

            {/* Environmental Impact */}
            <div className="bg-emerald-500/5 rounded-lg p-3 border border-emerald-500/20">
              <div className="flex items-center gap-2 mb-2">
                <Leaf className="h-4 w-4 text-emerald-600" />
                <span className="text-sm font-semibold text-emerald-700">Environmental Impact</span>
              </div>
              <div className="space-y-1 text-xs text-muted-foreground">
                <div className="flex justify-between">
                  <span>CO₂ avoided per month</span>
                  <span className="font-mono">{co2SavedMonthly.toFixed(0)} kg</span>
                </div>
                <div className="flex justify-between">
                  <span>CO₂ avoided per year</span>
                  <span className="font-mono font-semibold">{(co2SavedAnnual / 1000).toFixed(1)} tonnes</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Infrastructure Considerations */}
      <Card className="border-amber-500/30 bg-amber-500/5">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Wrench className="h-5 w-5 text-amber-600" />
            Charging & Infrastructure Requirements
          </CardTitle>
          <CardDescription>Key considerations for the Eersterust POC</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 bg-background rounded-lg border">
              <div className="flex items-center gap-2 mb-2">
                <BatteryCharging className="h-4 w-4 text-amber-600" />
                <span className="font-medium text-sm">Charging Stations</span>
              </div>
              <p className="text-xs text-muted-foreground mb-2">
                Level 2 chargers: <strong>R9,000 – R24,000</strong> per unit installed. 
                For a 10-bike fleet, budget <strong>R100,000 – R150,000</strong> for 3-5 charging points 
                with overnight rotation charging.
              </p>
              <Badge variant="outline" className="text-xs">Import required</Badge>
            </div>

            <div className="p-4 bg-background rounded-lg border">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="h-4 w-4 text-amber-600" />
                <span className="font-medium text-sm">Parking & Depot</span>
              </div>
              <p className="text-xs text-muted-foreground mb-2">
                Secure overnight parking with charging access. 
                <strong>Eersterust depot space:</strong> R3,000 – R8,000/month rental. 
                Requires 3-phase electrical supply for fast charging capability.
              </p>
              <Badge variant="outline" className="text-xs">Lease negotiation</Badge>
            </div>

            <div className="p-4 bg-background rounded-lg border">
              <div className="flex items-center gap-2 mb-2">
                <Wrench className="h-4 w-4 text-amber-600" />
                <span className="font-medium text-sm">Servicing Equipment</span>
              </div>
              <p className="text-xs text-muted-foreground mb-2">
                Battery diagnostic tools, motor testers, and basic EV servicing kit. 
                Import from China/India: <strong>R50,000 – R80,000</strong>. 
                Local EV mechanics are scarce — driver training must include basic troubleshooting.
              </p>
              <Badge variant="outline" className="text-xs">Training included</Badge>
            </div>

            <div className="p-4 bg-background rounded-lg border">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="h-4 w-4 text-amber-600" />
                <span className="font-medium text-sm">Load Shedding Mitigation</span>
              </div>
              <p className="text-xs text-muted-foreground mb-2">
                Battery swap model reduces dependency on grid timing. 
                2 spare batteries per bike enables continuous operation. 
                Optional: <strong>solar carport</strong> for daytime top-up charging (R80,000 – R120,000).
              </p>
              <Badge variant="outline" className="text-xs">Battery swap ready</Badge>
            </div>

            <div className="p-4 bg-background rounded-lg border">
              <div className="flex items-center gap-2 mb-2">
                <Globe className="h-4 w-4 text-amber-600" />
                <span className="font-medium text-sm">Import Logistics</span>
              </div>
              <p className="text-xs text-muted-foreground mb-2">
                Vehicles + charging equipment imported via Durban port. 
                Import duty: <strong>~25% on EVs</strong> (pending ITAC tariff review). 
                Clearing agent + transport to Pretoria: R15,000 – R25,000 per shipment.
              </p>
              <Badge variant="outline" className="text-xs">Customs clearance</Badge>
            </div>

            <div className="p-4 bg-background rounded-lg border">
              <div className="flex items-center gap-2 mb-2">
                <Fuel className="h-4 w-4 text-amber-600" />
                <span className="font-medium text-sm">Spare Parts Pipeline</span>
              </div>
              <p className="text-xs text-muted-foreground mb-2">
                Stock critical spares locally: controllers, tyres, brake pads, wiring harnesses. 
                Initial parts inventory: <strong>R30,000 – R50,000</strong>. 
                Supplier relationships with Chinese OEMs for ongoing supply chain.
              </p>
              <Badge variant="outline" className="text-xs">Supply chain</Badge>
            </div>
          </div>

          <div className="mt-4 p-3 bg-amber-100 dark:bg-amber-900/30 rounded-lg border border-amber-500/20">
            <p className="text-sm text-amber-800 dark:text-amber-200">
              <strong>Total Infrastructure Budget (estimated):</strong> R280,000 – R430,000 for charging stations, 
              depot setup, servicing equipment, and initial spare parts. This is factored into the R2M investment proposal 
              under fleet hardware and operations.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Owner Vehicle Inspection */}
      <Card className="border-blue-500/30 bg-blue-500/5">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Wrench className="h-5 w-5 text-blue-600" />
            Owner Vehicle Inspection Monitoring
          </CardTitle>
          <CardDescription>Track vehicle health and compliance for your fleet</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-4 bg-background rounded-lg border text-center">
              <p className="text-2xl font-bold text-blue-600">Daily</p>
              <p className="text-sm font-medium mt-1">Pre-Trip Check</p>
              <p className="text-xs text-muted-foreground mt-1">Battery level, tyre pressure, lights, brakes, body condition</p>
            </div>
            <div className="p-4 bg-background rounded-lg border text-center">
              <p className="text-2xl font-bold text-blue-600">Weekly</p>
              <p className="text-sm font-medium mt-1">Fleet Inspection</p>
              <p className="text-xs text-muted-foreground mt-1">Battery health diagnostics, motor performance, charging port condition</p>
            </div>
            <div className="p-4 bg-background rounded-lg border text-center">
              <p className="text-2xl font-bold text-blue-600">Monthly</p>
              <p className="text-sm font-medium mt-1">Full Audit</p>
              <p className="text-xs text-muted-foreground mt-1">Controller diagnostics, wiring inspection, compliance certificates, insurance check</p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-4 text-center italic">
            All inspection data is logged in the platform for owner visibility. Flagged issues trigger automatic maintenance alerts.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
