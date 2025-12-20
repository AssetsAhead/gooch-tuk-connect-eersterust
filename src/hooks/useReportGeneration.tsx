import { useState, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export interface ReportSection {
  title: string;
  content?: string;
  table?: {
    headers: string[];
    rows: (string | number)[][];
  };
  list?: string[];
}

export interface ReportConfig {
  title: string;
  subtitle?: string;
  companyName?: string;
  companyRef?: string;
  sections: ReportSection[];
  footer?: string;
  headerColor?: [number, number, number];
}

export const useReportGeneration = () => {
  const { toast } = useToast();
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
  const [pdfDataUrl, setPdfDataUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [currentReportTitle, setCurrentReportTitle] = useState("");

  const generatePdfReport = useCallback((config: ReportConfig) => {
    setIsGenerating(true);
    setCurrentReportTitle(config.title);

    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      let yPos = 20;

      // Header
      doc.setFontSize(20);
      doc.setFont("helvetica", "bold");
      doc.text(config.title, pageWidth / 2, yPos, { align: "center" });
      yPos += 8;

      if (config.subtitle) {
        doc.setFontSize(12);
        doc.setFont("helvetica", "normal");
        doc.text(config.subtitle, pageWidth / 2, yPos, { align: "center" });
        yPos += 6;
      }

      if (config.companyName) {
        doc.setFontSize(11);
        doc.text(config.companyName, pageWidth / 2, yPos, { align: "center" });
        yPos += 5;
      }

      if (config.companyRef) {
        doc.setFontSize(10);
        doc.text(`Ref: ${config.companyRef}`, pageWidth / 2, yPos, { align: "center" });
        yPos += 5;
      }

      doc.text(`Generated: ${new Date().toLocaleDateString('en-ZA')} at ${new Date().toLocaleTimeString('en-ZA')}`, pageWidth / 2, yPos, { align: "center" });
      yPos += 15;

      // Sections
      config.sections.forEach((section) => {
        // Check if we need a new page
        if (yPos > 250) {
          doc.addPage();
          yPos = 20;
        }

        // Section title
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text(section.title, 14, yPos);
        yPos += 8;

        // Section content
        if (section.content) {
          doc.setFontSize(10);
          doc.setFont("helvetica", "normal");
          const lines = doc.splitTextToSize(section.content, pageWidth - 28);
          doc.text(lines, 14, yPos);
          yPos += lines.length * 5 + 5;
        }

        // Section table
        if (section.table) {
          autoTable(doc, {
            startY: yPos,
            head: [section.table.headers],
            body: section.table.rows.map(row => row.map(cell => String(cell))),
            headStyles: { fillColor: config.headerColor || [41, 128, 185] },
            styles: { fontSize: 9 },
            margin: { left: 14, right: 14 }
          });
          yPos = (doc as any).lastAutoTable.finalY + 10;
        }

        // Section list
        if (section.list) {
          doc.setFontSize(10);
          doc.setFont("helvetica", "normal");
          section.list.forEach((item) => {
            if (yPos > 270) {
              doc.addPage();
              yPos = 20;
            }
            doc.text(`• ${item}`, 18, yPos);
            yPos += 5;
          });
          yPos += 5;
        }
      });

      // Footer on all pages
      const pageCount = doc.internal.pages.length - 1;
      const footerText = config.footer || "CONFIDENTIAL";
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setFont("helvetica", "normal");
        doc.text(
          `Page ${i} of ${pageCount} | ${footerText}`,
          pageWidth / 2,
          doc.internal.pageSize.getHeight() - 10,
          { align: "center" }
        );
      }

      // Generate outputs
      const blob = doc.output('blob');
      setPdfBlob(blob);

      const dataUrl = doc.output('dataurlstring');
      setPdfDataUrl(dataUrl);

      setShowShareDialog(true);
      setIsGenerating(false);

      toast({
        title: "Report Generated",
        description: "Your report is ready to view, download, or share.",
      });

      return { blob, dataUrl };
    } catch (error) {
      setIsGenerating(false);
      toast({
        title: "Generation Failed",
        description: "Failed to generate report. Please try again.",
        variant: "destructive",
      });
      return null;
    }
  }, [toast]);

  const downloadPdf = useCallback((filename?: string) => {
    if (pdfBlob) {
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename || `Report_${new Date().toISOString().split('T')[0]}.pdf`;
      link.click();
      URL.revokeObjectURL(url);

      toast({
        title: "Download Started",
        description: "Your PDF report is downloading.",
      });
    }
  }, [pdfBlob, toast]);

  const printReport = useCallback(() => {
    if (pdfDataUrl) {
      const printWindow = window.open(pdfDataUrl, '_blank');
      if (printWindow) {
        printWindow.onload = () => {
          printWindow.print();
        };
      }
    }
  }, [pdfDataUrl]);

  const shareViaWhatsApp = useCallback((summary: string, phoneNumber?: string) => {
    const encodedSummary = encodeURIComponent(summary);
    const whatsappUrl = phoneNumber
      ? `https://wa.me/${phoneNumber.replace(/\D/g, '')}?text=${encodedSummary}`
      : `https://wa.me/?text=${encodedSummary}`;

    window.open(whatsappUrl, '_blank');

    toast({
      title: "Opening WhatsApp",
      description: "Share the report summary via WhatsApp.",
    });
  }, [toast]);

  const shareViaEmail = useCallback((subject: string, body: string) => {
    const encodedSubject = encodeURIComponent(subject);
    const encodedBody = encodeURIComponent(body);

    window.open(`mailto:?subject=${encodedSubject}&body=${encodedBody}`, '_blank');

    toast({
      title: "Opening Email",
      description: "Compose your email and attach the downloaded PDF.",
    });
  }, [toast]);

  const shareViaSms = useCallback((summary: string, phoneNumber?: string) => {
    const encodedSummary = encodeURIComponent(summary.substring(0, 160)); // SMS character limit
    const smsUrl = phoneNumber
      ? `sms:${phoneNumber}?body=${encodedSummary}`
      : `sms:?body=${encodedSummary}`;

    window.open(smsUrl, '_blank');

    toast({
      title: "Opening SMS",
      description: "Send report summary via SMS.",
    });
  }, [toast]);

  const closeShareDialog = useCallback(() => {
    setShowShareDialog(false);
  }, []);

  return {
    // State
    pdfBlob,
    pdfDataUrl,
    isGenerating,
    showShareDialog,
    currentReportTitle,
    // Actions
    generatePdfReport,
    downloadPdf,
    printReport,
    shareViaWhatsApp,
    shareViaEmail,
    shareViaSms,
    closeShareDialog,
    setShowShareDialog,
  };
};
