import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { SafeLocationPicker, type PickedLocation } from "@/components/hailing/SafeLocationPicker";

export default function QuickHail() {
  const [from, setFrom] = useState<PickedLocation | null>(null);
  const [to, setTo] = useState<PickedLocation | null>(null);
  const navigate = useNavigate();

  const hail = () => {
    sessionStorage.setItem("quick_hail_v1", JSON.stringify({ from, to, at: new Date().toISOString() }));
    navigate("/ride");
  };

  return (
    <div className="min-h-screen bg-background p-4 pb-24">
      <div className="mx-auto max-w-md space-y-4">
        <Link to="/" className="inline-flex items-center text-sm text-muted-foreground">
          <ArrowLeft className="mr-1 h-4 w-4" /> Home
        </Link>
        <h1 className="text-2xl font-bold">Get a tuk-tuk</h1>
        <SafeLocationPicker title="Where are you?" allowGps value={from} onChange={setFrom} />
        <SafeLocationPicker title="Where to?" value={to} onChange={setTo} />
        <Button className="h-14 w-full text-lg" disabled={!from || !to} onClick={hail}>Hail now</Button>
        <p className="text-center text-xs text-muted-foreground">Cash or card. You can get off anywhere along the way.</p>
      </div>
    </div>
  );
}
