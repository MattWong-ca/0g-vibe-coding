"use client";
import styles from "./page.module.css";
import { StorageSection } from "@/components/StorageSection";

export default function Home() {
  return (
    <main className={styles.main}>
      <StorageSection />
      
    </main>
  );
}
