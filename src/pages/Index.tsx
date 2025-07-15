import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { RoleCard } from "@/components/RoleCard";
import { OwnerDashboard } from "@/components/dashboards/OwnerDashboard";
import { DriverDashboard } from "@/components/dashboards/DriverDashboard";
import { PassengerDashboard } from "@/components/dashboards/PassengerDashboard";
import { MarshallDashboard } from "@/components/dashboards/MarshallDashboard";
import { PoliceDashboard } from "@/components/dashboards/PoliceDashboard";
import { AdminDashboard } from "@/components/dashboards/AdminDashboard";

const Index = () => {
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const navigate = useNavigate();

  const roles = [
    {
      id: "admin",
      title: "Admin/Association",
      description: "Eagle Eye oversight of the entire Gooch Tuk Service ecosystem",
      image: "/lovable-uploads/ded37760-8f2e-4bd1-baa1-9dabb3820c41.png",
      color: "primary" as const
    },
    {
      id: "owner",
      title: "Vehicle Owner",
      description: "Track your fleet, monitor drivers, and manage your Tuk Tuk business",
      image: "/lovable-uploads/2cce8442-11ea-42d5-af7c-8347ba46d847.png",
      color: "success" as const
    },
    {
      id: "driver",
      title: "Driver",
      description: "Accept rides, track earnings, and manage your daily operations",
      image: "/lovable-uploads/aed60f21-b13b-4409-945e-668cff63a72d.png",
      color: "tuk-orange" as const
    },
    {
      id: "passenger",
      title: "Passenger",
      description: "Book safe, affordable rides across Eersterust and surrounding areas",
      image: "/lovable-uploads/e2cba52c-41b1-4016-94d7-c679a4b23a46.png",
      color: "tuk-blue" as const
    },
    {
      id: "marshall",
      title: "Rank Marshall",
      description: "Manage rank operations, log vehicle movements, and resolve conflicts",
      image: "/lovable-uploads/af1886b0-fe72-4182-b05f-6a5f0cb4847f.png",
      color: "secondary" as const
    },
    {
      id: "police",
      title: "Police & Traffic",
      description: "Monitor compliance, track flagged vehicles, and manage incidents",
      image: "/lovable-uploads/8b990c3a-352b-4d81-af55-ffd7c8d8ffa1.png",
      color: "danger" as const
    }
  ];

  const renderDashboard = () => {
    switch (selectedRole) {
      case "admin":
        return <AdminDashboard />;
      case "owner":
        return <OwnerDashboard />;
      case "driver":
        return <DriverDashboard />;
      case "passenger":
        return <PassengerDashboard />;
      case "marshall":
        return <MarshallDashboard />;
      case "police":
        return <PoliceDashboard />;
      default:
        return null;
    }
  };

  if (selectedRole) {
    return (
      <div>
        <div className="fixed top-4 left-4 z-50">
          <button
            onClick={() => setSelectedRole(null)}
            className="bg-background border border-border rounded-lg px-4 py-2 shadow-lg hover:bg-muted transition-colors"
          >
            ← Back to Role Selection
          </button>
        </div>
        {renderDashboard()}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <div className="mb-8">
            <h1 className="text-5xl md:text-6xl font-bold mb-4">
              <span className="text-primary">Poort</span>
              <span className="text-secondary">Link</span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-6">
              Connecting local hustle to national movement
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm md:text-base mb-8">
            <div className="bg-success/20 text-success px-4 py-2 rounded-full border border-success/30 shadow-lg">
                Safe & Reliable Transport
              </div>
              <div className="bg-primary/20 text-primary px-4 py-2 rounded-full border border-primary/30 shadow-lg">
                Real-time Tracking
              </div>
              <div className="bg-tuk-blue/20 text-tuk-blue px-4 py-2 rounded-full border border-tuk-blue/30 shadow-lg">
                Community Focused
              </div>
              <div className="bg-purple/20 text-purple px-4 py-2 rounded-full border border-purple/30 shadow-lg">
                Multi-Platform Ready
              </div>
            </div>
            
        {/* Enhanced CTAs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
          <Link to="/business-portal">
            <Button className="w-full bg-gradient-to-r from-primary to-tuk-orange hover:from-primary/90 hover:to-tuk-orange/90 text-white font-bold py-4 px-8 text-lg">
              🏢 Business Heroes Portal 🌟
            </Button>
          </Link>
          <Button className="w-full bg-gradient-to-r from-success to-tuk-blue hover:from-success/90 hover:to-tuk-blue/90 text-white font-bold py-4 px-8 text-lg">
            🤖 AI Assistant (11 Languages) 💬
          </Button>
        </div>
        <div className="text-center mt-4">
          <p className="text-sm text-muted-foreground">
            🏛️ Government Services • ⚡ Load Shedding Intelligence • 🏪 Township Economy • 🛡️ Crime Prevention Network
          </p>
        </div>
          </div>
          <div className="text-center text-muted-foreground">
            <p className="mb-2">Serving Eersterust • Silverton • Eastlynne • Mamelodi</p>
            <p className="text-sm">Select your role to access your personalized dashboard</p>
          </div>
        </div>

        {/* Role Selection Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {roles.map((role) => (
            <RoleCard
              key={role.id}
              title={role.title}
              description={role.description}
              image={role.image}
              color={role.color}
              onClick={() => navigate(`/auth/${role.id}`)}
            />
          ))}
        </div>

        {/* Pricing Information */}
        <div className="mt-16 max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-8 text-primary">Transport Pricing</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="text-center p-6 bg-card rounded-lg border border-success/20">
              <div className="text-3xl font-bold text-success mb-2">R15</div>
              <p className="text-sm text-muted-foreground">In-Poort (05:00-19:00)</p>
            </div>
            <div className="text-center p-6 bg-card rounded-lg border border-tuk-orange/20">
              <div className="text-3xl font-bold text-tuk-orange mb-2">R25</div>
              <p className="text-sm text-muted-foreground">Out-of-Township</p>
            </div>
            <div className="text-center p-6 bg-card rounded-lg border border-tuk-blue/20">
              <div className="text-3xl font-bold text-tuk-blue mb-2">R30</div>
              <p className="text-sm text-muted-foreground">Night In-Poort</p>
            </div>
            <div className="text-center p-6 bg-card rounded-lg border border-warning/20">
              <div className="text-3xl font-bold text-warning mb-2">R50</div>
              <p className="text-sm text-muted-foreground">Night Out-Township</p>
            </div>
          </div>
          <div className="text-center">
            <div className="inline-block bg-success/10 text-success px-6 py-3 rounded-full border border-success/20">
              <span className="font-bold">33% OFF</span> on Pension Collection Days
            </div>
          </div>
        </div>

        {/* Features Preview */}
        <div className="mt-16 max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 text-primary">Platform Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🚗</span>
              </div>
              <h3 className="text-xl font-bold mb-2">Real-time Tracking</h3>
              <p className="text-muted-foreground">GPS tracking for vehicles and drivers with live location updates</p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">💰</span>
              </div>
              <h3 className="text-xl font-bold mb-2">Automated Payments</h3>
              <p className="text-muted-foreground">60/40 revenue split automation with multiple payment options</p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-danger/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🛡️</span>
              </div>
              <h3 className="text-xl font-bold mb-2">Safety & Security</h3>
              <p className="text-muted-foreground">Emergency alerts, incident reporting, and driver verification</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
