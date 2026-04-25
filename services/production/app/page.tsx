export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6 py-16">
      <section className="w-full max-w-2xl rounded-3xl border border-slate-200 bg-white p-10 shadow-sm">
        <p className="text-sm font-medium uppercase tracking-[0.3em] text-slate-500">SFMC</p>
        <h1 className="mt-4 text-3xl font-semibold text-slate-900">Production Service</h1>
        <p className="mt-3 text-base leading-7 text-slate-600">
          Service interne de planification et de suivi des lots de production.
        </p>
      </section>
    </main>
  );
}
