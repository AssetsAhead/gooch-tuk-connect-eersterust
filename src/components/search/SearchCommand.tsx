import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Search, FileText, Users, Car, CreditCard, Shield, Home, MapPin, Building, BarChart, Zap, Globe, Heart, Briefcase, Scale, DollarSign, Bell, Lock } from "lucide-react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { ALL_SEARCHABLE_ITEMS, SearchableItem } from "./searchRoutes";

type UserRole = 'admin' | 'owner' | 'driver' | 'passenger' | 'marshall' | 'police';

interface SearchCommandProps {
  role: UserRole;
}

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  'Navigation': <Home className="h-4 w-4" />,
  'Dashboards': <BarChart className="h-4 w-4" />,
  'SASSA & Social Grants': <Heart className="h-4 w-4" />,
  'Business': <Briefcase className="h-4 w-4" />,
  'Community': <Shield className="h-4 w-4" />,
  'Growth': <Users className="h-4 w-4" />,
  'Compliance': <Scale className="h-4 w-4" />,
  'Fleet': <Car className="h-4 w-4" />,
  'Investor': <Building className="h-4 w-4" />,
  'Finance': <DollarSign className="h-4 w-4" />,
  'Payments': <CreditCard className="h-4 w-4" />,
  'Account': <Lock className="h-4 w-4" />,
  'Legal': <FileText className="h-4 w-4" />,
  'Safety': <Shield className="h-4 w-4" />,
  'Features': <Zap className="h-4 w-4" />,
};

function scoreMatch(item: SearchableItem, query: string): number {
  const q = query.toLowerCase();
  let score = 0;
  if (item.title.toLowerCase().includes(q)) score += 10;
  if (item.title.toLowerCase().startsWith(q)) score += 5;
  if (item.subtitle.toLowerCase().includes(q)) score += 6;
  if (item.path.toLowerCase().includes(q)) score += 8; // path match is strong
  if (item.category.toLowerCase().includes(q)) score += 3;
  for (const kw of item.keywords) {
    if (kw.includes(q)) score += 4;
    if (kw.startsWith(q)) score += 2;
  }
  return score;
}

export const SearchCommand = ({ role }: SearchCommandProps) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [dataResults, setDataResults] = useState<{ id: string; title: string; subtitle: string; type: string; action: () => void }[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  // Keyboard shortcut
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  // Filter & rank items based on query
  const filteredItems = useMemo(() => {
    if (!query) return ALL_SEARCHABLE_ITEMS;
    return ALL_SEARCHABLE_ITEMS
      .map((item) => ({ item, score: scoreMatch(item, query) }))
      .filter(({ score }) => score > 0)
      .sort((a, b) => b.score - a.score)
      .map(({ item }) => item);
  }, [query]);

  // Group by category
  const grouped = useMemo(() => {
    const groups: Record<string, SearchableItem[]> = {};
    for (const item of filteredItems) {
      if (!groups[item.category]) groups[item.category] = [];
      groups[item.category].push(item);
    }
    return groups;
  }, [filteredItems]);

  // Search data (users, vehicles) for admin/owner roles
  const searchData = useCallback(async (searchQuery: string) => {
    if (!searchQuery || searchQuery.length < 2 || !['admin', 'owner'].includes(role)) {
      setDataResults([]);
      return;
    }
    setLoading(true);
    try {
      const items: typeof dataResults = [];

      if (role === 'admin') {
        const { data: users } = await supabase
          .from('profiles')
          .select('user_id, display_name')
          .ilike('display_name', `%${searchQuery}%`)
          .limit(5);
        users?.forEach((u) => {
          items.push({
            id: `user-${u.user_id}`,
            title: u.display_name || 'Unknown User',
            subtitle: 'User profile',
            type: 'user',
            action: () => setOpen(false),
          });
        });
      }

      const { data: vehicles } = await supabase
        .from('fleet_vehicles')
        .select('id, registration, e_number, owner_name, driver_name')
        .or(`registration.ilike.%${searchQuery}%,e_number.ilike.%${searchQuery}%,owner_name.ilike.%${searchQuery}%`)
        .limit(5);
      vehicles?.forEach((v) => {
        items.push({
          id: `vehicle-${v.id}`,
          title: `${v.registration} (${v.e_number})`,
          subtitle: `Owner: ${v.owner_name}${v.driver_name ? ` • Driver: ${v.driver_name}` : ''}`,
          type: 'vehicle',
          action: () => { setOpen(false); navigate('/fleet-vehicles'); },
        });
      });

      setDataResults(items);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  }, [role, navigate]);

  // Debounced data search
  useEffect(() => {
    const timer = setTimeout(() => searchData(query), 300);
    return () => clearTimeout(timer);
  }, [query, searchData]);

  return (
    <>
      <Button
        variant="outline"
        className="relative h-9 w-full justify-start rounded-md bg-muted/50 text-sm text-muted-foreground sm:w-64"
        onClick={() => setOpen(true)}
      >
        <Search className="mr-2 h-4 w-4" />
        <span className="hidden sm:inline-flex">Search...</span>
        <span className="sm:hidden">Search</span>
        <kbd className="pointer-events-none absolute right-1.5 top-1.5 hidden h-6 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-xs font-medium opacity-100 sm:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput
          placeholder="Search pages, features, routes, vehicles..."
          value={query}
          onValueChange={setQuery}
        />
        <CommandList className="max-h-[420px]">
          <CommandEmpty>
            {loading ? "Searching..." : "No results found."}
          </CommandEmpty>

          {Object.entries(grouped).map(([category, items]) => (
            <CommandGroup key={category} heading={category}>
              {items.map((item) => (
                <CommandItem
                  key={item.id}
                  value={`${item.title} ${item.subtitle} ${item.keywords.join(' ')}`}
                  onSelect={() => {
                    navigate(item.path);
                    setOpen(false);
                  }}
                >
                  {CATEGORY_ICONS[item.category] || <Globe className="h-4 w-4" />}
                  <div className="ml-2 flex-1">
                    <div className="font-medium">{item.title}</div>
                    <div className="text-xs text-muted-foreground">{item.subtitle}</div>
                  </div>
                  <Badge variant="outline" className="ml-2 text-xs shrink-0">
                    {item.path}
                  </Badge>
                </CommandItem>
              ))}
            </CommandGroup>
          ))}

          {dataResults.length > 0 && (
            <>
              <CommandSeparator />
              <CommandGroup heading="Database Results">
                {dataResults.map((result) => (
                  <CommandItem
                    key={result.id}
                    onSelect={() => {
                      result.action();
                      setOpen(false);
                    }}
                  >
                    {result.type === 'user' ? <Users className="h-4 w-4" /> : <Car className="h-4 w-4" />}
                    <div className="ml-2 flex-1">
                      <div className="font-medium">{result.title}</div>
                      <div className="text-xs text-muted-foreground">{result.subtitle}</div>
                    </div>
                    <Badge variant="secondary" className="ml-2 text-xs">
                      {result.type}
                    </Badge>
                  </CommandItem>
                ))}
              </CommandGroup>
            </>
          )}
        </CommandList>
      </CommandDialog>
    </>
  );
};
