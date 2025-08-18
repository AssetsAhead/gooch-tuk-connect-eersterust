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
  
  // Debug logging
  console.log('Index component rendering, selectedRole:', selectedRole);
  console.log('Document body styles:', document.body.style);
  console.log('CSS custom properties test:', getComputedStyle(document.documentElement).getPropertyValue('--primary'));

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
      <div className="min-h-screen bg-white">
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
    <div className="min-h-screen bg-background text-foreground p-5" style={{backgroundColor: '#ffffff', color: '#000000', minHeight: '100vh'}}>
      <h1 className="text-3xl mb-5" style={{color: '#000000', fontSize: '2rem', marginBottom: '1rem'}}>PoortLink App Loading Test</h1>
      <p className="text-lg mb-5" style={{color: '#666666', fontSize: '1.2rem', marginBottom: '1rem'}}>If you can see this text, the React app is working!</p>
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <div className="mb-8">
            <h1 className="text-5xl md:text-6xl font-bold mb-4">
              <span className="text-green-600">Poort</span>
              <span className="text-yellow-500">Link</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-6">
              Connecting local hustle to national movement
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm md:text-base mb-8">
              <div className="bg-green-100 text-green-600 px-4 py-2 rounded-full border border-green-300 shadow-lg">
                Safe & Reliable Transport
              </div>
              <div className="bg-green-100 text-green-600 px-4 py-2 rounded-full border border-green-300 shadow-lg">
                Real-time Tracking
              </div>
              <div className="bg-blue-100 text-blue-600 px-4 py-2 rounded-full border border-blue-300 shadow-lg">
                Community Focused
              </div>
              <div className="bg-blue-100 text-blue-600 px-4 py-2 rounded-full border border-blue-300 shadow-lg">
                Multi-Platform Ready
              </div>
            </div>
            
            {/* Enhanced CTAs */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-6xl mx-auto">
              <Link to="/business-portal">
                <Button className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-8 text-lg">
                  🏢 Business Heroes Portal 🌟
                </Button>
              </Link>
              <Link to="/community-safety">
                <Button className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 px-8 text-lg">
                  🛡️ Community Safety Portal 🏘️
                </Button>
              </Link>
              <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-8 text-lg">
                🤖 AI Assistant (11 Languages) 💬
              </Button>
            </div>
            <div className="text-center mt-4">
              <p className="text-sm text-gray-600">
                🏛️ Government Services • ⚡ Load Shedding Intelligence • 🏪 Township Economy • 🛡️ Crime Prevention Network
              </p>
            </div>
          </div>
          <div className="text-center text-gray-600">
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
          <h2 className="text-3xl font-bold text-center mb-8 text-green-600">Transport Pricing</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="text-center p-6 bg-white rounded-lg border border-green-300">
              <div className="text-3xl font-bold text-green-600 mb-2">R15</div>
              <p className="text-sm text-gray-600">In-Poort (05:00-19:00)</p>
            </div>
            <div className="text-center p-6 bg-white rounded-lg border border-orange-300">
              <div className="text-3xl font-bold text-orange-600 mb-2">R25</div>
              <p className="text-sm text-gray-600">Out-of-Township</p>
            </div>
            <div className="text-center p-6 bg-white rounded-lg border border-blue-300">
              <div className="text-3xl font-bold text-blue-600 mb-2">R30</div>
              <p className="text-sm text-gray-600">Night In-Poort</p>
            </div>
            <div className="text-center p-6 bg-white rounded-lg border border-yellow-300">
              <div className="text-3xl font-bold text-yellow-600 mb-2">R50</div>
              <p className="text-sm text-gray-600">Night Out-Township</p>
            </div>
          </div>
          <div className="text-center">
            <div className="inline-block bg-green-100 text-green-600 px-6 py-3 rounded-full border border-green-300">
              <span className="font-bold">33% OFF</span> on Pension Collection Days
            </div>
          </div>
        </div>

        {/* Features Preview */}
        <div className="mt-16 max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 text-green-600">Platform Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🚗</span>
              </div>
              <h3 className="text-xl font-bold mb-2">Real-time Tracking</h3>
              <p className="text-gray-600">GPS tracking for vehicles and drivers with live location updates</p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">💰</span>
              </div>
              <h3 className="text-xl font-bold mb-2">Automated Payments</h3>
              <p className="text-gray-600">60/40 revenue split automation with multiple payment options</p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🛡️</span>
              </div>
              <h3 className="text-xl font-bold mb-2">Safety & Security</h3>
              <p className="text-gray-600">Emergency alerts, incident reporting, and driver verification</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
