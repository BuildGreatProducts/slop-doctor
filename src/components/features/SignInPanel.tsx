"use client";

import { useAuthActions } from "@convex-dev/auth/react";
import { intake } from "@/lib/copy";
import styles from "./Intake.module.css";

/** Inline sign-in (no separate route). Keeps the typed URL through the OAuth round trip. */
export function SignInPanel({ url }: { url: string }) {
  const { signIn } = useAuthActions();
  const redirectTo = url ? `/?url=${encodeURIComponent(url)}` : "/";
  return (
    <div id="sign-in" className={styles.signIn}>
      <div className={styles.providers}>
        <button type="button" className="btn btn-secondary" onClick={() => void signIn("google", { redirectTo })}>
          {intake.continueWithGoogle}
        </button>
      </div>
      <p className="field-help">{intake.signInNote}</p>
    </div>
  );
}
