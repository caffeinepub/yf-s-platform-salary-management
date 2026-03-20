# Yf's Platform - Salary Management

## Current State
Employee Management page has an employee add/edit form with two internal tabs:
- **Personal Details**: personal info fields
- **Salary & Work Details**: basicSalary, ta, bankName, bankBranch, bankAccountNo, ifscCode, panNo, pfNumber, esiNumber, aadhaarNo, uanNo, licNo

## Requested Changes (Diff)

### Add
- A new top-level tab called **"Salary Details"** inside the Employee Management page (above the employee list/form area)
- This Salary Details tab shows a table of all employees with columns: Employee ID, Name, Designation, Institute, Basic Salary (₹), TA (₹), and an Edit/Save action
- Each row is editable inline (or via a small modal) to set basicSalary and ta per employee
- The main Employee Management view becomes tab 1 ("Employees") and the new view is tab 2 ("Salary Details")

### Modify
- Employee add/edit form: remove the "Salary & Work Details" tab entirely
- Merge these fields into the Personal Details tab: bankName, bankBranch, bankAccountNo, ifscCode, panNo, pfNumber, esiNumber, aadhaarNo, uanNo, licNo
- Remove basicSalary and ta from the employee form (they will be set from the new Salary Details tab)
- The Personal Details tab now has all fields in a logical grouping: personal info section, then bank & ID details section

### Remove
- The "Salary & Work Details" tab from the employee add/edit form

## Implementation Plan
1. Add top-level tabs to EmployeeManagementPage: "Employees" and "Salary Details"
2. Restructure the employee form to single tab (Personal Details) with bank/ID fields appended
3. Remove basicSalary and ta from employee form state initializer and form rendering (keep them in employee data model for Salary Details tab usage)
4. Create Salary Details tab: table listing employees, with inline editable basicSalary and ta fields per row, and a Save button per row
5. Salary Details tab should filter by institute (add institute selector at top)
