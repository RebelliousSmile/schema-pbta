import { ZodObject } from "zod";

type Game = {
  name: string;
  folder: string;
  abbr: string;
};

type GameDictionary = {
  [index: string]: Game;
};

type SchemaTarget = {
  name: string;
  zod: ZodObject;
  game: Game;
};

/**
 * Starting list, meant to be edited. A game belongs here once a schema
 * actually targets it: an entry with no target in TARGETS creates no folder
 * and no file.
 */
export const GAMES: GameDictionary = {
  aw: {
    name: "Apocalypse World",
    folder: "apocalypse-world",
    abbr: "aw",
  },
  dw: {
    name: "Dungeon World",
    folder: "dungeon-world",
    abbr: "dw",
  },
  motw: {
    name: "Monster of the Week",
    folder: "monster-of-the-week",
    abbr: "motw",
  },
  masks: {
    name: "Masks: A New Generation",
    folder: "masks",
    abbr: "masks",
  },
  monsterhearts: {
    name: "Monsterhearts",
    folder: "monsterhearts",
    abbr: "monsterhearts",
  },
};

/**
 * Empty on purpose: no schema has been written yet. `npm run check` is green
 * on an empty list — gen writes nothing and validate reports zero files.
 */
export const TARGETS: Array<SchemaTarget> = [];
