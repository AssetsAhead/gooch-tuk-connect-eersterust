import { createClient } from "@supabase/supabase-js";
import { defineTool } from "@lovable.dev/mcp-js";

export default defineTool({
  name: "list_drive_to_own_programs",
  title: "List Drive-to-Own programs",
  description:
    "List the active Drive-to-Own program tiers with eligibility thresholds, timelines and graduation bonuses.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async () => {
    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_PUBLISHABLE_KEY!,
      { auth: { persistSession: false, autoRefreshToken: false } },
    );
    const { data, error } = await supabase
      .from("drive_to_own_programs")
      .select("*")
      .eq("is_active", true)
      .order("min_reputation_score", { ascending: true });
    if (error)
      return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
      structuredContent: { programs: data ?? [] },
    };
  },
});
