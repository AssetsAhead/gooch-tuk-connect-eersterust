import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { PhoneRegistrationForm } from '@/components/auth/PhoneRegistrationForm';
import { useToast } from '@/hooks/use-toast';

export default function RegisterComplete() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [hasExistingRegistration, setHasExistingRegistration] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    checkRegistrationStatus();
  }, []);

  const checkRegistrationStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate('/auth');
        return;
      }

      // Check if user already has a registration
      const { data: registration } = await supabase
        .from('user_registrations')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (registration) {
        setHasExistingRegistration(true);
        toast({
          title: "Registration Complete",
          description: "You have already completed your registration",
        });
        navigate('/');
      }
    } catch (error) {
      console.log('No existing registration found');
    } finally {
      setLoading(false);
    }
  };

  const handleRegistrationComplete = () => {
    toast({
      title: "Registration Successful",
      description: "Welcome to PoortLink!",
    });
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Checking registration status...</p>
        </div>
      </div>
    );
  }

  if (hasExistingRegistration) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Complete Your Registration
          </h1>
          <p className="text-muted-foreground">
            Just a few more details to get you started
          </p>
        </div>
        
        <PhoneRegistrationForm onRegistrationComplete={handleRegistrationComplete} />
      </div>
    </div>
  );
}