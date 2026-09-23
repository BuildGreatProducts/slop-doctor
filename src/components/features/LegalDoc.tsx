import type { ReactNode } from "react";
import { legal } from "@/lib/copy";

/** Long-form legal page on the 720px measure, styled by `.legal` in globals.css. */
export function LegalDoc({ title, children }: { title: string; children: ReactNode }) {
  return (
    <main className="frame" style={{ paddingBlock: "var(--space-xl) var(--space-2xl)" }}>
      <article className="measure stack-lg legal">
        <div className="stack-sm">
          <span className="mono">{legal.eyebrow(legal.updated)}</span>
          <h1 className="t-headline-lg">{title}</h1>
        </div>
        {children}
      </article>
    </main>
  );
}
