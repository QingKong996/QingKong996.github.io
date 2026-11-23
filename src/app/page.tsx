import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getAllPosts, getAllWorks } from "@/lib/content";
import { siteConfig } from "@/lib/site-config";
import { HomeHero } from "@/components/home-hero";
import { TechStackSection } from "@/components/tech-stack-section";
import { WorkCard } from "@/components/work-card";
import { PostListItem } from "@/components/post-list-item";

export default function HomePage() {
  const allPosts = getAllPosts();
  const allWorks = getAllWorks();

  const recentWorks = allWorks.slice(0, 3);
  const recentPosts = allPosts.slice(0, 3);

  return (
    <div className="relative">
      <HomeHero postCount={allPosts.length} workCount={allWorks.length} />

      <TechStackSection groups={siteConfig.techStack} />

      {/* Recent Works Preview (Up to 3 latest, Card Grid) */}
      <section className="mx-auto max-w-5xl px-4 pt-16 sm:px-6">
        <div className="flex items-end justify-between gap-4 border-b border-zinc-200 pb-4 dark:border-zinc-800">
          <div>
            <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-600 dark:text-emerald-400">
              Recent Works
            </p>
            <h2 className="mt-1 text-2xl font-bold tracking-tight text-zinc-950 dark:text-zinc-50">
              最新作品
            </h2>
          </div>
          <Link
            href="/works"
            className="group inline-flex items-center gap-1.5 text-sm font-medium text-zinc-600 transition-colors hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-zinc-100"
          >
            <span>全部作品</span>
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:text-emerald-600 dark:group-hover:text-emerald-400" />
          </Link>
        </div>

        <div
          className={`mt-7 grid grid-cols-1 gap-6 ${
            recentWorks.length >= 3 ? "md:grid-cols-2 lg:grid-cols-3" : "md:grid-cols-2"
          }`}
        >
          {recentWorks.map((work, index) => (
            <WorkCard key={work.slug} work={work} index={index} />
          ))}
        </div>
      </section>

      {/* Recent Articles Preview (Editorial List) */}
      <section className="mx-auto max-w-5xl px-4 pt-20 sm:px-6">
        <div className="flex items-end justify-between gap-4 border-b border-zinc-200 pb-4 dark:border-zinc-800">
          <div>
            <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-600 dark:text-emerald-400">
              Recent Writing
            </p>
            <h2 className="mt-1 text-2xl font-bold tracking-tight text-zinc-950 dark:text-zinc-50">
              最新文章
            </h2>
          </div>
          <Link
            href="/posts"
            className="group inline-flex items-center gap-1.5 text-sm font-medium text-zinc-600 transition-colors hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-zinc-100"
          >
            <span>全部文章</span>
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:text-emerald-600 dark:group-hover:text-emerald-400" />
          </Link>
        </div>

        <div className="divide-y divide-zinc-200/80 dark:divide-zinc-800/80">
          {recentPosts.map((post, index) => (
            <PostListItem key={post.slug} post={post} index={index} />
          ))}
        </div>
      </section>
    </div>
  );
}
