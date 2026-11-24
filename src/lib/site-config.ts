export type LinktreeIconName =
  | "github"
  | "mail"
  | "globe"
  | "twitter"
  | "qq"
  | "book"
  | "code"
  | "rss";

export interface LinktreeItem {
  title: string;
  subtitle: string;
  href?: string;
  copyText?: string;
  icon: LinktreeIconName;
  external?: boolean;
}

export type TechIconId =
  | "js-ts"
  | "golang"
  | "cpp"
  | "python"
  | "react"
  | "gin"
  | "electron";

export interface TechStackItem {
  name: string;
  icon: TechIconId;
}

export interface TechStackGroup {
  id: string;
  label: string;
  labelEn: string;
  items: readonly TechStackItem[];
}

export const siteConfig = {
  name: "QingKong",
  displayName: "青空 · QingKong",
  handle: "@QingKong996",
  xHandle: "@QingKong007",
  domain: "qingkong996.com",
  url: "https://qingkong996.com",
  repoUrl: "https://github.com/QingKong996/QingKong996.github.io",
  repoName: "QingKong996/QingKong996.github.io",
  licenseName: "CC BY-NC 4.0",
  licenseUrl: "https://creativecommons.org/licenses/by-nc/4.0/deed.zh-hans",
  role: "探索 AI 前沿 · 不断求索",
  location: "中国广东深圳",
  techStack: [
    {
      id: "languages",
      label: "编程语言",
      labelEn: "Languages",
      items: [
        { name: "JS / TS", icon: "js-ts" },
        { name: "Golang", icon: "golang" },
        { name: "C / C++", icon: "cpp" },
        { name: "Python", icon: "python" },
      ],
    },
    {
      id: "frameworks",
      label: "框架与平台",
      labelEn: "Frameworks & Runtime",
      items: [
        { name: "React", icon: "react" },
        { name: "Gin", icon: "gin" },
        { name: "Electron", icon: "electron" },
      ],
    },
  ] satisfies readonly TechStackGroup[],
  linktree: [
    {
      title: "GitHub",
      subtitle: "github.com/QingKong996",
      href: "https://github.com/QingKong996",
      icon: "github",
      external: true,
    },
    {
      title: "X / Twitter",
      subtitle: "@QingKong007",
      href: "https://x.com/QingKong007",
      icon: "twitter",
      external: true,
    },
    {
      title: "Gmail",
      subtitle: "qingkong996@gmail.com",
      href: "mailto:qingkong996@gmail.com",
      icon: "mail",
      external: false,
    },
    {
      title: "QQ 邮箱",
      subtitle: "3395448530@qq.com",
      href: "mailto:3395448530@qq.com",
      icon: "mail",
      external: false,
    },
    {
      title: "QQ",
      subtitle: "3395448530 · 点击复制",
      copyText: "3395448530",
      icon: "qq",
    },
  ] satisfies LinktreeItem[],
} as const;
