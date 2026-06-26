import type { DateRange, Preset } from "./types";
import { addDays, addMonths, startOfDay } from "./utils/date";

/** Today at 00:00. */
const today = () => startOfDay(new Date());

/** Range covering the last `n` days through today. */
function lastNDays(n: number): DateRange {
  return { start: addDays(today(), -(n - 1)), end: today() };
}

/** Range for the current calendar month. */
function thisMonth(): DateRange {
  const now = new Date();
  return {
    start: new Date(now.getFullYear(), now.getMonth(), 1),
    end: new Date(now.getFullYear(), now.getMonth() + 1, 0),
  };
}

/**
 * Ready-made single-date presets (Today / Tomorrow / In a week / In a month).
 * Pass to `<DateTimePicker presets={singleDatePresets} />`.
 */
export const singleDatePresets: Preset[] = [
  { label: "Today", value: () => today() },
  { label: "Tomorrow", value: () => addDays(today(), 1) },
  { label: "In a week", value: () => addDays(today(), 7) },
  { label: "In a month", value: () => addMonths(today(), 1) },
];

/**
 * Ready-made range presets for analytics-style date pickers.
 * Pass to `<DateTimePicker range presets={rangePresets} />`.
 */
export const rangePresets: Preset[] = [
  { label: "Today", value: () => ({ start: today(), end: today() }) },
  { label: "Last 7 days", value: () => lastNDays(7) },
  { label: "Last 30 days", value: () => lastNDays(30) },
  { label: "This month", value: () => thisMonth() },
];

/** Build a custom "Last N days" range preset. */
export function lastNDaysPreset(n: number, label?: string): Preset {
  return { label: label ?? `Last ${n} days`, value: () => lastNDays(n) };
}
