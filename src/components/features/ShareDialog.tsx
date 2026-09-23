"use client";

import { useEffect, useRef, useState } from "react";
import { share } from "@/lib/copy";
import { chartUrl, downloadName, linkedInShareUrl, shareImageUrl, xShareUrl } from "@/lib/share";
import styles from "./ShareDialog.module.css";

type Props = {
  open: boolean;
  onClose: () => void;
  scanId: string;
  host: string;
  tierName: string;
  index: number;
};

const COPIED_MS = 2000;

/** The share popup (docs/PRD.md FR-021): the generated chart image, and ways to post, copy or download it. */
export function ShareDialog({ open, onClose, scanId, host, tierName, index }: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showLink, setShowLink] = useState(false);

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

  const url = typeof window === "undefined" ? "" : chartUrl(window.location.origin, scanId);
  const text = share.text(host, tierName, index);
  const image = shareImageUrl(scanId);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
    } catch {
      setShowLink(true); // clipboard blocked: show the link to copy by hand
    }
  };

  return (
    <dialog
      ref={ref}
      className={`dialog ${styles.dialog}`}
      aria-labelledby="share-title"
      onClose={onClose}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose(); // a click on the backdrop
      }}
    >
      {open && (
        <div className={styles.body}>
          <div className={styles.header}>
            <h2 id="share-title" className="t-headline-md">
              {share.title}
            </h2>
            <button type="button" className="btn btn-ghost btn-sm" onClick={onClose}>
              {share.close}
            </button>
          </div>

          <div className={`${styles.preview} ${imageLoaded ? "" : "hatch"}`}>
            {!imageLoaded && <span className="mono muted">{share.imageLoading}</span>}
            {/* Generated per chart by /chart/[id]/opengraph-image; next/image would re-encode a PNG we just made. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              className={styles.image}
              src={image}
              alt={share.imageAlt(host)}
              width={1200}
              height={630}
              onLoad={() => setImageLoaded(true)}
              style={imageLoaded ? undefined : { opacity: 0 }}
            />
          </div>

          <div className={styles.actions}>
            <a className="btn btn-primary" href={xShareUrl(text, url)} target="_blank" rel="noopener noreferrer">
              {share.postOnX}
            </a>
            <a className="btn btn-secondary" href={linkedInShareUrl(url)} target="_blank" rel="noopener noreferrer">
              {share.shareOnLinkedIn}
            </a>
            <button type="button" className="btn btn-ghost" onClick={() => void copyLink()} aria-live="polite">
              {copied ? share.linkCopied : share.copyLink}
            </button>
            <a className="btn btn-ghost" href={image} download={downloadName(host)}>
              {share.downloadImage}
            </a>
          </div>

          {showLink && (
            <div className="field">
              <input
                className="input"
                readOnly
                value={url}
                aria-describedby="share-link-help"
                autoFocus
                onFocus={(e) => e.currentTarget.select()}
              />
              <span id="share-link-help" className="field-help">
                {share.copyFallback}
              </span>
            </div>
          )}
        </div>
      )}
    </dialog>
  );
}
