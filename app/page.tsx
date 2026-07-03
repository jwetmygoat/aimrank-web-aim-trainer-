import Link from "next/link";

export default function Home() {
  return (
    <main className="mx-auto max-w-5xl px-4">
      {/* Hero */}
      <section className="flex flex-col items-center py-20 text-center sm:py-28">
        <p className="mb-4 font-mono text-xs uppercase tracking-[0.3em] text-muted">
          30 seconds &middot; one score &middot; no excuses
        </p>
        <h1 className="font-display text-4xl font-bold uppercase leading-tight tracking-wide sm:text-6xl">
          Train your flicks.
          <br />
          <span className="text-accent">Climb the rank.</span>
        </h1>
        <p className="mt-6 max-w-md text-muted">
          Fast browser-based aim challenges. Hit targets, get scored on
          accuracy and reaction time, and see how you stack up.
        </p>
        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/play"
            className="rounded bg-accent px-8 py-3 font-display font-bold uppercase tracking-widest text-bg hover:opacity-90"
          >
            Play now
          </Link>
          <Link
            href="/dashboard"
            className="rounded border border-edge px-8 py-3 font-display font-semibold uppercase tracking-widest text-muted hover:border-muted hover:text-ink"
          >
            Dashboard
          </Link>
        </div>
      </section>

      {/* How scoring works */}
      <section className="grid gap-4 pb-20 sm:grid-cols-3">
        {[
          {
            title: "Flick mode",
            body: "One target at a time. Snap to it, click it, next one spawns. 30 seconds on the clock.",
          },
          {
            title: "Scored on precision",
            body: "Score = hits × 100 × accuracy. Spraying wildly tanks your score — every miss counts.",
          },
          {
            title: "Reaction tracked",
            body: "Average reaction time is measured per target, so you can watch yourself get faster.",
          },
        ].map((f) => (
          <div
            key={f.title}
            className="rounded border border-edge bg-surface p-6"
          >
            <h2 className="font-display text-sm font-semibold uppercase tracking-widest text-accent">
              {f.title}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted">{f.body}</p>
          </div>
        ))}
      </section>
    </main>
  );
}
