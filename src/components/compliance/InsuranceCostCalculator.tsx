import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { 
  Shield, 
  Car, 
  Calculator, 
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Info,
  Save,
  History,
  Trash2,
  Calendar
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";

interface InsuranceEstimate {
  minAnnual: number;
  maxAnnual: number;
  minMonthly: number;
  maxMonthly: number;
  coverageLevel: string;
  riskLevel: string;
}

interface SavedQuote {
  id: string;
  business_type: string;
  vehicle_count: number;
  coverage_amount: string;
  has_claims_history: boolean;
  include_passenger_liability: boolean;
  annual_premium_min: number;
  annual_premium_max: number;
  monthly_premium_min: number;
  monthly_premium_max: number;
  risk_level: string;
  notes: string | null;
  quote_date: string;
  is_active: boolean;
  created_at: string;
}

export const InsuranceCostCalculator = () => {
  const { user } = useAuth();
  const [vehicleCount, setVehicleCount] = useState<number>(1);
  const [coverageAmount, setCoverageAmount] = useState<string>("5m");
  const [businessType, setBusinessType] = useState<string>("e-hailing");
  const [hasClaimsHistory, setHasClaimsHistory] = useState<boolean>(false);
  const [includePassengerLiability, setIncludePassengerLiability] = useState<boolean>(true);
  const [estimate, setEstimate] = useState<InsuranceEstimate | null>(null);
  const [notes, setNotes] = useState<string>("");
  const [savedQuotes, setSavedQuotes] = useState<SavedQuote[]>([]);
  const [showHistory, setShowHistory] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

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

  // Load saved quotes on mount
  useEffect(() => {
    if (user) {
      loadSavedQuotes();
    }
  }, [user]);

  const loadSavedQuotes = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('insurance_quotes')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSavedQuotes(data || []);
    } catch (error) {
      console.error('Error loading quotes:', error);
    } finally {
      setIsLoading(false);
    }
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

  const saveQuote = async () => {
    if (!user || !estimate) {
      toast.error("Please calculate an estimate first and ensure you're logged in");
      return;
    }

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('insurance_quotes')
        .insert({
          user_id: user.id,
          business_type: businessType,
          vehicle_count: vehicleCount,
          coverage_amount: coverageAmount,
          has_claims_history: hasClaimsHistory,
          include_passenger_liability: includePassengerLiability,
          annual_premium_min: estimate.minAnnual,
          annual_premium_max: estimate.maxAnnual,
          monthly_premium_min: estimate.minMonthly,
          monthly_premium_max: estimate.maxMonthly,
          risk_level: estimate.riskLevel,
          notes: notes || null,
          is_active: true,
          quote_date: new Date().toISOString().split('T')[0]
        });

      if (error) throw error;
      
      toast.success("Quote saved successfully!");
      setNotes("");
      loadSavedQuotes();
    } catch (error) {
      console.error('Error saving quote:', error);
      toast.error("Failed to save quote");
    } finally {
      setIsSaving(false);
    }
  };

  const deleteQuote = async (quoteId: string) => {
    try {
      const { error } = await supabase
        .from('insurance_quotes')
        .delete()
        .eq('id', quoteId);

      if (error) throw error;
      
      toast.success("Quote deleted");
      loadSavedQuotes();
    } catch (error) {
      console.error('Error deleting quote:', error);
      toast.error("Failed to delete quote");
    }
  };

  const loadQuoteToCalculator = (quote: SavedQuote) => {
    setBusinessType(quote.business_type);
    setVehicleCount(quote.vehicle_count);
    setCoverageAmount(quote.coverage_amount);
    setHasClaimsHistory(quote.has_claims_history);
    setIncludePassengerLiability(quote.include_passenger_liability);
    setNotes(quote.notes || "");
    setEstimate({
      minAnnual: Number(quote.annual_premium_min),
      maxAnnual: Number(quote.annual_premium_max),
      minMonthly: Number(quote.monthly_premium_min),
      maxMonthly: Number(quote.monthly_premium_max),
      coverageLevel: COVERAGE_MULTIPLIERS[quote.coverage_amount as keyof typeof COVERAGE_MULTIPLIERS]?.label || "R5 Million",
      riskLevel: quote.risk_level
    });
    setShowHistory(false);
    toast.success("Quote loaded into calculator");
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

  const getBusinessTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      "e-hailing": "E-Hailing",
      "metered-taxi": "Metered Taxi",
      "minibus-taxi": "Minibus Taxi",
      "shuttle": "Shuttle Service"
    };
    return labels[type] || type;
  };

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <div className="flex items-center justify-between">
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
          {user && savedQuotes.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowHistory(!showHistory)}
            >
              <History className="h-4 w-4 mr-2" />
              {showHistory ? "Hide History" : `View History (${savedQuotes.length})`}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Saved Quotes History */}
        {showHistory && savedQuotes.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium flex items-center gap-2">
              <History className="h-4 w-4" />
              Saved Quotes
            </h4>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {savedQuotes.map((quote) => (
                <div
                  key={quote.id}
                  className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">
                        {getBusinessTypeLabel(quote.business_type)}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {quote.vehicle_count} vehicle{quote.vehicle_count > 1 ? 's' : ''}
                      </Badge>
                      {getRiskBadge(quote.risk_level)}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                      <Calendar className="h-3 w-3" />
                      {format(new Date(quote.created_at), 'dd MMM yyyy')}
                      <span>•</span>
                      <span className="text-primary font-medium">
                        {formatCurrency(Number(quote.annual_premium_min))} - {formatCurrency(Number(quote.annual_premium_max))}/year
                      </span>
                    </div>
                    {quote.notes && (
                      <p className="text-xs text-muted-foreground mt-1 truncate max-w-xs">
                        {quote.notes}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => loadQuoteToCalculator(quote)}
                    >
                      Load
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteQuote(quote.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            <Separator />
          </div>
        )}

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

              {/* Save Quote Section */}
              {user && (
                <div className="space-y-3 p-4 bg-muted/30 rounded-lg border">
                  <h5 className="font-medium flex items-center gap-2">
                    <Save className="h-4 w-4" />
                    Save This Quote
                  </h5>
                  <Textarea
                    placeholder="Add notes about this quote (e.g., insurer name, policy details, comparison notes)..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="min-h-[80px]"
                  />
                  <Button 
                    onClick={saveQuote} 
                    disabled={isSaving}
                    className="w-full"
                    variant="secondary"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {isSaving ? "Saving..." : "Save Quote for Tracking"}
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    Save quotes to track and compare over time. Useful for claims history and renewals.
                  </p>
                </div>
              )}

              {!user && (
                <div className="text-center p-4 bg-muted/30 rounded-lg border">
                  <p className="text-sm text-muted-foreground">
                    Sign in to save and track your insurance quotes over time
                  </p>
                </div>
              )}

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
