import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Shell } from "@/components/empire/Shell";
import { Btn, PageHead, Panel } from "@/components/empire/ui";
import { getCard } from "@/lib/empire/catalog";
import { QUESTS } from "@/lib/empire/logic";
import { useEmpire } from "@/lib/empire/store";

export const Route = createFileRoute("/hunt")({
  head: () => ({ meta: [{ title: "Schatzsuche · Satoshi Retro Empire" }] }),
  component: HuntPage,
});

function HuntPage() {
  const empire = useEmpire();
  const claimQuest = useEmpire((s) => s.claimQuest);
  const [note, setNote] = useState("");

  return (
    <Shell>
      <PageHead
        kicker="Satoshi Treasure Hunt"
        title="Punkte durch Können, nicht durch Los."
        text="Eine echte Bitcoin-Lotterie wäre Glücksspiel. Diese Spuren sind Quests: spielen, abstimmen, eine Adresse hinterlegen, eine Punktzahl schlagen. Die Belohnung ist angekündigt, nicht ausgewürfelt."
      />
      <div className="grid gap-3">
        {QUESTS.map((quest) => {
          const claimed = empire.claimedQuests.includes(quest.id);
          const ready = quest.ready(empire);
          const card = quest.cardId ? getCard(quest.cardId) : undefined;
          return (
            <Panel key={quest.id} className={claimed ? "border-primary" : undefined}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-extrabold">{quest.title}</h2>
                  <p className="mt-1 text-sm text-muted">{quest.detail}</p>
                </div>
                <p className="font-mono text-xs text-accent">
                  +{quest.xp} XP{quest.sats ? ` · +${quest.sats} sats` : ""}
                  {card ? ` · ${card.title}` : ""}
                </p>
              </div>
              <div className="mt-3">
                {claimed ? (
                  <p className="text-sm font-semibold text-primary">Eingesammelt</p>
                ) : (
                  <Btn
                    disabled={!ready}
                    variant={ready ? "solid" : "ghost"}
                    onClick={() => {
                      const result = claimQuest(quest.id);
                      setNote(result.ok ? `${quest.title} liegt im Archiv.` : result.error);
                    }}
                  >
                    {ready ? "Einsammeln" : "Noch kalt"}
                  </Btn>
                )}
              </div>
            </Panel>
          );
        })}
      </div>
      {note ? <p className="mt-4 text-sm text-primary">{note}</p> : null}
    </Shell>
  );
}
