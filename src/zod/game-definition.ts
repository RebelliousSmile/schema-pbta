import { z } from "zod";
import { gameRefSchema, labelDictionary, nonEmptyString } from "./shared";

/**
 * A game definition: dice, stats, attributes, and the vocabularies every other
 * content file of that game cites. Written once per game, in
 * `examples/<game>/game-definition/<game>.toml`.
 *
 * Derived from the sheet configuration of the Foundry `pbta` system without
 * mirroring it. Where the upstream carries two ways of writing one thing, this
 * schema keeps one and notes the equivalence for a future import adapter.
 */

/**
 * Shared by all eleven attribute types.
 *
 * `visibleFor` is the upstream `playbook` key, renamed: `playbook` already
 * names a content type here, and keeping the homonymy in a format meant to be
 * hand-written installs a lasting confusion. Import adapter: `playbook` maps
 * to `visibleFor`.
 */
const attributeBase = {
  label: nonEmptyString,
  description: z.string().optional(),
  /**
   * Which column the sheet puts it in. Optional: the Masks preset leaves
   * `character.attributes.moment` without one.
   *
   * Import adapter: the upstream `attributesTop` / `attributesLeft` tables are
   * the older form of this single key, and collapse into it.
   */
  position: z.enum(["top", "left"]).optional(),
  customLabel: z.boolean().optional(),
  limited: z.boolean().optional(),
  /** `true`, one playbook slug, or several. */
  visibleFor: z
    .union([z.boolean(), z.string(), z.array(z.string())])
    .optional(),
};

/** Ordered option labels. A numeric `default` indexes into this list. */
const optionList = z.array(nonEmptyString).min(1);

export const attributeSchema = z.discriminatedUnion("type", [
  z.strictObject({
    ...attributeBase,
    type: z.literal("Number"),
    default: z.number().optional(),
  }),
  z.strictObject({
    ...attributeBase,
    type: z.literal("Text"),
    default: z.string().optional(),
  }),
  z.strictObject({
    ...attributeBase,
    type: z.literal("LongText"),
    default: z.string().optional(),
  }),
  z.strictObject({
    ...attributeBase,
    type: z.literal("Resource"),
    max: z.number().int().optional(),
    default: z.number().optional(),
  }),
  z.strictObject({
    ...attributeBase,
    type: z.literal("Clock"),
    max: z.number().int().optional(),
    default: z.number().optional(),
  }),
  z.strictObject({
    ...attributeBase,
    type: z.literal("Xp"),
    max: z.number().int().optional(),
    default: z.number().optional(),
  }),
  z.strictObject({
    ...attributeBase,
    type: z.literal("Checkbox"),
    checkboxLabel: z.string().optional(),
    default: z.boolean().optional(),
  }),
  z.strictObject({
    ...attributeBase,
    type: z.literal("ListOne"),
    options: optionList,
    sort: z.boolean().optional(),
    default: z.number().int().optional(),
  }),
  /** No `default`: the upstream documents ListMany as not accepting one. */
  z.strictObject({
    ...attributeBase,
    type: z.literal("ListMany"),
    options: optionList,
    sort: z.boolean().optional(),
    condition: z.boolean().optional(),
  }),
  z.strictObject({
    ...attributeBase,
    type: z.literal("Roll"),
    default: z.string().optional(),
    showResults: z.boolean().optional(),
  }),
  /**
   * The wiki documents no properties for Track, so this is the one permissive
   * object of the schema and the one exception to the strictness convention of
   * `shared.ts`. Closing it would mean inventing properties the source does
   * not give.
   */
  z.looseObject({
    ...attributeBase,
    type: z.literal("Track"),
  }),
]);

/**
 * One tier of the roll ladder.
 *
 * The TOML form `range = "7-9"` is kept, and only it. The system's JavaScript
 * API writes the same bounds as `start` / `end`, and `range = false` disables a
 * tier; here a disabled tier is written by omitting the entry.
 */
const rollResultSchema = z.strictObject({
  range: nonEmptyString,
  label: nonEmptyString,
});

/**
 * A toggle on the stat block: the Masks preset writes `statToggle = "Locked"`,
 * the Urban Shadows module writes a `{ label, modifier }` table. The third
 * upstream form, `statToggle = false`, does not transcribe: omit the field.
 */
const statToggleSchema = z.union([
  nonEmptyString,
  z.strictObject({
    label: nonEmptyString,
    modifier: z.number(),
  }),
]);

const attributeDictionary = z.record(z.string(), attributeSchema);

const characterSchema = z.strictObject({
  /** Stat key to label. */
  stats: labelDictionary,
  attributes: attributeDictionary.optional(),
  /**
   * Lives here and nowhere else: it is a property of the game's character
   * sheet, not of a single stat.
   */
  statToggle: statToggleSchema.optional(),
  moveTypes: labelDictionary,
  equipmentTypes: labelDictionary.optional(),
  description: z.string().optional(),
});

/**
 * Same base without `stats`. `equipmentTypes` is allowed: the Masks and Monster
 * of the Week presets both declare one for NPCs, contrary to the docs.
 */
const npcSchema = z.strictObject({
  attributes: attributeDictionary.optional(),
  moveTypes: labelDictionary,
  equipmentTypes: labelDictionary.optional(),
  description: z.string().optional(),
});

/**
 * A clock preset, named by the game rather than by the front that uses it.
 *
 * `segments` lists ordered labels, which is what lets Monster of the Week's
 * countdown land here without the front schema changing.
 */
const clockPresetSchema = z.strictObject({
  key: nonEmptyString,
  label: nonEmptyString,
  segments: z.array(nonEmptyString).min(1),
});

/**
 * What a front needs from the game: its vocabularies.
 *
 * The front schema is generic; what varies game to game lives here. Optional,
 * because a game definition written for character sheets alone declares none of
 * it.
 */
const frontsSchema = z.strictObject({
  threatTypes: labelDictionary,
  impulses: labelDictionary,
  clockPresets: z.array(clockPresetSchema).optional(),
});

export const gameDefinitionSchema = z.strictObject({
  game: gameRefSchema,
  name: nonEmptyString,
  /**
   * Tracks this definition, not the repository and not the game. It moves when
   * the stats, attributes or vocabularies below change; being required is what
   * lets a consumer notice a definition shifted under it.
   */
  version: nonEmptyString,
  source: z.string().optional(),

  rollFormula: nonEmptyString,
  minMod: z.number().int().optional(),
  maxMod: z.number().int().optional(),
  rollResults: z.record(z.string(), rollResultSchema),

  character: characterSchema,
  npc: npcSchema.optional(),
  fronts: frontsSchema.optional(),
});
