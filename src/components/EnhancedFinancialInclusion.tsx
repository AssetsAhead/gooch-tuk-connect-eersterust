import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Smartphone, 
  Users, 
  CreditCard, 
  PiggyBank, 
  TrendingUp,
  Shield,
  Phone,
  Banknote,
  Building,
  Star,
  Wallet,
  Zap,
  ShoppingCart
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export const EnhancedFinancialInclusion = () => {
  const [ussdCode, setUssdCode] = useState("");
  const [selectedAmount, setSelectedAmount] = useState("");
  const [selectedNetwork, setSelectedNetwork] = useState("");
  const { toast } = useToast();

  const bankingPartners = [
    { 
      name: "Capitec Bank", 
      service: "USSD Banking", 
      code: "*120*3279#", 
      features: ["Balance Check", "Send Money", "Buy Airtime", "Pay Bills"],
      rating: 4.8,
      integration: "full"
    },
    { 
      name: "FNB", 
      service: "eWallet Pro", 
      code: "*120*321#", 
      features: ["Cash Withdrawal", "Bill Payments", "Transfers", "Savings"],
      rating: 4.6,
      integration: "full"
    },
    { 
      name: "Standard Bank", 
      service: "USSD Services", 
      code: "*120*2345#", 
      features: ["Instant EFT", "Prepaid Services", "Loans", "Insurance"],
      rating: 4.5,
      integration: "partial"
    }
  ];

  const airtimeMarketplace = [
    {
      seller: "Mama Sarah's Shop",
      network: "All Networks",
      discount: "5% bulk discount",
      rating: 4.9,
      location: "Block A, Street 15",
      stock: "High"
    },
    {
      seller: "Lucky's Electronics", 
      network: "Vodacom, MTN",
      discount: "R2 off R50+",
      rating: 4.7,
      location: "Main Road",
      stock: "Medium"
    },
    {
      seller: "Community Spaza Network",
      network: "All Networks",
      discount: "Credit available",
      rating: 4.8,
      location: "Multiple locations",
      stock: "High"
    }
  ];

  const microLendingOptions = [
    {
      provider: "Community Guarantee Circle",
      amount: "R500 - R5,000",
      term: "1-6 months",
      rate: "10% p.a.",
      requirement: "3 community guarantors + 6mo residence",
      approval: "24 hours",
      guarantors: 247,
      success: "96%"
    },
    {
      provider: "Taxi Association Credit Union",
      amount: "R2,000 - R25,000",
      term: "6-24 months", 
      rate: "14% p.a.",
      requirement: "Association membership + income proof",
      approval: "48 hours",
      guarantors: 89,
      success: "94%"
    },
    {
      provider: "Stokvel Emergency Fund",
      amount: "R1,000 - R8,000",
      term: "3-12 months",
      rate: "6% p.a.",
      requirement: "Stokvel membership 6mo+ + good standing",
      approval: "Same day",
      guarantors: 156,
      success: "98%"
    }
  ];

  const handleUSSDIntegration = (bankCode: string) => {
    toast({
      title: "USSD Service Connected",
      description: `Connected to ${bankCode} - You can now use all banking features directly in the app`,
    });
  };

  const handleAirtimePurchase = (seller: string) => {
    if (!selectedAmount || !selectedNetwork) {
      toast({
        title: "Missing Information",
        description: "Please select amount and network",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Airtime Purchased Successfully!",
      description: `R${selectedAmount} ${selectedNetwork} airtime from ${seller} has been sent`,
    });
  };

  const handleGuarantorRequest = (provider: string) => {
    toast({
      title: "Guarantor Request Sent",
      description: `Your request for community guarantors for ${provider} has been broadcast to verified members`,
    });
  };

  return (
    <Card className="border-success/20">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Banknote className="h-6 w-6 mr-2 text-success" />
          Revolutionary Financial Inclusion Hub
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="banking" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="banking">📱 Smart Banking</TabsTrigger>
            <TabsTrigger value="airtime">📞 Airtime Market</TabsTrigger>
            <TabsTrigger value="lending">💰 Micro-Lending</TabsTrigger>
            <TabsTrigger value="stokvels">🤝 Stokvels 2.0</TabsTrigger>
            <TabsTrigger value="integration">🔗 API Integration</TabsTrigger>
          </TabsList>

          <TabsContent value="banking" className="space-y-4">
            {/* Feature Phone Banking with API Integration */}
            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Phone className="h-5 w-5 mr-2 text-primary" />
                  USSD Banking with Smart Integration
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {bankingPartners.map((bank, index) => (
                    <Card key={index} className="border-tuk-blue/20 hover:border-tuk-blue/40 transition-colors">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <Building className="h-6 w-6 text-tuk-blue" />
                            <div>
                              <h4 className="font-bold">{bank.name}</h4>
                              <p className="text-sm text-muted-foreground">{bank.service}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center text-sm">
                              <Star className="h-4 w-4 text-warning mr-1" />
                              <span>{bank.rating}</span>
                            </div>
                            <Badge className={`${
                              bank.integration === 'full' ? 'bg-success' : 'bg-warning'
                            } text-white`}>
                              {bank.integration === 'full' ? 'Full Integration' : 'Partial'}
                            </Badge>
                          </div>
                        </div>
                        
                        <div className="mb-3">
                          <div className="bg-muted p-3 rounded-lg text-center">
                            <span className="text-lg font-mono font-bold">{bank.code}</span>
                          </div>
                        </div>
                        
                        <div className="flex flex-wrap gap-2 mb-3">
                          {bank.features.map((feature, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {feature}
                            </Badge>
                          ))}
                        </div>
                        
                        <div className="flex gap-2">
                          <Button 
                            onClick={() => handleUSSDIntegration(bank.code)}
                            variant="outline" 
                            className="flex-1"
                          >
                            🔗 Connect API
                          </Button>
                          <Button 
                            className="flex-1 bg-tuk-blue hover:bg-tuk-blue/90"
                          >
                            📱 Use USSD
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="airtime" className="space-y-4">
            {/* Enhanced Airtime Marketplace */}
            <Card className="border-warning/20">
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Smartphone className="h-5 w-5 mr-2 text-warning" />
                  Community Airtime & Data Marketplace
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Amount</label>
                    <select 
                      className="w-full p-2 border rounded-md"
                      value={selectedAmount}
                      onChange={(e) => setSelectedAmount(e.target.value)}
                    >
                      <option value="">Select Amount</option>
                      <option value="5">R5 Airtime</option>
                      <option value="10">R10 Airtime</option>
                      <option value="20">R20 Airtime</option>
                      <option value="50">R50 Airtime</option>
                      <option value="29">1GB Data - R29</option>
                      <option value="49">2GB Data - R49</option>
                      <option value="99">5GB Data - R99</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Network</label>
                    <select 
                      className="w-full p-2 border rounded-md"
                      value={selectedNetwork}
                      onChange={(e) => setSelectedNetwork(e.target.value)}
                    >
                      <option value="">Select Network</option>
                      <option value="Vodacom">Vodacom</option>
                      <option value="MTN">MTN</option>
                      <option value="Cell C">Cell C</option>
                      <option value="Telkom">Telkom</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-3">
                  {airtimeMarketplace.map((seller, index) => (
                    <Card key={index} className="border-secondary/20 hover:border-secondary/40 transition-colors">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <h4 className="font-bold">{seller.seller}</h4>
                            <p className="text-sm text-muted-foreground">{seller.location}</p>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center text-sm">
                              <Star className="h-4 w-4 text-warning mr-1" />
                              <span>{seller.rating}</span>
                            </div>
                            <Badge className={`${
                              seller.stock === 'High' ? 'bg-success' : 
                              seller.stock === 'Medium' ? 'bg-warning' : 'bg-danger'
                            } text-white text-xs`}>
                              {seller.stock} Stock
                            </Badge>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-success font-medium">{seller.discount}</p>
                            <p className="text-xs text-muted-foreground">{seller.network}</p>
                          </div>
                          <Button 
                            size="sm"
                            onClick={() => handleAirtimePurchase(seller.seller)}
                            className="bg-warning hover:bg-warning/90 text-black"
                          >
                            📱 Buy Now
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="lending" className="space-y-4">
            {/* Enhanced Micro-lending with Community Guarantors */}
            <div className="grid gap-4">
              {microLendingOptions.map((option, index) => (
                <Card key={index} className="border-tuk-orange/20 hover:border-tuk-orange/40 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <CreditCard className="h-6 w-6 text-tuk-orange" />
                        <div>
                          <h4 className="font-bold">{option.provider}</h4>
                          <p className="text-sm text-muted-foreground">{option.requirement}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge className="bg-success text-white">{option.approval}</Badge>
                        <div className="text-xs text-muted-foreground mt-1">{option.success} success rate</div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 mb-3">
                      <div>
                        <div className="text-sm text-muted-foreground">Amount</div>
                        <div className="font-bold text-primary">{option.amount}</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Rate</div>
                        <div className="font-bold text-tuk-orange">{option.rate}</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Guarantors Available</div>
                        <div className="font-bold text-success">{option.guarantors}</div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button 
                        className="flex-1 bg-tuk-orange hover:bg-tuk-orange/90"
                      >
                        📝 Apply Now
                      </Button>
                      <Button 
                        variant="outline"
                        onClick={() => handleGuarantorRequest(option.provider)}
                      >
                        🤝 Find Guarantors
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Community Guarantor Network */}
            <Card className="border-tuk-blue/20">
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Shield className="h-5 w-5 mr-2 text-tuk-blue" />
                  Smart Guarantor Matching System
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-success/10 rounded-lg">
                    <div className="text-2xl font-bold text-success">492</div>
                    <div className="text-sm text-muted-foreground">Verified Guarantors</div>
                  </div>
                  <div className="text-center p-4 bg-primary/10 rounded-lg">
                    <div className="text-2xl font-bold text-primary">96%</div>
                    <div className="text-sm text-muted-foreground">Success Rate</div>
                  </div>
                  <div className="text-center p-4 bg-warning/10 rounded-lg">
                    <div className="text-2xl font-bold text-warning">24h</div>
                    <div className="text-sm text-muted-foreground">Avg Approval Time</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="stokvels" className="space-y-4">
            {/* Digital Stokvel Management */}
            <Card className="border-success/20">
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <PiggyBank className="h-5 w-5 mr-2 text-success" />
                  Digital Stokvel Management Platform
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-bold mb-3">Smart Features</h4>
                    <div className="space-y-2">
                      <div className="flex items-center p-2 bg-success/10 rounded">
                        <Zap className="h-4 w-4 text-success mr-2" />
                        <span className="text-sm">Automated payments via USSD</span>
                      </div>
                      <div className="flex items-center p-2 bg-primary/10 rounded">
                        <Shield className="h-4 w-4 text-primary mr-2" />
                        <span className="text-sm">Blockchain transaction records</span>
                      </div>
                      <div className="flex items-center p-2 bg-warning/10 rounded">
                        <TrendingUp className="h-4 w-4 text-warning mr-2" />
                        <span className="text-sm">AI-powered savings optimization</span>
                      </div>
                      <div className="flex items-center p-2 bg-tuk-blue/10 rounded">
                        <Users className="h-4 w-4 text-tuk-blue mr-2" />
                        <span className="text-sm">Community-verified members</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-bold mb-3">Create Smart Stokvel</h4>
                    <div className="space-y-3">
                      <Input placeholder="Stokvel Name" />
                      <Input placeholder="Monthly Contribution (R)" type="number" />
                      <select className="w-full p-2 border rounded-md">
                        <option>Select Smart Purpose</option>
                        <option>Grocery Buying Circle</option>
                        <option>Emergency Fund Pool</option>
                        <option>Investment Club</option>
                        <option>Vehicle Purchase Fund</option>
                        <option>Education Savings</option>
                      </select>
                      <Button className="w-full bg-success hover:bg-success/90">
                        🚀 Launch Smart Stokvel
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="integration" className="space-y-4">
            {/* Banking API Integration Status */}
            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Building className="h-5 w-5 mr-2 text-primary" />
                  Banking API Integration Dashboard
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="border-success/20">
                      <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold text-success">✓</div>
                        <div className="text-sm font-medium">Capitec API</div>
                        <div className="text-xs text-muted-foreground">Full Integration</div>
                      </CardContent>
                    </Card>
                    <Card className="border-success/20">
                      <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold text-success">✓</div>
                        <div className="text-sm font-medium">FNB eWallet</div>
                        <div className="text-xs text-muted-foreground">Full Integration</div>
                      </CardContent>
                    </Card>
                    <Card className="border-warning/20">
                      <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold text-warning">⚠</div>
                        <div className="text-sm font-medium">Standard Bank</div>
                        <div className="text-xs text-muted-foreground">Partial Integration</div>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="p-4 bg-gradient-to-r from-success/10 to-primary/10 rounded-lg">
                    <h4 className="font-bold mb-2">🎯 Next Integration Targets</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm font-medium">Nedbank Money</div>
                        <div className="text-xs text-muted-foreground">Q1 2025 - API access approved</div>
                      </div>
                      <div>
                        <div className="text-sm font-medium">ABSA CashSend</div>
                        <div className="text-xs text-muted-foreground">Q2 2025 - In negotiations</div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};