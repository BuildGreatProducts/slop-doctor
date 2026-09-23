"use client";

import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { nextToReveal, revealDelay, sortForReveal } from "./revealQueue";
import type { Finding, Region } from "./types";

/**
 * Paces findings for the scanner, in reveal order (docs/PRD.md FR-013): `intervalMs` between checks in the same
 * part of the page, `groupPauseMs` when moving to the next region. `instant` reveals everything at once
 * (reduced motion, static charts, scans already complete on load).
 */
export function useRevealQueue(
  findings: Finding[] | undefined,
  regions: Region[] | undefined,
  {
    intervalMs = 160,
    groupPauseMs = 650,
    instant = false,
  }: { intervalMs?: number; groupPauseMs?: number; instant?: boolean } = {},
): { revealed: Finding[]; drained: boolean } {
  const regionIndex = useMemo(() => new Map((regions ?? []).map((r, i) => [r.id, i])), [regions]);
  const [revealedIds, setRevealedIds] = useState<string[]>([]);
  const all = useMemo(() => findings ?? [], [findings]);

  useEffect(() => {
    if (instant) return;
    const revealedSet = new Set(revealedIds);
    const next = nextToReveal(all, revealedSet, regionIndex);
    if (!next) return;
    const lastId = revealedIds.at(-1);
    const last = lastId ? all.find((f) => f._id === lastId) : undefined;
    const delay = revealDelay(next, last, { intervalMs, groupPauseMs });
    const timer = setTimeout(() => setRevealedIds((ids) => [...ids, next._id]), delay);
    return () => clearTimeout(timer);
  }, [all, revealedIds, regionIndex, intervalMs, groupPauseMs, instant]);

  return useMemo(() => {
    if (instant) return { revealed: sortForReveal(all, regionIndex), drained: true };
    const byId = new Map<string, Finding>(all.map((f) => [f._id, f]));
    const revealed = revealedIds.map((id) => byId.get(id)).filter((f): f is Finding => f !== undefined);
    return { revealed, drained: revealed.length === all.length };
  }, [instant, all, regionIndex, revealedIds]);
}

/** True when the visitor asked the OS for reduced motion. */
const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";

function subscribeReducedMotion(onChange: () => void) {
  const mq = window.matchMedia(REDUCED_MOTION);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

export function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(
    subscribeReducedMotion,
    () => window.matchMedia(REDUCED_MOTION).matches,
    () => false,
  );
}
