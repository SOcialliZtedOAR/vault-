import { useRef, useState } from "react";
import { Btn } from "@/components/empire/ui";
import { cn } from "@/lib/cn";

type Props = { onFinish: (score: number, win: boolean) => void };

const ROWS = 6;
const COLS = 5;
const GOAL = 12;
type Board = (number | null)[][];

const TONE = ["bg-primary", "bg-accent", "bg-fg"] as const;

function empty(): Board {
  return Array.from({ length: ROWS }, () => Array.from({ length: COLS }, () => null));
}

function mark(board: Board) {
  const hit = board.map((row) => row.map(() => false));
  for (let y = 0; y < ROWS; y++) {
    let run = 1;
    for (let x = 1; x <= COLS; x++) {
      const same = x < COLS && board[y]![x] != null && board[y]![x] === board[y]![x - 1];
      if (same) run += 1;
      else {
        if (run >= 3 && board[y]![x - 1] != null) {
          for (let k = 0; k < run; k++) hit[y]![x - 1 - k] = true;
        }
        run = 1;
      }
    }
  }
  for (let x = 0; x < COLS; x++) {
    let run = 1;
    for (let y = 1; y <= ROWS; y++) {
      const same = y < ROWS && board[y]![x] != null && board[y]![x] === board[y - 1]![x];
      if (same) run += 1;
      else {
        if (run >= 3 && board[y - 1]![x] != null) {
          for (let k = 0; k < run; k++) hit[y - 1 - k]![x] = true;
        }
        run = 1;
      }
    }
  }
  return hit;
}

function settle(board: Board) {
  let cleared = 0;
  let guard = 0;
  while (guard < 8) {
    const hit = mark(board);
    let any = false;
    for (let y = 0; y < ROWS; y++) {
      for (let x = 0; x < COLS; x++) {
        if (hit[y]![x]) {
          board[y]![x] = null;
          cleared += 1;
          any = true;
        }
      }
    }
    if (!any) break;
    for (let x = 0; x < COLS; x++) {
      const stack = [];
      for (let y = 0; y < ROWS; y++) if (board[y]![x] != null) stack.push(board[y]![x]);
      for (let y = 0; y < ROWS; y++) board[y]![x] = null;
      stack.forEach((cell, index) => {
        board[ROWS - stack.length + index]![x] = cell;
      });
    }
    guard += 1;
  }
  return cleared;
}

export function BlockOracle({ onFinish }: Props) {
  const finishRef = useRef(onFinish);
  finishRef.current = onFinish;
  const [board, setBoard] = useState<Board>(empty);
  const [cleared, setCleared] = useState(0);
  const [over, setOver] = useState(false);

  const drop = (col: number) => {
    if (over) return;
    const next = board.map((row) => row.slice());
    let row = ROWS - 1;
    while (row >= 0 && next[row]![col] != null) row -= 1;
    if (row < 0) return;
    next[row]![col] = Math.floor(Math.random() * TONE.length);
    const gained = settle(next);
    const total = cleared + gained;
    setBoard(next);
    setCleared(total);
    const full = next.every((line) => line.every((cell) => cell != null));
    if (total >= GOAL) {
      setOver(true);
      finishRef.current(total * 20, true);
    } else if (full) {
      setOver(true);
      finishRef.current(total * 20, false);
    }
  };

  return (
    <div className="grid gap-3">
      <p className="font-mono text-sm text-muted tabular-nums" aria-live="polite">
        Geräumt {cleared}/{GOAL}
      </p>
      <div className="grid grid-cols-5 gap-1.5 rounded-md border border-border bg-bg p-2">
        {board.map((row, y) =>
          row.map((cell, x) => (
            <button
              key={`${y}-${x}`}
              type="button"
              aria-label={`Schacht ${x + 1}`}
              disabled={over}
              onClick={() => drop(x)}
              className={cn("aspect-square min-h-11 rounded-sm border border-border", cell == null ? "bg-surface" : TONE[cell])}
            />
          )),
        )}
      </div>
      {!over ? (
        <div className="grid grid-cols-5 gap-1.5">
          {Array.from({ length: COLS }, (_, col) => (
            <Btn key={col} variant="ghost" onClick={() => drop(col)} aria-label={`Block in Schacht ${col + 1}`}>
              {col + 1}
            </Btn>
          ))}
        </div>
      ) : null}
      <p className="text-sm text-muted">Tippe einen Schacht. Drei gleiche Blöcke in einer Reihe oder Spalte fallen. Zwölf reichen.</p>
    </div>
  );
}
