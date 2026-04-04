# Yf's Platform - Salary Management

## Current State
A three-module platform (Salary Management, TallyBooks, Fees Manager) with shared navigation. The codebase is at Version 62 with many prior fixes.

## Requested Changes (Diff)

### Add
- P. Tax ⓘ icon in salary processing showing calculation breakdown (similar to income tax ⓘ)
- Custom bank and branch management in Settings > Employee Management Settings
- P. Tax ⓘ icon showing slab and calculated amount

### Modify
1. **Salary Details** — Fix designation display (was showing wrong designation from enum mapping)
2. **Salary Processing** — TA and Incentive fields must be non-editable, values auto-pulled from Salary Details
3. **Salary Processing** — Add P. Tax ⓘ breakdown icon next to Professional Tax
4. **Sidebar Logo** — Show actual platform logo image instead of 'YF' initials text
5. **Settings** — Reorder sections: 1st Employee Management, 2nd Salary Structure, 3rd Daily Workers, 4th Contract Workers, 5th User Management, rest as-is
6. **Settings > Employee Management** — Add custom bank and branches management (add/edit/delete banks with their branches)
7. **All selectors** — Ensure every selector (institute, employee, month, session, designation, department, bank, branch, etc.) across ALL pages has an icon at its left side
8. **Employee filtering** — Attendance, Salary Processing, and Payslip pages should only show Active employees (filter out Retired, Resigned, Relieved, Inactive)
9. **Bank branch auto-select** — When a bank has only one branch option, auto-select it; apply this rule universally to all selectors with single options

### Remove
- Nothing

## Implementation Plan
1. Fix designation display in SalaryDetailsPage.tsx — use `extra.designation` from localStorage
2. Make TA and Incentive read-only in SalaryProcessingPage.tsx, auto-populate from salary details data
3. Add P. Tax ⓘ popover in SalaryProcessingPage.tsx with slab breakdown
4. Fix sidebar logo in Layout.tsx to show the logo image (same as login page)
5. Reorder Settings sections in SettingsPage.tsx; add custom banks/branches management UI
6. Audit all pages for selectors missing icons — add icons consistently
7. Filter employees by status === 'Active' in AttendancePage.tsx, SalaryProcessingPage.tsx, PayslipPage.tsx
8. Implement universal single-option auto-select for all dropdowns in EmployeeManagementPage.tsx and Layout forms
