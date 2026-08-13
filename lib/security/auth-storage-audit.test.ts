import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";
import { describe, expect, it } from "vitest";

const authSourceRoots = [
  "app/admin",
  "components/admin",
  "lib/auth",
  "lib/supabase",
  "proxy.ts",
];
const forbiddenPersistence =
  /\b(localStorage|sessionStorage|indexedDB|document\.cookie)\b/;

async function sourceFiles(entry: string): Promise<string[]> {
  const resolved = path.join(process.cwd(), entry);
  if (!(await stat(resolved)).isDirectory()) return [resolved];
  const entries = await readdir(resolved, { withFileTypes: true });
  return (
    await Promise.all(
      entries.map((child) => sourceFiles(path.join(entry, child.name))),
    )
  ).flat();
}

describe("authentication storage boundary", () => {
  it("does not manually persist authentication data in browser storage", async () => {
    const files = (await Promise.all(authSourceRoots.map(sourceFiles))).flat();
    const sources = await Promise.all(
      files.map(async (file) => [file, await readFile(file, "utf8")] as const),
    );
    expect(
      sources.filter(([, source]) => forbiddenPersistence.test(source)),
    ).toEqual([]);
  });
});
