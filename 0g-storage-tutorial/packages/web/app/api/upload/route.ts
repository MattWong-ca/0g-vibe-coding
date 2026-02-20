export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { ZgFile, Indexer } from "@0glabs/0g-ts-sdk";
import { ethers } from "ethers";
import { writeFile, unlink } from "fs/promises";
import { tmpdir } from "os";
import { join } from "path";
import { randomBytes } from "crypto";

const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL ?? "https://evmrpc-testnet.0g.ai";
const INDEXER_RPC = process.env.STORAGE_INDEXER_RPC ?? "https://indexer-storage-testnet-turbo.0g.ai";

export async function POST(req: NextRequest) {
  const privateKey = process.env.PRIVATE_KEY;
  if (!privateKey) {
    return NextResponse.json({ error: "PRIVATE_KEY not configured" }, { status: 500 });
  }

  const form = await req.formData();
  const file = form.get("file") as File | null;
  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }
  if (file.size === 0) {
    return NextResponse.json({ error: "File is empty" }, { status: 400 });
  }

  const tmpPath = join(tmpdir(), `0g-upload-${randomBytes(8).toString("hex")}`);
  try {
    await writeFile(tmpPath, Buffer.from(await file.arrayBuffer()));

    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const signer = new ethers.Wallet(privateKey, provider);
    const indexer = new Indexer(INDEXER_RPC);

    const zgFile = await ZgFile.fromFilePath(tmpPath);
    const [tree, treeErr] = await zgFile.merkleTree();
    if (treeErr) throw new Error(`Merkle tree error: ${treeErr}`);
    if (!tree) throw new Error("Merkle tree is null");

    const [tx, uploadErr] = await indexer.upload(zgFile, RPC_URL, signer);
    if (uploadErr) throw new Error(`Upload error: ${uploadErr}`);

    await zgFile.close();

    return NextResponse.json({ rootHash: tx.rootHash, txHash: tx.txHash });
  } finally {
    await unlink(tmpPath).catch(() => {});
  }
}
