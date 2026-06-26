import type { CSSProperties, ReactNode } from "react";

/** Which fields the picker exposes. */
export type PickerMode = "datetime" | "date" | "time";

/** Visual theme. `"auto"` follows the OS `prefers-color-scheme`. */
export type Theme = "light" | "dark" | "auto";

/** Where the popover opens relative to the input. */
export type Placement =
  | "bottom-start"
  | "bottom-end"
  | "top-start"
  | "top-end";

/** A selected range. Either endpoint may be `null` while the user is picking. */
export interface DateRange {
  start: Date | null;
  end: Date | null;
}

/** A quick-select shortcut shown above the calendar. */
export interface Preset {
  label: string;
  /** A single date, a range, or a factory returning either. */
  value: Date | DateRange | (() => Date | DateRange);
}

/**
 * Predicate or list describing dates the user cannot select.
 * When a function, return `true` to disable the given day.
 */
export type DisabledDates = Date[] | ((date: Date) => boolean);

/** Day of the week, 0 = Sunday … 6 = Saturday. */
export type WeekDay = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export interface DateTimePickerProps {
  /* ----------------------------- Value ------------------------------ */

  /** Controlled value for single-date mode. */
  value?: Date | null;
  /** Uncontrolled initial value for single-date mode. */
  defaultValue?: Date | null;
  /** Fired whenever the selected date/time changes (single mode). */
  onChange?: (date: Date | null) => void;

  /** Controlled value for range mode. */
  rangeValue?: DateRange;
  /** Uncontrolled initial range. */
  defaultRangeValue?: DateRange;
  /** Fired whenever the range changes. */
  onRangeChange?: (range: DateRange) => void;

  /* --------------------------- Behaviour ---------------------------- */

  /** `"datetime"` (default), `"date"`, or `"time"`. */
  mode?: PickerMode;
  /** Enable two-endpoint range selection (date / datetime modes). */
  range?: boolean;
  /** Render the calendar inline instead of in a popover. */
  inline?: boolean;
  /** Open state (controlled). */
  open?: boolean;
  /** Fired when the popover requests to open or close. */
  onOpenChange?: (open: boolean) => void;
  /** Disable the whole control. */
  disabled?: boolean;
  /** Make the control read-only (value shown, not editable). */
  readOnly?: boolean;
  /** Show a clear (✕) button when a value is present. */
  clearable?: boolean;
  /** Close the popover automatically after a selection completes. */
  closeOnSelect?: boolean;
  /** Number of month grids shown side by side (1–3). */
  monthsToShow?: 1 | 2 | 3;
  /** Show ISO week numbers in a leading column. */
  showWeekNumbers?: boolean;
  /** Show the "Today" shortcut in the footer. */
  showTodayButton?: boolean;
  /** Show the footer entirely (Today / Done / Clear). */
  showFooter?: boolean;

  /* ---------------------------- Limits ------------------------------ */

  /** Earliest selectable date. */
  minDate?: Date;
  /** Latest selectable date. */
  maxDate?: Date;
  /** Dates the user cannot pick. */
  disabledDates?: DisabledDates;

  /* ----------------------------- Time ------------------------------- */

  /** Step between selectable minutes (must divide 60). */
  minuteStep?: number;
  /** Step between selectable seconds (must divide 60). */
  secondStep?: number;
  /** Include a seconds column in the time picker. */
  showSeconds?: boolean;
  /** Use a 24-hour clock instead of AM/PM. */
  use24Hour?: boolean;

  /* ------------------------- Localization --------------------------- */

  /** BCP-47 locale used for all formatting and month/day names. */
  locale?: string;
  /** First day of the week (0 = Sunday). */
  firstDayOfWeek?: WeekDay;
  /** Override how the date portion is formatted in the input. */
  dateFormat?: Intl.DateTimeFormatOptions;
  /** Override how the time portion is formatted in the input. */
  timeFormat?: Intl.DateTimeFormatOptions;
  /** IANA time zone used for display, e.g. `"Europe/Paris"`. */
  timeZone?: string;
  /** Show a label with the active time zone in the footer. */
  showTimeZone?: boolean;

  /* -------------------------- Shortcuts ----------------------------- */

  /** Quick-select shortcuts rendered beside the calendar. */
  presets?: Preset[];

  /* ----------------------------- UI --------------------------------- */

  /** `"light"`, `"dark"`, or `"auto"`. */
  theme?: Theme;
  /** Accent / selection color (any CSS color). Overrides the CSS var. */
  accentColor?: string;
  /** Border radius for the popover and input (any CSS length). */
  radius?: string;
  /** Placement of the popover relative to the input. */
  placement?: Placement;
  /** Placeholder shown when no value is selected. */
  placeholder?: string;
  /** Extra class on the root element. */
  className?: string;
  /** Inline style on the root element. */
  style?: CSSProperties;
  /** Accessible label for the control. */
  "aria-label"?: string;
  /** id forwarded to the input element. */
  id?: string;
  /** name forwarded to a hidden input for native form submission. */
  name?: string;
  /** Custom icon for the calendar trigger. */
  calendarIcon?: ReactNode;
  /** Custom icon for the clock trigger. */
  clockIcon?: ReactNode;
  /** Portal target for the popover. Defaults to `document.body`. */
  portalContainer?: HTMLElement | null;
}
