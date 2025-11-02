/**
 * Color Warning Suppressor Component
 *
 * Suppresses html2canvas warnings about unsupported color functions (lab, lch, oklch)
 * that come from Tailwind CSS v4's modern color system.
 *
 * These warnings are harmless as browsers automatically convert these colors to RGB,
 * but they clutter the console during development and when using chart export functionality.
 */

"use client";

import { useEffect } from "react";

export function ColorWarningSupressor() {
  useEffect(() => {
    // Only run in browser
    if (typeof window === "undefined") return;

    // Store original console.warn
    const originalWarn = console.warn;

    // Override console.warn to filter out specific warnings
    console.warn = (...args: unknown[]) => {
      const message = args[0]?.toString() || "";

      // Suppress html2canvas color parsing warnings
      if (
        message.includes("Attempting to parse an unsupported color function") ||
        message.includes("lab") ||
        message.includes("lch") ||
        message.includes("oklch")
      ) {
        // Check if it's actually about color parsing
        if (message.includes("color")) {
          return; // Suppress this warning
        }
      }

      // Pass through all other warnings
      originalWarn.apply(console, args);
    };

    // Cleanup: restore original console.warn when component unmounts
    return () => {
      console.warn = originalWarn;
    };
  }, []);

  // This component doesn't render anything
  return null;
}
