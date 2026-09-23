import { HOUR, RateLimiter } from "@convex-dev/rate-limiter";
import { components } from "./_generated/api";

export const rateLimiter = new RateLimiter(components.rateLimiter, {
  userDaily: { kind: "token bucket", rate: 10, period: 24 * HOUR, capacity: 10 },
  globalDaily: { kind: "fixed window", rate: 500, period: 24 * HOUR },
});
