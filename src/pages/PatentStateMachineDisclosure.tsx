import { useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { FileDown, AlertTriangle, Workflow } from "lucide-react";
import { useReportGeneration } from "@/hooks/useReportGeneration";
import { ReportShareDialog } from "@/components/reports/ReportShareDialog";

/** Canonical states of the confidence-qualified incident escalation machine. */
const states = [
  {
    id: "S0",
    name: "IDLE / MONITORING",
    description:
      "Edge device (4G/5G DVR or handset) is capturing sensor frames. No candidate event. No evidence is persisted beyond the rolling buffer.",
    persisted: "Rolling buffer only (volatile)",
    exit: "Candidate signal exceeds detector trigger threshold",
  },
  {
    id: "S1",
    name: "CANDIDATE DETECTED",
    description:
      "Detector emits a candidate incident with a raw confidence score and classification label (collision, panic, loitering, plate-of-interest).",
    persisted: "Candidate record with score, label, device id, coordinates, monotonic timestamp",
    exit: "Confidence evaluation completes",
  },
  {
    id: "S2",
    name: "CONFIDENCE GATED — LOW",
    description:
      "Score below the escalation floor. Event is retained for model feedback only. No human is notified, no dispatch occurs, no identity data is resolved.",
    persisted: "Candidate record marked suppressed; POPIA minimisation applied",
    exit: "Retention window expires (auto-purge) or re-scored upward by later frames",
  },
  {
    id: "S3",
    name: "CONFIDENCE GATED — HIGH",
    description:
      "Score at or above the escalation floor. Event is promoted to a qualified incident and an evidence bundle is sealed with a content hash.",
    persisted: "Qualified incident + SHA-256 evidence manifest of frames, GPS trail, device attestations",
    exit: "Escalation routing evaluated against connectivity state",
  },
  {
    id: "S4",
    name: "ESCALATION QUEUED (OFFLINE)",
    description:
      "Qualified incident exists but the uplink is unavailable or degraded. Bundle is queued locally in ordered, hash-chained form so that ordering and integrity survive the outage.",
    persisted: "Local durable queue, hash-chained, monotonic sequence numbers",
    exit: "Connectivity restored, or local fallback channel (SMS/PTT) succeeds",
  },
  {
    id: "S5",
    name: "ESCALATION DISPATCHED",
    description:
      "Incident routed to the correct responder tier by jurisdiction and role (marshal zone → owner → police/TMPD war room), with a deterministic escalation ladder and acknowledgement deadlines.",
    persisted: "Dispatch record per recipient tier, channel used, send timestamps",
    exit: "Acknowledgement received, or deadline lapses",
  },
  {
    id: "S6",
    name: "ESCALATED — TIER UP",
    description:
      "No acknowledgement within the deadline. Machine advances the ladder to the next tier and widens the notification radius. Escalation is idempotent — replays cannot duplicate dispatch.",
    persisted: "Ladder position, retry counters, idempotency keys",
    exit: "Acknowledgement received at any tier",
  },
  {
    id: "S7",
    name: "ACKNOWLEDGED / IN RESPONSE",
    description:
      "A responder has accepted the incident. Live GPS trail and voice channel are bound to the incident id for the duration of the response.",
    persisted: "Responder identity, accept timestamp, bound live channels",
    exit: "Responder closes, or auto-close timer with no activity",
  },
  {
    id: "S8",
    name: "RESOLVED / SEALED",
    description:
      "Incident closed. Evidence manifest is re-verified against the stored hash and the chain is sealed; the record becomes immutable and audit-exportable (AARTO / court-ready).",
    persisted: "Immutable sealed record + verification result",
    exit: "Terminal",
  },
  {
    id: "S9",
    name: "REJECTED / FALSE POSITIVE",
    description:
      "Responder or reviewer marks the qualified incident as false. Event is retained as a labelled negative for detector retraining; personal data fields are stripped.",
    persisted: "Labelled negative, de-identified",
    exit: "Terminal",
  },
];

const transitions = [
  ["T1", "S0", "S1", "raw_score > detector_trigger", "Candidate created; no notification"],
  ["T2", "S1", "S2", "score < escalation_floor", "Suppress; retain for training"],
  ["T3", "S1", "S3", "score >= escalation_floor", "Seal evidence bundle, compute SHA-256 manifest"],
  ["T4", "S2", "S3", "re-score on later frames crosses floor", "Promote using original capture timestamps"],
  ["T5", "S3", "S4", "uplink unavailable OR latency > threshold", "Enqueue hash-chained bundle locally"],
  ["T6", "S3", "S5", "uplink healthy", "Dispatch to tier-1 responders in jurisdiction"],
  ["T7", "S4", "S5", "connectivity restored", "Flush queue in sequence; dedupe by idempotency key"],
  ["T8", "S4", "S5", "fallback channel succeeds (SMS / PTT broadcast)", "Degraded dispatch with reduced payload"],
  ["T9", "S5", "S6", "ack deadline lapsed", "Advance ladder, widen radius"],
  ["T10", "S6", "S6", "ack deadline lapsed again (bounded retries)", "Advance ladder to terminal tier"],
  ["T11", "S5/S6", "S7", "responder acknowledges", "Bind live GPS + voice channel"],
  ["T12", "S7", "S8", "responder closes incident", "Re-verify manifest, seal chain"],
  ["T13", "S7", "S9", "reviewer marks false positive", "De-identify, label negative"],
  ["T14", "S4", "S4", "queue persists across device restart", "Ordering and integrity preserved"],
];

const connectivityBehaviour = [
  {
    mode: "Online (healthy uplink)",
    rule: "Direct dispatch, full payload including frames and GPS trail. Acknowledgement deadlines run at nominal duration.",
  },
  {
    mode: "Degraded (high latency / packet loss)",
    rule: "Payload reduced to manifest hash + metadata; frames uploaded lazily. Deadlines extended by a bounded factor.",
  },
  {
    mode: "Offline (no uplink)",
    rule: "Qualified incidents enter the local durable queue, hash-chained with monotonic sequence numbers. No dispatch attempt is lost or reordered.",
  },
  {
    mode: "Offline with local mesh / radio",
    rule: "Fallback channel (SMS to responder numbers, or zone-scoped push-to-talk broadcast) carries a compact incident notice; full evidence syncs later.",
  },
  {
    mode: "Reconnection",
    rule: "Queue flushes in sequence. Idempotency keys prevent duplicate dispatch for events already delivered via fallback.",
  },
  {
    mode: "Clock skew",
    rule: "Capture timestamps are monotonic device-local plus server-received time; both are retained so ordering survives skew and is auditable.",
  },
];

const claimSupport = [
  ["Independent claim anchor", "The confidence-gated transition S1→S3 combined with connectivity-conditional routing S3→{S4,S5} and integrity-preserving offline queue behaviour (T5, T7, T14)."],
  ["Not claimed alone", "AI collision detection, ALPR, SHA-256 hashing, confidence scoring, POPIA controls — each is covered by prior art in isolation."],
  ["Distinguishing feature", "Escalation ladder is deterministic, idempotent, and jurisdiction-scoped, and the evidence manifest is sealed at the moment of qualification rather than at upload."],
  ["Enablement", "States, persisted artefacts, transition guards, retry bounds and fallback channels are fully specified above and implemented in the platform."],
];

export default function PatentStateMachineDisclosure() {
  const {
    generatePdfReport,
    downloadPdf,
    printReport,
    shareViaWhatsApp,
    shareViaEmail,
    shareViaSms,
    showShareDialog,
    setShowShareDialog,
    pdfDataUrl,
    isGenerating,
  } = useReportGeneration();

  useEffect(() => {
    document.title = "Patent State-Machine Disclosure | Incident Escalation";
    const desc = document.querySelector('meta[name="description"]');
    if (desc) {
      desc.setAttribute(
        "content",
        "Structured, attorney-ready disclosure of the confidence-qualified incident escalation state machine: states, transitions, and offline connectivity behaviour."
      );
    }
  }, []);

  const asciiDiagram = useMemo(
    () =>
      [
        "S0 IDLE ──T1──> S1 CANDIDATE",
        "                  ├──T2──> S2 LOW  ──T4──┐",
        "                  └──T3──> S3 QUALIFIED <┘",
        "                              ├──T5──> S4 QUEUED(OFFLINE) ──T7/T8──┐",
        "                              └──T6──> S5 DISPATCHED <─────────────┘",
        "                                          ├──T9──> S6 TIER UP ──T10──> (bounded)",
        "                                          └──T11─> S7 IN RESPONSE",
        "                                                      ├──T12──> S8 SEALED",
        "                                                      └──T13──> S9 REJECTED",
      ].join("\n"),
    []
  );

  const handleExport = () => {
    generatePdfReport({
      title: "Patent Disclosure Annex: Incident Escalation State Machine",
      subtitle: "Attorney-ready structured disclosure — DRAFT, NOT FILED",
      companyName: "Malcolm Gerard Johnston",
      companyRef: "Annex A — State-Machine Disclosure",
      headerColor: [30, 64, 120],
      footer: "CONFIDENTIAL — DRAFT DISCLOSURE, NO FILING HAS BEEN MADE",
      sections: [
        {
          title: "0. Filing Status",
          content:
            "This document is a draft technical disclosure prepared for a registered patent attorney. No CIPC filing has been lodged. Any dates appearing in draft P1/P3/P6/P26 forms in the platform are system-generated placeholders and do not represent an actual filing or declaration date.",
        },
        {
          title: "1. Field and Purpose of the Disclosure",
          content:
            "The disclosure defines a finite-state machine that converts sensor-derived candidate incidents into confidence-qualified, integrity-sealed, jurisdiction-routed escalations that behave deterministically across online, degraded and fully offline connectivity.",
        },
        {
          title: "2. States",
          table: {
            headers: ["ID", "State", "Persisted artefacts", "Exit condition"],
            rows: states.map((s) => [s.id, s.name, s.persisted, s.exit]),
          },
        },
        {
          title: "3. State Descriptions",
          list: states.map((s) => `${s.id} ${s.name}: ${s.description}`),
        },
        {
          title: "4. Transitions",
          table: {
            headers: ["ID", "From", "To", "Guard", "Effect"],
            rows: transitions,
          },
        },
        {
          title: "5. Connectivity-Conditional Behaviour",
          table: {
            headers: ["Connectivity mode", "Machine behaviour"],
            rows: connectivityBehaviour.map((c) => [c.mode, c.rule]),
          },
        },
        {
          title: "6. Claim Support Notes for Attorney",
          table: {
            headers: ["Aspect", "Note"],
            rows: claimSupport,
          },
        },
      ],
    });
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <header className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <Workflow className="h-6 w-6 text-primary" />
          <Badge variant="outline">Annex A</Badge>
          <Badge variant="destructive">Draft — not filed</Badge>
        </div>
        <h1 className="text-3xl font-bold tracking-tight">
          Patent State-Machine Disclosure
        </h1>
        <p className="text-muted-foreground mt-2">
          The confidence-qualified incident escalation machine — states, transitions and
          connectivity behaviour — captured in structured form for a registered patent attorney.
        </p>
      </header>

      <Alert variant="destructive" className="mb-6">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Filing status: nothing lodged</AlertTitle>
        <AlertDescription>
          No CIPC patent filing has been made. Declaration dates shown on draft P1/P3/P6/P26
          forms elsewhere in the app (including 6 Aug 2026) are auto-generated placeholders and
          carry no legal effect.
        </AlertDescription>
      </Alert>

      <div className="flex justify-end mb-6">
        <Button onClick={handleExport} disabled={isGenerating}>
          <FileDown className="h-4 w-4 mr-2" />
          {isGenerating ? "Generating..." : "Export attorney annex (PDF)"}
        </Button>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>State diagram</CardTitle>
          <CardDescription>Deterministic transitions with bounded retries.</CardDescription>
        </CardHeader>
        <CardContent>
          <pre className="text-xs sm:text-sm overflow-x-auto bg-muted p-4 rounded-md leading-relaxed">
            {asciiDiagram}
          </pre>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>1. States</CardTitle>
          <CardDescription>What exists, what is persisted, and when it leaves the state.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {states.map((s) => (
            <div key={s.id} className="border border-border rounded-md p-4">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <Badge>{s.id}</Badge>
                <span className="font-semibold">{s.name}</span>
              </div>
              <p className="text-sm text-muted-foreground mb-3">{s.description}</p>
              <div className="grid gap-2 sm:grid-cols-2 text-sm">
                <div>
                  <span className="font-medium">Persisted: </span>
                  <span className="text-muted-foreground">{s.persisted}</span>
                </div>
                <div>
                  <span className="font-medium">Exit: </span>
                  <span className="text-muted-foreground">{s.exit}</span>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>2. Transitions</CardTitle>
          <CardDescription>Guard conditions and their effects.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>From</TableHead>
                  <TableHead>To</TableHead>
                  <TableHead>Guard</TableHead>
                  <TableHead>Effect</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transitions.map((t) => (
                  <TableRow key={t[0]}>
                    <TableCell className="font-mono text-xs">{t[0]}</TableCell>
                    <TableCell className="font-mono text-xs">{t[1]}</TableCell>
                    <TableCell className="font-mono text-xs">{t[2]}</TableCell>
                    <TableCell className="text-sm">{t[3]}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{t[4]}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>3. Connectivity-conditional behaviour</CardTitle>
          <CardDescription>
            The behaviour that carries the novelty: escalation integrity across outages.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {connectivityBehaviour.map((c) => (
            <div key={c.mode} className="border-l-2 border-primary pl-4">
              <p className="font-medium text-sm">{c.mode}</p>
              <p className="text-sm text-muted-foreground">{c.rule}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="mb-10">
        <CardHeader>
          <CardTitle>4. Claim-support notes for the attorney</CardTitle>
          <CardDescription>Where to aim the claims, and what not to claim alone.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {claimSupport.map(([aspect, note]) => (
            <div key={aspect}>
              <p className="font-medium text-sm">{aspect}</p>
              <p className="text-sm text-muted-foreground">{note}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <ReportShareDialog
        open={showShareDialog}
        onOpenChange={setShowShareDialog}
        title="Patent State-Machine Disclosure (Annex A)"
        pdfDataUrl={pdfDataUrl}
        onDownload={downloadPdf}
        onPrint={printReport}
        onShareWhatsApp={shareViaWhatsApp}
        onShareEmail={shareViaEmail}
        onShareSms={shareViaSms}
        reportSummary="Draft patent disclosure annex: confidence-qualified incident escalation state machine (states, transitions, offline behaviour). No CIPC filing has been lodged."
        emailSubject="Annex A — Incident Escalation State Machine (draft disclosure)"
        emailBody="Attached is the structured state-machine disclosure for review. Note: no filing has been lodged; dates in draft forms are placeholders."
        filename="Patent_State_Machine_Disclosure_AnnexA.pdf"
      />
    </div>
  );
}
