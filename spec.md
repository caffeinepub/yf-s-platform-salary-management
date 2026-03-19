# Yf's Platform - Salary Management

## Current State
- Login page shows a "Demo Admin" hint box with username/password visible to all
- Employee login succeeds but shows the full admin layout (no employee-specific dashboard)
- Employee form has fields: name, employeeId, email, phone, dob, address, joiningDate, emergencyContact, emergencyPhone, institute, designation, employmentType, basicSalary, bankAccount, ifscCode, panNumber, aadharNumber, pfAccount, esicNumber
- Salary processing tracks: basic, da, hra, ta, gross, pf, esic, pt, it, totalDeductions, net, lwp, bonus

## Requested Changes (Diff)

### Add
- Employee-specific app shell: when role=employee, show a dedicated employee layout with only: Dashboard (employee summary), My Profile (view/edit personal details), My Salary Slips (view/download)
- Employee dashboard showing: employee name/ID, designation, department, institute, latest month net salary, PF/ESIC deductions, attendance status, quick links
- My Profile page: employee can view and update their own personal details (same fields as the expanded employee form below)
- My Salary Slips page: employee can see all processed salary slips for their account, download/print each
- New employee form fields: department, bhelQuarter (yes/no), profilePic, religion, gender, category, employeeStatus, bankName, bankBranch, uanNo, licNo
- New salary processing columns: specialPay, daPercent, hraPercent, daArrears, conveyanceAllowance, washingAllowance, ltc, festivalAdvance, incentive, otherEarnings, houseRent, electricityCharges, lwf, vpf, lic, festival, security, otherDeductions

### Modify
- Login page: remove the "Demo Admin" hint block entirely
- Employee login: validate employee credentials against localStorage employees/credentials (first 4 letters name + employeeId); if invalid show error instead of always succeeding
- App.tsx: check role after login; if employee route to employee-only layout/pages; if admin route to full admin layout
- Employee form fields reordered and completed: id, name, designation, department, institute, address, bhelQuarter, profilePic, dob, religion, gender, category, employeeType, employeeStatus, bankName, bankBranch, bankAccountNo, ifscCode, phone, emailId, panNo, pfNumber, esiNumber, aadhaarNo, uanNo, licNo, joiningDate
- Salary processing SalaryRecord type expanded to include all new columns: specialPay, daPercent (editable override), hraPercent (editable override), daArrears, conveyanceAllowance, washingAllowance, ltc, festivalAdvance, incentive, otherEarnings, grossEarnings (computed), houseRent, electricityCharges, lwf, epf, vpf, lic, profTax, incomeTax, festival, esi, security, otherDeductions, totalDeductions, netEarnings
- Salary processing UI: show all columns in an expanded table/form with editable fields for manual inputs; auto-calculate grossEarnings and totalDeductions and netEarnings

### Remove
- Demo hint block from LoginPage (the motion.div with "Demo Admin: username admin / password admin123")

## Implementation Plan
1. LoginPage.tsx: delete the demo hint motion.div block; fix employee login to validate credentials from localStorage (employeeCredentials key, fallback: first4letters+empId)
2. AuthContext.tsx: store employeeId in context so employee pages can look up their data
3. App.tsx: after login if role=employee render EmployeeApp (new component) instead of admin Layout; EmployeeApp has its own sidebar with Dashboard, My Profile, My Salary Slips
4. Create EmployeeDashboardPage.tsx: shows greeting, key info cards (designation, department, institute, latest net salary, PF, ESIC), quick links
5. Create EmployeeProfilePage.tsx: pre-fills all personal detail fields from localStorage employees list using logged-in employee credentials; allows saving updates
6. Create EmployeeSalarySlipsPage.tsx: shows list of all salary slips for the employee, with print/download
7. EmployeeManagementPage.tsx: expand EmpForm interface and EMPTY_FORM to include all new fields; update the Personal Details tab to show: id, name, designation, department, institute, address, bhelQuarter (select yes/no), profilePic (file upload), dob, religion, gender, category, employeeType, employeeStatus, phone, emailId, joiningDate; update Salary & Work Details tab to show: bankName, bankBranch, bankAccountNo, ifscCode, panNo, pfNumber, esiNumber, aadhaarNo, uanNo, licNo, basicSalary
8. SalaryProcessingPage.tsx: expand SalaryRecord type; update calcSalary to include all fields; update UI to show all columns with editable manual-entry fields (otherEarnings, daArrears, specialPay, houseRent, electricityCharges, etc.); recalculate grossEarnings and netEarnings live
