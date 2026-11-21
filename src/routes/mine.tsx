import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Shell } from "@/components/empire/Shell";
import { Btn, PageHead, Panel, RarityText } from "@/components/empire/ui";
import { MINERS } from "@/lib/empire/catalog";
import { shiftPayout, todayKey } from "@/lib/empire/logic";
import { useEmpire } from "@/lib/empire/store";

export const Route = createFileRoute("/mine")({
  head: () => ({ meta: [{ title: "Mine · Satoshi Retro Empire" }] }),
  component: MinePage,
});

function MinePage() {
  const hashPower = useEmpire((s) => s.hashPower);
  const lastClaimDay = useEmpire((s) => s.lastClaimDay);
  const claimShift = useEmpire((s) => s.claimShift);
  const [note, setNote] = useState("");
  const payout = shiftPayout(hashPower);
  const claimed = lastClaimDay === todayKey();
  const online = MINERS.filter((miner) => hashPower >= miner.need);

  return (
    <Shell>
      <PageHead
        kicker="Virtuelle Farm"
        title="Hashkraft aus dem Spiel, nicht aus der Steckdose."
        text="Hash Rush füllt dieses Regal. Dein Gerät schürft dabei kein Bitcoin. Die Tages-Schicht ist eine Spielbelohnung und landet im Ledger, bis du sie an eine Wallet übergibst."
      />
      <div className="grid gap-3 md:grid-cols-3">
        <Panel>
          <p className="font-mono text-xs text-muted">Hashkraft</p>
          <p className="mt-1 text-3xl font-extrabold tabular-nums">{hashPower}</p>
        </Panel>
        <Panel>
          <p className="font-mono text-xs text-muted">Schicht heute</p>
          <p className="mt-1 text-3xl font-extrabold tabular-nums">{payout} sats</p>
        </Panel>
        <Panel>
          <p className="font-mono text-xs text-muted">Rigs online</p>
          <p className="mt-1 text-3xl font-extrabold tabular-nums">
            {online.length}/{MINERS.length}
          </p>
        </Panel>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {MINERS.map((miner) => {
          const live = hashPower >= miner.need;
          return (
            <Panel key={miner.id} className={live ? "border-primary" : undefined}>
              <div className="flex items-start justify-between gap-3">
                <h2 className="text-lg font-extrabold">{miner.name}</h2>
                <RarityText rarity={miner.rarity} />
              </div>
              <p className="mt-2 font-mono text-sm text-muted">
                {miner.power} Kraft · frei ab {miner.need}
              </p>
              <p className="mt-2 text-sm">{live ? "Läuft in der Schicht." : "Noch dunkel. Mehr Treffer in Hash Rush."}</p>
            </Panel>
          );
        })}
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <Btn
          disabled={claimed || hashPower <= 0}
          onClick={() => {
            const result = claimShift();
            setNote(result.ok ? `${result.amount} sats ins Ledger gelegt.` : result.error);
          }}
        >
          {claimed ? "Schicht verbucht" : "Schicht abholen"}
        </Btn>
        {note ? <p className="text-sm text-primary">{note}</p> : null}
      </div>
    </Shell>
  );
}
