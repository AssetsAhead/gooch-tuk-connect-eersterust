import { createClient } from "@supabase/supabase-js";
import { defineTool, type ToolContext } from "@lovable.dev/mcp-js";
import { z } from "zod";

function userClient(ctx: ToolContext) {
  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_PUBLISHABLE_KEY!,
    {
      global: { headers: { Authorization: `Bearer ${ctx.getToken()}` } },
      auth: { persistSession: false, autoRefreshToken: false },
    },
  );
}

export default defineTool({
  name: "get_zone_availability",
  title: "Zone availability (real-time)",
  description:
    "Real-time hailing / booking availability for a loading zone: waiting drivers in the queue, next-in-line vehicle, live driver count within the zone radius, and estimated wait based on recent departures. Requires sign-in.",
  inputSchema: {
    zone_id: z
      .string()
      .uuid()
      .optional()
      .describe("Loading zone UUID. Provide this OR zone_name."),
    zone_name: z
      .string()
      .optional()
      .describe("Zone name (case-insensitive contains match). Ignored if zone_id is given."),
  },
  annotations: { readOnlyHint: true, idempotentHint: false, openWorldHint: false },
  handler: async ({ zone_id, zone_name }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Sign in required." }], isError: true };
    }
    if (!zone_id && !zone_name) {
      return {
        content: [{ type: "text", text: "Provide zone_id or zone_name." }],
        isError: true,
      };
    }

    const sb = userClient(ctx);

    // Resolve the zone (RLS on loading_zones must allow the caller to see it).
    let zoneQ = sb
      .from("loading_zones")
      .select("id,zone_name,municipality,latitude,longitude,radius_meters,has_marshal,operating_hours,is_active")
      .eq("is_active", true)
      .limit(1);
    zoneQ = zone_id ? zoneQ.eq("id", zone_id) : zoneQ.ilike("zone_name", `%${zone_name}%`);
    const { data: zone, error: zoneErr } = await zoneQ.maybeSingle();
    if (zoneErr) return { content: [{ type: "text", text: zoneErr.message }], isError: true };
    if (!zone) return { content: [{ type: "text", text: "Zone not found." }], isError: true };

    // Waiting queue.
    const { data: queue, error: qErr } = await sb
      .from("zone_queue")
      .select("id,driver_id,vehicle_id,queue_position,status,joined_at,is_gps_verified,distance_from_zone")
      .eq("zone_id", zone.id)
      .eq("status", "waiting")
      .order("queue_position", { ascending: true });
    if (qErr) return { content: [{ type: "text", text: qErr.message }], isError: true };

    // Departures in the last hour for a rough wait estimate.
    const sinceIso = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { data: recentDepartures } = await sb
      .from("zone_queue")
      .select("id,departed_at,loading_started_at,joined_at")
      .eq("zone_id", zone.id)
      .not("departed_at", "is", null)
      .gte("departed_at", sinceIso);

    const departuresPerHour = recentDepartures?.length ?? 0;
    const waiting = queue?.length ?? 0;
    const estimatedWaitMinutes =
      departuresPerHour > 0 ? Math.round((waiting / departuresPerHour) * 60) : null;

    const summary = {
      zone: {
        id: zone.id,
        name: zone.zone_name,
        municipality: zone.municipality,
        has_marshal: zone.has_marshal,
        operating_hours: zone.operating_hours,
      },
      availability: {
        drivers_waiting: waiting,
        gps_verified_waiting: (queue ?? []).filter((r) => r.is_gps_verified).length,
        next_in_line: queue?.[0] ?? null,
        departures_last_hour: departuresPerHour,
        estimated_wait_minutes: estimatedWaitMinutes,
        status:
          waiting === 0
            ? "no_drivers_available"
            : waiting < 3
              ? "limited"
              : "available",
      },
      queue: queue ?? [],
      generated_at: new Date().toISOString(),
    };

    return {
      content: [{ type: "text", text: JSON.stringify(summary, null, 2) }],
      structuredContent: summary,
    };
  },
});
