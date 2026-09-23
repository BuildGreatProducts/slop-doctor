// @vitest-environment edge-runtime
import rateLimiter from "@convex-dev/rate-limiter/test";
import { convexTest } from "convex-test";
import { describe, expect, test } from "vitest";
import { api, internal } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import schema from "../../convex/schema";

const modules = import.meta.glob("../../convex/**/*.*s");

function makeTest() {
  const t = convexTest(schema, modules);
  rateLimiter.register(t);
  return t;
}

async function withUser(t: ReturnType<typeof makeTest>, email = "vibe@builder.dev") {
  const userId = (await t.run((ctx) => ctx.db.insert("users", { email }))) as Id<"users">;
  return { userId, as: t.withIdentity({ subject: `${userId}|session-${userId}`, issuer: "test" }) };
}

async function errorCode(p: Promise<unknown>): Promise<{ code?: string; retryAfterMs?: number }> {
  try {
    await p;
  } catch (e) {
    return (e as { data?: { code?: string; retryAfterMs?: number } }).data ?? {};
  }
  throw new Error("expected the call to throw");
}

describe("scans.create", () => {
  test("rejects signed-out callers", async () => {
    const t = makeTest();
    expect(await errorCode(t.mutation(api.scans.create, { url: "example.com" }))).toEqual({ code: "signed_out" });
  });

  test("rejects private and invalid URLs", async () => {
    const t = makeTest();
    const { as } = await withUser(t);
    expect((await errorCode(as.mutation(api.scans.create, { url: "localhost:3000" }))).code).toBe("private_url");
    expect((await errorCode(as.mutation(api.scans.create, { url: "ftp://x.com" }))).code).toBe("invalid_url");
  });

  test("inserts a queued scan for a valid URL", async () => {
    const t = makeTest();
    const { as, userId } = await withUser(t);
    const { scanId, cached } = await as.mutation(api.scans.create, { url: "Example.com/?utm_source=x" });
    expect(cached).toBe(false);
    const scan = await t.run((ctx) => ctx.db.get(scanId));
    expect(scan).toMatchObject({
      userId,
      url: "https://example.com",
      normalizedUrl: "https://example.com",
      host: "example.com",
      status: "queued",
    });
  });

  test("the 11th examination in 24 hours is rate limited", async () => {
    const t = makeTest();
    const { as } = await withUser(t);
    for (let i = 0; i < 10; i++) await as.mutation(api.scans.create, { url: `site${i}.com` });
    const err = await errorCode(as.mutation(api.scans.create, { url: "site10.com" }));
    expect(err.code).toBe("rate_limited");
    expect(err.retryAfterMs).toBeGreaterThan(0);
  });

  test("rate limits are per user", async () => {
    const t = makeTest();
    const a = await withUser(t, "a@x.dev");
    const b = await withUser(t, "b@x.dev");
    for (let i = 0; i < 10; i++) await a.as.mutation(api.scans.create, { url: `site${i}.com` });
    await expect(b.as.mutation(api.scans.create, { url: "site.com" })).resolves.toBeDefined();
  });
});

describe("public reads", () => {
  test("scans.get never returns userId and handles bad ids", async () => {
    const t = makeTest();
    const { as } = await withUser(t);
    const { scanId } = await as.mutation(api.scans.create, { url: "example.com" });
    const scan = await t.query(api.scans.get, { scanId });
    expect(scan).not.toBeNull();
    expect(scan).not.toHaveProperty("userId");
    expect(scan?.screenshotUrl).toBeNull();
    expect(await t.query(api.scans.get, { scanId: "not-an-id" })).toBeNull();
  });

  test("findings.byScan returns findings in order", async () => {
    const t = makeTest();
    const { as } = await withUser(t);
    const { scanId } = await as.mutation(api.scans.create, { url: "example.com" });
    const f = { kind: "symptom" as const, source: "exam" as const, probability: 0.9, band: "present" as const, weight: 2 };
    await t.mutation(internal.pipeline.store.addFindings, { scanId, findings: [{ key: "a", ...f }] });
    await t.mutation(internal.pipeline.store.addFindings, { scanId, findings: [{ key: "b", ...f }, { key: "c", ...f }] });
    const rows = await t.query(api.findings.byScan, { scanId });
    expect(rows.map((r) => [r.key, r.order])).toEqual([
      ["a", 0],
      ["b", 1],
      ["c", 2],
    ]);
    expect(await t.query(api.findings.byScan, { scanId: "nope" })).toEqual([]);
  });

  test("scans.mine returns only the caller's scans", async () => {
    const t = makeTest();
    const a = await withUser(t, "a@x.dev");
    const b = await withUser(t, "b@x.dev");
    await a.as.mutation(api.scans.create, { url: "a.com" });
    await b.as.mutation(api.scans.create, { url: "b.com" });
    expect((await a.as.query(api.scans.mine, {})).map((s) => s.host)).toEqual(["a.com"]);
    expect(await t.query(api.scans.mine, {})).toEqual([]);
  });
});

describe("pipeline store", () => {
  test("fail doesn't overwrite a complete scan", async () => {
    const t = makeTest();
    const { as } = await withUser(t);
    const { scanId } = await as.mutation(api.scans.create, { url: "example.com" });
    await t.run((ctx) => ctx.db.patch(scanId, { status: "complete" }));
    await t.mutation(internal.pipeline.store.fail, { scanId, error: "generic" });
    expect((await t.run((ctx) => ctx.db.get(scanId)))?.status).toBe("complete");
  });

  test("failStuck fails scans older than 3 minutes", async () => {
    const t = makeTest();
    const { as } = await withUser(t);
    const { scanId: old } = await as.mutation(api.scans.create, { url: "old.com" });
    const { scanId: fresh } = await as.mutation(api.scans.create, { url: "fresh.com" });
    await t.run((ctx) => ctx.db.patch(old, { createdAt: Date.now() - 4 * 60 * 1000, status: "examining" }));
    expect(await t.mutation(internal.pipeline.store.failStuck, {})).toBe(1);
    expect((await t.run((ctx) => ctx.db.get(old)))?.status).toBe("failed");
    expect((await t.run((ctx) => ctx.db.get(fresh)))?.status).toBe("queued");
  });

  test("dev.startScanForDev creates a dev user once", async () => {
    const t = makeTest();
    await t.mutation(internal.dev.startScanForDev, { url: "example.com" });
    await t.mutation(internal.dev.startScanForDev, { url: "example.org" });
    const users = await t.run((ctx) => ctx.db.query("users").collect());
    expect(users.map((u) => u.email)).toEqual(["dev@slop.doctor"]);
  });
});
