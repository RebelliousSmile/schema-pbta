import { PBTA_MONSTERHEARTS_APPEARANCE } from "./monsterhearts-appearance.js";

const yellowMagician = new URL(
  "../../packs/monsterhearts/assets/fonts/yellow-magician-latin-400-normal.woff2",
  import.meta.url,
).href;
const elMessiri = new URL(
  "../../packs/monsterhearts/assets/fonts/el-messiri-latin-400-700-normal.woff2",
  import.meta.url,
).href;
const averiaSerifLibre = new URL(
  "../../packs/monsterhearts/assets/fonts/averia-serif-libre-latin-700-normal.woff2",
  import.meta.url,
).href;
const alice = new URL(
  "../../packs/monsterhearts/assets/fonts/alice-latin-400-normal.woff2",
  import.meta.url,
).href;
const sortsMillGoudyItalic = new URL(
  "../../packs/monsterhearts/assets/fonts/sorts-mill-goudy-latin-400-italic.woff2",
  import.meta.url,
).href;
const gameMark = new URL(
  "../../packs/monsterhearts/assets/images/thorn-heart.svg",
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
    "Yellow Magician": yellowMagician,
    "El Messiri": elMessiri,
    "Averia Serif Libre": averiaSerifLibre,
    "Alice": alice,
    "Sorts Mill Goudy Italic": sortsMillGoudyItalic,
  },
  assets: {
    "game-mark": gameMark,
  },
  variants: {
    base: { assetOverrides: {} },
  },
} as const;

export type PbtaMonsterheartsAppearanceAssetUrls = typeof PBTA_MONSTERHEARTS_APPEARANCE_ASSET_URLS;
