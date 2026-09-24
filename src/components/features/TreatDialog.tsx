"use client";

import { useEffect, useRef, useState } from "react";
import { treat } from "@/lib/copy";
import { claudeLink, codexLink, cursorLink } from "@/lib/treat";
import styles from "./TreatDialog.module.css";

type Props = {
  open: boolean;
  onClose: () => void;
  host: string;
  prompt: string;
};

const COPIED_MS = 2000;

/** The treat popup (docs/PRD.md FR-023): the prompt, and links that open it in a coding agent, filled in but not sent. */
export function TreatDialog({ open, onClose, host, prompt }: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  const promptRef = useRef<HTMLPreElement>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), COPIED_MS);
    return () => clearTimeout(timer);
  }, [copied]);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  const copyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(prompt);
      setCopied(true);
    } catch {
      // Clipboard blocked: select the prompt so a keyboard copy takes it.
      const pre = promptRef.current;
      if (!pre) return;
      pre.focus();
      window.getSelection()?.selectAllChildren(pre);
    }
  };

  return (
    <dialog
      ref={ref}
      className={`dialog ${styles.dialog}`}
      aria-labelledby="treat-title"
      onClose={onClose}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose(); // a click on the backdrop
      }}
    >
      {open && (
        <div className={styles.body}>
          <div className={styles.header}>
            <h2 id="treat-title" className="t-headline-md">
              {treat.title(host)}
            </h2>
            <button type="button" className="btn btn-ghost btn-sm" onClick={onClose}>
              {treat.close}
            </button>
          </div>

          <p className="t-body-md">{treat.intro}</p>

          <pre ref={promptRef} className={`code ${styles.prompt}`} tabIndex={0} aria-label={treat.promptLabel}>
            {prompt}
          </pre>

          <div className={styles.actions}>
            <a className="btn btn-secondary" href={claudeLink(prompt)}>
              {treat.openClaude}
            </a>
            <a className="btn btn-secondary" href={codexLink(prompt)}>
              {treat.openCodex}
            </a>
            <a className="btn btn-secondary" href={cursorLink(prompt)} target="_blank" rel="noopener noreferrer">
              {treat.openCursor}
            </a>
            <button type="button" className="btn btn-ghost" onClick={() => void copyPrompt()} aria-live="polite">
              {copied ? treat.promptCopied : treat.copyPrompt}
            </button>
          </div>

          <p className="t-body-sm muted">{treat.help}</p>
        </div>
      )}
    </dialog>
  );
}
