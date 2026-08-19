"use client";

export default function AdminOrdersError({
  reset,
}: Readonly<{ error: Error & { digest?: string }; reset: () => void }>) {
  return (
    <section className="mx-auto max-w-3xl px-5 py-16 text-center">
      <div className="surface-card p-10">
        <p className="text-kicker">Orders</p>
        <h1 className="font-display mt-2 text-3xl font-bold">
          Orders are temporarily unavailable
        </h1>
        <p className="mt-3 text-[var(--muted)]">
          No order details were shown. Please try loading this protected page
          again.
        </p>
        <button
          className="admin-button-primary focus-ring mt-6"
          onClick={reset}
          type="button"
        >
          Try again
        </button>
      </div>
    </section>
  );
}
