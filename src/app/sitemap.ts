import type { MetadataRoute } from "next";
import { getAllPosts, getAllWorks } from "@/lib/content";
import { siteConfig } from "@/lib/site-config";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const posts = getAllPosts();
  const works = getAllWorks();

  return [
    {
      url: `${siteConfig.url}/`,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${siteConfig.url}/posts/`,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${siteConfig.url}/works/`,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    ...posts.map((post) => ({
      url: `${siteConfig.url}/posts/${post.slug}/`,
      lastModified: post.date,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
    ...works.map((work) => ({
      url: `${siteConfig.url}/works/${work.slug}/`,
      lastModified: work.date,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ];
}
