"use client";

import { useEffect, useState } from "react";
import GameCanvas, { type GameResult } from "@/components/GameCanvas";
import SettingsPanel from "@/components/SettingsPanel";
import {
  DEFAULT_SETTINGS,
  loadSettings,
  saveSettings,
  type GameSettings,
} from "@/lib/settings";

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded border border-edge bg-surface px-4 py-3 text-center">
      <div className="font-mono text-xl font-bold">{value}</div>
      <div className="mt-1 text-[11px] uppercase tracking-widest text-muted">
        {label}
      </div>
    </div>
  );
}

export default function PlayPage() {
  const [settings, setSettings] = useState<GameSettings>(DEFAULT_SETTINGS);
  const [result, setResult] = useState<GameResult | null>(null);
  const [best, setBest] = useState<number>(0);

  // Load saved settings once on mount (client only). Reading localStorage in
  // an effect (not in useState) avoids a server/client hydration mismatch.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSettings(loadSettings());
  }, []);

  function updateSettings(next: GameSettings) {
    setSettings(next);
    saveSettings(next);
  }

  function handleFinish(r: GameResult) {
    setResult(r);
    setBest((b) => Math.max(b, r.score));
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-2">
        <div>
          <h1 className="font-display text-2xl font-bold uppercase tracking-wide">
            Flick <span className="text-accent">30</span>
          </h1>
          <p className="text-sm text-muted">
            30-second flick challenge. Best this session:{" "}
            <span className="font-mono text-ink">{best}</span>
          </p>
        </div>
        <p className="text-xs text-muted">Desktop + mouse recommended</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
        <div>
          <GameCanvas settings={settings} onFinish={handleFinish} />

          {result && (
            <section className="mt-6">
              <div className="mb-3 flex items-baseline gap-3">
                <h2 className="font-display text-sm font-semibold uppercase tracking-widest text-muted">
                  Last run
                </h2>
                <span className="font-display text-3xl font-bold text-accent">
                  {result.score}
                </span>
                <span className="text-xs uppercase tracking-widest text-muted">
                  score
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <Stat label="Hits" value={String(result.hits)} />
                <Stat label="Misses" value={String(result.misses)} />
                <Stat
                  label="Accuracy"
                  value={`${Math.round(result.accuracy * 100)}%`}
                />
                <Stat
                  label="Avg reaction"
                  value={`${Math.round(result.avgReactionMs)}ms`}
                />
              </div>
            </section>
          )}
        </div>

        <SettingsPanel settings={settings} onChange={updateSettings} />
      </div>
    </main>
  );
}
