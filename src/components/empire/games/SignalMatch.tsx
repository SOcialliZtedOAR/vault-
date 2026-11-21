import { Bitcoin, Cpu, Flag, Joystick, Puzzle, Radio, Rocket, Star, type LucideIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Btn } from "@/components/empire/ui";
import { cn } from "@/lib/cn";

type Props = { onFinish: (score: number, win: boolean) => void };

const ICONS: LucideIcon[] = [Joystick, Bitcoin, Rocket, Puzzle, Star, Cpu, Radio, Flag];

type Tile = { uid: string; key: number; Icon: LucideIcon };

function deck(): Tile[] {
  const tiles = ICONS.flatMap((Icon, key) => [
    { uid: `${key}a`, key, Icon },
    { uid: `${key}b`, key, Icon },
  ]);
  for (let i = tiles.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [tiles[i], tiles[j]] = [tiles[j]!, tiles[i]!];
  }
  return tiles;
}

export function SignalMatch({ onFinish }: Props) {
  const finishRef = useRef(onFinish);
  finishRef.current = onFinish;
  const done = useRef(false);
  const [tiles, setTiles] = useState<Tile[] | null>(null);
  const [open, setOpen] = useState<number[]>([]);
  const [matched, setMatched] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [lock, setLock] = useState(false);

  useEffect(() => {
    if (matched.length === 8 && tiles && !done.current) {
      done.current = true;
      finishRef.current(Math.max(160, 1700 - moves * 45), true);
    }
  }, [matched, moves, tiles]);

  const flip = (index: number) => {
    if (!tiles || lock || open.includes(index) || matched.includes(tiles[index]!.key)) return;
    const next = [...open, index];
    setOpen(next);
    if (next.length < 2) return;
    setLock(true);
    const [a, b] = next;
    window.setTimeout(() => {
      setMoves((n) => n + 1);
      if (tiles[a!]!.key === tiles[b!]!.key) {
        setMatched((have) => (have.includes(tiles[a!]!.key) ? have : [...have, tiles[a!]!.key]));
      }
      setOpen([]);
      setLock(false);
    }, 420);
  };

  if (!tiles) {
    return (
      <div className="grid gap-3">
        <Btn
          onClick={() => {
            done.current = false;
            setTiles(deck());
            setOpen([]);
            setMatched([]);
            setMoves(0);
          }}
        >
          Tresor mischen
        </Btn>
        <p className="text-sm text-muted">Acht Paare. Weniger Züge, höhere Punktzahl.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-3">
      <p className="font-mono text-sm text-muted tabular-nums" aria-live="polite">
        Züge {moves} · Paare {matched.length}/8
      </p>
      <div className="grid grid-cols-4 gap-2">
        {tiles.map((tile, index) => {
          const shown = open.includes(index) || matched.includes(tile.key);
          return (
            <button
              key={tile.uid}
              type="button"
              aria-label={shown ? "Karte offen" : "Karte verdeckt"}
              onClick={() => flip(index)}
              className={cn(
                "grid aspect-square min-h-11 place-items-center rounded-md border",
                shown ? "border-primary bg-surface-2 text-primary" : "border-border bg-bg text-muted",
              )}
            >
              {shown ? <tile.Icon className="size-6" /> : <span className="font-mono text-sm">?</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}
