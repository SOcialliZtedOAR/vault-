import { useEffect, useRef, useState } from "react";
import { Btn } from "@/components/empire/ui";

type Props = { onFinish: (score: number, win: boolean) => void };

const W = 480;
const H = 640;
const GOAL = 12;
const LANES = [90, 240, 390];

export function AmberRally({ onFinish }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const hudRef = useRef<HTMLParagraphElement>(null);
  const finishRef = useRef(onFinish);
  finishRef.current = onFinish;
  const lane = useRef(1);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (!running) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const css = getComputedStyle(document.documentElement);
    const color = {
      bg: css.getPropertyValue("--color-bg").trim(),
      fg: css.getPropertyValue("--color-fg").trim(),
      primary: css.getPropertyValue("--color-primary").trim(),
      accent: css.getPropertyValue("--color-accent").trim(),
      muted: css.getPropertyValue("--color-muted").trim(),
    };

    const blocks: { lane: number; y: number; scored: boolean }[] = [];
    let spawn = 0.2;
    let passed = 0;
    let over = false;
    let alive = true;
    let last = performance.now();
    let raf = 0;

    const fit = () => {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const cssW = canvas.clientWidth || 320;
      canvas.style.height = `${cssW * (H / W)}px`;
      canvas.width = Math.floor(cssW * dpr);
      canvas.height = Math.floor(cssW * (H / W) * dpr);
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(canvas);

    const paintHud = () => {
      if (hudRef.current) hudRef.current.textContent = `Lücken ${passed}/${GOAL}`;
    };
    paintHud();

    const end = (win: boolean) => {
      if (over) return;
      over = true;
      finishRef.current(passed * 80, win);
    };

    const loop = (now: number) => {
      if (!alive) return;
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (!document.hidden && !over) {
        const speed = 240 + passed * 12;
        spawn -= dt;
        if (spawn <= 0) {
          let pick = Math.floor(Math.random() * 3);
          const lastBlock = blocks[blocks.length - 1];
          if (lastBlock && lastBlock.lane === pick) pick = (pick + 1) % 3;
          blocks.push({ lane: pick, y: -40, scored: false });
          spawn = 0.85;
        }
        const py = H - 90;
        for (const block of blocks) {
          block.y += speed * dt;
          const hit = block.lane === lane.current && block.y + 36 > py && block.y < py + 36;
          if (hit) end(false);
          if (!block.scored && block.y > py + 36) {
            block.scored = true;
            passed += 1;
            paintHud();
            if (passed >= GOAL) end(true);
          }
        }
        for (let i = blocks.length - 1; i >= 0; i--) {
          if (blocks[i]!.y > H + 20) blocks.splice(i, 1);
        }
      }

      ctx.setTransform(canvas.width / W, 0, 0, canvas.height / H, 0, 0);
      ctx.fillStyle = color.bg;
      ctx.fillRect(0, 0, W, H);
      ctx.strokeStyle = color.muted;
      ctx.setLineDash([6, 14]);
      for (const x of [165, 315]) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, H);
        ctx.stroke();
      }
      ctx.setLineDash([]);
      ctx.fillStyle = color.primary;
      for (const block of blocks) ctx.fillRect(LANES[block.lane]! - 28, block.y, 56, 36);
      ctx.fillStyle = color.accent;
      ctx.fillRect(LANES[lane.current]! - 22, H - 90, 44, 36);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    const onKey = (event: KeyboardEvent) => {
      if (event.code === "ArrowLeft") {
        lane.current = Math.max(0, lane.current - 1);
        event.preventDefault();
      }
      if (event.code === "ArrowRight") {
        lane.current = Math.min(2, lane.current + 1);
        event.preventDefault();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("keydown", onKey);
    };
  }, [running]);

  return (
    <div className="grid gap-3">
      <p ref={hudRef} className="font-mono text-sm text-muted tabular-nums" aria-live="polite">
        Lücken 0/{GOAL}
      </p>
      <canvas ref={canvasRef} className="w-full touch-none rounded-md border border-border bg-bg" />
      {!running ? (
        <Btn onClick={() => setRunning(true)}>Start</Btn>
      ) : (
        <div className="grid grid-cols-2 gap-2">
          <Btn variant="ghost" onClick={() => { lane.current = Math.max(0, lane.current - 1); }}>
            Spur links
          </Btn>
          <Btn variant="ghost" onClick={() => { lane.current = Math.min(2, lane.current + 1); }}>
            Spur rechts
          </Btn>
        </div>
      )}
      <p className="text-sm text-muted">Pfeile links und rechts wechseln die Spur. Zwölf Blöcke ausweichen.</p>
    </div>
  );
}
