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

const YEARS = ["2024", "2025", "2026"];

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
  basic: number;
  da: number;
  hra: number;
  ta: number;
  gross: number;
  pf: number;
  esic: number;
  pt: number;
  it: number;
  totalDeductions: number;
  net: number;
  employmentType: string;
  locked: boolean;
};

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
  // PT Maharashtra slab
  let pt = 0;
  if (gross > 20000) pt = 200;
  else if (gross > 15000) pt = 150;
  else if (gross > 10000) pt = 100;
  // IT new regime (annual)
  const annualTaxable = gross * 12;
  let annualIT = 0;
  if (annualTaxable > 1500000)
    annualIT = (annualTaxable - 1500000) * 0.3 + 150000;
  else if (annualTaxable > 1200000)
    annualIT = (annualTaxable - 1200000) * 0.2 + 90000;
  else if (annualTaxable > 900000)
    annualIT = (annualTaxable - 900000) * 0.15 + 45000;
  else if (annualTaxable > 600000)
    annualIT = (annualTaxable - 600000) * 0.1 + 15000;
  else if (annualTaxable > 300000) annualIT = (annualTaxable - 300000) * 0.05;
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
          const slab =
            g > 20000
              ? "Above ₹20,000"
              : g > 15000
                ? "₹15,001 – ₹20,000"
                : g > 10000
                  ? "₹10,001 – ₹15,000"
                  : "Up to ₹10,000";
          return `<tr><td>${r.emp.name}</td><td>${r.emp.employeeId}</td><td>₹${fmt(g)}</td><td>${slab}</td><td>₹${fmt(r.pt || 0)}</td></tr>`;
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
    <h2>Yf's Platform — Salary Management System</h2>
    <h3>${reportLabel} | ${selectedInstitute === "all" ? "All Institutes" : selectedInstitute} | ${selectedMonth} ${selectedYear}</h3>
  </div>
</div>
<table>
  <thead>${tableHeader}</thead>
  <tbody>
    ${tableHTML}
    ${reportId === "paybill" || reportId === "salary-register" ? `<tr class="totals"><td colspan="8" style="text-align:right">TOTALS →</td><td>₹${fmt(totals.gross)}</td><td>₹${fmt(totals.pf)}</td><td>₹${fmt(totals.esic)}</td><td>₹${fmt(totals.pt)}</td><td>₹${fmt(totals.it)}</td><td>₹${fmt(totals.net)}</td></tr>` : ""}
  </tbody>
</table>
<div class="footer">
  Generated on ${new Date().toLocaleDateString("en-IN")} | © 2026 Yf's Platform — Salary Management System | Author: Sachin Patel
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
              {MONTHS.map((m) => (
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
              className="flex items-center gap-1.5 text-xs"
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
