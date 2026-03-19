import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Institute {
    id: bigint;
    code: string;
    name: string;
    location: string;
}
export interface Employee {
    id: bigint;
    dob: string;
    instituteId: bigint;
    name: string;
    designation: Designation;
    joiningDate: string;
    employmentType: EmploymentType;
    employeeId: string;
    address: string;
    basicSalary: bigint;
}
export interface UserProfile {
    name: string;
    employeeId?: bigint;
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
}
export enum Designation {
    researchEngineer = "researchEngineer",
    professor = "professor",
    lecturer = "lecturer",
    humanResources = "humanResources",
    adminStaff = "adminStaff",
    officer = "officer",
    scientist = "scientist"
}
export enum EmploymentType {
    regular = "regular",
    temporary = "temporary"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addEmployee(name: string, employeeId: string, instituteId: bigint, designation: Designation, employmentType: EmploymentType, joiningDate: string, address: string, dob: string, basicSalary: bigint): Promise<bigint>;
    addInstitute(name: string, code: string, location: string): Promise<bigint>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    deleteEmployee(id: bigint): Promise<void>;
    deleteInstitute(id: bigint): Promise<void>;
    getAllEmployeesForInstitute(instituteId: bigint): Promise<Array<Employee>>;
    getAllEmployees(): Promise<Array<Employee>>;
    getAllInstitutes(): Promise<Array<Institute>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getEmployee(id: bigint): Promise<Employee>;
    getEmployementForInstituteWithDesignation(instituteId: bigint, designation: Designation): Promise<Array<Employee>>;
    getInstitute(id: bigint): Promise<Institute>;
    getMyEmployeeData(): Promise<Employee | null>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    linkEmployeeToPrincipal(employeeId: bigint, principal: Principal): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    updateEmployee(id: bigint, name: string, employeeId: string, instituteId: bigint, designation: Designation, employmentType: EmploymentType, joiningDate: string, address: string, dob: string, basicSalary: bigint): Promise<void>;
    updateInstitute(id: bigint, name: string, code: string, location: string): Promise<void>;
    saveAttendance(employeeId: bigint, month: bigint, year: bigint, days: string[]): Promise<void>;
    lockAttendance(employeeId: bigint, month: bigint, year: bigint): Promise<void>;
    getAttendance(employeeId: bigint, month: bigint, year: bigint): Promise<AttendanceRecord | null>;
    getAttendanceForInstitute(instituteId: bigint, month: bigint, year: bigint): Promise<Array<AttendanceRecord>>;
    processSalary(employeeId: bigint, month: bigint, year: bigint): Promise<SalaryRecord>;
    lockSalary(employeeId: bigint, month: bigint, year: bigint): Promise<void>;
    getSalary(employeeId: bigint, month: bigint, year: bigint): Promise<SalaryRecord | null>;
    getSalariesForInstitute(instituteId: bigint, month: bigint, year: bigint): Promise<Array<SalaryRecord>>;
    addDailyWorker(name: string, ratePerDay: bigint, periodFrom: string, periodTo: string, attendanceDays: bigint, instituteId: bigint): Promise<bigint>;
    updateDailyWorker(id: bigint, name: string, ratePerDay: bigint, periodFrom: string, periodTo: string, attendanceDays: bigint, instituteId: bigint): Promise<void>;
    deleteDailyWorker(id: bigint): Promise<void>;
    getDailyWorkersForInstitute(instituteId: bigint): Promise<Array<DailyWorker>>;
    getAllDailyWorkers(): Promise<Array<DailyWorker>>;
}
