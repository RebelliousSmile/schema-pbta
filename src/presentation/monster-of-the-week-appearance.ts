import { z } from "zod";

const tokenName = z.string().regex(/^--[a-z0-9-]+$/);
const resourcePath = z.string().regex(/^[A-Za-z0-9][A-Za-z0-9._/-]*$/);

/**
 * The appearance the four Monster of the Week targets share. The pack's fonts, colours and sheets
 * are published by `handbook/monster-of-the-week`; the tarball only names the tokens a consumer
 * resolves against.
 */
export const monsterOfTheWeekAppearanceSchema = z.strictObject({
  targets: z.tuple([
    z.literal("monster-of-the-week-playbook"),
    z.literal("monster-of-the-week-team"),
    z.literal("monster-of-the-week-monster"),
    z.literal("monster-of-the-week-threat"),
  ]),
  appearanceVersion: z.literal(1),
  resources: z.strictObject({
    fonts: z.record(z.string().min(1), resourcePath),
    stylesheets: z.array(resourcePath).min(1),
    assets: z.record(z.string().min(1), resourcePath),
  }),
  variants: z.array(z.strictObject({
    id: z.literal("base"),
    tokens: z.record(tokenName, z.string().min(1)),
  })).length(1),
});

export type PbtaMonsterOfTheWeekAppearance = z.infer<typeof monsterOfTheWeekAppearanceSchema>;

/** Consumer-neutral appearance data with package-relative resource paths. */
export const PBTA_MONSTER_OF_THE_WEEK_APPEARANCE: PbtaMonsterOfTheWeekAppearance = monsterOfTheWeekAppearanceSchema.parse({
  targets: ["monster-of-the-week-playbook", "monster-of-the-week-team", "monster-of-the-week-monster", "monster-of-the-week-threat"],
  appearanceVersion: 1,
  resources: {
    fonts: {},
    stylesheets: ["styles/theme-tokens.css"],
    assets: {},
  },
  variants: [
    { id: "base", tokens: {
      "--motw-title-font": "'Londrina Solid', 'Anton', 'Arial Narrow', sans-serif",
      "--motw-heading-font": "'Barlow Condensed', 'Arial Narrow', sans-serif",
      "--motw-body-font": "'Crimson Pro', Georgia, serif",
      "--motw-accent": "#20231f",
    } },
  ],
});

export function getPbtaMonsterOfTheWeekAppearance(target: string): PbtaMonsterOfTheWeekAppearance | undefined {
  return (PBTA_MONSTER_OF_THE_WEEK_APPEARANCE.targets as readonly string[]).includes(target) ? PBTA_MONSTER_OF_THE_WEEK_APPEARANCE : undefined;
}
