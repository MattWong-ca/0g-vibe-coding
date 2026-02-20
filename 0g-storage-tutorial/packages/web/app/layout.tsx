import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { Providers } from "./providers";
import { Navbar } from "@/components/Navbar";
import "./globals.css";

const geist = Geist({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "create-0g-app",
  description: "Decentralized app powered by 0G",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const missingKey = !process.env.PRIVATE_KEY;

  return (
    <html lang="en">
      <body className={geist.className}>
        <Providers>
          <Navbar />
          {missingKey && (
            <div style={{
              background: "#fef3c7",
              borderBottom: "1px solid #f59e0b",
              color: "#92400e",
              fontSize: "0.85rem",
              padding: "10px 24px",
            }}>
              ⚠ <strong>PRIVATE_KEY</strong> is not set.
              Add it to <code>packages/web/.env.local</code> to enable storage and compute.{" "}
              <a href="https://faucet.0g.ai" target="_blank" rel="noopener noreferrer" style={{ color: "#92400e", fontWeight: 600 }}>
                Get testnet OG ↗
              </a>
            </div>
          )}
          {children}
        </Providers>
      </body>
    </html>
  );
}
