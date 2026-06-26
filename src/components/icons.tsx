import type { SVGProps } from "react";

/**
 * Inlined SVG icons so the library ships with zero runtime dependencies.
 * They inherit `currentColor` and a default 1em size.
 */
const base = (props: SVGProps<SVGSVGElement>) => ({
  width: "1em",
  height: "1em",
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
  focusable: false,
  ...props,
});

export const CalendarIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg {...base(props)}>
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <path d="M16 2v4M8 2v4M3 10h18" />
  </svg>
);

export const ClockIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg {...base(props)}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </svg>
);

export const ChevronLeft = (props: SVGProps<SVGSVGElement>) => (
  <svg {...base(props)}>
    <path d="M15 18l-6-6 6-6" />
  </svg>
);

export const ChevronRight = (props: SVGProps<SVGSVGElement>) => (
  <svg {...base(props)}>
    <path d="M9 18l6-6-6-6" />
  </svg>
);

export const ChevronsLeft = (props: SVGProps<SVGSVGElement>) => (
  <svg {...base(props)}>
    <path d="M11 18l-6-6 6-6M18 18l-6-6 6-6" />
  </svg>
);

export const ChevronsRight = (props: SVGProps<SVGSVGElement>) => (
  <svg {...base(props)}>
    <path d="M13 18l6-6-6-6M6 18l6-6-6-6" />
  </svg>
);

export const CloseIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg {...base(props)}>
    <path d="M18 6L6 18M6 6l12 12" />
  </svg>
);

export const ChevronUp = (props: SVGProps<SVGSVGElement>) => (
  <svg {...base(props)}>
    <path d="M18 15l-6-6-6 6" />
  </svg>
);

export const ChevronDown = (props: SVGProps<SVGSVGElement>) => (
  <svg {...base(props)}>
    <path d="M6 9l6 6 6-6" />
  </svg>
);
