import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { Shell } from "@/components/empire/Shell";
import { Btn, Field, PageHead, Panel } from "@/components/empire/ui";
import { GROK_PROVIDERS, authClient, signIn } from "@/lib/auth/client";
import { UserButton } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { useEmpire } from "@/lib/empire/store";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Konto · Satoshi Retro Empire" }] }),
  component: LoginPage,
});

function accountError(message: string | undefined) {
  const text = (message ?? "").toLowerCase();
  if (text.includes("exist") || text.includes("already")) return "Zu dieser Adresse gibt es schon ein Konto. Melde dich an.";
  if (text.includes("invalid email or password") || text.includes("credential")) return "E-Mail oder Passwort stimmt nicht.";
  if (text.includes("password")) return "Das Passwort braucht mindestens 8 Zeichen.";
  if (text.includes("email")) return "Die E-Mail-Adresse ist ungültig.";
  return "Das hat nicht geklappt. Prüfe die Angaben und versuch es noch einmal.";
}

function LoginPage() {
  const navigate = useNavigate();
  const { user, isPending } = useCurrentUserState();
  const [mode, setMode] = useState<"join" | "enter">("join");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    if (password.length < 8) {
      setError("Das Passwort braucht mindestens 8 Zeichen.");
      return;
    }
    setBusy(true);
    const result =
      mode === "join"
        ? await authClient.signUp.email({ name: name.trim(), email: email.trim(), password, callbackURL: "/" })
        : await authClient.signIn.email({ email: email.trim(), password, callbackURL: "/" });
    setBusy(false);
    if (result.error) {
      setError(accountError(result.error.message));
      return;
    }
    if (mode === "join") useEmpire.getState().setHandle(name.trim());
    await navigate({ to: "/" });
  };

  return (
    <Shell>
      <PageHead
        kicker="Konto"
        title={mode === "join" ? "Ein Konto anlegen." : "Wieder in die Halle."}
        text="E-Mail und Passwort bleiben bei dieser Halle. Das Spiel-Archiv auf dem Gerät ist davon getrennt, und private Schlüssel werden nicht abgefragt."
      />
      {isPending ? <div className="h-40 animate-pulse rounded-lg bg-surface" /> : null}
      {!isPending && user ? (
        <Panel>
          <h2 className="text-lg font-extrabold">Du bist schon angemeldet.</h2>
          <div className="mt-3">
            <UserButton />
          </div>
        </Panel>
      ) : null}
      {!isPending && !user ? (
        <div className="grid max-w-md gap-3">
          <div className="grid grid-cols-2 gap-2">
            <Btn variant={mode === "join" ? "solid" : "ghost"} onClick={() => setMode("join")}>
              Anlegen
            </Btn>
            <Btn variant={mode === "enter" ? "solid" : "ghost"} onClick={() => setMode("enter")}>
              Anmelden
            </Btn>
          </div>
          <form className="grid gap-3" onSubmit={(event) => void submit(event)}>
            {mode === "join" ? (
              <Field
                required
                autoComplete="name"
                placeholder="Name in der Halle"
                maxLength={24}
                value={name}
                onChange={(event) => setName(event.target.value)}
              />
            ) : null}
            <Field
              required
              type="email"
              autoComplete="email"
              placeholder="E-Mail"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
            <Field
              required
              type="password"
              autoComplete={mode === "join" ? "new-password" : "current-password"}
              placeholder="Passwort, mindestens 8 Zeichen"
              minLength={8}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
            {error ? <p className="text-sm text-primary">{error}</p> : null}
            <Btn type="submit" disabled={busy}>
              {busy ? "Einen Moment…" : mode === "join" ? "Konto anlegen" : "Jetzt anmelden"}
            </Btn>
          </form>
          <p className="text-sm text-muted">Oder mit einem bestehenden Konto.</p>
          {GROK_PROVIDERS.map((provider) => (
            <Btn key={provider.providerId} variant="ghost" onClick={() => void signIn(provider.providerId, { callbackURL: "/" })}>
              Weiter mit {provider.label}
            </Btn>
          ))}
        </div>
      ) : null}
    </Shell>
  );
}
