import type { DisabledDates, WeekDay } from "../types";

export const MS_PER_DAY = 86_400_000;

/** Clone a Date. */
export function clone(d: Date): Date {
  return new Date(d.getTime());
}

/** Start of the day (00:00:00.000) for the given date. */
export function startOfDay(d: Date): Date {
  const r = clone(d);
  r.setHours(0, 0, 0, 0);
  return r;
}

/** Are two dates the same calendar day? Null-safe. */
export function isSameDay(a: Date | null, b: Date | null): boolean {
  if (!a || !b) return false;
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

/** Are two dates in the same month/year? */
export function isSameMonth(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
}

export function addDays(d: Date, n: number): Date {
  const r = clone(d);
  r.setDate(r.getDate() + n);
  return r;
}

export function addMonths(d: Date, n: number): Date {
  const r = clone(d);
  const day = r.getDate();
  r.setDate(1);
  r.setMonth(r.getMonth() + n);
  // Clamp to the last valid day of the target month.
  r.setDate(Math.min(day, daysInMonth(r.getFullYear(), r.getMonth())));
  return r;
}

export function addYears(d: Date, n: number): Date {
  return addMonths(d, n * 12);
}

export function daysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

export function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

/** Is `d` strictly before the start of `b`'s day? */
export function isBeforeDay(d: Date, b: Date): boolean {
  return startOfDay(d).getTime() < startOfDay(b).getTime();
}

export function isAfterDay(d: Date, b: Date): boolean {
  return startOfDay(d).getTime() > startOfDay(b).getTime();
}

/** Is `d` within [start, end] inclusive at day granularity? Null-safe. */
export function isWithinRange(
  d: Date,
  start: Date | null,
  end: Date | null,
): boolean {
  if (!start || !end) return false;
  const t = startOfDay(d).getTime();
  const lo = Math.min(startOfDay(start).getTime(), startOfDay(end).getTime());
  const hi = Math.max(startOfDay(start).getTime(), startOfDay(end).getTime());
  return t >= lo && t <= hi;
}

/**
 * Determine whether a day is selectable given min/max bounds and the
 * caller's disabled predicate/list.
 */
export function isDateDisabled(
  date: Date,
  minDate?: Date,
  maxDate?: Date,
  disabledDates?: DisabledDates,
): boolean {
  if (minDate && isBeforeDay(date, minDate)) return true;
  if (maxDate && isAfterDay(date, maxDate)) return true;
  if (!disabledDates) return false;
  if (typeof disabledDates === "function") return disabledDates(date);
  return disabledDates.some((d) => isSameDay(d, date));
}

/**
 * Build a 6-row (42-cell) calendar matrix for the month containing `viewDate`,
 * honoring the configured first day of week. Cells include leading/trailing
 * days from the adjacent months so the grid is always rectangular.
 */
export function buildMonthMatrix(
  viewDate: Date,
  firstDayOfWeek: WeekDay,
): Date[] {
  const first = startOfMonth(viewDate);
  const offset = (first.getDay() - firstDayOfWeek + 7) % 7;
  const gridStart = addDays(first, -offset);
  return Array.from({ length: 42 }, (_, i) => addDays(gridStart, i));
}

/** ISO-8601 week number (1–53) for the given date. */
export function getISOWeek(date: Date): number {
  const d = startOfDay(date);
  // Thursday of the current week decides the year.
  d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7));
  const week1 = new Date(d.getFullYear(), 0, 4);
  return (
    1 +
    Math.round(
      ((d.getTime() - week1.getTime()) / MS_PER_DAY -
        3 +
        ((week1.getDay() + 6) % 7)) /
        7,
    )
  );
}

/**
 * Copy the time fields (h/m/s/ms) from `time` onto the calendar day of
 * `day`, returning a new Date. Used when a date is picked but the existing
 * time should be preserved.
 */
export function withTime(day: Date, time: Date | null): Date {
  const r = clone(day);
  if (time) {
    r.setHours(
      time.getHours(),
      time.getMinutes(),
      time.getSeconds(),
      time.getMilliseconds(),
    );
  } else {
    r.setHours(0, 0, 0, 0);
  }
  return r;
}

/** Clamp a date into the [min, max] window (day granularity preserved). */
export function clampDate(date: Date, minDate?: Date, maxDate?: Date): Date {
  if (minDate && date.getTime() < minDate.getTime()) return clone(minDate);
  if (maxDate && date.getTime() > maxDate.getTime()) return clone(maxDate);
  return date;
}
