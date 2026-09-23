// URL validation and normalization (docs/PRD.md FR-002). Pure: runs in Convex and in the browser.

export type UrlResult =
  | { ok: true; url: string; normalizedUrl: string; host: string }
  | { ok: false; code: "invalid_url" | "private_url" };

const MAX_LENGTH = 2048;
const DROPPED_PARAMS = new Set(["ref", "fbclid", "gclid"]);

function isPrivateIPv4(host: string): boolean {
  const parts = host.split(".").map(Number);
  const [a, b] = parts;
  return (
    a === 10 ||
    a === 127 ||
    a === 0 ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168) ||
    (a === 169 && b === 254)
  );
}

export function validateUrl(input: string): UrlResult {
  const trimmed = input.trim();
  if (trimmed.length === 0 || trimmed.length > MAX_LENGTH) return { ok: false, code: "invalid_url" };

  const hasScheme = /^[a-z][a-z0-9+.-]*:/i.test(trimmed);
  // "localhost:3000" parses as scheme "localhost:", so only treat it as a scheme when followed by "//".
  const withScheme = hasScheme && /^[a-z][a-z0-9+.-]*:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;

  let parsed: URL;
  try {
    parsed = new URL(withScheme);
  } catch {
    return { ok: false, code: "invalid_url" };
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return { ok: false, code: "invalid_url" };
  if (parsed.username || parsed.password) return { ok: false, code: "invalid_url" };

  const hostname = parsed.hostname.toLowerCase();
  if (hostname.startsWith("[")) return { ok: false, code: "private_url" }; // IPv6 literal
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(hostname)) {
    return isPrivateIPv4(hostname) ? { ok: false, code: "private_url" } : { ok: false, code: "invalid_url" };
  }
  if (hostname === "localhost" || /\.(localhost|local|internal)$/.test(hostname)) {
    return { ok: false, code: "private_url" };
  }
  if (!hostname.includes(".")) return { ok: false, code: "private_url" };
  const tld = hostname.split(".").pop() ?? "";
  if (!/^[a-z]{2,}$/.test(tld) && !/^xn--[a-z0-9-]+$/.test(tld)) return { ok: false, code: "invalid_url" };

  parsed.hash = "";
  for (const key of [...parsed.searchParams.keys()]) {
    if (key.toLowerCase().startsWith("utm_") || DROPPED_PARAMS.has(key.toLowerCase())) parsed.searchParams.delete(key);
  }
  const path = parsed.pathname.replace(/\/+$/, "");
  const search = parsed.searchParams.toString();
  const url = `${parsed.protocol}//${parsed.host.toLowerCase()}${path}${search ? `?${search}` : ""}`;

  return {
    ok: true,
    url,
    normalizedUrl: url.toLowerCase(),
    host: hostname.replace(/^www\./, ""),
  };
}
