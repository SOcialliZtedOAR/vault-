import { Link } from "@tanstack/react-router";
import { Bookmark, BookmarkCheck } from "lucide-react";
import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/cn";
import { RARITY_LABEL } from "@/lib/empire/catalog";
import { useEmpire } from "@/lib/empire/store";
import type { Game, Rarity } from "@/lib/empire/types";

export function PageHead({ kicker, title, text }: { kicker: string; title: string; text: string }) {
  return (
    <header className="mb-6 max-w-2xl">
      <p className="font-mono text-xs text-primary">{kicker}</p>
      <h1 className="mt-1 text-2xl font-extrabold tracking-tight sm:text-4xl">{title}</h1>
      <p className="mt-2 text-muted">{text}</p>
    </header>
  );
}

export function Panel({ children, className }: { children: ReactNode; className?: string }) {
  return <section className={cn("rounded-lg border border-border bg-surface p-4", className)}>{children}</section>;
}

type BtnProps = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "solid" | "ghost" };

export function Btn({ variant = "solid", className, type = "button", ...props }: BtnProps) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex min-h-11 items-center justify-center gap-2 rounded-md px-4 text-sm font-semibold disabled:opacity-50",
        variant === "solid" ? "bg-primary text-primary-fg" : "border border-border bg-surface text-fg",
        className,
      )}
      {...props}
    />
  );
}

export function Field({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "min-h-11 w-full rounded-md border border-border bg-bg px-3 text-base text-fg placeholder:text-muted md:text-sm",
        className,
      )}
      {...props}
    />
  );
}

export function TextArea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "min-h-24 w-full rounded-md border border-border bg-bg px-3 py-2 text-base text-fg placeholder:text-muted md:text-sm",
        className,
      )}
      {...props}
    />
  );
}

export function RarityText({ rarity }: { rarity: Rarity }) {
  return (
    <span
      className={cn(
        "font-mono text-xs",
        rarity === "rare" ? "text-accent" : rarity === "common" ? "text-muted" : "text-primary",
      )}
    >
      {RARITY_LABEL[rarity]}
    </span>
  );
}

export function Meter({ value, max }: { value: number; max: number }) {
  const pct = max === 0 ? 0 : Math.min(100, Math.round((value / max) * 100));
  return (
    <div className="h-2 overflow-hidden rounded-sm bg-surface-2" aria-hidden>
      <div className="h-full bg-primary" style={{ width: `${pct}%` }} />
    </div>
  );
}

export function GameTile({ game }: { game: Game }) {
  const owned = useEmpire((s) => Boolean(s.ownedCards[game.collectibleId]));
  const wished = useEmpire((s) => s.wishlist.includes(game.id));
  const toggle = useEmpire((s) => s.toggleWishlist);
  return (
    <article className="flex flex-col rounded-lg border border-border bg-surface p-4">
      <div className="flex items-start justify-between gap-3">
        <p className="font-mono text-xs text-muted">
          {game.yearStyle}
          {game.code ? ` · ${game.code}` : ""}
        </p>
        <RarityText rarity={game.rarity} />
      </div>
      <h2 className="mt-2 text-xl font-extrabold leading-tight">{game.title}</h2>
      <p className="mt-2 flex-1 text-sm text-muted">{game.blurb}</p>
      <p className="mt-3 font-mono text-xs text-accent">
        {game.playable ? "Spielbar" : "Grabung"} · {game.rewards.sats} sats · {game.rewards.xp} XP
        {owned ? " · Karte im Archiv" : ""}
      </p>
      <div className="mt-4 flex gap-2">
        <Link
          to="/play/$gameId"
          params={{ gameId: game.id }}
          className="inline-flex min-h-11 flex-1 items-center justify-center rounded-md bg-primary px-3 text-sm font-semibold text-primary-fg"
        >
          {game.playable ? "Spielen" : "Graben"}
        </Link>
        <button
          type="button"
          aria-pressed={wished}
          aria-label={wished ? "Von der Merkliste nehmen" : "Auf die Merkliste"}
          onClick={() => toggle(game.id)}
          className="grid size-11 shrink-0 place-items-center rounded-md border border-border text-fg"
        >
          {wished ? <BookmarkCheck className="size-4 text-primary" /> : <Bookmark className="size-4" />}
        </button>
      </div>
    </article>
  );
}
