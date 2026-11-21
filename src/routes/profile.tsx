import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Shell } from "@/components/empire/Shell";
import { Btn, Field, PageHead, Panel } from "@/components/empire/ui";
import { ACHIEVEMENTS, GAMES, ROLES, TITLES, getCard } from "@/lib/empire/catalog";
import { archiveHtml, downloadArchive } from "@/lib/empire/archive-html";
import { achievementTitle, makeRivalCode, reputationScore, titleFor } from "@/lib/empire/logic";
import { useEmpire } from "@/lib/empire/store";
import { UserButton } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { cn } from "@/lib/cn";

export const Route = createFileRoute("/profile")({
  head: () => ({ meta: [{ title: "Profil · Satoshi Retro Empire" }] }),
  component: ProfilePage,
});

function AccountCard() {
  const { user, isPending } = useCurrentUserState();
  if (isPending) return <div className="h-24 animate-pulse rounded-lg bg-surface" />;
  if (!user) {
    return (
      <Panel>
        <h2 className="text-lg font-extrabold">Konto</h2>
        <p className="mt-2 text-sm text-muted">Noch keins. Anlegen geht mit E-Mail und Passwort.</p>
        <Link
          to="/login"
          className="mt-3 inline-flex min-h-11 items-center rounded-md bg-primary px-4 text-sm font-semibold text-primary-fg"
        >
          Konto anlegen
        </Link>
      </Panel>
    );
  }
  return (
    <Panel>
      <h2 className="text-lg font-extrabold">Konto</h2>
      <p className="mt-2 text-sm text-muted">{user.primaryEmail ?? "Angemeldet"}</p>
      <div className="mt-3">
        <UserButton />
      </div>
    </Panel>
  );
}

function ProfilePage() {
  const empire = useEmpire();
  const setHandle = useEmpire((s) => s.setHandle);
  const setRival = useEmpire((s) => s.setRival);
  const clearRival = useEmpire((s) => s.clearRival);
  const resetArchive = useEmpire((s) => s.resetArchive);
  const rep = reputationScore(empire);
  const title = titleFor(rep);
  const [name, setName] = useState<string | null>(null);
  const shownName = name ?? empire.handle;
  const [code, setCode] = useState("");
  const [note, setNote] = useState("");
  const [armed, setArmed] = useState(false);
  const best = GAMES.filter((game) => game.code && (empire.scores[game.id] ?? 0) > 0);

  return (
    <Shell>
      <PageHead
        kicker={title.role}
        title={title.name}
        text="Ruf kommt aus Spielen, Karten, Stimmen und Ideen. Ein Konto merkt sich, wer du bist. Das Archiv auf diesem Gerät bleibt davon getrennt."
      />
      <AccountCard />
      <div className="mt-3 grid gap-3 lg:grid-cols-2">
        <Panel>
          <h2 className="text-lg font-extrabold">Name in der Halle</h2>
          <form
            className="mt-3 flex gap-2"
            onSubmit={(event) => {
              event.preventDefault();
              setHandle(shownName);
              setNote("Name gesetzt.");
            }}
          >
            <Field value={shownName} maxLength={24} onChange={(event) => setName(event.target.value)} />
            <Btn type="submit">Speichern</Btn>
          </form>
          <p className="mt-3 font-mono text-sm text-accent">Ruf {rep}</p>
          <ol className="mt-3 grid gap-1">
            {TITLES.map((item) => (
              <li
                key={item.name}
                className={cn(
                  "flex justify-between text-sm",
                  item.name === title.name ? "font-semibold text-primary" : "text-muted",
                )}
              >
                <span>{item.name}</span>
                <span className="font-mono text-xs">{item.min}</span>
              </li>
            ))}
          </ol>
          <p className="mt-3 text-sm text-muted">{ROLES.join(" → ")}</p>
        </Panel>
        <Panel>
          <h2 className="text-lg font-extrabold">Punktzahl hinterlegen</h2>
          <p className="mt-2 text-sm text-muted">
            Kein Einladungslink um Sats. Ein Code, eine Frage: schaffst du die Zahl im passenden Automaten?
          </p>
          {best.length > 0 ? (
            <ul className="mt-3 grid gap-2">
              {best.map((game) => (
                <li key={game.id} className="font-mono text-sm text-accent">
                  {makeRivalCode(game.code!, empire.scores[game.id] ?? 0)}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm text-muted">Noch keine eigene Zahl. Spiel zuerst einen Automaten mit Code.</p>
          )}
          <form
            className="mt-3 grid gap-2"
            onSubmit={(event) => {
              event.preventDefault();
              const result = setRival(code);
              setNote(result.ok ? "Herausforderung liegt bereit." : result.error);
            }}
          >
            <Field
              value={code}
              placeholder="SRE-LOST-900"
              spellCheck={false}
              onChange={(event) => setCode(event.target.value)}
            />
            <div className="flex flex-wrap gap-2">
              <Btn type="submit">Annehmen</Btn>
              {empire.rival ? (
                <Btn type="button" variant="ghost" onClick={() => clearRival()}>
                  Ablegen
                </Btn>
              ) : null}
            </div>
          </form>
          {empire.rival ? (
            <p className="mt-3 text-sm">
              Offen: SRE-{empire.rival.code}-{empire.rival.score}
              {empire.achievements.includes("rival-beaten") ? " · geschlagen" : ""}
            </p>
          ) : null}
        </Panel>
      </div>
      <h2 className="mt-8 text-2xl font-extrabold">Abzeichen</h2>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        {ACHIEVEMENTS.map((item) => {
          const on = empire.achievements.includes(item.id);
          return (
            <Panel key={item.id} className={on ? "border-primary" : undefined}>
              <h3 className={cn("font-extrabold", on ? "text-fg" : "text-muted")}>{item.title}</h3>
              <p className="text-sm text-muted">{item.detail}</p>
            </Panel>
          );
        })}
      </div>
      <h2 className="mt-8 text-2xl font-extrabold">Log</h2>
      <ul className="mt-3 grid gap-2">
        {empire.log.length === 0 ? <li className="text-sm text-muted">Noch still.</li> : null}
        {empire.log.map((entry) => (
          <li key={entry.id} className="rounded-md border border-border bg-surface px-3 py-2 text-sm">
            {entry.text}
          </li>
        ))}
      </ul>
      <div className="mt-8 flex flex-wrap gap-2">
        <Btn
          onClick={() => {
            downloadArchive(
              archiveHtml({
                handle: empire.handle,
                title: title.name,
                xp: empire.xp,
                satsPending: empire.satsPending,
                satsWithdrawn: empire.satsWithdrawn,
                wallet: empire.wallet?.address ?? null,
                cards: Object.entries(empire.ownedCards).map(([id, owned]) => ({
                  title: getCard(id)?.title ?? id,
                  edition: owned.edition,
                })),
                clears: Object.keys(empire.clears).map((id) => GAMES.find((game) => game.id === id)?.title ?? id),
                achievements: empire.achievements.map((id) => achievementTitle(id)),
                log: empire.log.map((entry) => entry.text),
                savedAt: new Date().toLocaleString("de-DE"),
              }),
            );
            setNote("Die HTML-Datei liegt im Download. Sie öffnet sich ohne Netz, auch auf dem Handy.");
          }}
        >
          Als HTML sichern
        </Btn>
        <a
          href="/offline.html"
          className="inline-flex min-h-11 items-center rounded-md border border-border px-4 text-sm font-semibold"
        >
          Offline-Halle öffnen
        </a>
        {armed ? (
          <div className="flex flex-wrap gap-2">
            <Btn
              onClick={() => {
                resetArchive();
                setArmed(false);
                setName(null);
                setNote("Archiv geleert.");
              }}
            >
              Wirklich leeren
            </Btn>
            <Btn variant="ghost" onClick={() => setArmed(false)}>
              Behalten
            </Btn>
          </div>
        ) : (
          <Btn variant="ghost" onClick={() => setArmed(true)}>
            Archiv auf diesem Gerät leeren
          </Btn>
        )}
      </div>
      {note ? <p className="mt-4 text-sm text-primary">{note}</p> : null}
    </Shell>
  );
}
