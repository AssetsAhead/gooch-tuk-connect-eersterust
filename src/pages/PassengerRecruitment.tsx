import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface PassengerProfile {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  homeArea: string;
  workArea: string;
  commuteTimes: string;
  transportNeeds: string[];
  currentTransport: string;
  weeklyTrips: string;
  monthlyBudget: string;
  painPoints: string;
  expectations: string;
  hasSmartphone: boolean;
  internetAccess: boolean;
  paymentPreference: string;
  emergencyContact: string;
  availability: string;
  commitment: boolean;
}

const PassengerRecruitment = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [profile, setProfile] = useState<PassengerProfile>({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    homeArea: "",
    workArea: "",
    commuteTimes: "",
    transportNeeds: [],
    currentTransport: "",
    weeklyTrips: "",
    monthlyBudget: "",
    painPoints: "",
    expectations: "",
    hasSmartphone: false,
    internetAccess: false,
    paymentPreference: "",
    emergencyContact: "",
    availability: "",
    commitment: false
  });

  const transportNeeds = [
    "Daily work commute",
    "Shopping trips",
    "Medical appointments",
    "School runs",
    "Social visits",
    "Emergency transport",
    "Weekend outings",
    "Church/religious services"
  ];

  const handleTransportNeedChange = (need: string, checked: boolean) => {
    setProfile(prev => ({
      ...prev,
      transportNeeds: checked 
        ? [...prev.transportNeeds, need]
        : prev.transportNeeds.filter(n => n !== need)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Store recruitment data
      const { error } = await supabase
        .from('user_registrations')
        .insert({
          first_name: profile.firstName,
          last_name: profile.lastName,
          registration_status: 'pilot_passenger',
          user_id: null // Will be filled when they actually register
        });

      if (error) throw error;

      // Store detailed passenger profile in localStorage for now
      localStorage.setItem(`passenger_profile_${profile.phone}`, JSON.stringify(profile));

      toast({
        title: "Application Submitted!",
        description: "Thank you for your interest. We'll contact you within 24 hours to discuss the next steps.",
      });

      // Reset form
      setProfile({
        firstName: "",
        lastName: "",
        phone: "",
        email: "",
        homeArea: "",
        workArea: "",
        commuteTimes: "",
        transportNeeds: [],
        currentTransport: "",
        weeklyTrips: "",
        monthlyBudget: "",
        painPoints: "",
        expectations: "",
        hasSmartphone: false,
        internetAccess: false,
        paymentPreference: "",
        emergencyContact: "",
        availability: "",
        commitment: false
      });

    } catch (error) {
      console.error('Error submitting application:', error);
      toast({
        title: "Submission Failed",
        description: "There was an error submitting your application. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <img src="/logo.png" alt="PoortLink Logo" className="w-12 h-12 mr-3" />
            <h1 className="text-3xl font-bold">
              <span className="text-sa-green">Poort</span>
              <span className="text-sa-gold">Link</span> Pilot Program
            </h1>
          </div>
          <p className="text-xl text-muted-foreground mb-2">
            Join Our Exclusive Passenger Pilot Program
          </p>
          <p className="text-sm text-muted-foreground">
            Help us perfect the ride-sharing service for Eersterust & surrounding areas
          </p>
        </div>

        {/* Benefits Card */}
        <Card className="mb-8 bg-sa-green/5 border-sa-green/20">
          <CardHeader>
            <CardTitle className="text-sa-green">Pilot Program Benefits</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center">
                  <span className="text-sa-green mr-2">✓</span>
                  <span>50% discount on all rides during pilot</span>
                </div>
                <div className="flex items-center">
                  <span className="text-sa-green mr-2">✓</span>
                  <span>Free rides for first 5 trips</span>
                </div>
                <div className="flex items-center">
                  <span className="text-sa-green mr-2">✓</span>
                  <span>Priority booking access</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center">
                  <span className="text-sa-green mr-2">✓</span>
                  <span>Direct influence on app features</span>
                </div>
                <div className="flex items-center">
                  <span className="text-sa-green mr-2">✓</span>
                  <span>Exclusive feedback rewards</span>
                </div>
                <div className="flex items-center">
                  <span className="text-sa-green mr-2">✓</span>
                  <span>Lifetime founder member status</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Application Form */}
        <Card>
          <CardHeader>
            <CardTitle>Passenger Application Form</CardTitle>
            <CardDescription>
              Tell us about your transport needs and help us build the perfect service for our community
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Personal Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Personal Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input
                      id="firstName"
                      value={profile.firstName}
                      onChange={(e) => setProfile(prev => ({ ...prev, firstName: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input
                      id="lastName"
                      value={profile.lastName}
                      onChange={(e) => setProfile(prev => ({ ...prev, lastName: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={profile.phone}
                      onChange={(e) => setProfile(prev => ({ ...prev, phone: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profile.email}
                      onChange={(e) => setProfile(prev => ({ ...prev, email: e.target.value }))}
                    />
                  </div>
                </div>
              </div>

              {/* Location Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Location & Travel</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="homeArea">Home Area/Township *</Label>
                    <Input
                      id="homeArea"
                      value={profile.homeArea}
                      onChange={(e) => setProfile(prev => ({ ...prev, homeArea: e.target.value }))}
                      placeholder="e.g., Eersterust, Mamelodi, Silverton"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="workArea">Work/Study Area</Label>
                    <Input
                      id="workArea"
                      value={profile.workArea}
                      onChange={(e) => setProfile(prev => ({ ...prev, workArea: e.target.value }))}
                      placeholder="e.g., Pretoria CBD, Hatfield"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="commuteTimes">Typical Travel Times</Label>
                  <Input
                    id="commuteTimes"
                    value={profile.commuteTimes}
                    onChange={(e) => setProfile(prev => ({ ...prev, commuteTimes: e.target.value }))}
                    placeholder="e.g., 7am-9am, 5pm-7pm"
                  />
                </div>
              </div>

              {/* Transport Needs */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Transport Needs</h3>
                <div className="space-y-2">
                  <Label>What do you need transport for? (Select all that apply)</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {transportNeeds.map(need => (
                      <div key={need} className="flex items-center space-x-2">
                        <Checkbox
                          id={need}
                          checked={profile.transportNeeds.includes(need)}
                          onCheckedChange={(checked) => handleTransportNeedChange(need, checked as boolean)}
                        />
                        <Label htmlFor={need} className="text-sm">{need}</Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="currentTransport">Current Transport Method *</Label>
                    <Input
                      id="currentTransport"
                      value={profile.currentTransport}
                      onChange={(e) => setProfile(prev => ({ ...prev, currentTransport: e.target.value }))}
                      placeholder="e.g., taxi, bus, walking, private car"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="weeklyTrips">Trips Per Week *</Label>
                    <RadioGroup
                      value={profile.weeklyTrips}
                      onValueChange={(value) => setProfile(prev => ({ ...prev, weeklyTrips: value }))}
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="1-5" id="trips1-5" />
                        <Label htmlFor="trips1-5">1-5 trips</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="6-10" id="trips6-10" />
                        <Label htmlFor="trips6-10">6-10 trips</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="10+" id="trips10plus" />
                        <Label htmlFor="trips10plus">10+ trips</Label>
                      </div>
                    </RadioGroup>
                  </div>
                </div>

                <div>
                  <Label htmlFor="monthlyBudget">Monthly Transport Budget *</Label>
                  <RadioGroup
                    value={profile.monthlyBudget}
                    onValueChange={(value) => setProfile(prev => ({ ...prev, monthlyBudget: value }))}
                  >
                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="R0-200" id="budget1" />
                        <Label htmlFor="budget1">R0-200</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="R200-500" id="budget2" />
                        <Label htmlFor="budget2">R200-500</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="R500-1000" id="budget3" />
                        <Label htmlFor="budget3">R500-1000</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="R1000+" id="budget4" />
                        <Label htmlFor="budget4">R1000+</Label>
                      </div>
                    </div>
                  </RadioGroup>
                </div>
              </div>

              {/* Feedback & Expectations */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Your Experience & Expectations</h3>
                <div>
                  <Label htmlFor="painPoints">What problems do you face with current transport? *</Label>
                  <Textarea
                    id="painPoints"
                    value={profile.painPoints}
                    onChange={(e) => setProfile(prev => ({ ...prev, painPoints: e.target.value }))}
                    placeholder="e.g., long waiting times, safety concerns, unreliable schedules, high costs"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="expectations">What would make the perfect ride-sharing service?</Label>
                  <Textarea
                    id="expectations"
                    value={profile.expectations}
                    onChange={(e) => setProfile(prev => ({ ...prev, expectations: e.target.value }))}
                    placeholder="e.g., quick booking, reliable timing, fair prices, safety features"
                  />
                </div>
              </div>

              {/* Technology & Payment */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Technology & Payment</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="hasSmartphone"
                      checked={profile.hasSmartphone}
                      onCheckedChange={(checked) => setProfile(prev => ({ ...prev, hasSmartphone: checked as boolean }))}
                    />
                    <Label htmlFor="hasSmartphone">I have a smartphone</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="internetAccess"
                      checked={profile.internetAccess}
                      onCheckedChange={(checked) => setProfile(prev => ({ ...prev, internetAccess: checked as boolean }))}
                    />
                    <Label htmlFor="internetAccess">I have regular internet access</Label>
                  </div>
                </div>

                <div>
                  <Label htmlFor="paymentPreference">Preferred Payment Method *</Label>
                  <RadioGroup
                    value={profile.paymentPreference}
                    onValueChange={(value) => setProfile(prev => ({ ...prev, paymentPreference: value }))}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="cash" id="payment-cash" />
                      <Label htmlFor="payment-cash">Cash</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="card" id="payment-card" />
                      <Label htmlFor="payment-card">Card/Digital Payment</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="both" id="payment-both" />
                      <Label htmlFor="payment-both">Both Cash and Digital</Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>

              {/* Availability & Commitment */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Pilot Program Participation</h3>
                <div>
                  <Label htmlFor="emergencyContact">Emergency Contact Number *</Label>
                  <Input
                    id="emergencyContact"
                    value={profile.emergencyContact}
                    onChange={(e) => setProfile(prev => ({ ...prev, emergencyContact: e.target.value }))}
                    placeholder="Friend/family member phone number"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="availability">When are you available for the pilot program?</Label>
                  <Textarea
                    id="availability"
                    value={profile.availability}
                    onChange={(e) => setProfile(prev => ({ ...prev, availability: e.target.value }))}
                    placeholder="e.g., weekdays 7am-9am and 5pm-7pm, weekends flexible"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="commitment"
                    checked={profile.commitment}
                    onCheckedChange={(checked) => setProfile(prev => ({ ...prev, commitment: checked as boolean }))}
                    required
                  />
                  <Label htmlFor="commitment">
                    I commit to using the service regularly during the pilot period and providing honest feedback *
                  </Label>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex flex-col gap-4">
                <Button
                  type="submit"
                  className="w-full bg-sa-green hover:bg-sa-green-light text-white font-bold py-3"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Submitting Application..." : "Submit Application for Pilot Program"}
                </Button>
                
                <div className="text-center">
                  <Link to="/">
                    <Button variant="outline" className="mr-4">
                      ← Back to Home
                    </Button>
                  </Link>
                  <Link to="/auth">
                    <Button variant="outline">
                      Already Registered? Login →
                    </Button>
                  </Link>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PassengerRecruitment;