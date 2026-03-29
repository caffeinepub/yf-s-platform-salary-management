# Yf's Platform

## Current State
Multi-module platform (Salary, Tally, Fees) with login, sync overlay, and Role-based routing in App.tsx. ContractWorkersPage has month selector showing "Jan 2026" format and no session selector.

## Requested Changes (Diff)

### Add
- ErrorBoundary wrapper around AppInner so runtime errors show a readable error screen instead of blank white page
- Session selector in ContractWorkersPage header, placed after the month selector

### Modify
- ContractWorkersPage month selector: show month name only ("Jan", "Feb", etc.) not "Jan 2026"
- Month list generation: label should be just the month short name, but internally still track month+year for data matching

### Remove
- Nothing removed

## Implementation Plan
1. Add ErrorBoundary class component in App.tsx (or separate file) wrapping AppInner — shows error message with reload button on crash
2. In ContractWorkersPage.tsx, update `getMonthList()` to return labels as just month name (MONTHS_SHORT[m-1]), keeping month+year internally
3. Add `selectedSession` state with session selector (2004-05 to current, descending, current default) after the month selector in the header row
4. Filter/use session for data scoping if needed (can be display-only for now, consistent with other pages)
