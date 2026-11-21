import { useEffect, useRef, useState } from "react";
import { Btn } from "@/components/empire/ui";
import { cn } from "@/lib/cn";

type Props = { onFinish: (score: number, win: boolean) => void };

const GOAL = 8;
const CELLS = 9;

export function HalvingHero({ onFinish }: Props) {
  const finishRef = useRef(onFinish);
  finishRef.current = onFinish;
  const [running, setRunning] = useState(false);
  const [lit, setLit] = useState<number | null>(null);
  const [hits, setHits] = useState(0);
  const [lives, setLives] = useState(3);
  const [windowMs, setWindowMs] = useState(900);
  const over = useRef(false);
  const token = useRef(0);

  useEffect(() => {
    if (!running || over.current) return;
    const id = token.current;
    const timer = window.setTimeout(() => {
      if (over.current || token.current !== id) return;
      setLives((current) => {
        const next = current - 1;
        if (next <= 0) {
          over.current = true;
          finishRef.current(hits * 40, false);
        }
        return Math.max(0, next);
      });
      setLit((current) => (current == null ? 0 : (current + 3) % CELLS));
      token.current += 1;
    }, windowMs);
    return () => window.clearTimeout(timer);
  }, [running, lit, windowMs, hits]);

  const start = () => {
    over.current = false;
    setHits(0);
    setLives(3);
    setWindowMs(900);
    setLit(4);
    setRunning(true);
  };

  const tap = (index: number) => {
    if (!running || over.current || lit == null) return;
    if (index !== lit) {
      setLives((current) => {
        const next = current - 1;
        if (next <= 0) {
          over.current = true;
          finishRef.current(hits * 40, false);
        }
        return Math.max(0, next);
      });
      return;
    }
    const nextHits = hits + 1;
    setHits(nextHits);
    if (nextHits >= GOAL) {
      over.current = true;
      setLit(null);
      finishRef.current(nextHits * 50 + lives * 20, true);
      return;
    }
    setWindowMs((current) => Math.max(320, Math.round(current * 0.82)));
    setLit((index + 1 + Math.floor(Math.random() * 7)) % CELLS);
    token.current += 1;
  };

  return (
    <div className="grid gap-3">
      <p className="font-mono text-sm text-muted tabular-nums" aria-live="polite">
        Treffer {hits}/{GOAL} · Leben {lives} · Fenster {windowMs} ms
      </p>
      <div className="grid grid-cols-3 gap-2">
        {Array.from({ length: CELLS }, (_, index) => (
          <button
            key={index}
            type="button"
            aria-label={lit === index ? "Leuchtendes Feld" : `Feld ${index + 1}`}
            disabled={!running || over.current}
            onClick={() => tap(index)}
            className={cn(
              "aspect-square min-h-16 rounded-md border border-border",
              lit === index ? "bg-primary" : "bg-surface",
            )}
          />
        ))}
      </div>
      {!running ? <Btn onClick={start}>Runde starten</Btn> : null}
      <p className="text-sm text-muted">Nur das leuchtende Feld. Jeder Treffer kürzt die Zeit, bis acht sitzen.</p>
    </div>
  );
}
