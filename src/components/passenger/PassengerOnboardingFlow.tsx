import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, ArrowRight, MapPin, CreditCard, Shield, Bell } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  completed: boolean;
}

interface PassengerOnboardingFlowProps {
  onComplete: () => void;
}

const PassengerOnboardingFlow = ({ onComplete }: PassengerOnboardingFlowProps) => {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);

  const steps: OnboardingStep[] = [
    {
      id: "welcome",
      title: "Welcome to PoortLink!",
      description: "Your journey to safe, reliable transport starts here",
      icon: <CheckCircle className="w-8 h-8 text-sa-green" />,
      completed: false
    },
    {
      id: "location",
      title: "Set Your Locations",
      description: "Add your home and work locations for quick booking",
      icon: <MapPin className="w-8 h-8 text-sa-blue" />,
      completed: false
    },
    {
      id: "payment",
      title: "Payment Setup",
      description: "Choose your preferred payment methods",
      icon: <CreditCard className="w-8 h-8 text-sa-gold" />,
      completed: false
    },
    {
      id: "safety",
      title: "Safety Features",
      description: "Learn about our safety and security features",
      icon: <Shield className="w-8 h-8 text-sa-red" />,
      completed: false
    },
    {
      id: "notifications",
      title: "Stay Updated",
      description: "Enable notifications for ride updates and safety alerts",
      icon: <Bell className="w-8 h-8 text-primary" />,
      completed: false
    }
  ];

  const progress = ((currentStep + 1) / steps.length) * 100;

  const completeStep = (stepId: string) => {
    setCompletedSteps(prev => [...prev, stepId]);
    
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const renderStepContent = () => {
    const step = steps[currentStep];

    switch (step.id) {
      case "welcome":
        return (
          <div className="text-center space-y-6">
            <div className="w-20 h-20 bg-sa-green/10 rounded-full flex items-center justify-center mx-auto">
              <img src="/logo.png" alt="PoortLink" className="w-12 h-12" />
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-2">Welcome to the Future of Transport!</h2>
              <p className="text-muted-foreground mb-4">
                You're now part of our exclusive pilot program. Let's get you set up for the best ride-sharing experience.
              </p>
              <div className="bg-sa-green/10 border border-sa-green/20 rounded-lg p-4">
                <h3 className="font-bold text-sa-green mb-2">Your Pilot Benefits:</h3>
                <ul className="text-sm space-y-1">
                  <li>✓ 50% discount on all rides</li>
                  <li>✓ Free first 5 trips</li>
                  <li>✓ Priority booking access</li>
                  <li>✓ Direct influence on app features</li>
                </ul>
              </div>
            </div>
            <Button 
              onClick={() => completeStep("welcome")}
              className="bg-sa-green hover:bg-sa-green-light"
            >
              Let's Get Started <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        );

      case "location":
        return (
          <div className="space-y-6">
            <div className="text-center">
              <MapPin className="w-16 h-16 text-sa-blue mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Quick Location Setup</h2>
              <p className="text-muted-foreground">
                Save your frequent locations for faster booking
              </p>
            </div>
            
            <div className="space-y-4">
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold mb-2">📍 Home Location</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Your most frequent pickup point
                </p>
                <Button variant="outline" className="w-full">
                  Set Home Location
                </Button>
              </div>
              
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold mb-2">🏢 Work/Study Location</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Your regular destination
                </p>
                <Button variant="outline" className="w-full">
                  Set Work Location
                </Button>
              </div>
            </div>

            <div className="text-center">
              <Button 
                onClick={() => completeStep("location")}
                className="bg-sa-blue hover:bg-sa-blue-light"
              >
                Continue Setup <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <p className="text-xs text-muted-foreground mt-2">
                You can set these up later in your profile
              </p>
            </div>
          </div>
        );

      case "payment":
        return (
          <div className="space-y-6">
            <div className="text-center">
              <CreditCard className="w-16 h-16 text-sa-gold mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Payment Options</h2>
              <p className="text-muted-foreground">
                Choose how you'd like to pay for your rides
              </p>
            </div>
            
            <div className="space-y-3">
              <div className="border rounded-lg p-4 hover:bg-muted/50 cursor-pointer">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">💰 Cash Payment</h3>
                    <p className="text-sm text-muted-foreground">Pay your driver in cash</p>
                  </div>
                  <div className="text-sa-green font-bold">PILOT: FREE</div>
                </div>
              </div>
              
              <div className="border rounded-lg p-4 hover:bg-muted/50 cursor-pointer">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">💳 Digital Payment</h3>
                    <p className="text-sm text-muted-foreground">Card, mobile money, bank transfer</p>
                  </div>
                  <div className="text-sa-green font-bold">50% OFF</div>
                </div>
              </div>
              
              <div className="border rounded-lg p-4 hover:bg-muted/50 cursor-pointer">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">🎫 SASSA Integration</h3>
                    <p className="text-sm text-muted-foreground">Special rates for grant recipients</p>
                  </div>
                  <div className="text-sa-green font-bold">66% OFF</div>
                </div>
              </div>
            </div>

            <div className="text-center">
              <Button 
                onClick={() => completeStep("payment")}
                className="bg-sa-gold hover:bg-sa-gold/90 text-black"
              >
                Setup Payment Later <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        );

      case "safety":
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Shield className="w-16 h-16 text-sa-red mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Your Safety Comes First</h2>
              <p className="text-muted-foreground">
                Learn about our comprehensive safety features
              </p>
            </div>
            
            <div className="grid gap-4">
              <div className="flex items-start space-x-3 p-3 border rounded-lg">
                <div className="w-2 h-2 bg-sa-red rounded-full mt-2"></div>
                <div>
                  <h3 className="font-semibold">🚨 Panic Button</h3>
                  <p className="text-sm text-muted-foreground">
                    Instant emergency alerts to contacts and authorities
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3 p-3 border rounded-lg">
                <div className="w-2 h-2 bg-sa-red rounded-full mt-2"></div>
                <div>
                  <h3 className="font-semibold">📍 Live Tracking</h3>
                  <p className="text-sm text-muted-foreground">
                    Share your trip with trusted contacts in real-time
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3 p-3 border rounded-lg">
                <div className="w-2 h-2 bg-sa-red rounded-full mt-2"></div>
                <div>
                  <h3 className="font-semibold">✅ Driver Verification</h3>
                  <p className="text-sm text-muted-foreground">
                    All drivers are background-checked and verified
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3 p-3 border rounded-lg">
                <div className="w-2 h-2 bg-sa-red rounded-full mt-2"></div>
                <div>
                  <h3 className="font-semibold">🏛️ Authority Integration</h3>
                  <p className="text-sm text-muted-foreground">
                    Direct connection to police and emergency services
                  </p>
                </div>
              </div>
            </div>

            <div className="text-center">
              <Button 
                onClick={() => completeStep("safety")}
                className="bg-sa-red hover:bg-sa-red-light text-white"
              >
                I Understand <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        );

      case "notifications":
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Bell className="w-16 h-16 text-primary mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Stay Connected</h2>
              <p className="text-muted-foreground">
                Get important updates about your rides and community
              </p>
            </div>
            
            <div className="space-y-4">
              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold">🚗 Ride Updates</h3>
                  <div className="text-sa-green text-sm">Recommended</div>
                </div>
                <p className="text-sm text-muted-foreground">
                  Driver arrival, trip start, and completion notifications
                </p>
              </div>
              
              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold">🛡️ Safety Alerts</h3>
                  <div className="text-sa-red text-sm">Essential</div>
                </div>
                <p className="text-sm text-muted-foreground">
                  Emergency broadcasts and community safety updates
                </p>
              </div>
              
              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold">💰 Pilot Updates</h3>
                  <div className="text-sa-gold text-sm">Exclusive</div>
                </div>
                <p className="text-sm text-muted-foreground">
                  Special offers and pilot program announcements
                </p>
              </div>
            </div>

            <div className="text-center">
              <Button 
                onClick={() => {
                  completeStep("notifications");
                  toast({
                    title: "Welcome to PoortLink!",
                    description: "Your onboarding is complete. Start booking your first ride!",
                  });
                  setTimeout(() => onComplete(), 1000);
                }}
                className="bg-primary hover:bg-primary/90"
              >
                Complete Setup <CheckCircle className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-2xl mx-auto">
        {/* Progress Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <img src="/logo.png" alt="PoortLink" className="w-8 h-8" />
              <span className="text-xl font-bold">
                <span className="text-sa-green">Poort</span>
                <span className="text-sa-gold">Link</span>
              </span>
            </div>
            <div className="text-sm text-muted-foreground">
              Step {currentStep + 1} of {steps.length}
            </div>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Step Content */}
        <Card>
          <CardContent className="p-8">
            {renderStepContent()}
          </CardContent>
        </Card>

        {/* Step Indicators */}
        <div className="flex justify-center mt-6 space-x-2">
          {steps.map((step, index) => (
            <div
              key={step.id}
              className={`w-3 h-3 rounded-full transition-colors ${
                index <= currentStep ? 'bg-sa-green' : 'bg-muted'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default PassengerOnboardingFlow;