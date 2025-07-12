import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { CreditCard, Smartphone, Coins, Receipt, Clock, Check } from 'lucide-react';

interface PaymentRecord {
  id: string;
  ride_id: string;
  amount: number;
  payment_method: string;
  status: string;
  created_at: string;
  ride?: {
    pickup_location: string;
    destination: string;
    passenger_id: string;
  };
}

interface PaymentCollectionProps {
  userType: 'driver' | 'owner';
  userId: string;
}

export default function PaymentCollection({ userType, userId }: PaymentCollectionProps) {
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [collectingPayment, setCollectingPayment] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [selectedMethod, setSelectedMethod] = useState('cash');
  const { toast } = useToast();

  useEffect(() => {
    fetchPayments();
  }, [userId]);

  const fetchPayments = async () => {
    try {
      setIsLoading(true);
      
      let query = supabase
        .from('transactions')
        .select(`
          *,
          rides(pickup_location, destination, passenger_id)
        `)
        .order('created_at', { ascending: false })
        .limit(20);

      if (userType === 'driver') {
        // Get payments for rides where this user is the driver
        const { data: rideData } = await supabase
          .from('rides')
          .select('id')
          .eq('driver_id', userId);
        
        const rideIds = rideData?.map(ride => ride.id) || [];
        if (rideIds.length > 0) {
          query = query.in('ride_id', rideIds);
        }
      }

      const { data, error } = await query;
      
      if (error) throw error;
      setPayments(data || []);
    } catch (error) {
      console.error('Error fetching payments:', error);
      toast({
        title: "Error",
        description: "Failed to load payment records",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const recordPayment = async () => {
    if (!paymentAmount || parseFloat(paymentAmount) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid payment amount",
        variant: "destructive"
      });
      return;
    }

    try {
      setCollectingPayment(true);
      const amount = parseFloat(paymentAmount);
      
      // If payment method is card, redirect to Yoco
      if (selectedMethod === 'card') {
        const { data, error } = await supabase.functions.invoke('create-yoco-payment', {
          body: {
            amount,
            description: `Manual payment collection - ${userType}`,
          },
        });

        if (error) throw error;

        // Redirect to Yoco checkout
        window.open(data.redirect_url, '_blank');
        
        toast({
          title: "Redirecting to Payment",
          description: "You'll be redirected to complete the card payment",
        });
        
        setPaymentAmount('');
      } else {
        // Handle cash/mobile payments locally
        const driverShare = amount * 0.7; // 70% to driver
        const ownerShare = amount * 0.2;  // 20% to owner
        const platformFee = amount * 0.1; // 10% platform fee

        const { error } = await supabase
          .from('transactions')
          .insert({
            amount,
            driver_share: driverShare,
            owner_share: ownerShare,
            platform_fee: platformFee,
            payment_method: selectedMethod,
            status: 'completed',
            ride_type: 'taxi' // Default for manual entries
          });

        if (error) throw error;

        toast({
          title: "Payment Recorded",
          description: `${selectedMethod.charAt(0).toUpperCase() + selectedMethod.slice(1)} payment of R${paymentAmount} recorded successfully`,
        });

        setPaymentAmount('');
        fetchPayments();
      }
    } catch (error) {
      console.error('Error processing payment:', error);
      toast({
        title: "Error",
        description: "Failed to process payment",
        variant: "destructive"
      });
    } finally {
      setCollectingPayment(false);
    }
  };

  const getPaymentIcon = (method: string) => {
    switch (method) {
      case 'cash': return <Coins className="h-4 w-4" />;
      case 'card': return <CreditCard className="h-4 w-4" />;
      case 'mobile': return <Smartphone className="h-4 w-4" />;
      default: return <Receipt className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            Payment Collection
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="record" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="record">Record Payment</TabsTrigger>
              <TabsTrigger value="history">Payment History</TabsTrigger>
            </TabsList>
            
            <TabsContent value="record" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Amount (R)</label>
                  <Input
                    type="number"
                    step="0.50"
                    placeholder="0.00"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-2 block">Payment Method</label>
                  <Tabs value={selectedMethod} onValueChange={setSelectedMethod}>
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="cash" className="text-xs">Cash</TabsTrigger>
                      <TabsTrigger value="card" className="text-xs">Card</TabsTrigger>
                      <TabsTrigger value="mobile" className="text-xs">Mobile</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
                
                <div className="flex items-end">
                  <Button 
                    onClick={recordPayment}
                    disabled={collectingPayment || !paymentAmount}
                    className="w-full"
                  >
                    {collectingPayment ? (
                      <>
                        <Clock className="h-4 w-4 mr-2 animate-spin" />
                        Recording...
                      </>
                    ) : (
                      <>
                        <Check className="h-4 w-4 mr-2" />
                        Record Payment
                      </>
                    )}
                  </Button>
                </div>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Payment Split</h4>
                {paymentAmount && parseFloat(paymentAmount) > 0 && (
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-blue-700">Driver (70%)</span>
                      <p className="font-medium">R{(parseFloat(paymentAmount) * 0.7).toFixed(2)}</p>
                    </div>
                    <div>
                      <span className="text-blue-700">Owner (20%)</span>
                      <p className="font-medium">R{(parseFloat(paymentAmount) * 0.2).toFixed(2)}</p>
                    </div>
                    <div>
                      <span className="text-blue-700">Platform (10%)</span>
                      <p className="font-medium">R{(parseFloat(paymentAmount) * 0.1).toFixed(2)}</p>
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="history" className="space-y-4">
              {isLoading ? (
                <div className="text-center py-8">
                  <Clock className="h-8 w-8 animate-spin mx-auto mb-2" />
                  <p>Loading payment history...</p>
                </div>
              ) : payments.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Receipt className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No payment records found</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {payments.map((payment) => (
                    <Card key={payment.id} className="border-l-4 border-l-blue-500">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {getPaymentIcon(payment.payment_method)}
                            <div>
                              <p className="font-medium">R{payment.amount.toFixed(2)}</p>
                              <p className="text-sm text-gray-600">
                                {payment.payment_method.charAt(0).toUpperCase() + payment.payment_method.slice(1)} payment
                              </p>
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <Badge className={getStatusColor(payment.status)}>
                              {payment.status}
                            </Badge>
                            <p className="text-xs text-gray-500 mt-1">
                              {new Date(payment.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        
                        {payment.ride && (
                          <div className="mt-3 pt-3 border-t border-gray-100">
                            <p className="text-sm text-gray-600">
                              Trip: {payment.ride.pickup_location} → {payment.ride.destination}
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}