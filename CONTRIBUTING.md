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
- **Backward compatibility:** try as much as possible to avoid breaking changes.
- **Metadata:** add concise descriptions and examples to your fields. With Zod, make use of `.meta({ description, examples })`
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
