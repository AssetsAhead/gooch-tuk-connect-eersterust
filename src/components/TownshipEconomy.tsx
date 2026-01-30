import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Store, 
  Briefcase, 
  Users, 
  TrendingUp,
  Package,
  Search,
  MapPin,
  Star,
  Clock,
  Truck,
  Building,
  ShoppingCart
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export const TownshipEconomy = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const { toast } = useToast();

  const spazaShops = [
    {
      name: "Mama Sarah's General Store",
      owner: "Sarah Mthembu",
      location: "Block A, Street 15",
      category: "General Goods",
      rating: 4.8,
      speciality: "Fresh bread daily, pensioner discounts",
      hours: "06:00 - 20:00",
      contact: "084 123 4567",
      services: ["Airtime", "Electricity", "Water", "Groceries"]
    },
    {
      name: "Thabo's Fresh Produce",
      owner: "Thabo Molekane",
      location: "Corner Main & Church",
      category: "Fresh Produce",
      rating: 4.9,
      speciality: "Farm-fresh vegetables, fruit baskets",
      hours: "05:30 - 19:00",
      contact: "073 987 6543",
      services: ["Fresh Vegetables", "Fruits", "Herbs", "Delivery"]
    },
    {
      name: "Lucky's Hardware",
      owner: "Lucky Ndlovu",
      location: "Block C, Street 8",
      category: "Hardware",
      rating: 4.6,
      speciality: "Tools, building materials, repairs",
      hours: "07:00 - 18:00",
      contact: "082 456 7890",
      services: ["Tools", "Plumbing", "Electrical", "Paint"]
    }
  ];

  const jobBoard = [
    {
      title: "Tuk Tuk Driver",
      employer: "Eersterust Taxi Association",
      type: "Full-time",
      salary: "R4,500 - R6,000/month",
      requirements: "Valid PDP, Local knowledge, Clean record",
      posted: "2 days ago",
      applications: 12
    },
    {
      title: "Shop Assistant",
      employer: "Community Spaza Network",
      type: "Part-time",
      salary: "R2,800 - R3,500/month",
      requirements: "Grade 10, Basic Maths, Customer service",
      posted: "1 week ago",
      applications: 8
    },
    {
      title: "Security Guard",
      employer: "Neighbourhood Watch Security",
      type: "Shifts",
      salary: "R5,200 - R6,800/month",
      requirements: "Security training, PSIRA registered",
      posted: "3 days ago",
      applications: 15
    },
    {
      title: "Domestic Worker",
      employer: "Silverton Families",
      type: "Part-time",
      salary: "R2,000 - R3,000/month",
      requirements: "Experience, References, Own transport",
      posted: "5 days ago",
      applications: 6
    }
  ];

  const suppliers = [
    {
      name: "Tshwane Fresh Wholesale",
      category: "Fresh Produce",
      location: "Pretoria West",
      rating: 4.7,
      speciality: "Bulk vegetables, competitive prices",
      delivery: "Free delivery over R500",
      contact: "012 345 6789"
    },
    {
      name: "African Pride Distributors",
      category: "Household Goods",
      location: "Silverton Industrial",
      rating: 4.5,
      speciality: "Cleaning products, toiletries",
      delivery: "Same day delivery available",
      contact: "012 987 6543"
    },
    {
      name: "Mamelodi Meat Suppliers",
      category: "Meat & Poultry",
      location: "Mamelodi",
      rating: 4.8,
      speciality: "Halal certified, bulk orders",
      delivery: "Refrigerated transport",
      contact: "012 456 7890"
    }
  ];

  const handleSpazaRegistration = () => {
    toast({
      title: "Spaza Shop Registration",
      description: "Your shop will be added to the community directory within 24 hours",
    });
  };

  const handleJobApplication = (jobTitle: string) => {
    toast({
      title: "Application Submitted",
      description: `Your application for ${jobTitle} has been sent to the employer`,
    });
  };

  const filteredSpazas = spazaShops.filter(shop => 
    (selectedCategory === "all" || shop.category.toLowerCase().includes(selectedCategory)) &&
    (searchTerm === "" || shop.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
     shop.speciality.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <Card className="border-success/20">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Store className="h-6 w-6 mr-2 text-success" />
          Township Economy Hub
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="spaza" className="w-full">
          <TabsList className="w-full overflow-x-auto flex justify-start md:grid md:grid-cols-4">
            <TabsTrigger value="spaza" className="whitespace-nowrap flex-shrink-0">
              <span className="mr-1">🏪</span>
              <span className="hidden sm:inline">Spaza Shops</span>
              <span className="sm:hidden">Shops</span>
            </TabsTrigger>
            <TabsTrigger value="jobs" className="whitespace-nowrap flex-shrink-0">
              <span className="mr-1">💼</span>
              <span className="hidden sm:inline">Job Board</span>
              <span className="sm:hidden">Jobs</span>
            </TabsTrigger>
            <TabsTrigger value="suppliers" className="whitespace-nowrap flex-shrink-0">
              <span className="mr-1">📦</span>
              <span>Suppliers</span>
            </TabsTrigger>
            <TabsTrigger value="register" className="whitespace-nowrap flex-shrink-0">
              <span className="mr-1">📝</span>
              <span className="hidden sm:inline">Register Business</span>
              <span className="sm:hidden">Register</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="spaza" className="space-y-4">
            {/* Search and Filter */}
            <Card className="border-primary/20">
              <CardContent className="p-4">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <Input
                      placeholder="Search shops, products, or services..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full"
                    />
                  </div>
                  <select 
                    className="p-2 border rounded-md"
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                  >
                    <option value="all">All Categories</option>
                    <option value="general">General Goods</option>
                    <option value="fresh">Fresh Produce</option>
                    <option value="hardware">Hardware</option>
                    <option value="clothing">Clothing</option>
                  </select>
                </div>
              </CardContent>
            </Card>

            {/* Spaza Shop Directory */}
            <div className="grid gap-4">
              {filteredSpazas.map((shop, index) => (
                <Card key={index} className="border-tuk-blue/20 hover:border-tuk-blue/40 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-start space-x-3">
                        <Store className="h-6 w-6 text-tuk-blue mt-1" />
                        <div>
                          <h4 className="font-bold text-lg">{shop.name}</h4>
                          <p className="text-sm text-muted-foreground">Owned by {shop.owner}</p>
                          <div className="flex items-center text-sm text-muted-foreground">
                            <MapPin className="h-3 w-3 mr-1" />
                            <span>{shop.location}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center">
                          <Star className="h-4 w-4 text-warning mr-1" />
                          <span className="font-bold">{shop.rating}</span>
                        </div>
                        <Badge variant="outline" className="mt-1">{shop.category}</Badge>
                      </div>
                    </div>

                    <div className="mb-3">
                      <p className="text-sm font-medium text-primary mb-2">{shop.speciality}</p>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Clock className="h-3 w-3 mr-1" />
                        <span>{shop.hours}</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-3">
                      {shop.services.map((service, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {service}
                        </Badge>
                      ))}
                    </div>

                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="flex-1">
                        📞 {shop.contact}
                      </Button>
                      <Button size="sm" className="bg-tuk-blue hover:bg-tuk-blue/90">
                        🗺️ Directions
                      </Button>
                      <Button size="sm" className="bg-success hover:bg-success/90">
                        🛒 Order
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Inventory Management Feature */}
            <Card className="border-warning/20">
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Package className="h-5 w-5 mr-2 text-warning" />
                  Smart Inventory System
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-bold mb-2">For Shop Owners</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      Track inventory, manage orders, and connect with suppliers
                    </p>
                    <Button variant="outline" className="w-full">
                      📊 Manage My Inventory
                    </Button>
                  </div>
                  <div>
                    <h4 className="font-bold mb-2">For Customers</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      Check product availability before visiting shops
                    </p>
                    <Button className="w-full bg-warning hover:bg-warning/90 text-black">
                      🔍 Check Stock Levels
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="jobs" className="space-y-4">
            <div className="grid gap-4">
              {jobBoard.map((job, index) => (
                <Card key={index} className="border-tuk-orange/20 hover:border-tuk-orange/40 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-start space-x-3">
                        <Briefcase className="h-6 w-6 text-tuk-orange mt-1" />
                        <div>
                          <h4 className="font-bold text-lg">{job.title}</h4>
                          <p className="text-sm text-muted-foreground">{job.employer}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge className="bg-tuk-orange text-white">{job.type}</Badge>
                        <div className="text-sm text-muted-foreground mt-1">{job.posted}</div>
                      </div>
                    </div>

                    <div className="mb-3">
                      <div className="text-lg font-bold text-success mb-1">{job.salary}</div>
                      <p className="text-sm text-muted-foreground">{job.requirements}</p>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Users className="h-4 w-4 mr-1" />
                        <span>{job.applications} applications</span>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                        >
                          📄 View Details
                        </Button>
                        <Button 
                          size="sm" 
                          className="bg-tuk-orange hover:bg-tuk-orange/90"
                          onClick={() => handleJobApplication(job.title)}
                        >
                          📝 Apply Now
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Skills Matching */}
            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2 text-primary" />
                  Skills Development & Matching
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-bold mb-2">Popular Skills Needed</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center p-2 border rounded">
                        <span className="text-sm">Customer Service</span>
                        <Badge className="bg-danger text-white">High Demand</Badge>
                      </div>
                      <div className="flex justify-between items-center p-2 border rounded">
                        <span className="text-sm">Basic Computer Skills</span>
                        <Badge className="bg-warning text-black">Medium Demand</Badge>
                      </div>
                      <div className="flex justify-between items-center p-2 border rounded">
                        <span className="text-sm">Driving (PDP)</span>
                        <Badge className="bg-danger text-white">High Demand</Badge>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-bold mb-2">Free Training Available</h4>
                    <div className="space-y-2">
                      <Button variant="outline" className="w-full justify-start">
                        📚 Customer Service Course
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        💻 Basic Computer Training
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        🚗 PDP License Assistance
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="suppliers" className="space-y-4">
            <div className="grid gap-4">
              {suppliers.map((supplier, index) => (
                <Card key={index} className="border-secondary/20 hover:border-secondary/40 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-start space-x-3">
                        <Truck className="h-6 w-6 text-secondary mt-1" />
                        <div>
                          <h4 className="font-bold text-lg">{supplier.name}</h4>
                          <p className="text-sm text-muted-foreground">{supplier.category}</p>
                          <div className="flex items-center text-sm text-muted-foreground">
                            <MapPin className="h-3 w-3 mr-1" />
                            <span>{supplier.location}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center">
                          <Star className="h-4 w-4 text-warning mr-1" />
                          <span className="font-bold">{supplier.rating}</span>
                        </div>
                      </div>
                    </div>

                    <div className="mb-3">
                      <p className="text-sm font-medium text-primary mb-1">{supplier.speciality}</p>
                      <p className="text-sm text-success">{supplier.delivery}</p>
                    </div>

                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="flex-1">
                        📞 {supplier.contact}
                      </Button>
                      <Button size="sm" className="bg-secondary hover:bg-secondary/90">
                        💰 Get Quote
                      </Button>
                      <Button size="sm" className="bg-success hover:bg-success/90">
                        📦 Order Now
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Bulk Buying Groups */}
            <Card className="border-tuk-blue/20">
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Users className="h-5 w-5 mr-2 text-tuk-blue" />
                  Community Bulk Buying Groups
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-bold mb-2">Join Buying Group</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      Pool orders with other shop owners for better wholesale prices
                    </p>
                    <Button variant="outline" className="w-full">
                      🤝 Join Active Groups
                    </Button>
                  </div>
                  <div>
                    <h4 className="font-bold mb-2">Create New Group</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      Start a new buying group for specific products
                    </p>
                    <Button className="w-full bg-tuk-blue hover:bg-tuk-blue/90">
                      ➕ Create Group
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="register" className="space-y-4">
            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Building className="h-6 w-6 mr-2 text-primary" />
                  Register Your Business in the Township Economy
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Business Name</label>
                    <Input placeholder="e.g., Sarah's Corner Shop" />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Business Type</label>
                    <select className="w-full p-2 border rounded-md">
                      <option>Spaza Shop</option>
                      <option>Hair Salon</option>
                      <option>Mechanic</option>
                      <option>Catering</option>
                      <option>Transport</option>
                      <option>Other Service</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Location</label>
                    <Input placeholder="Block, Street, House Number" />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Contact Number</label>
                    <Input placeholder="084 123 4567" />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Products/Services</label>
                  <Textarea 
                    placeholder="List the main products or services you offer..."
                    className="h-20"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Operating Hours</label>
                  <div className="grid grid-cols-2 gap-4">
                    <Input placeholder="Opening time (e.g., 06:00)" />
                    <Input placeholder="Closing time (e.g., 20:00)" />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Special Features</label>
                  <div className="grid grid-cols-2 gap-2">
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" className="rounded" />
                      <span className="text-sm">Pensioner Discounts</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" className="rounded" />
                      <span className="text-sm">Home Delivery</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" className="rounded" />
                      <span className="text-sm">Airtime/Electricity</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" className="rounded" />
                      <span className="text-sm">Credit Available</span>
                    </label>
                  </div>
                </div>

                <Button 
                  onClick={handleSpazaRegistration}
                  className="w-full bg-success hover:bg-success/90 text-white"
                >
                  <Store className="h-4 w-4 mr-2" />
                  Register My Business
                </Button>
              </CardContent>
            </Card>

            {/* Benefits of Registration */}
            <Card className="border-success/20">
              <CardHeader>
                <CardTitle className="text-lg">🌟 Benefits of Registration</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center text-sm">
                      <ShoppingCart className="h-4 w-4 mr-2 text-success" />
                      <span>Online ordering system</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <TrendingUp className="h-4 w-4 mr-2 text-success" />
                      <span>Business analytics & insights</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <Users className="h-4 w-4 mr-2 text-success" />
                      <span>Access to supplier networks</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center text-sm">
                      <Package className="h-4 w-4 mr-2 text-success" />
                      <span>Inventory management tools</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <Star className="h-4 w-4 mr-2 text-success" />
                      <span>Customer review system</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <Briefcase className="h-4 w-4 mr-2 text-success" />
                      <span>Business development support</span>
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