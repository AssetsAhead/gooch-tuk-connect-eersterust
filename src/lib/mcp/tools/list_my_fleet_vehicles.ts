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
  name: "list_my_fleet_vehicles",
  title: "My fleet vehicles (owner)",
  description:
    "List fleet vehicles owned by the signed-in user. Only rows the caller can see under RLS are returned — non-owners get an empty list.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async (_input, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Sign in required." }], isError: true };
    }
    const sb = userClient(ctx);
    const { data, error } = await sb
      .from("fleet_vehicles")
      .select("id,e_number,registration,owner_name,driver_name,province,status,whatsapp_group_link,notes,created_at,updated_at")
      .order("e_number", { ascending: true });
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
      structuredContent: { vehicles: data ?? [], count: data?.length ?? 0 },
    };
  },
});
