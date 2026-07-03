/** Player settings for the game. Saved to localStorage. */

export type GameSettings = {
  /** Crosshair speed multiplier while pointer is locked. */
  sensitivity: number;
  /** Crosshair size in px. */
  crosshairSize: number;
  /** Target radius in px. */
  targetSize: number;
};

export const DEFAULT_SETTINGS: GameSettings = {
  sensitivity: 1,
  crosshairSize: 12,
  targetSize: 28,
};

const STORAGE_KEY = "aimrank-settings";

export function loadSettings(): GameSettings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: GameSettings) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // localStorage unavailable (private mode etc.) — settings just won't persist.
  }
}
