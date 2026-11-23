"use client";

import { useState } from "react";
import { motion } from "motion/react";
import type { TechIconId, TechStackGroup } from "@/lib/site-config";

function TechIcon({ id }: { id: TechIconId }) {
  switch (id) {
    case "js-ts":
      return (
        <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
          <rect
            x="2.5"
            y="2.5"
            width="19"
            height="19"
            rx="4"
            stroke="currentColor"
            strokeWidth="1.5"
          />
          <path
            d="M7 9.5H11.5M9.25 9.5V15.5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <path
            d="M16.75 10.2C16.3 9.7 15.65 9.45 14.95 9.45C13.95 9.45 13.3 10.02 13.3 10.82C13.3 11.68 14.02 12.04 15.1 12.35C16.22 12.67 16.95 13.06 16.95 14.05C16.95 14.96 16.2 15.55 15.05 15.55C14.18 15.55 13.45 15.22 13 14.65"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      );
    case "golang":
      return (
        <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
          <path
            d="M2.5 9.5H6.5M1.5 12H5.5M3 14.5H6"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
          />
          <path
            d="M12.5 8.5C10.3 8.5 8.6 10 8.6 12C8.6 14 10.3 15.5 12.5 15.5C13.9 15.5 14.9 14.8 15.3 13.7H12.7"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle
            cx="19.3"
            cy="12"
            r="3.2"
            stroke="currentColor"
            strokeWidth="1.6"
          />
        </svg>
      );
    case "cpp":
      return (
        <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
          <path
            d="M12 2.5L20 7.1V16.9L12 21.5L4 16.9V7.1L12 2.5Z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          <path
            d="M10.7 9.6C10.1 9.1 9.3 8.8 8.4 8.8C6.6 8.8 5.4 10.2 5.4 12C5.4 13.8 6.6 15.2 8.4 15.2C9.3 15.2 10.1 14.9 10.7 14.4"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <path
            d="M13.2 10.6V13.4M11.8 12H14.6M17 10.6V13.4M15.6 12H18.4"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
          />
        </svg>
      );
    case "python":
      return (
        <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
          <path
            d="M11.9 3C8.5 3 8.8 4.5 8.8 4.5V6.6H12.1V7.4H7.2C7.2 7.4 4.5 7.1 4.5 10.7C4.5 14.3 6.8 14.1 6.8 14.1H8.2V12.2C8.2 12.2 8.1 9.9 10.5 9.9H14.1C14.1 9.9 16.1 9.9 16.1 7.9V4.9C16.1 4.9 16.4 3 11.9 3Z"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinejoin="round"
          />
          <path
            d="M12.1 21C15.5 21 15.2 19.5 15.2 19.5V17.4H11.9V16.6H16.8C16.8 16.6 19.5 16.9 19.5 13.3C19.5 9.7 17.2 9.9 17.2 9.9H15.8V11.8C15.8 11.8 15.9 14.1 13.5 14.1H9.9C9.9 14.1 7.9 14.1 7.9 16.1V19.1C7.9 19.1 7.6 21 12.1 21Z"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinejoin="round"
          />
          <circle cx="10.4" cy="5.1" r="0.8" fill="currentColor" />
          <circle cx="13.6" cy="18.9" r="0.8" fill="currentColor" />
        </svg>
      );
    case "react":
      return (
        <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
          <circle cx="12" cy="12" r="1.8" fill="currentColor" />
          <ellipse cx="12" cy="12" rx="9.5" ry="3.8" stroke="currentColor" strokeWidth="1.35" />
          <ellipse
            cx="12"
            cy="12"
            rx="9.5"
            ry="3.8"
            transform="rotate(60 12 12)"
            stroke="currentColor"
            strokeWidth="1.35"
          />
          <ellipse
            cx="12"
            cy="12"
            rx="9.5"
            ry="3.8"
            transform="rotate(120 12 12)"
            stroke="currentColor"
            strokeWidth="1.35"
          />
        </svg>
      );
    case "gin":
      return (
        <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
          <path
            d="M4.5 5H19.5L12 13.2L4.5 5Z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          <path
            d="M12 13.2V20M8.5 20H15.5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <path
            d="M13.5 9.5L17.5 3.5"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
          />
        </svg>
      );
    case "electron":
      return (
        <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
          <circle cx="12" cy="12" r="1.8" fill="currentColor" />
          <ellipse
            cx="12"
            cy="12"
            rx="9.5"
            ry="4"
            transform="rotate(-35 12 12)"
            stroke="currentColor"
            strokeWidth="1.35"
          />
          <ellipse
            cx="12"
            cy="12"
            rx="9.5"
            ry="4"
            transform="rotate(35 12 12)"
            stroke="currentColor"
            strokeWidth="1.35"
          />
          <circle cx="6.2" cy="7.2" r="1.2" fill="currentColor" />
          <circle cx="17.8" cy="16.8" r="1.2" fill="currentColor" />
        </svg>
      );
  }
}

export function TechStackSection({
  groups,
}: {
  groups: readonly TechStackGroup[];
}) {
  const [hoveredName, setHoveredName] = useState<string | null>(null);

  return (
    <section className="mx-auto max-w-5xl px-4 pt-16 sm:px-6">
      <div className="flex items-end justify-between gap-4 border-b border-zinc-200 pb-4 dark:border-zinc-800">
        <div>
          <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-600 dark:text-emerald-400">
            Tech Stack
          </p>
          <h2 className="mt-1 text-2xl font-bold tracking-tight text-zinc-950 dark:text-zinc-50">
            常用技术栈
          </h2>
        </div>
        <span className="font-mono text-xs text-zinc-400 dark:text-zinc-500">
          Languages &amp; Frameworks
        </span>
      </div>

      <div
        className="mt-8 grid grid-cols-1 gap-10 md:grid-cols-2 md:gap-14"
        onMouseLeave={() => setHoveredName(null)}
      >
        {groups.map((group, groupIdx) => (
          <motion.div
            key={group.id}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{
              duration: 0.4,
              delay: groupIdx * 0.08,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            <div className="mb-3 flex items-baseline justify-between border-b border-zinc-200/80 pb-2 dark:border-zinc-800/80">
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                {group.label}
              </h3>
              <span className="font-mono text-[11px] uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                {group.labelEn}
              </span>
            </div>

            <ul className="grid grid-cols-2 gap-2">
              {group.items.map((item) => {
                const isHovered = hoveredName === item.name;
                return (
                  <li
                    key={item.name}
                    onMouseEnter={() => setHoveredName(item.name)}
                    className="relative"
                  >
                    <div className="relative flex items-center gap-3 px-3 py-3">
                      {isHovered ? (
                        <motion.span
                          layoutId="tech-stack-hover"
                          transition={{ type: "spring", stiffness: 460, damping: 36 }}
                          className="absolute inset-0 -z-10 rounded-xl bg-zinc-100 dark:bg-zinc-900/90"
                        />
                      ) : null}

                      <span
                        className={`shrink-0 transition-all duration-200 ${
                          isHovered
                            ? "scale-110 text-emerald-600 dark:text-emerald-400"
                            : "text-zinc-500 dark:text-zinc-400"
                        }`}
                      >
                        <TechIcon id={item.icon} />
                      </span>

                      <span className="font-mono text-sm font-medium text-zinc-900 dark:text-zinc-100">
                        {item.name}
                      </span>
                    </div>
                  </li>
                );
              })}
            </ul>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
