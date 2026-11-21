import { useRef, useState } from "react";
import { cn } from "@/lib/cn";

type Props = { onFinish: (score: number, win: boolean) => void };

const PAIRS = [1, 20, 2, 19, 3, 18, 4, 17, 5, 16, 6, 15];

function shuffle() {
  const cards = [...PAIRS];
  for (let i = cards.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const swap = cards[i]!;
    cards[i] = cards[j]!;
    cards[j] = swap;
  }
  return cards;
}

export function SatoshiSolitaire({ onFinish }: Props) {
  const finishRef = useRef(onFinish);
  finishRef.current = onFinish;
  const [cards, setCards] = useState<(number | null)[]>(shuffle);
  const [picked, setPicked] = useState<number | null>(null);
  const [misses, setMisses] = useState(0);
  const over = useRef(false);

  const finish = (left: number, miss: number, win: boolean) => {
    if (over.current) return;
    over.current = true;
    finishRef.current((12 - left) * 40 + (win ? 200 : 0) - miss * 10, win);
  };

  const tap = (index: number) => {
    if (over.current || cards[index] == null) return;
    if (picked == null) {
      setPicked(index);
      return;
    }
    if (picked === index) {
      setPicked(null);
      return;
    }
    const a = cards[picked]!;
    const b = cards[index]!;
    if (a + b === 21) {
      const next = [...cards];
      next[picked] = null;
      next[index] = null;
      const left = next.filter((card) => card != null).length;
      setCards(next);
      setPicked(null);
      if (left === 0) finish(0, misses, true);
      return;
    }
    const nextMiss = misses + 1;
    setMisses(nextMiss);
    setPicked(null);
    if (nextMiss >= 4) finish(cards.filter((card) => card != null).length, nextMiss, false);
  };

  return (
    <div className="grid gap-3">
      <p className="font-mono text-sm text-muted tabular-nums" aria-live="polite">
        Fehlgriffe {misses}/4
      </p>
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
        {cards.map((card, index) =>
          card == null ? (
            <span key={index} className="min-h-16 rounded-md border border-dashed border-border" />
          ) : (
            <button
              key={index}
              type="button"
              onClick={() => tap(index)}
              className={cn(
                "min-h-16 rounded-md border text-xl font-extrabold tabular-nums",
                picked === index ? "border-primary bg-primary text-primary-fg" : "border-border bg-surface text-fg",
              )}
            >
              {card}
            </button>
          ),
        )}
      </div>
      <p className="text-sm text-muted">Zwei Karten, die zusammen 21 sind, legen sich ab. Vier Fehlgriffe beenden die Runde.</p>
    </div>
  );
}
