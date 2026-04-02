import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Banknote,
  Download,
  FileText,
  Printer,
  TrendingDown,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { getCurrentSession, getSessionList } from "../utils/sessionUtils";

const _MONTHS = [
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

function getEmployees(): any[] {
  try {
    return JSON.parse(localStorage.getItem("sms_employees") || "[]");
  } catch {
    return [];
  }
}
function getSalaries(): any[] {
  try {
    return JSON.parse(localStorage.getItem("sms_salary") || "[]");
  } catch {
    return [];
  }
}
function getEmpExtra(employeeId: string): any {
  try {
    return JSON.parse(localStorage.getItem(`empExtra_${employeeId}`) || "{}");
  } catch {
    return {};
  }
}
function getInstitutes(): any[] {
  try {
    return JSON.parse(localStorage.getItem("sms_institutes") || "[]");
  } catch {
    return [];
  }
}

function fmt(n: number | undefined) {
  return `₹${Number(n || 0).toLocaleString("en-IN")}`;
}

function PayslipPrint({
  salary,
  emp,
  extra,
}: { salary: any; emp: any; extra: any }) {
  const institutes = getInstitutes();
  const instituteName =
    institutes.find(
      (i: any) =>
        String(i.id) === String(emp.instituteId) || i.name === emp.institute,
    )?.name ||
    extra.institute ||
    "—";

  const earningsRows = [
    ["Basic Pay", salary.basicPay ?? salary.basic ?? 0],
    ["DA", salary.da ?? 0],
    ["HRA", salary.hra ?? 0],
    ["TA", salary.ta ?? 0],
    ["Special Pay", salary.specialPay ?? 0],
    ["DA Arrears", salary.daArrears ?? 0],
    ["Conveyance Allowance", salary.conveyanceAllowance ?? 0],
    ["Washing Allowance", salary.washingAllowance ?? 0],
    ["LTC", salary.ltc ?? 0],
    ["Festival Advance", salary.festivalAdvance ?? 0],
    ["Incentive", salary.incentive ?? 0],
    ["Bonus", salary.bonus ?? 0],
    ["Other Earnings", salary.otherEarnings ?? 0],
  ].filter(([, v]) => Number(v) > 0);

  const deductionsRows = [
    ["EPF (12%)", salary.epf ?? salary.pf ?? 0],
    ["ESI (0.75%)", salary.esi ?? salary.esic ?? 0],
    ["Professional Tax", salary.profTax ?? salary.pt ?? 0],
    ["Income Tax", salary.incomeTax ?? salary.it ?? 0],
    ["House Rent", salary.houseRent ?? 0],
    ["Electricity Charges", salary.electricityCharges ?? 0],
    ["LWF", salary.lwf ?? 0],
    ["VPF", salary.vpf ?? 0],
    ["LIC", salary.lic ?? 0],
    ["Festival", salary.festival ?? 0],
    ["Security", salary.security ?? 0],
    ["Other Deductions", salary.otherDeductions ?? 0],
  ].filter(([, v]) => Number(v) > 0);

  return (
    <div id="payslip-print" className="p-6 bg-white text-gray-800 text-sm">
      {/* Header */}
      <div className="border-2 border-gray-300 rounded-lg overflow-hidden">
        <div className="bg-gradient-to-r from-blue-700 to-purple-700 text-white p-4 text-center relative">
          <div className="absolute inset-0 flex items-center justify-center opacity-10">
            <span className="text-6xl font-black tracking-widest">YF</span>
          </div>
          <p className="text-xs opacity-80">{instituteName}</p>
          <h2 className="text-lg font-bold">
            Yf&apos;s Platform — Salary Management System
          </h2>
          <p className="text-xs opacity-80 mt-1">
            Salary Slip — {salary.month} {salary.year}
          </p>
        </div>

        {/* Employee info */}
        <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 border-b border-gray-200">
          <div className="space-y-1">
            <p>
              <strong>Name:</strong> {emp.name}
            </p>
            <p>
              <strong>Employee ID:</strong> {emp.employeeId}
            </p>
            <p>
              <strong>Designation:</strong>{" "}
              {extra.designation || emp.designation || "—"}
            </p>
            <p>
              <strong>Department:</strong>{" "}
              {extra.department || emp.department || "—"}
            </p>
          </div>
          <div className="space-y-1">
            <p>
              <strong>Institute:</strong> {instituteName}
            </p>
            <p>
              <strong>Bank A/C:</strong>{" "}
              {extra.bankAccountNo || extra.bankAccount || "—"}
            </p>
            <p>
              <strong>PAN:</strong> {extra.panNo || extra.panNumber || "—"}
            </p>
            <p>
              <strong>PF No:</strong> {extra.pfNumber || extra.pfAccount || "—"}
            </p>
          </div>
        </div>

        {/* Earnings & Deductions */}
        <div className="grid grid-cols-2 gap-0 border-b border-gray-200">
          <div className="border-r border-gray-200">
            <div className="bg-green-50 p-2 font-bold text-green-800 text-xs uppercase border-b border-gray-200">
              Earnings
            </div>
            {earningsRows.map(([label, value]) => (
              <div
                key={String(label)}
                className="flex justify-between px-3 py-1.5 border-b border-gray-100 text-xs"
              >
                <span>{label}</span>
                <span className="font-medium">{fmt(Number(value))}</span>
              </div>
            ))}
            <div className="flex justify-between px-3 py-2 bg-green-50 font-bold text-xs">
              <span>Gross Earnings</span>
              <span>{fmt(salary.grossEarnings ?? salary.gross ?? 0)}</span>
            </div>
          </div>
          <div>
            <div className="bg-red-50 p-2 font-bold text-red-800 text-xs uppercase border-b border-gray-200">
              Deductions
            </div>
            {deductionsRows.map(([label, value]) => (
              <div
                key={String(label)}
                className="flex justify-between px-3 py-1.5 border-b border-gray-100 text-xs"
              >
                <span>{label}</span>
                <span className="font-medium text-red-600">
                  {fmt(Number(value))}
                </span>
              </div>
            ))}
            {salary.lwp > 0 && (
              <div className="flex justify-between px-3 py-1.5 border-b border-gray-100 text-xs">
                <span>LWP Days</span>
                <span>{salary.lwp}</span>
              </div>
            )}
            <div className="flex justify-between px-3 py-2 bg-red-50 font-bold text-xs">
              <span>Total Deductions</span>
              <span className="text-red-600">
                {fmt(salary.totalDeductions ?? 0)}
              </span>
            </div>
          </div>
        </div>

        {/* Net Pay */}
        <div className="flex justify-between items-center p-4 bg-blue-50">
          <span className="font-bold text-base">Net Earnings (Take Home)</span>
          <span className="text-xl font-black text-blue-700">
            {fmt(salary.netEarnings ?? salary.net ?? 0)}
          </span>
        </div>

        <div className="p-3 text-center text-xs text-gray-500 border-t border-gray-200">
          This is a computer-generated salary slip. No signature required.
          <br />© {new Date().getFullYear()} Yf&apos;s Platform | Author: Sachin
          Patel
        </div>
      </div>
    </div>
  );
}

export default function EmployeeSalarySlipsPage() {
  const { employeeId, username } = useAuth();
  const employees = getEmployees();
  const emp = employees.find(
    (e: any) =>
      String(e.id) === String(employeeId) ||
      e.employeeId === employeeId ||
      e.employeeId === username,
  );
  const extra = emp ? getEmpExtra(emp.employeeId) : {};

  const allSalaries = getSalaries();
  const empSalaries = allSalaries
    .filter(
      (s: any) =>
        String(s.employeeId) === String(emp?.id) ||
        s.employeeId === emp?.employeeId,
    )
    .sort((a: any, b: any) => {
      const aVal = (Number(a.year) ?? 0) * 100 + (Number(a.month) ?? 0);
      const bVal = (Number(b.year) ?? 0) * 100 + (Number(b.month) ?? 0);
      return bVal - aVal;
    });

  const [viewSalary, setViewSalary] = useState<any | null>(null);

  const sessionList = getSessionList();
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentSession = getCurrentSession();

  // Get list of available sessions from salary records (DOJ year to current)
  const availableSessions = (() => {
    const sessSet = new Set<string>();
    sessSet.add(currentSession);
    for (const s of empSalaries) {
      const yr = Number(s.year);
      const mo = Number(s.month);
      if (mo >= 4) sessSet.add(`${yr}-${String(yr + 1).slice(2)}`);
      else sessSet.add(`${yr - 1}-${String(yr).slice(2)}`);
    }
    return sessionList.filter((s) => sessSet.has(s));
  })();

  const [filterSession, setFilterSession] = useState(currentSession);
  const [filterMonth, setFilterMonth] = useState(currentMonth);

  // Get available months for selected session
  const sessionMonths = (() => {
    const months: { value: number; label: string }[] = [];
    const MONTH_LABELS = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const isCurrentSess = filterSession === currentSession;
    if (isCurrentSess) {
      if (currentMonth >= 4) {
        for (let m = currentMonth; m >= 4; m--)
          months.push({ value: m, label: MONTH_LABELS[m - 1] });
      } else {
        for (let m = currentMonth; m >= 1; m--)
          months.push({ value: m, label: MONTH_LABELS[m - 1] });
        for (let m = 12; m >= 4; m--)
          months.push({ value: m, label: MONTH_LABELS[m - 1] });
      }
    } else {
      for (let m = 3; m >= 1; m--)
        months.push({ value: m, label: MONTH_LABELS[m - 1] });
      for (let m = 12; m >= 4; m--)
        months.push({ value: m, label: MONTH_LABELS[m - 1] });
    }
    return months;
  })();

  // Filter salaries by selected session/month
  const filteredSalaries = empSalaries.filter((s: any) => {
    const yr = Number(s.year);
    const mo = Number(s.month);
    const sessMo =
      mo >= 4
        ? `${yr}-${String(yr + 1).slice(2)}`
        : `${yr - 1}-${String(yr).slice(2)}`;
    return sessMo === filterSession && mo === filterMonth;
  });

  const handlePrint = () => {
    const content = document.getElementById("payslip-print");
    if (!content) return;
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(
      `<html><head><title>Salary Slip</title><style>body{font-family:sans-serif;margin:0;padding:20px;} * {box-sizing:border-box;}</style></head><body>${content.innerHTML}</body></html>`,
    );
    win.document.close();
    win.print();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-display font-bold text-gradient">
            My Salary Slips
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            View and download your salary records
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Select
            value={filterMonth.toString()}
            onValueChange={(v) => setFilterMonth(Number(v))}
          >
            <SelectTrigger className="w-28 h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="max-h-[250px] overflow-y-auto">
              {sessionMonths.map((m) => (
                <SelectItem key={m.value} value={m.value.toString()}>
                  {m.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={filterSession}
            onValueChange={(newSess) => {
              setFilterSession(newSess);
              // Set latest month for session
              const isCurrentSess = newSess === currentSession;
              if (isCurrentSess) setFilterMonth(currentMonth);
              else setFilterMonth(3);
            }}
          >
            <SelectTrigger className="w-28 h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="max-h-[250px] overflow-y-auto">
              {availableSessions.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </motion.div>

      {/* Table */}
      {filteredSalaries.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-20"
          data-ocid="salary_slips.empty_state"
        >
          <FileText className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-lg font-display font-semibold text-muted-foreground">
            No salary records yet
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            Your salary slips will appear here once processed by admin.
          </p>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="card-glass">
            <CardContent className="p-0">
              <Table data-ocid="salary_slips.table">
                <TableHeader>
                  <TableRow>
                    <TableHead>Month</TableHead>
                    <TableHead>Year</TableHead>
                    <TableHead className="text-right">Basic Pay</TableHead>
                    <TableHead className="text-right">Gross</TableHead>
                    <TableHead className="text-right">Deductions</TableHead>
                    <TableHead className="text-right">Net Pay</TableHead>
                    <TableHead className="text-center">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSalaries.map((sal: any, idx: number) => (
                    <TableRow
                      key={`${sal.month}-${sal.year}`}
                      data-ocid={`salary_slips.item.${idx + 1}`}
                    >
                      <TableCell className="font-medium">
                        {typeof sal.month === "number"
                          ? [
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
                            ][sal.month - 1]
                          : sal.month}
                      </TableCell>
                      <TableCell>{sal.year}</TableCell>
                      <TableCell className="text-right">
                        {fmt(sal.basicPay ?? sal.basic ?? 0)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge className="bg-blue-500/15 text-blue-400 border-blue-500/30 text-xs">
                          {fmt(sal.grossEarnings ?? sal.gross ?? 0)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="text-xs text-red-400 flex items-center justify-end gap-1">
                          <TrendingDown className="w-3 h-3" />
                          {fmt(sal.totalDeductions ?? 0)}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <span
                          className="font-bold"
                          style={{ color: "oklch(0.70 0.22 145)" }}
                        >
                          {fmt(sal.netEarnings ?? sal.net ?? 0)}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-xs gap-1 border-primary/30 text-primary hover:bg-primary/10"
                          onClick={() => setViewSalary(sal)}
                          data-ocid={`salary_slips.view_button.${idx + 1}`}
                        >
                          <Banknote className="w-3 h-3" /> View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Payslip Dialog */}
      <Dialog
        open={!!viewSalary}
        onOpenChange={(o) => !o && setViewSalary(null)}
      >
        <DialogContent
          className="bg-card border-border/60 max-w-3xl max-h-[90vh] overflow-y-auto"
          data-ocid="salary_slips.dialog"
        >
          <DialogHeader>
            <DialogTitle className="font-display flex items-center gap-2">
              <FileText className="w-4 h-4 text-primary" />
              Salary Slip —{" "}
              {typeof viewSalary?.month === "number"
                ? [
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
                  ][(viewSalary.month as number) - 1]
                : viewSalary?.month}{" "}
              {viewSalary?.year}
            </DialogTitle>
          </DialogHeader>
          {viewSalary && emp && (
            <>
              <PayslipPrint salary={viewSalary} emp={emp} extra={extra} />
              <div className="flex gap-3 justify-end mt-4">
                <Button
                  variant="outline"
                  onClick={handlePrint}
                  className="gap-2"
                  data-ocid="salary_slips.print_button"
                >
                  <Printer className="w-4 h-4" /> Print
                </Button>
                <Button
                  onClick={handlePrint}
                  className="gradient-primary text-white border-0 gap-2"
                  data-ocid="salary_slips.download_button"
                >
                  <Download className="w-4 h-4" /> Download PDF
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
