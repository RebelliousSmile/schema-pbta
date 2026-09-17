import { parse, stringify, type TomlTable } from "smol-toml";
import { z, type ZodType } from "zod";
import { frontSchema } from "../zod/front.js";
import { gameDefinitionSchema } from "../zod/game-definition.js";
import { moveSchema } from "../zod/move.js";
import { npcSchema } from "../zod/npc.js";
import { playbookSchema } from "../zod/playbook.js";
import { urbanShadowsPlaybookSchema } from "../zod/urban-shadows-playbook.js";
import { monsterheartsPlaybookSchema } from "../zod/monsterhearts-playbook.js";
import { masksPlaybookSchema } from "../zod/masks-playbook.js";
import { monsterOfTheWeekPlaybookSchema } from "../zod/monster-of-the-week-playbook.js";
import { theSprawlPlaybookSchema } from "../zod/the-sprawl-playbook.js";
import { salvageRunPlaybookSchema } from "../zod/salvage-run-playbook.js";

export const PBTA_DOCUMENT_SCHEMAS = {
  "game-definition": gameDefinitionSchema,
  move: moveSchema,
  playbook: playbookSchema,
  "urban-shadows-playbook": urbanShadowsPlaybookSchema,
  "monsterhearts-playbook": monsterheartsPlaybookSchema,
  "masks-playbook": masksPlaybookSchema,
  "monster-of-the-week-playbook": monsterOfTheWeekPlaybookSchema,
  "the-sprawl-playbook": theSprawlPlaybookSchema,
  "salvage-run-playbook": salvageRunPlaybookSchema,
  npc: npcSchema,
  front: frontSchema,
} as const;

export type PbtaDocumentTarget = keyof typeof PBTA_DOCUMENT_SCHEMAS;
export type GameDefinition = z.infer<typeof gameDefinitionSchema>;
export type Move = z.infer<typeof moveSchema>;
export type Playbook = z.infer<typeof playbookSchema>;
export type UrbanShadowsPlaybook = z.infer<typeof urbanShadowsPlaybookSchema>;
export type MonsterheartsPlaybook = z.infer<typeof monsterheartsPlaybookSchema>;
export type MasksPlaybook = z.infer<typeof masksPlaybookSchema>;
export type MonsterOfTheWeekPlaybook = z.infer<typeof monsterOfTheWeekPlaybookSchema>;
export type TheSprawlPlaybook = z.infer<typeof theSprawlPlaybookSchema>;
export type SalvageRunPlaybook = z.infer<typeof salvageRunPlaybookSchema>;
export type Npc = z.infer<typeof npcSchema>;
export type Front = z.infer<typeof frontSchema>;

export interface PbtaDocumentByTarget {
  "game-definition": GameDefinition;
  move: Move;
  playbook: Playbook;
  "urban-shadows-playbook": UrbanShadowsPlaybook;
  "monsterhearts-playbook": MonsterheartsPlaybook;
  "masks-playbook": MasksPlaybook;
  "monster-of-the-week-playbook": MonsterOfTheWeekPlaybook;
  "the-sprawl-playbook": TheSprawlPlaybook;
  "salvage-run-playbook": SalvageRunPlaybook;
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

export function parseUrbanShadowsPlaybookToml(source: string): UrbanShadowsPlaybook {
  return parseWith(urbanShadowsPlaybookSchema, source);
}

export function stringifyUrbanShadowsPlaybookToml(value: unknown): string {
  return stringifyWith(urbanShadowsPlaybookSchema, value);
}
export function parseMonsterheartsPlaybookToml(source: string): MonsterheartsPlaybook { return parseWith(monsterheartsPlaybookSchema, source); }
export function stringifyMonsterheartsPlaybookToml(value: unknown): string { return stringifyWith(monsterheartsPlaybookSchema, value); }
export function parseMasksPlaybookToml(source: string): MasksPlaybook { return parseWith(masksPlaybookSchema, source); }
export function stringifyMasksPlaybookToml(value: unknown): string { return stringifyWith(masksPlaybookSchema, value); }
export function parseMonsterOfTheWeekPlaybookToml(source: string): MonsterOfTheWeekPlaybook { return parseWith(monsterOfTheWeekPlaybookSchema, source); }
export function stringifyMonsterOfTheWeekPlaybookToml(value: unknown): string { return stringifyWith(monsterOfTheWeekPlaybookSchema, value); }
export function parseTheSprawlPlaybookToml(source: string): TheSprawlPlaybook { return parseWith(theSprawlPlaybookSchema, source); }
export function stringifyTheSprawlPlaybookToml(value: unknown): string { return stringifyWith(theSprawlPlaybookSchema, value); }
export function parseSalvageRunPlaybookToml(source: string): SalvageRunPlaybook { return parseWith(salvageRunPlaybookSchema, source); }
export function stringifySalvageRunPlaybookToml(value: unknown): string { return stringifyWith(salvageRunPlaybookSchema, value); }

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
  "urban-shadows-playbook": {
    schema: urbanShadowsPlaybookSchema,
    parseToml: parseUrbanShadowsPlaybookToml,
    stringifyToml: stringifyUrbanShadowsPlaybookToml,
  },
  "monsterhearts-playbook": { schema: monsterheartsPlaybookSchema, parseToml: parseMonsterheartsPlaybookToml, stringifyToml: stringifyMonsterheartsPlaybookToml },
  "masks-playbook": { schema: masksPlaybookSchema, parseToml: parseMasksPlaybookToml, stringifyToml: stringifyMasksPlaybookToml },
  "monster-of-the-week-playbook": { schema: monsterOfTheWeekPlaybookSchema, parseToml: parseMonsterOfTheWeekPlaybookToml, stringifyToml: stringifyMonsterOfTheWeekPlaybookToml },
  "the-sprawl-playbook": { schema: theSprawlPlaybookSchema, parseToml: parseTheSprawlPlaybookToml, stringifyToml: stringifyTheSprawlPlaybookToml },
  "salvage-run-playbook": { schema: salvageRunPlaybookSchema, parseToml: parseSalvageRunPlaybookToml, stringifyToml: stringifySalvageRunPlaybookToml },
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
