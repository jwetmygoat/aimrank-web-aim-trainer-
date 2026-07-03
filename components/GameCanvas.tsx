"use client";

import { useEffect, useRef, useState } from "react";
import {
  accuracy,
  averageReaction,
  calculateScore,
} from "@/lib/score";
import type { GameSettings } from "@/lib/settings";

export type GameResult = {
  hits: number;
  misses: number;
  accuracy: number; // 0..1
  avgReactionMs: number;
  score: number;
};

type Phase = "idle" | "running" | "finished";

const GAME_DURATION_MS = 30_000;
const LOGICAL_W = 900; // canvas coordinate space (independent of screen size)
const LOGICAL_H = 540;
const MIN_FLICK_DISTANCE = 120; // new targets spawn at least this far from the crosshair

export default function GameCanvas({
  settings,
  onFinish,
}: {
  settings: GameSettings;
  onFinish: (result: GameResult) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [phase, setPhase] = useState<Phase>("idle");

  // Mutable game state lives in refs so the animation loop never fights React re-renders.
  const game = useRef({
    phase: "idle" as Phase,
    startedAt: 0,
    crosshair: { x: LOGICAL_W / 2, y: LOGICAL_H / 2 },
    target: { x: 0, y: 0, spawnedAt: 0 },
    hits: 0,
    misses: 0,
    reactions: [] as number[],
    hitFlash: null as { x: number; y: number; at: number } | null,
  });

  // Keep the latest settings and onFinish readable from inside the loop
  // (the loop is created once, so it must read fresh values via refs).
  const settingsRef = useRef(settings);
  const onFinishRef = useRef(onFinish);
  useEffect(() => {
    settingsRef.current = settings;
    onFinishRef.current = onFinish;
  }, [settings, onFinish]);

  function spawnTarget() {
    const g = game.current;
    const r = settingsRef.current.targetSize;
    const margin = r + 12;
    let x = 0;
    let y = 0;
    // Try a few times to spawn away from the crosshair so there is a real flick.
    for (let i = 0; i < 20; i++) {
      x = margin + Math.random() * (LOGICAL_W - margin * 2);
      y = margin + Math.random() * (LOGICAL_H - margin * 2);
      const dx = x - g.crosshair.x;
      const dy = y - g.crosshair.y;
      if (Math.hypot(dx, dy) >= MIN_FLICK_DISTANCE) break;
    }
    g.target = { x, y, spawnedAt: performance.now() };
  }

  function startGame() {
    const g = game.current;
    g.phase = "running";
    g.startedAt = performance.now();
    g.hits = 0;
    g.misses = 0;
    g.reactions = [];
    g.hitFlash = null;
    g.crosshair = { x: LOGICAL_W / 2, y: LOGICAL_H / 2 };
    spawnTarget();
    setPhase("running");
    // Pointer lock makes "sensitivity" meaningful. If the browser refuses, we
    // fall back to following the real cursor (handled in mousemove).
    canvasRef.current?.requestPointerLock?.();
  }

  function endGame() {
    const g = game.current;
    g.phase = "finished";
    setPhase("finished");
    if (document.pointerLockElement) document.exitPointerLock();
    onFinishRef.current({
      hits: g.hits,
      misses: g.misses,
      accuracy: accuracy(g.hits, g.misses),
      avgReactionMs: averageReaction(g.reactions),
      score: calculateScore(g.hits, g.misses),
    });
  }

  // Main effect: input listeners + render loop. Runs once.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Scale for sharp rendering on high-DPI screens.
    const dpr = window.devicePixelRatio || 1;
    canvas.width = LOGICAL_W * dpr;
    canvas.height = LOGICAL_H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const clamp = (v: number, min: number, max: number) =>
      Math.min(max, Math.max(min, v));

    function toLogical(e: MouseEvent) {
      const rect = canvas!.getBoundingClientRect();
      return {
        x: ((e.clientX - rect.left) / rect.width) * LOGICAL_W,
        y: ((e.clientY - rect.top) / rect.height) * LOGICAL_H,
      };
    }

    function onMouseMove(e: MouseEvent) {
      const g = game.current;
      if (document.pointerLockElement === canvas) {
        // Locked: relative movement * sensitivity.
        const s = settingsRef.current.sensitivity;
        g.crosshair.x = clamp(g.crosshair.x + e.movementX * s, 0, LOGICAL_W);
        g.crosshair.y = clamp(g.crosshair.y + e.movementY * s, 0, LOGICAL_H);
      } else {
        // Unlocked fallback: crosshair follows the cursor.
        const p = toLogical(e);
        g.crosshair.x = clamp(p.x, 0, LOGICAL_W);
        g.crosshair.y = clamp(p.y, 0, LOGICAL_H);
      }
    }

    function onMouseDown() {
      const g = game.current;
      if (g.phase !== "running") return;
      const dx = g.crosshair.x - g.target.x;
      const dy = g.crosshair.y - g.target.y;
      const now = performance.now();
      if (Math.hypot(dx, dy) <= settingsRef.current.targetSize) {
        g.hits += 1;
        g.reactions.push(now - g.target.spawnedAt);
        g.hitFlash = { x: g.target.x, y: g.target.y, at: now };
        spawnTarget();
      } else {
        g.misses += 1;
      }
    }

    canvas.addEventListener("mousemove", onMouseMove);
    canvas.addEventListener("mousedown", onMouseDown);

    let raf = 0;
    function draw() {
      const g = game.current;
      const s = settingsRef.current;
      const now = performance.now();

      // Background
      ctx!.fillStyle = "#0e1116";
      ctx!.fillRect(0, 0, LOGICAL_W, LOGICAL_H);

      // Subtle grid for spatial reference
      ctx!.strokeStyle = "rgba(140, 151, 166, 0.07)";
      ctx!.lineWidth = 1;
      for (let x = 0; x <= LOGICAL_W; x += 60) {
        ctx!.beginPath();
        ctx!.moveTo(x, 0);
        ctx!.lineTo(x, LOGICAL_H);
        ctx!.stroke();
      }
      for (let y = 0; y <= LOGICAL_H; y += 60) {
        ctx!.beginPath();
        ctx!.moveTo(0, y);
        ctx!.lineTo(LOGICAL_W, y);
        ctx!.stroke();
      }

      if (g.phase === "running") {
        const elapsed = now - g.startedAt;
        if (elapsed >= GAME_DURATION_MS) {
          endGame();
        } else {
          // Target
          ctx!.beginPath();
          ctx!.arc(g.target.x, g.target.y, s.targetSize, 0, Math.PI * 2);
          ctx!.fillStyle = "#ff4655";
          ctx!.fill();
          ctx!.beginPath();
          ctx!.arc(g.target.x, g.target.y, s.targetSize * 0.55, 0, Math.PI * 2);
          ctx!.fillStyle = "#0e1116";
          ctx!.fill();
          ctx!.beginPath();
          ctx!.arc(g.target.x, g.target.y, s.targetSize * 0.2, 0, Math.PI * 2);
          ctx!.fillStyle = "#ff4655";
          ctx!.fill();

          // Hit flash (expanding ring, 150ms)
          if (g.hitFlash) {
            const t = (now - g.hitFlash.at) / 150;
            if (t >= 1) {
              g.hitFlash = null;
            } else {
              ctx!.beginPath();
              ctx!.arc(g.hitFlash.x, g.hitFlash.y, s.targetSize * (1 + t), 0, Math.PI * 2);
              ctx!.strokeStyle = `rgba(61, 220, 151, ${1 - t})`;
              ctx!.lineWidth = 3;
              ctx!.stroke();
            }
          }

          // HUD
          const secondsLeft = Math.ceil((GAME_DURATION_MS - elapsed) / 1000);
          ctx!.fillStyle = "#e9edf3";
          ctx!.font = "700 28px ui-monospace, monospace";
          ctx!.textAlign = "center";
          ctx!.fillText(String(secondsLeft), LOGICAL_W / 2, 40);

          ctx!.font = "500 14px ui-monospace, monospace";
          ctx!.textAlign = "left";
          const acc = Math.round(accuracy(g.hits, g.misses) * 100);
          ctx!.fillStyle = "#8c97a6";
          ctx!.fillText(`HITS ${g.hits}   MISS ${g.misses}   ACC ${acc}%`, 16, 28);

          ctx!.textAlign = "right";
          const avg = Math.round(averageReaction(g.reactions));
          ctx!.fillText(`AVG ${avg}ms`, LOGICAL_W - 16, 28);
        }
      }

      // Crosshair (always drawn so settings changes are visible immediately)
      const c = g.crosshair;
      const half = s.crosshairSize / 2;
      const gap = 3;
      ctx!.strokeStyle = "#3ddc97";
      ctx!.lineWidth = 2;
      ctx!.beginPath();
      ctx!.moveTo(c.x - half, c.y);
      ctx!.lineTo(c.x - gap, c.y);
      ctx!.moveTo(c.x + gap, c.y);
      ctx!.lineTo(c.x + half, c.y);
      ctx!.moveTo(c.x, c.y - half);
      ctx!.lineTo(c.x, c.y - gap);
      ctx!.moveTo(c.x, c.y + gap);
      ctx!.lineTo(c.x, c.y + half);
      ctx!.stroke();

      raf = requestAnimationFrame(draw);
    }
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      canvas.removeEventListener("mousemove", onMouseMove);
      canvas.removeEventListener("mousedown", onMouseDown);
    };
  }, []);

  return (
    <div className="relative w-full">
      <canvas
        ref={canvasRef}
        className="game-canvas w-full rounded border border-edge"
        style={{ aspectRatio: `${LOGICAL_W} / ${LOGICAL_H}` }}
      />
      {phase !== "running" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 rounded bg-bg/80">
          <button
            onClick={startGame}
            className="rounded bg-accent px-10 py-4 font-display text-lg font-bold uppercase tracking-widest text-bg hover:opacity-90"
          >
            {phase === "idle" ? "Start" : "Play again"}
          </button>
          <p className="max-w-xs text-center text-sm text-muted">
            30 seconds. One target at a time — click it, the next one spawns.
            Press Esc to release your mouse.
          </p>
        </div>
      )}
    </div>
  );
}
