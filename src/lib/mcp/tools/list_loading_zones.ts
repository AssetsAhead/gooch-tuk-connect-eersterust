import { createClient } from "@supabase/supabase-js";
import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";

export default defineTool({
  name: "list_loading_zones",
  title: "List loading zones",
  description:
    "List active taxi loading zones (pickup areas) with location, radius, marshal status, and operating hours.",
  inputSchema: {
    municipality: z
      .string()
      .optional()
      .describe("Optional filter: municipality name (e.g. 'Tshwane')."),
    limit: z
      .number()
      .int()
      .optional()
      .describe("Maximum number of zones to return. Default 50."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ municipality, limit }) => {
    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_PUBLISHABLE_KEY!,
      { auth: { persistSession: false, autoRefreshToken: false } },
    );
    let q = supabase
      .from("loading_zones")
      .select(
        "id,zone_name,zone_type,address,municipality,ward,latitude,longitude,radius_meters,has_marshal,operating_hours,is_active",
      )
      .eq("is_active", true)
      .limit(limit ?? 50);
    if (municipality) q = q.ilike("municipality", `%${municipality}%`);
    const { data, error } = await q;
    if (error)
      return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
      structuredContent: { zones: data ?? [] },
    };
  },
});
