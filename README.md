# Schema PbtA

Open, versioned data schemas for **Powered by the Apocalypse** games (Apocalypse World, Dungeon World, Monster of the Week, Masks, Monsterhearts, and others) so VTTs, builders, and other digital
tools can **share the same data**.

Published examples are original fixtures. Local game books may be consulted to
derive a game’s structural vocabulary, but their prose, layouts, illustrations
and PDFs are not assets of this repository.

The aim is an ecosystem of interoperable digital tools where they can exchange
structured JSON/TOML, validate it via schemas (e.g., using Zod), and leverage it
for their specific needs.

## Status

Early, but usable. Masks and Monster of the Week publish game definition, move,
playbook, NPC and front schemas. Monsterhearts 2, Urban Shadows 2e and The Sprawl
1.1 publish game definition, move and playbook schemas. The examples exercise
the content pipeline, while a separate positive and negative corpus audits every
generated schema.

## What's in here

- `src/zod/` contains the source Zod v4 definitions
- `schemas/` contains the generated JSON Schemas
- `examples/` contains JSON/TOML examples per schema
- `corpus/temoins/` contains legitimate JSON documents that every target must accept
- `corpus/refus/` contains intentionally malformed JSON documents, one named defect per file
- `tools/` provides generation and validation scripts
- `handbook/` contains generated semantic previews and original visual packs

## Handbook previews and Lantern forms

`npm run handbook:render` builds one preview per game from explicit references
to `examples/`; the HTML is generated and is never a second source of rules.
Each game then applies its own CSS and original images. Visual variants, such as
Monsterhearts’ `drowned-lake`, load as CSS/assets only and keep the same data and
markup. The future installable Handbook manifest is deliberately not specified
yet.

Lantern form controls derive from the generated JSON Schemas and the canonical
game vocabulary: typed `character.attributes`, stats, move types, playbook
values, rolls and results. Narrative helpers such as `statsDetail` must not be
parsed to recover mechanical values. `npm run handbook:validate` checks that
each game exposes this minimum structured editing surface.

## Using the schemas in your tool

### Use Zod directly (TS apps)

If you use TypeScript and Zod parsing, you can copy/paste the provided Zod schemas:

```ts
import { ApocalypseWorldExampleSchema } from "./src/zod/apocalypse-world/example";
const parsed = ApocalypseWorldExampleSchema.parse(userInputJson);
```

### Validate data (language-agnostic)

Use any JSON Schema validator (AJV, Python jsonschema, Rust jsonschema). Example with AJV:

```ts
import fs from "node:fs";
import Ajv from "ajv";
import addFormats from "ajv-formats";

const schema = JSON.parse(
  fs.readFileSync("schemas/apocalypse-world/example.schema.json", "utf8")
);

const ajv = new Ajv({ allErrors: true, strict: false });
addFormats(ajv);
const validate = ajv.compile(schema);

const data = JSON.parse(fs.readFileSync("path/to/data.json", "utf8"));
if (!validate(data)) console.error(validate.errors);
```

### Editor autocomplete for JSON and TOML

Configure the schema in your editor's settings (`json.schemas` in VS Code,
`evenBetterToml.schema.associations` for TOML), matched on a file glob.

Do **not** add a `"$schema"` key inside a data file that lives in `examples/`:
the generated schemas carry `"additionalProperties": false` at the root, so that
key makes `npm run validate` fail on the file.

## Two validation passes

`npm run validate` checks each example file against its JSON Schema, one file at
a time. That is all Ajv can do: a schema knows nothing of the game a file claims
to belong to, nor of the other files beside it.

`npm run validate:refs` is the second pass. It reads the corpus instead of the
schemas, and checks what the first pass cannot see: that a stat or attribute key
of a playbook exists in the game definition, that every `moveType` and
`equipmentType` is declared, that a `ref` resolves to a real file of the right
kind, that slugs are unique per game and per content type, that a `game` field
matches the folder the file sits in, and that two fields of the same document
agree — a move with no roll carrying no results, a clock not filled past its
segments. A move naming a result outside the game's tiers is a warning, not an
error.

`npm run check` type-checks the sources, generates the schemas, runs both
validation passes and the schema audit, regenerates the Handbook previews, then
validates every pack and its Lantern editing surface. Any failing step fails the
chain.

## Audited guarantees

`npm run audit` measures the generated artifacts rather than trusting claims
about them. For every entry of `TARGETS`, it requires:

- a valid draft-7 schema that Ajv can compile;
- a canonical `$id` matching the schema's raw GitHub URL;
- a non-empty description on every named property;
- a finite upper bound on every numeric value;
- at least one accepted witness and one rejected malformed document under
  `corpus/<camp>/<game>/<target>/`.

The audit also parses `src/zod/` and rejects executable `.refine()` or
`.default()` calls, because those constraints or invented values do not belong
in the generated interchange format. Comments and data keys with those names
are ignored. Cross-file vocabulary and reference checks remain the separate
responsibility of `npm run validate:refs`.

## Derived work

This repository is derived from
[4rtamis/schema-in-the-mist](https://github.com/4rtamis/schema-in-the-mist),
whose tooling (`tools/`, generation and validation pipeline) it reuses under the
MIT licence. The schemas here are its own; nothing from the Mist Engine schemas
was copied.

## License

- **Code & Schemas:** MIT (see [LICENSE](./LICENSE)). The notice carries two
  copyright lines: the original author of the build tooling, and this
  repository's own author.

- **Docs:** CC BY 4.0 (see [here](./LICENSES/DOCS-LICENSE.md))

- **Masks game definition:** `examples/masks/game-definition/masks.toml` is
  derived from the Masks sheet preset published by Asacolips for the Foundry
  `pbta` system, available under
  [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). *Masks: A New
  Generation* is by Brendan Conway, published by Magpie Games; the game itself
  is neither reproduced nor licensed here, only the mechanical vocabulary a tool
  needs to render a sheet.

- **Monster of the Week game definition:**
  `examples/monster-of-the-week/game-definition/monster-of-the-week.toml`
  transcribes the Monster of the Week sheet preset published by Asacolips on the
  `pbta` system wiki, which is itself based on the rules written by Michael
  Sands and published by Evil Hat Productions. Its `fronts` block has no
  upstream counterpart: the countdown steps and the threat vocabularies are read
  off the publisher's freely distributed mystery worksheet and Keeper reference
  sheets. The game itself is neither reproduced nor licensed here.

- **Trademark / community content notice:** to be written once the games this
  repository covers are settled. Apocalypse World is published under its own
  terms and several PbtA games carry their own licences; none of them is covered
  by a notice copied from another project.
