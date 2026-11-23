export interface ParsedFrontmatter {
  data: Record<string, unknown>;
  content: string;
}

function parseScalar(raw: string): unknown {
  const value = raw.trim();
  if (value === "") return "";

  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1);
  }

  if (value === "true") return true;
  if (value === "false") return false;
  if (value === "null" || value === "~") return null;

  if (/^-?\d+(\.\d+)?$/.test(value)) {
    return Number(value);
  }

  if (value.startsWith("[") && value.endsWith("]")) {
    const inner = value.slice(1, -1).trim();
    if (!inner) return [];
    return inner
      .split(",")
      .map((item) => parseScalar(item))
      .filter((item) => item !== "");
  }

  return value;
}

/**
 * Lightweight YAML frontmatter parser with zero external dependencies.
 * Supports string/number/boolean scalars, inline arrays, and block arrays.
 */
export function parseFrontmatter(source: string): ParsedFrontmatter {
  const normalized = source.replace(/\r\n/g, "\n");
  if (!normalized.startsWith("---\n")) {
    return { data: {}, content: normalized };
  }

  const endIndex = normalized.indexOf("\n---", 4);
  if (endIndex === -1) {
    return { data: {}, content: normalized };
  }

  const rawFrontmatter = normalized.slice(4, endIndex);
  const afterDelimiter = normalized.slice(endIndex + 4);
  const content = afterDelimiter.startsWith("\n")
    ? afterDelimiter.slice(1)
    : afterDelimiter;

  const data: Record<string, unknown> = {};
  const lines = rawFrontmatter.split("\n");
  let activeArrayKey: string | null = null;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    if (activeArrayKey && /^\s*-\s+/.test(line)) {
      const itemRaw = line.replace(/^\s*-\s+/, "");
      const arr = data[activeArrayKey];
      if (Array.isArray(arr)) {
        arr.push(parseScalar(itemRaw));
      }
      continue;
    }

    const match = line.match(/^([A-Za-z0-9_-]+)\s*:\s*(.*)$/);
    if (!match) {
      activeArrayKey = null;
      continue;
    }

    const [, key, rest] = match;
    if (rest.trim() === "") {
      data[key] = [];
      activeArrayKey = key;
    } else {
      data[key] = parseScalar(rest);
      activeArrayKey = null;
    }
  }

  return { data, content };
}
