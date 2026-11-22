import { useEffect, useRef, useState } from "react";
import { Btn } from "@/components/empire/ui";
import { cn } from "@/lib/cn";

type Props = { onFinish: (score: number, win: boolean) => void };

const COLS = 5;
const LANES = [1, 2, 3];

export function BlockHop({ onFinish }: Props) {
  const finishRef = useRef(onFinish);
  finishRef.current = onFinish;
  const over = useRef(false);
  const [running, setRunning] = useState(false);
  const [row, setRow] = useState(4);
  const [col, setCol] = useState(2);
  const [hazards, setHazards] = useState([0, 3, 1]);

  useEffect(() => {
    if (!running || over.current) return;
    const timer = window.setInterval(() => {
      setHazards((current) => current.map((spot, index) => (spot + (index === 1 ? COLS - 1 : 1)) % COLS));
    }, 480);
    return () => window.clearInterval(timer);
  }, [running]);

  const finish = (score: number, win: boolean) => {
    if (over.current) return;
    over.current = true;
    setRunning(false);
    finishRef.current(score, win);
  };

  const move = (nextRow: number, nextCol: number) => {
    if (!running || over.current) return;
    const lane = LANES.indexOf(nextRow);
    if (lane >= 0 && hazards[lane] === nextCol) {
      setRow(nextRow);
      setCol(nextCol);
      finish(Math.max(0, 4 - nextRow) * 25, false);
      return;
    }
    setRow(nextRow);
    setCol(nextCol);
    if (nextRow === 0) finish(180, true);
  };

  const start = () => {
    over.current = false;
    setRow(4);
    setCol(2);
    setHazards([0, 3, 1]);
    setRunning(true);
  };

  return (
    <div className="grid gap-3">
      <p className="font-mono text-sm text-muted tabular-nums" aria-live="polite">
        {row === 0 ? "Ufer erreicht" : `Bahn ${Math.max(row, 1)} · Spalte ${col + 1}`}
      </p>
      <div className="grid gap-1">
        {Array.from({ length: 5 }, (_, lane) => (
          <div key={lane} className="grid grid-cols-5 gap-1">
            {Array.from({ length: COLS }, (_, cell) => {
              const here = row === lane && col === cell;
              const blocked = LANES.includes(lane) && hazards[LANES.indexOf(lane)] === cell;
              return (
                <span
                  key={cell}
                  className={cn(
                    "h-9 rounded-sm border border-border",
                    here ? "bg-primary" : blocked ? "bg-accent/70" : lane === 0 || lane === 4 ? "bg-surface" : "bg-bg",
                  )}
                />
              );
            })}
          </div>
        ))}
      </div>
      {!running ? (
        <Btn onClick={start}>Bahn starten</Btn>
      ) : (
        <div className="grid grid-cols-3 gap-2">
          <Btn variant="ghost" onClick={() => move(row, Math.max(0, col - 1))}>
            Links
          </Btn>
          <Btn onClick={() => move(Math.max(0, row - 1), col)}>Vor</Btn>
          <Btn variant="ghost" onClick={() => move(row, Math.min(COLS - 1, col + 1))}>
            Rechts
          </Btn>
        </div>
      )}
      <p className="text-sm text-muted">Die hellen Blöcke sind die Bahn. Seitlich ausweichen, dann einen Schritt vor.</p>
    </div>
  );
}
