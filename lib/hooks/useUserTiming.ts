import { useEffect, useState } from "react";

/**
 * A custom hook to measure the performance of a component's mount time using the User Timing API.
 *
 * @param componentName - The unique name of the component or action to measure.
 */
export const useUserTiming = (componentName: string) => {
  // Use useState lazy initialization to mark the start time immediately when the hook runs (render phase)
  useState(() => {
    if (typeof window !== "undefined") {
      performance.mark(`${componentName}-start`);
    }
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      // Mark the end time in useEffect (commit phase)
      performance.mark(`${componentName}-end`);

      try {
        // Measure the duration between start and end marks
        performance.measure(
          componentName,
          `${componentName}-start`,
          `${componentName}-end`
        );

        // Retrieve the measurement to log it
        const entries = performance.getEntriesByName(componentName);
        const entry = entries[entries.length - 1];

        if (entry) {
          console.log(// ignore-console-check
            `%c⚡ [Performance] ${componentName} mounted in ${entry.duration.toFixed(2)}ms`,
            "color: #bada55; font-weight: bold;"
          );

          // ---------------------------------------------------------
          // Google Analytics (GA4) Integration Example:
          // ---------------------------------------------------------
          // if (window.gtag) {
          //   window.gtag('event', 'timing_complete', {
          //     name: componentName,
          //     value: Math.round(entry.duration),
          //     event_category: 'Performance',
          //   });
          // }
          // ---------------------------------------------------------
        }
      } catch (error) {
        console.warn(// ignore-console-check
          `[User Timing] Failed to measure ${componentName}:`,
          error
        );
      }
    }
  }, [componentName]);
};
