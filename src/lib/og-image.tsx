import type { ReactNode } from "react";
import { siteConfig } from "@/lib/site-config";

export const OG_SANS_FONT = '"Noto Sans SC", sans-serif';
export const OG_MONO_FONT = '"JetBrains Mono", "Noto Sans SC", monospace';
export const OG_EMERALD = "#34d399";

export const openGraphImageSize = {
  width: 1200,
  height: 630,
} as const;

export const openGraphImage = {
  url: "/og.png",
  ...openGraphImageSize,
  type: "image/png",
  alt: "青空 · QingKong — 探索 AI 前沿 · 不断求索",
} as const;

export function createSocialImage(url: string, alt: string) {
  return {
    ...openGraphImage,
    url,
    alt,
  };
}

function getCharVisualWidth(char: string): number {
  if (char === " ") return 0.28;
  if (/^[\u2e80-\u9fff\uf900-\ufaff\u3000-\u303f\uff00-\uffef]$/.test(char)) {
    return 1;
  }
  if (/^[WMGOQ]$/.test(char)) return 0.68;
  if (/^[A-Z0-9]$/.test(char)) return 0.58;
  if (/^[iltfjr.,:;!'`|\[\]()/\\-]$/.test(char)) return 0.36;
  return 0.54;
}

export function measureVisualWidth(text: string): number {
  let total = 0;
  for (const char of text) {
    total += getCharVisualWidth(char);
  }
  return total;
}

function tokenize(text: string) {
  return text.split(/(\s+)/).flatMap((part) => {
    if (!part) return [];
    if (/^\s+$/.test(part)) return [" "];
    return (
      part.match(
        /[\u3000-\u303f\uff00-\uffef]|[\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff]|[^\s\u3000-\u303f\uff00-\uffef\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff]+/g,
      ) ?? []
    );
  });
}

function truncateToVisualWidth(text: string, maxUnits: number): string {
  const chars = Array.from(text);
  let width = 0;
  let end = 0;
  const target = Math.max(1, maxUnits - 1);

  for (const char of chars) {
    const nextWidth = width + getCharVisualWidth(char);
    if (nextWidth > target) break;
    width = nextWidth;
    end += 1;
  }

  return `${chars.slice(0, end).join("").trimEnd()}…`;
}

export function wrapOgText(text: string, maxUnits: number, maxLines: number): string[] {
  const normalized = text.replace(/\s+/g, " ").trim();
  if (!normalized) return [];

  const lines: string[] = [];
  let current = "";
  let currentWidth = 0;
  let pendingSpace = false;

  for (const token of tokenize(normalized)) {
    if (token === " ") {
      pendingSpace = current.length > 0;
      continue;
    }

    const tokenWidth = measureVisualWidth(token);
    const spaceWidth = current && pendingSpace ? 0.28 : 0;
    const isLineStartBlocked = /^[，。、：；！？）》」】….,:;!?)\]]+$/.test(token);

    if (!isLineStartBlocked && current && currentWidth + spaceWidth + tokenWidth > maxUnits) {
      lines.push(current.trimEnd());
      current = "";
      currentWidth = 0;
      pendingSpace = false;
    }

    if (!current && tokenWidth > maxUnits) {
      let chunk = "";
      let chunkWidth = 0;
      for (const char of Array.from(token)) {
        const w = getCharVisualWidth(char);
        if (chunk && chunkWidth + w > maxUnits) {
          lines.push(chunk);
          chunk = char;
          chunkWidth = w;
        } else {
          chunk += char;
          chunkWidth += w;
        }
      }
      current = chunk;
      currentWidth = chunkWidth;
      pendingSpace = false;
      continue;
    }

    const sep = current && pendingSpace ? " " : "";
    current += `${sep}${token}`;
    currentWidth += (sep ? 0.28 : 0) + tokenWidth;
    pendingSpace = false;
  }

  if (current) {
    lines.push(current.trimEnd());
  }

  if (lines.length <= maxLines) return lines;

  const visible = lines.slice(0, maxLines);
  visible[maxLines - 1] = truncateToVisualWidth(visible[maxLines - 1], maxUnits);
  return visible;
}

export function OgBrandMark({
  size = 24,
  accent = OG_EMERALD,
}: {
  size?: number;
  accent?: string;
}) {
  return (
    <svg width={size} height={size} viewBox="55 55 250 250">
      <path
        fillRule="evenodd"
        fill="#fafafa"
        d="M123 55H231A70 70 0 0 1 299 123V231A70 70 0 0 1 231 299H123A70 70 0 0 1 55 231V123A70 70 0 0 1 123 55ZM239 177A62 62 0 1 1 115 177A62 62 0 1 1 239 177Z"
      />
      <rect x="228" y="228" width="77" height="77" rx="6" fill={accent} />
    </svg>
  );
}

export function OgBadge({
  accent,
  label,
}: {
  accent: string;
  label: string;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "8px 16px",
        borderRadius: 9999,
        border: `1px solid ${accent}44`,
        background: `${accent}14`,
        color: accent,
        fontFamily: OG_MONO_FONT,
        fontSize: 15,
        fontWeight: 700,
        letterSpacing: "0.1em",
      }}
    >
      <div
        style={{
          width: 8,
          height: 8,
          display: "flex",
          borderRadius: "50%",
          background: accent,
        }}
      />
      <span>{label}</span>
    </div>
  );
}

export function OgPill({
  label,
  muted = false,
}: {
  label: string;
  muted?: boolean;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        padding: "7px 14px",
        borderRadius: 10,
        border: "1px solid rgba(255, 255, 255, 0.11)",
        background: muted ? "rgba(255, 255, 255, 0.02)" : "rgba(255, 255, 255, 0.045)",
        color: muted ? "#a1a1aa" : "#e4e4e7",
        fontFamily: OG_MONO_FONT,
        fontSize: 16,
      }}
    >
      {label}
    </div>
  );
}

export function OgFooter({
  accent,
  secondary,
}: {
  accent: string;
  secondary?: string;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        borderTop: "1px solid rgba(255, 255, 255, 0.09)",
        paddingTop: 22,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <OgBrandMark size={24} accent={accent} />
        <span
          style={{
            fontSize: 19,
            fontWeight: 700,
            color: "#f4f4f5",
            letterSpacing: "-0.01em",
          }}
        >
          {siteConfig.displayName}
        </span>
        {secondary ? (
          <span
            style={{
              fontFamily: OG_MONO_FONT,
              fontSize: 16,
              color: "#71717a",
            }}
          >
            {`· ${secondary}`}
          </span>
        ) : null}
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          fontFamily: OG_MONO_FONT,
          fontSize: 17,
          color: "#a1a1aa",
        }}
      >
        <span>{siteConfig.domain}</span>
      </div>
    </div>
  );
}

function OgBackgroundGrid({ accent }: { accent: string }) {
  const verticalLines = [180, 360, 540, 720, 900, 1020];
  const horizontalLines = [140, 280, 420, 520];

  return (
    <svg
      width="1200"
      height="630"
      viewBox="0 0 1200 630"
      style={{
        position: "absolute",
        top: 0,
        left: 0,
      }}
    >
      {verticalLines.map((x) => (
        <line
          key={`v-${x}`}
          x1={x}
          y1="0"
          x2={x}
          y2="630"
          stroke="rgba(255,255,255,0.035)"
          strokeWidth="1"
        />
      ))}
      {horizontalLines.map((y) => (
        <line
          key={`h-${y}`}
          x1="0"
          y1={y}
          x2="1200"
          y2={y}
          stroke="rgba(255,255,255,0.035)"
          strokeWidth="1"
        />
      ))}
      {[
        [180, 140],
        [540, 280],
        [900, 140],
        [900, 420],
        [360, 420],
      ].map(([cx, cy]) => (
        <g key={`c-${cx}-${cy}`} stroke={accent} strokeOpacity="0.22" strokeWidth="1">
          <line x1={cx - 6} y1={cy} x2={cx + 6} y2={cy} />
          <line x1={cx} y1={cy - 6} x2={cx} y2={cy + 6} />
        </g>
      ))}
    </svg>
  );
}

export function OgCanvas({
  accent,
  motif,
  children,
}: {
  accent: string;
  motif?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        position: "relative",
        overflow: "hidden",
        padding: "58px 72px",
        background: "#09090b",
        color: "#fafafa",
        fontFamily: OG_SANS_FONT,
      }}
    >
      <OgBackgroundGrid accent={accent} />

      <div
        style={{
          position: "absolute",
          top: -190,
          right: -130,
          width: 600,
          height: 600,
          display: "flex",
          borderRadius: "50%",
          background: `radial-gradient(circle, ${accent}22 0%, ${accent}08 42%, transparent 72%)`,
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: -240,
          left: -140,
          width: 480,
          height: 480,
          display: "flex",
          borderRadius: "50%",
          background: `radial-gradient(circle, ${accent}10 0%, transparent 70%)`,
        }}
      />

      {motif}

      {children}
    </div>
  );
}

function HomeSignalPanel({
  postCount,
  workCount,
}: {
  postCount: number;
  workCount: number;
}) {
  return (
    <div
      style={{
        width: 316,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        borderRadius: 20,
        border: "1px solid rgba(255, 255, 255, 0.09)",
        background: "rgba(17, 17, 19, 0.86)",
        padding: 22,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          fontFamily: OG_MONO_FONT,
          fontSize: 12,
          color: "#71717a",
          letterSpacing: "0.08em",
        }}
      >
        <span>SIGNAL_FIELD</span>
        <span style={{ color: OG_EMERALD }}>ACTIVE</span>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginTop: 14,
          marginBottom: 14,
        }}
      >
        <svg width="268" height="176" viewBox="0 0 268 176">
          <circle
            cx="154"
            cy="88"
            r="68"
            fill="none"
            stroke="rgba(52, 211, 153, 0.16)"
            strokeWidth="1"
            strokeDasharray="4 5"
          />
          <circle
            cx="154"
            cy="88"
            r="42"
            fill="none"
            stroke="rgba(52, 211, 153, 0.24)"
            strokeWidth="1"
          />
          <line x1="20" y1="88" x2="248" y2="88" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
          <line x1="154" y1="12" x2="154" y2="164" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />

          <path
            d="M 28 134 H 76 V 96 H 124 V 54 H 188 V 88 H 224"
            fill="none"
            stroke={OG_EMERALD}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="76" cy="96" r="3" fill={OG_EMERALD} />
          <circle cx="124" cy="54" r="3" fill={OG_EMERALD} />
          <circle cx="188" cy="88" r="3" fill={OG_EMERALD} />
          <rect x="218" y="82" width="12" height="12" rx="3" fill={OG_EMERALD} />
          <rect x="22" y="128" width="10" height="10" rx="2" fill="rgba(52,211,153,0.45)" />
        </svg>
      </div>

      <div
        style={{
          display: "flex",
          borderTop: "1px solid rgba(255, 255, 255, 0.08)",
          paddingTop: 14,
          gap: 18,
        }}
      >
        <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
          <span
            style={{
              fontFamily: OG_MONO_FONT,
              fontSize: 11,
              color: "#71717a",
              letterSpacing: "0.08em",
            }}
          >
            ARTICLES
          </span>
          <span
            style={{
              marginTop: 4,
              fontFamily: OG_MONO_FONT,
              fontSize: 24,
              fontWeight: 700,
              color: "#fafafa",
            }}
          >
            {String(postCount).padStart(2, "0")}
          </span>
        </div>
        <div
          style={{
            width: 1,
            display: "flex",
            background: "rgba(255, 255, 255, 0.08)",
          }}
        />
        <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
          <span
            style={{
              fontFamily: OG_MONO_FONT,
              fontSize: 11,
              color: "#71717a",
              letterSpacing: "0.08em",
            }}
          >
            WORKS
          </span>
          <span
            style={{
              marginTop: 4,
              fontFamily: OG_MONO_FONT,
              fontSize: 24,
              fontWeight: 700,
              color: OG_EMERALD,
            }}
          >
            {String(workCount).padStart(2, "0")}
          </span>
        </div>
      </div>
    </div>
  );
}

export function createHomeOgImage({
  postCount,
  workCount,
}: {
  postCount: number;
  workCount: number;
}) {
  return (
    <OgCanvas accent={OG_EMERALD}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <OgBadge accent={OG_EMERALD} label="PERSONAL BLOG · 个人空间" />
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            fontFamily: OG_MONO_FONT,
            fontSize: 16,
            color: "#a1a1aa",
          }}
        >
          <span>{siteConfig.location}</span>
          <span style={{ color: "#52525b" }}>/</span>
          <span>{siteConfig.xHandle}</span>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 44,
        }}
      >
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              fontSize: 70,
              fontWeight: 700,
              letterSpacing: "-0.045em",
              lineHeight: 1.08,
            }}
          >
            <span style={{ color: "#fafafa" }}>青空 ·&nbsp;</span>
            <span style={{ color: OG_EMERALD }}>{siteConfig.name}</span>
          </div>

          <div
            style={{
              display: "flex",
              marginTop: 20,
              fontSize: 27,
              color: "#d4d4d8",
              lineHeight: 1.45,
            }}
          >
            {siteConfig.role}
          </div>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 10,
              marginTop: 30,
            }}
          >
            <OgPill label="AI Agent" />
            <OgPill label="Software Engineering" />
            <OgPill label="Go · TypeScript · React" muted />
          </div>
        </div>

        <HomeSignalPanel postCount={postCount} workCount={workCount} />
      </div>

      <OgFooter accent={OG_EMERALD} secondary="Notes, projects & experiments" />
    </OgCanvas>
  );
}

export function getHomeOgText({
  postCount,
  workCount,
}: {
  postCount: number;
  workCount: number;
}) {
  return [
    "PERSONAL BLOG · 个人空间",
    siteConfig.location,
    siteConfig.xHandle,
    siteConfig.displayName,
    siteConfig.role,
    "AI Agent Software Engineering Go TypeScript React",
    "SIGNAL_FIELD ACTIVE ARTICLES WORKS",
    String(postCount).padStart(2, "0"),
    String(workCount).padStart(2, "0"),
    "Notes, projects & experiments",
    siteConfig.domain,
  ].join(" ");
}

export interface SectionOgProps {
  eyebrow: string;
  meta: string;
  title: string;
  description: string;
  pills: string[];
  accent?: string;
}

export function createSectionOgImage({
  eyebrow,
  meta,
  title,
  description,
  pills,
  accent = OG_EMERALD,
}: SectionOgProps) {
  const descriptionLines = wrapOgText(description, 32, 2);

  const motif = (
    <svg
      width="320"
      height="320"
      viewBox="0 0 360 360"
      style={{
        position: "absolute",
        top: 88,
        right: 36,
        opacity: 0.2,
      }}
    >
      <circle cx="210" cy="170" r="118" fill="none" stroke={accent} strokeWidth="1.2" strokeDasharray="5 6" />
      <circle cx="210" cy="170" r="74" fill="none" stroke={accent} strokeWidth="1.2" />
      <line x1="60" y1="170" x2="340" y2="170" stroke={accent} strokeWidth="1" />
      <line x1="210" y1="24" x2="210" y2="316" stroke={accent} strokeWidth="1" />
      <circle cx="210" cy="170" r="5" fill={accent} />
    </svg>
  );

  return (
    <OgCanvas accent={accent} motif={motif}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <OgBadge accent={accent} label={eyebrow} />
        <div
          style={{
            display: "flex",
            fontFamily: OG_MONO_FONT,
            fontSize: 17,
            color: "#a1a1aa",
          }}
        >
          {meta}
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", maxWidth: 820 }}>
        <div
          style={{
            display: "flex",
            fontSize: 64,
            fontWeight: 700,
            letterSpacing: "-0.04em",
            lineHeight: 1.15,
            color: "#fafafa",
          }}
        >
          {title}
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            marginTop: 22,
            fontSize: 25,
            lineHeight: 1.55,
            color: "#a1a1aa",
          }}
        >
          {descriptionLines.map((line, index) => (
            <div key={`${line}-${index}`} style={{ display: "flex" }}>
              {line}
            </div>
          ))}
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 28 }}>
          {pills.map((pill) => (
            <OgPill key={pill} label={pill} />
          ))}
        </div>
      </div>

      <OgFooter accent={accent} secondary={siteConfig.xHandle} />
    </OgCanvas>
  );
}

export function getSectionOgText({
  eyebrow,
  meta,
  title,
  description,
  pills,
}: SectionOgProps) {
  return [
    eyebrow,
    meta,
    title,
    description,
    pills.join(" "),
    siteConfig.displayName,
    siteConfig.xHandle,
    siteConfig.domain,
    "…",
  ].join(" ");
}
