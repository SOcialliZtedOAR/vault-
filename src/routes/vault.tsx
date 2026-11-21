import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Shell } from "@/components/empire/Shell";
import { GameTile, Meter, PageHead, Panel } from "@/components/empire/ui";
import { cn } from "@/lib/cn";
import { ERAS, GAMES } from "@/lib/empire/catalog";
import { useEmpire } from "@/lib/empire/store";
import type { Era } from "@/lib/empire/types";

export const Route = createFileRoute("/vault")({
  head: () => ({ meta: [{ title: "Vault · Satoshi Retro Empire" }] }),
  component: VaultPage,
});

type Filter = Era | "all" | "live";

function VaultPage() {
  const [era, setEra] = useState<Filter>("all");
  const clears = useEmpire((s) => s.clears);
  const live = GAMES.filter((game) => game.playable);
  const done = live.filter((game) => clears[game.id]).length;
  const next = live.find((game) => !clears[game.id]);
  const games = GAMES.filter((game) => {
    if (era === "live") return game.playable;
    if (era === "all") return true;
    return game.era === era;
  })
    .slice()
    .sort((a, b) => {
      if (a.playable !== b.playable) return a.playable ? -1 : 1;
      return a.yearStyle - b.yearStyle;
    });

  return (
    <Shell>
      <PageHead
        kicker="Vault der verlorenen Level"
        title={`${live.length} Automaten, ein Archiv.`}
        text="Spielbare Automaten geben die Karte nach einem Abschluss. Was noch kein Spiel ist, liegt in der Archäologie: erst graben, dann Jahr und Epoche."
      />
      <Panel className="mb-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="font-mono text-xs text-muted">Abgeschlossen</p>
            <p className="text-2xl font-extrabold tabular-nums">
              {done}/{live.length}
            </p>
          </div>
          {next ? (
            <Link to="/play/$gameId" params={{ gameId: next.id }} className="text-sm font-semibold text-primary">
              Als Nächstes: {next.title}
            </Link>
          ) : (
            <p className="text-sm font-semibold text-accent">Alle Automaten einmal geschafft.</p>
          )}
        </div>
        <div className="mt-3">
          <Meter value={done} max={live.length} />
        </div>
      </Panel>
      <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
        <Chip active={era === "all"} onClick={() => setEra("all")}>
          Alle
        </Chip>
        <Chip active={era === "live"} onClick={() => setEra("live")}>
          Spielbar
        </Chip>
        {ERAS.map((item) => (
          <Chip key={item.id} active={era === item.id} onClick={() => setEra(item.id)}>
            {item.label}
          </Chip>
        ))}
      </div>
      <p className="mb-3 font-mono text-xs text-muted">{games.length} Automaten</p>
      <div className="grid gap-3 sm:grid-cols-2">
        {games.map((game) => (
          <GameTile key={game.id} game={game} />
        ))}
      </div>
    </Shell>
  );
}

function Chip({ active, children, onClick }: { active: boolean; children: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "min-h-11 shrink-0 rounded-md border px-3 text-sm font-semibold",
        active ? "border-primary bg-surface-2 text-primary" : "border-border bg-surface text-fg",
      )}
    >
      {children}
    </button>
  );
}
