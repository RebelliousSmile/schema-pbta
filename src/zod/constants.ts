import { ZodObject } from "zod";
import { gameDefinitionSchema } from "./game-definition";
import { moveSchema } from "./move";
import { npcSchema } from "./npc";
import { playbookSchema } from "./playbook";

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
 *
 * Each entry carries three distinct strings. Content files and folder names
 * both use `folder` — `monster-of-the-week`, never the `motw` key or abbr.
 */
export const GAMES: GameDictionary = {
  masks: {
    name: "Masks: A New Generation",
    folder: "masks",
    abbr: "masks",
  },
  motw: {
    name: "Monster of the Week",
    folder: "monster-of-the-week",
    abbr: "motw",
  },
  monsterhearts: {
    name: "Monsterhearts",
    folder: "monsterhearts",
    abbr: "monsterhearts",
  },
  "urban-shadows": {
    name: "Urban Shadows",
    folder: "urban-shadows",
    abbr: "urban-shadows",
  },
  "the-sprawl": {
    name: "The Sprawl",
    folder: "the-sprawl",
    abbr: "the-sprawl",
  },
};

export const TARGETS: Array<SchemaTarget> = [
  {
    name: "game-definition",
    zod: gameDefinitionSchema,
    game: GAMES.masks,
  },
  {
    name: "move",
    zod: moveSchema,
    game: GAMES.masks,
  },
  {
    name: "playbook",
    zod: playbookSchema,
    game: GAMES.masks,
  },
  {
    name: "npc",
    zod: npcSchema,
    game: GAMES.masks,
  },
];
