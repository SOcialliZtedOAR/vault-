import { useEffect, useRef, useState } from "react";
import { Btn } from "@/components/empire/ui";
import { cn } from "@/lib/cn";

type Props = { onFinish: (score: number, win: boolean) => void };

const KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"] as const;
const ROUNDS = 4;

function ring(length: number) {
  return Array.from({ length }, () => KEYS[Math.floor(Math.random() * KEYS.length)]!);
}

export function ModemMarathon({ onFinish }: Props) {
  const finishRef = useRef(onFinish);
  finishRef.current = onFinish;
  const [running, setRunning] = useState(false);
  const [round, setRound] = useState(0);
  const [lives, setLives] = useState(3);
  const [sequence, setSequence] = useState<string[]>(() => ring(3));
  const [lit, setLit] = useState<string | null>(null);
  const [listen, setListen] = useState(false);
  const [cursor, setCursor] = useState(0);
  const over = useRef(false);
  const played = useRef(-1);

  useEffect(() => {
    if (!running || listen || over.current) return;
    if (played.current === round) return;
    played.current = round;
    let step = 0;
    const timers: number[] = [];
    const tick = () => {
      if (step >= sequence.length) {
        setLit(null);
        setListen(true);
        setCursor(0);
        return;
      }
      const key = sequence[step]!;
      setLit(key);
      timers.push(window.setTimeout(() => setLit(null), 280));
      step += 1;
      timers.push(window.setTimeout(tick, 520));
    };
    timers.push(window.setTimeout(tick, 400));
    return () => timers.forEach((id) => window.clearTimeout(id));
  }, [running, listen, round, sequence]);

  const finish = (score: number, win: boolean) => {
    if (over.current) return;
    over.current = true;
    finishRef.current(score, win);
  };

  const press = (key: string) => {
    if (!listen || over.current) return;
    if (key !== sequence[cursor]) {
      const nextLives = lives - 1;
      setLives(nextLives);
      setListen(false);
      played.current = -1;
      if (nextLives <= 0) finish(round * 80, false);
      return;
    }
    const next = cursor + 1;
    if (next < sequence.length) {
      setCursor(next);
      return;
    }
    if (round + 1 >= ROUNDS) {
      finish(400 + lives * 50, true);
      return;
    }
    setRound((value) => value + 1);
    setSequence(ring(4 + round));
    setListen(false);
    setCursor(0);
  };

  return (
    <div className="grid gap-3">
      <p className="font-mono text-sm text-muted tabular-nums" aria-live="polite">
        Wahl {round + 1}/{ROUNDS} · Leben {lives}
        {listen ? " · jetzt du" : running ? " · hör zu" : ""}
      </p>
      <div className="grid grid-cols-5 gap-2">
        {KEYS.map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => press(key)}
            className={cn(
              "min-h-14 rounded-md border text-lg font-extrabold",
              lit === key ? "border-primary bg-primary text-primary-fg" : "border-border bg-surface text-fg",
            )}
          >
            {key}
          </button>
        ))}
      </div>
      {!running ? <Btn onClick={() => setRunning(true)}>Verbinden</Btn> : null}
      <p className="text-sm text-muted">Die Leitung zeigt die Ziffern. Tippe dieselbe Folge. Vier Durchgänge, drei Fehler.</p>
    </div>
  );
}
