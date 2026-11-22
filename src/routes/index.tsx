import { createFileRoute, Link } from "@tanstack/react-router";
import { Compass, Joystick, MessagesSquare, Pickaxe, Trophy, Users } from "lucide-react";
import { Shell } from "@/components/empire/Shell";
import { GameTile, Meter, Panel } from "@/components/empire/ui";
import { CARDS, DIGS, FEED, GAMES, WEEK } from "@/lib/empire/catalog";
import { QUESTS, reputationScore, seasonDone, titleFor } from "@/lib/empire/logic";
import { useEmpire } from "@/lib/empire/store";
import { useCurrentUserState } from "@/lib/auth/use-current-user";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [{ title: "Satoshi Retro Empire" }] }),
  component: Home,
});

const DOORS = [
  {
    to: "/vault",
    title: "Game Vault",
    text: `Epochen von 8-Bit bis Bitcoin. ${GAMES.filter((game) => game.playable).length} Automaten laufen, der Rest liegt in der Archäologie.`,
    icon: Joystick,
  },
  {
    to: "/collection",
    title: "Sammlung",
    text: "Jede Karte einmal. Volle Sets sind der Grund, wiederzukommen — nicht die Auszahlung.",
    icon: Trophy,
  },
  {
    to: "/council",
    title: "Retro Council",
    text: "Ideen, Stimmen, Kommentare. Die Halle wird nicht hinter einer geschlossenen Tür geplant.",
    icon: MessagesSquare,
  },
  {
    to: "/round",
    title: "Runde",
    text: "Wer ein Konto hat, stellt sich vor. Name und ein paar Sätze, keine Adresse.",
    icon: Users,
  },
  {
    to: "/hunt",
    title: "Schatzsuche",
    text: "Quests statt Lotterie. Wer eine Spur erfüllt, holt die Karte ab. Kein Glücksspiel.",
    icon: Compass,
  },
  {
    to: "/archaeology",
    title: "Archäologie",
    text: `${DIGS.length} Gruben unter der Halle. Erst das Werkzeug, dann Jahr und Epoche.`,
    icon: Pickaxe,
  },
] as const;

function Home() {
  const empire = useEmpire();
  const { user, isPending } = useCurrentUserState();
  const cards = Object.keys(empire.ownedCards).length;
  const rep = reputationScore(empire);
  const title = titleFor(rep);
  const openQuests = QUESTS.filter((quest) => quest.ready(empire) && !empire.claimedQuests.includes(quest.id)).length;
  const day = (new Date().getDay() + 6) % 7;

  return (
    <Shell>
      <p className="font-mono text-xs text-primary">Season 01 · The Lost Arcade</p>
      <h1 className="mt-2 max-w-3xl text-3xl font-extrabold tracking-tight sm:text-5xl">
        Spiele die Geschichte. Sammle die Legenden.
      </h1>
      <p className="mt-3 max-w-2xl text-muted">
        Eine digitale Spielhalle mit Archiv, Council und einer Bitcoin-Schicht, die keine Schlüssel verwahrt. Das Spiel
        kennt deinen Fortschritt. Die Wallet bleibt bei dir.
      </p>
      <div className="mt-5 flex flex-wrap gap-2">
        <Link
          to="/vault"
          className="inline-flex min-h-11 items-center rounded-md bg-primary px-4 text-sm font-semibold text-primary-fg"
        >
          In den Vault
        </Link>
        <Link
          to="/council"
          className="inline-flex min-h-11 items-center rounded-md border border-border bg-surface px-4 text-sm font-semibold"
        >
          Council öffnen
        </Link>
        {isPending || user ? null : (
          <Link
            to="/login"
            className="inline-flex min-h-11 items-center rounded-md border border-border bg-surface px-4 text-sm font-semibold"
          >
            Konto anlegen
          </Link>
        )}
      </div>

      <dl className="mt-6 flex gap-3 overflow-x-auto pb-1 sm:grid sm:grid-cols-3 sm:overflow-visible lg:grid-cols-5">
        {[
          ["Karten", `${cards}/${CARDS.length}`],
          ["Ruf", `${rep} · ${title.name}`],
          ["Ledger", `${empire.satsPending} sats`],
          ["Spuren", openQuests > 0 ? `${openQuests} offen` : "ruhig"],
          ["Season", `${seasonDone(empire)}/10`],
        ].map(([label, value]) => (
          <Panel key={label} className="w-36 shrink-0 sm:w-auto">
            <dt className="font-mono text-xs text-muted">{label}</dt>
            <dd className="mt-1 text-lg font-extrabold leading-tight">{value}</dd>
          </Panel>
        ))}
      </dl>

      <div className="mt-8">
        <div className="mb-3 flex items-end justify-between gap-3">
          <h2 className="text-2xl font-extrabold">Frische Automaten</h2>
          <Link to="/vault" className="text-sm font-semibold text-primary">
            Alle {GAMES.length}
          </Link>
        </div>
        <div className="-mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-1 md:mx-0 md:grid md:grid-cols-2 md:overflow-visible md:px-0">
          {["coin-tower", "block-hop", "raster-light", "neon-keirin", "sprite-saga", "halving-hero", "block-oracle", "crt-ghosts"].map((id) => {
            const game = GAMES.find((item) => item.id === id);
            return game ? (
              <div key={game.id} className="w-72 shrink-0 snap-start md:w-auto">
                <GameTile game={game} />
              </div>
            ) : null;
          })}
        </div>
      </div>

      <div className="mt-8 grid gap-3 md:grid-cols-2">
        {DOORS.map((door) => (
          <Link key={door.to} to={door.to} className="rounded-lg border border-border bg-surface p-4">
            <door.icon className="size-5 text-primary" aria-hidden />
            <h2 className="mt-3 text-xl font-extrabold">{door.title}</h2>
            <p className="mt-1 text-sm text-muted">{door.text}</p>
          </Link>
        ))}
      </div>

      <div className="mt-8 grid gap-3 lg:grid-cols-5">
        <Panel className="lg:col-span-3">
          <h2 className="text-lg font-extrabold">In der Halle</h2>
          <ul className="mt-3 grid gap-3">
            {FEED.map((item) => (
              <li key={item.who} className="border-t border-border pt-3 first:border-0 first:pt-0">
                <p className="text-sm">
                  <span className="font-semibold">{item.who}</span> <span className="text-muted">{item.text}</span>
                </p>
              </li>
            ))}
          </ul>
        </Panel>
        <Panel className="lg:col-span-2">
          <h2 className="text-lg font-extrabold">Spielhallen-Woche</h2>
          <ol className="mt-3 grid gap-2">
            {WEEK.map((item, index) => (
              <li
                key={item.label}
                className={
                  index === day
                    ? "flex items-center justify-between rounded-md bg-surface-2 px-3 py-2"
                    : "flex items-center justify-between px-3 py-2 text-muted"
                }
              >
                <span className="font-mono text-xs">{item.label}</span>
                <span className="text-sm font-semibold">{item.title}</span>
              </li>
            ))}
          </ol>
        </Panel>
      </div>

      <Panel className="mt-3">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-extrabold">Archiv dieser Saison</h2>
          <span className="font-mono text-xs text-muted">
            {cards}/{CARDS.length}
          </span>
        </div>
        <div className="mt-3">
          <Meter value={cards} max={CARDS.length} />
        </div>
        <p className="mt-3 text-sm text-muted">
          Bitcoin ist die Infrastruktur hinter der Halle, nicht das Plakat an der Tür. Belohnungen landen zuerst im
          Spiel-Ledger und gehen erst auf Zuruf an eine verknüpfte Lightning-Adresse.
        </p>
      </Panel>
    </Shell>
  );
}
