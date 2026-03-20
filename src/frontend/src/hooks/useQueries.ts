import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Designation, EmploymentType } from "../backend.d";
import type {
  LocalAttendanceRecord,
  LocalDailyWorker,
  LocalEmployee,
  LocalInstitute,
  LocalSalaryRecord,
} from "./localStore";
import {
  localAddDailyWorker,
  localAddEmployee,
  localAddInstitute,
  localDeleteAttendance,
  localDeleteDailyWorker,
  localDeleteEmployee,
  localDeleteInstitute,
  localGetAllDailyWorkers,
  localGetAllEmployees,
  localGetAllInstitutes,
  localGetAttendance,
  localGetAttendanceForInstitute,
  localGetDailyWorkersForInstitute,
  localGetEmployeesForInstitute,
  localGetSalariesForInstitute,
  localGetSalary,
  localLockAttendance,
  localLockSalary,
  localProcessSalary,
  localSaveAttendance,
  localUpdateDailyWorker,
  localUpdateEmployee,
  localUpdateInstitute,
} from "./localStore";

export { Designation, EmploymentType };

// ─── Type adapters (localStorage numbers ↔ bigint for page compat) ────────────

export interface Institute {
  id: bigint;
  name: string;
  code: string;
  location: string;
}

export interface Employee {
  id: bigint;
  name: string;
  employeeId: string;
  instituteId: bigint;
  designation: string;
  employmentType: string;
  joiningDate: string;
  address: string;
  dob: string;
  basicSalary: bigint;
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

export interface AttendanceRecord {
  employeeId: bigint;
  month: bigint;
  year: bigint;
  days: string[];
  totalPresent: bigint;
  totalAbsent: bigint;
  isLocked: boolean;
}

export interface SalaryRecord {
  employeeId: bigint;
  month: bigint;
  year: bigint;
  basicSalary: bigint;
  da: bigint;
  hra: bigint;
  grossSalary: bigint;
  pf: bigint;
  esic: bigint;
  pt: bigint;
  totalDeductions: bigint;
  netSalary: bigint;
  isLocked: boolean;
  // Extended fields
  specialPay?: bigint;
  lwp?: bigint;
  daPercent?: bigint;
  hraPercent?: bigint;
  ta?: bigint;
  conveyanceAllowance?: bigint;
  washingAllowance?: bigint;
  ltc?: bigint;
  festivalAdvance?: bigint;
  incentive?: bigint;
  bonus?: bigint;
  daArrears?: bigint;
  otherEarnings?: bigint;
  grossEarnings?: bigint;
  houseRent?: bigint;
  electricityCharges?: bigint;
  lwf?: bigint;
  epf?: bigint;
  vpf?: bigint;
  lic?: bigint;
  profTax?: bigint;
  incomeTax?: bigint;
  festival?: bigint;
  esi?: bigint;
  security?: bigint;
  otherDeductions?: bigint;
  totalDeductionsFull?: bigint;
  netEarnings?: bigint;
}

export interface DailyWorker {
  id: bigint;
  name: string;
  ratePerDay: bigint;
  periodFrom: string;
  periodTo: string;
  attendanceDays: bigint;
  totalPayable: bigint;
  instituteId: bigint;
  status?: string;
}

// ─── Conversion helpers ───────────────────────────────────────────────────────

function toInstitute(i: LocalInstitute): Institute {
  return { ...i, id: BigInt(i.id) };
}

function toEmployee(e: LocalEmployee): Employee {
  return {
    ...e,
    id: BigInt(e.id),
    instituteId: BigInt(e.instituteId),
    basicSalary: BigInt(e.basicSalary),
  };
}

function toAttendance(a: LocalAttendanceRecord): AttendanceRecord {
  return {
    ...a,
    employeeId: BigInt(a.employeeId),
    month: BigInt(a.month),
    year: BigInt(a.year),
    totalPresent: BigInt(a.totalPresent),
    totalAbsent: BigInt(a.totalAbsent),
  };
}

function toSalary(s: LocalSalaryRecord): SalaryRecord {
  return {
    employeeId: BigInt(s.employeeId),
    month: BigInt(s.month),
    year: BigInt(s.year),
    basicSalary: BigInt(s.basicSalary),
    da: BigInt(s.da),
    hra: BigInt(s.hra),
    grossSalary: BigInt(s.grossSalary),
    pf: BigInt(s.pf),
    esic: BigInt(s.esic),
    pt: BigInt(s.pt),
    totalDeductions: BigInt(s.totalDeductions),
    netSalary: BigInt(s.netSalary),
    isLocked: s.isLocked,
    specialPay: BigInt(s.specialPay),
    lwp: BigInt(s.lwp),
    daPercent: BigInt(s.daPercent),
    hraPercent: BigInt(s.hraPercent),
    ta: BigInt(s.ta),
    conveyanceAllowance: BigInt(s.conveyanceAllowance),
    washingAllowance: BigInt(s.washingAllowance),
    ltc: BigInt(s.ltc),
    festivalAdvance: BigInt(s.festivalAdvance),
    incentive: BigInt(s.incentive),
    bonus: BigInt(s.bonus),
    daArrears: BigInt(s.daArrears),
    otherEarnings: BigInt(s.otherEarnings),
    grossEarnings: BigInt(s.grossEarnings),
    houseRent: BigInt(s.houseRent),
    electricityCharges: BigInt(s.electricityCharges),
    lwf: BigInt(s.lwf),
    epf: BigInt(s.epf),
    vpf: BigInt(s.vpf),
    lic: BigInt(s.lic),
    profTax: BigInt(s.profTax),
    incomeTax: BigInt(s.incomeTax),
    festival: BigInt(s.festival),
    esi: BigInt(s.esi),
    security: BigInt(s.security),
    otherDeductions: BigInt(s.otherDeductions),
    totalDeductionsFull: BigInt(s.totalDeductions),
    netEarnings: BigInt(s.netEarnings),
  };
}

function toDailyWorker(w: LocalDailyWorker): DailyWorker {
  return {
    ...w,
    id: BigInt(w.id),
    ratePerDay: BigInt(w.ratePerDay),
    attendanceDays: BigInt(w.attendanceDays),
    totalPayable: BigInt(w.totalPayable),
    instituteId: BigInt(w.instituteId),
  };
}

// ─── Institutes ───────────────────────────────────────────────────────────────

export function useGetAllInstitutes() {
  return useQuery<Institute[]>({
    queryKey: ["institutes"],
    queryFn: () => localGetAllInstitutes().map(toInstitute),
    staleTime: 0,
  });
}

export function useAddInstitute() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      name,
      code,
      location,
    }: { name: string; code: string; location: string }) => {
      return localAddInstitute(name, code, location);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["institutes"] }),
  });
}

export function useUpdateInstitute() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      name,
      code,
      location,
    }: { id: bigint; name: string; code: string; location: string }) => {
      localUpdateInstitute(Number(id), name, code, location);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["institutes"] }),
  });
}

export function useDeleteInstitute() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      localDeleteInstitute(Number(id));
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["institutes"] });
      qc.invalidateQueries({ queryKey: ["employees"] });
    },
  });
}

// ─── Employees ────────────────────────────────────────────────────────────────

export function useGetEmployeesForInstitute(instituteId: bigint | null) {
  return useQuery<Employee[]>({
    queryKey: ["employees", instituteId?.toString()],
    queryFn: () => {
      if (instituteId === null) return [];
      return localGetEmployeesForInstitute(Number(instituteId)).map(toEmployee);
    },
    enabled: instituteId !== null,
    staleTime: 0,
  });
}

export function useGetAllEmployees() {
  return useQuery<Employee[]>({
    queryKey: ["employees", "all"],
    queryFn: () => localGetAllEmployees().map(toEmployee),
    staleTime: 0,
  });
}

export function useAddEmployee() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      name: string;
      employeeId: string;
      instituteId: bigint;
      designation: Designation | string;
      employmentType: EmploymentType | string;
      joiningDate: string;
      address: string;
      dob: string;
      basicSalary: bigint;
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
    }) => {
      return localAddEmployee({
        name: data.name,
        employeeId: data.employeeId,
        instituteId: Number(data.instituteId),
        designation: String(data.designation),
        employmentType: String(data.employmentType),
        joiningDate: data.joiningDate,
        address: data.address,
        dob: data.dob,
        basicSalary: Number(data.basicSalary),
        department: data.department,
        bhelQuarter: data.bhelQuarter,
        profilePic: data.profilePic,
        religion: data.religion,
        gender: data.gender,
        category: data.category,
        employeeStatus: data.employeeStatus ?? "Active",
        phone: data.phone,
        emailId: data.emailId,
        bankName: data.bankName,
        bankBranch: data.bankBranch,
        bankAccountNo: data.bankAccountNo,
        ifscCode: data.ifscCode,
        panNo: data.panNo,
        pfNumber: data.pfNumber,
        esiNumber: data.esiNumber,
        aadhaarNo: data.aadhaarNo,
        uanNo: data.uanNo,
        licNo: data.licNo,
      });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["employees"] }),
  });
}

export function useUpdateEmployee() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      id: bigint;
      name: string;
      employeeId: string;
      instituteId: bigint;
      designation: Designation | string;
      employmentType: EmploymentType | string;
      joiningDate: string;
      address: string;
      dob: string;
      basicSalary: bigint;
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
    }) => {
      localUpdateEmployee(Number(data.id), {
        name: data.name,
        employeeId: data.employeeId,
        instituteId: Number(data.instituteId),
        designation: String(data.designation),
        employmentType: String(data.employmentType),
        joiningDate: data.joiningDate,
        address: data.address,
        dob: data.dob,
        basicSalary: Number(data.basicSalary),
        department: data.department,
        bhelQuarter: data.bhelQuarter,
        profilePic: data.profilePic,
        religion: data.religion,
        gender: data.gender,
        category: data.category,
        employeeStatus: data.employeeStatus,
        phone: data.phone,
        emailId: data.emailId,
        bankName: data.bankName,
        bankBranch: data.bankBranch,
        bankAccountNo: data.bankAccountNo,
        ifscCode: data.ifscCode,
        panNo: data.panNo,
        pfNumber: data.pfNumber,
        esiNumber: data.esiNumber,
        aadhaarNo: data.aadhaarNo,
        uanNo: data.uanNo,
        licNo: data.licNo,
      });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["employees"] }),
  });
}

export function useDeleteEmployee() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      localDeleteEmployee(Number(id));
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["employees"] }),
  });
}

// ─── Attendance ───────────────────────────────────────────────────────────────

export function useGetAttendance(
  employeeId: bigint | null,
  month: number,
  year: number,
) {
  return useQuery<AttendanceRecord | null>({
    queryKey: [
      "attendance",
      employeeId?.toString(),
      String(month),
      String(year),
    ],
    queryFn: () => {
      if (employeeId === null) return null;
      const rec = localGetAttendance(Number(employeeId), month, year);
      return rec ? toAttendance(rec) : null;
    },
    enabled: employeeId !== null,
    staleTime: 0,
  });
}

export function useGetAttendanceForInstitute(
  instituteId: bigint | null,
  month: number,
  year: number,
) {
  return useQuery<AttendanceRecord[]>({
    queryKey: [
      "attendance",
      "institute",
      instituteId?.toString(),
      String(month),
      String(year),
    ],
    queryFn: () => {
      if (instituteId === null) return [];
      return localGetAttendanceForInstitute(
        Number(instituteId),
        month,
        year,
      ).map(toAttendance);
    },
    enabled: instituteId !== null,
    staleTime: 0,
  });
}

export function useSaveAttendance() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      employeeId: bigint;
      month: number;
      year: number;
      days: string[];
    }) => {
      localSaveAttendance(
        Number(data.employeeId),
        data.month,
        data.year,
        data.days,
      );
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["attendance"] }),
  });
}

export function useLockAttendance() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      employeeId: bigint;
      month: number;
      year: number;
    }) => {
      localLockAttendance(Number(data.employeeId), data.month, data.year);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["attendance"] }),
  });
}

// ─── Salary ───────────────────────────────────────────────────────────────────

export function useGetSalary(
  employeeId: bigint | null,
  month: number,
  year: number,
) {
  return useQuery<SalaryRecord | null>({
    queryKey: ["salary", employeeId?.toString(), String(month), String(year)],
    queryFn: () => {
      if (employeeId === null) return null;
      const rec = localGetSalary(Number(employeeId), month, year);
      return rec ? toSalary(rec) : null;
    },
    enabled: employeeId !== null,
    staleTime: 0,
  });
}

export function useGetSalariesForInstitute(
  instituteId: bigint | null,
  month: number,
  year: number,
) {
  return useQuery<SalaryRecord[]>({
    queryKey: [
      "salary",
      "institute",
      instituteId?.toString(),
      String(month),
      String(year),
    ],
    queryFn: () => {
      if (instituteId === null) return [];
      return localGetSalariesForInstitute(Number(instituteId), month, year).map(
        toSalary,
      );
    },
    enabled: instituteId !== null,
    staleTime: 0,
  });
}

export function useProcessSalary() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      employeeId: bigint;
      month: number;
      year: number;
    }) => {
      return localProcessSalary(Number(data.employeeId), data.month, data.year);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["salary"] }),
  });
}

export function useDeleteAttendance() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      employeeId: bigint;
      month: number;
      year: number;
    }) => {
      localDeleteAttendance(Number(data.employeeId), data.month, data.year);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["attendance"] }),
  });
}

export function useLockSalary() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      employeeId: bigint;
      month: number;
      year: number;
    }) => {
      localLockSalary(Number(data.employeeId), data.month, data.year);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["salary"] }),
  });
}

// ─── Daily Workers ────────────────────────────────────────────────────────────

export function useGetDailyWorkersForInstitute(instituteId: bigint | null) {
  return useQuery<DailyWorker[]>({
    queryKey: ["dailyWorkers", instituteId?.toString()],
    queryFn: () => {
      if (instituteId === null)
        return localGetAllDailyWorkers().map(toDailyWorker);
      return localGetDailyWorkersForInstitute(Number(instituteId)).map(
        toDailyWorker,
      );
    },
    staleTime: 0,
  });
}

export function useAddDailyWorker() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      name: string;
      ratePerDay: number;
      periodFrom: string;
      periodTo: string;
      attendanceDays: number;
      instituteId: bigint;
      status?: string;
    }) => {
      return localAddDailyWorker({
        name: data.name,
        ratePerDay: data.ratePerDay,
        periodFrom: data.periodFrom,
        periodTo: data.periodTo,
        attendanceDays: data.attendanceDays,
        instituteId: Number(data.instituteId),
        status: data.status ?? "active",
      });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["dailyWorkers"] }),
  });
}

export function useUpdateDailyWorker() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      id: bigint;
      name: string;
      ratePerDay: number;
      periodFrom: string;
      periodTo: string;
      attendanceDays: number;
      instituteId: bigint;
      status?: string;
    }) => {
      localUpdateDailyWorker(Number(data.id), {
        name: data.name,
        ratePerDay: data.ratePerDay,
        periodFrom: data.periodFrom,
        periodTo: data.periodTo,
        attendanceDays: data.attendanceDays,
        instituteId: Number(data.instituteId),
        status: data.status,
      });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["dailyWorkers"] }),
  });
}

export function useDeleteDailyWorker() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      localDeleteDailyWorker(Number(id));
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["dailyWorkers"] }),
  });
}
