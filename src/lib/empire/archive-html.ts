export type ArchiveSnap = {
  handle: string;
  title: string;
  xp: number;
  satsPending: number;
  satsWithdrawn: number;
  wallet: string | null;
  cards: { title: string; edition: number }[];
  clears: string[];
  achievements: string[];
  log: string[];
  savedAt: string;
};

function jsonForScript(value: unknown) {
  return JSON.stringify(value).replace(/</g, "\\u003c").replace(/\u2028/g, "\\u2028").replace(/\u2029/g, "\\u2029");
}

export function archiveHtml(snap: ArchiveSnap) {
  return `<!DOCTYPE html>
<html lang="de">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="theme-color" content="#0c0e0b">
<title>Archiv · Satoshi Retro Empire</title>
<style>
  :root { color-scheme: dark; }
  * { box-sizing: border-box; }
  body { margin: 0; background: #0c0e0b; color: #f3ead6; font: 16px/1.5 ui-sans-serif, system-ui, sans-serif; }
  main { max-width: 40rem; margin: 0 auto; padding: 1.25rem 1rem 3rem; }
  h1 { font-size: 1.75rem; line-height: 1.15; margin: 0.25rem 0 0; }
  h2 { font-size: 1.05rem; margin: 1.5rem 0 0.5rem; }
  p, li { margin: 0; }
  .kicker, .meta { font-family: ui-monospace, monospace; font-size: 0.75rem; color: #f0a202; }
  .muted { color: #a39884; }
  .row { display: grid; grid-template-columns: 1fr 1fr; gap: 0.6rem; margin-top: 1rem; }
  .box, li { border: 1px solid #343b2c; background: #151812; border-radius: 0.5rem; padding: 0.75rem; }
  ul { list-style: none; padding: 0; display: grid; gap: 0.5rem; }
  .accent { color: #7dffb3; font-family: ui-monospace, monospace; font-size: 0.8rem; }
</style>
</head>
<body>
<main>
  <p class="kicker">Satoshi Retro Empire · Abschrift</p>
  <h1 id="title"></h1>
  <p class="muted" id="lead"></p>
  <div class="row" id="stats"></div>
  <h2>Karten</h2>
  <ul id="cards"></ul>
  <h2>Abschlüsse</h2>
  <ul id="clears"></ul>
  <h2>Abzeichen</h2>
  <ul id="badges"></ul>
  <h2>Log</h2>
  <ul id="log"></ul>
  <p class="muted" id="when" style="margin-top:1.5rem"></p>
</main>
<script type="application/json" id="archive">${jsonForScript(snap)}</script>
<script>
  const data = JSON.parse(document.getElementById("archive").textContent);
  const text = (parent, value) => { parent.textContent = value; return parent; };
  text(document.getElementById("title"), data.title);
  text(document.getElementById("lead"), data.handle + " · " + data.xp + " XP. Diese Datei ist nur eine Abschrift. Sie schreibt nichts in die Halle zurück.");
  const stats = [
    ["Ledger", data.satsPending + " sats"],
    ["Übergeben", data.satsWithdrawn + " sats"],
    ["Karten", String(data.cards.length)],
    ["Adresse", data.wallet || "keine"]
  ];
  for (const [label, value] of stats) {
    const box = document.createElement("div");
    box.className = "box";
    const name = document.createElement("p");
    name.className = "meta";
    name.textContent = label;
    const num = document.createElement("p");
    num.textContent = value;
    box.append(name, num);
    document.getElementById("stats").append(box);
  }
  const fill = (id, items, empty) => {
    const list = document.getElementById(id);
    if (!items.length) {
      const li = document.createElement("li");
      li.className = "muted";
      li.textContent = empty;
      list.append(li);
      return;
    }
    for (const item of items) {
      const li = document.createElement("li");
      li.textContent = item;
      list.append(li);
    }
  };
  fill("cards", data.cards.map((card) => card.title + " · Edition " + card.edition), "Noch keine Karte.");
  fill("clears", data.clears, "Noch kein Abschluss.");
  fill("badges", data.achievements, "Noch kein Abzeichen.");
  fill("log", data.log, "Noch still.");
  text(document.getElementById("when"), "Gesichert " + data.savedAt);
</script>
</body>
</html>
`;
}

export function downloadArchive(html: string) {
  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "satoshi-retro-archiv.html";
  link.click();
  URL.revokeObjectURL(url);
}
