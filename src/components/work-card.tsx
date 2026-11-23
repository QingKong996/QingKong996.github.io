"use client";

import type { MouseEvent } from "react";
import Link from "next/link";
import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import { ArrowUpRight, ExternalLink } from "lucide-react";
import type { WorkAccent, WorkMeta } from "@/lib/content";

const ACCENT_DOT: Record<WorkAccent, string> = {
  emerald: "bg-emerald-500 dark:bg-emerald-400",
  sky: "bg-sky-500 dark:bg-sky-400",
  violet: "bg-violet-500 dark:bg-violet-400",
  amber: "bg-amber-500 dark:bg-amber-400",
  rose: "bg-rose-500 dark:bg-rose-400",
  slate: "bg-zinc-500 dark:bg-zinc-400",
};

function WorkBlueprintMotif({ accent }: { accent: WorkAccent }) {
  if (accent === "sky") {
    return (
      <svg
        viewBox="0 0 220 88"
        fill="none"
        aria-hidden="true"
        className="pointer-events-none absolute right-3 top-2 h-22 w-52 text-zinc-300 transition-colors duration-300 group-hover:text-emerald-500/45 dark:text-zinc-800 dark:group-hover:text-emerald-400/35"
      >
        <path d="M16 62 H82 L106 38 H164 L182 22 H212" stroke="currentColor" strokeWidth="1.25" />
        <circle cx="106" cy="38" r="2.5" fill="currentColor" />
        <circle cx="182" cy="22" r="2.5" fill="currentColor" />
        <path d="M16 46 H212" stroke="currentColor" strokeWidth="0.7" strokeDasharray="3 4" />
      </svg>
    );
  }

  if (accent === "violet") {
    return (
      <svg
        viewBox="0 0 220 88"
        fill="none"
        aria-hidden="true"
        className="pointer-events-none absolute right-3 top-2 h-22 w-52 text-zinc-300 transition-colors duration-300 group-hover:text-emerald-500/45 dark:text-zinc-800 dark:group-hover:text-emerald-400/35"
      >
        <path
          d="M16 50 C 52 18, 82 76, 118 44 C 154 12, 180 68, 212 38"
          stroke="currentColor"
          strokeWidth="1.25"
        />
        <path d="M16 68 H212" stroke="currentColor" strokeWidth="0.7" strokeDasharray="2 5" />
      </svg>
    );
  }

  if (accent === "amber") {
    return (
      <svg
        viewBox="0 0 220 88"
        fill="none"
        aria-hidden="true"
        className="pointer-events-none absolute right-3 top-2 h-22 w-52 text-zinc-300 transition-colors duration-300 group-hover:text-emerald-500/45 dark:text-zinc-800 dark:group-hover:text-emerald-400/35"
      >
        <path
          d="M120 22 L134 36 L120 50"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path d="M144 50 H188" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M120 66 H204" stroke="currentColor" strokeWidth="0.7" strokeDasharray="3 4" />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 220 88"
      fill="none"
      aria-hidden="true"
      className="pointer-events-none absolute right-3 top-2 h-22 w-52 text-zinc-300 transition-colors duration-300 group-hover:text-emerald-500/45 dark:text-zinc-800 dark:group-hover:text-emerald-400/35"
    >
      <circle cx="172" cy="42" r="28" stroke="currentColor" strokeWidth="1" strokeDasharray="4 4" />
      <path d="M120 42 H214 M172 8 V76" stroke="currentColor" strokeWidth="0.8" />
      <circle cx="172" cy="42" r="2.5" fill="currentColor" />
    </svg>
  );
}

export function WorkCard({ work, index = 0 }: { work: WorkMeta; index?: number }) {
  const dotColor = ACCENT_DOT[work.accent] ?? ACCENT_DOT.emerald;

  const normX = useMotionValue(0);
  const normY = useMotionValue(0);

  const rotateX = useSpring(useTransform(normY, [-0.5, 0.5], [2.5, -2.5]), {
    stiffness: 260,
    damping: 26,
  });
  const rotateY = useSpring(useTransform(normX, [-0.5, 0.5], [-2.5, 2.5]), {
    stiffness: 260,
    damping: 26,
  });

  const handleMouseMove = (event: MouseEvent<HTMLElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    normX.set((event.clientX - rect.left) / rect.width - 0.5);
    normY.set((event.clientY - rect.top) / rect.height - 0.5);
  };

  const handleMouseLeave = () => {
    normX.set(0);
    normY.set(0);
  };

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.36, delay: Math.min(index * 0.05, 0.2), ease: [0.22, 1, 0.36, 1] }}
      style={{
        rotateX,
        rotateY,
        transformPerspective: 960,
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white transition-colors duration-200 hover:border-zinc-400 dark:border-zinc-800 dark:bg-[#111113] dark:hover:border-zinc-600"
    >
      {/* Solid flat top band with vector schematic */}
      <div className="relative h-22 bg-zinc-50/80 px-5 pt-4 dark:bg-zinc-900/50">
        <WorkBlueprintMotif accent={work.accent} />

        <div className="relative flex items-center justify-between text-xs">
          <span className="inline-flex items-center gap-2 font-medium text-zinc-700 dark:text-zinc-200">
            <span className={`h-1.5 w-1.5 rounded-full ${dotColor}`} />
            {work.status}
          </span>
          <span className="font-mono tabular-nums text-zinc-500 dark:text-zinc-400">
            {work.year}
          </span>
        </div>

        <p className="relative mt-5 font-mono text-[11px] uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
          {work.category}
        </p>
      </div>

      {/* Main flat content area */}
      <div className="relative flex flex-1 flex-col px-5 pb-5 pt-4">
        <h3 className="text-base font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
          <Link
            href={`/works/${work.slug}`}
            className="inline-flex items-center gap-1.5 transition-colors group-hover:text-emerald-600 focus:outline-none dark:group-hover:text-emerald-400"
          >
            <span>{work.title}</span>
            <ArrowUpRight className="h-4 w-4 shrink-0 text-zinc-400 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-emerald-600 dark:group-hover:text-emerald-400" />
          </Link>
        </h3>

        <p className="mt-2.5 line-clamp-3 flex-1 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
          {work.summary}
        </p>

        {work.techStack.length > 0 ? (
          <p className="mt-4 truncate font-mono text-[11px] text-zinc-500 dark:text-zinc-400">
            {work.techStack.slice(0, 4).join(" · ")}
          </p>
        ) : null}

        <div className="mt-4 flex items-center justify-between border-t border-zinc-100 pt-3.5 text-xs dark:border-zinc-800/80">
          <Link
            href={`/works/${work.slug}`}
            className="font-medium text-zinc-900 transition-colors hover:text-emerald-600 dark:text-zinc-100 dark:hover:text-emerald-400"
          >
            查看详情
          </Link>

          <div className="flex items-center gap-3.5 text-zinc-500 dark:text-zinc-400">
            {work.repoUrl ? (
              <a
                href={work.repoUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="源码"
                title="源码"
                className="inline-flex items-center transition-colors hover:text-zinc-950 dark:hover:text-zinc-100"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden="true"
                  className="h-3.5 w-3.5"
                >
                  <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.56 0-.28-.01-1.02-.02-2-3.2.69-3.87-1.54-3.87-1.54-.52-1.33-1.28-1.69-1.28-1.69-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.76 2.7 1.25 3.36.96.1-.75.4-1.25.73-1.54-2.55-.29-5.24-1.28-5.24-5.68 0-1.25.45-2.28 1.18-3.08-.12-.29-.51-1.46.11-3.04 0 0 .97-.31 3.16 1.18a10.9 10.9 0 0 1 5.76 0c2.19-1.49 3.16-1.18 3.16-1.18.62 1.58.23 2.75.11 3.04.74.8 1.18 1.83 1.18 3.08 0 4.41-2.69 5.39-5.26 5.67.42.36.79 1.07.79 2.15 0 1.55-.01 2.8-.01 3.18 0 .31.21.67.8.56A11.51 11.51 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5Z" />
                </svg>
              </a>
            ) : null}
            {work.demoUrl ? (
              <a
                href={work.demoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 transition-colors hover:text-zinc-950 dark:hover:text-zinc-100"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                <span>预览</span>
              </a>
            ) : null}
          </div>
        </div>
      </div>
    </motion.article>
  );
}
