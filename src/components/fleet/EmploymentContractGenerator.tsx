import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { FileText, Download, User, Building2, Calendar } from "lucide-react";
import jsPDF from "jspdf";
import { format } from "date-fns";

interface ContractDetails {
  // Employer details
  employerName: string;
  employerRegistration: string;
  employerAddress: string;
  employerPhone: string;
  
  // Employee details
  employeeName: string;
  employeeId: string;
  employeeAddress: string;
  employeePhone: string;
  
  // Contract terms
  startDate: string;
  vehicleRegistration: string;
  baseDaily: number;
  commissionRate: number;
}

export const EmploymentContractGenerator = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [details, setDetails] = useState<ContractDetails>({
    employerName: "MobilityOne (Pty) Ltd t/a PoortLink",
    employerRegistration: "",
    employerAddress: "",
    employerPhone: "",
    employeeName: "",
    employeeId: "",
    employeeAddress: "",
    employeePhone: "",
    startDate: format(new Date(), "yyyy-MM-dd"),
    vehicleRegistration: "",
    baseDaily: 150,
    commissionRate: 40,
  });

  const generateContract = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    let yPos = 20;

    const addText = (text: string, fontSize: number = 10, isBold: boolean = false) => {
      doc.setFontSize(fontSize);
      doc.setFont("helvetica", isBold ? "bold" : "normal");
      const lines = doc.splitTextToSize(text, pageWidth - margin * 2);
      
      lines.forEach((line: string) => {
        if (yPos > 270) {
          doc.addPage();
          yPos = 20;
        }
        doc.text(line, margin, yPos);
        yPos += fontSize * 0.5;
      });
      yPos += 3;
    };

    const addHeading = (text: string) => {
      yPos += 5;
      addText(text, 12, true);
      yPos += 2;
    };

    const addClause = (number: string, title: string, content: string) => {
      addText(`${number}. ${title}`, 11, true);
      addText(content, 10, false);
      yPos += 3;
    };

    // Header
    doc.setFillColor(16, 185, 129);
    doc.rect(0, 0, pageWidth, 35, "F");
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("EMPLOYMENT CONTRACT", pageWidth / 2, 15, { align: "center" });
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text("Basic Conditions of Employment Act 75 of 1997", pageWidth / 2, 23, { align: "center" });
    doc.text("Commission-Based Driver Employment Agreement", pageWidth / 2, 30, { align: "center" });
    
    doc.setTextColor(0, 0, 0);
    yPos = 45;

    // Parties
    addHeading("PARTIES TO THIS AGREEMENT");
    addText(`EMPLOYER: ${details.employerName}`, 10, true);
    addText(`Registration: ${details.employerRegistration || "[To be completed]"}`);
    addText(`Address: ${details.employerAddress || "[To be completed]"}`);
    addText(`Contact: ${details.employerPhone || "[To be completed]"}`);
    yPos += 3;
    
    addText(`EMPLOYEE: ${details.employeeName || "[Employee Name]"}`, 10, true);
    addText(`ID Number: ${details.employeeId || "[ID Number]"}`);
    addText(`Address: ${details.employeeAddress || "[To be completed]"}`);
    addText(`Contact: ${details.employeePhone || "[To be completed]"}`);

    // Commencement
    addHeading("1. COMMENCEMENT AND DURATION");
    addText(`1.1 This contract commences on ${details.startDate ? format(new Date(details.startDate), "dd MMMM yyyy") : "[Start Date]"} and continues indefinitely until terminated in accordance with clause 12.`);
    addText(`1.2 The first three (3) months shall constitute a probationary period during which either party may terminate with one (1) week's written notice.`);

    // Job Description
    addHeading("2. JOB DESCRIPTION");
    addText(`2.1 The Employee is employed as a DRIVER operating the vehicle with registration number ${details.vehicleRegistration || "[Vehicle Reg]"}.`);
    addText(`2.2 Duties include but are not limited to: safe transportation of passengers, vehicle care and maintenance checks, adherence to traffic laws, customer service excellence, and compliance with company policies.`);
    addText(`2.3 The Employee shall operate within designated routes and areas as determined by the Employer.`);

    // Remuneration - Key 60/40 Section
    addHeading("3. REMUNERATION (60/40 COMMISSION STRUCTURE)");
    addText(`3.1 BASE COMPONENT: The Employee shall receive a guaranteed minimum daily rate of R${details.baseDaily.toFixed(2)} for each operating day.`, 10, true);
    addText(`3.2 COMMISSION COMPONENT: In addition to the base rate, the Employee shall receive ${details.commissionRate}% (forty percent) of all fare revenue collected above R${(details.baseDaily / (details.commissionRate / 100)).toFixed(0)} per operating day.`);
    addText(`3.3 The remaining ${100 - details.commissionRate}% (sixty percent) of fare revenue shall be retained by the Employer to cover vehicle costs, insurance, licensing, and operational expenses.`);
    addText(`3.4 Payment shall be made weekly/monthly [circle applicable] by electronic funds transfer to the Employee's nominated bank account.`);
    addText(`3.5 The Employer shall provide itemized pay slips showing: trips completed, gross revenue, commission earned, statutory deductions, and net payment.`);

    // Working Hours
    addHeading("4. WORKING HOURS (BCEA Section 9-16)");
    addText(`4.1 Ordinary working hours shall not exceed 45 hours per week (9 hours per day for 5-day week or 8 hours per day for 6-day week).`);
    addText(`4.2 Meal intervals: The Employee is entitled to a meal interval of at least one hour after every five hours of continuous work.`);
    addText(`4.3 Overtime: Work beyond ordinary hours is voluntary. Overtime shall be compensated at 1.5 times the hourly equivalent of the daily base rate.`);
    addText(`4.4 Sunday work shall be compensated at double the ordinary rate unless the Employee ordinarily works on Sundays.`);

    // New page for leave provisions
    doc.addPage();
    yPos = 20;

    // Leave
    addHeading("5. LEAVE ENTITLEMENTS (BCEA Section 20-27)");
    addText(`5.1 ANNUAL LEAVE: The Employee is entitled to 21 consecutive days' paid annual leave per annual leave cycle, or by agreement, one day for every 17 days worked.`);
    addText(`5.2 SICK LEAVE: The Employee is entitled to paid sick leave equal to the number of days worked in a 6-week period per 36-month cycle. A medical certificate is required for absences exceeding two consecutive days.`);
    addText(`5.3 FAMILY RESPONSIBILITY LEAVE: Three days' paid leave per annual cycle for: birth of child, illness of child, or death of spouse/life partner/parent/adoptive parent/grandparent/child/grandchild/sibling.`);
    addText(`5.4 MATERNITY LEAVE: Four consecutive months' unpaid maternity leave in accordance with Section 25 of the BCEA.`);

    // Deductions
    addHeading("6. DEDUCTIONS (BCEA Section 34)");
    addText(`6.1 The Employer shall deduct from remuneration:`);
    addText(`    a) UIF contributions as required by the Unemployment Insurance Act (1% of earnings)`);
    addText(`    b) PAYE income tax as required by SARS (if applicable based on earnings)`);
    addText(`    c) Any other deductions required by law or court order`);
    addText(`6.2 The Employer shall register the Employee with the Unemployment Insurance Fund within the first month of employment.`);
    addText(`6.3 No deductions for damage to company property shall be made without written agreement or court order.`);

    // Vehicle and Safety
    addHeading("7. VEHICLE USAGE AND SAFETY");
    addText(`7.1 The vehicle remains the property of the Employer at all times.`);
    addText(`7.2 The Employee shall conduct daily pre-trip inspections and report any defects immediately.`);
    addText(`7.3 The Employee shall maintain a valid driver's license and Professional Driving Permit (PDP) at all times.`);
    addText(`7.4 The Employee shall not use the vehicle for personal purposes without written authorization.`);
    addText(`7.5 Traffic fines incurred due to Employee negligence shall be the Employee's responsibility.`);

    // Code of Conduct
    addHeading("8. CODE OF CONDUCT");
    addText(`8.1 The Employee shall at all times:`);
    addText(`    a) Treat passengers with respect and courtesy`);
    addText(`    b) Refrain from using alcohol or drugs while on duty`);
    addText(`    c) Comply with all traffic laws and regulations`);
    addText(`    d) Maintain personal hygiene and neat appearance`);
    addText(`    e) Accurately report all fares collected`);
    addText(`8.2 Misconduct shall be dealt with in accordance with the disciplinary procedure in Schedule A.`);

    // New page
    doc.addPage();
    yPos = 20;

    // Confidentiality
    addHeading("9. CONFIDENTIALITY");
    addText(`9.1 The Employee shall not disclose any confidential business information, customer data, or trade secrets during or after employment.`);
    addText(`9.2 All customer information collected during operations is subject to POPIA (Protection of Personal Information Act) requirements.`);

    // Dispute Resolution
    addHeading("10. DISPUTE RESOLUTION");
    addText(`10.1 Any dispute arising from this contract shall first be addressed through internal grievance procedures.`);
    addText(`10.2 If unresolved, disputes may be referred to the CCMA (Commission for Conciliation, Mediation and Arbitration) in accordance with the Labour Relations Act.`);

    // Termination
    addHeading("11. TERMINATION OF EMPLOYMENT (BCEA Section 37)");
    addText(`11.1 Notice periods:`);
    addText(`    a) First 6 months: One week's notice`);
    addText(`    b) 6 months to 1 year: Two weeks' notice`);
    addText(`    c) More than 1 year: Four weeks' notice`);
    addText(`11.2 Notice must be given in writing.`);
    addText(`11.3 The Employer may summarily dismiss the Employee for serious misconduct as defined in Schedule A.`);
    addText(`11.4 Upon termination, the Employee shall return all company property including vehicle keys, uniforms, and documentation.`);

    // General
    addHeading("12. GENERAL PROVISIONS");
    addText(`12.1 This contract constitutes the entire agreement between the parties.`);
    addText(`12.2 Amendments must be in writing and signed by both parties.`);
    addText(`12.3 This contract is governed by the laws of the Republic of South Africa.`);
    addText(`12.4 If any provision is found to be invalid, the remaining provisions shall continue in force.`);

    // Signatures
    yPos += 10;
    addHeading("SIGNATURES");
    addText(`The parties confirm that they have read, understood, and agree to the terms of this contract.`);
    
    yPos += 10;
    doc.line(margin, yPos, margin + 70, yPos);
    doc.line(pageWidth - margin - 70, yPos, pageWidth - margin, yPos);
    yPos += 5;
    addText(`EMPLOYER                                                                    EMPLOYEE`);
    addText(`Name: _______________________                              Name: _______________________`);
    addText(`Date: _______________________                                Date: _______________________`);

    yPos += 10;
    doc.line(margin, yPos, margin + 70, yPos);
    yPos += 5;
    addText(`WITNESS`);
    addText(`Name: _______________________`);
    addText(`Date: _______________________`);

    // Footer
    yPos = 280;
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    doc.text("This contract template is compliant with the Basic Conditions of Employment Act 75 of 1997.", margin, yPos);
    doc.text(`Generated: ${format(new Date(), "dd MMMM yyyy")} | PoortLink Employment Contract`, margin, yPos + 4);

    // Save
    const fileName = details.employeeName 
      ? `Employment_Contract_${details.employeeName.replace(/\s+/g, '_')}_${format(new Date(), "yyyyMMdd")}.pdf`
      : `Employment_Contract_Template_${format(new Date(), "yyyyMMdd")}.pdf`;
    
    doc.save(fileName);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle>Employment Contracts</CardTitle>
              <CardDescription>
                BCEA-compliant 60/40 commission driver contracts
              </CardDescription>
            </div>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <FileText className="h-4 w-4" />
                Generate Contract
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Generate Employment Contract</DialogTitle>
              </DialogHeader>
              
              <div className="space-y-6">
                {/* Employer Details */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <Building2 className="h-4 w-4" />
                    Employer Details
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Company Name</Label>
                      <Input
                        value={details.employerName}
                        onChange={(e) => setDetails({ ...details, employerName: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>CIPC Registration</Label>
                      <Input
                        value={details.employerRegistration}
                        onChange={(e) => setDetails({ ...details, employerRegistration: e.target.value })}
                        placeholder="2024/123456/07"
                      />
                    </div>
                    <div className="space-y-2 col-span-2">
                      <Label>Business Address</Label>
                      <Input
                        value={details.employerAddress}
                        onChange={(e) => setDetails({ ...details, employerAddress: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Contact Number</Label>
                      <Input
                        value={details.employerPhone}
                        onChange={(e) => setDetails({ ...details, employerPhone: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Employee Details */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <User className="h-4 w-4" />
                    Employee Details
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Full Name</Label>
                      <Input
                        value={details.employeeName}
                        onChange={(e) => setDetails({ ...details, employeeName: e.target.value })}
                        placeholder="As per ID document"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>ID Number</Label>
                      <Input
                        value={details.employeeId}
                        onChange={(e) => setDetails({ ...details, employeeId: e.target.value })}
                        placeholder="13-digit SA ID"
                      />
                    </div>
                    <div className="space-y-2 col-span-2">
                      <Label>Residential Address</Label>
                      <Input
                        value={details.employeeAddress}
                        onChange={(e) => setDetails({ ...details, employeeAddress: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Phone Number</Label>
                      <Input
                        value={details.employeePhone}
                        onChange={(e) => setDetails({ ...details, employeePhone: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Contract Terms */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <Calendar className="h-4 w-4" />
                    Contract Terms
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Start Date</Label>
                      <Input
                        type="date"
                        value={details.startDate}
                        onChange={(e) => setDetails({ ...details, startDate: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Vehicle Registration</Label>
                      <Input
                        value={details.vehicleRegistration}
                        onChange={(e) => setDetails({ ...details, vehicleRegistration: e.target.value })}
                        placeholder="CA 123-456"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Base Daily Rate (R)</Label>
                      <Input
                        type="number"
                        value={details.baseDaily}
                        onChange={(e) => setDetails({ ...details, baseDaily: parseFloat(e.target.value) || 0 })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Driver Commission (%)</Label>
                      <Input
                        type="number"
                        value={details.commissionRate}
                        onChange={(e) => setDetails({ ...details, commissionRate: parseFloat(e.target.value) || 40 })}
                        min={0}
                        max={100}
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-muted/50 p-4 rounded-lg text-sm">
                  <p className="font-medium mb-2">Contract Summary:</p>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• Base guarantee: R{details.baseDaily}/day</li>
                    <li>• Driver commission: {details.commissionRate}% of revenue</li>
                    <li>• Owner retention: {100 - details.commissionRate}% of revenue</li>
                    <li>• Includes: UIF, leave provisions, notice periods</li>
                    <li>• Compliant with BCEA Act 75 of 1997</li>
                  </ul>
                </div>

                <div className="flex gap-3">
                  <Button onClick={generateContract} className="flex-1 gap-2">
                    <Download className="h-4 w-4" />
                    Download Contract (PDF)
                  </Button>
                  <Button variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-sm text-muted-foreground space-y-2">
          <p>Generate legally compliant employment contracts including:</p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>60/40 revenue split commission structure</li>
            <li>BCEA working hours and overtime provisions</li>
            <li>Annual leave (21 days), sick leave, family responsibility leave</li>
            <li>UIF registration and statutory deductions</li>
            <li>Termination notice periods and dispute resolution</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};
