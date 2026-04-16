import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calculator, MapPin, Navigation, Clock, TrendingUp } from 'lucide-react';
import { SmartLocationInput } from '@/components/SmartLocationInput';

// Known routes with fixed fares (Eersterust-centric)
const KNOWN_ROUTES: Record<string, { fare: number; distance: string; eta: string }> = {
  'eersterust|denlyn mall': { fare: 15, distance: '2.1 km', eta: '5 min' },
  'eersterust|pick n pay': { fare: 15, distance: '1.8 km', eta: '4 min' },
  'eersterust|municipal clinic': { fare: 15, distance: '1.5 km', eta: '5 min' },
  'eersterust|highlands park': { fare: 20, distance: '3.2 km', eta: '8 min' },
  'eersterust|mamelodi mall': { fare: 25, distance: '6.5 km', eta: '12 min' },
  'eersterust|silverton': { fare: 25, distance: '5.8 km', eta: '10 min' },
  'eersterust|hatfield': { fare: 35, distance: '12 km', eta: '18 min' },
  'eersterust|pretoria cbd': { fare: 35, distance: '14 km', eta: '20 min' },
  'eersterust|menlyn': { fare: 30, distance: '9 km', eta: '15 min' },
  'eersterust|wonderpark': { fare: 40, distance: '18 km', eta: '25 min' },
  'eersterust|centurion': { fare: 45, distance: '22 km', eta: '30 min' },
  'eersterust|7de laan': { fare: 10, distance: '0.8 km', eta: '3 min' },
  'eersterust|volga street': { fare: 10, distance: '0.5 km', eta: '2 min' },
};

// Fare zones
const ZONE_RATES = {
  inPoort: { base: 10, perKm: 3, label: 'In-Poort' },
  outPoort: { base: 15, perKm: 4, label: 'Out-Poort' },
  night: { base: 20, perKm: 5, label: 'Night' },
  nightOut: { base: 30, perKm: 6, label: 'Night Out' },
};

interface FareEstimatorProps {
  discountInfo?: { isVerified: boolean; discountPercentage: number };
  onSelectRoute?: (pickup: string, destination: string, fare: number) => void;
}

export const FareEstimator = ({ discountInfo, onSelectRoute }: FareEstimatorProps) => {
  const [fromLocation, setFromLocation] = useState('');
  const [toLocation, setToLocation] = useState('');

  const isNightTime = useMemo(() => {
    const hour = new Date().getHours();
    return hour >= 20 || hour < 6;
  }, []);

  const estimate = useMemo(() => {
    if (!fromLocation || !toLocation) return null;

    const from = fromLocation.toLowerCase().trim();
    const to = toLocation.toLowerCase().trim();

    // Check known routes (both directions)
    for (const [key, route] of Object.entries(KNOWN_ROUTES)) {
      const [a, b] = key.split('|');
      if ((from.includes(a) && to.includes(b)) || (from.includes(b) && to.includes(a))) {
        let fare = route.fare;
        if (isNightTime) fare = Math.round(fare * 1.5);
        return { ...route, fare, isKnownRoute: true };
      }
    }

    // Heuristic estimate based on text similarity
    const isInPoort = ['eersterust', '7de laan', 'volga', 'poort'].some(
      (w) => from.includes(w) && to.includes(w)
    );
    const zone = isNightTime
      ? isInPoort ? ZONE_RATES.night : ZONE_RATES.nightOut
      : isInPoort ? ZONE_RATES.inPoort : ZONE_RATES.outPoort;

    const estimatedKm = isInPoort ? Math.random() * 2 + 0.5 : Math.random() * 10 + 3;
    const fare = Math.round(zone.base + estimatedKm * zone.perKm);
    const eta = `${Math.round(estimatedKm * 2.5 + 2)} min`;

    return {
      fare,
      distance: `~${estimatedKm.toFixed(1)} km`,
      eta,
      isKnownRoute: false,
      zone: zone.label,
    };
  }, [fromLocation, toLocation, isNightTime]);

  const discountedFare = useMemo(() => {
    if (!estimate || !discountInfo?.isVerified) return null;
    return Math.round(estimate.fare * (1 - discountInfo.discountPercentage / 100));
  }, [estimate, discountInfo]);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Calculator className="h-5 w-5 text-primary" />
          Fare Estimator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-2">
          <SmartLocationInput
            placeholder="From where?"
            value={fromLocation}
            onChange={setFromLocation}
            storageKey="fare-from"
            quickSuggestions={['Eersterust', '7de Laan', 'Volga Street']}
          />
          <SmartLocationInput
            placeholder="Going to?"
            value={toLocation}
            onChange={setToLocation}
            storageKey="fare-to"
            quickSuggestions={['Denlyn Mall', 'Mamelodi Mall', 'Silverton']}
          />
        </div>

        {estimate && (
          <div
            className="p-4 bg-muted/50 rounded-xl space-y-3 cursor-pointer hover:bg-muted/70 transition-colors"
            onClick={() => onSelectRoute?.(fromLocation, toLocation, discountedFare ?? estimate.fare)}
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">Estimated Fare</span>
              <div className="flex items-center gap-2">
                {discountedFare != null && (
                  <span className="text-sm line-through text-muted-foreground">R{estimate.fare}</span>
                )}
                <span className="text-2xl font-bold text-primary">
                  R{discountedFare ?? estimate.fare}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><Navigation className="h-3 w-3" />{estimate.distance}</span>
              <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{estimate.eta}</span>
              {!estimate.isKnownRoute && 'zone' in estimate && (
                <Badge variant="outline" className="text-[10px]">{estimate.zone}</Badge>
              )}
              {isNightTime && <Badge variant="secondary" className="text-[10px]">🌙 Night rate</Badge>}
            </div>

            {discountInfo?.isVerified && (
              <Badge className="bg-success/20 text-success text-xs">
                🎫 {discountInfo.discountPercentage}% SASSA discount applied
              </Badge>
            )}

            {!estimate.isKnownRoute && (
              <p className="text-[10px] text-muted-foreground">
                * Estimate only — final fare set by driver
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
