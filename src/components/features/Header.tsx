"use client";

import { useAuthActions } from "@convex-dev/auth/react";
import { useConvexAuth } from "convex/react";
import Link from "next/link";
import { header } from "@/lib/copy";
import styles from "./Header.module.css";
import { LogoMark } from "./LogoMark";

export function Header() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const { signOut } = useAuthActions();

  return (
    <header className={styles.header}>
      <div className={`frame ${styles.inner}`}>
        <Link href="/" className={styles.wordmark}>
          <LogoMark />
          {header.wordmark}
        </Link>
        {isLoading ? null : isAuthenticated ? (
          <button type="button" className="btn btn-ghost" onClick={() => void signOut()}>
            {header.signOut}
          </button>
        ) : (
          <Link href="/?signin=1" className="btn btn-ghost">
            {header.signIn}
          </Link>
        )}
      </div>
    </header>
  );
}
