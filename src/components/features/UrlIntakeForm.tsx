"use client";

import { useConvexAuth, useMutation } from "convex/react";
import { ConvexError } from "convex/values";
import { useRouter } from "next/navigation";
import { type FormEvent, useEffect, useRef, useState } from "react";
import { api } from "../../../convex/_generated/api";
import { validateUrl } from "../../../convex/lib/urls";
import { type ErrorKey, errors, intake } from "@/lib/copy";
import { errorMessage } from "@/lib/errors";
import styles from "./Intake.module.css";
import { SignInDialog } from "./SignInDialog";

type Props = {
  initialUrl: string;
  /** Open the sign-in popup straight away (the header's "Sign in"). */
  openSignIn: boolean;
  /** Start the examination for `initialUrl` as soon as the visitor is signed in (back from Google). */
  autoStart: boolean;
};

export function UrlIntakeForm({ initialUrl, openSignIn, autoStart }: Props) {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useConvexAuth();
  const create = useMutation(api.scans.create);
  const [url, setUrl] = useState(initialUrl);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [showSignIn, setShowSignIn] = useState(openSignIn);
  const autoStarted = useRef(false);

  const run = async (target: string) => {
    try {
      const { scanId, cached } = await create({ url: target });
      router.push(`/?chart=${scanId}${cached ? "&cached=1" : ""}`);
    } catch (err) {
      const data = err instanceof ConvexError ? (err.data as { code?: ErrorKey; retryAfterMs?: number }) : {};
      if (data.code === "signed_out") setShowSignIn(true);
      setError(errorMessage(data.code, data.retryAfterMs));
      setPending(false);
    }
  };

  const start = async (target: string) => {
    setPending(true);
    await run(target);
  };

  // Back from Google with the URL they typed: carry on where they left off, once.
  const autoStarting = autoStart && isAuthenticated && !error && validateUrl(initialUrl).ok;
  useEffect(() => {
    if (!autoStarting || autoStarted.current) return;
    autoStarted.current = true;
    void run(initialUrl);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- runs once, when auth resolves
  }, [autoStarting, initialUrl]);

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
    await start(url);
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
          <button type="submit" className="btn btn-primary" disabled={isLoading || pending || autoStarting}>
            {intake.submit}
          </button>
        </div>
        <span id="patient-url-help" className={`field-help ${error ? "is-error" : ""}`} role={error ? "alert" : undefined}>
          {error ?? intake.fieldHelp}
        </span>
      </div>
      {!isAuthenticated && <SignInDialog open={showSignIn} onClose={() => setShowSignIn(false)} url={url} />}
    </form>
  );
}
