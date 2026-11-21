import { useRef, useState } from "react";
import { Btn, Meter, Panel } from "@/components/empire/ui";

type Props = { onFinish: (score: number, win: boolean) => void };

const PLAYER_MAX = 32;
const BOSS_MAX = 36;

export function CartridgeQuest({ onFinish }: Props) {
  const finishRef = useRef(onFinish);
  finishRef.current = onFinish;
  const [player, setPlayer] = useState(PLAYER_MAX);
  const [boss, setBoss] = useState(BOSS_MAX);
  const [potions, setPotions] = useState(2);
  const [guard, setGuard] = useState(false);
  const [log, setLog] = useState("Der Modul-Wächter blockiert den Ausgang.");
  const [over, setOver] = useState(false);

  const finish = (hp: number, win: boolean) => {
    if (over) return;
    setOver(true);
    finishRef.current(Math.max(0, hp) * 10 + (win ? 200 : 0), win);
  };

  const bossHit = (hp: number, guarding: boolean) => {
    const raw = 6 + Math.floor(Math.random() * 5);
    const dealt = guarding ? Math.max(1, Math.floor(raw / 2)) : raw;
    const next = hp - dealt;
    setGuard(false);
    setPlayer(Math.max(0, next));
    return { dealt, next };
  };

  const strike = () => {
    if (over) return;
    const dealt = 6 + Math.floor(Math.random() * 5);
    const nextBoss = boss - dealt;
    setBoss(Math.max(0, nextBoss));
    if (nextBoss <= 0) {
      setLog(`Schlag für ${dealt}. Der Wächter fällt.`);
      finish(player, true);
      return;
    }
    const back = bossHit(player, guard);
    setLog(`Schlag ${dealt}. Gegenschlag ${back.dealt}${guard ? " (gedeckt)" : ""}.`);
    if (back.next <= 0) finish(0, false);
  };

  const cover = () => {
    if (over) return;
    const back = bossHit(player, true);
    setLog(`Du deckst. Der Hieb trifft nur für ${back.dealt}.`);
    if (back.next <= 0) finish(0, false);
  };

  const drink = () => {
    if (over || potions <= 0) return;
    const healed = Math.min(PLAYER_MAX, player + 10);
    setPotions((count) => count - 1);
    const back = bossHit(healed, guard);
    setLog(`Trank. Dann Gegenschlag ${back.dealt}.`);
    if (back.next <= 0) finish(0, false);
  };

  return (
    <div className="grid gap-3">
      <Panel>
        <p className="font-mono text-xs text-muted">Wächter</p>
        <p className="text-lg font-extrabold tabular-nums">{boss}</p>
        <Meter value={boss} max={BOSS_MAX} />
      </Panel>
      <Panel>
        <p className="font-mono text-xs text-muted">Du</p>
        <p className="text-lg font-extrabold tabular-nums">{player}</p>
        <Meter value={player} max={PLAYER_MAX} />
      </Panel>
      <p className="text-sm text-fg" aria-live="polite">
        {log}
      </p>
      {!over ? (
        <div className="grid grid-cols-3 gap-2">
          <Btn onClick={strike}>Schlag</Btn>
          <Btn variant="ghost" onClick={cover}>
            Deckung
          </Btn>
          <Btn variant="ghost" disabled={potions <= 0} onClick={drink}>
            Trank {potions}
          </Btn>
        </div>
      ) : null}
      <p className="text-sm text-muted">Deckung halbiert den nächsten Hieb. Zwei Tränke, dann ist das Fläschchen leer.</p>
    </div>
  );
}
