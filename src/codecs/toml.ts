import { parse, stringify, type TomlTable } from "smol-toml";
import { z, type ZodType } from "zod";
import { frontSchema } from "../zod/front.js";
import { gameDefinitionSchema } from "../zod/game-definition.js";
import { moveSchema } from "../zod/move.js";
import { npcSchema } from "../zod/npc.js";
import { playbookSchema } from "../zod/playbook.js";

export const PBTA_DOCUMENT_SCHEMAS = {
  "game-definition": gameDefinitionSchema,
  move: moveSchema,
  playbook: playbookSchema,
  npc: npcSchema,
  front: frontSchema,
} as const;

export type PbtaDocumentTarget = keyof typeof PBTA_DOCUMENT_SCHEMAS;
export type GameDefinition = z.infer<typeof gameDefinitionSchema>;
export type Move = z.infer<typeof moveSchema>;
export type Playbook = z.infer<typeof playbookSchema>;
export type Npc = z.infer<typeof npcSchema>;
export type Front = z.infer<typeof frontSchema>;

export interface PbtaDocumentByTarget {
  "game-definition": GameDefinition;
  move: Move;
  playbook: Playbook;
  npc: Npc;
  front: Front;
}

export interface PbtaDocumentCodec<T> {
  schema: ZodType<T>;
  parseToml(source: string): T;
  stringifyToml(value: unknown): string;
}

function parseWith<T>(schema: ZodType<T>, source: string): T {
  return schema.parse(parse(source));
}

function stringifyWith<T>(schema: ZodType<T>, value: unknown): string {
  return stringify(schema.parse(value) as TomlTable);
}

export function parseGameDefinitionToml(source: string): GameDefinition {
  return parseWith(gameDefinitionSchema, source);
}

export function stringifyGameDefinitionToml(value: unknown): string {
  return stringifyWith(gameDefinitionSchema, value);
}

export function parseMoveToml(source: string): Move {
  return parseWith(moveSchema, source);
}

export function stringifyMoveToml(value: unknown): string {
  return stringifyWith(moveSchema, value);
}

export function parsePlaybookToml(source: string): Playbook {
  return parseWith(playbookSchema, source);
}

export function stringifyPlaybookToml(value: unknown): string {
  return stringifyWith(playbookSchema, value);
}

export function parseNpcToml(source: string): Npc {
  return parseWith(npcSchema, source);
}

export function stringifyNpcToml(value: unknown): string {
  return stringifyWith(npcSchema, value);
}

export function parseFrontToml(source: string): Front {
  return parseWith(frontSchema, source);
}

export function stringifyFrontToml(value: unknown): string {
  return stringifyWith(frontSchema, value);
}

/** Canonical dispatch table shared by every consumer of PbtA documents. */
export const PBTA_DOCUMENT_CODECS: {
  [Target in PbtaDocumentTarget]: PbtaDocumentCodec<PbtaDocumentByTarget[Target]>;
} = {
  "game-definition": {
    schema: gameDefinitionSchema,
    parseToml: parseGameDefinitionToml,
    stringifyToml: stringifyGameDefinitionToml,
  },
  move: {
    schema: moveSchema,
    parseToml: parseMoveToml,
    stringifyToml: stringifyMoveToml,
  },
  playbook: {
    schema: playbookSchema,
    parseToml: parsePlaybookToml,
    stringifyToml: stringifyPlaybookToml,
  },
  npc: {
    schema: npcSchema,
    parseToml: parseNpcToml,
    stringifyToml: stringifyNpcToml,
  },
  front: {
    schema: frontSchema,
    parseToml: parseFrontToml,
    stringifyToml: stringifyFrontToml,
  },
};
