/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as auth from "../auth.js";
import type * as crons from "../crons.js";
import type * as dev from "../dev.js";
import type * as devFixtures from "../devFixtures.js";
import type * as findings from "../findings.js";
import type * as http from "../http.js";
import type * as lib_colors from "../lib/colors.js";
import type * as lib_jevQuestions from "../lib/jevQuestions.js";
import type * as lib_labs from "../lib/labs.js";
import type * as lib_regions from "../lib/regions.js";
import type * as lib_scoring from "../lib/scoring.js";
import type * as lib_taxonomy from "../lib/taxonomy.js";
import type * as lib_urls from "../lib/urls.js";
import type * as pipeline_capture from "../pipeline/capture.js";
import type * as pipeline_diagnose from "../pipeline/diagnose.js";
import type * as pipeline_examine from "../pipeline/examine.js";
import type * as pipeline_store from "../pipeline/store.js";
import type * as rateLimits from "../rateLimits.js";
import type * as scans from "../scans.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  auth: typeof auth;
  crons: typeof crons;
  dev: typeof dev;
  devFixtures: typeof devFixtures;
  findings: typeof findings;
  http: typeof http;
  "lib/colors": typeof lib_colors;
  "lib/jevQuestions": typeof lib_jevQuestions;
  "lib/labs": typeof lib_labs;
  "lib/regions": typeof lib_regions;
  "lib/scoring": typeof lib_scoring;
  "lib/taxonomy": typeof lib_taxonomy;
  "lib/urls": typeof lib_urls;
  "pipeline/capture": typeof pipeline_capture;
  "pipeline/diagnose": typeof pipeline_diagnose;
  "pipeline/examine": typeof pipeline_examine;
  "pipeline/store": typeof pipeline_store;
  rateLimits: typeof rateLimits;
  scans: typeof scans;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {
  rateLimiter: import("@convex-dev/rate-limiter/_generated/component.js").ComponentApi<"rateLimiter">;
};
