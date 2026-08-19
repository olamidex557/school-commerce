export default function AdminOrdersLoading() {
  return (
    <section className="mx-auto max-w-6xl px-5 py-10" aria-busy="true">
      <div className="h-4 w-24 animate-pulse rounded bg-[var(--line)]" />
      <div className="mt-3 h-12 w-52 animate-pulse rounded bg-[var(--line)]" />
      <div className="surface-card mt-8 h-28 animate-pulse" />
      <div className="surface-card mt-6 h-96 animate-pulse" />
    </section>
  );
}
