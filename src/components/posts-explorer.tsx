"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Search, X } from "lucide-react";
import type { PostMeta } from "@/lib/content";
import { PostListItem } from "./post-list-item";

interface PostsExplorerProps {
  posts: PostMeta[];
}

export function PostsExplorer({ posts }: PostsExplorerProps) {
  const [query, setQuery] = useState("");

  const filteredPosts = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return posts;
    return posts.filter(
      (post) =>
        post.title.toLowerCase().includes(q) ||
        post.description.toLowerCase().includes(q)
    );
  }, [posts, query]);

  return (
    <div className="space-y-8">
      <div className="relative flex items-center gap-3 border-b border-zinc-200 pb-3 transition-colors focus-within:border-emerald-600 dark:border-zinc-800 dark:focus-within:border-emerald-400">
        <Search className="h-4 w-4 shrink-0 text-zinc-400" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="按标题或摘要检索文章..."
          aria-label="检索文章"
          className="w-full bg-transparent text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none dark:text-zinc-100"
        />
        {query ? (
          <button
            type="button"
            onClick={() => setQuery("")}
            aria-label="清空文章搜索"
            className="rounded-md p-1 text-zinc-400 transition hover:text-zinc-700 dark:hover:text-zinc-200"
          >
            <X className="h-4 w-4" />
          </button>
        ) : null}
        <span className="shrink-0 font-mono text-xs tabular-nums text-zinc-400">
          {filteredPosts.length} / {posts.length}
        </span>
      </div>

      {filteredPosts.length === 0 ? (
        <div className="py-16 text-center text-sm text-zinc-500 dark:text-zinc-400">
          没有符合条件的文章，试试其他关键词。
        </div>
      ) : (
        <motion.div layout className="divide-y divide-zinc-200/80 dark:divide-zinc-800/80">
          <AnimatePresence mode="popLayout">
            {filteredPosts.map((post, index) => (
              <PostListItem key={post.slug} post={post} index={index} />
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}
