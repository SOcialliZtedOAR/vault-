import { useEffect, useRef, useState } from "react";
import { Btn } from "@/components/empire/ui";

type Props = { onFinish: (score: number, win: boolean) => void };
type Cell = { x: number; y: number };

const COLS = 16;
const ROWS = 18;

export function PhosphorSerpent({ onFinish }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const hudRef = useRef<HTMLParagraphElement>(null);
  const finishRef = useRef(onFinish);
  finishRef.current = onFinish;
  const turn = useRef<(dx: number, dy: number) => void>(() => {});
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

    const snake: Cell[] = [
      { x: 5, y: 9 },
      { x: 4, y: 9 },
      { x: 3, y: 9 },
    ];
    let dir: Cell = { x: 1, y: 0 };
    const queue: Cell[] = [];
    let food: Cell = { x: 11, y: 6 };
    let eaten = 0;
    let over = false;
    let acc = 0;
    let last = performance.now();
    let raf = 0;
    let alive = true;

    const paint = () => {
      if (hudRef.current) hudRef.current.textContent = `Münzen ${eaten} · Länge ${snake.length}`;
    };

    const placeFood = () => {
      for (let n = 0; n < 80; n++) {
        const next = { x: Math.floor(Math.random() * COLS), y: Math.floor(Math.random() * ROWS) };
        if (!snake.some((cell) => cell.x === next.x && cell.y === next.y)) {
          food = next;
          return;
        }
      }
    };

    turn.current = (dx, dy) => {
      const lastDir = queue.length ? queue[queue.length - 1]! : dir;
      if (lastDir.x + dx === 0 && lastDir.y + dy === 0) return;
      if (lastDir.x === dx && lastDir.y === dy) return;
      queue.push({ x: dx, y: dy });
    };

    const tick = () => {
      if (queue.length) dir = queue.shift()!;
      const head = snake[0]!;
      const next = { x: head.x + dir.x, y: head.y + dir.y };
      if (next.x < 0 || next.y < 0 || next.x >= COLS || next.y >= ROWS) {
        over = true;
        finishRef.current(eaten * 10, eaten >= 3);
        return;
      }
      if (snake.some((cell) => cell.x === next.x && cell.y === next.y)) {
        over = true;
        finishRef.current(eaten * 10, eaten >= 3);
        return;
      }
      snake.unshift(next);
      if (next.x === food.x && next.y === food.y) {
        eaten += 1;
        placeFood();
      } else {
        snake.pop();
      }
      paint();
    };

    const fit = () => {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const cssW = canvas.clientWidth || 320;
      canvas.style.height = `${cssW * (ROWS / COLS)}px`;
      canvas.width = Math.floor(cssW * dpr);
      canvas.height = Math.floor(cssW * (ROWS / COLS) * dpr);
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(canvas);
    paint();

    const draw = () => {
      const w = canvas.width;
      const h = canvas.height;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.fillStyle = color.bg;
      ctx.fillRect(0, 0, w, h);
      const cw = w / COLS;
      const ch = h / ROWS;
      ctx.fillStyle = color.surface;
      ctx.fillRect(food.x * cw + 3, food.y * ch + 3, cw - 6, ch - 6);
      ctx.fillStyle = color.primary;
      ctx.beginPath();
      ctx.arc(food.x * cw + cw / 2, food.y * ch + ch / 2, Math.min(cw, ch) * 0.22, 0, Math.PI * 2);
      ctx.fill();
      snake.forEach((cell, index) => {
        ctx.fillStyle = index === 0 ? color.fg : color.accent;
        ctx.fillRect(cell.x * cw + 2, cell.y * ch + 2, cw - 4, ch - 4);
      });
    };

    const loop = (now: number) => {
      if (!alive) return;
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (!document.hidden && !over) {
        acc += dt;
        const pace = Math.max(0.08, 0.16 - eaten * 0.008);
        while (acc >= pace && !over) {
          tick();
          acc -= pace;
        }
        draw();
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    const onKey = (event: KeyboardEvent) => {
      const map: Record<string, Cell> = {
        ArrowLeft: { x: -1, y: 0 },
        ArrowRight: { x: 1, y: 0 },
        ArrowUp: { x: 0, y: -1 },
        ArrowDown: { x: 0, y: 1 },
      };
      const next = map[event.code];
      if (!next) return;
      event.preventDefault();
      turn.current(next.x, next.y);
    };
    window.addEventListener("keydown", onKey);

    let swipeX = 0;
    let swipeY = 0;
    const down = (event: PointerEvent) => {
      swipeX = event.clientX;
      swipeY = event.clientY;
    };
    const up = (event: PointerEvent) => {
      const dx = event.clientX - swipeX;
      const dy = event.clientY - swipeY;
      if (Math.hypot(dx, dy) < 24) return;
      if (Math.abs(dx) > Math.abs(dy)) turn.current(dx > 0 ? 1 : -1, 0);
      else turn.current(0, dy > 0 ? 1 : -1);
    };
    canvas.addEventListener("pointerdown", down);
    canvas.addEventListener("pointerup", up);

    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("keydown", onKey);
      canvas.removeEventListener("pointerdown", down);
      canvas.removeEventListener("pointerup", up);
    };
  }, [running]);

  const pad = (dx: number, dy: number, label: string) => (
    <Btn variant="ghost" onClick={() => turn.current(dx, dy)} aria-label={label}>
      {label}
    </Btn>
  );

  return (
    <div className="grid gap-3">
      <p ref={hudRef} className="font-mono text-sm text-muted tabular-nums" aria-live="polite">
        Münzen 0 · Länge 3
      </p>
      <canvas ref={canvasRef} className="w-full touch-none rounded-md border border-border bg-bg" />
      {!running ? (
        <Btn onClick={() => setRunning(true)}>Schlange starten</Btn>
      ) : (
        <div className="grid grid-cols-3 gap-2">
          <span />
          {pad(0, -1, "Hoch")}
          <span />
          {pad(-1, 0, "Links")}
          {pad(0, 1, "Runter")}
          {pad(1, 0, "Rechts")}
        </div>
      )}
      <p className="text-sm text-muted">Pfeiltasten oder Wischen. Drei Münzen sichern die Karte.</p>
    </div>
  );
}
