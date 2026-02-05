import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Search, FileText, Users, Car, CreditCard, Settings, Home, Shield, MapPin, Building, BarChart } from "lucide-react";
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

type UserRole = 'admin' | 'owner' | 'driver' | 'passenger' | 'marshall' | 'police';

interface SearchResult {
  id: string;
  title: string;
  subtitle?: string;
  type: 'page' | 'user' | 'vehicle' | 'transaction';
  icon: React.ReactNode;
  action: () => void;
}

interface SearchCommandProps {
  role: UserRole;
}

// Route definitions per role
const getRoutesForRole = (role: UserRole, navigate: ReturnType<typeof useNavigate>): SearchResult[] => {
  const commonRoutes: SearchResult[] = [
    { id: 'dashboard', title: 'Dashboard', subtitle: 'Your main dashboard', type: 'page', icon: <Home className="h-4 w-4" />, action: () => navigate('/dashboard') },
  ];

  const roleRoutes: Record<UserRole, SearchResult[]> = {
    admin: [
      { id: 'approvals', title: 'Pending Approvals', subtitle: 'Review driver and owner applications', type: 'page', icon: <Users className="h-4 w-4" />, action: () => navigate('/admin') },
      { id: 'role-requests', title: 'Role Requests', subtitle: 'Manage role upgrade requests', type: 'page', icon: <Shield className="h-4 w-4" />, action: () => navigate('/admin') },
      { id: 'analytics', title: 'Analytics Dashboard', subtitle: 'Platform metrics and insights', type: 'page', icon: <BarChart className="h-4 w-4" />, action: () => navigate('/admin') },
      { id: 'sassa', title: 'SASSA Verifications', subtitle: 'Review grant card verifications', type: 'page', icon: <Shield className="h-4 w-4" />, action: () => navigate('/admin/sassa-verifications') },
      { id: 'fleet-import', title: 'Fleet Data Import', subtitle: 'Bulk import vehicle data', type: 'page', icon: <Car className="h-4 w-4" />, action: () => navigate('/admin') },
      { id: 'fleet-vehicles', title: 'Fleet Vehicles Dashboard', subtitle: 'Manage all fleet vehicles', type: 'page', icon: <Car className="h-4 w-4" />, action: () => navigate('/fleet-vehicles') },
      { id: 'investor', title: 'Investor Portal', subtitle: 'R2M Proposal and pitch materials', type: 'page', icon: <Building className="h-4 w-4" />, action: () => navigate('/investor') },
      { id: 'compliance', title: 'Compliance Hub', subtitle: 'Regulatory requirements', type: 'page', icon: <FileText className="h-4 w-4" />, action: () => navigate('/compliance') },
      { id: 'community-safety', title: 'Community Safety Portal', subtitle: 'Safety network and alerts', type: 'page', icon: <Shield className="h-4 w-4" />, action: () => navigate('/community-safety') },
      { id: 'business-portal', title: 'Business Portal', subtitle: 'Business services hub', type: 'page', icon: <Building className="h-4 w-4" />, action: () => navigate('/business-portal') },
    ],
    owner: [
      { id: 'fleet', title: 'Fleet Management', subtitle: 'Manage your vehicles', type: 'page', icon: <Car className="h-4 w-4" />, action: () => navigate('/owner') },
      { id: 'drivers', title: 'My Drivers', subtitle: 'Driver assignments and performance', type: 'page', icon: <Users className="h-4 w-4" />, action: () => navigate('/owner') },
      { id: 'revenue', title: 'Revenue Tracking', subtitle: 'Earnings and payouts', type: 'page', icon: <CreditCard className="h-4 w-4" />, action: () => navigate('/owner') },
      { id: 'compliance', title: 'Compliance', subtitle: 'Vehicle documentation', type: 'page', icon: <FileText className="h-4 w-4" />, action: () => navigate('/compliance') },
    ],
    driver: [
      { id: 'rides', title: 'My Rides', subtitle: 'Active and completed trips', type: 'page', icon: <MapPin className="h-4 w-4" />, action: () => navigate('/driver') },
      { id: 'earnings', title: 'Earnings', subtitle: 'Daily and weekly income', type: 'page', icon: <CreditCard className="h-4 w-4" />, action: () => navigate('/driver') },
      { id: 'queue', title: 'Queue Status', subtitle: 'Rank queue position', type: 'page', icon: <Users className="h-4 w-4" />, action: () => navigate('/driver') },
    ],
    passenger: [
      { id: 'book', title: 'Book a Ride', subtitle: 'Request a new trip', type: 'page', icon: <Car className="h-4 w-4" />, action: () => navigate('/passenger') },
      { id: 'history', title: 'Ride History', subtitle: 'Past trips', type: 'page', icon: <FileText className="h-4 w-4" />, action: () => navigate('/passenger') },
      { id: 'sassa', title: 'SASSA Discount', subtitle: 'Verify grant for discounts', type: 'page', icon: <Shield className="h-4 w-4" />, action: () => navigate('/passenger') },
    ],
    marshall: [
      { id: 'queue', title: 'Queue Management', subtitle: 'Manage rank queue', type: 'page', icon: <Users className="h-4 w-4" />, action: () => navigate('/marshall') },
      { id: 'vehicles', title: 'Vehicle Log', subtitle: 'Track departures', type: 'page', icon: <Car className="h-4 w-4" />, action: () => navigate('/marshall') },
      { id: 'incidents', title: 'Incident Reports', subtitle: 'Log and track issues', type: 'page', icon: <Shield className="h-4 w-4" />, action: () => navigate('/marshall') },
    ],
    police: [
      { id: 'flagged', title: 'Flagged Vehicles', subtitle: 'Vehicles under review', type: 'page', icon: <Car className="h-4 w-4" />, action: () => navigate('/police') },
      { id: 'incidents', title: 'Active Incidents', subtitle: 'Current investigations', type: 'page', icon: <Shield className="h-4 w-4" />, action: () => navigate('/police') },
      { id: 'fines', title: 'Fine Management', subtitle: 'Issue and track fines', type: 'page', icon: <FileText className="h-4 w-4" />, action: () => navigate('/police') },
    ],
  };

  return [...commonRoutes, ...(roleRoutes[role] || [])];
};

export const SearchCommand = ({ role }: SearchCommandProps) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [dataResults, setDataResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  const routes = getRoutesForRole(role, navigate);

  // Keyboard shortcut
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  // Filter routes based on query
  useEffect(() => {
    if (!query) {
      setResults(routes);
      return;
    }
    const filtered = routes.filter(
      (r) =>
        r.title.toLowerCase().includes(query.toLowerCase()) ||
        r.subtitle?.toLowerCase().includes(query.toLowerCase())
    );
    setResults(filtered);
  }, [query, routes]);

  // Search data (users, vehicles, etc.) for admin/owner roles
  const searchData = useCallback(async (searchQuery: string) => {
    if (!searchQuery || searchQuery.length < 2) {
      setDataResults([]);
      return;
    }

    if (!['admin', 'owner'].includes(role)) {
      return;
    }

    setLoading(true);
    try {
      const dataItems: SearchResult[] = [];

      // Search users (admin only)
      if (role === 'admin') {
        const { data: users } = await supabase
          .from('profiles')
          .select('user_id, display_name')
          .ilike('display_name', `%${searchQuery}%`)
          .limit(5);

        users?.forEach((u) => {
          dataItems.push({
            id: `user-${u.user_id}`,
            title: u.display_name || 'Unknown User',
            subtitle: 'User profile',
            type: 'user',
            icon: <Users className="h-4 w-4" />,
            action: () => {
              setOpen(false);
              // Could navigate to user profile in future
            },
          });
        });
      }

      // Search vehicles (admin and owner)
      const { data: vehicles } = await supabase
        .from('fleet_vehicles')
        .select('id, registration, e_number, owner_name, driver_name')
        .or(`registration.ilike.%${searchQuery}%,e_number.ilike.%${searchQuery}%,owner_name.ilike.%${searchQuery}%`)
        .limit(5);

      vehicles?.forEach((v) => {
        dataItems.push({
          id: `vehicle-${v.id}`,
          title: `${v.registration} (${v.e_number})`,
          subtitle: `Owner: ${v.owner_name}${v.driver_name ? ` • Driver: ${v.driver_name}` : ''}`,
          type: 'vehicle',
          icon: <Car className="h-4 w-4" />,
          action: () => {
            setOpen(false);
            navigate('/fleet-vehicles');
          },
        });
      });

      setDataResults(dataItems);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  }, [role, navigate]);

  // Debounced data search
  useEffect(() => {
    const timer = setTimeout(() => {
      searchData(query);
    }, 300);
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
          placeholder="Search pages, users, vehicles..."
          value={query}
          onValueChange={setQuery}
        />
        <CommandList>
          <CommandEmpty>
            {loading ? "Searching..." : "No results found."}
          </CommandEmpty>

          {results.length > 0 && (
            <CommandGroup heading="Pages">
              {results.map((result) => (
                <CommandItem
                  key={result.id}
                  onSelect={() => {
                    result.action();
                    setOpen(false);
                  }}
                >
                  {result.icon}
                  <div className="ml-2 flex-1">
                    <div className="font-medium">{result.title}</div>
                    {result.subtitle && (
                      <div className="text-xs text-muted-foreground">{result.subtitle}</div>
                    )}
                  </div>
                  <Badge variant="outline" className="ml-2 text-xs">
                    {result.type}
                  </Badge>
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {dataResults.length > 0 && (
            <>
              <CommandSeparator />
              <CommandGroup heading="Data">
                {dataResults.map((result) => (
                  <CommandItem
                    key={result.id}
                    onSelect={() => {
                      result.action();
                      setOpen(false);
                    }}
                  >
                    {result.icon}
                    <div className="ml-2 flex-1">
                      <div className="font-medium">{result.title}</div>
                      {result.subtitle && (
                        <div className="text-xs text-muted-foreground">{result.subtitle}</div>
                      )}
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
