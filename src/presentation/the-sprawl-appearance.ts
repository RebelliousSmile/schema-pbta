import { z } from "zod";

const tokenName = z.string().regex(/^--[a-z0-9-]+$/);
const resourcePath = z.string().regex(/^[A-Za-z0-9][A-Za-z0-9._/-]*$/);

/**
 * The appearance the six Sprawl targets share. The pack's fonts, colours and sheets are
 * published by `handbook/the-sprawl`; the tarball only names the tokens a consumer resolves against.
 */
export const theSprawlAppearanceSchema = z.strictObject({
  targets: z.tuple([
    z.literal("the-sprawl-playbook"),
    z.literal("the-sprawl-matrix"),
    z.literal("the-sprawl-mission"),
    z.literal("the-sprawl-threat"),
    z.literal("the-sprawl-corporation"),
    z.literal("the-sprawl-resource"),
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

export type PbtaTheSprawlAppearance = z.infer<typeof theSprawlAppearanceSchema>;

/** Consumer-neutral appearance data with package-relative resource paths. */
export const PBTA_THE_SPRAWL_APPEARANCE: PbtaTheSprawlAppearance = theSprawlAppearanceSchema.parse({
  targets: ["the-sprawl-playbook", "the-sprawl-matrix", "the-sprawl-mission", "the-sprawl-threat", "the-sprawl-corporation", "the-sprawl-resource"],
  appearanceVersion: 1,
  resources: {
    fonts: {},
    stylesheets: ["styles/theme-tokens.css"],
    assets: {},
  },
  variants: [
    { id: "base", tokens: {
      "--the-sprawl-title-font": "'Michroma', 'Eurostile', 'Arial', sans-serif",
      "--the-sprawl-heading-font": "'Jura', 'Arial Narrow', sans-serif",
      "--the-sprawl-body-font": "'Exo 2', 'Segoe UI', sans-serif",
      "--the-sprawl-accent": "#1b2a49",
      "--the-sprawl-accent-alt": "#2a8db5",
    } },
  ],
});

export function getPbtaTheSprawlAppearance(target: string): PbtaTheSprawlAppearance | undefined {
  return (PBTA_THE_SPRAWL_APPEARANCE.targets as readonly string[]).includes(target) ? PBTA_THE_SPRAWL_APPEARANCE : undefined;
}
