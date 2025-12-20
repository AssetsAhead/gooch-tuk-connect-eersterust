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
  AlertTriangle,
  Share2,
  MessageCircle,
  Mail,
  Printer
} from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

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
      title: "PoortLink Brand & Logo",
      description: "Local rollout brand identity for the PoortLink passenger app, part of the MobilityOne platform.",
      type: "trademark",
      category: "Branding",
      priority: "high",
      status: "draft",
      dateCreated: "2024-12-01",
      inventors: ["System Developer"],
      tags: ["Brand", "Logo", "Identity", "PoortLink", "MobilityOne"],
      technicalDetails: "Unique visual identity with cultural relevance to SA taxi industry",
      marketValue: "Brand protection and licensing opportunities",
      competitiveAdvantage: "First mover advantage in SA taxi tech branding"
    },
    {
      id: "IP004",
      title: "MobilityOne Platform",
      description: "Primary technology platform brand for compliant e-hailing services across South Africa.",
      type: "trademark",
      category: "Branding",
      priority: "high",
      status: "draft",
      dateCreated: "2024-12-01",
      inventors: ["System Developer"],
      tags: ["Brand", "Platform", "MobilityOne"],
      technicalDetails: "B2B and operational platform branding",
      marketValue: "Platform licensing and white-label opportunities",
      competitiveAdvantage: "Established platform brand for taxi industry digitization"
    },
    {
      id: "IP005",
      title: "MobilityOne Corporate Identity",
      description: "Holding company brand for MobilityOne Pty Ltd (2025/958631/07), the parent entity of PoortLink.",
      type: "trademark",
      category: "Corporate",
      priority: "high",
      status: "filed",
      dateCreated: "2024-12-01",
      inventors: ["System Developer"],
      tags: ["Corporate", "MobilityOne", "Holding Company"],
      technicalDetails: "CIPC registration complete - Enterprise Number 2025/958631/07",
      marketValue: "Corporate structure and investor relations",
      competitiveAdvantage: "Professional corporate structure for investment"
    },
    {
      id: "IP006",
      title: "PoortLink Local Rollout Brand",
      description: "Local market rollout brand example for community-specific deployments of the TaxiConnect platform. Demonstrates the white-label capability for municipality or community-level branding.",
      type: "trademark",
      category: "Local Rollout",
      priority: "medium",
      status: "draft",
      dateCreated: "2024-12-01",
      inventors: ["System Developer"],
      tags: ["Brand", "Local", "PoortLink", "White-label", "Community"],
      technicalDetails: "Template for localized branding with community-specific identity while maintaining TaxiConnect platform infrastructure",
      marketValue: "Enables franchise and municipality licensing model",
      competitiveAdvantage: "Scalable local deployment strategy for community buy-in and ownership"
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

  const [showShareDialog, setShowShareDialog] = useState(false);
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
  const [pdfDataUrl, setPdfDataUrl] = useState<string | null>(null);

  const generateCIPCReport = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    
    // Header
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text("CIPC IP Portfolio Report", pageWidth / 2, 20, { align: "center" });
    
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text("MobilityOne Pty Ltd (2025/958631/07)", pageWidth / 2, 28, { align: "center" });
    doc.text(`Generated: ${new Date().toLocaleDateString('en-ZA')}`, pageWidth / 2, 35, { align: "center" });
    
    // Summary Section
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("IP Portfolio Summary", 14, 50);
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    const patents = innovations.filter(i => i.type === 'patent').length;
    const trademarks = innovations.filter(i => i.type === 'trademark').length;
    const ready = innovations.filter(i => i.status === 'documented').length;
    
    doc.text(`Total Patents: ${patents}`, 14, 60);
    doc.text(`Total Trademarks: ${trademarks}`, 14, 67);
    doc.text(`Ready to File: ${ready}`, 14, 74);
    
    // Innovations Table
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("IP Assets", 14, 90);
    
    const tableData = innovations.map(i => [
      i.id,
      i.title,
      i.type.toUpperCase(),
      i.category,
      i.priority.toUpperCase(),
      i.status.toUpperCase()
    ]);
    
    autoTable(doc, {
      startY: 95,
      head: [['ID', 'Title', 'Type', 'Category', 'Priority', 'Status']],
      body: tableData,
      headStyles: { fillColor: [41, 128, 185] },
      styles: { fontSize: 8 },
      columnStyles: {
        1: { cellWidth: 50 }
      }
    });
    
    // Detailed Descriptions
    let yPos = (doc as any).lastAutoTable.finalY + 15;
    
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Detailed IP Descriptions", 14, yPos);
    yPos += 10;
    
    innovations.forEach((innovation, index) => {
      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
      }
      
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.text(`${innovation.id}: ${innovation.title}`, 14, yPos);
      yPos += 6;
      
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      const descLines = doc.splitTextToSize(innovation.description, pageWidth - 28);
      doc.text(descLines, 14, yPos);
      yPos += descLines.length * 4 + 3;
      
      if (innovation.technicalDetails) {
        doc.setFont("helvetica", "italic");
        const techLines = doc.splitTextToSize(`Technical: ${innovation.technicalDetails}`, pageWidth - 28);
        doc.text(techLines, 14, yPos);
        yPos += techLines.length * 4 + 3;
      }
      
      if (innovation.marketValue) {
        doc.text(`Market Value: ${innovation.marketValue}`, 14, yPos);
        yPos += 5;
      }
      
      yPos += 5;
    });
    
    // Cost Estimation
    if (yPos > 230) {
      doc.addPage();
      yPos = 20;
    }
    
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Estimated Filing Costs", 14, yPos);
    yPos += 10;
    
    autoTable(doc, {
      startY: yPos,
      head: [['Item', 'Cost (ZAR)']],
      body: [
        ['Patent Applications (2)', 'R1,200'],
        ['Trademark Registration', 'R890'],
        ['Professional Fees (Est.)', 'R15,000'],
        ['Total Estimated', 'R17,090']
      ],
      headStyles: { fillColor: [46, 204, 113] },
      styles: { fontSize: 10 }
    });
    
    // Footer
    const pageCount = doc.internal.pages.length - 1;
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.text(
        `Page ${i} of ${pageCount} | CONFIDENTIAL - MobilityOne Pty Ltd`,
        pageWidth / 2,
        doc.internal.pageSize.getHeight() - 10,
        { align: "center" }
      );
    }
    
    // Generate blob for sharing
    const blob = doc.output('blob');
    setPdfBlob(blob);
    
    // Generate data URL for preview
    const dataUrl = doc.output('dataurlstring');
    setPdfDataUrl(dataUrl);
    
    setShowShareDialog(true);
    
    toast({
      title: "CIPC Report Generated",
      description: "Your IP documentation report is ready to view, download, or share.",
    });
  };

  const downloadPdf = () => {
    if (pdfBlob) {
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `CIPC_IP_Report_${new Date().toISOString().split('T')[0]}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
      
      toast({
        title: "Download Started",
        description: "Your PDF report is downloading.",
      });
    }
  };

  const printReport = () => {
    if (pdfDataUrl) {
      const printWindow = window.open(pdfDataUrl, '_blank');
      if (printWindow) {
        printWindow.onload = () => {
          printWindow.print();
        };
      }
    }
  };

  const shareViaWhatsApp = (phoneNumber?: string) => {
    const reportSummary = `*CIPC IP Portfolio Report*%0A%0A` +
      `Company: MobilityOne Pty Ltd%0A` +
      `CIPC No: 2025/958631/07%0A` +
      `Date: ${new Date().toLocaleDateString('en-ZA')}%0A%0A` +
      `*Summary:*%0A` +
      `• Patents: ${innovations.filter(i => i.type === 'patent').length}%0A` +
      `• Trademarks: ${innovations.filter(i => i.type === 'trademark').length}%0A` +
      `• Ready to File: ${innovations.filter(i => i.status === 'documented').length}%0A%0A` +
      `*Key IP Assets:*%0A` +
      innovations.slice(0, 5).map(i => `• ${i.title} (${i.type})`).join('%0A') +
      `%0A%0A` +
      `*Est. Filing Cost:* R17,090%0A%0A` +
      `_Full PDF report available on request._`;
    
    const whatsappUrl = phoneNumber 
      ? `https://wa.me/${phoneNumber.replace(/\D/g, '')}?text=${reportSummary}`
      : `https://wa.me/?text=${reportSummary}`;
    
    window.open(whatsappUrl, '_blank');
    
    toast({
      title: "Opening WhatsApp",
      description: "Share the report summary via WhatsApp.",
    });
  };

  const shareViaEmail = () => {
    const subject = encodeURIComponent(`CIPC IP Portfolio Report - MobilityOne Pty Ltd`);
    const body = encodeURIComponent(
      `CIPC IP Portfolio Report\n\n` +
      `Company: MobilityOne Pty Ltd\n` +
      `CIPC No: 2025/958631/07\n` +
      `Date: ${new Date().toLocaleDateString('en-ZA')}\n\n` +
      `Summary:\n` +
      `• Patents: ${innovations.filter(i => i.type === 'patent').length}\n` +
      `• Trademarks: ${innovations.filter(i => i.type === 'trademark').length}\n` +
      `• Ready to File: ${innovations.filter(i => i.status === 'documented').length}\n\n` +
      `Key IP Assets:\n` +
      innovations.slice(0, 5).map(i => `• ${i.title} (${i.type})`).join('\n') +
      `\n\n` +
      `Estimated Filing Cost: R17,090\n\n` +
      `Please find the full PDF report attached.\n\n` +
      `Regards,\nMobilityOne Pty Ltd`
    );
    
    window.open(`mailto:?subject=${subject}&body=${body}`, '_blank');
    
    toast({
      title: "Opening Email",
      description: "Compose your email and attach the downloaded PDF.",
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

      {/* Share Dialog */}
      <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <FileText className="mr-2 h-5 w-5" />
              CIPC IP Portfolio Report
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* PDF Preview */}
            {pdfDataUrl && (
              <div className="border rounded-lg overflow-hidden h-64">
                <iframe
                  src={pdfDataUrl}
                  className="w-full h-full"
                  title="CIPC Report Preview"
                />
              </div>
            )}
            
            {/* Action Buttons */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Button onClick={downloadPdf} className="flex-1">
                <Download className="mr-2 h-4 w-4" />
                Download PDF
              </Button>
              
              <Button onClick={printReport} variant="outline" className="flex-1">
                <Printer className="mr-2 h-4 w-4" />
                Print
              </Button>
              
              <Button 
                onClick={() => shareViaWhatsApp()} 
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                <MessageCircle className="mr-2 h-4 w-4" />
                WhatsApp
              </Button>
              
              <Button onClick={shareViaEmail} variant="outline" className="flex-1">
                <Mail className="mr-2 h-4 w-4" />
                Email
              </Button>
            </div>
            
            {/* WhatsApp to specific number */}
            <div className="border-t pt-4">
              <Label className="text-sm font-medium">Send to specific WhatsApp number:</Label>
              <div className="flex space-x-2 mt-2">
                <Input 
                  placeholder="+27 82 123 4567"
                  id="whatsapp-number"
                  className="flex-1"
                />
                <Button 
                  onClick={() => {
                    const input = document.getElementById('whatsapp-number') as HTMLInputElement;
                    if (input?.value) {
                      shareViaWhatsApp(input.value);
                    }
                  }}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Share2 className="mr-2 h-4 w-4" />
                  Send
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Note: The report summary will be sent as a WhatsApp message. For the full PDF, download and attach manually.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};