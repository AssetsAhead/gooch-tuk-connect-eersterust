import { defineTool } from "@lovable.dev/mcp-js";

export default defineTool({
  name: "app_info",
  title: "About PoortLink",
  description:
    "Return a brief description of the PoortLink / TukConnect platform, its brands and its capabilities.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: () => ({
    content: [
      {
        type: "text",
        text: [
          "PoortLink is the operational layer for South African minibus taxi infrastructure.",
          "Brands: MojaRide (consumer hailing), PoortLink (operator tools), TukConnect (infrastructure).",
          "Capabilities: loading-zone queues, driver reputation & AARTO mapping, dashcam / AI incident monitoring,",
          "SASSA discount verification, digital fare collection (Yoco), Drive-to-Own program, and DOT compliance tooling.",
          "Focus area: Eersterust, Tshwane. Cross-border expansion in progress (eSwatini).",
        ].join(" "),
      },
    ],
  }),
});
