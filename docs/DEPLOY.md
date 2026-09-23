# Deploy — Slop Doctor

How to take Slop Doctor from the dev deployment to a live URL. Next.js runs on Vercel; the backend runs on Convex Cloud. Steps marked **You** need your accounts; steps marked **Agent** your coding agent can run once you've done the step before.

## What's live where

| Piece | Dev | Production |
|---|---|---|
| Next.js app | `pnpm dev` on http://localhost:3000 | Vercel project |
| Convex | `dashing-camel-39` (team `buildgreatproducts`, project `slop-doctor`) | the project's prod deployment |
| Google redirect URI | `https://dashing-camel-39.convex.site/api/auth/callback/google` | `https://<prod-deployment>.convex.site/api/auth/callback/google` |

## 1. Make sure dev works end to end

1. **You:** set the dev keys if you haven't:
   ```bash
   npx convex env set FIRECRAWL_API_KEY <key>
   ```
   Repeat for `GEMINI_API_KEY`, `TYPESAFE_API_KEY`, `AUTH_GOOGLE_ID` and `AUTH_GOOGLE_SECRET`.
2. **Agent:** `pnpm test`, `pnpm typecheck`, `pnpm lint`, then one real examination signed in at http://localhost:3000.
3. **You + agent:** fill the TODO URLs in `scripts/calibration.json`, then `pnpm calibrate` until it passes.

## 2. Push the repo

**You:** create a GitHub repository and push the `build/mvp` branch (then merge it to `main`). Vercel deploys from GitHub.

## 3. Create the production Convex deployment

1. **You:** in the Convex dashboard (project `slop-doctor`), open Settings → URL & Deploy Key and create a **production deploy key**. Keep it for step 5.
2. **Agent:** deploy the backend once so the prod deployment exists:
   ```bash
   npx convex deploy
   ```
3. **Agent:** set up Convex Auth keys on prod (sets `JWT_PRIVATE_KEY` and `JWKS`):
   ```bash
   npx @convex-dev/auth --prod --web-server-url https://<your-vercel-domain>
   ```
   If it prompts interactively and can't run, generate the keys the same way the dev keys were generated and set them with `npx convex env set --prod`.

## 4. Production Google sign-in

**You:** create a second Google OAuth client for production, with authorised redirect URI `https://<prod-deployment>.convex.site/api/auth/callback/google`.

Then set every production variable (one command per variable):

```bash
npx convex env set --prod SITE_URL https://<your-vercel-domain>
```

The full list for `--prod`: `SITE_URL`, `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`, `FIRECRAWL_API_KEY`, `GEMINI_API_KEY`, `TYPESAFE_API_KEY`. Check with `npx convex env list --prod`.

Never set `ALLOW_DEV_HELPERS` on production: it switches on the CLI-only dev and fixture helpers.

## 5. Vercel

1. **You:** import the GitHub repo in Vercel.
2. **You:** set:
   - Build command: `npx convex deploy --cmd 'pnpm build'`
   - Environment variable: `CONVEX_DEPLOY_KEY` = the production deploy key from step 3

   `npx convex deploy` sets `NEXT_PUBLIC_CONVEX_URL` for the build automatically. Do **not** add any provider key to Vercel; they live only in Convex.
3. **You:** deploy. Note the domain and, if it differs from what you used above, update `SITE_URL`.

## 6. Smoke test production

1. **You:** open the live URL and sign in with Google.
2. **You:** examine one landing page. Watch the waiting room, the scanner boxes and the chart arrive.
3. **You:** open the chart link in a private window, signed out; it should render in full.
4. **Agent:** confirm no secrets shipped: `pnpm build` locally, then `grep -rE "API_KEY|JWT_PRIVATE" .next/static` returns nothing.

## Costs to watch

- **Firecrawl:** 1 credit per examination (the 24-hour cache saves repeats). Pick a plan that covers the global cap of 500 a day, or lower `globalDaily` in `convex/rateLimits.ts` to match your plan.
- **Gemini Flash-Lite and TypeSafe Jev:** well under a cent per examination.
- **Convex and Vercel:** free tiers cover launch scale.
