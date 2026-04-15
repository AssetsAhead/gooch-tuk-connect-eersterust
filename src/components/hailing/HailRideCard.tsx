import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { QuickHailButton } from "./QuickHailButton";
import VoiceHailButton from "./VoiceHailButton";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import { Hand } from "lucide-react";

interface HailRideCardProps {
  compact?: boolean;
}

export const HailRideCard = ({ compact = false }: HailRideCardProps) => {
  const { user } = useAuth();
  const [, setDestination] = useState("");

  return (
    <Card className="border-green-200 dark:border-green-800">
      <CardHeader className={compact ? "pb-2 pt-4 px-4" : undefined}>
        <CardTitle className={`flex items-center gap-2 ${compact ? "text-base" : "text-lg"}`}>
          <Hand className="h-5 w-5 text-green-500" />
          Hail a Ride
        </CardTitle>
      </CardHeader>
      <CardContent className={compact ? "px-4 pb-4" : undefined}>
        <div className="flex items-center justify-center gap-8">
          <QuickHailButton userId={user?.id} />
          <VoiceHailButton
            onDestinationDetected={setDestination}
          />
        </div>
      </CardContent>
    </Card>
  );
};
