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
import { ComplianceChecklist } from "@/components/ComplianceChecklist";

const Index = () => {
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const navigate = useNavigate();
  
  // Debug logging
  console.log('Index component rendering, selectedRole:', selectedRole);
  console.log('Document body styles:', document.body.style);
  console.log('CSS custom properties test:', getComputedStyle(document.documentElement).getPropertyValue('--primary'));

  const roles = [
    {
      id: "admin",
      title: "Admin/Association",
      description: "Eagle Eye oversight of the entire MojaRide ecosystem",
      image: "/lovable-uploads/ded37760-8f2e-4bd1-baa1-9dabb3820c41.png",
      color: "primary" as const
    },
    {
      id: "owner",
      title: "Vehicle Owner",
      description: "Track your fleet, monitor drivers, and manage your transport business",
      image: "/lovable-uploads/2cce8442-11ea-42d5-af7c-8347ba46d847.png",
      color: "success" as const
    },
    {
      id: "driver",
      title: "Driver",
      description: "Accept rides, track earnings, and manage your daily operations",
      image: "/lovable-uploads/aed60f21-b13b-4409-945e-668cff63a72d.png",
      color: "secondary" as const
    },
    {
      id: "passenger",
      title: "Passenger",
      description: "Book safe, affordable rides across Eersterust and surrounding areas",
      image: "/lovable-uploads/e2cba52c-41b1-4016-94d7-c679a4b23a46.png",
      color: "info" as const
    },
    {
      id: "marshall",
      title: "Rank Marshall",
      description: "Manage rank operations, log vehicle movements, and resolve conflicts",
      image: "/lovable-uploads/af1886b0-fe72-4182-b05f-6a5f0cb4847f.png",
      color: "warning" as const
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
      <div className="min-h-screen bg-background">
        <div className="fixed bottom-4 left-4 md:top-4 md:bottom-auto z-50">
          <button
            onClick={() => setSelectedRole(null)}
            className="bg-primary text-primary-foreground rounded-full px-5 py-3 shadow-xl hover:bg-primary/90 transition-colors font-medium text-sm md:text-base flex items-center gap-2"
          >
            <span className="text-lg">←</span>
            <span className="hidden sm:inline">Back to Roles</span>
            <span className="sm:hidden">Back</span>
          </button>
        </div>
        {renderDashboard()}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground p-5">
      <h1 className="text-3xl mb-5 text-foreground">MojaRide App Loading Test</h1>
      <p className="text-lg mb-5 text-muted-foreground">If you can see this text, the React app is working!</p>
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <div className="mb-8">
            <div className="flex items-center justify-center mb-6">
              <img 
                src="/logo.png" 
                alt="MojaRide Logo" 
                className="w-16 h-16 md:w-20 md:h-20 mr-4"
              />
              <h1 className="text-5xl md:text-6xl font-bold">
                <span className="text-primary">Moja</span>
                <span className="text-secondary">Ride</span>
              </h1>
            </div>
            <p className="text-xl md:text-2xl text-muted-foreground mb-6">
              Connecting Communities
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm md:text-base mb-8">
              <div className="bg-primary/10 text-primary px-4 py-2 rounded-full border border-primary/20 shadow-lg">
                Safe & Reliable Transport
              </div>
              <div className="bg-primary/10 text-primary px-4 py-2 rounded-full border border-primary/20 shadow-lg">
                Real-time Tracking
              </div>
              <div className="bg-secondary/10 text-secondary px-4 py-2 rounded-full border border-secondary/20 shadow-lg">
                Community Focused
              </div>
              <div className="bg-secondary/10 text-secondary px-4 py-2 rounded-full border border-secondary/20 shadow-lg">
                Multi-Platform Ready
              </div>
            </div>
            
            {/* Enhanced CTAs */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 max-w-7xl mx-auto">
              <Link to="/auth">
                <Button className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-4 px-6 text-lg">
                  🔐 LOGIN NOW
                </Button>
              </Link>
              <Link to="/passenger-recruitment">
                <Button className="w-full bg-sa-gold hover:bg-sa-gold/90 text-black font-bold py-4 px-6 text-lg">
                  🚀 JOIN PILOT PROGRAM
                </Button>
              </Link>
              <Link to="/business-portal">
                <Button className="w-full bg-sa-green hover:bg-sa-green-light text-white font-bold py-4 px-6 text-lg">
                  🏢 Business Portal
                </Button>
              </Link>
              <Link to="/community-safety">
                <Button className="w-full bg-sa-red hover:bg-sa-red-light text-white font-bold py-4 px-6 text-lg">
                  🛡️ Safety Portal
                </Button>
              </Link>
              <Link to="/community-announcements">
                <Button className="w-full bg-sa-blue hover:bg-sa-blue-light text-white font-bold py-4 px-6 text-lg">
                  📢 Announcements
                </Button>
              </Link>
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

        {/* Compliance Checklist */}
        <div className="max-w-md mx-auto mt-12">
          <ComplianceChecklist />
        </div>

        {/* Pricing Information */}
        <div className="mt-16 max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-8 text-primary">Transport Pricing</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="text-center p-6 bg-card rounded-lg border border-primary/20">
              <div className="text-3xl font-bold text-primary mb-2">R15</div>
              <p className="text-sm text-muted-foreground">In-Poort (05:00-19:00)</p>
            </div>
            <div className="text-center p-6 bg-card rounded-lg border border-secondary/20">
              <div className="text-3xl font-bold text-secondary mb-2">R25</div>
              <p className="text-sm text-muted-foreground">Out-of-Township</p>
            </div>
            <div className="text-center p-6 bg-card rounded-lg border border-info/20">
              <div className="text-3xl font-bold text-info mb-2">R30</div>
              <p className="text-sm text-muted-foreground">Night In-Poort</p>
            </div>
            <div className="text-center p-6 bg-card rounded-lg border border-warning/20">
              <div className="text-3xl font-bold text-warning mb-2">R50</div>
              <p className="text-sm text-muted-foreground">Night Out-Township</p>
            </div>
          </div>
          <div className="text-center">
            <div className="inline-block bg-primary/10 text-primary px-6 py-3 rounded-full border border-primary/20">
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
              <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4">
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
