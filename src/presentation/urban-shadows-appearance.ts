import { z } from "zod";

const tokenName = z.string().regex(/^--[a-z0-9-]+$/);
const assetId = z.enum(["game-mark"]);
const variantId = z.enum(["base"]);
const resourcePath = z.string().regex(/^[A-Za-z0-9][A-Za-z0-9._/-]*$/);
const tokenValues = z.record(tokenName, z.string().min(1));
const resourcePaths = z.record(z.string().min(1), resourcePath);

export const urbanShadowsAppearanceSchema = z.strictObject({
  target: z.literal("urban-shadows-playbook"),
  appearanceVersion: z.literal(1),
  resources: z.strictObject({
    fonts: resourcePaths,
    stylesheets: z.array(resourcePath).min(1),
    assets: z.record(assetId, resourcePath),
  }),
  variants: z.array(z.strictObject({
    id: variantId,
    tokens: tokenValues,
    assetOverrides: z.partialRecord(assetId, resourcePath).optional(),
  })).length(1),
}).superRefine((appearance, context) => {
  if (appearance.variants[0]?.id !== "base") {
    context.addIssue({ code: "custom", message: "the only appearance is base" });
  }
});

export type PbtaUrbanShadowsAppearance = z.infer<typeof urbanShadowsAppearanceSchema>;

/** Consumer-neutral appearance data with package-relative resource paths. */
export const PBTA_URBAN_SHADOWS_APPEARANCE: PbtaUrbanShadowsAppearance = urbanShadowsAppearanceSchema.parse({
  target: "urban-shadows-playbook",
  appearanceVersion: 1,
  resources: {
    fonts: {
      "Urban Shadows Display": "assets/fonts/league-gothic-latin-400-normal.woff2",
      "Urban Shadows Text": "assets/fonts/source-serif-4-latin-wght-normal.woff2",
      "Urban Shadows Brush": "assets/fonts/caveat-brush-400-normal.woff2",
    },
    stylesheets: ["styles/theme-tokens.css"],
    assets: {
      "game-mark": "assets/images/city-sigil.svg",
    },
  },
  variants: [
    { id: "base", tokens: {
      "--urban-shadows-title-font": "'Urban Shadows Display', 'League Gothic', 'Arial Narrow', sans-serif",
      "--urban-shadows-brush-font": "'Urban Shadows Brush', 'Caveat Brush', cursive",
      "--urban-shadows-accent": "#682865",
      "--pbta-column-gap": "2rem",
      "--pbta-column-rule": "#682865",
    } },
  ],
});

export function getPbtaUrbanShadowsAppearance(target: string): PbtaUrbanShadowsAppearance | undefined {
  return target === PBTA_URBAN_SHADOWS_APPEARANCE.target ? PBTA_URBAN_SHADOWS_APPEARANCE : undefined;
}
