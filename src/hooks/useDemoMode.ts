import { useEffect, useState, useCallback } from "react";

// Simple client-side demo mode manager using localStorage.
// This does NOT touch Supabase and is only for exploration.
// Demo mode expires after 2 days for security.
export type DemoRole = "admin" | "passenger" | "driver" | "owner" | "marshall" | "police";

const DEMO_EXPIRY_DAYS = 2;

function isDemoExpired(): boolean {
  const startTime = localStorage.getItem("demo_start_time");
  if (!startTime) return false;
  
  const start = parseInt(startTime, 10);
  const now = Date.now();
  const twoDaysInMs = DEMO_EXPIRY_DAYS * 24 * 60 * 60 * 1000;
  
  return (now - start) > twoDaysInMs;
}

function clearExpiredDemo(): void {
  if (isDemoExpired()) {
    localStorage.removeItem("demo_mode");
    localStorage.removeItem("demo_role");
    localStorage.removeItem("demo_display_name");
    localStorage.removeItem("demo_start_time");
  }
}

export function useDemoMode() {
  const [isDemo, setIsDemo] = useState<boolean>(() => {
    clearExpiredDemo();
    return localStorage.getItem("demo_mode") === "true";
  });
  const [role, setRole] = useState<DemoRole | null>(() => {
    clearExpiredDemo();
    return (localStorage.getItem("demo_role") as DemoRole) || null;
  });

  useEffect(() => {
    clearExpiredDemo();
    const demo = localStorage.getItem("demo_mode") === "true";
    const r = (localStorage.getItem("demo_role") as DemoRole) || null;
    setIsDemo(demo);
    setRole(r);
  }, []);

  const activate = useCallback((r: DemoRole, displayName?: string) => {
    const now = Date.now().toString();
    localStorage.setItem("demo_mode", "true");
    localStorage.setItem("demo_role", r);
    localStorage.setItem("demo_start_time", now);
    if (displayName) localStorage.setItem("demo_display_name", displayName);
    setIsDemo(true);
    setRole(r);
  }, []);

  const updateRole = useCallback((r: DemoRole) => {
    if (isDemoExpired()) {
      clearExpiredDemo();
      setIsDemo(false);
      setRole(null);
      return;
    }
    localStorage.setItem("demo_role", r);
    setRole(r);
  }, []);

  const deactivate = useCallback(() => {
    localStorage.removeItem("demo_mode");
    localStorage.removeItem("demo_role");
    localStorage.removeItem("demo_display_name");
    localStorage.removeItem("demo_start_time");
    setIsDemo(false);
    setRole(null);
  }, []);

  return { isDemo, role, activate, updateRole, deactivate };
}
