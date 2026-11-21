import { useEffect, useRef, useState } from "react";
import { Btn } from "@/components/empire/ui";

type Props = { onFinish: (score: number, win: boolean) => void };

const W = 480;
const H = 640;
const WAVES = 3;

type Enemy = { x: number; y: number; alive: boolean };
type Shot = { x: number; y: number };

export function CometCabinet({ onFinish }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const hudRef = useRef<HTMLParagraphElement>(null);
  const finishRef = useRef(onFinish);
  finishRef.current = onFinish;
  const keys = useRef({ left: false, right: false, fire: false });
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

    const ship = { x: W / 2, y: H - 72, w: 36 };
    const enemies: Enemy[] = [];
    const shots: Shot[] = [];
    let wave = 1;
    let lives = 3;
    let score = 0;
    let cool = 0;
    let over = false;
    let alive = true;
    let last = performance.now();
    let raf = 0;

    const spawn = (n: number) => {
      enemies.length = 0;
      const cols = Math.min(4, n);
      for (let i = 0; i < n; i++) {
        enemies.push({ x: 48 + (i % cols) * 100, y: 36 + Math.floor(i / cols) * 42, alive: true });
      }
    };
    spawn(4);

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
      if (hudRef.current) hudRef.current.textContent = `Welle ${wave}/${WAVES} · Leben ${lives} · ${score}`;
    };
    paintHud();

    const end = (win: boolean) => {
      if (over) return;
      over = true;
      finishRef.current(score, win);
    };

    const loop = (now: number) => {
      if (!alive) return;
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (!document.hidden && !over) {
        if (keys.current.left) ship.x -= 260 * dt;
        if (keys.current.right) ship.x += 260 * dt;
        ship.x = Math.max(24, Math.min(W - 24, ship.x));
        cool -= dt;
        if (keys.current.fire && cool <= 0) {
          shots.push({ x: ship.x, y: ship.y - 16 });
          cool = 0.28;
          keys.current.fire = false;
        }
        for (const shot of shots) shot.y -= 420 * dt;
        for (let i = shots.length - 1; i >= 0; i--) {
          const shot = shots[i]!;
          if (shot.y < 0) {
            shots.splice(i, 1);
            continue;
          }
          const hit = enemies.find((enemy) => enemy.alive && Math.abs(enemy.x - shot.x) < 22 && Math.abs(enemy.y - shot.y) < 16);
          if (hit) {
            hit.alive = false;
            score += 50;
            shots.splice(i, 1);
            paintHud();
          }
        }
        const drop = 42 + wave * 10;
        for (const enemy of enemies) {
          if (!enemy.alive) continue;
          enemy.y += drop * dt;
          if (enemy.y > ship.y - 8 && Math.abs(enemy.x - ship.x) < 28) {
            enemy.alive = false;
            lives -= 1;
            paintHud();
            if (lives <= 0) end(false);
          } else if (enemy.y > H) {
            enemy.alive = false;
            lives -= 1;
            paintHud();
            if (lives <= 0) end(false);
          }
        }
        if (!over && enemies.every((enemy) => !enemy.alive)) {
          if (wave >= WAVES) end(true);
          else {
            wave += 1;
            spawn(wave === 2 ? 6 : 8);
            paintHud();
          }
        }
      }

      ctx.setTransform(canvas.width / W, 0, 0, canvas.height / H, 0, 0);
      ctx.fillStyle = color.bg;
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = color.accent;
      for (const enemy of enemies) {
        if (!enemy.alive) continue;
        ctx.fillRect(enemy.x - 16, enemy.y - 10, 32, 16);
      }
      ctx.fillStyle = color.primary;
      for (const shot of shots) ctx.fillRect(shot.x - 2, shot.y, 4, 12);
      ctx.fillStyle = color.fg;
      ctx.beginPath();
      ctx.moveTo(ship.x, ship.y - 18);
      ctx.lineTo(ship.x - 18, ship.y + 14);
      ctx.lineTo(ship.x + 18, ship.y + 14);
      ctx.closePath();
      ctx.fill();
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    const onKey = (event: KeyboardEvent) => {
      const down = event.type === "keydown";
      if (event.code === "ArrowLeft") {
        keys.current.left = down;
        event.preventDefault();
      }
      if (event.code === "ArrowRight") {
        keys.current.right = down;
        event.preventDefault();
      }
      if (down && (event.code === "Space" || event.code === "ArrowUp")) {
        keys.current.fire = true;
        event.preventDefault();
      }
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("keyup", onKey);
    const point = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      ship.x = ((event.clientX - rect.left) / rect.width) * W;
    };
    canvas.addEventListener("pointerdown", (event) => {
      point(event);
      keys.current.fire = true;
    });
    canvas.addEventListener("pointermove", point);

    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("keyup", onKey);
    };
  }, [running]);

  const hold = (dir: "left" | "right", on: boolean) => {
    keys.current[dir] = on;
  };

  return (
    <div className="grid gap-3">
      <p ref={hudRef} className="font-mono text-sm text-muted tabular-nums" aria-live="polite">
        Welle 1/{WAVES} · Leben 3 · 0
      </p>
      <canvas ref={canvasRef} className="w-full touch-none rounded-md border border-border bg-bg" />
      {!running ? (
        <Btn onClick={() => setRunning(true)}>Welle starten</Btn>
      ) : (
        <div className="grid grid-cols-3 gap-2">
          <Btn variant="ghost" onPointerDown={() => hold("left", true)} onPointerUp={() => hold("left", false)} onPointerLeave={() => hold("left", false)}>
            Links
          </Btn>
          <Btn variant="ghost" onClick={() => { keys.current.fire = true; }}>
            Feuer
          </Btn>
          <Btn variant="ghost" onPointerDown={() => hold("right", true)} onPointerUp={() => hold("right", false)} onPointerLeave={() => hold("right", false)}>
            Rechts
          </Btn>
        </div>
      )}
      <p className="text-sm text-muted">Pfeile oder Finger. Leertaste und Tippen schießen. Drei Wellen räumen die Karte.</p>
    </div>
  );
}
