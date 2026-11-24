import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { getAllPosts, getPostBySlug } from "@/lib/content";
import { renderMdxContent } from "@/lib/mdx";
import { createSocialImage } from "@/lib/og-image";
import { buildPostSchema } from "@/lib/schema";
import { siteConfig } from "@/lib/site-config";
import { JsonLd } from "@/components/json-ld";
import {
  MobileToc,
  SidebarToc,
  TocProvider,
} from "@/components/table-of-contents";

interface PostDetailPageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return getAllPosts().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: PostDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) {
    return { title: "文章未找到" };
  }
  const url = `/posts/${post.slug}/`;
  const image = createSocialImage(`${url}og.png`, `${post.title} — ${siteConfig.displayName}`);

  return {
    title: post.title,
    description: post.description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      type: "article",
      url,
      siteName: siteConfig.displayName,
      title: post.title,
      description: post.description,
      locale: "zh_CN",
      publishedTime: `${post.date}T00:00:00.000Z`,
      authors: [siteConfig.name],
      images: [image],
    },
    twitter: {
      card: "summary_large_image",
      site: siteConfig.xHandle,
      creator: siteConfig.xHandle,
      title: post.title,
      description: post.description,
      images: [image],
    },
  };
}

export default async function PostDetailPage({ params }: PostDetailPageProps) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const postSchema = buildPostSchema(post);
  const allPosts = getAllPosts();
  const currentIndex = allPosts.findIndex((item) => item.slug === post.slug);
  const prevPost = currentIndex > 0 ? allPosts[currentIndex - 1] : null;
  const nextPost =
    currentIndex >= 0 && currentIndex < allPosts.length - 1
      ? allPosts[currentIndex + 1]
      : null;

  const { content: renderedContent, headings } = await renderMdxContent(post.content, post.format);

  const hasToc = headings.length > 0;

  return (
    <>
      <JsonLd data={postSchema} />
      {/* eslint-disable-next-line @next/next/no-css-tags */}
      <link rel="stylesheet" href="/katex/katex.min.css" precedence="default" />
      <TocProvider headings={headings}>
        <div
          className={`mx-auto px-4 py-12 sm:px-6 ${hasToc ? "max-w-5xl" : "max-w-3xl"}`}
        >
          <div
            className={
              hasToc
                ? "grid grid-cols-1 gap-8 lg:grid-cols-[220px_minmax(0,1fr)] lg:items-stretch lg:gap-12"
                : ""
            }
          >
            {/* Left sticky sidebar TOC */}
            {hasToc ? (
              <aside
                data-pagefind-ignore
                aria-label="文章目录"
                className="hidden lg:block lg:h-full"
              >
                <div className="sticky top-24 max-h-[calc(100vh-7.5rem)] overflow-y-auto pr-2">
                  <SidebarToc headings={headings} />
                </div>
              </aside>
            ) : null}

            {/* Main reading column */}
            <div className="min-w-0 max-w-3xl">
              <Link
                href="/posts"
                className="group inline-flex items-center gap-1.5 text-sm font-medium text-zinc-500 transition-colors hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-zinc-100"
              >
                <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
                返回文章列表
              </Link>

              <article
                data-pagefind-body
                data-pagefind-filter="type:文章"
                className="mt-8"
              >
                <header className="border-b border-zinc-200 pb-8 dark:border-zinc-800">
                  <div className="flex flex-wrap items-center gap-2.5 font-mono text-xs text-zinc-500 dark:text-zinc-400">
                    <time dateTime={post.date} className="tabular-nums">
                      {post.date}
                    </time>
                    <span className="text-zinc-300 dark:text-zinc-700">·</span>
                    <span>约 {post.readingTimeMinutes} 分钟阅读</span>
                  </div>

                  <h1
                    data-pagefind-meta="title"
                    className="mt-4 text-3xl font-bold tracking-tight text-zinc-950 sm:text-4xl sm:leading-[1.2] dark:text-zinc-50"
                  >
                    {post.title}
                  </h1>

                  <p className="mt-4 text-base leading-relaxed text-zinc-600 dark:text-zinc-400">
                    {post.description}
                  </p>
                </header>

                {hasToc ? (
                  <div className="mt-6 lg:hidden">
                    <MobileToc headings={headings} />
                  </div>
                ) : null}

                <div className="mt-10">{renderedContent}</div>

                <footer
                  data-pagefind-ignore
                  className="mt-12 border-t border-zinc-200/80 pt-5 font-mono text-xs leading-relaxed text-zinc-500 dark:border-zinc-800/80 dark:text-zinc-400"
                >
                  本文采用{" "}
                  <a
                    href={siteConfig.licenseUrl}
                    target="_blank"
                    rel="noopener noreferrer license"
                    className="font-medium text-zinc-900 underline decoration-emerald-500/60 underline-offset-4 transition hover:text-emerald-600 dark:text-zinc-100 dark:hover:text-emerald-400"
                  >
                    {siteConfig.licenseName}
                  </a>{" "}
                  许可协议发布（署名-非商业性使用 4.0 国际），转载请注明出处。
                </footer>
              </article>

              {prevPost || nextPost ? (
                <nav
                  aria-label="上下篇文章"
                  className="mt-16 grid grid-cols-1 gap-6 border-t border-zinc-200 pt-8 sm:grid-cols-2 dark:border-zinc-800"
                >
                  {prevPost ? (
                    <Link
                      href={`/posts/${prevPost.slug}`}
                      className="group flex flex-col items-start transition-colors"
                    >
                      <span className="inline-flex items-center gap-1 font-mono text-xs text-zinc-400">
                        <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
                        上一篇
                      </span>
                      <span className="mt-1.5 line-clamp-1 text-base font-medium text-zinc-900 transition-colors group-hover:text-emerald-600 dark:text-zinc-100 dark:group-hover:text-emerald-400">
                        {prevPost.title}
                      </span>
                    </Link>
                  ) : (
                    <div />
                  )}
                  {nextPost ? (
                    <Link
                      href={`/posts/${nextPost.slug}`}
                      className="group flex flex-col items-end text-right transition-colors"
                    >
                      <span className="inline-flex items-center gap-1 font-mono text-xs text-zinc-400">
                        下一篇
                        <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                      </span>
                      <span className="mt-1.5 line-clamp-1 text-base font-medium text-zinc-900 transition-colors group-hover:text-emerald-600 dark:text-zinc-100 dark:group-hover:text-emerald-400">
                        {nextPost.title}
                      </span>
                    </Link>
                  ) : null}
                </nav>
              ) : null}
            </div>
          </div>
        </div>
      </TocProvider>
    </>
  );
}
