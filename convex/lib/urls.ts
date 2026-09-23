// URL validation and normalization (docs/PRD.md FR-002). Pure: runs in Convex and in the browser.

export type UrlResult =
  | {
      ok: true;
      /** What we fetch. Server-side only: the query string can carry preview tokens. */
      url: string;
      /** Cache key: the fetch URL with only scheme and host case-folded. */
      normalizedUrl: string;
      /** Safe to show and share: origin and path, no query string. */
      displayUrl: string;
      host: string;
    }
  | { ok: false; code: "invalid_url" | "private_url" };

const MAX_LENGTH = 2048;
const DROPPED_PARAMS = new Set(["ref", "fbclid", "gclid"]);
const PRIVATE_SUFFIXES = /\.(localhost|local|internal|lan|corp|home\.arpa|localdomain|intranet|test|invalid)$/;

function ipv4Parts(ip: string): number[] | null {
  if (!/^\d{1,3}(\.\d{1,3}){3}$/.test(ip)) return null;
  const parts = ip.split(".").map(Number);
  return parts.every((n) => n <= 255) ? parts : null;
}

function isPrivateIPv4([a, b]: number[]): boolean {
  return (
    a === 0 ||
    a === 10 ||
    a === 127 ||
    (a === 100 && b >= 64 && b <= 127) || // carrier-grade NAT
    (a === 169 && b === 254) || // link-local, cloud metadata
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168) ||
    (a === 192 && b === 0) ||
    (a === 198 && (b === 18 || b === 19)) || // benchmarking
    a >= 224 // multicast and reserved
  );
}

/** True for any address a public website should never resolve to. Used on DNS results before capture. */
export function isPrivateAddress(ip: string): boolean {
  const v4 = ipv4Parts(ip);
  if (v4) return isPrivateIPv4(v4);
  const v6 = ip.toLowerCase().replace(/^\[|\]$/g, "");
  if (v6 === "::" || v6 === "::1") return true;
  const mapped = v6.match(/^::ffff:(\d{1,3}(?:\.\d{1,3}){3})$/);
  if (mapped) return isPrivateAddress(mapped[1]);
  if (/^f[cd][0-9a-f]{2}:/.test(v6)) return true; // unique local fc00::/7
  if (/^fe[89ab][0-9a-f]:/.test(v6)) return true; // link-local fe80::/10
  if (/^ff[0-9a-f]{2}:/.test(v6)) return true; // multicast
  return false;
}

export function validateUrl(input: string): UrlResult {
  const trimmed = input.trim();
  if (trimmed.length === 0 || trimmed.length > MAX_LENGTH) return { ok: false, code: "invalid_url" };

  // "localhost:3000" parses as scheme "localhost:", so only treat it as a scheme when followed by "//".
  const withScheme = /^[a-z][a-z0-9+.-]*:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;

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
  const v4 = ipv4Parts(hostname);
  if (v4) return isPrivateIPv4(v4) ? { ok: false, code: "private_url" } : { ok: false, code: "invalid_url" };
  if (hostname === "localhost" || PRIVATE_SUFFIXES.test(hostname)) return { ok: false, code: "private_url" };
  if (!hostname.includes(".")) return { ok: false, code: "private_url" };
  const tld = hostname.split(".").pop() ?? "";
  if (!/^[a-z]{2,}$/.test(tld) && !/^xn--[a-z0-9-]+$/.test(tld)) return { ok: false, code: "invalid_url" };
  if (parsed.port !== "") return { ok: false, code: "invalid_url" }; // websites live on 80 and 443

  parsed.hash = "";
  for (const key of [...parsed.searchParams.keys()]) {
    if (key.toLowerCase().startsWith("utm_") || DROPPED_PARAMS.has(key.toLowerCase())) parsed.searchParams.delete(key);
  }
  const path = parsed.pathname.replace(/\/+$/, "");
  const search = parsed.searchParams.toString();
  const origin = `${parsed.protocol}//${hostname}`;
  const url = `${origin}${path}${search ? `?${search}` : ""}`;

  return { ok: true, url, normalizedUrl: url, displayUrl: `${origin}${path}`, host: hostname.replace(/^www\./, "") };
}
