import { useRef, useState } from "react";
import { Btn } from "@/components/empire/ui";
import { cn } from "@/lib/cn";

type Props = { onFinish: (score: number, win: boolean) => void };

function flip(board: number[], index: number) {
  const next = board.slice();
  const targets = [index];
  if (index % 3 !== 0) targets.push(index - 1);
  if (index % 3 !== 2) targets.push(index + 1);
  if (index >= 3) targets.push(index - 3);
  if (index < 6) targets.push(index + 3);
  for (const target of targets) next[target] = next[target] ? 0 : 1;
  return next;
}

function mix() {
  let board = [0, 0, 0, 0, 0, 0, 0, 0, 0];
  for (let index = 0; index < 9; index += 1) {
    if ((index * 3 + 1) % 2 === 1) board = flip(board, index);
  }
  return board;
}

export function RasterLight({ onFinish }: Props) {
  const finishRef = useRef(onFinish);
  finishRef.current = onFinish;
  const over = useRef(false);
  const [board, setBoard] = useState<number[] | null>(null);
  const [taps, setTaps] = useState(0);

  const start = () => {
    over.current = false;
    setTaps(0);
    setBoard(mix());
  };

  const tap = (index: number) => {
    if (!board || over.current) return;
    const next = flip(board, index);
    const nextTaps = taps + 1;
    setBoard(next);
    setTaps(nextTaps);
    if (next.every((cell) => cell === 0)) {
      over.current = true;
      finishRef.current(Math.max(40, 220 - nextTaps * 12), true);
    }
  };

  return (
    <div className="grid gap-3">
      <p className="font-mono text-sm text-muted tabular-nums" aria-live="polite">
        Züge {taps}
        {board ? ` · an ${board.reduce((sum, cell) => sum + cell, 0)}` : ""}
      </p>
      {board ? (
        <div className="grid grid-cols-3 gap-2">
          {board.map((cell, index) => (
            <button
              key={index}
              type="button"
              aria-label={cell ? `Licht ${index + 1} an` : `Licht ${index + 1} aus`}
              onClick={() => tap(index)}
              className={cn("aspect-square min-h-16 rounded-md border border-border", cell ? "bg-primary" : "bg-surface")}
            />
          ))}
        </div>
      ) : (
        <p className="rounded-md border border-border bg-bg px-3 py-8 text-center text-sm text-muted">Das Raster ist dunkel.</p>
      )}
      {!board ? <Btn onClick={start}>Feld mischen</Btn> : null}
      <p className="text-sm text-muted">Jeder Tipp kippt das Feld und die direkten Nachbarn. Ziel: alles aus.</p>
    </div>
  );
}
