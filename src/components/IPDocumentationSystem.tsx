import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { 
  FileText, 
  Shield, 
  Copyright, 
  Award, 
  Eye, 
  Download, 
  Plus,
  Search,
  Calendar,
  AlertTriangle
} from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface Innovation {
  id: string;
  title: string;
  description: string;
  type: 'patent' | 'trademark' | 'copyright' | 'design' | 'trade_secret';
  category: string;
  priority: 'high' | 'medium' | 'low';
  status: 'draft' | 'documented' | 'filed' | 'granted';
  dateCreated: string;
  inventors: string[];
  tags: string[];
  technicalDetails: string;
  marketValue: string;
  competitiveAdvantage: string;
}

export const IPDocumentationSystem = () => {
  const { toast } = useToast();
  const [innovations, setInnovations] = useState<Innovation[]>([
    {
      id: "IP001",
      title: "AI-Powered Incident Detection System",
      description: "Computer vision system that automatically detects accidents, fights, and suspicious activities from taxi camera feeds using machine learning algorithms.",
      type: "patent",
      category: "Safety Technology",
      priority: "high",
      status: "documented",
      dateCreated: "2024-12-01",
      inventors: ["System Developer"],
      tags: ["AI", "Computer Vision", "Safety", "Real-time"],
      technicalDetails: "Uses YOLO v8 object detection with custom training on taxi-specific incidents. Processes 30fps video streams with 95% accuracy.",
      marketValue: "Multi-million rand potential across transport industry",
      competitiveAdvantage: "First in SA market with taxi-specific AI incident detection"
    },
    {
      id: "IP002", 
      title: "Automatic License Plate Recognition (ALPR)",
      description: "Real-time license plate detection and recognition system integrated with law enforcement databases for instant violation detection.",
      type: "patent",
      category: "Traffic Management",
      priority: "high", 
      status: "draft",
      dateCreated: "2024-12-01",
      inventors: ["System Developer"],
      tags: ["ALPR", "OCR", "Traffic", "Law Enforcement"],
      technicalDetails: "Custom OCR trained on SA license plates with 98% accuracy in various lighting conditions.",
      marketValue: "Government contract potential R50M+",
      competitiveAdvantage: "SA-specific plate recognition with real-time enforcement integration"
    },
    {
      id: "IP003",
      title: "MojaRide Brand & Logo",
      description: "Public-facing brand identity for the MojaRide passenger app, part of the TaxiConnect platform by MobilityOne.",
      type: "trademark",
      category: "Branding",
      priority: "high",
      status: "draft",
      dateCreated: "2024-12-01",
      inventors: ["System Developer"],
      tags: ["Brand", "Logo", "Identity", "MojaRide", "TaxiConnect"],
      technicalDetails: "Unique visual identity with cultural relevance to SA taxi industry",
      marketValue: "Brand protection and licensing opportunities",
      competitiveAdvantage: "First mover advantage in SA taxi tech branding"
    },
    {
      id: "IP004",
      title: "TaxiConnect Platform",
      description: "Primary technology platform brand for compliant e-hailing services across South Africa.",
      type: "trademark",
      category: "Branding",
      priority: "high",
      status: "draft",
      dateCreated: "2024-12-01",
      inventors: ["System Developer"],
      tags: ["Brand", "Platform", "TaxiConnect"],
      technicalDetails: "B2B and operational platform branding",
      marketValue: "Platform licensing and white-label opportunities",
      competitiveAdvantage: "Established platform brand for taxi industry digitization"
    },
    {
      id: "IP005",
      title: "MobilityOne Corporate Identity",
      description: "Holding company brand for MobilityOne Pty Ltd, the parent entity of TaxiConnect and MojaRide.",
      type: "trademark",
      category: "Corporate",
      priority: "high",
      status: "filed",
      dateCreated: "2024-12-01",
      inventors: ["System Developer"],
      tags: ["Corporate", "MobilityOne", "Holding Company"],
      technicalDetails: "CIPC registration in progress",
      marketValue: "Corporate structure and investor relations",
      competitiveAdvantage: "Professional corporate structure for investment"
    }
  ]);

  const [newInnovation, setNewInnovation] = useState<Partial<Innovation>>({
    type: 'patent',
    priority: 'medium',
    status: 'draft',
    inventors: [],
    tags: []
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");

  const filteredInnovations = innovations.filter(innovation => {
    const matchesSearch = innovation.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         innovation.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         innovation.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = filterType === "all" || innovation.type === filterType;
    return matchesSearch && matchesType;
  });

  const addInnovation = () => {
    if (!newInnovation.title || !newInnovation.description) {
      toast({
        title: "Missing Information",
        description: "Please provide at least a title and description.",
        variant: "destructive"
      });
      return;
    }

    const innovation: Innovation = {
      id: `IP${String(innovations.length + 1).padStart(3, '0')}`,
      title: newInnovation.title!,
      description: newInnovation.description!,
      type: newInnovation.type as Innovation['type'],
      category: newInnovation.category || "General",
      priority: newInnovation.priority as Innovation['priority'],
      status: 'draft',
      dateCreated: new Date().toISOString().split('T')[0],
      inventors: newInnovation.inventors || [],
      tags: newInnovation.tags || [],
      technicalDetails: newInnovation.technicalDetails || "",
      marketValue: newInnovation.marketValue || "",
      competitiveAdvantage: newInnovation.competitiveAdvantage || ""
    };

    setInnovations([...innovations, innovation]);
    setNewInnovation({
      type: 'patent',
      priority: 'medium', 
      status: 'draft',
      inventors: [],
      tags: []
    });

    toast({
      title: "Innovation Added",
      description: `${innovation.title} has been documented for IP protection.`,
    });
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'patent': return <Shield className="h-4 w-4" />;
      case 'trademark': return <Award className="h-4 w-4" />;
      case 'copyright': return <Copyright className="h-4 w-4" />;
      case 'design': return <Eye className="h-4 w-4" />;
      case 'trade_secret': return <FileText className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      draft: "outline",
      documented: "default", 
      filed: "secondary",
      granted: "default"
    } as const;
    
    const colors = {
      draft: "text-muted-foreground",
      documented: "text-warning", 
      filed: "text-primary",
      granted: "text-success"
    } as const;

    return (
      <Badge variant={variants[status as keyof typeof variants]} className={colors[status as keyof typeof colors]}>
        {status.toUpperCase()}
      </Badge>
    );
  };

  const generateCIPCReport = () => {
    toast({
      title: "CIPC Report Generated",
      description: "IP documentation report ready for submission to CIPC.",
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="mr-2 h-5 w-5" />
            Intellectual Property Documentation System
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Document and manage your innovations for CIPC registration and IP protection
          </p>
        </CardHeader>
      </Card>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="innovations">Innovations</TabsTrigger>
          <TabsTrigger value="add-new">Add New</TabsTrigger>
          <TabsTrigger value="cipc-prep">CIPC Prep</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="border-primary/20">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-primary">{innovations.filter(i => i.type === 'patent').length}</div>
                <p className="text-xs text-muted-foreground">Patent Applications</p>
              </CardContent>
            </Card>
            <Card className="border-tuk-orange/20">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-tuk-orange">{innovations.filter(i => i.type === 'trademark').length}</div>
                <p className="text-xs text-muted-foreground">Trademarks</p>
              </CardContent>
            </Card>
            <Card className="border-success/20">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-success">{innovations.filter(i => i.status === 'documented').length}</div>
                <p className="text-xs text-muted-foreground">Ready to File</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Priority Innovations for CIPC Filing</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {innovations.filter(i => i.priority === 'high').map((innovation) => (
                  <div key={innovation.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <div className="flex items-center space-x-3">
                      {getTypeIcon(innovation.type)}
                      <div>
                        <div className="font-medium">{innovation.title}</div>
                        <p className="text-sm text-muted-foreground">{innovation.category}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getStatusBadge(innovation.status)}
                      <Badge variant="destructive">HIGH PRIORITY</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="innovations" className="space-y-6">
          <div className="flex space-x-4 mb-4">
            <div className="flex-1">
              <Input
                placeholder="Search innovations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="patent">Patents</SelectItem>
                <SelectItem value="trademark">Trademarks</SelectItem>
                <SelectItem value="copyright">Copyright</SelectItem>
                <SelectItem value="design">Design</SelectItem>
                <SelectItem value="trade_secret">Trade Secrets</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-4">
            {filteredInnovations.map((innovation) => (
              <Card key={innovation.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-2">
                      {getTypeIcon(innovation.type)}
                      <div>
                        <CardTitle className="text-lg">{innovation.title}</CardTitle>
                        <p className="text-sm text-muted-foreground">{innovation.id} • {innovation.category}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getStatusBadge(innovation.status)}
                      <Badge variant={innovation.priority === 'high' ? 'destructive' : innovation.priority === 'medium' ? 'default' : 'outline'}>
                        {innovation.priority.toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm mb-3">{innovation.description}</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div>
                      <Label className="font-medium">Technical Details:</Label>
                      <p className="text-muted-foreground mt-1">{innovation.technicalDetails || "Not specified"}</p>
                    </div>
                    <div>
                      <Label className="font-medium">Market Value:</Label>
                      <p className="text-muted-foreground mt-1">{innovation.marketValue || "Not specified"}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-3">
                    {innovation.tags.map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="add-new" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Plus className="mr-2 h-5 w-5" />
                Document New Innovation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Innovation Title *</Label>
                  <Input
                    placeholder="e.g., AI-Powered Safety System"
                    value={newInnovation.title || ""}
                    onChange={(e) => setNewInnovation({...newInnovation, title: e.target.value})}
                  />
                </div>
                <div>
                  <Label>Category</Label>
                  <Input
                    placeholder="e.g., Safety Technology"
                    value={newInnovation.category || ""}
                    onChange={(e) => setNewInnovation({...newInnovation, category: e.target.value})}
                  />
                </div>
                <div>
                  <Label>IP Type</Label>
                  <Select value={newInnovation.type} onValueChange={(value) => setNewInnovation({...newInnovation, type: value as Innovation['type']})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="patent">Patent</SelectItem>
                      <SelectItem value="trademark">Trademark</SelectItem>
                      <SelectItem value="copyright">Copyright</SelectItem>
                      <SelectItem value="design">Design Registration</SelectItem>
                      <SelectItem value="trade_secret">Trade Secret</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Priority</Label>
                  <Select value={newInnovation.priority} onValueChange={(value) => setNewInnovation({...newInnovation, priority: value as Innovation['priority']})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>Description *</Label>
                <Textarea
                  placeholder="Describe your innovation in detail..."
                  value={newInnovation.description || ""}
                  onChange={(e) => setNewInnovation({...newInnovation, description: e.target.value})}
                  rows={3}
                />
              </div>

              <div>
                <Label>Technical Details</Label>
                <Textarea
                  placeholder="Technical specifications, algorithms, unique features..."
                  value={newInnovation.technicalDetails || ""}
                  onChange={(e) => setNewInnovation({...newInnovation, technicalDetails: e.target.value})}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Market Value</Label>
                  <Textarea
                    placeholder="Potential market value, revenue opportunities..."
                    value={newInnovation.marketValue || ""}
                    onChange={(e) => setNewInnovation({...newInnovation, marketValue: e.target.value})}
                    rows={2}
                  />
                </div>
                <div>
                  <Label>Competitive Advantage</Label>
                  <Textarea
                    placeholder="What makes this unique in the market..."
                    value={newInnovation.competitiveAdvantage || ""}
                    onChange={(e) => setNewInnovation({...newInnovation, competitiveAdvantage: e.target.value})}
                    rows={2}
                  />
                </div>
              </div>

              <div>
                <Label>Tags (comma-separated)</Label>
                <Input
                  placeholder="AI, Safety, Real-time, Computer Vision"
                  onChange={(e) => setNewInnovation({...newInnovation, tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean)})}
                />
              </div>

              <Button onClick={addInnovation} className="w-full">
                <Plus className="mr-2 h-4 w-4" />
                Document Innovation
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cipc-prep" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <AlertTriangle className="mr-2 h-5 w-5" />
                CIPC Preparation Checklist
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-3">Patents Ready for Filing:</h4>
                    <div className="space-y-2">
                      {innovations.filter(i => i.type === 'patent' && (i.status === 'documented' || i.priority === 'high')).map(innovation => (
                        <div key={innovation.id} className="flex items-center justify-between p-2 bg-muted/30 rounded">
                          <span className="text-sm">{innovation.title}</span>
                          <Badge variant="outline">{innovation.id}</Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-3">Trademarks Ready for Filing:</h4>
                    <div className="space-y-2">
                      {innovations.filter(i => i.type === 'trademark').map(innovation => (
                        <div key={innovation.id} className="flex items-center justify-between p-2 bg-muted/30 rounded">
                          <span className="text-sm">{innovation.title}</span>
                          <Badge variant="outline">{innovation.id}</Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-medium mb-3">Required Actions:</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-warning rounded-full"></div>
                      <span>Conduct prior art search for patent applications</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-warning rounded-full"></div>
                      <span>Prepare detailed technical drawings and specifications</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-warning rounded-full"></div>
                      <span>Complete CIPC forms and fee calculations</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                      <span>Engage patent attorney for complex applications</span>
                    </div>
                  </div>
                </div>

                <div className="flex space-x-4 pt-4">
                  <Button onClick={generateCIPCReport} className="flex-1">
                    <Download className="mr-2 h-4 w-4" />
                    Generate CIPC Report
                  </Button>
                  <Button variant="outline" className="flex-1">
                    <Calendar className="mr-2 h-4 w-4" />
                    Schedule Filing
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Estimated Filing Costs (CIPC)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Patent Applications (2):</span>
                    <span className="font-medium">R1,200</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Trademark Registration (1):</span>
                    <span className="font-medium">R890</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Professional Fees:</span>
                    <span className="font-medium">R15,000</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-lg font-bold border-t pt-2">
                    <span>Total Estimated:</span>
                    <span>R17,090</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Fees subject to CIPC updates. Professional attorney recommended for patents.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};