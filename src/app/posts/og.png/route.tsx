import { ImageResponse } from "next/og";
import { getAllPosts } from "@/lib/content";
import { loadOgFonts } from "@/lib/og-fonts";
import {
  createSectionOgImage,
  getSectionOgText,
  openGraphImageSize,
} from "@/lib/og-image";
import { siteConfig } from "@/lib/site-config";

export const dynamic = "force-static";

export async function GET() {
  const postCount = getAllPosts().length;
  const props = {
    eyebrow: "ARTICLES & NOTES · 文章归档",
    meta: `${String(postCount).padStart(2, "0")} 篇文章`,
    title: "技术文章与工程笔记",
    description: "记录软件工程、AI 前沿探索与技术实践思考。",
    pills: ["AI Engineering", "System Design", siteConfig.licenseName],
  };
  const fonts = await loadOgFonts(getSectionOgText(props));

  return new ImageResponse(createSectionOgImage(props), {
    ...openGraphImageSize,
    fonts,
  });
}
