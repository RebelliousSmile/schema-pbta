import { z } from "zod";

const tokenName = z.string().regex(/^--[a-z0-9-]+$/);
const resourcePath = z.string().regex(/^[A-Za-z0-9][A-Za-z0-9._/-]*$/);

/**
 * The appearance the two Masks targets share. The pack's fonts, colours, images and sheets are
 * published by `handbook/masks`; the tarball only names the tokens a consumer resolves against.
 */
export const masksAppearanceSchema = z.strictObject({
  targets: z.tuple([z.literal("masks-playbook"), z.literal("masks-npc")]),
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

export type PbtaMasksAppearance = z.infer<typeof masksAppearanceSchema>;

/** Consumer-neutral appearance data with package-relative resource paths. */
export const PBTA_MASKS_APPEARANCE: PbtaMasksAppearance = masksAppearanceSchema.parse({
  targets: ["masks-playbook", "masks-npc"],
  appearanceVersion: 1,
  resources: {
    fonts: {},
    stylesheets: ["styles/theme-tokens.css"],
    assets: {},
  },
  variants: [
    { id: "base", tokens: {
      "--masks-title-font": "'Staatliches', 'League Gothic', 'Arial Narrow', sans-serif",
      "--masks-heading-font": "'Josefin Sans', 'Trebuchet MS', sans-serif",
      "--masks-body-font": "'Crimson Pro', Georgia, serif",
      "--masks-accent": "#3b5688",
      "--masks-gold": "#c09a47",
    } },
  ],
});

export function getPbtaMasksAppearance(target: string): PbtaMasksAppearance | undefined {
  return (PBTA_MASKS_APPEARANCE.targets as readonly string[]).includes(target) ? PBTA_MASKS_APPEARANCE : undefined;
}
