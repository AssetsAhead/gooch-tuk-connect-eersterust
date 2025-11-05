import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Phone, Plus, Trash2, Check } from 'lucide-react';
import { registrationSchema } from '@/lib/validationSchemas';
import { z } from 'zod';

interface PhoneRegistrationFormProps {
  onRegistrationComplete: () => void;
}

export const PhoneRegistrationForm = ({ onRegistrationComplete }: PhoneRegistrationFormProps) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneNumbers, setPhoneNumbers] = useState<string[]>(['']);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const formatPhoneNumber = (phone: string) => {
    // Remove all non-digits
    const cleaned = phone.replace(/\D/g, '');
    
    // Handle South African numbers
    if (cleaned.startsWith('27')) {
      return `+${cleaned}`;
    } else if (cleaned.startsWith('0')) {
      return `+27${cleaned.substring(1)}`;
    } else if (cleaned.length === 9) {
      return `+27${cleaned}`;
    }
    
    return cleaned.length > 0 ? `+27${cleaned}` : '';
  };

  const addPhoneNumber = () => {
    setPhoneNumbers([...phoneNumbers, '']);
  };

  const removePhoneNumber = (index: number) => {
    if (phoneNumbers.length > 1) {
      setPhoneNumbers(phoneNumbers.filter((_, i) => i !== index));
    }
  };

  const updatePhoneNumber = (index: number, value: string) => {
    const newPhoneNumbers = [...phoneNumbers];
    newPhoneNumbers[index] = value;
    setPhoneNumbers(newPhoneNumbers);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      // Format and filter phone numbers
      const formattedPhones = phoneNumbers
        .map(formatPhoneNumber)
        .filter(phone => phone.length > 8);

      // Validate using zod schema
      const validatedData = registrationSchema.parse({
        firstName,
        lastName,
        phoneNumbers: formattedPhones
      });

      // Create user registration
      const { error: regError } = await supabase
        .from('user_registrations')
        .insert({
          user_id: user.id,
          first_name: validatedData.firstName,
          last_name: validatedData.lastName,
          registration_status: 'trial'
        });

      if (regError) throw regError;

      // Add phone numbers
      const phoneData = validatedData.phoneNumbers.map((phone, index) => ({
        user_id: user.id,
        phone_number: phone,
        is_primary: index === 0,
        is_verified: false
      }));

      const { error: phoneError } = await supabase
        .from('user_phone_numbers')
        .insert(phoneData);

      if (phoneError) throw phoneError;

      // Create initial portal access for passenger role
      const { error: accessError } = await supabase
        .from('portal_access')
        .insert({
          user_id: user.id,
          portal_type: 'passenger',
          access_granted: true,
          granted_at: new Date().toISOString()
        });

      if (accessError) throw accessError;

      toast({
        title: "Registration Successful",
        description: "Your trial registration has been completed. You can now access the passenger portal.",
      });

      onRegistrationComplete();
    } catch (error: any) {
      console.error('Registration error:', error);
      
      if (error instanceof z.ZodError) {
        const firstError = error.errors[0];
        toast({
          title: "Validation Error",
          description: firstError.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Registration Failed",
          description: error.message || "Please try again.",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="mx-auto max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Phone className="h-5 w-5" />
          Trial Registration
        </CardTitle>
        <CardDescription>
          Complete your trial registration with name and phone number(s)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="John"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Doe"
                required
              />
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Phone Numbers</Label>
              <Badge variant="secondary">Trial Registration</Badge>
            </div>
            
            {phoneNumbers.map((phone, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  value={phone}
                  onChange={(e) => updatePhoneNumber(index, e.target.value)}
                  placeholder="0821234567 or +27821234567"
                  className="flex-1"
                />
                {index === 0 && (
                  <Badge variant="outline" className="flex items-center gap-1 px-2">
                    <Check className="h-3 w-3" />
                    Primary
                  </Badge>
                )}
                {phoneNumbers.length > 1 && index > 0 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => removePhoneNumber(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
            
            <Button
              type="button"
              variant="outline"
              onClick={addPhoneNumber}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Another Phone Number
            </Button>
          </div>

          <div className="space-y-2 p-3 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">
              <strong>Trial Period:</strong> During the trial, only name and phone number are required.
              Later, drivers will need:
            </p>
            <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
              <li>Valid driver's license</li>
              <li>PDP certification</li>
              <li>Admin approval</li>
            </ul>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Registering...' : 'Complete Registration'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};