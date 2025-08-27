import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, FileText, Car, Users, CreditCard, Shield, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const TermsOfService = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <Link to="/">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
          </Link>
          <h1 className="text-4xl font-bold mb-2">Terms of Service</h1>
          <p className="text-muted-foreground">
            Last updated: {new Date().toLocaleDateString('en-ZA')}
          </p>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Agreement to Terms
              </CardTitle>
              <CardDescription>
                By accessing and using PoortLink, you agree to be bound by these Terms of Service and all applicable laws and regulations.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                If you do not agree with any of these terms, you are prohibited from using or accessing this platform.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Platform Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">
                PoortLink is a digital transport platform that connects passengers with drivers in South African townships. We facilitate:
              </p>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Ride booking and coordination</li>
                <li>• Payment processing and financial services</li>
                <li>• Safety and security features</li>
                <li>• Government service integration</li>
                <li>• Community and business networking</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                User Responsibilities
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">All Users Must:</h4>
                <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                  <li>• Provide accurate and truthful information</li>
                  <li>• Maintain the security of their account credentials</li>
                  <li>• Comply with all applicable South African laws</li>
                  <li>• Treat other users with respect and courtesy</li>
                  <li>• Report suspicious or inappropriate behavior</li>
                  <li>• Keep their profile information current and accurate</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Car className="h-4 w-4" />
                  Driver-Specific Responsibilities:
                </h4>
                <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                  <li>• Maintain valid driving license and vehicle registration</li>
                  <li>• Ensure vehicle is roadworthy and properly insured</li>
                  <li>• Follow all traffic laws and regulations</li>
                  <li>• Maintain professional conduct with passengers</li>
                  <li>• Complete trips safely and efficiently</li>
                  <li>• Keep vehicle clean and in good condition</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Passenger Responsibilities:</h4>
                <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                  <li>• Be ready at the agreed pickup location and time</li>
                  <li>• Treat drivers and vehicles with respect</li>
                  <li>• Pay for services as agreed</li>
                  <li>• Follow safety instructions from drivers</li>
                  <li>• Report issues promptly through the platform</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Payment Terms
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li>• All payments are processed securely through approved payment providers</li>
                  <li>• Prices are determined by drivers and market conditions</li>
                  <li>• SASSA beneficiaries may be eligible for discounted rates where applicable</li>
                  <li>• Platform fees may apply to certain transactions</li>
                  <li>• Refunds are handled on a case-by-case basis in accordance with our refund policy</li>
                  <li>• Users are responsible for any applicable taxes on their transactions</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Safety and Security
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground font-semibold">Emergency Features:</p>
                <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                  <li>• Panic button functionality connects to emergency services</li>
                  <li>• Real-time location sharing for safety monitoring</li>
                  <li>• Trip tracking and recording for security purposes</li>
                </ul>
                
                <p className="text-sm text-muted-foreground font-semibold mt-4">User Verification:</p>
                <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                  <li>• Phone number verification is required for all users</li>
                  <li>• Additional verification may be required for drivers</li>
                  <li>• False information may result in account suspension</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Prohibited Uses</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">Users may not use the platform for:</p>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Illegal activities or transport of illegal goods</li>
                <li>• Harassment, discrimination, or abusive behavior</li>
                <li>• Fraudulent activities or misrepresentation</li>
                <li>• Circumventing platform fees or payment systems</li>
                <li>• Creating multiple accounts or fake profiles</li>
                <li>• Interfering with platform operations or security</li>
                <li>• Violating intellectual property rights</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Limitation of Liability
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  PoortLink is a technology platform that connects users. We are not a transport operator and do not own, operate, or control vehicles.
                </p>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li>• We do not guarantee the availability, quality, or safety of transport services</li>
                  <li>• Users assume responsibility for their interactions with other users</li>
                  <li>• We are not liable for actions or omissions of drivers, passengers, or vehicle owners</li>
                  <li>• Our liability is limited to the maximum extent permitted by South African law</li>
                  <li>• Users should maintain appropriate insurance coverage</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Account Suspension and Termination</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  We reserve the right to suspend or terminate accounts for:
                </p>
                <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                  <li>• Violation of these terms of service</li>
                  <li>• Illegal or inappropriate behavior</li>
                  <li>• Safety concerns or risk to other users</li>
                  <li>• Non-payment or fraudulent activity</li>
                  <li>• Extended inactivity</li>
                </ul>
                <p className="text-sm text-muted-foreground mt-3">
                  Users may also delete their accounts at any time through the platform settings.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Intellectual Property</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                The PoortLink platform, including its software, design, content, and trademarks, are owned by PoortLink and protected by intellectual property laws. Users may not copy, modify, or distribute our intellectual property without permission.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Governing Law and Disputes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  These terms are governed by the laws of South Africa. Any disputes will be resolved through:
                </p>
                <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                  <li>• Good faith negotiation between parties</li>
                  <li>• Mediation if negotiation fails</li>
                  <li>• South African courts as a last resort</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Changes to Terms</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                We may modify these terms at any time. Significant changes will be communicated to users through the platform. Continued use of the platform after changes constitutes acceptance of the new terms.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground space-y-2">
                <p><strong>Legal Department:</strong> PoortLink Legal Team</p>
                <p><strong>Email:</strong> legal@poortlink.co.za</p>
                <p><strong>Address:</strong> [Your Business Address]</p>
                <p><strong>Phone:</strong> [Your Contact Number]</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;