import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import {
  Trophy,
  ShieldCheck,
  TrendingUp,
  Car,
  ArrowRight,
  Check,
  X,
  ClipboardList,
} from "lucide-react";

type Program = {
  id: string;
  tier: string;
  display_name: string;
  weekly_contribution_pct: number;
  months_to_ownership: number;
  min_reputation_score: number;
  min_compliance_score: number;
  min_biometric_pct: number;
  min_digital_payment_pct: number;
  min_months_active: number;
  graduation_bonus_zar: number;
  description: string | null;
};

type Eligibility = {
  qualifies_tier: string | null;
  reputation_score: number;
  compliance_score: number;
  infringements_90d: number;
  best_score: number;
};

type Enrollment = {
  id: string;
  program_tier: string;
  status: string;
  notes: string | null;
  created_at: string;
  start_date: string | null;
  target_ownership_date: string | null;
  total_contributed_zar: number;
  balance_remaining_zar: number;
};

const tierColor: Record<string, string> = {
  bronze: "bg-amber-700/15 text-amber-700 border-amber-700/30",
  silver: "bg-slate-400/15 text-slate-600 border-slate-400/30",
  gold: "bg-yellow-500/15 text-yellow-700 border-yellow-500/30",
  platinum: "bg-violet-500/15 text-violet-700 border-violet-500/30",
};

const statusColor: Record<string, string> = {
  applied: "bg-blue-500/15 text-blue-700 border-blue-500/30",
  eligible: "bg-emerald-500/15 text-emerald-700 border-emerald-500/30",
  active: "bg-emerald-500/15 text-emerald-700 border-emerald-500/30",
  graduated: "bg-violet-500/15 text-violet-700 border-violet-500/30",
  rejected: "bg-destructive/15 text-destructive border-destructive/30",
};

export default function DriveToOwn() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [programs, setPrograms] = useState<Program[]>([]);
  const [eligibility, setEligibility] = useState<Eligibility | null>(null);
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [preferredTier, setPreferredTier] = useState<string>("bronze");
  const [notes, setNotes] = useState("");

  const loadAll = async () => {
    const { data: progs } = await (supabase as any)
      .from("drive_to_own_programs")
      .select("*")
      .eq("is_active", true)
      .order("min_reputation_score", { ascending: true });
    setPrograms(progs || []);

    if (user) {
      const { data: elig } = await (supabase as any)
        .rpc("calculate_drive_to_own_eligibility", { _driver_id: user.id });
      if (elig && elig[0]) setEligibility(elig[0]);

      const { data: enr } = await (supabase as any)
        .from("drive_to_own_enrollments")
        .select("*")
        .eq("driver_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      setEnrollment(enr || null);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const submitApplication = async () => {
    if (!user) {
      toast({ title: "Please sign in", description: "You need an account to apply.", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    const { error } = await (supabase as any)
      .from("drive_to_own_enrollments")
      .insert({
        driver_id: user.id,
        program_tier: preferredTier,
        status: "applied",
        notes: notes.trim().slice(0, 1000) || null,
      });
    setSubmitting(false);
    if (error) {
      toast({ title: "Application failed", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Application submitted", description: "We will review your record and respond shortly." });
    setNotes("");
    loadAll();
  };

  const currentTier = eligibility?.qualifies_tier;
  const meets = (val: number, min: number) => val >= min;

  return (
    <main className="container mx-auto px-4 py-8 max-w-6xl">
      <header className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <Car className="h-7 w-7 text-primary" />
          <h1 className="text-3xl md:text-4xl font-bold">Drive-to-Own</h1>
        </div>
        <p className="text-muted-foreground max-w-2xl">
          Exceptional drivers earn a path to vehicle ownership. Higher reputation, cleaner records and
          biometric clock-in unlock better tiers — lower weekly contributions, faster ownership, and a
          graduation bonus when you finish.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link to="/drive-to-own/vs-moove">
            <Button variant="outline" size="sm">
              Compare with Moove <ArrowRight className="h-3.5 w-3.5 ml-1" />
            </Button>
          </Link>
          <Link to="/why-join">
            <Button variant="ghost" size="sm">Why Join</Button>
          </Link>
        </div>
      </header>

      {user && (
        <Card className="mb-8 border-primary/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-primary" /> Your eligibility
            </CardTitle>
            <CardDescription>
              Based on your live reputation, compliance score and last 90 days of infringements.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-sm text-muted-foreground">Calculating…</p>
            ) : eligibility ? (
              <div className="grid sm:grid-cols-4 gap-4">
                <Stat label="Reputation" value={eligibility.reputation_score} />
                <Stat label="Compliance" value={eligibility.compliance_score} />
                <Stat
                  label="Infringements (90d)"
                  value={eligibility.infringements_90d}
                  negative={eligibility.infringements_90d > 0}
                />
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Highest tier you qualify for</p>
                  {currentTier ? (
                    <Badge className={`uppercase ${tierColor[currentTier] || ""}`} variant="outline">
                      {currentTier}
                    </Badge>
                  ) : (
                    <Badge variant="outline">Not yet eligible</Badge>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No reputation record yet. Complete trips to build one.
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Eligibility breakdown */}
      <section className="mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ClipboardList className="h-5 w-5" /> Eligibility breakdown by tier
            </CardTitle>
            <CardDescription>
              Exact signals each tier requires. Green check = you meet it today; red cross = gap to close.
            </CardDescription>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Signal</TableHead>
                  {programs.map((p) => (
                    <TableHead key={p.id} className="capitalize text-center">
                      {p.tier}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                <SignalRow
                  label="Reputation score"
                  values={programs.map((p) => `≥ ${p.min_reputation_score}`)}
                  checks={programs.map((p) =>
                    eligibility ? meets(eligibility.reputation_score, p.min_reputation_score) : null
                  )}
                />
                <SignalRow
                  label="Compliance score"
                  values={programs.map((p) => `≥ ${p.min_compliance_score}`)}
                  checks={programs.map((p) =>
                    eligibility ? meets(eligibility.compliance_score, p.min_compliance_score) : null
                  )}
                />
                <SignalRow
                  label="Infringements (90 days)"
                  values={programs.map(() => "0 confirmed")}
                  checks={programs.map(() =>
                    eligibility ? eligibility.infringements_90d === 0 : null
                  )}
                />
                <SignalRow
                  label="Biometric clock-in"
                  values={programs.map((p) => `≥ ${p.min_biometric_pct}%`)}
                  checks={programs.map(() => null)}
                />
                <SignalRow
                  label="Digital payment ratio"
                  values={programs.map((p) => `≥ ${p.min_digital_payment_pct}%`)}
                  checks={programs.map(() => null)}
                />
                <SignalRow
                  label="Months active"
                  values={programs.map((p) => `≥ ${p.min_months_active} mo`)}
                  checks={programs.map(() => null)}
                />
                <TableRow>
                  <TableCell className="font-medium">Weekly contribution</TableCell>
                  {programs.map((p) => (
                    <TableCell key={p.id} className="text-center">{p.weekly_contribution_pct}%</TableCell>
                  ))}
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Months to ownership</TableCell>
                  {programs.map((p) => (
                    <TableCell key={p.id} className="text-center">{p.months_to_ownership}</TableCell>
                  ))}
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Graduation bonus</TableCell>
                  {programs.map((p) => (
                    <TableCell key={p.id} className="text-center">
                      R{Number(p.graduation_bonus_zar).toLocaleString()}
                    </TableCell>
                  ))}
                </TableRow>
              </TableBody>
            </Table>
            <p className="text-xs text-muted-foreground mt-3">
              Biometric, digital-payment and months-active signals are reviewed manually from your operational
              record at application time.
            </p>
          </CardContent>
        </Card>
      </section>

      {/* Application / status */}
      <section className="mb-10">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5" /> Application
            </CardTitle>
            <CardDescription>
              {enrollment
                ? "Your latest Drive-to-Own application status."
                : "Apply to be considered for Drive-to-Own. We will review your reputation, compliance and infringement record."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!user ? (
              <p className="text-sm text-muted-foreground">
                <Link to="/auth" className="underline">Sign in</Link> to apply.
              </p>
            ) : enrollment ? (
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm text-muted-foreground">Status:</span>
                  <Badge variant="outline" className={`uppercase ${statusColor[enrollment.status] || ""}`}>
                    {enrollment.status}
                  </Badge>
                  <span className="text-sm text-muted-foreground">Requested tier:</span>
                  <Badge variant="outline" className={`uppercase ${tierColor[enrollment.program_tier] || ""}`}>
                    {enrollment.program_tier}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  Submitted {new Date(enrollment.created_at).toLocaleDateString()}
                </p>
                {enrollment.notes && (
                  <div className="text-sm bg-muted/40 rounded p-3">
                    <p className="text-xs text-muted-foreground mb-1">Your notes</p>
                    {enrollment.notes}
                  </div>
                )}
                {(enrollment.status === "active" || enrollment.status === "eligible") && (
                  <div className="grid sm:grid-cols-2 gap-3 pt-2">
                    <Metric
                      label="Contributed"
                      value={`R${Number(enrollment.total_contributed_zar).toLocaleString()}`}
                    />
                    <Metric
                      label="Balance remaining"
                      value={`R${Number(enrollment.balance_remaining_zar).toLocaleString()}`}
                    />
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4 max-w-xl">
                <div className="space-y-1.5">
                  <Label htmlFor="tier">Preferred tier</Label>
                  <Select value={preferredTier} onValueChange={setPreferredTier}>
                    <SelectTrigger id="tier">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {programs.map((p) => (
                        <SelectItem key={p.id} value={p.tier} className="capitalize">
                          {p.display_name} — {p.weekly_contribution_pct}% / {p.months_to_ownership} mo
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="notes">Why you should be considered (optional)</Label>
                  <Textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value.slice(0, 1000))}
                    placeholder="Years driving, route knowledge, association membership, clean record…"
                    rows={4}
                  />
                  <p className="text-xs text-muted-foreground">{notes.length}/1000</p>
                </div>
                <Button onClick={submitApplication} disabled={submitting}>
                  {submitting ? "Submitting…" : "Submit application"}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      <section className="grid md:grid-cols-2 gap-4">
        {programs.map((p) => {
          const qualifies =
            eligibility &&
            eligibility.reputation_score >= p.min_reputation_score &&
            eligibility.compliance_score >= p.min_compliance_score &&
            eligibility.infringements_90d === 0;
          return (
            <Card key={p.id} className={qualifies ? "border-primary/50" : ""}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="capitalize">{p.display_name}</CardTitle>
                  <Badge className={`uppercase ${tierColor[p.tier] || ""}`} variant="outline">
                    {p.tier}
                  </Badge>
                </div>
                <CardDescription>{p.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <Metric label="Weekly contribution" value={`${p.weekly_contribution_pct}%`} />
                  <Metric label="Months to ownership" value={`${p.months_to_ownership}`} />
                  <Metric label="Min reputation" value={`${p.min_reputation_score}`} />
                  <Metric label="Min compliance" value={`${p.min_compliance_score}`} />
                  <Metric label="Biometric clock-in" value={`≥${p.min_biometric_pct}%`} />
                  <Metric label="Digital payment ratio" value={`≥${p.min_digital_payment_pct}%`} />
                </div>
                <div className="pt-2 border-t">
                  <p className="text-xs text-muted-foreground">Graduation bonus</p>
                  <p className="text-lg font-semibold">R{Number(p.graduation_bonus_zar).toLocaleString()}</p>
                </div>
                {eligibility && (
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span>Reputation</span>
                      <span>
                        {eligibility.reputation_score}/{p.min_reputation_score}
                      </span>
                    </div>
                    <Progress
                      value={Math.min(100, (eligibility.reputation_score / p.min_reputation_score) * 100)}
                    />
                  </div>
                )}
                {qualifies && (
                  <div className="flex items-center gap-2 text-sm text-primary">
                    <ShieldCheck className="h-4 w-4" /> You qualify for this tier
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </section>

      <section className="mt-10">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" /> How to climb tiers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="text-sm space-y-2 list-disc pl-5 text-muted-foreground">
              <li>Keep your AARTO record clean — every confirmed infringement resets the 90-day clock.</li>
              <li>Use biometric clock-in daily (+5 reputation bonus per consistent week).</li>
              <li>Push digital payment ratio up — cash skimming undermines eligibility.</li>
              <li>Maintain low-noise driving and respect loading zones to protect compliance score.</li>
            </ul>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}

function SignalRow({
  label,
  values,
  checks,
}: {
  label: string;
  values: string[];
  checks: (boolean | null)[];
}) {
  return (
    <TableRow>
      <TableCell className="font-medium">{label}</TableCell>
      {values.map((v, i) => (
        <TableCell key={i} className="text-center">
          <div className="flex flex-col items-center gap-1">
            <span className="text-sm">{v}</span>
            {checks[i] === true && <Check className="h-4 w-4 text-emerald-600" />}
            {checks[i] === false && <X className="h-4 w-4 text-destructive" />}
          </div>
        </TableCell>
      ))}
    </TableRow>
  );
}

function Stat({ label, value, negative }: { label: string; value: number; negative?: boolean }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={`text-2xl font-semibold ${negative ? "text-destructive" : ""}`}>{value}</p>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-medium">{value}</p>
    </div>
  );
}
