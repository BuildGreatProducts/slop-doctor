"use client";

import { useConvexAuth, useMutation } from "convex/react";
import { ConvexError } from "convex/values";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import { api } from "../../../convex/_generated/api";
import { validateUrl } from "../../../convex/lib/urls";
import { type ErrorKey, errors, intake } from "@/lib/copy";
import styles from "./Intake.module.css";
import { SignInPanel } from "./SignInPanel";

function errorMessage(code: ErrorKey | undefined, retryAfterMs?: number): string {
  if (code === "rate_limited") return errors.rate_limited.message(Math.max(1, Math.ceil((retryAfterMs ?? 0) / 3.6e6)));
  const copy = code ? errors[code] : errors.generic;
  return "title" in copy ? `${copy.title}. ${copy.message}` : copy.message;
}

export function UrlIntakeForm({ initialUrl, openSignIn }: { initialUrl: string; openSignIn: boolean }) {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useConvexAuth();
  const create = useMutation(api.scans.create);
  const [url, setUrl] = useState(initialUrl);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [showSignIn, setShowSignIn] = useState(openSignIn);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const parsed = validateUrl(url);
    if (!parsed.ok) {
      setError(errors[parsed.code].message);
      return;
    }
    setError(null);
    if (!isAuthenticated) {
      setShowSignIn(true);
      return;
    }
    setPending(true);
    try {
      const { scanId, cached } = await create({ url });
      router.push(`/?chart=${scanId}${cached ? "&cached=1" : ""}`);
    } catch (err) {
      const data = err instanceof ConvexError ? (err.data as { code?: ErrorKey; retryAfterMs?: number }) : {};
      if (data.code === "signed_out") setShowSignIn(true);
      setError(errorMessage(data.code, data.retryAfterMs));
      setPending(false);
    }
  };

  return (
    <form className={styles.form} onSubmit={onSubmit} noValidate>
      <div className="field">
        <label htmlFor="patient-url" className="field-label">
          {intake.fieldLabel}
        </label>
        <div className={styles.inputRow}>
          <input
            id="patient-url"
            className={`input ${error ? "is-error" : ""}`}
            type="url"
            inputMode="url"
            autoComplete="url"
            placeholder={intake.fieldPlaceholder}
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            aria-invalid={error ? true : undefined}
            aria-describedby="patient-url-help"
          />
          <button type="submit" className="btn btn-primary" disabled={isLoading || pending}>
            {isAuthenticated || isLoading ? intake.submitSignedIn : intake.submitSignedOut}
          </button>
        </div>
        <span id="patient-url-help" className={`field-help ${error ? "is-error" : ""}`} role={error ? "alert" : undefined}>
          {error ?? intake.fieldHelp}
        </span>
      </div>
      {showSignIn && !isAuthenticated && <SignInPanel url={url} />}
    </form>
  );
}
