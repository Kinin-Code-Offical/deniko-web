import { useEffect, useRef } from "react";

/**
 * A custom hook that handles timeouts safely in React components.
 * Automatically clears the timeout when the component unmounts or the delay changes.
 *
 * @param callback The function to execute after the delay
 * @param delay The delay in milliseconds (pass null to cancel/pause)
 */
export function useTimeout(callback: () => void, delay: number | null) {
  const savedCallback = useRef(callback);

  // Remember the latest callback.
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // Set up the timeout.
  useEffect(() => {
    if (delay === null) {
      return;
    }

    const id = setTimeout(() => {
      savedCallback.current();
    }, delay);

    return () => clearTimeout(id);
  }, [delay]);
}
