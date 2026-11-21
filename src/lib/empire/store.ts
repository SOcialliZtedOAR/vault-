import { create } from "zustand";
import { persist } from "zustand/middleware";
import { DIGS, GAMES, MINERS } from "@/lib/empire/catalog";
import {
  archiveClearCount,
  isLightningAddress,
  looksLikeSecret,
  parseRivalCode,
  pushLog,
  QUESTS,
  seasonDone,
  todayKey,
  withAchievements,
} from "@/lib/empire/logic";
import { initialEmpire, type EmpireData, type WalletLink } from "@/lib/empire/types";

export type Grant = {
  xp: number;
  sats: number;
  newCard: boolean;
  best: number;
  achievements: string[];
  already: boolean;
};

type Actions = {
  setHandle: (handle: string) => void;
  grantRun: (gameId: string, score: number, win: boolean) => Grant;
  toggleWishlist: (gameId: string) => void;
  linkWallet: (provider: WalletLink["provider"], address: string) => { ok: true } | { ok: false; error: string };
  unlinkWallet: () => void;
  withdraw: () => { ok: true; id: string; amount: number } | { ok: false; error: string };
  voteDiscussion: (discussionId: string, optionId: string) => void;
  voteIdea: (ideaId: string, dir: 1 | -1) => void;
  addComment: (threadId: string, body: string) => { ok: true } | { ok: false; error: string };
  addIdea: (title: string, body: string) => { ok: true } | { ok: false; error: string };
  claimQuest: (questId: string) => { ok: true } | { ok: false; error: string };
  claimSeason: () => { ok: true } | { ok: false; error: string };
  claimShift: () => { ok: true; amount: number } | { ok: false; error: string };
  setRival: (raw: string) => { ok: true } | { ok: false; error: string };
  clearRival: () => void;
  resetArchive: () => void;
};

export type EmpireState = EmpireData & Actions;

function ownedWith(state: EmpireData, cardId?: string) {
  if (!cardId || state.ownedCards[cardId]) {
    return { ownedCards: state.ownedCards, newCard: false };
  }
  return {
    newCard: true,
    ownedCards: {
      ...state.ownedCards,
      [cardId]: { collectedAt: Date.now(), edition: Object.keys(state.ownedCards).length + 1 },
    },
  };
}

export const useEmpire = create<EmpireState>()(
  persist(
    (set, get) => ({
      ...initialEmpire(),
      setHandle: (handle) => {
        const next = handle.trim().replace(/\s+/g, " ").slice(0, 24);
        set({ handle: next || "Archivar" });
      },
      grantRun: (gameId, score, win) => {
        const game = GAMES.find((item) => item.id === gameId);
        const empty: Grant = { xp: 0, sats: 0, newCard: false, best: score, achievements: [], already: false };
        if (!game) return empty;
        const state = get();
        const already = Boolean(state.clears[gameId]);
        const firstEver = Object.values(state.plays).every((n) => n === 0);
        let xp = 0;
        let sats = 0;
        if (win && !already) {
          xp += game.rewards.xp;
          sats += game.rewards.sats;
        } else if (win) {
          xp += 12;
        } else if ((state.plays[gameId] ?? 0) === 0) {
          xp += 15;
        }
        let hashPower = state.hashPower;
        if (game.engine === "hash" && win) {
          sats += Math.min(18, Math.max(3, Math.round(score / 100)));
          hashPower += Math.max(10, Math.round(score / 10));
        }
        const card = ownedWith(state, win && !already ? game.collectibleId : undefined);
        const fresh: string[] = [];
        if (firstEver) fresh.push("first-play");
        if (win && !state.achievements.includes("first-clear")) fresh.push("first-clear");
        if (state.rival && game.code === state.rival.code && score > state.rival.score && win) {
          fresh.push("rival-beaten");
        }
        if (game.engine === "hash" && hashPower >= 40) fresh.push("miner-online");
        const clears = win ? { ...state.clears, [gameId]: true as const } : state.clears;
        const draft: EmpireData = { ...state, ownedCards: card.ownedCards, clears };
        if (!game.playable && win && !already) fresh.push("digger");
        if (!game.playable && archiveClearCount(draft) >= 3) fresh.push("curator");
        const achievements = withAchievements(state.achievements, card.ownedCards, fresh);
        const gained = achievements.filter((id) => !state.achievements.includes(id));
        let log = state.log;
        if (card.newCard) log = pushLog(log, `Karte „${game.title}“ liegt im Archiv.`);
        else if (win && already) log = pushLog(log, `Nochmal ${game.title}: neuer Lauf, keine zweite Karte.`);
        const finds = state.finds ?? [];
        const nextFinds =
          !game.playable && win && !already
            ? [
                ...finds,
                {
                  gameId,
                  pitId: DIGS.find((dig) => dig.gameId === gameId)?.id ?? gameId,
                  at: Date.now(),
                },
              ]
            : finds;
        set({
          xp: state.xp + xp,
          satsPending: state.satsPending + sats,
          scores: { ...state.scores, [gameId]: Math.max(state.scores[gameId] ?? 0, score) },
          plays: { ...state.plays, [gameId]: (state.plays[gameId] ?? 0) + 1 },
          clears,
          ownedCards: card.ownedCards,
          hashPower,
          achievements,
          finds: nextFinds,
          log,
        });
        return {
          xp,
          sats,
          newCard: card.newCard,
          best: Math.max(state.scores[gameId] ?? 0, score),
          achievements: gained,
          already: win && already,
        };
      },
      toggleWishlist: (gameId) =>
        set((state) => ({
          wishlist: state.wishlist.includes(gameId)
            ? state.wishlist.filter((id) => id !== gameId)
            : [...state.wishlist, gameId],
        })),
      linkWallet: (provider, address) => {
        const trimmed = address.trim();
        if (looksLikeSecret(trimmed)) {
          return { ok: false, error: "Keine privaten Schlüssel. Nur eine öffentliche Lightning-Adresse." };
        }
        if (!isLightningAddress(trimmed)) {
          return { ok: false, error: "Format: name@anbieter.tld — zum Beispiel du@zbd.gg" };
        }
        const state = get();
        const achievements = state.achievements.includes("wallet-linked")
          ? state.achievements
          : [...state.achievements, "wallet-linked"];
        set({
          wallet: { provider, address: trimmed },
          achievements,
          log: pushLog(state.log, `Wallet verknüpft: ${trimmed}`),
        });
        return { ok: true };
      },
      unlinkWallet: () => set({ wallet: null }),
      withdraw: () => {
        const state = get();
        if (!state.wallet) return { ok: false, error: "Zuerst eine Wallet verknüpfen." };
        if (state.satsPending <= 0) return { ok: false, error: "Das Ledger ist leer." };
        const amount = state.satsPending;
        const id = `SRE-${Date.now().toString(36).toUpperCase()}`;
        const achievements = state.achievements.includes("first-withdraw")
          ? state.achievements
          : [...state.achievements, "first-withdraw"];
        set({
          satsPending: 0,
          satsWithdrawn: state.satsWithdrawn + amount,
          achievements,
          receipts: [
            { id, amount, to: state.wallet.address, provider: state.wallet.provider, at: Date.now() },
            ...state.receipts,
          ].slice(0, 8),
          log: pushLog(state.log, `${amount} sats an ${state.wallet.address} übergeben.`),
        });
        return { ok: true, id, amount };
      },
      voteDiscussion: (discussionId, optionId) =>
        set((state) => {
          const votedThreads = state.votedThreads.includes(discussionId)
            ? state.votedThreads
            : [...state.votedThreads, discussionId];
          return {
            discussionVotes: { ...state.discussionVotes, [discussionId]: optionId },
            votedThreads,
            log: state.votedThreads.includes(discussionId)
              ? state.log
              : pushLog(state.log, "Stimme im Retro Council abgegeben."),
          };
        }),
      voteIdea: (ideaId, dir) =>
        set((state) => ({
          ideaVotes: { ...state.ideaVotes, [ideaId]: dir },
          votedThreads: state.votedThreads.includes(ideaId) ? state.votedThreads : [...state.votedThreads, ideaId],
        })),
      addComment: (threadId, body) => {
        const text = body.trim();
        if (text.length < 2) return { ok: false, error: "Schreib ein paar Worte." };
        if (text.length > 280) return { ok: false, error: "Maximal 280 Zeichen." };
        set((state) => ({
          comments: [
            { id: `c-${Date.now()}`, threadId, body: text, at: Date.now() },
            ...state.comments,
          ].slice(0, 40),
        }));
        return { ok: true };
      },
      addIdea: (title, body) => {
        const t = title.trim();
        const b = body.trim();
        if (t.length < 4) return { ok: false, error: "Der Titel ist zu kurz." };
        if (b.length < 8) return { ok: false, error: "Beschreib die Idee in einem Satz." };
        const id = `idea-local-${Date.now()}`;
        set((state) => ({
          ideas: [{ id, title: t.slice(0, 80), body: b.slice(0, 280), at: Date.now() }, ...state.ideas].slice(0, 12),
          ideaVotes: { ...state.ideaVotes, [id]: 1 },
          log: pushLog(state.log, `Idee vorgeschlagen: ${t.slice(0, 48)}`),
        }));
        return { ok: true };
      },
      claimQuest: (questId) => {
        const quest = QUESTS.find((item) => item.id === questId);
        if (!quest) return { ok: false, error: "Unbekannte Spur." };
        const state = get();
        if (state.claimedQuests.includes(questId)) return { ok: false, error: "Schon eingesammelt." };
        if (!quest.ready(state)) return { ok: false, error: "Die Spur ist noch kalt." };
        const card = ownedWith(state, quest.cardId);
        const achievements = withAchievements(state.achievements, card.ownedCards, []);
        set({
          xp: state.xp + quest.xp,
          satsPending: state.satsPending + quest.sats,
          claimedQuests: [...state.claimedQuests, questId],
          ownedCards: card.ownedCards,
          achievements,
          log: pushLog(state.log, `Schatzsuche: ${quest.title}.`),
        });
        return { ok: true };
      },
      claimSeason: () => {
        const state = get();
        const claims = state.seasonClaims ?? [];
        if (claims.includes("01")) return { ok: false, error: "Die Krone liegt schon im Archiv." };
        if (seasonDone(state) < 10) return { ok: false, error: "Noch nicht alle zehn Herausforderungen." };
        const card = ownedWith(state, "card-lost-crown");
        const achievements = withAchievements(state.achievements, card.ownedCards, ["season-crown"]);
        set({
          xp: state.xp + 80,
          satsPending: state.satsPending + 25,
          seasonClaims: [...claims, "01"],
          ownedCards: card.ownedCards,
          achievements,
          log: pushLog(state.log, "Season 01: die Krone liegt im Archiv."),
        });
        return { ok: true };
      },
      claimShift: () => {
        const state = get();
        if (state.hashPower <= 0) return { ok: false, error: "Fahr zuerst eine Schicht in Hash Rush." };
        const day = todayKey();
        if (state.lastClaimDay === day) return { ok: false, error: "Die heutige Schicht ist schon verbucht." };
        const power = MINERS.filter((miner) => state.hashPower >= miner.need).reduce((sum, miner) => sum + miner.power, 0);
        const amount = Math.max(3, Math.round(power / 12));
        set({
          lastClaimDay: day,
          satsPending: state.satsPending + amount,
          log: pushLog(state.log, `Virtuelle Schicht: ${amount} sats ins Ledger.`),
        });
        return { ok: true, amount };
      },
      setRival: (raw) => {
        const parsed = parseRivalCode(raw);
        if (!parsed) return { ok: false, error: "Code wie SRE-LOST-900. Der Mittelteil muss ein Automatencode sein." };
        set((state) => ({ rival: parsed, log: pushLog(state.log, `Herausforderung angenommen: SRE-${parsed.code}-${parsed.score}.`) }));
        return { ok: true };
      },
      clearRival: () => set({ rival: null }),
      resetArchive: () => set({ ...initialEmpire(), handle: get().handle }),
    }),
    { name: "satoshi-retro-empire-v1", skipHydration: true, version: 1 },
  ),
);
