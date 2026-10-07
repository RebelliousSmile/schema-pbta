import { z } from "zod";

const tokenName = z.string().regex(/^--[a-z0-9-]+$/);
const assetId = z.enum(["game-mark"]);
const variantId = z.enum(["base"]);
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
  })).length(1),
}).superRefine((appearance, context) => {
  if (appearance.variants[0]?.id !== "base") {
    context.addIssue({ code: "custom", message: "the only appearance is base" });
  }
});

export type PbtaMonsterheartsAppearance = z.infer<typeof monsterheartsAppearanceSchema>;

/** Consumer-neutral appearance data with package-relative resource paths. */
export const PBTA_MONSTERHEARTS_APPEARANCE: PbtaMonsterheartsAppearance = monsterheartsAppearanceSchema.parse({
  target: "monsterhearts-playbook",
  appearanceVersion: 1,
  resources: {
    fonts: {
      "Yellow Magician": "assets/fonts/yellow-magician-latin-400-normal.woff2",
      "El Messiri": "assets/fonts/el-messiri-latin-400-700-normal.woff2",
      "Averia Serif Libre": "assets/fonts/averia-serif-libre-latin-700-normal.woff2",
      "Alice": "assets/fonts/alice-latin-400-normal.woff2",
      "Fondamento": "assets/fonts/fondamento-latin-400-normal.woff2",
    },
    stylesheets: ["styles/theme-tokens.css", "styles/base.css", "assets/styles/callouts.css"],
    assets: {
      "game-mark": "assets/images/thorn-heart.svg",
    },
  },
  variants: [
    { id: "base", tokens: {
      "--monsterhearts-title-font": "'Yellow Magician', 'Averia Serif Libre', Garamond, Georgia, serif",
      "--monsterhearts-script-font": "'Fondamento', cursive",
      "--monsterhearts-title-ink": "#292326",
      "--pbta-column-gap": "2.4rem",
      "--pbta-column-rule": "#292326",
    } },
  ],
});

export function getPbtaMonsterheartsAppearance(target: string): PbtaMonsterheartsAppearance | undefined {
  return target === PBTA_MONSTERHEARTS_APPEARANCE.target ? PBTA_MONSTERHEARTS_APPEARANCE : undefined;
}
