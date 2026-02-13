import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  AlertTriangle,
  Camera,
  Car,
  FileText,
  Shield,
  TrendingDown,
  TrendingUp,
  Eye,
  CheckCircle,
  XCircle,
  BarChart3,
  Calendar,
  Download,
  RefreshCw
} from "lucide-react";
import {
  PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend
} from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { format, subDays, startOfMonth, endOfMonth } from "date-fns";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface Infringement {
  id: string;
  infringement_type: string;
  severity: string;
  description: string | null;
  license_plate: string | null;
  detected_by: string;
  confidence_score: number | null;
  status: string;
  demerit_points: number;
  fine_amount: number;
  reputation_impact: number;
  occurred_at: string;
  created_at: string;
  location: any;
  review_notes: string | null;
}

interface ComplianceReport {
  id: string;
  report_type: string;
  report_period_start: string;
  report_period_end: string;
  total_infringements: number;
  total_incidents: number;
  compliance_score: number;
  minor_count: number;
  moderate_count: number;
  serious_count: number;
  major_count: number;
  summary: string | null;
  recommendations: string[] | null;
  status: string;
  created_at: string;
}

const SEVERITY_COLORS: Record<string, string> = {
  minor: "hsl(var(--chart-3))",
  moderate: "hsl(var(--chart-4))",
  serious: "hsl(var(--chart-5))",
  major: "hsl(var(--destructive))",
};

const SEVERITY_BADGES: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  minor: "secondary",
  moderate: "default",
  serious: "destructive",
  major: "destructive",
};

const STATUS_BADGES: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  pending: "outline",
  confirmed: "destructive",
  disputed: "default",
  resolved: "secondary",
  dismissed: "secondary",
};

export const InfringementMonitoringDashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [infringements, setInfringements] = useState<Infringement[]>([]);
  const [reports, setReports] = useState<ComplianceReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [severityFilter, setSeverityFilter] = useState<string>("all");
  const [selectedInfringement, setSelectedInfringement] = useState<Infringement | null>(null);
  const [reviewNotes, setReviewNotes] = useState("");

  // Report generation state
  const [reportPeriodStart, setReportPeriodStart] = useState(format(startOfMonth(new Date()), "yyyy-MM-dd"));
  const [reportPeriodEnd, setReportPeriodEnd] = useState(format(endOfMonth(new Date()), "yyyy-MM-dd"));
  const [reportType, setReportType] = useState("monthly");

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [infRes, repRes] = await Promise.all([
        supabase
          .from("road_infringements")
          .select("*")
          .order("occurred_at", { ascending: false })
          .limit(200),
        supabase
          .from("dot_compliance_reports")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(20)
      ]);

      if (infRes.error) throw infRes.error;
      if (repRes.error) throw repRes.error;

      setInfringements((infRes.data || []) as Infringement[]);
      setReports((repRes.data || []) as ComplianceReport[]);
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  const updateInfringementStatus = async (id: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from("road_infringements")
        .update({
          status: newStatus,
          reviewed_by: user?.id,
          reviewed_at: new Date().toISOString(),
          review_notes: reviewNotes || null
        })
        .eq("id", id);

      if (error) throw error;
      toast({ title: "Updated", description: `Infringement ${newStatus}` });
      setSelectedInfringement(null);
      setReviewNotes("");
      fetchData();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const generateReport = async () => {
    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-dot-report", {
        body: {
          reportType,
          periodStart: reportPeriodStart,
          periodEnd: reportPeriodEnd
        }
      });

      if (error) throw error;

      toast({ title: "Report Generated", description: "DOT compliance report created successfully." });
      fetchData();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setGenerating(false);
    }
  };

  const exportReportPDF = (report: ComplianceReport) => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("DOT Compliance Report", 14, 22);
    doc.setFontSize(10);
    doc.text(`Period: ${report.report_period_start} to ${report.report_period_end}`, 14, 32);
    doc.text(`Generated: ${format(new Date(report.created_at), "PPp")}`, 14, 38);
    doc.text(`Compliance Score: ${report.compliance_score?.toFixed(1)}%`, 14, 44);

    doc.setFontSize(12);
    doc.text("Summary", 14, 56);
    doc.setFontSize(9);
    const summaryLines = doc.splitTextToSize(report.summary || "", 180);
    doc.text(summaryLines, 14, 62);

    autoTable(doc, {
      startY: 62 + summaryLines.length * 5 + 10,
      head: [["Metric", "Value"]],
      body: [
        ["Total Infringements", String(report.total_infringements)],
        ["Total Incidents", String(report.total_incidents)],
        ["Minor", String(report.minor_count)],
        ["Moderate", String(report.moderate_count)],
        ["Serious", String(report.serious_count)],
        ["Major", String(report.major_count)],
      ],
    });

    if (report.recommendations?.length) {
      const finalY = (doc as any).lastAutoTable?.finalY || 120;
      doc.setFontSize(12);
      doc.text("Recommendations", 14, finalY + 10);
      doc.setFontSize(9);
      report.recommendations.forEach((rec, i) => {
        const lines = doc.splitTextToSize(`${i + 1}. ${rec}`, 180);
        doc.text(lines, 14, finalY + 18 + i * 12);
      });
    }

    doc.save(`DOT_Report_${report.report_period_start}_${report.report_period_end}.pdf`);
  };

  // Filtered infringements
  const filtered = infringements.filter(inf => {
    if (statusFilter !== "all" && inf.status !== statusFilter) return false;
    if (severityFilter !== "all" && inf.severity !== severityFilter) return false;
    return true;
  });

  // Stats
  const totalFines = infringements.reduce((s, i) => s + Number(i.fine_amount || 0), 0);
  const totalDemerits = infringements.reduce((s, i) => s + (i.demerit_points || 0), 0);
  const confirmedCount = infringements.filter(i => i.status === "confirmed").length;
  const pendingCount = infringements.filter(i => i.status === "pending").length;

  // Chart data
  const severityData = [
    { name: "Minor", value: infringements.filter(i => i.severity === "minor").length, fill: SEVERITY_COLORS.minor },
    { name: "Moderate", value: infringements.filter(i => i.severity === "moderate").length, fill: SEVERITY_COLORS.moderate },
    { name: "Serious", value: infringements.filter(i => i.severity === "serious").length, fill: SEVERITY_COLORS.serious },
    { name: "Major", value: infringements.filter(i => i.severity === "major").length, fill: SEVERITY_COLORS.major },
  ].filter(d => d.value > 0);

  const typeData = Object.entries(
    infringements.reduce<Record<string, number>>((acc, inf) => {
      acc[inf.infringement_type] = (acc[inf.infringement_type] || 0) + 1;
      return acc;
    }, {})
  ).map(([type, count]) => ({ type: type.replace(/_/g, " "), count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-destructive/30 bg-gradient-to-r from-destructive/5 to-destructive/10">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-destructive/20">
              <Shield className="h-6 w-6 text-destructive" />
            </div>
            <div>
              <CardTitle className="text-2xl">Road Infringement Monitoring</CardTitle>
              <CardDescription>
                AI-powered traffic violation detection • AARTO compliance • DOT reporting
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <AlertTriangle className="h-4 w-4" />
              <span className="text-sm">Total</span>
            </div>
            <p className="text-2xl font-bold">{infringements.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Eye className="h-4 w-4" />
              <span className="text-sm">Pending</span>
            </div>
            <p className="text-2xl font-bold text-orange-600">{pendingCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <CheckCircle className="h-4 w-4" />
              <span className="text-sm">Confirmed</span>
            </div>
            <p className="text-2xl font-bold text-destructive">{confirmedCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <TrendingDown className="h-4 w-4" />
              <span className="text-sm">Demerits</span>
            </div>
            <p className="text-2xl font-bold">{totalDemerits}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <span className="text-sm font-medium">R</span>
              <span className="text-sm">Fines</span>
            </div>
            <p className="text-2xl font-bold">R{totalFines.toLocaleString()}</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="infringements">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="infringements">Infringements</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="reports">DOT Reports</TabsTrigger>
        </TabsList>

        {/* Infringements Tab */}
        <TabsContent value="infringements" className="space-y-4">
          <div className="flex gap-3 items-center">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="disputed">Disputed</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="dismissed">Dismissed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={severityFilter} onValueChange={setSeverityFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Severity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Severity</SelectItem>
                <SelectItem value="minor">Minor</SelectItem>
                <SelectItem value="moderate">Moderate</SelectItem>
                <SelectItem value="serious">Serious</SelectItem>
                <SelectItem value="major">Major</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" onClick={fetchData} className="ml-auto gap-2">
              <RefreshCw className="h-4 w-4" /> Refresh
            </Button>
          </div>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Plate</TableHead>
                    <TableHead>Severity</TableHead>
                    <TableHead>Demerits</TableHead>
                    <TableHead>Fine</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center text-muted-foreground py-8">
                        No infringements recorded yet. AI camera analysis will auto-detect violations.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filtered.slice(0, 50).map(inf => (
                      <TableRow key={inf.id}>
                        <TableCell className="text-sm">
                          {format(new Date(inf.occurred_at), "MMM dd, HH:mm")}
                        </TableCell>
                        <TableCell className="capitalize text-sm">
                          {inf.infringement_type.replace(/_/g, " ")}
                        </TableCell>
                        <TableCell className="font-mono text-sm">{inf.license_plate || "—"}</TableCell>
                        <TableCell>
                          <Badge variant={SEVERITY_BADGES[inf.severity] || "default"} className="capitalize">
                            {inf.severity}
                          </Badge>
                        </TableCell>
                        <TableCell>{inf.demerit_points}</TableCell>
                        <TableCell>R{Number(inf.fine_amount).toLocaleString()}</TableCell>
                        <TableCell className="capitalize text-sm">{inf.detected_by}</TableCell>
                        <TableCell>
                          <Badge variant={STATUS_BADGES[inf.status] || "outline"} className="capitalize">
                            {inf.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setSelectedInfringement(inf);
                                  setReviewNotes(inf.review_notes || "");
                                }}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-lg">
                              <DialogHeader>
                                <DialogTitle className="capitalize">
                                  {inf.infringement_type.replace(/_/g, " ")} — {inf.severity}
                                </DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-3 text-sm">
                                  <div><span className="text-muted-foreground">Date:</span> {format(new Date(inf.occurred_at), "PPp")}</div>
                                  <div><span className="text-muted-foreground">Plate:</span> {inf.license_plate || "Unknown"}</div>
                                  <div><span className="text-muted-foreground">Demerits:</span> {inf.demerit_points}</div>
                                  <div><span className="text-muted-foreground">Fine:</span> R{Number(inf.fine_amount).toLocaleString()}</div>
                                  <div><span className="text-muted-foreground">Confidence:</span> {((inf.confidence_score || 0) * 100).toFixed(0)}%</div>
                                  <div><span className="text-muted-foreground">Source:</span> {inf.detected_by}</div>
                                </div>
                                {inf.description && (
                                  <p className="text-sm bg-muted p-3 rounded">{inf.description}</p>
                                )}
                                <Separator />
                                <div className="space-y-2">
                                  <Label>Review Notes</Label>
                                  <Textarea
                                    value={reviewNotes}
                                    onChange={e => setReviewNotes(e.target.value)}
                                    placeholder="Add review notes..."
                                  />
                                </div>
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => updateInfringementStatus(inf.id, "confirmed")}
                                    className="gap-1"
                                  >
                                    <CheckCircle className="h-3 w-3" /> Confirm
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => updateInfringementStatus(inf.id, "dismissed")}
                                    className="gap-1"
                                  >
                                    <XCircle className="h-3 w-3" /> Dismiss
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="secondary"
                                    onClick={() => updateInfringementStatus(inf.id, "resolved")}
                                    className="gap-1"
                                  >
                                    Resolve
                                  </Button>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Severity Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                {severityData.length > 0 ? (
                  <div className="h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={severityData}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          label={({ name, value }) => `${name}: ${value}`}
                        >
                          {severityData.map((entry, i) => (
                            <Cell key={i} fill={entry.fill} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-8">No data yet</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Infringement Types</CardTitle>
              </CardHeader>
              <CardContent>
                {typeData.length > 0 ? (
                  <div className="h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={typeData} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" />
                        <YAxis dataKey="type" type="category" width={100} className="text-xs capitalize" />
                        <Tooltip />
                        <Bar dataKey="count" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-8">No data yet</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* DOT Reports Tab */}
        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="h-5 w-5" /> Generate DOT Compliance Report
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Report Type</Label>
                  <Select value={reportType} onValueChange={setReportType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="quarterly">Quarterly</SelectItem>
                      <SelectItem value="annual">Annual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Period Start</Label>
                  <Input type="date" value={reportPeriodStart} onChange={e => setReportPeriodStart(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Period End</Label>
                  <Input type="date" value={reportPeriodEnd} onChange={e => setReportPeriodEnd(e.target.value)} />
                </div>
              </div>
              <Button onClick={generateReport} disabled={generating} className="gap-2">
                {generating ? <RefreshCw className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
                {generating ? "Generating..." : "Generate Report"}
              </Button>
            </CardContent>
          </Card>

          {reports.map(report => (
            <Card key={report.id}>
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold capitalize">{report.report_type} Report</h3>
                    <p className="text-sm text-muted-foreground">
                      {report.report_period_start} → {report.report_period_end}
                    </p>
                    <p className="text-sm mt-1">{report.summary}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-2xl font-bold">{report.compliance_score?.toFixed(0)}%</p>
                      <p className="text-xs text-muted-foreground">Compliance</p>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => exportReportPDF(report)} className="gap-1">
                      <Download className="h-4 w-4" /> PDF
                    </Button>
                  </div>
                </div>
                {report.recommendations && report.recommendations.length > 0 && (
                  <div className="mt-3 pt-3 border-t">
                    <p className="text-xs font-medium text-muted-foreground mb-1">Recommendations:</p>
                    <ul className="text-xs space-y-1">
                      {(report.recommendations as string[]).map((rec, i) => (
                        <li key={i} className="flex gap-1">
                          <span className="text-muted-foreground">•</span> {rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
};
