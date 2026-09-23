import { describe, expect, test } from "vitest";
import { validateUrl } from "../convex/lib/urls";

describe("validateUrl", () => {
  test("prefixes https when the scheme is missing", () => {
    expect(validateUrl("example.com")).toEqual({
      ok: true,
      url: "https://example.com",
      normalizedUrl: "https://example.com",
      host: "example.com",
    });
  });

  test("normalizes host, hash, tracking params and trailing slash", () => {
    const r = validateUrl("HTTP://www.Example.com/Path/?utm_source=x&ref=y&page=2#hero");
    expect(r).toEqual({
      ok: true,
      url: "http://www.example.com/Path?page=2",
      normalizedUrl: "http://www.example.com/path?page=2",
      host: "example.com",
    });
  });

  test("keeps http and https", () => {
    expect(validateUrl("http://example.com").ok).toBe(true);
    expect(validateUrl("https://sub.example.co.uk/a").ok).toBe(true);
  });

  test.each(["ftp://example.com", "javascript:alert(1)", "mailto:a@b.com", "", "   ", "not a url", "example.123"])(
    "rejects %s as invalid",
    (input) => {
      expect(validateUrl(input)).toEqual({ ok: false, code: "invalid_url" });
    },
  );

  test("rejects credentials in the URL", () => {
    expect(validateUrl("https://user:pass@example.com")).toEqual({ ok: false, code: "invalid_url" });
  });

  test.each([
    "localhost",
    "localhost:3000",
    "http://localhost:3000",
    "foo.local",
    "api.internal",
    "10.0.0.1",
    "172.20.1.1",
    "192.168.0.1",
    "127.0.0.1",
    "169.254.1.1",
    "0.0.0.0",
    "http://[::1]/",
    "https://[2001:db8::1]",
    "intranet",
  ])("rejects %s as private", (input) => {
    expect(validateUrl(input)).toEqual({ ok: false, code: "private_url" });
  });

  test("rejects inputs longer than 2,048 characters", () => {
    expect(validateUrl(`https://example.com/${"a".repeat(2048)}`)).toEqual({ ok: false, code: "invalid_url" });
  });
});
