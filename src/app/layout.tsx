import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ScrollTopDock } from "@/components/scroll-top-dock";
import { getSearchDocuments } from "@/lib/content";
import { openGraphImage } from "@/lib/og-image";
import { siteConfig } from "@/lib/site-config";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.displayName,
    template: `%s | ${siteConfig.displayName}`,
  },
  description: siteConfig.role,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: "/",
    siteName: siteConfig.displayName,
    title: siteConfig.displayName,
    description: siteConfig.role,
    locale: "zh_CN",
    images: [openGraphImage],
  },
  twitter: {
    card: "summary_large_image",
    site: siteConfig.xHandle,
    creator: siteConfig.xHandle,
    title: siteConfig.displayName,
    description: siteConfig.role,
    images: [openGraphImage],
  },
};

const themeInitScript = `
(() => {
  try {
    const key = "kong-blog-theme";
    const stored = window.localStorage.getItem(key);
    const dark = stored === "dark" || (!stored && window.matchMedia("(prefers-color-scheme: dark)").matches);
    document.documentElement.classList.toggle("dark", dark);
    document.documentElement.style.colorScheme = dark ? "dark" : "light";
  } catch {}
})();
`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  const searchDocuments = getSearchDocuments();

  return (
    <html
      lang="zh-CN"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <link
          rel="alternate"
          type="application/rss+xml"
          title={`${siteConfig.displayName} RSS`}
          href={siteConfig.rssPath}
        />
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="flex min-h-full flex-col bg-background text-foreground selection:bg-emerald-500/20 selection:text-zinc-950 dark:selection:bg-emerald-400/25 dark:selection:text-zinc-50">
        <ThemeProvider>
          <SiteHeader searchDocuments={searchDocuments} />
          <main className="flex-1">{children}</main>
          <SiteFooter />
          <ScrollTopDock />
        </ThemeProvider>
      </body>
    </html>
  );
}
