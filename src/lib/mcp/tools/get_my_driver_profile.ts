import { createClient } from "@supabase/supabase-js";
import { defineTool, type ToolContext } from "@lovable.dev/mcp-js";

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
  name: "get_my_driver_profile",
  title: "My driver profile & reputation",
  description:
    "Return the signed-in driver's profile row plus reputation score, compliance score, and infringement count. Requires a driver record for the caller.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async (_input, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Sign in required." }], isError: true };
    }
    const sb = userClient(ctx);
    const userId = ctx.getUserId();

    const { data: driver, error: dErr } = await sb
      .from("drivers")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();
    if (dErr) return { content: [{ type: "text", text: dErr.message }], isError: true };
    if (!driver) {
      return {
        content: [{ type: "text", text: "No driver record for the signed-in user." }],
        isError: true,
      };
    }

    const { data: reputation } = await sb
      .from("driver_reputation")
      .select("*")
      .eq("driver_id", userId)
      .maybeSingle();

    const payload = { driver, reputation };
    return {
      content: [{ type: "text", text: JSON.stringify(payload, null, 2) }],
      structuredContent: payload,
    };
  },
});
