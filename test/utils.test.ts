import { describe, expect, it } from "vitest";
import {
  addDays,
  addMonths,
  addYears,
  buildMonthMatrix,
  clampDate,
  daysInMonth,
  getISOWeek,
  isAfterDay,
  isBeforeDay,
  isDateDisabled,
  isSameDay,
  isSameMonth,
  isWithinRange,
  startOfDay,
  startOfMonth,
  withTime,
} from "../src/utils/date";
import {
  monthName,
  resolveTimeZone,
  weekdayLabels,
} from "../src/utils/format";
import {
  lastNDaysPreset,
  rangePresets,
  singleDatePresets,
} from "../src/presets";

describe("date arithmetic", () => {
  it("adds days / months / years", () => {
    expect(addDays(new Date(2024, 0, 1), 5).getDate()).toBe(6);
    expect(addMonths(new Date(2024, 0, 15), 2).getMonth()).toBe(2);
    expect(addYears(new Date(2024, 0, 1), 1).getFullYear()).toBe(2025);
  });

  it("clamps the day when a month is shorter (Jan 31 + 1m -> Feb 29 in leap year)", () => {
    const r = addMonths(new Date(2024, 0, 31), 1);
    expect(r.getMonth()).toBe(1); // February
    expect(r.getDate()).toBe(29);
  });

  it("knows the number of days in a month", () => {
    expect(daysInMonth(2024, 1)).toBe(29); // leap February
    expect(daysInMonth(2023, 1)).toBe(28);
    expect(daysInMonth(2024, 3)).toBe(30); // April
  });

  it("computes start of day / month", () => {
    const d = new Date(2024, 5, 15, 13, 30, 45);
    expect(startOfDay(d).getHours()).toBe(0);
    expect(startOfMonth(d).getDate()).toBe(1);
  });
});

describe("comparisons", () => {
  it("isSameDay / isSameMonth", () => {
    expect(isSameDay(new Date(2024, 0, 1), new Date(2024, 0, 1, 23))).toBe(true);
    expect(isSameDay(new Date(2024, 0, 1), new Date(2024, 0, 2))).toBe(false);
    expect(isSameDay(null, new Date())).toBe(false);
    expect(isSameMonth(new Date(2024, 0, 1), new Date(2024, 0, 28))).toBe(true);
    expect(isSameMonth(new Date(2024, 0, 1), new Date(2024, 1, 1))).toBe(false);
  });

  it("isBeforeDay / isAfterDay ignore the time component", () => {
    expect(isBeforeDay(new Date(2024, 0, 1, 23), new Date(2024, 0, 2, 1))).toBe(true);
    expect(isAfterDay(new Date(2024, 0, 3), new Date(2024, 0, 2))).toBe(true);
    expect(isBeforeDay(new Date(2024, 0, 2, 0), new Date(2024, 0, 2, 23))).toBe(false);
  });

  it("isWithinRange is inclusive and order-independent", () => {
    const a = new Date(2024, 0, 10);
    const b = new Date(2024, 0, 20);
    expect(isWithinRange(new Date(2024, 0, 15), a, b)).toBe(true);
    expect(isWithinRange(new Date(2024, 0, 10), a, b)).toBe(true); // inclusive
    expect(isWithinRange(new Date(2024, 0, 20), a, b)).toBe(true);
    expect(isWithinRange(new Date(2024, 0, 15), b, a)).toBe(true); // reversed
    expect(isWithinRange(new Date(2024, 0, 25), a, b)).toBe(false);
    expect(isWithinRange(new Date(2024, 0, 15), a, null)).toBe(false);
  });
});

describe("calendar matrix", () => {
  it("always produces 42 cells", () => {
    expect(buildMonthMatrix(new Date(2024, 0, 1), 0)).toHaveLength(42);
    expect(buildMonthMatrix(new Date(2024, 1, 1), 1)).toHaveLength(42);
  });

  it("starts on the configured first day of week", () => {
    // Sunday-first: first cell weekday is Sunday (0).
    const sun = buildMonthMatrix(new Date(2024, 0, 1), 0);
    expect(sun[0].getDay()).toBe(0);
    // Monday-first: first cell weekday is Monday (1).
    const mon = buildMonthMatrix(new Date(2024, 0, 1), 1);
    expect(mon[0].getDay()).toBe(1);
  });

  it("includes leading days from the previous month", () => {
    // Jan 2024 starts on a Monday; Sunday-first grid leads with Dec 31.
    const grid = buildMonthMatrix(new Date(2024, 0, 1), 0);
    expect(grid[0].getMonth()).toBe(11); // December
    expect(grid[0].getDate()).toBe(31);
  });
});

describe("ISO week numbers", () => {
  it("matches known values", () => {
    expect(getISOWeek(new Date(2024, 0, 1))).toBe(1);
    expect(getISOWeek(new Date(2024, 0, 8))).toBe(2);
    expect(getISOWeek(new Date(2024, 11, 31))).toBe(1); // belongs to 2025-W1
    expect(getISOWeek(new Date(2026, 0, 1))).toBe(1);
  });
});

describe("disabled / clamp logic", () => {
  const min = new Date(2024, 0, 10);
  const max = new Date(2024, 0, 20);

  it("respects min/max bounds", () => {
    expect(isDateDisabled(new Date(2024, 0, 9), min, max)).toBe(true);
    expect(isDateDisabled(new Date(2024, 0, 21), min, max)).toBe(true);
    expect(isDateDisabled(new Date(2024, 0, 10), min, max)).toBe(false);
    expect(isDateDisabled(new Date(2024, 0, 20), min, max)).toBe(false);
  });

  it("supports an array of disabled dates", () => {
    const list = [new Date(2024, 0, 15)];
    expect(isDateDisabled(new Date(2024, 0, 15), undefined, undefined, list)).toBe(true);
    expect(isDateDisabled(new Date(2024, 0, 16), undefined, undefined, list)).toBe(false);
  });

  it("supports a predicate (e.g. disable weekends)", () => {
    const noWeekends = (d: Date) => d.getDay() === 0 || d.getDay() === 6;
    expect(isDateDisabled(new Date(2024, 0, 6), undefined, undefined, noWeekends)).toBe(true); // Sat
    expect(isDateDisabled(new Date(2024, 0, 8), undefined, undefined, noWeekends)).toBe(false); // Mon
  });

  it("clamps a date into the window", () => {
    expect(clampDate(new Date(2024, 0, 5), min, max).getTime()).toBe(min.getTime());
    expect(clampDate(new Date(2024, 0, 25), min, max).getTime()).toBe(max.getTime());
    expect(clampDate(new Date(2024, 0, 15), min, max).getDate()).toBe(15);
  });
});

describe("withTime", () => {
  it("copies time fields onto a day", () => {
    const day = new Date(2024, 0, 15);
    const time = new Date(2020, 5, 1, 14, 30, 45);
    const r = withTime(day, time);
    expect(r.getFullYear()).toBe(2024);
    expect(r.getMonth()).toBe(0);
    expect(r.getDate()).toBe(15);
    expect(r.getHours()).toBe(14);
    expect(r.getMinutes()).toBe(30);
    expect(r.getSeconds()).toBe(45);
  });

  it("zeroes the time when no source time is given", () => {
    const r = withTime(new Date(2024, 0, 15), null);
    expect(r.getHours()).toBe(0);
    expect(r.getMinutes()).toBe(0);
  });
});

describe("formatting helpers", () => {
  it("returns localized month names", () => {
    expect(monthName(new Date(2024, 0, 1), "en-US")).toBe("January");
    expect(monthName(new Date(2024, 0, 1), "en-US", "short")).toBe("Jan");
  });

  it("orders weekday labels from firstDayOfWeek", () => {
    const sunFirst = weekdayLabels("en-US", 0);
    expect(sunFirst[0]).toBe("Sun");
    const monFirst = weekdayLabels("en-US", 1);
    expect(monFirst[0]).toBe("Mon");
    expect(monFirst).toHaveLength(7);
  });

  it("resolves a time zone string", () => {
    expect(typeof resolveTimeZone()).toBe("string");
    expect(resolveTimeZone("Europe/Paris")).toBe("Europe/Paris");
  });
});

describe("presets", () => {
  it("ships single-date presets that resolve to Dates", () => {
    expect(singleDatePresets.length).toBeGreaterThan(0);
    for (const p of singleDatePresets) {
      const v = typeof p.value === "function" ? p.value() : p.value;
      expect(v instanceof Date).toBe(true);
    }
  });

  it("ships range presets that resolve to {start,end}", () => {
    for (const p of rangePresets) {
      const v = typeof p.value === "function" ? p.value() : p.value;
      expect(v).toHaveProperty("start");
      expect(v).toHaveProperty("end");
    }
  });

  it("builds a custom last-N-days preset", () => {
    const p = lastNDaysPreset(7);
    expect(p.label).toBe("Last 7 days");
    const v = (typeof p.value === "function" ? p.value() : p.value) as {
      start: Date;
      end: Date;
    };
    const spanDays =
      Math.round((startOfDay(v.end).getTime() - startOfDay(v.start).getTime()) / 86400000) + 1;
    expect(spanDays).toBe(7);
  });
});
