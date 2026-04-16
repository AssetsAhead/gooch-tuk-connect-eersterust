import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Home, Briefcase, Star, Plus, Trash2, MapPin, Navigation } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SavedPlace {
  id: string;
  label: string;
  address: string;
  icon: 'home' | 'work' | 'custom';
}

const ICON_MAP = {
  home: Home,
  work: Briefcase,
  custom: Star,
};

const STORAGE_KEY = 'mojaride_saved_places';

interface SavedPlacesProps {
  userId?: string;
  onSelectPlace?: (address: string) => void;
  compact?: boolean;
}

export const SavedPlaces = ({ userId, onSelectPlace, compact = false }: SavedPlacesProps) => {
  const [places, setPlaces] = useState<SavedPlace[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newLabel, setNewLabel] = useState('');
  const [newAddress, setNewAddress] = useState('');
  const { toast } = useToast();

  const storageKey = `${STORAGE_KEY}:${userId || 'anon'}`;

  useEffect(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        setPlaces(JSON.parse(stored));
      } else {
        // Seed defaults
        const defaults: SavedPlace[] = [
          { id: '1', label: 'Home', address: '', icon: 'home' },
          { id: '2', label: 'Work', address: '', icon: 'work' },
        ];
        setPlaces(defaults);
        localStorage.setItem(storageKey, JSON.stringify(defaults));
      }
    } catch {}
  }, [storageKey]);

  const save = (updated: SavedPlace[]) => {
    setPlaces(updated);
    localStorage.setItem(storageKey, JSON.stringify(updated));
  };

  const handleAdd = () => {
    if (!newLabel.trim() || !newAddress.trim()) {
      toast({ title: 'Fill in both fields', variant: 'destructive' });
      return;
    }
    const place: SavedPlace = {
      id: crypto.randomUUID(),
      label: newLabel.trim(),
      address: newAddress.trim(),
      icon: 'custom',
    };
    save([...places, place]);
    setNewLabel('');
    setNewAddress('');
    setIsAdding(false);
    toast({ title: `📍 "${place.label}" saved!` });
  };

  const handleDelete = (id: string) => {
    save(places.filter((p) => p.id !== id));
  };

  const handleSetAddress = (id: string, address: string) => {
    save(places.map((p) => (p.id === id ? { ...p, address } : p)));
  };

  if (compact) {
    const filled = places.filter((p) => p.address);
    if (filled.length === 0) return null;
    return (
      <div className="flex gap-2 flex-wrap">
        {filled.map((place) => {
          const Icon = ICON_MAP[place.icon];
          return (
            <Badge
              key={place.id}
              variant="outline"
              className="cursor-pointer hover:bg-muted/60 transition-colors px-3 py-1.5 gap-1.5"
              onClick={() => onSelectPlace?.(place.address)}
            >
              <Icon className="h-3 w-3" />
              {place.label}
            </Badge>
          );
        })}
      </div>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <MapPin className="h-5 w-5 text-primary" />
            Saved Places
          </CardTitle>
          <Button size="sm" variant="ghost" onClick={() => setIsAdding((v) => !v)}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {places.map((place) => {
          const Icon = ICON_MAP[place.icon];
          return (
            <div
              key={place.id}
              className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors group"
            >
              <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Icon className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium">{place.label}</div>
                {place.address ? (
                  <button
                    className="text-xs text-muted-foreground truncate block w-full text-left hover:text-primary transition-colors"
                    onClick={() => onSelectPlace?.(place.address)}
                  >
                    {place.address}
                  </button>
                ) : (
                  <Input
                    placeholder={`Set your ${place.label.toLowerCase()} address`}
                    className="h-7 text-xs mt-1"
                    onBlur={(e) => {
                      if (e.target.value.trim()) {
                        handleSetAddress(place.id, e.target.value.trim());
                        toast({ title: `📍 ${place.label} address saved!` });
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
                    }}
                  />
                )}
              </div>
              {place.address && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="flex-shrink-0 h-8 w-8 p-0"
                  onClick={() => onSelectPlace?.(place.address)}
                >
                  <Navigation className="h-4 w-4 text-primary" />
                </Button>
              )}
              {place.icon === 'custom' && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="flex-shrink-0 h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => handleDelete(place.id)}
                >
                  <Trash2 className="h-3 w-3 text-destructive" />
                </Button>
              )}
            </div>
          );
        })}

        {isAdding && (
          <div className="p-3 rounded-lg border border-dashed border-primary/30 space-y-2">
            <Input
              placeholder="Label (e.g. Gym, Mom's house)"
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              className="h-8 text-sm"
            />
            <Input
              placeholder="Address"
              value={newAddress}
              onChange={(e) => setNewAddress(e.target.value)}
              className="h-8 text-sm"
            />
            <div className="flex gap-2">
              <Button size="sm" onClick={handleAdd} className="flex-1">Save</Button>
              <Button size="sm" variant="outline" onClick={() => setIsAdding(false)}>Cancel</Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
