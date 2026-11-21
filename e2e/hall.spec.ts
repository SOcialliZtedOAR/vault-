import { expect, test, type Page } from "playwright/test";

async function open(page: Page, path: string) {
  await page.goto(path);
  await page.waitForFunction(() => {
    const el = document.querySelector("button, a");
    return !!el && Object.keys(el).some((key) => key.startsWith("__reactProps"));
  });
}

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.removeItem("satoshi-retro-empire-v1");
  });
});

test("die Halle öffnet den Vault", async ({ page }) => {
  await open(page, "/");
  await expect(page.getByRole("heading", { name: "Spiele die Geschichte. Sammle die Legenden." })).toBeVisible();
  await page.getByRole("link", { name: "In den Vault" }).click();
  await expect(page.getByRole("heading", { name: /Automaten, ein Archiv/ })).toBeVisible();
  await expect(page.getByRole("link", { name: "Spielen" }).first()).toBeVisible();
});

test("Hash Rush legt die Karte ins Archiv", async ({ page }) => {
  await open(page, "/play/hash-rush");
  await expect(page.getByRole("heading", { name: "Hash Rush" })).toBeVisible();
  await page.getByRole("button", { name: "Schicht starten" }).click();
  const hit = page.getByRole("button", { name: "Treffer setzen" });
  const cells = page.locator(".grid.grid-cols-5 span");
  for (let i = 0; i < 5; i += 1) {
    await hit.click();
    await expect(cells.nth(i)).not.toHaveText("–");
  }
  await expect(page.getByRole("heading", { name: "Hash Rush gehört dir." })).toBeVisible();
  await expect(page.getByText(/\+200 XP · \+\d+ sats/)).toBeVisible();
});

test("ein unbekanntes Cabinet schickt zurück in den Vault", async ({ page }) => {
  await open(page, "/play/gibt-es-nicht");
  await expect(page.getByRole("heading", { name: "Dieses Cabinet steht nicht im Vault." })).toBeVisible();
  await page.getByRole("link", { name: "Zurück in den Vault" }).click();
  await expect(page).toHaveURL(/\/vault$/);
});

test("ein Konto lässt sich anlegen", async ({ page }) => {
  const name = "E2E";
  await open(page, "/login");
  await expect(page.getByRole("button", { name: "Anlegen", exact: true })).toBeVisible();
  await page.getByPlaceholder("Name in der Halle").fill(name);
  await page.getByPlaceholder("E-Mail").fill(`e2e-${Date.now()}@example.com`);
  await page.getByPlaceholder("Passwort, mindestens 8 Zeichen").fill("halle-1234");
  await page.getByRole("button", { name: "Konto anlegen" }).click();
  await expect(page.getByRole("link", { name })).toBeVisible();
  await expect(page).toHaveURL(/\/$/);
});

test("das Handylayout läuft nicht über den Rand", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await open(page, "/");
  await expect(page.getByRole("link", { name: "Halle", exact: true })).toBeVisible();
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(1);
});

test("eine Lightning-Adresse wird angenommen, ein Schlüssel nicht", async ({ page }) => {
  await open(page, "/wallet");
  await expect(page.getByRole("heading", { name: "Verknüpfen, nicht verwahren." })).toBeVisible();
  await page.getByPlaceholder("name@zbd.gg").fill("xprv-demo-seed");
  await page.getByRole("button", { name: "Verknüpfen" }).click();
  await expect(page.getByText("Keine privaten Schlüssel.")).toBeVisible();
  await page.getByPlaceholder("name@zbd.gg").fill("halle@zbd.gg");
  await page.getByRole("button", { name: "Verknüpfen" }).click();
  await expect(page.getByText("Verknüpft. Der Schlüssel bleibt bei dir.")).toBeVisible();
  await expect(page.getByText("halle@zbd.gg")).toBeVisible();
  await page.getByRole("button", { name: "An die Wallet übergeben" }).click();
  await expect(page.getByText("Das Ledger ist leer.")).toBeVisible();
});

test("die Season startet bei null und die Krone bleibt zu", async ({ page }) => {
  await open(page, "/season");
  await expect(page.getByRole("heading", { name: "Zehn Herausforderungen, eine Krone." })).toBeVisible();
  await expect(page.getByLabel("Krone der Lost Arcade")).toBeVisible();
  expect((await page.request.get("/crown.mp4")).ok()).toBeTruthy();
  await expect(page.getByText("0/10")).toBeVisible();
  await expect(page.getByRole("button", { name: "Noch offen" })).toBeDisabled();
});

test("die Sammlung zeigt das leere Regal", async ({ page }) => {
  await open(page, "/collection");
  await expect(page.getByRole("heading", { name: /0 von \d+ Karten/ })).toBeVisible();
});

test("der Council öffnet die Runden", async ({ page }) => {
  await open(page, "/council");
  await expect(page.getByRole("heading", { name: "Nicht nur spielen. Mitbauen." })).toBeVisible();
  await page.getByRole("button", { name: "Ideen" }).click();
  await expect(page.getByPlaceholder("Was soll die Halle daraus machen?")).toBeVisible();
});

test("ein falsches Passwort bleibt draußen", async ({ page }) => {
  await open(page, "/login");
  await page.getByRole("button", { name: "Anmelden", exact: true }).click();
  await page.getByPlaceholder("E-Mail").fill("niemand@example.com");
  await page.getByPlaceholder("Passwort, mindestens 8 Zeichen").fill("falsch-1234");
  await page.getByRole("button", { name: "Jetzt anmelden" }).click();
  await expect(page.getByText("E-Mail oder Passwort stimmt nicht.")).toBeVisible();
});
