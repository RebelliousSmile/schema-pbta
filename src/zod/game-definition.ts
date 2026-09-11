import { z } from "zod";
import {
  gameRefSchema,
  labelDictionary,
  nonEmptyString,
  portableCount,
  portableInteger,
  portableNumber,
} from "./shared.js";

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
  label: nonEmptyString.meta({ description: "Human-readable attribute label." }),
  description: z.string().optional().meta({ description: "Optional explanation shown with the attribute." }),
  /**
   * Which column the sheet puts it in. Optional: the Masks preset leaves
   * `character.attributes.moment` without one.
   *
   * Import adapter: the upstream `attributesTop` / `attributesLeft` tables are
   * the older form of this single key, and collapse into it.
   */
  position: z.enum(["top", "left"]).optional().meta({ description: "Column in which the sheet displays the attribute." }),
  customLabel: z.boolean().optional().meta({ description: "Whether a user may replace the attribute label." }),
  limited: z.boolean().optional().meta({ description: "Whether the sheet limits the attribute's display or use." }),
  /** `true`, one playbook slug, or several. */
  visibleFor: z
    .union([z.boolean(), z.string(), z.array(z.string())])
    .optional()
    .meta({ description: "All playbooks, one playbook slug, or a list of visible playbooks." }),
};

/** Ordered option labels. A numeric `default` indexes into this list. */
const optionList = z.array(nonEmptyString).min(1).meta({
  description: "Non-empty ordered list of labels offered by the attribute.",
});

export const attributeSchema = z.discriminatedUnion("type", [
  z.strictObject({
    ...attributeBase,
    type: z.literal("Number").meta({ description: "Numeric attribute discriminator." }),
    default: portableNumber.optional().meta({ description: "Default signed 32-bit numeric value." }),
  }),
  z.strictObject({
    ...attributeBase,
    type: z.literal("Text").meta({ description: "Single-line text attribute discriminator." }),
    default: z.string().optional().meta({ description: "Default single-line text value." }),
  }),
  z.strictObject({
    ...attributeBase,
    type: z.literal("LongText").meta({ description: "Long-text attribute discriminator." }),
    default: z.string().optional().meta({ description: "Default long-text value." }),
  }),
  z.strictObject({
    ...attributeBase,
    type: z.literal("Resource").meta({ description: "Resource attribute discriminator." }),
    max: portableCount.optional().meta({ description: "Maximum resource value as an unsigned 32-bit count." }),
    default: portableNumber.optional().meta({ description: "Default signed 32-bit resource value." }),
  }),
  z.strictObject({
    ...attributeBase,
    type: z.literal("Clock").meta({ description: "Clock attribute discriminator." }),
    max: portableCount.optional().meta({ description: "Maximum clock value as an unsigned 32-bit count." }),
    default: portableNumber.optional().meta({ description: "Default signed 32-bit clock value." }),
  }),
  z.strictObject({
    ...attributeBase,
    type: z.literal("Xp").meta({ description: "Experience attribute discriminator." }),
    max: portableCount.optional().meta({ description: "Maximum experience value as an unsigned 32-bit count." }),
    default: portableNumber.optional().meta({ description: "Default signed 32-bit experience value." }),
  }),
  z.strictObject({
    ...attributeBase,
    type: z.literal("Checkbox").meta({ description: "Checkbox attribute discriminator." }),
    checkboxLabel: z.string().optional().meta({ description: "Text displayed beside the checkbox." }),
    default: z.boolean().optional().meta({ description: "Default checked state." }),
  }),
  z.strictObject({
    ...attributeBase,
    type: z.literal("ListOne").meta({ description: "Single-choice list attribute discriminator." }),
    options: optionList,
    sort: z.boolean().optional().meta({ description: "Whether the sheet sorts option labels." }),
    default: portableCount.optional().meta({ description: "Zero-based index of the default option." }),
  }),
  /**
   * No `default`: the upstream documents ListMany as not accepting one.
   *
   * `options` is optional here, unlike ListOne. The Foundry configs of Masks,
   * Urban Shadows and Monsterhearts each declare ListMany attributes carrying
   * no options at all — advancements, inventions, doom marks — whose entries
   * are added at play time. An absent key says that; an empty array stays a
   * mistake, so the `min(1)` still applies when the key is written. A ListOne
   * with nothing to pick has no such reading, so its options stay required.
   */
  z.strictObject({
    ...attributeBase,
    type: z.literal("ListMany").meta({ description: "Multiple-choice list attribute discriminator." }),
    options: optionList.optional().meta({ description: "Optional non-empty list of initial choices." }),
    sort: z.boolean().optional().meta({ description: "Whether the sheet sorts option labels." }),
    condition: z.boolean().optional().meta({ description: "Whether entries carry a condition toggle." }),
  }),
  z.strictObject({
    ...attributeBase,
    type: z.literal("Roll").meta({ description: "Roll button attribute discriminator." }),
    default: z.string().optional().meta({ description: "Default formula or stat key rolled by the attribute." }),
    showResults: z.boolean().optional().meta({ description: "Whether roll outcomes are displayed." }),
  }),
  /**
   * The wiki documents no properties for Track, so this is the one permissive
   * object of the schema and the one exception to the strictness convention of
   * `shared.ts`. Closing it would mean inventing properties the source does
   * not give.
   */
  z.looseObject({
    ...attributeBase,
    type: z.literal("Track").meta({ description: "Open-ended track attribute discriminator." }),
  }),
]).meta({ description: "One supported PbtA sheet attribute configuration." });

/**
 * One tier of the roll ladder.
 *
 * The TOML form `range = "7-9"` is kept, and only it. The system's JavaScript
 * API writes the same bounds as `start` / `end`, and `range = false` disables a
 * tier; here a disabled tier is written by omitting the entry.
 */
const rollResultSchema = z.strictObject({
  range: nonEmptyString.meta({ description: "Inclusive roll range written in the game's source notation." }),
  label: nonEmptyString.meta({ description: "Human-readable label for this roll outcome." }),
}).meta({ description: "One tier of the game's roll outcome ladder." });

/**
 * A toggle on the stat block: the Masks preset writes `statToggle = "Locked"`,
 * the Urban Shadows module writes a `{ label, modifier }` table. The third
 * upstream form, `statToggle = false`, does not transcribe: omit the field.
 */
const statToggleSchema = z.union([
  nonEmptyString,
  z.strictObject({
    label: nonEmptyString.meta({ description: "Human-readable toggle label." }),
    modifier: portableNumber.meta({ description: "Signed 32-bit modifier applied when the toggle is active." }),
  }).meta({ description: "A labeled stat toggle with a numeric modifier." }),
]).meta({ description: "A simple label or a labeled numeric stat toggle." });

const attributeDictionary = z.record(z.string(), attributeSchema);

const characterSchema = z.strictObject({
  /** Stat key to label. */
  stats: labelDictionary.meta({ description: "Character stat keys mapped to their labels." }),
  attributes: attributeDictionary.optional().meta({ description: "Character attributes keyed by their stable identifiers." }),
  /**
   * Lives here and nowhere else: it is a property of the game's character
   * sheet, not of a single stat.
   */
  statToggle: statToggleSchema.optional().meta({ description: "Optional toggle applied to the character stat block." }),
  moveTypes: labelDictionary.meta({ description: "Character move type keys mapped to labels." }),
  equipmentTypes: labelDictionary.optional().meta({ description: "Character equipment type keys mapped to labels." }),
  description: z.string().optional().meta({ description: "Optional explanation of the character sheet configuration." }),
}).meta({ description: "Character-side vocabularies and sheet configuration." });

/**
 * Same base without `stats`. `equipmentTypes` is allowed: the Masks and Monster
 * of the Week presets both declare one for NPCs, contrary to the docs.
 */
const npcSchema = z.strictObject({
  attributes: attributeDictionary.optional().meta({ description: "NPC attributes keyed by their stable identifiers." }),
  moveTypes: labelDictionary.meta({ description: "NPC move type keys mapped to labels." }),
  equipmentTypes: labelDictionary.optional().meta({ description: "NPC equipment type keys mapped to labels." }),
  description: z.string().optional().meta({ description: "Optional explanation of the NPC sheet configuration." }),
}).meta({ description: "NPC-side vocabularies and sheet configuration." });

/** Vocabulary for moves made by the Master of Ceremonies or equivalent role. */
const mcSchema = z.strictObject({
  moveTypes: labelDictionary.meta({ description: "MC move type keys mapped to their labels." }),
  description: z.string().optional().meta({ description: "Optional explanation of the MC move vocabulary." }),
}).meta({ description: "Game-master-side move vocabularies." });

/**
 * A clock preset, named by the game rather than by the front that uses it.
 *
 * `segments` lists ordered labels, which is what lets Monster of the Week's
 * countdown land here without the front schema changing.
 */
const clockPresetSchema = z.strictObject({
  key: nonEmptyString.meta({ description: "Stable key used by fronts to select this preset." }),
  label: nonEmptyString.meta({ description: "Human-readable clock preset label." }),
  segments: z.array(nonEmptyString).min(1).meta({ description: "Ordered non-empty labels of the clock segments." }),
}).meta({ description: "A reusable clock shape declared by the game." });

/**
 * What a front needs from the game: its vocabularies.
 *
 * The front schema is generic; what varies game to game lives here. Optional,
 * because a game definition written for character sheets alone declares none of
 * it.
 */
const frontsSchema = z.strictObject({
  threatTypes: labelDictionary.meta({ description: "Threat type keys mapped to labels." }),
  impulses: labelDictionary.meta({ description: "Threat impulse keys mapped to labels." }),
  clockPresets: z.array(clockPresetSchema).optional().meta({ description: "Reusable clocks available to fronts." }),
}).meta({ description: "Game-specific vocabularies used by fronts." });

export const gameDefinitionSchema = z.strictObject({
  game: gameRefSchema.meta({ description: "Folder slug identifying the game." }),
  name: nonEmptyString.meta({ description: "Human-readable game name." }),
  /**
   * Tracks this definition, not the repository and not the game. It moves when
   * the stats, attributes or vocabularies below change; being required is what
   * lets a consumer notice a definition shifted under it.
   */
  version: nonEmptyString.meta({ description: "Version of this game definition's vocabulary." }),
  source: z.string().optional().meta({ description: "Optional provenance for the game definition." }),

  rollFormula: nonEmptyString.meta({ description: "Default dice formula used by the game." }),
  minMod: portableInteger.optional().meta({ description: "Lowest signed 32-bit modifier displayed by the sheet." }),
  maxMod: portableInteger.optional().meta({ description: "Highest signed 32-bit modifier displayed by the sheet." }),
  rollResults: z.record(z.string(), rollResultSchema).meta({ description: "Roll outcome tiers keyed by stable result identifiers." }),

  character: characterSchema.meta({ description: "Character-side vocabularies and sheet configuration." }),
  npc: npcSchema.optional().meta({ description: "Optional NPC-side vocabularies and sheet configuration." }),
  mc: mcSchema.optional().meta({ description: "Optional MC-side move vocabularies." }),
  fronts: frontsSchema.optional().meta({ description: "Optional vocabularies used by fronts." }),
}).meta({
  title: "PbtA game definition",
  description: "Portable game vocabulary shared by PbtA content files and digital tools.",
});
