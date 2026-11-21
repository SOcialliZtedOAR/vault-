import { expect, test, type Page } from "playwright/test";

async function open(page: Page, path: string) {
  await page.goto(path);
  await page.waitForFunction(() => {
    const el = document.querySelector("button, a");
    return !!el && Object.keys(el).some((key) => key.startsWith("__reactProps"));
  });
}

const cabinets: { id: string; title: string; control: string; starts?: boolean }[] = [
  { id: "vault-of-the-lost-level", title: "Vault der verlorenen Level", control: "Tresor öffnen", starts: true },
  { id: "phosphor-serpent", title: "Phosphor-Schlange", control: "Schlange starten", starts: true },
  { id: "hash-rush", title: "Hash Rush", control: "Schicht starten", starts: true },
  { id: "signal-match", title: "Signal-Tresor", control: "Tresor mischen", starts: true },
  { id: "amber-rally", title: "Amber Rally", control: "Start", starts: true },
  { id: "dos-dungeon", title: "DOS-Verlies", control: "Verlies betreten", starts: true },
  { id: "neon-keirin", title: "Neon Keirin", control: "Start", starts: true },
  { id: "cartridge-quest", title: "Cartridge Quest", control: "Schlag" },
  { id: "comet-cabinet", title: "Comet Cabinet", control: "Welle starten", starts: true },
  { id: "block-oracle", title: "Block-Orakel", control: "Block in Schacht 1" },
  { id: "peer-pong", title: "Peer Pong", control: "Aufschlag", starts: true },
  { id: "sprite-saga", title: "Sprite Saga", control: "Neu mischen" },
  { id: "modem-marathon", title: "Modem Marathon", control: "Verbinden", starts: true },
  { id: "genesis-run", title: "Genesis Run", control: "Lauf starten", starts: true },
  { id: "satoshi-solitaire", title: "Satoshi Solitaire", control: "Fehlgriffe" },
  { id: "vault-racer", title: "Vault Racer", control: "Runde starten", starts: true },
  { id: "crt-ghosts", title: "CRT-Geister", control: "Labyrinth betreten", starts: true },
  { id: "halving-hero", title: "Halving Hero", control: "Runde starten", starts: true },
];

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.removeItem("satoshi-retro-empire-v1");
  });
});

for (const cabinet of cabinets) {
  test(`${cabinet.title} steht im Vault`, async ({ page }) => {
    await open(page, `/play/${cabinet.id}`);
    await expect(page.getByRole("heading", { name: cabinet.title, level: 1 })).toBeVisible();
    if (cabinet.control === "Fehlgriffe") {
      await expect(page.getByText(/Fehlgriffe 0\/4/)).toBeVisible();
      return;
    }
    const control = page.getByRole("button", { name: cabinet.control, exact: true });
    await expect(control).toBeVisible();
    if (!cabinet.starts) return;
    await control.click();
    await expect(control).toHaveCount(0);
  });
}
