export interface OgFont {
  name: string;
  data: ArrayBuffer;
  weight: 400 | 700;
  style: "normal";
}

const NOTO_SANS_SC_URL =
  "https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;700&text=";
const JETBRAINS_MONO_URL =
  "https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&text=";

const fontCache = new Map<string, Promise<OgFont[]>>();

function parseFontUrls(css: string) {
  return [
    ...css.matchAll(/src:\s*url\((https:\/\/[^)]+)\)\s*format\('(?:truetype|woff)'\)/g),
  ].map((match) => match[1]);
}

async function fetchFontFamily(
  name: string,
  baseUrl: string,
  text: string,
): Promise<OgFont[]> {
  const cssResponse = await fetch(`${baseUrl}${encodeURIComponent(text)}`, {
    cache: "force-cache",
  });
  if (!cssResponse.ok) {
    throw new Error(`Failed to load ${name} font CSS: ${cssResponse.status}`);
  }

  const urls = parseFontUrls(await cssResponse.text());
  if (urls.length < 2) {
    throw new Error(`${name} font CSS did not include both regular and bold fonts`);
  }

  const [regular, bold] = await Promise.all(
    urls.slice(0, 2).map(async (url) => {
      const response = await fetch(url, { cache: "force-cache" });
      if (!response.ok) {
        throw new Error(`Failed to load ${name} font: ${response.status}`);
      }
      return response.arrayBuffer();
    }),
  );

  return [
    { name, data: regular, weight: 400, style: "normal" },
    { name, data: bold, weight: 700, style: "normal" },
  ];
}

export function loadOgFonts(text: string): Promise<OgFont[]> {
  const uniqueChars = [...new Set(text)].sort().join("");
  const asciiChars = [...new Set(text.match(/[\x20-\x7e]/g) ?? [])].sort().join("");
  const cacheKey = `${uniqueChars}::${asciiChars}`;
  const cached = fontCache.get(cacheKey);
  if (cached) return cached;

  const request = (async () => {
    const notoPromise = fetchFontFamily("Noto Sans SC", NOTO_SANS_SC_URL, uniqueChars);
    const monoPromise = asciiChars
      ? fetchFontFamily("JetBrains Mono", JETBRAINS_MONO_URL, asciiChars).catch(
          () => [] as OgFont[],
        )
      : Promise.resolve([] as OgFont[]);

    const [notoFonts, monoFonts] = await Promise.all([notoPromise, monoPromise]);
    return [...notoFonts, ...monoFonts];
  })();

  request.catch(() => fontCache.delete(cacheKey));
  fontCache.set(cacheKey, request);
  return request;
}
