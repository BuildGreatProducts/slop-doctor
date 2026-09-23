import { convexAuthNextjsMiddleware } from "@convex-dev/auth/nextjs/server";

// Handles the OAuth code exchange and auth cookies. No routes are protected; scans.create checks auth.
export default convexAuthNextjsMiddleware(undefined, { cookieConfig: { maxAge: 60 * 60 * 24 * 30 } });

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
