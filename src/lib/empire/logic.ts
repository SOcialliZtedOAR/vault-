import { ACHIEVEMENTS, CARDS, GAMES, MINERS, SETS, TITLES } from "@/lib/empire/catalog";
import type { EmpireData, Rarity } from "@/lib/empire/types";

export type Quest = {
  id: string;
  title: string;
  detail: string;
  xp: number;
  sats: number;
  cardId?: string;
  ready: (state: EmpireData) => boolean;
};

export const QUESTS: Quest[] = [
  {
    id: "q-play",
    title: "Erster Automat",
    detail: "Starte irgendein Cabinet. Auch eine verlorene Runde zählt.",
    xp: 25,
    sats: 0,
    ready: (s) => Object.values(s.plays).some((n) => n > 0),
  },
  {
    id: "q-clear",
    title: "Level geborgen",
    detail: "Schließe einen Automaten ab oder ordne eine Feldstudie richtig ein.",
    xp: 40,
    sats: 15,
    cardId: "card-golden-joystick",
    ready: (s) => Object.keys(s.clears).length > 0,
  },
  {
    id: "q-wallet",
    title: "Adresse hinterlegen",
    detail: "Verknüpfe eine Lightning-Adresse. Der Schlüssel bleibt bei dir.",
    xp: 30,
    sats: 10,
    ready: (s) => s.wallet !== null,
  },
  {
    id: "q-vote",
    title: "Stimme im Council",
    detail: "Gib eine Stimme in einer offenen Runde ab.",
    xp: 35,
    sats: 8,
    cardId: "card-council-seal",
    ready: (s) => s.votedThreads.length > 0,
  },
  {
    id: "q-rival",
    title: "Punktzahl schlagen",
    detail: "Hinterlege einen Code und übertriff ihn in dem passenden Automaten.",
    xp: 45,
    sats: 12,
    cardId: "card-rival-slip",
    ready: (s) => s.achievements.includes("rival-beaten"),
  },
  {
    id: "q-shift",
    title: "Schicht gefahren",
    detail: "Sammle Hashkraft in Hash Rush. Es ist ein Spiel, kein echter Miner.",
    xp: 30,
    sats: 10,
    cardId: "card-rig-badge",
    ready: (s) => s.hashPower >= 40,
  },
  {
    id: "q-dig",
    title: "Erste Grube",
    detail: "Leg in der Archäologie einen Kern frei und ordne Jahr und Epoche.",
    xp: 35,
    sats: 12,
    ready: (s) => GAMES.some((game) => !game.playable && s.clears[game.id]),
  },
  {
    id: "q-three",
    title: "Drei Karten",
    detail: "Leg drei Karten ins Archiv, egal aus welchem Set.",
    xp: 20,
    sats: 8,
    cardId: "card-season-ticket",
    ready: (s) => Object.keys(s.ownedCards).length >= 3,
  },
  {
    id: "q-withdraw",
    title: "Ledger übergeben",
    detail: "Sende Spiel-Sats an die verknüpfte Wallet. Im Prototyp ein Beleg, kein Chain-Transfer.",
    xp: 20,
    sats: 0,
    ready: (s) => s.receipts.length > 0,
  },
];

export function formatSats(amount: number) {
  return `${new Intl.NumberFormat("de-DE").format(amount)} sats`;
}

export function reputationScore(state: EmpireData) {
  const plays = Object.values(state.plays).reduce((sum, n) => sum + n, 0);
  const cards = Object.keys(state.ownedCards).length;
  return Math.round(
    state.xp / 5 +
      cards * 30 +
      state.votedThreads.length * 12 +
      plays * 6 +
      state.ideas.length * 18 +
      state.wishlist.length * 4,
  );
}

export function titleFor(score: number) {
  let current = TITLES[0]!;
  for (const title of TITLES) {
    if (score >= title.min) current = title;
  }
  return current;
}

export function achievementTitle(id: string) {
  return ACHIEVEMENTS.find((item) => item.id === id)?.title ?? id;
}

export function rarityCounts(owned: EmpireData["ownedCards"]) {
  const order: Rarity[] = ["common", "rare", "epic", "legendary"];
  return order.map((rarity) => {
    const all = CARDS.filter((card) => card.rarity === rarity);
    const have = all.filter((card) => owned[card.id]).length;
    return { rarity, have, total: all.length };
  });
}

export function setProgress(setId: string, owned: EmpireData["ownedCards"]) {
  const cards = CARDS.filter((card) => card.setId === setId);
  const have = cards.filter((card) => owned[card.id]).length;
  return { have, total: cards.length, cards };
}

export function completedSetIds(owned: EmpireData["ownedCards"]) {
  return SETS.filter((set) => {
    const cards = CARDS.filter((card) => card.setId === set.id);
    return cards.length > 0 && cards.every((card) => owned[card.id]);
  }).map((set) => set.id);
}

export function shiftPayout(hashPower: number) {
  if (hashPower <= 0) return 0;
  const power = MINERS.filter((miner) => hashPower >= miner.need).reduce((sum, miner) => sum + miner.power, 0);
  return Math.max(3, Math.round(power / 12));
}

export function todayKey(date = new Date()) {
  const y = date.getFullYear();
  const m = `${date.getMonth() + 1}`.padStart(2, "0");
  const d = `${date.getDate()}`.padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function makeRivalCode(gameCode: string, score: number) {
  return `SRE-${gameCode}-${Math.max(0, Math.floor(score))}`;
}

export function parseRivalCode(raw: string): { code: string; score: number } | null {
  const match = raw.trim().toUpperCase().match(/^SRE-([A-Z0-9]{3,6})-(\d{1,7})$/);
  if (!match) return null;
  const code = match[1]!;
  const score = Number(match[2]);
  if (!GAMES.some((game) => game.code === code)) return null;
  return { code, score };
}

const SECRET = /^(?:[5KL][1-9A-HJ-NP-Za-km-z]{50,51}|[0-9a-fA-F]{64}|xprv|ypub|xpub[A-Za-z0-9]{20,})$/;

export function looksLikeSecret(value: string) {
  const compact = value.trim();
  const lower = compact.toLowerCase();
  return (
    SECRET.test(compact) ||
    /^(xprv|yprv|zprv)/i.test(compact) ||
    lower.includes("private") ||
    lower.includes("seed")
  );
}

export function isLightningAddress(value: string) {
  return /^[a-z0-9._-]{2,64}@[a-z0-9.-]+\.[a-z]{2,}$/i.test(value.trim());
}

export function archiveClearCount(state: EmpireData) {
  return GAMES.filter((game) => !game.playable && state.clears[game.id]).length;
}

export type SeasonChallenge = {
  id: string;
  title: string;
  detail: string;
  to: "/vault" | "/archaeology" | "/council" | "/wallet" | "/collection" | "/play/$gameId";
  gameId?: string;
  met: (state: EmpireData) => boolean;
};

export const SEASON_ID = "01";

export const SEASON_CHALLENGES: SeasonChallenge[] = [
  {
    id: "c-vault",
    title: "Tresor räumen",
    detail: "Schließ den Vault der verlorenen Level ab.",
    to: "/play/$gameId",
    gameId: "vault-of-the-lost-level",
    met: (s) => Boolean(s.clears["vault-of-the-lost-level"]),
  },
  {
    id: "c-three",
    title: "Drei Automaten",
    detail: "Schaff drei spielbare Automaten. Feldstudien zählen hier nicht.",
    to: "/vault",
    met: (s) => GAMES.filter((game) => game.playable && s.clears[game.id]).length >= 3,
  },
  {
    id: "c-pong",
    title: "Fünf Punkte",
    detail: "Gewinne Peer Pong gegen den Gegenschrank.",
    to: "/play/$gameId",
    gameId: "peer-pong",
    met: (s) => Boolean(s.clears["peer-pong"]),
  },
  {
    id: "c-ghosts",
    title: "Alle Punkte",
    detail: "Iss im Labyrinth der CRT-Geister alles auf.",
    to: "/play/$gameId",
    gameId: "crt-ghosts",
    met: (s) => Boolean(s.clears["crt-ghosts"]),
  },
  {
    id: "c-hash",
    title: "Goldzone",
    detail: "Triff in Hash Rush die Zone. Dein Gerät schürft dabei nichts.",
    to: "/play/$gameId",
    gameId: "hash-rush",
    met: (s) => Boolean(s.clears["hash-rush"]),
  },
  {
    id: "c-dig",
    title: "Erste Schicht",
    detail: "Berg in der Archäologie einen Kern und ordne ihn ein.",
    to: "/archaeology",
    met: (s) => archiveClearCount(s) >= 1,
  },
  {
    id: "c-strata",
    title: "Drei Schichten",
    detail: "Drei geborgene Kerne. Dieselbe Grube zweimal zählt nicht.",
    to: "/archaeology",
    met: (s) => archiveClearCount(s) >= 3,
  },
  {
    id: "c-vote",
    title: "Eine Stimme",
    detail: "Stimm im Council über eine offene Runde ab.",
    to: "/council",
    met: (s) => s.votedThreads.length > 0,
  },
  {
    id: "c-address",
    title: "Öffentliche Adresse",
    detail: "Hinterlege eine Lightning-Adresse. Kein Schlüssel.",
    to: "/wallet",
    met: (s) => s.wallet !== null,
  },
  {
    id: "c-five",
    title: "Fünf Karten",
    detail: "Leg fünf Karten ins Archiv, aus Automaten, Gruben oder Spuren.",
    to: "/collection",
    met: (s) => Object.keys(s.ownedCards).length >= 5,
  },
];

export function seasonDone(state: EmpireData) {
  return SEASON_CHALLENGES.filter((item) => item.met(state)).length;
}

export function pushLog(log: EmpireData["log"], text: string) {
  return [{ id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, text }, ...log].slice(0, 8);
}

export function withAchievements(have: string[], owned: EmpireData["ownedCards"], extra: string[]) {
  const next = new Set(have);
  for (const id of extra) next.add(id);
  for (const setId of completedSetIds(owned)) next.add(`set-${setId}`);
  return [...next];
}
