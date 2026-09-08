import { z } from "zod";

/**
 * Primitives every schema of this repository reuses.
 *
 * Three conventions hold across all of them, and they are not stylistic:
 *
 * - Optional fields use `.optional()`, never `.default()`. Generation runs
 *   `z.toJSONSchema(schema, { target: "draft-7" })` in the *output* view, where
 *   a `.default()` lands the field in `required` and makes Zod invent a value
 *   on incomplete input.
 * - Objects are strict, so the generated schema carries
 *   `additionalProperties: false` below the root as well. Without it a union of
 *   two shapes lets a hybrid object through, and reference-or-inline stops
 *   being enforceable.
 * - No `.refine()`. A cross-field check does not survive the conversion to JSON
 *   Schema and would vanish silently. Coherence belongs to the second pass,
 *   `tools/validate-references.ts`.
 */

/** kebab-case identifier: `the-ember`, `hold-the-line`, `monster-of-the-week`. */
export const slugSchema = z
  .string()
  .regex(
    /^[a-z0-9]+(-[a-z0-9]+)*$/,
    "must be kebab-case: lowercase alphanumerics separated by single hyphens"
  );

/**
 * The game a content file belongs to.
 *
 * A plain slug, deliberately not an enum of the known games: restricting it
 * would make every game's JSON schema depend on the whole list, so adding a
 * game would rewrite every schema. Membership is checked in the cross pass,
 * against the `folder` of the GAMES entry — `monster-of-the-week`, not `motw`.
 */
export const gameRefSchema = slugSchema;

/** A line of text that must actually say something. */
export const nonEmptyString = z.string().min(1);

/** Free-form label vocabulary: key to human-readable label. */
export const labelDictionary = z.record(z.string(), nonEmptyString);
