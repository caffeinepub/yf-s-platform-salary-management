/**
 * Session utility functions.
 * A session runs from April of the start year to March of the end year.
 * e.g. "2025-26" = April 2025 – March 2026
 */

/** Returns current session string, e.g. "2025-26" */
export function getCurrentSession(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth() + 1; // 1-12
  const startYear = m >= 4 ? y : y - 1;
  return `${startYear}-${String(startYear + 1).slice(2)}`;
}

/** Returns sessions from current down to 2004-05 (descending) */
export function getSessionList(): string[] {
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth() + 1;
  const currentStartYear = m >= 4 ? y : y - 1;
  const result: string[] = [];
  for (let yr = currentStartYear; yr >= 2004; yr--) {
    result.push(`${yr}-${String(yr + 1).slice(2)}`);
  }
  return result;
}

/**
 * Given a session string (e.g. "2025-26") and a month number (1-12),
 * returns the actual calendar year for that month in the session.
 * April–December belong to the session start year;
 * January–March belong to the session end year.
 */
export function getYearFromSession(session: string, monthNum: number): number {
  const startYear = Number.parseInt(session.split("-")[0], 10);
  return monthNum >= 4 ? startYear : startYear + 1;
}
