import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Home, Receipt } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const PaymentSuccess: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  
  const sessionId = searchParams.get('session_id');
  const rideId = searchParams.get('ride_id');

  useEffect(() => {
    // Show success toast
    toast({
      title: "Payment Successful!",
      description: "Your payment has been processed successfully.",
    });
  }, [toast]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <CardTitle className="text-2xl text-green-600">Payment Successful!</CardTitle>
          <CardDescription>
            Your payment has been processed successfully
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {sessionId && (
            <div className="bg-muted/50 p-4 rounded-lg">
              <div className="text-sm text-muted-foreground mb-1">Transaction ID:</div>
              <div className="font-mono text-sm break-all">{sessionId}</div>
            </div>
          )}

          <div className="text-center text-sm text-muted-foreground">
            <p>You will receive a confirmation email shortly.</p>
            <p>Thank you for using our service!</p>
          </div>

          <div className="flex flex-col gap-3">
            <Button 
              onClick={() => navigate('/')}
              className="w-full"
            >
              <Home className="w-4 h-4 mr-2" />
              Return Home
            </Button>
            
            {rideId && (
              <Button 
                variant="outline"
                onClick={() => navigate(`/ride/${rideId}`)}
                className="w-full"
              >
                <Receipt className="w-4 h-4 mr-2" />
                View Ride Details
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};