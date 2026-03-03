import { Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { SearchCommand } from "@/components/search/SearchCommand";

export const GlobalHeader = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  // Don't show header on auth pages, landing page, or safe mode
  const hideOnPaths = ["/auth", "/", "/safe", "/unauthorized", "/owner-pitch", "/why-join", "/dot-presentation"];
  const shouldHide = hideOnPaths.some(path => 
    location.pathname === path || location.pathname.startsWith("/auth/")
  );

  if (shouldHide) return null;

  const handleHomeClick = () => {
    if (user) {
      navigate("/dashboard");
    } else {
      navigate("/");
    }
  };

  // Determine role from current path for search context
  const getRoleFromPath = (): 'admin' | 'owner' | 'driver' | 'passenger' | 'marshall' | 'police' => {
    const path = location.pathname;
    if (path.includes('admin')) return 'admin';
    if (path.includes('owner') || path.includes('fleet')) return 'owner';
    if (path.includes('driver')) return 'driver';
    if (path.includes('police') || path.includes('infringement')) return 'police';
    if (path.includes('marshal')) return 'marshall';
    return 'passenger';
  };

  return (
    <>
      {/* Fixed header */}
      <header className="fixed top-0 left-0 right-0 z-40 h-12 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="container mx-auto h-full flex items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleHomeClick}
              className="flex items-center gap-2 hover:bg-primary/10"
            >
              <Home className="h-4 w-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </Button>
            <span className="text-sm font-semibold text-primary">PoortLink</span>
          </div>
          <div className="flex-1 max-w-md mx-4">
            <SearchCommand role={getRoleFromPath()} />
          </div>
        </div>
      </header>
      {/* Spacer to push content below header */}
      <div className="h-12" />
    </>
  );
};
