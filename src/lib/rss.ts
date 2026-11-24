import { Feed } from "feed";
import { getAllPosts } from "./content";
import { siteConfig } from "./site-config";

const FEED_DESCRIPTION = "技术文章、AI 前沿观察与工程实践笔记。";

export function createRssFeed(): string {
  const posts = getAllPosts();
  const feedUrl = new URL(siteConfig.rssPath, siteConfig.url).toString();
  const siteUrl = `${siteConfig.url}/`;
  const updated = posts[0]
    ? new Date(`${posts[0].date}T00:00:00.000Z`)
    : new Date();

  const feed = new Feed({
    title: `${siteConfig.displayName} 的文章`,
    description: FEED_DESCRIPTION,
    id: siteUrl,
    link: siteUrl,
    feedLinks: {
      rss: feedUrl,
    },
    language: "zh-CN",
    copyright: `${siteConfig.name} · ${siteConfig.licenseName}`,
    updated,
    author: {
      name: siteConfig.name,
      link: siteConfig.url,
    },
  });

  for (const post of posts) {
    const url = `${siteConfig.url}/posts/${post.slug}/`;

    feed.addItem({
      title: post.title,
      id: url,
      link: url,
      description: post.description,
      date: new Date(`${post.date}T00:00:00.000Z`),
      author: [{ name: siteConfig.name, link: siteConfig.url }],
    });
  }

  return feed.rss2();
}
