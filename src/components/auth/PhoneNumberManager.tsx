import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Phone, Plus, Trash2, Check, Star } from 'lucide-react';
import { phoneNumberSchema } from '@/lib/validationSchemas';
import { z } from 'zod';

interface PhoneNumber {
  id: string;
  phone_number: string;
  is_primary: boolean;
  is_verified: boolean;
  verified_at: string | null;
  created_at: string;
}

export const PhoneNumberManager = () => {
  const [phoneNumbers, setPhoneNumbers] = useState<PhoneNumber[]>([]);
  const [newPhoneNumber, setNewPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchPhoneNumbers();
  }, []);

  const fetchPhoneNumbers = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('user_phone_numbers')
        .select('*')
        .eq('user_id', user.id)
        .order('is_primary', { ascending: false })
        .order('created_at', { ascending: true });

      if (error) throw error;
      setPhoneNumbers(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const formatPhoneNumber = (phone: string) => {
    const cleaned = phone.replace(/\D/g, '');
    
    if (cleaned.startsWith('27')) {
      return `+${cleaned}`;
    } else if (cleaned.startsWith('0')) {
      return `+27${cleaned.substring(1)}`;
    } else if (cleaned.length === 9) {
      return `+27${cleaned}`;
    }
    
    return cleaned.length > 0 ? `+27${cleaned}` : '';
  };

  const addPhoneNumber = async () => {
    setLoading(true);
    try {
      const formattedNumber = formatPhoneNumber(newPhoneNumber);
      
      // Validate using zod schema
      phoneNumberSchema.parse({ phoneNumber: formattedNumber });

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('user_phone_numbers')
        .insert({
          user_id: user.id,
          phone_number: formattedNumber,
          is_primary: phoneNumbers.length === 0,
          is_verified: false
        });

      if (error) throw error;

      setNewPhoneNumber('');
      fetchPhoneNumbers();
      toast({
        title: "Phone Number Added",
        description: "Your phone number has been added successfully",
      });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        toast({
          title: "Invalid Phone Number",
          description: error.errors[0].message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const removePhoneNumber = async (id: string) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('user_phone_numbers')
        .delete()
        .eq('id', id);

      if (error) throw error;

      fetchPhoneNumbers();
      toast({
        title: "Phone Number Removed",
        description: "Phone number has been removed successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const setPrimaryPhoneNumber = async (id: string) => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // First, set all phone numbers to non-primary
      await supabase
        .from('user_phone_numbers')
        .update({ is_primary: false })
        .eq('user_id', user.id);

      // Then set the selected one as primary
      const { error } = await supabase
        .from('user_phone_numbers')
        .update({ is_primary: true })
        .eq('id', id);

      if (error) throw error;

      fetchPhoneNumbers();
      toast({
        title: "Primary Phone Updated",
        description: "Primary phone number has been updated",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Phone className="h-5 w-5" />
          Phone Number Management
        </CardTitle>
        <CardDescription>
          Manage your phone numbers for ride requests and communications
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            value={newPhoneNumber}
            onChange={(e) => setNewPhoneNumber(e.target.value)}
            placeholder="0821234567 or +27821234567"
            className="flex-1"
          />
          <Button onClick={addPhoneNumber} disabled={loading}>
            <Plus className="h-4 w-4 mr-2" />
            Add
          </Button>
        </div>

        <div className="space-y-3">
          {phoneNumbers.map((phone) => (
            <div key={phone.id} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <div className="flex flex-col">
                  <span className="font-medium">{phone.phone_number}</span>
                  <div className="flex gap-2">
                    {phone.is_primary && (
                      <Badge variant="default" className="text-xs">
                        <Star className="h-3 w-3 mr-1" />
                        Primary
                      </Badge>
                    )}
                    {phone.is_verified ? (
                      <Badge variant="secondary" className="text-xs">
                        <Check className="h-3 w-3 mr-1" />
                        Verified
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-xs">
                        Unverified
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                {!phone.is_primary && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setPrimaryPhoneNumber(phone.id)}
                    disabled={loading}
                  >
                    Set Primary
                  </Button>
                )}
                {phoneNumbers.length > 1 && (
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => removePhoneNumber(phone.id)}
                    disabled={loading}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>

        {phoneNumbers.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No phone numbers added yet
          </div>
        )}

        <div className="p-3 bg-muted rounded-lg">
          <p className="text-sm text-muted-foreground">
            <strong>Note:</strong> You can add multiple phone numbers in case you lose your phone
            or need to use someone else's number to hail a ride. All numbers must be registered
            for security purposes.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};