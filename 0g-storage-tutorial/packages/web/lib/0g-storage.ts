export async function uploadFile(file: File): Promise<{ rootHash: string; txHash: string }> {
  const form = new FormData();
  form.append("file", file);
  const res = await fetch("/api/upload", { method: "POST", body: form });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function downloadFile(rootHash: string, filename?: string): Promise<void> {
  const res = await fetch(`/api/download/${rootHash}`);
  if (!res.ok) throw new Error(await res.text());
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename ?? rootHash;
  a.click();
  URL.revokeObjectURL(url);
}
