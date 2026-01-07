import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { Car, Users, MapPin, ExternalLink, Filter } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface FleetVehicle {
  id: string;
  e_number: string;
  registration: string;
  province: string | null;
  owner_name: string;
  driver_name: string | null;
  status: string | null;
  notes: string | null;
  whatsapp_group_link: string | null;
  created_at: string;
}

const FleetVehiclesDashboard = () => {
  const [vehicles, setVehicles] = useState<FleetVehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOwner, setSelectedOwner] = useState<string>("all");
  const { toast } = useToast();

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      const { data, error } = await supabase
        .from("fleet_vehicles")
        .select("*")
        .order("owner_name", { ascending: true });

      if (error) throw error;
      setVehicles(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load fleet vehicles",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const owners = [...new Set(vehicles.map((v) => v.owner_name))].sort();
  
  const filteredVehicles = selectedOwner === "all" 
    ? vehicles 
    : vehicles.filter((v) => v.owner_name === selectedOwner);

  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Active</Badge>;
      case "pending":
        return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">Pending</Badge>;
      case "inactive":
        return <Badge className="bg-red-500/20 text-red-400 border-red-500/30">Inactive</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const whatsappLink = vehicles[0]?.whatsapp_group_link;

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">
              Driver's Licence Initiative Fleet
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage and track all vehicles in the initiative
            </p>
          </div>
          {whatsappLink && (
            <Button 
              variant="outline" 
              className="gap-2"
              onClick={() => window.open(whatsappLink, "_blank")}
            >
              <ExternalLink className="h-4 w-4" />
              Join WhatsApp Group
            </Button>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Car className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{vehicles.length}</p>
                  <p className="text-xs text-muted-foreground">Total Vehicles</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500/10 rounded-lg">
                  <Users className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{owners.length}</p>
                  <p className="text-xs text-muted-foreground">Owners</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <Car className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {vehicles.filter((v) => v.status === "active").length}
                  </p>
                  <p className="text-xs text-muted-foreground">Active</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-500/10 rounded-lg">
                  <MapPin className="h-5 w-5 text-yellow-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {[...new Set(vehicles.map((v) => v.province).filter(Boolean))].length}
                  </p>
                  <p className="text-xs text-muted-foreground">Provinces</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filter and Table */}
        <Card>
          <CardHeader className="pb-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Fleet Vehicles
              </CardTitle>
              <Select value={selectedOwner} onValueChange={setSelectedOwner}>
                <SelectTrigger className="w-full sm:w-[250px]">
                  <SelectValue placeholder="Filter by owner" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Owners ({vehicles.length})</SelectItem>
                  {owners.map((owner) => (
                    <SelectItem key={owner} value={owner}>
                      {owner} ({vehicles.filter((v) => v.owner_name === owner).length})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>E-Number</TableHead>
                    <TableHead>Registration</TableHead>
                    <TableHead className="hidden md:table-cell">Province</TableHead>
                    <TableHead>Owner</TableHead>
                    <TableHead className="hidden sm:table-cell">Driver</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredVehicles.map((vehicle) => (
                    <TableRow key={vehicle.id}>
                      <TableCell className="font-medium">{vehicle.e_number}</TableCell>
                      <TableCell>{vehicle.registration}</TableCell>
                      <TableCell className="hidden md:table-cell">
                        {vehicle.province || "—"}
                      </TableCell>
                      <TableCell>{vehicle.owner_name}</TableCell>
                      <TableCell className="hidden sm:table-cell">
                        {vehicle.driver_name || "—"}
                      </TableCell>
                      <TableCell>{getStatusBadge(vehicle.status)}</TableCell>
                    </TableRow>
                  ))}
                  {filteredVehicles.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        No vehicles found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FleetVehiclesDashboard;
