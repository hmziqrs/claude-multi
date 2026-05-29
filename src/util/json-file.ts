import { readFile, writeFile, rename, unlink } from "node:fs/promises";
import { randomBytes } from "node:crypto";

export async function writeJsonFileAtomic<T>(filePath: string, data: T): Promise<void> {
  const tmpPath = filePath + ".tmp." + randomBytes(4).toString("hex");
  try {
    await writeFile(tmpPath, JSON.stringify(data, null, 2), "utf-8");
    const content = await readFile(tmpPath, "utf-8");
    JSON.parse(content);
    await rename(tmpPath, filePath);
  } catch (err) {
    try { await unlink(tmpPath); } catch {}
    throw err;
  }
}
