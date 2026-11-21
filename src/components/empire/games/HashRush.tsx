import { useEffect, useRef, useState } from "react";
import { Btn } from "@/components/empire/ui";

type Props = { onFinish: (score: number, win: boolean) => void };

export function HashRush({ onFinish }: Props) {
  const finishRef = useRef(onFinish);
  finishRef.current = onFinish;
  const markRef = useRef<HTMLDivElement>(null);
  const needle = useRef(0);
  const dir = useRef(1);
  const done = useRef(false);
  const [phase, setPhase] = useState<"idle" | "run">("idle");
  const [hits, setHits] = useState<number[]>([]);

  useEffect(() => {
    if (phase !== "run") return;
    let raf = 0;
    let last = performance.now();
    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (!document.hidden) {
        needle.current += dir.current * dt * 0.95;
        if (needle.current >= 1) {
          needle.current = 1;
          dir.current = -1;
        }
        if (needle.current <= 0) {
          needle.current = 0;
          dir.current = 1;
        }
        if (markRef.current) markRef.current.style.left = `${needle.current * 100}%`;
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [phase]);

  const lock = () => {
    if (phase !== "run" || done.current) return;
    const accuracy = Math.max(0, Math.round((1 - Math.abs(needle.current - 0.5) / 0.5) * 100));
    const next = [...hits, accuracy];
    setHits(next);
    if (next.length >= 5) {
      done.current = true;
      finishRef.current(
        next.reduce((sum, n) => sum + n, 0),
        true,
      );
    }
  };

  useEffect(() => {
    if (phase !== "run") return;
    const onKey = (event: KeyboardEvent) => {
      if (event.code === "Space" || event.code === "Enter") {
        event.preventDefault();
        lock();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  return (
    <div className="grid gap-4">
      <p className="font-mono text-sm text-muted tabular-nums" aria-live="polite">
        Schlag {Math.min(hits.length + (phase === "run" && hits.length < 5 ? 1 : 0), 5)} / 5
        {hits.length > 0 ? ` · zuletzt ${hits[hits.length - 1]}` : ""}
      </p>
      <button
        type="button"
        className="relative h-16 overflow-hidden rounded-md border border-border bg-bg"
        onClick={lock}
        disabled={phase !== "run"}
        aria-label="Goldzone treffen"
      >
        <span className="absolute inset-y-2 left-[42%] w-[16%] rounded-sm bg-accent/30" />
        <span
          ref={markRef}
          className="absolute top-1 bottom-1 w-1 -translate-x-1/2 rounded-sm bg-primary"
          style={{ left: "0%" }}
        />
      </button>
      <div className="grid grid-cols-5 gap-2">
        {Array.from({ length: 5 }, (_, index) => (
          <span
            key={index}
            className="grid min-h-11 place-items-center rounded-md border border-border bg-surface-2 font-mono text-sm tabular-nums"
          >
            {hits[index] ?? "–"}
          </span>
        ))}
      </div>
      {phase === "idle" ? (
        <Btn
          onClick={() => {
            done.current = false;
            setHits([]);
            setPhase("run");
          }}
        >
          Schicht starten
        </Btn>
      ) : (
        <Btn onClick={lock}>Treffer setzen</Btn>
      )}
      <p className="text-sm text-muted">
        Tippe, wenn die Nadel in der grünen Zone steht. Leertaste geht auch. Das ist Spiel-Hash, kein echter Miner.
      </p>
    </div>
  );
}
