import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { MapPin, MessageCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface WhatsAppLocationShareProps {
  /** Context message prepended to the location link */
  message?: string;
  /** Visual variant */
  variant?: 'default' | 'emergency' | 'compact';
  /** Optional className override */
  className?: string;
  /** Optional phone number to send to (international format without +) */
  phoneNumber?: string;
}

export const WhatsAppLocationShare = ({
  message = "📍 Here is my live location via MojaRide:",
  variant = 'default',
  className,
  phoneNumber,
}: WhatsAppLocationShareProps) => {
  const [isLocating, setIsLocating] = useState(false);
  const { toast } = useToast();

  const shareLocation = useCallback(() => {
    if (!navigator.geolocation) {
      toast({
        title: "Location not supported",
        description: "Your browser doesn't support location sharing.",
        variant: "destructive",
      });
      return;
    }

    setIsLocating(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const mapsUrl = `https://maps.google.com/maps?q=${encodeURIComponent(latitude.toFixed(6))},${encodeURIComponent(longitude.toFixed(6))}`;
        const fullMessage = encodeURIComponent(`${message}\n${mapsUrl}`);

        const waUrl = phoneNumber
          ? `https://wa.me/${encodeURIComponent(phoneNumber)}?text=${fullMessage}`
          : `https://wa.me/?text=${fullMessage}`;

        window.open(waUrl, '_blank', 'noopener,noreferrer');
        setIsLocating(false);

        toast({
          title: "📍 Location ready",
          description: "WhatsApp opened — select a contact to share your location.",
        });
      },
      (error) => {
        setIsLocating(false);
        console.warn('Geolocation error:', error);
        toast({
          title: "Location access denied",
          description: "Please enable location permissions in your browser settings.",
          variant: "destructive",
        });
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, [message, phoneNumber, toast]);

  if (variant === 'compact') {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={shareLocation}
        disabled={isLocating}
        className={cn("gap-1.5", className)}
      >
        {isLocating ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <MessageCircle className="h-3.5 w-3.5 text-success" />
        )}
        <MapPin className="h-3.5 w-3.5" />
        <span className="text-xs">Share via WhatsApp</span>
      </Button>
    );
  }

  if (variant === 'emergency') {
    return (
      <Button
        onClick={shareLocation}
        disabled={isLocating}
        variant="outline"
        className={cn("border-primary text-primary", className)}
      >
        {isLocating ? (
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        ) : (
          <MessageCircle className="h-4 w-4 mr-2 text-success" />
        )}
        <MapPin className="h-4 w-4 mr-2" />
        Share Location via WhatsApp
      </Button>
    );
  }

  return (
    <Button
      onClick={shareLocation}
      disabled={isLocating}
      variant="outline"
      className={cn("gap-2", className)}
    >
      {isLocating ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <MessageCircle className="h-4 w-4 text-success" />
      )}
      <MapPin className="h-4 w-4" />
      Share Location via WhatsApp
    </Button>
  );
};
