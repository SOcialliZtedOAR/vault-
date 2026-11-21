import { useEffect, useState } from "react";
import { Btn } from "@/components/empire/ui";
import { ERAS, GAMES } from "@/lib/empire/catalog";
import { cn } from "@/lib/cn";
import type { Game } from "@/lib/empire/types";

function pick<T>(pool: T[], count: number, include: T) {
  const rest = pool.filter((item) => item !== include);
  const out = [include];
  for (const item of rest) {
    if (out.length >= count) break;
    if (!out.includes(item)) out.push(item);
  }
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j]!, out[i]!];
  }
  return out;
}

export function FieldStudy({
  game,
  onFinish,
  lead,
}: {
  game: Game;
  onFinish: (score: number, win: boolean) => void;
  lead?: string;
}) {
  const [options, setOptions] = useState<{ years: number[]; eras: string[] } | null>(null);
  const [year, setYear] = useState<number | null>(null);
  const [era, setEra] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [round, setRound] = useState(0);

  useEffect(() => {
    const years = [...new Set(GAMES.map((item) => item.yearStyle))];
    const eras = ERAS.map((item) => item.id);
    setOptions({ years: pick(years, 3, game.yearStyle), eras: pick(eras, 3, game.era) });
  }, [game.id, game.yearStyle, game.era, round]);

  if (!options) {
    return <p className="text-sm text-muted">Die Karteikarten werden gelegt.</p>;
  }

  const submit = () => {
    if (year === null || era === null) {
      setNote("Jahr und Epoche wählen.");
      return;
    }
    if (year === game.yearStyle && era === game.era) {
      onFinish(100, true);
      return;
    }
    setNote("Nicht ganz. Schau auf Jahr und Regal, dann noch einmal.");
    setYear(null);
    setEra(null);
    setRound((n) => n + 1);
  };

  return (
    <div className="grid gap-4">
      <p className="text-sm text-muted">
        {lead ??
          "Dieser Automat ist noch nicht spielbar. Ordne ihn ein — richtiges Jahr und richtige Epoche legen die Karte ins Archiv."}
      </p>
      <div>
        <p className="mb-2 font-mono text-xs text-muted">Jahr</p>
        <div className="grid grid-cols-3 gap-2">
          {options.years.map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setYear(value)}
              className={cn(
                "min-h-11 rounded-md border font-mono text-sm tabular-nums",
                year === value ? "border-primary bg-surface-2 text-primary" : "border-border bg-bg text-fg",
              )}
            >
              {value}
            </button>
          ))}
        </div>
      </div>
      <div>
        <p className="mb-2 font-mono text-xs text-muted">Epoche</p>
        <div className="grid gap-2 sm:grid-cols-3">
          {options.eras.map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setEra(value)}
              className={cn(
                "min-h-11 rounded-md border text-sm font-semibold",
                era === value ? "border-primary bg-surface-2 text-primary" : "border-border bg-bg text-fg",
              )}
            >
              {ERAS.find((item) => item.id === value)?.label ?? value}
            </button>
          ))}
        </div>
      </div>
      <Btn onClick={submit}>Einordnen</Btn>
      {note ? <p className="text-sm text-primary">{note}</p> : null}
    </div>
  );
}
