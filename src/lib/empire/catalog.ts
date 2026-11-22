import type { Card, Era, Game, Rarity } from "@/lib/empire/types";

export const ERAS: { id: Era; label: string }[] = [
	{
		id: "8-bit",
		label: "8-Bit"
	},
	{
		id: "arcade",
		label: "Arcade"
	},
	{
		id: "16-bit",
		label: "16-Bit"
	},
	{
		id: "dos",
		label: "DOS"
	},
	{
		id: "sci-fi",
		label: "Sci-Fi"
	},
	{
		id: "puzzle",
		label: "Puzzle"
	},
	{
		id: "rpg",
		label: "RPG"
	},
	{
		id: "racing",
		label: "Racing"
	},
	{
		id: "multiplayer",
		label: "Multiplayer"
	},
	{
		id: "bitcoin",
		label: "Bitcoin"
	}
];
export const SETS = [
	{
		id: "lost",
		title: "Lost Levels",
		blurb: "Automaten, die nie ganz fertig wurden — und genau deshalb legendär sind."
	},
	{
		id: "arcade",
		title: "1980s Arcade",
		blurb: "Phosphor, Holzgehäuse, ein Münzschlitz. Die Halle, in der alles anfing."
	},
	{
		id: "bitcoin",
		title: "Bitcoin Pioneers",
		blurb: "Keine Miner-Werbung. Spiele über Hash, Halving und den ersten Block."
	},
	{
		id: "classics",
		title: "Satoshi Classics",
		blurb: "Was Sammler weitergeben: klare Regeln, kurze Runden, eine Karte danach."
	},
	{
		id: "sixteen",
		title: "16-Bit Empire",
		blurb: "Die Saison der dicken Module und der Nachmittage, die zu lang waren."
	}
];
const g = (partial: Omit<Game, "collectibleId"> & { collectibleId?: string }): Game => ({
	...partial,
	collectibleId: partial.collectibleId ?? `card-${partial.id}`
});
export const GAMES = [
	g({
		id: "vault-of-the-lost-level",
		code: "LOST",
		title: "Vault der verlorenen Level",
		era: "arcade",
		yearStyle: 1985,
		rarity: "legendary",
		blurb: "Ein Tresor aus Blöcken. Räum ihn, bevor der Ball die Halle verlässt.",
		playable: true,
		engine: "breaker",
		rewards: {
			sats: 120,
			xp: 280
		},
		setId: "lost"
	}),
	g({
		id: "phosphor-serpent",
		code: "SERP",
		title: "Phosphor-Schlange",
		era: "puzzle",
		yearStyle: 1982,
		rarity: "rare",
		blurb: "Drei Satoshi-Münzen reichen für die Karte. Die vierte ist schon Stolz.",
		playable: true,
		engine: "serpent",
		rewards: {
			sats: 50,
			xp: 140
		},
		setId: "arcade"
	}),
	g({
		id: "hash-rush",
		code: "HASH",
		title: "Hash Rush",
		era: "bitcoin",
		yearStyle: 2013,
		rarity: "epic",
		blurb: "Virtuelle Schicht: triff die Goldzone. Dein Gerät schürft dabei kein Bitcoin.",
		playable: true,
		engine: "hash",
		rewards: {
			sats: 80,
			xp: 200
		},
		setId: "bitcoin"
	}),
	g({
		id: "signal-match",
		code: "SIGN",
		title: "Signal-Tresor",
		era: "puzzle",
		yearStyle: 1988,
		rarity: "common",
		blurb: "Acht Paare, ein Tresor. Wer weniger Züge braucht, steht besser da.",
		playable: true,
		engine: "match",
		rewards: {
			sats: 30,
			xp: 90
		},
		setId: "classics"
	}),
	g({
		id: "amber-rally",
		code: "RALY",
		title: "Amber Rally",
		era: "racing",
		yearStyle: 1986,
		rarity: "rare",
		blurb: "Drei Spuren, keine Bremse. Zwölf Lücken, dann die Karte.",
		playable: true,
		engine: "rally",
		rewards: {
			sats: 45,
			xp: 120
		},
		setId: "arcade"
	}),
	g({
		id: "dos-dungeon",
		code: "DOS",
		title: "DOS-Verlies",
		era: "dos",
		yearStyle: 1992,
		rarity: "epic",
		blurb: "Schlüssel, Tür, ein Wächter auf der oberen Zeile.",
		playable: true,
		engine: "dungeon",
		rewards: {
			sats: 60,
			xp: 160
		},
		setId: "classics"
	}),
	g({
		id: "neon-keirin",
		code: "KEIR",
		title: "Neon Keirin",
		era: "racing",
		yearStyle: 1991,
		rarity: "epic",
		blurb: "Im Windschatten erholt sich die Kraft. Der Sprint entscheidet die letzte Kurve.",
		playable: true,
		engine: "keirin",
		rewards: {
			sats: 60,
			xp: 160
		},
		setId: "sixteen"
	}),
	g({
		id: "cartridge-quest",
		code: "CART",
		title: "Cartridge Quest",
		era: "rpg",
		yearStyle: 1990,
		rarity: "rare",
		blurb: "Ein Boss, ein Trank, drei Befehle. Der Modul endet im Kampf.",
		playable: true,
		engine: "quest",
		rewards: {
			sats: 50,
			xp: 140
		},
		setId: "sixteen"
	}),
	g({
		id: "comet-cabinet",
		code: "COMT",
		title: "Comet Cabinet",
		era: "sci-fi",
		yearStyle: 1983,
		rarity: "common",
		blurb: "Wellen aus der oberen Bildkante. Drei Leben, drei Wellen, dann die Karte.",
		playable: true,
		engine: "comet",
		rewards: {
			sats: 45,
			xp: 120
		},
		setId: "arcade"
	}),
	g({
		id: "block-oracle",
		code: "ORCL",
		title: "Block-Orakel",
		era: "puzzle",
		yearStyle: 2009,
		rarity: "rare",
		blurb: "Fünf Schächte. Drei gleiche Blöcke in einer Linie fallen.",
		playable: true,
		engine: "oracle",
		rewards: {
			sats: 50,
			xp: 140
		},
		setId: "bitcoin"
	}),
	g({
		id: "peer-pong",
		code: "PONG",
		title: "Peer Pong",
		era: "multiplayer",
		yearStyle: 1979,
		rarity: "common",
		blurb: "Zwei Schläger, ein Ball. Fünf Punkte gegen den Gegenschrank.",
		playable: true,
		engine: "pong",
		rewards: {
			sats: 40,
			xp: 110
		},
		setId: "arcade"
	}),
	g({
		id: "sprite-saga",
		code: "SPRT",
		title: "Sprite Saga",
		era: "rpg",
		yearStyle: 1987,
		rarity: "epic",
		blurb: "Acht Figuren, ein leeres Feld. Schieb sie in die Reihenfolge des Kapitels.",
		playable: true,
		engine: "saga",
		rewards: {
			sats: 55,
			xp: 150
		},
		setId: "lost"
	}),
	g({
		id: "modem-marathon",
		code: "MODE",
		title: "Modem Marathon",
		era: "multiplayer",
		yearStyle: 1994,
		rarity: "rare",
		blurb: "Die Gegenstelle pfeift eine Nummer. Wiederhole sie, bevor die Leitung fällt.",
		playable: true,
		engine: "modem",
		rewards: {
			sats: 45,
			xp: 120
		},
		setId: "sixteen"
	}),
	g({
		id: "genesis-run",
		code: "RUN",
		title: "Genesis Run",
		era: "8-bit",
		yearStyle: 1984,
		rarity: "common",
		blurb: "Seitwärts, ein Sprung. Acht Hürden, dann liegt die Karte im Archiv.",
		playable: true,
		engine: "runner",
		rewards: {
			sats: 40,
			xp: 110
		},
		setId: "arcade"
	}),
	g({
		id: "satoshi-solitaire",
		code: "SOLI",
		title: "Satoshi Solitaire",
		era: "puzzle",
		yearStyle: 2011,
		rarity: "legendary",
		blurb: "Zwölf Karten. Nur Paare, die 21 ergeben, verlassen den Tisch.",
		playable: true,
		engine: "solitaire",
		rewards: {
			sats: 70,
			xp: 180
		},
		setId: "bitcoin"
	}),
	g({
		id: "vault-racer",
		code: "LAP",
		title: "Vault Racer",
		era: "racing",
		yearStyle: 1989,
		rarity: "common",
		blurb: "Sechs Tore, ein Ghost. Die Reihenfolge leuchtet nur kurz.",
		playable: true,
		engine: "trial",
		rewards: {
			sats: 40,
			xp: 110
		},
		setId: "lost"
	}),
	g({
		id: "crt-ghosts",
		code: "GHST",
		title: "CRT-Geister",
		era: "arcade",
		yearStyle: 1980,
		rarity: "rare",
		blurb: "Vier Ecken, ein Labyrinth. Iss die Punkte, bevor die Geister dich haben.",
		playable: true,
		engine: "ghosts",
		rewards: {
			sats: 55,
			xp: 150
		},
		setId: "lost"
	}),
	g({
		id: "halving-hero",
		code: "HALF",
		title: "Halving Hero",
		era: "bitcoin",
		yearStyle: 2016,
		rarity: "epic",
		blurb: "Ein Feld leuchtet. Jeder Treffer macht das Fenster kürzer.",
		playable: true,
		engine: "hero",
		rewards: {
			sats: 55,
			xp: 150
		},
		setId: "bitcoin"
	}),
	g({
		id: "coin-tower",
		code: "TOWR",
		title: "Münzturm",
		era: "arcade",
		yearStyle: 1984,
		rarity: "rare",
		blurb: "Der Balken pendelt. Leg ihn ab, solange er den Turm noch trifft. Sechs Stockwerke reichen.",
		playable: true,
		engine: "tower",
		rewards: {
			sats: 45,
			xp: 130
		},
		setId: "arcade"
	}),
	g({
		id: "block-hop",
		code: "HOP",
		title: "Blocksprung",
		era: "8-bit",
		yearStyle: 1983,
		rarity: "common",
		blurb: "Drei Bahnen, ein sicheres Ufer. Spring vor, wenn die Lücke da ist.",
		playable: true,
		engine: "hop",
		rewards: {
			sats: 40,
			xp: 120
		},
		setId: "classics"
	}),
	g({
		id: "raster-light",
		code: "LITE",
		title: "Rasterlicht",
		era: "puzzle",
		yearStyle: 1986,
		rarity: "rare",
		blurb: "Ein Tipp kippt das Feld und die Nachbarn. Alle Lichter aus, dann gehört dir die Karte.",
		playable: true,
		engine: "lights",
		rewards: {
			sats: 48,
			xp: 140
		},
		setId: "classics"
	}),
	g({
		id: "tape-war",
		title: "Tape War",
		era: "8-bit",
		yearStyle: 1981,
		rarity: "common",
		blurb: "Zwei Kassetten, ein Frequenzkrieg. Die Epoche steht auf dem Label.",
		playable: false,
		rewards: {
			sats: 8,
			xp: 40
		},
		setId: "arcade"
	}),
	g({
		id: "lantern-link",
		title: "Lantern Link",
		era: "multiplayer",
		yearStyle: 1993,
		rarity: "rare",
		blurb: "Vier Laternen, ein Kabel durchs Wohnzimmer. Jahr und Epoche reichen.",
		playable: false,
		rewards: {
			sats: 12,
			xp: 55
		},
		setId: "sixteen"
	}),
	g({
		id: "merkle-maze",
		title: "Merkle-Irrgarten",
		era: "bitcoin",
		yearStyle: 2014,
		rarity: "epic",
		blurb: "Jeder Gang ist ein Hash des vorherigen. Zurück geht nicht.",
		playable: false,
		rewards: {
			sats: 18,
			xp: 70
		},
		setId: "bitcoin"
	}),
	g({
		id: "phosphor-sieve",
		title: "Phosphor-Sieb",
		era: "arcade",
		yearStyle: 1978,
		rarity: "common",
		blurb: "Staub aus der ersten Reihe. Der Kern sitzt in einer Sohle, nicht in der Fläche.",
		playable: false,
		rewards: {
			sats: 8,
			xp: 40
		},
		setId: "arcade"
	}),
	g({
		id: "sector-zero",
		title: "Sektor Null",
		era: "dos",
		yearStyle: 1995,
		rarity: "rare",
		blurb: "Drei Stifte, ein Kontakt. Nur die Zahl der Treffer wird verraten.",
		playable: false,
		rewards: {
			sats: 12,
			xp: 55
		},
		setId: "classics"
	})
];

export const DIGS: { id: string; gameId: string; title: string; stratum: string; blurb: string }[] = [
	{
		id: "pit-tape",
		gameId: "tape-war",
		title: "Kassettengrube",
		stratum: "Schicht 1981",
		blurb: "Bürste. Acht Stiche, der Abstand wird kleiner, bis der Kern frei ist."
	},
	{
		id: "pit-lantern",
		gameId: "lantern-link",
		title: "Kabelgraben",
		stratum: "Schicht 1993",
		blurb: "Kabel. Acht Glieder vom Verteiler zur Laterne. Das letzte Glied lässt sich lösen."
	},
	{
		id: "pit-merkle",
		gameId: "merkle-maze",
		title: "Hash-Schnitt",
		stratum: "Schicht 2014",
		blurb: "Schnitt. Nur die Nachbarzelle der letzten Lage. Zurück geht nicht."
	},
	{
		id: "pit-sieve",
		gameId: "phosphor-sieve",
		title: "Kernbohrung",
		stratum: "Schicht 1978",
		blurb: "Bohrung. Vier Sonden. Jede sagt nur, ob der Kern höher oder tiefer liegt."
	},
	{
		id: "pit-sector",
		gameId: "sector-zero",
		title: "Stiftpresse",
		stratum: "Schicht 1995",
		blurb: "Presse. Drei Stifte drehen, dann ablesen. Die Zahl der sitzenden Stifte, nicht welche."
	}
];
export const EXTRA_CARDS: Card[] = [
	{
		id: "card-golden-joystick",
		title: "Goldener Joystick",
		rarity: "legendary",
		setId: "lost",
		blurb: "Liegt nicht im Automaten. Erst die Schatzsuche gibt ihn heraus."
	},
	{
		id: "card-council-seal",
		title: "Council-Siegel",
		rarity: "epic",
		setId: "classics",
		blurb: "Eine Stimme im Retro Council, dann das Siegel."
	},
	{
		id: "card-season-ticket",
		title: "Season-Pass 01",
		rarity: "rare",
		setId: "classics",
		blurb: "Drei Karten im Archiv öffnen den Pass dieser Saison."
	},
	{
		id: "card-rival-slip",
		title: "Rivalen-Zettel",
		rarity: "common",
		setId: "arcade",
		blurb: "Jemand hat eine Punktzahl hinterlegt. Du hast sie geschlagen."
	},
	{
		id: "card-rig-badge",
		title: "Rig-Plakette",
		rarity: "rare",
		setId: "bitcoin",
		blurb: "Hashkraft aus dem Spiel, nicht aus der Steckdose."
	},
	{
		id: "card-lost-crown",
		title: "Krone der Lost Arcade",
		rarity: "legendary",
		setId: "lost",
		blurb: "Zehn Herausforderungen in Season 01. Kein Los, eine Tafel."
	}
];
export const CARDS: Card[] = [...GAMES.map((game) => ({
	id: game.collectibleId,
	title: game.title,
	rarity: game.rarity,
	setId: game.setId,
	gameId: game.id,
	blurb: game.blurb
})), ...EXTRA_CARDS];
export const RARITY_LABEL: Record<Rarity, string> = {
	common: "Gewöhnlich",
	rare: "Selten",
	epic: "Episch",
	legendary: "Legendär"
};
export function getGame(id: string) {
	return GAMES.find((game) => game.id === id);
}
export function getCard(id: string) {
	return CARDS.find((card) => card.id === id);
}
export function getSet(id: string) {
	return SETS.find((set) => set.id === id);
}
export const DISCUSSIONS = [
	{
		id: "council-001",
		title: "Welche drei Spiele öffnen den ersten Vault?",
		category: "Spielauswahl",
		author: "Retro Council",
		body: "Season 01 hat Platz für einen klaren Eröffnungssatz, nicht für alles auf einmal. Drei Richtungen stehen. Deine Stimme bleibt auf diesem Gerät und wird zum öffentlichen Stand addiert.",
		options: [
			{
				id: "arcade",
				label: "Arcade Classic",
				votes: 87
			},
			{
				id: "space",
				label: "Space Adventure",
				votes: 64
			},
			{
				id: "racing",
				label: "Retro Racing",
				votes: 53
			}
		]
	},
	{
		id: "council-002",
		title: "Wie laut darf Bitcoin in der Halle sein?",
		category: "Belohnungen",
		author: "Mina",
		body: "Sats sollen eine Ebene sein, nicht der einzige Grund zu kommen. Wo soll die Balance in Season 01 liegen?",
		options: [
			{
				id: "quiet",
				label: "Leise: nur seltene Belohnungen",
				votes: 41
			},
			{
				id: "layer",
				label: "Schicht: Spielen zuerst, Sats dazu",
				votes: 96
			},
			{
				id: "loud",
				label: "Laut: jede Runde zahlt aus",
				votes: 22
			}
		]
	},
	{
		id: "council-003",
		title: "Clan-Vaults vor oder nach dem Tausch?",
		category: "Roadmap",
		author: "Dev42",
		body: "Geteilte Sammlungen erzeugen Zusammenhalt. Tausch erzeugt einen Markt. Was soll als Nächstes gebaut werden?",
		options: [
			{
				id: "clans",
				label: "Clan-Vaults",
				votes: 58
			},
			{
				id: "trade",
				label: "Karten-Tausch",
				votes: 61
			},
			{
				id: "both",
				label: "Erst Challenges, dann beides",
				votes: 33
			}
		]
	}
];
export const SEED_COMMENTS: Record<string, { author: string; body: string }[]> = {
	"council-001": [{
		author: "Alex",
		body: "Arcade zuerst. Die Halle muss nach Holz und Münze riechen, nicht nach Whitepaper."
	}, {
		author: "Maria",
		body: "Space darf rein, aber als zweite Reihe. Sonst wird es ein Theme-Park."
	}],
	"council-002": [{
		author: "Lea",
		body: "Wer nur wegen der Auszahlung kommt, geht nach der ersten Woche. Die Karten müssen ziehen."
	}]
};
export const IDEAS = [
	{
		id: "idea-284",
		title: "1980er-Racing-Collection",
		body: "Zehn Renn-Automaten als eigenes Set, nicht als einzelne Kacheln im Vault.",
		author: "RetroMax",
		baseVotes: 87,
		status: "discussion",
		roadmap: "Season 02"
	},
	{
		id: "idea-301",
		title: "Clan-Vaults",
		body: "Freundeskreise teilen ein Regal. Volle Sets schalten einen gemeinsamen Automaten frei.",
		author: "Mina",
		baseVotes: 64,
		status: "accepted",
		roadmap: "Als Nächstes"
	},
	{
		id: "idea-318",
		title: "Entwickler reichen Automaten ein",
		body: "Ein kurzes Prüfprotokoll statt Marktplatz: spielbar, fair, keine Custody im Spiel selbst.",
		author: "Dev42",
		baseVotes: 44,
		status: "backlog",
		roadmap: "Später"
	},
	{
		id: "idea-330",
		title: "Wochen-Challenge mit Code",
		body: "Keine Einladung um Sats. Eine Punktzahl, ein Code, die Frage ob du sie schlägst.",
		author: "Alex",
		baseVotes: 51,
		status: "accepted",
		roadmap: "Jetzt im Profil"
	}
];
export const ROADMAP = [
	{
		id: "now",
		label: "Jetzt",
		items: [
			"Game Vault",
			"Archäologie",
			"Lokales Archiv",
			"Achievements",
			"Retro Council",
			"Prototyp-Ledger"
		]
	},
	{
		id: "next",
		label: "Als Nächstes",
		items: [
			"Karten-Tausch",
			"Clan-Vaults",
			"Challenges über Geräte",
			"Saison 02"
		]
	},
	{
		id: "later",
		label: "Später",
		items: [
			"Entwickler-SDK",
			"Spiele-Marktplatz",
			"Turnier-API",
			"Echte ZBD-Anbindung"
		]
	}
];
export const WEEK = [
	{
		label: "Montag",
		title: "Neue Ideen"
	},
	{
		label: "Dienstag",
		title: "Game Discovery"
	},
	{
		label: "Mittwoch",
		title: "Council"
	},
	{
		label: "Donnerstag",
		title: "Build & Test"
	},
	{
		label: "Freitag",
		title: "Challenge"
	},
	{
		label: "Samstag",
		title: "Turnier"
	},
	{
		label: "Sonntag",
		title: "Abstimmung"
	}
];
export const FEED = [
	{
		who: "Alex",
		text: "hat ein verlorenes Level markiert."
	},
	{
		who: "Maria",
		text: "schlägt ein Arcade-Set für Season 02 vor."
	},
	{
		who: "Dev42",
		text: "hat einen Automaten zum Testen gelegt."
	},
	{
		who: "Team",
		text: "diskutiert den Ton von Season 01."
	}
];
export const ACHIEVEMENTS = [
	{
		id: "first-play",
		title: "Erster Einsatz",
		detail: "Ein Automat wurde gestartet."
	},
	{
		id: "first-clear",
		title: "Vault geöffnet",
		detail: "Ein Abschluss liegt im Archiv."
	},
	{
		id: "wallet-linked",
		title: "Wallet verknüpft",
		detail: "Nur eine öffentliche Adresse. Kein Schlüssel."
	},
	{
		id: "first-withdraw",
		title: "Sekunden-Übergabe",
		detail: "Das Ledger hat die verknüpfte Wallet adressiert."
	},
	{
		id: "rival-beaten",
		title: "Punktzahl geknackt",
		detail: "Ein Herausforderungen-Code wurde geschlagen."
	},
	{
		id: "curator",
		title: "Kurator",
		detail: "Drei Gruben richtig eingeordnet."
	},
	{
		id: "digger",
		title: "Erste Scherbe",
		detail: "Ein Kern aus der Archäologie liegt im Archiv."
	},
	{
		id: "season-crown",
		title: "Krone der Saison",
		detail: "Alle zehn Herausforderungen von Season 01."
	},
	{
		id: "miner-online",
		title: "Schicht läuft",
		detail: "Die virtuelle Farm hat Hashkraft."
	},
	{
		id: "set-lost",
		title: "Lost Levels komplett",
		detail: "Das Set ist voll."
	},
	{
		id: "set-arcade",
		title: "Arcade komplett",
		detail: "Das Set 1980s Arcade ist voll."
	},
	{
		id: "set-bitcoin",
		title: "Pioneers komplett",
		detail: "Das Set Bitcoin Pioneers ist voll."
	},
	{
		id: "set-classics",
		title: "Classics komplett",
		detail: "Das Set Satoshi Classics ist voll."
	},
	{
		id: "set-sixteen",
		title: "16-Bit komplett",
		detail: "Das Set 16-Bit Empire ist voll."
	}
];
export const MINERS: { id: string; name: string; power: number; rarity: Rarity; need: number }[] = [
	{
		id: "m1",
		name: "Satoshi Miner 01",
		power: 40,
		rarity: "common",
		need: 0
	},
	{
		id: "m2",
		name: "Amber Rig",
		power: 90,
		rarity: "rare",
		need: 180
	},
	{
		id: "m3",
		name: "Vault ASIC",
		power: 180,
		rarity: "epic",
		need: 520
	},
	{
		id: "m4",
		name: "Lost Hash",
		power: 320,
		rarity: "legendary",
		need: 1100
	}
];
export const TITLES = [
	{
		min: 0,
		name: "Arcade-Rookie",
		role: "Spieler"
	},
	{
		min: 180,
		name: "Retro-Sammler",
		role: "Sammler"
	},
	{
		min: 420,
		name: "Game-Tester",
		role: "Kurator"
	},
	{
		min: 760,
		name: "Ideenmacher",
		role: "Contributor"
	},
	{
		min: 1200,
		name: "Builder",
		role: "Builder"
	},
	{
		min: 1800,
		name: "Retro-Legende",
		role: "Kern"
	}
];
export const ROLES: string[] = [
	"Spieler",
	"Sammler",
	"Kurator",
	"Contributor",
	"Builder",
	"Kern"
];
