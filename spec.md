# Yf's Platform - Salary Management

## Current State
SalaryDetailsPage has Basic and TA fields per employee stored in empExtra/backend.
SalaryProcessingPage has manual lwpPrev/lwpCurr/totalLWP inputs, shows DA%+DA amount as separate inputs, same for HRA%, and VPF is a plain manual amount input. All employee types see same earnings fields. LWF is manual. VPF is not in salary details.

## Requested Changes (Diff)

### Add
- Salary Details: VPF field with mode toggle — `%` (percent of basic) or fixed amount. Store `vpfMode` ('percent'|'fixed') and `vpfValue` in empExtra.
- Salary Processing: LWP Amount display — auto-calculated from attendance, shown in red with negative sign. Replace prev/curr/total LWP day inputs.
- Salary Processing: Arrears input for temporary employees (shown instead of DA Arrears).
- Salary Processing: LWF auto-deducted ₹10 in June and December only (no manual input, just auto-filled).

### Modify
- Salary Details table: add VPF column with mode toggle (% / fixed) and value input.
- Salary Processing: Basic auto-populated from salary details (already stored in emp.basicSalary + empExtra).
- Salary Processing: Remove lwpPrev, lwpCurr, totalLWP editable inputs. Instead show single read-only "LWP Deduction" amount in red with negative sign (auto-calculated from attendance).
- Salary Processing earnings: Special Pay, DA, HRA, TA, LTC, DA Arrears — hide for temporary employees.
- Salary Processing: DA, HRA, EPF, ESIC, VPF — use inline locked-% prefix box + auto-calculated read-only amount (like phone country code pattern). User cannot edit % inline; % comes from fixed rates (DA=257%, HRA=20%, EPF=12%, ESIC=0.75%) or from empExtra for VPF.
- Salary Processing: VPF calculated automatically from empExtra vpfMode/vpfValue.
- Salary Processing: EPF, ESIC, Professional Tax, Income Tax — already auto-calc, keep as read-only with inline % prefix.
- Salary Processing: LWF — auto-set to 10 if current month is June or December, else 0 (no manual input).

### Remove
- Salary Processing: Manual LWP Prev Month, LWP Curr Month, Total LWP Days inputs.
- Salary Processing: Separate DA% and HRA% editable inputs (% is now shown as locked prefix).
- Salary Processing: Manual LWF input (now automatic).

## Implementation Plan
1. Update `SalaryDetailsPage.tsx`:
   - Add VPF column: mode toggle button (%/fixed) + value input per employee.
   - Save vpfMode and vpfValue to empExtra on Save.
2. Update `SalaryProcessingPage.tsx`:
   - SalaryInputs type: remove lwpPrev/lwpCurr/lwp manual fields, add lwpAmount (computed). Add arrears for temp. Remove lwf as manual (auto). Remove daPercent/hraPercent as editable.
   - calcSalary: read vpfMode/vpfValue from empExtra to calculate vpf. Auto-calculate lwf=10 for June/December. Hide special pay/da/hra/ta/ltc/daArrears for temporary; show arrears for temporary instead.
   - NumInput component: add PercentPrefixInput variant for inline locked-% prefix + auto-calculated amount.
   - In expanded form: show LWP Deduction as red negative display (not input). Show DA as [257%][calc], HRA as [20%][calc], EPF as [12%][calc], ESIC as [0.75%][calc], VPF as [vpf%][calc] or fixed.
   - LWF: no input shown; auto-set and displayed as auto-deducted note in June/Dec.
