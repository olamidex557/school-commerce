import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { readFile } from "node:fs/promises";

const execFileAsync = promisify(execFile);
const { stdout } = await execFileAsync("git", [
  "ls-files",
  "--cached",
  "--others",
  "--exclude-standard",
]);
const files = stdout.split("\n").filter(Boolean);
const forbidden = [
  {
    name: "Paystack secret key",
    expression: /\bsk_(?:test|live)_[A-Za-z0-9]{16,}\b/,
  },
  {
    name: "Supabase service-role JWT",
    expression:
      /\beyJ[a-zA-Z0-9_-]{20,}\.[a-zA-Z0-9_-]{20,}\.[a-zA-Z0-9_-]{20,}\b/,
  },
  {
    name: "public server secret variable",
    expression:
      /NEXT_PUBLIC_(?:PAYSTACK_SECRET_KEY|SUPABASE_SERVICE_ROLE_KEY)\b/,
  },
];

const violations = [];
for (const file of files) {
  if (file === ".env.example" || file.endsWith(".lock")) continue;
  const content = await readFile(file, "utf8").catch(() => null);
  if (content === null) continue;
  for (const { name, expression } of forbidden) {
    if (expression.test(content)) violations.push(`${file}: ${name}`);
  }
}

if (violations.length)
  throw new Error(
    `Potential secret exposure detected:\n${violations.join("\n")}`,
  );

console.log("Secret exposure check passed.");
