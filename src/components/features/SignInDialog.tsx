"use client";

import { useAuthActions } from "@convex-dev/auth/react";
import { useEffect, useRef } from "react";
import { validateUrl } from "../../../convex/lib/urls";
import { intake } from "@/lib/copy";
import { LogoMark } from "./LogoMark";
import styles from "./SignInDialog.module.css";

/**
 * The sign-in popup. The typed URL rides through Google's redirect with `start=1`, so the examination
 * begins as soon as the visitor lands back signed in.
 */
export function SignInDialog({ open, onClose, url }: { open: boolean; onClose: () => void; url: string }) {
  const { signIn } = useAuthActions();
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  const redirectTo = validateUrl(url).ok ? `/?url=${encodeURIComponent(url)}&start=1` : "/";

  return (
    <dialog
      ref={ref}
      className={`dialog ${styles.dialog}`}
      aria-labelledby="sign-in-title"
      onClose={onClose}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose(); // a click on the backdrop
      }}
    >
      {open && (
        <div className={styles.body}>
          <LogoMark size={40} />
          <h2 id="sign-in-title" className="t-headline-md">
            {intake.signInTitle}
          </h2>
          <p className="t-body-sm muted">{intake.signInNote}</p>
          <div className={styles.actions}>
            <button type="button" className="btn btn-primary" onClick={() => void signIn("google", { redirectTo })}>
              {intake.continueWithGoogle}
            </button>
            <button type="button" className="btn btn-ghost" onClick={onClose}>
              {intake.close}
            </button>
          </div>
        </div>
      )}
    </dialog>
  );
}
