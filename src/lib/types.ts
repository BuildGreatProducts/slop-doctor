import type { FunctionReturnType } from "convex/server";
import type { api } from "../../convex/_generated/api";

export type PublicScan = NonNullable<FunctionReturnType<typeof api.scans.get>>;
export type Finding = FunctionReturnType<typeof api.findings.byScan>[number];
export type Region = NonNullable<PublicScan["regions"]>[number];
