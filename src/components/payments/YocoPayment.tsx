import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { CreditCard, Loader2, Shield } from 'lucide-react';

interface YocoPaymentProps {
  rideId?: string;
  amount: number;
  description?: string;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export const YocoPayment: React.FC<YocoPaymentProps> = ({
  rideId,
  amount,
  description = "MojaRide Payment",
  onSuccess,
  onError
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handlePayment = async () => {
    try {
      setIsLoading(true);

      const { data, error } = await supabase.functions.invoke('create-yoco-payment', {
        body: {
          amount,
          rideId,
          description
        }
      });

      if (error) {
        console.error('Yoco payment error:', error);
        const errorMessage = error.message || 'Payment initialization failed';
        toast({
          title: "Payment Error",
          description: errorMessage,
          variant: "destructive",
        });
        onError?.(errorMessage);
        return;
      }

      if (data?.redirect_url) {
        // Redirect to Yoco checkout
        window.location.href = data.redirect_url;
      } else {
        throw new Error('No redirect URL received from payment service');
      }
    } catch (error) {
      console.error('Payment processing error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Payment failed';
      toast({
        title: "Payment Failed",
        description: errorMessage,
        variant: "destructive",
      });
      onError?.(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
          <CreditCard className="w-8 h-8 text-primary" />
        </div>
        <CardTitle className="text-2xl">Secure Payment</CardTitle>
        <CardDescription>
          Complete your payment securely with Yoco
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="bg-muted/50 p-4 rounded-lg">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-muted-foreground">Amount:</span>
            <span className="text-lg font-semibold">R{amount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Description:</span>
            <span className="text-sm">{description}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Shield className="w-4 h-4" />
          <span>Your payment is secured by Yoco</span>
        </div>

        <Button 
          onClick={handlePayment}
          disabled={isLoading}
          className="w-full h-12 text-lg"
          size="lg"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <CreditCard className="w-5 h-5 mr-2" />
              Pay R{amount.toFixed(2)}
            </>
          )}
        </Button>

        <div className="text-xs text-center text-muted-foreground space-y-1">
          <p>By proceeding, you agree to our terms and conditions.</p>
          <p>Powered by Yoco - PCI DSS compliant payments</p>
        </div>
      </CardContent>
    </Card>
  );
};