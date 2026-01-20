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
  Star
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export const FinancialInclusion = () => {
  const [ussdCode, setUssdCode] = useState("");
  const [stokvels, setStokvels] = useState([
    { 
      name: "Eersterust Women's Club", 
      members: 24, 
      contribution: 500, 
      nextPayout: "Dec 2024",
      trust_score: 4.9,
      category: "Grocery"
    },
    { 
      name: "Taxi Drivers Savings", 
      members: 18, 
      contribution: 800, 
      nextPayout: "Jan 2025",
      trust_score: 4.7,
      category: "Vehicle Maintenance"
    },
    { 
      name: "Block A Community Fund", 
      members: 31, 
      contribution: 300, 
      nextPayout: "Feb 2025",
      trust_score: 4.8,
      category: "Emergency Fund"
    }
  ]);
  
  const { toast } = useToast();

  const bankingPartners = [
    { 
      name: "Capitec Bank", 
      service: "USSD Banking", 
      code: "*120*3279#", 
      features: ["Balance Check", "Send Money", "Buy Airtime"],
      rating: 4.8
    },
    { 
      name: "FNB", 
      service: "eWallet", 
      code: "*120*321#", 
      features: ["Cash Withdrawal", "Bill Payments", "Transfers"],
      rating: 4.6
    },
    { 
      name: "Standard Bank", 
      service: "Mobile Money", 
      code: "*120*2345#", 
      features: ["Instant EFT", "Prepaid Services", "Loans"],
      rating: 4.5
    }
  ];

  const lendingOptions = [
    {
      provider: "Community Guarantee Fund",
      amount: "R500 - R5,000",
      term: "1-6 months",
      rate: "12% p.a.",
      requirement: "3 community guarantors",
      approval: "24 hours"
    },
    {
      provider: "Taxi Association Credit",
      amount: "R2,000 - R25,000",
      term: "6-24 months", 
      rate: "15% p.a.",
      requirement: "Association membership",
      approval: "48 hours"
    },
    {
      provider: "Stokvel Advance",
      amount: "R1,000 - R10,000",
      term: "3-12 months",
      rate: "8% p.a.",
      requirement: "Stokvel membership 6mo+",
      approval: "Same day"
    }
  ];

  const handleUSSDTest = (code: string) => {
    toast({
      title: "USSD Code Copied",
      description: `Dial ${code} on your phone to access banking services`,
    });
    navigator.clipboard.writeText(code);
  };

  const handleJoinStokvel = (stokvelman: string) => {
    toast({
      title: "Interest Registered",
      description: `Your interest in joining ${stokvelman} has been noted. A member will contact you.`,
    });
  };

  return (
    <Card className="border-success/20">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Banknote className="h-6 w-6 mr-2 text-success" />
          Financial Inclusion Hub
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="banking" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="banking">📱 USSD Banking</TabsTrigger>
            <TabsTrigger value="stokvels">🤝 Stokvels</TabsTrigger>
            <TabsTrigger value="lending">💰 Micro-Lending</TabsTrigger>
            <TabsTrigger value="airtime">📞 Airtime/Data</TabsTrigger>
          </TabsList>

          <TabsContent value="banking" className="space-y-4">
            {/* Feature Phone Banking */}
            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Phone className="h-5 w-5 mr-2 text-primary" />
                  Feature Phone Banking (No Smartphone Needed)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {bankingPartners.map((bank, index) => (
                    <Card key={index} className="border-tuk-blue/20">
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
                        
                        <Button 
                          onClick={() => handleUSSDTest(bank.code)}
                          variant="outline" 
                          className="w-full"
                        >
                          📋 Copy Code & Test
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick USSD Reference */}
            <Card className="border-warning/20">
              <CardHeader>
                <CardTitle className="text-lg">⚡ Quick USSD Commands</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-bold mb-2">Emergency Services</h4>
                    <div className="space-y-1 text-sm">
                      <div>🚨 Emergency: 10111</div>
                      <div>🚑 Ambulance: 10177</div>
                      <div>🔥 Fire: 10177</div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-bold mb-2">Network Services</h4>
                    <div className="space-y-1 text-sm">
                      <div>📞 Check Balance: *136#</div>
                      <div>📱 Buy Airtime: *136*1#</div>
                      <div>🌐 Buy Data: *136*2#</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="stokvels" className="space-y-4">
            <div className="grid gap-4">
              {stokvels.map((stokvel, index) => (
                <Card key={index} className="border-success/20 hover:border-success/40 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <PiggyBank className="h-6 w-6 text-success" />
                        <div>
                          <h4 className="font-bold">{stokvel.name}</h4>
                          <p className="text-sm text-muted-foreground">{stokvel.category}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center text-sm">
                          <Star className="h-4 w-4 text-warning mr-1" />
                          <span>{stokvel.trust_score}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 mb-3">
                      <div className="text-center">
                        <div className="text-lg font-bold text-primary">{stokvel.members}</div>
                        <div className="text-xs text-muted-foreground">Members</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-success">R{stokvel.contribution}</div>
                        <div className="text-xs text-muted-foreground">Monthly</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-tuk-blue">{stokvel.nextPayout}</div>
                        <div className="text-xs text-muted-foreground">Next Payout</div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button 
                        onClick={() => handleJoinStokvel(stokvel.name)}
                        className="flex-1 bg-success hover:bg-success/90"
                      >
                        🤝 Express Interest
                      </Button>
                      <Button variant="outline">
                        ℹ️ Learn More
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Create New Stokvel */}
            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Users className="h-5 w-5 mr-2 text-primary" />
                  Start Your Own Stokvel
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-3">
                      Create a savings group with friends, family, or community members
                    </p>
                    <div className="space-y-2 text-sm">
                      <div>✅ Digital record keeping</div>
                      <div>✅ Automated payments</div>
                      <div>✅ Transparent tracking</div>
                      <div>✅ Legal protection</div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <Input placeholder="Stokvel Name" />
                    <Input placeholder="Monthly Contribution (R)" type="number" />
                    <select className="w-full p-2 border rounded-md">
                      <option>Select Purpose</option>
                      <option>Groceries</option>
                      <option>School Fees</option>
                      <option>Emergency Fund</option>
                      <option>Holiday/Christmas</option>
                      <option>Business Investment</option>
                    </select>
                    <Button className="w-full bg-primary hover:bg-primary/90">
                      🎯 Create Stokvel
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="lending" className="space-y-4">
            <div className="grid gap-4">
              {lendingOptions.map((option, index) => (
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
                      <Badge className="bg-success text-white">{option.approval}</Badge>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 mb-3">
                      <div>
                        <div className="text-sm text-muted-foreground">Amount</div>
                        <div className="font-bold text-primary">{option.amount}</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Term</div>
                        <div className="font-bold">{option.term}</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Rate</div>
                        <div className="font-bold text-tuk-orange">{option.rate}</div>
                      </div>
                    </div>
                    
                    <Button className="w-full bg-tuk-orange hover:bg-tuk-orange/90">
                      📝 Apply Now
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Community Guarantor System */}
            <Card className="border-tuk-blue/20">
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Shield className="h-5 w-5 mr-2 text-tuk-blue" />
                  Community Guarantor Network
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-bold mb-2">Be a Guarantor</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      Help community members access credit by being their guarantor
                    </p>
                    <Button variant="outline" className="w-full">
                      🤝 Become Guarantor
                    </Button>
                  </div>
                  <div>
                    <h4 className="font-bold mb-2">Find Guarantors</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      Connect with trusted community members who can guarantee your loan
                    </p>
                    <Button className="w-full bg-info hover:bg-info/90">
                      🔍 Find Guarantors
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="airtime" className="space-y-4">
            {/* Airtime/Data Marketplace */}
            <Card className="border-warning/20">
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Smartphone className="h-5 w-5 mr-2 text-warning" />
                  Community Airtime Marketplace
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-bold mb-3">Buy Airtime/Data</h4>
                    <div className="space-y-3">
                      <Input placeholder="Cell Number" />
                      <select className="w-full p-2 border rounded-md">
                        <option>Select Network</option>
                        <option>Vodacom</option>
                        <option>MTN</option>
                        <option>Cell C</option>
                        <option>Telkom</option>
                      </select>
                      <select className="w-full p-2 border rounded-md">
                        <option>Select Amount</option>
                        <option>R5 Airtime</option>
                        <option>R10 Airtime</option>
                        <option>R20 Airtime</option>
                        <option>1GB Data - R29</option>
                        <option>2GB Data - R49</option>
                        <option>5GB Data - R99</option>
                      </select>
                      <Button className="w-full bg-warning hover:bg-warning/90 text-black">
                        💳 Buy Now
                      </Button>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-bold mb-3">Community Dealers</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-2 border rounded">
                        <div>
                          <div className="font-medium">Mama Sarah's Shop</div>
                          <div className="text-sm text-muted-foreground">5% discount on bulk</div>
                        </div>
                        <Badge className="bg-success text-white">★ 4.9</Badge>
                      </div>
                      <div className="flex items-center justify-between p-2 border rounded">
                        <div>
                          <div className="font-medium">Thabo's Internet Cafe</div>
                          <div className="text-sm text-muted-foreground">Data bundles specialist</div>
                        </div>
                        <Badge className="bg-success text-white">★ 4.7</Badge>
                      </div>
                      <div className="flex items-center justify-between p-2 border rounded">
                        <div>
                          <div className="font-medium">Corner Spaza Shop</div>
                          <div className="text-sm text-muted-foreground">24/7 service</div>
                        </div>
                        <Badge className="bg-success text-white">★ 4.8</Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Data Sharing */}
            <Card className="border-tuk-blue/20">
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2 text-tuk-blue" />
                  Community Data Sharing
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-bold mb-2">Share Your Data</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      Have extra data? Share with community members and earn money
                    </p>
                    <Button variant="outline" className="w-full">
                      📱 List My Data
                    </Button>
                  </div>
                  <div>
                    <h4 className="font-bold mb-2">Buy Shared Data</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      Get data at discounted rates from community members
                    </p>
                    <Button className="w-full bg-tuk-blue hover:bg-tuk-blue/90">
                      🛒 Browse Data Deals
                    </Button>
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