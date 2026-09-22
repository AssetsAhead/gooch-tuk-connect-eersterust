import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  KeyRound,
  Loader2,
  Copy,
  Check,
  X,
  RefreshCw,
  UserCheck,
  Clock,
  Ban,
} from "lucide-react";

interface AccessRequest {
  id: string;
  full_name: string;
  company: string | null;
  email: string;
  phone: string | null;
  message: string | null;
  status: string;
  issued_code: string | null;
  created_at: string;
}

interface AccessCode {
  id: string;
  code: string;
  label: string | null;
  investor_name: string | null;
  investor_email: string | null;
  is_active: boolean;
  max_uses: number | null;
  used_count: number | null;
  expires_at: string | null;
  last_used_at: string | null;
  created_at: string;
}

interface Acceptance {
  id: string;
  full_name: string;
  company: string | null;
  email: string;
  access_code: string | null;
  accepted_at: string;
}

const ROOM_URL = `${window.location.origin}/investor-room`;

const makeCode = () => {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const block = (n: number) =>
    Array.from({ length: n }, () => alphabet[Math.floor(Math.random() * alphabet.length)]).join("");
  return `MOJA-${block(4)}-${block(4)}`;
};

const fmt = (iso: string | null) =>
  iso ? new Date(iso).toLocaleString("en-ZA", { dateStyle: "medium", timeStyle: "short" }) : "—";

export default function InvestorAccessAdmin() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [requests, setRequests] = useState<AccessRequest[]>([]);
  const [codes, setCodes] = useState<AccessCode[]>([]);
  const [acceptances, setAcceptances] = useState<Acceptance[]>([]);

  const load = useCallback(async () => {
    setLoading(true);
    const [r, c, a] = await Promise.all([
      supabase
        .from("investor_access_requests")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100),
      supabase
        .from("investor_access_codes")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100),
      supabase
        .from("investor_nda_acceptances")
        .select("*")
        .order("accepted_at", { ascending: false })
        .limit(50),
    ]);
    if (r.error || c.error || a.error) {
      toast.error("Could not load investor access records");
    }
    setRequests((r.data as AccessRequest[]) ?? []);
    setCodes((c.data as AccessCode[]) ?? []);
    setAcceptances((a.data as Acceptance[]) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const copyInvite = async (code: string, name: string) => {
    const text = `Hi ${name.split(" ")[0]},\n\nHere is your personal access to the confidential investor room:\n\n${ROOM_URL}\nAccess code: ${code}\n\nThe code is issued to you only, works once and expires in 14 days.\n\nMalcolm Johnston\nMobilityOne (Pty) Ltd t/a PoortLink`;
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Invitation copied — paste it into WhatsApp or email");
    } catch {
      toast.error("Could not copy. The code is " + code);
    }
  };

  const issueCode = async (req: AccessRequest) => {
    if (!user) return;
    setBusyId(req.id);
    const code = makeCode();
    const expires = new Date(Date.now() + 14 * 86400000).toISOString();

    const { error: codeError } = await supabase.from("investor_access_codes").insert({
      code,
      label: `${req.full_name}${req.company ? ` — ${req.company}` : ""}`,
      investor_name: req.full_name,
      investor_email: req.email,
      max_uses: 1,
      used_count: 0,
      is_active: true,
      expires_at: expires,
      created_by: user.id,
    });

    if (codeError) {
      toast.error("Could not create the code");
      setBusyId(null);
      return;
    }

    const { error: reqError } = await supabase
      .from("investor_access_requests")
      .update({
        status: "approved",
        issued_code: code,
        reviewed_by: user.id,
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", req.id);

    if (reqError) toast.error("Code created, but the request status did not update");
    else toast.success(`Code ${code} issued to ${req.full_name}`);

    await copyInvite(code, req.full_name);
    setBusyId(null);
    load();
  };

  const declineRequest = async (req: AccessRequest) => {
    if (!user) return;
    setBusyId(req.id);
    const { error } = await supabase
      .from("investor_access_requests")
      .update({
        status: "declined",
        reviewed_by: user.id,
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", req.id);
    if (error) toast.error("Could not update the request");
    else toast.success("Request declined");
    setBusyId(null);
    load();
  };

  const revokeCode = async (code: AccessCode) => {
    setBusyId(code.id);
    const { error } = await supabase
      .from("investor_access_codes")
      .update({ is_active: false })
      .eq("id", code.id);
    if (error) toast.error("Could not revoke the code");
    else toast.success(`${code.code} can no longer be used`);
    setBusyId(null);
    load();
  };

  const pending = requests.filter((r) => r.status === "pending");
  const reviewed = requests.filter((r) => r.status !== "pending");

  const codeStatus = (c: AccessCode) => {
    if (!c.is_active) return { label: "Revoked or used up", variant: "secondary" as const };
    if (c.expires_at && new Date(c.expires_at) < new Date())
      return { label: "Expired", variant: "secondary" as const };
    return { label: "Active", variant: "default" as const };
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-5xl space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <KeyRound className="h-7 w-7 text-primary" /> Investor Access
            </h1>
            <p className="text-muted-foreground mt-1">
              Approve who gets into the confidential room, hand out personal codes, and see who has
              entered.
            </p>
          </div>
          <Button variant="outline" onClick={load} disabled={loading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Refresh
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Clock className="h-5 w-5 text-primary" /> Waiting for your decision
              {pending.length > 0 && <Badge>{pending.length}</Badge>}
            </CardTitle>
            <CardDescription>
              Each approval creates a code for that person only. It works once and expires after 14
              days.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading && <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />}
            {!loading && pending.length === 0 && (
              <p className="text-sm text-muted-foreground">No one is waiting right now.</p>
            )}
            {pending.map((req) => (
              <div key={req.id} className="rounded-lg border p-4 space-y-3">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold">{req.full_name}</p>
                    <p className="text-sm text-muted-foreground">
                      {req.company || "No company given"} · {req.email}
                      {req.phone ? ` · ${req.phone}` : ""}
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground">{fmt(req.created_at)}</span>
                </div>
                {req.message && (
                  <p className="text-sm bg-muted/50 rounded-md p-3 whitespace-pre-wrap">
                    {req.message}
                  </p>
                )}
                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    onClick={() => issueCode(req)}
                    disabled={busyId === req.id || !user}
                  >
                    {busyId === req.id ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Check className="mr-2 h-4 w-4" />
                    )}
                    Approve and copy invitation
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => declineRequest(req)}
                    disabled={busyId === req.id}
                  >
                    <X className="mr-2 h-4 w-4" /> Decline
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Codes you have issued</CardTitle>
            <CardDescription>
              Revoke a code the moment you think it has been passed on.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {!loading && codes.length === 0 && (
              <p className="text-sm text-muted-foreground">No codes yet.</p>
            )}
            {codes.map((c) => {
              const status = codeStatus(c);
              return (
                <div
                  key={c.id}
                  className="rounded-lg border p-4 flex flex-wrap items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <p className="font-mono font-semibold">{c.code}</p>
                    <p className="text-sm text-muted-foreground truncate">
                      {c.investor_name || c.label || "Shared code"}
                      {c.investor_email ? ` · ${c.investor_email}` : ""}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Used {c.used_count ?? 0} of {c.max_uses ?? 1} · Expires {fmt(c.expires_at)} ·
                      Last used {fmt(c.last_used_at)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={status.variant}>{status.label}</Badge>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => copyInvite(c.code, c.investor_name || "there")}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    {c.is_active && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => revokeCode(c)}
                        disabled={busyId === c.id}
                      >
                        <Ban className="mr-2 h-4 w-4" /> Revoke
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <UserCheck className="h-5 w-5 text-primary" /> Who has entered
            </CardTitle>
            <CardDescription>
              Each entry is a recorded acceptance of the confidentiality terms.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {!loading && acceptances.length === 0 && (
              <p className="text-sm text-muted-foreground">No one has entered yet.</p>
            )}
            {acceptances.map((a, i) => (
              <div key={a.id}>
                {i > 0 && <Separator className="my-2" />}
                <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
                  <span>
                    <span className="font-medium">{a.full_name}</span>
                    {a.company ? ` · ${a.company}` : ""} · {a.email}
                  </span>
                  <span className="text-muted-foreground">
                    {a.access_code ? `${a.access_code} · ` : ""}
                    {fmt(a.accepted_at)}
                  </span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {reviewed.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Earlier requests</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {reviewed.map((r) => (
                <div
                  key={r.id}
                  className="flex flex-wrap items-center justify-between gap-2 text-sm border-b last:border-0 pb-2"
                >
                  <span>
                    <span className="font-medium">{r.full_name}</span> · {r.email}
                  </span>
                  <span className="text-muted-foreground">
                    {r.status}
                    {r.issued_code ? ` · ${r.issued_code}` : ""} · {fmt(r.created_at)}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
