import type { PostEntry, WorkEntry } from "./content";
import { siteConfig } from "./site-config";

const SITE_URL = `${siteConfig.url}/`;
const PERSON_ID = `${SITE_URL}#person`;
const WEBSITE_ID = `${SITE_URL}#website`;

const PROGRAMMING_LANGUAGES = new Set([
  "Go",
  "Golang",
  "TypeScript",
  "JavaScript",
  "Python",
  "C",
  "C++",
  "C / C++",
  "JS / TS",
  "Rust",
  "Java",
]);

const RUNTIME_PLATFORMS = new Set(["Electron", "Web", "Node.js", "Browser"]);

export type JsonLdData = Record<string, unknown>;

function getSameAsLinks(): string[] {
  return siteConfig.linktree
    .filter((item) => item.icon === "github" || item.icon === "twitter")
    .map((item) => item.href)
    .filter((href): href is string => Boolean(href));
}

function getKnownTopics(): string[] {
  return Array.from(
    new Set(
      siteConfig.techStack.flatMap((group) => group.items.map((item) => item.name)),
    ),
  );
}

export function buildSiteSchema(): JsonLdData {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Person",
        "@id": PERSON_ID,
        "name": siteConfig.name,
        "alternateName": ["青空", siteConfig.handle.replace(/^@/, "")],
        "url": SITE_URL,
        "description": siteConfig.role,
        "sameAs": getSameAsLinks(),
        "knowsAbout": getKnownTopics(),
      },
      {
        "@type": "WebSite",
        "@id": WEBSITE_ID,
        "name": siteConfig.displayName,
        "alternateName": [siteConfig.handle.replace(/^@/, "")],
        "url": SITE_URL,
        "description": siteConfig.role,
        "inLanguage": "zh-CN",
        "publisher": {
          "@id": PERSON_ID,
        },
      },
    ],
  };
}

export function buildPostSchema(post: PostEntry): JsonLdData {
  const url = `${siteConfig.url}/posts/${post.slug}/`;

  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "@id": `${url}#article`,
    "headline": post.title,
    "description": post.description,
    "url": url,
    "datePublished": post.date,
    "inLanguage": "zh-CN",
    "image": `${url}og.png`,
    "isPartOf": {
      "@id": WEBSITE_ID,
    },
    "publisher": {
      "@id": PERSON_ID,
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": url,
    },
  };
}

export function buildWorkSchema(work: WorkEntry): JsonLdData {
  const url = `${siteConfig.url}/works/${work.slug}/`;
  const programmingLanguages = work.techStack.filter((tech) =>
    PROGRAMMING_LANGUAGES.has(tech),
  );
  const runtimePlatforms = work.techStack.filter((tech) =>
    RUNTIME_PLATFORMS.has(tech),
  );

  const schema: JsonLdData = {
    "@context": "https://schema.org",
    "@type": "SoftwareSourceCode",
    "@id": `${url}#project`,
    "name": work.title,
    "description": work.summary,
    "url": url,
    "inLanguage": "zh-CN",
    "isPartOf": {
      "@id": WEBSITE_ID,
    },
    "publisher": {
      "@id": PERSON_ID,
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": url,
    },
  };

  if (work.repoUrl) {
    schema.codeRepository = work.repoUrl;
  }
  if (programmingLanguages.length > 0) {
    schema.programmingLanguage = programmingLanguages;
  }
  if (runtimePlatforms.length > 0) {
    schema.runtimePlatform = runtimePlatforms;
  }

  return schema;
}
