# Yf's Platform - Salary Management

## Current State

Full multi-module platform (Salary, TallyBooks, Fees Manager) with React/TypeScript frontend and ICP Motoko backend. Version 61 is live.

Key files:
- `src/frontend/src/components/Layout.tsx` — sidebar logo uses wrong image path (`file_0000...png`) with fallback to 'Yf' text
- `src/frontend/src/App.tsx` — employee portal sidebar also uses wrong image
- `src/frontend/src/pages/EmployeeManagementPage.tsx` — download toggle uses text buttons; employee selector filter not applied to displayed list; bank branch auto-select code exists but only fires when bank is changed (not on initial load)
- `src/frontend/src/pages/SalaryProcessingPage.tsx` — TA is editable for temporary employees (should be read-only from salary details); incentive is editable (should be read-only from salary details); no active-employee filter
- `src/frontend/src/pages/SettingsPage.tsx` — sections render order: UserPassword, SalaryConfig, DailyWorker, ContractWorker, EmployeeSettings, AuditLog, Backup, TaxSlabs, SystemInfo; no custom bank management in EmployeeSettingsSection
- `src/frontend/src/pages/AttendancePage.tsx` — no active-employee filter applied to employee list
- `src/frontend/src/pages/PayslipPage.tsx` — no active-employee filter applied to employee list
- Login page uses logo `/assets/uploads/logo-1.png` (correct)
- Many selectors across pages lack icons at the left side inside the trigger

## Requested Changes (Diff)

### Add
- Custom bank + branches management in EmployeeSettingsSection (add bank name + branches, stored in `sms_custom_banks` localStorage key)
- Active-employee filter in AttendancePage, SalaryProcessingPage, PayslipPage (only show employees with status 'Active' or no status set — hide Retired/Resigned/Relieved/Inactive)

### Modify
1. **Sidebar logo** (Layout.tsx + App.tsx EmployeeApp): Change image src from `file_0000000098e07208a686dfee13498f2c-1.png` to `logo-1.png` so the actual logo shows in the sidebar top corner (same logo as login page)
2. **Employee Management download toggle**: Replace text-based excel/pdf toggle buttons with icon-only toggle similar to the VPF %/₹ toggle in salary details. Use `FileSpreadsheet` icon for Excel and `FileText` icon for PDF. Excel selected by default. Show as two compact icon-buttons side by side.
3. **Employee selector filtering fix**: `selectedEmployeeFilter` state is set but never applied to the `filtered` array. Fix by also filtering on `selectedEmployeeFilter !== 'all'` to show only the selected employee's card.
4. **TA & Incentive in SalaryProcessingPage**: Both TA and Incentive should be read-only, values auto-loaded from `empExtra` (salary details). For regular employees: add read-only TA field (from salary details). For temporary employees: TA field already exists but make it read-only. Incentive field for all employee types: read-only, value from `getEmpExtra(emp.employeeId).incentive`. Show these as read-only display like Basic (with a small lock icon or "from Salary Details" label).
5. **Settings section order**: Reorder to: 1st EmployeeSettingsSection, 2nd SalaryConfigSection, 3rd DailyWorkerRateSection, 4th ContractWorkerRateSection, 5th UserPasswordSection, then AuditLogSection, BackupRestoreSection, TaxSlabsSection, SystemInfoSection
6. **Icons on all selectors**: Every `<SelectTrigger>` throughout the app should show a relevant icon before the `<SelectValue>`. Use: Building2 for institute selectors, Users for employee selectors, Calendar for month selectors, CalendarRange/GraduationCap for session selectors, etc. This applies to ALL pages: Attendance, SalaryProcessing, Payslip, Reports, DailyWorkers, ContractWorkers, SalaryDetails, EmployeeManagement
7. **Bank branch auto-select**: Already works on bank change. Also ensure the BANK_BRANCHES and custom banks are merged when getting branches. The bank names selector in employee form should also include custom banks from `sms_custom_banks`.

### Remove
- Nothing

## Implementation Plan

1. **Layout.tsx + App.tsx**: Fix logo src to `logo-1.png` in both admin sidebar and employee app sidebar
2. **EmployeeManagementPage.tsx**:
   - Replace download toggle buttons with icon-only `FileSpreadsheet`/`FileText` icon toggle (same pattern as VPF toggle in SalaryDetailsPage)
   - Fix `filtered` array to also apply `selectedEmployeeFilter` filter
   - Add custom banks support: read from `sms_custom_banks` localStorage, merge with hardcoded BANK_NAMES/BANK_BRANCHES
3. **SalaryProcessingPage.tsx**:
   - Make TA read-only for both regular and temporary employees (load from empExtra, display read-only)
   - Make incentive read-only for all employees (load from empExtra, display read-only) — move it before gross earnings like it currently is but read-only
   - Add active-employee filter: when loading employee list, filter out employees where `getEmpExtra(emp.employeeId).employeeStatus` is 'Retired', 'Resigned', 'Relieved', or 'Inactive'
4. **AttendancePage.tsx**: Filter employee lists to only include active employees
5. **PayslipPage.tsx**: Filter employee list to only include active employees
6. **SettingsPage.tsx**:
   - Reorder sections in render
   - Add custom bank management in EmployeeSettingsSection dialog (add bank name + comma-separated branches, store in `sms_custom_banks`)
7. **All pages with selectors**: Add icons inside SelectTrigger for institute, employee, month, session selectors across all salary pages
