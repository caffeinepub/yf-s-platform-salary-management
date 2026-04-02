# Yf's Platform - Salary Management

## Current State
Full multi-module platform (Salary Management, TallyBooks, Fees Manager) with React/TypeScript frontend and Motoko backend. Many pages and features exist.

## Requested Changes (Diff)

### Add
- Settings > User & Password Management: institute selector (default All), employee selector (default All)
- Reports > Payroll Reports: Consolidated Register report after Bank Statement (format from attachment - summary of salary bills with all columns: Basic Pay, Special Pay, DA, House Rent, Bonus, Conveyance, Washing, LTC Advance, Festival Advance, Incentive, Other Earnings, Gross Salary, House Rent deduction, Electricity, LWF, EPF, VPF, LIC, Employment Tax, Income Tax, Festival Advance, ESIC, Security Deposit, Other Deductions, Total Deductions, Net Payable, Remarks; bank-wise summary table at bottom; Employment Tax institute-wise and Income Tax institute-wise tables; grand total row; prepared by/checked by/secretary/treasurer signature row)
- Employee Management: download button with Excel/PDF options (default Excel), employee selector below institute selector (default All Employees), employee status shown on employee card
- Employee Portal: 3-bar hamburger icon to toggle sidebar (like admin), all pages headers with icon + colored head + description line
- My Salary Slip page: month selector (default latest, descending latest to Apr) + session selector (default latest, descending latest to DOJ year)
- Salary Details: incentive column after TA column

### Modify
- Settings > User & Password Management: fix employee fetching from localStorage (key: sms_employees)
- Settings: merge LWF Configuration inside Salary Structure Configuration; applicable months order Apr, May, Jun, Jul, Aug, Sep, Oct, Nov, Dec, Jan, Feb, Mar
- Settings > Tax Slab Reference: remove ⓘ icon before PT and IT headings
- Reports: remove "Yf's Platform" text at top of all report types
- Payslip page: institute selector default All, employee selector default All, month selector shows all months when previous session selected
- All pages with month selector: when previous session selected, auto-select the latest available month (not just show April)
- Salary Processing: when previous month/session is selected, all inputs locked/read-only (not editable)
- Attendance: when previous month/session selected, attendance locked/non-editable
- Employee Management: fix Excel upload to import ALL fields (not just id, name, institute)
- Employee Management > Add Employee: fix spelling "Relieved" (not "Relived")
- Employee Portal Welcome back section: fix background color in day/light mode
- My Profile page: move Cancel/Save buttons to bottom (not top); add country code dropdown (+91 default) before phone number
- Login page: pressing back should close/exit website; after admin login always open dashboard (not last visited page)
- Daily Rated: period selector format "1-15 Apr" not "Apr 1-15"; list descending (latest first); default latest period selected
- Sidebar logo: fix broken/blank logo image

### Remove
- Nothing removed

## Implementation Plan
1. Fix SettingsPage.tsx: employee fetching uses correct key, add institute/employee selectors, merge LWF into salary structure config, fix months order Apr-Mar, remove ⓘ before PT/IT heads
2. Fix ReportsPage.tsx: remove "Yf's Platform" header text from all report outputs, add Consolidated Register tab in Payroll Reports
3. Fix PayslipPage.tsx: default All for institute/employee selectors, month selector shows all months when previous session
4. Fix global month selector behavior: when previous session selected auto-pick latest month (in AttendancePage, SalaryProcessingPage, PayslipPage, ContractWorkersPage, etc.)
5. Fix SalaryProcessingPage.tsx: lock all inputs when previous month/session selected
6. Fix AttendancePage.tsx: lock attendance when previous month/session selected
7. Fix SalaryDetailsPage.tsx: add incentive column after TA
8. Fix EmployeeManagementPage.tsx: fix Excel upload to parse all columns, add download button (Excel/PDF), add employee selector, show status on card, fix spelling "Relieved"
9. Fix Employee portal pages: fix welcome back background in day mode, add hamburger sidebar toggle, add standard headers to all pages, fix My Profile buttons + country code, fix My Salary Slip selectors
10. Fix LoginPage.tsx/App.tsx: back button on login closes website, admin login always goes to dashboard
11. Fix DailyWorkersPage.tsx: period format "1-15 Apr", descending order, default latest
12. Fix sidebar logo loading issue
