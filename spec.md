# Yf's Platform - Salary Management

## Current State
Multi-module HR/payroll platform with Salary Management, TallyBooks, and Fees Manager. Key pages: DailyWorkersPage, ContractWorkersPage, EmployeeManagementPage, SalaryProcessingPage.

## Requested Changes (Diff)

### Add
- Department dropdown with options: Administration, Academic, Finance & Accounts, Human Resource, Purchase & Store, Hostel Management, Library, IT Department, Technical, Security, Other
- Country code dropdown before phone input (default +91) in Add Employee form
- Bank Name dropdown (Bank of India, ICICI Bank, UCO Bank, HDFC Bank, State Bank of India)
- Bank Branch dropdown based on bank: Bank of India/HDFC → "Indpapuri"; ICICI → "Arera Colony"; UCO → "Piplani"; SBI → "(HET) Piplani", "(K.H) Habibganj"
- Cheque Payment checkbox in Salary Processing (unchecked by default; when checked shows "Cheque Payment" label)
- Auto-select branch when bank has only one branch option

### Modify
- **DailyWorkersPage.tsx**: Add `flex-wrap` to header selector row div so selectors wrap on mobile (currently missing unlike ContractWorkersPage)
- **ContractWorkersPage.tsx**: Fix month selector default — `MONTHS_SHORT[now.getMonth()]` (e.g. "Mar") doesn't match monthList labels which use `MONTHS_FULL` (e.g. "March"); change init to `MONTHS_FULL[now.getMonth()]`
- **EmployeeManagementPage.tsx** — Add Employee form:
  - Department: replace `<Input>` with `<Select>` using DEPARTMENTS array
  - DOB: replace `type="date"` input with overlay pattern — visible text input showing "DD-Mmm,YYYY" format (e.g. "15-Jan,2000"), transparent date input overlaid for picking; readOnly text input + hidden date input
  - Joining Date: same overlay pattern as DOB
  - Employee Status: add "Retired" and "Relived" options to existing dropdown
  - Phone: add country code Select (w-24, rounded-r-none) before the phone Input (rounded-l-none), default +91; save countryCode in empExtra
  - Bank Name: replace Input with Select (options as above); on bank change, also reset bankBranch to ""
  - Bank Branch: replace Input with Select; options derived from BANK_BRANCHES[form.bankName]; if bank has only 1 branch, auto-select it via useEffect
  - LIC No: change default state — if `form.licNos.length === 0`, show only `<button>+ Add LIC No</button>` (no input); once clicked, push "" to licNos, then show input(s) + "+ Add another LIC No" button
- **SalaryProcessingPage.tsx**:
  - Add `chequePay?: boolean` to SalaryRecord type
  - Add `chequePay` boolean to SalaryInputs type (default false)
  - In processing form, just before the action buttons row, add a checkbox row: `<Checkbox checked={inputs.chequePay} onCheckedChange=.../>` with label "Cheque Payment" (shown only when checked)
  - Store `chequePay` in SalaryRecord when saving

### Remove
- Department text Input (replaced with Select)
- Bank Name text Input (replaced with Select)
- Bank Branch text Input (replaced with Select)
- Default single empty string in licNos array on form open (keep as empty array `[]`)

## Implementation Plan
1. Edit `DailyWorkersPage.tsx`: add `flex-wrap` to header buttons div
2. Edit `ContractWorkersPage.tsx`: fix `selectedMonthLabel` initial state to use `MONTHS_FULL[now.getMonth()]`
3. Edit `EmployeeManagementPage.tsx`:
   a. Add DEPARTMENTS constant and BANK_NAMES/BANK_BRANCHES maps at top of file
   b. Add `countryCode: string` to EmpForm interface and EMPTY_FORM (default "+91")
   c. Add `formatDateDisplay` helper function
   d. Update `openEdit` to read countryCode from extra
   e. Update `handleSubmit`/`saveEmpExtra` to persist countryCode
   f. Replace department Input with Select
   g. Replace DOB Input with overlay pattern
   h. Replace Joining Date Input with overlay pattern
   i. Add Retired/Relived to status Select
   j. Replace phone Input with country-code + phone row
   k. Replace Bank Name Input with Select (reset branch on change)
   l. Replace Bank Branch Input with Select + auto-select on single option via useEffect
   m. Change LIC UI to button-first pattern
4. Edit `SalaryProcessingPage.tsx`:
   a. Add `chequePay?: boolean` to SalaryRecord
   b. Add `chequePay: boolean` to SalaryInputs (default false)
   c. Pass chequePay through defaultInputs
   d. Add Checkbox UI before action buttons in each employee card
   e. Store `chequePay` in the saved SalaryRecord
