import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";

const migrationsDirectory = "supabase/migrations";
const migrationName = /^(\d{12})_([a-z0-9_]+)\.sql$/;
const unsafeStatements = [
  /\bdrop\s+table\b/i,
  /\btruncate\b/i,
  /\bdelete\s+from\b/i,
  /\balter\s+table\b[\s\S]{0,200}\bdrop\s+column\b/i,
];

const files = (await readdir(migrationsDirectory))
  .filter((file) => file.endsWith(".sql"))
  .sort();

if (!files.length) throw new Error("No Supabase migrations were found.");

const versions = new Set();
for (const file of files) {
  const match = migrationName.exec(file);
  if (!match) throw new Error(`Invalid migration filename: ${file}`);
  if (versions.has(match[1]))
    throw new Error(`Duplicate migration version: ${match[1]}`);
  versions.add(match[1]);

  const sql = await readFile(join(migrationsDirectory, file), "utf8");
  if (!sql.trim()) throw new Error(`Migration is empty: ${file}`);
  for (const expression of unsafeStatements) {
    if (expression.test(sql))
      throw new Error(
        `Potentially destructive SQL is not permitted in automated migration checks: ${file}`,
      );
  }
}

console.log(
  `Migration safety check passed for ${files.length} immutable migrations.`,
);
