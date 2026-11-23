import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Code2, ExternalLink } from "lucide-react";
import { getAllWorks, getWorkBySlug } from "@/lib/content";
import { renderMdxContent } from "@/lib/mdx";

interface WorkDetailPageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return getAllWorks().map((work) => ({ slug: work.slug }));
}

export async function generateMetadata({
  params,
}: WorkDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const work = getWorkBySlug(slug);
  if (!work) {
    return { title: "作品未找到" };
  }
  return {
    title: work.title,
    description: work.summary,
  };
}

export default async function WorkDetailPage({ params }: WorkDetailPageProps) {
  const { slug } = await params;
  const work = getWorkBySlug(slug);

  if (!work) {
    notFound();
  }

  const { content: renderedContent } = await renderMdxContent(work.content, work.format);

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      {/* eslint-disable-next-line @next/next/no-css-tags */}
      <link rel="stylesheet" href="/katex/katex.min.css" precedence="default" />
      <Link
        href="/works"
        className="group inline-flex items-center gap-1.5 text-sm font-medium text-zinc-500 transition-colors hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-zinc-100"
      >
        <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
        返回作品集
      </Link>

      <article data-pagefind-body data-pagefind-filter="type:作品" className="mt-8">
        <header className="border-b border-zinc-200 pb-8 dark:border-zinc-800">
          <div className="flex flex-wrap items-center gap-3 font-mono text-xs text-zinc-500 dark:text-zinc-400">
            <span className="inline-flex items-center gap-1.5 font-sans font-medium text-emerald-600 dark:text-emerald-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400" />
              {work.status}
            </span>
            <span className="text-zinc-300 dark:text-zinc-700">/</span>
            <span>{work.category}</span>
            <span className="text-zinc-300 dark:text-zinc-700">/</span>
            <span className="tabular-nums">{work.year}</span>
          </div>

          <h1
            data-pagefind-meta="title"
            className="mt-4 text-3xl font-bold tracking-tight text-zinc-950 sm:text-4xl dark:text-zinc-50"
          >
            {work.title}
          </h1>

          <p className="mt-4 text-base leading-relaxed text-zinc-600 dark:text-zinc-400">
            {work.summary}
          </p>

          {work.techStack.length > 0 ? (
            <p className="mt-5 font-mono text-xs text-zinc-500 dark:text-zinc-400">
              {work.techStack.join(" · ")}
            </p>
          ) : null}

          {(work.demoUrl || work.repoUrl) ? (
            <div className="mt-6 flex flex-wrap items-center gap-5">
              {work.demoUrl ? (
                <a
                  href={work.demoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full bg-zinc-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-600 dark:bg-zinc-100 dark:text-zinc-950 dark:hover:bg-emerald-400"
                >
                  <ExternalLink className="h-4 w-4" />
                  在线访问
                </a>
              ) : null}
              {work.repoUrl ? (
                <a
                  href={work.repoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 py-2 text-sm font-medium text-zinc-700 transition-colors hover:text-zinc-950 dark:text-zinc-300 dark:hover:text-zinc-50"
                >
                  <Code2 className="h-4 w-4" />
                  查看源码
                </a>
              ) : null}
            </div>
          ) : null}
        </header>

        <div className="mt-10">{renderedContent}</div>
      </article>
    </div>
  );
}
