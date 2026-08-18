const target = process.env.SMOKE_URL;
const production = process.argv.includes("--production");

if (!target || !URL.canParse(target))
  throw new Error("SMOKE_URL must be an absolute deployment URL.");
const origin = new URL(target);
if (origin.protocol !== "https:")
  throw new Error("Smoke tests require an HTTPS deployment URL.");

async function expectStatus(path, expected, options) {
  const response = await fetch(new URL(path, origin), {
    redirect: "manual",
    signal: AbortSignal.timeout(10_000),
    ...options,
  });
  if (response.status !== expected)
    throw new Error(
      `${path}: expected ${expected}, received ${response.status}`,
    );
}

await expectStatus("/", 200);
await expectStatus("/shop", 200);
await expectStatus("/checkout", 200);

if (production) {
  await expectStatus("/api/payments/paystack/callback", 307);
  await expectStatus("/api/payments/paystack/webhook", 401, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-paystack-signature": "invalid",
    },
    body: "{}",
  });
}

console.log(
  `Smoke checks passed for ${origin.origin}${production ? " (production gate)" : ""}.`,
);
