import { jsPDF } from "jspdf";
import { format } from "date-fns";

interface PayslipData {
  employerName: string;
  employerAddress: string;
  employeeName: string;
  employeeId: string;
  vehicleReg: string;
  payPeriod: string;
  payDate: string;
  grossRevenue: number;
  driverShare: number;
  ownerShare: number;
  uifDeduction: number;
  payeDeduction: number;
  netPay: number;
  daysWorked: number;
  tripsCompleted: number;
}

export const generatePayslipPDF = (data: PayslipData): void => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  let yPos = 20;

  // Helper functions
  const centerText = (text: string, y: number, size: number = 12) => {
    doc.setFontSize(size);
    const textWidth = doc.getStringUnitWidth(text) * size / doc.internal.scaleFactor;
    doc.text(text, (pageWidth - textWidth) / 2, y);
  };

  const addLine = (y: number) => {
    doc.setDrawColor(200, 200, 200);
    doc.line(20, y, pageWidth - 20, y);
  };

  const addRow = (label: string, value: string, y: number, bold: boolean = false) => {
    doc.setFontSize(10);
    if (bold) {
      doc.setFont("helvetica", "bold");
    } else {
      doc.setFont("helvetica", "normal");
    }
    doc.text(label, 25, y);
    doc.text(value, pageWidth - 25, y, { align: "right" });
  };

  // Header
  doc.setFillColor(34, 139, 34); // Green header
  doc.rect(0, 0, pageWidth, 40, "F");
  
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  centerText("PAYSLIP", 18, 20);
  doc.setFont("helvetica", "normal");
  centerText(data.employerName, 30, 12);

  // Reset text color
  doc.setTextColor(0, 0, 0);
  yPos = 55;

  // Company & Employee Info Box
  doc.setDrawColor(200, 200, 200);
  doc.setFillColor(248, 248, 248);
  doc.roundedRect(20, yPos - 5, pageWidth - 40, 50, 3, 3, "FD");

  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text("EMPLOYER DETAILS", 25, yPos + 5);
  doc.setFont("helvetica", "normal");
  doc.text(data.employerName, 25, yPos + 12);
  doc.text(data.employerAddress, 25, yPos + 19);

  doc.setFont("helvetica", "bold");
  doc.text("EMPLOYEE DETAILS", pageWidth / 2 + 10, yPos + 5);
  doc.setFont("helvetica", "normal");
  doc.text(`Name: ${data.employeeName}`, pageWidth / 2 + 10, yPos + 12);
  doc.text(`ID: ${data.employeeId}`, pageWidth / 2 + 10, yPos + 19);
  doc.text(`Vehicle: ${data.vehicleReg}`, pageWidth / 2 + 10, yPos + 26);

  // Pay Period Info
  doc.setFont("helvetica", "bold");
  doc.text("PAY PERIOD", 25, yPos + 33);
  doc.setFont("helvetica", "normal");
  doc.text(data.payPeriod, 25, yPos + 40);
  
  doc.setFont("helvetica", "bold");
  doc.text("PAYMENT DATE", pageWidth / 2 + 10, yPos + 33);
  doc.setFont("helvetica", "normal");
  doc.text(data.payDate, pageWidth / 2 + 10, yPos + 40);

  yPos += 60;

  // Work Summary Section
  doc.setFillColor(240, 240, 240);
  doc.rect(20, yPos, pageWidth - 40, 8, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("WORK SUMMARY", 25, yPos + 6);
  yPos += 15;

  addRow("Days Worked", data.daysWorked.toString(), yPos);
  yPos += 7;
  addRow("Trips Completed", data.tripsCompleted.toString(), yPos);
  yPos += 7;
  addRow("Total Gross Revenue", `R ${data.grossRevenue.toLocaleString("en-ZA", { minimumFractionDigits: 2 })}`, yPos);
  yPos += 12;

  // Earnings Section
  doc.setFillColor(240, 240, 240);
  doc.rect(20, yPos, pageWidth - 40, 8, "F");
  doc.setFont("helvetica", "bold");
  doc.text("EARNINGS (60/40 Commission Structure)", 25, yPos + 6);
  yPos += 15;

  addRow("Gross Revenue (100%)", `R ${data.grossRevenue.toLocaleString("en-ZA", { minimumFractionDigits: 2 })}`, yPos);
  yPos += 7;
  doc.setTextColor(34, 139, 34);
  addRow("Driver Commission (60%)", `R ${data.driverShare.toLocaleString("en-ZA", { minimumFractionDigits: 2 })}`, yPos, true);
  doc.setTextColor(0, 0, 0);
  yPos += 7;
  doc.setTextColor(128, 128, 128);
  addRow("Owner Share (40%)", `R ${data.ownerShare.toLocaleString("en-ZA", { minimumFractionDigits: 2 })}`, yPos);
  doc.setTextColor(0, 0, 0);
  yPos += 12;

  addLine(yPos);
  yPos += 5;

  addRow("GROSS PAY (Driver Share)", `R ${data.driverShare.toLocaleString("en-ZA", { minimumFractionDigits: 2 })}`, yPos, true);
  yPos += 15;

  // Deductions Section
  doc.setFillColor(255, 235, 235);
  doc.rect(20, yPos, pageWidth - 40, 8, "F");
  doc.setFont("helvetica", "bold");
  doc.setTextColor(180, 0, 0);
  doc.text("STATUTORY DEDUCTIONS", 25, yPos + 6);
  doc.setTextColor(0, 0, 0);
  yPos += 15;

  doc.setTextColor(180, 0, 0);
  addRow("UIF (1% of Gross Pay)", `- R ${data.uifDeduction.toLocaleString("en-ZA", { minimumFractionDigits: 2 })}`, yPos);
  yPos += 7;
  addRow("PAYE (Tax)", `- R ${data.payeDeduction.toLocaleString("en-ZA", { minimumFractionDigits: 2 })}`, yPos);
  yPos += 10;

  addLine(yPos);
  yPos += 5;

  const totalDeductions = data.uifDeduction + data.payeDeduction;
  addRow("TOTAL DEDUCTIONS", `- R ${totalDeductions.toLocaleString("en-ZA", { minimumFractionDigits: 2 })}`, yPos, true);
  doc.setTextColor(0, 0, 0);
  yPos += 20;

  // Net Pay Section
  doc.setFillColor(34, 139, 34);
  doc.roundedRect(20, yPos, pageWidth - 40, 25, 3, 3, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("NET PAY (Take Home)", 25, yPos + 10);
  doc.setFontSize(16);
  doc.text(`R ${data.netPay.toLocaleString("en-ZA", { minimumFractionDigits: 2 })}`, pageWidth - 25, yPos + 16, { align: "right" });
  doc.setTextColor(0, 0, 0);
  yPos += 35;

  // Tax Info Footer
  doc.setFontSize(8);
  doc.setTextColor(128, 128, 128);
  doc.setFont("helvetica", "normal");
  const taxInfo = [
    "Tax Calculation Notes:",
    "• PAYE calculated using SARS 2024/2025 tax tables with primary rebate of R17,235",
    "• UIF calculated at 1% of remuneration (max R177.12/month based on R17,712 ceiling)",
    "• Employer UIF contribution (1%) paid separately and not reflected here",
    "• This payslip is for informational purposes. Retain for your records.",
  ];
  
  taxInfo.forEach((line, i) => {
    doc.text(line, 25, yPos + (i * 5));
  });

  yPos += 30;

  // Footer
  addLine(yPos);
  yPos += 8;
  doc.setFontSize(8);
  doc.setTextColor(128, 128, 128);
  centerText(`Generated on ${format(new Date(), "dd MMMM yyyy 'at' HH:mm")}`, yPos, 8);
  yPos += 5;
  centerText("This is a computer-generated document and does not require a signature.", yPos, 8);

  // Save the PDF
  const fileName = `Payslip_${data.employeeName.replace(/\s+/g, "_")}_${data.payPeriod.replace(/\s+/g, "_")}.pdf`;
  doc.save(fileName);
};

// Bulk generate payslips for all vehicles
export const generateAllPayslips = (
  vehiclePayrolls: Array<{
    vehicle: { id: string; registration_number: string };
    payroll: {
      grossRevenue: number;
      driverShare: number;
      ownerShare: number;
      uifDeduction: number;
      payeDeduction: number;
      netDriverPay: number;
    };
    daysWorked: number;
    tripsCompleted: number;
  }>,
  payPeriod: string,
  employerName: string = "Poortlink Fleet Services",
  employerAddress: string = "Cape Town, South Africa"
): void => {
  vehiclePayrolls.forEach((item, index) => {
    setTimeout(() => {
      generatePayslipPDF({
        employerName,
        employerAddress,
        employeeName: `Driver - ${item.vehicle.registration_number}`,
        employeeId: item.vehicle.id.slice(0, 8).toUpperCase(),
        vehicleReg: item.vehicle.registration_number,
        payPeriod,
        payDate: format(new Date(), "dd MMMM yyyy"),
        grossRevenue: item.payroll.grossRevenue,
        driverShare: item.payroll.driverShare,
        ownerShare: item.payroll.ownerShare,
        uifDeduction: item.payroll.uifDeduction,
        payeDeduction: item.payroll.payeDeduction,
        netPay: item.payroll.netDriverPay,
        daysWorked: item.daysWorked,
        tripsCompleted: item.tripsCompleted,
      });
    }, index * 500); // Stagger downloads
  });
};
