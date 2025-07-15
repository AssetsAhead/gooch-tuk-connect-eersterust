import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AuthForm } from '@/components/auth/AuthForm';
import { VerificationSent } from '@/components/auth/VerificationSent';
import { useAuth } from '@/hooks/useAuth';
import { ArrowLeft, Shield, Car, Users, CreditCard, UserCheck, AlertTriangle } from 'lucide-react';

const roleConfig = {
  passenger: {
    title: 'Passenger Portal',
    subtitle: 'Book safe, reliable rides',
    icon: Users,
    color: 'tuk-blue',
    gradient: 'from-tuk-blue/20 to-info/10'
  },
  driver: {
    title: 'Driver Portal', 
    subtitle: 'Manage rides and earnings',
    icon: Car,
    color: 'tuk-orange',
    gradient: 'from-tuk-orange/20 to-warning/10'
  },
  owner: {
    title: 'Vehicle Owner Portal',
    subtitle: 'Fleet management dashboard',
    icon: CreditCard,
    color: 'success',
    gradient: 'from-success/20 to-secondary/10'
  },
  marshall: {
    title: 'Rank Marshall Portal',
    subtitle: 'Manage rank operations',
    icon: UserCheck,
    color: 'secondary',
    gradient: 'from-secondary/20 to-success/10'
  },
  admin: {
    title: 'Admin Portal',
    subtitle: 'System oversight and management',
    icon: Shield,
    color: 'primary',
    gradient: 'from-primary/20 to-warning/10'
  },
  police: {
    title: 'Police & Traffic Portal',
    subtitle: 'Compliance and incident management', 
    icon: AlertTriangle,
    color: 'danger',
    gradient: 'from-danger/20 to-accent/10'
  }
};

export const RoleAuth = () => {
  const { role } = useParams<{ role: string }>();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [verificationSent, setVerificationSent] = useState(false);
  
  const { loading, handleEmailAuth, handlePhoneAuth } = useAuth();

  const config = roleConfig[role as keyof typeof roleConfig];
  
  if (!config) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-destructive mb-4">Invalid Role</h1>
          <Button onClick={() => navigate('/')}>Return Home</Button>
        </div>
      </div>
    );
  }

  const onEmailAuth = async () => {
    const success = await handleEmailAuth(
      email, 
      authMode === 'signup' ? name : undefined, 
      authMode === 'signup' ? role : undefined
    );
    if (success) setVerificationSent(true);
  };

  const onPhoneAuth = async () => {
    const success = await handlePhoneAuth(phone);
    if (success) setVerificationSent(true);
  };

  if (verificationSent) {
    return (
      <VerificationSent 
        email={email || undefined}
        phone={phone || undefined}
        onBack={() => setVerificationSent(false)}
      />
    );
  }

  const IconComponent = config.icon;

  return (
    <div className={`min-h-screen bg-gradient-to-br ${config.gradient} p-4`}>
      <div className="container mx-auto flex flex-col items-center justify-center min-h-screen max-w-md">
        {/* Back Button */}
        <Button 
          variant="ghost" 
          onClick={() => navigate('/')}
          className="self-start mb-8"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Role Selection
        </Button>

        {/* Role-specific Header */}
        <div className="text-center mb-8">
          <div className={`w-20 h-20 bg-${config.color}/20 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-${config.color}/30`}>
            <IconComponent className={`h-10 w-10 text-${config.color}`} />
          </div>
          <h1 className="text-3xl font-bold mb-2">{config.title}</h1>
          <p className="text-muted-foreground">{config.subtitle}</p>
        </div>

        {/* Platform Integration Notice */}
        <div className="bg-card/80 backdrop-blur-sm border rounded-lg p-4 mb-6 w-full">
          <p className="text-sm text-center">
            🚀 <strong>Future Platform Integration:</strong> This portal will connect with Uber, Bolt, and other transport platforms for enhanced market reach
          </p>
        </div>

        {/* Auth Card */}
        <Card className="w-full backdrop-blur-sm bg-background/95 border shadow-xl">
          <CardHeader className="text-center">
            <CardTitle className="text-xl">Access Your {config.title}</CardTitle>
            <CardDescription>
              Secure authentication with role-based access control
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AuthForm
              loading={loading}
              email={email}
              phone={phone}
              name={name}
              role={role || 'passenger'}
              authMode={authMode}
              setEmail={setEmail}
              setPhone={setPhone}
              setName={setName}
              setRole={() => {}} // Role is fixed based on route
              setAuthMode={setAuthMode}
              onPhoneAuth={onPhoneAuth}
              onEmailAuth={onEmailAuth}
            />

            <div className="mt-6 text-center text-xs text-muted-foreground">
              Role-specific access • SASSA verification • WhatsApp-style auth
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};