import { ImageResponse } from "next/og";
import { getAllPosts, getAllWorks } from "@/lib/content";
import { loadOgFonts } from "@/lib/og-fonts";
import {
  createHomeOgImage,
  getHomeOgText,
  openGraphImageSize,
} from "@/lib/og-image";

export const dynamic = "force-static";

export async function GET() {
  const postCount = getAllPosts().length;
  const workCount = getAllWorks().length;
  const fonts = await loadOgFonts(getHomeOgText({ postCount, workCount }));

  return new ImageResponse(createHomeOgImage({ postCount, workCount }), {
    ...openGraphImageSize,
    fonts,
  });
}
