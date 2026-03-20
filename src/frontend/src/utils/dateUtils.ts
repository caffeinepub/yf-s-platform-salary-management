const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

/**
 * Format a date string into "dd-mmm,yyyy" format.
 * e.g. "2026-01-15" → "15-Jan,2026"
 * Returns "—" if null/undefined/invalid.
 */
export function formatDate(dateStr: string | undefined | null): string {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return "—";
  const day = String(d.getDate()).padStart(2, "0");
  const mon = MONTHS[d.getMonth()];
  const year = d.getFullYear();
  return `${day}-${mon},${year}`;
}

/** Format today's date in "dd-mmm,yyyy" format. */
export function formatToday(): string {
  return formatDate(new Date().toISOString());
}
