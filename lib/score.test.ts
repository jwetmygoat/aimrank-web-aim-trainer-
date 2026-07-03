import { describe, expect, it } from "vitest";
import { accuracy, averageReaction, calculateScore } from "./score";

describe("accuracy", () => {
  it("is 0 when no shots were fired", () => {
    expect(accuracy(0, 0)).toBe(0);
  });
  it("is 1 with only hits", () => {
    expect(accuracy(10, 0)).toBe(1);
  });
  it("is 0.5 with equal hits and misses", () => {
    expect(accuracy(5, 5)).toBe(0.5);
  });
  it("is 0 with only misses", () => {
    expect(accuracy(0, 7)).toBe(0);
  });
});

describe("averageReaction", () => {
  it("is 0 for no targets hit", () => {
    expect(averageReaction([])).toBe(0);
  });
  it("averages reaction times", () => {
    expect(averageReaction([200, 400])).toBe(300);
  });
});

describe("calculateScore", () => {
  it("is 0 when nothing happened", () => {
    expect(calculateScore(0, 0)).toBe(0);
  });
  it("gives full value at 100% accuracy", () => {
    expect(calculateScore(20, 0)).toBe(2000);
  });
  it("halves the score at 50% accuracy", () => {
    expect(calculateScore(20, 20)).toBe(1000);
  });
  it("is 0 with only misses", () => {
    expect(calculateScore(0, 15)).toBe(0);
  });
  it("rounds to a whole number", () => {
    // 7 hits, 2 misses -> 7 * 100 * (7/9) = 544.44 -> 544
    expect(calculateScore(7, 2)).toBe(544);
  });
});
