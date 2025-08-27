import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Shield, MapPin, Phone, CreditCard, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const PrivacyPolicy = () => {
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
          <h1 className="text-4xl font-bold mb-2">Privacy Policy</h1>
          <p className="text-muted-foreground">
            Last updated: {new Date().toLocaleDateString('en-ZA')}
          </p>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Our Commitment to Your Privacy
              </CardTitle>
              <CardDescription>
                PoortLink respects your privacy and is committed to protecting your personal information in accordance with the Protection of Personal Information Act (POPIA) of South Africa.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                This privacy policy explains how we collect, use, store, and protect your personal information when you use our transport platform.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Information We Collect
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Account Information
                </h4>
                <ul className="text-sm text-muted-foreground space-y-1 ml-6">
                  <li>• Phone number for authentication</li>
                  <li>• Email address (optional)</li>
                  <li>• Profile information and preferences</li>
                  <li>• User role (passenger, driver, owner, etc.)</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Location Data
                </h4>
                <ul className="text-sm text-muted-foreground space-y-1 ml-6">
                  <li>• GPS coordinates for route optimization</li>
                  <li>• Pickup and drop-off locations</li>
                  <li>• Real-time location during trips (drivers only)</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  Payment Information
                </h4>
                <ul className="text-sm text-muted-foreground space-y-1 ml-6">
                  <li>• Payment method details (processed securely by third-party providers)</li>
                  <li>• Transaction history</li>
                  <li>• SASSA verification status (if applicable)</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>How We Use Your Information</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li>• <strong>Service Provision:</strong> To connect passengers with drivers and facilitate transportation</li>
                <li>• <strong>Safety & Security:</strong> To ensure user safety through verification and monitoring</li>
                <li>• <strong>Payment Processing:</strong> To handle payments and financial transactions securely</li>
                <li>• <strong>Communication:</strong> To send important updates about rides and services</li>
                <li>• <strong>Legal Compliance:</strong> To comply with South African transport and financial regulations</li>
                <li>• <strong>Service Improvement:</strong> To analyze usage patterns and improve our platform</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Data Sharing and Disclosure</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">We may share your information with:</p>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li>• <strong>Other Users:</strong> Limited information (name, rating) for ride coordination</li>
                  <li>• <strong>Government Authorities:</strong> When required by law or for regulatory compliance</li>
                  <li>• <strong>Payment Processors:</strong> For secure payment processing</li>
                  <li>• <strong>Emergency Services:</strong> In case of safety incidents or panic button activation</li>
                  <li>• <strong>Service Providers:</strong> Third-party services that help us operate our platform</li>
                </ul>
                <p className="text-sm text-muted-foreground font-semibold">
                  We do not sell your personal information to third parties.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Your Rights Under POPIA</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li>• <strong>Access:</strong> Request access to your personal information</li>
                <li>• <strong>Correction:</strong> Request correction of inaccurate information</li>
                <li>• <strong>Deletion:</strong> Request deletion of your personal information</li>
                <li>• <strong>Objection:</strong> Object to certain processing of your information</li>
                <li>• <strong>Portability:</strong> Request transfer of your data to another service</li>
                <li>• <strong>Withdraw Consent:</strong> Withdraw consent for data processing where applicable</li>
              </ul>
              <p className="text-sm text-muted-foreground mt-3">
                To exercise these rights, contact us at: privacy@poortlink.co.za
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Data Security and Retention</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.
                </p>
                <p className="text-sm text-muted-foreground">
                  We retain your personal information only for as long as necessary to provide our services and comply with legal obligations. Trip data is typically retained for 7 years for regulatory compliance.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground space-y-2">
                <p><strong>Information Officer:</strong> PoortLink Privacy Team</p>
                <p><strong>Email:</strong> privacy@poortlink.co.za</p>
                <p><strong>Address:</strong> [Your Business Address]</p>
                <p><strong>Information Regulator:</strong> You may also contact the Information Regulator of South Africa at inforeg@justice.gov.za</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Changes to This Policy</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                We may update this privacy policy from time to time. We will notify you of any material changes by posting the new policy on our platform and updating the "Last updated" date.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;