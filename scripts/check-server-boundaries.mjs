import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";

async function filesIn(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map(async (entry) => {
      const path = join(directory, entry.name);
      return entry.isDirectory()
        ? filesIn(path)
        : /\.(?:ts|tsx)$/.test(entry.name)
          ? [path]
          : [];
    }),
  );
  return nested.flat();
}

const sourceFiles = await filesIn("app").then(async (files) => [
  ...files,
  ...(await filesIn("components")),
  ...(await filesIn("lib")),
]);
const secretNames = /\b(?:PAYSTACK_SECRET_KEY|SUPABASE_SERVICE_ROLE_KEY)\b/;
const clientViolations = [];
const secretModuleViolations = [];

for (const file of sourceFiles) {
  if (/\.(?:test|spec)\.tsx?$/.test(file)) continue;
  const source = await readFile(file, "utf8");
  if (/^["']use client["'];/m.test(source) && secretNames.test(source))
    clientViolations.push(file);
  if (
    secretNames.test(source) &&
    !/^import\s+["']server-only["'];/m.test(source)
  )
    secretModuleViolations.push(file);
}

if (clientViolations.length)
  throw new Error(
    `Client modules reference server secrets:\n${clientViolations.join("\n")}`,
  );
if (secretModuleViolations.length)
  throw new Error(
    `Server-secret modules must declare server-only:\n${secretModuleViolations.join("\n")}`,
  );

console.log("Server-secret boundary check passed.");
