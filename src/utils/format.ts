import type { WeekDay } from "../types";

/**
 * Memoized Intl.DateTimeFormat factory. Creating formatters is relatively
 * expensive, so we cache by their stringified arguments.
 */
const formatterCache = new Map<string, Intl.DateTimeFormat>();

export function getFormatter(
  locale: string,
  options: Intl.DateTimeFormatOptions,
): Intl.DateTimeFormat {
  const key = locale + JSON.stringify(options);
  let fmt = formatterCache.get(key);
  if (!fmt) {
    fmt = new Intl.DateTimeFormat(locale, options);
    formatterCache.set(key, fmt);
  }
  return fmt;
}

export function formatDate(
  date: Date,
  locale: string,
  options: Intl.DateTimeFormatOptions,
  timeZone?: string,
): string {
  return getFormatter(locale, timeZone ? { ...options, timeZone } : options).format(
    date,
  );
}

/** Localized long month name, e.g. "January". */
export function monthName(
  date: Date,
  locale: string,
  format: "long" | "short" = "long",
): string {
  return getFormatter(locale, { month: format }).format(date);
}

/**
 * Localized weekday short names ordered starting from `firstDayOfWeek`.
 * Computed from a known reference week so it respects the locale.
 */
export function weekdayLabels(
  locale: string,
  firstDayOfWeek: WeekDay,
  format: "short" | "narrow" = "short",
): string[] {
  const fmt = getFormatter(locale, { weekday: format });
  // 2021-08-01 is a Sunday — a stable anchor for indexing weekdays.
  const sunday = new Date(2021, 7, 1);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(sunday);
    d.setDate(sunday.getDate() + ((firstDayOfWeek + i) % 7));
    return fmt.format(d);
  });
}

/** Resolve the user's IANA time zone (falls back to UTC). */
export function resolveTimeZone(timeZone?: string): string {
  if (timeZone) return timeZone;
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  } catch {
    return "UTC";
  }
}
