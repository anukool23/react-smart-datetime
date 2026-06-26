# Changelog

## 1.0.0

Initial release — a ground-up rewrite inspired by `r-datetime`.

### Added
- Zero runtime dependencies (icons inlined as SVG).
- Standalone, framework-free stylesheet themed entirely with CSS variables.
- `light` / `dark` / `auto` themes plus `accentColor` and `radius` shortcuts.
- Fully implemented range selection with live hover preview and auto-ordering.
- Enforced `minDate` / `maxDate` / `disabledDates` across the whole grid.
- Single **and** range presets, with built-ins (`singleDatePresets`,
  `rangePresets`, `lastNDaysPreset`).
- Multi-month layouts (`monthsToShow`), ISO week numbers.
- Column-based time picker with seconds, 12/24h, minute/second steps.
- Full keyboard navigation and ARIA roles (roving tabindex, dialog, grid).
- Controlled and uncontrolled value/range/open state.
- Auto-flipping portal popover and `inline` mode.
- Time-zone-aware display and optional time-zone label.
- Hidden input for native form submission via `name`.
- ESM + CJS bundles with TypeScript declarations and source maps.

### Changed from r-datetime
- No longer depends on Tailwind; removes the broken
  dynamic-class-concatenation styling approach.
- Removed `lucide-react` dependency.
- Props renamed to a controlled/uncontrolled-friendly API
  (`value` / `defaultValue`, `rangeValue` / `defaultRangeValue`).
