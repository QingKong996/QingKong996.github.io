import fs from "node:fs";
import path from "node:path";
import { parseFrontmatter } from "./frontmatter";

export type ContentFormat = "md" | "mdx";

export interface PostMeta {
  slug: string;
  format: ContentFormat;
  title: string;
  description: string;
  date: string;
  draft: boolean;
  featured: boolean;
  readingTimeMinutes: number;
}

export interface PostEntry extends PostMeta {
  content: string;
  plainText: string;
}

export type WorkAccent =
  | "emerald"
  | "sky"
  | "amber"
  | "violet"
  | "rose"
  | "slate";

export interface WorkMeta {
  slug: string;
  format: ContentFormat;
  title: string;
  summary: string;
  year: string;
  date?: string;
  category: string;
  status: string;
  techStack: string[];
  accent: WorkAccent;
  repoUrl?: string;
  demoUrl?: string;
  featured: boolean;
  order: number;
}

export interface WorkEntry extends WorkMeta {
  content: string;
  plainText: string;
}

export interface SearchDocument {
  id: string;
  type: "post" | "work";
  title: string;
  description: string;
  url: string;
  tags: string[];
  dateOrYear: string;
  category?: string;
  excerpt: string;
}

const CONTENT_ROOT = path.join(process.cwd(), "content");
const POSTS_DIR = path.join(CONTENT_ROOT, "posts");
const WORKS_DIR = path.join(CONTENT_ROOT, "works");

const VALID_ACCENTS = new Set<WorkAccent>([
  "emerald",
  "sky",
  "amber",
  "violet",
  "rose",
  "slate",
]);

function toStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.map((item) => String(item).trim()).filter(Boolean);
}

function stripMarkdownToPlainText(markdown: string): string {
  return markdown
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/\$\$[\s\S]*?\$\$/g, " ")
    .replace(/\$[^$\n]+\$/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/[*_`~>|]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function estimateReadingTimeMinutes(text: string): number {
  const cjkCount = (text.match(/[\u4e00-\u9fff]/g) ?? []).length;
  const nonCjkWords = text
    .replace(/[\u4e00-\u9fff]/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
  const minutes = cjkCount / 320 + nonCjkWords / 220;
  return Math.max(1, Math.ceil(minutes));
}

function readContentFiles(dir: string): { slug: string; format: ContentFormat; raw: string }[] {
  if (!fs.existsSync(dir)) return [];

  return fs
    .readdirSync(dir)
    .filter((file) => file.endsWith(".mdx") || file.endsWith(".md"))
    .map((file) => {
      const format: ContentFormat = file.endsWith(".mdx") ? "mdx" : "md";
      const slug = file.replace(/\.(mdx|md)$/, "");
      const raw = fs.readFileSync(path.join(dir, file), "utf-8");
      return { slug, format, raw };
    });
}

export function getAllPosts(): PostEntry[] {
  const files = readContentFiles(POSTS_DIR);

  return files
    .map(({ slug, format, raw }) => {
      const { data, content } = parseFrontmatter(raw);
      const plainText = stripMarkdownToPlainText(content);

      return {
        slug,
        format,
        title: String(data.title ?? slug),
        description: String(data.description ?? plainText.slice(0, 140)),
        date: String(data.date ?? "2026-01-01"),
        draft: Boolean(data.draft ?? false),
        featured: Boolean(data.featured ?? false),
        readingTimeMinutes: estimateReadingTimeMinutes(plainText),
        content,
        plainText,
      } satisfies PostEntry;
    })
    .filter((post) => !post.draft)
    .sort((a, b) => b.date.localeCompare(a.date));
}

export function getPostBySlug(slug: string): PostEntry | undefined {
  return getAllPosts().find((post) => post.slug === slug);
}

export function getAllWorks(): WorkEntry[] {
  const files = readContentFiles(WORKS_DIR);

  return files
    .map(({ slug, format, raw }) => {
      const { data, content } = parseFrontmatter(raw);
      const plainText = stripMarkdownToPlainText(content);
      const rawAccent = String(data.accent ?? "emerald") as WorkAccent;

      const date = data.date ? String(data.date) : undefined;
      const year = String(data.year ?? (date ? date.slice(0, 4) : "2026"));

      return {
        slug,
        format,
        title: String(data.title ?? slug),
        summary: String(data.summary ?? data.description ?? plainText.slice(0, 140)),
        year,
        date,
        category: String(data.category ?? "Web 应用"),
        status: String(data.status ?? "开源项目"),
        techStack: toStringArray(data.techStack ?? data.tags),
        accent: VALID_ACCENTS.has(rawAccent) ? rawAccent : "emerald",
        repoUrl: data.repoUrl ? String(data.repoUrl) : undefined,
        demoUrl: data.demoUrl ? String(data.demoUrl) : undefined,
        featured: Boolean(data.featured ?? false),
        order: typeof data.order === "number" ? data.order : 99,
        content,
        plainText,
      } satisfies WorkEntry;
    })
    .sort((a, b) => {
      const dateCmp = (b.date ?? b.year).localeCompare(a.date ?? a.year);
      if (dateCmp !== 0) return dateCmp;
      return a.order - b.order;
    });
}

export function getWorkBySlug(slug: string): WorkEntry | undefined {
  return getAllWorks().find((work) => work.slug === slug);
}

export function getAllWorkCategories(): string[] {
  const categories = new Set<string>();
  for (const work of getAllWorks()) {
    categories.add(work.category);
  }
  return Array.from(categories);
}

export function getSearchDocuments(): SearchDocument[] {
  const postDocs: SearchDocument[] = getAllPosts().map((post) => ({
    id: `post:${post.slug}`,
    type: "post",
    title: post.title,
    description: post.description,
    url: `/posts/${post.slug}`,
    tags: [],
    dateOrYear: post.date,
    excerpt: post.plainText.slice(0, 400),
  }));

  const workDocs: SearchDocument[] = getAllWorks().map((work) => ({
    id: `work:${work.slug}`,
    type: "work",
    title: work.title,
    description: work.summary,
    url: `/works/${work.slug}`,
    tags: work.techStack,
    dateOrYear: work.year,
    category: work.category,
    excerpt: work.plainText.slice(0, 400),
  }));

  return [...postDocs, ...workDocs];
}
