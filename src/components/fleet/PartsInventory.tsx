import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Phone, Package, Search, Filter, Wrench } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

interface Part {
  id: string;
  part_name: string;
  part_number: string | null;
  category: string | null;
  price_rands: number;
  stock_quantity: number;
  vehicle_type: string;
  supplier: {
    name: string;
    phone: string | null;
  } | null;
}

interface Supplier {
  id: string;
  name: string;
  phone: string | null;
  notes: string | null;
}

export const PartsInventory = () => {
  const [parts, setParts] = useState<Part[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const { toast } = useToast();

  const categories = [
    "all", "Body", "Brakes", "Cables", "Clutch", "Drivetrain", 
    "Electrical", "Engine", "Filters", "Gaskets", "Hardware", 
    "Starter", "Suspension"
  ];

  useEffect(() => {
    fetchPartsAndSuppliers();
  }, []);

  const fetchPartsAndSuppliers = async () => {
    try {
      setLoading(true);
      
      // Fetch parts with supplier info
      const { data: partsData, error: partsError } = await supabase
        .from("parts_inventory")
        .select(`
          id,
          part_name,
          part_number,
          category,
          price_rands,
          stock_quantity,
          vehicle_type,
          supplier:parts_suppliers(name, phone)
        `)
        .order("category")
        .order("part_name");

      if (partsError) throw partsError;

      // Fetch suppliers
      const { data: suppliersData, error: suppliersError } = await supabase
        .from("parts_suppliers")
        .select("id, name, phone, notes")
        .eq("is_active", true);

      if (suppliersError) throw suppliersError;

      setParts(partsData || []);
      setSuppliers(suppliersData || []);
    } catch (error) {
      console.error("Error fetching parts:", error);
      toast({
        title: "Error",
        description: "Failed to load parts inventory",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredParts = parts.filter((part) => {
    const matchesSearch = part.part_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || part.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const totalValue = filteredParts.reduce((sum, part) => sum + Number(part.price_rands), 0);

  const getCategoryColor = (category: string | null) => {
    const colors: Record<string, string> = {
      Engine: "bg-red-500/10 text-red-600 border-red-500/20",
      Brakes: "bg-orange-500/10 text-orange-600 border-orange-500/20",
      Electrical: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
      Cables: "bg-green-500/10 text-green-600 border-green-500/20",
      Clutch: "bg-teal-500/10 text-teal-600 border-teal-500/20",
      Gaskets: "bg-blue-500/10 text-blue-600 border-blue-500/20",
      Drivetrain: "bg-indigo-500/10 text-indigo-600 border-indigo-500/20",
      Filters: "bg-purple-500/10 text-purple-600 border-purple-500/20",
      Hardware: "bg-pink-500/10 text-pink-600 border-pink-500/20",
      Body: "bg-gray-500/10 text-gray-600 border-gray-500/20",
      Starter: "bg-cyan-500/10 text-cyan-600 border-cyan-500/20",
      Suspension: "bg-amber-500/10 text-amber-600 border-amber-500/20",
    };
    return colors[category || ""] || "bg-muted text-muted-foreground";
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Supplier Contact Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {suppliers.map((supplier) => (
          <Card key={supplier.id} className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Package className="h-5 w-5 text-primary" />
                {supplier.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {supplier.phone && (
                <a 
                  href={`tel:${supplier.phone.replace(/\s/g, '')}`}
                  className="flex items-center gap-2 text-primary hover:underline"
                >
                  <Phone className="h-4 w-4" />
                  {supplier.phone}
                </a>
              )}
              {supplier.notes && (
                <p className="text-sm text-muted-foreground mt-2">{supplier.notes}</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters and Stats */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <CardTitle className="flex items-center gap-2">
              <Wrench className="h-6 w-6 text-primary" />
              Tuk Tuk Spares Catalog
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-lg px-3 py-1">
                {filteredParts.length} parts
              </Badge>
              <Badge className="text-lg px-3 py-1 bg-success">
                R{totalValue.toLocaleString()}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search parts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full md:w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat === "all" ? "All Categories" : cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Parts Table */}
          <div className="rounded-lg border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>Part Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Price (ZAR)</TableHead>
                  <TableHead>Supplier</TableHead>
                  <TableHead className="text-center">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredParts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      No parts found matching your search
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredParts.map((part) => (
                    <TableRow key={part.id} className="hover:bg-muted/30">
                      <TableCell className="font-medium">{part.part_name}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={getCategoryColor(part.category)}>
                          {part.category || "Uncategorized"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-mono font-semibold">
                        R{Number(part.price_rands).toLocaleString()}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {part.supplier?.name || "Unknown"}
                      </TableCell>
                      <TableCell className="text-center">
                        {part.supplier?.phone && (
                          <Button
                            variant="ghost"
                            size="sm"
                            asChild
                          >
                            <a href={`tel:${part.supplier.phone.replace(/\s/g, '')}`}>
                              <Phone className="h-4 w-4 mr-1" />
                              Call
                            </a>
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
