import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertCircle,
  BadgeIndianRupee,
  Banknote,
  Building2,
  Calculator,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Copy,
  Info,
  Lock,
  Trash2,
  TrendingDown,
  TrendingUp,
  Unlock,
  Users,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

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
  const currentMonthIdx = now.getMonth();
  const result: string[] = [];
  if (currentMonthIdx >= 3) {
    for (let i = 3; i <= currentMonthIdx; i++) result.push(MONTHS[i]);
  } else {
    for (let i = 3; i <= 11; i++) result.push(MONTHS[i]);
    for (let i = 0; i <= currentMonthIdx; i++) result.push(MONTHS[i]);
  }
  return result;
}

type Employee = {
  id: string;
  name: string;
  employeeId: string;
  institute: string;
  designation: string;
  department: string;
  employmentType: "regular" | "temporary";
  basicSalary: number;
};

type SalaryRecord = {
  employeeId: string;
  month: string;
  year: string;
  locked: boolean;
  basicPay: number;
  lwp: number;
  lwpPrev: number;
  lwpCurr: number;
  specialPay: number;
  daPercent: number;
  hraPercent: number;
  bonus: number;
  daArrears: number;
  ta: number;
  conveyanceAllowance: number;
  washingAllowance: number;
  ltc: number;
  festivalAdvance: number;
  incentive: number;
  otherEarnings: number;
  grossEarnings: number;
  houseRent: number;
  electricityCharges: number;
  lwf: number;
  epf: number;
  vpf: number;
  lic: number;
  profTax: number;
  incomeTax: number;
  festival: number;
  esi: number;
  security: number;
  otherDeductions: number;
  totalDeductions: number;
  netEarnings: number;
  da?: number;
  hra?: number;
  gross?: number;
  pf?: number;
  esic?: number;
  pt?: number;
  it?: number;
  net?: number;
  employmentType?: string;
};

type SalaryInputs = {
  lwp: number;
  lwpPrev: number;
  lwpCurr: number;
  specialPay: number;
  daPercent: number;
  hraPercent: number;
  bonus: number;
  daArrears: number;
  ta: number;
  conveyanceAllowance: number;
  washingAllowance: number;
  ltc: number;
  festivalAdvance: number;
  incentive: number;
  otherEarnings: number;
  houseRent: number;
  electricityCharges: number;
  lwf: number;
  vpf: number;
  lic: number;
  festival: number;
  security: number;
  otherDeductions: number;
};

function getDaysInMonthUtil(month: number, year: number) {
  return new Date(year, month, 0).getDate();
}

function calculateLWPFromAttendance(
  daysArray: string[],
  month: number,
  year: number,
): { lwpPrev: number; lwpCurr: number } {
  const prevMonth = month === 1 ? 12 : month - 1;
  const prevYear = month === 1 ? year - 1 : year;
  const daysInPrevMonth = getDaysInMonthUtil(prevMonth, prevYear);

  const parsed: Record<string, { status: string; leaveType?: string }> = {};
  for (const item of daysArray) {
    const parts = item.split(":");
    parsed[parts[0]] = { status: parts[1], leaveType: parts[2] };
  }

  const allDays: Array<{ key: string; isPrev: boolean }> = [];
  for (let d = 25; d <= daysInPrevMonth; d++)
    allDays.push({ key: `prev_${d}`, isPrev: true });
  for (let d = 1; d <= 24; d++) allDays.push({ key: String(d), isPrev: false });

  const dayData = allDays.map((d) => ({
    ...d,
    status: parsed[d.key]?.status || "present",
    leaveType: parsed[d.key]?.leaveType,
  }));

  const effectiveLWP = new Set<string>();
  let i = 0;
  while (i < dayData.length) {
    if (dayData[i].status === "absent" || dayData[i].status === "holiday") {
      let j = i;
      while (
        j < dayData.length &&
        (dayData[j].status === "absent" || dayData[j].status === "holiday")
      )
        j++;
      const run = dayData.slice(i, j);
      const absentLeaveTypes = run
        .filter((d) => d.status === "absent")
        .map((d) => d.leaveType || "LWP");
      const isCLRun =
        absentLeaveTypes.length > 0 &&
        absentLeaveTypes.every((lt) => lt === "CL");
      for (const d of run) {
        if (d.status === "absent" && d.leaveType === "LWP") {
          effectiveLWP.add(d.key);
        } else if (d.status === "holiday" || d.leaveType === "PH") {
          if (!isCLRun) effectiveLWP.add(d.key);
        }
        // CL, EL, HPL, ML = paid (no LWP)
      }
      i = j;
    } else {
      i++;
    }
  }

  let lwpPrev = 0;
  let lwpCurr = 0;
  for (const key of effectiveLWP) {
    if (key.startsWith("prev_")) lwpPrev++;
    else lwpCurr++;
  }
  return { lwpPrev, lwpCurr };
}

function defaultInputs(emp: Employee): SalaryInputs {
  const isRegular = emp.employmentType === "regular";
  const empTA = (() => {
    try {
      return (
        Number(
          JSON.parse(localStorage.getItem(`empExtra_${emp.employeeId}`) || "{}")
            .ta,
        ) || 0
      );
    } catch {
      return 0;
    }
  })();
  return {
    lwp: 0,
    lwpPrev: 0,
    lwpCurr: 0,
    specialPay: 0,
    daPercent: isRegular ? 257 : 0,
    hraPercent: isRegular ? 20 : 0,
    bonus: 0,
    daArrears: 0,
    ta: isRegular ? empTA : 0,
    conveyanceAllowance: 0,
    washingAllowance: 0,
    ltc: 0,
    festivalAdvance: 0,
    incentive: 0,
    otherEarnings: 0,
    houseRent: 0,
    electricityCharges: 0,
    lwf: 0,
    vpf: 0,
    lic: 0,
    festival: 0,
    security: 0,
    otherDeductions: 0,
  };
}

function calcSalary(
  emp: Employee,
  inputs: SalaryInputs,
  monthNum: number,
  yearNum: number,
): Omit<SalaryRecord, "locked" | "month" | "year"> {
  const basic = Number(emp.basicSalary) || 0;

  const prevMonth = monthNum === 1 ? 12 : monthNum - 1;
  const prevYear = monthNum === 1 ? yearNum - 1 : yearNum;
  const totalPrev = getDaysInMonthUtil(prevMonth, prevYear);
  const totalCurr = getDaysInMonthUtil(monthNum, yearNum);

  const lwpDeduction = Math.round(
    (basic * inputs.lwpPrev) / totalPrev + (basic * inputs.lwpCurr) / totalCurr,
  );
  const adjustedBasic = Math.max(0, basic - lwpDeduction);

  const da = Math.round((adjustedBasic * inputs.daPercent) / 100);
  const hra = Math.round((adjustedBasic * inputs.hraPercent) / 100);

  const totalLWP = inputs.lwpPrev + inputs.lwpCurr;
  const totalPeriodDays = totalPrev - 25 + 1 + 24;
  const ta =
    totalLWP === 0
      ? inputs.ta
      : Math.round(
          inputs.ta * ((totalPeriodDays - totalLWP) / totalPeriodDays),
        );

  const grossEarnings =
    adjustedBasic +
    da +
    hra +
    ta +
    inputs.specialPay +
    inputs.daArrears +
    inputs.conveyanceAllowance +
    inputs.washingAllowance +
    inputs.ltc +
    inputs.festivalAdvance +
    inputs.incentive +
    inputs.otherEarnings +
    inputs.bonus;

  const epf = Math.round(adjustedBasic * 0.12);
  const esi = grossEarnings <= 21000 ? Math.round(grossEarnings * 0.0075) : 0;

  const annualGross = grossEarnings * 12;
  let profTax = 0;
  if (annualGross >= 400000) profTax = 208;
  else if (annualGross >= 300000) profTax = 167;
  else if (annualGross >= 225000) profTax = 125;

  const annualTaxable = Math.max(0, grossEarnings * 12 - 75000);
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
  const incomeTax = Math.round(annualIT / 12);

  const totalDeductions =
    epf +
    esi +
    profTax +
    incomeTax +
    inputs.houseRent +
    inputs.electricityCharges +
    inputs.lwf +
    inputs.vpf +
    inputs.lic +
    inputs.festival +
    inputs.security +
    inputs.otherDeductions;

  const netEarnings = grossEarnings - totalDeductions;

  return {
    employeeId: emp.employeeId,
    basicPay: adjustedBasic,
    lwp: inputs.lwpPrev + inputs.lwpCurr,
    lwpPrev: inputs.lwpPrev,
    lwpCurr: inputs.lwpCurr,
    specialPay: inputs.specialPay,
    daPercent: inputs.daPercent,
    hraPercent: inputs.hraPercent,
    bonus: inputs.bonus,
    daArrears: inputs.daArrears,
    ta,
    conveyanceAllowance: inputs.conveyanceAllowance,
    washingAllowance: inputs.washingAllowance,
    ltc: inputs.ltc,
    festivalAdvance: inputs.festivalAdvance,
    incentive: inputs.incentive,
    otherEarnings: inputs.otherEarnings,
    grossEarnings,
    houseRent: inputs.houseRent,
    electricityCharges: inputs.electricityCharges,
    lwf: inputs.lwf,
    epf,
    vpf: inputs.vpf,
    lic: inputs.lic,
    profTax,
    incomeTax,
    festival: inputs.festival,
    esi,
    security: inputs.security,
    otherDeductions: inputs.otherDeductions,
    totalDeductions,
    netEarnings,
    da,
    hra,
    gross: grossEarnings,
    pf: epf,
    esic: esi,
    pt: profTax,
    it: incomeTax,
    net: netEarnings,
    employmentType: emp.employmentType,
  };
}

function getEmployees(): Employee[] {
  try {
    return JSON.parse(localStorage.getItem("employees") || "[]");
  } catch {
    return [];
  }
}
function getSalaries(): SalaryRecord[] {
  try {
    return JSON.parse(localStorage.getItem("salaries") || "[]");
  } catch {
    return [];
  }
}
function saveSalaries(data: SalaryRecord[]) {
  localStorage.setItem("salaries", JSON.stringify(data));
}
function getAttendance() {
  try {
    return JSON.parse(localStorage.getItem("attendance") || "[]");
  } catch {
    return [];
  }
}
function getInstitutes(): string[] {
  try {
    return JSON.parse(localStorage.getItem("institutes") || "[]").map(
      (i: { name: string }) => i.name,
    );
  } catch {
    return [];
  }
}

function NumInput({
  label,
  value,
  onChange,
  readOnly,
  highlight,
}: {
  label: string;
  value: number;
  onChange?: (v: number) => void;
  readOnly?: boolean;
  highlight?: "green" | "red";
}) {
  return (
    <div className="space-y-1">
      <Label className="text-[10px] text-muted-foreground">{label}</Label>
      <div className="relative">
        <Input
          type="number"
          min={0}
          value={value || ""}
          readOnly={readOnly}
          onChange={(e) => onChange?.(Number(e.target.value))}
          className={`h-7 text-xs ${
            readOnly ? "opacity-70 cursor-default bg-card/30" : "bg-input/60"
          } ${
            highlight === "green"
              ? "border-green-500/40 text-green-400 font-bold"
              : highlight === "red"
                ? "border-red-500/40 text-red-400"
                : ""
          }`}
        />
      </div>
    </div>
  );
}

export default function SalaryProcessingPage() {
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(MONTHS[now.getMonth()]);
  const [selectedYear, setSelectedYear] = useState(String(now.getFullYear()));
  const [selectedInstitute, setSelectedInstitute] = useState("all");
  const [selectedEmployee, setSelectedEmployee] = useState("all");
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [expandedEmp, setExpandedEmp] = useState<string | null>(null);
  const [salaryInputs, setSalaryInputs] = useState<
    Record<string, SalaryInputs>
  >({});

  const employees = getEmployees();
  const institutes = getInstitutes();
  const attendance = getAttendance();
  const salaries = getSalaries();

  const selectedMonthNum = MONTHS.indexOf(selectedMonth) + 1;
  const selectedYearNum = Number(selectedYear);

  const isCurrentMonth =
    selectedMonth === MONTHS[now.getMonth()] &&
    selectedYear === String(now.getFullYear());
  const isPast =
    !isCurrentMonth &&
    (Number(selectedYear) < now.getFullYear() ||
      (Number(selectedYear) === now.getFullYear() &&
        MONTHS.indexOf(selectedMonth) < now.getMonth()));

  const instituteEmployees = employees.filter(
    (e) => selectedInstitute === "all" || e.institute === selectedInstitute,
  );

  const filteredEmployees =
    selectedEmployee === "all"
      ? instituteEmployees
      : instituteEmployees.filter((e) => e.id === selectedEmployee);

  const prevMonthIdx =
    MONTHS.indexOf(selectedMonth) === 0
      ? 11
      : MONTHS.indexOf(selectedMonth) - 1;
  const prevMonthYear =
    MONTHS.indexOf(selectedMonth) === 0
      ? String(Number(selectedYear) - 1)
      : selectedYear;
  const prevMonth = MONTHS[prevMonthIdx];

  function getAttendanceDays(empId: string): string[] {
    const rec = attendance.find(
      (a: {
        employeeId: string | number;
        month: string | number;
        year: string | number;
        days: string[];
      }) =>
        String(a.employeeId) === String(empId) &&
        Number(a.month) === selectedMonthNum &&
        Number(a.year) === selectedYearNum,
    );
    return rec?.days || [];
  }

  function getPrevMonthSalary(empId: string) {
    return salaries.find(
      (s: SalaryRecord) =>
        s.employeeId === empId &&
        s.month === prevMonth &&
        s.year === prevMonthYear,
    );
  }

  function isAttendanceSaved(empId: string) {
    return attendance.some(
      (a: {
        employeeId: string | number;
        month: string | number;
        year: string | number;
      }) =>
        String(a.employeeId) === String(empId) &&
        Number(a.month) === selectedMonthNum &&
        Number(a.year) === selectedYearNum,
    );
  }

  function getSavedSalary(empId: string) {
    return salaries.find(
      (s) =>
        s.employeeId === empId &&
        s.month === selectedMonth &&
        s.year === selectedYear,
    );
  }

  function getInputs(emp: Employee): SalaryInputs {
    return salaryInputs[emp.employeeId] ?? defaultInputs(emp);
  }

  function setInputField(
    empId: string,
    field: keyof SalaryInputs,
    value: number,
  ) {
    setSalaryInputs((prev) => {
      const current =
        prev[empId] ??
        defaultInputs(employees.find((e) => e.employeeId === empId)!);
      const updated = { ...current, [field]: value };
      // Keep lwp in sync as sum of lwpPrev + lwpCurr
      if (field === "lwpPrev" || field === "lwpCurr") {
        updated.lwp = updated.lwpPrev + updated.lwpCurr;
      }
      return { ...prev, [empId]: updated };
    });
  }

  function expandEmployee(empId: string) {
    const days = getAttendanceDays(empId);
    if (days.length > 0) {
      const { lwpPrev, lwpCurr } = calculateLWPFromAttendance(
        days,
        selectedMonthNum,
        selectedYearNum,
      );
      setSalaryInputs((prev) => {
        const emp = employees.find((e) => e.employeeId === empId);
        const base =
          prev[empId] ?? (emp ? defaultInputs(emp) : ({} as SalaryInputs));
        return {
          ...prev,
          [empId]: {
            ...base,
            lwpPrev,
            lwpCurr,
            lwp: lwpPrev + lwpCurr,
          },
        };
      });
    }
    setExpandedEmp(empId);
  }

  function handleProcess(emp: Employee) {
    if (!isAttendanceSaved(emp.employeeId)) {
      toast.error("Save attendance first before processing salary.");
      return;
    }
    const inputs = getInputs(emp);
    const calc = calcSalary(emp, inputs, selectedMonthNum, selectedYearNum);
    const newRecord: SalaryRecord = {
      ...calc,
      month: selectedMonth,
      year: selectedYear,
      locked: true,
    };
    const updated = salaries.filter(
      (s) =>
        !(
          s.employeeId === emp.employeeId &&
          s.month === selectedMonth &&
          s.year === selectedYear
        ),
    );
    updated.push(newRecord);
    saveSalaries(updated);
    toast.success(`Salary processed for ${emp.name}`);
    setExpandedEmp(null);
  }

  function handleDelete(empId: string) {
    const updated = salaries.filter(
      (s) =>
        !(
          s.employeeId === empId &&
          s.month === selectedMonth &&
          s.year === selectedYear
        ),
    );
    saveSalaries(updated);
    toast.success("Salary record deleted and unlocked.");
    setDeleteTarget(null);
  }

  const fmt = (n: number) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
            <Calculator className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-display font-bold">
              Salary Processing
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Select
            value={selectedInstitute}
            onValueChange={(v) => {
              setSelectedInstitute(v);
              setSelectedEmployee("all");
            }}
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
          <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
            <SelectTrigger className="w-44 h-9">
              <Users className="w-3.5 h-3.5 mr-1 text-muted-foreground" />
              <SelectValue placeholder="All Employees" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Employees</SelectItem>
              {instituteEmployees.map((emp) => (
                <SelectItem key={emp.id} value={emp.id}>
                  {emp.name}
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

      {isPast && (
        <div
          className="flex items-center gap-2 px-4 py-3 rounded-xl border"
          style={{
            background: "oklch(0.65 0.20 80 / 0.10)",
            borderColor: "oklch(0.65 0.20 80 / 0.3)",
          }}
        >
          <Lock className="w-4 h-4" style={{ color: "oklch(0.72 0.20 80)" }} />
          <p className="text-sm" style={{ color: "oklch(0.72 0.20 80)" }}>
            Past months are locked. Only the current month (
            {MONTHS[now.getMonth()]} {now.getFullYear()}) can be edited.
          </p>
        </div>
      )}

      {filteredEmployees.length === 0 ? (
        <div className="text-center py-20" data-ocid="salary.empty_state">
          <Users className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-lg font-display font-semibold text-muted-foreground">
            No employees found
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            Add employees and select an institute to process salaries.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredEmployees.map((emp) => {
            const saved = getSavedSalary(emp.employeeId);
            const isLocked = !!saved?.locked;
            const attSaved = isAttendanceSaved(emp.employeeId);
            const inputs = getInputs(emp);
            const preview = calcSalary(
              emp,
              inputs,
              selectedMonthNum,
              selectedYearNum,
            );
            const isExpanded = expandedEmp === emp.employeeId;

            return (
              <Card
                key={emp.employeeId}
                className={`card-glass ${
                  isLocked
                    ? "border-green-500/30"
                    : !attSaved
                      ? "border-amber-500/20"
                      : ""
                }`}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Users className="w-4 h-4 text-primary" />
                      {emp.name}
                      <span className="text-xs text-muted-foreground">
                        ({emp.employeeId})
                      </span>
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={
                          emp.employmentType === "regular"
                            ? "default"
                            : "outline"
                        }
                        className="text-xs"
                      >
                        {emp.employmentType === "regular"
                          ? "Regular"
                          : "Temporary"}
                      </Badge>
                      {isLocked && (
                        <Badge className="text-xs bg-green-500/20 text-green-400 border-green-500/30">
                          <Lock className="w-3 h-3 mr-1" />
                          Locked
                        </Badge>
                      )}
                      {!attSaved && !isLocked && (
                        <Badge
                          variant="outline"
                          className="text-xs border-amber-500/40 text-amber-400"
                        >
                          <AlertCircle className="w-3 h-3 mr-1" />
                          Attendance pending
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">
                      {emp.designation} | {emp.department} | {emp.institute}
                    </p>
                    {isLocked && saved && (
                      <div className="flex items-center gap-3 text-xs">
                        <span className="text-muted-foreground">
                          Basic:{" "}
                          <strong className="text-foreground">
                            {fmt(saved.basicPay ?? 0)}
                          </strong>
                        </span>
                        <span className="text-muted-foreground">
                          Gross:{" "}
                          <strong className="text-blue-400">
                            {fmt(saved.grossEarnings ?? saved.gross ?? 0)}
                          </strong>
                        </span>
                        <span className="text-muted-foreground">
                          Net:{" "}
                          <strong className="text-green-400">
                            {fmt(saved.netEarnings ?? saved.net ?? 0)}
                          </strong>
                        </span>
                      </div>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="space-y-3">
                  {!isLocked && !isExpanded && (
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span>
                          Basic:{" "}
                          <strong className="text-foreground">
                            {fmt(preview.basicPay)}
                          </strong>
                        </span>
                        <span className="text-blue-400">
                          Est. Gross:{" "}
                          <strong>{fmt(preview.grossEarnings)}</strong>
                        </span>
                        <span className="text-green-400">
                          Est. Net: <strong>{fmt(preview.netEarnings)}</strong>
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {(() => {
                          const prevSal = getPrevMonthSalary(emp.employeeId);
                          const hasCurrent = !!getSavedSalary(emp.employeeId);
                          if (attSaved && prevSal && !hasCurrent) {
                            return (
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 text-xs gap-1"
                                onClick={() => {
                                  setSalaryInputs((prev) => ({
                                    ...prev,
                                    [emp.employeeId]: {
                                      lwp: 0,
                                      lwpPrev: 0,
                                      lwpCurr: 0,
                                      specialPay: prevSal.specialPay ?? 0,
                                      daPercent:
                                        prevSal.daPercent ??
                                        (emp.employmentType === "regular"
                                          ? 257
                                          : 0),
                                      hraPercent:
                                        prevSal.hraPercent ??
                                        (emp.employmentType === "regular"
                                          ? 20
                                          : 0),
                                      bonus: prevSal.bonus ?? 0,
                                      daArrears: prevSal.daArrears ?? 0,
                                      ta: prevSal.ta ?? 0,
                                      conveyanceAllowance:
                                        prevSal.conveyanceAllowance ?? 0,
                                      washingAllowance:
                                        prevSal.washingAllowance ?? 0,
                                      ltc: prevSal.ltc ?? 0,
                                      festivalAdvance:
                                        prevSal.festivalAdvance ?? 0,
                                      incentive: prevSal.incentive ?? 0,
                                      otherEarnings: prevSal.otherEarnings ?? 0,
                                      houseRent: prevSal.houseRent ?? 0,
                                      electricityCharges:
                                        prevSal.electricityCharges ?? 0,
                                      lwf: prevSal.lwf ?? 0,
                                      vpf: prevSal.vpf ?? 0,
                                      lic: prevSal.lic ?? 0,
                                      festival: prevSal.festival ?? 0,
                                      security: prevSal.security ?? 0,
                                      otherDeductions:
                                        prevSal.otherDeductions ?? 0,
                                    },
                                  }));
                                  expandEmployee(emp.employeeId);
                                  toast.success(
                                    "Previous month salary loaded. You can edit before saving.",
                                  );
                                }}
                              >
                                <Copy className="w-3 h-3" /> Load Prev Month
                              </Button>
                            );
                          }
                          return null;
                        })()}
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 text-xs gap-1"
                          onClick={() => expandEmployee(emp.employeeId)}
                        >
                          <ChevronDown className="w-3 h-3" /> Process
                        </Button>
                      </div>
                    </div>
                  )}

                  {!isLocked && isExpanded && (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                          Salary Details
                        </p>
                        <div className="flex items-center gap-2">
                          {(() => {
                            const prevSal = getPrevMonthSalary(emp.employeeId);
                            if (prevSal && !isPast) {
                              return (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-7 text-xs gap-1"
                                  onClick={() => {
                                    setSalaryInputs((prev) => ({
                                      ...prev,
                                      [emp.employeeId]: {
                                        lwp: 0,
                                        lwpPrev: 0,
                                        lwpCurr: 0,
                                        specialPay: prevSal.specialPay ?? 0,
                                        daPercent:
                                          prevSal.daPercent ??
                                          (emp.employmentType === "regular"
                                            ? 257
                                            : 0),
                                        hraPercent:
                                          prevSal.hraPercent ??
                                          (emp.employmentType === "regular"
                                            ? 20
                                            : 0),
                                        bonus: prevSal.bonus ?? 0,
                                        daArrears: prevSal.daArrears ?? 0,
                                        ta: prevSal.ta ?? 0,
                                        conveyanceAllowance:
                                          prevSal.conveyanceAllowance ?? 0,
                                        washingAllowance:
                                          prevSal.washingAllowance ?? 0,
                                        ltc: prevSal.ltc ?? 0,
                                        festivalAdvance:
                                          prevSal.festivalAdvance ?? 0,
                                        incentive: prevSal.incentive ?? 0,
                                        otherEarnings:
                                          prevSal.otherEarnings ?? 0,
                                        houseRent: prevSal.houseRent ?? 0,
                                        electricityCharges:
                                          prevSal.electricityCharges ?? 0,
                                        lwf: prevSal.lwf ?? 0,
                                        vpf: prevSal.vpf ?? 0,
                                        lic: prevSal.lic ?? 0,
                                        festival: prevSal.festival ?? 0,
                                        security: prevSal.security ?? 0,
                                        otherDeductions:
                                          prevSal.otherDeductions ?? 0,
                                      },
                                    }));
                                    toast.success(
                                      "Previous month salary loaded. You can edit before saving.",
                                    );
                                  }}
                                >
                                  <Copy className="w-3 h-3" /> Load Prev Month
                                </Button>
                              );
                            }
                            return null;
                          })()}
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 text-xs gap-1"
                            onClick={() => setExpandedEmp(null)}
                          >
                            <ChevronUp className="w-3 h-3" /> Collapse
                          </Button>
                        </div>
                      </div>

                      {/* EARNINGS */}
                      <div>
                        <p
                          className="text-xs font-semibold mb-2 flex items-center gap-1.5"
                          style={{ color: "oklch(0.70 0.20 145)" }}
                        >
                          <TrendingUp className="w-3 h-3" /> Earnings
                        </p>
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2">
                          <NumInput
                            label="Basic Pay"
                            value={preview.basicPay}
                            readOnly
                          />
                          <NumInput
                            label="LWP Prev Month"
                            value={inputs.lwpPrev}
                            onChange={(v) =>
                              setInputField(emp.employeeId, "lwpPrev", v)
                            }
                          />
                          <NumInput
                            label="LWP Curr Month"
                            value={inputs.lwpCurr}
                            onChange={(v) =>
                              setInputField(emp.employeeId, "lwpCurr", v)
                            }
                          />
                          <NumInput
                            label="Total LWP Days"
                            value={inputs.lwpPrev + inputs.lwpCurr}
                            readOnly
                          />
                          <NumInput
                            label="Special Pay"
                            value={inputs.specialPay}
                            onChange={(v) =>
                              setInputField(emp.employeeId, "specialPay", v)
                            }
                          />
                          <NumInput
                            label="DA %"
                            value={inputs.daPercent}
                            onChange={(v) =>
                              setInputField(emp.employeeId, "daPercent", v)
                            }
                          />
                          <NumInput
                            label="DA Amount"
                            value={preview.da ?? 0}
                            readOnly
                          />
                          <NumInput
                            label="HRA %"
                            value={inputs.hraPercent}
                            onChange={(v) =>
                              setInputField(emp.employeeId, "hraPercent", v)
                            }
                          />
                          <NumInput
                            label="HRA Amount"
                            value={preview.hra ?? 0}
                            readOnly
                          />
                          <NumInput
                            label="TA"
                            value={inputs.ta}
                            onChange={(v) =>
                              setInputField(emp.employeeId, "ta", v)
                            }
                          />
                          <NumInput
                            label="Conveyance"
                            value={inputs.conveyanceAllowance}
                            onChange={(v) =>
                              setInputField(
                                emp.employeeId,
                                "conveyanceAllowance",
                                v,
                              )
                            }
                          />
                          <NumInput
                            label="Washing Allow."
                            value={inputs.washingAllowance}
                            onChange={(v) =>
                              setInputField(
                                emp.employeeId,
                                "washingAllowance",
                                v,
                              )
                            }
                          />
                          <NumInput
                            label="Bonus"
                            value={inputs.bonus}
                            onChange={(v) =>
                              setInputField(emp.employeeId, "bonus", v)
                            }
                          />
                          <NumInput
                            label="DA Arrears"
                            value={inputs.daArrears}
                            onChange={(v) =>
                              setInputField(emp.employeeId, "daArrears", v)
                            }
                          />
                          <NumInput
                            label="LTC"
                            value={inputs.ltc}
                            onChange={(v) =>
                              setInputField(emp.employeeId, "ltc", v)
                            }
                          />
                          <NumInput
                            label="Festival Adv."
                            value={inputs.festivalAdvance}
                            onChange={(v) =>
                              setInputField(
                                emp.employeeId,
                                "festivalAdvance",
                                v,
                              )
                            }
                          />
                          <NumInput
                            label="Incentive"
                            value={inputs.incentive}
                            onChange={(v) =>
                              setInputField(emp.employeeId, "incentive", v)
                            }
                          />
                          <NumInput
                            label="Other Earnings"
                            value={inputs.otherEarnings}
                            onChange={(v) =>
                              setInputField(emp.employeeId, "otherEarnings", v)
                            }
                          />
                          <NumInput
                            label="Gross Earnings"
                            value={preview.grossEarnings}
                            readOnly
                            highlight="green"
                          />
                        </div>
                      </div>

                      {/* DEDUCTIONS */}
                      <div>
                        <p
                          className="text-xs font-semibold mb-2 flex items-center gap-1.5"
                          style={{ color: "oklch(0.65 0.22 20)" }}
                        >
                          <TrendingDown className="w-3 h-3" /> Deductions
                        </p>
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2">
                          <NumInput
                            label="House Rent"
                            value={inputs.houseRent}
                            onChange={(v) =>
                              setInputField(emp.employeeId, "houseRent", v)
                            }
                          />
                          <NumInput
                            label="Electricity"
                            value={inputs.electricityCharges}
                            onChange={(v) =>
                              setInputField(
                                emp.employeeId,
                                "electricityCharges",
                                v,
                              )
                            }
                          />
                          <NumInput
                            label="LWF"
                            value={inputs.lwf}
                            onChange={(v) =>
                              setInputField(emp.employeeId, "lwf", v)
                            }
                          />
                          <NumInput
                            label={`EPF (12%) = ${fmt(preview.epf)}`}
                            value={preview.epf}
                            readOnly
                          />
                          <NumInput
                            label="VPF"
                            value={inputs.vpf}
                            onChange={(v) =>
                              setInputField(emp.employeeId, "vpf", v)
                            }
                          />
                          <NumInput
                            label="LIC"
                            value={inputs.lic}
                            onChange={(v) =>
                              setInputField(emp.employeeId, "lic", v)
                            }
                          />
                          <NumInput
                            label={`Prof. Tax = ${fmt(preview.profTax)}`}
                            value={preview.profTax}
                            readOnly
                          />
                          <NumInput
                            label={`Income Tax = ${fmt(preview.incomeTax)}`}
                            value={preview.incomeTax}
                            readOnly
                          />
                          <NumInput
                            label="Festival"
                            value={inputs.festival}
                            onChange={(v) =>
                              setInputField(emp.employeeId, "festival", v)
                            }
                          />
                          <NumInput
                            label={`ESI (0.75%) = ${fmt(preview.esi)}`}
                            value={preview.esi}
                            readOnly
                          />
                          <NumInput
                            label="Security"
                            value={inputs.security}
                            onChange={(v) =>
                              setInputField(emp.employeeId, "security", v)
                            }
                          />
                          <NumInput
                            label="Other Deductions"
                            value={inputs.otherDeductions}
                            onChange={(v) =>
                              setInputField(
                                emp.employeeId,
                                "otherDeductions",
                                v,
                              )
                            }
                          />
                          <NumInput
                            label="Total Deductions"
                            value={preview.totalDeductions}
                            readOnly
                            highlight="red"
                          />
                        </div>
                      </div>

                      {/* SUMMARY */}
                      <div
                        className="flex items-center justify-between p-3 rounded-xl"
                        style={{
                          background: "oklch(0.50 0.25 260 / 0.12)",
                          border: "1px solid oklch(0.50 0.25 260 / 0.25)",
                        }}
                      >
                        <div className="flex items-center gap-2">
                          <BadgeIndianRupee
                            className="w-5 h-5"
                            style={{ color: "oklch(0.70 0.22 260)" }}
                          />
                          <div>
                            <p className="text-xs text-muted-foreground">
                              Net Earnings
                            </p>
                            <p
                              className="text-xl font-bold"
                              style={{ color: "oklch(0.70 0.22 260)" }}
                            >
                              {fmt(preview.netEarnings)}
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1 text-xs text-muted-foreground">
                          <span>
                            Gross:{" "}
                            <strong className="text-foreground">
                              {fmt(preview.grossEarnings)}
                            </strong>
                          </span>
                          <span>
                            Deductions:{" "}
                            <strong className="text-red-400">
                              -{fmt(preview.totalDeductions)}
                            </strong>
                          </span>
                        </div>
                      </div>

                      {/* Action */}
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 text-xs"
                          onClick={() => setExpandedEmp(null)}
                        >
                          Cancel
                        </Button>
                        <Button
                          size="sm"
                          className="h-8 text-xs gap-1 gradient-primary"
                          onClick={() => handleProcess(emp)}
                          disabled={!attSaved || isPast}
                          data-ocid="salary.process_button"
                        >
                          <CheckCircle2 className="w-3 h-3" /> Process &amp;
                          Lock
                        </Button>
                      </div>
                    </div>
                  )}

                  {isLocked && !isPast && (
                    <div className="flex justify-end">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 text-xs gap-1 border-red-500/30 text-red-400 hover:bg-red-500/10"
                        onClick={() => setDeleteTarget(emp.employeeId)}
                      >
                        <Unlock className="w-3 h-3" /> Delete &amp; Unlock
                      </Button>
                    </div>
                  )}

                  {isLocked && isPast && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Info className="w-3 h-3" /> Past month records are
                      read-only.
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Trash2 className="w-4 h-4 text-red-400" /> Delete Salary Record?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the processed salary and unlock it
              for re-processing.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-500 hover:bg-red-600"
              onClick={() => deleteTarget && handleDelete(deleteTarget)}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
