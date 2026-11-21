import { useState } from "react";
import { FieldStudy } from "@/components/empire/games/FieldStudy";
import { Btn } from "@/components/empire/ui";
import { cn } from "@/lib/cn";
import type { Game } from "@/lib/empire/types";

const SIZE = 5;
const LIMIT = 8;

function cellId(x: number, y: number) {
  return `${x},${y}`;
}

function Filing({ game, onFinish, lead }: { game: Game; onFinish: (score: number, win: boolean) => void; lead: string }) {
  return <FieldStudy game={game} lead={lead} onFinish={onFinish} />;
}

export function DigPit({ game, onFinish }: { game: Game; onFinish: (score: number, win: boolean) => void }) {
  if (game.id === "lantern-link") return <LanternCut game={game} onFinish={onFinish} />;
  if (game.id === "merkle-maze") return <MerkleCut game={game} onFinish={onFinish} />;
  if (game.id === "phosphor-sieve") return <CoreDrill game={game} onFinish={onFinish} />;
  if (game.id === "sector-zero") return <PinPress game={game} onFinish={onFinish} />;
  return <BrushPit game={game} onFinish={onFinish} />;
}

function BrushPit({ game, onFinish }: { game: Game; onFinish: (score: number, win: boolean) => void }) {
  const [relic, setRelic] = useState(() => ({
    x: Math.floor(Math.random() * SIZE),
    y: Math.floor(Math.random() * SIZE),
  }));
  const [open, setOpen] = useState<Record<string, number>>({});
  const [left, setLeft] = useState(LIMIT);
  const [best, setBest] = useState(SIZE * 2);
  const [phase, setPhase] = useState<"dig" | "file" | "empty">("dig");
  const [note, setNote] = useState("Jeder Stich nennt den Abstand zum Kern. Kleiner ist näher.");

  const brush = (x: number, y: number) => {
    const id = cellId(x, y);
    if (phase !== "dig" || open[id] != null) return;
    const dist = Math.abs(x - relic.x) + Math.abs(y - relic.y);
    const nextLeft = left - 1;
    setOpen((current) => ({ ...current, [id]: dist }));
    setLeft(nextLeft);
    if (dist === 0) {
      setPhase("file");
      setNote("Kern frei. Jahr und Epoche entscheiden über die Karte.");
      return;
    }
    if (nextLeft <= 0) {
      setPhase("empty");
      setNote("Die Bürsten sind stumpf. Die Schicht bleibt liegen.");
      return;
    }
    const known = best < SIZE * 2;
    const warmer = known && dist < best;
    setBest(Math.min(best, dist));
    setNote(!known ? `Abstand ${dist}.` : warmer ? `Abstand ${dist}. Wärmer.` : `Abstand ${dist}. Kälter.`);
  };

  const reset = () => {
    setRelic({ x: Math.floor(Math.random() * SIZE), y: Math.floor(Math.random() * SIZE) });
    setOpen({});
    setLeft(LIMIT);
    setBest(SIZE * 2);
    setPhase("dig");
    setNote("Neue Lage. Der Kern liegt woanders.");
  };

  if (phase === "file") {
    return <Filing game={game} lead="Der Kern liegt frei. Richtiges Jahr und richtige Epoche legen die Karte ins Archiv." onFinish={onFinish} />;
  }

  return (
    <div className="grid gap-3">
      <p className="font-mono text-sm text-muted tabular-nums">Bürsten {left}/{LIMIT}</p>
      <div className="grid grid-cols-5 gap-2" role="grid" aria-label={`Bürste ${game.title}`}>
        {Array.from({ length: SIZE * SIZE }, (_, index) => {
          const x = index % SIZE;
          const y = Math.floor(index / SIZE);
          const dist = open[cellId(x, y)];
          return (
            <button
              key={cellId(x, y)}
              type="button"
              role="gridcell"
              disabled={phase !== "dig" || dist != null}
              onClick={() => brush(x, y)}
              className={cn(
                "min-h-14 rounded-md border font-mono text-sm tabular-nums",
                dist == null
                  ? "border-border bg-surface text-fg"
                  : dist === 0
                    ? "border-primary bg-primary text-primary-fg"
                    : "border-border bg-surface-2 text-primary",
              )}
            >
              {dist == null ? "" : dist}
            </button>
          );
        })}
      </div>
      <p className="text-sm text-fg" aria-live="polite">{note}</p>
      {phase === "empty" ? <Btn onClick={reset}>Neu ansetzen</Btn> : null}
    </div>
  );
}

const LANTERN = ["######", "#S...#", "#.##.#", "#....#", "##..L#", "######"];

function LanternCut({ game, onFinish }: { game: Game; onFinish: (score: number, win: boolean) => void }) {
  const cols = LANTERN[0]!.length;
  const start = { x: 1, y: 1 };
  const [path, setPath] = useState<{ x: number; y: number }[]>([start]);
  const [phase, setPhase] = useState<"dig" | "file">("dig");
  const [note, setNote] = useState("Leg das Kabel vom Verteiler zur Laterne. Das letzte Glied lässt sich lösen.");
  const head = path[path.length - 1]!;
  const used = path.length - 1;

  const cell = (x: number, y: number) => LANTERN[y]![x]!;
  const onPath = (x: number, y: number) => path.some((step) => step.x === x && step.y === y);

  const lay = (x: number, y: number) => {
    if (phase !== "dig" || cell(x, y) === "#") return;
    const prev = path[path.length - 2];
    if (prev && prev.x === x && prev.y === y) {
      setPath(path.slice(0, -1));
      setNote("Glied gelöst.");
      return;
    }
    if (onPath(x, y)) return;
    const beside = Math.abs(x - head.x) + Math.abs(y - head.y) === 1;
    if (!beside) {
      setNote("Nur an das freie Ende ansetzen.");
      return;
    }
    if (used >= LIMIT) {
      setNote("Acht Glieder sind verlegt. Löse das letzte, wenn die Laterne noch dunkel ist.");
      return;
    }
    const next = [...path, { x, y }];
    setPath(next);
    if (cell(x, y) === "L") {
      setPhase("file");
      setNote("Laterne brennt.");
      return;
    }
    setNote(`Glied ${next.length - 1}. Die Laterne ist noch dunkel.`);
  };

  if (phase === "file") {
    return <Filing game={game} lead="Die Laterne brennt. Jahr und Epoche legen die Karte ins Archiv." onFinish={onFinish} />;
  }

  return (
    <div className="grid gap-3">
      <p className="font-mono text-sm text-muted tabular-nums">Glieder {used}/{LIMIT}</p>
      <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }} role="grid" aria-label={`Kabel ${game.title}`}>
        {LANTERN.flatMap((row, y) =>
          row.split("").map((mark, x) => {
            const laid = onPath(x, y);
            const tip = head.x === x && head.y === y;
            if (mark === "#") {
              return <span key={cellId(x, y)} className="min-h-11 rounded-sm bg-surface-2" />;
            }
            return (
              <button
                key={cellId(x, y)}
                type="button"
                onClick={() => lay(x, y)}
                className={cn(
                  "min-h-11 rounded-md border font-mono text-xs font-semibold",
                  tip ? "border-primary bg-primary text-primary-fg" : laid ? "border-primary bg-surface-2 text-primary" : "border-border bg-surface text-fg",
                )}
              >
                {mark === "L" ? "Licht" : tip ? "Ende" : laid ? "·" : ""}
              </button>
            );
          }),
        )}
      </div>
      <p className="text-sm text-fg" aria-live="polite">{note}</p>
    </div>
  );
}

function placeRelic() {
  const next = { x: 0, y: 0 };
  while (Math.abs(next.x) + Math.abs(next.y) < 3) {
    next.x = Math.floor(Math.random() * SIZE);
    next.y = Math.floor(Math.random() * SIZE);
  }
  return next;
}

function MerkleCut({ game, onFinish }: { game: Game; onFinish: (score: number, win: boolean) => void }) {
  const [relic, setRelic] = useState(placeRelic);
  const [head, setHead] = useState({ x: 0, y: 0 });
  const [open, setOpen] = useState<Record<string, number>>({
    "0,0": Math.abs(relic.x) + Math.abs(relic.y),
  });
  const [left, setLeft] = useState(LIMIT);
  const [phase, setPhase] = useState<"dig" | "file" | "empty">("dig");
  const [note, setNote] = useState("Nur die Nachbarzelle der letzten Lage. Zurück geht nicht.");

  const cut = (x: number, y: number) => {
    if (phase !== "dig" || open[cellId(x, y)] != null) return;
    if (Math.abs(x - head.x) + Math.abs(y - head.y) !== 1) {
      setNote("Diese Lage hängt nicht an der letzten.");
      return;
    }
    const dist = Math.abs(x - relic.x) + Math.abs(y - relic.y);
    const nextLeft = left - 1;
    setOpen((current) => ({ ...current, [cellId(x, y)]: dist }));
    setHead({ x, y });
    setLeft(nextLeft);
    if (dist === 0) {
      setPhase("file");
      setNote("Hash trifft den Kern.");
      return;
    }
    if (nextLeft <= 0) {
      setPhase("empty");
      setNote("Der Schnitt ist zu Ende. Der Kern bleibt zu.");
      return;
    }
    setNote(`Abstand ${dist}. Die nächste Lage muss angrenzen.`);
  };

  const reset = () => {
    const next = placeRelic();
    setRelic(next);
    setHead({ x: 0, y: 0 });
    setOpen({ "0,0": Math.abs(next.x) + Math.abs(next.y) });
    setLeft(LIMIT);
    setPhase("dig");
    setNote("Neuer Schnitt. Zurück geht wieder nicht.");
  };

  if (phase === "file") {
    return <Filing game={game} lead="Der Schnitt trifft den Kern. Jahr und Epoche legen die Karte ins Archiv." onFinish={onFinish} />;
  }

  return (
    <div className="grid gap-3">
      <p className="font-mono text-sm text-muted tabular-nums">Lagen {left}/{LIMIT}</p>
      <div className="grid grid-cols-5 gap-2" role="grid" aria-label={`Schnitt ${game.title}`}>
        {Array.from({ length: SIZE * SIZE }, (_, index) => {
          const x = index % SIZE;
          const y = Math.floor(index / SIZE);
          const dist = open[cellId(x, y)];
          const beside = Math.abs(x - head.x) + Math.abs(y - head.y) === 1;
          return (
            <button
              key={cellId(x, y)}
              type="button"
              disabled={phase !== "dig" || dist != null || !beside}
              onClick={() => cut(x, y)}
              className={cn(
                "min-h-14 rounded-md border font-mono text-sm tabular-nums",
                dist == null
                  ? beside && phase === "dig"
                    ? "border-primary bg-surface text-fg"
                    : "border-border bg-bg text-muted"
                  : head.x === x && head.y === y
                    ? "border-primary bg-primary text-primary-fg"
                    : "border-border bg-surface-2 text-primary",
              )}
            >
              {dist == null ? "" : dist}
            </button>
          );
        })}
      </div>
      <p className="text-sm text-fg" aria-live="polite">{note}</p>
      {phase === "empty" ? <Btn onClick={reset}>Neu ansetzen</Btn> : null}
    </div>
  );
}

const DEPTHS = 8;
const PROBES = 4;

function CoreDrill({ game, onFinish }: { game: Game; onFinish: (score: number, win: boolean) => void }) {
  const [core, setCore] = useState(() => Math.floor(Math.random() * DEPTHS));
  const [mark, setMark] = useState<Record<number, "high" | "low" | "hit">>({});
  const [left, setLeft] = useState(PROBES);
  const [phase, setPhase] = useState<"dig" | "file" | "empty">("dig");
  const [note, setNote] = useState("Vier Sonden. Höher heißt zur ersten Sohle, tiefer zum Grund.");

  const probe = (depth: number) => {
    if (phase !== "dig" || mark[depth]) return;
    const nextLeft = left - 1;
    if (depth === core) {
      setMark((current) => ({ ...current, [depth]: "hit" }));
      setLeft(nextLeft);
      setPhase("file");
      setNote("Die Sonde trifft den Kern.");
      return;
    }
    const side = depth < core ? "low" : "high";
    setMark((current) => ({ ...current, [depth]: side }));
    setLeft(nextLeft);
    if (nextLeft <= 0) {
      setPhase("empty");
      setNote("Keine Sonde mehr. Der Kern bleibt in der Säule.");
      return;
    }
    setNote(side === "low" ? "Tiefer." : "Höher.");
  };

  const reset = () => {
    setCore(Math.floor(Math.random() * DEPTHS));
    setMark({});
    setLeft(PROBES);
    setPhase("dig");
    setNote("Neue Säule. Vier Sonden.");
  };

  if (phase === "file") {
    return <Filing game={game} lead="Der Kern liegt in der Säule. Jahr und Epoche legen die Karte ins Archiv." onFinish={onFinish} />;
  }

  return (
    <div className="grid gap-3">
      <p className="font-mono text-sm text-muted tabular-nums">Sonden {left}/{PROBES}</p>
      <div className="grid gap-2" role="list" aria-label={`Bohrung ${game.title}`}>
        {Array.from({ length: DEPTHS }, (_, depth) => {
          const side = mark[depth];
          return (
            <button
              key={depth}
              type="button"
              disabled={phase !== "dig" || side != null}
              onClick={() => probe(depth)}
              className={cn(
                "min-h-11 rounded-md border px-3 text-left font-mono text-sm",
                side === "hit"
                  ? "border-primary bg-primary text-primary-fg"
                  : side
                    ? "border-border bg-surface-2 text-primary"
                    : "border-border bg-surface text-fg",
              )}
            >
              Sohle {depth + 1}
              {side === "low" ? " · tiefer" : side === "high" ? " · höher" : ""}
            </button>
          );
        })}
      </div>
      <p className="text-sm text-fg" aria-live="polite">{note}</p>
      {phase === "empty" ? <Btn onClick={reset}>Neu ansetzen</Btn> : null}
    </div>
  );
}

const PINS = 3;
const READS = 6;

function PinPress({ game, onFinish }: { game: Game; onFinish: (score: number, win: boolean) => void }) {
  const [secret, setSecret] = useState(() => Array.from({ length: PINS }, () => Math.floor(Math.random() * 3)));
  const [pins, setPins] = useState([0, 0, 0]);
  const [left, setLeft] = useState(READS);
  const [hits, setHits] = useState<number | null>(null);
  const [phase, setPhase] = useState<"dig" | "file" | "empty">("dig");
  const [note, setNote] = useState("Drehe die Stifte, dann lies den Kontakt ab.");

  const turn = (index: number) => {
    if (phase !== "dig") return;
    setPins((current) => current.map((value, pin) => (pin === index ? (value + 1) % 3 : value)));
  };

  const read = () => {
    if (phase !== "dig") return;
    const nextHits = pins.filter((value, index) => value === secret[index]).length;
    const nextLeft = left - 1;
    setHits(nextHits);
    setLeft(nextLeft);
    if (nextHits === PINS) {
      setPhase("file");
      setNote("Kontakt. Alle drei Stifte sitzen.");
      return;
    }
    if (nextLeft <= 0) {
      setPhase("empty");
      setNote("Die Presse ist stumpf. Der Kontakt bleibt offen.");
      return;
    }
    setNote(`${nextHits} von ${PINS} Stiften sitzen. Welche, sagt die Presse nicht.`);
  };

  const reset = () => {
    setSecret(Array.from({ length: PINS }, () => Math.floor(Math.random() * 3)));
    setPins([0, 0, 0]);
    setLeft(READS);
    setHits(null);
    setPhase("dig");
    setNote("Neue Stifte. Sechs Ablesungen.");
  };

  if (phase === "file") {
    return <Filing game={game} lead="Der Kontakt sitzt. Jahr und Epoche legen die Karte ins Archiv." onFinish={onFinish} />;
  }

  return (
    <div className="grid gap-3">
      <p className="font-mono text-sm text-muted tabular-nums">
        Ablesungen {left}/{READS}
        {hits != null ? ` · zuletzt ${hits}/${PINS}` : ""}
      </p>
      <div className="grid grid-cols-3 gap-2">
        {pins.map((value, index) => (
          <button
            key={index}
            type="button"
            onClick={() => turn(index)}
            className="min-h-16 rounded-md border border-border bg-surface text-2xl font-extrabold tabular-nums"
          >
            {value}
          </button>
        ))}
      </div>
      {phase === "dig" ? <Btn onClick={read}>Ablesen</Btn> : null}
      {phase === "empty" ? <Btn onClick={reset}>Neu ansetzen</Btn> : null}
      <p className="text-sm text-fg" aria-live="polite">{note}</p>
    </div>
  );
}
