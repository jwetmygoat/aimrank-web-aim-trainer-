"use client";

import type { GameSettings } from "@/lib/settings";
import { DEFAULT_SETTINGS } from "@/lib/settings";

function Slider({
  label,
  value,
  min,
  max,
  step,
  unit,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit?: string;
  onChange: (v: number) => void;
}) {
  return (
    <label className="block">
      <div className="mb-1 flex items-center justify-between text-xs uppercase tracking-wider">
        <span className="text-muted">{label}</span>
        <span className="font-mono text-ink">
          {value}
          {unit ?? ""}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-accent"
      />
    </label>
  );
}

export default function SettingsPanel({
  settings,
  onChange,
}: {
  settings: GameSettings;
  onChange: (s: GameSettings) => void;
}) {
  return (
    <div className="rounded border border-edge bg-surface p-5">
      <h2 className="mb-4 font-display text-sm font-semibold uppercase tracking-widest">
        Settings
      </h2>
      <div className="space-y-5">
        <Slider
          label="Sensitivity"
          value={settings.sensitivity}
          min={0.2}
          max={3}
          step={0.1}
          unit="x"
          onChange={(v) => onChange({ ...settings, sensitivity: v })}
        />
        <Slider
          label="Crosshair size"
          value={settings.crosshairSize}
          min={6}
          max={30}
          step={1}
          unit="px"
          onChange={(v) => onChange({ ...settings, crosshairSize: v })}
        />
        <Slider
          label="Target size"
          value={settings.targetSize}
          min={12}
          max={60}
          step={1}
          unit="px"
          onChange={(v) => onChange({ ...settings, targetSize: v })}
        />
      </div>
      <button
        onClick={() => onChange(DEFAULT_SETTINGS)}
        className="mt-5 text-xs uppercase tracking-wider text-muted underline-offset-4 hover:text-ink hover:underline"
      >
        Reset to defaults
      </button>
      <p className="mt-4 text-xs leading-relaxed text-muted">
        Sensitivity applies while your mouse is captured by the game (after you
        press Start). Smaller targets and lower sensitivity = harder.
      </p>
    </div>
  );
}
