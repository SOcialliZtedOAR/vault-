import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Shell } from "@/components/empire/Shell";
import { Btn, Field, PageHead, Panel, TextArea } from "@/components/empire/ui";
import { listIntroductions, saveIntroduction, type Introduction } from "@/lib/empire/introductions";
import { useCurrentUserState } from "@/lib/auth/use-current-user";

export const Route = createFileRoute("/round")({
  head: () => ({ meta: [{ title: "Runde · Satoshi Retro Empire" }] }),
  component: RoundPage,
});

function RoundPage() {
  const { user, isPending } = useCurrentUserState();
  const [rows, setRows] = useState<Introduction[] | null>(null);
  const [name, setName] = useState("");
  const [body, setBody] = useState("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);

  const userId = user?.id;
  const displayName = user?.displayName ?? "";

  useEffect(() => {
    if (!userId) return;
    let alive = true;
    listIntroductions()
      .then((next) => {
        if (!alive) return;
        setRows(next);
        const mine = next.find((row) => row.userId === userId);
        setName(mine?.name ?? displayName);
        setBody(mine?.body ?? "");
      })
      .catch(() => {
        if (alive) setRows([]);
      });
    return () => {
      alive = false;
    };
  }, [userId, displayName]);

  const save = async () => {
    setNote("");
    setBusy(true);
    try {
      const result = await saveIntroduction({ data: { name, body } });
      if ("error" in result) {
        setNote(result.error);
        return;
      }
      const next = await listIntroductions();
      setRows(next);
      setNote("Vorstellung steht in der Runde.");
    } catch {
      setNote("Das hat nicht geklappt. Melde dich an und versuch es noch einmal.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Shell>
      <PageHead
        kicker="Runde"
        title="Stell dich vor."
        text="Name und ein paar Sätze. Keine E-Mail, kein Schlüssel. Die Runde sieht nur, was du hier schreibst."
      />
      {isPending ? <div className="h-40 animate-pulse rounded-lg bg-surface" /> : null}
      {!isPending && !user ? (
        <Panel>
          <h2 className="text-lg font-extrabold">Erst das Konto.</h2>
          <p className="mt-2 text-sm text-muted">Ohne Anmeldung gibt es keine Vorstellung und keine Runde.</p>
          <Link
            to="/login"
            className="mt-3 inline-flex min-h-11 items-center rounded-md bg-primary px-4 text-sm font-semibold text-primary-fg"
          >
            Konto anlegen
          </Link>
        </Panel>
      ) : null}
      {!isPending && user ? (
        <form
          className="grid max-w-xl gap-3"
          onSubmit={(event) => {
            event.preventDefault();
            void save();
          }}
        >
          <Field
            required
            maxLength={24}
            aria-label="Name"
            placeholder="Name in der Runde"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
          <TextArea
            required
            maxLength={320}
            aria-label="Vorstellung"
            placeholder="Was spielst du, und warum bist du in der Halle?"
            value={body}
            onChange={(event) => setBody(event.target.value)}
          />
          {note ? <p className="text-sm text-primary">{note}</p> : null}
          <Btn type="submit" disabled={busy}>
            {busy ? "Einen Moment…" : "Vorstellung speichern"}
          </Btn>
        </form>
      ) : null}
      <div className="mt-8 grid gap-3">
        {rows && rows.length === 0 ? <p className="text-sm text-muted">Noch niemand. Die erste Vorstellung kann deine sein.</p> : null}
        {rows?.map((row) => (
          <Panel key={row.userId} className={row.userId === user?.id ? "border-primary" : undefined}>
            <div className="flex items-baseline justify-between gap-3">
              <h2 className="text-lg font-extrabold">{row.name}</h2>
              <span className="font-mono text-xs text-muted">{row.updatedOn}</span>
            </div>
            <p className="mt-2 whitespace-pre-wrap text-sm">{row.body}</p>
          </Panel>
        ))}
      </div>
    </Shell>
  );
}
