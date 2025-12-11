import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  ClipboardCheck, 
  FileText, 
  Car, 
  Shield,
  CheckCircle2,
  XCircle,
  Clock,
  Edit,
  Search
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface DriverRegistration {
  id: string;
  first_name: string;
  last_name: string;
  id_number: string | null;
  drivers_license_number: string | null;
  pdp_number: string | null;
  registration_status: string;
  created_at: string;
}

interface ChecklistStatus {
  hasLicense: boolean;
  hasPDP: boolean;
  hasContract: boolean;
  hasIdVerified: boolean;
}

const getChecklistStatus = (driver: DriverRegistration): ChecklistStatus => ({
  hasLicense: !!driver.drivers_license_number,
  hasPDP: !!driver.pdp_number,
  hasContract: driver.registration_status === 'approved' || driver.registration_status === 'active',
  hasIdVerified: !!driver.id_number && driver.id_number.length === 13,
});

const getCompletionPercentage = (status: ChecklistStatus): number => {
  const items = [status.hasLicense, status.hasPDP, status.hasContract, status.hasIdVerified];
  return (items.filter(Boolean).length / items.length) * 100;
};

const StatusIcon = ({ completed }: { completed: boolean }) => (
  completed ? (
    <CheckCircle2 className="h-4 w-4 text-green-600" />
  ) : (
    <XCircle className="h-4 w-4 text-muted-foreground" />
  )
);

export const DriverOnboardingChecklist = () => {
  const { toast } = useToast();
  const [drivers, setDrivers] = useState<DriverRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingDriver, setEditingDriver] = useState<DriverRegistration | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    fetchDrivers();
  }, []);

  const fetchDrivers = async () => {
    try {
      const { data, error } = await supabase
        .from("user_registrations")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setDrivers(data || []);
    } catch (error) {
      console.error("Error fetching drivers:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateDriver = async () => {
    if (!editingDriver) return;

    try {
      const { error } = await supabase
        .from("user_registrations")
        .update({
          drivers_license_number: editingDriver.drivers_license_number,
          pdp_number: editingDriver.pdp_number,
          registration_status: editingDriver.registration_status,
        })
        .eq("id", editingDriver.id);

      if (error) throw error;

      toast({
        title: "Driver Updated",
        description: `${editingDriver.first_name} ${editingDriver.last_name}'s details have been updated.`,
      });

      setDialogOpen(false);
      setEditingDriver(null);
      fetchDrivers();
    } catch (error: any) {
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const filteredDrivers = drivers.filter(d =>
    `${d.first_name} ${d.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.id_number?.includes(searchTerm)
  );

  // Summary stats
  const totalDrivers = drivers.length;
  const fullyCompliant = drivers.filter(d => {
    const status = getChecklistStatus(d);
    return status.hasLicense && status.hasPDP && status.hasContract && status.hasIdVerified;
  }).length;
  const needsLicense = drivers.filter(d => !d.drivers_license_number).length;
  const needsPDP = drivers.filter(d => !d.pdp_number).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-purple-500/30 bg-gradient-to-r from-purple-500/5 to-purple-500/10">
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-purple-500/20">
                <ClipboardCheck className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <CardTitle className="text-2xl">Driver Onboarding Checklist</CardTitle>
                <CardDescription>
                  Track PDP, license, and contract status for all drivers
                </CardDescription>
              </div>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search drivers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 w-[250px]"
              />
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Car className="h-4 w-4" />
              <span className="text-sm">Total Drivers</span>
            </div>
            <p className="text-2xl font-bold">{totalDrivers}</p>
          </CardContent>
        </Card>

        <Card className="bg-green-500/10 border-green-500/30">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-green-600 mb-1">
              <CheckCircle2 className="h-4 w-4" />
              <span className="text-sm">Fully Compliant</span>
            </div>
            <p className="text-2xl font-bold text-green-600">{fullyCompliant}</p>
          </CardContent>
        </Card>

        <Card className="bg-orange-500/10 border-orange-500/30">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-orange-600 mb-1">
              <FileText className="h-4 w-4" />
              <span className="text-sm">Needs License</span>
            </div>
            <p className="text-2xl font-bold text-orange-600">{needsLicense}</p>
          </CardContent>
        </Card>

        <Card className="bg-orange-500/10 border-orange-500/30">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-orange-600 mb-1">
              <Shield className="h-4 w-4" />
              <span className="text-sm">Needs PDP</span>
            </div>
            <p className="text-2xl font-bold text-orange-600">{needsPDP}</p>
          </CardContent>
        </Card>
      </div>

      {/* Driver List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Driver Compliance Status</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-muted-foreground">Loading drivers...</p>
          ) : filteredDrivers.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              {searchTerm ? "No drivers match your search." : "No drivers registered yet."}
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Driver</TableHead>
                  <TableHead className="text-center">ID Verified</TableHead>
                  <TableHead className="text-center">License</TableHead>
                  <TableHead className="text-center">PDP</TableHead>
                  <TableHead className="text-center">Contract</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead className="text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDrivers.map((driver) => {
                  const status = getChecklistStatus(driver);
                  const progress = getCompletionPercentage(status);

                  return (
                    <TableRow key={driver.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{driver.first_name} {driver.last_name}</p>
                          <p className="text-xs text-muted-foreground">
                            {driver.id_number ? `ID: ${driver.id_number.slice(0, 6)}...` : "No ID"}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <StatusIcon completed={status.hasIdVerified} />
                      </TableCell>
                      <TableCell className="text-center">
                        <StatusIcon completed={status.hasLicense} />
                      </TableCell>
                      <TableCell className="text-center">
                        <StatusIcon completed={status.hasPDP} />
                      </TableCell>
                      <TableCell className="text-center">
                        <StatusIcon completed={status.hasContract} />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress value={progress} className="w-[60px] h-2" />
                          <span className="text-xs text-muted-foreground">{progress.toFixed(0)}%</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <Dialog open={dialogOpen && editingDriver?.id === driver.id} onOpenChange={(open) => {
                          setDialogOpen(open);
                          if (!open) setEditingDriver(null);
                        }}>
                          <DialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setEditingDriver(driver)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Update Driver Documents</DialogTitle>
                            </DialogHeader>
                            {editingDriver && (
                              <div className="space-y-4">
                                <div className="p-3 bg-muted rounded-lg">
                                  <p className="font-medium">{editingDriver.first_name} {editingDriver.last_name}</p>
                                  <p className="text-sm text-muted-foreground">ID: {editingDriver.id_number}</p>
                                </div>

                                <div className="space-y-2">
                                  <Label>Driver's License Number</Label>
                                  <Input
                                    value={editingDriver.drivers_license_number || ""}
                                    onChange={(e) => setEditingDriver({
                                      ...editingDriver,
                                      drivers_license_number: e.target.value || null,
                                    })}
                                    placeholder="Enter license number"
                                  />
                                </div>

                                <div className="space-y-2">
                                  <Label>PDP Number</Label>
                                  <Input
                                    value={editingDriver.pdp_number || ""}
                                    onChange={(e) => setEditingDriver({
                                      ...editingDriver,
                                      pdp_number: e.target.value || null,
                                    })}
                                    placeholder="Professional Driving Permit"
                                  />
                                </div>

                                <div className="space-y-2">
                                  <Label>Contract Status</Label>
                                  <div className="flex items-center gap-3">
                                    <Checkbox
                                      checked={editingDriver.registration_status === 'approved' || editingDriver.registration_status === 'active'}
                                      onCheckedChange={(checked) => setEditingDriver({
                                        ...editingDriver,
                                        registration_status: checked ? 'approved' : 'pending',
                                      })}
                                    />
                                    <span className="text-sm">Contract signed and approved</span>
                                  </div>
                                </div>

                                <Button onClick={handleUpdateDriver} className="w-full">
                                  Update Driver
                                </Button>
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Checklist Legend */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Compliance Requirements</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-4 gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-muted rounded-lg">
                <FileText className="h-4 w-4" />
              </div>
              <div>
                <p className="font-medium text-sm">ID Verification</p>
                <p className="text-xs text-muted-foreground">Valid 13-digit SA ID number</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="p-2 bg-muted rounded-lg">
                <Car className="h-4 w-4" />
              </div>
              <div>
                <p className="font-medium text-sm">Driver's License</p>
                <p className="text-xs text-muted-foreground">Valid Code B or higher</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="p-2 bg-muted rounded-lg">
                <Shield className="h-4 w-4" />
              </div>
              <div>
                <p className="font-medium text-sm">PDP</p>
                <p className="text-xs text-muted-foreground">Professional Driving Permit</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="p-2 bg-muted rounded-lg">
                <ClipboardCheck className="h-4 w-4" />
              </div>
              <div>
                <p className="font-medium text-sm">Employment Contract</p>
                <p className="text-xs text-muted-foreground">BCEA-compliant 60/40 contract</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
