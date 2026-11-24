import { ImageResponse } from "next/og";
import { getAllWorks, getWorkBySlug } from "@/lib/content";
import { createWorkOgImage, getWorkOgText } from "@/lib/content-og-image";
import { loadOgFonts } from "@/lib/og-fonts";
import { openGraphImageSize } from "@/lib/og-image";

export const dynamic = "force-static";

export function generateStaticParams() {
  return getAllWorks().map((work) => ({ slug: work.slug }));
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const work = getWorkBySlug(slug);
  if (!work) {
    return new Response("Not Found", { status: 404 });
  }

  const fonts = await loadOgFonts(getWorkOgText(work));

  return new ImageResponse(createWorkOgImage(work), {
    ...openGraphImageSize,
    fonts,
  });
}
