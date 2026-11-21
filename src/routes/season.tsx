import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Shell } from "@/components/empire/Shell";
import { Btn, Meter, PageHead, Panel } from "@/components/empire/ui";
import { WEEK } from "@/lib/empire/catalog";
import { SEASON_CHALLENGES, seasonDone, type SeasonChallenge } from "@/lib/empire/logic";
import { useEmpire } from "@/lib/empire/store";
import { cn } from "@/lib/cn";

export const Route = createFileRoute("/season")({
  head: () => ({ meta: [{ title: "Season 01 · Satoshi Retro Empire" }] }),
  component: SeasonPage,
});

function SeasonPage() {
  const empire = useEmpire();
  const claimSeason = useEmpire((s) => s.claimSeason);
  const done = seasonDone(empire);
  const claimed = (empire.seasonClaims ?? []).includes("01");
  const day = (new Date().getDay() + 6) % 7;
  const today = WEEK[day]!;
  const spotlight = SEASON_CHALLENGES[day % SEASON_CHALLENGES.length]!;
  const [note, setNote] = useState("");

  return (
    <Shell>
      <PageHead
        kicker="Season 01 · The Lost Arcade"
        title="Zehn Herausforderungen, eine Krone."
        text="Die Tafel hakt ab, was du schon geschafft hast. Kein zweites Konto, kein Los. Am Ende liegt eine legendäre Karte im Archiv."
      />
      <Panel className="mb-4">
        <video
          className="aspect-video w-full rounded-md bg-bg"
          controls
          playsInline
          autoPlay
          muted
          loop
          preload="metadata"
          poster="/crown-poster.jpg"
          aria-label="Krone der Lost Arcade"
        >
          <source src="/crown.mp4" type="video/mp4" />
        </video>
        <p className="mt-2 text-sm text-muted">Die Krone über dem Automaten. Sie liegt erst im Archiv, wenn die Tafel voll ist.</p>
      </Panel>
      <Panel className="mb-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="font-mono text-xs text-muted">Stand</p>
            <p className="text-2xl font-extrabold tabular-nums">
              {done}/{SEASON_CHALLENGES.length}
            </p>
          </div>
          <p className="font-mono text-xs text-accent">+80 XP · +25 sats · Krone</p>
        </div>
        <div className="mt-3">
          <Meter value={done} max={SEASON_CHALLENGES.length} />
        </div>
        <div className="mt-4">
          {claimed ? (
            <p className="text-sm font-semibold text-primary">Die Krone liegt im Archiv.</p>
          ) : (
            <Btn
              disabled={done < SEASON_CHALLENGES.length}
              variant={done < SEASON_CHALLENGES.length ? "ghost" : "solid"}
              onClick={() => {
                const result = claimSeason();
                setNote(result.ok ? "Krone der Lost Arcade liegt im Archiv." : result.error);
              }}
            >
              {done < SEASON_CHALLENGES.length ? "Noch offen" : "Krone nehmen"}
            </Btn>
          )}
          {note ? <p className="mt-2 text-sm text-primary">{note}</p> : null}
        </div>
      </Panel>
      <Panel className="mb-4">
        <p className="font-mono text-xs text-primary">
          {today.label} · {today.title}
        </p>
        <h2 className="mt-1 text-lg font-extrabold">{spotlight.title}</h2>
        <p className="mt-1 text-sm text-muted">{spotlight.detail}</p>
      </Panel>
      <ol className="grid gap-3">
        {SEASON_CHALLENGES.map((item, index) => {
          const met = item.met(empire);
          return (
            <li key={item.id}>
              <Panel className={met ? "border-primary" : undefined}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-mono text-xs text-muted">
                      {String(index + 1).padStart(2, "0")}
                      {item.id === spotlight.id ? " · heute" : ""}
                    </p>
                    <h2 className={cn("mt-1 text-lg font-extrabold", met ? "text-fg" : "text-muted")}>{item.title}</h2>
                    <p className="mt-1 text-sm text-muted">{item.detail}</p>
                  </div>
                  {met ? <p className="text-sm font-semibold text-primary">Geschafft</p> : <ChallengeLink item={item} />}
                </div>
              </Panel>
            </li>
          );
        })}
      </ol>
    </Shell>
  );
}

function ChallengeLink({ item }: { item: SeasonChallenge }) {
  const className = "inline-flex min-h-11 items-center text-sm font-semibold text-primary";
  if (item.to === "/play/$gameId" && item.gameId) {
    return (
      <Link to="/play/$gameId" params={{ gameId: item.gameId }} className={className}>
        Zum Automaten
      </Link>
    );
  }
  if (item.to === "/play/$gameId") return null;
  return (
    <Link to={item.to} className={className}>
      Hin
    </Link>
  );
}
