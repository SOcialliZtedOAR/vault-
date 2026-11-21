import { createFileRoute, Link } from "@tanstack/react-router";
import { Compass, Cpu, Map, Pickaxe, Swords, User, UserPlus, Users, Wallet } from "lucide-react";
import { Shell } from "@/components/empire/Shell";
import { PageHead } from "@/components/empire/ui";

export const Route = createFileRoute("/more")({
  head: () => ({ meta: [{ title: "Mehr · Satoshi Retro Empire" }] }),
  component: MorePage,
});

const LINKS = [
  { to: "/login", title: "Konto", text: "Anlegen oder anmelden. E-Mail und Passwort, oder Google und X.", icon: UserPlus },
  { to: "/round", title: "Runde", text: "Stell dich vor. Die anderen sehen Name und Text, sonst nichts.", icon: Users },
  { to: "/mine", title: "Mine", text: "Virtuelle Schicht, kein echter Miner.", icon: Cpu },
  { to: "/roadmap", title: "Roadmap", text: "Seasons, Woche, was als Nächstes kommt.", icon: Map },
  { to: "/hunt", title: "Schatzsuche", text: "Quests mit festen Regeln.", icon: Compass },
  { to: "/season", title: "Season 01", text: "Zehn Herausforderungen. Die Krone kommt am Ende der Tafel.", icon: Swords },
  { to: "/archaeology", title: "Archäologie", text: "Gruben unter der Halle. Danach Jahr und Epoche im Grabungsbuch.", icon: Pickaxe },
  { to: "/wallet", title: "Wallet", text: "Adresse verknüpfen, Ledger übergeben.", icon: Wallet },
  { to: "/profile", title: "Profil", text: "Ruf, Abzeichen, Herausforderung.", icon: User },
] as const;

function MorePage() {
  return (
    <Shell>
      <PageHead
        kicker="Mehr"
        title="Der Rest der Halle."
        text="Mine, Season, Grabung, Wallet und Profil. Dieselben Räume wie in der großen Navigation, nur unter einem Daumen."
      />
      <div className="grid gap-3">
        {LINKS.map((item) => (
          <Link key={item.to} to={item.to} className="flex items-center gap-3 rounded-lg border border-border bg-surface p-4">
            <item.icon className="size-5 shrink-0 text-primary" aria-hidden />
            <span>
              <span className="block text-lg font-extrabold">{item.title}</span>
              <span className="block text-sm text-muted">{item.text}</span>
            </span>
          </Link>
        ))}
      </div>
    </Shell>
  );
}
