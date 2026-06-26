import { useEffect, useMemo, useRef } from "react";

interface TimePickerProps {
  /** The date whose time fields are being edited. */
  value: Date;
  onChange: (hours: number, minutes: number, seconds: number) => void;
  minuteStep: number;
  secondStep: number;
  showSeconds: boolean;
  use24Hour: boolean;
}

/** Build an options array [0..max) stepping by `step`. */
function range(max: number, step: number): number[] {
  const valid = step > 0 && max % step === 0 ? step : 1;
  return Array.from({ length: Math.ceil(max / valid) }, (_, i) => i * valid);
}

const pad = (n: number) => n.toString().padStart(2, "0");

/** A single scrollable column of selectable values. */
function Column({
  values,
  selected,
  format,
  onSelect,
  label,
}: {
  values: (number | string)[];
  selected: number | string;
  format: (v: number | string) => string;
  onSelect: (v: number | string) => void;
  label: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  // Keep the selected value scrolled into view when it changes.
  useEffect(() => {
    const el = ref.current?.querySelector<HTMLButtonElement>(
      '[data-active="true"]',
    );
    el?.scrollIntoView({ block: "center" });
  }, [selected]);

  return (
    <div className="rdt-time-col" role="listbox" aria-label={label} ref={ref}>
      {values.map((v) => {
        const active = v === selected;
        return (
          <button
            type="button"
            key={String(v)}
            role="option"
            aria-selected={active}
            data-active={active}
            className={`rdt-time-opt${active ? " rdt-selected" : ""}`}
            onClick={() => onSelect(v)}
          >
            {format(v)}
          </button>
        );
      })}
    </div>
  );
}

export function TimePicker({
  value,
  onChange,
  minuteStep,
  secondStep,
  showSeconds,
  use24Hour,
}: TimePickerProps) {
  const hours24 = value.getHours();
  const minutes = value.getMinutes();
  const seconds = value.getSeconds();
  const isPM = hours24 >= 12;

  const minuteOptions = useMemo(() => range(60, minuteStep), [minuteStep]);
  const secondOptions = useMemo(() => range(60, secondStep), [secondStep]);
  const hourOptions = useMemo(
    () =>
      use24Hour
        ? Array.from({ length: 24 }, (_, i) => i)
        : Array.from({ length: 12 }, (_, i) => i + 1),
    [use24Hour],
  );

  const displayHour = use24Hour
    ? hours24
    : hours24 % 12 === 0
      ? 12
      : hours24 % 12;

  const commit = (h: number, m: number, s: number) => onChange(h, m, s);

  const setHour = (h: number) => {
    const next = use24Hour
      ? h
      : isPM
        ? (h % 12) + 12
        : h % 12;
    commit(next, minutes, seconds);
  };

  const setPeriod = (period: "AM" | "PM") => {
    if (period === "AM" && isPM) commit(hours24 - 12, minutes, seconds);
    else if (period === "PM" && !isPM) commit(hours24 + 12, minutes, seconds);
  };

  return (
    <div className="rdt-time">
      <div className="rdt-time-cols">
        <Column
          label="Hours"
          values={hourOptions}
          selected={displayHour}
          format={(v) => pad(Number(v))}
          onSelect={(v) => setHour(Number(v))}
        />
        <span className="rdt-time-sep">:</span>
        <Column
          label="Minutes"
          values={minuteOptions}
          selected={minutes}
          format={(v) => pad(Number(v))}
          onSelect={(v) => commit(hours24, Number(v), seconds)}
        />
        {showSeconds && (
          <>
            <span className="rdt-time-sep">:</span>
            <Column
              label="Seconds"
              values={secondOptions}
              selected={seconds}
              format={(v) => pad(Number(v))}
              onSelect={(v) => commit(hours24, minutes, Number(v))}
            />
          </>
        )}
        {!use24Hour && (
          <Column
            label="AM/PM"
            values={["AM", "PM"]}
            selected={isPM ? "PM" : "AM"}
            format={(v) => String(v)}
            onSelect={(v) => setPeriod(v as "AM" | "PM")}
          />
        )}
      </div>
    </div>
  );
}
