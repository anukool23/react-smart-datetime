import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from "react";
import { createPortal } from "react-dom";
import type { Placement } from "../types";

interface PopoverProps {
  anchorRef: RefObject<HTMLElement | null>;
  placement: Placement;
  container?: HTMLElement | null;
  popoverRef: RefObject<HTMLDivElement | null>;
  children: ReactNode;
}

interface Coords {
  top: number;
  left: number;
}

const GAP = 6;

/**
 * Lightweight portal popover with flip-on-overflow positioning. Avoids a
 * floating-ui dependency: we measure the anchor and popover, then place the
 * popover, flipping vertically when it would overflow the viewport.
 */
export function Popover({
  anchorRef,
  placement,
  container,
  popoverRef,
  children,
}: PopoverProps) {
  const [coords, setCoords] = useState<Coords | null>(null);
  const frame = useRef<number | null>(null);

  useLayoutEffect(() => {
    const update = () => {
      const anchor = anchorRef.current;
      const pop = popoverRef.current;
      if (!anchor || !pop) return;

      const a = anchor.getBoundingClientRect();
      const p = pop.getBoundingClientRect();
      const vw = window.innerWidth;
      const vh = window.innerHeight;

      let [vert, horiz] = placement.split("-") as [
        "top" | "bottom",
        "start" | "end",
      ];

      // Flip vertically if there isn't room on the preferred side.
      const spaceBelow = vh - a.bottom;
      const spaceAbove = a.top;
      if (vert === "bottom" && spaceBelow < p.height + GAP && spaceAbove > spaceBelow) {
        vert = "top";
      } else if (vert === "top" && spaceAbove < p.height + GAP && spaceBelow > spaceAbove) {
        vert = "bottom";
      }

      let top =
        vert === "bottom" ? a.bottom + GAP : a.top - p.height - GAP;
      let left = horiz === "start" ? a.left : a.right - p.width;

      // Keep within the viewport horizontally.
      left = Math.max(GAP, Math.min(left, vw - p.width - GAP));
      top = Math.max(GAP, Math.min(top, vh - p.height - GAP));

      setCoords({ top, left });
    };

    const schedule = () => {
      if (frame.current != null) cancelAnimationFrame(frame.current);
      frame.current = requestAnimationFrame(update);
    };

    schedule();
    window.addEventListener("scroll", schedule, true);
    window.addEventListener("resize", schedule);
    return () => {
      if (frame.current != null) cancelAnimationFrame(frame.current);
      window.removeEventListener("scroll", schedule, true);
      window.removeEventListener("resize", schedule);
    };
  }, [anchorRef, popoverRef, placement, children]);

  // Re-measure once children mount (height becomes known).
  useEffect(() => {
    const id = requestAnimationFrame(() => {
      window.dispatchEvent(new Event("resize"));
    });
    return () => cancelAnimationFrame(id);
  }, []);

  const target = container ?? (typeof document !== "undefined" ? document.body : null);
  if (!target) return null;

  return createPortal(
    <div
      ref={popoverRef as RefObject<HTMLDivElement>}
      className="rdt-popover"
      style={{
        position: "fixed",
        top: coords?.top ?? -9999,
        left: coords?.left ?? -9999,
        visibility: coords ? "visible" : "hidden",
      }}
    >
      {children}
    </div>,
    target,
  );
}
