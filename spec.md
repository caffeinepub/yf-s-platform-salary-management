# Yf's Platform - Salary Management System

## Current State
The app has a Motoko backend and React frontend. However, ALL data (institutes, employees, attendance, salary, daily workers, credentials, settings) is stored in **browser localStorage** — not in the backend canister. This causes data to be device-specific: data added on mobile is invisible on PC and vice versa. Additionally, month/year selectors in Reports, SalaryProcessing, and Payslip pages are ordered oldest-to-newest and start from 2020 instead of 2001.

## Requested Changes (Diff)

### Add
- Comprehensive Motoko backend storage for all entities: institutes, employees (with all 27+ fields), attendance (with leave types), salary (with all 30+ fields), daily workers (with status), employee credentials, admin password, salary config, promotion history
- `deleteAttendance` and `deleteSalary` backend methods
- Salary save/lock/delete in backend (currently only `processSalary` exists)
- Backend methods for employee credentials CRUD
- Backend methods for salary config and admin password
- Backend methods for promotion history

### Modify
- `Employee` Motoko type: use Text for designation and employmentType (to support 151 designations); add all extended fields (department, religion, gender, category, employeeStatus, phone, emailId, bankName, bankBranch, bankAccountNo, ifscCode, panNo, pfNumber, esiNumber, aadhaarNo, uanNo, licNo, ta, bhelQuarter, profilePic)
- `SalaryRecord` Motoko type: add all extended fields (ta, specialPay, lwp, daPercent, hraPercent, conveyanceAllowance, washingAllowance, ltc, festivalAdvance, incentive, bonus, daArrears, otherEarnings, houseRent, electricityCharges, lwf, epf, vpf, lic, profTax, incomeTax, festival, esi, security, otherDeductions, netEarnings)
- `DailyWorker` Motoko type: add status field
- `useQueries.ts`: replace all `localStore` calls with actual backend actor calls via `useActor`
- `localStore.ts`: keep only as fallback/migration bridge, main operations go to backend
- All pages that directly read from `localStorage` (DashboardPage, SalaryProcessingPage, ReportsPage, DailyWorkersPage, SettingsPage, LoginPage, EmployeeProfilePage, EmployeeSalarySlipsPage, EmployeeDashboardPage): rewrite to use hooks/actor instead
- `YEARS` array in Reports, SalaryProcessing, Payslip pages: change to start from 2001 and sort newest-to-oldest (same as AttendancePage)
- `getSessionMonths()` in Reports, SalaryProcessing, Payslip pages: ensure `.reverse()` is applied

### Remove
- Direct localStorage reads/writes for main data entities from page components
- Old `empExtra_*` localStorage pattern (merge extra fields into main employee record)
- `localStore.ts` dependency from `useQueries.ts` (replace with actor calls)

## Implementation Plan
1. Generate new Motoko backend with comprehensive Employee, Salary, Attendance, DailyWorker, Credentials, Settings types and all CRUD methods
2. Rewrite `useQueries.ts` to call actor methods asynchronously; remove localStore imports
3. Update `localStore.ts` to remove — or keep only as migration utility
4. Rewrite all pages that directly access localStorage to use hooks from useQueries
5. Fix YEARS and getSessionMonths in Reports, SalaryProcessing, Payslip pages
6. Validate and deploy
