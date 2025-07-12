import { Button } from "@/components/ui/button";
import { Map, Navigation } from "lucide-react";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";

interface MapsButtonProps {
  destination?: string;
  startLocation?: string;
  variant?: "default" | "outline" | "secondary" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
}

export const MapsButton = ({ 
  destination = "", 
  startLocation = "",
  variant = "default",
  size = "default"
}: MapsButtonProps) => {
  const openGoogleMaps = () => {
    const baseUrl = "https://www.google.com/maps/dir/";
    const url = `${baseUrl}${encodeURIComponent(startLocation)}/${encodeURIComponent(destination)}`;
    window.open(url, '_blank');
  };

  const openWaze = () => {
    const baseUrl = "https://waze.com/ul?navigate=yes";
    const url = destination 
      ? `${baseUrl}&q=${encodeURIComponent(destination)}`
      : baseUrl;
    window.open(url, '_blank');
  };

  const openAppleMaps = () => {
    const baseUrl = "https://maps.apple.com/";
    const params = new URLSearchParams();
    if (destination) params.append('daddr', destination);
    if (startLocation) params.append('saddr', startLocation);
    const url = `${baseUrl}?${params.toString()}`;
    window.open(url, '_blank');
  };

  if (!destination && !startLocation) {
    return (
      <Button 
        variant={variant} 
        size={size} 
        onClick={openGoogleMaps}
        className="gap-2"
      >
        <Map className="h-4 w-4" />
        Open Maps
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={variant} size={size} className="gap-2">
          <Navigation className="h-4 w-4" />
          Navigate
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={openGoogleMaps}>
          <Map className="mr-2 h-4 w-4" />
          Google Maps
        </DropdownMenuItem>
        <DropdownMenuItem onClick={openWaze}>
          <Navigation className="mr-2 h-4 w-4" />
          Waze
        </DropdownMenuItem>
        <DropdownMenuItem onClick={openAppleMaps}>
          <Map className="mr-2 h-4 w-4" />
          Apple Maps
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};