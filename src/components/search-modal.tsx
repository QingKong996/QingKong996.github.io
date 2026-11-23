"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { Search, FileText, Layers, X, CornerDownLeft } from "lucide-react";
import type { SearchDocument } from "@/lib/content";

type SearchScope = "all" | "post" | "work";

interface SearchResultItem {
  id: string;
  type: "post" | "work";
  title: string;
  description: string;
  url: string;
  tags: string[];
  dateOrYear: string;
}

interface PagefindSearchHit {
  id: string;
  data: () => Promise<{
    url: string;
    excerpt?: string;
    meta?: { title?: string; type?: string };
  }>;
}

interface PagefindModule {
  init?: () => Promise<void>;
  search: (query: string) => Promise<{ results: PagefindSearchHit[] }>;
}

interface SearchModalProps {
  open: boolean;
  onClose: () => void;
  documents: SearchDocument[];
}

function searchLocalDocuments(
  documents: SearchDocument[],
  query: string,
  scope: SearchScope
): SearchResultItem[] {
  const scoped =
    scope === "all" ? documents : documents.filter((doc) => doc.type === scope);

  const normalized = query.trim().toLowerCase();
  if (!normalized) {
    return scoped.slice(0, 8);
  }

  const terms = normalized.split(/\s+/).filter(Boolean);

  return scoped
    .map((doc) => {
      const title = doc.title.toLowerCase();
      const desc = doc.description.toLowerCase();
      const tags = doc.tags.join(" ").toLowerCase();
      const category = (doc.category ?? "").toLowerCase();
      const excerpt = doc.excerpt.toLowerCase();

      let score = 0;
      for (const term of terms) {
        if (title.includes(term)) score += 10;
        if (tags.includes(term)) score += 6;
        if (category.includes(term)) score += 5;
        if (desc.includes(term)) score += 4;
        if (excerpt.includes(term)) score += 2;
      }

      return { doc, score };
    })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 10)
    .map(({ doc }) => doc);
}

export function SearchModal({ open, onClose, documents }: SearchModalProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const pagefindRef = useRef<PagefindModule | null | "unavailable">(null);

  const [query, setQuery] = useState("");
  const [scope, setScope] = useState<SearchScope>("all");
  const [activeIndex, setActiveIndex] = useState(0);
  const [pagefindResults, setPagefindResults] = useState<SearchResultItem[] | null>(null);

  const localResults = useMemo(
    () => searchLocalDocuments(documents, query, scope),
    [documents, query, scope]
  );

  const results = useMemo(() => {
    if (query.trim() && pagefindResults && pagefindResults.length > 0) {
      return scope === "all"
        ? pagefindResults
        : pagefindResults.filter((item) => item.type === scope);
    }
    return localResults;
  }, [localResults, pagefindResults, query, scope]);

  useEffect(() => {
    if (!open) return;
    const timer = setTimeout(() => inputRef.current?.focus(), 20);
    return () => clearTimeout(timer);
  }, [open]);

  useEffect(() => {
    if (!open || !query.trim()) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPagefindResults(null);
      return;
    }

    let cancelled = false;

    const runPagefind = async () => {
      if (pagefindRef.current === "unavailable") return;

      try {
        if (!pagefindRef.current) {
          const dynamicImport = new Function("p", "return import(p)") as (
            p: string
          ) => Promise<PagefindModule>;
          const mod = await dynamicImport("/pagefind/pagefind.js");
          await mod.init?.();
          pagefindRef.current = mod;
        }

        const res = await pagefindRef.current.search(query);
        const topHits = await Promise.all(res.results.slice(0, 10).map((r) => r.data()));
        if (cancelled) return;

        const mapped: SearchResultItem[] = topHits.map((hit, idx) => {
          const cleanUrl =
            hit.url.replace(/\.html$/, "").replace(/\/index$/, "").replace(/\/$/, "") || "/";
          const matchedDoc = documents.find((d) => d.url === cleanUrl);
          const inferredType: "post" | "work" =
            matchedDoc?.type ?? (cleanUrl.startsWith("/works") ? "work" : "post");

          return {
            id: `pf-${idx}-${cleanUrl}`,
            type: inferredType,
            title: matchedDoc?.title ?? hit.meta?.title ?? cleanUrl,
            description:
              matchedDoc?.description ??
              (hit.excerpt ? hit.excerpt.replace(/<[^>]+>/g, "") : ""),
            url: cleanUrl,
            tags: matchedDoc?.tags ?? [],
            dateOrYear: matchedDoc?.dateOrYear ?? "",
          };
        });

        setPagefindResults(mapped);
      } catch {
        pagefindRef.current = "unavailable";
      }
    };

    runPagefind();
    return () => {
      cancelled = true;
    };
  }, [open, query, documents]);

  const navigateTo = (url: string) => {
    onClose();
    setQuery("");
    router.push(url);
  };

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
      } else if (event.key === "ArrowDown") {
        event.preventDefault();
        setActiveIndex((prev) => (results.length ? (prev + 1) % results.length : 0));
      } else if (event.key === "ArrowUp") {
        event.preventDefault();
        setActiveIndex((prev) =>
          results.length ? (prev - 1 + results.length) % results.length : 0
        );
      } else if (event.key === "Enter" && results[activeIndex]) {
        event.preventDefault();
        navigateTo(results[activeIndex].url);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  });

  const safeActiveIndex = activeIndex < results.length ? activeIndex : 0;

  return (
    <AnimatePresence>
      {open ? (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center px-4 pt-[12vh]"
          role="dialog"
          aria-modal="true"
          aria-label="全局检索"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.16 }}
            onClick={onClose}
            className="fixed inset-0 bg-zinc-950/50 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: -8 }}
            transition={{ type: "spring", stiffness: 420, damping: 32 }}
            className="relative z-10 w-full max-w-2xl overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-2xl dark:border-zinc-800 dark:bg-[#111113]"
          >
            <div className="flex items-center gap-3 border-b border-zinc-200 px-5 py-3.5 dark:border-zinc-800">
              <Search className="h-4 w-4 shrink-0 text-zinc-400" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setActiveIndex(0);
                }}
                placeholder="检索文章标题、正文或作品..."
                className="w-full bg-transparent text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none dark:text-zinc-100"
              />
              {query ? (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  aria-label="清空搜索"
                  className="rounded-md p-1 text-zinc-400 transition hover:text-zinc-700 dark:hover:text-zinc-200"
                >
                  <X className="h-4 w-4" />
                </button>
              ) : null}
              <button
                type="button"
                onClick={onClose}
                className="font-mono text-[11px] font-medium text-zinc-400 transition hover:text-zinc-700 dark:hover:text-zinc-200"
              >
                ESC
              </button>
            </div>

            <div className="flex items-center gap-4 border-b border-zinc-100 px-5 py-2.5 dark:border-zinc-800/80">
              {(
                [
                  { id: "all", label: "全部" },
                  { id: "post", label: "文章" },
                  { id: "work", label: "作品" },
                ] as const
              ).map((tab) => {
                const active = scope === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => {
                      setScope(tab.id);
                      setActiveIndex(0);
                    }}
                    className={`relative py-1 text-xs font-medium transition-colors ${
                      active
                        ? "text-zinc-950 dark:text-zinc-50"
                        : "text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200"
                    }`}
                  >
                    {tab.label}
                    {active ? (
                      <motion.span
                        layoutId="search-scope-underline"
                        transition={{ type: "spring", stiffness: 450, damping: 34 }}
                        className="absolute inset-x-0 -bottom-[10px] h-[2px] bg-emerald-600 dark:bg-emerald-400"
                      />
                    ) : null}
                  </button>
                );
              })}
              <span className="ml-auto font-mono text-[11px] tabular-nums text-zinc-400">
                {results.length} 条结果
              </span>
            </div>

            <div className="max-h-[55vh] overflow-y-auto px-2 py-2">
              {results.length === 0 ? (
                <div className="py-12 text-center text-sm text-zinc-500 dark:text-zinc-400">
                  没有找到与「{query}」匹配的文章或作品
                </div>
              ) : (
                <ul className="divide-y divide-zinc-100 dark:divide-zinc-800/70">
                  {results.map((item, index) => {
                    const active = index === safeActiveIndex;
                    return (
                      <li key={item.id} className="relative">
                        <button
                          type="button"
                          onMouseEnter={() => setActiveIndex(index)}
                          onClick={() => navigateTo(item.url)}
                          className="relative flex w-full items-start gap-3.5 rounded-xl px-3.5 py-3 text-left transition-colors"
                        >
                          {active ? (
                            <motion.span
                              layoutId="search-active-row"
                              transition={{ type: "spring", stiffness: 460, damping: 36 }}
                              className="absolute inset-0 -z-10 rounded-xl bg-zinc-100 dark:bg-zinc-900"
                            />
                          ) : null}
                          <span
                            className={`mt-0.5 shrink-0 ${
                              item.type === "post"
                                ? "text-zinc-500 dark:text-zinc-400"
                                : "text-emerald-600 dark:text-emerald-400"
                            }`}
                          >
                            {item.type === "post" ? (
                              <FileText className="h-4 w-4" />
                            ) : (
                              <Layers className="h-4 w-4" />
                            )}
                          </span>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="truncate text-sm font-medium text-zinc-950 dark:text-zinc-50">
                                {item.title}
                              </span>
                              <span
                                className={`shrink-0 font-mono text-[10px] font-medium ${
                                  item.type === "post"
                                    ? "text-zinc-500 dark:text-zinc-400"
                                    : "text-emerald-600 dark:text-emerald-400"
                                }`}
                              >
                                {item.type === "post" ? "文章" : "作品"}
                              </span>
                              {item.dateOrYear ? (
                                <span className="ml-auto shrink-0 font-mono text-[11px] tabular-nums text-zinc-400">
                                  {item.dateOrYear}
                                </span>
                              ) : null}
                            </div>
                            <p className="mt-0.5 line-clamp-1 text-xs text-zinc-500 dark:text-zinc-400">
                              {item.description}
                            </p>
                            {item.tags.length > 0 ? (
                              <p className="mt-1 truncate font-mono text-[11px] text-zinc-400 dark:text-zinc-500">
                                {item.tags.slice(0, 4).join(" · ")}
                              </p>
                            ) : null}
                          </div>
                          {active ? (
                            <CornerDownLeft className="mt-1.5 h-3.5 w-3.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                          ) : null}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            <div className="flex items-center justify-between border-t border-zinc-100 px-5 py-2.5 font-mono text-[11px] text-zinc-400 dark:border-zinc-800/80">
              <span>↑↓ 选择 · Enter 打开</span>
              <span>文章与作品联合检索</span>
            </div>
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>
  );
}
