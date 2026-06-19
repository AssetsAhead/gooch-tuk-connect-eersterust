import { Home, ArrowLeft, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { SearchCommand } from "@/components/search/SearchCommand";

export const GlobalHeader = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  // Don't show header on auth pages, landing page, or safe mode
  const hideOnPaths = ["/auth", "/", "/safe", "/unauthorized"];
  const shouldHide = hideOnPaths.some(path => 
    location.pathname === path || location.pathname.startsWith("/auth/") || location.pathname.startsWith("/track/")
  );

  if (shouldHide) return null;

  const handleHomeClick = () => {
    navigate("/");
  };
  const handleBack = () => {
    if (window.history.length > 1) navigate(-1);
    else navigate("/");
  };
  const handleDashboard = () => {
    navigate("/dashboard");
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
          <div className="flex items-center gap-1 sm:gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBack}
              className="flex items-center gap-1 hover:bg-primary/10 px-2"
              aria-label="Go back"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Back</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleHomeClick}
              className="flex items-center gap-1 hover:bg-primary/10 px-2"
              aria-label="Home"
            >
              <Home className="h-4 w-4" />
              <span className="hidden md:inline">Home</span>
            </Button>
            {user && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDashboard}
                className="flex items-center gap-1 hover:bg-primary/10 px-2"
                aria-label="Dashboard"
              >
                <LayoutDashboard className="h-4 w-4" />
                <span className="hidden md:inline">Dashboard</span>
              </Button>
            )}
            <span className="text-sm font-semibold text-primary ml-1 hidden sm:inline">PoortLink</span>
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
