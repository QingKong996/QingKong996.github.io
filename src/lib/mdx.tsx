import { evaluate } from "@mdx-js/mdx";
import * as runtime from "react/jsx-runtime";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeKatex from "rehype-katex";
import rehypePrettyCode from "rehype-pretty-code";
import type { ContentFormat } from "./content";
import { mdxComponents } from "@/components/mdx/mdx-components";

export interface TocHeading {
  id: string;
  text: string;
  level: 2 | 3 | 4;
}

interface HastNode {
  type?: string;
  value?: string;
  tagName?: string;
  properties?: Record<string, unknown>;
  children?: HastNode[];
}

function getHastText(node: HastNode): string {
  if (node.type === "text" && typeof node.value === "string") {
    return node.value;
  }
  if (!Array.isArray(node.children)) return "";
  return node.children.map(getHastText).join("");
}

function collectHeadingsFromHast(node: HastNode, out: TocHeading[]) {
  if (
    node.type === "element" &&
    (node.tagName === "h2" || node.tagName === "h3" || node.tagName === "h4")
  ) {
    const id = typeof node.properties?.id === "string" ? node.properties.id : "";
    const text = getHastText(node).trim();
    if (id && text) {
      const level = Number(node.tagName.slice(1)) as 2 | 3 | 4;
      out.push({ id, text, level });
    }
    return;
  }

  if (Array.isArray(node.children)) {
    for (const child of node.children) {
      collectHeadingsFromHast(child, out);
    }
  }
}

export async function renderMdxContent(source: string, format: ContentFormat = "mdx") {
  const headings: TocHeading[] = [];
  const collectPlugin = () => (tree: HastNode) => {
    collectHeadingsFromHast(tree, headings);
  };

  const { default: Content } = await evaluate(source, {
    ...runtime,
    format,
    remarkPlugins: [remarkGfm, remarkMath],
    rehypePlugins: [
      rehypeSlug,
      collectPlugin,
      [
        rehypeAutolinkHeadings,
        {
          behavior: "wrap",
          properties: {
            className: ["heading-anchor"],
          },
        },
      ],
      [rehypeKatex, { strict: false }],
      [
        rehypePrettyCode,
        {
          theme: {
            light: "github-light",
            dark: "github-dark-dimmed",
          },
          keepBackground: false,
        },
      ],
    ],
  });

  return {
    content: <Content components={mdxComponents} />,
    headings,
  };
}
