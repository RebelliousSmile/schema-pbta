import { z } from "zod";

const tokenName = z.string().regex(/^--[a-z0-9-]+$/);
const assetId = z.enum(["game-mark", "variant-mark"]);
const variantId = z.enum(["base", "drowned-lake"]);
const resourcePath = z.string().regex(/^[A-Za-z0-9][A-Za-z0-9._/-]*$/);
const tokenValues = z.record(tokenName, z.string().min(1));
const resourcePaths = z.record(z.string().min(1), resourcePath);

export const monsterheartsAppearanceSchema = z.strictObject({
  target: z.literal("monsterhearts-playbook"),
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
  })).length(2),
}).superRefine((appearance, context) => {
  const variants = appearance.variants.map((variant) => variant.id);
  if (variants.join(",") !== "base,drowned-lake") {
    context.addIssue({ code: "custom", message: "appearance variants must be base then drowned-lake" });
  }
  const base = appearance.variants[0];
  const drownedLake = appearance.variants[1];
  for (const token of Object.keys(base.tokens)) {
    if (typeof drownedLake.tokens[token] !== "string") {
      context.addIssue({ code: "custom", message: `drowned-lake does not resolve base token ${token}` });
    }
  }
});

export type PbtaMonsterheartsAppearance = z.infer<typeof monsterheartsAppearanceSchema>;

/** Consumer-neutral appearance data with package-relative resource paths. */
export const PBTA_MONSTERHEARTS_APPEARANCE: PbtaMonsterheartsAppearance = monsterheartsAppearanceSchema.parse({
  target: "monsterhearts-playbook",
  appearanceVersion: 1,
  resources: {
    fonts: {
      "IM Fell English": "assets/fonts/im-fell-english-latin-400-normal.woff2",
      "Averia Serif Libre": "assets/fonts/averia-serif-libre-latin-700-normal.woff2",
    },
    stylesheets: ["styles/theme-tokens.css", "styles/base.css", "styles/variants/drowned-lake.css", "assets/styles/callouts.css"],
    assets: {
      "game-mark": "assets/images/thorn-heart.svg",
      "variant-mark": "assets/variants/drowned-lake/zine-lake.svg",
    },
  },
  variants: [
    { id: "base", tokens: {
      "--monsterhearts-title-font": "'IM Fell English', 'Averia Serif Libre', Garamond, Georgia, serif",
      "--monsterhearts-title-ink": "#292326",
      "--pbta-column-gap": "2.4rem",
      "--pbta-column-rule": "#292326",
    } },
    { id: "drowned-lake", tokens: {
      "--monsterhearts-title-font": "'IM Fell English', 'Averia Serif Libre', Garamond, Georgia, serif",
      "--monsterhearts-title-ink": "#f4f0ec",
      "--pbta-column-gap": "2.4rem",
      "--pbta-column-rule": "#7457bd",
    }, assetOverrides: { "variant-mark": "assets/variants/drowned-lake/zine-lake.svg" } },
  ],
});

export function getPbtaMonsterheartsAppearance(target: string): PbtaMonsterheartsAppearance | undefined {
  return target === PBTA_MONSTERHEARTS_APPEARANCE.target ? PBTA_MONSTERHEARTS_APPEARANCE : undefined;
}
