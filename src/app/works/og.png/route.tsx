import { ImageResponse } from "next/og";
import { getAllWorkCategories, getAllWorks } from "@/lib/content";
import { loadOgFonts } from "@/lib/og-fonts";
import {
  createSectionOgImage,
  getSectionOgText,
  openGraphImageSize,
} from "@/lib/og-image";

export const dynamic = "force-static";

export async function GET() {
  const workCount = getAllWorks().length;
  const categories = getAllWorkCategories();
  const props = {
    eyebrow: "INDEPENDENT WORKS · 独立作品集",
    meta: `${String(workCount).padStart(2, "0")} 个作品`,
    title: "开源项目与工程实验",
    description: "独立于博客文章维护的开源项目、桌面应用与全栈实践。",
    pills: categories.length > 0 ? categories.slice(0, 4) : ["AI Agent", "Full-Stack", "Open Source"],
    accent: "#38bdf8",
  };
  const fonts = await loadOgFonts(getSectionOgText(props));

  return new ImageResponse(createSectionOgImage(props), {
    ...openGraphImageSize,
    fonts,
  });
}
