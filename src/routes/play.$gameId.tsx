import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Shell } from "@/components/empire/Shell";
import { AmberRally } from "@/components/empire/games/AmberRally";
import { BlockOracle } from "@/components/empire/games/BlockOracle";
import { BlockHop } from "@/components/empire/games/BlockHop";
import { CartridgeQuest } from "@/components/empire/games/CartridgeQuest";
import { CoinTower } from "@/components/empire/games/CoinTower";
import { CometCabinet } from "@/components/empire/games/CometCabinet";
import { CrtGhosts } from "@/components/empire/games/CrtGhosts";
import { DosDungeon } from "@/components/empire/games/DosDungeon";
import { DigPit } from "@/components/empire/DigPit";
import { GenesisRun } from "@/components/empire/games/GenesisRun";
import { HalvingHero } from "@/components/empire/games/HalvingHero";
import { HashRush } from "@/components/empire/games/HashRush";
import { ModemMarathon } from "@/components/empire/games/ModemMarathon";
import { NeonKeirin } from "@/components/empire/games/NeonKeirin";
import { PeerPong } from "@/components/empire/games/PeerPong";
import { PhosphorSerpent } from "@/components/empire/games/PhosphorSerpent";
import { RasterLight } from "@/components/empire/games/RasterLight";
import { SatoshiSolitaire } from "@/components/empire/games/SatoshiSolitaire";
import { SignalMatch } from "@/components/empire/games/SignalMatch";
import { SpriteSaga } from "@/components/empire/games/SpriteSaga";
import { VaultBreaker } from "@/components/empire/games/VaultBreaker";
import { VaultRacer } from "@/components/empire/games/VaultRacer";
import { Btn, PageHead, Panel, RarityText } from "@/components/empire/ui";
import { getGame } from "@/lib/empire/catalog";
import { achievementTitle, makeRivalCode } from "@/lib/empire/logic";
import { useEmpire, type Grant } from "@/lib/empire/store";
import type { Game } from "@/lib/empire/types";

export const Route = createFileRoute("/play/$gameId")({
  head: ({ params }) => ({
    meta: [{ title: `${getGame(params.gameId)?.title ?? "Automat"} · Satoshi Retro Empire` }],
  }),
  component: PlayPage,
});

function Cabinet({ game, onFinish }: { game: Game; onFinish: (score: number, win: boolean) => void }) {
  if (game.engine === "breaker") return <VaultBreaker onFinish={onFinish} />;
  if (game.engine === "serpent") return <PhosphorSerpent onFinish={onFinish} />;
  if (game.engine === "hash") return <HashRush onFinish={onFinish} />;
  if (game.engine === "match") return <SignalMatch onFinish={onFinish} />;
  if (game.engine === "pong") return <PeerPong onFinish={onFinish} />;
  if (game.engine === "comet") return <CometCabinet onFinish={onFinish} />;
  if (game.engine === "ghosts") return <CrtGhosts onFinish={onFinish} />;
  if (game.engine === "runner") return <GenesisRun onFinish={onFinish} />;
  if (game.engine === "rally") return <AmberRally onFinish={onFinish} />;
  if (game.engine === "dungeon") return <DosDungeon onFinish={onFinish} />;
  if (game.engine === "quest") return <CartridgeQuest onFinish={onFinish} />;
  if (game.engine === "oracle") return <BlockOracle onFinish={onFinish} />;
  if (game.engine === "hero") return <HalvingHero onFinish={onFinish} />;
  if (game.engine === "keirin") return <NeonKeirin onFinish={onFinish} />;
  if (game.engine === "saga") return <SpriteSaga onFinish={onFinish} />;
  if (game.engine === "modem") return <ModemMarathon onFinish={onFinish} />;
  if (game.engine === "solitaire") return <SatoshiSolitaire onFinish={onFinish} />;
  if (game.engine === "trial") return <VaultRacer onFinish={onFinish} />;
  if (game.engine === "tower") return <CoinTower onFinish={onFinish} />;
  if (game.engine === "hop") return <BlockHop onFinish={onFinish} />;
  if (game.engine === "lights") return <RasterLight onFinish={onFinish} />;
  return <DigPit game={game} onFinish={onFinish} />;
}

function PlayPage() {
  const { gameId } = Route.useParams();
  const game = getGame(gameId);
  const grantRun = useEmpire((s) => s.grantRun);
  const best = useEmpire((s) => (game ? (s.scores[game.id] ?? 0) : 0));
  const rival = useEmpire((s) => s.rival);
  const [session, setSession] = useState(0);
  const [result, setResult] = useState<Grant | null>(null);

  if (!game) {
    return (
      <Shell>
        <PageHead kicker="Automat" title="Dieses Cabinet steht nicht im Vault." text="Der Code in der Adresse passt zu keinem Regal." />
        <Link to="/vault" className="text-sm font-semibold text-primary">
          Zurück in den Vault
        </Link>
      </Shell>
    );
  }

  const finish = (score: number, win: boolean) => {
    setResult(grantRun(game.id, score, win));
  };

  return (
    <Shell>
      <PageHead kicker={`${game.yearStyle} · ${game.era}`} title={game.title} text={game.blurb} />
      <div className="mb-4 flex flex-wrap items-center gap-3 text-sm">
        <RarityText rarity={game.rarity} />
        <span className="font-mono text-xs text-muted">Bestleistung {best}</span>
        {game.code && best > 0 ? (
          <span className="font-mono text-xs text-accent">{makeRivalCode(game.code, best)}</span>
        ) : null}
        {rival && game.code === rival.code ? (
          <span className="font-mono text-xs text-primary">Herausforderung {rival.score}</span>
        ) : null}
      </div>
      <div className="grid gap-4 lg:grid-cols-[minmax(0,28rem)_1fr]">
        <Panel>
          {result ? (
            <Result game={game} result={result} onAgain={() => { setResult(null); setSession((n) => n + 1); }} />
          ) : (
            <Cabinet key={session} game={game} onFinish={finish} />
          )}
        </Panel>
        <div className="grid content-start gap-3">
          <Panel>
            <h2 className="text-lg font-extrabold">Was dieser Lauf wert ist</h2>
            <p className="mt-2 text-sm text-muted">
              Der erste Abschluss legt die Karte und schreibt {game.rewards.sats} sats sowie {game.rewards.xp} XP ins
              Ledger. Weitere Siege geben nur noch etwas Erfahrung. Die Plattform speichert keinen privaten Schlüssel.
            </p>
          </Panel>
          <Panel>
            <h2 className="text-lg font-extrabold">Trennung</h2>
            <ol className="mt-2 grid gap-2 text-sm text-muted">
              <li>1. Der Automat kennt nur den Spielstand.</li>
              <li>2. Das Archiv kennt Karte, XP und ein offenes Ledger.</li>
              <li>3. Die Wallet bekommst du erst, wenn du selbst übergibst.</li>
            </ol>
          </Panel>
        </div>
      </div>
    </Shell>
  );
}

function Result({ game, result, onAgain }: { game: Game; result: Grant; onAgain: () => void }) {
  const won = result.newCard || result.already || result.sats > 0 || result.xp > 12;
  return (
    <div className="grid gap-3">
      <p className="font-mono text-xs text-primary">{result.newCard ? "Karte im Archiv" : won ? "Lauf verbucht" : "Kein Abschluss"}</p>
      <h2 className="text-2xl font-extrabold">
        {result.newCard
          ? `${game.title} gehört dir.`
          : result.already
            ? "Die Karte hattest du schon."
            : "Diesmal bleibt das Regal zu."}
      </h2>
      <p className="font-mono text-sm text-accent tabular-nums">
        +{result.xp} XP · +{result.sats} sats · Bestleistung {result.best}
      </p>
      {result.achievements.length > 0 ? (
        <ul className="grid gap-1 text-sm">
          {result.achievements.map((id) => (
            <li key={id}>{achievementTitle(id)}</li>
          ))}
        </ul>
      ) : null}
      <div className="flex flex-wrap gap-2">
        <Btn onClick={onAgain}>Nochmal</Btn>
        <Link
          to="/collection"
          className="inline-flex min-h-11 items-center rounded-md border border-border px-4 text-sm font-semibold"
        >
          Sammlung
        </Link>
      </div>
    </div>
  );
}
