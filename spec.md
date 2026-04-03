# Yf's Platform - 12 Fixes

## Current State
The platform has three modules (Salary Management, TallyBooks, Fees Manager) with shared navigation. The last deployment failed. The following 12 fixes need to be applied.

## Requested Changes (Diff)

### Add
- Audit log section in Settings/Admin area: records login date/time, device IP, and actions taken; keeps last 1 month of records
- Employee management download toggle (Excel icon / PDF icon) before the Download button — spreadsheet icon default
- Settings section for editing dropdown options: designations, departments, bank names, bank branches

### Modify
- **Tally XLSX fix**: Add XLSX CDN script tag to `src/frontend/index.html` so Excel upload in Tally works (`<script src="https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js"></script>`)
- **Salary selectors**: All month selectors show short names ("Apr", "May", not "April", "March"). All institute selectors show short code, not full name. All institute/employee/month/session selectors have icons.
- **Branch auto-select**: If selector has only one option, auto-select it everywhere (designation, department, bank branch, employee, institute)
- **Employee management DOB/DOJ from Excel**: Convert date strings from Excel to `YYYY-MM-DD` format before storing so edit form shows dates correctly. Also ensure `empExtra_` fields (bank, phone, etc.) are included in SYNC_KEYS for cross-device sync.
- **Promote button hover**: Increase visibility with `hover:text-blue-300 hover:bg-blue-500/20`
- **Selectors right-aligned in Employee Management**: Add `justify-end` to the filter row container
- **Account number E+ notation**: When reading from Excel, detect if value is a large float (scientific notation) and convert to full integer string using `Number(val).toFixed(0)`
- **Salary Details institute column**: Use `shortCode` instead of `name` for the institute column
- **Daily rated period selector**: Fix period generation to be session-aware (Apr to current month), default to latest period, remove `setTimeout` anti-pattern — use `useMemo` or `useEffect` properly

### Remove
- Nothing to remove

## Implementation Plan
1. Fix `index.html` — add XLSX CDN script tag
2. Fix month display names throughout — create/update `MONTHS_SHORT` helper returning "Apr", "May", etc.
3. Fix institute selector display — use `shortCode` in all SelectItem lists for institutes
4. Fix account number E+ parsing in Excel upload
5. Fix DOB/DOJ date format in Excel upload (convert to YYYY-MM-DD)
6. Fix `empExtra_` keys not in SYNC_KEYS (add dynamic sync for extra employee data)
7. Fix Salary Details institute short code display
8. Fix Daily Rated period selector (proper default, session-aware periods)
9. Add promote button better hover styling
10. Fix Employee Management filter row right-alignment
11. Add Excel/PDF download toggle in Employee Management
12. Add Audit Log tracking
13. Fix branch auto-select universally
14. Add Settings section for editable dropdown options
