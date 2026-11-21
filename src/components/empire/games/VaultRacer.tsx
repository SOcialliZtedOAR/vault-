import { useEffect, useRef, useState } from "react";
import { Btn, Meter } from "@/components/empire/ui";

type Props = { onFinish: (score: number, win: boolean) => void };

const GATES = 6;
const GHOST_MS = 9000;

function order() {
  const gates = Array.from({ length: GATES }, (_, index) => index);
  for (let i = gates.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const swap = gates[i]!;
    gates[i] = gates[j]!;
    gates[j] = swap;
  }
  return gates;
}

export function VaultRacer({ onFinish }: Props) {
  const finishRef = useRef(onFinish);
  finishRef.current = onFinish;
  const [gates] = useState(order);
  const [phase, setPhase] = useState<"idle" | "show" | "run" | "done">("idle");
  const [cursor, setCursor] = useState(0);
  const [ghost, setGhost] = useState(0);
  const over = useRef(false);
  const ghostRef = useRef(0);
  const cursorRef = useRef(0);

  useEffect(() => {
    if (phase !== "show") return;
    const timer = window.setTimeout(() => setPhase("run"), 1600);
    return () => window.clearTimeout(timer);
  }, [phase]);

  useEffect(() => {
    if (phase !== "run") return;
    let alive = true;
    let last = performance.now();
    let raf = 0;
    const loop = (now: number) => {
      if (!alive || over.current) return;
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      ghostRef.current = Math.min(100, ghostRef.current + (100 / (GHOST_MS / 1000)) * dt);
      setGhost(ghostRef.current);
      if (ghostRef.current >= 100) {
        over.current = true;
        setPhase("done");
        finishRef.current(cursorRef.current * 60, false);
        return;
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      alive = false;
      cancelAnimationFrame(raf);
    };
  }, [phase]);

  const tap = (index: number) => {
    if (phase !== "run" || over.current) return;
    if (index !== gates[cursor]) {
      ghostRef.current = Math.min(100, ghostRef.current + 14);
      setGhost(ghostRef.current);
      if (ghostRef.current >= 100) {
        over.current = true;
        setPhase("done");
        finishRef.current(cursor * 60, false);
      }
      return;
    }
    const next = cursor + 1;
    cursorRef.current = next;
    setCursor(next);
    if (next >= GATES) {
      over.current = true;
      setPhase("done");
      finishRef.current(Math.round(600 - ghostRef.current * 3), true);
    }
  };

  return (
    <div className="grid gap-3">
      <div>
        <p className="mb-1 font-mono text-xs text-muted">Ghost</p>
        <Meter value={ghost} max={100} />
      </div>
      <p className="font-mono text-sm text-muted tabular-nums">
        Tor {Math.min(GATES, cursor + 1)}/{GATES}
        {phase === "show" ? " · merken" : phase === "run" ? " · fahren" : ""}
      </p>
      <p className="min-h-6 font-mono text-lg tracking-widest text-fg" aria-live="polite">
        {phase === "show" ? gates.map((gate) => gate + 1).join("  ") : phase === "idle" ? "Tore stehen bereit" : "Reihenfolge verdeckt"}
      </p>
      <div className="grid grid-cols-3 gap-2">
        {Array.from({ length: GATES }, (_, gate) => (
          <button
            key={gate}
            type="button"
            onClick={() => tap(gate)}
            className="min-h-16 rounded-md border border-border bg-surface text-lg font-extrabold"
          >
            {gate + 1}
          </button>
        ))}
      </div>
      {phase === "idle" ? <Btn onClick={() => setPhase("show")}>Runde starten</Btn> : null}
      <p className="text-sm text-muted">Die Zahlen leuchten kurz. Tippe sie in dieser Reihenfolge, bevor der Ghost voll ist. Ein Fehlgriff schiebt ihn vor.</p>
    </div>
  );
}
