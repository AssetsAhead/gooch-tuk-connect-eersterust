import { auth, defineMcp } from "@lovable.dev/mcp-js";
import appInfoTool from "./tools/app_info";
import listLoadingZonesTool from "./tools/list_loading_zones";
import listDriveToOwnProgramsTool from "./tools/list_drive_to_own_programs";
import getZoneAvailabilityTool from "./tools/get_zone_availability";
import listMyFleetVehiclesTool from "./tools/list_my_fleet_vehicles";
import getMyDriverProfileTool from "./tools/get_my_driver_profile";

// Direct Supabase issuer (never the .lovable.cloud proxy). Built from the
// project ref that Vite inlines at build time, so this file stays import-safe.
const projectRef =
  (import.meta as unknown as { env?: Record<string, string | undefined> }).env
    ?.VITE_SUPABASE_PROJECT_ID ?? "project-ref-unset";

export default defineMcp({
  name: "poortlink-mcp",
  title: "PoortLink MCP",
  version: "0.2.0",
  instructions:
    "Tools for the PoortLink / MojaRide / TukConnect taxi platform. " +
    "Public tools: `app_info`, `list_loading_zones`, `list_drive_to_own_programs`. " +
    "Signed-in tools: `get_zone_availability` (real-time driver availability at a loading zone), " +
    "`list_my_fleet_vehicles` (owner-scoped fleet list), " +
    "`get_my_driver_profile` (driver-scoped profile + reputation). " +
    "Owner/driver tools return only rows the signed-in user is allowed to see under RLS.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [
    appInfoTool,
    listLoadingZonesTool,
    listDriveToOwnProgramsTool,
    getZoneAvailabilityTool,
    listMyFleetVehiclesTool,
    getMyDriverProfileTool,
  ],
});
