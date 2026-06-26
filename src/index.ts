/**
 * Styles ship as a standalone stylesheet. Import it once in your app:
 *   import "react-datetimeui/styles.css";
 */
export { DateTimePicker, DateTimePicker as default } from "./DateTimePicker";

export {
  singleDatePresets,
  rangePresets,
  lastNDaysPreset,
} from "./presets";

export type {
  DateTimePickerProps,
  DateRange,
  Preset,
  PickerMode,
  Theme,
  Placement,
  WeekDay,
  DisabledDates,
} from "./types";

// Date helpers are handy for callers building presets / disabled predicates.
export {
  addDays,
  addMonths,
  addYears,
  isSameDay,
  isSameMonth,
  isWithinRange,
  startOfDay,
  startOfMonth,
} from "./utils/date";
