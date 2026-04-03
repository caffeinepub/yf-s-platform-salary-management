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

function getCurrentSessionYear() {
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth();
  if (m >= 3) return `${y}-${(y + 1).toString().slice(2)}`;
  return `${y - 1}-${y.toString().slice(2)}`;
}

const SESSION_YEAR_LIST = (() => {
  const now = new Date();
  const currentY = now.getFullYear();
  const currentM = now.getMonth();
  const latestStartYear = currentM >= 3 ? currentY : currentY - 1;
  const result: string[] = [];
  for (let y = latestStartYear; y >= 2004; y--) {
    result.push(`${y}-${(y + 1).toString().slice(2)}`);
  }
  return result;
})();

function getSessionMonthNames(selectedSession?: string): string[] {
  const now = new Date();
  const currentMonthIdx = now.getMonth();
  const currentY = now.getFullYear();
  const currentM = now.getMonth() + 1;
  const currentSession =
    currentM >= 4
      ? `${currentY}-${String(currentY + 1).slice(2)}`
      : `${currentY - 1}-${String(currentY).slice(2)}`;
  const isCurrentSession =
    !selectedSession || selectedSession === currentSession;
  const result: string[] = [];
  if (isCurrentSession) {
    if (currentMonthIdx >= 3) {
      for (let i = 3; i <= currentMonthIdx; i++) result.push(MONTHS[i]);
    } else {
      for (let i = 3; i <= 11; i++) result.push(MONTHS[i]);
      for (let i = 0; i <= currentMonthIdx; i++) result.push(MONTHS[i]);
    }
  } else {
    for (let i = 3; i <= 11; i++) result.push(MONTHS[i]);
    for (let i = 0; i <= 2; i++) result.push(MONTHS[i]);
  }
  return result.reverse();
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
  doj?: string;
  promotionHistory?: Array<{
    date?: string;
    action?: string;
    toInstitute?: string;
    remarks?: string;
    designation?: string;
  }>;
  extra?: {
    designation?: string;
    dob?: string;
    doj?: string;
    bankAccount?: string;
    pfAccount?: string;
    esicNo?: string;
    pan?: string;
    uan?: string;
  };
};

type StoredSalary = {
  employeeId: string;
  month: string;
  year: string;
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
  chequePay?: number;
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
        id: "salary-register",
        label: "Salary Register",
        icon: <ClipboardList className="w-4 h-4" />,
        desc: "Annual per-employee salary register with all components",
      },
      {
        id: "paybill",
        label: "Paybill / Pay Register",
        icon: <FileText className="w-4 h-4" />,
        desc: "Monthly salary summary for all employees",
      },
      {
        id: "bank-statement",
        label: "Bank Statement / ECS",
        icon: <Banknote className="w-4 h-4" />,
        desc: "Bank transfer list for net salary credit",
      },
      {
        id: "consolidated-register",
        label: "Consolidated Register",
        icon: <BookOpen className="w-4 h-4" />,
        desc: "Summary of salary bills — institute-wise consolidated report",
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
        id: "pf-register",
        label: "PF Register",
        icon: <FileBarChart2 className="w-4 h-4" />,
        desc: "Institute-wise PF contribution remittance register",
      },
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

function getEmpExtra(employeeId: string): Record<string, unknown> {
  try {
    return JSON.parse(localStorage.getItem(`empExtra_${employeeId}`) || "{}");
  } catch {
    return {};
  }
}

function getEmployees(): StoredEmployee[] {
  try {
    const emps: StoredEmployee[] = JSON.parse(
      localStorage.getItem("sms_employees") || "[]",
    );
    // Merge extra data (bankName, bankBranch, bankAccountNo, etc.)
    return emps.map((emp) => {
      const extra = getEmpExtra(emp.employeeId);
      return {
        ...emp,
        bankName: (extra.bankName as string) || emp.bankName || "",
        bankAccount:
          (extra.bankAccountNo as string) ||
          (extra.bankAccount as string) ||
          emp.bankAccount ||
          "",
        ifsc: (extra.ifscCode as string) || emp.ifsc || "",
        ...(extra.bankBranch ? { bankBranch: extra.bankBranch as string } : {}),
      };
    });
  } catch {
    return [];
  }
}
function getSalaries(): StoredSalary[] {
  try {
    return JSON.parse(localStorage.getItem("sms_salary") || "[]");
  } catch {
    return [];
  }
}
function getInstitutes(): string[] {
  try {
    const inst = JSON.parse(localStorage.getItem("sms_institutes") || "[]");
    return inst.map(
      (i: { name: string; shortCode?: string }) => i.shortCode || i.name,
    );
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
  const annualGross = gross * 12;
  let pt = 0;
  if (annualGross >= 400000) pt = 208;
  else if (annualGross >= 300000) pt = 167;
  else if (annualGross >= 225000) pt = 125;
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

function fmtCell(n: number): string {
  if (!n) return "";
  return n.toLocaleString("en-IN", { minimumFractionDigits: 2 });
}

function parseDateStr(dateStr: string): Date | null {
  if (!dateStr) return null;
  const m = dateStr.match(/(\d{1,2})-([A-Za-z]{3}),?(\d{4})/);
  if (m) {
    const monthMap: Record<string, number> = {
      jan: 0,
      feb: 1,
      mar: 2,
      apr: 3,
      may: 4,
      jun: 5,
      jul: 6,
      aug: 7,
      sep: 8,
      oct: 9,
      nov: 10,
      dec: 11,
    };
    const mo = monthMap[m[2].toLowerCase()];
    if (mo !== undefined)
      return new Date(Number.parseInt(m[3]), mo, Number.parseInt(m[1]));
  }
  try {
    const d = new Date(dateStr);
    if (!Number.isNaN(d.getTime())) return d;
  } catch {}
  return null;
}

function getSalVal(
  key: string,
  altKey: string | undefined,
  sal: StoredSalary | null,
): number {
  if (!sal) return 0;
  const s = sal as Record<string, unknown>;
  if (typeof s[key] === "number") return s[key] as number;
  if (altKey && typeof s[altKey] === "number") return s[altKey] as number;
  return 0;
}

export default function ReportsPage() {
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(MONTHS[now.getMonth()]);
  const [selectedInstitute, setSelectedInstitute] = useState("all");
  const [selectedSessionYear, setSelectedSessionYear] = useState(
    getCurrentSessionYear(),
  );
  const [activeCategory, setActiveCategory] = useState("payroll");
  const [selectedBank, setSelectedBank] = useState("all");
  const [selectedBranch, setSelectedBranch] = useState("all");
  // Derive calendar year from session and selected month
  const selectedMonthNum = MONTHS.indexOf(selectedMonth) + 1;
  const selectedYear = (() => {
    const startYear = Number.parseInt(selectedSessionYear.split("-")[0], 10);
    return selectedMonthNum >= 4 ? String(startYear) : String(startYear + 1);
  })();
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
    if (reportId === "paybill") {
      return buildPaybillHTML(selectedMonth, selectedYear, selectedInstitute);
    }
    if (reportId === "salary-register") {
      return buildSalaryRegisterHTML(selectedInstitute, selectedSessionYear);
    }
    if (reportId === "pf-register") {
      return buildPFRegisterHTML(
        selectedMonth,
        selectedYear,
        selectedInstitute,
      );
    }

    const headerRows = salaryRows
      .map(
        (r) => `
        <tr>
          <td>${r.emp.name}</td>
          <td>${r.emp.employeeId}</td>
          <td>${r.emp.designation || "-"}</td>
          <td>${r.emp.employmentType === "regular" ? "Regular" : "Temporary"}</td>
          <td>&#8377;${fmt(r.basic || 0)}</td>
          <td>&#8377;${fmt(r.da || 0)}</td>
          <td>&#8377;${fmt(r.hra || 0)}</td>
          <td>&#8377;${fmt(r.ta || 0)}</td>
          <td>&#8377;${fmt(r.gross || 0)}</td>
          <td>&#8377;${fmt(r.pf || 0)}</td>
          <td>&#8377;${fmt(r.esic || 0)}</td>
          <td>&#8377;${fmt(r.pt || 0)}</td>
          <td>&#8377;${fmt(r.it || 0)}</td>
          <td><strong>&#8377;${fmt(r.net || 0)}</strong></td>
        </tr>`,
      )
      .join("");

    const bankFilteredRows =
      selectedBank === "cheque"
        ? salaryRows.filter((r) => (r as any).chequePay === 1)
        : salaryRows.filter((r) => {
            if ((r as any).chequePay === 1) return false;
            if (selectedBank !== "all" && r.emp.bankName !== selectedBank)
              return false;
            if (
              selectedBranch !== "all" &&
              (r.emp as any).bankBranch !== selectedBranch
            )
              return false;
            return true;
          });

    const bankRows = bankFilteredRows
      .map(
        (r) => `
        <tr>
          <td>${r.emp.name}</td>
          <td>${r.emp.employeeId}</td>
          <td>${r.emp.bankAccount || "-"}</td>
          <td>${r.emp.bankName || "-"}</td>
          <td>${r.emp.ifsc || "-"}</td>
          <td><strong>&#8377;${fmt(r.net || 0)}</strong></td>
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
          <td>&#8377;${fmt(r.basic || 0)}</td>
          <td>&#8377;${fmt(r.pf || 0)}</td>
          <td>&#8377;${fmt(r.pf || 0)}</td>
          <td>&#8377;${fmt((r.pf || 0) * 2)}</td>
        </tr>`,
      )
      .join("");

    const esicRows = salaryRows
      .map(
        (r) => `
        <tr>
          <td>${r.emp.name}</td>
          <td>${r.emp.esicNo || "-"}</td>
          <td>&#8377;${fmt(r.gross || 0)}</td>
          <td>&#8377;${fmt(r.esic || 0)}</td>
          <td>&#8377;${fmt(Math.round((r.gross || 0) * 0.0325))}</td>
          <td>&#8377;${fmt(Math.round((r.gross || 0) * 0.04))}</td>
        </tr>`,
      )
      .join("");

    let tableHTML = "";
    let tableHeader = "";

    if (reportId === "consolidated-register") {
      return buildConsolidatedRegisterHTML(
        selectedInstitute,
        selectedMonth,
        String(selectedYear),
      );
    }
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
          <td>&#8377;${fmt((r.gross || 0) * 12)}</td>
          <td>&#8377;75,000.00</td>
          <td>&#8377;${fmt(Math.max(0, (r.gross || 0) * 12 - 75000))}</td>
          <td>&#8377;${fmt((r.it || 0) * 12)}</td>
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
              ? "&#8377;4,00,000 & above (annual)"
              : ag >= 300000
                ? "&#8377;3,00,000 \u2013 &#8377;3,99,999 (annual)"
                : ag >= 225000
                  ? "&#8377;2,25,000 \u2013 &#8377;2,99,999 (annual)"
                  : "Below &#8377;2,25,000 (annual)";
          return `<tr><td>${r.emp.name}</td><td>${r.emp.employeeId}</td><td>&#8377;${fmt(g)}</td><td>${slab}</td><td>&#8377;${fmt(r.pt || 0)}</td></tr>`;
        })
        .join("");
      tableHTML =
        ptRows ||
        `<tr><td colspan="5" style="text-align:center">No data found</td></tr>`;
    } else {
      tableHeader =
        "<tr><th>Name</th><th>Emp ID</th><th>Designation</th><th>Type</th><th>Basic</th><th>DA</th><th>HRA</th><th>TA</th><th>Gross</th><th>PF</th><th>ESIC</th><th>PT</th><th>IT</th><th>Net Pay</th></tr>";
      tableHTML =
        headerRows ||
        `<tr><td colspan="14" style="text-align:center">No data found</td></tr>`;
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
    <h2>Yf's Platform \u2014 Salary Management System</h2>
    <h3>${reportLabel} | ${selectedInstitute === "all" ? "All Institutes" : selectedInstitute} | ${selectedMonth} ${selectedYear}</h3>
  </div>
</div>
<table>
  <thead>${tableHeader}</thead>
  <tbody>
    ${tableHTML}
  </tbody>
</table>
<div class="footer">
  Generated on ${formatToday()} | &#169; 2026 Yf's Platform \u2014 Salary Management System
</div>
</body></html>`;
  }

  // ─── CONSOLIDATED REGISTER ──────────────────────────────────────────────────
  function buildConsolidatedRegisterHTML(
    institute: string,
    month: string,
    year: string,
  ): string {
    const allEmps = getEmployees().filter(
      (e) => institute === "all" || e.institute === institute,
    );
    const allSals = getSalaries();
    const instList: string[] =
      institute === "all"
        ? ([
            ...new Set(allEmps.map((e) => e.institute).filter(Boolean)),
          ] as string[])
        : [institute];
    const cols = [
      "Basic Pay",
      "Special Pay",
      "DA",
      "DA Arrear",
      "HRA",
      "Bonus",
      "Conveyance",
      "Washing",
      "LTC",
      "Festival Adv",
      "Incentive",
      "Other Earn",
      "Gross",
      "House Rent",
      "Electricity",
      "LWF",
      "EPF",
      "VPF",
      "LIC",
      "Prof. Tax",
      "Income Tax",
      "Festival Rec.",
      "ESIC",
      "Security",
      "Other Ded.",
      "Total Ded.",
      "Net Payable",
    ];
    let rows = "";
    let totals: Record<string, number> = {};
    for (const col of cols) totals[col] = 0;
    let sl = 1;
    for (const inst of instList) {
      const emps = allEmps.filter((e) => e.institute === inst);
      const sals = allSals.filter((s: any) => {
        const emp = emps.find(
          (e) =>
            String(e.id) === String(s.employeeId) ||
            e.employeeId === s.employeeId,
        );
        return (
          !!emp &&
          (s.month === month ||
            s.month === String(MONTHS.indexOf(month) + 1)) &&
          String(s.year) === year
        );
      });
      const sum = (key: string) =>
        sals.reduce((a: number, s: any) => a + (Number(s[key]) || 0), 0);
      const r = {
        "Basic Pay": sum("basicPay") || sum("basic"),
        "Special Pay": sum("specialPay"),
        DA: sum("da"),
        "DA Arrear": sum("daArrears"),
        HRA: sum("hra"),
        Bonus: sum("bonus"),
        Conveyance: sum("conveyanceAllowance"),
        Washing: sum("washingAllowance"),
        LTC: sum("ltc"),
        "Festival Adv": sum("festivalAdvance"),
        Incentive: sum("incentive"),
        "Other Earn": sum("otherEarnings"),
        Gross: sum("grossEarnings") || sum("gross"),
        "House Rent": sum("houseRent"),
        Electricity: sum("electricityCharges"),
        LWF: sum("lwf"),
        EPF: sum("epf") || sum("pf"),
        VPF: sum("vpf"),
        LIC: sum("lic"),
        "Prof. Tax": sum("profTax") || sum("pt"),
        "Income Tax": sum("incomeTax") || sum("it"),
        "Festival Rec.": sum("festival"),
        ESIC: sum("esi") || sum("esic"),
        Security: sum("security"),
        "Other Ded.": sum("otherDeductions"),
        "Total Ded.": sum("totalDeductions"),
        "Net Payable": sum("netEarnings") || sum("net"),
      };
      for (const col of cols)
        totals[col] = (totals[col] || 0) + (r[col as keyof typeof r] || 0);
      const fmtN = (n: number) => (n ? n.toLocaleString("en-IN") : "-");
      rows += `<tr><td>${sl++}</td><td>${inst}</td>${cols.map((c) => `<td class="num">${fmtN(r[c as keyof typeof r] || 0)}</td>`).join("")}</tr>`;
    }
    const tRow = `<tr class="total-row"><td colspan="2"><strong>Grand Total</strong></td>${cols.map((c) => `<td class="num"><strong>${(totals[c] || 0).toLocaleString("en-IN")}</strong></td>`).join("")}</tr>`;
    return `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Consolidated Register</title>
    <style>body{font-family:Arial,sans-serif;font-size:10px;margin:20px} h2,h3{text-align:center;margin:4px 0} table{width:100%;border-collapse:collapse;margin-top:12px} th,td{border:1px solid #999;padding:3px 5px;white-space:nowrap} th{background:#e8e8e8;font-size:9px} .num{text-align:right} .total-row{background:#fff3cd;font-weight:bold} @media print{.no-print{display:none}}</style>
    </head><body>
    <h2>${institute === "all" ? "All Institutes" : institute}</h2>
    <h3>Summary of Salary Bills — ${month} ${year}</h3>
    <div style="overflow-x:auto"><table>
    <thead><tr><th>Sl</th><th>Institution</th>${cols.map((c) => `<th>${c}</th>`).join("")}</tr></thead>
    <tbody>${rows}${tRow}</tbody></table></div>
    <div style="margin-top:20px;display:flex;gap:40px;justify-content:flex-end;font-size:11px">
      <span>Prepared by (Acct. Asst.): _______________</span>
      <span>Checked by (S.O.): _______________</span>
      <span>Secretary: _______________</span>
      <span>Treasurer: _______________</span>
    </div>
    </body></html>`;
  }

  // ─── SALARY REGISTER (Annual per-employee format) ───────────────────────────
  function buildSalaryRegisterHTML(
    institute: string,
    sessionYear: string,
  ): string {
    const year1 = Number.parseInt(sessionYear.split("-")[0]);
    const year2 = year1 + 1;

    const SESSION_MONTHS = [
      {
        label: `Apr-${String(year1).slice(2)}`,
        month: "April",
        year: String(year1),
      },
      {
        label: `May-${String(year1).slice(2)}`,
        month: "May",
        year: String(year1),
      },
      {
        label: `Jun-${String(year1).slice(2)}`,
        month: "June",
        year: String(year1),
      },
      {
        label: `Jul-${String(year1).slice(2)}`,
        month: "July",
        year: String(year1),
      },
      {
        label: `Aug-${String(year1).slice(2)}`,
        month: "August",
        year: String(year1),
      },
      {
        label: `Sep-${String(year1).slice(2)}`,
        month: "September",
        year: String(year1),
      },
      {
        label: `Oct-${String(year1).slice(2)}`,
        month: "October",
        year: String(year1),
      },
      {
        label: `Nov-${String(year1).slice(2)}`,
        month: "November",
        year: String(year1),
      },
      {
        label: `Dec-${String(year1).slice(2)}`,
        month: "December",
        year: String(year1),
      },
      {
        label: `Jan-${String(year2).slice(2)}`,
        month: "January",
        year: String(year2),
      },
      {
        label: `Feb-${String(year2).slice(2)}`,
        month: "February",
        year: String(year2),
      },
      {
        label: `Mar-${String(year2).slice(2)}`,
        month: "March",
        year: String(year2),
      },
    ];

    const orgName =
      institute === "all"
        ? "Yf's Platform \u2014 Salary Management"
        : institute;
    const empList = getEmployees().filter(
      (e) => institute === "all" || e.institute === institute,
    );
    const allSalaries = getSalaries();

    // Earnings row definitions: key, altKey, label, isLwp
    const EARNINGS: {
      key: string;
      altKey?: string;
      label: string;
      isLwp?: boolean;
    }[] = [
      { key: "basicPay", altKey: "basic", label: "Basic Pay" },
      { key: "lwp", label: "LWP (Days)", isLwp: true },
      { key: "specialPay", label: "Special Pay" },
      { key: "da", label: "D.A." },
      { key: "hra", label: "H.R.A.@00%" },
      { key: "bonus", label: "Bonus" },
      { key: "daArrears", label: "D.A. Arrears" },
      { key: "conveyanceAllowance", label: "Conveyance Allowance" },
      { key: "washingAllowance", label: "Washing Allowance" },
      { key: "ltc", label: "LTC Adv./Claim" },
      { key: "festivalAdvance", label: "Festival Advance" },
      { key: "incentive", label: "Incentive" },
      { key: "otherEarnings", label: "Other Earnings" },
    ];

    const DEDUCTIONS: { key: string; altKey?: string; label: string }[] = [
      { key: "houseRent", label: "House Rent" },
      { key: "electricityCharges", label: "Electricity Charge" },
      { key: "lwf", label: "Labour Welfare Fund" },
      { key: "epf", altKey: "pf", label: "E.P.F.@12%" },
      { key: "vpf", label: "V.P.F.@00%" },
      { key: "lic", label: "L.I.C." },
      { key: "profTax", altKey: "pt", label: "P. Tax" },
      { key: "incomeTax", altKey: "it", label: "Income Tax" },
      { key: "festival", label: "Festival Advance" },
      { key: "esi", altKey: "esic", label: "ESI@.75%" },
      { key: "security", label: "Security Deposit" },
      { key: "otherDeductions", label: "Other Deductions" },
    ];

    // Total rows for remarks rowspan: earnings(13) + gross(1) + deductions(12) + total ded(1) + net(1) = 28
    const TOTAL_ROW_COUNT = EARNINGS.length + 1 + DEDUCTIONS.length + 1 + 1;

    const empSections = empList.map((emp) => {
      // Build monthly salary map
      const monthlySal: Record<string, StoredSalary | null> = {};
      for (const sm of SESSION_MONTHS) {
        monthlySal[sm.label] =
          allSalaries.find(
            (s) =>
              s.employeeId === emp.employeeId &&
              s.month === sm.month &&
              s.year === sm.year,
          ) || null;
      }

      // Detect status events from promotionHistory
      const eventMonths = new Set<string>();
      const eventText: Record<string, string> = {};
      const ph = emp.promotionHistory || [];
      for (const entry of ph) {
        const d = parseDateStr(entry.date || "");
        if (!d) continue;
        const mIdx = d.getMonth(); // 0-based
        const yr = d.getFullYear();
        const sm = SESSION_MONTHS.find(
          (m) => MONTHS.indexOf(m.month) === mIdx && m.year === String(yr),
        );
        if (sm) {
          eventMonths.add(sm.label);
          const action = (entry.action || "EVENT").toUpperCase();
          let text = action;
          if (entry.toInstitute) text += ` TO ${entry.toInstitute}`;
          text += ` ${sm.label}`;
          eventText[sm.label] = text;
        }
      }

      // Build remarks
      const remarksLines: string[] = [];
      const empAny = emp as StoredEmployee & { extra?: { doj?: string } };
      const dojVal = empAny.doj || empAny.extra?.doj || "";
      if (dojVal) remarksLines.push(`Joined on: ${dojVal}`);
      for (const entry of ph) {
        if (entry.action && entry.date) {
          remarksLines.push(`${entry.action}: ${entry.date}`);
        }
        if (entry.remarks) remarksLines.push(entry.remarks);
      }
      const remarksHtml = remarksLines.length
        ? remarksLines.join("<br>")
        : "&mdash;";

      // Track which event months have had their spanning cell added
      const eventCellsAdded = new Set<string>();

      // Build a data row for the salary table
      function buildDataRow(
        key: string,
        altKey: string | undefined,
        label: string,
        isLwp: boolean,
        isFirstRow: boolean,
        applyEventSpan: boolean,
        rowStyle: string,
        labelStyle: string,
      ): string {
        let cells = "";
        let rowTotal = 0;

        for (const sm of SESSION_MONTHS) {
          const ml = sm.label;
          const sal = monthlySal[ml];

          if (applyEventSpan && eventMonths.has(ml)) {
            if (!eventCellsAdded.has(ml)) {
              // First row encountering this event month — add spanning cell
              cells += `<td colspan="2" rowspan="${EARNINGS.length}" style="writing-mode:vertical-lr;transform:rotate(180deg);text-align:center;vertical-align:middle;background:#fed7d7;color:#c53030;font-weight:bold;font-size:6.5px;padding:2px;border:1px solid #fca5a5;line-height:1.2">${eventText[ml]}</td>`;
              eventCellsAdded.add(ml);
            }
            // else: skip — covered by rowspan
          } else {
            if (isLwp) {
              // LWP row: show lwp days + computed deduction below
              const lwpDays = sal ? sal.lwp || 0 : 0;
              const basicVal = sal ? getSalVal("basicPay", "basic", sal) : 0;
              const lwpDed =
                lwpDays > 0 ? Math.round((basicVal * lwpDays) / 30) : 0;
              rowTotal += lwpDed;
              cells += `<td class="num" style="font-size:6.5px">${lwpDed ? `(${fmtCell(lwpDed)})` : ""}<br><span style="font-size:5.5px;color:#666">${lwpDays > 0 ? `${lwpDays}d` : ""}</span></td><td class="tc">-</td>`;
            } else {
              const val = getSalVal(key, altKey, sal);
              rowTotal += val;
              cells += `<td class="num">${fmtCell(val)}</td><td class="tc">00</td>`;
            }
          }
        }

        cells += `<td class="num" style="${rowStyle}">${isLwp ? (rowTotal ? `(${fmtCell(rowTotal)})` : "") : fmtCell(rowTotal)}</td>`;

        if (isFirstRow) {
          cells += `<td rowspan="${TOTAL_ROW_COUNT}" class="remarks">${remarksHtml}</td>`;
        }

        return `<tr><td class="particular" style="${labelStyle}">${label}</td>${cells}</tr>`;
      }

      // Build a summary row (GROSS EARNING / TOTAL DEDUCTION / NET PAYABLE)
      function buildSummaryRow(
        key: string,
        altKey: string | undefined,
        label: string,
        bg: string,
      ): string {
        let cells = "";
        let total = 0;
        for (const sm of SESSION_MONTHS) {
          const val = getSalVal(key, altKey, monthlySal[sm.label]);
          total += val;
          cells += `<td class="num" style="font-weight:bold;background:${bg}">${fmtCell(val)}</td><td class="tc" style="background:${bg}">00</td>`;
        }
        cells += `<td class="num" style="font-weight:bold;background:${bg}">${fmtCell(total)}</td>`;
        return `<tr><td class="particular" style="font-weight:bold;background:${bg}">${label}</td>${cells}</tr>`;
      }

      // ── Build all rows ──
      let rowsHtml = "";

      // Earnings rows (with event spanning)
      for (let idx = 0; idx < EARNINGS.length; idx++) {
        const row = EARNINGS[idx];
        rowsHtml += buildDataRow(
          row.key,
          row.altKey,
          row.label,
          row.isLwp || false,
          idx === 0, // addRemarks on first row
          true, // applyEventSpan
          "",
          "",
        );
      }

      // GROSS EARNING
      rowsHtml += buildSummaryRow(
        "grossEarnings",
        "gross",
        "GROSS EARNING",
        "#c6f6d5",
      );

      // Deductions rows (no event spanning)
      for (const row of DEDUCTIONS) {
        rowsHtml += buildDataRow(
          row.key,
          row.altKey,
          row.label,
          false,
          false,
          false, // no event span
          "",
          "",
        );
      }

      // TOTAL DEDUCTION
      rowsHtml += buildSummaryRow(
        "totalDeductions",
        undefined,
        "TOTAL DEDUCTION",
        "#fefcbf",
      );

      // NET PAYABLE
      rowsHtml += buildSummaryRow(
        "netEarnings",
        "net",
        "NET PAYABLE",
        "#bee3f8",
      );

      // Employee header info
      const designation =
        (emp as any).extra?.designation || emp.designation || "-";
      const bankAcc = emp.bankAccount || (emp as any).extra?.bankAccount || "-";
      const pfAcc = emp.pfAccount || (emp as any).extra?.pfAccount || "-";
      const esicNo = emp.esicNo || (emp as any).extra?.esicNo || "-";

      // Month header row
      const monthHeaders = SESSION_MONTHS.map((sm) => {
        const hasEvent = eventMonths.has(sm.label);
        return `<th colspan="2" style="${hasEvent ? "background:#c53030;" : ""}">${sm.label}</th>`;
      }).join("");

      const monthSubHeaders = SESSION_MONTHS.map(
        () => "<th>Rs.</th><th>P.</th>",
      ).join("");

      return `
<div class="emp-section">
  <table class="header-table">
    <tr>
      <td class="emp-info-cell">
        <strong>${emp.name}</strong><br>
        Staff No: ${emp.employeeId}&nbsp;&nbsp;|&nbsp;&nbsp;Inst: ${emp.institute || "-"}<br>
        Designation: ${designation}<br>
        Scale of Pay: ${emp.basicSalary ? `Rs. ${emp.basicSalary}/-` : "-"}<br>
        D.O.J.: ${dojVal || "-"}
      </td>
      <td class="title-cell">
        <div class="org-name">${orgName}</div>
        <div class="pay-year">PAY FOR THE YEAR ${sessionYear}</div>
      </td>
      <td class="bank-info-cell">
        Bank A/c No: ${bankAcc}<br>
        PF A/c No: ${pfAcc}<br>
        ESIC No: ${esicNo}<br>
        PAN: ${emp.pan || (emp as any).extra?.pan || "-"}
      </td>
    </tr>
  </table>

  <div style="overflow-x:auto">
  <table class="salary-table">
    <thead>
      <tr>
        <th rowspan="2" class="particular-header">PARTICULARS</th>
        ${monthHeaders}
        <th rowspan="2" style="min-width:55px">TOTAL<br>Rs.</th>
        <th rowspan="2" style="min-width:90px">Remarks</th>
      </tr>
      <tr>${monthSubHeaders}</tr>
    </thead>
    <tbody>
      ${rowsHtml}
    </tbody>
  </table>
  </div>

  <table class="sig-table">
    <tr>
      <td>Prepared by</td>
      <td>Account Assistant</td>
      <td>Section Officer</td>
      <td>Secretary / Treasurer</td>
    </tr>
  </table>
</div>`;
    });

    return `<!DOCTYPE html>
<html><head><title>Salary Register ${sessionYear}</title>
<style>
  @page { size: landscape; margin: 8mm; }
  body { font-family: Arial, sans-serif; margin: 0; font-size: 8px; color: #222; }
  .watermark { position: fixed; top: 50%; left: 50%; transform: translate(-50%,-50%) rotate(-35deg); opacity: 0.04; z-index: 0; pointer-events: none; }
  .watermark img { width: 300px; }
  .emp-section { page-break-after: always; margin-bottom: 16px; }

  /* Header table */
  .header-table { width: 100%; border-collapse: collapse; margin-bottom: 3px; border: 1px solid #aaa; font-size: 8px; }
  .header-table td { padding: 4px 6px; vertical-align: top; }
  .emp-info-cell { width: 33%; border-right: 1px solid #aaa; }
  .title-cell { width: 34%; text-align: center; padding: 6px; }
  .bank-info-cell { width: 33%; border-left: 1px solid #aaa; }
  .org-name { font-size: 11px; font-weight: bold; color: #1a365d; }
  .pay-year { font-size: 9px; color: #2d3748; margin-top: 3px; font-weight: 600; }

  /* Salary table */
  .salary-table { width: 100%; border-collapse: collapse; font-size: 7px; }
  .salary-table thead th { background: #1a365d; color: #fff; text-align: center; padding: 2px 1px; border: 1px solid #2c5282; font-size: 6.5px; }
  .salary-table tbody td { padding: 1px 2px; border: 1px solid #e2e8f0; vertical-align: middle; }
  .salary-table tbody tr:nth-child(even) td:not([rowspan]) { background: #f7fafc; }
  .particular { min-width: 90px; font-size: 7px; padding: 1px 3px; white-space: nowrap; }
  .particular-header { min-width: 95px; }
  .num { text-align: right; font-size: 7px; white-space: nowrap; min-width: 38px; }
  .tc { text-align: center; font-size: 7px; width: 12px; color: #888; }
  .remarks { vertical-align: top; font-size: 6.5px; min-width: 85px; padding: 2px 3px; line-height: 1.4; }

  /* Signature */
  .sig-table { width: 100%; margin-top: 10px; border-collapse: collapse; }
  .sig-table td { text-align: center; padding-top: 20px; border-top: 1px solid #555; width: 25%; font-size: 8px; font-weight: 600; color: #2d3748; }

  /* Footer */
  .footer { margin-top: 8px; font-size: 7px; color: #888; text-align: center; border-top: 1px solid #ddd; padding-top: 4px; }

  @media print { body { margin: 0; } .no-print { display: none; } }
</style>
</head><body>
<div class="watermark"><img src="${LOGO_URL}" alt="" /></div>
${empSections.length ? empSections.join("\n") : `<p style="text-align:center;padding:40px;font-size:14px">No employees found for ${institute === "all" ? "All Institutes" : institute} in ${sessionYear}</p>`}
<div class="footer">
  Generated on ${formatToday()} | &copy; ${new Date().getFullYear()} Yf's Platform \u2014 Salary Management System
</div>
</body></html>`;
  }
  // ────────────────────────────────────────────────────────────────────────────

  // ─── PF REGISTER (Institute-wise remittance) ────────────────────────────────
  function buildPFRegisterHTML(
    month: string,
    year: string,
    institute: string,
  ): string {
    const allEmps = getEmployees();
    const allSalaries = getSalaries();
    const allInstitutes = getInstitutes();

    // Build institute list to show
    const instList = institute === "all" ? allInstitutes : [institute];

    type InstRow = {
      name: string;
      displayName: string;
      salary: number;
      empContrib: number;
      emplrContrib: number;
      pension: number;
      vpf: number;
      adminCharges: number;
      total: number;
    };

    const allInstData: { name: string; shortCode: string }[] = (() => {
      try {
        const raw = JSON.parse(localStorage.getItem("sms_institutes") || "[]");
        return raw;
      } catch {
        return [];
      }
    })();

    const rows: InstRow[] = instList.map((inst) => {
      const instData = allInstData.find((i) => i.name === inst);
      const displayName = instData?.shortCode || inst;
      const emps = allEmps.filter((e) => e.institute === inst);
      let salary = 0;
      let empContrib = 0;
      let emplrContrib = 0;
      let pension = 0;
      let vpf = 0;
      for (const emp of emps) {
        const saved = allSalaries.find(
          (s) =>
            s.employeeId === emp.employeeId &&
            s.month === month &&
            s.year === year,
        );
        const basic = saved
          ? Number(saved.basic) || 0
          : Number(emp.basicSalary) || 0;
        const da = saved
          ? Number(saved.da) || 0
          : emp.employmentType === "regular"
            ? Math.round(basic * 2.57)
            : 0;
        const sp = saved ? Number((saved as any).specialPay) || 0 : 0;
        const daArr = saved ? Number((saved as any).daArrears) || 0 : 0;
        const salAmt = basic + sp + da + daArr;
        salary += salAmt;
        // Employee PF @12%
        const ePF = Math.round(basic * 0.12);
        empContrib += ePF;
        // Employer: pension @8.33% of basic, employer diff @3.67%
        const pen = Math.round(basic * 0.0833);
        const emplr = Math.round(basic * 0.0367);
        pension += pen;
        emplrContrib += emplr;
        // VPF from saved data
        vpf += saved ? Number((saved as any).vpf) || 0 : 0;
      }
      const adminCharges = Math.round(salary * 0.005);
      const total = empContrib + emplrContrib + pension + vpf + adminCharges;
      return {
        name: inst,
        displayName,
        salary,
        empContrib,
        emplrContrib,
        pension,
        vpf,
        adminCharges,
        total,
      };
    });

    const T = rows.reduce(
      (a, r) => ({
        name: "TOTAL",
        salary: a.salary + r.salary,
        empContrib: a.empContrib + r.empContrib,
        emplrContrib: a.emplrContrib + r.emplrContrib,
        pension: a.pension + r.pension,
        vpf: a.vpf + r.vpf,
        adminCharges: a.adminCharges + r.adminCharges,
        total: a.total + r.total,
      }),
      {
        name: "",
        salary: 0,
        empContrib: 0,
        emplrContrib: 0,
        pension: 0,
        vpf: 0,
        adminCharges: 0,
        total: 0,
      },
    );

    // A/c No. breakdown: 01 = emp+emplr+pension, 02 = admin, 10 = pension
    const acct01 = T.empContrib + T.emplrContrib;
    const acct02 = T.adminCharges;
    const acct10 = T.pension;

    function fmtPaise(n: number) {
      const rupees = Math.floor(n).toLocaleString("en-IN");
      return `<td class="num">${rupees}</td><td class="paise">00</td>`;
    }

    const rowsHTML = rows
      .map(
        (r, i) => `<tr>
          <td class="sl">${i + 1}</td>
          <td class="name">${r.displayName}</td>
          ${fmtPaise(r.salary)}
          ${fmtPaise(r.empContrib)}
          ${fmtPaise(r.emplrContrib)}
          ${fmtPaise(r.pension)}
          ${r.vpf ? fmtPaise(r.vpf) : '<td class="num"></td><td class="paise"></td>'}
          ${fmtPaise(r.adminCharges)}
          <td class="num total-col" style="color:#c00;">${Math.floor(r.total).toLocaleString("en-IN")}</td><td class="paise" style="color:#c00;">00</td>
          <td></td>
        </tr>`,
      )
      .join("");

    const orgName = institute === "all" ? "All Institutes" : institute;
    const monthYear = `${month.substring(0, 3)}-${year.slice(2)}`;

    // Amount in words (basic)
    function numToWords(n: number): string {
      if (n === 0) return "Zero";
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
      function convert(num: number): string {
        if (num < 20) return ones[num];
        if (num < 100)
          return (
            tens[Math.floor(num / 10)] + (num % 10 ? ` ${ones[num % 10]}` : "")
          );
        if (num < 1000)
          return `${ones[Math.floor(num / 100)]} Hundred${num % 100 ? ` ${convert(num % 100)}` : ""}`;
        if (num < 100000)
          return `${convert(Math.floor(num / 1000))} Thousand${num % 1000 ? ` ${convert(num % 1000)}` : ""}`;
        if (num < 10000000)
          return `${convert(Math.floor(num / 100000))} Lakh${num % 100000 ? ` ${convert(num % 100000)}` : ""}`;
        return `${convert(Math.floor(num / 10000000))} Crore${num % 10000000 ? ` ${convert(num % 10000000)}` : ""}`;
      }
      return convert(Math.floor(n));
    }

    const amtWords = numToWords(T.total);

    return `<!DOCTYPE html><html><head><meta charset="UTF-8">
<title>PF Register - ${monthYear}</title>
<style>
  body { font-family: Arial, sans-serif; font-size: 11px; margin: 0; padding: 20px; }
  h2 { text-align: center; font-size: 18px; font-weight: bold; margin: 0 0 4px; }
  h3 { text-align: center; font-size: 12px; font-weight: normal; margin: 0 0 4px; }
  .title-line { text-align: center; font-size: 13px; font-weight: bold; margin: 12px 0 8px; }
  .month-red { color: #c00; font-size: 15px; font-weight: bold; }
  table.main { border-collapse: collapse; width: 100%; margin-top: 6px; }
  table.main th, table.main td { border: 1px solid #222; padding: 3px 5px; }
  table.main th { text-align: center; font-size: 10px; background: #f5f5f5; }
  td.sl { text-align: center; }
  td.name { }
  td.num { text-align: right; border-right: none !important; padding-right: 2px; }
  td.paise { text-align: left; border-left: none !important; padding-left: 2px; min-width: 18px; }
  td.total-col { text-align: right; border-right: none !important; font-weight: bold; }
  tr.total-row td { font-weight: bold; color: #c00; border-top: 2px solid #222; }
  .bottom { display: flex; margin-top: 16px; gap: 20px; align-items: flex-start; }
  table.acct { border-collapse: collapse; min-width: 200px; }
  table.acct th, table.acct td { border: 1px solid #222; padding: 3px 8px; font-size: 11px; }
  table.acct td.num { text-align: right; border-right: none !important; }
  table.acct td.paise { border-left: none !important; }
  table.acct tr.total-row td { font-weight: bold; color: #c00; }
  .remittance-text { flex: 1; font-size: 11px; line-height: 1.5; }
  .signatures { display: flex; gap: 32px; margin-top: 40px; }
  .sig-item { text-align: center; font-size: 11px; }
  @media print { body { padding: 10px; } }
</style>
</head><body>
<h2>${orgName}</h2>
<h3>BHOPAL (M.P)</h3>
<div class="title-line">Remittence of PF Contribution For the Month of &nbsp;<span class="month-red">${monthYear}</span></div>

<table class="main">
  <thead>
    <tr>
      <th rowspan="2">Sl<br>No.</th>
      <th rowspan="2">Name of the<br>Institution</th>
      <th colspan="2">Salary<br>(basic+sp+da+daarr.)</th>
      <th colspan="2">Employee Contribution<br>@12%</th>
      <th colspan="2">Employer Contribution<br>@3.67%</th>
      <th colspan="2">Pension<br>Contribution @8.33%</th>
      <th colspan="2">Voluntary Contribution</th>
      <th colspan="2">Admin Charges @0.5%</th>
      <th colspan="2">Total</th>
      <th rowspan="2">Remarks</th>
    </tr>
    <tr>
      ${Array(7).fill("<th>Rs.</th><th>P.</th>").join("")}
    </tr>
  </thead>
  <tbody>
    ${rowsHTML}
  </tbody>
  <tfoot>
    <tr class="total-row">
      <td></td>
      <td></td>
      ${fmtPaise(T.salary)}
      ${fmtPaise(T.empContrib)}
      ${fmtPaise(T.emplrContrib)}
      ${fmtPaise(T.pension)}
      ${T.vpf ? fmtPaise(T.vpf) : '<td class="num"></td><td class="paise"></td>'}
      ${fmtPaise(T.adminCharges)}
      <td class="num total-col" style="color:#c00;">${Math.floor(T.total).toLocaleString("en-IN")}</td><td class="paise" style="color:#c00;">00</td>
      <td></td>
    </tr>
  </tfoot>
</table>

<div class="bottom">
  <div>
    <table class="acct">
      <thead><tr><th>A/c No.</th><th colspan="2">Amount</th></tr></thead>
      <tbody>
        <tr><td>01</td>${fmtPaise(acct01)}</tr>
        <tr><td>02</td>${fmtPaise(acct02)}</tr>
        <tr><td>10</td>${fmtPaise(acct10)}</tr>
        <tr class="total-row"><td></td><td class="num">${Math.floor(T.total).toLocaleString("en-IN")}</td><td class="paise">00</td></tr>
      </tbody>
    </table>
  </div>
  <div class="remittance-text">
    Remittence of PF amount of Rs. ${Math.floor(T.total).toLocaleString("en-IN")}/- (Rupees ${amtWords} Only) for the month
    of ${monthYear} to RPFC Bhopal then submitted challen
  </div>
</div>

<div class="signatures">
  <div class="sig-item"><div style="margin-bottom:30px">&nbsp;</div>(prepared by)<br>Account Assistant</div>
  <div class="sig-item"><div style="margin-bottom:30px">&nbsp;</div>(checked by)<br>Section Officer</div>
  <div class="sig-item"><div style="margin-bottom:30px">&nbsp;</div>&nbsp;<br>Secretary</div>
  <div class="sig-item"><div style="margin-bottom:30px">&nbsp;</div>&nbsp;<br>Treasurer</div>
</div>
</body></html>`;
  }
  // ────────────────────────────────────────────────────────────────────────────

  function buildPaybillHTML(
    month: string,
    year: string,
    institute: string,
  ): string {
    const orgName =
      institute === "all"
        ? "Yf's Platform \u2014 Salary Management System"
        : institute;
    const monthShort = `${month.substring(0, 3)}-${year.substring(2)}`;

    const cell = (n: number) =>
      n ? n.toLocaleString("en-IN", { minimumFractionDigits: 2 }) : "";

    const rows = salaryRows.map((r, idx) => {
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
<div class="bill-no">Pay Bill No: &hellip;&hellip;&hellip;&hellip;&hellip;&hellip;</div>
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
      <td>Total Earnings</td><td class="num">${fmt(T.gross)}</td>
      <td>Total Deductions</td><td class="num">${fmt(T.totalDed)}</td>
    </tr>
    <tr class="grand-total">
      <td colspan="2">Gross Salary: &#8377;${fmt(T.gross)}</td>
      <td colspan="2">Net Salary: &#8377;${fmt(T.net)}</td>
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
  Generated on ${formatToday()} | &copy; 2026 Yf's Platform \u2014 Salary Management System
</div>
</body></html>`;
  }

  const _activeCat = REPORT_CATEGORIES.find((c) => c.id === activeCategory)!;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center glow-primary">
            <FileBarChart2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-display font-bold text-gradient">
              Reports Center
            </h1>
            <p className="text-sm text-muted-foreground">
              Generate &amp; download statutory and payroll reports
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
            <SelectContent className="max-h-[250px] overflow-y-auto">
              <SelectItem value="all">All Institutes</SelectItem>
              {institutes.map((inst) => (
                <SelectItem key={inst} value={inst}>
                  {inst}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="w-32 h-9">
              <CalendarDays className="w-3.5 h-3.5 mr-1 text-muted-foreground" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="max-h-[250px] overflow-y-auto">
              {getSessionMonthNames(selectedSessionYear).map((m) => (
                <SelectItem key={m} value={m}>
                  {m.slice(0, 3)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={selectedSessionYear}
            onValueChange={setSelectedSessionYear}
          >
            <SelectTrigger className="w-28 h-9">
              <SelectValue placeholder="Session" />
            </SelectTrigger>
            <SelectContent className="max-h-[250px] overflow-y-auto">
              {SESSION_YEAR_LIST.map((y) => (
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
                <p className="font-bold text-sm">&#8377;{s.value}</p>
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
                      {rep.id === "salary-register" && (
                        <span className="ml-auto text-[10px] text-muted-foreground font-normal bg-muted px-1.5 py-0.5 rounded">
                          {selectedSessionYear}
                        </span>
                      )}
                    </CardTitle>
                    <p className="text-xs text-muted-foreground ml-9">
                      {rep.desc}
                    </p>
                  </CardHeader>
                  <CardContent className="pt-0">
                    {rep.id === "bank-statement" && (
                      <div className="flex gap-2 mb-2">
                        <Select
                          value={selectedBank}
                          onValueChange={setSelectedBank}
                        >
                          <SelectTrigger className="h-7 text-xs flex-1">
                            <SelectValue placeholder="Bank" />
                          </SelectTrigger>
                          <SelectContent className="max-h-[200px] overflow-y-auto">
                            <SelectItem value="all">All Banks</SelectItem>
                            <SelectItem value="cheque">
                              Cheque Payment
                            </SelectItem>
                            {[
                              ...new Set(
                                employees
                                  .map((e) => e.bankName)
                                  .filter(Boolean),
                              ),
                            ].map((b) => (
                              <SelectItem key={b as string} value={b as string}>
                                {b as string}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Select
                          value={selectedBranch}
                          onValueChange={setSelectedBranch}
                        >
                          <SelectTrigger className="h-7 text-xs flex-1">
                            <SelectValue placeholder="Branch" />
                          </SelectTrigger>
                          <SelectContent className="max-h-[200px] overflow-y-auto">
                            <SelectItem value="all">All Branches</SelectItem>
                            {[
                              ...new Set(
                                employees
                                  .map((e) => (e as any).bankBranch)
                                  .filter(Boolean),
                              ),
                            ].map((b) => (
                              <SelectItem key={b as string} value={b as string}>
                                {b as string}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
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
                            <span className="animate-spin">&#8987;</span>
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
