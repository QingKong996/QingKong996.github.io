"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Search, X } from "lucide-react";
import type { WorkMeta } from "@/lib/content";
import { WorkCard } from "./work-card";

interface WorksExplorerProps {
  works: WorkMeta[];
  categories: string[];
}

export function WorksExplorer({ works, categories }: WorksExplorerProps) {
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("全部");

  const filteredWorks = useMemo(() => {
    const q = query.trim().toLowerCase();
    return works.filter((work) => {
      const matchesCat =
        selectedCategory === "全部" || work.category === selectedCategory;
      if (!matchesCat) return false;
      if (!q) return true;
      return (
        work.title.toLowerCase().includes(q) ||
        work.summary.toLowerCase().includes(q) ||
        work.category.toLowerCase().includes(q) ||
        work.techStack.some((t) => t.toLowerCase().includes(q))
      );
    });
  }, [works, query, selectedCategory]);

  return (
    <div className="space-y-8">
      <div className="space-y-4 border-b border-zinc-200 pb-5 dark:border-zinc-800">
        <div className="relative flex items-center border-b border-zinc-200 pb-2 transition-colors focus-within:border-emerald-600 dark:border-zinc-800 dark:focus-within:border-emerald-400">
          <Search className="mr-3 h-4 w-4 shrink-0 text-zinc-400" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="按作品名称、简介或技术栈检索..."
            aria-label="检索作品"
            className="w-full bg-transparent text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none dark:text-zinc-100"
          />
          {query ? (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="清空作品搜索"
              className="ml-2 rounded-md p-1 text-zinc-400 transition hover:text-zinc-700 dark:hover:text-zinc-200"
            >
              <X className="h-4 w-4" />
            </button>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {["全部", ...categories].map((category) => {
            const active = selectedCategory === category;
            return (
              <button
                key={category}
                type="button"
                onClick={() => setSelectedCategory(category)}
                className={`relative rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                  active
                    ? "text-white dark:text-zinc-950"
                    : "text-zinc-600 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-zinc-100"
                }`}
              >
                {active ? (
                  <motion.span
                    layoutId="works-category-pill"
                    transition={{ type: "spring", stiffness: 440, damping: 34 }}
                    className="absolute inset-0 -z-10 rounded-full bg-zinc-950 dark:bg-zinc-100"
                  />
                ) : null}
                {category === "全部" ? "全部作品" : category}
              </button>
            );
          })}
          <span className="ml-auto font-mono text-xs tabular-nums text-zinc-400">
            {filteredWorks.length} / {works.length}
          </span>
        </div>
      </div>

      {filteredWorks.length === 0 ? (
        <div className="py-16 text-center text-sm text-zinc-500 dark:text-zinc-400">
          没有符合条件的作品，试试其他关键词或切换分类。
        </div>
      ) : (
        <motion.div
          layout
          className={`grid grid-cols-1 gap-6 ${
            filteredWorks.length >= 3 ? "md:grid-cols-2 lg:grid-cols-3" : "md:grid-cols-2"
          }`}
        >
          <AnimatePresence mode="popLayout">
            {filteredWorks.map((work, index) => (
              <WorkCard key={work.slug} work={work} index={index} />
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}
