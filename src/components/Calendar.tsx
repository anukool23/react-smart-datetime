import { useMemo, useRef, useState, type KeyboardEvent } from "react";
import type { DateRange, DisabledDates, WeekDay } from "../types";
import {
  addDays,
  addMonths,
  addYears,
  buildMonthMatrix,
  getISOWeek,
  isAfterDay,
  isBeforeDay,
  isDateDisabled,
  isSameDay,
  isSameMonth,
  isWithinRange,
  startOfMonth,
} from "../utils/date";
import { monthName, weekdayLabels } from "../utils/format";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "./icons";

type InternalView = "days" | "months" | "years";

interface CalendarProps {
  /** Month currently shown. */
  viewDate: Date;
  onViewDateChange: (d: Date) => void;
  /** Selected day in single mode. */
  selected: Date | null;
  /** Selected range in range mode. */
  range: DateRange | null;
  isRange: boolean;
  onSelectDay: (d: Date) => void;
  locale: string;
  firstDayOfWeek: WeekDay;
  minDate?: Date;
  maxDate?: Date;
  disabledDates?: DisabledDates;
  showWeekNumbers: boolean;
  /** Offset in months from `viewDate` (for multi-month layouts). */
  monthOffset?: number;
  /** Hover endpoint used to preview a range before the second click. */
  hoverDate: Date | null;
  onHoverDate: (d: Date | null) => void;
  /** Controls month nav arrows (hidden on non-first panels). */
  showNav?: boolean;
}

export function Calendar({
  viewDate,
  onViewDateChange,
  selected,
  range,
  isRange,
  onSelectDay,
  locale,
  firstDayOfWeek,
  minDate,
  maxDate,
  disabledDates,
  showWeekNumbers,
  monthOffset = 0,
  hoverDate,
  onHoverDate,
  showNav = true,
}: CalendarProps) {
  const [view, setView] = useState<InternalView>("days");
  const gridRef = useRef<HTMLDivElement>(null);

  const panelDate = useMemo(
    () => addMonths(startOfMonth(viewDate), monthOffset),
    [viewDate, monthOffset],
  );

  const weekdays = useMemo(
    () => weekdayLabels(locale, firstDayOfWeek),
    [locale, firstDayOfWeek],
  );

  const matrix = useMemo(
    () => buildMonthMatrix(panelDate, firstDayOfWeek),
    [panelDate, firstDayOfWeek],
  );

  const today = useMemo(() => new Date(), []);

  const rangeStart = range?.start ?? null;
  const rangeEnd = range?.end ?? null;
  // While picking the second endpoint, preview using the hovered day.
  const previewEnd = rangeStart && !rangeEnd ? hoverDate : rangeEnd;

  const goPrevMonth = () => onViewDateChange(addMonths(viewDate, -1));
  const goNextMonth = () => onViewDateChange(addMonths(viewDate, 1));
  const goPrevYear = () => onViewDateChange(addYears(viewDate, -1));
  const goNextYear = () => onViewDateChange(addYears(viewDate, 1));

  /** Keyboard navigation across the day grid (arrow keys, page, home/end). */
  const handleGridKeyDown = (e: KeyboardEvent<HTMLButtonElement>, day: Date) => {
    let next: Date | null = null;
    switch (e.key) {
      case "ArrowLeft":
        next = addDays(day, -1);
        break;
      case "ArrowRight":
        next = addDays(day, 1);
        break;
      case "ArrowUp":
        next = addDays(day, -7);
        break;
      case "ArrowDown":
        next = addDays(day, 7);
        break;
      case "PageUp":
        next = addMonths(day, e.shiftKey ? -12 : -1);
        break;
      case "PageDown":
        next = addMonths(day, e.shiftKey ? 12 : 1);
        break;
      case "Home":
        next = addDays(day, -((day.getDay() - firstDayOfWeek + 7) % 7));
        break;
      case "End":
        next = addDays(day, 6 - ((day.getDay() - firstDayOfWeek + 7) % 7));
        break;
      case "Enter":
      case " ":
        e.preventDefault();
        if (!isDateDisabled(day, minDate, maxDate, disabledDates)) onSelectDay(day);
        return;
      default:
        return;
    }
    e.preventDefault();
    if (next) {
      if (!isSameMonth(next, panelDate)) onViewDateChange(startOfMonth(next));
      onHoverDate(isRange ? next : null);
      // Move focus to the new cell after it renders.
      requestAnimationFrame(() => {
        const el = gridRef.current?.querySelector<HTMLButtonElement>(
          `[data-date="${next!.toDateString()}"]`,
        );
        el?.focus();
      });
    }
  };

  /* ----------------------- Month / Year sub-views ----------------------- */

  if (view === "months") {
    return (
      <div className="rdt-calendar">
        <div className="rdt-cal-header">
          <button
            type="button"
            className="rdt-nav-btn"
            onClick={goPrevYear}
            aria-label="Previous year"
          >
            <ChevronLeft />
          </button>
          <button
            type="button"
            className="rdt-cal-title"
            onClick={() => setView("years")}
          >
            {panelDate.getFullYear()}
          </button>
          <button
            type="button"
            className="rdt-nav-btn"
            onClick={goNextYear}
            aria-label="Next year"
          >
            <ChevronRight />
          </button>
        </div>
        <div className="rdt-grid-months">
          {Array.from({ length: 12 }, (_, m) => {
            const d = new Date(panelDate.getFullYear(), m, 1);
            const active = m === panelDate.getMonth();
            return (
              <button
                type="button"
                key={m}
                className={`rdt-cell rdt-cell-month${active ? " rdt-selected" : ""}`}
                onClick={() => {
                  onViewDateChange(new Date(panelDate.getFullYear(), m, 1));
                  setView("days");
                }}
              >
                {monthName(d, locale, "short")}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  if (view === "years") {
    const base = Math.floor(panelDate.getFullYear() / 12) * 12;
    return (
      <div className="rdt-calendar">
        <div className="rdt-cal-header">
          <button
            type="button"
            className="rdt-nav-btn"
            onClick={() => onViewDateChange(addYears(viewDate, -12))}
            aria-label="Previous years"
          >
            <ChevronLeft />
          </button>
          <span className="rdt-cal-title rdt-cal-title-static">
            {base} – {base + 11}
          </span>
          <button
            type="button"
            className="rdt-nav-btn"
            onClick={() => onViewDateChange(addYears(viewDate, 12))}
            aria-label="Next years"
          >
            <ChevronRight />
          </button>
        </div>
        <div className="rdt-grid-months">
          {Array.from({ length: 12 }, (_, i) => {
            const year = base + i;
            const active = year === panelDate.getFullYear();
            return (
              <button
                type="button"
                key={year}
                className={`rdt-cell rdt-cell-month${active ? " rdt-selected" : ""}`}
                onClick={() => {
                  onViewDateChange(new Date(year, panelDate.getMonth(), 1));
                  setView("months");
                }}
              >
                {year}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  /* ----------------------------- Day view ----------------------------- */

  return (
    <div className="rdt-calendar">
      <div className="rdt-cal-header">
        {showNav ? (
          <div className="rdt-nav-group">
            <button
              type="button"
              className="rdt-nav-btn"
              onClick={goPrevYear}
              aria-label="Previous year"
            >
              <ChevronsLeft />
            </button>
            <button
              type="button"
              className="rdt-nav-btn"
              onClick={goPrevMonth}
              aria-label="Previous month"
            >
              <ChevronLeft />
            </button>
          </div>
        ) : (
          <span className="rdt-nav-spacer" />
        )}

        <button
          type="button"
          className="rdt-cal-title"
          onClick={() => setView("months")}
        >
          {monthName(panelDate, locale)} {panelDate.getFullYear()}
        </button>

        {showNav ? (
          <div className="rdt-nav-group">
            <button
              type="button"
              className="rdt-nav-btn"
              onClick={goNextMonth}
              aria-label="Next month"
            >
              <ChevronRight />
            </button>
            <button
              type="button"
              className="rdt-nav-btn"
              onClick={goNextYear}
              aria-label="Next year"
            >
              <ChevronsRight />
            </button>
          </div>
        ) : (
          <span className="rdt-nav-spacer" />
        )}
      </div>

      <div
        className={`rdt-weekdays${showWeekNumbers ? " rdt-has-weeknum" : ""}`}
        aria-hidden
      >
        {showWeekNumbers && <span className="rdt-weeknum-head">#</span>}
        {weekdays.map((d, i) => (
          <span key={i} className="rdt-weekday">
            {d}
          </span>
        ))}
      </div>

      <div
        ref={gridRef}
        className={`rdt-grid-days${showWeekNumbers ? " rdt-has-weeknum" : ""}`}
        role="grid"
      >
        {Array.from({ length: 6 }, (_, week) => {
          const weekDays = matrix.slice(week * 7, week * 7 + 7);
          return (
            <div className="rdt-week" key={week} role="row">
              {showWeekNumbers && (
                <span className="rdt-weeknum">{getISOWeek(weekDays[0])}</span>
              )}
              {weekDays.map((day) => {
                const outside = !isSameMonth(day, panelDate);
                const disabled = isDateDisabled(
                  day,
                  minDate,
                  maxDate,
                  disabledDates,
                );
                const isToday = isSameDay(day, today);

                const selectedSingle = !isRange && isSameDay(day, selected);
                const isStart = isRange && isSameDay(day, rangeStart);
                const isEnd =
                  isRange && (isSameDay(day, rangeEnd) || isSameDay(day, previewEnd));
                const inRange =
                  isRange &&
                  isWithinRange(day, rangeStart, previewEnd) &&
                  !isStart &&
                  !isEnd;

                const classes = ["rdt-cell", "rdt-cell-day"];
                if (outside) classes.push("rdt-outside");
                if (disabled) classes.push("rdt-disabled");
                if (isToday) classes.push("rdt-today");
                if (selectedSingle || isStart || isEnd) classes.push("rdt-selected");
                if (inRange) classes.push("rdt-in-range");
                if (isStart && (rangeEnd || previewEnd)) classes.push("rdt-range-start");
                if (isEnd && rangeStart) classes.push("rdt-range-end");

                // Roving tabindex: focusable cell is the selected day, else today,
                // else the 1st of the visible month.
                const focusTarget =
                  (selected && isSameDay(day, selected)) ||
                  (!selected && isToday && !outside) ||
                  (!selected && !isSameMonth(today, panelDate) && day.getDate() === 1 && !outside);

                return (
                  <button
                    type="button"
                    key={day.toISOString()}
                    data-date={day.toDateString()}
                    className={classes.join(" ")}
                    disabled={disabled}
                    tabIndex={focusTarget ? 0 : -1}
                    aria-pressed={selectedSingle || isStart || isEnd}
                    aria-label={day.toDateString()}
                    aria-current={isToday ? "date" : undefined}
                    onClick={() => onSelectDay(day)}
                    onMouseEnter={() => isRange && onHoverDate(day)}
                    onKeyDown={(e) => handleGridKeyDown(e, day)}
                  >
                    {day.getDate()}
                  </button>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/** Re-exported for callers that need range-boundary checks. */
export { isBeforeDay, isAfterDay };
