"use client";

import { useRef, useEffect, useState } from "react";
import { motion, useAnimationControls } from "framer-motion";
import styles from "./infinitescroll.module.scss";

interface InfiniteScrollProps {
  text: string | string[];
  duration?: number;
  direction?: "left" | "right";
  pauseOnHover?: boolean;
  className?: string;
  itemClassName?: string;
}

export default function InfiniteScroll({
  text,
  duration = 20,
  direction = "left",
  pauseOnHover = true,
  className = "",
  itemClassName = "",
}: InfiniteScrollProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [contentWidth, setContentWidth] = useState(0);
  const controls = useAnimationControls();
  const [isPaused, setIsPaused] = useState(false);

  const textItems = Array.isArray(text) ? text : [text];

  useEffect(() => {
    if (!containerRef.current) return;

    const calculateWidths = () => {
      const container = containerRef.current;
      if (!container) return;

      const containerRect = container.getBoundingClientRect();
      setContainerWidth(containerRect.width);

      if (container.firstElementChild) {
        const contentRect = container.firstElementChild.getBoundingClientRect();
        setContentWidth(contentRect.width);
      }
    };

    calculateWidths();

    const resizeObserver = new ResizeObserver(calculateWidths);
    resizeObserver.observe(containerRef.current);

    return () => {
      if (containerRef.current) {
        resizeObserver.unobserve(containerRef.current);
      }
    };
  }, [text]);

  useEffect(() => {
    if (contentWidth === 0) return;

    const startAnimation = async () => {
      const distance = direction === "left" ? -contentWidth : contentWidth;

      await controls.start({
        x: distance,
        transition: {
          duration,
          ease: "linear",
          repeat: Infinity,
          repeatType: "loop",
        },
      });
    };

    if (!isPaused) {
      startAnimation();
    }
  }, [contentWidth, direction, duration, controls, isPaused]);

  useEffect(() => {
    if (!pauseOnHover) return;

    if (isPaused) {
      controls.stop();
    } else {
      controls.start({
        x: direction === "left" ? -contentWidth : contentWidth,
        transition: {
          duration,
          ease: "linear",
          repeat: Infinity,
          repeatType: "loop",
        },
      });
    }
  }, [isPaused, pauseOnHover, controls, contentWidth, direction, duration]);

  return (
    <div
      className={`${styles.scrollContainer} ${className}`}
      ref={containerRef}
      onMouseEnter={pauseOnHover ? () => setIsPaused(true) : undefined}
      onMouseLeave={pauseOnHover ? () => setIsPaused(false) : undefined}
    >
      <motion.div
        className={styles.scrollTrack}
        animate={controls}
        initial={{ x: 0 }}
      >
        <div className={styles.scrollContent}>
          {textItems.map((item, index) => (
            <span
              key={`item-${index}`}
              className={`${styles.scrollItem} ${itemClassName}`}
            >
              {item}
            </span>
          ))}
        </div>
        <div className={styles.scrollContent}>
          {textItems.map((item, index) => (
            <span
              key={`item-duplicate-${index}`}
              className={`${styles.scrollItem} ${itemClassName}`}
            >
              {item}
            </span>
          ))}
        </div>
      </motion.div>
    </div>
  );
}