# Yf's Platform - Version 57

## Current State
Three-module platform (Salary Management, Tally Records, Fees Manager) with shared Layout sidebar. Employee Management has bulk Excel upload (limited columns), bank info display misalignment, edit form missing LIC management. Bank Statement report doesn't populate banks from employee data. Daily/Contract workers allow adding workers without institute. Salary sidebar has no section groupings. Switching between Salary/Tally/Fees remembers last page. Tally and Fees pages lack standardized page headers. Back button closes the app.

## Requested Changes (Diff)

### Add
- Excel upload: skip/handle duplicate employees (match by staffno — skip if already exists, show count)
- Excel upload: match institute by short code (exact match first, then name fallback)
- Excel upload: if designation from Excel not in enum list, store it as custom string in extra data
- Expanded Excel columns: slno, staffno, name, designation, department, dob, joiningDate, status, institute, gender, religion, pan, pfNo, esicNo, aadhaar, uan, phone, email, bankName, bankBranch, bankAccountNo, licNos (comma separated), address, employmentType
- Update sample CSV to include all new columns with example data
- Page headers for all Tally pages (icon + colored title + description line)
- Page headers for all Fees pages (icon + colored title + description line)
- History stack in App for back navigation (salary pages, tally pages, fees pages)

### Modify
- Excel upload: fix institute matching to use shortCode first, then name
- Excel upload: remove duplicates already in system before adding from Excel (clear all existing employees first since user requested cleanup)
- Bank fields in employee card display: fix alignment so Bank Name, Branch, A/C No are properly labeled and aligned
- Bank fields in Edit Employee form: fix layout alignment
- Edit Employee form: add LIC no management same as Add Employee (start with '+ Add LIC No' button, show inputs on click, unlimited LICs)
- Bank Statement report: populate bank dropdown from actual employee bank data (read sms_extra localStorage, collect unique bankName values)
- Daily Workers page: show prompt to add institute if none exist (same as Employee Management), disable Add Worker button
- Contract Workers page: same institute check as Daily Workers
- Salary sidebar: group items under section heads like Tally/Fees sidebars (Overview: Dashboard; HR: Institutes, Employees, Salary Details; Payroll: Attendance, Salary Processing, Payslip; Workers: Daily Workers, Contract Workers; Admin: Reports, Settings)
- App.tsx: when onSystemChange is called (switching Salary/Tally/Fees from menu bar), reset to dashboard page for that system
- App.tsx/Layout.tsx: implement browser-like history stack so back button navigates step by step within the app instead of closing

### Remove
- Nothing removed

## Implementation Plan
1. **EmployeeManagementPage.tsx**: Fix handleBulkUpload — deduplicate by staffno (skip existing), match institute by shortCode first, expand CSV columns, handle custom designations, update downloadSampleFile. Fix bank field alignment in employee card. Fix Edit form LIC management.
2. **ReportsPage.tsx**: Fix Bank Statement bank selector to read unique banks from employee extra data in localStorage.
3. **DailyWorkersPage.tsx + ContractWorkersPage.tsx**: Add institute existence check, disable Add Worker until institute exists.
4. **Layout.tsx (components)**: Group salary NAV_ITEMS under section heads matching TALLY_NAV_GROUPS pattern.
5. **App.tsx**: Reset tallyPage/feesPage/currentPage to 'dashboard' when system is switched. Add history stack using window.history pushState or internal array, wire popstate/back button.
