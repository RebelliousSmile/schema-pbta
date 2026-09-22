import { PBTA_MONSTERHEARTS_APPEARANCE } from "./monsterhearts-appearance.js";

const imFellEnglish = new URL(
  "../../packs/monsterhearts/assets/fonts/im-fell-english-latin-400-normal.woff2",
  import.meta.url,
).href;
const averiaSerifLibre = new URL(
  "../../packs/monsterhearts/assets/fonts/averia-serif-libre-latin-700-normal.woff2",
  import.meta.url,
).href;
const gameMark = new URL(
  "../../packs/monsterhearts/assets/images/thorn-heart.svg",
  import.meta.url,
).href;
const drownedLakeVariantMark = new URL(
  "../../packs/monsterhearts/assets/variants/drowned-lake/zine-lake.svg",
  import.meta.url,
).href;

/**
 * Browser-consumer URLs for the Monsterhearts appearance resources.
 *
 * Each resource is declared with a literal `new URL(..., import.meta.url)` so
 * bundlers such as Vite can discover and emit it. The appearance descriptor
 * intentionally continues to expose package-relative paths for non-browser
 * consumers.
 */
export const PBTA_MONSTERHEARTS_APPEARANCE_ASSET_URLS = {
  target: PBTA_MONSTERHEARTS_APPEARANCE.target,
  fonts: {
    "IM Fell English": imFellEnglish,
    "Averia Serif Libre": averiaSerifLibre,
  },
  assets: {
    "game-mark": gameMark,
    "variant-mark": drownedLakeVariantMark,
  },
  variants: {
    base: { assetOverrides: {} },
    "drowned-lake": {
      assetOverrides: { "variant-mark": drownedLakeVariantMark },
    },
  },
} as const;

export type PbtaMonsterheartsAppearanceAssetUrls = typeof PBTA_MONSTERHEARTS_APPEARANCE_ASSET_URLS;
