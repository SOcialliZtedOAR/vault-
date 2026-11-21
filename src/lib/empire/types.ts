export type Rarity = "common" | "rare" | "epic" | "legendary";

export type Era =
  | "8-bit"
  | "arcade"
  | "16-bit"
  | "dos"
  | "sci-fi"
  | "puzzle"
  | "rpg"
  | "racing"
  | "multiplayer"
  | "bitcoin";

export type Engine =
  | "breaker"
  | "serpent"
  | "hash"
  | "match"
  | "pong"
  | "comet"
  | "ghosts"
  | "runner"
  | "rally"
  | "dungeon"
  | "quest"
  | "oracle"
  | "hero"
  | "keirin"
  | "saga"
  | "modem"
  | "solitaire"
  | "trial";

export type Game = {
  id: string;
  code?: string;
  title: string;
  era: Era;
  yearStyle: number;
  rarity: Rarity;
  blurb: string;
  playable: boolean;
  engine?: Engine;
  rewards: { sats: number; xp: number };
  collectibleId: string;
  setId: string;
};

export type Card = {
  id: string;
  title: string;
  rarity: Rarity;
  setId: string;
  gameId?: string;
  blurb: string;
};

export type WalletLink = {
  provider: "zbd" | "lightning";
  address: string;
};

export type Receipt = {
  id: string;
  amount: number;
  to: string;
  provider: WalletLink["provider"];
  at: number;
};

export type UserIdea = {
  id: string;
  title: string;
  body: string;
  at: number;
};

export type Find = {
  gameId: string;
  pitId: string;
  at: number;
};

export type UserComment = {
  id: string;
  threadId: string;
  body: string;
  at: number;
};

export type EmpireData = {
  handle: string;
  xp: number;
  satsPending: number;
  satsWithdrawn: number;
  wallet: WalletLink | null;
  ownedCards: Record<string, { collectedAt: number; edition: number }>;
  achievements: string[];
  scores: Record<string, number>;
  plays: Record<string, number>;
  clears: Record<string, true>;
  discussionVotes: Record<string, string>;
  ideaVotes: Record<string, 1 | -1>;
  votedThreads: string[];
  comments: UserComment[];
  ideas: UserIdea[];
  wishlist: string[];
  claimedQuests: string[];
  seasonClaims: string[];
  hashPower: number;
  lastClaimDay: string;
  receipts: Receipt[];
  finds: Find[];
  log: { id: string; text: string }[];
  rival: { code: string; score: number } | null;
};

export function initialEmpire(): EmpireData {
  return {
    handle: "Archivar",
    xp: 0,
    satsPending: 0,
    satsWithdrawn: 0,
    wallet: null,
    ownedCards: {},
    achievements: [],
    scores: {},
    plays: {},
    clears: {},
    discussionVotes: {},
    ideaVotes: {},
    votedThreads: [],
    comments: [],
    ideas: [],
    wishlist: [],
    claimedQuests: [],
    seasonClaims: [],
    hashPower: 0,
    lastClaimDay: "",
    receipts: [],
    finds: [],
    log: [],
    rival: null,
  };
}
