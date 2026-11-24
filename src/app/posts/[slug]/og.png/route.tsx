import { ImageResponse } from "next/og";
import { getAllPosts, getPostBySlug } from "@/lib/content";
import { createPostOgImage, getPostOgText } from "@/lib/content-og-image";
import { loadOgFonts } from "@/lib/og-fonts";
import { openGraphImageSize } from "@/lib/og-image";

export const dynamic = "force-static";

export function generateStaticParams() {
  return getAllPosts().map((post) => ({ slug: post.slug }));
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) {
    return new Response("Not Found", { status: 404 });
  }

  const fonts = await loadOgFonts(getPostOgText(post));

  return new ImageResponse(createPostOgImage(post), {
    ...openGraphImageSize,
    fonts,
  });
}
