"use client";
import Link from "next/link";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import styles from "./Navbar.module.css";

export function Navbar() {
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();

  return (
    <nav className={styles.nav}>
      <Link href="/" className={styles.logo}>
        <span className={styles.accent}>create</span>-0g-app
      </Link>
      <div className={styles.right}>
        {isConnected ? (
          <>
            <span className={styles.address}>{address?.slice(0, 6)}…{address?.slice(-4)}</span>
            <button className={styles.btnSecondary} onClick={() => disconnect()}>Disconnect</button>
          </>
        ) : (
          <button className={styles.btnPrimary} onClick={() => connect({ connector: connectors[0] })}>
            Connect Wallet
          </button>
        )}
      </div>
    </nav>
  );
}
