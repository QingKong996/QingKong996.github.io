"use client";

import { useState, type RefObject } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import {
  ArrowUpRight,
  BookOpen,
  Check,
  Code2,
  Copy,
  Globe,
  Mail,
  Rss,
} from "lucide-react";
import type { LinktreeIconName, LinktreeItem } from "@/lib/site-config";

function LinkIcon({ icon }: { icon: LinktreeIconName }) {
  switch (icon) {
    case "github":
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" className="h-[17px] w-[17px]" aria-hidden="true">
          <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.56 0-.28-.01-1.02-.02-2-3.2.69-3.87-1.54-3.87-1.54-.52-1.33-1.28-1.69-1.28-1.69-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.76 2.7 1.25 3.36.96.1-.75.4-1.25.73-1.54-2.55-.29-5.24-1.28-5.24-5.68 0-1.25.45-2.28 1.18-3.08-.12-.29-.51-1.46.11-3.04 0 0 .97-.31 3.16 1.18a10.9 10.9 0 0 1 5.76 0c2.19-1.49 3.16-1.18 3.16-1.18.62 1.58.23 2.75.11 3.04.74.8 1.18 1.83 1.18 3.08 0 4.41-2.69 5.39-5.26 5.67.42.36.79 1.07.79 2.15 0 1.55-.01 2.8-.01 3.18 0 .31.21.67.8.56A11.51 11.51 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5Z" />
        </svg>
      );
    case "globe":
      return <Globe className="h-[17px] w-[17px]" />;
    case "twitter":
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" className="h-[17px] w-[17px]" aria-hidden="true">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231 5.45-6.231Zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77Z" />
        </svg>
      );
    case "mail":
      return <Mail className="h-[17px] w-[17px]" />;
    case "qq":
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" className="h-[17px] w-[17px]" aria-hidden="true">
          <path d="M21.395 15.035a39.548 39.548 0 0 0-.803-2.264l-1.079-2.695c.001-.032.014-.562.014-.836C19.526 4.632 17.351 0 12 0S4.474 4.632 4.474 9.241c0 .274.013.804.014.836l-1.08 2.695a38.97 38.97 0 0 0-.802 2.264c-1.021 3.283-.69 4.643-.438 4.673.54.065 2.103-2.472 2.103-2.472 0 1.469.756 3.387 2.394 4.771-.612.188-1.363.479-1.845.835-.434.32-.379.646-.301.778.343.578 5.883.369 7.482.189 1.6.18 7.14.389 7.483-.189.078-.132.132-.458-.301-.778-.483-.356-1.233-.646-1.846-.836 1.637-1.384 2.393-3.302 2.393-4.771 0 0 1.563 2.537 2.103 2.472.251-.03.581-1.39-.438-4.673z" />
        </svg>
      );
    case "book":
      return <BookOpen className="h-[17px] w-[17px]" />;
    case "code":
      return <Code2 className="h-[17px] w-[17px]" />;
    case "rss":
      return <Rss className="h-[17px] w-[17px]" />;
  }
}

interface LinktreeCardProps {
  items: readonly LinktreeItem[];
  listRef?: RefObject<HTMLUListElement | null>;
}

export function LinktreeCard({ items, listRef }: LinktreeCardProps) {
  const [hoveredTitle, setHoveredTitle] = useState<string | null>(null);
  const [copiedTitle, setCopiedTitle] = useState<string | null>(null);

  const handleCopy = async (title: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedTitle(title);
      setTimeout(() => {
        setCopiedTitle((prev) => (prev === title ? null : prev));
      }, 1800);
    } catch {
      // Ignore clipboard permission errors
    }
  };

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.45, delay: 0.14, ease: [0.22, 1, 0.36, 1] }}
      aria-label="个人链接导航"
      className="w-full"
    >
      <div className="flex h-12 items-end justify-between pb-2">
        <div>
          <span className="block font-mono text-[11px] leading-none font-semibold uppercase tracking-[0.18em] text-emerald-600 dark:text-emerald-400">
            Linktree
          </span>
          <h2 className="mt-1 text-[15px] leading-5 font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
            社交主页与联系方式
          </h2>
        </div>
        <span className="font-mono text-xs leading-none tabular-nums text-zinc-400 dark:text-zinc-500">
          {String(items.length).padStart(2, "0")}
        </span>
      </div>

      {/* Exact 48px (h-12) rows aligned 1:1 with the 48px background grid */}
      <ul
        ref={listRef}
        onMouseLeave={() => setHoveredTitle(null)}
      >
        {items.map((item, idx) => {
          const href = item.href ?? "";
          const isInternal = href.startsWith("/");
          const isHovered = hoveredTitle === item.title;
          const isCopied = copiedTitle === item.title;

          const inner = (
            <motion.div
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{
                duration: 0.35,
                delay: 0.18 + idx * 0.04,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="relative flex h-full w-full items-center gap-3.5 px-3"
            >
              {isHovered ? (
                <>
                  <motion.span
                    layoutId="linktree-hover-surface"
                    transition={{ type: "spring", stiffness: 460, damping: 36 }}
                    className="absolute inset-x-0 inset-y-0.5 -z-10 rounded-lg bg-zinc-950/[0.045] dark:bg-white/[0.06]"
                  />
                  <motion.span
                    layoutId="linktree-active-bar"
                    transition={{ type: "spring", stiffness: 460, damping: 36 }}
                    className="absolute left-0 top-2 bottom-2 w-[2px] rounded-full bg-emerald-600 dark:bg-emerald-400"
                  />
                </>
              ) : null}

              <span
                className={`shrink-0 transition-transform duration-200 ${
                  isHovered
                    ? "scale-105 text-emerald-600 dark:text-emerald-400"
                    : "text-zinc-500 dark:text-zinc-400"
                }`}
              >
                <LinkIcon icon={item.icon} />
              </span>

              <span className="min-w-0 flex-1">
                <span className="block truncate text-[13px] leading-[17px] font-medium text-zinc-900 dark:text-zinc-100">
                  {item.title}
                </span>
                <span className="block truncate font-mono text-[11px] leading-[15px] text-zinc-500 dark:text-zinc-400">
                  {isCopied ? "已复制到剪贴板" : item.subtitle}
                </span>
              </span>

              {item.copyText ? (
                isCopied ? (
                  <Check className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                ) : (
                  <Copy
                    className={`h-3.5 w-3.5 shrink-0 transition-colors duration-200 ${
                      isHovered
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-zinc-400 dark:text-zinc-500"
                    }`}
                  />
                )
              ) : (
                <ArrowUpRight
                  className={`h-4 w-4 shrink-0 transition-all duration-200 ${
                    isHovered
                      ? "translate-x-0.5 -translate-y-0.5 text-emerald-600 dark:text-emerald-400"
                      : "text-zinc-400 dark:text-zinc-500"
                  }`}
                />
              )}
            </motion.div>
          );

          return (
            <li
              key={item.title}
              onMouseEnter={() => setHoveredTitle(item.title)}
              className="h-12"
            >
              {item.copyText ? (
                <button
                  type="button"
                  onClick={() => handleCopy(item.title, item.copyText!)}
                  className="flex h-full w-full items-center text-left focus:outline-none"
                >
                  {inner}
                </button>
              ) : isInternal ? (
                <Link href={href} className="flex h-full w-full items-center focus:outline-none">
                  {inner}
                </Link>
              ) : (
                <a
                  href={href}
                  target={item.external ? "_blank" : undefined}
                  rel={item.external ? "noopener noreferrer" : undefined}
                  className="flex h-full w-full items-center focus:outline-none"
                >
                  {inner}
                </a>
              )}
            </li>
          );
        })}
      </ul>
    </motion.section>
  );
}
