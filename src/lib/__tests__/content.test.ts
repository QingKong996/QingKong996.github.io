import { describe, expect, it } from "vitest";
import { parseFrontmatter } from "../frontmatter";
import { getAllPosts, getAllWorks, getSearchDocuments } from "../content";

describe("parseFrontmatter", () => {
  it("parses scalars, booleans, numbers, and block arrays", () => {
    const raw = [
      "---",
      'title: "测试文章"',
      "draft: false",
      "order: 2",
      "tags:",
      "  - Next.js",
      "  - LaTeX",
      "---",
      "",
      "# 正文内容",
    ].join("\r\n");

    const { data, content } = parseFrontmatter(raw);
    expect(data.title).toBe("测试文章");
    expect(data.draft).toBe(false);
    expect(data.order).toBe(2);
    expect(data.tags).toEqual(["Next.js", "LaTeX"]);
    expect(content.trim()).toBe("# 正文内容");
  });
});

describe("content collections", () => {
  it("loads posts and works independently", () => {
    const posts = getAllPosts();
    const works = getAllWorks();

    expect(posts.length).toBeGreaterThanOrEqual(1);
    expect(works.length).toBeGreaterThanOrEqual(2);

    const postSlugs = new Set(posts.map((p) => p.slug));
    for (const work of works) {
      expect(postSlugs.has(work.slug)).toBe(false);
    }
  });

  it("produces unified search documents covering both posts and works", () => {
    const docs = getSearchDocuments();
    const hasPosts = docs.some((d) => d.type === "post");
    const hasWorks = docs.some((d) => d.type === "work");

    expect(hasPosts).toBe(true);
    expect(hasWorks).toBe(true);
  });
});
