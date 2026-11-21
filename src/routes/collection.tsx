import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Shell } from "@/components/empire/Shell";
import { Meter, PageHead, Panel, RarityText } from "@/components/empire/ui";
import { cn } from "@/lib/cn";
import { CARDS, RARITY_LABEL, SETS, getSet } from "@/lib/empire/catalog";
import { rarityCounts, setProgress } from "@/lib/empire/logic";
import { useEmpire } from "@/lib/empire/store";

export const Route = createFileRoute("/collection")({
  head: () => ({ meta: [{ title: "Sammlung · Satoshi Retro Empire" }] }),
  component: CollectionPage,
});

function CollectionPage() {
  const owned = useEmpire((s) => s.ownedCards);
  const [setId, setSetId] = useState<string>("all");
  const counts = rarityCounts(owned);
  const visible = CARDS.filter((card) => setId === "all" || card.setId === setId);
  const have = Object.keys(owned).length;

  return (
    <Shell>
      <PageHead
        kicker="Collection Vault"
        title={`${have} von ${CARDS.length} Karten.`}
        text="Die Auszahlung ist eine Ebene. Die Sammlung ist der Grund, die Halle nicht nach einer Runde zu verlassen. Volle Sets schalten den nächsten Anspruch frei — hier sichtbar als abgeschlossenes Regal."
      />
      <div className="mb-6 grid gap-3 sm:grid-cols-2">
        {counts.map((row) => (
          <Panel key={row.rarity}>
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-semibold">{RARITY_LABEL[row.rarity]}</span>
              <span className="font-mono text-xs text-muted">
                {row.have}/{row.total}
              </span>
            </div>
            <Meter value={row.have} max={row.total} />
          </Panel>
        ))}
      </div>
      <div className="mb-4 grid gap-3 md:grid-cols-2">
        {SETS.map((set) => {
          const progress = setProgress(set.id, owned);
          const done = progress.have === progress.total;
          return (
            <button
              key={set.id}
              type="button"
              onClick={() => setSetId(set.id)}
              className={cn(
                "rounded-lg border p-4 text-left",
                setId === set.id ? "border-primary bg-surface-2" : "border-border bg-surface",
              )}
            >
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-lg font-extrabold">{set.title}</h2>
                <span className="font-mono text-xs text-muted">
                  {progress.have}/{progress.total}
                </span>
              </div>
              <p className="mt-1 text-sm text-muted">{set.blurb}</p>
              <div className="mt-3">
                <Meter value={progress.have} max={progress.total} />
              </div>
              {done ? <p className="mt-2 font-mono text-xs text-accent">Set vollständig</p> : null}
            </button>
          );
        })}
      </div>
      <div className="mb-3 flex items-center justify-between">
        <p className="font-mono text-xs text-muted">{setId === "all" ? "Ganzes Archiv" : getSet(setId)?.title}</p>
        {setId !== "all" ? (
          <button type="button" className="text-sm font-semibold text-primary" onClick={() => setSetId("all")}>
            Alle Sets
          </button>
        ) : null}
      </div>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        {visible.map((card) => {
          const mine = owned[card.id];
          return (
            <article
              key={card.id}
              className={cn(
                "flex min-h-40 flex-col justify-between rounded-lg border p-3",
                mine ? "border-primary bg-surface" : "border-border bg-bg",
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <p className="font-mono text-xs text-muted">{getSet(card.setId)?.title}</p>
                <RarityText rarity={card.rarity} />
              </div>
              <h3 className={cn("text-lg font-extrabold leading-tight", mine ? "text-fg" : "text-muted")}>{card.title}</h3>
              <p className="text-sm text-muted">{mine ? `Edition ${mine.edition}` : "Noch verschlossen"}</p>
            </article>
          );
        })}
      </div>
    </Shell>
  );
}
