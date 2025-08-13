import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useDemoMode } from "@/hooks/useDemoMode";
import { useNavigate } from "react-router-dom";

export const DemoModeBanner = () => {
  const { role, deactivate } = useDemoMode();
  const navigate = useNavigate();

  const exitDemo = () => {
    deactivate();
    navigate("/auth", { replace: true });
  };

  return (
    <div className="w-full bg-warning/10 border-b border-warning/30">
      <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm">
          <Badge className="bg-warning text-white">Demo</Badge>
          <span className="text-muted-foreground">You are exploring the app in demo mode{role ? ` as ${role}` : ''}.</span>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={() => navigate("/dashboard")}>Go to Dashboard</Button>
          <Button size="sm" className="bg-danger text-white hover:bg-danger/90" onClick={exitDemo}>Exit Demo</Button>
        </div>
      </div>
    </div>
  );
};
