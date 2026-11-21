import { useEffect, useRef, useState } from "react";
import { Btn, Meter, Panel } from "@/components/empire/ui";

type Props = { onFinish: (score: number, win: boolean) => void };

const GOAL = 100;

export function NeonKeirin({ onFinish }: Props) {
  const finishRef = useRef(onFinish);
  finishRef.current = onFinish;
  const sprint = useRef(false);
  const [running, setRunning] = useState(false);
  const [you, setYou] = useState(0);
  const [stamina, setStamina] = useState(100);
  const [riders, setRiders] = useState([0, 0, 0]);
  const over = useRef(false);

  useEffect(() => {
    if (!running) return;
    const state = { you: 0, stam: 100, riders: [0, 0, 0], phase: [0.4, 1.7, 2.8] };
    let alive = true;
    let last = performance.now();
    let raf = 0;
    const loop = (now: number) => {
      if (!alive) return;
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (!document.hidden && !over.current) {
        if (sprint.current && state.stam > 0) {
          state.you += 27 * dt;
          state.stam = Math.max(0, state.stam - 36 * dt);
        } else {
          state.you += (state.stam < 8 ? 7 : 14) * dt;
          state.stam = Math.min(100, state.stam + 22 * dt);
        }
        state.riders = state.riders.map((distance, index) => {
          state.phase[index] += dt;
          const bursting = Math.sin(state.phase[index]! * 1.4) > 0.15;
          return distance + (bursting ? 19 : 11) * dt;
        });
        setYou(state.you);
        setStamina(state.stam);
        setRiders([...state.riders]);
        const rivalDone = state.riders.some((distance) => distance >= GOAL);
        if (state.you >= GOAL || rivalDone) {
          over.current = true;
          const win = state.you >= GOAL && state.riders.every((distance) => distance < state.you);
          finishRef.current(Math.round(state.you * 10), win);
        }
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      alive = false;
      cancelAnimationFrame(raf);
    };
  }, [running]);

  return (
    <div className="grid gap-3">
      <Panel>
        <p className="font-mono text-xs text-muted">Kraft</p>
        <div className="mt-2">
          <Meter value={stamina} max={100} />
        </div>
      </Panel>
      <ul className="grid gap-2">
        <Lane label="Du" value={you} mine />
        {riders.map((value, index) => (
          <Lane key={index} label={`Bahn ${index + 2}`} value={value} />
        ))}
      </ul>
      {!running ? (
        <Btn onClick={() => setRunning(true)}>Start</Btn>
      ) : (
        <Btn onPointerDown={() => { sprint.current = true; }} onPointerUp={() => { sprint.current = false; }} onPointerLeave={() => { sprint.current = false; }}>
          Sprint halten
        </Btn>
      )}
      <p className="text-sm text-muted">Loslassen ist Windschatten: die Kraft kommt zurück. Leer sprinten bremst dich aus.</p>
    </div>
  );
}

function Lane({ label, value, mine }: { label: string; value: number; mine?: boolean }) {
  return (
    <li>
      <div className="mb-1 flex justify-between font-mono text-xs text-muted">
        <span>{label}</span>
        <span className="tabular-nums">{Math.min(GOAL, Math.round(value))}</span>
      </div>
      <div className="h-3 overflow-hidden rounded-sm bg-surface-2">
        <div className={mine ? "h-full bg-primary" : "h-full bg-accent"} style={{ width: `${Math.min(100, value)}%` }} />
      </div>
    </li>
  );
}
