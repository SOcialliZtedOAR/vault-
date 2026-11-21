import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Shell } from "@/components/empire/Shell";
import { Btn, Field, PageHead, Panel } from "@/components/empire/ui";
import { formatSats } from "@/lib/empire/logic";
import { useEmpire } from "@/lib/empire/store";

export const Route = createFileRoute("/wallet")({
  head: () => ({ meta: [{ title: "Wallet · Satoshi Retro Empire" }] }),
  component: WalletPage,
});

function WalletPage() {
  const wallet = useEmpire((s) => s.wallet);
  const pending = useEmpire((s) => s.satsPending);
  const withdrawn = useEmpire((s) => s.satsWithdrawn);
  const receipts = useEmpire((s) => s.receipts);
  const linkWallet = useEmpire((s) => s.linkWallet);
  const unlinkWallet = useEmpire((s) => s.unlinkWallet);
  const withdraw = useEmpire((s) => s.withdraw);
  const [provider, setProvider] = useState<"zbd" | "lightning" | null>(null);
  const [address, setAddress] = useState<string | null>(null);
  const shownProvider = provider ?? wallet?.provider ?? "zbd";
  const shownAddress = address ?? wallet?.address ?? "";
  const [note, setNote] = useState("");

  return (
    <Shell>
      <PageHead
        kicker="Bitcoin-Schicht"
        title="Verknüpfen, nicht verwahren."
        text="Die Halle speichert höchstens eine Lightning-Adresse. Kein Seed, kein xprv, kein Guthaben auf unserem Konto. Die Übergabe im Prototyp ist ein Beleg ans Ledger — keine Transaktion im Netzwerk."
      />
      <div className="grid gap-3 md:grid-cols-3">
        <Panel>
          <p className="font-mono text-xs text-muted">Offen</p>
          <p className="mt-1 text-2xl font-extrabold">{formatSats(pending)}</p>
        </Panel>
        <Panel>
          <p className="font-mono text-xs text-muted">Übergeben</p>
          <p className="mt-1 text-2xl font-extrabold">{formatSats(withdrawn)}</p>
        </Panel>
        <Panel>
          <p className="font-mono text-xs text-muted">Ziel</p>
          <p className="mt-1 truncate text-lg font-extrabold">{wallet ? wallet.address : "keine Adresse"}</p>
        </Panel>
      </div>
      <div className="mt-4 grid gap-3 lg:grid-cols-2">
        <Panel>
          <h2 className="text-lg font-extrabold">Adresse</h2>
          <form
            className="mt-3 grid gap-3"
            onSubmit={(event) => {
              event.preventDefault();
              const result = linkWallet(shownProvider, shownAddress);
              setNote(result.ok ? "Verknüpft. Der Schlüssel bleibt bei dir." : result.error);
            }}
          >
            <div className="grid grid-cols-2 gap-2">
              <Btn type="button" variant={shownProvider === "zbd" ? "solid" : "ghost"} onClick={() => setProvider("zbd")}>
                ZBD-artig
              </Btn>
              <Btn
                type="button"
                variant={shownProvider === "lightning" ? "solid" : "ghost"}
                onClick={() => setProvider("lightning")}
              >
                Lightning
              </Btn>
            </div>
            <Field
              value={shownAddress}
              autoComplete="off"
              spellCheck={false}
              placeholder="name@zbd.gg"
              onChange={(event) => setAddress(event.target.value)}
            />
            <div className="flex flex-wrap gap-2">
              <Btn type="submit">Verknüpfen</Btn>
              {wallet ? (
                <Btn
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    unlinkWallet();
                    setNote("Verknüpfung gelöst. Belege bleiben.");
                  }}
                >
                  Lösen
                </Btn>
              ) : null}
            </div>
          </form>
          {note ? <p className="mt-3 text-sm text-primary">{note}</p> : null}
        </Panel>
        <Panel>
          <h2 className="text-lg font-extrabold">Übergabe</h2>
          <p className="mt-2 text-sm text-muted">
            Erst wenn eine Adresse da ist und das Ledger nicht leer ist. Der Beleg nennt Betrag, Ziel und eine
            Prototyp-Nummer. Er bewegt keine Coins.
          </p>
          <Btn
            className="mt-4"
            onClick={() => {
              const result = withdraw();
              setNote(result.ok ? `${result.id}: ${formatSats(result.amount)} adressiert.` : result.error);
            }}
          >
            An die Wallet übergeben
          </Btn>
          <ul className="mt-4 grid gap-3">
            {receipts.length === 0 ? <li className="text-sm text-muted">Noch kein Beleg.</li> : null}
            {receipts.map((receipt) => (
              <li key={receipt.id} className="border-t border-border pt-3 text-sm">
                <p className="font-mono text-xs text-accent">{receipt.id}</p>
                <p>
                  {formatSats(receipt.amount)} an {receipt.to}
                </p>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </Shell>
  );
}
