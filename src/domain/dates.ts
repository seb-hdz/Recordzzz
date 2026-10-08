/**
 * Converts a date input value (YYYY-MM-DD) to ISO using local noon,
 * avoiding UTC midnight shifting the calendar day in western timezones.
 */
export function dateInputToIso(dateYmd: string): string {
  const parts = dateYmd.split("-").map((n) => parseInt(n, 10));
  const [y, m, d] = parts;
  if (!y || !m || !d) return new Date().toISOString();
  return new Date(y, m - 1, d, 12, 0, 0, 0).toISOString();
}

function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

/** Formats an ISO timestamp for <input type="date"> in local calendar day. */
export function isoToDateInput(iso?: string): string {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
}

/** Today's calendar day as YYYY-MM-DD in the local timezone. */
export function todayDateInput(): string {
  const date = new Date();
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
}

/** Calendar day one year before today as YYYY-MM-DD in the local timezone. */
export function oneYearAgoDateInput(): string {
  const date = new Date();
  date.setFullYear(date.getFullYear() - 1);
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
}

/** Whether an ISO timestamp falls on a local calendar day within [from, to] (inclusive). */
export function isoInDateInputRange(
  iso: string,
  fromYmd: string,
  toYmd: string
): boolean {
  const day = isoToDateInput(iso);
  if (!day) return false;
  const start = fromYmd <= toYmd ? fromYmd : toYmd;
  const end = fromYmd <= toYmd ? toYmd : fromYmd;
  return day >= start && day <= end;
}

/** Formats YYYY-MM-DD as DD/MM/YYYY for display. */
export function formatDateDisplay(ymd: string): string {
  const [y, m, d] = ymd.split("-");
  if (!y || !m || !d) return "";
  return `${d}/${m}/${y}`;
}
