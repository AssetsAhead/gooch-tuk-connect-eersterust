import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { XCircle, ArrowLeft, RefreshCw } from 'lucide-react';

export const PaymentCancelled: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const rideId = searchParams.get('ride_id');

  const handleRetryPayment = () => {
    if (rideId) {
      navigate(`/ride/${rideId}/payment`);
    } else {
      navigate(-1); // Go back to previous page
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <XCircle className="w-12 h-12 text-red-600" />
          </div>
          <CardTitle className="text-2xl text-red-600">Payment Cancelled</CardTitle>
          <CardDescription>
            Your payment was cancelled or interrupted
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="text-center text-sm text-muted-foreground space-y-2">
            <p>Don't worry, no charges were made to your account.</p>
            <p>You can try again or return to continue later.</p>
          </div>

          <div className="flex flex-col gap-3">
            <Button 
              onClick={handleRetryPayment}
              className="w-full"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
            
            <Button 
              variant="outline"
              onClick={() => navigate('/')}
              className="w-full"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Return Home
            </Button>
          </div>

          <div className="text-xs text-center text-muted-foreground">
            <p>If you're experiencing issues, please contact support.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};