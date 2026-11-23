"use client";

import { useRef, type MouseEvent } from "react";
import Link from "next/link";
import { motion, useMotionValue, useSpring } from "motion/react";
import { ArrowRight, MapPin } from "lucide-react";
import { siteConfig } from "@/lib/site-config";
import { LinktreeCard } from "./linktree-card";
import { HeroSignalCanvas } from "./hero-signal-canvas";

interface HomeHeroProps {
  postCount: number;
  workCount: number;
}

const IDLE_TELEMETRY = "SIGNAL_FIELD // ACTIVE";

export function HomeHero({ postCount, workCount }: HomeHeroProps) {
  const pointerRef = useRef({ x: 0, y: 0, active: false });
  const linktreeBoxRef = useRef<HTMLDivElement>(null);
  const linktreeListRef = useRef<HTMLUListElement>(null);
  const telemetryRef = useRef<HTMLDivElement>(null);

  // Tactile magnetic pull for primary CTA
  const ctaX = useMotionValue(0);
  const ctaY = useMotionValue(0);
  const magneticX = useSpring(ctaX, { stiffness: 260, damping: 22 });
  const magneticY = useSpring(ctaY, { stiffness: 260, damping: 22 });

  const handleHeroMouseMove = (event: MouseEvent<HTMLElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = Math.round(event.clientX - rect.left);
    const y = Math.round(event.clientY - rect.top);
    pointerRef.current = { x, y, active: true };
    if (telemetryRef.current) {
      telemetryRef.current.textContent = `X:${String(x).padStart(4, "0")} · Y:${String(y).padStart(4, "0")}`;
    }
  };

  const handleHeroMouseLeave = () => {
    pointerRef.current.active = false;
    if (telemetryRef.current) {
      telemetryRef.current.textContent = IDLE_TELEMETRY;
    }
  };

  const handleCtaMove = (event: MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const dx = event.clientX - (rect.left + rect.width / 2);
    const dy = event.clientY - (rect.top + rect.height / 2);
    ctaX.set(dx * 0.16);
    ctaY.set(dy * 0.16);
  };

  const handleCtaLeave = () => {
    ctaX.set(0);
    ctaY.set(0);
  };

  return (
    <section
      onMouseMove={handleHeroMouseMove}
      onMouseLeave={handleHeroMouseLeave}
      className="relative overflow-hidden border-b border-zinc-200 dark:border-zinc-800/90"
    >
      {/* Dynamic architectural crosshair & orthogonal routing signal background */}
      <HeroSignalCanvas
        pointerRef={pointerRef}
        alignRef={linktreeListRef}
        excludeRef={linktreeBoxRef}
      />

      {/* Subtle live coordinate telemetry in bottom-right corner */}
      <div
        ref={telemetryRef}
        aria-hidden="true"
        className="pointer-events-none absolute bottom-3 right-5 hidden font-mono text-[11px] tabular-nums text-zinc-400/70 lg:block dark:text-zinc-600"
      >
        {IDLE_TELEMETRY}
      </div>

      <div className="relative mx-auto max-w-5xl px-4 py-16 sm:px-6 sm:py-22">
        <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-12 lg:items-center lg:gap-16">
          {/* Open editorial Bio column */}
          <div className="lg:col-span-7">
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="text-base font-medium text-zinc-500 dark:text-zinc-400"
            >
              你好，我是
            </motion.p>

            <motion.h1
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.5,
                delay: 0.05,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="mt-2 text-4xl font-bold tracking-tight text-zinc-950 sm:text-5xl sm:leading-[1.15] dark:text-zinc-50"
            >
              <span className="whitespace-nowrap">
                青空 ·{" "}
                <span className="text-emerald-600 dark:text-emerald-400">
                  {siteConfig.name}
                </span>
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.48,
                delay: 0.1,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="mt-4 text-lg font-medium text-zinc-700 dark:text-zinc-300"
            >
              {siteConfig.role}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.45,
                delay: 0.14,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="mt-3.5 inline-flex items-center gap-1.5 text-sm text-zinc-500 dark:text-zinc-400"
            >
              <MapPin className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <span>{siteConfig.location}</span>
            </motion.div>

            {/* Primary magnetic CTA & secondary link */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.45,
                delay: 0.18,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="mt-8 flex flex-wrap items-center gap-6"
            >
              <motion.div
                style={{ x: magneticX, y: magneticY }}
                onMouseMove={handleCtaMove}
                onMouseLeave={handleCtaLeave}
                className="inline-block"
              >
                <Link
                  href="/posts"
                  className="group inline-flex items-center gap-2.5 rounded-full bg-zinc-950 px-5 py-2.5 text-sm font-medium text-zinc-50 transition-colors hover:bg-emerald-600 dark:bg-zinc-100 dark:text-zinc-950 dark:hover:bg-emerald-400"
                >
                  <span>浏览文章</span>
                  <span className="font-mono text-xs opacity-70">
                    {postCount}
                  </span>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </motion.div>

              <Link
                href="/works"
                className="group inline-flex items-center gap-2 py-2 text-sm font-medium text-zinc-700 transition-colors hover:text-zinc-950 dark:text-zinc-300 dark:hover:text-zinc-50"
              >
                <span>探索独立作品</span>
                <span className="font-mono text-xs text-zinc-400">
                  {workCount}
                </span>
                <ArrowRight className="h-4 w-4 text-zinc-400 transition-transform group-hover:translate-x-1 group-hover:text-emerald-600 dark:group-hover:text-emerald-400" />
              </Link>
            </motion.div>

            {/* Architectural hairline summary strip for visual balance */}
            <motion.dl
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.45,
                delay: 0.24,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="mt-10 grid max-w-md grid-cols-3 divide-x divide-zinc-200 border-t border-zinc-200 pt-5 dark:divide-zinc-800 dark:border-zinc-800"
            >
              <div className="pr-4">
                <dt className="font-mono text-[10px] uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                  Articles
                </dt>
                <dd className="mt-1 font-mono text-lg font-semibold tabular-nums text-zinc-950 dark:text-zinc-50">
                  {String(postCount).padStart(2, "0")}
                </dd>
              </div>
              <div className="px-4">
                <dt className="font-mono text-[10px] uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                  Works
                </dt>
                <dd className="mt-1 font-mono text-lg font-semibold tabular-nums text-zinc-950 dark:text-zinc-50">
                  {String(workCount).padStart(2, "0")}
                </dd>
              </div>
              <div className="pl-4">
                <dt className="font-mono text-[10px] uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                  Focus
                </dt>
                <dd className="mt-1 font-mono text-sm font-medium text-emerald-600 dark:text-emerald-400">
                  AI · Build
                </dd>
              </div>
            </motion.dl>
          </div>

          {/* Open Linktree column */}
          <div ref={linktreeBoxRef} className="lg:col-span-5">
            <LinktreeCard
              items={siteConfig.linktree}
              listRef={linktreeListRef}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
