import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { YocoPayment } from './YocoPayment';
import { Calculator, CreditCard } from 'lucide-react';
import { paymentAmountSchema } from '@/lib/validationSchemas';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';

interface PaymentFormProps {
  rideId?: string;
  initialAmount?: number;
  onPaymentSuccess?: () => void;
  onPaymentError?: (error: string) => void;
}

export const PaymentForm: React.FC<PaymentFormProps> = ({
  rideId,
  initialAmount = 0,
  onPaymentSuccess,
  onPaymentError
}) => {
  const { toast } = useToast();
  const [amount, setAmount] = useState(initialAmount);
  const [paymentType, setPaymentType] = useState<'ride' | 'deposit' | 'subscription'>('ride');
  const [description, setDescription] = useState('MojaRide Payment');
  const [showPayment, setShowPayment] = useState(false);

  const paymentTypes = [
    { value: 'ride', label: 'Ride Payment', desc: 'Payment for taxi ride' },
    { value: 'deposit', label: 'Wallet Deposit', desc: 'Add money to wallet' },
    { value: 'subscription', label: 'Subscription', desc: 'Monthly service fee' },
  ];

  const handleAmountChange = (value: string) => {
    const numValue = parseFloat(value) || 0;
    setAmount(numValue);
  };

  const handlePaymentTypeChange = (type: string) => {
    if (type === 'ride' || type === 'deposit' || type === 'subscription') {
      setPaymentType(type);
      const typeData = paymentTypes.find(t => t.value === type);
      if (typeData) {
        setDescription(typeData.desc);
      }
    }
  };

  const validateAndProceed = () => {
    try {
      paymentAmountSchema.parse({
        amount,
        description,
        paymentType
      });
      setShowPayment(true);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errorMessage = error.errors[0].message;
        toast({ 
          title: "Validation Error", 
          description: errorMessage,
          variant: "destructive" 
        });
        onPaymentError?.(errorMessage);
      }
    }
  };

  if (showPayment) {
    return (
      <div className="space-y-4">
        <Button 
          variant="outline" 
          onClick={() => setShowPayment(false)}
          className="mb-4"
        >
          ← Back to Payment Details
        </Button>
        <YocoPayment
          rideId={rideId}
          amount={amount}
          description={description}
          onSuccess={onPaymentSuccess}
          onError={onPaymentError}
        />
      </div>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="w-5 h-5" />
          Payment Details
        </CardTitle>
        <CardDescription>
          Enter the payment amount and select payment type
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="amount">Amount (ZAR)</Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
              R
            </span>
            <Input
              id="amount"
              type="number"
              placeholder="0.00"
              value={amount || ''}
              onChange={(e) => handleAmountChange(e.target.value)}
              className="pl-8"
              min="5"
              max="10000"
              step="0.01"
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Minimum: R5.00 • Maximum: R10,000.00
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="payment-type">Payment Type</Label>
          <Select value={paymentType} onValueChange={handlePaymentTypeChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select payment type" />
            </SelectTrigger>
            <SelectContent>
              {paymentTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  <div>
                    <div className="font-medium">{type.label}</div>
                    <div className="text-xs text-muted-foreground">{type.desc}</div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Input
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Payment description"
          />
        </div>

        <div className="bg-muted/50 p-4 rounded-lg">
          <div className="flex justify-between items-center">
            <span className="font-medium">Total Amount:</span>
            <span className="text-2xl font-bold text-primary">
              R{amount.toFixed(2)}
            </span>
          </div>
        </div>

        <Button 
          onClick={validateAndProceed}
          disabled={!amount || amount <= 0}
          className="w-full h-12"
          size="lg"
        >
          <CreditCard className="w-5 h-5 mr-2" />
          Continue to Payment
        </Button>
      </CardContent>
    </Card>
  );
};