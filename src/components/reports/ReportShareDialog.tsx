import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Download,
  Printer,
  MessageCircle,
  Mail,
  Share2,
  FileText,
  Smartphone,
  Copy,
  Check,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ReportShareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  pdfDataUrl: string | null;
  onDownload: (filename?: string) => void;
  onPrint: () => void;
  onShareWhatsApp: (summary: string, phoneNumber?: string) => void;
  onShareEmail: (subject: string, body: string) => void;
  onShareSms?: (summary: string, phoneNumber?: string) => void;
  reportSummary: string;
  emailSubject?: string;
  emailBody?: string;
  filename?: string;
}

export const ReportShareDialog = ({
  open,
  onOpenChange,
  title,
  pdfDataUrl,
  onDownload,
  onPrint,
  onShareWhatsApp,
  onShareEmail,
  onShareSms,
  reportSummary,
  emailSubject,
  emailBody,
  filename,
}: ReportShareDialogProps) => {
  const { toast } = useToast();
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [smsNumber, setSmsNumber] = useState("");
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(reportSummary.replace(/%0A/g, '\n'));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({
        title: "Copied",
        description: "Report summary copied to clipboard.",
      });
    } catch (err) {
      toast({
        title: "Copy Failed",
        description: "Could not copy to clipboard.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <FileText className="mr-2 h-5 w-5" />
            {title}
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="preview" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="preview">Preview</TabsTrigger>
            <TabsTrigger value="share">Share</TabsTrigger>
            <TabsTrigger value="send">Send Direct</TabsTrigger>
          </TabsList>

          <TabsContent value="preview" className="space-y-4">
            {/* PDF Preview */}
            {pdfDataUrl && (
              <div className="border rounded-lg overflow-hidden h-72">
                <iframe
                  src={pdfDataUrl}
                  className="w-full h-full"
                  title="Report Preview"
                />
              </div>
            )}

            {/* Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Button onClick={() => onDownload(filename)} className="w-full">
                <Download className="mr-2 h-4 w-4" />
                Download
              </Button>

              <Button onClick={onPrint} variant="outline" className="w-full">
                <Printer className="mr-2 h-4 w-4" />
                Print
              </Button>

              <Button
                onClick={() => onShareWhatsApp(reportSummary)}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                <MessageCircle className="mr-2 h-4 w-4" />
                WhatsApp
              </Button>

              <Button
                onClick={() => onShareEmail(
                  emailSubject || title,
                  emailBody || reportSummary.replace(/%0A/g, '\n')
                )}
                variant="outline"
                className="w-full"
              >
                <Mail className="mr-2 h-4 w-4" />
                Email
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="share" className="space-y-4">
            {/* Copy Summary */}
            <div className="space-y-2">
              <Label>Report Summary (for sharing)</Label>
              <div className="relative">
                <textarea
                  readOnly
                  value={reportSummary.replace(/%0A/g, '\n')}
                  className="w-full h-40 p-3 text-sm bg-muted rounded-lg resize-none"
                />
                <Button
                  size="sm"
                  variant="secondary"
                  className="absolute top-2 right-2"
                  onClick={copyToClipboard}
                >
                  {copied ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Copy this summary to share via any platform.
              </p>
            </div>

            {/* Share Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <Button
                onClick={() => onShareWhatsApp(reportSummary)}
                className="bg-green-600 hover:bg-green-700"
              >
                <MessageCircle className="mr-2 h-4 w-4" />
                Share via WhatsApp
              </Button>
              
              <Button
                onClick={() => onShareEmail(
                  emailSubject || title,
                  emailBody || reportSummary.replace(/%0A/g, '\n')
                )}
                variant="outline"
              >
                <Mail className="mr-2 h-4 w-4" />
                Share via Email
              </Button>

              {onShareSms && (
                <Button
                  onClick={() => onShareSms(reportSummary)}
                  variant="outline"
                  className="col-span-2"
                >
                  <Smartphone className="mr-2 h-4 w-4" />
                  Share via SMS
                </Button>
              )}
            </div>
          </TabsContent>

          <TabsContent value="send" className="space-y-4">
            {/* WhatsApp Direct */}
            <div className="space-y-2">
              <Label>Send via WhatsApp</Label>
              <div className="flex space-x-2">
                <Input
                  placeholder="+27 82 123 4567"
                  value={whatsappNumber}
                  onChange={(e) => setWhatsappNumber(e.target.value)}
                  className="flex-1"
                />
                <Button
                  onClick={() => onShareWhatsApp(reportSummary, whatsappNumber)}
                  className="bg-green-600 hover:bg-green-700"
                  disabled={!whatsappNumber}
                >
                  <Share2 className="mr-2 h-4 w-4" />
                  Send
                </Button>
              </div>
            </div>

            {/* SMS Direct */}
            {onShareSms && (
              <div className="space-y-2">
                <Label>Send via SMS</Label>
                <div className="flex space-x-2">
                  <Input
                    placeholder="+27 82 123 4567"
                    value={smsNumber}
                    onChange={(e) => setSmsNumber(e.target.value)}
                    className="flex-1"
                  />
                  <Button
                    onClick={() => onShareSms(reportSummary, smsNumber)}
                    variant="outline"
                    disabled={!smsNumber}
                  >
                    <Smartphone className="mr-2 h-4 w-4" />
                    Send
                  </Button>
                </div>
              </div>
            )}

            <p className="text-xs text-muted-foreground">
              Note: The report summary will be sent as a message. For the full PDF, download and attach manually.
            </p>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
