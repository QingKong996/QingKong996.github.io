import type { Metadata } from "next";
import { getAllPosts } from "@/lib/content";
import { siteConfig } from "@/lib/site-config";
import { PostsExplorer } from "@/components/posts-explorer";

export const metadata: Metadata = {
  title: "文章",
  description: "技术文章、AI 前沿观察与工程实践笔记。",
};

export default function PostsPage() {
  const posts = getAllPosts().map((post) => ({
    slug: post.slug,
    format: post.format,
    title: post.title,
    description: post.description,
    date: post.date,
    draft: post.draft,
    featured: post.featured,
    readingTimeMinutes: post.readingTimeMinutes,
  }));

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      <header className="mb-10">
        <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-600 dark:text-emerald-400">
          Articles & Notes
        </p>
        <h1 className="mt-1.5 text-3xl font-bold tracking-tight text-zinc-950 sm:text-4xl dark:text-zinc-50">
          文章
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
          记录软件工程、AI 前沿探索与技术实践思考。所有文章均以{" "}
          <a
            href={siteConfig.licenseUrl}
            target="_blank"
            rel="noopener noreferrer license"
            className="font-mono text-xs font-medium text-zinc-900 underline decoration-emerald-500/60 underline-offset-4 transition hover:text-emerald-600 dark:text-zinc-100 dark:hover:text-emerald-400"
          >
            {siteConfig.licenseName}
          </a>{" "}
          发布。
        </p>
      </header>

      <PostsExplorer posts={posts} />
    </div>
  );
}
