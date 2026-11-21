import { createFileRoute, Link } from "@tanstack/react-router";
import { Shell } from "@/components/empire/Shell";
import { PageHead, Panel } from "@/components/empire/ui";
import { ROADMAP, WEEK } from "@/lib/empire/catalog";

export const Route = createFileRoute("/roadmap")({
  head: () => ({ meta: [{ title: "Roadmap · Satoshi Retro Empire" }] }),
  component: RoadmapPage,
});

const FLOW = ["Spielen", "Sammeln", "Besprechen", "Abstimmen", "Bauen", "Veröffentlichen"];

const SEASONS = [
  {
    id: "01",
    title: "The Lost Arcade",
    text: "Die Halle, wie sie jetzt steht. Die zehn Herausforderungen liegen auf der Season-Tafel.",
    state: "Läuft",
  },
  {
    id: "02",
    title: "Cyber Satoshi",
    text: "Mehr Sci-Fi und Bitcoin-Pioniere, sobald Season 01 ein volles Set gesehen hat.",
    state: "Als Nächstes",
  },
  {
    id: "03",
    title: "16-Bit Empire",
    text: "Dicke Module, längere Abende, ein eigenes Set statt einzelner Kacheln.",
    state: "Geplant",
  },
  {
    id: "04",
    title: "Multiplayer Mayhem",
    text: "Turniere und geteilte Vaults. Erst wenn die Halle eine Gemeinschaft ist, nicht vorher.",
    state: "Später",
  },
];

function RoadmapPage() {
  const day = (new Date().getDay() + 6) % 7;
  return (
    <Shell>
      <PageHead
        kicker="Öffentliche Roadmap"
        title="Was gebaut wird, steht im Flur."
        text="Kein verstecktes Backlog. Jetzt ist spielbar. Als Nächstes braucht Partner und Recht, nicht nur eine weitere Schaltfläche."
      />
      <ol className="mb-6 flex gap-2 overflow-x-auto pb-1">
        {FLOW.map((step, index) => (
          <li
            key={step}
            className="min-w-36 shrink-0 rounded-md border border-border bg-surface px-3 py-3"
          >
            <p className="font-mono text-xs text-muted">0{index + 1}</p>
            <p className="mt-1 text-sm font-semibold">{step}</p>
          </li>
        ))}
      </ol>
      <div className="grid gap-3 md:grid-cols-3">
        {ROADMAP.map((lane) => (
          <Panel key={lane.id}>
            <h2 className="font-mono text-xs text-primary">{lane.label}</h2>
            <ul className="mt-3 grid gap-2">
              {lane.items.map((item) => (
                <li key={item} className="border-t border-border pt-2 text-sm font-semibold first:border-0 first:pt-0">
                  {item}
                </li>
              ))}
            </ul>
          </Panel>
        ))}
      </div>
      <h2 className="mt-8 text-2xl font-extrabold">Seasons</h2>
      <p className="mt-2">
        <Link to="/season" className="text-sm font-semibold text-primary">
          Tafel von Season 01
        </Link>
      </p>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        {SEASONS.map((season) => (
          <Panel key={season.id}>
            <p className="font-mono text-xs text-muted">Season {season.id}</p>
            <h3 className="mt-1 text-xl font-extrabold">{season.title}</h3>
            <p className="mt-2 text-sm text-muted">{season.text}</p>
            <p className="mt-3 font-mono text-xs text-accent">{season.state}</p>
          </Panel>
        ))}
      </div>
      <h2 className="mt-8 text-2xl font-extrabold">Diese Woche</h2>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        {WEEK.map((item, index) => (
          <Panel key={item.label} className={index === day ? "border-primary" : undefined}>
            <p className="font-mono text-xs text-muted">{item.label}</p>
            <p className="text-lg font-extrabold">{item.title}</p>
          </Panel>
        ))}
      </div>
    </Shell>
  );
}
