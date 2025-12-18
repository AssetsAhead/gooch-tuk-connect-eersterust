import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Shield, 
  FileCheck, 
  AlertTriangle, 
  CheckCircle, 
  Loader2,
  Download
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import jsPDF from 'jspdf';
import { format } from 'date-fns';

interface CriminalDeclarationFormProps {
  userId: string;
  driverName: string;
  idNumber?: string;
  alreadySigned?: boolean;
  signedAt?: string;
  onDeclarationSigned?: () => void;
}

export const CriminalDeclarationForm = ({
  userId,
  driverName,
  idNumber,
  alreadySigned,
  signedAt,
  onDeclarationSigned
}: CriminalDeclarationFormProps) => {
  const [declarations, setDeclarations] = useState({
    noPendingCases: false,
    noConvictions: false,
    truthful: false,
    consent: false
  });
  const [signature, setSignature] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const allChecked = Object.values(declarations).every(Boolean) && signature.length > 2;

  const handleSubmit = async () => {
    if (!allChecked) {
      toast({
        title: 'Incomplete declaration',
        description: 'Please check all boxes and sign your name',
        variant: 'destructive'
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('user_registrations')
        .update({
          criminal_declaration_signed: true,
          criminal_declaration_signed_at: new Date().toISOString()
        })
        .eq('user_id', userId);

      if (error) throw error;

      toast({
        title: 'Declaration Signed',
        description: 'Your criminal record declaration has been recorded'
      });

      onDeclarationSigned?.();
    } catch (error: any) {
      toast({
        title: 'Failed to save declaration',
        description: error.message || 'Please try again',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    const date = format(new Date(), 'dd MMMM yyyy');

    doc.setFontSize(16);
    doc.text('CRIMINAL RECORD DECLARATION', 105, 20, { align: 'center' });
    doc.text('E-Hailing Platform Driver Declaration', 105, 28, { align: 'center' });

    doc.setFontSize(11);
    doc.text(`Date: ${date}`, 20, 45);
    doc.text(`Driver Name: ${driverName}`, 20, 55);
    if (idNumber) {
      doc.text(`ID Number: ${idNumber}`, 20, 65);
    }

    doc.setFontSize(10);
    const declarations = [
      'I, the undersigned, hereby declare that:',
      '',
      '1. I have no pending criminal cases against me in any court of law.',
      '',
      '2. I have not been convicted of any violent crime, sexual offence, drug-related',
      '   offence, or any offence involving dishonesty.',
      '',
      '3. All information provided in this declaration is true and correct to the',
      '   best of my knowledge.',
      '',
      '4. I consent to the platform provider conducting background checks and',
      '   verifying this information with relevant authorities.',
      '',
      'I understand that providing false information may result in immediate',
      'termination of my registration and may constitute a criminal offence.',
    ];

    let y = 80;
    declarations.forEach(line => {
      doc.text(line, 20, y);
      y += 6;
    });

    y += 15;
    doc.text(`Signature: ${signature}`, 20, y);
    y += 10;
    doc.text(`Date Signed: ${date}`, 20, y);

    doc.setFontSize(8);
    doc.text('This declaration is in compliance with the National Land Transport Amendment Act, 2023', 105, 280, { align: 'center' });

    doc.save(`Criminal_Declaration_${driverName.replace(/\s+/g, '_')}.pdf`);
  };

  if (alreadySigned) {
    return (
      <Card className="border-success/20">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-success">
            <CheckCircle className="h-5 w-5" />
            Criminal Declaration Signed
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">
                Signed on {signedAt ? format(new Date(signedAt), 'dd MMM yyyy') : 'N/A'}
              </p>
              <Badge variant="outline" className="mt-2 text-success border-success">
                <Shield className="h-3 w-3 mr-1" />
                DOT Compliant
              </Badge>
            </div>
            <Button variant="outline" size="sm" onClick={generatePDF}>
              <Download className="h-4 w-4 mr-2" />
              Download PDF
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-warning/20">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-warning" />
          Criminal Record Declaration
          <Badge variant="destructive" className="ml-auto">Required</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-3 bg-warning/10 rounded-lg text-sm">
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 text-warning shrink-0 mt-0.5" />
            <p>
              As per DOT regulations, all e-hailing drivers must sign a declaration 
              confirming no pending criminal cases and provide police clearance.
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-start space-x-3">
            <Checkbox
              id="noPendingCases"
              checked={declarations.noPendingCases}
              onCheckedChange={(checked) => 
                setDeclarations(prev => ({ ...prev, noPendingCases: !!checked }))
              }
            />
            <Label htmlFor="noPendingCases" className="text-sm leading-relaxed">
              I declare that I have no pending criminal cases against me in any court of law.
            </Label>
          </div>

          <div className="flex items-start space-x-3">
            <Checkbox
              id="noConvictions"
              checked={declarations.noConvictions}
              onCheckedChange={(checked) => 
                setDeclarations(prev => ({ ...prev, noConvictions: !!checked }))
              }
            />
            <Label htmlFor="noConvictions" className="text-sm leading-relaxed">
              I declare that I have not been convicted of any violent crime, sexual offence, 
              drug-related offence, or any offence involving dishonesty.
            </Label>
          </div>

          <div className="flex items-start space-x-3">
            <Checkbox
              id="truthful"
              checked={declarations.truthful}
              onCheckedChange={(checked) => 
                setDeclarations(prev => ({ ...prev, truthful: !!checked }))
              }
            />
            <Label htmlFor="truthful" className="text-sm leading-relaxed">
              I confirm that all information provided is true and correct to the best of my knowledge.
            </Label>
          </div>

          <div className="flex items-start space-x-3">
            <Checkbox
              id="consent"
              checked={declarations.consent}
              onCheckedChange={(checked) => 
                setDeclarations(prev => ({ ...prev, consent: !!checked }))
              }
            />
            <Label htmlFor="consent" className="text-sm leading-relaxed">
              I consent to background checks and verification with relevant authorities.
            </Label>
          </div>
        </div>

        <div>
          <Label htmlFor="signature" className="text-sm font-medium">
            Digital Signature (Type your full name)
          </Label>
          <Input
            id="signature"
            placeholder={driverName || 'Your full name'}
            value={signature}
            onChange={(e) => setSignature(e.target.value)}
            className="mt-1.5 font-serif italic"
          />
        </div>

        <Button
          onClick={handleSubmit}
          disabled={!allChecked || isSubmitting}
          className="w-full"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Signing...
            </>
          ) : (
            <>
              <FileCheck className="h-4 w-4 mr-2" />
              Sign Declaration
            </>
          )}
        </Button>

        <p className="text-xs text-muted-foreground text-center">
          False declaration may result in termination and criminal prosecution.
        </p>
      </CardContent>
    </Card>
  );
};
