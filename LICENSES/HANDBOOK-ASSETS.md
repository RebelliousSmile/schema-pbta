# Handbook asset provenance

The SVG files installed by the Handbook packs and published in the
`packs/monsterhearts/` and `packs/urban-shadows/` npm appearance bundles are original assets created for
this repository by François-Xavier Guillois in 2026. They are distributed under
the repository's MIT license.

| Pack | Role | File |
| --- | --- | --- |
| Masks | `game-mark` | `handbook/masks/assets/images/hero-burst.svg` |
| Masks | `star-bullet` | `handbook/masks/assets/images/star-bullet.svg` |
| Masks | `skyline-band` | `handbook/masks/assets/images/skyline-band.svg` |
| Monster of the Week | `game-mark` | `handbook/monster-of-the-week/assets/images/watch-mark.svg` |
| Monsterhearts | `game-mark` | `handbook/monsterhearts/assets/images/thorn-heart.svg`; `packs/monsterhearts/assets/images/thorn-heart.svg` |
| The Sprawl | `game-mark` | `handbook/the-sprawl/assets/images/network-grid.svg` |
| Urban Shadows | `game-mark` | `handbook/urban-shadows/assets/images/city-sigil.svg`; `packs/urban-shadows/assets/images/city-sigil.svg` |
| Urban Shadows | `section-texture` | `handbook/urban-shadows/assets/images/night-windows.svg` |

The game names are used only to identify compatible presentation packs. No
official logo, illustration, layout, or game text is included in these files.

## Fonts

The Masks, Monster of the Week, Monsterhearts, The Sprawl and Urban Shadows presentation packs include open typefaces
as WOFF2 files, from Fontsource or from `google/fonts`. Every file is a static
instance, one per weight: a variable font reaches a Chromium PDF export as Type3
glyph procedures, which printers refuse (obsidian-handbook#116).

| Family | File | Upstream | License |
| --- | --- | --- | --- |
| Yellow Magician | `handbook/monsterhearts/assets/fonts/yellow-magician-latin-400-normal.woff2`; `packs/monsterhearts/assets/fonts/yellow-magician-latin-400-normal.woff2` | Érico Lebedenco, `YellowMagician.ttf` (sous-ensemble latin converti en WOFF2) | Creative Commons Attribution Share Alike 3.0 (`CC-BY-SA-3.0-YellowMagician.txt`) |
| El Messiri | `handbook/monsterhearts/assets/fonts/el-messiri-latin-400-normal.woff2`; `packs/monsterhearts/assets/fonts/el-messiri-latin-400-normal.woff2`; `packs/monsterhearts/assets/fonts/el-messiri-latin-700-normal.woff2` | `@fontsource/el-messiri@5.3.0` (static instances, latin subset, unmodified) | SIL Open Font License 1.1 |
| Alice Regular | `handbook/monsterhearts/assets/fonts/alice-latin-400-normal.woff2`; `packs/monsterhearts/assets/fonts/alice-latin-400-normal.woff2` | `@fontsource/alice@5.3.0` | SIL Open Font License 1.1 |
| IM Fell Double Pica Italic | `handbook/monsterhearts/assets/fonts/im-fell-double-pica-latin-400-italic.woff2`; `packs/monsterhearts/assets/fonts/im-fell-double-pica-latin-400-italic.woff2` | `@fontsource/im-fell-double-pica` | SIL Open Font License 1.1 (`OFL-IMFellDoublePica.txt`) |
| Averia Serif Libre Bold | `handbook/monsterhearts/assets/fonts/averia-serif-libre-latin-700-normal.woff2`; `packs/monsterhearts/assets/fonts/averia-serif-libre-latin-700-normal.woff2` | `@fontsource/averia-serif-libre@5.3.0` | SIL Open Font License 1.1 |
| League Gothic | `handbook/urban-shadows/assets/fonts/league-gothic-latin-400-normal.woff2`; `packs/urban-shadows/assets/fonts/league-gothic-latin-400-normal.woff2` | `@fontsource/league-gothic@5.3.0` | SIL Open Font License 1.1 |
| Source Serif 4 | `handbook/urban-shadows/assets/fonts/source-serif-4-latin-<200…900>-normal.woff2`; `packs/urban-shadows/assets/fonts/source-serif-4-latin-400-normal.woff2`; `packs/urban-shadows/assets/fonts/source-serif-4-latin-700-normal.woff2` | `@fontsource/source-serif-4@5.3.0` (static instances, latin subset, unmodified) | SIL Open Font License 1.1 |
| Caveat Brush | `handbook/urban-shadows/assets/fonts/caveat-brush-400-normal.woff2`; `packs/urban-shadows/assets/fonts/caveat-brush-400-normal.woff2` | `google/fonts` (`ofl/caveatbrush`, `CaveatBrush-Regular.ttf`, converted to WOFF2 without subsetting) | SIL Open Font License 1.1 (`OFL-CaveatBrush-1.1.txt`) |
| Staatliches | `handbook/masks/assets/fonts/staatliches-400-normal.woff2` | `google/fonts` (`ofl/staatliches`, `Staatliches-Regular.ttf`, converted to WOFF2 without subsetting) | SIL Open Font License 1.1 (`OFL-Staatliches.txt`) |
| Josefin Sans | `handbook/masks/assets/fonts/josefin-sans-latin-<100…700>-normal.woff2` | `@fontsource/josefin-sans@5.3.0` (static instances, latin subset, unmodified) | SIL Open Font License 1.1 (`OFL-JosefinSans.txt`) |
| Crimson Pro | `handbook/masks/assets/fonts/crimson-pro-latin-<200…900>-<normal\|italic>.woff2`; `handbook/monster-of-the-week/assets/fonts/crimson-pro-latin-<200…900>-<normal\|italic>.woff2` | `@fontsource/crimson-pro@5.3.0` (static instances, latin subset, unmodified) | SIL Open Font License 1.1 (`OFL-CrimsonPro.txt`) |
| Jura | `handbook/the-sprawl/assets/fonts/jura-latin-<300…700>-normal.woff2` | `@fontsource/jura@5.3.0` (static instances, latin subset, unmodified) | SIL Open Font License 1.1 (`OFL-Jura.txt`) |
| Exo 2 | `handbook/the-sprawl/assets/fonts/exo-2-latin-<100…900>-<normal\|italic>.woff2` | `@fontsource/exo-2@5.3.0` (static instances, latin subset, unmodified) | SIL Open Font License 1.1 (`OFL-Exo2.txt`) |
| Comic Neue | `handbook/masks/assets/fonts/comic-neue-400-normal.woff2`; `handbook/masks/assets/fonts/comic-neue-700-normal.woff2` | `google/fonts` (`ofl/comicneue`, `ComicNeue-Regular.ttf` and `ComicNeue-Bold.ttf`, converted to WOFF2 without subsetting) | SIL Open Font License 1.1 (`OFL-ComicNeue.txt`) |

The Masks and Urban Shadows faces are freely redistributable substitutes and are not
claimed to be the original game's typefaces. The SIL Open Font License texts
accompany the font files in each pack's `assets/fonts/` directory.
