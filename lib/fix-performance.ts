// This is a patch for a known issue in Next.js/Node environment where performance.measure throws
// "Given attribute end cannot be negative".
// This usually happens due to clock synchronization issues or specific instrumentation bugs.

if (typeof globalThis.performance !== "undefined") {
  const originalMeasure = globalThis.performance.measure.bind(
    globalThis.performance
  );

  const patchedMeasure: typeof globalThis.performance.measure = (
    ...args: Parameters<typeof globalThis.performance.measure>
  ) => {
    const [name, , end] = args;

    if (typeof end === "number" && end < 0) {
      // Fallback to a minimal measure with the provided name to satisfy the return type
      return originalMeasure(name);
    }

    try {
      return originalMeasure(...args);
    } catch (error: unknown) {
      if (
        error instanceof Error &&
        error.message === "Given attribute end cannot be negative"
      ) {
        return originalMeasure(name);
      }
      throw error;
    }
  };

  globalThis.performance.measure = patchedMeasure;
}
