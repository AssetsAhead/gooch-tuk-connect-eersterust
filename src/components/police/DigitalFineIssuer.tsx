import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { FileText, User, Car, AlertTriangle, CheckCircle, Clock, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface DriverRecord {
  id: string;
  name: string;
  idNumber: string;
  licenseNumber: string;
  licenseExpiry: string;
  criminalHistory: {
    hasRecords: boolean;
    summary: string;
    lastIncident: string;
  };
  vehicleHistory: {
    violations: number;
    lastViolation: string;
  };
}

interface Fine {
  id: string;
  officerId: string;
  driverInfo: DriverRecord;
  violation: string;
  amount: number;
  location: string;
  timestamp: string;
  description: string;
  status: 'issued' | 'pending' | 'paid';
}

export const DigitalFineIssuer = () => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [driverRecord, setDriverRecord] = useState<DriverRecord | null>(null);
  const [loading, setLoading] = useState(false);
  const [fineForm, setFineForm] = useState({
    violation: '',
    amount: '',
    location: '',
    description: ''
  });

  // Mock driver lookup (in real app, this would call national database)
  const lookupDriver = async (query: string) => {
    setLoading(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Mock data - in real app this comes from national system
    const mockRecord: DriverRecord = {
      id: "SA123456789",
      name: "Thabo Mthembu",
      idNumber: "8401015800083",
      licenseNumber: "GP123456789",
      licenseExpiry: "2026-03-15",
      criminalHistory: {
        hasRecords: true,
        summary: "2 traffic violations, 1 minor offense",
        lastIncident: "2024-08-15"
      },
      vehicleHistory: {
        violations: 3,
        lastViolation: "2024-09-20"
      }
    };
    
    setDriverRecord(mockRecord);
    setLoading(false);
    
    toast({
      title: "Driver record found",
      description: `Retrieved record for ${mockRecord.name}`,
    });
  };

  const issueFine = async () => {
    if (!driverRecord || !fineForm.violation || !fineForm.amount) {
      toast({
        title: "Missing information",
        description: "Please complete all required fields",
        variant: "destructive",
      });
      return;
    }

    const fine: Fine = {
      id: `FINE${Date.now()}`,
      officerId: "OFF123", // Would come from authenticated user
      driverInfo: driverRecord,
      violation: fineForm.violation,
      amount: parseFloat(fineForm.amount),
      location: fineForm.location,
      timestamp: new Date().toISOString(),
      description: fineForm.description,
      status: 'issued'
    };

    // In real app, this would save to database and possibly SMS the driver
    console.log('Fine issued:', fine);
    
    toast({
      title: "Fine issued successfully",
      description: `Fine #${fine.id} issued to ${driverRecord.name}`,
    });

    // Reset form
    setDriverRecord(null);
    setSearchQuery('');
    setFineForm({
      violation: '',
      amount: '',
      location: '',
      description: ''
    });
  };

  const violationTypes = [
    { value: "speeding", label: "Speeding", amount: "1500" },
    { value: "no_license", label: "Driving without license", amount: "3000" },
    { value: "unroadworthy", label: "Unroadworthy vehicle", amount: "2500" },
    { value: "overloading", label: "Overloading passengers", amount: "2000" },
    { value: "no_permit", label: "Operating without permit", amount: "5000" },
    { value: "reckless", label: "Reckless driving", amount: "4000" },
    { value: "unlicensed_route", label: "Operating on unlicensed route", amount: "3500" },
    { value: "other", label: "Other violation", amount: "" }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Search className="mr-2 h-5 w-5" />
            Driver & Criminal History Lookup
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex space-x-2">
            <Input
              placeholder="Enter ID number, license number, or vehicle registration"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1"
            />
            <Button 
              onClick={() => lookupDriver(searchQuery)}
              disabled={loading || !searchQuery}
              className="bg-primary hover:bg-primary/90"
            >
              {loading ? (
                <>
                  <Clock className="mr-2 h-4 w-4 animate-spin" />
                  Searching...
                </>
              ) : (
                <>
                  <Search className="mr-2 h-4 w-4" />
                  Lookup
                </>
              )}
            </Button>
          </div>

          {driverRecord && (
            <Card className="border-primary/20">
              <CardContent className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold flex items-center mb-2">
                      <User className="mr-2 h-4 w-4" />
                      Driver Information
                    </h4>
                    <div className="space-y-1 text-sm">
                      <p><strong>Name:</strong> {driverRecord.name}</p>
                      <p><strong>ID Number:</strong> {driverRecord.idNumber}</p>
                      <p><strong>License:</strong> {driverRecord.licenseNumber}</p>
                      <p><strong>Expires:</strong> {driverRecord.licenseExpiry}</p>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold flex items-center mb-2">
                      <AlertTriangle className="mr-2 h-4 w-4" />
                      Criminal History
                    </h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex items-center space-x-2">
                        <Badge variant={driverRecord.criminalHistory.hasRecords ? "destructive" : "outline"}>
                          {driverRecord.criminalHistory.hasRecords ? "Has Records" : "Clean"}
                        </Badge>
                      </div>
                      {driverRecord.criminalHistory.hasRecords && (
                        <>
                          <p><strong>Summary:</strong> {driverRecord.criminalHistory.summary}</p>
                          <p><strong>Last Incident:</strong> {driverRecord.criminalHistory.lastIncident}</p>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                
                <Separator className="my-4" />
                
                <div>
                  <h4 className="font-semibold flex items-center mb-2">
                    <Car className="mr-2 h-4 w-4" />
                    Traffic Violation History
                  </h4>
                  <div className="text-sm">
                    <p><strong>Total Violations:</strong> {driverRecord.vehicleHistory.violations}</p>
                    <p><strong>Last Violation:</strong> {driverRecord.vehicleHistory.lastViolation}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>

      {driverRecord && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="mr-2 h-5 w-5" />
              Issue Digital Fine
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="violation">Violation Type</Label>
                <Select
                  value={fineForm.violation}
                  onValueChange={(value) => {
                    const violation = violationTypes.find(v => v.value === value);
                    setFineForm(prev => ({
                      ...prev,
                      violation: value,
                      amount: violation?.amount || ''
                    }));
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select violation type" />
                  </SelectTrigger>
                  <SelectContent>
                    {violationTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label} {type.amount && `(R${type.amount})`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">Fine Amount (R)</Label>
                <Input
                  id="amount"
                  type="number"
                  value={fineForm.amount}
                  onChange={(e) => setFineForm(prev => ({ ...prev, amount: e.target.value }))}
                  placeholder="Enter fine amount"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={fineForm.location}
                onChange={(e) => setFineForm(prev => ({ ...prev, location: e.target.value }))}
                placeholder="Enter location where violation occurred"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={fineForm.description}
                onChange={(e) => setFineForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe the violation details..."
                rows={3}
              />
            </div>

            <div className="flex space-x-4 pt-4">
              <Button
                onClick={issueFine}
                className="flex-1 bg-primary hover:bg-primary/90"
              >
                <FileText className="mr-2 h-4 w-4" />
                Issue Fine
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setDriverRecord(null);
                  setSearchQuery('');
                  setFineForm({
                    violation: '',
                    amount: '',
                    location: '',
                    description: ''
                  });
                }}
                className="flex-1"
              >
                Clear Form
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};