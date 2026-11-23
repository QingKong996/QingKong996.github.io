"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useScroll } from "motion/react";
import { ChevronDown, List } from "lucide-react";
import type { TocHeading } from "@/lib/mdx";

function useTocState(headings: TocHeading[]) {
  const [activeId, setActiveId] = useState<string>(headings[0]?.id ?? "");
  const [readPercent, setReadPercent] = useState(0);
  const { scrollYProgress } = useScroll();

  useEffect(() => {
    const unsubscribe = scrollYProgress.on("change", (latest) => {
      setReadPercent(Math.round(latest * 100));
    });
    return () => unsubscribe();
  }, [scrollYProgress]);

  useEffect(() => {
    if (headings.length === 0) return;

    const updateActiveHeading = () => {
      const scrollTop = window.scrollY;
      const offset = 128;

      if (
        window.innerHeight + scrollTop >=
        document.documentElement.scrollHeight - 24
      ) {
        setActiveId(headings[headings.length - 1].id);
        return;
      }

      let current = headings[0].id;
      for (const heading of headings) {
        const el = document.getElementById(heading.id);
        if (!el) continue;
        if (el.getBoundingClientRect().top <= offset) {
          current = heading.id;
        } else {
          break;
        }
      }
      setActiveId(current);
    };

    updateActiveHeading();
    window.addEventListener("scroll", updateActiveHeading, { passive: true });
    window.addEventListener("resize", updateActiveHeading, { passive: true });

    return () => {
      window.removeEventListener("scroll", updateActiveHeading);
      window.removeEventListener("resize", updateActiveHeading);
    };
  }, [headings]);

  const jumpTo = (id: string) => {
    const target = document.getElementById(id);
    if (!target) return;
    setActiveId(id);
    target.scrollIntoView({ behavior: "smooth", block: "start" });
    window.history.replaceState(null, "", `#${encodeURIComponent(id)}`);
  };

  return { activeId, readPercent, jumpTo };
}

export function SidebarToc({ headings }: { headings: TocHeading[] }) {
  const { activeId, readPercent, jumpTo } = useTocState(headings);

  if (headings.length === 0) return null;

  return (
    <div>
      <div className="mb-3 flex items-center justify-between font-mono text-[11px] uppercase tracking-[0.16em] text-zinc-500 dark:text-zinc-400">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 dark:bg-emerald-400" />
          <span>目录</span>
        </span>
        <span className="tabular-nums text-zinc-400 dark:text-zinc-500">
          {String(readPercent).padStart(2, "0")}%
        </span>
      </div>

      <nav aria-label="文章目录" className="relative border-l border-zinc-200 dark:border-zinc-800">
        <ul className="space-y-0.5">
          {headings.map((heading) => {
            const isActive = heading.id === activeId;
            const indent =
              heading.level === 2
                ? "pl-3.5"
                : heading.level === 3
                  ? "pl-6"
                  : "pl-8";

            return (
              <li key={heading.id} className="relative">
                {isActive ? (
                  <motion.span
                    layoutId="toc-active-indicator"
                    transition={{ type: "spring", stiffness: 420, damping: 34 }}
                    className="absolute -left-[1.5px] top-1 bottom-1 w-[2px] rounded-full bg-emerald-600 dark:bg-emerald-400"
                  />
                ) : null}
                <a
                  href={`#${heading.id}`}
                  onClick={(e) => {
                    e.preventDefault();
                    jumpTo(heading.id);
                  }}
                  className={`block py-1.5 text-[13px] leading-snug transition-colors ${indent} ${
                    isActive
                      ? "font-medium text-zinc-950 dark:text-zinc-50"
                      : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
                  }`}
                >
                  {heading.text}
                </a>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}

export function MobileToc({ headings }: { headings: TocHeading[] }) {
  const { activeId, jumpTo } = useTocState(headings);
  const [mobileOpen, setMobileOpen] = useState(false);

  if (headings.length === 0) return null;

  const activeHeading =
    headings.find((h) => h.id === activeId) ?? headings[0];

  return (
    <div
      data-pagefind-ignore
      className="border-y border-zinc-200 py-3 lg:hidden dark:border-zinc-800"
    >
      <button
        type="button"
        onClick={() => setMobileOpen((prev) => !prev)}
        aria-expanded={mobileOpen}
        className="flex w-full items-center justify-between gap-3 text-left text-xs"
      >
        <span className="inline-flex items-center gap-2 font-mono uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
          <List className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
          <span>目录</span>
        </span>
        <span className="truncate font-medium text-zinc-800 dark:text-zinc-200">
          {activeHeading?.text}
        </span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-zinc-400 transition-transform duration-200 ${
            mobileOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      <AnimatePresence initial={false}>
        {mobileOpen ? (
          <motion.nav
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            aria-label="文章目录"
            className="overflow-hidden"
          >
            <ul className="mt-3 space-y-1 border-l border-zinc-200 pl-3 dark:border-zinc-800">
              {headings.map((heading) => {
                const isActive = heading.id === activeId;
                const indent =
                  heading.level === 2
                    ? "pl-1"
                    : heading.level === 3
                      ? "pl-4"
                      : "pl-7";
                return (
                  <li key={heading.id}>
                    <a
                      href={`#${heading.id}`}
                      onClick={(e) => {
                        e.preventDefault();
                        setMobileOpen(false);
                        jumpTo(heading.id);
                      }}
                      className={`block py-1 text-xs leading-relaxed transition-colors ${indent} ${
                        isActive
                          ? "font-medium text-emerald-600 dark:text-emerald-400"
                          : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
                      }`}
                    >
                      {heading.text}
                    </a>
                  </li>
                );
              })}
            </ul>
          </motion.nav>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
