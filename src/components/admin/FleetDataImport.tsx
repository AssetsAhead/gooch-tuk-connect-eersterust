import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Upload, Check, AlertCircle, Truck } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const FLEET_DATA = [
  // Roechdeen Adams fleet
  { registration: 'KN66CH GP', route: 'E11', owner: 'Roechdeen Adams', driver: 'Ruwane Keppler' },
  { registration: 'LX65 GP', route: 'E12', owner: 'Roechdeen Adams', driver: 'Elrico Olifant' },
  { registration: 'MD05LM GP', route: 'E106', owner: 'Roechdeen Adams', driver: 'Marlon Davids' },
  { registration: 'MJ26CX GP', route: 'E55', owner: 'Roechdeen Adams', driver: 'Rezaak Daniels' },
  { registration: 'MK86MC GP', route: 'E53', owner: 'Roechdeen Adams', driver: 'Damien De Boer' },
  { registration: 'MD05LB GP', route: 'E105', owner: 'Roechdeen Adams', driver: 'Jonathan Prinsloo' },
  // Lloyd Pieters fleet
  { registration: 'LC97TZ GP', route: 'E153', owner: 'Lloyd Pieters', driver: 'Jayvandrey Vyfers', color: 'Yellow', driverIdNumber: '0411045090080' },
  { registration: 'LC97TY GP', route: 'E154', owner: 'Lloyd Pieters', driver: 'David Makhwanya', color: 'Black', driverIdNumber: '8509295199089' },
  // Dillan fleet
  { registration: 'LT48CW GP', route: 'E51', owner: 'Dillan', driver: 'Mathew Drywer' },
  { registration: 'LC70JM GP', route: 'E50', owner: 'Dillan', driver: 'Francois Kekana' },
  // MK Nkale (Oom Koos) fleet
  { registration: 'KP17RZ GP', route: 'E240', owner: 'MK Nkale (Oom Koos)', driver: 'Tainos Ndhlela' },
  // Gershom Mac Pherson (Owner/Driver)
  { registration: 'KN83MY GP', route: 'E221', owner: 'Gershom Mac Pherson', driver: 'Gershom Mac Pherson' },
  // Maligan Jeftha fleet
  { registration: 'JF64XB GP', route: 'E88', owner: 'Maligan Jeftha', driver: 'Rodney' },
  { registration: 'HP00DJ GP', route: 'E87', owner: 'Maligan Jeftha', driver: 'Joffrey' },
  { registration: 'JL78MZ GP', route: 'E85', owner: 'Maligan Jeftha', driver: 'Nehemiah Student' },
  // NS Mabusha fleet
  { registration: 'KJ99NV GP', route: 'E123', owner: 'NS Mabusha', driver: 'Temba' },
  { registration: 'KM13RH GP', route: 'E135', owner: 'NS Mabusha', driver: 'Owen' },
  { registration: 'KW47LW GP', route: 'E267', owner: 'NS Mabusha', driver: 'Challas' },
  { registration: 'LH16BM GP', route: 'E81', owner: 'NS Mabusha', driver: 'Mathew' },
  { registration: 'LP40YP GP', route: 'E299', owner: 'NS Mabusha', driver: '' },
  { registration: 'MR86MH GP', route: 'E261', owner: 'NS Mabusha', driver: '' },
] as const;

const FleetDataImport: React.FC = () => {
  const [importing, setImporting] = useState(false);
  const [imported, setImported] = useState<string[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const { toast } = useToast();

  const importFleetData = async () => {
    setImporting(true);
    setImported([]);
    setErrors([]);

    for (const vehicle of FLEET_DATA) {
      try {
        let notes = `Owner: ${vehicle.owner}`;
        if (vehicle.driver) notes += ` | Driver: ${vehicle.driver}`;
        if ('color' in vehicle && vehicle.color) notes += ` | Color: ${vehicle.color}`;
        if ('driverIdNumber' in vehicle && vehicle.driverIdNumber) notes += ` | Driver ID: ${vehicle.driverIdNumber}`;

        const { error } = await supabase
          .from('vehicles')
          .insert({
            registration_number: vehicle.registration,
            route_number: vehicle.route,
            vehicle_type: 'tuk_tuk',
            color: 'color' in vehicle ? vehicle.color : null,
            notes: notes,
            status: 'active'
          });

        if (error) {
          if (error.code === '23505') {
            setErrors(prev => [...prev, `${vehicle.registration} already exists`]);
          } else {
            setErrors(prev => [...prev, `${vehicle.registration}: ${error.message}`]);
          }
        } else {
          setImported(prev => [...prev, vehicle.registration]);
        }
      } catch (err) {
        setErrors(prev => [...prev, `${vehicle.registration}: Failed to import`]);
      }
    }

    setImporting(false);
    toast({
      title: "Import Complete",
      description: `${imported.length} vehicles imported, ${errors.length} errors`,
    });
  };

  const uniqueOwners = [...new Set(FLEET_DATA.map(v => v.owner))];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Truck className="h-5 w-5" />
          Driver Licence Initiative - Fleet Import
        </CardTitle>
        <CardDescription>
          Import {FLEET_DATA.length} vehicles from {uniqueOwners.length} owners
          <br />
          <span className="text-xs text-muted-foreground mt-1 block">
            Cllr Debbie Williams (PA) - SALGA Regulatory Compliance Initiative
          </span>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Owner Summary */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
          {uniqueOwners.map(owner => {
            const count = FLEET_DATA.filter(v => v.owner === owner).length;
            return (
              <Badge key={owner} variant="outline" className="justify-between py-2">
                <span className="truncate">{owner}</span>
                <span className="ml-2 font-bold">{count}</span>
              </Badge>
            );
          })}
        </div>

        {/* Import Button */}
        <Button 
          onClick={importFleetData} 
          disabled={importing}
          className="w-full"
        >
          <Upload className="h-4 w-4 mr-2" />
          {importing ? 'Importing...' : `Import ${FLEET_DATA.length} Vehicles`}
        </Button>

        {/* Results */}
        {imported.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium flex items-center gap-2 text-green-600">
              <Check className="h-4 w-4" />
              Successfully Imported ({imported.length})
            </h4>
            <div className="flex flex-wrap gap-1">
              {imported.map(reg => (
                <Badge key={reg} variant="secondary" className="text-xs">
                  {reg}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {errors.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium flex items-center gap-2 text-destructive">
              <AlertCircle className="h-4 w-4" />
              Errors ({errors.length})
            </h4>
            <div className="text-sm text-muted-foreground space-y-1">
              {errors.map((err, i) => (
                <p key={i}>{err}</p>
              ))}
            </div>
          </div>
        )}

        {/* Preview Table */}
        <div className="border rounded-lg overflow-hidden">
          <div className="max-h-64 overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted sticky top-0">
                <tr>
                  <th className="px-3 py-2 text-left">Route</th>
                  <th className="px-3 py-2 text-left">Registration</th>
                  <th className="px-3 py-2 text-left">Owner</th>
                  <th className="px-3 py-2 text-left">Driver</th>
                </tr>
              </thead>
              <tbody>
                {FLEET_DATA.map((v, i) => (
                  <tr key={i} className="border-t">
                    <td className="px-3 py-2 font-mono">{v.route}</td>
                    <td className="px-3 py-2">{v.registration}</td>
                    <td className="px-3 py-2">{v.owner}</td>
                    <td className="px-3 py-2 text-muted-foreground">{v.driver || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FleetDataImport;
