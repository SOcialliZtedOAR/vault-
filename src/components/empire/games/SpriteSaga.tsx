import { useRef, useState } from "react";
import { Btn } from "@/components/empire/ui";
import { cn } from "@/lib/cn";

type Props = { onFinish: (score: number, win: boolean) => void };

const SOLVED = [1, 2, 3, 4, 5, 6, 7, 8, 0];

function neighbors(index: number) {
  const x = index % 3;
  const y = Math.floor(index / 3);
  const cells: number[] = [];
  if (x > 0) cells.push(index - 1);
  if (x < 2) cells.push(index + 1);
  if (y > 0) cells.push(index - 3);
  if (y < 2) cells.push(index + 3);
  return cells;
}

function scramble() {
  const tiles = [...SOLVED];
  let empty = 8;
  let last = -1;
  for (let step = 0; step < 14; step++) {
    const options = neighbors(empty).filter((index) => index !== last);
    const pick = options[Math.floor(Math.random() * options.length)]!;
    tiles[empty] = tiles[pick]!;
    tiles[pick] = 0;
    last = empty;
    empty = pick;
  }
  return tiles;
}

export function SpriteSaga({ onFinish }: Props) {
  const finishRef = useRef(onFinish);
  finishRef.current = onFinish;
  const [tiles, setTiles] = useState(scramble);
  const [moves, setMoves] = useState(0);
  const over = useRef(false);

  const slide = (index: number) => {
    if (over.current) return;
    const empty = tiles.indexOf(0);
    if (!neighbors(empty).includes(index)) return;
    const next = [...tiles];
    next[empty] = next[index]!;
    next[index] = 0;
    const count = moves + 1;
    setTiles(next);
    setMoves(count);
    if (next.every((tile, cell) => tile === SOLVED[cell])) {
      over.current = true;
      finishRef.current(Math.max(100, 800 - count * 20), true);
    }
  };

  return (
    <div className="grid gap-3">
      <p className="font-mono text-sm text-muted tabular-nums">Züge {moves}</p>
      <div className="grid grid-cols-3 gap-2">
        {tiles.map((tile, index) =>
          tile === 0 ? (
            <span key={index} className="min-h-16 rounded-md border border-dashed border-border bg-bg" />
          ) : (
            <button
              key={index}
              type="button"
              onClick={() => slide(index)}
              className={cn(
                "min-h-16 rounded-md border border-border bg-surface text-2xl font-extrabold",
                neighbors(tiles.indexOf(0)).includes(index) ? "text-primary" : "text-fg",
              )}
            >
              {tile}
            </button>
          ),
        )}
      </div>
      <Btn
        variant="ghost"
        onClick={() => {
          if (over.current) return;
          setTiles(scramble());
          setMoves(0);
        }}
      >
        Neu mischen
      </Btn>
      <p className="text-sm text-muted">Schieb eine Nachbarfigur auf das leere Feld, bis 1 bis 8 in Leserichtung stehen.</p>
    </div>
  );
}
