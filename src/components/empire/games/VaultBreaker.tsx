import { useEffect, useRef, useState } from "react";
import { Btn } from "@/components/empire/ui";

type Props = { onFinish: (score: number, win: boolean) => void };

export function VaultBreaker({ onFinish }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const hudRef = useRef<HTMLParagraphElement>(null);
  const keys = useRef({ left: false, right: false });
  const finishRef = useRef(onFinish);
  finishRef.current = onFinish;
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
      surface: css.getPropertyValue("--color-surface-2").trim(),
    };

    const W = 480;
    const H = 640;
    const bricks: { x: number; y: number; w: number; h: number; hp: number }[] = [];
    const cols = 4;
    const rows = 3;
    const margin = 18;
    const gap = 8;
    const bw = (W - margin * 2 - gap * (cols - 1)) / cols;
    const bh = 26;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        bricks.push({
          x: margin + c * (bw + gap),
          y: 78 + r * (bh + gap),
          w: bw,
          h: bh,
          hp: r === 0 ? 2 : 1,
        });
      }
    }
    const paddle = { x: W / 2 - 75, y: H - 52, w: 150, h: 14 };
    const ball = { x: W / 2, y: H - 80, vx: 90, vy: -250, r: 8 };
    let score = 0;
    let lives = 5;
    let over = false;
    let shake = 0;
    const sparks: { x: number; y: number; vx: number; vy: number; life: number }[] = [];

    const fit = () => {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const cssW = canvas.clientWidth || 320;
      canvas.style.height = `${cssW * (H / W)}px`;
      canvas.width = Math.floor(cssW * dpr);
      canvas.height = Math.floor(cssW * (H / W) * dpr);
      ctx.setTransform(canvas.width / W, 0, 0, canvas.height / H, 0, 0);
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(canvas);

    const paintHud = () => {
      if (hudRef.current) hudRef.current.textContent = `Punkte ${score} · Leben ${lives}`;
    };
    paintHud();

    const end = (win: boolean) => {
      if (over) return;
      over = true;
      finishRef.current(score, win);
    };

    const resetBall = () => {
      ball.x = paddle.x + paddle.w / 2;
      ball.y = paddle.y - 18;
      ball.vx = Math.random() > 0.5 ? 100 : -100;
      ball.vy = -250;
    };

    let last = performance.now();
    let acc = 0;
    let raf = 0;
    let alive = true;
    const step = 1 / 60;

    const update = (dt: number) => {
      if (over) return;
      const speed = 420;
      if (keys.current.left) paddle.x -= speed * dt;
      if (keys.current.right) paddle.x += speed * dt;
      paddle.x = Math.max(10, Math.min(W - paddle.w - 10, paddle.x));
      ball.x += ball.vx * dt;
      ball.y += ball.vy * dt;
      if (ball.x < ball.r) {
        ball.x = ball.r;
        ball.vx = Math.abs(ball.vx);
      }
      if (ball.x > W - ball.r) {
        ball.x = W - ball.r;
        ball.vx = -Math.abs(ball.vx);
      }
      if (ball.y < ball.r) {
        ball.y = ball.r;
        ball.vy = Math.abs(ball.vy);
      }
      if (
        ball.vy > 0 &&
        ball.y + ball.r >= paddle.y &&
        ball.y < paddle.y + paddle.h &&
        ball.x > paddle.x &&
        ball.x < paddle.x + paddle.w
      ) {
        const hit = (ball.x - (paddle.x + paddle.w / 2)) / (paddle.w / 2);
        ball.vy = -Math.abs(ball.vy);
        ball.vx = hit * 280;
        ball.y = paddle.y - ball.r;
      }
      if (Math.abs(ball.vx) < 40) ball.vx = ball.vx < 0 ? -40 : 40;
      for (const brick of bricks) {
        if (brick.hp <= 0) continue;
        const cx = Math.max(brick.x, Math.min(ball.x, brick.x + brick.w));
        const cy = Math.max(brick.y, Math.min(ball.y, brick.y + brick.h));
        const dx = ball.x - cx;
        const dy = ball.y - cy;
        if (dx * dx + dy * dy > ball.r * ball.r) continue;
        brick.hp -= 1;
        score += brick.hp === 0 ? 50 : 15;
        shake = 4;
        sparks.push({ x: ball.x, y: ball.y, vx: ball.vx * 0.2, vy: -80, life: 1 });
        if (cx === brick.x || cx === brick.x + brick.w) ball.vx *= -1;
        else ball.vy *= -1;
        paintHud();
        break;
      }
      if (sparks.length > 48) sparks.splice(0, sparks.length - 48);
      for (const spark of sparks) {
        spark.x += spark.vx * dt;
        spark.y += spark.vy * dt;
        spark.life -= dt * 1.8;
      }
      if (shake > 0) shake = Math.max(0, shake - dt * 18);
      if (ball.y > H + 20) {
        lives -= 1;
        paintHud();
        if (lives <= 0) end(false);
        else resetBall();
      }
      if (bricks.every((brick) => brick.hp <= 0)) {
        score += 200;
        paintHud();
        end(true);
      }
    };

    const draw = () => {
      ctx.setTransform(canvas.width / W, 0, 0, canvas.height / H, 0, 0);
      ctx.fillStyle = color.bg;
      ctx.fillRect(0, 0, W, H);
      ctx.save();
      if (shake) ctx.translate((Math.random() - 0.5) * shake, 0);
      ctx.fillStyle = color.surface;
      ctx.fillRect(12, 18, W - 24, 44);
      ctx.fillStyle = color.fg;
      ctx.font = "16px IBM Plex Mono, monospace";
      ctx.fillText(`VAULT  ${score}`, 24, 46);
      ctx.fillStyle = color.primary;
      ctx.fillText(`LEBEN ${lives}`, W - 150, 46);
      for (const brick of bricks) {
        if (brick.hp <= 0) continue;
        ctx.fillStyle = brick.hp > 1 ? color.accent : color.primary;
        ctx.fillRect(brick.x, brick.y, brick.w, brick.h);
      }
      ctx.fillStyle = color.fg;
      ctx.fillRect(paddle.x, paddle.y, paddle.w, paddle.h);
      ctx.beginPath();
      ctx.fillStyle = color.primary;
      ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = color.muted;
      for (const spark of sparks) {
        if (spark.life <= 0) continue;
        ctx.globalAlpha = Math.max(0, spark.life);
        ctx.fillRect(spark.x, spark.y, 3, 3);
        ctx.globalAlpha = 1;
      }
      ctx.restore();
    };

    const loop = (now: number) => {
      if (!alive) return;
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (!document.hidden) {
        acc += dt;
        while (acc >= step) {
          update(step);
          acc -= step;
        }
        draw();
      }
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
    };
    const onBlur = () => {
      keys.current.left = false;
      keys.current.right = false;
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("keyup", onKey);
    window.addEventListener("blur", onBlur);

    const pointX = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * W;
      paddle.x = Math.max(10, Math.min(W - paddle.w - 10, x - paddle.w / 2));
    };
    canvas.addEventListener("pointerdown", pointX);
    canvas.addEventListener("pointermove", pointX);

    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("keyup", onKey);
      window.removeEventListener("blur", onBlur);
      canvas.removeEventListener("pointerdown", pointX);
      canvas.removeEventListener("pointermove", pointX);
    };
  }, [running]);

  return (
    <div className="grid gap-3">
      <p ref={hudRef} className="font-mono text-sm text-muted tabular-nums" aria-live="polite">
        Punkte 0 · Leben 5
      </p>
      <canvas ref={canvasRef} className="w-full touch-none rounded-md border border-border bg-bg" />
      {!running ? (
        <Btn onClick={() => setRunning(true)}>Tresor öffnen</Btn>
      ) : (
        <div className="grid grid-cols-2 gap-2">
          <Btn
            variant="ghost"
            onPointerDown={() => {
              keys.current.left = true;
            }}
            onPointerUp={() => {
              keys.current.left = false;
            }}
            onPointerLeave={() => {
              keys.current.left = false;
            }}
          >
            Links
          </Btn>
          <Btn
            variant="ghost"
            onPointerDown={() => {
              keys.current.right = true;
            }}
            onPointerUp={() => {
              keys.current.right = false;
            }}
            onPointerLeave={() => {
              keys.current.right = false;
            }}
          >
            Rechts
          </Btn>
        </div>
      )}
      <p className="text-sm text-muted">Pfeiltasten oder Finger auf dem Feld. Alle Blöcke räumen bringt die Karte.</p>
    </div>
  );
}
