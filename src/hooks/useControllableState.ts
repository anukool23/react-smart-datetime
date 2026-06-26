import { useCallback, useRef, useState } from "react";

/**
 * A value that may be either controlled (a `value` prop is supplied) or
 * uncontrolled (managed internally from `defaultValue`). Mirrors the pattern
 * used by Radix/React Aria so the component works in both modes.
 */
export function useControllableState<T>(
  controlled: T | undefined,
  defaultValue: T,
  onChange?: (value: T) => void,
): [T, (next: T) => void] {
  const isControlled = controlled !== undefined;
  const [internal, setInternal] = useState<T>(defaultValue);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const value = isControlled ? (controlled as T) : internal;

  const setValue = useCallback(
    (next: T) => {
      if (!isControlled) setInternal(next);
      onChangeRef.current?.(next);
    },
    [isControlled],
  );

  return [value, setValue];
}
