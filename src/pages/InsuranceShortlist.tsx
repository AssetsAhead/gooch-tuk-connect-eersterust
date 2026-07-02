import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { GlobalHeader } from "@/components/GlobalHeader";
import { Shield, Plus, Trash2, Phone, Mail, ExternalLink } from "lucide-react";

type Status = "to_contact" | "awaiting_quote" | "quoted" | "declined" | "shortlisted" | "bound";

interface Insurer {
  id: string;
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  website: string;
  status: Status;
  quoteAmount: string;      // e.g. "R 1,850 / month"
  coverageLimit: string;    // e.g. "R 5,000,000 PL"
  requirements: string;     // docs/data they asked for
  nextFollowUp: string;     // YYYY-MM-DD
  notes: string;
}

const STORAGE_KEY = "insurance_shortlist_v1";

const STATUS_META: Record<Status, { label: string; color: string }> = {
  to_contact:     { label: "To contact",     color: "bg-muted text-foreground" },
  awaiting_quote: { label: "Awaiting quote", color: "bg-yellow-500/15 text-yellow-700 dark:text-yellow-300" },
  quoted:         { label: "Quoted",         color: "bg-blue-500/15 text-blue-700 dark:text-blue-300" },
  shortlisted:    { label: "Shortlisted",    color: "bg-green-500/15 text-green-700 dark:text-green-300" },
  bound:          { label: "Bound",          color: "bg-primary/15 text-primary" },
  declined:       { label: "Declined",       color: "bg-red-500/15 text-red-700 dark:text-red-300" },
};

const SEEDS: Insurer[] = [
  { id: crypto.randomUUID(), name: "Santam", contactPerson: "", phone: "0860 726 826", email: "", website: "https://www.santam.co.za", status: "to_contact", quoteAmount: "", coverageLimit: "", requirements: "", nextFollowUp: "", notes: "Commercial vehicle / PL specialist." },
  { id: crypto.randomUUID(), name: "Hollard", contactPerson: "", phone: "011 351 5000", email: "", website: "https://www.hollard.co.za", status: "to_contact", quoteAmount: "", coverageLimit: "", requirements: "", nextFollowUp: "", notes: "Has taxi/fleet product." },
  { id: crypto.randomUUID(), name: "Bryte Insurance", contactPerson: "", phone: "011 370 9111", email: "", website: "https://www.brytesa.com", status: "to_contact", quoteAmount: "", coverageLimit: "", requirements: "", nextFollowUp: "", notes: "PL & commercial." },
  { id: crypto.randomUUID(), name: "King Price (Commercial)", contactPerson: "", phone: "0860 50 50 50", email: "", website: "https://www.kingprice.co.za", status: "to_contact", quoteAmount: "", coverageLimit: "", requirements: "", nextFollowUp: "", notes: "Decreasing premium model." },
];

function load(): Insurer[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return SEEDS;
    return JSON.parse(raw);
  } catch {
    return SEEDS;
  }
}

export default function InsuranceShortlist() {
  const [insurers, setInsurers] = useState<Insurer[]>(load);
  const [filter, setFilter] = useState<Status | "all">("all");

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(insurers));
  }, [insurers]);

  const update = (id: string, patch: Partial<Insurer>) =>
    setInsurers((prev) => prev.map((i) => (i.id === id ? { ...i, ...patch } : i)));

  const addBlank = () =>
    setInsurers((prev) => [
      {
        id: crypto.randomUUID(),
        name: "New insurer",
        contactPerson: "", phone: "", email: "", website: "",
        status: "to_contact", quoteAmount: "", coverageLimit: "",
        requirements: "", nextFollowUp: "", notes: "",
      },
      ...prev,
    ]);

  const remove = (id: string) => {
    if (confirm("Delete this insurer?")) setInsurers((prev) => prev.filter((i) => i.id !== id));
  };

  const filtered = filter === "all" ? insurers : insurers.filter((i) => i.status === filter);

  const stats = useMemo(() => {
    const s: Record<Status, number> = { to_contact: 0, awaiting_quote: 0, quoted: 0, declined: 0, shortlisted: 0, bound: 0 };
    insurers.forEach((i) => { s[i.status]++; });
    return s;
  }, [insurers]);

  const upcoming = useMemo(() => {
    return insurers
      .filter((i) => i.nextFollowUp && i.status !== "declined" && i.status !== "bound")
      .sort((a, b) => a.nextFollowUp.localeCompare(b.nextFollowUp))
      .slice(0, 3);
  }, [insurers]);

  return (
    <>
      <GlobalHeader />
      <div className="container mx-auto max-w-5xl px-4 py-6 space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-3">
                <Shield className="h-6 w-6 text-primary" />
                <div>
                  <CardTitle>Insurance Shortlisting Tool</CardTitle>
                  <CardDescription>
                    Track insurer contacts, quotes, requirements, and follow-ups for third-party / PL cover.
                  </CardDescription>
                </div>
              </div>
              <Button size="sm" onClick={addBlank}>
                <Plus className="h-4 w-4 mr-1" /> Add insurer
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-6 gap-2 text-center">
              {(Object.keys(STATUS_META) as Status[]).map((s) => (
                <button
                  key={s}
                  onClick={() => setFilter(filter === s ? "all" : s)}
                  className={`rounded-lg p-2 border text-xs transition ${
                    filter === s ? "border-primary" : "border-transparent bg-muted/50"
                  }`}
                >
                  <div className="font-semibold">{stats[s]}</div>
                  <div className="text-muted-foreground">{STATUS_META[s].label}</div>
                </button>
              ))}
            </div>
            {upcoming.length > 0 && (
              <div className="rounded-lg border p-3 bg-muted/30">
                <p className="text-xs font-medium text-muted-foreground mb-1">Next follow-ups</p>
                <ul className="text-sm space-y-1">
                  {upcoming.map((i) => (
                    <li key={i.id} className="flex justify-between">
                      <span>{i.name}</span>
                      <Badge variant="secondary">{i.nextFollowUp}</Badge>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-3">
          {filtered.map((i) => (
            <Card key={i.id}>
              <CardContent className="pt-5 space-y-3">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <Input
                    className="text-base font-semibold max-w-sm"
                    value={i.name}
                    onChange={(e) => update(i.id, { name: e.target.value })}
                  />
                  <div className="flex items-center gap-2">
                    <Select value={i.status} onValueChange={(v) => update(i.id, { status: v as Status })}>
                      <SelectTrigger className="w-[170px]"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {(Object.keys(STATUS_META) as Status[]).map((s) => (
                          <SelectItem key={s} value={s}>{STATUS_META[s].label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Badge className={STATUS_META[i.status].color}>{STATUS_META[i.status].label}</Badge>
                    <Button variant="ghost" size="icon" onClick={() => remove(i.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs text-muted-foreground">Contact person</label>
                    <Input value={i.contactPerson} onChange={(e) => update(i.id, { contactPerson: e.target.value })} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-muted-foreground flex items-center gap-1"><Phone className="h-3 w-3" /> Phone</label>
                    <Input value={i.phone} onChange={(e) => update(i.id, { phone: e.target.value })} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-muted-foreground flex items-center gap-1"><Mail className="h-3 w-3" /> Email</label>
                    <Input type="email" value={i.email} onChange={(e) => update(i.id, { email: e.target.value })} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-muted-foreground flex items-center gap-1"><ExternalLink className="h-3 w-3" /> Website</label>
                    <Input value={i.website} onChange={(e) => update(i.id, { website: e.target.value })} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-muted-foreground">Quote amount</label>
                    <Input placeholder="R / month" value={i.quoteAmount} onChange={(e) => update(i.id, { quoteAmount: e.target.value })} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-muted-foreground">Coverage / limit</label>
                    <Input placeholder="e.g. R5m PL, R100k excess" value={i.coverageLimit} onChange={(e) => update(i.id, { coverageLimit: e.target.value })} />
                  </div>
                  <div className="space-y-1 md:col-span-2">
                    <label className="text-xs text-muted-foreground">Requirements they asked for</label>
                    <Textarea rows={2} placeholder="e.g. CoR14.3, PDP copies, vehicle list, POPIA policy" value={i.requirements} onChange={(e) => update(i.id, { requirements: e.target.value })} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-muted-foreground">Next follow-up</label>
                    <Input type="date" value={i.nextFollowUp} onChange={(e) => update(i.id, { nextFollowUp: e.target.value })} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-muted-foreground">Notes</label>
                    <Textarea rows={2} value={i.notes} onChange={(e) => update(i.id, { notes: e.target.value })} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          {filtered.length === 0 && (
            <p className="text-center text-sm text-muted-foreground py-8">No insurers in this bucket yet.</p>
          )}
        </div>
      </div>
    </>
  );
}
