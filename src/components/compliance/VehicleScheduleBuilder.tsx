import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Car, Plus, Printer, Trash2, Info } from "lucide-react";

interface FleetVehicle {
  id: string;
  registration: string;
  make: string;
  model: string;
  year: string;
  vin: string;
  ownership: "operator" | "member";
  ownerName: string;
  seats: string;
  estValue: string;
  overnightParking: string;
  trackerFitted: boolean;
  roadworthyValidTo: string;
}

const SCHEDULE_KEY = "insurance_vehicle_schedule_v1";

const BLANK: Omit<FleetVehicle, "id"> = {
  registration: "",
  make: "",
  model: "",
  year: "",
  vin: "",
  ownership: "operator",
  ownerName: "",
  seats: "15",
  estValue: "",
  overnightParking: "Eersterust, Pretoria",
  trackerFitted: true,
  roadworthyValidTo: "",
};

function load(): FleetVehicle[] {
  try {
    const raw = localStorage.getItem(SCHEDULE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

const money = (v: string) => (v ? `R ${v}` : "—");

export const VehicleScheduleBuilder = () => {
  const [vehicles, setVehicles] = useState<FleetVehicle[]>(load);

  useEffect(() => {
    localStorage.setItem(SCHEDULE_KEY, JSON.stringify(vehicles));
  }, [vehicles]);

  const update = (id: string, patch: Partial<FleetVehicle>) =>
    setVehicles((prev) => prev.map((v) => (v.id === id ? { ...v, ...patch } : v)));

  const addVehicle = () =>
    setVehicles((prev) => [{ id: crypto.randomUUID(), ...BLANK }, ...prev]);

  const remove = (id: string) => {
    if (confirm("Remove this vehicle from the schedule?")) {
      setVehicles((prev) => prev.filter((v) => v.id !== id));
    }
  };

  const totals = useMemo(() => {
    const seats = vehicles.reduce((a, v) => a + (parseInt(v.seats, 10) || 0), 0);
    const value = vehicles.reduce((a, v) => a + (parseFloat(v.estValue.replace(/[^0-9.]/g, "")) || 0), 0);
    return { count: vehicles.length, seats, value };
  }, [vehicles]);

  const printSchedule = () => {
    const rows = vehicles
      .map(
        (v) => `<tr>
          <td>${esc(v.registration) || "—"}</td>
          <td>${esc(`${v.make} ${v.model}`.trim()) || "—"}${v.year ? ` (${esc(v.year)})` : ""}</td>
          <td>${esc(v.vin) || "—"}</td>
          <td>${v.ownership === "operator" ? "Operator" : `Member: ${esc(v.ownerName) || "—"}`}</td>
          <td>${esc(v.seats) || "—"}</td>
          <td style="text-align:right">${money(esc(v.estValue))}</td>
          <td>${esc(v.overnightParking) || "—"}</td>
          <td>${v.trackerFitted ? "Yes" : "No"}</td>
        </tr>`
      )
      .join("");

    const html = `<!doctype html>
<html><head><meta charset="utf-8"><title>Schedule of Vehicles — Passenger Transport Operator</title>
<style>
  body { font-family: Arial, Helvetica, sans-serif; color:#111; margin:32px; font-size:12px; }
  h1 { font-size:18px; margin:0 0 2px; }
  .sub { color:#444; margin:0 0 16px; font-size:12px; }
  table { width:100%; border-collapse:collapse; margin-top:10px; }
  th, td { border:1px solid #999; padding:6px 8px; text-align:left; vertical-align:top; }
  th { background:#eee; font-size:11px; }
  .totals { margin-top:12px; font-size:12px; }
  .note { margin-top:20px; font-size:11px; color:#333; border:1px solid #ccc; padding:10px; }
  .foot { margin-top:24px; font-size:11px; color:#555; }
  @media print { .note { page-break-inside: avoid; } }
</style></head><body>
<h1>Schedule of Vehicles</h1>
<p class="sub">Passenger transport operator — Eersterust, Pretoria. Schedule prepared for quotation purposes.</p>
<table>
  <thead><tr>
    <th>Registration</th><th>Make / Model</th><th>VIN</th><th>Owner</th>
    <th>Seats</th><th>Est. value</th><th>Overnight parking</th><th>Tracker / camera</th>
  </tr></thead>
  <tbody>${rows || `<tr><td colspan="8">No vehicles captured yet.</td></tr>`}</tbody>
</table>
<p class="totals"><strong>Total vehicles:</strong> ${totals.count} &nbsp;|&nbsp; <strong>Total seats:</strong> ${totals.seats} &nbsp;|&nbsp; <strong>Total estimated value:</strong> ${money(totals.value.toLocaleString("en-ZA", { maximumFractionDigits: 0 }))}</p>
<div class="note">
  <strong>Notes for the underwriter</strong>
  <ul style="margin:6px 0 0 16px; padding:0;">
    <li>Use: fare-paying passenger transport (minibus taxi class) operating from designated loading zones in Eersterust, Pretoria.</li>
    <li>Every vehicle is fitted with GPS tracking and a dashcam; trips are logged per shift.</li>
    <li>Drivers are verified, hold valid licences and PrDPs, and clock in and out by shift.</li>
    <li>Vehicles owned by member-operators are operated under a written agreement with this operator; ownership is disclosed per vehicle above.</li>
    <li>Schedule to be adjusted (vehicles added or removed) as the pilot fleet grows — a declaration / adjustable basis is requested.</li>
  </ul>
</div>
<p class="foot">Passenger liability to be quoted per seat on the vehicles above, alongside commercial vehicle cover. Public liability attaches at the loading zones.</p>
<script>window.onload = () => window.print();</script>
</body></html>`;

    const w = window.open("", "_blank", "width=980,height=760");
    if (!w) {
      alert("Please allow pop-ups to print the schedule.");
      return;
    }
    w.document.write(html);
    w.document.close();
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            <Car className="h-6 w-6 text-primary" />
            <div>
              <CardTitle>Schedule of Vehicles</CardTitle>
              <CardDescription>
                The exact list insurers quote against. Add the vehicles that operate today — even one is enough to start.
              </CardDescription>
            </div>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={printSchedule} className="print:hidden">
              <Printer className="h-4 w-4 mr-1" /> Print / save schedule
            </Button>
            <Button size="sm" onClick={addVehicle} className="print:hidden">
              <Plus className="h-4 w-4 mr-1" /> Add vehicle
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-lg border p-3 bg-muted/30 flex gap-2 print:hidden">
          <Info className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
          <div className="text-sm space-y-1 text-muted-foreground">
            <p>
              <strong className="text-foreground">How to answer "which vehicles?"</strong> Start with what actually runs
              today — your own vehicle, or the first member vehicle. Vehicles owned by member-operators are listed
              under their names; the printed schedule discloses ownership so the underwriter sees a clean structure.
            </p>
            <p>
              Ask the broker for a <strong className="text-foreground">declaration / adjustable basis</strong>: the
              premium follows the schedule, so vehicles can be added mid-term as owners join, without re-quoting from zero.
            </p>
          </div>
        </div>

        {vehicles.length > 0 && (
          <div className="flex flex-wrap gap-2 print:hidden">
            <Badge variant="outline">{totals.count} vehicle{totals.count === 1 ? "" : "s"}</Badge>
            <Badge variant="outline">{totals.seats} seats</Badge>
            <Badge variant="outline">
              Est. fleet value {money(totals.value.toLocaleString("en-ZA", { maximumFractionDigits: 0 }))}
            </Badge>
          </div>
        )}

        {vehicles.length === 0 && (
          <p className="text-sm text-muted-foreground py-4 text-center border border-dashed rounded-lg">
            No vehicles captured yet. Add the first vehicle that will operate on day one of the pilot.
          </p>
        )}

        <div className="space-y-3">
          {vehicles.map((v) => (
            <div key={v.id} className="rounded-lg border p-3 space-y-3">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <Badge variant={v.ownership === "operator" ? "default" : "secondary"}>
                  {v.ownership === "operator" ? "Operator-owned" : "Member-owned"}
                </Badge>
                <Button variant="ghost" size="icon" onClick={() => remove(v.id)} className="print:hidden">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">Registration</label>
                  <Input
                    placeholder="e.g. JT 45 XX GP"
                    value={v.registration}
                    onChange={(e) => update(v.id, { registration: e.target.value.toUpperCase() })}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">Make</label>
                  <Input placeholder="e.g. Toyota" value={v.make} onChange={(e) => update(v.id, { make: e.target.value })} />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">Model</label>
                  <Input placeholder="e.g. Quantum" value={v.model} onChange={(e) => update(v.id, { model: e.target.value })} />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">Year</label>
                  <Input placeholder="e.g. 2019" value={v.year} onChange={(e) => update(v.id, { year: e.target.value })} />
                </div>
                <div className="space-y-1 md:col-span-2">
                  <label className="text-xs text-muted-foreground">VIN</label>
                  <Input value={v.vin} onChange={(e) => update(v.id, { vin: e.target.value })} />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">Ownership</label>
                  <Select value={v.ownership} onValueChange={(val) => update(v.id, { ownership: val as FleetVehicle["ownership"] })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="operator">Operator-owned</SelectItem>
                      <SelectItem value="member">Member-owned</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">Owner name (if member)</label>
                  <Input value={v.ownerName} onChange={(e) => update(v.id, { ownerName: e.target.value })} />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">Seats</label>
                  <Input type="number" min="1" value={v.seats} onChange={(e) => update(v.id, { seats: e.target.value })} />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">Est. value (R)</label>
                  <Input placeholder="e.g. 320000" value={v.estValue} onChange={(e) => update(v.id, { estValue: e.target.value })} />
                </div>
                <div className="space-y-1 md:col-span-2">
                  <label className="text-xs text-muted-foreground">Overnight parking</label>
                  <Input value={v.overnightParking} onChange={(e) => update(v.id, { overnightParking: e.target.value })} />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">Roadworthy valid to</label>
                  <Input type="date" value={v.roadworthyValidTo} onChange={(e) => update(v.id, { roadworthyValidTo: e.target.value })} />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">Tracker / dashcam fitted</label>
                  <Select
                    value={v.trackerFitted ? "yes" : "no"}
                    onValueChange={(val) => update(v.id, { trackerFitted: val === "yes" })}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="yes">Yes — fitted</SelectItem>
                      <SelectItem value="no">Not yet</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
