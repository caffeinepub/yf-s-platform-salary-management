// ─── localStorage-based data store ──────────────────────────────────────────
// All IDs are stored as numbers internally; hooks expose bigint for compat.

const KEYS = {
  institutes: "sms_institutes",
  employees: "sms_employees",
  attendance: "sms_attendance",
  salary: "sms_salary",
  dailyWorkers: "sms_daily_workers",
  nextInstituteId: "sms_next_institute_id",
  nextEmployeeId: "sms_next_employee_id",
  nextDailyWorkerId: "sms_next_daily_worker_id",
};

function getAll<T>(key: string): T[] {
  try {
    return JSON.parse(localStorage.getItem(key) || "[]") as T[];
  } catch {
    return [];
  }
}

function saveAll<T>(key: string, items: T[]) {
  localStorage.setItem(key, JSON.stringify(items));
}

function getNextId(key: string): number {
  const current = Number(localStorage.getItem(key) || "1");
  localStorage.setItem(key, String(current + 1));
  return current;
}

// ─── Institute ───────────────────────────────────────────────────────────────

export interface LocalInstitute {
  id: number;
  name: string;
  code: string;
  location: string;
}

export function localGetAllInstitutes(): LocalInstitute[] {
  return getAll<LocalInstitute>(KEYS.institutes);
}

export function localAddInstitute(
  name: string,
  code: string,
  location: string,
): number {
  const id = getNextId(KEYS.nextInstituteId);
  const items = localGetAllInstitutes();
  items.push({ id, name, code, location });
  saveAll(KEYS.institutes, items);
  return id;
}

export function localUpdateInstitute(
  id: number,
  name: string,
  code: string,
  location: string,
) {
  const items = localGetAllInstitutes().map((i) =>
    i.id === id ? { ...i, name, code, location } : i,
  );
  saveAll(KEYS.institutes, items);
}

export function localDeleteInstitute(id: number) {
  saveAll(
    KEYS.institutes,
    localGetAllInstitutes().filter((i) => i.id !== id),
  );
}

// ─── Employee ────────────────────────────────────────────────────────────────

export interface LocalEmployee {
  id: number;
  name: string;
  employeeId: string;
  instituteId: number;
  designation: string;
  employmentType: string;
  joiningDate: string;
  address: string;
  dob: string;
  basicSalary: number;
  // Extended fields
  department?: string;
  bhelQuarter?: string;
  profilePic?: string;
  religion?: string;
  gender?: string;
  category?: string;
  employeeStatus?: string;
  phone?: string;
  emailId?: string;
  bankName?: string;
  bankBranch?: string;
  bankAccountNo?: string;
  ifscCode?: string;
  panNo?: string;
  pfNumber?: string;
  esiNumber?: string;
  aadhaarNo?: string;
  uanNo?: string;
  licNo?: string;
}

export function localGetAllEmployees(): LocalEmployee[] {
  return getAll<LocalEmployee>(KEYS.employees);
}

export function localGetEmployeesForInstitute(
  instituteId: number,
): LocalEmployee[] {
  return localGetAllEmployees().filter((e) => e.instituteId === instituteId);
}

export function localAddEmployee(data: Omit<LocalEmployee, "id">): number {
  const id = getNextId(KEYS.nextEmployeeId);
  const items = localGetAllEmployees();
  items.push({ id, ...data });
  saveAll(KEYS.employees, items);
  return id;
}

export function localUpdateEmployee(id: number, data: Partial<LocalEmployee>) {
  const items = localGetAllEmployees().map((e) =>
    e.id === id ? { ...e, ...data } : e,
  );
  saveAll(KEYS.employees, items);
}

export function localDeleteEmployee(id: number) {
  saveAll(
    KEYS.employees,
    localGetAllEmployees().filter((e) => e.id !== id),
  );
}

// ─── Attendance ──────────────────────────────────────────────────────────────

export interface LocalAttendanceRecord {
  employeeId: number;
  month: number;
  year: number;
  days: string[];
  totalPresent: number;
  totalAbsent: number;
  isLocked: boolean;
}

export function localGetAttendance(
  employeeId: number,
  month: number,
  year: number,
): LocalAttendanceRecord | null {
  const all = getAll<LocalAttendanceRecord>(KEYS.attendance);
  return (
    all.find(
      (a) =>
        a.employeeId === employeeId && a.month === month && a.year === year,
    ) ?? null
  );
}

export function localSaveAttendance(
  employeeId: number,
  month: number,
  year: number,
  days: string[],
) {
  const all = getAll<LocalAttendanceRecord>(KEYS.attendance);
  const existing = all.findIndex(
    (a) => a.employeeId === employeeId && a.month === month && a.year === year,
  );
  const record: LocalAttendanceRecord = {
    employeeId,
    month,
    year,
    days,
    totalPresent: days.filter((d) => d === "P").length,
    totalAbsent: days.filter((d) => d === "A").length,
    isLocked: true,
  };
  if (existing >= 0) all[existing] = record;
  else all.push(record);
  saveAll(KEYS.attendance, all);
}

export function localLockAttendance(
  employeeId: number,
  month: number,
  year: number,
) {
  const all = getAll<LocalAttendanceRecord>(KEYS.attendance).map((a) =>
    a.employeeId === employeeId && a.month === month && a.year === year
      ? { ...a, isLocked: true }
      : a,
  );
  saveAll(KEYS.attendance, all);
}

export function localDeleteAttendance(
  employeeId: number,
  month: number,
  year: number,
) {
  const all = getAll<LocalAttendanceRecord>(KEYS.attendance).filter(
    (a) =>
      !(a.employeeId === employeeId && a.month === month && a.year === year),
  );
  saveAll(KEYS.attendance, all);
}

export function localGetAttendanceForInstitute(
  instituteId: number,
  month: number,
  year: number,
): LocalAttendanceRecord[] {
  const empIds = localGetEmployeesForInstitute(instituteId).map((e) => e.id);
  return getAll<LocalAttendanceRecord>(KEYS.attendance).filter(
    (a) =>
      empIds.includes(a.employeeId) && a.month === month && a.year === year,
  );
}

// ─── Salary ──────────────────────────────────────────────────────────────────

export interface LocalSalaryRecord {
  employeeId: number;
  month: number;
  year: number;
  basicSalary: number;
  specialPay: number;
  lwp: number;
  da: number;
  daPercent: number;
  hra: number;
  hraPercent: number;
  ta: number;
  conveyanceAllowance: number;
  washingAllowance: number;
  ltc: number;
  festivalAdvance: number;
  incentive: number;
  bonus: number;
  daArrears: number;
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
  pf: number;
  esic: number;
  pt: number;
  grossSalary: number;
  netSalary: number;
  isLocked: boolean;
}

function calcPT(annualGross: number): number {
  if (annualGross < 225000) return 0;
  if (annualGross < 300000) return 125;
  if (annualGross < 400000) return 167;
  return 208;
}

function calcIT(annualNet: number): number {
  // New regime FY2025-26
  let tax = 0;
  if (annualNet <= 400000) return 0;
  if (annualNet <= 800000) tax = (annualNet - 400000) * 0.05;
  else if (annualNet <= 1200000) tax = 20000 + (annualNet - 800000) * 0.1;
  else if (annualNet <= 1600000) tax = 60000 + (annualNet - 1200000) * 0.15;
  else if (annualNet <= 2000000) tax = 120000 + (annualNet - 1600000) * 0.2;
  else if (annualNet <= 2400000) tax = 200000 + (annualNet - 2000000) * 0.25;
  else tax = 300000 + (annualNet - 2400000) * 0.3;
  // Section 87A rebate
  if (annualNet <= 700000 && tax <= 25000) tax = 0;
  return Math.round(tax / 12);
}

export function localProcessSalary(
  employeeId: number,
  month: number,
  year: number,
): LocalSalaryRecord {
  const emp = localGetAllEmployees().find((e) => e.id === employeeId);
  const basic = emp?.basicSalary ?? 0;
  const isRegular = (emp?.employmentType ?? "regular") === "regular";

  const da = isRegular ? Math.round(basic * 2.57) : 0;
  const hra = isRegular ? Math.round(basic * 0.2) : 0;
  const ta = isRegular ? 1600 : 0;
  const gross = basic + da + hra + ta;
  const annualGross = gross * 12;
  const pf = Math.round(basic * 0.12);
  const esic = Math.round(gross * 0.0075);
  const pt = calcPT(annualGross);
  const it = calcIT(annualGross);
  const totalDed = pf + esic + pt + it;
  const net = gross - totalDed;

  const record: LocalSalaryRecord = {
    employeeId,
    month,
    year,
    basicSalary: basic,
    specialPay: 0,
    lwp: 0,
    da,
    daPercent: 257,
    hra,
    hraPercent: 20,
    ta,
    conveyanceAllowance: 0,
    washingAllowance: 0,
    ltc: 0,
    festivalAdvance: 0,
    incentive: 0,
    bonus: 0,
    daArrears: 0,
    otherEarnings: 0,
    grossEarnings: gross,
    houseRent: 0,
    electricityCharges: 0,
    lwf: 0,
    epf: pf,
    vpf: 0,
    lic: 0,
    profTax: pt,
    incomeTax: it,
    festival: 0,
    esi: esic,
    security: 0,
    otherDeductions: 0,
    totalDeductions: totalDed,
    netEarnings: net,
    pf,
    esic,
    pt,
    grossSalary: gross,
    netSalary: net,
    isLocked: false,
  };

  const all = getAll<LocalSalaryRecord>(KEYS.salary);
  const idx = all.findIndex(
    (s) => s.employeeId === employeeId && s.month === month && s.year === year,
  );
  if (idx >= 0) all[idx] = record;
  else all.push(record);
  saveAll(KEYS.salary, all);
  return record;
}

export function localGetSalary(
  employeeId: number,
  month: number,
  year: number,
): LocalSalaryRecord | null {
  return (
    getAll<LocalSalaryRecord>(KEYS.salary).find(
      (s) =>
        s.employeeId === employeeId && s.month === month && s.year === year,
    ) ?? null
  );
}

export function localLockSalary(
  employeeId: number,
  month: number,
  year: number,
) {
  const all = getAll<LocalSalaryRecord>(KEYS.salary).map((s) =>
    s.employeeId === employeeId && s.month === month && s.year === year
      ? { ...s, isLocked: true }
      : s,
  );
  saveAll(KEYS.salary, all);
}

export function localGetSalariesForInstitute(
  instituteId: number,
  month: number,
  year: number,
): LocalSalaryRecord[] {
  const empIds = localGetEmployeesForInstitute(instituteId).map((e) => e.id);
  return getAll<LocalSalaryRecord>(KEYS.salary).filter(
    (s) =>
      empIds.includes(s.employeeId) && s.month === month && s.year === year,
  );
}

// ─── Daily Workers ───────────────────────────────────────────────────────────

export interface LocalDailyWorker {
  id: number;
  name: string;
  ratePerDay: number;
  periodFrom: string;
  periodTo: string;
  attendanceDays: number;
  totalPayable: number;
  instituteId: number;
  status?: string; // active | transferred | resigned | removed
}

export function localGetAllDailyWorkers(): LocalDailyWorker[] {
  return getAll<LocalDailyWorker>(KEYS.dailyWorkers);
}

export function localGetDailyWorkersForInstitute(
  instituteId: number,
): LocalDailyWorker[] {
  return localGetAllDailyWorkers().filter((w) => w.instituteId === instituteId);
}

export function localAddDailyWorker(
  data: Omit<LocalDailyWorker, "id" | "totalPayable">,
): number {
  const id = getNextId(KEYS.nextDailyWorkerId);
  const totalPayable = data.ratePerDay * data.attendanceDays;
  const items = localGetAllDailyWorkers();
  items.push({ id, totalPayable, ...data });
  saveAll(KEYS.dailyWorkers, items);
  return id;
}

export function localUpdateDailyWorker(
  id: number,
  data: Partial<LocalDailyWorker>,
) {
  const items = localGetAllDailyWorkers().map((w) => {
    if (w.id !== id) return w;
    const updated = { ...w, ...data };
    updated.totalPayable = updated.ratePerDay * updated.attendanceDays;
    return updated;
  });
  saveAll(KEYS.dailyWorkers, items);
}

export function localDeleteDailyWorker(id: number) {
  saveAll(
    KEYS.dailyWorkers,
    localGetAllDailyWorkers().filter((w) => w.id !== id),
  );
}
