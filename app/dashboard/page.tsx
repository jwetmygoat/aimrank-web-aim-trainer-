// Placeholder dashboard. Uses mock data for now — in Phase 2 this will pull
// real scores and leaderboards from Supabase.

const MOCK_RUNS = [
  { date: "Today", mode: "Flick 30", score: 1840, accuracy: "92%" },
  { date: "Today", mode: "Flick 30", score: 1615, accuracy: "85%" },
  { date: "Yesterday", mode: "Flick 30", score: 1420, accuracy: "81%" },
];

export default function DashboardPage() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="font-display text-2xl font-bold uppercase tracking-wide">
        Dashboard
      </h1>
      <p className="mt-1 text-sm text-muted">
        Sample data — accounts and saved history arrive in Phase 2.
      </p>

      <div className="mt-8 overflow-hidden rounded border border-edge">
        <table className="w-full text-left text-sm">
          <thead className="bg-surface text-xs uppercase tracking-widest text-muted">
            <tr>
              <th className="px-4 py-3 font-medium">Date</th>
              <th className="px-4 py-3 font-medium">Mode</th>
              <th className="px-4 py-3 font-medium">Score</th>
              <th className="px-4 py-3 font-medium">Accuracy</th>
            </tr>
          </thead>
          <tbody>
            {MOCK_RUNS.map((run, i) => (
              <tr key={i} className="border-t border-edge">
                <td className="px-4 py-3 text-muted">{run.date}</td>
                <td className="px-4 py-3">{run.mode}</td>
                <td className="px-4 py-3 font-mono text-accent">{run.score}</td>
                <td className="px-4 py-3 font-mono">{run.accuracy}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
