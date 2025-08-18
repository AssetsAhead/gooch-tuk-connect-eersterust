import { useEffect, useState, useCallback } from "react";

// SECURITY: Demo mode is disabled in production for security reasons
const DEMO_MODE_ENABLED = process.env.NODE_ENV === 'development';

export type DemoRole = "admin" | "passenger" | "driver" | "owner" | "marshall" | "police";

export function useDemoMode() {
  const [isDemo, setIsDemo] = useState<boolean>(() => DEMO_MODE_ENABLED && localStorage.getItem("demo_mode") === "true");
  const [role, setRole] = useState<DemoRole | null>(() => DEMO_MODE_ENABLED ? (localStorage.getItem("demo_role") as DemoRole) || null : null);

  useEffect(() => {
    if (!DEMO_MODE_ENABLED) {
      setIsDemo(false);
      setRole(null);
      return;
    }
    const demo = localStorage.getItem("demo_mode") === "true";
    const r = (localStorage.getItem("demo_role") as DemoRole) || null;
    setIsDemo(demo);
    setRole(r);
  }, []);

  const activate = useCallback((r: DemoRole, displayName?: string) => {
    if (!DEMO_MODE_ENABLED) {
      console.warn('Demo mode is disabled in production');
      return;
    }
    localStorage.setItem("demo_mode", "true");
    localStorage.setItem("demo_role", r);
    if (displayName) localStorage.setItem("demo_display_name", displayName);
    setIsDemo(true);
    setRole(r);
  }, []);

  const updateRole = useCallback((r: DemoRole) => {
    if (!DEMO_MODE_ENABLED) return;
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
