# Contributing

Thanks for helping make Powered by the Apocalypse tools interoperate!

## How to propose a change

1. **Open an issue** describing the change (new field, new schema, clarification).
2. **Discuss** design/compat with maintainers and other tool authors.
3. **Submit a PR** that includes:

   - Zod v4 source updates in `src/zod/...`
   - A game entry in `GAMES` (`src/zod/constants.ts`) if the game is not declared yet
   - New target in `src/zod/constants.ts` like:

     ```ts
     {
        zod: ApocalypseWorldExampleSchema,
        game: GAMES.aw,
        name: "example",
     }
     ```

   - Re-generated JSON Schema in `schemas/...`
     ```sh
        npm run gen
     ```
   - At least **one example** in `examples/<game>/<object>/...`, directly in that
     directory: the validator lists one level and skips subdirectories silently.
   - A complete accepted witness in `corpus/temoins/<game>/<object>/` and a
     focused rejected document in `corpus/refus/<game>/<object>/`, named after
     its single intentional defect.
   - Passing validation
     ```sh
       npm run check
     ```

## Ground rules

- **Canonical source is Zod** (we generate JSON Schema from it).
- **Schema identity belongs to generation:** the five Zod schemas are shared by
  every game in `TARGETS`, so do not attach a game-specific `$id` to them.
  `tools/gen-schemas.ts` derives the canonical raw-GitHub `$id` from the target's
  game folder and schema name.
- **Backward compatibility:** try as much as possible to avoid breaking changes.
- **Metadata:** add concise descriptions and examples to your fields. With Zod, make use of `.meta({ description, examples })`
- **Game sources:** record the source and edition used to derive vocabulary, but contribute original fixtures only; do not copy published move text, playbook prose, layouts, images or PDFs.
- **Lantern editing surface:** mechanical values belong in typed fields (`stats`, `attributes`, `moves`, `roll`, `results`, `choiceSets`), never only in narrative helpers such as `statsDetail` or `description`.
- **Numeric domains:** every numeric schema needs a finite upper bound. Use a
  rule-derived bound when one exists; otherwise use the documented signed
  32-bit transport range (or its non-negative half for counts).
- **`.default()` vs `.optional()`:** generation runs in the *output* view, so a
  field carrying `.default()` lands in the schema's `required` list — exactly like
  a bare field. Use `.optional()` for a genuinely optional field, and reach for
  `.default()` only when the value it invents is the only one it could be.

## Dev commands

```bash
npm ci
npm run gen            # generate JSON Schemas
npm run validate       # validate example files against the schemas
npm run validate:refs  # check what the schemas cannot see: references, vocabularies
npm run audit          # audit identities, descriptions, bounds, witnesses and refusals
npm run typecheck      # statically check all TypeScript sources
npm run check          # typecheck + generate + validate + references + audit
```

## Add a Handbook theme or variant

1. Keep rules and playbook data under `examples/<game>/`; select them by slug in `handbook/<game>/preview/preview.toml`.
2. Add the game theme to `styles/base.css` and keep its original or redistributable assets under that pack’s `assets/` directory. Record their provenance in the pack README.
3. Add a visual variant as `styles/variants/<slug>.css` plus `assets/variants/<slug>/`, then list the slug in the preview descriptor. Do not add alternate HTML or TOML data for a variant.
4. Run `npm run handbook:render`, `npm run handbook:validate`, then `npm run check`.

The preview contract is independent from the installable pack contract. HTML,
CSS, TOML, TypeScript and JavaScript used by previews must never be referenced
by `handbook.json` or a `pack.json`.

For any installable change:

1. Bump the affected `pack.json` patch version and the matching entry in
   `handbook.json` together. Never publish one without the other.
2. Keep asset paths relative to the pack's asset root. Installable images are
   limited to PNG, JPEG, WebP, GIF and SVG; executable files are forbidden.
3. Record every distributed image's author, origin, licence and installed path
   in `LICENSES/HANDBOOK-ASSETS.md`. Do not declare the placeholder font
   directories as assets.
4. Run `npm run check`. To exercise the real Handbook installer from a sibling
   Handbook checkout, run `SCHEMA_PBTA_ROOT=/path/to/schema-pbta npm run
   assert:pbta-source` from that Handbook repository.
