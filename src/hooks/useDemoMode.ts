import { useEffect, useState, useCallback } from "react";

// Simple client-side demo mode manager using localStorage.
// This does NOT touch Supabase and is only for exploration.
export type DemoRole = "admin" | "passenger" | "driver" | "owner" | "marshall" | "police";

export function useDemoMode() {
  const [isDemo, setIsDemo] = useState<boolean>(() => localStorage.getItem("demo_mode") === "true");
  const [role, setRole] = useState<DemoRole | null>(() => (localStorage.getItem("demo_role") as DemoRole) || null);

  useEffect(() => {
    const demo = localStorage.getItem("demo_mode") === "true";
    const r = (localStorage.getItem("demo_role") as DemoRole) || null;
    setIsDemo(demo);
    setRole(r);
  }, []);

  const activate = useCallback((r: DemoRole, displayName?: string) => {
    localStorage.setItem("demo_mode", "true");
    localStorage.setItem("demo_role", r);
    if (displayName) localStorage.setItem("demo_display_name", displayName);
    setIsDemo(true);
    setRole(r);
  }, []);

  const updateRole = useCallback((r: DemoRole) => {
    localStorage.setItem("demo_role", r);
    setRole(r);
  }, []);

  const deactivate = useCallback(() => {
    localStorage.removeItem("demo_mode");
    localStorage.removeItem("demo_role");
    localStorage.removeItem("demo_display_name");
    setIsDemo(false);
    setRole(null);
  }, []);

  return { isDemo, role, activate, updateRole, deactivate };
}
