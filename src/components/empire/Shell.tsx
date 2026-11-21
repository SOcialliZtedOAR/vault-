import { Link, useRouterState } from "@tanstack/react-router";
import {
  Bitcoin,
  Compass,
  Cpu,
  Joystick,
  LayoutGrid,
  Map,
  MessagesSquare,
  Pickaxe,
  Swords,
  Trophy,
  User,
  Users,
  Wallet,
} from "lucide-react";
import { useEffect, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { formatSats } from "@/lib/empire/logic";
import { useEmpire } from "@/lib/empire/store";
import { useCurrentUserState } from "@/lib/auth/use-current-user";

const LINKS = [
  { to: "/", label: "Halle", icon: LayoutGrid },
  { to: "/vault", label: "Vault", icon: Joystick },
  { to: "/collection", label: "Sammlung", icon: Trophy },
  { to: "/mine", label: "Mine", icon: Cpu },
  { to: "/council", label: "Council", icon: MessagesSquare },
  { to: "/round", label: "Runde", icon: Users },
  { to: "/roadmap", label: "Roadmap", icon: Map },
  { to: "/hunt", label: "Schatzsuche", icon: Compass },
  { to: "/season", label: "Season", icon: Swords },
  { to: "/archaeology", label: "Grabung", icon: Pickaxe },
  { to: "/wallet", label: "Wallet", icon: Wallet },
  { to: "/profile", label: "Profil", icon: User },
] as const;

type Href = (typeof LINKS)[number]["to"] | "/more";

const MORE_PATHS = ["/more", "/mine", "/roadmap", "/hunt", "/season", "/archaeology", "/wallet", "/profile", "/login", "/round"] as const;

function isActive(to: Href, path: string) {
  if (to === "/") return path === "/";
  if (to === "/more") return MORE_PATHS.some((item) => path === item);
  if (to === "/vault") return path === "/vault" || path.startsWith("/play");
  return path === to;
}

function NavLink({
  to,
  label,
  icon: Icon,
  compact = false,
}: {
  to: Href;
  label: string;
  icon: typeof LayoutGrid;
  compact?: boolean;
}) {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const active = isActive(to, path);
  return (
    <Link
      to={to}
      className={cn(
        "flex min-h-11 items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold",
        active ? "bg-surface-2 text-primary" : "text-muted hover:text-fg",
        compact && "min-w-0 flex-1 flex-col gap-1 px-1 text-[11px] leading-none",
      )}
    >
      <Icon className="size-4" aria-hidden />
      {compact ? <span className="max-w-full truncate">{label}</span> : label}
    </Link>
  );
}

export function Shell({ children }: { children: ReactNode }) {
  const pending = useEmpire((s) => s.satsPending);
  useEffect(() => {
    void useEmpire.persist.rehydrate();
  }, []);

  return (
    <div className="min-h-dvh bg-bg text-fg">
      <div className="h-1 bg-primary" />
      <header className="sticky top-0 z-20 border-b border-border bg-bg/95 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center gap-4 px-4 py-3">
          <Link to="/" className="flex min-w-0 items-center gap-3">
            <span className="grid size-11 shrink-0 place-items-center rounded-md bg-primary text-primary-fg">
              <Bitcoin className="size-5" aria-hidden />
            </span>
            <span className="min-w-0">
              <span className="block truncate text-base font-extrabold leading-tight sm:hidden">Retro Empire</span>
              <span className="hidden truncate text-base font-extrabold leading-tight sm:block">Satoshi Retro Empire</span>
              <span className="hidden font-mono text-xs text-muted sm:block">Play · Collect · Build · Earn</span>
            </span>
          </Link>
          <AuthSlot />
          <Link
            to="/wallet"
            className="ml-auto shrink-0 rounded-md border border-border bg-surface px-3 py-2 font-mono text-sm text-accent tabular-nums"
          >
            {formatSats(pending)}
          </Link>
        </div>
        <nav className="mx-auto hidden w-full max-w-6xl gap-1 overflow-x-auto px-4 pb-3 md:flex">
          {LINKS.map((item) => (
            <NavLink key={item.to} {...item} />
          ))}
        </nav>
      </header>
      <main className="mx-auto w-full max-w-6xl px-4 py-6 pb-[calc(6.5rem+env(safe-area-inset-bottom))] md:pb-16">{children}</main>
      <footer className="mx-auto hidden w-full max-w-6xl px-4 pb-10 text-sm text-muted md:block">
        Prototyp einer Spielhalle. Spiel-Sats sind eine Belohnungsschicht, kein Guthaben. Private Schlüssel werden
        weder abgefragt noch gespeichert. Gedacht als Brücke zu Bitcoinclub.game, Satoshi Games und Diensten wie ZBD —
        ohne behauptete Partnerschaft.
      </footer>
      <nav className="fixed inset-x-0 bottom-0 z-20 grid grid-cols-5 border-t border-border bg-bg/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden">
        <NavLink to="/" label="Halle" icon={LayoutGrid} compact />
        <NavLink to="/vault" label="Vault" icon={Joystick} compact />
        <NavLink to="/collection" label="Karten" icon={Trophy} compact />
        <NavLink to="/council" label="Council" icon={MessagesSquare} compact />
        <NavLink to="/more" label="Mehr" icon={Map} compact />
      </nav>
    </div>
  );
}

function AuthSlot() {
  const { user, isPending } = useCurrentUserState();
  if (isPending) return <span className="hidden h-11 w-24 shrink-0 animate-pulse rounded-md bg-surface-2 sm:block" />;
  if (user) {
    const label = user.displayName ?? user.primaryEmail ?? "Konto";
    return (
      <Link
        to="/login"
        className="inline-flex min-h-11 max-w-28 shrink-0 items-center truncate rounded-md border border-border px-3 text-sm font-semibold"
      >
        {label}
      </Link>
    );
  }
  return (
    <Link
      to="/login"
      className="inline-flex min-h-11 shrink-0 items-center rounded-md bg-primary px-3 text-sm font-semibold text-primary-fg"
    >
      Konto
    </Link>
  );
}
