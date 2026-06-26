import { useEffect, useRef, type RefObject } from "react";

/**
 * Invoke `handler` when a pointerdown/touchstart happens outside *all* of the
 * provided refs. Used to dismiss the popover without swallowing clicks on the
 * trigger itself.
 */
export function useOnClickOutside(
  refs: Array<RefObject<HTMLElement | null>>,
  handler: (event: Event) => void,
  enabled = true,
): void {
  const handlerRef = useRef(handler);
  handlerRef.current = handler;

  useEffect(() => {
    if (!enabled) return;

    const listener = (event: Event) => {
      const target = event.target as Node | null;
      if (!target) return;
      const inside = refs.some((ref) => ref.current?.contains(target));
      if (!inside) handlerRef.current(event);
    };

    document.addEventListener("pointerdown", listener, true);
    return () => document.removeEventListener("pointerdown", listener, true);
  }, [refs, enabled]);
}
