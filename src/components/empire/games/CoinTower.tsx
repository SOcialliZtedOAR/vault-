import { useEffect, useRef, useState } from "react";
import { Btn } from "@/components/empire/ui";

type Props = { onFinish: (score: number, win: boolean) => void };

const COLS = 7;
const GOAL = 6;

export function CoinTower({ onFinish }: Props) {
  const finishRef = useRef(onFinish);
  finishRef.current = onFinish;
  const width = useRef(3);
  const anchor = useRef(0);
  const dir = useRef(1);
  const over = useRef(false);
  const [phase, setPhase] = useState<"idle" | "run">("idle");
  const [pos, setPos] = useState(0);
  const [floors, setFloors] = useState<{ left: number; width: number }[]>([]);

  useEffect(() => {
    if (phase !== "run" || over.current) return;
    const timer = window.setInterval(() => {
      setPos((current) => {
        const max = COLS - width.current;
        let next = current + dir.current;
        if (next > max || next < 0) {
          dir.current *= -1;
          next = current + dir.current;
        }
        return Math.max(0, Math.min(max, next));
      });
    }, 150);
    return () => window.clearInterval(timer);
  }, [phase, floors.length]);

  const start = () => {
    width.current = 3;
    anchor.current = 0;
    dir.current = 1;
    over.current = false;
    setFloors([]);
    setPos(0);
    setPhase("run");
  };

  const drop = () => {
    if (phase !== "run" || over.current) return;
    const moving = width.current;
    let left = pos;
    let nextWidth = moving;
    if (floors.length > 0) {
      const overlapLeft = Math.max(left, anchor.current);
      const overlapRight = Math.min(left + moving, anchor.current + moving);
      nextWidth = overlapRight - overlapLeft;
      left = overlapLeft;
    }
    if (nextWidth <= 0) {
      over.current = true;
      setPhase("idle");
      finishRef.current(floors.length * 40, false);
      return;
    }
    const next = [...floors, { left, width: nextWidth }];
    anchor.current = left;
    width.current = nextWidth;
    setFloors(next);
    setPos(0);
    if (next.length >= GOAL) {
      over.current = true;
      setPhase("idle");
      finishRef.current(next.length * 80 + nextWidth * 20, true);
    }
  };

  const rows = [...floors].reverse();

  return (
    <div className="grid gap-3">
      <p className="font-mono text-sm text-muted tabular-nums" aria-live="polite">
        Stockwerke {floors.length}/{GOAL} · Breite {width.current}
      </p>
      <div className="grid gap-1 rounded-md border border-border bg-bg p-2">
        {phase === "run" ? (
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: COLS }, (_, index) => (
              <span
                key={index}
                className={index >= pos && index < pos + width.current ? "h-6 rounded-sm bg-primary" : "h-6"}
              />
            ))}
          </div>
        ) : null}
        {rows.map((floor, index) => (
          <div key={index} className="grid grid-cols-7 gap-1">
            {Array.from({ length: COLS }, (_, cell) => (
              <span
                key={cell}
                className={cell >= floor.left && cell < floor.left + floor.width ? "h-6 rounded-sm bg-accent" : "h-6"}
              />
            ))}
          </div>
        ))}
        {floors.length === 0 && phase !== "run" ? <p className="py-6 text-center text-sm text-muted">Der Schacht ist leer.</p> : null}
      </div>
      {phase === "idle" ? <Btn onClick={start}>Turm starten</Btn> : <Btn onClick={drop}>Ablegen</Btn>}
      <p className="text-sm text-muted">Sechs saubere Lagen. Wer daneben legt, verliert die überstehende Breite.</p>
    </div>
  );
}
