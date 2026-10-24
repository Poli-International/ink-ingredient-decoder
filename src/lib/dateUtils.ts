/**
 * Local calendar date utility conforming strictly to Ban 19:
 * "Never use new Date().toISOString().slice(0, 10) for a date the user sees or saves.
 * It is UTC: in Asia and Australia, before UTC midnight, it dates today's entry yesterday.
 * Use the local calendar date."
 */

export function getLocalDateString(d: Date = new Date()): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatLocalDateDisplay(dateStr: string): string {
  if (!dateStr) return '—';
  // Parse YYYY-MM-DD cleanly as local date without UTC shifts
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    const y = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10) - 1;
    const d = parseInt(parts[2], 10);
    const dateObj = new Date(y, m, d);
    if (!isNaN(dateObj.getTime())) {
      return dateObj.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    }
  }
  return dateStr;
}

export function calculateDaysRemaining(targetDateStr: string): number | null {
  if (!targetDateStr) return null;
  const parts = targetDateStr.split('-');
  if (parts.length !== 3) return null;
  const y = parseInt(parts[0], 10);
  const m = parseInt(parts[1], 10) - 1;
  const d = parseInt(parts[2], 10);
  const target = new Date(y, m, d, 23, 59, 59);

  const now = new Date();
  const diffMs = target.getTime() - now.getTime();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

export function calculatePaoExpiry(openedDateStr: string, paoMonths: number): string | null {
  if (!openedDateStr || !paoMonths || paoMonths <= 0) return null;
  const parts = openedDateStr.split('-');
  if (parts.length !== 3) return null;
  const y = parseInt(parts[0], 10);
  const m = parseInt(parts[1], 10) - 1;
  const d = parseInt(parts[2], 10);

  const expiryDate = new Date(y, m + paoMonths, d);
  return getLocalDateString(expiryDate);
}
