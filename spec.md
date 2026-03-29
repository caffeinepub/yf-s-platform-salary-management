# Yf's Platform - Salary Management

## Current State
Multi-module platform (Salary, Tally, Fees) with persistent ICP backend. Layout has sidebar with logo box + platform name. Pages have various header styles. AttendancePage and PayslipPage have selectors in a separate card below the header. DailyWorkersPage has institute+session selectors in header row but attendance modal has period+rate inputs. ReportsPage has selectors in header (session comes BEFORE month). Payroll reports order: Paybill, Salary Register, Bank Statement. EmployeeManagementPage upload excel button has no institute lock. MenuBar shows active page label.

## Requested Changes (Diff)

### Add
- Logo image in the box at top-left of sidebar (already has a box `w-9 h-9 rounded-lg` with img src — user wants to confirm it shows the logo; check if image path is correct or needs fixing)
- DailyWorkersPage: worker selector after institute selector (default "All Workers"); period selector (default current period, descending order)
- DailyWorkersPage: rate display (read-only) shown on worker card or attendance summary; rate editable in Settings
- DailyWorkersPage: attendance report button (bottom-right), then print button, download PDF/Excel options
- Reports > Bank Statement: bank selector and branch selector
- Settings: daily worker rate field (editable)

### Modify
- **Layout topbar**: Remove `activePageLabel` h2 text that shows current page name in the menu bar (point 2)
- **Page headers consistency** (point 3): All pages should match Attendance/Payslip header style: large icon in gradient box, big title with `text-gradient`, subtitle below. Fix: DashboardPage, EmployeeManagementPage, InstituteManagementPage, SalaryDetailsPage, SalaryProcessingPage, ReportsPage, SettingsPage, DailyWorkersPage
- **EmployeeManagementPage**: Upload Excel button should be disabled/locked if no institutes exist (like Add Employee button)
- **AttendancePage**: Move selectors (institute, employee, month, session) from separate card into same row as the page header (like SalaryProcessingPage pattern)
- **PayslipPage**: Move selectors (institute, employee, month, session) from separate card into same row as the page header
- **DailyWorkersPage attendance modal**: Remove period selector and rate input from the modal attendance grid. Instead, add worker selector + period selector to the main page header row (after institute selector). Rate shown as read-only display.
- **ReportsPage**: Change selector order — month selector BEFORE session selector
- **ReportsPage payroll reports order**: 1st Salary Register, 2nd Pay Bill (Paybill), 3rd Bank Statement

### Remove
- `activePageLabel` h2 from topbar in Layout.tsx
- Period and rate input from DailyWorkers attendance modal

## Implementation Plan
1. **Layout.tsx**: Remove the `<h2>{activePageLabel}</h2>` from the topbar header.
2. **Page headers**: Update DashboardPage, EmployeeManagementPage, InstituteManagementPage, SalaryDetailsPage, SalaryProcessingPage, ReportsPage, SettingsPage, DailyWorkersPage to use consistent header: `w-10 h-10 rounded-xl gradient-primary glow-primary` icon box + `text-2xl font-display font-bold text-gradient` title + subtitle in muted text.
3. **EmployeeManagementPage**: Disable Upload Excel button when `institutes.length === 0`.
4. **AttendancePage**: Merge selectors row into header row (flex-wrap layout with title on left, selectors on right — same as SalaryProcessingPage).
5. **PayslipPage**: Same — merge selectors into header row.
6. **DailyWorkersPage**: Add worker selector (default "all") and period selector (descending, default current period) to main header row after institute selector. Remove period and rate inputs from attendance modal. Show rate as read-only badge in attendance modal summary. Add attendance report/print/download buttons at bottom-right of attendance modal.
7. **ReportsPage**: Swap month and session selector order. Reorder payroll reports array: Salary Register first, Paybill second, Bank Statement third. Add bank/branch selectors for Bank Statement report.
8. **SettingsPage**: Add Daily Worker Rate setting section.
