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
