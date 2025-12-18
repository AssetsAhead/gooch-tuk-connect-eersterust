import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  FileText, 
  Building2, 
  Shield, 
  Truck,
  ExternalLink,
  CreditCard,
  Upload,
  Monitor
} from "lucide-react";
import { Link } from "react-router-dom";

interface ChecklistItem {
  id: string;
  title: string;
  description: string;
  status: 'complete' | 'in_progress' | 'pending';
  required: boolean;
  link?: string;
  externalLink?: string;
  category: 'registration' | 'documents' | 'platform' | 'submission';
}

const DOT_CHECKLIST: ChecklistItem[] = [
  // Registration Category
  {
    id: 'cipc',
    title: 'CIPC Company Registration',
    description: 'MobilityOne Pty Ltd (2025/958631/07)',
    status: 'complete',
    required: true,
    category: 'registration',
    externalLink: 'https://www.cipc.co.za'
  },
  {
    id: 'sars',
    title: 'SARS Tax Registration',
    description: 'Tax Reference: 9065004328',
    status: 'complete',
    required: true,
    category: 'registration'
  },
  {
    id: 'icasa',
    title: 'ICASA Equipment Certificate',
    description: 'Communications equipment certification',
    status: 'pending',
    required: true,
    category: 'registration',
    link: '/compliance'
  },
  
  // Documents Category
  {
    id: 'form9a',
    title: 'Form 9A Application',
    description: 'E-Hailing platform registration form',
    status: 'in_progress',
    required: true,
    category: 'documents',
    link: '/form-9a'
  },
  {
    id: 'insurance',
    title: 'Public Liability Insurance',
    description: 'Third-party insurance certificates',
    status: 'pending',
    required: true,
    category: 'documents'
  },
  {
    id: 'popia',
    title: 'POPIA Compliance Documentation',
    description: 'Data protection policy and consent forms',
    status: 'in_progress',
    required: true,
    category: 'documents',
    link: '/compliance'
  },
  {
    id: 'safety_policy',
    title: 'Safety & Compliance Policies',
    description: 'Driver safety procedures and compliance manual',
    status: 'in_progress',
    required: true,
    category: 'documents'
  },
  
  // Platform Category
  {
    id: 'platform_demo',
    title: 'Platform Live Demo Ready',
    description: 'Working app demonstration for DOT review',
    status: 'in_progress',
    required: true,
    category: 'platform',
    link: '/'
  },
  {
    id: 'vehicle_registry',
    title: 'Vehicle Registry System',
    description: 'System to track registered vehicles on platform',
    status: 'complete',
    required: true,
    category: 'platform',
    link: '/business-portal'
  },
  {
    id: 'driver_onboarding',
    title: 'Driver Onboarding System',
    description: 'PDP verification and driver registration flow',
    status: 'complete',
    required: true,
    category: 'platform',
    link: '/business-portal'
  },
  {
    id: 'criminal_declaration',
    title: 'Criminal Declaration System',
    description: 'Driver criminal record declaration workflow',
    status: 'complete',
    required: true,
    category: 'platform'
  },
  {
    id: 'driver_ratings',
    title: 'Driver Rating System',
    description: 'Passenger feedback and rating mechanism',
    status: 'complete',
    required: true,
    category: 'platform'
  },
  
  // Submission Category
  {
    id: 'payment',
    title: 'Application Fee Payment',
    description: 'Pay to ABSA Account: 4053620095',
    status: 'pending',
    required: true,
    category: 'submission'
  },
  {
    id: 'nptr_submission',
    title: 'NPTR Submission',
    description: 'Submit to National Public Transport Regulator',
    status: 'pending',
    required: true,
    category: 'submission'
  },
  {
    id: 'gazette_period',
    title: 'Gazette Publication Period',
    description: '21-day public comment period',
    status: 'pending',
    required: true,
    category: 'submission'
  },
  {
    id: 'live_demo',
    title: 'DOT Live App Demo',
    description: 'In-person platform demonstration',
    status: 'pending',
    required: true,
    category: 'submission'
  }
];

export function DOTApplicationChecklist() {
  const [checklist, setChecklist] = useState(DOT_CHECKLIST);

  const toggleStatus = (id: string) => {
    setChecklist(prev => prev.map(item => {
      if (item.id === id) {
        const newStatus = item.status === 'complete' ? 'pending' : 'complete';
        return { ...item, status: newStatus };
      }
      return item;
    }));
  };

  const getStatusIcon = (status: ChecklistItem['status']) => {
    switch (status) {
      case 'complete':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'in_progress':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getCategoryIcon = (category: ChecklistItem['category']) => {
    switch (category) {
      case 'registration':
        return <Building2 className="h-4 w-4" />;
      case 'documents':
        return <FileText className="h-4 w-4" />;
      case 'platform':
        return <Monitor className="h-4 w-4" />;
      case 'submission':
        return <Upload className="h-4 w-4" />;
    }
  };

  const categories = [
    { key: 'registration', label: 'Company Registration', icon: Building2 },
    { key: 'documents', label: 'Required Documents', icon: FileText },
    { key: 'platform', label: 'Platform Requirements', icon: Monitor },
    { key: 'submission', label: 'Submission Process', icon: Upload }
  ];

  const completedCount = checklist.filter(item => item.status === 'complete').length;
  const totalCount = checklist.length;
  const progressPercent = Math.round((completedCount / totalCount) * 100);

  return (
    <div className="space-y-6">
      {/* Progress Overview */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Truck className="h-6 w-6 text-primary" />
              <div>
                <CardTitle>DOT E-Hailing Application Checklist</CardTitle>
                <CardDescription>Track your progress toward permit approval</CardDescription>
              </div>
            </div>
            <Badge variant={progressPercent === 100 ? "default" : "secondary"} className="text-lg px-3 py-1">
              {completedCount}/{totalCount}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Overall Progress</span>
              <span className="font-medium">{progressPercent}%</span>
            </div>
            <Progress value={progressPercent} className="h-3" />
          </div>
          
          {/* Category Progress */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
            {categories.map(cat => {
              const items = checklist.filter(i => i.category === cat.key);
              const done = items.filter(i => i.status === 'complete').length;
              return (
                <div key={cat.key} className="text-center p-2 rounded-lg bg-muted/50">
                  <cat.icon className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">{cat.label}</p>
                  <p className="font-semibold">{done}/{items.length}</p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Checklist by Category */}
      {categories.map(cat => (
        <Card key={cat.key}>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <cat.icon className="h-5 w-5" />
              {cat.label}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {checklist
                .filter(item => item.category === cat.key)
                .map(item => (
                  <div 
                    key={item.id} 
                    className={`flex items-start gap-3 p-3 rounded-lg border transition-colors ${
                      item.status === 'complete' ? 'bg-green-500/5 border-green-500/20' : 
                      item.status === 'in_progress' ? 'bg-yellow-500/5 border-yellow-500/20' : 
                      'bg-muted/30'
                    }`}
                  >
                    <Checkbox 
                      checked={item.status === 'complete'}
                      onCheckedChange={() => toggleStatus(item.id)}
                      className="mt-1"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className={`font-medium ${item.status === 'complete' ? 'line-through text-muted-foreground' : ''}`}>
                          {item.title}
                        </p>
                        {item.required && (
                          <Badge variant="outline" className="text-xs">Required</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {item.link && (
                        <Button variant="ghost" size="sm" asChild>
                          <Link to={item.link}>
                            <ExternalLink className="h-4 w-4" />
                          </Link>
                        </Button>
                      )}
                      {item.externalLink && (
                        <Button variant="ghost" size="sm" asChild>
                          <a href={item.externalLink} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </Button>
                      )}
                      {getStatusIcon(item.status)}
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Payment Reminder */}
      <Card className="border-primary/50 bg-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Payment Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-background p-4 rounded-lg border">
            <p className="text-sm text-muted-foreground mb-3">
              Application fee must be deposited to the following account:
            </p>
            <div className="grid gap-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Bank:</span>
                <span className="font-medium">ABSA</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Account Number:</span>
                <span className="font-mono font-medium">4053620095</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Reference:</span>
                <span className="font-medium">MobilityOne - Form 9A</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
