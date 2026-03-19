import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  AttendanceRecord,
  DailyWorker,
  Employee,
  Institute,
  SalaryRecord,
} from "../backend.d";
import { Designation, EmploymentType } from "../backend.d";
import { useActor } from "./useActor";

export type {
  Institute,
  Employee,
  AttendanceRecord,
  SalaryRecord,
  DailyWorker,
};
export { Designation, EmploymentType };

// ─── Institutes ───────────────────────────────────────────────

export function useGetAllInstitutes() {
  const { actor, isFetching } = useActor();
  return useQuery<Institute[]>({
    queryKey: ["institutes"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllInstitutes();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddInstitute() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      name,
      code,
      location,
    }: { name: string; code: string; location: string }) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.addInstitute(name, code, location);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["institutes"] }),
  });
}

export function useUpdateInstitute() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      name,
      code,
      location,
    }: { id: bigint; name: string; code: string; location: string }) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.updateInstitute(id, name, code, location);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["institutes"] }),
  });
}

export function useDeleteInstitute() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.deleteInstitute(id);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["institutes"] });
      qc.invalidateQueries({ queryKey: ["employees"] });
    },
  });
}

// ─── Employees ────────────────────────────────────────────────

export function useGetEmployeesForInstitute(instituteId: bigint | null) {
  const { actor, isFetching } = useActor();
  return useQuery<Employee[]>({
    queryKey: ["employees", instituteId?.toString()],
    queryFn: async () => {
      if (!actor || instituteId === null) return [];
      return actor.getAllEmployeesForInstitute(instituteId);
    },
    enabled: !!actor && !isFetching && instituteId !== null,
  });
}

export function useGetAllEmployees() {
  const { actor, isFetching } = useActor();
  return useQuery<Employee[]>({
    queryKey: ["employees", "all"],
    queryFn: async () => {
      if (!actor) return [];
      return (actor as any).getAllEmployees();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddEmployee() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      name: string;
      employeeId: string;
      instituteId: bigint;
      designation: Designation;
      employmentType: EmploymentType;
      joiningDate: string;
      address: string;
      dob: string;
      basicSalary: bigint;
    }) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.addEmployee(
        data.name,
        data.employeeId,
        data.instituteId,
        data.designation,
        data.employmentType,
        data.joiningDate,
        data.address,
        data.dob,
        data.basicSalary,
      );
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["employees"] }),
  });
}

export function useUpdateEmployee() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      id: bigint;
      name: string;
      employeeId: string;
      instituteId: bigint;
      designation: Designation;
      employmentType: EmploymentType;
      joiningDate: string;
      address: string;
      dob: string;
      basicSalary: bigint;
    }) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.updateEmployee(
        data.id,
        data.name,
        data.employeeId,
        data.instituteId,
        data.designation,
        data.employmentType,
        data.joiningDate,
        data.address,
        data.dob,
        data.basicSalary,
      );
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["employees"] }),
  });
}

export function useDeleteEmployee() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.deleteEmployee(id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["employees"] }),
  });
}

// ─── Attendance ───────────────────────────────────────────────

export function useGetAttendance(
  employeeId: bigint | null,
  month: number,
  year: number,
) {
  const { actor, isFetching } = useActor();
  return useQuery<AttendanceRecord | null>({
    queryKey: [
      "attendance",
      employeeId?.toString(),
      month.toString(),
      year.toString(),
    ],
    queryFn: async () => {
      if (!actor || employeeId === null) return null;
      return (actor as any).getAttendance(
        employeeId,
        BigInt(month),
        BigInt(year),
      );
    },
    enabled: !!actor && !isFetching && employeeId !== null,
  });
}

export function useGetAttendanceForInstitute(
  instituteId: bigint | null,
  month: number,
  year: number,
) {
  const { actor, isFetching } = useActor();
  return useQuery<AttendanceRecord[]>({
    queryKey: [
      "attendance",
      "institute",
      instituteId?.toString(),
      month.toString(),
      year.toString(),
    ],
    queryFn: async () => {
      if (!actor || instituteId === null) return [];
      return (actor as any).getAttendanceForInstitute(
        instituteId,
        BigInt(month),
        BigInt(year),
      );
    },
    enabled: !!actor && !isFetching && instituteId !== null,
  });
}

export function useSaveAttendance() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      employeeId: bigint;
      month: number;
      year: number;
      days: string[];
    }) => {
      if (!actor) throw new Error("Actor not ready");
      return (actor as any).saveAttendance(
        data.employeeId,
        BigInt(data.month),
        BigInt(data.year),
        data.days,
      );
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["attendance"] }),
  });
}

export function useLockAttendance() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      employeeId: bigint;
      month: number;
      year: number;
    }) => {
      if (!actor) throw new Error("Actor not ready");
      return (actor as any).lockAttendance(
        data.employeeId,
        BigInt(data.month),
        BigInt(data.year),
      );
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["attendance"] }),
  });
}

// ─── Salary ───────────────────────────────────────────────────

export function useGetSalary(
  employeeId: bigint | null,
  month: number,
  year: number,
) {
  const { actor, isFetching } = useActor();
  return useQuery<SalaryRecord | null>({
    queryKey: [
      "salary",
      employeeId?.toString(),
      month.toString(),
      year.toString(),
    ],
    queryFn: async () => {
      if (!actor || employeeId === null) return null;
      return (actor as any).getSalary(employeeId, BigInt(month), BigInt(year));
    },
    enabled: !!actor && !isFetching && employeeId !== null,
  });
}

export function useGetSalariesForInstitute(
  instituteId: bigint | null,
  month: number,
  year: number,
) {
  const { actor, isFetching } = useActor();
  return useQuery<SalaryRecord[]>({
    queryKey: [
      "salary",
      "institute",
      instituteId?.toString(),
      month.toString(),
      year.toString(),
    ],
    queryFn: async () => {
      if (!actor || instituteId === null) return [];
      return (actor as any).getSalariesForInstitute(
        instituteId,
        BigInt(month),
        BigInt(year),
      );
    },
    enabled: !!actor && !isFetching && instituteId !== null,
  });
}

export function useProcessSalary() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      employeeId: bigint;
      month: number;
      year: number;
    }) => {
      if (!actor) throw new Error("Actor not ready");
      return (actor as any).processSalary(
        data.employeeId,
        BigInt(data.month),
        BigInt(data.year),
      );
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["salary"] }),
  });
}

export function useLockSalary() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      employeeId: bigint;
      month: number;
      year: number;
    }) => {
      if (!actor) throw new Error("Actor not ready");
      return (actor as any).lockSalary(
        data.employeeId,
        BigInt(data.month),
        BigInt(data.year),
      );
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["salary"] }),
  });
}

// ─── Daily Workers ────────────────────────────────────────────

export function useGetDailyWorkersForInstitute(instituteId: bigint | null) {
  const { actor, isFetching } = useActor();
  return useQuery<DailyWorker[]>({
    queryKey: ["dailyWorkers", instituteId?.toString()],
    queryFn: async () => {
      if (!actor || instituteId === null) return [];
      return (actor as any).getDailyWorkersForInstitute(instituteId);
    },
    enabled: !!actor && !isFetching && instituteId !== null,
  });
}

export function useAddDailyWorker() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      name: string;
      ratePerDay: number;
      periodFrom: string;
      periodTo: string;
      attendanceDays: number;
      instituteId: bigint;
    }) => {
      if (!actor) throw new Error("Actor not ready");
      return (actor as any).addDailyWorker(
        data.name,
        BigInt(data.ratePerDay),
        data.periodFrom,
        data.periodTo,
        BigInt(data.attendanceDays),
        data.instituteId,
      );
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["dailyWorkers"] }),
  });
}

export function useUpdateDailyWorker() {
  const { actor } = useActor();
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
    }) => {
      if (!actor) throw new Error("Actor not ready");
      return (actor as any).updateDailyWorker(
        data.id,
        data.name,
        BigInt(data.ratePerDay),
        data.periodFrom,
        data.periodTo,
        BigInt(data.attendanceDays),
        data.instituteId,
      );
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["dailyWorkers"] }),
  });
}

export function useDeleteDailyWorker() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Actor not ready");
      return (actor as any).deleteDailyWorker(id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["dailyWorkers"] }),
  });
}
