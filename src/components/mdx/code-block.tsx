"use client";

import { useState, useRef, type ComponentPropsWithoutRef } from "react";
import { Check, Copy } from "lucide-react";

export function CodeBlock({
  children,
  className,
  ...props
}: ComponentPropsWithoutRef<"pre">) {
  const preRef = useRef<HTMLPreElement>(null);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const text = preRef.current?.innerText ?? "";
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // Ignore clipboard failures in restricted environments
    }
  };

  return (
    <div className="group relative my-6 overflow-hidden rounded-xl border border-zinc-200 bg-zinc-50/90 dark:border-zinc-800 dark:bg-[#111113]">
      <button
        type="button"
        onClick={handleCopy}
        aria-label="复制代码"
        className="absolute right-3 top-3 z-10 inline-flex items-center gap-1 rounded-md border border-zinc-200 bg-white/90 px-2 py-1 text-xs font-medium text-zinc-600 opacity-0 backdrop-blur transition hover:text-zinc-950 focus:opacity-100 group-hover:opacity-100 dark:border-zinc-700 dark:bg-zinc-900/90 dark:text-zinc-300 dark:hover:text-white"
      >
        {copied ? (
          <>
            <Check className="h-3.5 w-3.5 text-emerald-500" />
            <span>已复制</span>
          </>
        ) : (
          <>
            <Copy className="h-3.5 w-3.5" />
            <span>复制</span>
          </>
        )}
      </button>
      <pre
        ref={preRef}
        className={`overflow-x-auto p-4 text-sm leading-relaxed font-mono ${className ?? ""}`}
        {...props}
      >
        {children}
      </pre>
    </div>
  );
}
