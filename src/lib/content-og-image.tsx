import type { PostEntry, WorkAccent, WorkEntry } from "@/lib/content";
import {
  measureVisualWidth,
  OG_EMERALD,
  OG_MONO_FONT,
  OgBadge,
  OgCanvas,
  OgFooter,
  OgPill,
  wrapOgText,
} from "@/lib/og-image";
import { siteConfig } from "@/lib/site-config";

const WORK_ACCENTS: Record<WorkAccent, string> = {
  emerald: "#34d399",
  sky: "#38bdf8",
  amber: "#fbbf24",
  violet: "#a78bfa",
  rose: "#fb7185",
  slate: "#94a3b8",
};

function getTitleLayout(title: string) {
  const width = measureVisualWidth(title);
  if (width > 34) return { fontSize: 40, maxUnits: 20.5, maxLines: 3 };
  if (width > 22) return { fontSize: 46, maxUnits: 18, maxLines: 3 };
  if (width > 14) return { fontSize: 52, maxUnits: 15.5, maxLines: 2 };
  return { fontSize: 62, maxUnits: 14, maxLines: 2 };
}

function ArticleBlueprintSvg({ accent }: { accent: string }) {
  return (
    <svg
      width="320"
      height="320"
      viewBox="0 0 340 340"
      style={{
        position: "absolute",
        top: 88,
        right: 36,
        opacity: 0.19,
      }}
    >
      <circle
        cx="204"
        cy="154"
        r="112"
        fill="none"
        stroke={accent}
        strokeWidth="1.2"
        strokeDasharray="5 6"
      />
      <circle cx="204" cy="154" r="68" fill="none" stroke={accent} strokeWidth="1.2" />
      <line x1="68" y1="154" x2="328" y2="154" stroke={accent} strokeWidth="1" />
      <line x1="204" y1="18" x2="204" y2="290" stroke={accent} strokeWidth="1" />
      <path
        d="M 88 224 H 146 V 188 H 204 V 154"
        fill="none"
        stroke={accent}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="204" cy="154" r="4.5" fill={accent} />
      <rect x="82" y="218" width="10" height="10" rx="2" fill={accent} />
    </svg>
  );
}

function WorkBlueprintSvg({ accentKey, color }: { accentKey: WorkAccent; color: string }) {
  if (accentKey === "sky") {
    return (
      <svg
        width="360"
        height="260"
        viewBox="0 0 360 260"
        style={{
          position: "absolute",
          top: 68,
          right: 34,
          opacity: 0.26,
        }}
      >
        <path
          d="M 28 190 H 126 L 166 132 H 254 L 288 86 H 338"
          fill="none"
          stroke={color}
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M 28 144 H 338"
          fill="none"
          stroke={color}
          strokeWidth="1"
          strokeDasharray="4 6"
        />
        <path
          d="M 90 86 H 210 L 238 114 H 338"
          fill="none"
          stroke={color}
          strokeWidth="1.2"
          strokeOpacity="0.65"
        />
        <circle cx="166" cy="132" r="5" fill={color} />
        <circle cx="288" cy="86" r="5" fill={color} />
        <rect x="22" y="184" width="10" height="10" rx="2" fill={color} />
      </svg>
    );
  }

  if (accentKey === "violet") {
    return (
      <svg
        width="360"
        height="260"
        viewBox="0 0 360 260"
        style={{
          position: "absolute",
          top: 68,
          right: 34,
          opacity: 0.26,
        }}
      >
        <path
          d="M 24 140 C 84 48, 134 224, 194 128 C 254 32, 294 202, 344 106"
          fill="none"
          stroke={color}
          strokeWidth="2.2"
          strokeLinecap="round"
        />
        <path
          d="M 24 188 H 344"
          fill="none"
          stroke={color}
          strokeWidth="1"
          strokeDasharray="3 6"
        />
        <circle cx="194" cy="128" r="4.5" fill={color} />
      </svg>
    );
  }

  if (accentKey === "amber") {
    return (
      <svg
        width="340"
        height="240"
        viewBox="0 0 340 240"
        style={{
          position: "absolute",
          top: 72,
          right: 38,
          opacity: 0.26,
        }}
      >
        <path
          d="M 148 74 L 182 108 L 148 142"
          fill="none"
          stroke={color}
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M 204 142 H 294"
          fill="none"
          stroke={color}
          strokeWidth="3"
          strokeLinecap="round"
        />
        <path
          d="M 110 184 H 312"
          fill="none"
          stroke={color}
          strokeWidth="1.2"
          strokeDasharray="4 6"
        />
      </svg>
    );
  }

  return <ArticleBlueprintSvg accent={color} />;
}

export function createPostOgImage(post: PostEntry) {
  const titleLayout = getTitleLayout(post.title);
  const titleLines = wrapOgText(post.title, titleLayout.maxUnits, titleLayout.maxLines);
  const descriptionLines = wrapOgText(post.description, 35, 3);

  return (
    <OgCanvas accent={OG_EMERALD} motif={<ArticleBlueprintSvg accent={OG_EMERALD} />}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <OgBadge accent={OG_EMERALD} label="ARTICLE · 文章" />
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            fontFamily: OG_MONO_FONT,
            fontSize: 17,
            color: "#a1a1aa",
          }}
        >
          <span>{post.date}</span>
          <span style={{ color: "#52525b" }}>·</span>
          <span>约 {post.readingTimeMinutes} 分钟阅读</span>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          maxWidth: 960,
        }}
      >
        <div style={{ display: "flex", flexDirection: "column" }}>
          {titleLines.map((line, index) => (
            <div
              key={`${line}-${index}`}
              style={{
                display: "flex",
                fontSize: titleLayout.fontSize,
                fontWeight: 700,
                letterSpacing: "-0.04em",
                lineHeight: 1.18,
                color: "#fafafa",
              }}
            >
              {line}
            </div>
          ))}
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            marginTop: 22,
            color: "#a1a1aa",
            fontSize: 23,
            lineHeight: 1.56,
          }}
        >
          {descriptionLines.map((line, index) => (
            <div key={`${line}-${index}`} style={{ display: "flex" }}>
              {line}
            </div>
          ))}
        </div>
      </div>

      <OgFooter accent={OG_EMERALD} secondary={siteConfig.xHandle} />
    </OgCanvas>
  );
}

export function createWorkOgImage(work: WorkEntry) {
  const accentColor = WORK_ACCENTS[work.accent] ?? WORK_ACCENTS.emerald;
  const titleLayout = getTitleLayout(work.title);
  const titleLines = wrapOgText(work.title, titleLayout.maxUnits, 2);
  const summaryLines = wrapOgText(work.summary, 35, 3);
  const techPills = work.techStack.slice(0, 5);
  const repoLabel = work.repoUrl
    ? work.repoUrl.replace(/^https?:\/\//, "").replace(/\/$/, "")
    : siteConfig.xHandle;

  return (
    <OgCanvas
      accent={accentColor}
      motif={<WorkBlueprintSvg accentKey={work.accent} color={accentColor} />}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <OgBadge accent={accentColor} label={`${work.status} · ${work.category}`} />
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            fontFamily: OG_MONO_FONT,
            fontSize: 17,
            color: "#a1a1aa",
          }}
        >
          <span style={{ color: "#71717a" }}>PROJECT</span>
          <span style={{ color: "#52525b" }}>{"//"}</span>
          <span>{work.year}</span>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          maxWidth: 960,
        }}
      >
        <div style={{ display: "flex", flexDirection: "column" }}>
          {titleLines.map((line, index) => (
            <div
              key={`${line}-${index}`}
              style={{
                display: "flex",
                fontSize: titleLayout.fontSize,
                fontWeight: 700,
                letterSpacing: "-0.04em",
                lineHeight: 1.15,
                color: "#fafafa",
              }}
            >
              {line}
            </div>
          ))}
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            marginTop: 18,
            color: "#a1a1aa",
            fontSize: 23,
            lineHeight: 1.56,
          }}
        >
          {summaryLines.map((line, index) => (
            <div key={`${line}-${index}`} style={{ display: "flex" }}>
              {line}
            </div>
          ))}
        </div>

        {techPills.length > 0 ? (
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 10,
              marginTop: 24,
            }}
          >
            {techPills.map((tech) => (
              <OgPill key={tech} label={tech} />
            ))}
          </div>
        ) : null}
      </div>

      <OgFooter accent={accentColor} secondary={repoLabel} />
    </OgCanvas>
  );
}

export function getPostOgText(post: PostEntry) {
  return [
    "ARTICLE · 文章",
    post.title,
    post.description,
    post.date,
    `约 ${post.readingTimeMinutes} 分钟阅读`,
    siteConfig.displayName,
    siteConfig.xHandle,
    siteConfig.domain,
    "…",
  ].join(" ");
}

export function getWorkOgText(work: WorkEntry) {
  return [
    "PROJECT //",
    work.title,
    work.summary,
    work.year,
    work.category,
    work.status,
    work.techStack.slice(0, 5).join(" "),
    work.repoUrl ? work.repoUrl.replace(/^https?:\/\//, "").replace(/\/$/, "") : "",
    siteConfig.displayName,
    siteConfig.xHandle,
    siteConfig.domain,
    "…",
  ].join(" ");
}
