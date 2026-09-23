import Link from "next/link";
import { footer } from "@/lib/copy";
import styles from "./Footer.module.css";

export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={`frame ${styles.inner}`}>
        <span className="mono muted">{footer.line}</span>
        <nav className={styles.links} aria-label={footer.navLabel}>
          <Link className="t-body-sm" href="/privacy">
            {footer.privacy}
          </Link>
          <Link className="t-body-sm" href="/terms">
            {footer.terms}
          </Link>
        </nav>
      </div>
    </footer>
  );
}
