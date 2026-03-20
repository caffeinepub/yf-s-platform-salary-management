import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertCircle,
  ArrowUpDown,
  BadgeIndianRupee,
  Banknote,
  BookOpen,
  Building2,
  Calculator,
  CalendarDays,
  ClipboardList,
  Download,
  FileBarChart2,
  FileCheck2,
  FileSpreadsheet,
  FileText,
  Gift,
  Landmark,
  Printer,
  Receipt,
  ShieldCheck,
  TrendingUp,
  Users,
} from "lucide-react";
import { useState } from "react";
import { formatToday } from "../utils/dateUtils";

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: CURRENT_YEAR - 2019 }, (_, i) =>
  String(2020 + i),
);

function getSessionMonthNames(): string[] {
  const now = new Date();
  const currentMonthIdx = now.getMonth(); // 0-based
  const result: string[] = [];
  if (currentMonthIdx >= 3) {
    for (let i = 3; i <= currentMonthIdx; i++) result.push(MONTHS[i]);
  } else {
    for (let i = 3; i <= 11; i++) result.push(MONTHS[i]);
    for (let i = 0; i <= currentMonthIdx; i++) result.push(MONTHS[i]);
  }
  return result;
}

type StoredEmployee = {
  id: string;
  name: string;
  employeeId: string;
  institute: string;
  designation: string;
  department: string;
  employmentType: "regular" | "temporary";
  basicSalary: number;
  bankAccount?: string;
  bankName?: string;
  ifsc?: string;
  pan?: string;
  pfAccount?: string;
  esicNo?: string;
};

type StoredSalary = {
  employeeId: string;
  month: string;
  year: string;
  // Fields from ReportsPage calcSalaryComponents (fallback)
  basic?: number;
  da?: number;
  hra?: number;
  ta?: number;
  gross?: number;
  pf?: number;
  esic?: number;
  pt?: number;
  it?: number;
  net?: number;
  // Fields from SalaryProcessingPage (saved records)
  basicPay?: number;
  specialPay?: number;
  daPercent?: number;
  hraPercent?: number;
  bonus?: number;
  daArrears?: number;
  conveyanceAllowance?: number;
  washingAllowance?: number;
  ltc?: number;
  festivalAdvance?: number;
  incentive?: number;
  otherEarnings?: number;
  grossEarnings?: number;
  houseRent?: number;
  electricityCharges?: number;
  lwf?: number;
  epf?: number;
  vpf?: number;
  lic?: number;
  profTax?: number;
  incomeTax?: number;
  festival?: number;
  esi?: number;
  security?: number;
  otherDeductions?: number;
  totalDeductions?: number;
  netEarnings?: number;
  lwp?: number;
  employmentType?: string;
  locked: boolean;
};

function numberToWords(num: number): string {
  const ones = [
    "",
    "One",
    "Two",
    "Three",
    "Four",
    "Five",
    "Six",
    "Seven",
    "Eight",
    "Nine",
    "Ten",
    "Eleven",
    "Twelve",
    "Thirteen",
    "Fourteen",
    "Fifteen",
    "Sixteen",
    "Seventeen",
    "Eighteen",
    "Nineteen",
  ];
  const tens = [
    "",
    "",
    "Twenty",
    "Thirty",
    "Forty",
    "Fifty",
    "Sixty",
    "Seventy",
    "Eighty",
    "Ninety",
  ];
  function twoDigits(n: number): string {
    if (n < 20) return ones[n];
    return `${tens[Math.floor(n / 10)]}${n % 10 ? ` ${ones[n % 10]}` : ""}`;
  }
  function threeDigits(n: number): string {
    if (n >= 100)
      return `${ones[Math.floor(n / 100)]} Hundred${n % 100 ? ` ${twoDigits(n % 100)}` : ""}`;
    return twoDigits(n);
  }
  const n = Math.round(num);
  if (n === 0) return "Zero";
  const crore = Math.floor(n / 10000000);
  const lakh = Math.floor((n % 10000000) / 100000);
  const thousand = Math.floor((n % 100000) / 1000);
  const rest = n % 1000;
  let result = "";
  if (crore) result += `${threeDigits(crore)} Crore `;
  if (lakh) result += `${threeDigits(lakh)} Lakh `;
  if (thousand) result += `${threeDigits(thousand)} Thousand `;
  if (rest) result += threeDigits(rest);
  return result.trim();
}

const LOGO_URL = "/assets/uploads/logo-1.png";

const REPORT_CATEGORIES = [
  {
    id: "payroll",
    label: "Payroll Reports",
    icon: <BadgeIndianRupee className="w-4 h-4" />,
    reports: [
      {
        id: "paybill",
        label: "Paybill / Pay Register",
        icon: <FileText className="w-4 h-4" />,
        desc: "Monthly salary summary for all employees",
      },
      {
        id: "salary-register",
        label: "Salary Register",
        icon: <ClipboardList className="w-4 h-4" />,
        desc: "Detailed salary register with all components",
      },
      {
        id: "bank-statement",
        label: "Bank Statement / ECS",
        icon: <Banknote className="w-4 h-4" />,
        desc: "Bank transfer list for net salary credit",
      },
      {
        id: "arrears",
        label: "Arrears Report",
        icon: <ArrowUpDown className="w-4 h-4" />,
        desc: "Arrears paid to employees",
      },
      {
        id: "bonus",
        label: "Bonus Report",
        icon: <Gift className="w-4 h-4" />,
        desc: "Bonus/incentive summary",
      },
      {
        id: "increment",
        label: "Increment Report",
        icon: <TrendingUp className="w-4 h-4" />,
        desc: "Salary increment history",
      },
    ],
  },
  {
    id: "pf",
    label: "PF Reports",
    icon: <ShieldCheck className="w-4 h-4" />,
    reports: [
      {
        id: "pf-report",
        label: "PF Report (Monthly)",
        icon: <FileBarChart2 className="w-4 h-4" />,
        desc: "Monthly PF deduction summary",
      },
      {
        id: "form-3a",
        label: "Form 3A",
        icon: <FileCheck2 className="w-4 h-4" />,
        desc: "Annual PF contribution statement per member",
      },
      {
        id: "form-6a",
        label: "Form 6A",
        icon: <BookOpen className="w-4 h-4" />,
        desc: "Annual consolidated PF statement",
      },
      {
        id: "loan-recovery",
        label: "Loan Recovery Report",
        icon: <Receipt className="w-4 h-4" />,
        desc: "PF loan/advance recovery tracking",
      },
    ],
  },
  {
    id: "esic",
    label: "ESIC Reports",
    icon: <Landmark className="w-4 h-4" />,
    reports: [
      {
        id: "esic-report",
        label: "ESIC Monthly Report",
        icon: <FileBarChart2 className="w-4 h-4" />,
        desc: "Monthly ESIC contribution (0.75% employee)",
      },
      {
        id: "esic-challan",
        label: "ESIC Challan",
        icon: <Receipt className="w-4 h-4" />,
        desc: "ESIC payment challan",
      },
    ],
  },
  {
    id: "tax",
    label: "Tax Reports",
    icon: <Calculator className="w-4 h-4" />,
    reports: [
      {
        id: "form-16a",
        label: "Form 16A / TDS Certificate",
        icon: <FileCheck2 className="w-4 h-4" />,
        desc: "TDS certificate for employees",
      },
      {
        id: "pt-challan",
        label: "PT Challan",
        icon: <Receipt className="w-4 h-4" />,
        desc: "Professional Tax payment challan",
      },
      {
        id: "it-statement",
        label: "IT Statement",
        icon: <FileSpreadsheet className="w-4 h-4" />,
        desc: "Income tax computation statement",
      },
    ],
  },
  {
    id: "hr",
    label: "HR Reports",
    icon: <Users className="w-4 h-4" />,
    reports: [
      {
        id: "leave-report",
        label: "Leave Report",
        icon: <CalendarDays className="w-4 h-4" />,
        desc: "Leave taken / balance summary",
      },
      {
        id: "attendance-summary",
        label: "Attendance Summary",
        icon: <ClipboardList className="w-4 h-4" />,
        desc: "Monthly attendance summary",
      },
      {
        id: "headcount",
        label: "Headcount Report",
        icon: <Users className="w-4 h-4" />,
        desc: "Employee headcount by institute/department",
      },
    ],
  },
];

function getEmployees(): StoredEmployee[] {
  try {
    return JSON.parse(localStorage.getItem("employees") || "[]");
  } catch {
    return [];
  }
}
function getSalaries(): StoredSalary[] {
  try {
    return JSON.parse(localStorage.getItem("salaries") || "[]");
  } catch {
    return [];
  }
}
function getInstitutes(): string[] {
  try {
    const inst = JSON.parse(localStorage.getItem("institutes") || "[]");
    return inst.map((i: { name: string }) => i.name);
  } catch {
    return [];
  }
}

function calcSalaryComponents(emp: StoredEmployee) {
  const basic = Number(emp.basicSalary) || 0;
  const isRegular = emp.employmentType === "regular";
  const da = isRegular ? Math.round(basic * 2.57) : 0;
  const hra = isRegular ? Math.round(basic * 0.2) : 0;
  const ta = isRegular ? 1500 : 0;
  const gross = basic + da + hra + ta;
  const pf = Math.round(basic * 0.12);
  const esic = gross <= 21000 ? Math.round(gross * 0.0075) : 0;
  // Professional Tax: based on annual gross salary
  const annualGross = gross * 12;
  let pt = 0;
  if (annualGross >= 400000) pt = 208;
  else if (annualGross >= 300000) pt = 167;
  else if (annualGross >= 225000) pt = 125;
  // Income Tax: new regime slabs
  const annualTaxable = annualGross;
  let annualIT = 0;
  if (annualTaxable > 2400000)
    annualIT = (annualTaxable - 2400000) * 0.3 + 300000;
  else if (annualTaxable > 2000000)
    annualIT = (annualTaxable - 2000000) * 0.25 + 200000;
  else if (annualTaxable > 1600000)
    annualIT = (annualTaxable - 1600000) * 0.2 + 120000;
  else if (annualTaxable > 1200000)
    annualIT = (annualTaxable - 1200000) * 0.15 + 60000;
  else if (annualTaxable > 800000)
    annualIT = (annualTaxable - 800000) * 0.1 + 20000;
  else if (annualTaxable > 400000) annualIT = (annualTaxable - 400000) * 0.05;
  if (annualTaxable <= 700000 && annualIT <= 25000) annualIT = 0;
  const it = Math.round(annualIT / 12);
  const net = gross - pf - esic - pt - it;
  return { basic, da, hra, ta, gross, pf, esic, pt, it, net };
}

function fmt(n: number) {
  return n.toLocaleString("en-IN", { minimumFractionDigits: 2 });
}

export default function ReportsPage() {
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(MONTHS[now.getMonth()]);
  const [selectedYear, setSelectedYear] = useState(String(now.getFullYear()));
  const [selectedInstitute, setSelectedInstitute] = useState("all");
  const [activeCategory, setActiveCategory] = useState("payroll");
  const [generating, setGenerating] = useState<string | null>(null);

  const institutes = getInstitutes();
  const employees = getEmployees();
  const salaries = getSalaries();

  const filteredEmployees = employees.filter(
    (e) => selectedInstitute === "all" || e.institute === selectedInstitute,
  );

  const salaryRows = filteredEmployees.map((emp) => {
    const saved = salaries.find(
      (s) =>
        s.employeeId === emp.employeeId &&
        s.month === selectedMonth &&
        s.year === selectedYear,
    );
    if (saved) return { emp, ...saved };
    const calc = calcSalaryComponents(emp);
    return { emp, ...calc, locked: false };
  });

  const totals = salaryRows.reduce(
    (acc, r) => ({
      gross: acc.gross + (r.gross || 0),
      pf: acc.pf + (r.pf || 0),
      esic: acc.esic + (r.esic || 0),
      pt: acc.pt + (r.pt || 0),
      it: acc.it + (r.it || 0),
      net: acc.net + (r.net || 0),
    }),
    { gross: 0, pf: 0, esic: 0, pt: 0, it: 0, net: 0 },
  );

  async function generatePDF(reportId: string, reportLabel: string) {
    setGenerating(reportId);
    await new Promise((res) => setTimeout(res, 600));

    const printWin = window.open("", "_blank", "width=900,height=700");
    if (!printWin) {
      setGenerating(null);
      return;
    }

    const reportContent = buildReportHTML(reportId, reportLabel);
    printWin.document.write(reportContent);
    printWin.document.close();
    setTimeout(() => {
      printWin.focus();
      printWin.print();
      setGenerating(null);
    }, 800);
  }

  function buildReportHTML(reportId: string, reportLabel: string) {
    const headerRows = salaryRows
      .map(
        (r) => `
        <tr>
          <td>${r.emp.name}</td>
          <td>${r.emp.employeeId}</td>
          <td>${r.emp.designation || "-"}</td>
          <td>${r.emp.employmentType === "regular" ? "Regular" : "Temporary"}</td>
          <td>₹${fmt(r.basic || 0)}</td>
          <td>₹${fmt(r.da || 0)}</td>
          <td>₹${fmt(r.hra || 0)}</td>
          <td>₹${fmt(r.ta || 0)}</td>
          <td>₹${fmt(r.gross || 0)}</td>
          <td>₹${fmt(r.pf || 0)}</td>
          <td>₹${fmt(r.esic || 0)}</td>
          <td>₹${fmt(r.pt || 0)}</td>
          <td>₹${fmt(r.it || 0)}</td>
          <td><strong>₹${fmt(r.net || 0)}</strong></td>
        </tr>`,
      )
      .join("");

    const bankRows = salaryRows
      .map(
        (r) => `
        <tr>
          <td>${r.emp.name}</td>
          <td>${r.emp.employeeId}</td>
          <td>${r.emp.bankAccount || "-"}</td>
          <td>${r.emp.bankName || "-"}</td>
          <td>${r.emp.ifsc || "-"}</td>
          <td><strong>₹${fmt(r.net || 0)}</strong></td>
        </tr>`,
      )
      .join("");

    const pfRows = salaryRows
      .map(
        (r) => `
        <tr>
          <td>${r.emp.name}</td>
          <td>${r.emp.employeeId}</td>
          <td>${r.emp.pfAccount || "-"}</td>
          <td>₹${fmt(r.basic || 0)}</td>
          <td>₹${fmt(r.pf || 0)}</td>
          <td>₹${fmt(r.pf || 0)}</td>
          <td>₹${fmt((r.pf || 0) * 2)}</td>
        </tr>`,
      )
      .join("");

    const esicRows = salaryRows
      .map(
        (r) => `
        <tr>
          <td>${r.emp.name}</td>
          <td>${r.emp.esicNo || "-"}</td>
          <td>₹${fmt(r.gross || 0)}</td>
          <td>₹${fmt(r.esic || 0)}</td>
          <td>₹${fmt(Math.round((r.gross || 0) * 0.0325))}</td>
          <td>₹${fmt(Math.round((r.gross || 0) * 0.04))}</td>
        </tr>`,
      )
      .join("");

    let tableHTML = "";
    let tableHeader = "";

    if (reportId === "bank-statement") {
      tableHeader =
        "<tr><th>Employee Name</th><th>Emp ID</th><th>Account No</th><th>Bank</th><th>IFSC</th><th>Net Amount</th></tr>";
      tableHTML =
        bankRows ||
        `<tr><td colspan="6" style="text-align:center">No data found</td></tr>`;
    } else if (
      reportId === "pf-report" ||
      reportId === "form-3a" ||
      reportId === "form-6a"
    ) {
      tableHeader =
        "<tr><th>Employee Name</th><th>Emp ID</th><th>PF Account</th><th>Basic</th><th>Employee PF (12%)</th><th>Employer PF (12%)</th><th>Total PF</th></tr>";
      tableHTML =
        pfRows ||
        `<tr><td colspan="7" style="text-align:center">No data found</td></tr>`;
    } else if (reportId === "esic-report" || reportId === "esic-challan") {
      tableHeader =
        "<tr><th>Employee Name</th><th>ESIC No</th><th>Gross Wages</th><th>Employee ESIC (0.75%)</th><th>Employer ESIC (3.25%)</th><th>Total ESIC (4%)</th></tr>";
      tableHTML =
        esicRows ||
        `<tr><td colspan="6" style="text-align:center">No data found</td></tr>`;
    } else if (reportId === "form-16a" || reportId === "it-statement") {
      tableHeader =
        "<tr><th>Employee Name</th><th>PAN</th><th>Gross</th><th>Standard Deduction</th><th>Taxable Income</th><th>Income Tax (New Regime)</th></tr>";
      const itRows = salaryRows
        .map(
          (r) => `
        <tr>
          <td>${r.emp.name}</td>
          <td>${r.emp.pan || "-"}</td>
          <td>₹${fmt((r.gross || 0) * 12)}</td>
          <td>₹75,000.00</td>
          <td>₹${fmt(Math.max(0, (r.gross || 0) * 12 - 75000))}</td>
          <td>₹${fmt((r.it || 0) * 12)}</td>
        </tr>`,
        )
        .join("");
      tableHTML =
        itRows ||
        `<tr><td colspan="6" style="text-align:center">No data found</td></tr>`;
    } else if (reportId === "pt-challan") {
      tableHeader =
        "<tr><th>Employee Name</th><th>Emp ID</th><th>Gross Salary</th><th>PT Slab</th><th>PT Amount</th></tr>";
      const ptRows = salaryRows
        .map((r) => {
          const g = r.gross || 0;
          const ag = g * 12;
          const slab =
            ag >= 400000
              ? "₹4,00,000 & above (annual)"
              : ag >= 300000
                ? "₹3,00,000 – ₹3,99,999 (annual)"
                : ag >= 225000
                  ? "₹2,25,000 – ₹2,99,999 (annual)"
                  : "Below ₹2,25,000 (annual)";
          return `<tr><td>${r.emp.name}</td><td>${r.emp.employeeId}</td><td>₹${fmt(g)}</td><td>${slab}</td><td>₹${fmt(r.pt || 0)}</td></tr>`;
        })
        .join("");
      tableHTML =
        ptRows ||
        `<tr><td colspan="5" style="text-align:center">No data found</td></tr>`;
    } else if (reportId === "paybill") {
      // Paybill handled separately below
      tableHeader = "";
      tableHTML = "";
    } else {
      tableHeader =
        "<tr><th>Name</th><th>Emp ID</th><th>Designation</th><th>Type</th><th>Basic</th><th>DA</th><th>HRA</th><th>TA</th><th>Gross</th><th>PF</th><th>ESIC</th><th>PT</th><th>IT</th><th>Net Pay</th></tr>";
      tableHTML =
        headerRows ||
        `<tr><td colspan="14" style="text-align:center">No data found</td></tr>`;
    }

    if (reportId === "paybill") {
      return buildPaybillHTML(selectedMonth, selectedYear, selectedInstitute);
    }

    return `<!DOCTYPE html>
<html><head><title>${reportLabel}</title>
<style>
  body { font-family: Arial, sans-serif; margin: 20px; font-size: 11px; color: #333; }
  h2 { text-align: center; color: #1a365d; margin: 0; font-size: 16px; }
  h3 { text-align: center; color: #4a5568; margin: 4px 0 16px; font-size: 12px; }
  .header { display: flex; align-items: center; justify-content: center; gap: 16px; margin-bottom: 8px; }
  .logo { width: 56px; height: 56px; object-fit: contain; }
  .watermark { position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(-35deg); opacity: 0.06; z-index: 0; }
  .watermark img { width: 400px; }
  table { width: 100%; border-collapse: collapse; margin-top: 12px; }
  th { background: #1a365d; color: white; padding: 6px 8px; text-align: left; font-size: 10px; }
  td { padding: 5px 8px; border-bottom: 1px solid #e2e8f0; }
  tr:nth-child(even) td { background: #f7fafc; }
  .footer { margin-top: 20px; border-top: 1px solid #e2e8f0; padding-top: 8px; font-size: 10px; color: #718096; text-align: center; }
  .totals td { font-weight: bold; background: #ebf8ff !important; }
  @media print { body { margin: 0; } }
</style></head><body>
<div class="watermark"><img src="${LOGO_URL}" alt="" /></div>
<div class="header">
  <img src="${LOGO_URL}" alt="Logo" class="logo" />
  <div style="text-align:center">
    <h2>Yf's Platform — Salary Management System</h2>
    <h3>${reportLabel} | ${selectedInstitute === "all" ? "All Institutes" : selectedInstitute} | ${selectedMonth} ${selectedYear}</h3>
  </div>
</div>
<table>
  <thead>${tableHeader}</thead>
  <tbody>
    ${tableHTML}
    ${reportId === "salary-register" ? `<tr class="totals"><td colspan="8" style="text-align:right">TOTALS →</td><td>₹${fmt(totals.gross)}</td><td>₹${fmt(totals.pf)}</td><td>₹${fmt(totals.esic)}</td><td>₹${fmt(totals.pt)}</td><td>₹${fmt(totals.it)}</td><td>₹${fmt(totals.net)}</td></tr>` : ""}
  </tbody>
</table>
<div class="footer">
  Generated on ${formatToday()} | © 2026 Yf's Platform — Salary Management System | Author: Sachin Patel
</div>
</body></html>`;
  }

  function buildPaybillHTML(
    month: string,
    year: string,
    institute: string,
  ): string {
    const orgName =
      institute === "all"
        ? "Yf's Platform — Salary Management System"
        : institute;
    const monthShort = `${month.substring(0, 3)}-${year.substring(2)}`;

    // Helper: return blank if 0
    const cell = (n: number) =>
      n ? n.toLocaleString("en-IN", { minimumFractionDigits: 2 }) : "";

    const rows = salaryRows.map((r, idx) => {
      // Resolve fields — handle both SalaryProcessingPage saved records and calculated fallback
      const basic = (r as any).basicPay ?? (r as any).basic ?? 0;
      const da = (r as any).da ?? 0;
      const hra = (r as any).hra ?? 0;
      const specialPay = (r as any).specialPay ?? 0;
      const bonus = (r as any).bonus ?? 0;
      const daArrears = (r as any).daArrears ?? 0;
      const conveyance = (r as any).conveyanceAllowance ?? 0;
      const washing = (r as any).washingAllowance ?? 0;
      const ltc = (r as any).ltc ?? 0;
      const festAdv = (r as any).festivalAdvance ?? 0;
      const incentive = (r as any).incentive ?? 0;
      const otherEarnings = (r as any).otherEarnings ?? 0;
      const gross = (r as any).grossEarnings ?? (r as any).gross ?? 0;
      const houseRent = (r as any).houseRent ?? 0;
      const electricity = (r as any).electricityCharges ?? 0;
      const lwf = (r as any).lwf ?? 0;
      const epf = (r as any).epf ?? (r as any).pf ?? 0;
      const vpf = (r as any).vpf ?? 0;
      const lic = (r as any).lic ?? 0;
      const pTax = (r as any).profTax ?? (r as any).pt ?? 0;
      const incomeTax = (r as any).incomeTax ?? (r as any).it ?? 0;
      const festival = (r as any).festival ?? 0;
      const esi = (r as any).esi ?? (r as any).esic ?? 0;
      const security = (r as any).security ?? 0;
      const otherDed = (r as any).otherDeductions ?? 0;
      const totalDed =
        (r as any).totalDeductions ??
        epf +
          esi +
          pTax +
          incomeTax +
          houseRent +
          electricity +
          lwf +
          vpf +
          lic +
          festival +
          security +
          otherDed;
      const net = (r as any).netEarnings ?? (r as any).net ?? 0;

      return `<tr>
        <td class="tc">${idx + 1}</td>
        <td class="tc">${r.emp.employeeId}</td>
        <td class="name-cell"><span class="emp-name">${r.emp.name}</span><br/><span class="emp-desig">${r.emp.designation || ""}</span></td>
        <td class="num">${cell(basic)}</td><td class="num">${cell(specialPay)}</td>
        <td class="num">${cell(da)}</td><td class="num">${cell(hra)}</td>
        <td class="num">${cell(bonus)}</td><td class="num">${cell(daArrears)}</td>
        <td class="num">${cell(conveyance)}</td><td class="num">${cell(washing)}</td>
        <td class="num">${cell(ltc)}</td><td class="num">${cell(festAdv)}</td>
        <td class="num">${cell(incentive)}</td><td class="num">${cell(otherEarnings)}</td>
        <td class="num gross-col">${cell(gross)}</td>
        <td class="num">${cell(houseRent)}</td><td class="num">${cell(electricity)}</td>
        <td class="num">${cell(lwf)}</td><td class="num">${cell(epf)}</td>
        <td class="num">${cell(vpf)}</td><td class="num">${cell(lic)}</td>
        <td class="num">${cell(pTax)}</td><td class="num">${cell(incomeTax)}</td>
        <td class="num">${cell(festival)}</td><td class="num">${cell(esi)}</td>
        <td class="num">${cell(security)}</td><td class="num">${cell(otherDed)}</td>
        <td class="num totalded-col">${cell(totalDed)}</td>
        <td class="num net-col"><strong>${cell(net)}</strong></td>
      </tr>`;
    });

    // Totals
    const T = salaryRows.reduce(
      (acc, r) => {
        const basic = (r as any).basicPay ?? (r as any).basic ?? 0;
        const specialPay = (r as any).specialPay ?? 0;
        const da = (r as any).da ?? 0;
        const hra = (r as any).hra ?? 0;
        const bonus = (r as any).bonus ?? 0;
        const daArrears = (r as any).daArrears ?? 0;
        const conveyance = (r as any).conveyanceAllowance ?? 0;
        const washing = (r as any).washingAllowance ?? 0;
        const ltc = (r as any).ltc ?? 0;
        const festAdv = (r as any).festivalAdvance ?? 0;
        const incentive = (r as any).incentive ?? 0;
        const otherEarnings = (r as any).otherEarnings ?? 0;
        const gross = (r as any).grossEarnings ?? (r as any).gross ?? 0;
        const houseRent = (r as any).houseRent ?? 0;
        const electricity = (r as any).electricityCharges ?? 0;
        const lwf = (r as any).lwf ?? 0;
        const epf = (r as any).epf ?? (r as any).pf ?? 0;
        const vpf = (r as any).vpf ?? 0;
        const lic = (r as any).lic ?? 0;
        const pTax = (r as any).profTax ?? (r as any).pt ?? 0;
        const incomeTax = (r as any).incomeTax ?? (r as any).it ?? 0;
        const festival = (r as any).festival ?? 0;
        const esi = (r as any).esi ?? (r as any).esic ?? 0;
        const security = (r as any).security ?? 0;
        const otherDed = (r as any).otherDeductions ?? 0;
        const totalDed =
          (r as any).totalDeductions ??
          epf +
            esi +
            pTax +
            incomeTax +
            houseRent +
            electricity +
            lwf +
            vpf +
            lic +
            festival +
            security +
            otherDed;
        const net = (r as any).netEarnings ?? (r as any).net ?? 0;
        return {
          basic: acc.basic + basic,
          specialPay: acc.specialPay + specialPay,
          da: acc.da + da,
          hra: acc.hra + hra,
          bonus: acc.bonus + bonus,
          daArrears: acc.daArrears + daArrears,
          conveyance: acc.conveyance + conveyance,
          washing: acc.washing + washing,
          ltc: acc.ltc + ltc,
          festAdv: acc.festAdv + festAdv,
          incentive: acc.incentive + incentive,
          otherEarnings: acc.otherEarnings + otherEarnings,
          gross: acc.gross + gross,
          houseRent: acc.houseRent + houseRent,
          electricity: acc.electricity + electricity,
          lwf: acc.lwf + lwf,
          epf: acc.epf + epf,
          vpf: acc.vpf + vpf,
          lic: acc.lic + lic,
          pTax: acc.pTax + pTax,
          incomeTax: acc.incomeTax + incomeTax,
          festival: acc.festival + festival,
          esi: acc.esi + esi,
          security: acc.security + security,
          otherDed: acc.otherDed + otherDed,
          totalDed: acc.totalDed + totalDed,
          net: acc.net + net,
        };
      },
      {
        basic: 0,
        specialPay: 0,
        da: 0,
        hra: 0,
        bonus: 0,
        daArrears: 0,
        conveyance: 0,
        washing: 0,
        ltc: 0,
        festAdv: 0,
        incentive: 0,
        otherEarnings: 0,
        gross: 0,
        houseRent: 0,
        electricity: 0,
        lwf: 0,
        epf: 0,
        vpf: 0,
        lic: 0,
        pTax: 0,
        incomeTax: 0,
        festival: 0,
        esi: 0,
        security: 0,
        otherDed: 0,
        totalDed: 0,
        net: 0,
      },
    );

    const totalEarnings = T.gross;

    const sumRow = `<tr class="totals-row">
      <td colspan="3" class="total-label">TOTAL</td>
      <td class="num">${cell(T.basic)}</td><td class="num">${cell(T.specialPay)}</td>
      <td class="num">${cell(T.da)}</td><td class="num">${cell(T.hra)}</td>
      <td class="num">${cell(T.bonus)}</td><td class="num">${cell(T.daArrears)}</td>
      <td class="num">${cell(T.conveyance)}</td><td class="num">${cell(T.washing)}</td>
      <td class="num">${cell(T.ltc)}</td><td class="num">${cell(T.festAdv)}</td>
      <td class="num">${cell(T.incentive)}</td><td class="num">${cell(T.otherEarnings)}</td>
      <td class="num gross-col">${cell(T.gross)}</td>
      <td class="num">${cell(T.houseRent)}</td><td class="num">${cell(T.electricity)}</td>
      <td class="num">${cell(T.lwf)}</td><td class="num">${cell(T.epf)}</td>
      <td class="num">${cell(T.vpf)}</td><td class="num">${cell(T.lic)}</td>
      <td class="num">${cell(T.pTax)}</td><td class="num">${cell(T.incomeTax)}</td>
      <td class="num">${cell(T.festival)}</td><td class="num">${cell(T.esi)}</td>
      <td class="num">${cell(T.security)}</td><td class="num">${cell(T.otherDed)}</td>
      <td class="num totalded-col">${cell(T.totalDed)}</td>
      <td class="num net-col"><strong>${cell(T.net)}</strong></td>
    </tr>`;

    const summaryRows = [
      ["Basic Pay", T.basic, "House Rent", T.houseRent],
      ["Special Pay", T.specialPay, "Electricity Charge", T.electricity],
      ["D.A.", T.da, "Labour Welfare Fund", T.lwf],
      ["H.R.A.", T.hra, "E.P.F.", T.epf],
      ["Bonus", T.bonus, "V.P.F.", T.vpf],
      ["D.A. Arrears", T.daArrears, "L.I.C.", T.lic],
      ["Conveyance Allowance", T.conveyance, "P. Tax", T.pTax],
      ["Washing Allowance", T.washing, "Income Tax", T.incomeTax],
      ["LTC Adv./Claim", T.ltc, "Festival Advance", T.festival],
      ["Festival Advance", T.festAdv, "ESI", T.esi],
      ["Incentive", T.incentive, "Security Deposit", T.security],
      ["Other Earnings", T.otherEarnings, "Other Deductions", T.otherDed],
    ]
      .map(
        ([elabel, eamt, dlabel, damt]) =>
          `<tr><td>${elabel}</td><td class="num">${(eamt as number) ? fmt(eamt as number) : ""}</td><td>${dlabel}</td><td class="num">${(damt as number) ? fmt(damt as number) : ""}</td></tr>`,
      )
      .join("");

    return `<!DOCTYPE html>
<html><head><title>Paybill - ${monthShort}</title>
<style>
  @page { size: landscape; margin: 10mm; }
  body { font-family: Arial, sans-serif; margin: 0; font-size: 9px; color: #222; }
  .watermark { position: fixed; top: 50%; left: 50%; transform: translate(-50%,-50%) rotate(-35deg); opacity: 0.05; z-index: 0; pointer-events: none; }
  .watermark img { width: 380px; }
  .page-header { text-align: center; margin-bottom: 8px; }
  .org-name { font-size: 14px; font-weight: bold; color: #1a365d; }
  .pay-title { font-size: 11px; color: #2d3748; margin: 2px 0; }
  .bill-no { position: absolute; top: 10mm; right: 10mm; font-size: 9px; border: 1px solid #aaa; padding: 3px 8px; }
  table.main-table { width: 100%; border-collapse: collapse; font-size: 8.5px; }
  table.main-table th { background: #1a365d; color: #fff; text-align: center; padding: 3px 2px; border: 1px solid #2c5282; font-size: 8px; }
  table.main-table td { padding: 2px 3px; border: 1px solid #cbd5e0; vertical-align: middle; }
  table.main-table tr:nth-child(even) td { background: #f0f4f8; }
  .group-earn { background: #2b6cb0 !important; }
  .group-ded { background: #276749 !important; }
  .tc { text-align: center; }
  .num { text-align: right; white-space: nowrap; }
  .name-cell { min-width: 90px; }
  .emp-name { font-weight: 600; font-size: 8.5px; }
  .emp-desig { font-size: 7.5px; color: #555; }
  .gross-col { background: #bee3f8 !important; font-weight: bold; }
  .totalded-col { background: #c6f6d5 !important; font-weight: bold; }
  .net-col { background: #fefcbf !important; font-weight: bold; }
  .totals-row td { font-weight: bold; background: #ebf8ff !important; border-top: 2px solid #2c5282; }
  .total-label { text-align: right; font-weight: bold; }
  table.summary-table { width: 60%; margin: 12px auto; border-collapse: collapse; font-size: 9px; }
  table.summary-table th { background: #1a365d; color: #fff; padding: 4px 8px; border: 1px solid #2c5282; }
  table.summary-table td { padding: 3px 8px; border: 1px solid #cbd5e0; }
  table.summary-table tr:nth-child(even) td { background: #f7fafc; }
  .summary-total td { font-weight: bold; background: #ebf8ff !important; border-top: 2px solid #2c5282; }
  .grand-total td { font-weight: bold; background: #fefcbf !important; text-align: center; font-size: 10px; }
  .payment-line { margin: 12px 0 8px; font-size: 10px; border: 1px solid #aaa; padding: 6px 10px; border-radius: 4px; }
  .sig-table { width: 100%; margin-top: 20px; border-collapse: collapse; }
  .sig-table td { text-align: center; padding-top: 30px; border-top: 1px solid #555; width: 25%; font-size: 9px; font-weight: 600; color: #2d3748; }
  .footer { margin-top: 10px; border-top: 1px solid #e2e8f0; padding-top: 5px; font-size: 8px; color: #718096; text-align: center; }
  @media print { body { margin: 0; } .no-print { display: none; } }
</style>
</head><body>
<div class="watermark"><img src="${LOGO_URL}" alt="" /></div>
<div class="bill-no">Pay Bill No: …………………</div>
<div class="page-header">
  <div class="org-name">${orgName}</div>
  <div class="pay-title">Pay Bill for the month of: ${monthShort}</div>
  <div style="font-size:9px;color:#555">${institute === "all" ? "All Institutes" : institute}</div>
</div>

<table class="main-table">
  <thead>
    <tr>
      <th rowspan="2" style="width:22px">Sl<br/>No</th>
      <th rowspan="2" style="width:40px">Staff<br/>No</th>
      <th rowspan="2" style="width:90px">Name / Designation</th>
      <th colspan="13" class="group-earn">EARNINGS</th>
      <th colspan="13" class="group-ded">DEDUCTIONS</th>
      <th rowspan="2" class="net-col" style="width:55px">Net<br/>Salary</th>
    </tr>
    <tr>
      <th>Basic<br/>Pay</th><th>Special<br/>Pay</th>
      <th>D. A.</th><th>H R A</th>
      <th>Bonus</th><th>D.A.<br/>Arrears</th>
      <th>Conveyance<br/>Allow.</th><th>Washing<br/>Allow.</th>
      <th>LTC<br/>Adv./Claim</th><th>Festival<br/>Advance</th>
      <th>Incentive</th><th>Other<br/>Earnings</th>
      <th class="gross-col">Gross</th>
      <th>House<br/>Rent</th><th>Electricity<br/>Charge</th>
      <th>LWF</th><th>E.P.F.</th>
      <th>V.P.F.</th><th>L.I.C.</th>
      <th>P. Tax</th><th>Income<br/>Tax</th>
      <th>Festival<br/>Advance</th><th>ESI</th>
      <th>Security<br/>Deposit</th><th>Other<br/>Ded.</th>
      <th class="totalded-col">Total<br/>Deductions</th>
    </tr>
  </thead>
  <tbody>
    ${rows.length ? rows.join("") : `<tr><td colspan="30" style="text-align:center;padding:12px">No employee data found for ${monthShort}</td></tr>`}
    ${sumRow}
  </tbody>
</table>

<table class="summary-table">
  <thead>
    <tr><th>EARNINGS</th><th>AMOUNT</th><th>DEDUCTIONS</th><th>AMOUNT</th></tr>
  </thead>
  <tbody>
    ${summaryRows}
    <tr class="summary-total">
      <td>Total Earnings</td><td class="num">${fmt(totalEarnings)}</td>
      <td>Total Deductions</td><td class="num">${fmt(T.totalDed)}</td>
    </tr>
    <tr class="grand-total">
      <td colspan="2">Gross Salary: ₹${fmt(totalEarnings)}</td>
      <td colspan="2">Net Salary: ₹${fmt(T.net)}</td>
    </tr>
  </tbody>
</table>

<div class="payment-line">
  Payment passed for <strong>Rs. ${fmt(T.net)}/-</strong> (Rupees <strong>${numberToWords(Math.round(T.net))}</strong> Only)
</div>

<table class="sig-table">
  <tr>
    <td>Account Assistant</td>
    <td>Section Officer</td>
    <td>Secretary</td>
    <td>Treasurer</td>
  </tr>
</table>

<div class="footer">
  Generated on ${formatToday()} | © 2026 Yf's Platform — Salary Management System | Author: Sachin Patel
</div>
</body></html>`;
  }

  const _activeCat = REPORT_CATEGORIES.find((c) => c.id === activeCategory)!;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
            <FileBarChart2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-display font-bold">Reports Center</h1>
            <p className="text-sm text-muted-foreground">
              Generate & download statutory and payroll reports
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Select
            value={selectedInstitute}
            onValueChange={setSelectedInstitute}
          >
            <SelectTrigger className="w-40 h-9">
              <Building2 className="w-3.5 h-3.5 mr-1 text-muted-foreground" />
              <SelectValue placeholder="Institute" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Institutes</SelectItem>
              {institutes.map((inst) => (
                <SelectItem key={inst} value={inst}>
                  {inst}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="w-36 h-9">
              <CalendarDays className="w-3.5 h-3.5 mr-1 text-muted-foreground" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {getSessionMonthNames().map((m) => (
                <SelectItem key={m} value={m}>
                  {m}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-24 h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {YEARS.map((y) => (
                <SelectItem key={y} value={y}>
                  {y}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Summary strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          {
            label: "Total Gross",
            value: fmt(totals.gross),
            icon: <BadgeIndianRupee className="w-4 h-4" />,
            color: "text-blue-400",
          },
          {
            label: "Total PF",
            value: fmt(totals.pf),
            icon: <ShieldCheck className="w-4 h-4" />,
            color: "text-green-400",
          },
          {
            label: "Total ESIC",
            value: fmt(totals.esic),
            icon: <Landmark className="w-4 h-4" />,
            color: "text-purple-400",
          },
          {
            label: "Total Net Pay",
            value: fmt(totals.net),
            icon: <Banknote className="w-4 h-4" />,
            color: "text-amber-400",
          },
        ].map((s) => (
          <Card key={s.label} className="card-glass">
            <CardContent className="p-3 flex items-center gap-3">
              <div className={`${s.color}`}>{s.icon}</div>
              <div>
                <p className="text-xs text-muted-foreground">{s.label}</p>
                <p className="font-bold text-sm">₹{s.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Report tabs */}
      <Tabs value={activeCategory} onValueChange={setActiveCategory}>
        <TabsList className="flex flex-wrap gap-1 h-auto bg-card/40 p-1">
          {REPORT_CATEGORIES.map((cat) => (
            <TabsTrigger
              key={cat.id}
              value={cat.id}
              className="flex items-center gap-1.5 text-xs data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-md"
            >
              {cat.icon} {cat.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {REPORT_CATEGORIES.map((cat) => (
          <TabsContent key={cat.id} value={cat.id} className="mt-4">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {cat.reports.map((rep) => (
                <Card
                  key={rep.id}
                  className="card-glass hover:border-primary/40 transition-colors"
                >
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <span className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                        {rep.icon}
                      </span>
                      {rep.label}
                    </CardTitle>
                    <p className="text-xs text-muted-foreground ml-9">
                      {rep.desc}
                    </p>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="text-xs">
                        {filteredEmployees.length} employees
                      </Badge>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-xs gap-1"
                          onClick={() => generatePDF(rep.id, rep.label)}
                          disabled={generating === rep.id}
                        >
                          {generating === rep.id ? (
                            <span className="animate-spin">⏳</span>
                          ) : (
                            <>
                              <Printer className="w-3 h-3" /> Print
                            </>
                          )}
                        </Button>
                        <Button
                          size="sm"
                          className="h-7 text-xs gap-1 gradient-primary"
                          onClick={() => generatePDF(rep.id, rep.label)}
                          disabled={generating === rep.id}
                        >
                          <Download className="w-3 h-3" /> PDF
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>

      {/* Data notice */}
      {salaryRows.length === 0 && (
        <Card className="card-glass border-amber-500/30">
          <CardContent className="p-4 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-amber-400" />
            <p className="text-sm text-muted-foreground">
              No employees found. Add employees and process salaries to generate
              reports.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
