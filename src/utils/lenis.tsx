"use client";

import { useEffect, useState } from "react";
import Lenis from "lenis";

/**
 * Custom hook to initialize and manage Lenis smooth scrolling.
 * @returns {Lenis | null} The Lenis instance.
 */
export function useLenis() {
  const [lenis, setLenis] = useState<Lenis | null>(null);

  useEffect(() => {
    // Initialize Lenis with custom settings
    const lenisInstance = new Lenis({
      duration: 0.6,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical", // Scroll orientation
      gestureOrientation: "vertical", // Gesture orientation
      smoothWheel: true, // Enable smooth scrolling for wheel events
      touchMultiplier: 2, // Multiplier for touch scroll speed
    });

    // Request animation frame loop to update Lenis
    function raf(time: number) {
      lenisInstance.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);
    setLenis(lenisInstance);

    // Cleanup function to destroy Lenis instance on unmount
    return () => {
      lenisInstance.destroy();
    };
  }, []);

  return lenis;
}