import { useEffect, useState } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Lock, ShieldCheck, Loader2, MailCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const STORAGE_KEY = "investor_room_access_v1";
const VALID_DAYS = 30;

export interface InvestorAccessSession {
  fullName: string;
  company: string;
  email: string;
  acceptedAt: string;
}

const formSchema = z.object({
  code: z.string().trim().min(4, "Enter the access code you were given").max(64),
  fullName: z.string().trim().min(2, "Enter your full name").max(120),
  company: z.string().trim().max(160).optional(),
  email: z.string().trim().email("Enter a valid email address").max(255),
});

const requestSchema = z.object({
  fullName: z.string().trim().min(2, "Enter your full name").max(120),
  company: z.string().trim().max(160).optional(),
  email: z.string().trim().email("Enter a valid email address").max(255),
  phone: z.string().trim().max(40).optional(),
  message: z.string().trim().max(800).optional(),
});

export const readInvestorSession = (): InvestorAccessSession | null => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as InvestorAccessSession;
    const ageMs = Date.now() - new Date(parsed.acceptedAt).getTime();
    if (!parsed.acceptedAt || ageMs > VALID_DAYS * 86400000) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
};

export const clearInvestorSession = () => localStorage.removeItem(STORAGE_KEY);

interface Props {
  children: (session: InvestorAccessSession) => React.ReactNode;
}

export const InvestorNdaGate = ({ children }: Props) => {
  const [session, setSession] = useState<InvestorAccessSession | null>(null);
  const [checked, setChecked] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ code: "", fullName: "", company: "", email: "" });
  const [agreed, setAgreed] = useState(false);

  const [requesting, setRequesting] = useState(false);
  const [requestError, setRequestError] = useState<string | null>(null);
  const [requestSent, setRequestSent] = useState(false);
  const [reqForm, setReqForm] = useState({
    fullName: "",
    company: "",
    email: "",
    phone: "",
    message: "",
  });

  useEffect(() => {
    setSession(readInvestorSession());
    setChecked(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const parsed = formSchema.safeParse(form);
    if (!parsed.success) {
      setError(parsed.error.issues[0].message);
      return;
    }
    if (!agreed) {
      setError("Please confirm that you accept the confidentiality terms");
      return;
    }

    setSubmitting(true);
    try {
      const { data, error: fnError } = await supabase.functions.invoke("investor-access", {
        body: {
          action: "accept",
          code: parsed.data.code,
          fullName: parsed.data.fullName,
          company: parsed.data.company ?? "",
          email: parsed.data.email,
        },
      });

      if (fnError || !data?.accepted) {
        setError((data as { error?: string } | null)?.error ?? "That access code is not valid");
        return;
      }

      const next: InvestorAccessSession = {
        fullName: parsed.data.fullName,
        company: parsed.data.company ?? "",
        email: parsed.data.email,
        acceptedAt: new Date().toISOString(),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      setSession(next);
    } catch {
      setError("Could not verify your access right now. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setRequestError(null);

    const parsed = requestSchema.safeParse(reqForm);
    if (!parsed.success) {
      setRequestError(parsed.error.issues[0].message);
      return;
    }

    setRequesting(true);
    try {
      const { data, error: fnError } = await supabase.functions.invoke("investor-access", {
        body: { action: "request", ...parsed.data },
      });

      if (fnError || !data?.requested) {
        setRequestError(
          (data as { error?: string } | null)?.error ??
            "Could not send your request right now. Please try again.",
        );
        return;
      }
      setRequestSent(true);
    } catch {
      setRequestError("Could not send your request right now. Please try again.");
    } finally {
      setRequesting(false);
    }
  };

  if (!checked) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (session) return <>{children(session)}</>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-accent/10 flex items-center justify-center px-4 py-12">
      <Card className="w-full max-w-lg border-primary/20 shadow-lg">
        <CardHeader className="text-center">
          <div className="mx-auto mb-3 h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center">
            <Lock className="h-7 w-7 text-primary" />
          </div>
          <CardTitle className="text-2xl">Confidential Investor Room</CardTitle>
          <CardDescription>
            Everything about the business in one place — financials, pilot results, licensing and
            legal documents. Access is granted personally, by invitation, and covered by a
            non-disclosure undertaking.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="code">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="code">I have a code</TabsTrigger>
              <TabsTrigger value="request">Request access</TabsTrigger>
            </TabsList>

            <TabsContent value="code">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="code">Access code</Label>
                  <Input
                    id="code"
                    value={form.code}
                    onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                    placeholder="Enter the code you were given"
                    autoComplete="off"
                    maxLength={64}
                  />
                  <p className="text-xs text-muted-foreground">
                    Codes are issued to one person and can only be used once.
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full name</Label>
                  <Input
                    id="fullName"
                    value={form.fullName}
                    onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                    maxLength={120}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company">Company or fund (optional)</Label>
                  <Input
                    id="company"
                    value={form.company}
                    onChange={(e) => setForm({ ...form, company: e.target.value })}
                    maxLength={160}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    maxLength={255}
                  />
                  <p className="text-xs text-muted-foreground">
                    Use the address the code was sent to.
                  </p>
                </div>

                <div className="rounded-lg border bg-muted/40 p-4 text-sm text-muted-foreground max-h-40 overflow-y-auto space-y-2">
                  <p className="font-medium text-foreground">Confidentiality undertaking</p>
                  <p>
                    The information in this room is confidential and proprietary to MobilityOne (Pty)
                    Ltd t/a PoortLink, including its TukConnect and MojaRide platforms. It is shared
                    solely for the purpose of evaluating a potential investment.
                  </p>
                  <p>
                    By continuing you undertake not to disclose, copy, distribute or use this
                    information for any other purpose, not to share your access code or this link
                    with anyone else, and to keep it confidential for 24 months from today. You
                    accept that no licence to any intellectual property is granted and that financial
                    projections are estimates, not guarantees.
                  </p>
                  <p>
                    Your name, company, email and the time of acceptance are recorded as evidence of
                    this undertaking, in line with POPIA.
                  </p>
                </div>

                <div className="flex items-start gap-3">
                  <Checkbox
                    id="agree"
                    checked={agreed}
                    onCheckedChange={(v) => setAgreed(v === true)}
                  />
                  <Label htmlFor="agree" className="text-sm font-normal leading-snug">
                    I accept these confidentiality terms and confirm the details above are mine.
                  </Label>
                </div>

                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <Button type="submit" className="w-full" disabled={submitting}>
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Verifying
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="mr-2 h-4 w-4" /> Accept and enter
                    </>
                  )}
                </Button>
                <p className="text-xs text-muted-foreground text-center">
                  A full signable NDA is available inside the room.
                </p>
              </form>
            </TabsContent>

            <TabsContent value="request">
              {requestSent ? (
                <div className="text-center space-y-3 py-6">
                  <div className="mx-auto h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <MailCheck className="h-6 w-6 text-primary" />
                  </div>
                  <p className="font-medium">Request received</p>
                  <p className="text-sm text-muted-foreground">
                    Malcolm has been alerted. If access is granted, a personal code will be sent to
                    the email address you gave.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleRequest} className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Tell us who you are. Nothing opens until access is granted personally.
                  </p>
                  <div className="space-y-2">
                    <Label htmlFor="rName">Full name</Label>
                    <Input
                      id="rName"
                      value={reqForm.fullName}
                      onChange={(e) => setReqForm({ ...reqForm, fullName: e.target.value })}
                      maxLength={120}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="rCompany">Company or fund</Label>
                    <Input
                      id="rCompany"
                      value={reqForm.company}
                      onChange={(e) => setReqForm({ ...reqForm, company: e.target.value })}
                      maxLength={160}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="rEmail">Email address</Label>
                    <Input
                      id="rEmail"
                      type="email"
                      value={reqForm.email}
                      onChange={(e) => setReqForm({ ...reqForm, email: e.target.value })}
                      maxLength={255}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="rPhone">Phone or WhatsApp (optional)</Label>
                    <Input
                      id="rPhone"
                      value={reqForm.phone}
                      onChange={(e) => setReqForm({ ...reqForm, phone: e.target.value })}
                      maxLength={40}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="rMessage">How did you hear about us? (optional)</Label>
                    <Textarea
                      id="rMessage"
                      value={reqForm.message}
                      onChange={(e) => setReqForm({ ...reqForm, message: e.target.value })}
                      maxLength={800}
                      rows={3}
                    />
                  </div>

                  {requestError && (
                    <Alert variant="destructive">
                      <AlertDescription>{requestError}</AlertDescription>
                    </Alert>
                  )}

                  <Button type="submit" className="w-full" disabled={requesting}>
                    {requesting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending
                      </>
                    ) : (
                      "Request access"
                    )}
                  </Button>
                </form>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
