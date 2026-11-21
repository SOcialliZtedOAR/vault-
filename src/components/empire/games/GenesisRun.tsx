import { useEffect, useRef, useState } from "react";
import { Btn } from "@/components/empire/ui";

type Props = { onFinish: (score: number, win: boolean) => void };

const W = 480;
const H = 270;
const GOAL = 8;

export function GenesisRun({ onFinish }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const hudRef = useRef<HTMLParagraphElement>(null);
  const finishRef = useRef(onFinish);
  finishRef.current = onFinish;
  const jump = useRef(false);
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
      surface: css.getPropertyValue("--color-surface-2").trim(),
    };

    const ground = H - 36;
    const runner = { x: 72, y: ground - 36, w: 26, h: 36, vy: 0 };
    const hurdles: { x: number; h: number; scored: boolean }[] = [];
    let spawn = 0.4;
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
      if (hudRef.current) hudRef.current.textContent = `Hürden ${passed}/${GOAL}`;
    };
    paintHud();

    const end = (win: boolean) => {
      if (over) return;
      over = true;
      finishRef.current(passed * 100, win);
    };

    const hop = () => {
      if (runner.y >= ground - runner.h - 0.5) runner.vy = -520;
    };

    const loop = (now: number) => {
      if (!alive) return;
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (!document.hidden && !over) {
        if (jump.current) {
          hop();
          jump.current = false;
        }
        runner.vy += 1600 * dt;
        runner.y += runner.vy * dt;
        if (runner.y > ground - runner.h) {
          runner.y = ground - runner.h;
          runner.vy = 0;
        }
        const speed = 220 + passed * 14;
        spawn -= dt;
        if (spawn <= 0) {
          hurdles.push({ x: W + 10, h: 28 + (passed % 2) * 18, scored: false });
          spawn = 1.15;
        }
        for (const hurdle of hurdles) {
          hurdle.x -= speed * dt;
          const hx = hurdle.x;
          const hy = ground - hurdle.h;
          const hit =
            runner.x < hx + 18 &&
            runner.x + runner.w > hx &&
            runner.y < ground &&
            runner.y + runner.h > hy;
          if (hit) end(false);
          if (!hurdle.scored && hx + 18 < runner.x) {
            hurdle.scored = true;
            passed += 1;
            paintHud();
            if (passed >= GOAL) end(true);
          }
        }
        for (let i = hurdles.length - 1; i >= 0; i--) {
          if (hurdles[i]!.x < -40) hurdles.splice(i, 1);
        }
      }

      ctx.setTransform(canvas.width / W, 0, 0, canvas.height / H, 0, 0);
      ctx.fillStyle = color.bg;
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = color.surface;
      ctx.fillRect(0, ground, W, H - ground);
      ctx.fillStyle = color.primary;
      for (const hurdle of hurdles) ctx.fillRect(hurdle.x, ground - hurdle.h, 18, hurdle.h);
      ctx.fillStyle = color.accent;
      ctx.fillRect(runner.x, runner.y, runner.w, runner.h);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    const onKey = (event: KeyboardEvent) => {
      if (event.code === "Space" || event.code === "ArrowUp") {
        if (event.type === "keydown") jump.current = true;
        event.preventDefault();
      }
    };
    window.addEventListener("keydown", onKey);
    canvas.addEventListener("pointerdown", () => {
      jump.current = true;
    });

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
        Hürden 0/{GOAL}
      </p>
      <canvas ref={canvasRef} className="w-full touch-none rounded-md border border-border bg-bg" />
      {!running ? (
        <Btn onClick={() => setRunning(true)}>Lauf starten</Btn>
      ) : (
        <Btn
          onPointerDown={() => {
            jump.current = true;
          }}
        >
          Springen
        </Btn>
      )}
      <p className="text-sm text-muted">Leertaste, Tippen oder der Knopf. Acht Hürden ohne Treffer.</p>
    </div>
  );
}
