import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";
import { DateTimePicker } from "../src/DateTimePicker";
import type { DateRange } from "../src/types";

/** A fixed reference date so tests are deterministic. */
const JAN_15 = new Date(2024, 0, 15, 9, 30, 0);

/** Find a day button inside a container by its date string (the aria-label). */
function dayButton(root: HTMLElement, label: RegExp) {
  return within(root).getByRole("button", { name: label });
}

describe("trigger / input", () => {
  it("renders the placeholder when empty", () => {
    render(<DateTimePicker placeholder="Pick a date" />);
    expect(screen.getByText("Pick a date")).toBeTruthy();
  });

  it("shows a formatted value", () => {
    render(<DateTimePicker mode="date" defaultValue={JAN_15} />);
    // en-US short format -> "Jan 15, 2024"
    expect(screen.getByText(/Jan 15, 2024/)).toBeTruthy();
  });

  it("opens on click and toggles aria-expanded", async () => {
    render(<DateTimePicker mode="date" defaultValue={JAN_15} />);
    const cb = screen.getByRole("combobox");
    expect(cb.getAttribute("aria-expanded")).toBe("false");
    fireEvent.click(cb);
    expect(cb.getAttribute("aria-expanded")).toBe("true");
    // Popover content mounts (positioned on the next frame).
    expect(await screen.findByRole("dialog")).toBeTruthy();
  });

  it("opens on Enter key", () => {
    render(<DateTimePicker mode="date" />);
    const cb = screen.getByRole("combobox");
    fireEvent.keyDown(cb, { key: "Enter" });
    expect(cb.getAttribute("aria-expanded")).toBe("true");
  });

  it("does not open when disabled", () => {
    render(<DateTimePicker mode="date" disabled />);
    const cb = screen.getByRole("combobox");
    fireEvent.click(cb);
    expect(cb.getAttribute("aria-expanded")).toBe("false");
  });

  it("clears the value via the input clear button", () => {
    const onChange = vi.fn();
    render(<DateTimePicker mode="date" defaultValue={JAN_15} onChange={onChange} />);
    fireEvent.click(screen.getByLabelText("Clear"));
    expect(onChange).toHaveBeenCalledWith(null);
  });

  it("emits a hidden input for form submission", () => {
    const { container } = render(
      <DateTimePicker mode="date" name="appt" defaultValue={JAN_15} />,
    );
    const hidden = container.querySelector('input[type="hidden"]') as HTMLInputElement;
    expect(hidden).toBeTruthy();
    expect(hidden.name).toBe("appt");
    expect(hidden.value).toBe(JAN_15.toISOString());
  });
});

describe("single date selection (inline)", () => {
  it("selects a day and calls onChange", () => {
    const onChange = vi.fn();
    const { container } = render(
      <DateTimePicker inline mode="date" defaultValue={JAN_15} onChange={onChange} />,
    );
    fireEvent.click(dayButton(container, /Jan 20 2024/));
    expect(onChange).toHaveBeenCalledTimes(1);
    expect((onChange.mock.calls[0][0] as Date).getDate()).toBe(20);
  });

  it("preserves the existing time when a new day is picked", () => {
    const onChange = vi.fn();
    const { container } = render(
      <DateTimePicker inline mode="datetime" defaultValue={JAN_15} onChange={onChange} />,
    );
    fireEvent.click(dayButton(container, /Jan 20 2024/));
    const result = onChange.mock.calls[0][0] as Date;
    expect(result.getHours()).toBe(9);
    expect(result.getMinutes()).toBe(30);
  });

  it("marks today with aria-current", () => {
    const { container } = render(<DateTimePicker inline mode="date" />);
    const today = new Date();
    const todayCell = container.querySelector('[aria-current="date"]');
    expect(todayCell).toBeTruthy();
    expect(todayCell!.textContent).toBe(String(today.getDate()));
  });

  it("works as a controlled component", () => {
    const onChange = vi.fn();
    const { container, rerender } = render(
      <DateTimePicker inline mode="date" value={JAN_15} onChange={onChange} />,
    );
    fireEvent.click(dayButton(container, /Jan 20 2024/));
    // Controlled: internal value does not change until the parent updates it.
    expect(container.querySelector(".rdt-selected")!.textContent).toBe("15");
    rerender(
      <DateTimePicker inline mode="date" value={new Date(2024, 0, 20)} onChange={onChange} />,
    );
    expect(container.querySelector(".rdt-selected")!.textContent).toBe("20");
  });
});

describe("month / year navigation", () => {
  it("navigates to the previous and next month", () => {
    const { container } = render(<DateTimePicker inline mode="date" defaultValue={JAN_15} />);
    expect(within(container).getByText(/January 2024/)).toBeTruthy();
    fireEvent.click(within(container).getByLabelText("Next month"));
    expect(within(container).getByText(/February 2024/)).toBeTruthy();
    fireEvent.click(within(container).getByLabelText("Previous month"));
    expect(within(container).getByText(/January 2024/)).toBeTruthy();
  });

  it("opens the month grid then the year grid", () => {
    const { container } = render(<DateTimePicker inline mode="date" defaultValue={JAN_15} />);
    fireEvent.click(within(container).getByText(/January 2024/));
    // Month grid shows short month names.
    expect(within(container).getByText("Mar")).toBeTruthy();
    fireEvent.click(within(container).getByText("Mar"));
    // Back to days, now in March.
    expect(within(container).getByText(/March 2024/)).toBeTruthy();
  });
});

describe("keyboard navigation in the grid", () => {
  it("moves focus with arrow keys", async () => {
    const { container } = render(<DateTimePicker inline mode="date" defaultValue={JAN_15} />);
    const start = dayButton(container, /Jan 15 2024/);
    start.focus();
    fireEvent.keyDown(start, { key: "ArrowRight" });
    // Focus is moved on the next animation frame.
    await new Promise((r) => requestAnimationFrame(() => r(null)));
    expect(document.activeElement?.getAttribute("data-date")).toBe(
      new Date(2024, 0, 16).toDateString(),
    );
  });

  it("selects the focused day on Enter", () => {
    const onChange = vi.fn();
    const { container } = render(
      <DateTimePicker inline mode="date" defaultValue={JAN_15} onChange={onChange} />,
    );
    const cell = dayButton(container, /Jan 18 2024/);
    fireEvent.keyDown(cell, { key: "Enter" });
    expect((onChange.mock.calls[0][0] as Date).getDate()).toBe(18);
  });
});

describe("min / max / disabled dates", () => {
  it("disables days outside the min/max window", () => {
    const { container } = render(
      <DateTimePicker
        inline
        mode="date"
        defaultValue={JAN_15}
        minDate={new Date(2024, 0, 10)}
        maxDate={new Date(2024, 0, 20)}
      />,
    );
    expect((dayButton(container, /Jan 0?5 2024/) as HTMLButtonElement).disabled).toBe(true);
    expect((dayButton(container, /Jan 25 2024/) as HTMLButtonElement).disabled).toBe(true);
    expect((dayButton(container, /Jan 15 2024/) as HTMLButtonElement).disabled).toBe(false);
  });

  it("ignores clicks on disabled days", () => {
    const onChange = vi.fn();
    const { container } = render(
      <DateTimePicker
        inline
        mode="date"
        defaultValue={JAN_15}
        minDate={new Date(2024, 0, 10)}
        onChange={onChange}
      />,
    );
    fireEvent.click(dayButton(container, /Jan 0?5 2024/));
    expect(onChange).not.toHaveBeenCalled();
  });

  it("disables days via a predicate", () => {
    const { container } = render(
      <DateTimePicker
        inline
        mode="date"
        defaultValue={JAN_15}
        disabledDates={(d) => d.getDate() === 17}
      />,
    );
    expect((dayButton(container, /Jan 17 2024/) as HTMLButtonElement).disabled).toBe(true);
  });
});

describe("range selection", () => {
  it("selects a range over two clicks and auto-orders endpoints", () => {
    const onRangeChange = vi.fn();
    const { container } = render(
      <DateTimePicker
        inline
        range
        mode="date"
        defaultRangeValue={{ start: null, end: null }}
        defaultValue={JAN_15}
        onRangeChange={onRangeChange}
      />,
    );
    // First click sets the start.
    fireEvent.click(dayButton(container, /Jan 20 2024/));
    let r = onRangeChange.mock.calls.at(-1)![0] as DateRange;
    expect(r.start?.getDate()).toBe(20);
    expect(r.end).toBeNull();

    // Second click "before" the start — endpoints should be reordered.
    fireEvent.click(dayButton(container, /Jan 15 2024/));
    r = onRangeChange.mock.calls.at(-1)![0] as DateRange;
    expect(r.start?.getDate()).toBe(15);
    expect(r.end?.getDate()).toBe(20);
  });

  it("previews the range on hover", () => {
    const { container } = render(
      <DateTimePicker
        inline
        range
        mode="date"
        defaultValue={JAN_15}
        rangeValue={{ start: new Date(2024, 0, 10), end: null }}
        onRangeChange={() => {}}
      />,
    );
    fireEvent.mouseEnter(dayButton(container, /Jan 14 2024/));
    // Days between start (10) and hovered (14) get the in-range class.
    expect(container.querySelectorAll(".rdt-in-range").length).toBeGreaterThan(0);
  });
});

describe("presets", () => {
  it("applies a preset value", () => {
    const onChange = vi.fn();
    const target = new Date(2024, 5, 1);
    const { container } = render(
      <DateTimePicker
        inline
        mode="date"
        onChange={onChange}
        presets={[{ label: "Jump", value: target }]}
      />,
    );
    fireEvent.click(within(container).getByText("Jump"));
    expect((onChange.mock.calls[0][0] as Date).getMonth()).toBe(5);
  });
});

describe("modes", () => {
  it("date mode shows no time tab", () => {
    const { container } = render(<DateTimePicker inline mode="date" />);
    expect(within(container).queryByRole("tab")).toBeNull();
    expect(container.querySelector(".rdt-calendar")).toBeTruthy();
  });

  it("datetime mode shows Date and Time tabs", () => {
    const { container } = render(<DateTimePicker inline mode="datetime" />);
    const tabs = within(container).getAllByRole("tab");
    expect(tabs.map((t) => t.textContent?.trim())).toEqual(["Date", "Time"]);
  });

  it("time mode renders the time columns directly", () => {
    const { container } = render(<DateTimePicker inline mode="time" />);
    expect(container.querySelector(".rdt-time-cols")).toBeTruthy();
    expect(container.querySelector(".rdt-calendar")).toBeNull();
  });
});

describe("time picker", () => {
  it("renders 12h columns with an AM/PM column by default", () => {
    const { container } = render(<DateTimePicker inline mode="time" defaultValue={JAN_15} />);
    const cols = container.querySelectorAll(".rdt-time-col");
    // hours, minutes, AM/PM (no seconds)
    expect(cols).toHaveLength(3);
    const ampm = within(container).getByRole("listbox", { name: "AM/PM" });
    expect(ampm).toBeTruthy();
  });

  it("renders 24h columns without AM/PM and with 24 hours", () => {
    const { container } = render(
      <DateTimePicker inline mode="time" use24Hour defaultValue={JAN_15} />,
    );
    const cols = container.querySelectorAll(".rdt-time-col");
    expect(cols).toHaveLength(2); // hours, minutes
    const hours = within(container).getByRole("listbox", { name: "Hours" });
    expect(hours.querySelectorAll(".rdt-time-opt")).toHaveLength(24);
  });

  it("honors minuteStep", () => {
    const { container } = render(
      <DateTimePicker inline mode="time" minuteStep={15} defaultValue={JAN_15} />,
    );
    const minutes = within(container).getByRole("listbox", { name: "Minutes" });
    expect(minutes.querySelectorAll(".rdt-time-opt")).toHaveLength(4); // 0,15,30,45
  });

  it("adds a seconds column when showSeconds is set", () => {
    const { container } = render(
      <DateTimePicker inline mode="time" showSeconds defaultValue={JAN_15} />,
    );
    expect(within(container).getByRole("listbox", { name: "Seconds" })).toBeTruthy();
  });

  it("updates the time when an option is clicked", () => {
    const onChange = vi.fn();
    const { container } = render(
      <DateTimePicker inline mode="time" use24Hour defaultValue={JAN_15} onChange={onChange} />,
    );
    const hours = within(container).getByRole("listbox", { name: "Hours" });
    fireEvent.click(within(hours).getByText("14"));
    expect((onChange.mock.calls.at(-1)![0] as Date).getHours()).toBe(14);
  });
});

describe("theming", () => {
  it("applies the theme class and accent color", () => {
    const { container } = render(
      <DateTimePicker mode="date" theme="dark" accentColor="#10b981" />,
    );
    const root = container.querySelector(".rdt-root") as HTMLElement;
    expect(root.classList.contains("rdt-theme-dark")).toBe(true);
    expect(root.style.getPropertyValue("--rdt-accent")).toBe("#10b981");
  });
});

describe("multi-month", () => {
  it("renders two calendars when monthsToShow=2", () => {
    const { container } = render(
      <DateTimePicker inline range mode="date" monthsToShow={2} defaultValue={JAN_15} />,
    );
    expect(container.querySelectorAll(".rdt-calendar")).toHaveLength(2);
  });
});

describe("week numbers", () => {
  it("renders the ISO week column", () => {
    const { container } = render(
      <DateTimePicker inline mode="date" showWeekNumbers defaultValue={JAN_15} />,
    );
    expect(container.querySelector(".rdt-weeknum")).toBeTruthy();
  });
});
