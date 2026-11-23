import type { MDXComponents } from "mdx/types";
import type { ReactNode } from "react";
import Link from "next/link";
import { Info, Lightbulb, AlertTriangle } from "lucide-react";
import { CodeBlock } from "./code-block";

interface CalloutProps {
  type?: "info" | "tip" | "warning";
  title?: string;
  children: ReactNode;
}

export function Callout({ type = "info", title, children }: CalloutProps) {
  const styles = {
    info: {
      box: "border-l-2 border-zinc-400 bg-zinc-100/80 text-zinc-800 dark:border-zinc-500 dark:bg-zinc-900/70 dark:text-zinc-200",
      icon: <Info className="mt-0.5 h-4 w-4 shrink-0 text-zinc-600 dark:text-zinc-300" />,
      defaultTitle: "说明",
    },
    tip: {
      box: "border-l-2 border-emerald-500 bg-emerald-500/8 text-zinc-800 dark:border-emerald-400 dark:bg-emerald-400/10 dark:text-zinc-200",
      icon: (
        <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
      ),
      defaultTitle: "提示",
    },
    warning: {
      box: "border-l-2 border-amber-500 bg-amber-500/8 text-zinc-800 dark:border-amber-400 dark:bg-amber-400/10 dark:text-zinc-200",
      icon: (
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
      ),
      defaultTitle: "注意",
    },
  }[type];

  return (
    <aside className={`my-6 flex gap-3 rounded-r-xl px-4 py-3.5 text-sm leading-relaxed ${styles.box}`}>
      {styles.icon}
      <div className="min-w-0 flex-1 space-y-1">
        <p className="font-semibold text-zinc-950 dark:text-zinc-50">
          {title ?? styles.defaultTitle}
        </p>
        <div className="text-zinc-700 dark:text-zinc-300 [&>p]:my-1">{children}</div>
      </div>
    </aside>
  );
}

export function TechBadge({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center font-mono text-xs font-medium text-emerald-600 dark:text-emerald-400">
      #{children}
    </span>
  );
}

export function MetricGrid({ children }: { children: ReactNode }) {
  return (
    <div className="my-8 grid grid-cols-1 divide-y divide-zinc-200 border-y border-zinc-200 sm:grid-cols-3 sm:divide-x sm:divide-y-0 dark:divide-zinc-800 dark:border-zinc-800">
      {children}
    </div>
  );
}

export function MetricCard({
  label,
  value,
  note,
}: {
  label: string;
  value: string;
  note?: string;
}) {
  return (
    <div className="py-4 sm:px-5 sm:first:pl-0 sm:last:pr-0">
      <p className="font-mono text-[11px] uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
        {label}
      </p>
      <p className="mt-1.5 font-mono text-xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
        {value}
      </p>
      {note ? <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{note}</p> : null}
    </div>
  );
}

export const mdxComponents: MDXComponents = {
  Callout,
  TechBadge,
  MetricGrid,
  MetricCard,
  h1: ({ children, ...props }) => (
    <h1
      className="mt-10 mb-4 scroll-mt-24 text-3xl font-bold tracking-tight text-zinc-950 first:mt-0 dark:text-zinc-50"
      {...props}
    >
      {children}
    </h1>
  ),
  h2: ({ children, ...props }) => (
    <h2
      className="mt-10 mb-3 scroll-mt-24 border-b border-zinc-200 pb-2 text-2xl font-semibold tracking-tight text-zinc-950 dark:border-zinc-800 dark:text-zinc-50"
      {...props}
    >
      {children}
    </h2>
  ),
  h3: ({ children, ...props }) => (
    <h3
      className="mt-8 mb-3 scroll-mt-24 text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100"
      {...props}
    >
      {children}
    </h3>
  ),
  h4: ({ children, ...props }) => (
    <h4
      className="mt-6 mb-2 scroll-mt-24 text-base font-semibold text-zinc-900 dark:text-zinc-100"
      {...props}
    >
      {children}
    </h4>
  ),
  p: ({ children, ...props }) => (
    <p className="my-4 leading-[1.8] text-zinc-700 dark:text-zinc-300" {...props}>
      {children}
    </p>
  ),
  a: ({ href = "", children, ...props }) => {
    const isExternal = href.startsWith("http://") || href.startsWith("https://");
    const className =
      "font-medium text-zinc-950 underline decoration-emerald-500/60 underline-offset-4 transition hover:decoration-emerald-500 dark:text-zinc-100 dark:decoration-emerald-400/60 dark:hover:decoration-emerald-400";

    if (isExternal) {
      return (
        <a href={href} target="_blank" rel="noopener noreferrer" className={className} {...props}>
          {children}
        </a>
      );
    }

    if (href.startsWith("/")) {
      return (
        <Link href={href} className={className} {...props}>
          {children}
        </Link>
      );
    }

    return (
      <a href={href} className={className} {...props}>
        {children}
      </a>
    );
  },
  ul: ({ children, ...props }) => (
    <ul
      className="my-4 list-disc space-y-2 pl-6 text-zinc-700 marker:text-emerald-600/75 dark:text-zinc-300 dark:marker:text-emerald-400/75"
      {...props}
    >
      {children}
    </ul>
  ),
  ol: ({ children, ...props }) => (
    <ol
      className="my-4 list-decimal space-y-2 pl-6 text-zinc-700 marker:text-zinc-500 dark:text-zinc-300 dark:marker:text-zinc-400"
      {...props}
    >
      {children}
    </ol>
  ),
  li: ({ children, ...props }) => (
    <li className="leading-[1.75]" {...props}>
      {children}
    </li>
  ),
  blockquote: ({ children, ...props }) => (
    <blockquote
      className="my-6 border-l-2 border-emerald-500/70 pl-4 italic text-zinc-600 dark:border-emerald-400/70 dark:text-zinc-400"
      {...props}
    >
      {children}
    </blockquote>
  ),
  hr: (props) => <hr className="my-8 border-zinc-200 dark:border-zinc-800" {...props} />,
  table: ({ children, ...props }) => (
    <div className="my-6 overflow-x-auto border-y border-zinc-200 dark:border-zinc-800">
      <table className="w-full border-collapse text-left text-sm" {...props}>
        {children}
      </table>
    </div>
  ),
  thead: ({ children, ...props }) => (
    <thead className="border-b border-zinc-200 text-zinc-900 dark:border-zinc-800 dark:text-zinc-100" {...props}>
      {children}
    </thead>
  ),
  tr: ({ children, ...props }) => (
    <tr className="border-b border-zinc-200/70 last:border-b-0 dark:border-zinc-800/70" {...props}>
      {children}
    </tr>
  ),
  th: ({ children, ...props }) => (
    <th className="px-3 py-2.5 font-semibold" {...props}>
      {children}
    </th>
  ),
  td: ({ children, ...props }) => (
    <td className="px-3 py-2.5 text-zinc-700 dark:text-zinc-300" {...props}>
      {children}
    </td>
  ),
  pre: CodeBlock,
  code: ({ children, className, ...props }) => {
    const isCodeBlock = Boolean(className) || "data-language" in props || "data-theme" in props;
    if (isCodeBlock) {
      return (
        <code className={className} {...props}>
          {children}
        </code>
      );
    }
    return (
      <code
        className="rounded bg-zinc-100 px-1.5 py-0.5 font-mono text-[0.875em] text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100"
        {...props}
      >
        {children}
      </code>
    );
  },
  img: ({ alt = "", ...props }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img alt={alt} className="my-6 rounded-xl" {...props} />
  ),
};
