import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
} from "react";
import type {
  DateRange,
  DateTimePickerProps,
  Preset,
} from "./types";
import { Calendar } from "./components/Calendar";
import { TimePicker } from "./components/TimePicker";
import { Popover } from "./components/Popover";
import {
  CalendarIcon,
  ClockIcon,
  CloseIcon,
} from "./components/icons";
import { useControllableState } from "./hooks/useControllableState";
import { useOnClickOutside } from "./hooks/useOnClickOutside";
import {
  clampDate,
  clone,
  isDateDisabled,
  withTime,
} from "./utils/date";
import { formatDate, resolveTimeZone } from "./utils/format";

const DEFAULT_DATE_FORMAT: Intl.DateTimeFormatOptions = {
  year: "numeric",
  month: "short",
  day: "numeric",
};

const DEFAULT_TIME_FORMAT: Intl.DateTimeFormatOptions = {
  hour: "2-digit",
  minute: "2-digit",
};

const EMPTY_RANGE: DateRange = { start: null, end: null };

type Tab = "date" | "time";

export function DateTimePicker(props: DateTimePickerProps) {
  const {
    value: valueProp,
    defaultValue = null,
    onChange,
    rangeValue,
    defaultRangeValue = EMPTY_RANGE,
    onRangeChange,
    mode = "datetime",
    range = false,
    inline = false,
    open: openProp,
    onOpenChange,
    disabled = false,
    readOnly = false,
    clearable = true,
    closeOnSelect,
    monthsToShow = 1,
    showWeekNumbers = false,
    showTodayButton = true,
    showFooter = true,
    minDate,
    maxDate,
    disabledDates,
    minuteStep = 1,
    secondStep = 1,
    showSeconds = false,
    use24Hour = false,
    locale = typeof navigator !== "undefined" ? navigator.language : "en-US",
    firstDayOfWeek = 0,
    dateFormat = DEFAULT_DATE_FORMAT,
    timeFormat,
    timeZone,
    showTimeZone = false,
    presets,
    theme = "light",
    accentColor,
    radius,
    placement = "bottom-start",
    placeholder = "Select…",
    className = "",
    style,
    "aria-label": ariaLabel,
    id,
    name,
    calendarIcon,
    clockIcon,
    portalContainer,
  } = props;

  const isRange = range && mode !== "time";
  const showDate = mode !== "time";
  const showTimeTab = mode !== "date";
  const resolvedTimeFormat =
    timeFormat ?? { ...DEFAULT_TIME_FORMAT, hour12: !use24Hour, ...(showSeconds ? { second: "2-digit" } : {}) };

  /* --------------------------- value state --------------------------- */

  const [single, setSingle] = useControllableState<Date | null>(
    valueProp,
    defaultValue,
    onChange,
  );
  const [rangeState, setRangeState] = useControllableState<DateRange>(
    rangeValue,
    defaultRangeValue,
    onRangeChange,
  );

  const [open, setOpen] = useControllableState<boolean>(
    openProp,
    false,
    onOpenChange,
  );

  const [activeTab, setActiveTab] = useState<Tab>(showDate ? "date" : "time");
  const [hoverDate, setHoverDate] = useState<Date | null>(null);

  const anchorDate =
    (isRange ? (rangeState.start ?? rangeState.end ?? single) : single) ??
    clampDate(new Date(), minDate, maxDate);
  const [viewDate, setViewDate] = useState<Date>(anchorDate);

  const rootRef = useRef<HTMLDivElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  /* ----------------------- open / close handling --------------------- */

  const close = useCallback(() => setOpen(false), [setOpen]);

  useOnClickOutside([rootRef, popoverRef], close, open && !inline);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        close();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, close]);

  // Re-sync the visible month when the value changes externally.
  useEffect(() => {
    if (open) setViewDate(anchorDate);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const shouldCloseOnSelect =
    closeOnSelect ?? (mode === "date" && !isRange);

  /* --------------------------- selection ----------------------------- */

  const handleSelectDay = useCallback(
    (day: Date) => {
      if (readOnly) return;
      if (isDateDisabled(day, minDate, maxDate, disabledDates)) return;

      if (isRange) {
        const { start, end } = rangeState;
        if (!start || (start && end)) {
          setRangeState({ start: withTime(day, start), end: null });
          setHoverDate(null);
        } else {
          // Complete the range, ordering the endpoints.
          let s = start;
          let e = withTime(day, end);
          if (e.getTime() < s.getTime()) [s, e] = [e, s];
          setRangeState({ start: s, end: e });
          setHoverDate(null);
          if (shouldCloseOnSelect) close();
        }
        return;
      }

      const next = withTime(day, single);
      setSingle(next);
      if (shouldCloseOnSelect) close();
    },
    [
      readOnly,
      minDate,
      maxDate,
      disabledDates,
      isRange,
      rangeState,
      single,
      setRangeState,
      setSingle,
      shouldCloseOnSelect,
      close,
    ],
  );

  const handleTimeChange = useCallback(
    (h: number, m: number, s: number) => {
      if (readOnly) return;
      const base = clone(single ?? clampDate(new Date(), minDate, maxDate));
      base.setHours(h, m, s, 0);
      setSingle(base);
    },
    [readOnly, single, minDate, maxDate, setSingle],
  );

  const handleClear = useCallback(
    (e?: { stopPropagation: () => void }) => {
      e?.stopPropagation();
      if (isRange) setRangeState(EMPTY_RANGE);
      else setSingle(null);
      setHoverDate(null);
    },
    [isRange, setRangeState, setSingle],
  );

  const applyPreset = useCallback(
    (preset: Preset) => {
      const resolved =
        typeof preset.value === "function" ? preset.value() : preset.value;
      if (resolved instanceof Date) {
        setSingle(resolved);
        setViewDate(resolved);
        if (shouldCloseOnSelect) close();
      } else {
        setRangeState(resolved);
        if (resolved.start) setViewDate(resolved.start);
        if (shouldCloseOnSelect) close();
      }
    },
    [setSingle, setRangeState, shouldCloseOnSelect, close],
  );

  /* ---------------------------- display ------------------------------ */

  const fmtDate = (d: Date) =>
    formatDate(d, locale, dateFormat, timeZone);
  const fmtTime = (d: Date) =>
    formatDate(d, locale, resolvedTimeFormat, timeZone);

  const displayText = useMemo(() => {
    if (isRange) {
      const { start, end } = rangeState;
      if (!start) return "";
      const left = fmtDate(start);
      const right = end ? fmtDate(end) : "…";
      return `${left} – ${right}`;
    }
    if (!single) return "";
    const parts: string[] = [];
    if (showDate) parts.push(fmtDate(single));
    if (mode === "datetime" || mode === "time") parts.push(fmtTime(single));
    return parts.join(mode === "datetime" ? "  ·  " : "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRange, rangeState, single, mode, showDate, locale, timeZone, dateFormat, resolvedTimeFormat]);

  const hasValue = isRange ? !!rangeState.start : !!single;

  /* ----------------------------- styles ------------------------------ */

  const cssVars = useMemo(() => {
    const vars: Record<string, string> = {};
    if (accentColor) vars["--rdt-accent"] = accentColor;
    if (radius) vars["--rdt-radius"] = radius;
    return vars as CSSProperties;
  }, [accentColor, radius]);

  const themeClass = theme === "auto" ? "rdt-theme-auto" : `rdt-theme-${theme}`;

  /* --------------------------- panel body ---------------------------- */

  const timeSource =
    single ?? clampDate(new Date(), minDate, maxDate);

  const renderPanel = () => (
    <div
      className="rdt-panel"
      style={cssVars}
      role="dialog"
      aria-modal={inline ? undefined : false}
      aria-label={ariaLabel ?? "Choose date"}
    >
      {(showDate && showTimeTab) && mode === "datetime" && (
        <div className="rdt-tabs" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "date"}
            className={`rdt-tab${activeTab === "date" ? " rdt-tab-active" : ""}`}
            onClick={() => setActiveTab("date")}
          >
            <CalendarIcon /> Date
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "time"}
            className={`rdt-tab${activeTab === "time" ? " rdt-tab-active" : ""}`}
            onClick={() => setActiveTab("time")}
          >
            <ClockIcon /> Time
          </button>
        </div>
      )}

      <div className="rdt-body">
        {presets && presets.length > 0 && activeTab === "date" && showDate && (
          <div className="rdt-presets" role="group" aria-label="Presets">
            {presets.map((p, i) => (
              <button
                type="button"
                key={i}
                className="rdt-preset"
                onClick={() => applyPreset(p)}
              >
                {p.label}
              </button>
            ))}
          </div>
        )}

        {mode === "time" ? (
          <TimePicker
            value={timeSource}
            onChange={handleTimeChange}
            minuteStep={minuteStep}
            secondStep={secondStep}
            showSeconds={showSeconds}
            use24Hour={use24Hour}
          />
        ) : activeTab === "time" ? (
          <TimePicker
            value={timeSource}
            onChange={handleTimeChange}
            minuteStep={minuteStep}
            secondStep={secondStep}
            showSeconds={showSeconds}
            use24Hour={use24Hour}
          />
        ) : (
          <div className="rdt-months">
            {Array.from({ length: monthsToShow }, (_, i) => (
              <Calendar
                key={i}
                viewDate={viewDate}
                onViewDateChange={setViewDate}
                selected={single}
                range={isRange ? rangeState : null}
                isRange={isRange}
                onSelectDay={handleSelectDay}
                locale={locale}
                firstDayOfWeek={firstDayOfWeek}
                minDate={minDate}
                maxDate={maxDate}
                disabledDates={disabledDates}
                showWeekNumbers={showWeekNumbers}
                monthOffset={i}
                hoverDate={hoverDate}
                onHoverDate={setHoverDate}
                showNav={
                  monthsToShow === 1
                    ? true
                    : i === 0
                      ? true
                      : i === monthsToShow - 1
                        ? true
                        : false
                }
              />
            ))}
          </div>
        )}
      </div>

      {showFooter && (
        <div className="rdt-footer">
          <div className="rdt-footer-info">
            {showTimeZone && (mode === "datetime" || mode === "time") && (
              <span className="rdt-tz">{resolveTimeZone(timeZone)}</span>
            )}
          </div>
          <div className="rdt-footer-actions">
            {showTodayButton && showDate && (
              <button
                type="button"
                className="rdt-btn rdt-btn-ghost"
                onClick={() => {
                  const now = clampDate(new Date(), minDate, maxDate);
                  setViewDate(now);
                  if (!isRange) handleSelectDay(now);
                }}
              >
                Today
              </button>
            )}
            {clearable && hasValue && (
              <button
                type="button"
                className="rdt-btn rdt-btn-ghost"
                onClick={() => handleClear()}
              >
                Clear
              </button>
            )}
            {!inline && (
              <button
                type="button"
                className="rdt-btn rdt-btn-primary"
                onClick={close}
              >
                Done
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );

  /* ------------------------------ trigger ---------------------------- */

  const toggleOpen = () => {
    if (disabled || readOnly) return;
    setOpen(!open);
  };

  const onTriggerKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (disabled || readOnly) return;
    if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") {
      e.preventDefault();
      setOpen(true);
    }
  };

  const rootClasses = [
    "rdt-root",
    themeClass,
    disabled ? "rdt-disabled-root" : "",
    inline ? "rdt-inline" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  // Hidden input for native form submission.
  const hiddenValue = useMemo(() => {
    if (isRange) {
      const { start, end } = rangeState;
      return start && end ? `${start.toISOString()}/${end.toISOString()}` : "";
    }
    return single ? single.toISOString() : "";
  }, [isRange, rangeState, single]);

  if (inline) {
    return (
      <div ref={rootRef} className={rootClasses} style={{ ...cssVars, ...style }}>
        {name && <input type="hidden" name={name} value={hiddenValue} readOnly />}
        {renderPanel()}
      </div>
    );
  }

  return (
    <div ref={rootRef} className={rootClasses} style={{ ...cssVars, ...style }}>
      {name && <input type="hidden" name={name} value={hiddenValue} readOnly />}
      <div
        id={id}
        className={`rdt-input${open ? " rdt-input-open" : ""}${hasValue ? "" : " rdt-input-empty"}`}
        role="combobox"
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-label={ariaLabel}
        aria-disabled={disabled}
        tabIndex={disabled ? -1 : 0}
        onClick={toggleOpen}
        onKeyDown={onTriggerKeyDown}
      >
        <span className="rdt-input-icon">
          {showDate ? calendarIcon ?? <CalendarIcon /> : clockIcon ?? <ClockIcon />}
        </span>
        <span className="rdt-input-text">
          {displayText || <span className="rdt-placeholder">{placeholder}</span>}
        </span>
        {clearable && hasValue && !disabled && !readOnly && (
          <button
            type="button"
            className="rdt-clear"
            aria-label="Clear"
            onClick={handleClear}
          >
            <CloseIcon />
          </button>
        )}
      </div>

      {open && (
        <Popover
          anchorRef={rootRef}
          placement={placement}
          container={portalContainer}
          popoverRef={popoverRef}
        >
          <div className={`${themeClass} rdt-popover-inner`} style={cssVars}>
            {renderPanel()}
          </div>
        </Popover>
      )}
    </div>
  );
}

export default DateTimePicker;
