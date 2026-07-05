import { defineMcp } from "@lovable.dev/mcp-js";
import appInfoTool from "./tools/app_info";
import listLoadingZonesTool from "./tools/list_loading_zones";
import listDriveToOwnProgramsTool from "./tools/list_drive_to_own_programs";

export default defineMcp({
  name: "poortlink-mcp",
  title: "PoortLink MCP",
  version: "0.1.0",
  instructions:
    "Tools for the PoortLink / MojaRide / TukConnect taxi platform. Use `app_info` for an overview, `list_loading_zones` to discover pickup zones (optionally filter by municipality), and `list_drive_to_own_programs` to inspect Drive-to-Own tier eligibility.",
  tools: [appInfoTool, listLoadingZonesTool, listDriveToOwnProgramsTool],
});
