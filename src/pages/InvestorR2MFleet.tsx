import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { InvestorProposalR2M } from "@/components/fleet/InvestorProposalR2M";

const InvestorR2MFleet = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="bg-muted/30 border-b py-4 px-4">
        <div className="max-w-6xl mx-auto">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/investor">
              <ArrowLeft className="mr-2 h-4 w-4" /> All Investment Options
            </Link>
          </Button>
        </div>
      </div>
      <section className="py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <InvestorProposalR2M />
        </div>
      </section>
    </div>
  );
};

export default InvestorR2MFleet;
