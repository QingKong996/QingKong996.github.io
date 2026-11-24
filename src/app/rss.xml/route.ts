import { createRssFeed } from "@/lib/rss";

export const dynamic = "force-static";

export function GET() {
  return new Response(createRssFeed(), {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
    },
  });
}
