import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Wallet, CreditCard, Phone, ShoppingCart, PiggyBank, Zap } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface FinancialServicesProps {
  userType: "driver" | "passenger" | "owner";
  currentBalance: number;
}

export const FinancialServices = ({ userType, currentBalance }: FinancialServicesProps) => {
  const [airtimeAmount, setAirtimeAmount] = useState("");
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const { toast } = useToast();

  const walletServices = [
    { id: "airtime", name: "Buy Airtime", icon: Phone, description: "R5, R10, R20, R50, R100", color: "primary" },
    { id: "electricity", name: "Electricity", icon: Zap, description: "Prepaid electricity vouchers", color: "warning" },
    { id: "groceries", name: "Grocery Vouchers", icon: ShoppingCart, description: "Pick n Pay, Shoprite vouchers", color: "success" },
    { id: "savings", name: "Group Savings", icon: PiggyBank, description: "Save for vehicle purchase", color: "tuk-blue" }
  ];

  const loanOptions = userType === "driver" ? [
    { amount: "R50", repay: "R60", term: "7 days", approved: true },
    { amount: "R100", repay: "R120", term: "14 days", approved: true },
    { amount: "R200", repay: "R250", term: "30 days", approved: false, reason: "Complete 5 more rides" }
  ] : [];

  const handleServicePurchase = (serviceId: string) => {
    if (serviceId === "airtime" && airtimeAmount) {
      const amount = parseInt(airtimeAmount);
      if (amount > currentBalance) {
        toast({
          title: "Insufficient Balance",
          description: "Please add funds to your wallet first",
          variant: "destructive",
        });
        return;
      }
      
      toast({
        title: "Airtime Purchased! 📱",
        description: `R${amount} airtime sent to your number`,
      });
      setAirtimeAmount("");
    } else {
      toast({
        title: "Service Coming Soon! 🚀",
        description: "This service will be available next week",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Wallet Balance */}
      <Card className="border-primary/20">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <Wallet className="h-6 w-6 text-primary" />
              </div>
              <div>
                <div className="text-2xl font-bold text-primary">R{currentBalance}</div>
                <p className="text-sm text-muted-foreground">Available Balance</p>
              </div>
            </div>
            <div className="text-right">
              <Button className="bg-success hover:bg-success/90">
                <CreditCard className="h-4 w-4 mr-2" />
                Add Money
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Financial Services */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {walletServices.map((service) => (
          <Card 
            key={service.id} 
            className={`cursor-pointer transition-all hover:scale-105 ${
              selectedService === service.id ? "border-primary ring-2 ring-primary/20" : ""
            }`}
            onClick={() => setSelectedService(selectedService === service.id ? null : service.id)}
          >
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 bg-${service.color}/10 rounded-full flex items-center justify-center`}>
                  <service.icon className={`h-5 w-5 text-${service.color}`} />
                </div>
                <div>
                  <div className="font-medium">{service.name}</div>
                  <p className="text-xs text-muted-foreground">{service.description}</p>
                </div>
              </div>
              
              {selectedService === service.id && service.id === "airtime" && (
                <div className="mt-4 space-y-3">
                  <div className="flex space-x-2">
                    {["5", "10", "20", "50", "100"].map((amount) => (
                      <Button
                        key={amount}
                        size="sm"
                        variant={airtimeAmount === amount ? "default" : "outline"}
                        onClick={(e) => {
                          e.stopPropagation();
                          setAirtimeAmount(amount);
                        }}
                        className="text-xs"
                      >
                        R{amount}
                      </Button>
                    ))}
                  </div>
                  <div className="flex space-x-2">
                    <Input
                      placeholder="Custom amount"
                      value={airtimeAmount}
                      onChange={(e) => setAirtimeAmount(e.target.value)}
                      className="flex-1"
                      onClick={(e) => e.stopPropagation()}
                    />
                    <Button 
                      size="sm" 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleServicePurchase("airtime");
                      }}
                      disabled={!airtimeAmount}
                    >
                      Buy
                    </Button>
                  </div>
                </div>
              )}
              
              {selectedService === service.id && service.id !== "airtime" && (
                <Button 
                  className="w-full mt-4" 
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleServicePurchase(service.id);
                  }}
                >
                  Select {service.name}
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Micro-loans for Drivers */}
      {userType === "driver" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <CreditCard className="h-6 w-6 mr-2 text-tuk-blue" />
              💰 Quick Loans (Drivers Only)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {loanOptions.map((loan, index) => (
                <div 
                  key={index}
                  className={`p-4 rounded-lg border ${
                    loan.approved ? "border-success/20 bg-success/5" : "border-muted/20 bg-muted/5"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-bold text-lg">{loan.amount}</div>
                      <div className="text-sm text-muted-foreground">
                        Repay {loan.repay} in {loan.term}
                      </div>
                      {!loan.approved && (
                        <p className="text-xs text-warning mt-1">{loan.reason}</p>
                      )}
                    </div>
                    <Button 
                      size="sm" 
                      disabled={!loan.approved}
                      className={loan.approved ? "bg-success hover:bg-success/90" : ""}
                    >
                      {loan.approved ? "Get Loan" : "Not Available"}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-4 p-3 bg-tuk-blue/10 rounded-lg border border-tuk-blue/20">
              <div className="text-center">
                <p className="text-sm font-medium">💡 Build Your Credit Score</p>
                <p className="text-xs text-muted-foreground">
                  Complete more rides and maintain good ratings to unlock bigger loans
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Group Savings (Community Feature) */}
      <Card className="border-success/20">
        <CardHeader>
          <CardTitle className="flex items-center">
            <PiggyBank className="h-6 w-6 mr-2 text-success" />
            🤝 Community Vehicle Fund
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-success">R8,450</div>
              <p className="text-sm text-muted-foreground">Saved towards new Tuk Tuk</p>
              <div className="w-full bg-muted h-2 rounded-full mt-2">
                <div className="w-3/4 bg-success h-2 rounded-full"></div>
              </div>
              <p className="text-xs text-muted-foreground mt-1">R1,550 to go!</p>
            </div>
            
            <div className="flex justify-between text-sm">
              <span>Monthly contribution:</span>
              <span className="font-medium">R150</span>
            </div>
            
            <div className="flex space-x-4">
              <Button className="flex-1 bg-success hover:bg-success/90">
                Contribute R50
              </Button>
              <Button variant="outline" className="flex-1">
                View Fund Details
              </Button>
            </div>
            
            <div className="text-center">
              <Badge className="bg-success text-white">
                12 community members participating
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};