"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";
import type { PostMeta } from "@/lib/content";

export function PostListItem({ post, index = 0 }: { post: PostMeta; index?: number }) {
  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.34, delay: Math.min(index * 0.04, 0.2), ease: [0.22, 1, 0.36, 1] }}
      className="group relative py-6 transition-colors"
    >
      {/* Solid emerald left accent bar on hover */}
      <span
        aria-hidden="true"
        className="absolute -left-4 top-6 bottom-6 w-[2px] origin-center scale-y-0 rounded-full bg-emerald-600 transition-transform duration-200 group-hover:scale-y-100 dark:bg-emerald-400"
      />

      <div className="flex flex-wrap items-center gap-2.5 font-mono text-xs text-zinc-500 dark:text-zinc-400">
        <time dateTime={post.date} className="tabular-nums">
          {post.date}
        </time>
        <span className="text-zinc-300 dark:text-zinc-700">·</span>
        <span>约 {post.readingTimeMinutes} 分钟</span>
      </div>

      <h3 className="mt-2.5 text-lg font-semibold tracking-tight text-zinc-950 transition-colors group-hover:text-emerald-600 dark:text-zinc-50 dark:group-hover:text-emerald-400">
        <Link href={`/posts/${post.slug}`} className="focus:outline-none">
          <span className="absolute inset-0" aria-hidden="true" />
          {post.title}
        </Link>
      </h3>

      <div className="mt-2 flex items-end justify-between gap-4">
        <p className="line-clamp-2 max-w-2xl text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
          {post.description}
        </p>

        <span className="inline-flex shrink-0 items-center gap-1 text-xs font-medium text-zinc-400 transition-all duration-200 group-hover:translate-x-1 group-hover:text-emerald-600 dark:text-zinc-500 dark:group-hover:text-emerald-400">
          阅读
          <ArrowRight className="h-3.5 w-3.5" />
        </span>
      </div>
    </motion.article>
  );
}
