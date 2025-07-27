import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Search, Calendar, DollarSign, User, MapPin, Clock } from "lucide-react";

interface Fine {
  id: string;
  officerId: string;
  officerName: string;
  driverName: string;
  driverIdNumber: string;
  violation: string;
  amount: number;
  location: string;
  timestamp: string;
  description: string;
  status: 'issued' | 'pending' | 'paid' | 'disputed';
  paymentDate?: string;
}

export const FineManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPeriod, setFilterPeriod] = useState<string>('all');

  // Mock data - in real app this comes from database
  const fines: Fine[] = [
    {
      id: "FINE1737832123456",
      officerId: "OFF123",
      officerName: "Constable Mthembu",
      driverName: "Sipho Dlamini",
      driverIdNumber: "8501015800083",
      violation: "speeding",
      amount: 1500,
      location: "R101 Silverton",
      timestamp: "2025-01-25T10:30:00Z",
      description: "Exceeded speed limit by 20km/h in residential area",
      status: "issued"
    },
    {
      id: "FINE1737832987654",
      officerId: "OFF124",
      officerName: "Sergeant Mokena",
      driverName: "Maria Santos",
      driverIdNumber: "7803125800089",
      violation: "no_permit",
      amount: 5000,
      location: "Mamelodi Mall Rank",
      timestamp: "2025-01-25T09:15:00Z",
      description: "Operating taxi without valid operating permit",
      status: "pending"
    },
    {
      id: "FINE1737831654321",
      officerId: "OFF123",
      officerName: "Constable Mthembu",
      driverName: "John Mokgosi",
      driverIdNumber: "9012125800084",
      violation: "overloading",
      amount: 2000,
      location: "Menlyn Shopping Centre",
      timestamp: "2025-01-24T16:45:00Z",
      description: "Carrying 18 passengers in 15-seater vehicle",
      status: "paid",
      paymentDate: "2025-01-25T08:00:00Z"
    },
    {
      id: "FINE1737830321987",
      officerId: "OFF125",
      officerName: "Inspector Nkomo",
      driverName: "Peter Mahlangu",
      driverIdNumber: "8806125800085",
      violation: "reckless",
      amount: 4000,
      location: "N1 Highway",
      timestamp: "2025-01-24T12:20:00Z",
      description: "Dangerous overtaking in heavy traffic",
      status: "disputed"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'issued': return 'default';
      case 'pending': return 'secondary';
      case 'paid': return 'outline';
      case 'disputed': return 'destructive';
      default: return 'default';
    }
  };

  const getStatusClassName = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-success text-white';
      case 'pending': return 'bg-warning text-white';
      case 'disputed': return 'bg-destructive text-white';
      default: return '';
    }
  };

  const getViolationLabel = (violation: string) => {
    const labels: Record<string, string> = {
      'speeding': 'Speeding',
      'no_license': 'No License',
      'no_permit': 'No Permit',
      'overloading': 'Overloading',
      'reckless': 'Reckless Driving',
      'unroadworthy': 'Unroadworthy Vehicle',
      'unlicensed_route': 'Unlicensed Route'
    };
    return labels[violation] || violation;
  };

  const filteredFines = fines.filter(fine => {
    const matchesSearch = 
      fine.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      fine.driverName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      fine.driverIdNumber.includes(searchTerm) ||
      fine.location.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || fine.status === filterStatus;
    
    const matchesPeriod = (() => {
      if (filterPeriod === 'all') return true;
      const fineDate = new Date(fine.timestamp);
      const now = new Date();
      
      switch (filterPeriod) {
        case 'today':
          return fineDate.toDateString() === now.toDateString();
        case 'week':
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          return fineDate >= weekAgo;
        case 'month':
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          return fineDate >= monthAgo;
        default:
          return true;
      }
    })();
    
    return matchesSearch && matchesStatus && matchesPeriod;
  });

  const totalAmount = filteredFines.reduce((sum, fine) => sum + fine.amount, 0);
  const paidAmount = filteredFines
    .filter(fine => fine.status === 'paid')
    .reduce((sum, fine) => sum + fine.amount, 0);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">{filteredFines.length}</div>
            <p className="text-xs text-muted-foreground">Total Fines</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-success">
              {filteredFines.filter(f => f.status === 'paid').length}
            </div>
            <p className="text-xs text-muted-foreground">Paid</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-warning">
              {filteredFines.filter(f => f.status === 'pending').length}
            </div>
            <p className="text-xs text-muted-foreground">Pending</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-destructive">
              {filteredFines.filter(f => f.status === 'disputed').length}
            </div>
            <p className="text-xs text-muted-foreground">Disputed</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="mr-2 h-5 w-5" />
            Fine Management System
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div className="md:col-span-2">
              <Input
                placeholder="Search by fine ID, driver name, ID number, or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="issued">Issued</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="disputed">Disputed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterPeriod} onValueChange={setFilterPeriod}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">Last 7 Days</SelectItem>
                <SelectItem value="month">Last 30 Days</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-between items-center text-sm text-muted-foreground">
            <span>Showing {filteredFines.length} fines</span>
            <span>Total: R{totalAmount.toLocaleString()} | Collected: R{paidAmount.toLocaleString()}</span>
          </div>
        </CardContent>
      </Card>

      {/* Fines List */}
      <Card>
        <CardContent className="p-0">
          <div className="space-y-0">
            {filteredFines.map((fine, index) => (
              <div 
                key={fine.id} 
                className={`p-4 border-b border-border/40 hover:bg-muted/30 transition-colors ${
                  index === filteredFines.length - 1 ? 'border-b-0' : ''
                }`}
              >
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
                  <div className="lg:col-span-3">
                    <div className="flex items-center space-x-2 mb-1">
                      <Badge variant="outline" className="text-xs">{fine.id}</Badge>
                      <Badge 
                        variant={getStatusColor(fine.status)}
                        className={`text-xs ${getStatusClassName(fine.status)}`}
                      >
                        {fine.status.toUpperCase()}
                      </Badge>
                    </div>
                    <p className="font-medium text-sm">{fine.driverName}</p>
                    <p className="text-xs text-muted-foreground">ID: {fine.driverIdNumber}</p>
                  </div>

                  <div className="lg:col-span-2">
                    <p className="font-medium text-sm">{getViolationLabel(fine.violation)}</p>
                    <p className="text-xs text-muted-foreground flex items-center">
                      <DollarSign className="w-3 h-3 mr-1" />
                      R{fine.amount.toLocaleString()}
                    </p>
                  </div>

                  <div className="lg:col-span-2">
                    <p className="text-sm flex items-center">
                      <MapPin className="w-3 h-3 mr-1" />
                      {fine.location}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Officer: {fine.officerName}
                    </p>
                  </div>

                  <div className="lg:col-span-2">
                    <p className="text-sm flex items-center">
                      <Clock className="w-3 h-3 mr-1" />
                      {new Date(fine.timestamp).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(fine.timestamp).toLocaleTimeString()}
                    </p>
                    {fine.paymentDate && (
                      <p className="text-xs text-success">
                        Paid: {new Date(fine.paymentDate).toLocaleDateString()}
                      </p>
                    )}
                  </div>

                  <div className="lg:col-span-2">
                    <p className="text-xs text-muted-foreground mb-2">
                      {fine.description}
                    </p>
                  </div>

                  <div className="lg:col-span-1 flex flex-col space-y-1">
                    <Button size="sm" variant="outline" className="text-xs">
                      View Details
                    </Button>
                    {fine.status === 'disputed' && (
                      <Button size="sm" variant="secondary" className="text-xs">
                        Review
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {filteredFines.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No fines found matching your criteria</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};