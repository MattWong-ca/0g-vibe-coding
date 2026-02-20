export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { Indexer } from "@0glabs/0g-ts-sdk";
import { readFile, unlink } from "fs/promises";
import { tmpdir } from "os";
import { join } from "path";
import { randomBytes } from "crypto";

const INDEXER_RPC = process.env.STORAGE_INDEXER_RPC ?? "https://indexer-storage-testnet-turbo.0g.ai";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ rootHash: string }> }
) {
  const { rootHash } = await params;
  const tmpPath = join(tmpdir(), `0g-download-${randomBytes(8).toString("hex")}`);

  try {
    const indexer = new Indexer(INDEXER_RPC);
    const err = await indexer.download(rootHash, tmpPath, false);
    if (err) throw new Error(`Download error: ${err}`);

    const buffer = await readFile(tmpPath);
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/octet-stream",
        "Content-Disposition": `attachment; filename="${rootHash}"`,
      },
    });
  } finally {
    await unlink(tmpPath).catch(() => {});
  }
}
