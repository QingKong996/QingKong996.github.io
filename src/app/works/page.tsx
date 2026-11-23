import type { Metadata } from "next";
import { getAllWorkCategories, getAllWorks } from "@/lib/content";
import { WorksExplorer } from "@/components/works-explorer";

export const metadata: Metadata = {
  title: "作品",
  description: "独立于博客文章的开源项目、交互工具与 Web 应用作品集，采用卡片网格展示。",
};

export default function WorksPage() {
  const works = getAllWorks().map((work) => ({
    slug: work.slug,
    format: work.format,
    title: work.title,
    summary: work.summary,
    year: work.year,
    category: work.category,
    status: work.status,
    techStack: work.techStack,
    accent: work.accent,
    repoUrl: work.repoUrl,
    demoUrl: work.demoUrl,
    featured: work.featured,
    order: work.order,
  }));
  const categories = getAllWorkCategories();

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      <header className="mb-10">
        <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-600 dark:text-emerald-400">
          Independent Works
        </p>
        <h1 className="mt-1.5 text-3xl font-bold tracking-tight text-zinc-950 sm:text-4xl dark:text-zinc-50">
          作品
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
          独立于文章维护的开源项目与工程实验集合，记录正在推进中的桌面应用与全栈实践。
        </p>
      </header>

      <WorksExplorer works={works} categories={categories} />
    </div>
  );
}
