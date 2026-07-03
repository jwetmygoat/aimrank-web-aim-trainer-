/**
 * Pure score math for AimRank. No React, no browser APIs — easy to test.
 */

/** Accuracy as a fraction from 0 to 1. Returns 0 if no shots were fired. */
export function accuracy(hits: number, misses: number): number {
  const shots = hits + misses;
  if (shots <= 0) return 0;
  return hits / shots;
}

/** Average reaction time in ms. Returns 0 for an empty list. */
export function averageReaction(reactionTimesMs: number[]): number {
  if (reactionTimesMs.length === 0) return 0;
  const sum = reactionTimesMs.reduce((a, b) => a + b, 0);
  return sum / reactionTimesMs.length;
}

/**
 * Final score: hits * 100, scaled by accuracy.
 * 20 hits / 0 misses  -> 2000
 * 20 hits / 20 misses -> 1000
 * 0 hits              -> 0
 */
export function calculateScore(hits: number, misses: number): number {
  return Math.round(hits * 100 * accuracy(hits, misses));
}
