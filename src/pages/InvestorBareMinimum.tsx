import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, LifeBuoy, CheckCircle2, XCircle, AlertTriangle, Clock } from "lucide-react";
import { Link } from "react-router-dom";

const keepStack = [
  { item: "Lovable (build + Cloud backend)", cost: 420, status: "Active", note: "Platform build, database, edge functions" },
  { item: "Afrihost (hosting, domains, data)", cost: 626, status: "Active", note: "tukconnect.com, connectivity" },
  { item: "Twilio (SMS / WhatsApp)", cost: 175, status: "Active", note: "Driver OTP + marshal notifications" },
  { item: "Resend (transactional email)", cost: 330, status: "Outstanding", note: "Role requests, investor delivery" },
];

const cutStack = [
  { item: "GoHighLevel agency subscription", cost: 2814, note: "Excluded from the build — cancel" },
  { item: "Synthesia", cost: 487, note: "Video generation — defer" },
  { item: "Avast", cost: 479, note: "Non-essential — defer" },
  { item: "Artlist", cost: 327, note: "Stock media — defer" },
  { item: "CapCut", cost: 180, note: "Editing — free tier" },
  { item: "Canva", cost: 110, note: "Free tier sufficient" },
  { item: "YouTube Premium", cost: 20, note: "Personal — cancel" },
];

const keepTotal = keepStack.reduce((s, r) => s + r.cost, 0);
const cutTotal = cutStack.reduce((s, r) => s + r.cost, 0);

const InvestorBareMinimum = () => {
  return (
    <div className="min-h-screen bg-background">
      <section className="bg-gradient-to-br from-primary/10 via-background to-accent/10 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <Button variant="ghost" asChild className="mb-4">
            <Link to="/investor"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Investor Portal</Link>
          </Button>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-xl bg-primary/10">
              <LifeBuoy className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Bare-Minimum Runway</h1>
              <p className="text-muted-foreground">Keep the stack alive for one more month — nothing else</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">Ask: R2,000 / month</Badge>
            <Badge variant="secondary">0% equity</Badge>
            <Badge variant="secondary">Cancel anytime</Badge>
          </div>
        </div>
      </section>

      <section className="py-8 px-4">
        <div className="max-w-4xl mx-auto space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">The Ask</CardTitle>
              <CardDescription>Survival capital, not growth capital</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-lg border bg-muted/30">
                <p className="text-sm text-muted-foreground">One month</p>
                <p className="text-2xl font-bold text-foreground">R2,000</p>
              </div>
              <div className="p-4 rounded-lg border bg-muted/30">
                <p className="text-sm text-muted-foreground">Three months (preferred)</p>
                <p className="text-2xl font-bold text-foreground">R6,000</p>
              </div>
              <div className="p-4 rounded-lg border bg-muted/30">
                <p className="text-sm text-muted-foreground">Verified monthly burn</p>
                <p className="text-2xl font-bold text-foreground">R{keepTotal.toLocaleString()}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-primary" /> Essential stack — funded by this ask
              </CardTitle>
              <CardDescription>Actual recurring costs from the operating account</CardDescription>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Line item</TableHead>
                    <TableHead>Purpose</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">R / month</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {keepStack.map((r) => (
                    <TableRow key={r.item}>
                      <TableCell className="font-medium">{r.item}</TableCell>
                      <TableCell className="text-muted-foreground">{r.note}</TableCell>
                      <TableCell>
                        <Badge variant={r.status === "Outstanding" ? "destructive" : "secondary"}>{r.status}</Badge>
                      </TableCell>
                      <TableCell className="text-right">R{r.cost.toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                  <TableRow>
                    <TableCell colSpan={3} className="font-semibold">Total essential burn</TableCell>
                    <TableCell className="text-right font-semibold">R{keepTotal.toLocaleString()}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <XCircle className="h-5 w-5 text-destructive" /> Cut or deferred — R{cutTotal.toLocaleString()}/month saved
              </CardTitle>
              <CardDescription>Discretionary spend removed before asking for capital</CardDescription>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Line item</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead className="text-right">R / month</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cutStack.map((r) => (
                    <TableRow key={r.item}>
                      <TableCell className="font-medium">{r.item}</TableCell>
                      <TableCell className="text-muted-foreground">{r.note}</TableCell>
                      <TableCell className="text-right">R{r.cost.toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card className="border-destructive/40">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-destructive" /> Outstanding accounts
              </CardTitle>
              <CardDescription>Cleared first from any capital received</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p><strong>Resend</strong> — transactional email arrears (~R330). Blocks role-request and investor email delivery.</p>
              <p><strong>GoHighLevel</strong> — repeated failed debits. Not part of the build; to be cancelled rather than settled forward.</p>
              <p><strong>Other failed recurring charges</strong> — insufficient-funds fees are being eliminated by cancelling the deferred list above.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" /> What R2,000 buys
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>• Platform stays online: hosting, database, edge functions, domains.</p>
              <p>• Driver and marshal SMS/OTP keeps working at the rank.</p>
              <p>• Email delivery restored for role requests and investor documents.</p>
              <p>• 30 more days to complete CIPC incorporation, insurance shortlisting, and the DOT Form 9A submission.</p>
            </CardContent>
          </Card>

          <div className="flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link to="/legal/revenue-share">Generate Revenue-Share Agreement</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/cost-breakdown">See full cost breakdown</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default InvestorBareMinimum;
