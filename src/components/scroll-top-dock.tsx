"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useScroll, useSpring } from "motion/react";
import { ArrowUp } from "lucide-react";

function ScrollTopButton() {
  const { scrollYProgress } = useScroll();
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 240,
    damping: 30,
  });

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <motion.button
      type="button"
      onClick={scrollToTop}
      initial={{ opacity: 0, y: 14, scale: 0.88 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 14, scale: 0.88 }}
      whileHover={{ scale: 1.06 }}
      whileTap={{ scale: 0.94 }}
      transition={{ type: "spring", stiffness: 380, damping: 28 }}
      aria-label="返回顶部"
      title="返回顶部"
      className="fixed bottom-6 right-6 z-30 flex h-11 w-11 items-center justify-center rounded-full bg-zinc-950/90 text-white shadow-md backdrop-blur-md dark:bg-zinc-100/90 dark:text-zinc-950"
    >
      <svg
        viewBox="0 0 44 44"
        className="pointer-events-none absolute inset-0 h-full w-full -rotate-90"
        aria-hidden="true"
      >
        <circle
          cx="22"
          cy="22"
          r="19"
          fill="none"
          stroke="currentColor"
          strokeOpacity="0.16"
          strokeWidth="2"
        />
        <motion.circle
          cx="22"
          cy="22"
          r="19"
          fill="none"
          stroke="#10b981"
          strokeWidth="2"
          strokeLinecap="round"
          style={{ pathLength: smoothProgress }}
        />
      </svg>
      <ArrowUp className="relative h-4 w-4" />
    </motion.button>
  );
}

export function ScrollTopDock() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let wasVisible = false;

    const updateVisibility = () => {
      const nextVisible = window.scrollY > 280;
      if (nextVisible === wasVisible) return;
      wasVisible = nextVisible;
      setVisible(nextVisible);
    };

    updateVisibility();
    window.addEventListener("scroll", updateVisibility, { passive: true });
    return () => window.removeEventListener("scroll", updateVisibility);
  }, []);

  return (
    <AnimatePresence>{visible ? <ScrollTopButton /> : null}</AnimatePresence>
  );
}
