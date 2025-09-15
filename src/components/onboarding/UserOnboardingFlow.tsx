import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Circle, ArrowRight, ArrowLeft, Users, Shield, MapPin } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { LegalComplianceHub } from '@/components/compliance/LegalComplianceHub';
import { PrivacyControls } from '@/components/compliance/PrivacyControls';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  component?: React.ReactNode;
  required: boolean;
  completed: boolean;
}

export const UserOnboardingFlow: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [onboardingData, setOnboardingData] = useState<any>({});
  const [loading, setLoading] = useState(false);

  const [steps, setSteps] = useState<OnboardingStep[]>([
    {
      id: 'welcome',
      title: 'Welcome to PoortLink',
      description: 'Learn about our mission to connect communities safely',
      required: true,
      completed: false,
    },
    {
      id: 'legal_compliance',
      title: 'Legal Requirements',
      description: 'Accept terms and privacy policies',
      component: <LegalComplianceHub />,
      required: true,
      completed: false,
    },
    {
      id: 'privacy_settings',
      title: 'Privacy Controls',
      description: 'Configure your data sharing preferences',
      component: <PrivacyControls />,
      required: true,
      completed: false,
    },
    {
      id: 'role_selection',
      title: 'Select Your Role',
      description: 'Choose how you want to use PoortLink',
      required: true,
      completed: false,
    },
    {
      id: 'safety_features',
      title: 'Safety Features',
      description: 'Set up emergency contacts and safety preferences',
      required: true,
      completed: false,
    },
    {
      id: 'community_guidelines',
      title: 'Community Guidelines',
      description: 'Review guidelines for respectful community interaction',
      required: true,
      completed: false,
    },
    {
      id: 'complete',
      title: 'Setup Complete',
      description: 'You\'re ready to start using PoortLink!',
      required: true,
      completed: false,
    },
  ]);

  useEffect(() => {
    if (user) {
      loadOnboardingProgress();
    }
  }, [user]);

  const loadOnboardingProgress = async () => {
    try {
      const { data, error } = await supabase
        .from('user_onboarding')
        .select('*')
        .eq('user_id', user?.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading onboarding progress:', error);
        return;
      }

      if (data) {
        setOnboardingData(data.onboarding_data || {});
        setCurrentStep(data.current_step || 0);
        
        // Update step completion status
        const updatedSteps = steps.map((step, index) => ({
          ...step,
          completed: index < (data.current_step || 0) || data.completed_steps?.includes(step.id),
        }));
        setSteps(updatedSteps);
      }
    } catch (error) {
      console.error('Error loading onboarding progress:', error);
    }
  };

  const saveProgress = async (stepIndex: number, stepData?: any) => {
    if (!user) return;

    try {
      const updatedData = stepData ? { ...onboardingData, ...stepData } : onboardingData;
      const completedSteps = steps.slice(0, stepIndex + 1).map(step => step.id);

      await supabase
        .from('user_onboarding')
        .upsert({
          user_id: user.id,
          current_step: stepIndex,
          onboarding_data: updatedData,
          completed_steps: completedSteps,
          is_completed: stepIndex >= steps.length - 1,
          updated_at: new Date().toISOString(),
        });

      setOnboardingData(updatedData);
    } catch (error) {
      console.error('Error saving onboarding progress:', error);
    }
  };

  const nextStep = async () => {
    if (currentStep < steps.length - 1) {
      const nextIndex = currentStep + 1;
      setCurrentStep(nextIndex);
      await saveProgress(nextIndex);
      
      // Mark current step as completed
      const updatedSteps = [...steps];
      updatedSteps[currentStep].completed = true;
      setSteps(updatedSteps);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const completeOnboarding = async () => {
    setLoading(true);
    try {
      await saveProgress(steps.length - 1, { completed: true });
      
      toast({
        title: "Welcome to PoortLink!",
        description: "Your account setup is complete. You can now access all features.",
      });
    } catch (error) {
      console.error('Error completing onboarding:', error);
      toast({
        title: "Error",
        description: "Failed to complete onboarding. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const progress = ((currentStep + 1) / steps.length) * 100;
  const currentStepData = steps[currentStep];

  const renderStepContent = () => {
    switch (currentStepData.id) {
      case 'welcome':
        return (
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
              <Users className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-2xl font-bold">Welcome to PoortLink</h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              PoortLink connects communities through safe, reliable transportation and essential services. 
              Let's get you set up to start exploring what we have to offer.
            </p>
            <div className="grid grid-cols-3 gap-4 mt-6">
              <div className="text-center space-y-2">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                  <MapPin className="h-6 w-6 text-blue-600" />
                </div>
                <h4 className="font-semibold">Transportation</h4>
                <p className="text-xs text-muted-foreground">Safe rides in your community</p>
              </div>
              <div className="text-center space-y-2">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <Shield className="h-6 w-6 text-green-600" />
                </div>
                <h4 className="font-semibold">Safety</h4>
                <p className="text-xs text-muted-foreground">Community protection features</p>
              </div>
              <div className="text-center space-y-2">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
                  <Users className="h-6 w-6 text-purple-600" />
                </div>
                <h4 className="font-semibold">Community</h4>
                <p className="text-xs text-muted-foreground">Connect with neighbors</p>
              </div>
            </div>
          </div>
        );

      case 'role_selection':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-center">How do you want to use PoortLink?</h3>
            <div className="grid gap-3">
              {[
                { id: 'passenger', title: 'Passenger', description: 'Book rides and access services' },
                { id: 'driver', title: 'Driver', description: 'Provide transportation services' },
                { id: 'owner', title: 'Vehicle Owner', description: 'Manage vehicles and drivers' },
                { id: 'business', title: 'Business', description: 'Offer services to the community' },
              ].map((role) => (
                <button
                  key={role.id}
                  onClick={() => setOnboardingData({ ...onboardingData, selectedRole: role.id })}
                  className={`p-4 border rounded-lg text-left transition-colors ${
                    onboardingData.selectedRole === role.id
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:bg-muted/50'
                  }`}
                >
                  <h4 className="font-semibold">{role.title}</h4>
                  <p className="text-sm text-muted-foreground">{role.description}</p>
                </button>
              ))}
            </div>
          </div>
        );

      case 'safety_features':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-center">Safety Setup</h3>
            <p className="text-sm text-muted-foreground text-center">
              Configure emergency contacts and safety preferences for your protection.
            </p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Emergency Contact Name</label>
                <input
                  type="text"
                  placeholder="Enter emergency contact name"
                  value={onboardingData.emergencyContact?.name || ''}
                  onChange={(e) => setOnboardingData({
                    ...onboardingData,
                    emergencyContact: { ...onboardingData.emergencyContact, name: e.target.value }
                  })}
                  className="w-full px-3 py-2 border border-border rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Emergency Contact Phone</label>
                <input
                  type="tel"
                  placeholder="Enter phone number"
                  value={onboardingData.emergencyContact?.phone || ''}
                  onChange={(e) => setOnboardingData({
                    ...onboardingData,
                    emergencyContact: { ...onboardingData.emergencyContact, phone: e.target.value }
                  })}
                  className="w-full px-3 py-2 border border-border rounded-md"
                />
              </div>
            </div>
          </div>
        );

      case 'community_guidelines':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-center">Community Guidelines</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold">Respect & Safety</h4>
                  <p className="text-muted-foreground">Treat all community members with respect and prioritize safety.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold">Accurate Information</h4>
                  <p className="text-muted-foreground">Provide accurate information in your profile and interactions.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold">Community Support</h4>
                  <p className="text-muted-foreground">Help build a supportive community for everyone.</p>
                </div>
              </div>
            </div>
          </div>
        );

      case 'complete':
        return (
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold">Setup Complete!</h2>
            <p className="text-muted-foreground">
              You're all set! You can now explore PoortLink and start connecting with your community.
            </p>
            <Button onClick={completeOnboarding} disabled={loading} className="mt-4">
              {loading ? 'Finishing...' : 'Start Using PoortLink'}
            </Button>
          </div>
        );

      default:
        return currentStepData.component || <div>Step content not found</div>;
    }
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-2xl mx-auto">
        {/* Progress Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold">Account Setup</h1>
            <Badge variant="outline">
              Step {currentStep + 1} of {steps.length}
            </Badge>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Step Indicator */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  index <= currentStep
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                }`}>
                  {step.completed ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    index + 1
                  )}
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-8 h-0.5 mx-2 ${
                    index < currentStep ? 'bg-primary' : 'bg-muted'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <Card>
          <CardHeader>
            <CardTitle>{currentStepData.title}</CardTitle>
            <p className="text-muted-foreground">{currentStepData.description}</p>
          </CardHeader>
          <CardContent>
            {renderStepContent()}
          </CardContent>
        </Card>

        {/* Navigation */}
        {currentStepData.id !== 'complete' && (
          <div className="flex justify-between mt-6">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 0}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>
            <Button onClick={nextStep}>
              Next
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};