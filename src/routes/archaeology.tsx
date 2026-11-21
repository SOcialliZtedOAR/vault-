import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { DigPit } from "@/components/empire/DigPit";
import { Shell } from "@/components/empire/Shell";
import { Btn, PageHead, Panel } from "@/components/empire/ui";
import { DIGS, getGame } from "@/lib/empire/catalog";
import { useEmpire, type Grant } from "@/lib/empire/store";

export const Route = createFileRoute("/archaeology")({
  head: () => ({ meta: [{ title: "Archäologie · Satoshi Retro Empire" }] }),
  component: ArchaeologyPage,
});

function ArchaeologyPage() {
  const clears = useEmpire((s) => s.clears);
  const grantRun = useEmpire((s) => s.grantRun);
  const [pit, setPit] = useState<string | null>(null);
  const [grant, setGrant] = useState<Grant | null>(null);
  const active = DIGS.find((dig) => dig.id === pit);
  const game = active ? getGame(active.gameId) : undefined;
  const found = DIGS.filter((dig) => clears[dig.gameId]).length;
  const finds = useEmpire((s) => s.finds ?? []);

  return (
    <Shell>
      <PageHead
        kicker="Archäologie"
        title={`${DIGS.length} Gruben, ein Kern.`}
        text="Bürste, Kabel, Schnitt, Bohrung oder Presse. Wer den Kern freilegt, ordnet Jahr und Epoche. Das Grabungsbuch behält jeden Fund."
      />
      <p className="mb-4 font-mono text-xs text-muted tabular-nums">
        Geborgen {found}/{DIGS.length}
      </p>
      {game && active && !grant ? (
        <Panel>
          <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="font-mono text-xs text-primary">{active.stratum}</p>
              <h2 className="text-xl font-extrabold">{active.title}</h2>
              <p className="mt-1 text-sm text-muted">{game.title}</p>
            </div>
            <Btn variant="ghost" onClick={() => setPit(null)}>
              Zurück
            </Btn>
          </div>
          <DigPit
            key={active.id}
            game={game}
            onFinish={(score, win) => {
              setGrant(grantRun(game.id, score, win));
            }}
          />
        </Panel>
      ) : null}
      {grant && game ? (
        <Panel>
          <h2 className="text-xl font-extrabold">{grant.newCard ? "Karte im Archiv" : "Schicht notiert"}</h2>
          <p className="mt-2 text-sm text-muted">
            {game.title}. {grant.xp} XP
            {grant.sats ? `, ${grant.sats} sats ins Ledger` : ""}.
            {grant.already ? " Die Karte lag schon im Regal." : ""}
          </p>
          <div className="mt-4 flex gap-2">
            <Btn onClick={() => { setGrant(null); setPit(null); }}>Zur Übersicht</Btn>
            <Link
              to="/collection"
              className="inline-flex min-h-11 items-center rounded-md border border-border px-3 text-sm font-semibold"
            >
              Sammlung
            </Link>
          </div>
        </Panel>
      ) : null}
      {!active || grant ? (
        <div className="grid gap-3">
          {DIGS.map((dig) => {
            const cabinet = getGame(dig.gameId);
            const done = Boolean(clears[dig.gameId]);
            return (
              <Panel key={dig.id}>
                <p className="font-mono text-xs text-primary">{dig.stratum}</p>
                <h2 className="mt-1 text-lg font-extrabold">{dig.title}</h2>
                <p className="mt-1 text-sm text-muted">{dig.blurb}</p>
                <p className="mt-2 font-mono text-xs text-accent">{cabinet?.title ?? dig.gameId}</p>
                <div className="mt-3">
                  {done ? (
                    <p className="text-sm font-semibold text-primary">Geborgen</p>
                  ) : (
                    <Btn
                      onClick={() => {
                        setGrant(null);
                        setPit(dig.id);
                      }}
                    >
                      Graben
                    </Btn>
                  )}
                </div>
              </Panel>
            );
          })}
        </div>
      ) : null}
      {!active || grant ? (
        <Panel className="mt-4">
          <h2 className="text-lg font-extrabold">Grabungsbuch</h2>
          {finds.length === 0 ? (
            <p className="mt-2 text-sm text-muted">Noch kein Kern. Die erste richtige Einordnung schreibt die Zeile.</p>
          ) : (
            <ul className="mt-3 grid gap-2">
              {finds.map((find) => {
                const dig = DIGS.find((item) => item.id === find.pitId);
                const cabinet = getGame(find.gameId);
                return (
                  <li key={`${find.pitId}-${find.at}`} className="border-t border-border pt-2 first:border-0 first:pt-0">
                    <p className="font-mono text-xs text-primary">{dig?.stratum ?? "Schicht"}</p>
                    <p className="text-sm font-semibold">
                      {dig?.title ?? find.pitId}
                      {cabinet ? ` · ${cabinet.title}` : ""}
                    </p>
                  </li>
                );
              })}
            </ul>
          )}
        </Panel>
      ) : null}
    </Shell>
  );
}
