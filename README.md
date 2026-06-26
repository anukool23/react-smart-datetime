# react-datetimeUI

A modern, accessible, **zero-dependency** React date & time picker.

Range selection, presets, multi-month views, time zones, week numbers, dark
mode, keyboard navigation, and full theming via CSS variables — all in one
small component. **No Tailwind or CSS framework required.**

[![npm](https://img.shields.io/npm/v/react-smart-datetime.svg)](https://www.npmjs.com/package/react-smart-datetime)
[![types](https://img.shields.io/npm/types/react-smart-datetime.svg)](https://www.npmjs.com/package/react-smart-datetime)
[![license](https://img.shields.io/npm/l/react-smart-datetime.svg)](./LICENSE)

---

## ✨ Why react-datetimeUI?

| | react-datetimeUI | typical Tailwind-based pickers |
| --- | --- | --- |
| Styling | Ships a real stylesheet, themed with CSS variables | Requires Tailwind + breaks under JIT class purging |
| Runtime deps | **0** (icons inlined) | `lucide-react`, etc. |
| Range selection | ✅ with live hover preview | often stubbed / incomplete |
| Min / max / disabled dates | ✅ enforced everywhere | declared but often unimplemented |
| Presets | ✅ single **and** range, built-ins included | ✅ |
| Multi-month view | ✅ up to 3 | ❌ |
| Week numbers (ISO) | ✅ | ❌ |
| Keyboard navigation | ✅ full arrow / page / home-end | ❌ |
| Accessibility | ✅ ARIA roles, roving tabindex | partial |
| Dark mode | ✅ `light` / `dark` / `auto` | via classes only |
| Controlled & uncontrolled | ✅ both | partial |
| Time zone display | ✅ | partial |
| ESM + CJS + types | ✅ | varies |

---

## 📦 Installation

```bash
npm install react-smart-datetime
# or
yarn add react-smart-datetime
# or
pnpm add react-smart-datetime
```

`react` and `react-dom` (16.8+) are peer dependencies.

## 🚀 Quick start

```tsx
import { useState } from "react";
import { DateTimePicker } from "react-smart-datetime";
import "react-smart-datetime/styles.css"; // import once, anywhere in your app

export default function App() {
  const [date, setDate] = useState<Date | null>(null);

  return (
    <DateTimePicker
      value={date}
      onChange={setDate}
      placeholder="Select a date & time"
    />
  );
}
```

> **Heads up:** import the stylesheet **once** (e.g. in your root entry file).
> Without it the component is unstyled.

---

## 🧭 Modes

```tsx
<DateTimePicker mode="datetime" />  {/* default: date + time tabs */}
<DateTimePicker mode="date" />      {/* date only */}
<DateTimePicker mode="time" />      {/* time only */}
```

## 🎯 Range selection

```tsx
import { DateTimePicker, type DateRange } from "react-smart-datetime";

const [range, setRange] = useState<DateRange>({ start: null, end: null });

<DateTimePicker
  range
  mode="date"
  monthsToShow={2}
  rangeValue={range}
  onRangeChange={setRange}
/>;
```

Click once to set the start, move the mouse to preview, click again to set the
end. Endpoints auto-order if you pick "backwards".

## ⚡ Presets

Built-in preset sets, or supply your own:

```tsx
import {
  DateTimePicker,
  rangePresets,
  singleDatePresets,
  lastNDaysPreset,
} from "react-smart-datetime";

// Range analytics picker
<DateTimePicker range mode="date" presets={rangePresets} monthsToShow={2} />

// Single-date shortcuts
<DateTimePicker mode="date" presets={singleDatePresets} />

// Custom presets
<DateTimePicker
  range
  mode="date"
  presets={[
    lastNDaysPreset(14),
    { label: "Q1", value: { start: new Date(2026, 0, 1), end: new Date(2026, 2, 31) } },
  ]}
/>
```

## 🌍 Internationalization

Everything is formatted through the platform `Intl` APIs — no locale bundles.

```tsx
<DateTimePicker
  locale="fr-FR"
  firstDayOfWeek={1}              // Monday
  dateFormat={{ day: "2-digit", month: "long", year: "numeric" }}
  timeFormat={{ hour: "2-digit", minute: "2-digit", hour12: false }}
  timeZone="Europe/Paris"
  showTimeZone
/>
```

## 🎨 Theming

Pick a theme and an accent color, or override any CSS variable.

```tsx
<DateTimePicker theme="dark" accentColor="#10b981" radius="16px" />
<DateTimePicker theme="auto" /> {/* follows prefers-color-scheme */}
```

Fine-grained control via CSS variables (scope them to `.rdt-root` or globally):

```css
.rdt-root {
  --rdt-accent: #2563eb;
  --rdt-bg-elevated: #0b1220;
  --rdt-fg: #e6edf6;
  --rdt-radius: 14px;
  --rdt-cell-size: 40px;
}
```

Full list: `--rdt-accent`, `--rdt-accent-contrast`, `--rdt-bg`,
`--rdt-bg-elevated`, `--rdt-fg`, `--rdt-fg-muted`, `--rdt-fg-subtle`,
`--rdt-border`, `--rdt-hover`, `--rdt-shadow`, `--rdt-radius`,
`--rdt-radius-sm`, `--rdt-cell-size`, `--rdt-font`.

## 🧩 Inline mode

Render the calendar directly in the page (no popover):

```tsx
<DateTimePicker inline mode="date" showWeekNumbers />
```

## ⌨️ Keyboard support

| Key | Action |
| --- | --- |
| `Enter` / `Space` | Open the popover / select the focused day |
| `↑ ↓ ← →` | Move by week / day |
| `PageUp` / `PageDown` | Previous / next month |
| `Shift` + `PageUp/Down` | Previous / next year |
| `Home` / `End` | Start / end of week |
| `Esc` | Close the popover |

## 📝 Native form submission

Pass a `name` to emit a hidden input (ISO string, or `start/end` for ranges):

```tsx
<form>
  <DateTimePicker name="appointment" mode="datetime" />
</form>
```

---

## 📚 Props

### Value

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `value` | `Date \| null` | — | Controlled value (single mode) |
| `defaultValue` | `Date \| null` | `null` | Uncontrolled initial value |
| `onChange` | `(date: Date \| null) => void` | — | Single-mode change callback |
| `rangeValue` | `DateRange` | — | Controlled range |
| `defaultRangeValue` | `DateRange` | `{start:null,end:null}` | Uncontrolled initial range |
| `onRangeChange` | `(range: DateRange) => void` | — | Range change callback |

### Behaviour

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `mode` | `"datetime" \| "date" \| "time"` | `"datetime"` | What to pick |
| `range` | `boolean` | `false` | Two-endpoint range selection |
| `inline` | `boolean` | `false` | Render inline instead of a popover |
| `open` | `boolean` | — | Controlled open state |
| `onOpenChange` | `(open: boolean) => void` | — | Open-state callback |
| `disabled` | `boolean` | `false` | Disable the control |
| `readOnly` | `boolean` | `false` | Show value, block edits |
| `clearable` | `boolean` | `true` | Show a clear button |
| `closeOnSelect` | `boolean` | auto | Close after a selection completes |
| `monthsToShow` | `1 \| 2 \| 3` | `1` | Side-by-side month grids |
| `showWeekNumbers` | `boolean` | `false` | ISO week-number column |
| `showTodayButton` | `boolean` | `true` | "Today" footer shortcut |
| `showFooter` | `boolean` | `true` | Show the footer row |

### Limits

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `minDate` | `Date` | — | Earliest selectable date |
| `maxDate` | `Date` | — | Latest selectable date |
| `disabledDates` | `Date[] \| (date) => boolean` | — | Dates to disable |

### Time

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `minuteStep` | `number` | `1` | Minute increment (divides 60) |
| `secondStep` | `number` | `1` | Second increment (divides 60) |
| `showSeconds` | `boolean` | `false` | Include seconds column |
| `use24Hour` | `boolean` | `false` | 24-hour clock |

### Localization

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `locale` | `string` | `navigator.language` | BCP-47 locale |
| `firstDayOfWeek` | `0…6` | `0` | First weekday (0 = Sunday) |
| `dateFormat` | `Intl.DateTimeFormatOptions` | short date | Input date format |
| `timeFormat` | `Intl.DateTimeFormatOptions` | derived | Input time format |
| `timeZone` | `string` | user TZ | IANA time zone |
| `showTimeZone` | `boolean` | `false` | Show TZ label in footer |

### Shortcuts & UI

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `presets` | `Preset[]` | — | Quick-select shortcuts |
| `theme` | `"light" \| "dark" \| "auto"` | `"light"` | Color theme |
| `accentColor` | `string` | — | Override accent color |
| `radius` | `string` | — | Override border radius |
| `placement` | `"bottom-start" \| "bottom-end" \| "top-start" \| "top-end"` | `"bottom-start"` | Popover placement (auto-flips) |
| `placeholder` | `string` | `"Select…"` | Empty-state text |
| `className` / `style` | — | — | Root element styling |
| `id` / `name` | `string` | — | Forwarded to input / hidden input |
| `calendarIcon` / `clockIcon` | `ReactNode` | — | Custom trigger icons |
| `portalContainer` | `HTMLElement \| null` | `document.body` | Popover portal target |

---

## Exports

```ts
import {
  DateTimePicker,        // the component (also the default export)
  singleDatePresets,     // Preset[]
  rangePresets,          // Preset[]
  lastNDaysPreset,       // (n, label?) => Preset
  // date helpers, handy for building presets / disabled predicates:
  addDays, addMonths, addYears,
  isSameDay, isSameMonth, isWithinRange,
  startOfDay, startOfMonth,
} from "react-smart-datetime";

import type {
  DateTimePickerProps, DateRange, Preset,
  PickerMode, Theme, Placement, WeekDay, DisabledDates,
} from "react-smart-datetime";
```

## Browser support

Modern evergreen browsers. Theming uses `color-mix()`; on older browsers the
component still works but soft range/accent tints fall back gracefully.

## Development & local testing

> Requires **Node 18+** (Node 22 recommended).

```bash
npm install
npm run dev          # watch build (tsup)
npm run typecheck    # tsc --noEmit
npm test             # run the vitest suite once
npm run test:watch   # re-run on change
npm run test:coverage# coverage report (v8)
npm run build        # produce dist/
```

### 1. Unit / component tests

The suite (in `test/`) uses **Vitest** + **@testing-library/react** in a jsdom
environment and covers utilities, presets, and every component behaviour
(selection, range, keyboard nav, min/max/disabled, time picker, theming,
multi-month, week numbers…). Most component tests render in `inline` mode so the
panel is in the DOM synchronously (no portal timing).

```bash
npm test
npm run test:coverage   # ~91% statements / 85% branches
```

### 2. Visual smoke test (no build tooling)

A zero-install demo lives in `example/index.html`. It loads React from a CDN via
an import map and the locally built bundle:

```bash
npm run build
npx serve .          # or: python3 -m http.server
# open http://localhost:3000/example/
```

The demo exercises datetime, date, range (2 months + presets), time-only (24h),
dark theme, and a French/Monday-start locale.

### 3. Try it inside a real app (`npm link`)

```bash
# in this repo
npm run build
npm link

# in your app
npm link react-smart-datetime
```

Then import as usual. Re-run `npm run build` here (or `npm run dev` for watch
mode) and your app picks up the changes. Unlink with
`npm unlink react-smart-datetime` in the app.

> Tip: if you hit duplicate-React errors while linking, add
> `npm link react react-dom` from your app's `node_modules`, or prefer
> [`yalc`](https://github.com/wclr/yalc) (`yalc publish` here, `yalc add
> react-smart-datetime` in the app) which avoids symlink/peer-dependency pitfalls.

## 🤖 Automated releases (GitHub Actions)

Releases are driven by a manual workflow: [`.github/workflows/release.yml`](.github/workflows/release.yml).

### One-time setup

1. **Create an npm token** with publish rights — npmjs.com → Access Tokens →
   **Classic Token → Automation** (Automation tokens bypass 2FA, which npm
   requires for publishing).
2. **Add it as a repo secret** named `NPM_TOKEN`:
   GitHub repo → Settings → Secrets and variables → Actions → New repository secret.
3. That's it — the workflow uses the built-in `GITHUB_TOKEN` to push the tag
   and branch (no extra setup unless your branch is protected, see below).

### Running a release

1. Push your changes to a feature branch.
2. GitHub repo → **Actions → Release → Run workflow**.
3. Choose:
   - **branch** — the branch to publish from (e.g. your feature branch or `main`),
   - **release channel** — `beta` or `stable`,
   - **bump** — `patch` / `minor` / `major` (applies to **stable**; beta always
     increments the `-beta.N` counter).
4. Run. The job will:
   - install, typecheck and test;
   - bump the version (`beta` → `x.y.z-beta.N`, `stable` → the bumped version);
   - `npm publish` with `--tag beta` or `--tag latest`;
   - commit the version bump back to the selected branch;
   - create **and push a git tag** named exactly as the new version;
   - create **and push a branch** named exactly as the new version.

So publishing `1.2.0-beta.3` leaves you with npm `react-smart-datetime@beta`,
a tag `1.2.0-beta.3`, and a branch `1.2.0-beta.3`.

### Notes

- **Branch protection:** the workflow pushes the bump commit back to the source
  branch. If that branch is protected against the Actions bot, either allow
  `github-actions[bot]` to bypass protection, or release from an unprotected
  branch. (Tags and the version-named branch are always created fresh.)
- Don't want a branch created per release? Delete the last `git push` step in
  the workflow (the `refs/heads/$VERSION` one) — the tag still gets pushed.
- The first stable release moves npm's `latest` tag off the beta automatically.

## License

MIT © react-datetimeUI contributors
