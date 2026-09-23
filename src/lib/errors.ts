import { type ErrorKey, errors } from "./copy";

/** One-line message for a ConvexError code, from docs/COPY.md § Errors. */
export function errorMessage(code: ErrorKey | undefined, retryAfterMs?: number): string {
  if (code === "rate_limited") return errors.rate_limited.message(Math.max(1, Math.ceil((retryAfterMs ?? 0) / 3.6e6)));
  const copy = code ? errors[code] : errors.generic;
  return "title" in copy ? `${copy.title}. ${copy.message}` : copy.message;
}
