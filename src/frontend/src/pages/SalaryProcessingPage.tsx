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
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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
  RefreshCw,
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
  annualGross: number;
  annualTaxable: number;
  taxBeforeRebate: number;
  itRebate: number;
  taxAfterRebate: number;
  itCess: number;
  annualIT: number;
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
  chequePay?: number;
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
  chequePay: number;
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
  const empIncentive = (() => {
    try {
      return Number(getEmpExtra(emp.employeeId).incentive) || 0;
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
    ta: empTA,
    conveyanceAllowance: 0,
    washingAllowance: 0,
    ltc: 0,
    festivalAdvance: 0,
    incentive: empIncentive,
    otherEarnings: 0,
    houseRent: 0,
    electricityCharges: 0,
    lic: 0,
    festival: 0,
    security: 0,
    otherDeductions: 0,
    chequePay: 0,
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
  const ta =
    totalLWP === 0
      ? inputs.ta
      : Math.round(
          inputs.ta * ((totalPeriodDays - totalLWP) / totalPeriodDays),
        );

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

  // EPF base: regular = basic+specialPay+DA+daArrears; temporary = basic+arrears
  const epfBase = isRegular
    ? adjustedBasic + (inputs.specialPay || 0) + da + daArrears
    : adjustedBasic + (inputs.arrears || 0);
  const epf = Math.round(epfBase * 0.12);
  const esicBase = grossEarnings - inputs.conveyanceAllowance - inputs.bonus;
  const esi = esicBase <= 21000 ? Math.round(esicBase * 0.0075) : 0;

  // Financial year position: April=0, May=1, ..., March=11
  const calToFY = (m: number) => (m >= 4 ? m - 4 : m + 8); // monthNum is 1-based
  const fyPosition = calToFY(monthNum); // 0=April
  const monthsRemaining = 12 - fyPosition; // incl. current month

  // Load prior months' gross from saved salary records for this FY
  let priorGrossTotal = 0;
  if (fyPosition > 0) {
    const allSalaries = getSalaries();
    for (let i = 0; i < fyPosition; i++) {
      // FY index i -> calendar month
      // Actually: April=4,May=5,...,Dec=12,Jan=1,Feb=2,Mar=3
      const calMonth = i + 4 <= 12 ? i + 4 : i + 4 - 12;
      // Prior months' year: Apr-Dec prior months are in same FY
      // If processing Jan/Feb/Mar (yearNum), FY started Apr of yearNum-1
      // If processing Apr-Dec (yearNum), FY started Apr of yearNum
      const fyStartYear = monthNum >= 4 ? yearNum : yearNum - 1;
      const calYear = calMonth >= 4 ? fyStartYear : fyStartYear + 1;
      const saved = allSalaries.find(
        (s) =>
          s.employeeId === emp.id && s.month === calMonth && s.year === calYear,
      );
      if (saved) {
        priorGrossTotal += saved.grossEarnings || 0;
      } else {
        priorGrossTotal += grossEarnings; // fallback: assume same gross
      }
    }
  }
  const annualGross = priorGrossTotal + grossEarnings * monthsRemaining;

  let profTax = 0;
  if (annualGross >= 400000) profTax = 208;
  else if (annualGross >= 300000) profTax = 167;
  else if (annualGross >= 225000) profTax = 125;

  const annualTaxable = Math.max(0, annualGross - 75000);
  let taxBeforeRebate = 0;
  if (annualTaxable > 2400000)
    taxBeforeRebate = (annualTaxable - 2400000) * 0.3 + 300000;
  else if (annualTaxable > 2000000)
    taxBeforeRebate = (annualTaxable - 2000000) * 0.25 + 200000;
  else if (annualTaxable > 1600000)
    taxBeforeRebate = (annualTaxable - 1600000) * 0.2 + 120000;
  else if (annualTaxable > 1200000)
    taxBeforeRebate = (annualTaxable - 1200000) * 0.15 + 60000;
  else if (annualTaxable > 800000)
    taxBeforeRebate = (annualTaxable - 800000) * 0.1 + 20000;
  else if (annualTaxable > 400000)
    taxBeforeRebate = (annualTaxable - 400000) * 0.05;
  const rebate =
    annualTaxable < 1275000
      ? Math.max(0, taxBeforeRebate - (annualTaxable - 1200000))
      : 0;
  const taxAfterRebate = Math.max(0, taxBeforeRebate - rebate);
  const cess = taxAfterRebate * 0.04;
  const annualIT = Math.max(0, taxAfterRebate - cess);

  // Prorate: compute tax already accounted in prior months then spread remainder
  let taxAlreadyPaid = 0;
  if (fyPosition > 0) {
    const priorAnnualGross =
      priorGrossTotal + grossEarnings * (12 - fyPosition + fyPosition);
    const priorAnnualTaxable = Math.max(0, priorAnnualGross - 75000);
    let priorTBR = 0;
    if (priorAnnualTaxable > 2400000)
      priorTBR = (priorAnnualTaxable - 2400000) * 0.3 + 300000;
    else if (priorAnnualTaxable > 2000000)
      priorTBR = (priorAnnualTaxable - 2000000) * 0.25 + 200000;
    else if (priorAnnualTaxable > 1600000)
      priorTBR = (priorAnnualTaxable - 1600000) * 0.2 + 120000;
    else if (priorAnnualTaxable > 1200000)
      priorTBR = (priorAnnualTaxable - 1200000) * 0.15 + 60000;
    else if (priorAnnualTaxable > 800000)
      priorTBR = (priorAnnualTaxable - 800000) * 0.1 + 20000;
    else if (priorAnnualTaxable > 400000)
      priorTBR = (priorAnnualTaxable - 400000) * 0.05;
    const priorRebate =
      priorAnnualTaxable < 1275000
        ? Math.max(0, priorTBR - (priorAnnualTaxable - 1200000))
        : 0;
    const priorTAR = Math.max(0, priorTBR - priorRebate);
    const priorCess = priorTAR * 0.04;
    const priorAnnualIT = Math.max(0, priorTAR - priorCess);
    taxAlreadyPaid = Math.round((priorAnnualIT * fyPosition) / 12);
  }
  const incomeTax = Math.max(
    0,
    Math.round((annualIT - taxAlreadyPaid) / monthsRemaining),
  );

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
    annualGross: annualGross,
    annualTaxable,
    taxBeforeRebate,
    itRebate: rebate,
    taxAfterRebate,
    itCess: cess,
    annualIT,
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

  const employees = localGetAllEmployees().filter((emp) => {
    try {
      const extra = getEmpExtra(emp.employeeId);
      const status = extra.employeeStatus || "Active";
      return status === "Active" || status === "" || !status;
    } catch {
      return true;
    }
  });
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
    const empExtraForValidation = getEmpExtra(emp.employeeId);
    const inputsForValidation = getInputs(emp);
    if (empExtraForValidation.bhelQuarter === "yes") {
      if (
        !inputsForValidation.houseRent ||
        inputsForValidation.houseRent === 0
      ) {
        toast.error("House Rent is mandatory for BHEL quarter employees.");
        return;
      }
      if (
        !inputsForValidation.electricityCharges ||
        inputsForValidation.electricityCharges === 0
      ) {
        toast.error(
          "Electricity charges are mandatory for BHEL quarter employees.",
        );
        return;
      }
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
      chequePay: inputs.chequePay ?? 0,
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
    toast.error("Salary record deleted and unlocked.");
    setDeleteTarget(null);
  }

  const fmt = (n: number) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

  const instituteMap = new Map(institutes.map((i) => [i.id, i.name]));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center glow-primary">
            <Calculator className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-display font-bold text-gradient">
              Salary Processing
            </h1>
            <p className="text-sm text-muted-foreground">
              Process and manage monthly salaries
            </p>
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
                  {(inst as any).shortCode || inst.name}
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
              {getSessionMonthNames(selectedSession).map((m) => (
                <SelectItem key={m} value={m}>
                  {m.slice(0, 3)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={selectedSession}
            onValueChange={(newSession) => {
              setSelectedSession(newSession);
              // Auto-select latest month for this session
              const curM = now.getMonth() + 1;
              const curY = now.getFullYear();
              const _sessStart = Number.parseInt(newSession.split("-")[0]);
              const thisSessStr =
                curM >= 4
                  ? `${curY}-${String(curY + 1).slice(2)}`
                  : `${curY - 1}-${String(curY).slice(2)}`;
              if (newSession === thisSessStr) {
                setSelectedMonth(MONTHS[curM - 1]);
              } else {
                setSelectedMonth("March");
              }
            }}
          >
            <SelectTrigger className="w-28 h-9">
              <CalendarDays className="w-3.5 h-3.5 mr-1 text-muted-foreground" />
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
                                      chequePay: 0,
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
                                        chequePay: 0,
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
                          {/* Basic - from salary details (read-only) with LWP breakdown */}
                          <div className="space-y-1">
                            <div className="flex items-center gap-1">
                              <Label className="text-[10px] text-muted-foreground">
                                Basic Pay
                              </Label>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <button
                                    type="button"
                                    className="inline-flex items-center justify-center w-3.5 h-3.5 text-muted-foreground/60 hover:text-primary transition-colors"
                                    data-ocid="salary.basic_breakdown.open_modal_button"
                                  >
                                    <Info className="w-3.5 h-3.5" />
                                  </button>
                                </PopoverTrigger>
                                <PopoverContent
                                  className="w-80 p-3"
                                  side="top"
                                  align="start"
                                >
                                  <p className="text-xs font-semibold text-foreground mb-2">
                                    Basic Pay Breakdown
                                  </p>
                                  <div className="space-y-1 text-[11px]">
                                    {(() => {
                                      const rawBasic =
                                        Number(emp.basicSalary) || 0;
                                      const prevMonthB =
                                        selectedMonthNum === 1
                                          ? 12
                                          : selectedMonthNum - 1;
                                      const prevYearB =
                                        selectedMonthNum === 1
                                          ? selectedYearNum - 1
                                          : selectedYearNum;
                                      const daysInPrev = getDaysInMonthUtil(
                                        prevMonthB,
                                        prevYearB,
                                      );
                                      const daysInCurr = getDaysInMonthUtil(
                                        selectedMonthNum,
                                        selectedYearNum,
                                      );

                                      // Parse attendance days to get LWP dates
                                      const attDays = getAttendanceDays(emp.id);
                                      const lwpDates: {
                                        label: string;
                                        leaveType: string;
                                        isPrev: boolean;
                                      }[] = [];
                                      for (const item of attDays) {
                                        const parts = item.split(":");
                                        const key = parts[0];
                                        const status = parts[1];
                                        const leaveType = parts[2] || "LWP";
                                        if (
                                          status === "absent" &&
                                          leaveType === "LWP"
                                        ) {
                                          const isPrev =
                                            key.startsWith("prev_");
                                          const dayNum = isPrev
                                            ? key.replace("prev_", "")
                                            : key;
                                          const monthLabel = isPrev
                                            ? MONTHS[prevMonthB - 1].slice(0, 3)
                                            : MONTHS[
                                                selectedMonthNum - 1
                                              ].slice(0, 3);
                                          lwpDates.push({
                                            label: `${dayNum}-${monthLabel}`,
                                            leaveType,
                                            isPrev,
                                          });
                                        }
                                      }
                                      const lwpPrevDates = lwpDates.filter(
                                        (d) => d.isPrev,
                                      );
                                      const lwpCurrDates = lwpDates.filter(
                                        (d) => !d.isPrev,
                                      );

                                      return (
                                        <>
                                          <div className="flex justify-between text-muted-foreground">
                                            <span>
                                              Basic (from Salary Details)
                                            </span>
                                            <span className="font-mono">
                                              ₹
                                              {rawBasic.toLocaleString("en-IN")}
                                            </span>
                                          </div>
                                          <div className="border-t border-border/40 pt-1 mt-1">
                                            <p className="text-muted-foreground font-semibold mb-0.5">
                                              LWP — Prev Month (
                                              {MONTHS[prevMonthB - 1]},{" "}
                                              {daysInPrev} days)
                                            </p>
                                            {lwpPrevDates.length === 0 ? (
                                              <p className="text-muted-foreground/60 italic">
                                                No LWP days
                                              </p>
                                            ) : (
                                              <p className="text-red-400 font-mono">
                                                {lwpPrev} day(s):{" "}
                                                {lwpPrevDates
                                                  .map((d) => d.label)
                                                  .join(", ")}
                                              </p>
                                            )}
                                          </div>
                                          <div className="border-t border-border/40 pt-1 mt-1">
                                            <p className="text-muted-foreground font-semibold mb-0.5">
                                              LWP — Curr Month (
                                              {MONTHS[selectedMonthNum - 1]},{" "}
                                              {daysInCurr} days)
                                            </p>
                                            {lwpCurrDates.length === 0 ? (
                                              <p className="text-muted-foreground/60 italic">
                                                No LWP days
                                              </p>
                                            ) : (
                                              <p className="text-red-400 font-mono">
                                                {lwpCurr} day(s):{" "}
                                                {lwpCurrDates
                                                  .map((d) => d.label)
                                                  .join(", ")}
                                              </p>
                                            )}
                                          </div>
                                          <div className="border-t border-border/40 pt-1 mt-1 text-muted-foreground/80">
                                            <p className="font-semibold mb-0.5">
                                              LWP Deduction Formula
                                            </p>
                                            <p className="font-mono text-[10px]">
                                              round(({rawBasic}×{lwpPrev}/
                                              {daysInPrev}) + ({rawBasic}×
                                              {lwpCurr}/{daysInCurr})) ={" "}
                                              {lwpDeductionAmount}
                                            </p>
                                          </div>
                                          <div className="border-t border-border/50 pt-1 flex justify-between font-semibold text-foreground">
                                            <span>Basic after LWP</span>
                                            <span className="font-mono">
                                              ₹
                                              {preview.basicSalary.toLocaleString(
                                                "en-IN",
                                              )}
                                            </span>
                                          </div>
                                        </>
                                      );
                                    })()}
                                  </div>
                                </PopoverContent>
                              </Popover>
                            </div>
                            <Input
                              type="number"
                              value={preview.basicSalary || ""}
                              readOnly
                              className="h-7 text-xs opacity-70 cursor-default bg-card/30"
                            />
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

                          {/* Regular employees: read-only TA from salary details */}
                          {!isTemporary && (
                            <PrefixReadOnly
                              label="TA"
                              prefix="Sal.Det."
                              value={inputs.ta}
                            />
                          )}

                          {/* Temporary-only: Arrears + read-only TA */}
                          {isTemporary && (
                            <>
                              <NumInput
                                label="Arrears"
                                value={inputs.arrears}
                                onChange={(v) =>
                                  setInputField(empKey, "arrears", v)
                                }
                              />
                              <PrefixReadOnly
                                label="TA"
                                prefix="Sal.Det."
                                value={inputs.ta}
                              />
                            </>
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
                          <PrefixReadOnly
                            label="Incentive"
                            prefix="Sal.Det."
                            value={inputs.incentive}
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
                          {/* House Rent & Electricity - only for BHEL quarter employees */}
                          {extra.bhelQuarter === "yes" && (
                            <>
                              <div className="space-y-1">
                                <Label className="text-[10px] text-red-400 font-semibold">
                                  House Rent<span className="ml-0.5">*</span>
                                </Label>
                                <Input
                                  type="number"
                                  value={inputs.houseRent || ""}
                                  onChange={(e) =>
                                    setInputField(
                                      empKey,
                                      "houseRent",
                                      Number(e.target.value),
                                    )
                                  }
                                  className={`h-7 text-xs bg-card/30 ${inputs.houseRent === 0 ? "border-red-500/60 ring-1 ring-red-500/30" : "border-border/60"}`}
                                  placeholder="0"
                                />
                                {inputs.houseRent === 0 && (
                                  <p className="text-[10px] text-red-400">
                                    Required for BHEL quarter
                                  </p>
                                )}
                              </div>
                              <div className="space-y-1">
                                <Label className="text-[10px] text-red-400 font-semibold">
                                  Electricity<span className="ml-0.5">*</span>
                                </Label>
                                <Input
                                  type="number"
                                  value={inputs.electricityCharges || ""}
                                  onChange={(e) =>
                                    setInputField(
                                      empKey,
                                      "electricityCharges",
                                      Number(e.target.value),
                                    )
                                  }
                                  className={`h-7 text-xs bg-card/30 ${inputs.electricityCharges === 0 ? "border-red-500/60 ring-1 ring-red-500/30" : "border-border/60"}`}
                                  placeholder="0"
                                />
                                {inputs.electricityCharges === 0 && (
                                  <p className="text-[10px] text-red-400">
                                    Required for BHEL quarter
                                  </p>
                                )}
                              </div>
                            </>
                          )}

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

                          {/* LIC - shown only if employee has LIC nos */}
                          {(() => {
                            const licNos: string[] = Array.isArray(extra.licNos)
                              ? extra.licNos
                              : extra?.licNo
                                ? [extra.licNo]
                                : [];
                            const validLicNos = licNos.filter((n) => n?.trim());
                            if (validLicNos.length === 0) return null;
                            const licAmounts: number[] = Array.isArray(
                              extra.licAmounts,
                            )
                              ? extra.licAmounts.map(Number)
                              : Array(validLicNos.length).fill(0);
                            const totalLic = licAmounts.reduce(
                              (s, v) => s + (v || 0),
                              0,
                            );
                            return (
                              <div className="space-y-1">
                                <div className="flex items-center gap-1">
                                  <Label className="text-[10px] text-muted-foreground">
                                    LIC
                                  </Label>
                                  <Popover>
                                    <PopoverTrigger asChild>
                                      <button
                                        type="button"
                                        className="inline-flex items-center justify-center w-3.5 h-3.5 text-muted-foreground/60 hover:text-primary transition-colors"
                                        data-ocid="salary.lic_breakdown.open_modal_button"
                                      >
                                        <Info className="w-3.5 h-3.5" />
                                      </button>
                                    </PopoverTrigger>
                                    <PopoverContent
                                      className="w-64 text-xs space-y-2 p-3"
                                      side="right"
                                    >
                                      <p className="font-semibold text-sm mb-2">
                                        LIC Breakdown
                                      </p>
                                      {validLicNos.map((licNo, i) => (
                                        <div
                                          key={licNo}
                                          className="flex justify-between"
                                        >
                                          <span className="font-mono text-muted-foreground">
                                            {licNo}
                                          </span>
                                          <span className="font-mono">
                                            ₹
                                            {(
                                              licAmounts[i] || 0
                                            ).toLocaleString("en-IN")}
                                          </span>
                                        </div>
                                      ))}
                                      <div className="border-t border-border/40 pt-1 flex justify-between font-semibold">
                                        <span>Total LIC</span>
                                        <span>
                                          ₹{totalLic.toLocaleString("en-IN")}
                                        </span>
                                      </div>
                                    </PopoverContent>
                                  </Popover>
                                </div>
                                <div className="flex items-center gap-1">
                                  <span className="inline-flex items-center justify-center h-7 px-2 text-[10px] font-semibold rounded-l border border-border/60 bg-muted/50 text-muted-foreground whitespace-nowrap shrink-0">
                                    LIC
                                  </span>
                                  <input
                                    type="number"
                                    value={totalLic}
                                    readOnly
                                    className="h-7 text-xs rounded-l-none border border-l-0 border-border/60 opacity-70 cursor-default bg-card/30 flex-1 min-w-0 px-2"
                                  />
                                </div>
                              </div>
                            );
                          })()}

                          {/* Prof Tax with breakdown */}
                          <div className="space-y-1">
                            <div className="flex items-center gap-1">
                              <Label className="text-[10px] text-muted-foreground">
                                Prof. Tax
                              </Label>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <button
                                    type="button"
                                    className="inline-flex items-center justify-center w-3.5 h-3.5 text-muted-foreground/60 hover:text-primary transition-colors"
                                    data-ocid="salary.pt_breakdown.open_modal_button"
                                  >
                                    <Info className="w-3.5 h-3.5" />
                                  </button>
                                </PopoverTrigger>
                                <PopoverContent
                                  className="w-72 p-3"
                                  side="top"
                                  align="start"
                                >
                                  <p className="text-xs font-semibold text-foreground mb-2">
                                    Professional Tax Breakdown
                                  </p>
                                  <div className="space-y-1 text-[11px]">
                                    <div className="flex justify-between text-muted-foreground mb-1">
                                      <span>Monthly Gross</span>
                                      <span>
                                        ₹
                                        {(
                                          preview.grossEarnings ?? 0
                                        ).toLocaleString("en-IN")}
                                      </span>
                                    </div>
                                    <div className="flex justify-between text-muted-foreground mb-2">
                                      <span>Annual Gross (Projected)</span>
                                      <span>
                                        ₹
                                        {(
                                          preview.annualGross ?? 0
                                        ).toLocaleString("en-IN")}
                                      </span>
                                    </div>
                                    <p className="text-[10px] text-muted-foreground/70 uppercase tracking-wide mb-1">
                                      PT Slab
                                    </p>
                                    {[
                                      {
                                        range: "Below ₹2,25,000",
                                        monthly: "₹0",
                                        active:
                                          (preview.annualGross ?? 0) < 225000,
                                      },
                                      {
                                        range: "₹2,25,000 – ₹3,00,000",
                                        monthly: "₹125",
                                        active:
                                          (preview.annualGross ?? 0) >=
                                            225000 &&
                                          (preview.annualGross ?? 0) < 300000,
                                      },
                                      {
                                        range: "₹3,00,001 – ₹4,00,000",
                                        monthly: "₹167",
                                        active:
                                          (preview.annualGross ?? 0) >=
                                            300000 &&
                                          (preview.annualGross ?? 0) < 400000,
                                      },
                                      {
                                        range: "₹4,00,001+",
                                        monthly: "₹208",
                                        active:
                                          (preview.annualGross ?? 0) >= 400000,
                                      },
                                    ].map((slab) => (
                                      <div
                                        key={slab.range}
                                        className={`flex justify-between py-0.5 ${slab.active ? "text-green-400 font-semibold" : "text-muted-foreground"}`}
                                      >
                                        <span>{slab.range}</span>
                                        <span>{slab.monthly}/mo</span>
                                      </div>
                                    ))}
                                    <div className="flex justify-between border-t border-border/40 mt-1 pt-1 font-semibold text-foreground">
                                      <span>Monthly P. Tax</span>
                                      <span>
                                        ₹
                                        {(preview.profTax ?? 0).toLocaleString(
                                          "en-IN",
                                        )}
                                      </span>
                                    </div>
                                  </div>
                                </PopoverContent>
                              </Popover>
                            </div>
                            <div className="flex items-center">
                              <span className="h-7 px-2 flex items-center text-xs font-mono bg-muted/40 border border-r-0 border-border/60 rounded-l text-muted-foreground">
                                PT
                              </span>
                              <input
                                type="number"
                                value={preview.profTax || ""}
                                readOnly
                                className="h-7 text-xs rounded-l-none border border-l-0 border-border/60 opacity-70 cursor-default bg-card/30 flex-1 min-w-0 px-2"
                              />
                            </div>
                          </div>

                          {/* Income Tax with breakdown */}
                          <div className="space-y-1">
                            <div className="flex items-center gap-1">
                              <Label className="text-[10px] text-muted-foreground">
                                Income Tax
                              </Label>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <button
                                    type="button"
                                    className="inline-flex items-center justify-center w-3.5 h-3.5 text-muted-foreground/60 hover:text-primary transition-colors"
                                    data-ocid="salary.it_breakdown.open_modal_button"
                                  >
                                    <Info className="w-3.5 h-3.5" />
                                  </button>
                                </PopoverTrigger>
                                <PopoverContent
                                  className="w-72 p-3"
                                  side="top"
                                  align="start"
                                >
                                  <p className="text-xs font-semibold text-foreground mb-2">
                                    Income Tax Breakdown
                                  </p>
                                  <div className="space-y-1 text-[11px]">
                                    {[
                                      [
                                        "Monthly Gross",
                                        `₹${preview.grossEarnings.toLocaleString("en-IN")}`,
                                      ],
                                      [
                                        "Annual Gross (Projected)",
                                        `₹${(preview.annualGross ?? preview.grossEarnings * 12).toLocaleString("en-IN")}`,
                                      ],
                                      ["Standard Deduction", "₹75,000"],
                                      [
                                        "Annual Taxable Income",
                                        `₹${(preview.annualTaxable ?? 0).toLocaleString("en-IN")}`,
                                      ],
                                      [
                                        "Tax Before Rebate",
                                        `₹${Math.round(preview.taxBeforeRebate ?? 0).toLocaleString("en-IN")}`,
                                      ],
                                      [
                                        "Rebate",
                                        `₹${Math.round(preview.itRebate ?? 0).toLocaleString("en-IN")}`,
                                      ],
                                      [
                                        "Tax After Rebate",
                                        `₹${Math.round(preview.taxAfterRebate ?? 0).toLocaleString("en-IN")}`,
                                      ],
                                      [
                                        "Cess (4%)",
                                        `₹${Math.round(preview.itCess ?? 0).toLocaleString("en-IN")}`,
                                      ],
                                      [
                                        "Annual IT",
                                        `₹${Math.round(preview.annualIT ?? 0).toLocaleString("en-IN")}`,
                                      ],
                                    ].map(([label, val]) => (
                                      <div
                                        key={label}
                                        className="flex justify-between text-muted-foreground"
                                      >
                                        <span>{label}</span>
                                        <span className="font-mono">{val}</span>
                                      </div>
                                    ))}
                                    <div className="border-t border-border/50 pt-1 flex justify-between font-semibold text-foreground">
                                      <span>Monthly IT</span>
                                      <span className="font-mono">
                                        ₹
                                        {preview.incomeTax.toLocaleString(
                                          "en-IN",
                                        )}
                                      </span>
                                    </div>
                                  </div>
                                </PopoverContent>
                              </Popover>
                            </div>
                            <div className="flex items-center gap-0">
                              <div className="h-7 px-2 flex items-center rounded-l border border-r-0 border-border/60 bg-muted/50 text-[10px] text-muted-foreground font-mono whitespace-nowrap">
                                IT
                              </div>
                              <Input
                                type="number"
                                value={preview.incomeTax || ""}
                                readOnly
                                className="h-7 text-xs rounded-l-none opacity-70 cursor-default bg-card/30 flex-1 min-w-0"
                              />
                            </div>
                          </div>

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
                      {/* Cheque Payment */}
                      <div className="flex items-center gap-2 pt-1">
                        <Checkbox
                          id={`chequePay-${emp.id}`}
                          checked={!!getInputs(emp).chequePay}
                          onCheckedChange={(checked) =>
                            setInputField(
                              String(emp.id),
                              "chequePay",
                              checked ? 1 : 0,
                            )
                          }
                          data-ocid="salary.chequepay.checkbox"
                        />
                        <label
                          htmlFor={`chequePay-${emp.id}`}
                          className="text-xs cursor-pointer select-none text-muted-foreground"
                        >
                          Cheque Payment
                        </label>
                      </div>
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
                          variant="outline"
                          className="h-8 text-xs gap-1"
                          onClick={() => setSalaryInputs({})}
                        >
                          <RefreshCw className="w-3 h-3" /> Reset
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
                    <div className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 text-xs gap-1"
                        onClick={() => setSalaryInputs({})}
                      >
                        <RefreshCw className="w-3 h-3" /> Reset
                      </Button>
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
