import { useEffect, useRef, useState } from "react";
import { Btn } from "@/components/empire/ui";

type Props = { onFinish: (score: number, win: boolean) => void };

const W = 480;
const H = 640;
const GOAL = 5;

export function PeerPong({ onFinish }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const hudRef = useRef<HTMLParagraphElement>(null);
  const finishRef = useRef(onFinish);
  finishRef.current = onFinish;
  const aim = useRef<number | null>(null);
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

    const player = { x: W / 2 - 46, y: H - 48, w: 92, h: 12 };
    const ai = { x: W / 2 - 46, y: 36, w: 92, h: 12 };
    const ball = { x: W / 2, y: H / 2, vx: 160, vy: 240, r: 8 };
    let you = 0;
    let them = 0;
    let speed = 280;
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
      if (hudRef.current) hudRef.current.textContent = `Du ${you} · Gegenschrank ${them} · bis ${GOAL}`;
    };
    paintHud();

    const serve = (towardPlayer: boolean) => {
      ball.x = W / 2;
      ball.y = H / 2;
      speed = 280;
      ball.vx = Math.random() > 0.5 ? 140 : -140;
      ball.vy = towardPlayer ? speed : -speed;
    };

    const end = (win: boolean) => {
      if (over) return;
      over = true;
      finishRef.current(you * 100 + them, win);
    };

    const loop = (now: number) => {
      if (!alive) return;
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (!document.hidden && !over) {
        const target = aim.current == null ? player.x : aim.current - player.w / 2;
        player.x += Math.sign(target - player.x) * Math.min(Math.abs(target - player.x), 640 * dt);
        player.x = Math.max(8, Math.min(W - player.w - 8, player.x));

        const chase = ball.vy < 0 ? ball.x - ai.w / 2 : W / 2 - ai.w / 2;
        ai.x += Math.sign(chase - ai.x) * Math.min(Math.abs(chase - ai.x), 210 * dt);
        ai.x = Math.max(8, Math.min(W - ai.w - 8, ai.x));

        ball.x += ball.vx * dt;
        ball.y += ball.vy * dt;
        if (ball.x < ball.r || ball.x > W - ball.r) ball.vx *= -1;
        const hit = (pad: { x: number; y: number; w: number; h: number }, fromAbove: boolean) => {
          const going = fromAbove ? ball.vy > 0 : ball.vy < 0;
          if (!going) return;
          if (ball.x < pad.x || ball.x > pad.x + pad.w) return;
          if (ball.y < pad.y - ball.r || ball.y > pad.y + pad.h + ball.r) return;
          const offset = (ball.x - (pad.x + pad.w / 2)) / (pad.w / 2);
          speed = Math.min(520, speed + 18);
          ball.vx = offset * 280;
          ball.vy = fromAbove ? -speed : speed;
          ball.y = fromAbove ? pad.y - ball.r : pad.y + pad.h + ball.r;
        };
        hit(player, true);
        hit(ai, false);
        if (ball.y > H + 20) {
          them += 1;
          paintHud();
          if (them >= GOAL) end(false);
          else serve(true);
        } else if (ball.y < -20) {
          you += 1;
          paintHud();
          if (you >= GOAL) end(true);
          else serve(false);
        }
      }

      ctx.setTransform(canvas.width / W, 0, 0, canvas.height / H, 0, 0);
      ctx.fillStyle = color.bg;
      ctx.fillRect(0, 0, W, H);
      ctx.strokeStyle = color.muted;
      ctx.setLineDash([8, 10]);
      ctx.beginPath();
      ctx.moveTo(24, H / 2);
      ctx.lineTo(W - 24, H / 2);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = color.accent;
      ctx.fillRect(ai.x, ai.y, ai.w, ai.h);
      ctx.fillStyle = color.primary;
      ctx.fillRect(player.x, player.y, player.w, player.h);
      ctx.beginPath();
      ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI * 2);
      ctx.fillStyle = color.fg;
      ctx.fill();
      ctx.fillStyle = color.fg;
      ctx.font = "28px IBM Plex Mono, monospace";
      ctx.fillText(String(them), 28, H / 2 - 24);
      ctx.fillText(String(you), 28, H / 2 + 48);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    const point = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      aim.current = ((event.clientX - rect.left) / rect.width) * W;
    };
    canvas.addEventListener("pointerdown", point);
    canvas.addEventListener("pointermove", point);

    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      ro.disconnect();
      canvas.removeEventListener("pointerdown", point);
      canvas.removeEventListener("pointermove", point);
    };
  }, [running]);

  return (
    <div className="grid gap-3">
      <p ref={hudRef} className="font-mono text-sm text-muted tabular-nums" aria-live="polite">
        Du 0 · Gegenschrank 0 · bis {GOAL}
      </p>
      <canvas ref={canvasRef} className="w-full touch-none rounded-md border border-border bg-bg" />
      {!running ? <Btn onClick={() => setRunning(true)}>Aufschlag</Btn> : null}
      <p className="text-sm text-muted">Finger auf dem Feld bewegt den unteren Schläger. Fünf Punkte öffnen die Karte.</p>
    </div>
  );
}
