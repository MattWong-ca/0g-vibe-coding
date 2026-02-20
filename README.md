# 0G Storage in 5 mins

Upload files to 0G's decentralized storage network and verify the transaction on the Galileo testnet block explorer — all from a Next.js app.

## What you'll build

A web app where users can drag-and-drop a file, upload it to 0G storage, and get a link to the on-chain transaction proof.

**Stack:** Next.js 15 · `@0glabs/0g-ts-sdk` · ethers v6 · 0G Galileo Testnet

---

## Prerequisites

- Node.js 18+
- A wallet private key with OG testnet tokens ([faucet](https://hub.0g.ai/faucet))

---

## Setup

**1. Create your app**

```bash
npx create-0g-app@latest
```

Enter a project name when prompted, then select **Storage** from the feature options.

> This scaffolds the project and automatically runs a post-install patch (`scripts/patch-0g-sdk.js`) that fixes the `@0glabs/0g-ts-sdk` v0.3.3 ABI to match the current Galileo testnet contract. See [SDK patch](#sdk-patch) below.

**2. Set your environment variables**

Create `packages/web/.env.local`:

```env
PRIVATE_KEY=0xYOUR_PRIVATE_KEY_HERE

# Optional — these are the defaults
NEXT_PUBLIC_RPC_URL=https://evmrpc-testnet.0g.ai
STORAGE_INDEXER_RPC=https://indexer-storage-testnet-turbo.0g.ai
```

> `PRIVATE_KEY` is used server-side only (in API routes) and is never exposed to the browser.

**3. Run**

```bash
cd your-project-name
npm run dev
```

Open [http://localhost:3000](http://localhost:3000), drop in a file, and watch it land on-chain.

---

## How it works

### Chain config — `lib/wagmi.ts`

Defines the Galileo testnet as a custom viem chain and wires up wagmi:

```ts
export const galileo = defineChain({
  id: 16602,
  name: "0G Galileo Testnet",
  nativeCurrency: { name: "OG", symbol: "OG", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://evmrpc-testnet.0g.ai"] },
  },
  blockExplorers: {
    default: { name: "0G Chainscan", url: "https://chainscan-galileo.0g.ai" },
  },
});
```

---

### Upload API route — `app/api/upload/route.ts`

This is the core of the tutorial. The route receives a file, saves it to a temp path, then uses the 0G SDK to upload it:

```ts
import { ZgFile, Indexer } from "@0glabs/0g-ts-sdk";
import { ethers } from "ethers";

// 1. Create a provider + signer from your private key
const provider = new ethers.JsonRpcProvider(RPC_URL);
const signer = new ethers.Wallet(privateKey, provider);

// 2. Create an Indexer — this selects the best storage node automatically
const indexer = new Indexer(INDEXER_RPC);

// 3. Load the file and build its Merkle tree
const zgFile = await ZgFile.fromFilePath(tmpPath);
const [tree, treeErr] = await zgFile.merkleTree();

// 4. Upload — submits the on-chain tx and uploads data to the storage node
const [tx, uploadErr] = await indexer.upload(zgFile, RPC_URL, signer);

// tx.rootHash  — the Merkle root, used to retrieve the file later
// tx.txHash    — the Ethereum tx hash for on-chain proof
```

The response sends both hashes back to the browser:

```ts
return NextResponse.json({ rootHash: tx.rootHash, txHash: tx.txHash });
```

---

### Download API route — `app/api/download/[rootHash]/route.ts`

Downloads a file by its Merkle root hash:

```ts
const indexer = new Indexer(INDEXER_RPC);
const err = await indexer.download(rootHash, tmpPath, false);
const buffer = await readFile(tmpPath);
// Stream the file back to the browser
```

---

### Frontend — `components/StorageSection.tsx`

The UI calls the upload API and renders results. After a successful upload, a link to the Galileo block explorer appears:

```tsx
<a href={`https://chainscan-galileo.0g.ai/tx/${f.txHash}`}>
  View on explorer ↗
</a>
```

---

## Key concepts

| Concept | What it is |
|---|---|
| **`ZgFile`** | Wraps a local file and computes its Merkle tree for integrity proofs |
| **`Indexer`** | Chooses the best storage node and coordinates upload/download |
| **Root hash** | The Merkle root — a content address for retrieving your file from any node |
| **Tx hash** | The on-chain transaction confirming the file was submitted to 0G |

---

## SDK patch

The npm package `@0glabs/0g-ts-sdk@0.3.3` ships an outdated ABI. The Galileo testnet updated the `Submission` struct to include an `address submitter` field, changing the `submit()` function selector from `0xef3e12dc` → `0xbc8c11f8`.

`scripts/patch-0g-sdk.js` runs automatically after `npm install` and patches the two affected files in the SDK (`FixedPriceFlow__factory.js` and `Uploader.js`). No action needed — just be aware if you upgrade the SDK version.

---

## Verify on-chain

After uploading, click **View on explorer** or go to:

```
https://chainscan-galileo.0g.ai/tx/<YOUR_TX_HASH>
```

You'll see the `submit()` call to the 0G Flow contract with your file's Merkle root embedded in the calldata.

---

## Resources

- [0G Docs](https://docs.0g.ai)
- [Faucet](https://hub.0g.ai/faucet)
- [Explorer](https://chainscan-galileo.0g.ai)
