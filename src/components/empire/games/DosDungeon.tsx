import { useEffect, useRef, useState } from "react";
import { Btn } from "@/components/empire/ui";

type Props = { onFinish: (score: number, win: boolean) => void };

const MAP = ["#########", "#@......#", "#.#####.#", "#.#...#.#", "#.#.#.#.#", "#...#..$#", "#.###.#.#", "#D......#", "#########"];
const COLS = MAP[0]!.length;
const ROWS = MAP.length;
const CELL = 36;
const W = COLS * CELL;
const H = ROWS * CELL;

export function DosDungeon({ onFinish }: Props) {
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

    const walls = MAP.map((row) => row.split("").map((cell) => cell === "#"));
    const player = { x: 1, y: 1 };
    const guardPath = [3, 4, 5, 6, 5, 4];
    let guardStep = 0;
    let guardTick = 0;
    let hasKey = false;
    let lives = 3;
    let hurt = 0;
    let over = false;
    let alive = true;
    let last = performance.now();
    let raf = 0;
    const open = (x: number, y: number) => y >= 0 && x >= 0 && y < ROWS && x < COLS && !walls[y]![x];

    const collide = () => {
      const gx = guardPath[guardStep]!;
      if (hurt > 0 || player.y !== 1 || player.x !== gx) return;
      lives -= 1;
      player.x = 1;
      player.y = 1;
      hurt = 0.8;
      paintHud();
      if (lives <= 0) end(false);
    };

    turn.current = (dx, dy) => {
      if (over) return;
      const next = { x: player.x + dx, y: player.y + dy };
      if (!open(next.x, next.y)) return;
      player.x = next.x;
      player.y = next.y;
      if (!hasKey && MAP[player.y]![player.x] === "$") hasKey = true;
      if (hasKey && MAP[player.y]![player.x] === "D") {
        end(true);
        return;
      }
      collide();
      paintHud();
    };

    const paintHud = () => {
      if (hudRef.current) {
        hudRef.current.textContent = `${hasKey ? "Schlüssel da" : "Schlüssel fehlt"} · Leben ${lives}`;
      }
    };
    paintHud();

    const end = (win: boolean) => {
      if (over) return;
      over = true;
      finishRef.current(hasKey ? 300 + lives * 40 : lives * 40, win);
    };

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

    const loop = (now: number) => {
      if (!alive) return;
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (!document.hidden && !over) {
        guardTick += dt;
        hurt = Math.max(0, hurt - dt);
        if (guardTick >= 0.45) {
          guardTick = 0;
          guardStep = (guardStep + 1) % guardPath.length;
          const gx = guardPath[guardStep]!;
          if (player.y === 1 && player.x === gx) collide();
        }
      }
      const gx = guardPath[guardStep]!;
      ctx.setTransform(canvas.width / W, 0, 0, canvas.height / H, 0, 0);
      ctx.fillStyle = color.bg;
      ctx.fillRect(0, 0, W, H);
      ctx.font = "20px IBM Plex Mono, monospace";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      for (let y = 0; y < ROWS; y++) {
        for (let x = 0; x < COLS; x++) {
          const px = x * CELL + CELL / 2;
          const py = y * CELL + CELL / 2;
          if (walls[y]![x]) {
            ctx.fillStyle = color.surface;
            ctx.fillRect(x * CELL + 2, y * CELL + 2, CELL - 4, CELL - 4);
          } else if (!hasKey && MAP[y]![x] === "$") {
            ctx.fillStyle = color.primary;
            ctx.fillText("$", px, py);
          } else if (MAP[y]![x] === "D") {
            ctx.fillStyle = hasKey ? color.accent : color.fg;
            ctx.fillText("D", px, py);
          }
        }
      }
      ctx.fillStyle = color.primary;
      ctx.fillText("M", gx * CELL + CELL / 2, 1 * CELL + CELL / 2);
      ctx.fillStyle = color.accent;
      ctx.fillText("@", player.x * CELL + CELL / 2, player.y * CELL + CELL / 2);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    const onKey = (event: KeyboardEvent) => {
      const map: Record<string, [number, number]> = {
        ArrowLeft: [-1, 0],
        ArrowRight: [1, 0],
        ArrowUp: [0, -1],
        ArrowDown: [0, 1],
      };
      const next = map[event.code];
      if (!next) return;
      event.preventDefault();
      turn.current(next[0], next[1]);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("keydown", onKey);
    };
  }, [running]);

  const pad = (dx: number, dy: number, label: string) => (
    <Btn variant="ghost" onClick={() => turn.current(dx, dy)} aria-label={label}>
      {label}
    </Btn>
  );

  return (
    <div className="grid gap-3">
      <p ref={hudRef} className="font-mono text-sm text-muted" aria-live="polite">
        Schlüssel fehlt · Leben 3
      </p>
      <canvas ref={canvasRef} className="w-full touch-none rounded-md border border-border bg-bg" />
      {!running ? (
        <Btn onClick={() => setRunning(true)}>Verlies betreten</Btn>
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
      <p className="text-sm text-muted">Hol das $, meide das M auf der oberen Zeile, dann durch die Tür D.</p>
    </div>
  );
}
