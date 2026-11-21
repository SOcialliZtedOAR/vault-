import { useEffect, useRef, useState } from "react";
import { Btn } from "@/components/empire/ui";

type Props = { onFinish: (score: number, win: boolean) => void };

const MAP = [
  "###############",
  "#.............#",
  "#.###.###.###.#",
  "#.#.........#.#",
  "#.#.#######.#.#",
  "#.............#",
  "###.#.###.#.###",
  "#.............#",
  "#.###.###.###.#",
  "#.............#",
  "###############",
];

const COLS = MAP[0]!.length;
const ROWS = MAP.length;
const CELL = 32;
const W = COLS * CELL;
const H = ROWS * CELL;

type Cell = { x: number; y: number };

export function CrtGhosts({ onFinish }: Props) {
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
    const dots = MAP.map((row) => row.split("").map((cell) => cell === "."));
    let left = dots.flat().filter(Boolean).length;
    const player: Cell = { x: 1, y: 1 };
    const ghosts: Cell[] = [
      { x: COLS - 2, y: 1 },
      { x: 1, y: ROWS - 2 },
    ];
    let dir: Cell = { x: 0, y: 0 };
    let queued: Cell = { x: 0, y: 0 };
    let acc = 0;
    let ghostAcc = 0;
    let over = false;
    let alive = true;
    let last = performance.now();
    let raf = 0;
    let score = 0;

    const open = (x: number, y: number) => y >= 0 && x >= 0 && y < ROWS && x < COLS && !walls[y]![x];

    turn.current = (dx, dy) => {
      queued = { x: dx, y: dy };
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

    const paintHud = () => {
      if (hudRef.current) hudRef.current.textContent = `Punkte ${left} · Stand ${score}`;
    };
    paintHud();

    const end = (win: boolean) => {
      if (over) return;
      over = true;
      finishRef.current(score + (win ? 200 : 0), win);
    };

    const stepPlayer = () => {
      if (queued.x || queued.y) {
        if (open(player.x + queued.x, player.y + queued.y)) dir = queued;
      }
      const next = { x: player.x + dir.x, y: player.y + dir.y };
      if ((dir.x || dir.y) && open(next.x, next.y)) {
        player.x = next.x;
        player.y = next.y;
        if (dots[player.y]![player.x]) {
          dots[player.y]![player.x] = false;
          left -= 1;
          score += 10;
          paintHud();
          if (left <= 0) end(true);
        }
      }
    };

    const stepGhost = (ghost: Cell) => {
      const options = [
        { x: 1, y: 0 },
        { x: -1, y: 0 },
        { x: 0, y: 1 },
        { x: 0, y: -1 },
      ].filter((step) => open(ghost.x + step.x, ghost.y + step.y));
      if (options.length === 0) return;
      const pick =
        Math.random() < 0.35
          ? options[Math.floor(Math.random() * options.length)]!
          : options.slice().sort((a, b) => {
              const da = Math.abs(ghost.x + a.x - player.x) + Math.abs(ghost.y + a.y - player.y);
              const db = Math.abs(ghost.x + b.x - player.x) + Math.abs(ghost.y + b.y - player.y);
              return da - db;
            })[0]!;
      ghost.x += pick.x;
      ghost.y += pick.y;
    };

    const draw = () => {
      ctx.setTransform(canvas.width / W, 0, 0, canvas.height / H, 0, 0);
      ctx.fillStyle = color.bg;
      ctx.fillRect(0, 0, W, H);
      for (let y = 0; y < ROWS; y++) {
        for (let x = 0; x < COLS; x++) {
          if (walls[y]![x]) {
            ctx.fillStyle = color.surface;
            ctx.fillRect(x * CELL + 1, y * CELL + 1, CELL - 2, CELL - 2);
          } else if (dots[y]![x]) {
            ctx.fillStyle = color.primary;
            ctx.beginPath();
            ctx.arc(x * CELL + CELL / 2, y * CELL + CELL / 2, 3, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }
      ctx.fillStyle = color.accent;
      ctx.beginPath();
      ctx.arc(player.x * CELL + CELL / 2, player.y * CELL + CELL / 2, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = color.primary;
      for (const ghost of ghosts) {
        ctx.fillRect(ghost.x * CELL + 6, ghost.y * CELL + 6, CELL - 12, CELL - 12);
      }
    };

    const loop = (now: number) => {
      if (!alive) return;
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (!document.hidden && !over) {
        acc += dt;
        ghostAcc += dt;
        while (acc >= 0.16) {
          stepPlayer();
          acc -= 0.16;
        }
        while (ghostAcc >= 0.28) {
          for (const ghost of ghosts) stepGhost(ghost);
          ghostAcc -= 0.28;
          if (ghosts.some((ghost) => ghost.x === player.x && ghost.y === player.y)) end(false);
        }
      }
      draw();
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
      <p ref={hudRef} className="font-mono text-sm text-muted tabular-nums" aria-live="polite">
        Punkte stehen noch
      </p>
      <canvas ref={canvasRef} className="w-full touch-none rounded-md border border-border bg-bg" />
      {!running ? (
        <Btn onClick={() => setRunning(true)}>Labyrinth betreten</Btn>
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
      <p className="text-sm text-muted">Pfeiltasten oder die Felder. Alle Punkte einsammeln, den Geistern ausweichen.</p>
    </div>
  );
}
