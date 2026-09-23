import { describe, expect, test } from "vitest";
import { isPrivateAddress, validateUrl } from "../convex/lib/urls";

describe("validateUrl", () => {
  test("prefixes https when the scheme is missing", () => {
    expect(validateUrl("example.com")).toEqual({
      ok: true,
      url: "https://example.com",
      normalizedUrl: "https://example.com",
      displayUrl: "https://example.com",
      host: "example.com",
    });
  });

  test("normalizes host, hash, tracking params and trailing slash, and keeps path case", () => {
    expect(validateUrl("HTTP://www.Example.com/Path/?utm_source=x&ref=y&page=2#hero")).toEqual({
      ok: true,
      url: "http://www.example.com/Path?page=2",
      normalizedUrl: "http://www.example.com/Path?page=2",
      displayUrl: "http://www.example.com/Path",
      host: "example.com",
    });
  });

  test("the display URL never carries the query string", () => {
    const r = validateUrl("https://preview.example.com/?_vercel_share=secret-token");
    expect(r.ok && r.displayUrl).toBe("https://preview.example.com");
    expect(r.ok && r.url).toContain("secret-token");
  });

  test("keeps http and https", () => {
    expect(validateUrl("http://example.com").ok).toBe(true);
    expect(validateUrl("https://sub.example.co.uk/a").ok).toBe(true);
  });

  test.each([
    "ftp://example.com",
    "javascript:alert(1)",
    "mailto:a@b.com",
    "",
    "   ",
    "not a url",
    "example.123",
    "https://example.com:6379",
    "https://example.com:8080/",
    "8.8.8.8",
  ])("rejects %s as invalid", (input) => {
    expect(validateUrl(input)).toEqual({ ok: false, code: "invalid_url" });
  });

  test("rejects credentials in the URL", () => {
    expect(validateUrl("https://user:pass@example.com")).toEqual({ ok: false, code: "invalid_url" });
  });

  test.each([
    "localhost",
    "localhost:3000",
    "http://localhost:3000",
    "foo.local",
    "api.internal",
    "router.lan",
    "intranet.corp",
    "nas.home.arpa",
    "box.localdomain",
    "site.test",
    "10.0.0.1",
    "172.20.1.1",
    "192.168.0.1",
    "127.0.0.1",
    "169.254.169.254",
    "100.64.0.1",
    "0.0.0.0",
    "http://2130706433",
    "http://0x7f000001",
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

describe("isPrivateAddress", () => {
  test.each([
    "127.0.0.1",
    "10.1.2.3",
    "172.31.255.255",
    "192.168.1.1",
    "169.254.169.254",
    "100.100.100.100",
    "198.18.0.1",
    "224.0.0.1",
    "255.255.255.255",
    "0.0.0.0",
    "::1",
    "::",
    "::ffff:127.0.0.1",
    "fd12:3456::1",
    "fe80::1",
    "ff02::1",
  ])("%s is private", (ip) => expect(isPrivateAddress(ip)).toBe(true));

  test.each(["93.184.216.34", "8.8.8.8", "172.32.0.1", "2606:4700::6810:84e5", "::ffff:8.8.8.8"])(
    "%s is public",
    (ip) => expect(isPrivateAddress(ip)).toBe(false),
  );
});
