import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { GlobalHeader } from "@/components/GlobalHeader";
import { Building2, ExternalLink, RotateCcw, FileText, Paperclip } from "lucide-react";


interface Subtask {
  id: string;
  title: string;
  detail?: string;
  done: boolean;
  dueDate: string; // YYYY-MM-DD
  notes: string;
}

const STORAGE_KEY = "cipc_tracker_v1";

const DEFAULTS: Subtask[] = [
  { id: "name-reservation", title: "Reserve company name (CoR9.1)", detail: "Submit up to 4 name choices on BizPortal / eServices.", done: false, dueDate: "", notes: "" },
  { id: "moi", title: "Prepare Memorandum of Incorporation (CoR15.1A/B)", detail: "Standard MOI is fastest for a private company.", done: false, dueDate: "", notes: "" },
  { id: "director-ids", title: "Certified ID copies of director(s)", detail: "Certified within last 3 months.", done: false, dueDate: "", notes: "" },
  { id: "proof-address", title: "Proof of registered address", detail: "Utility bill or lease (≤3 months old).", done: false, dueDate: "", notes: "" },
  { id: "incorporation", title: "File CoR14.1 incorporation + supporting docs", detail: "Upload on BizPortal / CIPC eServices.", done: false, dueDate: "", notes: "" },
  { id: "pay-fee", title: "Pay registration fee", detail: "R125 (name) + R175 (registration) standard MOI.", done: false, dueDate: "", notes: "" },
  { id: "cor14-3", title: "Receive CoR14.3 registration certificate", detail: "Confirms company + registration number.", done: false, dueDate: "", notes: "" },
  { id: "sars-tax", title: "SARS tax registration (auto or manual)", detail: "Confirm income tax number issued.", done: false, dueDate: "", notes: "" },
  { id: "bee-affidavit", title: "B-BBEE affidavit (EME)", detail: "Sworn affidavit for turnover < R10m — required by many procurement partners.", done: false, dueDate: "", notes: "" },
  { id: "beneficial-owner", title: "File Beneficial Ownership register", detail: "Mandatory since 2023 — annual + on change.", done: false, dueDate: "", notes: "" },
  { id: "annual-return", title: "Diarise first Annual Return", detail: "Due within 30 days of anniversary of incorporation.", done: false, dueDate: "", notes: "" },
  { id: "bank-account", title: "Open business bank account", detail: "Needs CoR14.3, MOI, director IDs, proof of address.", done: false, dueDate: "", notes: "" },
];

function load(): Subtask[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULTS;
    const parsed = JSON.parse(raw) as Subtask[];
    // merge in any new defaults
    const map = new Map(parsed.map((s) => [s.id, s]));
    return DEFAULTS.map((d) => map.get(d.id) ?? d);
  } catch {
    return DEFAULTS;
  }
}

export default function CIPCTracker() {
  const [tasks, setTasks] = useState<Subtask[]>(load);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  }, [tasks]);

  const update = (id: string, patch: Partial<Subtask>) =>
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t)));

  const reset = () => {
    if (confirm("Reset all CIPC subtasks to defaults?")) setTasks(DEFAULTS);
  };

  const done = tasks.filter((t) => t.done).length;
  const pct = Math.round((done / tasks.length) * 100);

  const nextDue = useMemo(() => {
    const upcoming = tasks
      .filter((t) => !t.done && t.dueDate)
      .sort((a, b) => a.dueDate.localeCompare(b.dueDate))[0];
    return upcoming;
  }, [tasks]);

  return (
    <>
      <GlobalHeader />
      <div className="container mx-auto max-w-4xl px-4 py-6 space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-3">
                <Building2 className="h-6 w-6 text-primary" />
                <div>
                  <CardTitle>CIPC Task Tracker</CardTitle>
                  <CardDescription>
                    Work through the remaining CIPC requirements. Saved locally on this device.
                  </CardDescription>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" asChild>
                  <a href="https://www.bizportal.gov.za" target="_blank" rel="noreferrer">
                    BizPortal <ExternalLink className="h-3 w-3 ml-1" />
                  </a>
                </Button>
                <Button variant="ghost" size="sm" onClick={reset}>
                  <RotateCcw className="h-4 w-4 mr-1" /> Reset
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium">{done}/{tasks.length} · {pct}%</span>
            </div>
            <Progress value={pct} className="h-3" />
            {nextDue && (
              <p className="text-sm text-muted-foreground">
                Next due: <span className="font-medium text-foreground">{nextDue.title}</span> on{" "}
                <Badge variant="secondary">{nextDue.dueDate}</Badge>
              </p>
            )}
          </CardContent>
        </Card>

        <div className="space-y-3">
          {tasks.map((t) => (
            <Card key={t.id} className={t.done ? "bg-green-500/5 border-green-500/20" : ""}>
              <CardContent className="pt-5">
                <div className="flex gap-3">
                  <Checkbox
                    checked={t.done}
                    onCheckedChange={(v) => update(t.id, { done: !!v })}
                    className="mt-1"
                  />
                  <div className="flex-1 space-y-2">
                    <div>
                      <p className={`font-medium ${t.done ? "line-through text-muted-foreground" : ""}`}>
                        {t.title}
                      </p>
                      {t.detail && <p className="text-sm text-muted-foreground">{t.detail}</p>}
                    </div>
                    <Separator />
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div className="space-y-1">
                        <label className="text-xs text-muted-foreground">Due date</label>
                        <Input
                          type="date"
                          value={t.dueDate}
                          onChange={(e) => update(t.id, { dueDate: e.target.value })}
                        />
                      </div>
                      <div className="md:col-span-2 space-y-1">
                        <label className="text-xs text-muted-foreground">Notes / reference numbers</label>
                        <Textarea
                          rows={2}
                          placeholder="e.g. tracking #, name reservation ref, MOI upload confirmation"
                          value={t.notes}
                          onChange={(e) => update(t.id, { notes: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </>
  );
}
