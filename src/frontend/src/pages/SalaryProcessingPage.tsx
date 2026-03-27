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
import {
  type LocalEmployee,
  localGetAllEmployees,
  localGetAllInstitutes,
} from "../hooks/localStore";
import {
  getCurrentSession,
  getSessionList,
  getYearFromSession,
} from "../utils/sessionUtils";

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
  return result.reverse();
}

type SalaryRecord = {
  employeeId: number;
  month: number;
  year: number;
  isLocked: boolean;
  basicSalary: number;
  lwp: number;
  lwpPrev: number;
  lwpCurr: number;
  specialPay: number;
  daPercent: number;
  hraPercent: number;
  da: number;
  hra: number;
  bonus: number;
  daArrears: number;
  arrears: number;
  ta: number;
  conveyanceAllowance: number;
  washingAllowance: number;
  ltc: number;
  festivalAdvance: number;
  incentive: number;
  otherEarnings: number;
  grossEarnings: number;
  grossSalary: number;
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
  netSalary: number;
  pf: number;
  esic: number;
  pt: number;
  employmentType?: string;
};

type SalaryInputs = {
  specialPay: number;
  daPercent: number;
  hraPercent: number;
  bonus: number;
  daArrears: number;
  arrears: number;
  ta: number;
  conveyanceAllowance: number;
  washingAllowance: number;
  ltc: number;
  festivalAdvance: number;
  incentive: number;
  otherEarnings: number;
  houseRent: number;
  electricityCharges: number;
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

function getEmpExtra(employeeId: string) {
  try {
    return JSON.parse(localStorage.getItem(`empExtra_${employeeId}`) || "{}");
  } catch {
    return {};
  }
}

function defaultInputs(emp: LocalEmployee): SalaryInputs {
  const isRegular = emp.employmentType === "regular";
  const empTA = (() => {
    try {
      return Number(getEmpExtra(emp.employeeId).ta) || 0;
    } catch {
      return 0;
    }
  })();
  return {
    specialPay: 0,
    daPercent: isRegular ? 257 : 0,
    hraPercent: isRegular ? 20 : 0,
    bonus: 0,
    daArrears: 0,
    arrears: 0,
    ta: isRegular ? empTA : 0,
    conveyanceAllowance: 0,
    washingAllowance: 0,
    ltc: 0,
    festivalAdvance: 0,
    incentive: 0,
    otherEarnings: 0,
    houseRent: 0,
    electricityCharges: 0,
    lic: 0,
    festival: 0,
    security: 0,
    otherDeductions: 0,
  };
}

function getLWFConfig() {
  try {
    const stored = localStorage.getItem("sms_lwf_config");
    if (stored) return { amount: 10, months: [6, 12], ...JSON.parse(stored) };
  } catch {}
  return { amount: 10, months: [6, 12] };
}

function calcSalary(
  emp: LocalEmployee,
  inputs: SalaryInputs,
  lwpPrev: number,
  lwpCurr: number,
  monthNum: number,
  yearNum: number,
): Omit<SalaryRecord, "isLocked" | "month" | "year"> {
  const basic = Number(emp.basicSalary) || 0;
  const isRegular = emp.employmentType === "regular";

  const prevMonth = monthNum === 1 ? 12 : monthNum - 1;
  const prevYear = monthNum === 1 ? yearNum - 1 : yearNum;
  const totalPrev = getDaysInMonthUtil(prevMonth, prevYear);
  const totalCurr = getDaysInMonthUtil(monthNum, yearNum);

  const lwpDeduction = Math.round(
    (basic * lwpPrev) / totalPrev + (basic * lwpCurr) / totalCurr,
  );
  const adjustedBasic = Math.max(0, basic - lwpDeduction);

  // Auto LWF: read from config
  const lwfConfig = getLWFConfig();
  const lwf = lwfConfig.months.includes(monthNum) ? lwfConfig.amount : 0;

  // VPF from empExtra
  const extra = getEmpExtra(emp.employeeId);
  const vpfMode = extra.vpfMode || "percent";
  const vpfValue = Number(extra.vpfValue || 0);
  const vpf =
    vpfMode === "fixed"
      ? vpfValue
      : Math.round((adjustedBasic * vpfValue) / 100);

  // Earnings - regular employees get all allowances, temp only get arrears
  const da = isRegular
    ? Math.round((adjustedBasic * inputs.daPercent) / 100)
    : 0;
  const hra = isRegular
    ? Math.round((adjustedBasic * inputs.hraPercent) / 100)
    : 0;

  const totalLWP = lwpPrev + lwpCurr;
  const totalPeriodDays = totalPrev - 25 + 1 + 24;
  const ta = isRegular
    ? totalLWP === 0
      ? inputs.ta
      : Math.round(inputs.ta * ((totalPeriodDays - totalLWP) / totalPeriodDays))
    : 0;

  const specialPay = isRegular ? inputs.specialPay : 0;
  const ltc = isRegular ? inputs.ltc : 0;
  const daArrears = isRegular ? inputs.daArrears : 0;

  const grossEarnings =
    adjustedBasic +
    da +
    hra +
    ta +
    specialPay +
    daArrears +
    inputs.conveyanceAllowance +
    inputs.washingAllowance +
    ltc +
    inputs.festivalAdvance +
    inputs.incentive +
    inputs.otherEarnings +
    inputs.bonus +
    (isRegular ? 0 : inputs.arrears);

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
    lwf +
    vpf +
    inputs.lic +
    inputs.festival +
    inputs.security +
    inputs.otherDeductions;

  const netEarnings = grossEarnings - totalDeductions;

  return {
    employeeId: emp.id,
    basicSalary: adjustedBasic,
    lwp: lwpPrev + lwpCurr,
    lwpPrev,
    lwpCurr,
    specialPay,
    daPercent: inputs.daPercent,
    hraPercent: inputs.hraPercent,
    da,
    hra,
    bonus: inputs.bonus,
    daArrears,
    arrears: isRegular ? 0 : inputs.arrears,
    ta,
    conveyanceAllowance: inputs.conveyanceAllowance,
    washingAllowance: inputs.washingAllowance,
    ltc,
    festivalAdvance: inputs.festivalAdvance,
    incentive: inputs.incentive,
    otherEarnings: inputs.otherEarnings,
    grossEarnings,
    grossSalary: grossEarnings,
    houseRent: inputs.houseRent,
    electricityCharges: inputs.electricityCharges,
    lwf,
    epf,
    vpf,
    lic: inputs.lic,
    profTax,
    incomeTax,
    festival: inputs.festival,
    esi,
    security: inputs.security,
    otherDeductions: inputs.otherDeductions,
    totalDeductions,
    netEarnings,
    netSalary: netEarnings,
    pf: epf,
    esic: esi,
    pt: profTax,
    employmentType: emp.employmentType,
  };
}

function getSalaries(): SalaryRecord[] {
  try {
    return JSON.parse(localStorage.getItem("sms_salary") || "[]");
  } catch {
    return [];
  }
}
function saveSalaries(data: SalaryRecord[]) {
  const serialized = JSON.stringify(data);
  localStorage.setItem("sms_salary", serialized);
  try {
    const { syncKeyToBackend } = require("../services/backendSync");
    syncKeyToBackend("sms_salary", serialized);
  } catch {
    // ignore
  }
}
function getAttendance() {
  try {
    return JSON.parse(localStorage.getItem("sms_attendance") || "[]");
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

/** Inline prefix + read-only amount field */
function PrefixReadOnly({
  label,
  prefix,
  value,
}: {
  label: string;
  prefix: string;
  value: number;
}) {
  return (
    <div className="space-y-1">
      <Label className="text-[10px] text-muted-foreground">{label}</Label>
      <div className="flex items-center gap-0">
        <div className="h-7 px-2 flex items-center rounded-l border border-r-0 border-border/60 bg-muted/50 text-[10px] text-muted-foreground font-mono whitespace-nowrap">
          {prefix}
        </div>
        <Input
          type="number"
          value={value || ""}
          readOnly
          className="h-7 text-xs rounded-l-none opacity-70 cursor-default bg-card/30 flex-1 min-w-0"
        />
      </div>
    </div>
  );
}

export default function SalaryProcessingPage() {
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(MONTHS[now.getMonth()]);
  const [selectedSession, setSelectedSession] = useState(getCurrentSession());
  const [selectedInstitute, setSelectedInstitute] = useState("all");
  const [selectedEmployee, setSelectedEmployee] = useState("all");
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null);
  const [expandedEmp, setExpandedEmp] = useState<string | null>(null);
  const [salaryInputs, setSalaryInputs] = useState<
    Record<string, SalaryInputs>
  >({});
  const [lwpState, setLwpState] = useState<
    Record<string, { lwpPrev: number; lwpCurr: number }>
  >({});

  const employees = localGetAllEmployees();
  const institutes = localGetAllInstitutes();
  const attendance = getAttendance();
  const salaries = getSalaries();
  const sessionList = getSessionList();

  const selectedMonthNum = MONTHS.indexOf(selectedMonth) + 1;
  const selectedYearNum = getYearFromSession(selectedSession, selectedMonthNum);

  const isCurrentMonth =
    selectedMonth === MONTHS[now.getMonth()] &&
    selectedYearNum === now.getFullYear();
  const isPast =
    !isCurrentMonth &&
    (selectedYearNum < now.getFullYear() ||
      (selectedYearNum === now.getFullYear() &&
        MONTHS.indexOf(selectedMonth) < now.getMonth()));

  const instituteEmployees = employees.filter(
    (e) =>
      selectedInstitute === "all" ||
      e.instituteId === Number(selectedInstitute),
  );

  const filteredEmployees =
    selectedEmployee === "all"
      ? instituteEmployees
      : instituteEmployees.filter((e) => String(e.id) === selectedEmployee);

  const prevMonthNum = selectedMonthNum === 1 ? 12 : selectedMonthNum - 1;
  const prevYearNum =
    selectedMonthNum === 1 ? selectedYearNum - 1 : selectedYearNum;

  function getAttendanceDays(empId: number): string[] {
    const rec = attendance.find(
      (a: {
        employeeId: number;
        month: number;
        year: number;
        days: string[];
      }) =>
        a.employeeId === empId &&
        a.month === selectedMonthNum &&
        a.year === selectedYearNum,
    );
    return rec?.days || [];
  }

  function getPrevMonthSalary(empId: number) {
    return salaries.find(
      (s: SalaryRecord) =>
        s.employeeId === empId &&
        s.month === prevMonthNum &&
        s.year === prevYearNum,
    );
  }

  function isAttendanceSaved(empId: number) {
    return attendance.some(
      (a: { employeeId: number; month: number; year: number }) =>
        a.employeeId === empId &&
        a.month === selectedMonthNum &&
        a.year === selectedYearNum,
    );
  }

  function getSavedSalary(empId: number) {
    return salaries.find(
      (s: SalaryRecord) =>
        s.employeeId === empId &&
        s.month === selectedMonthNum &&
        s.year === selectedYearNum,
    );
  }

  function getInputs(emp: LocalEmployee): SalaryInputs {
    return salaryInputs[String(emp.id)] ?? defaultInputs(emp);
  }

  function setInputField(
    empKey: string,
    field: keyof SalaryInputs,
    value: number,
  ) {
    setSalaryInputs((prev) => {
      const emp = employees.find((e) => String(e.id) === empKey);
      const current =
        prev[empKey] ?? (emp ? defaultInputs(emp) : ({} as SalaryInputs));
      return { ...prev, [empKey]: { ...current, [field]: value } };
    });
  }

  function getLwp(empId: number) {
    return lwpState[String(empId)] ?? { lwpPrev: 0, lwpCurr: 0 };
  }

  function expandEmployee(empId: number) {
    const days = getAttendanceDays(empId);
    if (days.length > 0) {
      const { lwpPrev, lwpCurr } = calculateLWPFromAttendance(
        days,
        selectedMonthNum,
        selectedYearNum,
      );
      setLwpState((prev) => ({
        ...prev,
        [String(empId)]: { lwpPrev, lwpCurr },
      }));
    }
    setExpandedEmp(String(empId));
  }

  function handleProcess(emp: LocalEmployee) {
    if (!isAttendanceSaved(emp.id)) {
      toast.error("Save attendance first before processing salary.");
      return;
    }
    const inputs = getInputs(emp);
    const { lwpPrev, lwpCurr } = getLwp(emp.id);
    const calc = calcSalary(
      emp,
      inputs,
      lwpPrev,
      lwpCurr,
      selectedMonthNum,
      selectedYearNum,
    );
    const newRecord: SalaryRecord = {
      ...calc,
      month: selectedMonthNum,
      year: selectedYearNum,
      isLocked: true,
    };
    const updated = salaries.filter(
      (s: SalaryRecord) =>
        !(
          s.employeeId === emp.id &&
          s.month === selectedMonthNum &&
          s.year === selectedYearNum
        ),
    );
    updated.push(newRecord);
    saveSalaries(updated);
    toast.success(`Salary processed for ${emp.name}`);
    setExpandedEmp(null);
  }

  function handleDelete(empId: number) {
    const updated = salaries.filter(
      (s: SalaryRecord) =>
        !(
          s.employeeId === empId &&
          s.month === selectedMonthNum &&
          s.year === selectedYearNum
        ),
    );
    saveSalaries(updated);
    toast.success("Salary record deleted and unlocked.");
    setDeleteTarget(null);
  }

  const fmt = (n: number) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

  const instituteMap = new Map(institutes.map((i) => [i.id, i.name]));

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
            <SelectContent className="max-h-[250px] overflow-y-auto">
              <SelectItem value="all">All Institutes</SelectItem>
              {institutes.map((inst) => (
                <SelectItem key={inst.id} value={String(inst.id)}>
                  {inst.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
            <SelectTrigger className="w-44 h-9">
              <Users className="w-3.5 h-3.5 mr-1 text-muted-foreground" />
              <SelectValue placeholder="All Employees" />
            </SelectTrigger>
            <SelectContent className="max-h-[250px] overflow-y-auto">
              <SelectItem value="all">All Employees</SelectItem>
              {instituteEmployees.map((emp) => (
                <SelectItem key={emp.id} value={String(emp.id)}>
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
            <SelectContent className="max-h-[250px] overflow-y-auto">
              {getSessionMonthNames().map((m) => (
                <SelectItem key={m} value={m}>
                  {m}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedSession} onValueChange={setSelectedSession}>
            <SelectTrigger className="w-28 h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="max-h-[250px] overflow-y-auto">
              {sessionList.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
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
            const saved = getSavedSalary(emp.id);
            const isLocked = !!saved?.isLocked;
            const attSaved = isAttendanceSaved(emp.id);
            const inputs = getInputs(emp);
            const { lwpPrev, lwpCurr } = getLwp(emp.id);
            const preview = calcSalary(
              emp,
              inputs,
              lwpPrev,
              lwpCurr,
              selectedMonthNum,
              selectedYearNum,
            );
            const isExpanded = expandedEmp === String(emp.id);
            const empKey = String(emp.id);
            const instituteName = instituteMap.get(emp.instituteId) ?? "—";
            const isTemporary = emp.employmentType !== "regular";
            const extra = getEmpExtra(emp.employeeId);
            const displayDesignation = extra.designation || emp.designation;
            const empVpfMode = extra.vpfMode || "percent";
            const empVpfValue = Number(extra.vpfValue || 0);

            // LWP deduction amount
            const prevMonth2 =
              selectedMonthNum === 1 ? 12 : selectedMonthNum - 1;
            const prevYear2 =
              selectedMonthNum === 1 ? selectedYearNum - 1 : selectedYearNum;
            const totalPrevDays = getDaysInMonthUtil(prevMonth2, prevYear2);
            const totalCurrDays = getDaysInMonthUtil(
              selectedMonthNum,
              selectedYearNum,
            );
            const basic = Number(emp.basicSalary) || 0;
            const lwpDeductionAmount = Math.round(
              (basic * lwpPrev) / totalPrevDays +
                (basic * lwpCurr) / totalCurrDays,
            );

            return (
              <Card
                key={emp.id}
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
                      {displayDesignation} | {instituteName}
                    </p>
                    {isLocked && saved && (
                      <div className="flex items-center gap-3 text-xs">
                        <span className="text-muted-foreground">
                          Basic:{" "}
                          <strong className="text-foreground">
                            {fmt(saved.basicSalary ?? 0)}
                          </strong>
                        </span>
                        <span className="text-muted-foreground">
                          Gross:{" "}
                          <strong className="text-blue-400">
                            {fmt(saved.grossEarnings ?? 0)}
                          </strong>
                        </span>
                        <span className="text-muted-foreground">
                          Net:{" "}
                          <strong className="text-green-400">
                            {fmt(saved.netEarnings ?? 0)}
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
                            {fmt(preview.basicSalary)}
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
                          const prevSal = getPrevMonthSalary(emp.id);
                          const hasCurrent = !!getSavedSalary(emp.id);
                          if (attSaved && prevSal && !hasCurrent) {
                            return (
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 text-xs gap-1"
                                onClick={() => {
                                  setSalaryInputs((prev) => ({
                                    ...prev,
                                    [empKey]: {
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
                                      arrears: prevSal.arrears ?? 0,
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
                                      lic: prevSal.lic ?? 0,
                                      festival: prevSal.festival ?? 0,
                                      security: prevSal.security ?? 0,
                                      otherDeductions:
                                        prevSal.otherDeductions ?? 0,
                                    },
                                  }));
                                  expandEmployee(emp.id);
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
                          onClick={() => expandEmployee(emp.id)}
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
                            const prevSal = getPrevMonthSalary(emp.id);
                            if (prevSal && !isPast) {
                              return (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-7 text-xs gap-1"
                                  onClick={() => {
                                    setSalaryInputs((prev) => ({
                                      ...prev,
                                      [empKey]: {
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
                                        arrears: prevSal.arrears ?? 0,
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
                          {/* Basic - from salary details (read-only) */}
                          <NumInput
                            label="Basic Pay"
                            value={preview.basicSalary}
                            readOnly
                          />

                          {/* LWP deduction display */}
                          <div className="space-y-1">
                            <Label className="text-[10px] text-muted-foreground">
                              LWP Deduction
                              {(lwpPrev > 0 || lwpCurr > 0) && (
                                <span className="ml-1 opacity-70">
                                  ({lwpPrev}p+{lwpCurr}c days)
                                </span>
                              )}
                            </Label>
                            <div className="h-7 px-2 flex items-center rounded border border-red-500/40 bg-card/30">
                              <span className="text-xs font-bold text-red-500">
                                {lwpDeductionAmount > 0
                                  ? `-${fmt(lwpDeductionAmount)}`
                                  : "₹0"}
                              </span>
                            </div>
                          </div>

                          {/* Regular-only fields */}
                          {!isTemporary && (
                            <>
                              <NumInput
                                label="Special Pay"
                                value={inputs.specialPay}
                                onChange={(v) =>
                                  setInputField(empKey, "specialPay", v)
                                }
                              />
                              {/* DA with inline % prefix */}
                              <PrefixReadOnly
                                label="DA"
                                prefix={`${inputs.daPercent}%`}
                                value={preview.da ?? 0}
                              />
                              {/* HRA with inline % prefix */}
                              <PrefixReadOnly
                                label="HRA"
                                prefix={`${inputs.hraPercent}%`}
                                value={preview.hra ?? 0}
                              />
                              <NumInput
                                label="TA"
                                value={inputs.ta}
                                onChange={(v) => setInputField(empKey, "ta", v)}
                              />
                              <NumInput
                                label="LTC"
                                value={inputs.ltc}
                                onChange={(v) =>
                                  setInputField(empKey, "ltc", v)
                                }
                              />
                              <NumInput
                                label="DA Arrears"
                                value={inputs.daArrears}
                                onChange={(v) =>
                                  setInputField(empKey, "daArrears", v)
                                }
                              />
                            </>
                          )}

                          {/* Temporary-only: Arrears */}
                          {isTemporary && (
                            <NumInput
                              label="Arrears"
                              value={inputs.arrears}
                              onChange={(v) =>
                                setInputField(empKey, "arrears", v)
                              }
                            />
                          )}

                          <NumInput
                            label="Conveyance"
                            value={inputs.conveyanceAllowance}
                            onChange={(v) =>
                              setInputField(empKey, "conveyanceAllowance", v)
                            }
                          />
                          <NumInput
                            label="Washing Allow."
                            value={inputs.washingAllowance}
                            onChange={(v) =>
                              setInputField(empKey, "washingAllowance", v)
                            }
                          />
                          <NumInput
                            label="Bonus"
                            value={inputs.bonus}
                            onChange={(v) => setInputField(empKey, "bonus", v)}
                          />
                          <NumInput
                            label="Festival Adv."
                            value={inputs.festivalAdvance}
                            onChange={(v) =>
                              setInputField(empKey, "festivalAdvance", v)
                            }
                          />
                          <NumInput
                            label="Incentive"
                            value={inputs.incentive}
                            onChange={(v) =>
                              setInputField(empKey, "incentive", v)
                            }
                          />
                          <NumInput
                            label="Other Earnings"
                            value={inputs.otherEarnings}
                            onChange={(v) =>
                              setInputField(empKey, "otherEarnings", v)
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
                              setInputField(empKey, "houseRent", v)
                            }
                          />
                          <NumInput
                            label="Electricity"
                            value={inputs.electricityCharges}
                            onChange={(v) =>
                              setInputField(empKey, "electricityCharges", v)
                            }
                          />

                          {/* LWF: auto from config */}
                          <div className="space-y-1">
                            <Label className="text-[10px] text-muted-foreground">
                              LWF
                            </Label>
                            <div className="h-7 px-2 flex items-center rounded border border-border/40 bg-card/30">
                              {(() => {
                                const lwfCfg = getLWFConfig();
                                const lwfAmt = lwfCfg.months.includes(
                                  selectedMonthNum,
                                )
                                  ? lwfCfg.amount
                                  : 0;
                                return lwfAmt > 0 ? (
                                  <span className="text-xs text-amber-400 font-semibold">
                                    ₹{lwfAmt} (auto)
                                  </span>
                                ) : (
                                  <span className="text-xs text-muted-foreground">
                                    ₹0 (not applicable)
                                  </span>
                                );
                              })()}
                            </div>
                          </div>

                          {/* EPF with inline % prefix */}
                          <PrefixReadOnly
                            label="EPF"
                            prefix="12%"
                            value={preview.epf}
                          />

                          {/* VPF from salary details */}
                          <div className="space-y-1">
                            <Label className="text-[10px] text-muted-foreground">
                              VPF
                            </Label>
                            <div className="flex items-center gap-0">
                              <div className="h-7 px-2 flex items-center rounded-l border border-r-0 border-border/60 bg-muted/50 text-[10px] text-muted-foreground font-mono whitespace-nowrap">
                                {empVpfMode === "percent"
                                  ? `${empVpfValue}%`
                                  : "₹"}
                              </div>
                              <Input
                                type="number"
                                value={preview.vpf || ""}
                                readOnly
                                className="h-7 text-xs rounded-l-none opacity-70 cursor-default bg-card/30 flex-1 min-w-0"
                              />
                            </div>
                          </div>

                          <NumInput
                            label="LIC"
                            value={inputs.lic}
                            onChange={(v) => setInputField(empKey, "lic", v)}
                          />

                          {/* Prof Tax */}
                          <PrefixReadOnly
                            label="Prof. Tax"
                            prefix="PT"
                            value={preview.profTax}
                          />

                          {/* Income Tax */}
                          <PrefixReadOnly
                            label="Income Tax"
                            prefix="IT"
                            value={preview.incomeTax}
                          />

                          <NumInput
                            label="Festival"
                            value={inputs.festival}
                            onChange={(v) =>
                              setInputField(empKey, "festival", v)
                            }
                          />

                          {/* ESIC with inline % prefix */}
                          <PrefixReadOnly
                            label="ESIC"
                            prefix="0.75%"
                            value={preview.esi}
                          />

                          <NumInput
                            label="Security"
                            value={inputs.security}
                            onChange={(v) =>
                              setInputField(empKey, "security", v)
                            }
                          />
                          <NumInput
                            label="Other Deductions"
                            value={inputs.otherDeductions}
                            onChange={(v) =>
                              setInputField(empKey, "otherDeductions", v)
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
                        onClick={() => setDeleteTarget(emp.id)}
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
              onClick={() =>
                deleteTarget !== null && handleDelete(deleteTarget)
              }
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
