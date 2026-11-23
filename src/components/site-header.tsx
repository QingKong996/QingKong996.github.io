"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useScroll, useSpring } from "motion/react";
import { Search, Menu, X } from "lucide-react";
import { ThemeToggle } from "./theme-toggle";
import { SearchModal } from "./search-modal";
import { siteConfig } from "@/lib/site-config";
import type { SearchDocument } from "@/lib/content";

const NAV_ITEMS = [
  { href: "/", label: "首页" },
  { href: "/posts", label: "文章" },
  { href: "/works", label: "作品" },
] as const;

export function SiteHeader({ searchDocuments }: { searchDocuments: SearchDocument[] }) {
  const pathname = usePathname();
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 260,
    damping: 32,
    restDelta: 0.001,
  });

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-zinc-200/80 bg-[#fafafa]/85 backdrop-blur-xl dark:border-zinc-800/80 dark:bg-[#09090b]/85">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between gap-4 px-4 sm:px-6">
          <div className="flex items-center gap-8">
            <Link
              href="/"
              className="group inline-flex items-center gap-2.5 text-sm font-semibold tracking-tight text-zinc-950 dark:text-zinc-50"
            >
              {/* QingKong brand mark adapted from qingkong-mark-49-graphite.svg */}
              <motion.svg
                width="24"
                height="24"
                viewBox="55 55 250 250"
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 380, damping: 22 }}
                aria-hidden="true"
                className="shrink-0"
              >
                <path
                  fillRule="evenodd"
                  d="M123 55H231A70 70 0 0 1 299 123V231A70 70 0 0 1 231 299H123A70 70 0 0 1 55 231V123A70 70 0 0 1 123 55ZM239 177A62 62 0 1 1 115 177A62 62 0 1 1 239 177Z"
                  className="fill-zinc-950 transition-colors duration-200 dark:fill-zinc-50"
                />
                <rect
                  x="228"
                  y="228"
                  width="77"
                  height="77"
                  rx="6"
                  className="fill-emerald-600 transition-colors duration-200 dark:fill-emerald-400"
                />
              </motion.svg>
              <span className="font-mono text-sm tracking-tight">{siteConfig.name}</span>
            </Link>

            <nav aria-label="主导航" className="hidden items-center gap-1 md:flex">
              {NAV_ITEMS.map((item) => {
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`relative px-3.5 py-2 text-sm font-medium transition-colors ${
                      active
                        ? "text-zinc-950 dark:text-zinc-50"
                        : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
                    }`}
                  >
                    {item.label}
                    {active ? (
                      <motion.span
                        layoutId="nav-active-underline"
                        transition={{ type: "spring", stiffness: 420, damping: 34 }}
                        className="absolute inset-x-3.5 -bottom-[15px] h-[2px] bg-emerald-600 dark:bg-emerald-400"
                      />
                    ) : null}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="flex items-center gap-1.5">
            <motion.button
              type="button"
              onClick={() => setSearchOpen(true)}
              whileTap={{ scale: 0.97 }}
              aria-label="检索文章和作品"
              className="inline-flex h-9 items-center gap-2.5 rounded-full px-3.5 text-sm text-zinc-500 transition-colors hover:bg-zinc-200/60 hover:text-zinc-950 dark:text-zinc-400 dark:hover:bg-zinc-800/70 dark:hover:text-zinc-100"
            >
              <Search className="h-4 w-4" />
              <span className="hidden sm:inline">检索</span>
              <span className="hidden font-mono text-[11px] text-zinc-400 sm:inline dark:text-zinc-500">
                ⌘K
              </span>
            </motion.button>

            <ThemeToggle />

            <button
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              aria-label="切换移动端菜单"
              className="inline-flex h-9 w-9 items-center justify-center rounded-full text-zinc-700 transition-colors hover:bg-zinc-200/60 md:hidden dark:text-zinc-300 dark:hover:bg-zinc-800/70"
            >
              {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Solid emerald scroll progress hairline */}
        <motion.div
          style={{ scaleX }}
          className="h-[1.5px] origin-left bg-emerald-600/85 dark:bg-emerald-400/85"
        />

        <AnimatePresence>
          {mobileMenuOpen ? (
            <motion.nav
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              aria-label="移动端导航"
              className="overflow-hidden border-t border-zinc-200/80 bg-[#fafafa] px-4 md:hidden dark:border-zinc-800 dark:bg-[#09090b]"
            >
              <div className="flex flex-col gap-1 py-3">
                {NAV_ITEMS.map((item) => {
                  const active = isActive(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition ${
                        active
                          ? "bg-zinc-200/60 text-zinc-950 dark:bg-zinc-800/80 dark:text-zinc-50"
                          : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-900"
                      }`}
                    >
                      <span>{item.label}</span>
                      {active ? (
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 dark:bg-emerald-400" />
                      ) : null}
                    </Link>
                  );
                })}
              </div>
            </motion.nav>
          ) : null}
        </AnimatePresence>
      </header>

      <SearchModal
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        documents={searchDocuments}
      />
    </>
  );
}
